import CatCard from "./CatCard.jsx";
import { CAT_MEMBERS } from "./data.js";

export default function CatCardsSection() {
  return (
    <section className="cat-cards-section shell" id="team-members">
      <div className="section-header">
        <p className="section-label">团队成员</p>
        <h2>认识六只全能战猫</h2>
        <p className="section-desc">每只猫都是独当一面的专家，合在一起则无所不能。</p>
      </div>
      <div className="cat-cards-grid">
        {CAT_MEMBERS.map((member) => (
          <CatCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
