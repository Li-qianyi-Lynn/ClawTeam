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
    bio: "需求拆解与任务调度的总指挥。负责将模糊目标转化为结构化子任务，建立优先级与依赖关系，驱动整个 Agent 团队高效协同交付。",
    tags: ["任务编排", "需求拆解", "团队协调"],
    color: "#f97316",
  },
  {
    id: "jia-gou-miao",
    name: "架构喵",
    role: "系统架构师",
    emoji: "🏗️",
    avatar: "/avatars/cat_avatar_jia-gou-miao.png",
    bio: "在动工之前先想清楚。负责系统模块划分、接口契约设计与技术选型，用可维护的架构蓝图降低多 Agent 并行带来的集成风险。",
    tags: ["架构设计", "接口契约", "系统规划"],
    color: "#6366f1",
  },
  {
    id: "hou-tai-miao",
    name: "后台喵",
    role: "后端工程师",
    emoji: "⚙️",
    avatar: "/avatars/cat_avatar_hou-tai-miao.png",
    bio: "系统稳定性与数据可靠性的守护者。负责 API 服务、数据持久化与 Agent 通信协议，让前端与 AI 层的每一次调用都有坚实的后端支撑。",
    tags: ["Python", "API 设计", "数据可靠性"],
    color: "#22c55e",
  },
  {
    id: "mei-li-miao",
    name: "美丽喵",
    role: "UI/UX 设计师",
    emoji: "✨",
    avatar: "/avatars/cat_avatar_mei-li-miao.png",
    bio: "用户体验从视觉开始。将用户旅程映射为直觉化的交互设计，在信息密度与视觉清晰度之间找到精确平衡，让复杂系统变得易于理解。",
    tags: ["交互设计", "用户旅程", "视觉体验"],
    color: "#ec4899",
  },
  {
    id: "ping-an-miao",
    name: "平安喵",
    role: "安全工程师",
    emoji: "🔒",
    avatar: "/avatars/cat_avatar_ping-an-miao.png",
    bio: "安全不是事后补丁，而是内建流程。负责高危指令拦截审批、自动化漏洞扫描与代码审查，将安全管控前置到每一个交付节点。",
    tags: ["安全审计", "漏洞扫描", "风险前置"],
    color: "#3b82f6",
  },
  {
    id: "shu-ni-hong",
    name: "数你红",
    role: "数据分析师",
    emoji: "📊",
    avatar: "/avatars/cat_avatar_shu-ni-hong.png",
    bio: "让决策有据可依。从任务执行日志中提炼效率指标与成本数据，实时呈现团队健康度，用可量化的洞察支撑每一次资源分配与优化决策。",
    tags: ["效率度量", "成本可视化", "数据洞察"],
    color: "#a855f7",
  },
];

// ---------- 2. 产品思维展示 ----------

// 核心产品价值主张
export const PRODUCT_VALUES = [
  {
    id: "pv-efficiency",
    icon: "⚡",
    title: "10× 交付提速",
    metric: "并行度提升 10×",
    description:
      "将复杂任务拆解为独立子任务并行推进，消除单 Agent 串行执行的瓶颈，从需求确认到成果交付的周期大幅压缩。",
    highlight: true,
  },
  {
    id: "pv-quality",
    icon: "🔍",
    title: "内建质量防线",
    metric: "安全审查覆盖率 100%",
    description:
      "高危指令自动路由至安全 Agent 审批，代码扫描在提交前同步触发。质量管控前置于交付流程，而非事后打补丁。",
    highlight: false,
  },
  {
    id: "pv-visibility",
    icon: "📊",
    title: "全链路可观测",
    metric: "实时成本 & 进度追踪",
    description:
      "任务看板、Token 消耗、Agent 运行状态实时同步。PM 无需盲目等待，随时掌握团队健康度与预算使用情况。",
    highlight: false,
  },
  {
    id: "pv-scale",
    icon: "🚀",
    title: "弹性按需扩容",
    metric: "Agent 数量动态伸缩",
    description:
      "高峰期一键增派专职 Agent，低峰期自动回收资源，无需人工排班。团队规模随任务复杂度动态匹配，资源利用率最大化。",
    highlight: false,
  },
  {
    id: "pv-continuity",
    icon: "💾",
    title: "跨会话持久记忆",
    metric: "上下文零丢失",
    description:
      "Session 持久化保存每个 Agent 的工作状态与上下文，中断后无缝续接。团队积累的知识与进度不随会话结束而消失。",
    highlight: false,
  },
  {
    id: "pv-collab",
    icon: "🤝",
    title: "人机协同闭环",
    metric: "人工介入精准可控",
    description:
      "关键决策节点保留人工审批入口，常规流程全自动流转。实现「信任但可验证」的 AI 协作范式，自动化与人工监督相互补充。",
    highlight: false,
  },
];

