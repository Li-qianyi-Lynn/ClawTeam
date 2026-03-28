#!/usr/bin/env python3
"""Discord ↔ ClawTeam 多猫桥接（多 Bot 模式）。

每只猫是一个**独立的 Discord Bot**，拥有自己的名字、头像和在线状态。
主人可以直接 @某只猫 聊天（Discord 原生 @mention）。

依赖：pip install "discord.py>=2.3"

必须 export：
  DISCORD_BOT_TOKEN          — 主桥接 bot（兜底收发）
  CLAWTEAM_BRIDGE_TEAM       — 团队名
  CLAWTEAM_BRIDGE_LEADER     — 领队 agent id

每只猫独立 bot（可选，有几只配几只）：
  CAT_TOKEN_ZONG_CAI_MIAO    — 总裁喵 bot token
  CAT_TOKEN_MEI_LI_MIAO      — 美丽喵 bot token
  CAT_TOKEN_HOU_TAI_MIAO     — 后台喵 bot token
  CAT_TOKEN_JIA_GOU_MIAO     — 架构喵 bot token
  CAT_TOKEN_PING_AN_MIAO     — 平安喵 bot token
  CAT_TOKEN_SHU_NI_HONG      — 薯你最红喵 bot token

其它可选：
  DISCORD_WEBHOOK_URL        — 没有独立 bot 的猫回退用 webhook
  CAT_AVATAR_BASE_URL        — 头像图片的公网 URL 前缀
  CLAWTEAM_DATA_DIR          — 数据目录

在 Discord Developer Portal 创建每只猫的 bot 应用：
  1. https://discord.com/developers/applications → New Application
  2. 名字填猫名（如「总裁喵」），上传头像（examples/avatars/ 里有）
  3. Bot 页面 → Reset Token → 复制 token
  4. 开启 MESSAGE CONTENT INTENT
  5. OAuth2 → URL Generator → bot + Send Messages + Read Message History
  6. 用生成的链接邀请 bot 到你的服务器
  重复 6 次，每只猫一个。
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
# 猫猫名册
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
    "zong-cai-miao": 0x8B6914,
    "mei-li-miao":   0xE8D8C4,
    "hou-tai-miao":  0xD2691E,
    "jia-gou-miao":  0x2F2F2F,
    "ping-an-miao":  0xFFA500,
    "shu-ni-hong":   0xDAA520,
}

CAT_BREEDS: dict[str, str] = {
    "zong-cai-miao": "梨花猫 · 领队",
    "mei-li-miao":   "布偶猫 · 前端",
    "hou-tai-miao":  "三花猫 · 后端",
    "jia-gou-miao":  "奶牛猫 · 架构",
    "ping-an-miao":  "大橘猫 · 安全",
    "shu-ni-hong":   "金渐层 · 文案",
}

CAT_AVATAR_FILES: dict[str, str] = {
    "zong-cai-miao": "cat_avatar_zong-cai-miao.png",
    "mei-li-miao":   "cat_avatar_mei-li-miao.png",
    "hou-tai-miao":  "cat_avatar_hou-tai-miao.png",
    "jia-gou-miao":  "cat_avatar_jia-gou-miao.png",
    "ping-an-miao":  "cat_avatar_ping-an-miao.png",
    "shu-ni-hong":   "cat_avatar_shu-ni-hong.png",
}

_TOKEN_ENV_MAP: dict[str, str] = {
    "zong-cai-miao": "CAT_TOKEN_ZONG_CAI_MIAO",
    "mei-li-miao":   "CAT_TOKEN_MEI_LI_MIAO",
    "hou-tai-miao":  "CAT_TOKEN_HOU_TAI_MIAO",
    "jia-gou-miao":  "CAT_TOKEN_JIA_GOU_MIAO",
    "ping-an-miao":  "CAT_TOKEN_PING_AN_MIAO",
    "shu-ni-hong":   "CAT_TOKEN_SHU_NI_HONG",
}

# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------

HUMAN_INBOX = "discord-human"
POLL_SECONDS = 5.0
TEAM_CHAT_POLL_SECONDS = 3.0
BRIDGE_CHANNEL_IDS: tuple[int, ...] = ()
CLAWTEAM_CMD = "clawteam"
AUTO_NUDGE = True
SHOW_TEAM_CHAT = True

NUDGE_TEXT = (
    "主人刚在 Discord 发了新消息给你。"
    "请立刻执行 clawteam inbox receive '{team}' 查看，"
    "然后用 clawteam inbox send '{team}' discord-human '你的回复' 回复主人。"
)

# ---------------------------------------------------------------------------
# 环境变量
# ---------------------------------------------------------------------------


def _strip_quotes(value: str | None) -> str | None:
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
TEAM = _strip_quotes(os.environ.get("CLAWTEAM_BRIDGE_TEAM"))
LEADER = _strip_quotes(os.environ.get("CLAWTEAM_BRIDGE_LEADER"))
WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")
CAT_AVATAR_BASE_URL = os.environ.get("CAT_AVATAR_BASE_URL", "").rstrip("/")

CAT_TOKENS: dict[str, str] = {}
for _aid, _ekey in _TOKEN_ENV_MAP.items():
    _tok = os.environ.get(_ekey, "").strip()
    if _tok:
        CAT_TOKENS[_aid] = _tok

CHANNEL_IDS: set[int] = set(BRIDGE_CHANNEL_IDS)
_seen_ids: set[str] = set()
_seen_team_files: set[str] = set()
_peek_warned: bool = False

# cat bot discord user id → agent id（运行时由 on_ready 填充）
_bot_user_to_agent: dict[int, str] = {}
# agent id → CatBotClient（运行时填充）
_cat_clients: dict[str, "CatBotClient"] = {}
# 共享的回复频道 id
_reply_channel_id: int | None = min(CHANNEL_IDS) if CHANNEL_IDS else None

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
    return shutil.which(CLAWTEAM_CMD) or CLAWTEAM_CMD


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


def _resolve_inbox_target(agent_id: str) -> str:
    try:
        from clawteam.team.manager import TeamManager
        resolved = TeamManager.resolve_inbox(TEAM or "", agent_id)
        if resolved:
            return resolved
    except Exception:
        pass
    return agent_id


def _cat_display_name(agent_id: str) -> str:
    return AGENT_DISPLAY.get(agent_id, agent_id)


def _cat_full_label(agent_id: str) -> str:
    name = _cat_display_name(agent_id)
    breed = CAT_BREEDS.get(agent_id, "")
    return f"{name}（{breed}）" if breed else name


def _cat_avatar_url(agent_id: str) -> str | None:
    if not CAT_AVATAR_BASE_URL:
        return None
    filename = CAT_AVATAR_FILES.get(agent_id)
    return f"{CAT_AVATAR_BASE_URL}/{filename}" if filename else None


# ---------------------------------------------------------------------------
# 解析 @mention → agent id
# ---------------------------------------------------------------------------


def _mention_to_agent(message: discord.Message) -> str | None:
    """如果消息 @了某只猫 bot，返回对应 agent_id。"""
    for user in message.mentions:
        if user.id in _bot_user_to_agent:
            return _bot_user_to_agent[user.id]
    return None


def _parse_text_target(body: str) -> tuple[str, str]:
    """从文本解析目标猫（!前缀模式的兜底）。"""
    for alias in sorted(AGENT_ALIASES.keys(), key=len, reverse=True):
        pattern = f"@{alias}"
        if pattern in body:
            cleaned = body.replace(pattern, "", 1).strip()
            return AGENT_ALIASES[alias], cleaned
    for alias in sorted(AGENT_ALIASES.keys(), key=len, reverse=True):
        if body.startswith(alias):
            cleaned = body[len(alias):].strip().lstrip("，,：: ")
            return AGENT_ALIASES[alias], cleaned
    for agent_id in AGENT_ALIASES.values():
        if f"@{agent_id}" in body:
            cleaned = body.replace(f"@{agent_id}", "", 1).strip()
            return agent_id, cleaned
    return LEADER or "zong-cai-miao", body


# ---------------------------------------------------------------------------
# Nudge
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
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5,
        )
        print(f"[nudge] → {_cat_display_name(agent_id)}", file=sys.stderr)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# 转发消息到猫
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

    try:
        await loop.run_in_executor(None, lambda: _nudge_agent_tmux(target_agent))
    except Exception:
        pass

    label = _cat_full_label(target_agent)
    await channel.send(f"📨 已发给 **{label}**")


# ---------------------------------------------------------------------------
# 发送消息到 Discord（三种模式：独立 bot → webhook → embed）
# ---------------------------------------------------------------------------


async def _send_as_cat_bot(agent_id: str, channel_id: int, content: str) -> bool:
    """用猫的独立 bot token 通过 REST API 发消息。"""
    token = CAT_TOKENS.get(agent_id)
    if not token:
        return False
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bot {token}",
                "Content-Type": "application/json",
            }
            resp = await session.post(
                f"https://discord.com/api/v10/channels/{channel_id}/messages",
                headers=headers,
                json={"content": content[:2000]},
            )
            if resp.status in (200, 201):
                return True
            body = await resp.text()
            print(f"[cat-bot] {_cat_display_name(agent_id)} 发送失败 {resp.status}: {body[:200]}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"[cat-bot] {_cat_display_name(agent_id)} 发送异常：{e}", file=sys.stderr)
        return False


async def _send_as_webhook(agent_id: str, content: str) -> bool:
    """通过 Webhook 以猫的身份发消息。"""
    if not WEBHOOK_URL:
        return False
    try:
        import aiohttp
        display = _cat_display_name(agent_id)
        breed = CAT_BREEDS.get(agent_id, "")
        username = f"{display}" + (f"（{breed}）" if breed else "")
        avatar = _cat_avatar_url(agent_id)
        async with aiohttp.ClientSession() as session:
            webhook = discord.Webhook.from_url(WEBHOOK_URL, session=session)
            await webhook.send(content[:1900], username=username[:80], avatar_url=avatar)
        return True
    except Exception as e:
        print(f"[webhook] 发送失败：{e}", file=sys.stderr)
        return False


def _make_cat_embed(agent_id: str, content: str) -> discord.Embed:
    color = CAT_COLORS.get(agent_id, 0x888888)
    embed = discord.Embed(description=content[:4000], color=color)
    avatar = _cat_avatar_url(agent_id)
    embed.set_author(name=f"🐱 {_cat_full_label(agent_id)}", icon_url=avatar)
    if avatar:
        embed.set_thumbnail(url=avatar)
    return embed


async def _send_cat_message(
    agent_id: str, channel_id: int, content: str, fallback_client: discord.Client
) -> None:
    """按优先级尝试发消息：独立 bot → webhook → embed。"""
    if await _send_as_cat_bot(agent_id, channel_id, content):
        return
    if await _send_as_webhook(agent_id, content):
        return
    ch = fallback_client.get_channel(channel_id)
    if ch is None:
        try:
            ch = await fallback_client.fetch_channel(channel_id)
        except Exception:
            return
    if isinstance(ch, (discord.TextChannel, discord.Thread)):
        await ch.send(embed=_make_cat_embed(agent_id, content))


# ---------------------------------------------------------------------------
# 轮询 inbox → Discord
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
    return [m for m in (data.get("messages") or []) if isinstance(m, dict)]


async def _poll_inbox_to_discord(bridge: discord.Client) -> None:
    if _reply_channel_id is None:
        return
    for msg in _peek_human_messages():
        rid = str(msg.get("requestId") or msg.get("request_id") or "")
        if not rid:
            rid = str(msg.get("timestamp", "")) + str(msg.get("content", ""))[:40]
        if rid in _seen_ids:
            continue
        from_agent = msg.get("from") or msg.get("from_agent") or "unknown"
        content = msg.get("content") or ""
        await _send_cat_message(from_agent, _reply_channel_id, content, bridge)
        _seen_ids.add(rid)


# ---------------------------------------------------------------------------
# 旁听猫猫内部对话
# ---------------------------------------------------------------------------


def _inboxes_base_dir() -> Path:
    return _effective_data_dir() / "teams" / (TEAM or "") / "inboxes"


def _scan_team_chat_files() -> list[dict[str, Any]]:
    base = _inboxes_base_dir()
    if not base.is_dir():
        return []
    new_msgs: list[dict[str, Any]] = []
    for inbox_dir in base.iterdir():
        if not inbox_dir.is_dir() or inbox_dir.name == HUMAN_INBOX:
            continue
        for msg_file in sorted(inbox_dir.glob("msg-*.json")):
            if msg_file.name in _seen_team_files:
                continue
            _seen_team_files.add(msg_file.name)
            try:
                data = json.loads(msg_file.read_bytes())
                data["_to_inbox"] = inbox_dir.name
                new_msgs.append(data)
            except Exception:
                continue
    new_msgs.sort(key=lambda m: m.get("timestamp", ""))
    return new_msgs


def _inbox_name_to_display(inbox_name: str) -> str:
    if inbox_name in AGENT_DISPLAY:
        return AGENT_DISPLAY[inbox_name]
    for agent_id, display in AGENT_DISPLAY.items():
        if inbox_name.endswith(f"_{agent_id}"):
            return display
    return inbox_name


def _inbox_name_to_agent_id(inbox_name: str) -> str:
    """inbox 目录名 → agent id（用于选对 bot 发送）。"""
    if inbox_name in AGENT_DISPLAY:
        return inbox_name
    for agent_id in AGENT_DISPLAY:
        if inbox_name.endswith(f"_{agent_id}"):
            return agent_id
    return inbox_name


async def _poll_team_chat_to_discord(bridge: discord.Client) -> None:
    if not SHOW_TEAM_CHAT or _reply_channel_id is None:
        return
    loop = asyncio.get_running_loop()
    messages = await loop.run_in_executor(None, _scan_team_chat_files)
    for msg in messages:
        from_agent = msg.get("from") or msg.get("from_agent") or "?"
        to_inbox = msg.get("_to_inbox") or msg.get("to") or "?"
        content = msg.get("content") or ""
        if not content or from_agent == HUMAN_INBOX:
            continue
        from_name = _inbox_name_to_display(from_agent)
        to_name = _inbox_name_to_display(to_inbox)
        tagged = f"**💬 {from_name} → {to_name}**\n{content}"

        # 用发件猫的 bot 发，如果有的话
        from_id = _inbox_name_to_agent_id(from_agent)
        if from_id in CAT_TOKENS:
            await _send_as_cat_bot(from_id, _reply_channel_id, tagged[:2000])
        else:
            color = CAT_COLORS.get(from_id, 0x888888)
            avatar = _cat_avatar_url(from_id)
            embed = discord.Embed(description=content[:4000], color=color)
            embed.set_author(name=f"💬 {from_name} → {to_name}", icon_url=avatar)
            ch = bridge.get_channel(_reply_channel_id)
            if ch and isinstance(ch, (discord.TextChannel, discord.Thread)):
                await ch.send(embed=embed)


# ---------------------------------------------------------------------------
# 猫 Bot Client（每只猫一个，负责接收 @mention）
# ---------------------------------------------------------------------------


class CatBotClient(discord.Client):
    """独立猫 bot，监听 @自己 的消息并转发到 inbox。"""

    def __init__(self, agent_id: str, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.agent_id = agent_id

    async def on_ready(self) -> None:
        if self.user:
            _bot_user_to_agent[self.user.id] = self.agent_id
            name = _cat_display_name(self.agent_id)
            print(f"[cat-bot] {name} 在线 (id={self.user.id})")

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return
        if CHANNEL_IDS and message.channel.id not in CHANNEL_IDS:
            return
        if not self.user or self.user not in message.mentions:
            return
        global _reply_channel_id
        _reply_channel_id = message.channel.id
        body = message.content
        if self.user:
            body = body.replace(f"<@{self.user.id}>", "").replace(f"<@!{self.user.id}>", "").strip()
        if not body:
            body = "（主人似乎只是打了个招呼）"
        await _forward_to_agent(
            message.channel, str(message.author), body, self.agent_id
        )


# ---------------------------------------------------------------------------
# 主桥接 Client（兜底 + 轮询）
# ---------------------------------------------------------------------------


class BridgeClient(discord.Client):
    """主桥接 bot：轮询 inbox、处理 ! 前缀命令、兜底转发。"""

    async def setup_hook(self) -> None:
        asyncio.create_task(self._poll_human_worker())
        if SHOW_TEAM_CHAT:
            asyncio.create_task(self._poll_team_chat_worker())

    async def _poll_human_worker(self) -> None:
        await self.wait_until_ready()
        while not self.is_closed():
            try:
                await _poll_inbox_to_discord(self)
            except Exception as e:
                print(f"[poll] {e}", file=sys.stderr)
            await asyncio.sleep(POLL_SECONDS)

    async def _poll_team_chat_worker(self) -> None:
        await self.wait_until_ready()
        while not self.is_closed():
            try:
                await _poll_team_chat_to_discord(self)
            except Exception as e:
                print(f"[team-chat] {e}", file=sys.stderr)
            await asyncio.sleep(TEAM_CHAT_POLL_SECONDS)

    async def on_ready(self) -> None:
        cats = ", ".join(AGENT_ALIASES.keys())
        bot_cats = [_cat_display_name(a) for a in CAT_TOKENS]
        print(f"Bridge 已登录 {self.user} | team={TEAM}")
        print(f"[bridge] 全部猫猫：{cats}")
        if bot_cats:
            print(f"[bridge] 独立 bot 在线：{', '.join(bot_cats)}")
            no_bot = [v for k, v in AGENT_ALIASES.items() if AGENT_ALIASES[k] not in CAT_TOKENS]
            if no_bot:
                print(f"[bridge] 无独立 bot（用 webhook/embed 兜底）：{', '.join(_cat_display_name(a) for a in no_bot)}")
        else:
            print("[bridge] 未配置猫独立 bot token — 用 !前缀 + webhook/embed 模式")
        if SHOW_TEAM_CHAT:
            print("[bridge] 旁听模式开启")
        dd = _effective_data_dir()
        print(f"[bridge] data dir：{dd}", file=sys.stderr)
        print("用法：直接 @猫的bot 说话，或用 !/@猫名 消息，或 !喵 查看名册")

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return
        if CHANNEL_IDS and message.channel.id not in CHANNEL_IDS:
            return

        global _reply_channel_id
        _reply_channel_id = message.channel.id

        # 如果 @了某只猫 bot，由那只猫的 CatBotClient 处理，这里不重复
        if _mention_to_agent(message):
            return

        # ! / ！ 前缀模式（兜底）
        body: str | None = None
        for p in ("!", "！"):
            if message.content.startswith(p):
                body = message.content[len(p):].strip()
                break
        if body is None:
            return

        if body.strip() in ("喵", "猫", "help", "?", "？", "名册"):
            embed = discord.Embed(
                title="🐾 猫猫名册",
                description="直接 **@猫的bot** 说话，或用 `!@猫名 消息`",
                color=0xFFA500,
            )
            for alias, agent_id in AGENT_ALIASES.items():
                breed = CAT_BREEDS.get(agent_id, "")
                has_bot = "✅ 在线" if agent_id in CAT_TOKENS else "📨 !前缀"
                embed.add_field(name=alias, value=f"{breed}\n{has_bot}", inline=True)
            await message.channel.send(embed=embed)
            return

        target, cleaned = _parse_text_target(body)
        if not cleaned:
            cleaned = "（主人似乎只是打了个招呼）"
        await _forward_to_agent(message.channel, str(message.author), cleaned, target)


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


async def _run_all() -> None:
    """启动主桥接 + 所有猫 bot。"""
    intents = discord.Intents.default()
    intents.message_content = True
    intents.members = True

    tasks: list[asyncio.Task[None]] = []

    # 启动每只猫的独立 bot
    for agent_id, token in CAT_TOKENS.items():
        cat_intents = discord.Intents.default()
        cat_intents.message_content = True
        client = CatBotClient(agent_id, intents=cat_intents)
        _cat_clients[agent_id] = client
        tasks.append(asyncio.create_task(client.start(token)))  # type: ignore[arg-type]

    # 启动主桥接 bot
    bridge = BridgeClient(intents=intents)
    tasks.append(asyncio.create_task(bridge.start(TOKEN)))  # type: ignore[arg-type]

    await asyncio.gather(*tasks)


def main() -> None:
    _check_env()
    if not os.environ.get("CLAWTEAM_DATA_DIR", "").strip():
        os.environ["CLAWTEAM_DATA_DIR"] = str(Path.home() / ".clawteam")
    if not shutil.which(CLAWTEAM_CMD):
        _die(f"找不到 {CLAWTEAM_CMD!r}：请安装 ClawTeam 并加入 PATH。")

    cat_count = len(CAT_TOKENS)
    if cat_count:
        names = ", ".join(_cat_display_name(a) for a in CAT_TOKENS)
        print(f"[启动] {cat_count} 只猫有独立 bot：{names}")
    else:
        print("[启动] 未配置猫独立 bot token，使用 !前缀 + webhook/embed 模式")
    print(f"[启动] 主桥接 bot 正在连接...")

    try:
        asyncio.run(_run_all())
    except KeyboardInterrupt:
        print("已退出。")


if __name__ == "__main__":
    main()
