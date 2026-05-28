// js/news.js
document.addEventListener('DOMContentLoaded', async () => {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    try {
        const prefix = I18n.locale === 'fr' ? '../' : './';
        let response = await fetch(`${prefix}data/news.json`);
        if (!response.ok) {
            response = await fetch(`/data/news.json`);
        }
        const newsItems = await response.json();

        // Helper to format dates, e.g., "2020-09-01" -> "September 2020" or "Septembre 2020"
        const formatNewsDate = (dateStr) => {
            const date = new Date(dateStr + 'T00:00:00'); // avoid timezone shifts
            const options = { month: 'long', year: 'numeric' };
            const localeCode = I18n.locale === 'fr' ? 'fr-CA' : 'en-US';
            return date.toLocaleDateString(localeCode, options);
        };

        let html = '';
        newsItems.forEach(item => {
            const title = I18n.locale === 'fr' ? item.title_fr : item.title_en;
            const content = I18n.locale === 'fr' ? item.content_fr : item.content_en;
            const dateFormatted = formatNewsDate(item.date);
            const readMoreText = I18n.locale === 'fr' ? 'Lire la suite &rarr;' : 'Read More &rarr;';
            
            html += `
                <div class="card">
                    <span class="tagline">${dateFormatted}</span>
                    <h3>${title}</h3>
                    <p>${content}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank">${readMoreText}</a>` : ''}
                </div>
            `;
        });

        newsContainer.innerHTML = html;

    } catch (error) {
        console.error('Error loading news data:', error);
        newsContainer.innerHTML = '<p>Error loading news items.</p>';
    }
});
