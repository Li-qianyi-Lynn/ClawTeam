# 猫猫天团介绍页 安全审查报告

**审查人**: 平安喵 (ping-an-miao)  
**审查日期**: 2026-04-24  
**审查范围**: `website/src/team-intro/` + `website/index.html` + `website/package.json`

---

## 总结

| 等级 | 问题数 | 状态 |
|------|--------|------|
| 严重 (Critical) | 0 | ✅ 无 |
| 高危 (High)     | 1 | ✅ 已修复 |
| 中危 (Medium)   | 2 | ✅ 已修复 |
| 低危 (Low)      | 1 | ✅ 已修复 |
| 信息 (Info)     | 2 | ✅ 已确认 |

---

## 发现的问题及修复

### [HIGH] Vite 开发服务器多个已知 CVE — 已修复

**文件**: `package.json`  
**问题**:  
- `GHSA-p9ff-h696-f583`: Vite ≤6.4.1 开发服务器 WebSocket 任意文件读取 (CWE-200, CWE-306)  
- `GHSA-4w7w-66w2-5vf9`: Vite ≤6.4.1 Optimized Deps `.map` 路径穿越 (CWE-22, CWE-200)  

**风险**: 开发环境文件泄露（生产构建不受影响，但 CI/本地开发受影响）  
**修复**: 将 `vite` 从 `^6.0.11` 升级至 `^6.4.2`，同步升级 `@vitejs/plugin-react` 至 `^4.7.0`，并执行 `npm audit fix` 确认 0 漏洞。

---

### [MEDIUM] CSP 缺少 `form-action` 指令 — 已修复

**文件**: `website/index.html`  
**问题**: CSP 未设置 `form-action`，若页面今后加入表单，表单可提交至任意域。  
**修复**: 在 CSP 中添加 `form-action 'self'`。

---

### [MEDIUM] CSP 缺少 `upgrade-insecure-requests` — 已修复

**文件**: `website/index.html`  
**问题**: 无 `upgrade-insecure-requests` 指令，页面在 HTTP 环境下不会自动将子资源请求升级为 HTTPS。  
**修复**: 在 CSP 中添加 `upgrade-insecure-requests`。

---

### [LOW] `<html lang>` 与内容语言不匹配 — 已修复

**文件**: `website/index.html`  
**问题**: `lang="en"` 但页面内容主要为简体中文，影响屏幕阅读器和搜索引擎正确识别语言。  
**修复**: 改为 `lang="zh-CN"`。

---

## 通过项（无需修复）

### XSS 防护 ✅

- **无 `dangerouslySetInnerHTML`**: 全部 team-intro 组件均未使用危险 DOM 插入接口。
- **纯静态数据**: 所有渲染内容来自 `data.js` 中的硬编码常量，无用户输入路径，无注入风险。
- **CSS Variable 注入安全**: `MemberCard.jsx` 通过 `style={{ "--ti-member-color": color }}` 注入 CSS 变量，color 值均为 `data.js` 中的硬编码十六进制颜色字符串（如 `#f97316`），React 会安全处理 style prop，不存在 CSS 注入。
- **无 `eval` / `new Function`**: 全部源码中未发现动态代码执行。

### CSP 基础配置 ✅

- `object-src 'none'` — 禁止 Flash/Plugin 利用。
- `base-uri 'self'` — 防止 base 标签注入。
- `frame-ancestors 'none'` — 防止点击劫持（Clickjacking）。
- `script-src 'self'` — 无 `'unsafe-eval'`，无 `'unsafe-inline'`（脚本端），阻断内联脚本和动态 eval 攻击。
- `style-src 'unsafe-inline'`: React 使用 `style` prop 渲染内联样式（如成员卡片颜色），当前架构下为必要配置，尚在可接受范围内。

### 外部链接安全 ✅

- `IntroFooter.jsx` 中 GitHub 链接使用 `rel="noreferrer"`，正确防止 `window.opener` 劫持。
- `App.jsx` 中所有外部链接均正确设置 `target="_blank" rel="noreferrer"`。

### 依赖最小化 ✅

- 生产依赖仅 `react` + `react-dom`，攻击面极小。
- 无不必要的第三方库（无 jQuery、无 lodash、无 moment.js 等高风险包）。

### 敏感信息泄露 ✅

- 代码库中无 API Key、密码、私钥、Token 或连接字符串。
- Avatar 路径为相对路径（`/avatars/cat_avatar_*.png`），无外部服务依赖。
- 无 `.env` 文件或敏感配置文件。

---

## 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `website/index.html` | CSP 增加 `form-action 'self'` 和 `upgrade-insecure-requests`；`lang` 改为 `zh-CN` |
| `website/package.json` | `vite` 升级至 `^6.4.2`；`@vitejs/plugin-react` 升级至 `^4.7.0` |
| `website/package-lock.json` | `npm audit fix` 自动更新 |

---

## 后续建议（非阻塞）

1. **CSP nonce 化**: 如果 `style-src 'unsafe-inline'` 在未来被认为风险过高，可通过 Vite 插件在构建时为 `<style>` 标签注入 nonce，消除 `unsafe-inline`。
2. **Subresource Integrity (SRI)**: 若未来引入 Google Fonts 等 CDN 字体，建议添加 `integrity` 属性验证资源完整性。
3. **依赖定期扫描**: 建议将 `npm audit` 加入 CI Pipeline，每次构建自动检查。
