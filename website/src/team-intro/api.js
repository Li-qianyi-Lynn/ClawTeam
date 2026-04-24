// ============================================================
// 猫猫天团介绍页 — 数据访问 API
// 为组件提供类型安全、可过滤的数据查询接口，隔离数据源依赖。
// ============================================================

import {
  TEAM_MEMBERS,
  PRODUCT_VALUES,
  PAIN_POINTS,
  WORKFLOW_STEPS,
  TECH_STACK,
} from "./data.js";

// ---------- 团队成员 ----------

/** 返回全部团队成员（有序）*/
export function getTeamMembers() {
  return TEAM_MEMBERS;
}

/** 按 id 查找成员，找不到返回 undefined */
export function getMemberById(id) {
  return TEAM_MEMBERS.find((m) => m.id === id);
}

/** 按角色关键字模糊搜索成员 */
export function searchMembersByRole(keyword) {
  const q = keyword.toLowerCase();
  return TEAM_MEMBERS.filter((m) => m.role.toLowerCase().includes(q));
}

/** 按技能标签过滤成员（任意匹配） */
export function getMembersBySkill(skill) {
  const q = skill.toLowerCase();
  return TEAM_MEMBERS.filter((m) =>
    (m.skills ?? []).some((s) => s.toLowerCase().includes(q))
  );
}

/** 按品种（breed）过滤成员 */
export function getMembersByBreed(breed) {
  const q = breed.toLowerCase();
  return TEAM_MEMBERS.filter((m) => m.breed?.toLowerCase().includes(q));
}

// ---------- 产品价值 ----------

/** 返回全部产品价值卡片 */
export function getProductValues() {
  return PRODUCT_VALUES;
}

/** 仅返回高亮（highlight: true）的产品价值卡片 */
export function getHighlightedProductValues() {
  return PRODUCT_VALUES.filter((v) => v.highlight);
}

// ---------- 痛点对照 ----------

/** 返回全部痛点/解法对照数据 */
export function getPainPoints() {
  return PAIN_POINTS;
}

// ---------- 协作流程 ----------

/** 返回全部工作流步骤（按 step 升序） */
export function getWorkflowSteps() {
  return [...WORKFLOW_STEPS].sort((a, b) => a.step - b.step);
}

/** 按步骤序号获取单个步骤，找不到返回 undefined */
export function getWorkflowStepByNumber(stepNum) {
  return WORKFLOW_STEPS.find((s) => s.step === stepNum);
}

// ---------- 技术栈 ----------

/** 返回全部技术栈条目 */
export function getTechStack() {
  return TECH_STACK;
}

/** 按分类（category）过滤技术栈 */
export function getTechStackByCategory(category) {
  const q = category.toLowerCase();
  return TECH_STACK.filter((t) => t.category.toLowerCase().includes(q));
}

// ---------- 聚合统计 ----------

/** 返回团队概览统计（用于 Hero 指标展示） */
export function getTeamStats() {
  return {
    agentCount: TEAM_MEMBERS.length,
    workflowSteps: WORKFLOW_STEPS.length,
    productValues: PRODUCT_VALUES.length,
    techItems: TECH_STACK.length,
  };
}
