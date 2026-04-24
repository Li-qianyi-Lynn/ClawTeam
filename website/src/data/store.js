/**
 * 猫猫拯救天团 — Presentation State Store
 * 后台喵 data layer: lightweight reactive state for slide navigation.
 * No framework required — pure JS pub/sub, works with React or vanilla HTML.
 */

import { SLIDE_COUNT, parseUrlState, updateUrlState } from "./api.js";

const STORAGE_KEY = "maomao-slide-state";

// ─── State Schema ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PresentationState
 * @property {number}  currentSlide   - 0-based slide index
 * @property {boolean} isFullscreen   - fullscreen mode active
 * @property {boolean} isOverview     - ESC overview grid active
 * @property {string}  direction      - "next" | "prev" — last transition direction
 * @property {number}  totalSlides    - total slide count (read-only)
 */

const DEFAULT_STATE = {
  currentSlide: 0,
  isFullscreen: false,
  isOverview: false,
  direction: "next",
  totalSlides: SLIDE_COUNT,
};

// ─── Internal ─────────────────────────────────────────────────────────────────

let _state = { ...DEFAULT_STATE };
const _listeners = new Set();

function _notify() {
  const snapshot = { ..._state };
  _listeners.forEach((fn) => fn(snapshot));
}

function _clampSlide(index) {
  return Math.max(0, Math.min(index, SLIDE_COUNT - 1));
}

// ─── Store API ───────────────────────────────────────────────────────────────

/**
 * Returns a snapshot of the current state (immutable copy).
 * @returns {PresentationState}
 */
export function getState() {
  return { ..._state };
}

/**
 * Subscribe to state changes.
 * @param {(state: PresentationState) => void} listener
 * @returns {() => void} unsubscribe function
 */
export function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// ─── Actions ────────────────────────────────────────────────────────────────

export function goToSlide(index) {
  const next = _clampSlide(index);
  if (next === _state.currentSlide) return;
  const direction = next > _state.currentSlide ? "next" : "prev";
  _state = { ..._state, currentSlide: next, direction, isOverview: false };
  updateUrlState(next);
  _notify();
}

export function nextSlide() {
  goToSlide(_state.currentSlide + 1);
}

export function prevSlide() {
  goToSlide(_state.currentSlide - 1);
}

export function firstSlide() {
  goToSlide(0);
}

export function lastSlide() {
  goToSlide(SLIDE_COUNT - 1);
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
    _state = { ..._state, isFullscreen: true };
  } else {
    document.exitFullscreen?.();
    _state = { ..._state, isFullscreen: false };
  }
  _notify();
}

export function toggleOverview() {
  _state = { ..._state, isOverview: !_state.isOverview };
  _notify();
}

// ─── Keyboard Handler ────────────────────────────────────────────────────────

/**
 * Wires up keyboard navigation. Call once on app init; returns cleanup fn.
 * @returns {() => void}
 */
export function initKeyboardNav() {
  function handleKey(e) {
    // Don't fire inside inputs / textareas
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
        e.preventDefault();
        nextSlide();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        prevSlide();
        break;
      case "Escape":
        e.preventDefault();
        toggleOverview();
        break;
      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "Home":
        e.preventDefault();
        firstSlide();
        break;
      case "End":
        e.preventDefault();
        lastSlide();
        break;
      default:
        break;
    }
  }

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}

// ─── Persistence (sessionStorage) ───────────────────────────────────────────

/**
 * Restores slide index from URL hash first, then sessionStorage fallback.
 * Call once on app boot before rendering.
 */
export function restoreState() {
  const { startSlide } = parseUrlState();
  if (startSlide > 0) {
    _state = { ..._state, currentSlide: startSlide };
    return;
  }
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.currentSlide === "number") {
        _state = { ..._state, currentSlide: _clampSlide(parsed.currentSlide) };
      }
    }
  } catch {
    // ignore parse errors — start from slide 0
  }
}

/**
 * Persists current slide index to sessionStorage.
 * Subscribe to the store and call this in the listener for auto-save.
 */
export function persistState() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ currentSlide: _state.currentSlide })
    );
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

// ─── Fullscreen event sync ───────────────────────────────────────────────────

/**
 * Syncs isFullscreen when the user exits fullscreen via Esc/browser UI.
 * Returns cleanup fn.
 */
export function initFullscreenSync() {
  function handleChange() {
    const isFullscreen = Boolean(document.fullscreenElement);
    if (_state.isFullscreen !== isFullscreen) {
      _state = { ..._state, isFullscreen };
      _notify();
    }
  }
  document.addEventListener("fullscreenchange", handleChange);
  return () => document.removeEventListener("fullscreenchange", handleChange);
}
