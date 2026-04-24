# 猫猫拯救天团 — 启动与 Discord 接入指南

> 本指南覆盖：启动 6 只猫猫 Agent 团队、连接 Discord 实时对话、启动前端展示网站。

---

## 一、团队成员

| 名字 | ID | 品种 | 职责 |
|------|----|------|------|
| 总裁喵 | `zong-cai-miao` | 梨花猫 | 领队 · 任务拆解 · 进度协调 |
| 美丽喵 | `mei-li-miao` | 布偶猫 | 前端 · UI/UX · 组件 |
| 后台喵 | `hou-tai-miao` | 三花猫 | 后端 · API · 数据库 |
| 架构喵 | `jia-gou-miao` | 奶牛猫 | 架构 · 接口契约 · 技术选型 |
| 平安喵 | `ping-an-miao` | 大橘猫 | 安全审查 · 高危命令把关 |
| 薯你最红喵 | `shu-ni-hong` | 金渐层 | 小红书文案 · 话题标签 |

---

## 二、前置检查

```bash
# 确认工具都在
tmux -V          # 需要 tmux
claude --version # 需要 Claude Code CLI
clawteam --help  # 需要 ClawTeam

# 如未安装 ClawTeam：
pip install -e /Users/lynnli/ClawTeam
```

---

## 三、启动猫猫团队

`maomao-save-world` 是 ClawTeam 的**内置模板**，确认后直接 launch：

```bash
# 确认模板存在
clawteam template list
```

输出里能看到 `maomao-save-world (builtin)` 即可。

### 一条命令启动

```bash
clawteam launch maomao-save-world \
  --team my-maomao \
  --goal "你的目标，例如：做一个猫粮订购网站并产出小红书推广文案"
```

`launch` 会自动：
1. 建立团队 `my-maomao`
2. 读取 `maomao-save-world.toml` 中每只猫的角色提示词与初始任务
3. 为 6 只猫各自启动独立 tmux 窗口 + Git Worktree

> **不需要**手动 `spawn` 或单独写 `--task`——猫猫的人设、职责、沟通协议全都已在模板里定义好了。

---

## 四、接入 Discord

### 第一步：创建 Discord Bot

1. 打开 [Discord Developer Portal](https://discord.com/developers/applications)
2. 新建 Application → Bot → 开启 **Message Content Intent**
3. 复制 Bot Token
4. OAuth2 → URL Generator → 勾选 `bot` + `Send Messages` + `Read Message History`
5. 用生成的链接把 Bot 加入你的服务器

### 第二步：（可选）创建 Webhook，让每只猫有独立头像

1. 在目标频道 → 编辑频道 → 整合 → Webhook → 新建 Webhook
2. 复制 Webhook URL

### 第三步：设置环境变量

```bash
export DISCORD_BOT_TOKEN="你的 Bot Token"
export CLAWTEAM_BRIDGE_TEAM="my-maomao"          # 与你启动团队时的名字一致
export CLAWTEAM_BRIDGE_LEADER="zong-cai-miao"    # 默认接收消息的猫

# 可选：设置后每只猫以独立用户名/头像发消息
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### 第四步：安装依赖并启动桥接

```bash
pip install "discord.py>=2.3"
# 如果用了 Webhook 模式还需要：
pip install aiohttp

# 启动桥接（保持运行）
python /Users/lynnli/ClawTeam/examples/discord_clawteam_bridge.py
```

启动成功后终端输出类似：
```
Bridge 已登录 你的Bot名#1234 | team=my-maomao leader=zong-cai-miao
[bridge] 可用猫猫：总裁喵, 美丽喵, 后台喵, 架构喵, 平安喵, 薯你最红喵
[bridge] 旁听模式已开启 — 猫猫之间的对话也会显示在 Discord
```

---

## 五、在 Discord 里和猫猫对话

| 输入 | 效果 |
|------|------|
| `!喵` | 显示所有可用猫的名册 |
| `!帮我看看进度` | 发给总裁喵（默认领队） |
| `!@总裁喵 现在做到哪了？` | 点名总裁喵 |
| `!@美丽喵 首页好看吗？` | 点名美丽喵 |
| `!@后台喵 接口写好了吗` | 点名后台喵 |
| `!@架构喵 数据结构确定了吗` | 点名架构喵 |
| `!@平安喵 这条命令安全吗` | 点名平安喵做安全审查 |
| `!@薯你最红喵 帮我出个标题` | 点名薯你最红喵写文案 |

猫猫会通过 `clawteam inbox send my-maomao discord-human '回复内容'` 回复，桥接自动推送到 Discord。

若开启了旁听模式（`SHOW_TEAM_CHAT=True`，默认开），猫猫之间的内部对话也会以灰色 Embed 显示在频道里，方便主人掌握进度。

---

## 六、监控团队状态

```bash
# 终端看板（一次性）
clawteam board show my-maomao

# 自动刷新看板
clawteam board live my-maomao --interval 3

# tmux 平铺视图，同时看所有猫的屏幕
clawteam board attach my-maomao

# Web 仪表板
clawteam board serve --port 8080
# 然后访问 http://localhost:8080

# 查看任务列表
clawteam task list my-maomao

# 查看收件箱
clawteam inbox receive my-maomao
```

---

## 七、启动前端展示网站

项目自带一个 React/Vite 网站（含猫猫团队介绍页）：

```bash
cd /Users/lynnli/ClawTeam/website

# 安装依赖（首次）
npm install

# 启动开发服务器（热更新）
npm run dev
# 访问 http://localhost:5173

# 构建生产版本（输出到 docs/）
npm run build

# 本地预览构建结果
npm run preview
```

网站包含：Hero 区、互动地球 Agent 节点图、团队卡片（含 `猫猫拯救世界` 模板展示）以及各猫头像。

---

## 八、目录结构速查

```
ClawTeam/
├── clawteam/templates/
│   └── maomao-save-world.toml    # 猫猫团队模板（角色/任务/提示词）
├── examples/
│   ├── discord_clawteam_bridge.py # Discord ↔ ClawTeam 桥接
│   └── discord_ping_bot.py        # 最简 Discord Bot 示例
└── website/
    ├── src/components/team/
    │   ├── data.js                # 猫猫成员数据
    │   ├── CatCard.jsx            # 成员卡片组件
    │   ├── CatCardsSection.jsx    # 成员列表
    │   ├── HeroSection.jsx        # 顶部 Hero
    │   ├── TeamCapabilities.jsx   # 能力展示
    │   ├── TeamFooter.jsx         # 页脚
    │   └── TeamPage.jsx           # 完整页面
    └── public/avatars/            # 6 只猫头像 PNG
```

---

## 九、常见问题

**Q：桥接启动后提示"未找到团队配置"？**  
A：先确认团队已创建（`clawteam team discover`），且 `CLAWTEAM_BRIDGE_TEAM` 与团队名完全一致。

**Q：猫猫没有回复 Discord？**  
A：检查猫猫 tmux 窗口是否还在运行；或手动发消息给总裁喵：
```bash
clawteam inbox send my-maomao discord-human "主人在 Discord 找你了，快去查 inbox"
```

**Q：想让猫猫用不同的 AI 模型？**  
先配置 profile：
```bash
clawteam preset list
clawteam profile wizard
clawteam spawn tmux --profile 你的profile名 --team my-maomao --agent-name zong-cai-miao
```

**Q：团队用完了怎么清理？**
```bash
clawteam team cleanup my-maomao --force
```
