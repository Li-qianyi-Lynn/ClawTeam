import HeroSection from "./HeroSection.jsx";
import CatCardsSection from "./CatCardsSection.jsx";
import TeamCapabilities from "./TeamCapabilities.jsx";
import TeamFooter from "./TeamFooter.jsx";

/**
 * 猫猫天团介绍页面
 * 顶层容器，按顺序渲染：Nav → Hero → 成员卡片 → 团队能力 → Footer
 */
export default function TeamPage() {
  return (
    <div className="team-page" id="top">
      <div className="team-bg-gradient" aria-hidden="true" />

      {/* 顶部导航 */}
      <nav className="team-nav">
        <div className="team-nav-inner">
          <span className="team-nav-logo">🐾 猫猫天团</span>
          <div className="team-nav-links">
            <a href="#team-members">成员</a>
            <a href="#capabilities">能力</a>
            <a href="https://github.com/HKUDS/ClawTeam" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </nav>

      <HeroSection />

      {/* 成员卡片与能力之间的分割线 */}
      <div className="team-divider" aria-hidden="true">
        <span className="team-divider-emoji">🐾</span>
      </div>

      <CatCardsSection />
      <TeamCapabilities />
      <TeamFooter />
    </div>
  );
}
