/* ============================================================
   猫猫拯救世界 Presentation — Custom Interactions
   架构喵出品骨架，后台喵 / 美丽喵可扩展
   ============================================================ */

// Counter animation for metric values on slide 3
function animateCounters() {
  const counters = document.querySelectorAll('.metric-value');
  counters.forEach(el => {
    const target = el.dataset.target;
    if (!target) return;
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const end = parseFloat(target);
    const step = end / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { current = end; clearInterval(timer); }
      el.textContent = Number.isInteger(end) ? Math.floor(current) + suffix : current.toFixed(1) + suffix;
    }, 30);
  });
}

// Hook into Reveal events
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Reveal === 'undefined') return;

  Reveal.on('slidechanged', event => {
    // Trigger counter animation on product-thinking slide (index 2)
    if (event.indexh === 2) {
      setTimeout(animateCounters, 400);
    }
  });
});
