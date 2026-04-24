/**
 * 猫猫拯救天团 — Team Member Data
 * 后台喵 data layer: authoritative source for all team member records.
 */

export const TEAM_ID = "my-maomao";
export const TEAM_NAME = "猫猫拯救天团";
export const TEAM_SLOGAN = "从技术到产品，我们用爪子改变世界";

export const TEAM_MEMBERS = [
  {
    id: "zong-cai-miao",
    name: "总裁喵",
    nameEn: "CEO Cat",
    breed: "梨花猫",
    breedEn: "Pear Blossom Cat",
    role: "Team Lead · Task Planner · Progress Coordinator",
    roleZh: "领队 · 任务拆解 · 进度协调",
    emoji: "👑",
    color: "#f59e0b",
    colorDark: "#d97706",
    avatar: "/avatars/zong-cai-miao.png",
    personality: "运筹帷幄，稳坐中军。把复杂项目拆成可执行的节点，确保每只猫都在正确的轨道上。",
    skills: ["项目管理", "团队协调", "需求拆解", "进度把控"],
    badge: "领队",
  },
  {
    id: "mei-li-miao",
    name: "美丽喵",
    nameEn: "Beauty Cat",
    breed: "布偶猫",
    breedEn: "Ragdoll Cat",
    role: "Frontend · UI/UX · Components",
    roleZh: "前端 · UI/UX · 组件",
    emoji: "✨",
    color: "#ec4899",
    colorDark: "#db2777",
    avatar: "/avatars/mei-li-miao.png",
    personality: "像素级完美主义者。从配色到交互，每一帧都经过精心设计，让界面优雅得令人屏息。",
    skills: ["UI/UX设计", "React", "CSS动效", "设计系统"],
    badge: "前端",
  },
  {
    id: "hou-tai-miao",
    name: "后台喵",
    nameEn: "Backend Cat",
    breed: "三花猫",
    breedEn: "Calico Cat",
    role: "Backend · API · Database",
    roleZh: "后端 · API · 数据库",
    emoji: "⚙️",
    color: "#10b981",
    colorDark: "#059669",
    avatar: "/avatars/hou-tai-miao.png",
    personality: "接口要稳、边界要清、日志可读。拒绝「差不多行了」——后台不背锅，数据有保证。",
    skills: ["API设计", "数据库", "性能优化", "鉴权安全"],
    badge: "后端",
  },
  {
    id: "jia-gou-miao",
    name: "架构喵",
    nameEn: "Architect Cat",
    breed: "奶牛猫",
    breedEn: "Tuxedo Cat",
    role: "Architecture · Interface Contracts · Tech Stack",
    roleZh: "架构 · 接口契约 · 技术选型",
    emoji: "🏗️",
    color: "#6366f1",
    colorDark: "#4f46e5",
    avatar: "/avatars/jia-gou-miao.png",
    personality: "系统全局思维，提前预见瓶颈。制定接口契约，让每个模块都清楚边界，协作无摩擦。",
    skills: ["系统设计", "技术选型", "接口契约", "架构评审"],
    badge: "架构",
  },
  {
    id: "ping-an-miao",
    name: "平安喵",
    nameEn: "Safety Cat",
    breed: "大橘猫",
    breedEn: "Big Orange Cat",
    role: "Security Review · Dangerous Command Gatekeeper",
    roleZh: "安全审查 · 高危命令把关",
    emoji: "🛡️",
    color: "#f97316",
    colorDark: "#ea580c",
    avatar: "/avatars/ping-an-miao.png",
    personality: "所有高危操作都先过我这一关。curl|bash？不行。来路不明脚本？先查哈希。安全第一。",
    skills: ["安全审计", "漏洞分析", "权限管控", "密钥管理"],
    badge: "安全",
  },
  {
    id: "shu-ni-hong",
    name: "薯你最红喵",
    nameEn: "XHS Copywriter Cat",
    breed: "金渐层",
    breedEn: "Golden Gradient Cat",
    role: "Copywriting · Hashtags · Content",
    roleZh: "小红书文案 · 话题标签 · 内容",
    emoji: "📝",
    color: "#ef4444",
    colorDark: "#dc2626",
    avatar: "/avatars/shu-ni-hong.png",
    personality: "让技术说人话，让产品被看见。文案既专业又有趣，数据、故事、情绪一个都不少。",
    skills: ["内容策划", "文案创作", "话题运营", "用户洞察"],
    badge: "内容",
  },
];

export const getMemberById = (id) =>
  TEAM_MEMBERS.find((m) => m.id === id) ?? null;

export const getMembersByBadge = (badge) =>
  TEAM_MEMBERS.filter((m) => m.badge === badge);
