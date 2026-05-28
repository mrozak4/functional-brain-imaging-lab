// js/publications.js
document.addEventListener('DOMContentLoaded', async () => {
    const publicationsList = document.getElementById('publications-list');
    const searchInput = document.getElementById('pub-search');
    const filterSelect = document.getElementById('pub-filter');
    
    if (!publicationsList) return;

    // Show skeleton loading
    publicationsList.innerHTML = Array(6).fill('').map(() => `
        <div class="skeleton skeleton-card"></div>
    `).join('');

    let publications = [];

    try {
        const prefix = I18n.locale === 'fr' ? '../' : './';
        let response = await fetch(`${prefix}data/publications.json`);
        if (!response.ok) {
             response = await fetch(`/data/publications.json`);
        }
        publications = await response.json();
        
        // Populate filter years
        if (filterSelect) {
            const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                filterSelect.appendChild(option);
            });

            // Also create year pill tabs
            const tabsContainer = document.getElementById('pub-year-tabs');
            if (tabsContainer) {
                const allTab = document.createElement('button');
                allTab.className = 'pub-year-tab active';
                allTab.textContent = 'All';
                allTab.dataset.year = '';
                allTab.addEventListener('click', () => {
                    filterSelect.value = '';
                    tabsContainer.querySelectorAll('.pub-year-tab').forEach(t => t.classList.remove('active'));
                    allTab.classList.add('active');
                    filterAndRender();
                });
                tabsContainer.appendChild(allTab);

                years.forEach(year => {
                    const tab = document.createElement('button');
                    tab.className = 'pub-year-tab';
                    tab.textContent = year;
                    tab.dataset.year = year;
                    tab.addEventListener('click', () => {
                        filterSelect.value = year;
                        tabsContainer.querySelectorAll('.pub-year-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        filterAndRender();
                    });
                    tabsContainer.appendChild(tab);
                });
            }
        }

        renderPublications(publications);

        if (searchInput) {
            searchInput.addEventListener('input', () => filterAndRender());
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', () => filterAndRender());
        }

    } catch (error) {
        console.error('Error loading publications data:', error);
    }

    function filterAndRender() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedYear = filterSelect ? filterSelect.value : '';

        const filtered = publications.filter(pub => {
            const matchSearch = pub.title.toLowerCase().includes(query) || 
                                pub.authors.some(a => a.toLowerCase().includes(query));
            const matchYear = selectedYear ? pub.year.toString() === selectedYear : true;
            return matchSearch && matchYear;
        });

        renderPublications(filtered);
    }

    function renderPublications(pubs) {
        let html = '';
        if (pubs.length === 0) {
            html = `<p>No publications found.</p>`;
        } else {
            // Sort by year descending
            pubs.sort((a, b) => b.year - a.year);
            
            pubs.forEach(pub => {
                const authorsStr = pub.authors.map(a => a.includes('Stefanovic') ? `<strong>${a}</strong>` : a).join(', ');
                const plainAuthors = pub.authors.join(', ');
                const citation = `${plainAuthors} (${pub.year}). ${pub.title} ${pub.journal}.${pub.doi ? ' https://doi.org/' + pub.doi : ''}`;
                const escapedCitation = citation.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                html += `
                    <div class="publication-card ${pub.featured ? 'featured' : ''}">
                        <h4 class="pub-title">${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank">${pub.title}</a>` : pub.title}</h4>
                        <p class="pub-authors">${authorsStr}</p>
                        <p class="pub-meta"><span class="pub-journal">${pub.journal}</span> (${pub.year})</p>
                        <div class="pub-links">
                            ${pub.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/" target="_blank" class="btn-sm">PubMed</a>` : ''}
                            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" class="btn-sm">DOI</a>` : ''}
                            <button class="copy-citation-btn" onclick="copyCitation(this, '${escapedCitation}')" title="Copy APA citation">📋 Cite</button>
                        </div>
                    </div>
                `;
            });
        }
        publicationsList.innerHTML = html;
    }
});
