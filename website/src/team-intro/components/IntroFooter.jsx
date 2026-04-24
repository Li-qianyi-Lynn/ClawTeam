/**
 * Footer
 * 动态年份；GitHub 链接；返回顶部
 */
export default function IntroFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ti-footer">
      <div className="ti-footer-inner">
        <p className="ti-footer-brand">
          🐾 猫猫天团 · ClawTeam
        </p>
        <p className="ti-footer-copy">
          © {year} 猫猫天团. Made with 🐾 and Claude.
        </p>
        <nav className="ti-footer-links" aria-label="Footer 导航">
          <a
            href="https://github.com/Li-qianyi-Lynn/ClawTeam"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a href="#top">回到顶部</a>
        </nav>
      </div>
    </footer>
  );
}
