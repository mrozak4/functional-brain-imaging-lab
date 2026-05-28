// js/publications.js
document.addEventListener('DOMContentLoaded', async () => {
    const publicationsList = document.getElementById('publications-list');
    const searchInput = document.getElementById('pub-search');
    const filterSelect = document.getElementById('pub-filter');
    
    if (!publicationsList) return;

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
                html += `
                    <div class="publication-card ${pub.featured ? 'featured' : ''}">
                        <h4 class="pub-title">${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank">${pub.title}</a>` : pub.title}</h4>
                        <p class="pub-authors">${authorsStr}</p>
                        <p class="pub-meta"><span class="pub-journal">${pub.journal}</span> (${pub.year})</p>
                        <div class="pub-links">
                            ${pub.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/" target="_blank" class="btn-sm">PubMed</a>` : ''}
                            ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" class="btn-sm">DOI</a>` : ''}
                        </div>
                    </div>
                `;
            });
        }
        publicationsList.innerHTML = html;
    }
});
