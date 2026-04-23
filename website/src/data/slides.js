/**
 * 猫猫拯救天团 — Slide Content Data
 * 后台喵 data layer: 6-slide PPT content for interview presentation.
 * Covers: cover, team intro, product thinking, tech architecture, project showcase, summary.
 *
 * NOTE: Placeholder copy is used until 薯你最红喵 delivers final text (task ab359b9a).
 * Visual tokens are approximate until 美丽喵 delivers design spec (task 010cedd9).
 */

import { TEAM_MEMBERS, TEAM_NAME, TEAM_SLOGAN } from "./team.js";

export const SLIDE_COUNT = 6;

export const SLIDES = [
  {
    id: "cover",
    index: 0,
    type: "cover",
    title: TEAM_NAME,
    subtitle: TEAM_SLOGAN,
    tagline: "六只猫 · 一个目标 · 无限可能",
    description:
      "猫猫拯救天团是一支由 AI 驱动的多智能体协作团队，融合产品思维与技术深度，用 ClawTeam 框架实现真正的智能协作。",
    visual: {
      type: "logo-animation",
      items: TEAM_MEMBERS.map((m) => ({
        id: m.id,
        emoji: m.emoji,
        color: m.color,
        name: m.name,
      })),
    },
    cta: "认识我们的团队 →",
    speakerNotes:
      "开场白：介绍整个团队的名字、定位，点出「猫猫拯救天团」的创意来源——用 ClawTeam 框架把 6 只各有专长的 AI Agent 组织成一个完整的产品团队。",
  },
  {
    id: "team-intro",
    index: 1,
    type: "team-grid",
    title: "认识我们",
    subtitle: "六只各司其职的专业猫咪",
    description:
      "每只猫都有独特的身份、品种和专业技能。我们不是六个独立的 AI——我们是一个有默契的团队。",
    members: TEAM_MEMBERS,
    highlight: "多智能体 · 分工明确 · 协作无摩擦",
    speakerNotes:
      "介绍六位成员：总裁喵负责统筹、美丽喵负责前端设计、后台喵负责 API 与数据、架构喵设计系统结构、平安喵把关安全、薯你最红喵负责内容传播。",
  },
  {
    id: "product-thinking",
    index: 2,
    type: "methodology",
    title: "产品思维",
    subtitle: "从用户需求到可交付成果",
    description:
      "我们用真实的产品思维驱动开发：需求拆解 → 接口契约 → 分工实现 → 联调交付。每个环节都有对应的角色负责。",
    pillars: [
      {
        icon: "🎯",
        title: "需求拆解",
        body: "总裁喵将模糊目标拆成清晰的可执行任务，明确优先级与依赖关系。",
        owner: "zong-cai-miao",
      },
      {
        icon: "📐",
        title: "系统设计",
        body: "架构喵定义接口契约和数据模型，确保各模块边界清晰、可独立开发。",
        owner: "jia-gou-miao",
      },
      {
        icon: "⚡",
        title: "并行实现",
        body: "前端、后端同步开工，遵循契约开发，用 ClawTeam 任务板追踪进度与阻塞。",
        owner: "all",
      },
      {
        icon: "✅",
        title: "安全交付",
        body: "平安喵审查高危操作，所有接口经过验证，最终交付可运行、可审计的产品。",
        owner: "ping-an-miao",
      },
    ],
    caseStudy: {
      title: "实战案例：本次 PPT 网站",
      steps: [
        "总裁喵 接到需求：创建面试展示 PPT 网站",
        "架构喵 出方案：Reveal.js + 6 页结构 + 接口契约",
        "后台喵 建数据层：团队数据、幻灯片内容、配置",
        "美丽喵 设计视觉：猫咪主题配色、动效规范",
        "薯你最红喵 写文案：专业有趣的页面内容",
        "平安喵 安全审查：确保没有高危依赖",
        "后台喵 整合交付：可运行的 index.html",
      ],
    },
    speakerNotes:
      "重点：展示我们是真正用产品思维在工作，而不是随意输出内容。有拆解、有设计、有分工、有交付。",
  },
  {
    id: "tech-architecture",
    index: 3,
    type: "architecture",
    title: "技术架构",
    subtitle: "ClawTeam 框架的核心设计",
    description:
      "ClawTeam 是一个框架无关的多智能体协调 CLI。通过文件队列、任务图和 Git Worktree 隔离，让多个 AI 能真正并行工作。",
    layers: [
      {
        name: "协调层",
        icon: "🔗",
        color: "#6366f1",
        components: [
          { name: "Task Board", desc: "共享任务图：优先级、依赖、状态追踪" },
          { name: "Inbox", desc: "文件队列消息系统：Agent 间异步通信" },
          { name: "Lifecycle", desc: "Agent 生命周期：idle/active/shutdown" },
        ],
      },
      {
        name: "执行层",
        icon: "⚙️",
        color: "#10b981",
        components: [
          { name: "Spawn Backend", desc: "tmux / subprocess 双后端，按需选择" },
          { name: "Git Worktree", desc: "每个 Agent 独立工作区，代码不冲突" },
          { name: "Profile System", desc: "可复用的 provider 配置，支持多模型" },
        ],
      },
      {
        name: "观测层",
        icon: "📊",
        color: "#f59e0b",
        components: [
          { name: "Board TUI", desc: "实时看板：kanban + inbox + 消息历史" },
          { name: "Context Tools", desc: "Git diff/conflicts 检查，安全交接" },
          { name: "Cost Report", desc: "Token 用量追踪，成本透明化" },
        ],
      },
    ],
    highlights: [
      { metric: "6+", label: "支持的 CLI Agent" },
      { metric: "3", label: "核心设计层次" },
      { metric: "∞", label: "可扩展的团队规模" },
    ],
    speakerNotes:
      "技术重点：文件队列保证原子性（tmp+rename），Git Worktree 保证并行安全，Profile 系统让模型切换无感。",
  },
  {
    id: "project-showcase",
    index: 4,
    type: "showcase",
    title: "项目成果",
    subtitle: "我们构建的不只是代码",
    description: "从框架设计到团队协作，从 Discord 桥接到面试展示网站，猫猫们交付了完整的产品闭环。",
    projects: [
      {
        icon: "🐱",
        title: "ClawTeam 框架",
        status: "shipped",
        desc: "多智能体协调 CLI，支持 6+ AI 客户端，三层架构设计，pip 可安装。",
        tech: ["Python", "tmux", "Git Worktree", "File Queue"],
        link: "https://github.com/HKUDS/ClawTeam",
      },
      {
        icon: "💬",
        title: "Discord 桥接",
        status: "shipped",
        desc: "实时连接 Discord 与 ClawTeam，支持点名猫咪、旁听模式、Webhook 独立头像。",
        tech: ["discord.py", "asyncio", "aiohttp"],
        link: null,
      },
      {
        icon: "📺",
        title: "PPT 展示网站",
        status: "in-progress",
        desc: "本网站：6 页幻灯片，键盘导航，全屏模式，猫咪主题视觉，为面试量身打造。",
        tech: ["Reveal.js / HTML", "CSS", "JavaScript"],
        link: null,
      },
      {
        icon: "📝",
        title: "小红书内容矩阵",
        status: "planned",
        desc: "薯你最红喵操刀：技术科普 + 产品故事 + 互动话题，让 ClawTeam 被更多人看见。",
        tech: ["文案策划", "话题标签", "内容运营"],
        link: null,
      },
    ],
    speakerNotes:
      "展示团队的交付能力——不是 demo，是真正可用的产品。ClawTeam 已开源，Discord 桥接已部署，PPT 网站正在当场演示。",
  },
  {
    id: "summary",
    index: 5,
    type: "summary",
    title: "我们能做什么",
    subtitle: "找我们，就是找一整支团队",
    description:
      "猫猫拯救天团不只是 AI 演示——它是一个真实运转的多智能体协作范式。每只猫都有自己的身份、专长和责任感。",
    strengths: [
      {
        icon: "🧠",
        title: "产品思维驱动",
        body: "从需求拆解到交付，每步都有对应角色负责，不是随机输出。",
      },
      {
        icon: "🔒",
        title: "安全优先",
        body: "平安喵把关所有高危操作，接口有鉴权，数据有验证。",
      },
      {
        icon: "⚡",
        title: "真实并行",
        body: "Git Worktree 隔离 + 任务图调度，多 Agent 真正同时工作不冲突。",
      },
      {
        icon: "📦",
        title: "开箱即用",
        body: "pip install clawteam，三步命令，一整支团队运转起来。",
      },
    ],
    contactInfo: {
      github: "https://github.com/HKUDS/ClawTeam",
      email: null,
      discord: "猫猫团队公开服务器（即将上线）",
    },
    callToAction: "pip install clawteam",
    closingLine: "喵喵喵——感谢聆听，我们随时可以接需求 🐾",
    speakerNotes:
      "收尾：强调这是真实可运行的系统，不是 PPT 概念。邀请面试官现场试用 ClawTeam，展示真实的多智能体协作。",
  },
];

export const getSlideById = (id) =>
  SLIDES.find((s) => s.id === id) ?? null;

export const getSlideByIndex = (index) =>
  SLIDES.find((s) => s.index === index) ?? null;

export const getTotalSlides = () => SLIDES.length;
