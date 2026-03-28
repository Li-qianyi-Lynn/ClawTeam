#!/usr/bin/env python3
"""Discord ↔ ClawTeam 桥接（最小可用版）。

- Discord：在频道发消息 → 调用 `clawteam inbox send` 转给领队。
- ClawTeam：要给人类看的内容发到虚拟收件箱（默认名见下方 HUMAN_INBOX）：
    clawteam inbox send <team> <HUMAN_INBOX 名> "要给人类看的内容"

依赖：pip install "discord.py>=2.3"

终端必须 export：
  DISCORD_BOT_TOKEN
  CLAWTEAM_BRIDGE_TEAM
  CLAWTEAM_BRIDGE_LEADER

**强烈建议**再设（桥接里跑的 `clawteam` 与你在 SSH 里手敲的必须指向同一目录，否则「已发给」但猫永远收不到）：
  export CLAWTEAM_DATA_DIR="$HOME/.clawteam"

若桥接用 systemd，在 unit 里写同一绝对路径，例如：
  Environment=CLAWTEAM_DATA_DIR=/home/azureuser/.clawteam

其余参数在下方「常量」里改源码即可。
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
# 常量（按需改这里；不必再设环境变量）
# ---------------------------------------------------------------------------

# 虚拟发件/收件身份名（与 clawteam inbox send … 里一致）
HUMAN_INBOX = "discord-human"

# 仅处理以此前缀开头的消息；正文（去掉前缀）进 inbox
PREFIX = "!ct "

# 轮询 ClawTeam 收件箱、贴回 Discord 的间隔（秒）
POLL_SECONDS = 5.0

# 允许的频道 ID；空元组 () = 不限制频道（任意频道可用 !ct）
BRIDGE_CHANNEL_IDS: tuple[int, ...] = ()

# clawteam 可执行文件名（需在 PATH 中）
CLAWTEAM_CMD = "clawteam"

# ---------------------------------------------------------------------------
# 环境变量（仅三样）
# ---------------------------------------------------------------------------

TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
TEAM = os.environ.get("CLAWTEAM_BRIDGE_TEAM")
LEADER = os.environ.get("CLAWTEAM_BRIDGE_LEADER")

CHANNEL_IDS: set[int] = set(BRIDGE_CHANNEL_IDS)
_seen_ids: set[str] = set()
_peek_warned: bool = False


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
    """与 clawteam 一致：优先环境变量 CLAWTEAM_DATA_DIR，否则 ~/.clawteam。"""
    raw = os.environ.get("CLAWTEAM_DATA_DIR", "").strip()
    if raw:
        return Path(os.path.expanduser(raw)).resolve()
    return Path.home() / ".clawteam"


def _clawteam_subprocess_env() -> dict[str, str]:
    """子进程环境：保证写进与当前检查命令相同的 data 目录。"""
    env = os.environ.copy()
    # 未设置时显式写入默认路径，避免 systemd 等服务环境下 HOME 与交互 shell 不一致
    if not env.get("CLAWTEAM_DATA_DIR", "").strip():
        env["CLAWTEAM_DATA_DIR"] = str(Path.home() / ".clawteam")
    return env


def _team_config_path() -> Path:
    return _effective_data_dir() / "teams" / (TEAM or "") / "config.json"


def _leader_inbox_target() -> str:
    """与 `clawteam inbox send` 一致：领队若有 user，真实目录为 ``user_zong-cai-miao``。"""
    try:
        from clawteam.team.manager import TeamManager

        resolved = TeamManager.get_leader_inbox(TEAM or "")
        if resolved:
            return resolved
    except Exception:
        pass
    return LEADER


def _clawteam_exe() -> str:
    path = shutil.which(CLAWTEAM_CMD)
    return path or CLAWTEAM_CMD


def _run_clawteam_json(args: list[str]) -> dict[str, Any] | list[Any] | None:
    cmd = [_clawteam_exe(), "--json", *args]
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        env=_clawteam_subprocess_env(),
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


def _leader_peek_messages() -> list[dict[str, Any]]:
    try:
        data = _run_clawteam_json(
            ["inbox", "peek", TEAM, "--agent", _leader_inbox_target()]
        )
    except Exception:
        return []
    if not isinstance(data, dict):
        return []
    raw = data.get("messages") or []
    return [m for m in raw if isinstance(m, dict)]


def _leader_inbox_has_line(line: str) -> bool:
    """转发后校验：领队收件箱里是否能看到本条（防止写进另一套 data dir）。"""
    needle = line[:120] if len(line) > 120 else line
    for msg in _leader_peek_messages():
        content = str(msg.get("content") or "")
        if needle in content or line in content:
            return True
    return False


async def _forward_to_leader(channel: discord.abc.Messageable, author: str, body: str) -> None:
    line = f"[Discord @{author}] {body}"
    loop = asyncio.get_running_loop()

    def _send() -> None:
        to_inbox = _leader_inbox_target()
        _run_clawteam_json(
            [
                "inbox",
                "send",
                TEAM,
                to_inbox,
                line,
                "--from",
                HUMAN_INBOX,
            ]
        )

    try:
        await loop.run_in_executor(None, _send)
    except Exception as e:
        await channel.send(f"转发到 ClawTeam 失败：`{e}`")
        return

    def _verify() -> bool:
        return _leader_inbox_has_line(line)

    try:
        ok = await loop.run_in_executor(None, _verify)
    except Exception:
        ok = False

    data_dir = _effective_data_dir()
    await channel.send(f"已发给 **{LEADER}** 的 inbox（团队 `{TEAM}`）。")
    if not ok:
        await channel.send(
            "⚠️ **校验失败**：`clawteam inbox send` 返回成功，但**在同一数据目录下** peek 领队收件箱**没看到**本条。\n"
            f"请在本机设与桥接**相同**的目录后再试：\n"
            f"`export CLAWTEAM_DATA_DIR={data_dir}`\n"
            "若用 systemd 跑桥接，给 service 加上同一 `Environment=`。**你在 SSH 里 peek 时也要 export 这一行。**"
        )


def _peek_human_messages() -> list[dict[str, Any]]:
    global _peek_warned
    try:
        data = _run_clawteam_json(
            ["inbox", "peek", TEAM, "--agent", HUMAN_INBOX]
        )
    except Exception as e:
        if not _peek_warned:
            print(
                f"[poll] inbox peek 失败（队名/数据目录是否与转发时一致？）：{e}",
                file=sys.stderr,
            )
            _peek_warned = True
        return []
    if not isinstance(data, dict):
        return []
    raw = data.get("messages") or []
    return [m for m in raw if isinstance(m, dict)]


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
        frm = msg.get("from") or msg.get("from_agent") or "?"
        content = msg.get("content") or ""
        text = f"**ClawTeam** ← `{frm}`\n{content}"[:1900]
        ch = client.get_channel(reply_channel_id)
        if ch is None:
            try:
                ch = await client.fetch_channel(reply_channel_id)
            except Exception:
                continue
        if isinstance(ch, (discord.TextChannel, discord.Thread)):
            await ch.send(text)
            _seen_ids.add(rid)


def _strip_prefix(content: str) -> str | None:
    if PREFIX:
        if not content.startswith(PREFIX):
            return None
        return content[len(PREFIX) :].strip()
    return content.strip() or None


class ClawTeamBridgeClient(discord.Client):
    """在 setup_hook 里启动 inbox 轮询，把 ClawTeam 回信贴回 Discord。"""

    def __init__(self, *, intents: discord.Intents) -> None:
        super().__init__(intents=intents)
        self._reply_channel_id: int | None = min(CHANNEL_IDS) if CHANNEL_IDS else None

    async def setup_hook(self) -> None:
        asyncio.create_task(self._poll_worker())

    async def _poll_worker(self) -> None:
        await self.wait_until_ready()
        while not self.is_closed():
            try:
                await _poll_inbox_to_discord(self, self._reply_channel_id)
            except Exception as e:
                print(f"[poll] {e}", file=sys.stderr)
            await asyncio.sleep(POLL_SECONDS)

    async def on_ready(self) -> None:
        print(f"Bridge 已登录 {self.user} | team={TEAM} leader={LEADER} human_inbox={HUMAN_INBOX}")
        dd = _effective_data_dir()
        print(f"[bridge] CLAWTEAM_DATA_DIR 有效路径：{dd}", file=sys.stderr)
        tcfg = _team_config_path()
        if not tcfg.is_file():
            print(
                f"[bridge] 警告：未找到团队配置 {tcfg}（队名或数据目录可能不对）",
                file=sys.stderr,
            )
        resolved = _leader_inbox_target()
        if resolved != LEADER:
            print(
                f"[bridge] 领队投递收件箱为 {resolved!r}（与 CLAWTEAM_BRIDGE_LEADER={LEADER!r} 不同属正常，多用户团队为 user_逻辑名）",
                file=sys.stderr,
            )
            print(
                f"[bridge] 终端查看请用：clawteam inbox peek {TEAM!r} --agent {resolved!r}",
                file=sys.stderr,
            )
        if PREFIX:
            print(f"转发前缀：{PREFIX!r}（示例：{PREFIX}帮我把登录页做了）")
        else:
            print("未设置 PREFIX：整句转发（请在源码里限制 BRIDGE_CHANNEL_IDS）")
        print(
            "提示：Discord 不会自动出现「猫回复」。只有 ClawTeam 里有人执行\n"
            f"  clawteam inbox send {TEAM!r} {HUMAN_INBOX} '要给人类看的文字'\n"
            "后，本脚本才会把内容贴回 Discord；总裁喵进程也需在跑并会发上述命令。",
            file=sys.stderr,
        )

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return
        if CHANNEL_IDS and message.channel.id not in CHANNEL_IDS:
            return
        body = _strip_prefix(message.content)
        if body is None:
            return
        self._reply_channel_id = message.channel.id
        await _forward_to_leader(message.channel, str(message.author), body)


def main() -> None:
    _check_env()
    # 尽早统一子进程默认 data dir，与 _clawteam_subprocess_env 一致
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
