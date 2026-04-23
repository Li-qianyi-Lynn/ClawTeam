import { PRODUCT_VALUES, PAIN_POINTS } from "../data.js";

/**
 * 产品思维展示区（PM present 核心区段）
 *
 * 子区块：
 *   1. 痛点 vs 解法（PainPointRow × N）— 建立用户共鸣
 *   2. 核心产品价值卡片（ProductValueCard × N）— 量化价值主张
 */
export default function ProductThinkingSection() {
  return (
    <section className="ti-section ti-product-section" id="product">
      <div className="ti-section-inner">
        <header className="ti-section-header">
          <h2 className="ti-section-title">产品思维</h2>
          <p className="ti-section-subtitle">
            从用户痛点出发，以可量化的产品价值驱动设计决策
          </p>
        </header>

        {/* 痛点 vs 解法对照表 */}
        <div className="ti-pain-grid">
          {PAIN_POINTS.map((item) => (
            <div key={item.id} className="ti-pain-row">
              <div className="ti-pain-cell ti-pain-cell--before">
                <span className="ti-pain-badge ti-pain-badge--pain">痛点</span>
                <p>{item.pain}</p>
              </div>
              <div className="ti-pain-arrow" aria-hidden="true">
                {item.icon}
              </div>
              <div className="ti-pain-cell ti-pain-cell--after">
                <span className="ti-pain-badge ti-pain-badge--solution">解法</span>
                <p>{item.solution}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 核心产品价值卡片 Grid */}
        <div className="ti-value-grid">
          {PRODUCT_VALUES.map((value) => (
            <article
              key={value.id}
              className={`ti-value-card${value.highlight ? " ti-value-card--highlight" : ""}`}
            >
              <span className="ti-value-icon" aria-hidden="true">{value.icon}</span>
              <h3 className="ti-value-title">{value.title}</h3>
              <p className="ti-value-metric">{value.metric}</p>
              <p className="ti-value-desc">{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
