# team-intro 模块架构文档

> 产品经理 Present 版猫猫天团介绍页  
> 作者：架构喵 (jia-gou-miao) · 2026-04-23

---

## 设计目标

本模块是面向**产品经理面试 present** 场景的独立介绍页。核心取向：

- **产品思维优先**：以用户痛点 → 解法 → 量化指标的叙事线贯穿页面
- **技术栈轻提**：技术选型只说"做什么"和"为什么选"，不展示代码细节
- **自包含模块**：与现有 `components/team/` 并列存在，互不干扰

---

## 目录结构

```
website/src/team-intro/
├── index.js                        ← 桶导出（barrel export）
├── TeamIntroPage.jsx               ← 页面根组件
├── team-intro.css                  ← 模块专属样式（ti- 前缀）
├── data.js                         ← 统一数据层（无副作用）
├── TEAM_INTRO_ARCHITECTURE.md      ← 本文档
└── components/
    ├── IntroNav.jsx                ← 顶部导航（锚点链接）
    ├── IntroHero.jsx               ← Hero 区（品牌 + 核心指标 + CTA）
    ├── TeamSection.jsx             ← 团队介绍区（6 成员卡片 Grid）
    ├── MemberCard.jsx              ← 单成员卡片（原子组件）
    ├── ProductThinkingSection.jsx  ← 产品思维展示（痛点对照 + 价值卡片）
    ├── CollaborationSection.jsx    ← 协作流程（横向步骤流）
    ├── TechStackSection.jsx        ← 技术栈简述（3列 Grid）
    └── IntroFooter.jsx             ← Footer（动态年份 + 链接）
```

---

## 组件树

```
<TeamIntroPage>
  ├── <IntroNav />
  │     └── 锚点链接：#team | #product | #workflow | #techstack
  │
  ├── <main>
  │   ├── <IntroHero />
  │   │     ├── 品牌 Logo 动画（CSS float keyframe）
  │   │     ├── 主标题 "猫猫天团 · ClawTeam"
  │   │     ├── 价值主张副标题
  │   │     ├── <MetricsBand />（6 Agent / 10× 并行 / 100% 安全覆盖）
  │   │     └── CTA 按钮组（认识团队 / 产品思维）
  │   │
  │   ├── <TeamSection />
  │   │     └── <MemberCard /> × 6
  │   │           ├── 圆形头像 + emoji 徽章
  │   │           ├── 名字 + 角色（--ti-member-color 主题色）
  │   │           ├── 简介文字
  │   │           └── 技能标签列表
  │   │
  │   ├── <ProductThinkingSection />
  │   │     ├── 痛点 vs 解法对照表（PainRow × 4）
  │   │     │     └── [痛点badge | 过渡icon | 解法badge]
  │   │     └── 产品价值卡片 Grid（ProductValueCard × 6）
  │   │           ├── icon emoji
  │   │           ├── 标题（量化指标在副标题）
  │   │           └── 说明文字
  │   │
  │   ├── <CollaborationSection />
  │   │     └── 步骤流 ol（WorkflowStep × 5）
  │   │           ├── 序号圆圈
  │   │           ├── 连接线（CSS，最后一步不渲染）
  │   │           ├── 执行角色（emoji + 名称）
  │   │           ├── 步骤标题 + 说明
  │   │           └── 输出物徽章
  │   │
  │   └── <TechStackSection />
  │         └── 技术卡片 Grid（TechCard × 6）
  │               ├── emoji + 名称 + 分类
  │               └── dl：做什么 / 为什么选
  │
  └── <IntroFooter />
        ├── 品牌名 & 版权（动态年份）
        └── GitHub / 回到顶部
```

---

## 数据模型

### TeamMember

```ts
interface TeamMember {
  id: string;        // 唯一键，e.g. "zong-cai-miao"
  name: string;      // 中文名
  role: string;      // 角色描述
  emoji: string;     // 角色 emoji
  avatar: string;    // 图片 URL（public/avatars/）
  bio: string;       // 一句话简介（≤ 60 字）
  tags: string[];    // 技能标签（2–4 个）
  color: string;     // 主题色 hex，注入 --ti-member-color
}
```

### ProductValue（产品价值卡片）

```ts
interface ProductValue {
  id: string;
  icon: string;         // emoji
  title: string;        // 标题（≤ 10 字）
  metric: string;       // 量化指标（e.g. "10× 并行提速"）
  description: string;  // 说明（≤ 60 字）
  highlight: boolean;   // 是否高亮首选卡片
}
```

### PainPoint（痛点对照）

```ts
interface PainPoint {
  id: string;
  pain: string;      // 用户痛点
  solution: string;  // 猫猫天团解法
  icon: string;      // 过渡图标（emoji 表达前→后状态）
}
```

### WorkflowStep（协作流程）

```ts
interface WorkflowStep {
  id: string;
  step: number;         // 序号 1–5
  label: string;        // 步骤名称
  actor: string;        // 执行角色名
  actorEmoji: string;   // 角色 emoji
  description: string;  // 步骤说明（≤ 60 字）
  outputLabel: string;  // 输出物名称
}
```

### TechStackItem（技术栈）

```ts
interface TechStackItem {
  id: string;
  name: string;      // 技术名称
  category: string;  // 分类（前端 / 后端 / AI 模型 …）
  what: string;      // 做什么（≤ 20 字）
  why: string;       // 为什么选（≤ 20 字）
  emoji: string;     // 代表 emoji
}
```

---

## 数据流

```
data.js
  ├── TEAM_MEMBERS      ──→ TeamSection ──→ MemberCard × 6
  ├── PRODUCT_VALUES    ──→ ProductThinkingSection（价值卡片）
  ├── PAIN_POINTS       ──→ ProductThinkingSection（痛点对照）
  ├── WORKFLOW_STEPS    ──→ CollaborationSection
  └── TECH_STACK        ──→ TechStackSection

TeamIntroPage（无 Props）
  → 所有数据由叶子组件从 data.js 直接导入
  → 无全局 state，无 Context，无副作用
```

---

## 样式约定

| 前缀 | 归属 | 说明 |
|------|------|------|
| `ti-` | team-intro.css | 本模块专属，与主站 `team-` 隔离 |
| `--ti-*` | .ti-page 根节点 | CSS 变量作用域限定在 `.ti-page` 内 |
| `--ti-member-color` | MemberCard 内联 | 每卡片动态注入，无全局污染 |

响应式断点：`1024px` / `768px` / `480px`  
动画：全部兼容 `prefers-reduced-motion: reduce`

---

## 接入方式

```jsx
// App.jsx 中接入
import TeamIntroPage from "./team-intro/index.js";
import "./team-intro/team-intro.css";

// 根据路由或 props 渲染
<TeamIntroPage />
```

也可直接在 `main.jsx` 替换当前的 `<App />` 做独立部署预览。

---

## 扩展约定

| 扩展点 | 操作 |
|--------|------|
| 新增成员 | 在 `data.js` `TEAM_MEMBERS` 末尾追加，头像放 `public/avatars/` |
| 新增产品价值 | 追加 `PRODUCT_VALUES` 条目，Grid 自适应 |
| 调整流程步骤 | 修改 `WORKFLOW_STEPS`，连接线自动计算最后一步 |
| 主题色切换 | 修改 `.ti-page` 中的 CSS 变量，组件无需改动 |
