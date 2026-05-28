/**
 * animations.js — "MRI Focus" scroll reveal, stats counter, card tilt, back-to-top, dark mode
 * Automatically discovers and animates elements — no manual HTML classes needed.
 */

// Global: Copy citation to clipboard
function copyCitation(btn, citation) {
    navigator.clipboard.writeText(citation).then(() => {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋 Cite';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = citation;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋 Cite';
            btn.classList.remove('copied');
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. MRI FOCUS SCROLL REVEAL ────────────────────────────────────
    // Auto-detect animatable elements instead of relying on HTML classes
    const animateSelectors = [
        '.card',
        '.pub-highlight-card',
        '.person-card',
        '.section-header',
        '.conference-card',
        '.stat-item',
        '.content-block',
        '.facility-item',
        '.pub-filters-bar',
        '.publications-wrapper',
        'section.section > .container',
        'section.section-alt > .container',
        '.page-hero .container',
    ];

    const allTargets = document.querySelectorAll(animateSelectors.join(', '));

    // Apply the hidden state via JS (not CSS class) to avoid flash-of-invisible
    allTargets.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.filter = 'blur(12px)';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i % 4 * 0.1}s,
                               filter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i % 4 * 0.1}s,
                               transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i % 4 * 0.1}s`;
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.style.opacity = '1';
                el.style.filter = 'blur(0)';
                el.style.transform = 'translateY(0)';
                obs.unobserve(el);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    allTargets.forEach(el => revealObserver.observe(el));

    // Also handle dynamically loaded content (news cards, pub cards from JS)
    const dynamicObserver = new MutationObserver(mutations => {
        mutations.forEach(mut => {
            mut.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const matches = node.querySelectorAll ? 
                    node.querySelectorAll('.card, .person-card, .pub-highlight-card') : [];
                const targets = node.matches && node.matches('.card, .person-card') ? [node, ...matches] : [...matches];
                targets.forEach((el, i) => {
                    el.style.opacity = '0';
                    el.style.filter = 'blur(12px)';
                    el.style.transform = 'translateY(40px)';
                    el.style.transition = `opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.08}s,
                                           filter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.08}s,
                                           transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.08}s`;
                    revealObserver.observe(el);
                });
            });
        });
    });
    dynamicObserver.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });


    // ─── 2. ANIMATED STATS COUNTER ─────────────────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    const suffix = el.dataset.suffix || '';
                    const duration = 2000;
                    const start = performance.now();

                    const animate = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.floor(eased * target) + suffix;
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.3 });
        statNumbers.forEach(el => counterObserver.observe(el));
    }


    // ─── 3. CARD HOVER TILT + GLOW ────────────────────────────────────
    const tiltCards = document.querySelectorAll('.card, .pub-highlight-card, .person-card, .conference-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.style.boxShadow = `
                ${rotateY * 2}px ${-rotateX * 2}px 30px rgba(45, 212, 191, 0.15),
                0 8px 32px rgba(0,0,0,0.3)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    });


    // ─── 4. BACK TO TOP BUTTON ─────────────────────────────────────────
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 500);
        });
        backToTopBtn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ─── 5. DARK/LIGHT MODE TOGGLE ─────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('fbil-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.textContent = '🌙';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            themeToggle.textContent = isLight ? '🌙' : '☀️';
            localStorage.setItem('fbil-theme', isLight ? 'light' : 'dark');
        });
    }


    // ─── 6. SKIP-TO-CONTENT ────────────────────────────────────────────
    const skipLink = document.getElementById('skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', e => {
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) { main.tabIndex = -1; main.focus(); }
        });
    }

});
