#!/usr/bin/env python3
"""Discord ↔ ClawTeam 多猫桥接。

支持 @指定猫 聊天，每只猫在 Discord 以独立身份回复：

    !@美丽喵 首页做得怎么样了？
    !@后台喵 接口写好了吗
    !@总裁喵 进度如何？
    !帮我看看              （不指定 → 默认发给领队）
    !喵                    （列出所有可用的猫）

依赖：pip install "discord.py>=2.3"

终端必须 export：
  DISCORD_BOT_TOKEN
  CLAWTEAM_BRIDGE_TEAM
  CLAWTEAM_BRIDGE_LEADER

可选：
  DISCORD_WEBHOOK_URL  — 设置后猫回复用 webhook（每只猫有独立显示名/头像）

若桥接与你的 `clawteam` CLI 不在同一台机器或 HOME，请务必设：
  export CLAWTEAM_DATA_DIR="$HOME/.clawteam"
"""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

import discord

# ---------------------------------------------------------------------------
# 猫猫名册（中文别名 → agent ID）
# ---------------------------------------------------------------------------

AGENT_ALIASES: dict[str, str] = {
    "总裁喵": "zong-cai-miao",
    "美丽喵": "mei-li-miao",
    "后台喵": "hou-tai-miao",
    "架构喵": "jia-gou-miao",
    "平安喵": "ping-an-miao",
    "薯你最红喵": "shu-ni-hong",
}

AGENT_DISPLAY: dict[str, str] = {v: k for k, v in AGENT_ALIASES.items()}

CAT_COLORS: dict[str, int] = {
    "zong-cai-miao": 0x8B6914,  # 梨花 - 棕黄
    "mei-li-miao":   0xE8D8C4,  # 布偶 - 奶白
    "hou-tai-miao":  0xD2691E,  # 三花 - 橙棕
    "jia-gou-miao":  0x2F2F2F,  # 奶牛 - 深灰
    "ping-an-miao":  0xFFA500,  # 大橘 - 橙色
    "shu-ni-hong":   0xDAA520,  # 金渐层 - 金色
}

CAT_BREEDS: dict[str, str] = {
    "zong-cai-miao": "梨花猫 · 领队",
    "mei-li-miao":   "布偶猫 · 前端",
    "hou-tai-miao":  "三花猫 · 后端",
    "jia-gou-miao":  "奶牛猫 · 架构",
    "ping-an-miao":  "大橘猫 · 安全",
    "shu-ni-hong":   "金渐层 · 文案",
}

# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------

HUMAN_INBOX = "discord-human"
PREFIX = "!"
POLL_SECONDS = 5.0
TEAM_CHAT_POLL_SECONDS = 3.0
BRIDGE_CHANNEL_IDS: tuple[int, ...] = ()
CLAWTEAM_CMD = "clawteam"
AUTO_NUDGE = True
SHOW_TEAM_CHAT = True  # 在 Discord 旁听猫猫之间的内部对话

NUDGE_TEXT = (
    "主人刚在 Discord 发了新消息给你。"
    "请立刻执行 clawteam inbox receive '{team}' 查看，"
    "然后用 clawteam inbox send '{team}' discord-human '你的回复' 回复主人。"
)

# ---------------------------------------------------------------------------
# 环境变量
# ---------------------------------------------------------------------------


def _strip_env_wrapping_quotes(value: str | None) -> str | None:
    """去掉队名/领队名里误带的整段引号。"""
    if value is None:
        return None
    s = value.strip()
    while len(s) >= 2:
        a, b = s[0], s[-1]
        straight = (a == b == "'") or (a == b == '"')
        curly = (a == "\u2018" and b == "\u2019") or (a == "\u201c" and b == "\u201d")
        if straight or curly:
            s = s[1:-1].strip()
            continue
        break
    return s


TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
TEAM = _strip_env_wrapping_quotes(os.environ.get("CLAWTEAM_BRIDGE_TEAM"))
LEADER = _strip_env_wrapping_quotes(os.environ.get("CLAWTEAM_BRIDGE_LEADER"))
WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")

CHANNEL_IDS: set[int] = set(BRIDGE_CHANNEL_IDS)
_seen_ids: set[str] = set()
_seen_team_files: set[str] = set()
_peek_warned: bool = False

# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------


def _die(msg: str) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def _check_env() -> None:
    if not TOKEN:
        _die("未设置 DISCORD_BOT_TOKEN。")
    if not TEAM:
        _die("未设置 CLAWTEAM_BRIDGE_TEAM。")
    if not LEADER:
        _die("未设置 CLAWTEAM_BRIDGE_LEADER。")


def _effective_data_dir() -> Path:
    raw = os.environ.get("CLAWTEAM_DATA_DIR", "").strip()
    if raw:
        return Path(os.path.expanduser(raw)).resolve()
    return Path.home() / ".clawteam"


def _clawteam_subprocess_env() -> dict[str, str]:
    env = os.environ.copy()
    if not env.get("CLAWTEAM_DATA_DIR", "").strip():
        env["CLAWTEAM_DATA_DIR"] = str(Path.home() / ".clawteam")
    return env


def _team_config_path() -> Path:
    return _effective_data_dir() / "teams" / (TEAM or "") / "config.json"


def _tmux_session_name() -> str:
    safe = (TEAM or "").replace(".", "_").replace(":", "_")
    return f"clawteam-{safe}"


def _clawteam_exe() -> str:
    path = shutil.which(CLAWTEAM_CMD)
    return path or CLAWTEAM_CMD


def _run_clawteam_json(args: list[str]) -> dict[str, Any] | list[Any] | None:
    cmd = [_clawteam_exe(), "--json", *args]
    proc = subprocess.run(
        cmd, capture_output=True, text=True, env=_clawteam_subprocess_env()
    )
    out = (proc.stdout or "").strip()
    err = (proc.stderr or "").strip()
    if proc.returncode != 0:
        raise RuntimeError(
            f"clawteam 失败 ({proc.returncode}): {' '.join(cmd)}\n{err or out}"
        )
    if not out:
        return None
    return json.loads(out)


# ---------------------------------------------------------------------------
# 多猫路由
# ---------------------------------------------------------------------------


def _resolve_inbox_target(agent_id: str) -> str:
    """解析 agent_id 对应的磁盘 inbox 目录名（处理 user_ 前缀）。"""
    try:
        from clawteam.team.manager import TeamManager

        resolved = TeamManager.resolve_inbox(TEAM or "", agent_id)
        if resolved:
            return resolved
    except Exception:
        pass
    return agent_id


def _parse_target_and_body(body: str) -> tuple[str, str]:
    """从消息中解析目标猫。

    支持格式：
      @总裁喵 消息内容
      @zong-cai-miao 消息内容
      总裁喵 消息内容        （无 @ 但以猫名开头）
      消息内容              （默认发给领队）

    返回 (agent_id, cleaned_body)。
    """
    # 按名字长度降序匹配，避免短名误匹配
    for alias in sorted(AGENT_ALIASES.keys(), key=len, reverse=True):
        pattern = f"@{alias}"
        if pattern in body:
            cleaned = body.replace(pattern, "", 1).strip()
            return AGENT_ALIASES[alias], cleaned

    # 无 @ 但以猫名开头
    for alias in sorted(AGENT_ALIASES.keys(), key=len, reverse=True):
        if body.startswith(alias):
            cleaned = body[len(alias) :].strip().lstrip("，,：: ")
            return AGENT_ALIASES[alias], cleaned

    # 尝试 agent ID（英文 ID）
    for agent_id in AGENT_ALIASES.values():
        if f"@{agent_id}" in body:
            cleaned = body.replace(f"@{agent_id}", "", 1).strip()
            return agent_id, cleaned

    return LEADER or "zong-cai-miao", body


def _cat_display_name(agent_id: str) -> str:
    return AGENT_DISPLAY.get(agent_id, agent_id)


def _cat_full_label(agent_id: str) -> str:
    name = _cat_display_name(agent_id)
    breed = CAT_BREEDS.get(agent_id, "")
    return f"{name}（{breed}）" if breed else name


# ---------------------------------------------------------------------------
# Nudge（向任意猫的 tmux pane 注入提示）
# ---------------------------------------------------------------------------


