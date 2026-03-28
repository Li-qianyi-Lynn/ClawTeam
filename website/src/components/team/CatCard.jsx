export default function CatCard({ member }) {
  const { name, role, emoji, avatar, bio, tags, color } = member;
  return (
    <article
      className="cat-card"
      style={{ "--cat-color": color }}
    >
      <div className="cat-card-avatar-wrap">
        <img
          src={avatar}
          alt={`${name} 的头像`}
          className="cat-card-avatar"
          loading="lazy"
        />
        <span className="cat-card-emoji" aria-hidden="true">{emoji}</span>
      </div>
      <div className="cat-card-body">
        <h3 className="cat-card-name">{name}</h3>
        <p className="cat-card-role">{role}</p>
        <p className="cat-card-bio">{bio}</p>
        <div className="cat-card-tags">
          {tags.map((tag) => (
            <span key={tag} className="cat-tag">{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
