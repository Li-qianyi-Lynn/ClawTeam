/**
 * 单成员卡片（原子组件）
 *
 * Props:
 *   member: {
 *     id: string, name: string, role: string,
 *     emoji: string, avatar: string, bio: string,
 *     tags: string[], color: string
 *   }
 *
 * 布局：圆形头像 + emoji 徽章 → 名字 + 角色 → 简介 → 技能标签
 * 交互：hover 上移 + 卡片边框着色（--ti-member-color）
 */
export default function MemberCard({ member }) {
  const { name, role, emoji, avatar, bio, tags, color } = member;

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
        <p className="ti-member-role">{role}</p>
        <p className="ti-member-bio">{bio}</p>
        <ul className="ti-member-tags" aria-label="技能标签">
          {tags.map((tag) => (
            <li key={tag} className="ti-member-tag">{tag}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
