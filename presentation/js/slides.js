/* ============================================================
   猫猫拯救世界 Presentation — v2 Enhanced Interactions
   总裁喵统筹，后台喵 / 美丽喵联合交付
   ============================================================ */

'use strict';

/* ── Particle Background (Cover Slide) ── */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dpr;
  const particles = [];
  const COUNT = 60;
  const COLORS = ['#FF6B35', '#4A90D9', '#F7C948', '#818CF8', '#34D399'];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  for (let i = 0; i < COUNT; i++) particles.push(spawn());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#818CF8';
          ctx.globalAlpha = (1 - dist / 100) * 0.12;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ── Counter Animation (Metrics) ── */
function animateCounters(root) {
  const counters = (root || document).querySelectorAll('.metric-value[data-target]');
  counters.forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const suffix  = el.dataset.suffix || '';
    const isInt   = Number.isInteger(target);
    let current   = 0;
    const step    = target / 45;
    const timer   = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = isInt ? Math.floor(current) + suffix : current.toFixed(1) + suffix;
    }, 25);
  });
}

/* ── Typing effect for terminal body ── */
function typeTerminal() {
  const body = document.querySelector('.typing-terminal');
  if (!body) return;
  const lines = body.querySelectorAll('[data-type]');
  let delay = 300;
  lines.forEach(line => {
    const text = line.textContent;
    line.textContent = '';
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.opacity = '1';
      let i = 0;
      const t = setInterval(() => {
        line.textContent += text[i++];
        if (i >= text.length) clearInterval(t);
      }, 18);
    }, delay);
    delay += text.length * 20 + 300;
  });
}

/* ── Highlight active architecture layer on hover ── */
function initArchHover() {
  document.querySelectorAll('.arch-layer').forEach(layer => {
    layer.style.cursor = 'default';
    layer.addEventListener('mouseenter', () => {
      layer.style.transform = 'scale(1.02)';
      layer.style.transition = 'transform 0.2s';
    });
    layer.addEventListener('mouseleave', () => {
      layer.style.transform = '';
    });
  });
}

/* ── Keyboard shortcut hint ── */
function injectKeyHint() {
  const hint = document.createElement('div');
  hint.id = 'key-hint';
  hint.style.cssText = `
    position:fixed; bottom:16px; right:20px;
    font-size:11px; color: rgba(136,146,164,0.6);
    font-family: 'JetBrains Mono', monospace;
    z-index: 9999; pointer-events:none;
  `;
  hint.innerHTML = '← → 切换 &nbsp;|&nbsp; F 全屏 &nbsp;|&nbsp; ESC 缩略';
  document.body.appendChild(hint);
}

/* ── Slide change dispatch ── */
document.addEventListener('DOMContentLoaded', () => {
  // Particles start immediately
  initParticles();
  initArchHover();
  injectKeyHint();

  if (typeof Reveal === 'undefined') return;

  Reveal.on('ready', () => {
    // Animate counters if starting on the product slide
    if (Reveal.getState().indexh === 2) {
      setTimeout(() => animateCounters(), 400);
    }
  });

  Reveal.on('slidechanged', event => {
    const idx = event.indexh;

    // Slide 3 (index 2): product-thinking — counters + typing terminal
    if (idx === 2) {
      setTimeout(() => animateCounters(event.currentSlide), 400);
    }

    // Slide 5 (index 4): demo — typing terminal
    if (idx === 4) {
      setTimeout(typeTerminal, 200);
    }
  });
});
