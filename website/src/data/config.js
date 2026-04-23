/**
 * 猫猫拯救天团 — Presentation Config
 * 后台喵 data layer: animation, theme, and feature-flag configuration.
 * Placeholder values — will be updated when 美丽喵 delivers design tokens (task 010cedd9).
 */

export const PRESENTATION_CONFIG = {
  title: "猫猫拯救天团",
  description: "多智能体协作团队 · 产品思维 · 技术深度",
  lang: "zh-CN",

  theme: {
    // dark cat-themed palette — placeholder, defer to mei-li-miao for final values
    background: "#0d0d14",
    surface: "#13131f",
    surfaceHover: "#1a1a2e",
    border: "rgba(255,255,255,0.08)",
    textPrimary: "#f1f5f9",
    textSecondary: "#94a3b8",
    textMuted: "#475569",
    accent: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
    success: "#10b981",
    danger: "#ef4444",
    info: "#6366f1",
  },

  fonts: {
    // Using system stack until design spec confirmed
    display: "'Inter', 'PingFang SC', system-ui, sans-serif",
    body: "'Inter', 'PingFang SC', system-ui, sans-serif",
    code: "'JetBrains Mono', 'Fira Code', monospace",
  },

  animation: {
    slideTransition: "slide",        // "slide" | "fade" | "zoom" | "convex"
    transitionDuration: 600,         // ms
    autoplay: false,
    autoplayDelay: 8000,             // ms per slide if autoplay enabled
    loop: false,
  },

  navigation: {
    keyboardEnabled: true,
    clickEnabled: true,
    swipeEnabled: true,
    progressBar: true,
    slideNumbers: true,
    fullscreenToggle: true,
  },

  features: {
    speakerNotes: false,             // show speaker notes panel
    overview: true,                  // ESC to show slide overview grid
    printPDF: false,                 // enable print-to-PDF layout
  },
};

export const KEYBOARD_SHORTCUTS = [
  { keys: ["→", "Space"], action: "Next slide" },
  { keys: ["←"], action: "Previous slide" },
  { keys: ["Esc"], action: "Toggle overview" },
  { keys: ["F"], action: "Toggle fullscreen" },
  { keys: ["Home"], action: "First slide" },
  { keys: ["End"], action: "Last slide" },
];
