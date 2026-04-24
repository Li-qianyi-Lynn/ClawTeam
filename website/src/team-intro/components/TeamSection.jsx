import { TEAM_MEMBERS } from "../data.js";
import MemberCard from "./MemberCard.jsx";

/**
 * 团队介绍区
 * 布局：3列 Grid（桌面）→ 2列（平板）→ 1列（手机）
 * 数据：从 data.js 读取 TEAM_MEMBERS
 */
export default function TeamSection() {
  return (
    <section className="ti-section ti-team-section" id="team">
      <div className="ti-section-inner">
        <header className="ti-section-header">
          <span className="ti-section-eyebrow">Team</span>
          <h2 className="ti-section-title">认识猫猫天团</h2>
          <p className="ti-section-subtitle">
            六名职责明确的专职 Agent，覆盖从架构设计到安全审查的完整交付链路
          </p>
        </header>

        <div className="ti-member-grid">
          {TEAM_MEMBERS.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
