#!/usr/bin/env python3
"""Minimal Discord bot: reply `pong` when someone sends `!ping`.

Requires:
  pip install "discord.py>=2.3"
  export DISCORD_BOT_TOKEN='your bot token'

Discord Developer Portal: enable Bot → MESSAGE CONTENT INTENT.
"""

from __future__ import annotations

import os
import sys

import discord

TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
if not TOKEN:
    print(
        "错误：未设置环境变量 DISCORD_BOT_TOKEN。\n"
        "示例：export DISCORD_BOT_TOKEN='你的Token'\n"
        "然后重新运行：python examples/discord_ping_bot.py",
        file=sys.stderr,
    )
    raise SystemExit(1)

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)


@client.event
async def on_ready() -> None:
    print(f"已登录为 {client.user}（在频道发 !ping 测试）")


@client.event
async def on_message(message: discord.Message) -> None:
    if message.author.bot:
        return
    if message.content.strip() == "!ping":
        await message.channel.send("pong")


def main() -> None:
    client.run(TOKEN)


if __name__ == "__main__":
    main()
