#!/usr/bin/env python3
"""Discord ↔ ClawTeam 桥接（最小可用版）。

- Discord：在频道发消息 → 调用 `clawteam inbox send` 转给领队。
- ClawTeam：要给人类看的内容发到虚拟收件箱（默认名见下方 HUMAN_INBOX）：
    clawteam inbox send <team> <HUMAN_INBOX 名> "要给人类看的内容"

依赖：pip install "discord.py>=2.3"

终端只需 export 这三项：
  DISCORD_BOT_TOKEN
  CLAWTEAM_BRIDGE_TEAM
  CLAWTEAM_BRIDGE_LEADER
其余参数在下方「常量」里改源码即可。
"""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import subprocess
import sys
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


def _clawteam_exe() -> str:
    path = shutil.which(CLAWTEAM_CMD)
    return path or CLAWTEAM_CMD


def _run_clawteam_json(args: list[str]) -> dict[str, Any] | list[Any] | None:
    cmd = [_clawteam_exe(), "--json", *args]
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        env=os.environ.copy(),
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


async def _forward_to_leader(channel: discord.abc.Messageable, author: str, body: str) -> None:
    line = f"[Discord @{author}] {body}"
    loop = asyncio.get_running_loop()

    def _send() -> None:
        _run_clawteam_json(
            [
                "inbox",
                "send",
                TEAM,
                LEADER,
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
    await channel.send(f"已发给 **{LEADER}** 的 inbox（团队 `{TEAM}`）。")


def _peek_human_messages() -> list[dict[str, Any]]:
    try:
        data = _run_clawteam_json(
            ["inbox", "peek", TEAM, "--agent", HUMAN_INBOX]
        )
    except Exception:
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
        if PREFIX:
            print(f"转发前缀：{PREFIX!r}（示例：{PREFIX}帮我把登录页做了）")
        else:
            print("未设置 PREFIX：整句转发（请在源码里限制 BRIDGE_CHANNEL_IDS）")

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
