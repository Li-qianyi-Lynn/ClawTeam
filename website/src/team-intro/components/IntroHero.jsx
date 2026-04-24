/**
 * Hero 区
 * 布局：全屏居中，深色渐变背景
 * 内容：品牌 Logo 动画 → 主标题 → 价值主张副标题 → CTA 按钮组
 * 动画：标题 fadeInUp，logo 持续浮动（CSS keyframe）
 */
export default function IntroHero() {
  return (
    <section className="ti-hero" id="hero">
      {/* 品牌 logo 动画区 */}
      <div className="ti-hero-logo" aria-hidden="true">
        🐾
      </div>

      <span className="ti-hero-badge">✦ Multi-Agent Collaboration ✦</span>

      {/* 主标题 */}
      <h1 className="ti-hero-title">
        <span>猫猫天团</span>
        <span className="ti-hero-title-en">ClawTeam</span>
      </h1>

      {/* 价值主张副标题 */}
      <p className="ti-hero-subtitle">
        多 Agent 并行协作框架 · 让 AI 团队像真实团队一样高效运转
      </p>

      {/* 核心指标摘要（三项关键数字，产品 present 必备） */}
      <div className="ti-hero-metrics">
        <div className="ti-hero-metric">
          <span className="ti-hero-metric-value">6</span>
          <span className="ti-hero-metric-label">专职 Agent</span>
        </div>
        <div className="ti-hero-metric">
          <span className="ti-hero-metric-value">10×</span>
          <span className="ti-hero-metric-label">并行提速</span>
        </div>
        <div className="ti-hero-metric">
          <span className="ti-hero-metric-value">100%</span>
          <span className="ti-hero-metric-label">安全审查覆盖</span>
        </div>
      </div>

      {/* CTA 按钮组 */}
      <div className="ti-hero-cta">
        <a href="#team" className="ti-btn ti-btn-primary">认识团队</a>
        <a href="#product" className="ti-btn ti-btn-secondary">产品思维</a>
      </div>
    </section>
  );
}
