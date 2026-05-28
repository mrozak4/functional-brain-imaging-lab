/**
 * search.js — Global site search overlay
 * Searches across people, publications, and pages.
 */

(function() {
    const overlay = document.getElementById('search-overlay');
    const trigger = document.getElementById('search-trigger');
    const closeBtn = document.getElementById('search-close');
    if (!overlay || !trigger) return;

    const input = overlay.querySelector('#search-input');
    const resultsContainer = overlay.querySelector('.search-results');

    // Build the searchable index
    let searchIndex = [];
    let indexBuilt = false;

    async function buildIndex() {
        if (indexBuilt) return;
        
        // Determine base path
        const isFr = document.documentElement.lang && document.documentElement.lang.startsWith('fr');
        const prefix = isFr ? '../' : '';

        // Pages
        const pages = [
            { title: 'Home', url: prefix + 'index.html', type: 'Page' },
            { title: 'People', url: prefix + 'people.html', type: 'Page' },
            { title: 'Research', url: prefix + 'research.html', type: 'Page' },
            { title: 'Publications', url: prefix + 'publications.html', type: 'Page' },
            { title: 'Facilities', url: prefix + 'facilities.html', type: 'Page' },
            { title: 'News', url: prefix + 'news.html', type: 'Page' },
            { title: 'Toronto', url: prefix + 'toronto.html', type: 'Page' },
            { title: 'Join Us', url: prefix + 'joinus.html', type: 'Page' },
            { title: 'Conferences', url: prefix + 'conferences.html', type: 'Page' },
        ];
        searchIndex = searchIndex.concat(pages);

        // People
        try {
            const peopleRes = await fetch(prefix + 'data/people.json');
            const peopleData = await peopleRes.json();
            (peopleData.members || []).forEach(m => {
                searchIndex.push({
                    title: m.name,
                    subtitle: m.role,
                    url: prefix + 'people.html',
                    type: 'Person',
                    keywords: [m.name, m.role, m.research_en || '', m.bio_en || ''].join(' ')
                });
            });
        } catch(e) {}

        // Publications
        try {
            const pubRes = await fetch(prefix + 'data/publications.json');
            const pubs = await pubRes.json();
            (Array.isArray(pubs) ? pubs : []).forEach(p => {
                searchIndex.push({
                    title: p.title || '',
                    subtitle: (p.authors || '') + ' • ' + (p.journal || '') + ' ' + (p.year || ''),
                    url: p.doi ? 'https://doi.org/' + p.doi : prefix + 'publications.html',
                    type: 'Publication',
                    keywords: [p.title, p.authors, p.journal, p.year, p.abstract || ''].join(' ')
                });
            });
        } catch(e) {}

        // News
        try {
            const newsRes = await fetch(prefix + 'data/news.json');
            const newsData = await newsRes.json();
            (newsData.news || []).forEach(n => {
                searchIndex.push({
                    title: n.title_en || n.title || '',
                    subtitle: n.date || '',
                    url: prefix + 'news.html',
                    type: 'News',
                    keywords: [n.title_en, n.content_en, n.title_fr, n.content_fr].filter(Boolean).join(' ')
                });
            });
        } catch(e) {}

        indexBuilt = true;
    }

    function search(query) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 1rem;">Type to search people, publications, and pages…</p>';
            return;
        }
        const terms = query.toLowerCase().split(/\s+/);
        const results = searchIndex.filter(item => {
            const text = (item.keywords || item.title + ' ' + (item.subtitle || '')).toLowerCase();
            return terms.every(t => text.includes(t));
        }).slice(0, 15);

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 1rem;">No results found.</p>';
            return;
        }

        resultsContainer.innerHTML = results.map(r => `
            <a href="${r.url}" class="search-result-item" style="display: block; text-decoration: none; color: inherit;">
                <span class="result-type">${r.type}</span>
                <div class="result-title">${r.title}</div>
                ${r.subtitle ? `<div style="font-size: 0.85rem; color: var(--color-text-muted);">${r.subtitle}</div>` : ''}
            </a>
        `).join('');
    }

    // Open
    trigger.addEventListener('click', async () => {
        overlay.classList.add('active');
        await buildIndex();
        input.value = '';
        input.focus();
        search('');
    });

    // Close
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    // Search on type
    input.addEventListener('input', () => search(input.value));

    // Keyboard shortcut: Ctrl/Cmd + K
    document.addEventListener('keydown', async (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            overlay.classList.add('active');
            await buildIndex();
            input.value = '';
            input.focus();
            search('');
        }
        if (e.key === 'Escape') {
            overlay.classList.remove('active');
        }
    });
})();
