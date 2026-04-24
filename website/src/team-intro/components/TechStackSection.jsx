import { TECH_STACK } from "../data.js";

/**
 * 技术栈简述区（轻技术，重 "为什么选"）
 * 布局：3列卡片 Grid
 * 每张卡片：emoji + 名称 + 分类徽章 + 一句"做什么" + 一句"为什么选"
 */
export default function TechStackSection() {
  return (
    <section className="ti-section ti-tech-section" id="techstack">
      <div className="ti-section-inner">
        <header className="ti-section-header">
          <span className="ti-section-eyebrow">Tech Stack</span>
          <h2 className="ti-section-title">技术选型</h2>
          <p className="ti-section-subtitle">
            每一项技术都有明确的「为什么」——从产品需求出发选型，不炫技，只解决真实问题
          </p>
        </header>

        <div className="ti-tech-grid">
          {TECH_STACK.map((item) => (
            <article key={item.id} className="ti-tech-card">
              <div className="ti-tech-header">
                <span className="ti-tech-emoji" aria-hidden="true">{item.emoji}</span>
                <div>
                  <h3 className="ti-tech-name">{item.name}</h3>
                  <span className="ti-tech-category">{item.category}</span>
                </div>
              </div>
              <dl className="ti-tech-detail">
                <dt>做什么</dt>
                <dd>{item.what}</dd>
                <dt>为什么选</dt>
                <dd>{item.why}</dd>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
