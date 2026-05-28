// js/intro.js
// Modern, premium, fluid neural network animation representing "Mapping the Mind in Motion".

(function() {
    const canvas = document.getElementById('intro-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to fill the viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle settings
    const particles = [];
    const particleCount = 80;
    const connectionDistance = 140;
    const speed = 0.5;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed,
            radius: Math.random() * 2 + 1.5,
            pulse: Math.random() * Math.PI,
            pulseSpeed: 0.02 + Math.random() * 0.03
        });
    }

    // Animation state
    let startTime = null;
    const duration = 6500; // 6.5 seconds of animation
    let animationFrameId = null;

    // Track mouse position
    let mouse = { x: null, y: null, radius: 180 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render abstract glowing brain shadow in the background
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 50,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
        );
        gradient.addColorStop(0, '#1c3644'); // dark teal
        gradient.addColorStop(1, '#0e171b'); // deep dark blue-grey
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(p => {
            // Drift particles
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off boundaries
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Update particle pulse size
            p.pulse += p.pulseSpeed;
            const currentRadius = p.radius + Math.sin(p.pulse) * 0.8;

            // Draw glowing particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(42, 157, 143, 0.8)'; // teal accent
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(42, 157, 143, 0.8)';
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        });

        // Draw connections (synapses)
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(42, 157, 143, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw active electrical pulses along synapses
        // We simulate a scanning fMRI activation wave moving across the brain
        const waveX = (progress / duration) * (canvas.width + 400) - 200;
        
        // Draw the scanning fMRI wave overlay
        ctx.beginPath();
        const waveWidth = 250;
        const waveGrad = ctx.createLinearGradient(waveX - waveWidth, 0, waveX + waveWidth, 0);
        waveGrad.addColorStop(0, 'rgba(233, 196, 106, 0)'); // yellow secondary
        waveGrad.addColorStop(0.5, 'rgba(231, 111, 81, 0.15)'); // coral tertiary
        waveGrad.addColorStop(1, 'rgba(233, 196, 106, 0)');
        ctx.fillStyle = waveGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            // If particle is near the wave, it gets activated and draws a bright orange pulse
            const distanceToWave = Math.abs(p.x - waveX);
            if (distanceToWave < 150) {
                const intensity = (1 - distanceToWave / 150);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * (1.5 + intensity), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(231, 111, 81, ${0.4 + intensity * 0.6})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(231, 111, 81, 0.8)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Mouse interaction: draw connection to mouse
        if (mouse.x !== null && mouse.y !== null) {
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(233, 196, 106, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        }

        // Check if animation is complete
        if (progress < duration) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            // Trigger exit fade
            if (window.onAnimationFinished) {
                window.onAnimationFinished();
            }
        }
    }

    // Start animation
    animationFrameId = requestAnimationFrame(draw);

    // Make sure skipping stops the loop
    const skipBtn = document.getElementById('skip-intro');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }
})();
