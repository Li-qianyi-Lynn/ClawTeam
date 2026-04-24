/**
 * 猫猫拯救天团 — Data Access API
 * 后台喵 data layer: unified access module. All reads go through here — no
 * component should import from team.js / slides.js / config.js directly.
 *
 * This keeps the data contracts stable: swap the underlying store (JSON, REST,
 * CMS) without touching any component code.
 */

import {
  TEAM_MEMBERS,
  TEAM_NAME,
  TEAM_SLOGAN,
  TEAM_ID,
  getMemberById,
  getMembersByBadge,
} from "./team.js";

import {
  SLIDES,
  getSlideById,
  getSlideByIndex,
  getTotalSlides,
  SLIDE_COUNT,
} from "./slides.js";

import {
  PRESENTATION_CONFIG,
  KEYBOARD_SHORTCUTS,
} from "./config.js";

// ─── Team ──────────────────────────────────────────────────────────────────

/**
 * Returns the full ordered list of team members.
 * @returns {import("./team.js").TEAM_MEMBERS}
 */
export function getTeam() {
  return TEAM_MEMBERS;
}

/**
 * Returns team-level metadata (name, slogan, id).
 */
export function getTeamMeta() {
  return { id: TEAM_ID, name: TEAM_NAME, slogan: TEAM_SLOGAN };
}

export { getMemberById, getMembersByBadge };

// ─── Slides ─────────────────────────────────────────────────────────────────

/**
 * Returns all slides in display order.
 */
export function getAllSlides() {
  return SLIDES;
}

export { getSlideById, getSlideByIndex, getTotalSlides, SLIDE_COUNT };

// ─── Config ─────────────────────────────────────────────────────────────────

/**
 * Returns the merged presentation config.
 * Accepts optional runtime overrides (e.g. from URL params or localStorage).
 *
 * @param {Partial<typeof PRESENTATION_CONFIG>} [overrides]
 */
export function getConfig(overrides = {}) {
  return deepMerge(PRESENTATION_CONFIG, overrides);
}

export { KEYBOARD_SHORTCUTS };

// ─── Utilities ──────────────────────────────────────────────────────────────

function deepMerge(base, overrides) {
  const out = { ...base };
  for (const key of Object.keys(overrides)) {
    if (
      overrides[key] !== null &&
      typeof overrides[key] === "object" &&
      !Array.isArray(overrides[key]) &&
      typeof base[key] === "object"
    ) {
      out[key] = deepMerge(base[key], overrides[key]);
    } else {
      out[key] = overrides[key];
    }
  }
  return out;
}

/**
 * Parses slide-navigation overrides from the current URL hash.
 * Format: #/slideIndex  (Reveal.js compatible)
 * Returns { startSlide: number }
 */
export function parseUrlState() {
  const hash = window?.location?.hash ?? "";
  const match = hash.match(/^#\/(\d+)/);
  const startSlide = match ? parseInt(match[1], 10) : 0;
  return { startSlide: Math.min(Math.max(startSlide, 0), SLIDE_COUNT - 1) };
}

/**
 * Updates the URL hash to reflect the current slide index without a page reload.
 * @param {number} index
 */
export function updateUrlState(index) {
  if (typeof window === "undefined") return;
  const newHash = `#/${index}`;
  if (window.location.hash !== newHash) {
    window.history.replaceState(null, "", newHash);
  }
}
