/**
 * animations.js — Award-winning animation suite for fBIL
 * MRI Focus scroll reveal, stats counter, custom cursor, magnetic buttons,
 * preloader, scroll progress, mouse spotlight, staggered hero text.
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

    // ─── 0. PRELOADER ──────────────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('loaded');
            setTimeout(() => preloader.remove(), 600);
        });
        // Fallback: remove after 3s no matter what
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.classList.add('loaded');
                setTimeout(() => preloader.remove(), 600);
            }
        }, 3000);
    }


    // ─── 1. MRI FOCUS SCROLL REVEAL ────────────────────────────────────
    const animateSelectors = [
        '.card',
        '.pub-highlight-card',
        '.person-card',
        '.section-header',
        '.conference-card',
        '.content-block',
        '.facility-item',
        '.pub-filters-bar',
        '.publications-wrapper',
        'section.section > .container',
        'section.section-alt > .container',
        '.page-hero .container',
    ];

    const allTargets = document.querySelectorAll(animateSelectors.join(', '));

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

    // Dynamic content observer
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
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        statsBar.style.opacity = '0';
        statsBar.style.transform = 'translateY(30px)';
        statsBar.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }

    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (statsBar) {
                        statsBar.style.opacity = '1';
                        statsBar.style.transform = 'translateY(0)';
                    }
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    const suffix = el.dataset.suffix || '';
                    const duration = 2000;
                    const start = performance.now();
                    const animate = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
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


    // ─── 3. SCROLL PROGRESS BAR ────────────────────────────────────────
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
        }, { passive: true });
    }


    // ─── 4. CUSTOM CURSOR ──────────────────────────────────────────────
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Smooth ring follow
        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Expand on interactive elements
        const interactives = 'a, button, input, select, textarea, .card, .person-card, .pub-highlight-card, .conference-card';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(interactives)) {
                cursorRing.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(interactives)) {
                cursorRing.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            }
        });
    }


    // ─── 5. MOUSE-REACTIVE GRADIENT SPOTLIGHT ──────────────────────────
    const spotlight = document.getElementById('mouse-spotlight');
    if (spotlight && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', e => {
            spotlight.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(45, 212, 191, 0.06), transparent 60%)`;
        });
    }


    // ─── 6. MAGNETIC BUTTONS ───────────────────────────────────────────
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary');
    if (window.matchMedia('(pointer: fine)').matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                setTimeout(() => { btn.style.transition = ''; }, 400);
            });
        });
    }


    // ─── 7. STAGGERED HERO TEXT REVEAL ─────────────────────────────────
    const heroP = document.querySelector('.hero-content > p');
    if (heroP) {
        const text = heroP.textContent;
        const words = text.split(' ');
        heroP.innerHTML = words.map((word, i) => 
            `<span class="hero-word" style="animation-delay: ${0.8 + i * 0.04}s">${word}</span>`
        ).join(' ');
    }


    // ─── 8. BACK TO TOP BUTTON ─────────────────────────────────────────
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


    // ─── 9. DARK/LIGHT MODE TOGGLE ─────────────────────────────────────
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


    // ─── 10. SKIP-TO-CONTENT ───────────────────────────────────────────
    const skipLink = document.getElementById('skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', e => {
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) { main.tabIndex = -1; main.focus(); }
        });
    }

});
