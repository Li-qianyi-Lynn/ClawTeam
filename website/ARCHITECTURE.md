# 猫猫天团介绍网站 — 架构文档

## 技术选型

| 层次 | 技术 |
|------|------|
| 框架 | React 18 (Hooks) |
| 构建工具 | Vite |
| 样式 | CSS Variables + CSS Modules（与现有网站统一；可无缝迁移到 TailwindCSS） |
| 路由 | 单页应用，无 Router，页面级组件直接渲染 |

> **注意**：当前项目尚未安装 Node，样式采用与现有 `styles.css` 同体系的 CSS Variables。若需启用 TailwindCSS，执行：
> ```
> npm install -D tailwindcss postcss autoprefixer
> npx tailwindcss init -p
> ```
> 并在 `vite.config.mjs` 的 `plugins` 中加入 `tailwind()`。

---

## 目录结构

```
website/
├── index.html
├── vite.config.mjs
├── ARCHITECTURE.md          ← 本文档
└── src/
    ├── main.jsx              ← React 入口，挂载 App
    ├── App.jsx               ← 主应用，含路由或区域切换
    ├── styles.css            ← 全局 CSS 变量 & 重置
    ├── team.css              ← 猫猫天团专属样式
    └── components/
        └── team/
            ├── TeamPage.jsx          ← 猫猫天团页面顶层容器
            ├── HeroSection.jsx       ← Hero区：Slogan + 动画
            ├── CatCard.jsx           ← 单只猫的个人卡片
            ├── CatCardsSection.jsx   ← 六只猫卡片区（Grid）
            ├── TeamCapabilities.jsx  ← 团队能力展示区
            └── TeamFooter.jsx        ← Footer
```

---

## 组件树

```
<TeamPage>
  ├── <HeroSection>
  │     ├── 团队标志动画（CSS keyframe pulse/float）
  │     ├── 主 Slogan：猫猫天团，爪到擒来
  │     └── 副 Slogan + CTA 按钮
  │
  ├── <CatCardsSection>
  │     └── <CatCard> × 6
  │           ├── <img> 头像（来自 examples/avatars/）
  │           ├── 名字 + ID
  │           ├── 角色标签
  │           └── 简介文字
  │
  ├── <TeamCapabilities>
  │     └── <CapabilityItem> × N
  │           ├── 图标（SVG inline）
  │           ├── 能力标题
  │           └── 说明文字
  │
  └── <TeamFooter>
        ├── 团队名称 & 版权
        └── 链接导航
```

---

## 数据模型

### CatMember

```js
{
  id: string,           // e.g. "zong-cai-miao"
  name: string,         // 显示名，e.g. "总裁喵"
  role: string,         // 角色，e.g. "首席执行官"
  emoji: string,        // 装饰 emoji，e.g. "👑"
  avatar: string,       // import 路径，e.g. avatarZongCai
  bio: string,          // 一句话介绍
  tags: string[],       // 技能标签，e.g. ["领导", "战略", "决策"]
  color: string,        // 卡片主题色，CSS 变量或 hex
}
```

### TeamCapability

```js
{
  icon: ReactComponent, // SVG icon 组件
  title: string,        // 能力标题
  description: string,  // 说明文字
}
```

---

## 六只猫成员数据

| ID | 名字 | 角色 | 主题色 |
|----|------|------|--------|
| zong-cai-miao | 总裁喵 | 团队领袖 & 首席协调官 | #f97316（橙）|
| jia-gou-miao | 架构喵 | 系统架构师 | #6366f1（靛）|
| hou-tai-miao | 后台喵 | 后端工程师 | #22c55e（绿）|
| mei-li-miao | 美丽喵 | UI/UX 设计师 | #ec4899（粉）|
| ping-an-miao | 平安喵 | 安全工程师 | #3b82f6（蓝）|
| shu-ni-hong | 数你红 | 数据分析师 | #a855f7（紫）|

---

## 页面规划

### 1. Hero 区（HeroSection）
- **背景**：深色渐变 + 粒子/爪印动画（CSS keyframe）
- **内容**：大标题 "猫猫天团" + 副标题 Slogan + CTA 按钮
- **动画**：标题淡入上移；logo 持续浮动

### 2. 六只猫卡片区（CatCardsSection）
- **布局**：CSS Grid，3列（桌面）→ 2列（平板）→ 1列（手机）
- **卡片元素**：圆形头像、名字、角色徽章、简介、技能标签
- **交互**：hover 上移 + 阴影加深

### 3. 团队能力展示区（TeamCapabilities）
- **布局**：3列 Feature Grid
- **能力项**：任务调度、多模型协作、安全审计、前端设计、数据分析、架构规划
- **图标**：SVG inline，统一 18×18

### 4. Footer（TeamFooter）
- 团队名称 & 版权年份
- GitHub / 文档 链接

---

## 样式约定

- 使用与现有 `styles.css` 相同的 CSS Variables（`--bg`, `--surface`, `--accent` 等）
- 猫猫天团专属变量定义在 `team.css`
- 响应式断点：`768px`（平板）/ `480px`（手机）
- 动画：prefer-reduced-motion 兼容

---

## 构建 & 部署

```
# 构建（输出到 /docs）
npm run build

# 本地预览
npm run preview

# 开发
npm run dev
```

静态文件输出至 `../docs/`，可直接由 GitHub Pages 托管。
