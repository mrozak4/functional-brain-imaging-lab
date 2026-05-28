// js/neural-bg.js
// Persistent floating neural network background for all pages.
// Lightweight version — fewer particles, no wave, subtle opacity.

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

  // --- particles ---
  const COUNT = 55;
  const CONNECT_DIST = 160;
  const SPEED = 0.25;
  const particles = [];

  function seed() {
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.8 + 1,
        pulse: Math.random() * Math.PI * 2,
        ps: 0.012 + Math.random() * 0.018
      });
    }
  }
  seed();

  // mouse interaction
  let mx = null, my = null;
  const MOUSE_R = 200;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY + window.scrollY; });
  window.addEventListener('mouseout', () => { mx = my = null; });
  window.addEventListener('scroll', () => { if (mx !== null) my = mx !== null ? (my - window.scrollY + window.scrollY) : null; });

  // --- draw loop ---
  function frame() {
    // Update canvas height if body grew
    if (canvas.height !== document.documentElement.scrollHeight) {
      resize();
    }

    ctx.clearRect(0, 0, w, h);

    // update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
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
          const a = (1 - d / CONNECT_DIST) * 0.18;
          ctx.strokeStyle = `rgba(42,157,143,${a})`;
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
          const a = (1 - d / MOUSE_R) * 0.3;
          ctx.strokeStyle = `rgba(233,196,106,${a})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }
    }

    // particles
    for (const p of particles) {
      const cr = p.r + Math.sin(p.pulse) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(42,157,143,0.45)';
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(42,157,143,0.4)';
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
