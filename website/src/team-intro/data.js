// ============================================================
// 猫猫天团介绍页 — 数据层（产品经理 present 版本）
// ============================================================

// ---------- 1. 团队成员 ----------

export const TEAM_MEMBERS = [
  {
    id: "zong-cai-miao",
    name: "总裁喵",
    role: "团队领袖 · 首席协调官",
    emoji: "👑",
    avatar: "/avatars/cat_avatar_zong-cai-miao.png",
    bio: "掌控全局，爪到擒来。负责团队战略规划与任务协调，确保每只猫都能发挥最大战斗力。",
    tags: ["领导", "战略", "协调"],
    color: "#f97316",
  },
  {
    id: "jia-gou-miao",
    name: "架构喵",
    role: "系统架构师",
    emoji: "🏗️",
    avatar: "/avatars/cat_avatar_jia-gou-miao.png",
    bio: "奶牛花纹，思维缜密。设计系统蓝图，搭建稳固的技术骨架，让代码优雅地流动。",
    tags: ["架构设计", "React", "系统规划"],
    color: "#6366f1",
  },
  {
    id: "hou-tai-miao",
    name: "后台喵",
    role: "后端工程师",
    emoji: "⚙️",
    avatar: "/avatars/cat_avatar_hou-tai-miao.png",
    bio: "默默耕耘在服务器的深处，用 API 和数据库构筑起整个系统的心脏。",
    tags: ["Python", "API", "数据库"],
    color: "#22c55e",
  },
  {
    id: "mei-li-miao",
    name: "美丽喵",
    role: "UI/UX 设计师",
    emoji: "✨",
    avatar: "/avatars/cat_avatar_mei-li-miao.png",
    bio: "把美丽变成像素。将创意与审美融入每一个界面，让用户爱上每一次交互。",
    tags: ["UI设计", "动画", "用户体验"],
    color: "#ec4899",
  },
  {
    id: "ping-an-miao",
    name: "平安喵",
    role: "安全工程师",
    emoji: "🔒",
    avatar: "/avatars/cat_avatar_ping-an-miao.png",
    bio: "守护系统安全的铁壁。代码审查、漏洞扫描，一只都不能少。",
    tags: ["安全审计", "漏洞扫描", "代码审查"],
    color: "#3b82f6",
  },
  {
    id: "shu-ni-hong",
    name: "数你红",
    role: "数据分析师",
    emoji: "📊",
    avatar: "/avatars/cat_avatar_shu-ni-hong.png",
    bio: "数据就是猫粮。从海量日志中挖掘洞察，用图表说话，让决策有据可依。",
    tags: ["数据分析", "可视化", "监控"],
    color: "#a855f7",
  },
];

// ---------- 2. 产品思维展示 ----------

// 核心产品价值主张
export const PRODUCT_VALUES = [
  {
    id: "pv-efficiency",
    icon: "⚡",
    title: "10x 交付提速",
    metric: "并行度提升 10×",
    description:
      "多 Agent 并行拆解复杂任务，消除单线程瓶颈，从需求到上线的周期大幅压缩。",
    highlight: true,
  },
  {
    id: "pv-quality",
    icon: "🔍",
    title: "内建质量防线",
    metric: "安全审查覆盖率 100%",
    description:
      "每条高危指令必经安全喵审批，代码扫描自动触发，质量管控前置而非事后补救。",
    highlight: false,
  },
  {
    id: "pv-visibility",
    icon: "📊",
    title: "全链路可观测",
    metric: "实时成本 & 进度追踪",
    description:
      "任务看板、Token 成本、Agent 状态一览无余，PM 随时掌握团队健康度与资源消耗。",
    highlight: false,
  },
  {
    id: "pv-scale",
    icon: "🚀",
    title: "弹性按需扩容",
    metric: "Agent 数量动态伸缩",
    description:
      "高峰期一键增派 Agent，低峰期自动回收，资源利用率最大化，无需人工排班。",
    highlight: false,
  },
  {
    id: "pv-continuity",
    icon: "💾",
    title: "跨会话记忆",
    metric: "上下文零丢失",
    description:
      "Session 持久化保存工作状态，即使中断也能无缝续接，团队知识不随对话消失。",
    highlight: false,
  },
  {
    id: "pv-collab",
    icon: "🤝",
    title: "人机协同闭环",
    metric: "人工介入精准可控",
    description:
      "关键节点保留人工审批入口，其余全自动流转，实现\"信任但可验证\"的 AI 协作范式。",
    highlight: false,
  },
];

