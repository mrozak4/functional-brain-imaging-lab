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
    h = canvas.height = document.documentElement.scrollHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Re-measure height when content might change (e.g. tabs, dynamic loads)
  const ro = new ResizeObserver(() => resize());
  ro.observe(document.body);

  // --- margin config ---
  const MARGIN_WIDTH = 180;       // px width of each margin zone
  const CONTENT_FADE = 80;        // px fade zone into content area
  const COUNT = 60;
  const CONNECT_DIST = 160;
  const SPEED = 0.25;
  const particles = [];

  // Spawn a particle in a margin zone
  function spawnInMargin(yMax) {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    let x;
    if (side === 'left') {
      x = Math.random() * (MARGIN_WIDTH + CONTENT_FADE);
    } else {
      x = w - Math.random() * (MARGIN_WIDTH + CONTENT_FADE);
    }
    return {
      x,
      y: Math.random() * yMax,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.8 + 1,
      pulse: Math.random() * Math.PI * 2,
      ps: 0.012 + Math.random() * 0.018,
      side
    };
  }

  function seed() {
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) {
      particles.push(spawnInMargin(h));
    }
  }
  seed();

  // mouse interaction
  let mx = null, my = null;
  const MOUSE_R = 200;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY + window.scrollY; });
  window.addEventListener('mouseout', () => { mx = my = null; });

  // Get opacity based on distance from edges
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
    // Update canvas height if body grew
    if (canvas.height !== document.documentElement.scrollHeight) {
      resize();
    }

    ctx.clearRect(0, 0, w, h);

    // update positions — soft-constrain to margins
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > w) { p.x = w; p.vx *= -1; }
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Gentle pull back toward margins
      const center = w / 2;
      const distFromCenter = Math.abs(p.x - center);
      const marginEdge = center - MARGIN_WIDTH - CONTENT_FADE;

      if (distFromCenter < marginEdge) {
        // Particle drifted too far into content — nudge it back
        const pull = 0.003;
        if (p.x < center) {
          p.vx -= pull;
        } else {
          p.vx += pull;
        }
      }

      p.pulse += p.ps;
    }

    // connections
    ctx.lineWidth = 0.8;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const lineFade = (1 - d / CONNECT_DIST) * 0.18;
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
          const a = (1 - d / MOUSE_R) * 0.35 * getMarginAlpha(p.x);
          if (a < 0.005) continue;
          ctx.strokeStyle = `rgba(240,180,41,${a})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }
    }

    // particles
    for (const p of particles) {
      const alpha = getMarginAlpha(p.x);
      if (alpha < 0.01) continue;

      const cr = p.r + Math.sin(p.pulse) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45,212,191,${0.55 * alpha})`;
      ctx.shadowBlur = 8 * alpha;
      ctx.shadowColor = `rgba(45,212,191,${0.5 * alpha})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
