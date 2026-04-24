# 技术选型 & 架构方案 — 猫猫拯救世界 PPT 演示站

作者：架构喵 (jia-gou-miao)  
版本：v1.0  
日期：2026-04-23

---

## 一、技术选型

### 结论：Reveal.js（CDN 引入）+ 自定义 CSS 主题

| 方案 | 优点 | 缺点 | 适合场景 |
|------|------|------|----------|
| **Reveal.js（选定）** | 键盘导航、演讲者注记、PDF 导出、响应式缩放、成熟生态 | 需加载 CDN（~200KB） | 面试展示、产品演示 |
| 纯 HTML/CSS/JS | 零依赖、完全掌控 | 需手搓翻页逻辑、动画、全屏 | 超简单原型 |
| React 路由集成 | 复用构建链 | 混入主站关注点，部署耦合 | 长期产品 |

**选 Reveal.js 的核心理由**：
1. 面试现场靠箭头键翻页，Reveal.js 开箱即用
2. `?print-pdf` URL 参数可直接导出 PDF 备用
3. CDN 引入，不额外增加 npm 依赖，独立目录，不影响主站
4. 演讲者模式（`S` 键）供自己看提示词

---

## 二、幻灯片 6 页结构

```
Slide 1  封面         → 团队名 + 口号 + 角色列表
Slide 2  团队成员     → 每位猫猫的身份 / 技能 / 性格
Slide 3  产品思维     → 问题 → 洞察 → 方案 → 价值
Slide 4  技术架构     → 技术栈选型 + 分层架构图 + 决策理由
Slide 5  项目展示     → 核心功能 + 演示截图 + 数据亮点
Slide 6  总结 & Q&A  → 关键收获 + 联系方式 + CTA
```

---

## 三、文件结构

```
presentation/
├── index.html           ← 主入口，所有 slides 内联（单文件部署）
├── css/
│   └── theme.css        ← 自定义主题（美丽喵负责）
├── js/
│   └── slides.js        ← 自定义动画 / 计数器 / 交互（可选）
└── assets/
    └── images/
        ├── logo.png
        └── members/     ← 各角色头像
```

> **单文件原则**：优先将 slides 内容内联在 index.html，避免路径问题。CDN 地址见下。

---

## 四、CSS 设计 Token 契约（美丽喵对接）

```css
:root {
  /* 品牌色 */
  --color-primary:   #FF6B35;   /* 橙——活力 */
  --color-secondary: #4A90D9;   /* 蓝——技术 */
  --color-accent:    #F7C948;   /* 金——品质 */
  --color-dark:      #1A1A2E;   /* 深色背景 */
  --color-surface:   #16213E;   /* slide 背景 */
  --color-text:      #E8E8E8;   /* 主文字 */

  /* 字体 */
  --font-heading: 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif;
  --font-body:    'Noto Sans SC', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* 间距 */
  --slide-padding: 3.5rem;
  --card-radius:   1rem;
  --card-gap:      1.5rem;
}
```

**美丽喵只需修改 `css/theme.css`，不动 index.html 骨架。**

---

## 五、内容数据 JSON 契约（薯你最红喵对接）

薯你最红喵写好内容后，填入 `presentation/index.html` 对应占位区域，或提供 JSON，后台喵（若有动态化需求）读取。

### 成员数据格式

```json
{
  "members": [
    {
      "id": "zong-cai-miao",
      "name": "总裁喵",
      "role": "产品负责人 / 总协调",
      "emoji": "👔",
      "skills": ["产品规划", "团队协调", "决策"],
      "personality": "运筹帷幄，统揽全局"
    }
  ]
}
```

### 幻灯片内容格式

```json
{
  "slides": [
    {
      "id": "cover",
      "teamName": "猫猫拯救世界",
      "tagline": "AI 多智能体协作，从 0 到 1",
      "subtitle": "ClawTeam — 让任何 AI Agent 组队工作"
    },
    {
      "id": "product-thinking",
      "problem": "AI 工具各自孤立，无法协同",
      "insight": "团队协作才是 AI 生产力的下一个突破口",
      "solution": "统一调度层 + 共享任务板 + 跨 Agent 消息总线",
      "metrics": ["任务并行度提升 3x", "返工率降低 60%"]
    }
  ]
}
```

---

## 六、CDN 地址（固定版本，防止漂移）

```html
<!-- Reveal.js 5.1.0 -->
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css"/>
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/black.css"
  id="theme"/>
<script
  src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
```

**后台喵注意**：演示当天若无网络，把 Reveal.js 下载到 `presentation/vendor/` 并修改引用路径。

---

## 七、接口契约 & 模块边界（架构喵监管）

```
┌─────────────────────────────────────┐
│         index.html (入口)           │  ← 骨架、Reveal.js 初始化
├────────────┬────────────────────────┤
│ css/theme  │  js/slides.js          │  ← 美丽喵 / 后台喵
├────────────┴────────────────────────┤
│        assets/images/               │  ← 美丽喵提供图片
└─────────────────────────────────────┘
       ↑ 内容填充：薯你最红喵
```

**边界规则**：
- 美丽喵：只改 `css/theme.css`，CSS token 定义见第四节
- 薯你最红喵：只填 slide 区域的文案，不动样式 / 脚本
- 后台喵：如需服务化，提供 `GET /api/slides` JSON API，格式见第五节
- 平安喵：检查外部 CDN 的 SRI hash，确保供应链安全

---

## 八、高危命令说明

> 所有涉及生产环境的部署、强推、删分支等高危操作，**统一走平安喵审批流程**，禁止自行 `git push --force` 或 `rm -rf`。

---

## 九、Reveal.js 初始化配置参考

```js
Reveal.initialize({
  hash: true,           // URL #/slide 号，方便分享特定页
  slideNumber: 'c/t',  // 显示 "当前/总数"
  transition: 'fade',  // 淡入淡出，专业感强
  backgroundTransition: 'fade',
  controls: true,
  progress: true,
  center: true,
  plugins: []
});
```

---

架构喵出品，如有疑问 inbox 找我。喵～
