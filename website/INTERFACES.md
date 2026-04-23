# 模块划分与接口约定

> 本文档是 ARCHITECTURE.md 的补充，定义各模块的边界、Props 契约、数据流与样式约定。

---

## 1. 模块边界

```
website/src/
├── main.jsx                  # 挂载层（不含业务逻辑）
├── App.jsx                   # 路由/视图切换（入口层）
├── styles.css                # 全局基础样式（不可组件专用）
├── team.css                  # 猫猫天团模块样式（与主站隔离）
└── components/
    └── team/                 # 猫猫天团模块（自包含）
        ├── data.js           # 纯数据层（无副作用）
        ├── TeamPage.jsx      # 模块根节点
        ├── HeroSection.jsx   # 展示组件
        ├── CatCardsSection.jsx # 展示组件
        ├── CatCard.jsx       # 原子展示组件
        ├── TeamCapabilities.jsx # 展示组件
        └── TeamFooter.jsx    # 展示组件
```

**约束：**
- `components/team/` 模块仅从 `data.js` 和 React 自身导入，不依赖外部 store 或 context。
- `data.js` 是唯一的数据源，所有头像 import 集中于此。
- 样式类名以 `team-`、`cat-` 前缀区分，避免与主站冲突。

---

## 2. Props 接口契约

### `<TeamPage />`

无 Props。顶层容器，自行从 `data.js` 读取数据。

```ts
// 无 Props
```

---

### `<HeroSection />`

无 Props。内容硬编码为猫猫天团 Slogan，如需国际化可传入 `locale` prop。

```ts
// 无 Props（内容静态）
```

---

### `<CatCardsSection />`

无 Props。内部从 `data.js` 读取 `CAT_MEMBERS`。

```ts
// 无 Props
```

---

### `<CatCard member={} />`

```ts
interface CatMember {
  id: string;          // 唯一标识，用作 React key
  name: string;        // 中文名，如 "总裁喵"
  role: string;        // 角色描述，如 "团队领袖 · 首席协调官"
  emoji: string;       // 角色 emoji，叠加在头像右下角
  avatar: string;      // 图片 URL（由 Vite 处理的 import）
  bio: string;         // 一句话简介（建议 ≤ 60 字）
  tags: string[];      // 技能标签（建议 2-4 个）
  color: string;       // CSS 主题色值（hex 或 CSS 变量），注入 --cat-color
}

Props: { member: CatMember }
```

---

### `<TeamCapabilities />`

无 Props。内部从 `data.js` 读取 `TEAM_CAPABILITIES`。

```ts
// 无 Props
```

---

### `<TeamFooter />`

无 Props。年份由 `new Date().getFullYear()` 动态生成。

```ts
// 无 Props
```

---

## 3. 数据层接口（data.js）

```ts
// 导出类型
export const CAT_MEMBERS: CatMember[];         // 六只猫，顺序即展示顺序
export const TEAM_CAPABILITIES: TeamCapability[];

interface TeamCapability {
  iconPath: string;    // SVG <path d="..."> 字符串
  title: string;       // 标题（≤ 10 字）
  description: string; // 说明（≤ 60 字）
}
```

---

## 4. CSS 自定义属性约定

| 变量名 | 所属文件 | 用途 |
|--------|----------|------|
| `--cat-color` | 内联（CatCard） | 单卡片主题色，由 `member.color` 注入 |
| `--team-radius` | team.css | 猫猫天团卡片圆角 |
| `--team-card-bg` | team.css | 卡片背景色 |
| `--team-card-border` | team.css | 卡片默认边框色 |
| `--team-section-gap` | team.css | section 上下 padding |
| `--bg`, `--accent`, `--text-*` | styles.css | 继承自主站全局变量 |

**规则：** `team.css` 中的变量只在 `.team-page` 子树内生效（通过选择器限定），不污染主站。

---

## 5. 数据流图

```
data.js
  ├── CAT_MEMBERS ──→ CatCardsSection ──→ CatCard × 6
  └── TEAM_CAPABILITIES ──→ TeamCapabilities

TeamPage
  ├── HeroSection       (静态内容)
  ├── CatCardsSection   (消费 CAT_MEMBERS)
  ├── TeamCapabilities  (消费 TEAM_CAPABILITIES)
  └── TeamFooter        (静态内容 + 动态年份)
```

无双向数据流，无全局状态，无副作用（除 `new Date()` 外）。

---

## 6. 扩展约定

### 新增成员
在 `data.js` 的 `CAT_MEMBERS` 数组末尾追加一个 `CatMember` 对象，并将头像 PNG 放入 `examples/avatars/`，`import` 语句加到 `data.js` 顶部。无需修改任何组件。

### 新增能力项
在 `data.js` 的 `TEAM_CAPABILITIES` 数组追加 `TeamCapability` 对象。Grid 自动适配。

### 样式主题切换
修改 `team.css` 中的 CSS 变量值，或在 `:root[data-theme="light"]` 选择器下覆盖，无需改动 JSX。

### 迁移到 TailwindCSS
1. `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
2. 将 `team.css` 中的规则逐一替换为 Tailwind utility 类名（写入各组件的 `className`）
3. 删除 `team.css`；`--cat-color` 内联样式保持不变（Tailwind 不处理动态色）

---

---

## 7. team-intro 模块接口（新增，产品 Present 版）

> 详细文档见 `src/team-intro/TEAM_INTRO_ARCHITECTURE.md`

```
website/src/team-intro/          # 自包含模块，CSS 前缀 ti-
├── index.js                     # export default TeamIntroPage
├── TeamIntroPage.jsx            # 页面根组件（无 Props）
├── team-intro.css               # 模块样式（.ti-page 作用域）
├── data.js                      # 统一数据层
└── components/
    ├── IntroNav.jsx             # 无 Props
    ├── IntroHero.jsx            # 无 Props
    ├── TeamSection.jsx          # 无 Props，消费 TEAM_MEMBERS
    ├── MemberCard.jsx           # Props: { member: TeamMember }
    ├── ProductThinkingSection.jsx # 无 Props，消费 PRODUCT_VALUES + PAIN_POINTS
    ├── CollaborationSection.jsx # 无 Props，消费 WORKFLOW_STEPS
    ├── TechStackSection.jsx     # 无 Props，消费 TECH_STACK
    └── IntroFooter.jsx          # 无 Props
```

**数据导出（data.js）：**

| 导出名 | 类型 | 消费方 |
|--------|------|--------|
| `TEAM_MEMBERS` | `TeamMember[]` | TeamSection → MemberCard |
| `PRODUCT_VALUES` | `ProductValue[]` | ProductThinkingSection |
| `PAIN_POINTS` | `PainPoint[]` | ProductThinkingSection |
| `WORKFLOW_STEPS` | `WorkflowStep[]` | CollaborationSection |
| `TECH_STACK` | `TechStackItem[]` | TechStackSection |

**模块间约束：**
- `team-intro/` 不导入任何来自 `components/team/` 的内容
- CSS 前缀 `ti-` 与主站 `team-` 严格隔离
- CSS 变量作用域限定在 `.ti-page` 选择器内

---

_文档版本：1.1 · 架构喵 (jia-gou-miao) · 2026-04-23（新增 team-intro 模块接口）_