def _nudge_agent_tmux(agent_id: str) -> None:
    if not AUTO_NUDGE:
        return
    session = _tmux_session_name()
    target = f"{session}:{agent_id}"
    text = NUDGE_TEXT.format(team=TEAM)
    try:
        subprocess.run(
            ["tmux", "send-keys", "-t", target, text, "Enter"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=5,
        )
        print(
            f"[nudge] 已向 {_cat_display_name(agent_id)} ({target}) 注入提示",
            file=sys.stderr,
        )
    except FileNotFoundError:
        print("[nudge] tmux 未安装，跳过", file=sys.stderr)
    except subprocess.TimeoutExpired:
        print(f"[nudge] tmux send-keys 超时 ({target})", file=sys.stderr)
    except Exception as e:
        print(f"[nudge] 失败：{e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# 转发消息到指定猫
# ---------------------------------------------------------------------------


async def _forward_to_agent(
    channel: discord.abc.Messageable,
    author: str,
    body: str,
    target_agent: str,
) -> None:
    line = f"[Discord @{author}] {body}"
    loop = asyncio.get_running_loop()

    def _send() -> None:
        to_inbox = _resolve_inbox_target(target_agent)
        _run_clawteam_json(
            ["inbox", "send", TEAM or "", to_inbox, line, "--from", HUMAN_INBOX]
        )

    try:
        await loop.run_in_executor(None, _send)
    except Exception as e:
        await channel.send(f"❌ 转发失败：`{e}`")
        return

    def _nudge() -> None:
        _nudge_agent_tmux(target_agent)

    try:
        await loop.run_in_executor(None, _nudge)
    except Exception:
        pass

    display = _cat_display_name(target_agent)
    breed = CAT_BREEDS.get(target_agent, "")
    label = f"{display}（{breed}）" if breed else display
    await channel.send(f"📨 已发给 **{label}**")


# ---------------------------------------------------------------------------
# 轮询 inbox → Discord（Embed / Webhook 双模式）
# ---------------------------------------------------------------------------


def _peek_human_messages() -> list[dict[str, Any]]:
    global _peek_warned
    try:
        data = _run_clawteam_json(
            ["inbox", "peek", TEAM or "", "--agent", HUMAN_INBOX]
        )
    except Exception as e:
        if not _peek_warned:
            print(f"[poll] inbox peek 失败：{e}", file=sys.stderr)
            _peek_warned = True
        return []
    if not isinstance(data, dict):
        return []
    raw = data.get("messages") or []
    return [m for m in raw if isinstance(m, dict)]


def _make_cat_embed(from_agent: str, content: str) -> discord.Embed:
    """为猫的回复创建带颜色/品种的 Embed。"""
    color = CAT_COLORS.get(from_agent, 0x888888)
    embed = discord.Embed(description=content[:4000], color=color)
    label = _cat_full_label(from_agent)
    embed.set_author(name=f"🐱 {label}")
    return embed


async def _send_webhook_as_cat(from_agent: str, content: str) -> bool:
    """通过 Webhook 以猫的独立身份发消息。成功返回 True。"""
    if not WEBHOOK_URL:
        return False
    try:
        import aiohttp

        display = _cat_display_name(from_agent)
        breed = CAT_BREEDS.get(from_agent, "")
        username = f"🐱 {display}" + (f"（{breed}）" if breed else "")
        async with aiohttp.ClientSession() as session:
            webhook = discord.Webhook.from_url(WEBHOOK_URL, session=session)
            await webhook.send(content[:1900], username=username[:80])
        return True
    except Exception as e:
        print(f"[webhook] 发送失败，回退到 embed：{e}", file=sys.stderr)
        return False


async def _poll_inbox_to_discord(
    client: discord.Client, reply_channel_id: int | None
) -> None:
    if reply_channel_id is None:
        return
    for msg in _peek_human_messages():
        rid = str(msg.get("requestId") or msg.get("request_id") or "")
        if not rid:
            rid = str(msg.get("timestamp", "")) + str(msg.get("content", ""))[:40]
        if rid in _seen_ids:
            continue

        from_agent = msg.get("from") or msg.get("from_agent") or "unknown"
        content = msg.get("content") or ""

        ch = client.get_channel(reply_channel_id)
        if ch is None:
            try:
                ch = await client.fetch_channel(reply_channel_id)
            except Exception:
                continue
        if not isinstance(ch, (discord.TextChannel, discord.Thread)):
            continue

        sent = await _send_webhook_as_cat(from_agent, content)
        if not sent:
            embed = _make_cat_embed(from_agent, content)
            await ch.send(embed=embed)

        _seen_ids.add(rid)


# ---------------------------------------------------------------------------
# 旁听猫猫内部对话（扫描所有 inbox 目录）
# ---------------------------------------------------------------------------


def _inboxes_base_dir() -> Path:
    return _effective_data_dir() / "teams" / (TEAM or "") / "inboxes"


def _scan_team_chat_files() -> list[dict[str, Any]]:
    """扫描所有 inbox 目录，返回尚未见过的猫间消息。"""
    base = _inboxes_base_dir()
    if not base.is_dir():
        return []
    new_messages: list[dict[str, Any]] = []
    for inbox_dir in base.iterdir():
        if not inbox_dir.is_dir():
            continue
        if inbox_dir.name == HUMAN_INBOX:
            continue
        for msg_file in sorted(inbox_dir.glob("msg-*.json")):
            if msg_file.name in _seen_team_files:
                continue
            _seen_team_files.add(msg_file.name)
            try:
                data = json.loads(msg_file.read_bytes())
                data["_to_inbox"] = inbox_dir.name
                new_messages.append(data)
            except Exception:
                continue
    new_messages.sort(key=lambda m: m.get("timestamp", ""))
    return new_messages


def _inbox_name_to_display(inbox_name: str) -> str:
    """将 inbox 目录名（可能带 user_ 前缀）映射回中文显示名。"""
    if inbox_name in AGENT_DISPLAY:
        return AGENT_DISPLAY[inbox_name]
    for agent_id, display in AGENT_DISPLAY.items():
        if inbox_name.endswith(f"_{agent_id}"):
            return display
    return inbox_name


def _make_team_chat_embed(
    from_agent: str, to_inbox: str, content: str
) -> discord.Embed:
    """为猫间对话创建旁听 Embed（灰色系，与直接回复主人的区分开）。"""
    from_name = _inbox_name_to_display(from_agent)
    to_name = _inbox_name_to_display(to_inbox)
    from_color = CAT_COLORS.get(from_agent, 0x888888)
    embed = discord.Embed(description=content[:4000], color=from_color)
    embed.set_author(name=f"💬 {from_name} → {to_name}")
    return embed


async def _poll_team_chat_to_discord(
    client: discord.Client, reply_channel_id: int | None
) -> None:
    """扫描所有 inbox，把猫间对话转发到 Discord。"""
    if not SHOW_TEAM_CHAT or reply_channel_id is None:
        return
    loop = asyncio.get_running_loop()
    messages = await loop.run_in_executor(None, _scan_team_chat_files)

    for msg in messages:
        from_agent = msg.get("from") or msg.get("from_agent") or "?"
        to_inbox = msg.get("_to_inbox") or msg.get("to") or "?"
        content = msg.get("content") or ""
        if not content:
            continue
        # 来自 discord-human 的消息已在频道里看到过，跳过
        if from_agent == HUMAN_INBOX:
            continue

        ch = client.get_channel(reply_channel_id)
        if ch is None:
            try:
                ch = await client.fetch_channel(reply_channel_id)
            except Exception:
                continue
        if not isinstance(ch, (discord.TextChannel, discord.Thread)):
            continue

        embed = _make_team_chat_embed(from_agent, to_inbox, content)
        await ch.send(embed=embed)


# ---------------------------------------------------------------------------
# 帮助命令：列出可用猫
# ---------------------------------------------------------------------------


def _build_cat_list_embed() -> discord.Embed:
    embed = discord.Embed(
        title="🐾 猫猫名册",
        description="用 `!@猫名 消息` 和指定的猫聊天",
        color=0xFFA500,
    )
    for alias, agent_id in AGENT_ALIASES.items():
        breed = CAT_BREEDS.get(agent_id, "")
        embed.add_field(name=f"@{alias}", value=breed or agent_id, inline=True)
    embed.set_footer(text="示例：!@美丽喵 首页做得怎么样了？\n不指定猫名则默认发给领队")
    return embed


# ---------------------------------------------------------------------------
# Discord Client
# ---------------------------------------------------------------------------


def _strip_prefix(content: str) -> str | None:
    if PREFIX:
        if not content.startswith(PREFIX):
            return None
        return content[len(PREFIX) :].strip()
    return content.strip() or None


class ClawTeamBridgeClient(discord.Client):

    def __init__(self, *, intents: discord.Intents) -> None:
        super().__init__(intents=intents)
        self._reply_channel_id: int | None = min(CHANNEL_IDS) if CHANNEL_IDS else None

    async def setup_hook(self) -> None:
        asyncio.create_task(self._poll_human_worker())
        if SHOW_TEAM_CHAT:
            asyncio.create_task(self._poll_team_chat_worker())

    async def _poll_human_worker(self) -> None:
        await self.wait_until_ready()
        while not self.is_closed():
            try:
                await _poll_inbox_to_discord(self, self._reply_channel_id)
            except Exception as e:
                print(f"[poll] {e}", file=sys.stderr)
            await asyncio.sleep(POLL_SECONDS)

    async def _poll_team_chat_worker(self) -> None:
        await self.wait_until_ready()
        while not self.is_closed():
            try:
                await _poll_team_chat_to_discord(self, self._reply_channel_id)
            except Exception as e:
                print(f"[team-chat] {e}", file=sys.stderr)
            await asyncio.sleep(TEAM_CHAT_POLL_SECONDS)

    async def on_ready(self) -> None:
        cats = ", ".join(AGENT_ALIASES.keys())
        print(f"Bridge 已登录 {self.user} | team={TEAM} leader={LEADER}")
        print(f"[bridge] 可用猫猫：{cats}")
        if WEBHOOK_URL:
            print("[bridge] Webhook 已启用 — 每只猫有独立显示身份")
        else:
            print("[bridge] 未设 DISCORD_WEBHOOK_URL — 用 Embed 区分猫（也很好看）")
        if SHOW_TEAM_CHAT:
            print("[bridge] 旁听模式已开启 — 猫猫之间的对话也会显示在 Discord")
        else:
            print("[bridge] 旁听模式关闭 — 只显示猫对主人说的话")
        dd = _effective_data_dir()
        print(f"[bridge] CLAWTEAM_DATA_DIR：{dd}", file=sys.stderr)
        tcfg = _team_config_path()
        if not tcfg.is_file():
            print(
                f"[bridge] 警告：未找到 {tcfg}（队名或数据目录可能不对）",
                file=sys.stderr,
            )
        if PREFIX:
            print(f"用法：{PREFIX}@猫名 消息  |  {PREFIX}喵 查看名册  （前缀：{PREFIX!r}）")
        else:
            print("未设 PREFIX — 整句转发（建议限制 BRIDGE_CHANNEL_IDS）")

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return
        if CHANNEL_IDS and message.channel.id not in CHANNEL_IDS:
            return
        body = _strip_prefix(message.content)
        if body is None:
            return

        self._reply_channel_id = message.channel.id

        # 帮助命令
        if body.strip() in ("喵", "猫", "help", "?", "？", "名册"):
            await message.channel.send(embed=_build_cat_list_embed())
            return

        # 解析目标猫 + 转发
        target_agent, cleaned_body = _parse_target_and_body(body)
        if not cleaned_body:
            cleaned_body = "（主人似乎只是打了个招呼）"

        await _forward_to_agent(
            message.channel, str(message.author), cleaned_body, target_agent
        )


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


def main() -> None:
    _check_env()
    if not os.environ.get("CLAWTEAM_DATA_DIR", "").strip():
        os.environ["CLAWTEAM_DATA_DIR"] = str(Path.home() / ".clawteam")
    if not shutil.which(CLAWTEAM_CMD):
        _die(f"找不到 {CLAWTEAM_CMD!r}：请安装 ClawTeam 并加入 PATH。")

    intents = discord.Intents.default()
    intents.message_content = True
    client = ClawTeamBridgeClient(intents=intents)
    try:
        client.run(TOKEN)  # type: ignore[arg-type]
    except KeyboardInterrupt:
        print("已退出。")


if __name__ == "__main__":
    main()
