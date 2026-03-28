export default function TeamFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="team-footer shell">
      <div className="team-footer-left">
        <span className="team-footer-logo">🐾 猫猫天团</span>
        <span className="team-footer-copy">© {year} ClawTeam · HKUDS</span>
      </div>
      <nav className="team-footer-links" aria-label="Footer navigation">
        <a href="https://github.com/HKUDS/ClawTeam" target="_blank" rel="noreferrer">GitHub</a>
        <a href="skills/clawteam/SKILL.md">技能文档</a>
        <a href="skills/clawteam/references/cli-reference.md">CLI 参考</a>
        <a href="#top">回到顶部 ↑</a>
      </nav>
    </footer>
  );
}
