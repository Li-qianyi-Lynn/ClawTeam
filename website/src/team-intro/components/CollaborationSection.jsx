import { WORKFLOW_STEPS } from "../data.js";

/**
 * 协作流程区
 * 布局：横向步骤流（桌面）→ 纵向列表（手机）
 * 每步：序号 → 角色 Avatar + 名称 → 步骤说明 → 输出物
 * 箭头连接线：纯 CSS 实现，reduce-motion 兼容
 */
export default function CollaborationSection() {
  return (
    <section className="ti-section ti-collab-section" id="workflow">
      <div className="ti-section-inner">
        <header className="ti-section-header">
          <span className="ti-section-eyebrow">Workflow</span>
          <h2 className="ti-section-title">端到端协作流程</h2>
          <p className="ti-section-subtitle">
            从需求输入到交付闭环，每个环节责任到位、进度透明，人工干预节点精准可控
          </p>
        </header>

        <ol className="ti-workflow-list">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step.id} className="ti-workflow-step">
              {/* 步骤序号 */}
              <div className="ti-step-num" aria-label={`第 ${step.step} 步`}>
                {step.step}
              </div>

              {/* 连接线（最后一步不渲染） */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="ti-step-connector" aria-hidden="true" />
              )}

              {/* 步骤内容 */}
              <div className="ti-step-content">
                <div className="ti-step-actor">
                  <span className="ti-step-actor-emoji" aria-hidden="true">
                    {step.actorEmoji}
                  </span>
                  <span className="ti-step-actor-name">{step.actor}</span>
                </div>
                <h3 className="ti-step-label">{step.label}</h3>
                <p className="ti-step-desc">{step.description}</p>
                <div className="ti-step-output">
                  <span className="ti-step-output-badge">输出</span>
                  {step.outputLabel}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
