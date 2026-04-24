import { WORKFLOW_STEPS } from "../data.js";

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
          {WORKFLOW_STEPS.map((step) => (
            <li key={step.id} className="ti-workflow-step">
              <div className="ti-step-left">
                <div className="ti-step-num" aria-label={`第 ${step.step} 步`}>
                  {step.step}
                </div>
              </div>

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
