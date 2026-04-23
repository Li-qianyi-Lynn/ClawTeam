/**
 * 顶部导航栏
 * 锚点：#team | #product | #workflow | #techstack
 */
export default function IntroNav() {
  return (
    <nav className="ti-nav">
      <div className="ti-nav-inner">
        <span className="ti-nav-logo">🐾 猫猫天团</span>
        <div className="ti-nav-links">
          <a href="#team">成员</a>
          <a href="#product">产品思维</a>
          <a href="#workflow">协作流程</a>
          <a href="#techstack">技术栈</a>
        </div>
      </div>
    </nav>
  );
}
