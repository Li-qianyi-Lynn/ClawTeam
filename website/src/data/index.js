/**
 * 猫猫拯救天团 — Data Layer Barrel Export
 * 后台喵 data layer: single import surface for all consumers.
 *
 * Usage:
 *   import { getTeam, getAllSlides, getConfig, getState, nextSlide } from "../data";
 */

// Data access
export * from "./api.js";

// Reactive state store
export {
  getState,
  subscribe,
  goToSlide,
  nextSlide,
  prevSlide,
  firstSlide,
  lastSlide,
  toggleFullscreen,
  toggleOverview,
  initKeyboardNav,
  restoreState,
  persistState,
  initFullscreenSync,
} from "./store.js";
