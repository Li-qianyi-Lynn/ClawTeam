export default function MemberCard({ member }) {
  const { name, breed, role, emoji, avatar, bio, personality, skills, color } = member;

  return (
    <article
      className="ti-member-card"
      style={{ "--ti-member-color": color }}
    >
      <div className="ti-member-avatar-wrap">
        <img
          src={avatar}
          alt={`${name} 头像`}
          className="ti-member-avatar"
          loading="lazy"
        />
        <span className="ti-member-emoji" aria-hidden="true">{emoji}</span>
      </div>

      <div className="ti-member-info">
        <h3 className="ti-member-name">{name}</h3>
        {breed && <span className="ti-member-breed">{breed}</span>}
        <p className="ti-member-role">{role}</p>
        <p className="ti-member-bio">{bio}</p>
        {personality && (
          <p className="ti-member-personality">{personality}</p>
        )}
        <ul className="ti-member-tags" aria-label="技能">
          {(skills ?? []).map((skill) => (
            <li key={skill} className="ti-member-tag">{skill}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
