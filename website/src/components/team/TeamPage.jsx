import HeroSection from "./HeroSection.jsx";
import CatCardsSection from "./CatCardsSection.jsx";
import TeamCapabilities from "./TeamCapabilities.jsx";
import TeamFooter from "./TeamFooter.jsx";

/**
 * 猫猫天团介绍页面
 * 顶层容器，按顺序渲染：Hero → 成员卡片 → 团队能力 → Footer
 */
export default function TeamPage() {
  return (
    <div className="team-page" id="top">
      <div className="team-bg-gradient" aria-hidden="true" />
      <HeroSection />
      <CatCardsSection />
      <TeamCapabilities />
      <TeamFooter />
    </div>
  );
}
