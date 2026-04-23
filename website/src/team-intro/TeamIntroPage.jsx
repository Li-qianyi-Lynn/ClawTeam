import IntroNav from "./components/IntroNav.jsx";
import IntroHero from "./components/IntroHero.jsx";
import TeamSection from "./components/TeamSection.jsx";
import ProductThinkingSection from "./components/ProductThinkingSection.jsx";
import CollaborationSection from "./components/CollaborationSection.jsx";
import TechStackSection from "./components/TechStackSection.jsx";
import IntroFooter from "./components/IntroFooter.jsx";

/**
 * 猫猫天团介绍页（产品经理 Present 版）
 *
 * 页面分区顺序：
 *   1. Hero         — 品牌印象 + 核心价值主张
 *   2. TeamSection  — 六只猫成员介绍
 *   3. ProductThinkingSection — 产品思维展示（痛点、解法、关键指标）
 *   4. CollaborationSection   — 端到端协作流程
 *   5. TechStackSection       — 技术栈简述
 *   6. IntroFooter
 */
export default function TeamIntroPage() {
  return (
    <div className="ti-page" id="top">
      <div className="ti-bg-gradient" aria-hidden="true" />

      <IntroNav />

      <main>
        <IntroHero />
        <TeamSection />
        <ProductThinkingSection />
        <CollaborationSection />
        <TechStackSection />
      </main>

      <IntroFooter />
    </div>
  );
}
