// js/neural-bg.js
// Persistent floating neural network background for all pages.
// Particles concentrate in left/right margins to frame content.

// -- Mobile hamburger menu (shared across all pages) --
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
      hamburger.classList.toggle('active');
    });
    // Close nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        hamburger.classList.remove('active');
      });
    });
  }
});

(function () {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // --- margin config ---
  const MARGIN_WIDTH = 300;       // px width of each margin zone (wider = more visible)
  const CONTENT_FADE = 120;       // px fade zone into content area
  const COUNT = 90;               // total particle count (split between both margins)
  const CONNECT_DIST = 200;       // px max distance for connection lines
  const SPEED = 0.3;
  const particles = [];

  // Spawn a particle in a margin zone
  function spawnInMargin() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    let x;
    if (side === 'left') {
      x = Math.random() * (MARGIN_WIDTH + CONTENT_FADE * 0.5);
    } else {
      x = w - Math.random() * (MARGIN_WIDTH + CONTENT_FADE * 0.5);
    }
    return {
      x,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 2.5 + 2,    // bigger: 2–4.5px radius
      pulse: Math.random() * Math.PI * 2,
      ps: 0.01 + Math.random() * 0.02,
      side
    };
  }

  function seed() {
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) {
      particles.push(spawnInMargin());
    }
  }
  seed();
  window.addEventListener('resize', () => { seed(); });

  // mouse interaction
  let mx = null, my = null;
  const MOUSE_R = 250;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('mouseout', () => { mx = my = null; });

  // Get opacity based on distance from edges (1 = at edge, 0 = deep in content)
  function getMarginAlpha(x) {
    const leftDist = x;
    const rightDist = w - x;
    const nearestEdge = Math.min(leftDist, rightDist);

    if (nearestEdge <= MARGIN_WIDTH) return 1;
    if (nearestEdge <= MARGIN_WIDTH + CONTENT_FADE) {
      return 1 - (nearestEdge - MARGIN_WIDTH) / CONTENT_FADE;
    }
    return 0;
  }

  // --- draw loop ---
  function frame() {
    ctx.clearRect(0, 0, w, h);

    // update positions — soft-constrain to margins
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > w) { p.x = w; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > h) { p.y = h; p.vy *= -1; }

      // Pull back toward margins if drifting into content
      const center = w / 2;
      const distFromCenter = Math.abs(p.x - center);
      const marginEdge = center - MARGIN_WIDTH - CONTENT_FADE;

      if (distFromCenter < marginEdge) {
        const pull = 0.008;   // stronger pull
        if (p.x < center) {
          p.vx -= pull;
        } else {
          p.vx += pull;
        }
      }

      p.pulse += p.ps;
    }

    // connections — thicker, brighter
    ctx.lineWidth = 1.2;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const lineFade = (1 - d / CONNECT_DIST) * 0.35;
          const alphaI = getMarginAlpha(particles[i].x);
          const alphaJ = getMarginAlpha(particles[j].x);
          const a = lineFade * Math.min(alphaI, alphaJ);
          if (a < 0.005) continue;
          ctx.strokeStyle = `rgba(45,212,191,${a})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // mouse connections
    if (mx !== null && my !== null) {
      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          const a = (1 - d / MOUSE_R) * 0.5 * getMarginAlpha(p.x);
          if (a < 0.005) continue;
          ctx.strokeStyle = `rgba(240,180,41,${a})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
          ctx.lineWidth = 1.2;
        }
      }
    }

    // particles — bigger, brighter, stronger glow
    for (const p of particles) {
      const alpha = getMarginAlpha(p.x);
      if (alpha < 0.01) continue;

      const cr = p.r + Math.sin(p.pulse) * 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45,212,191,${0.8 * alpha})`;
      ctx.shadowBlur = 15 * alpha;
      ctx.shadowColor = `rgba(45,212,191,${0.7 * alpha})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