// 用户痛点 vs 猫猫天团解法（产品思维核心叙事）
export const PAIN_POINTS = [
  {
    id: "pp-serial",
    pain: "单 AI 串行执行，复杂任务耗时长",
    solution: "多 Agent 并行分工，任务拆解自动调度",
    icon: "🐌→🚀",
  },
  {
    id: "pp-opaque",
    pain: "AI 黑盒操作，过程不透明",
    solution: "任务看板 + 实时日志，全程可见可控",
    icon: "🌫️→🔭",
  },
  {
    id: "pp-unsafe",
    pain: "高危命令无人把关，操作风险高",
    solution: "安全喵拦截审批，危险操作先审后行",
    icon: "💣→🛡️",
  },
  {
    id: "pp-cost",
    pain: "Token 成本失控，难以预算",
    solution: "实时成本上报，Agent 级别精细计量",
    icon: "💸→📊",
  },
];

// ---------- 3. 协作流程 ----------

export const WORKFLOW_STEPS = [
  {
    id: "ws-1",
    step: 1,
    label: "需求输入",
    actor: "PM / 用户",
    actorEmoji: "🧑‍💼",
    description: "向总裁喵发送任务目标，可以是自然语言或结构化需求文档。",
    outputLabel: "任务工单",
  },
  {
    id: "ws-2",
    step: 2,
    label: "任务拆解",
    actor: "总裁喵",
    actorEmoji: "👑",
    description: "总裁喵将需求拆解为子任务，设定优先级与依赖关系，写入任务看板。",
    outputLabel: "子任务列表",
  },
  {
    id: "ws-3",
    step: 3,
    label: "并行执行",
    actor: "各专职喵",
    actorEmoji: "⚙️",
    description: "架构喵、后台喵、美丽喵等按职责认领任务并行推进，inbox 消息保证协同。",
    outputLabel: "代码 / 设计稿",
  },
  {
    id: "ws-4",
    step: 4,
    label: "安全审查",
    actor: "平安喵",
    actorEmoji: "🔒",
    description: "高危操作自动路由至平安喵审批，代码扫描同步进行，确保零安全事故。",
    outputLabel: "审查报告",
  },
  {
    id: "ws-5",
    step: 5,
    label: "交付 & 复盘",
    actor: "总裁喵 + 数你红",
    actorEmoji: "📊",
    description: "任务完成后，数你红输出成本与效率报告，总裁喵向用户汇报交付物。",
    outputLabel: "交付物 + 报告",
  },
];

// ---------- 4. 技术栈简述 ----------

export const TECH_STACK = [
  {
    id: "ts-react",
    name: "React 18",
    category: "前端",
    what: "声明式 UI，组件驱动开发",
    why: "生态成熟，团队共识",
    emoji: "⚛️",
  },
  {
    id: "ts-vite",
    name: "Vite",
    category: "构建",
    what: "极速热更新与生产打包",
    why: "开发体验秒级反馈",
    emoji: "⚡",
  },
  {
    id: "ts-python",
    name: "Python",
    category: "后端 / Agent",
    what: "Agent 编排与 API 服务",
    why: "AI 生态首选语言",
    emoji: "🐍",
  },
  {
    id: "ts-claude",
    name: "Claude API",
    category: "AI 模型",
    what: "核心推理与代码生成",
    why: "长上下文 + 工具调用能力强",
    emoji: "🤖",
  },
  {
    id: "ts-git",
    name: "Git Worktree",
    category: "协作隔离",
    what: "每个 Agent 独立分支并行工作",
    why: "避免多 Agent 代码冲突",
    emoji: "🌿",
  },
  {
    id: "ts-css",
    name: "CSS Variables",
    category: "样式",
    what: "主题化设计令牌系统",
    why: "零依赖，响应式优先",
    emoji: "🎨",
  },
];
