# 猫猫天团内部机制 — 协作原理与数据存储

---

## 一、任务系统与 Milestone

### 任务状态流转

```
pending → in_progress → completed
                      ↘ blocked（有未完成的依赖）
```

### 用 `--blocked-by` 建依赖链

总裁喵拆任务时，用 `--blocked-by` 指定前置依赖，下游任务自动锁住，前置完成后**自动解锁**：

```bash
# 第一批：无依赖
clawteam task create my-maomao "架构喵：定接口契约" -o jia-gou-miao
# → 返回 task id，假设是 t1

# 第二批：依赖 t1
clawteam task create my-maomao "后台喵：实现 API"   -o hou-tai-miao --blocked-by t1
clawteam task create my-maomao "美丽喵：实现前端"   -o mei-li-miao  --blocked-by t1

# 第三批：依赖第二批
clawteam task create my-maomao "平安喵：安全审查"   -o ping-an-miao --blocked-by t2,t3
```

### 自动解锁原理

```
架构喵执行：clawteam task update my-maomao t1 --status completed
    │
    ▼
系统扫描所有 blockedBy 包含 t1 的任务
    │
    ├── 后台喵的任务：blockedBy 清空 → 状态改为 pending ✅
    └── 美丽喵的任务：blockedBy 清空 → 状态改为 pending ✅
```

---

## 二、Agent 间如何沟通

每只猫有独立**收件箱**，消息是 JSON 文件，点对点投递：

```bash
# 架构喵通知后台喵
clawteam inbox send my-maomao hou-tai-miao "接口契约已定，见 api-spec.md"

# 后台喵汇报总裁喵
clawteam inbox send my-maomao zong-cai-miao "API 完成，47 个测试全过 ✅"

# 总裁喵通知主人（推送到 Discord）
clawteam inbox send my-maomao discord-human "主人，后台完工了～"

# 总裁喵广播全队
clawteam inbox broadcast my-maomao "平安喵审查完毕，所有人可以继续了"

# 查看自己的收件箱
clawteam inbox receive my-maomao
```

### Discord 桥接原理

```
猫猫执行 inbox send ... discord-human "消息"
    │
    ▼
消息写入 ~/.clawteam/teams/my-maomao/inboxes/discord-human/msg-xxx.json
    │
    ▼
discord_clawteam_bridge.py 每 5 秒轮询该目录
    │
    ▼
有新文件 → 推送到 Discord 频道（Embed 或 Webhook 独立身份）
```

---

## 三、Agent 启动时注入了什么

每只猫被 spawn 时，自动收到一份**协调提示词**，包含：

```
## 身份
- 名字：mei-li-miao
- 团队：my-maomao
- 领队：zong-cai-miao
- 工作目录：/home/azureuser/ClawTeam（独立 Git Worktree）

## 任务
（来自模板或 --task 参数的具体任务描述）

## 协调协议（自动注入，猫猫开箱即用）
- 查任务：clawteam task list my-maomao --owner mei-li-miao
- 认领任务：clawteam task update my-maomao <id> --status in_progress
- 完成任务：clawteam task update my-maomao <id> --status completed
- 发消息给领队：clawteam inbox send my-maomao zong-cai-miao "..."
- 查收件箱：clawteam inbox receive my-maomao
- 报告空闲：clawteam lifecycle idle my-maomao
```

---

## 四、数据全部存在哪里

**Azure 上：`/home/azureuser/.clawteam/`**（本地 Mac：`~/.clawteam/`）

```
~/.clawteam/
├── tasks/
│   └── my-maomao/
│       ├── task-{id}.json        ← 每个任务一个文件
│       └── .tasks.lock           ← 写锁，防并发冲突
│
├── teams/
│   └── my-maomao/
│       ├── config.json           ← 团队成员列表
│       ├── spawn_registry.json   ← 每只猫的进程/tmux 窗口记录
│       │
│       ├── inboxes/
│       │   ├── zong-cai-miao/    ← 总裁喵收件箱
│       │   ├── mei-li-miao/      ← 美丽喵收件箱
│       │   ├── hou-tai-miao/     ← 后台喵收件箱
│       │   ├── jia-gou-miao/     ← 架构喵收件箱
│       │   ├── ping-an-miao/     ← 平安喵收件箱
│       │   ├── shu-ni-hong/      ← 薯你最红喵收件箱
│       │   └── discord-human/    ← 主人收件箱（桥接从这里取消息推送 Discord）
│       │
│       └── events/               ← 全量操作日志（只追加，不消费）
│
└── costs.db                      ← SQLite，记录每只猫的 token 消耗
```

### 任务 JSON 长什么样

```json
{
  "id": "8b17a861",
  "subject": "美丽喵：实现首页 UI",
  "status": "in_progress",
  "owner": "mei-li-miao",
  "blockedBy": [],
  "blocks": ["t5"],
  "lockedBy": "mei-li-miao",
  "lockedAt": "2026-04-23T10:00:00Z",
  "createdAt": "2026-04-23T09:00:00Z",
  "updatedAt": "2026-04-23T10:00:00Z"
}
```

### 消息 JSON 长什么样

```json
{
  "type": "message",
  "from": "hou-tai-miao",
  "to": "zong-cai-miao",
  "content": "API 完成，47 个测试全过 ✅",
  "requestId": "a3f9c12b4e7d",
  "timestamp": "2026-04-23T11:30:00Z"
}
```

---

## 五、为什么团队和桥接必须在同一台机器

```
猫猫（Azure）→ 写入 /home/azureuser/.clawteam/inboxes/discord-human/
桥接（Azure）→ 读取 /home/azureuser/.clawteam/inboxes/discord-human/
                          ↑ 同一个目录，文件系统共享
```

如果桥接跑在本地 Mac，它读的是 `~/.clawteam/`（空的），永远收不到猫猫的消息。  
所以桥接必须和猫猫团队在**同一台 Azure 服务器**上运行。

---

## 六、完整协作时序图

```
主人（Discord）
    │  !@总裁喵 帮我做个登录页
    ▼
discord_bridge → inbox send my-maomao zong-cai-miao "[Discord] 帮我做个登录页"
    │              + tmux nudge 通知总裁喵检查收件箱
    ▼
总裁喵 inbox receive → 看到主人消息
    │
    ├── task create "架构喵：定接口" → t1
    ├── task create "美丽喵：做登录页 UI" --blocked-by t1 → t2
    ├── task create "后台喵：做登录 API" --blocked-by t1 → t3
    └── inbox send discord-human "收到主人！已拆任务，架构喵先来～"
    │
    ▼
架构喵 task update t1 --status completed
    │  → t2、t3 自动解锁
    ▼
美丽喵、后台喵 并行工作
    │
    ├── 美丽喵完成 → inbox send zong-cai-miao "UI 完成"
    └── 后台喵完成 → inbox send zong-cai-miao "API 完成"
    │
    ▼
总裁喵 → inbox send discord-human "主人，登录页做好了！"
    │
    ▼
主人在 Discord 看到回复 ✅
```
