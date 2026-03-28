import { TEAM_CAPABILITIES } from "./data.js";

function CapabilityIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function TeamCapabilities() {
  return (
    <section className="team-capabilities shell" id="capabilities">
      <div className="section-header">
        <p className="section-label">核心能力</p>
        <h2>六猫联手，能力全覆盖</h2>
      </div>
      <div className="capabilities-grid">
        {TEAM_CAPABILITIES.map((cap) => (
          <article key={cap.title} className="capability-card">
            <div className="capability-icon">
              <CapabilityIcon path={cap.iconPath} />
            </div>
            <h3 className="capability-title">{cap.title}</h3>
            <p className="capability-desc">{cap.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
