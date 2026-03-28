// 猫猫天团成员数据
import avatarZongCai from "../../../../examples/avatars/cat_avatar_zong-cai-miao.png";
import avatarJiaGou from "../../../../examples/avatars/cat_avatar_jia-gou-miao.png";
import avatarHouTai from "../../../../examples/avatars/cat_avatar_hou-tai-miao.png";
import avatarMeiLi from "../../../../examples/avatars/cat_avatar_mei-li-miao.png";
import avatarPingAn from "../../../../examples/avatars/cat_avatar_ping-an-miao.png";
import avatarShuNi from "../../../../examples/avatars/cat_avatar_shu-ni-hong.png";

export const CAT_MEMBERS = [
  {
    id: "zong-cai-miao",
    name: "总裁喵",
    role: "团队领袖 · 首席协调官",
    emoji: "👑",
    avatar: avatarZongCai,
    bio: "掌控全局，爪到擒来。负责团队战略规划与任务协调，确保每只猫都能发挥最大战斗力。",
    tags: ["领导", "战略", "协调"],
    color: "#f97316",
  },
  {
    id: "jia-gou-miao",
    name: "架构喵",
    role: "系统架构师",
    emoji: "🏗️",
    avatar: avatarJiaGou,
    bio: "奶牛花纹，思维缜密。设计系统蓝图，搭建稳固的技术骨架，让代码优雅地流动。",
    tags: ["架构设计", "React", "系统规划"],
    color: "#6366f1",
  },
  {
    id: "hou-tai-miao",
    name: "后台喵",
    role: "后端工程师",
    emoji: "⚙️",
    avatar: avatarHouTai,
    bio: "默默耕耘在服务器的深处，用 API 和数据库构筑起整个系统的心脏。",
    tags: ["Python", "API", "数据库"],
    color: "#22c55e",
  },
  {
    id: "mei-li-miao",
    name: "美丽喵",
    role: "UI/UX 设计师",
    emoji: "✨",
    avatar: avatarMeiLi,
    bio: "把美丽变成像素。将创意与审美融入每一个界面，让用户爱上每一次交互。",
    tags: ["UI设计", "动画", "用户体验"],
    color: "#ec4899",
  },
  {
    id: "ping-an-miao",
    name: "平安喵",
    role: "安全工程师",
    emoji: "🔒",
    avatar: avatarPingAn,
    bio: "守护系统安全的铁壁。代码审查、漏洞扫描、高危命令先审后跑，一只都不能少。",
    tags: ["安全审计", "漏洞扫描", "代码审查"],
    color: "#3b82f6",
  },
  {
    id: "shu-ni-hong",
    name: "数你红",
    role: "数据分析师",
    emoji: "📊",
    avatar: avatarShuNi,
    bio: "数据就是猫粮。从海量日志中挖掘洞察，用图表说话，让决策有据可依。",
    tags: ["数据分析", "可视化", "监控"],
    color: "#a855f7",
  },
];

export const TEAM_CAPABILITIES = [
  {
    iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    title: "智能任务调度",
    description: "共享任务看板，自动分配优先级与所有权，实时追踪每只猫的进度。",
  },
  {
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "多模型协作",
    description: "Claude、Codex、Gemini 等多种 AI 模型无缝协同，各取所长，共同完成复杂任务。",
  },
  {
    iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "安全审计防线",
    description: "高危命令先审后跑，代码安全扫描，保障系统在猫爪之下稳定运行。",
  },
  {
    iconPath: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    title: "前端设计引擎",
    description: "从架构到像素，快速产出高质量 React 组件和视觉设计，美观与性能兼顾。",
  },
  {
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "数据驱动决策",
    description: "实时成本监控、Token 统计、任务分析，让每一分资源都花在刀刃上。",
  },
  {
    iconPath: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    title: "持久化协调",
    description: "跨 session 的状态持久化，消息收件箱，确保团队沟通与任务交接零丢失。",
  },
];
