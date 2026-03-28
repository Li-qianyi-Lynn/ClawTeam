export default function HeroSection() {
  return (
    <section className="team-hero">
      <div className="team-hero-bg" aria-hidden="true">
        {/* 爪印背景 */}
        <div className="paw-print paw-1">🐾</div>
        <div className="paw-print paw-2">🐾</div>
        <div className="paw-print paw-3">🐾</div>
        <div className="paw-print paw-4">🐾</div>
        <div className="paw-print paw-5">🐾</div>
        <div className="paw-print paw-6">🐾</div>
        <div className="paw-print paw-7">🐾</div>
        <div className="paw-print paw-8">🐾</div>
        {/* 星光粒子 */}
        <div className="hero-sparkle sparkle-1" />
        <div className="hero-sparkle sparkle-2" />
        <div className="hero-sparkle sparkle-3" />
        <div className="hero-sparkle sparkle-4" />
        <div className="hero-sparkle sparkle-5" />
      </div>

      <div className="team-hero-content shell">
        <div className="team-hero-badge">✦ ClawTeam Agent Swarm ✦</div>

        <h1 className="team-hero-title">
          <span className="team-name-cn">猫猫天团</span>
          <span className="team-name-emoji">🐱</span>
        </h1>

        <p className="team-hero-slogan">爪到擒来，智协天下</p>

        <p className="team-hero-desc">
          六只各怀绝技的 AI 代理猫，协同作战。
          从架构设计到安全防护，从前端美化到数据洞察——
          没有什么任务是猫猫天团搞不定的。
        </p>

        <div className="team-hero-cta">
          <a
            className="btn-primary"
            href="https://github.com/HKUDS/ClawTeam"
            target="_blank"
            rel="noreferrer"
          >
            加入天团 →
          </a>
          <a className="btn-ghost" href="#team-members">
            认识成员
          </a>
        </div>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <span>向下滚动</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