// 用户痛点 vs 猫猫天团解法（产品思维核心叙事）
export const PAIN_POINTS = [
  {
    id: "pp-serial",
    pain: "单 AI 串行执行，复杂任务交付周期长、效率低",
    solution: "多 Agent 并行分工，任务自动拆解与调度，关键路径大幅压缩",
    icon: "🐌→🚀",
  },
  {
    id: "pp-opaque",
    pain: "AI 执行过程黑盒化，管理者无法感知进度与风险",
    solution: "结构化任务看板 + 实时执行日志，每一步操作全程可见可控",
    icon: "🌫️→🔭",
  },
  {
    id: "pp-unsafe",
    pain: "高危操作缺乏审批机制，一条命令可能造成不可逆损失",
    solution: "危险指令自动路由至安全 Agent 审批，先审后行，操作可追溯",
    icon: "💣→🛡️",
  },
  {
    id: "pp-cost",
    pain: "Token 用量不透明，AI 成本难以预算与管控",
    solution: "每个 Agent 实时上报成本，精细到任务级别，预算超限提前预警",
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
    description: "以自然语言或结构化需求文档向总裁喵发送任务目标，无需了解底层技术实现。",
    outputLabel: "任务工单",
  },
  {
    id: "ws-2",
    step: 2,
    label: "任务拆解",
    actor: "总裁喵",
    actorEmoji: "👑",
    description: "总裁喵将需求分解为粒度合适的子任务，明确优先级与前置依赖，将执行计划写入任务看板并分派给相应 Agent。",
    outputLabel: "结构化子任务列表",
  },
  {
    id: "ws-3",
    step: 3,
    label: "并行执行",
    actor: "各专职 Agent",
    actorEmoji: "⚙️",
    description: "架构喵、后台喵、美丽喵等按专业职责认领任务并行推进，通过 inbox 消息机制同步进度与协调依赖，最大化并行度。",
    outputLabel: "代码 / 设计稿",
  },
  {
    id: "ws-4",
    step: 4,
    label: "安全审查",
    actor: "平安喵",
    actorEmoji: "🔒",
    description: "高危操作在执行前自动路由至平安喵进行人工审批，代码漏洞扫描同步触发，安全防线内建于交付流程而非独立于其外。",
    outputLabel: "安全审查报告",
  },
  {
    id: "ws-5",
    step: 5,
    label: "交付 & 复盘",
    actor: "总裁喵 + 数你红",
    actorEmoji: "📊",
    description: "数你红输出 Token 成本与执行效率分析报告，总裁喵汇总交付物并向用户呈现完整的交付清单，形成可追溯的交付闭环。",
    outputLabel: "交付物 + 效率报告",
  },
];

// ---------- 4. 技术栈简述 ----------

export const TECH_STACK = [
  {
    id: "ts-react",
    name: "React 18",
    category: "前端",
    what: "声明式 UI，组件化开发范式",
    why: "生态成熟、社区共识强，多 Agent 并行写组件时合并冲突最少",
    emoji: "⚛️",
  },
  {
    id: "ts-vite",
    name: "Vite",
    category: "构建工具",
    what: "毫秒级热更新与高效生产打包",
    why: "本地开发反馈即时，Agent 代码修改后秒级可见，提升迭代速度",
    emoji: "⚡",
  },
  {
    id: "ts-python",
    name: "Python",
    category: "后端 / Agent",
    what: "Agent 编排逻辑与 REST API 服务",
    why: "AI 工程生态首选语言，Claude SDK、任务调度库一应俱全",
    emoji: "🐍",
  },
  {
    id: "ts-claude",
    name: "Claude API",
    category: "AI 核心",
    what: "驱动所有 Agent 的推理、规划与代码生成能力",
    why: "长上下文窗口 + 工具调用精准度高，适合多步骤复杂任务编排",
    emoji: "🤖",
  },
  {
    id: "ts-git",
    name: "Git Worktree",
    category: "协作隔离",
    what: "为每个 Agent 创建独立工作分支",
    why: "并行开发时各 Agent 互不干扰，消除代码冲突，集成时再合并",
    emoji: "🌿",
  },
  {
    id: "ts-css",
    name: "CSS Variables",
    category: "样式系统",
    what: "主题化设计令牌，统一视觉语言",
    why: "零运行时依赖，多 Agent 协作写样式时共享同一套设计规范",
    emoji: "🎨",
  },
];
