// js/news.js
document.addEventListener('DOMContentLoaded', async () => {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    try {
        // Determine prefix based on pathname so it works reliably before I18n is initialized
        const isFr = window.location.pathname.includes('/fr/');
        const prefix = isFr ? '../' : './';
        
        const response = await fetch(`${prefix}data/news.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let newsItems = await response.json();

        // Ensure news items are always sorted by date (newest first)
        newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Helper to format dates
        const formatNewsDate = (dateStr) => {
            const date = new Date(dateStr + 'T00:00:00'); // avoid timezone shifts
            const options = { month: 'long', year: 'numeric' };
            
            // We can check the HTML lang attribute for the locale since I18n might be loading
            const htmlLang = document.documentElement.lang || 'en';
            const localeCode = htmlLang.startsWith('fr') ? 'fr-CA' : 'en-US';
            return date.toLocaleDateString(localeCode, options);
        };

        const isFrLocale = document.documentElement.lang && document.documentElement.lang.startsWith('fr');

        let html = '';
        
        // Check if there is a data-limit attribute
        const limitStr = newsContainer.getAttribute('data-limit');
        const hasLimit = limitStr !== null;
        let displayNews = newsItems;
        
        if (hasLimit) {
            const limit = parseInt(limitStr, 10);
            displayNews = newsItems.slice(0, limit);
        }
        
        displayNews.forEach(item => {
            const title = isFrLocale ? item.title_fr : item.title_en;
            const content = isFrLocale ? item.content_fr : item.content_en;
            const dateFormatted = formatNewsDate(item.date);
            const readMoreText = isFrLocale ? 'Lire la suite &rarr;' : 'Read More &rarr;';
            
            html += `
                <div class="card">
                    <span class="tagline">${dateFormatted}</span>
                    <h3>${title}</h3>
                    <p>${content}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank">${readMoreText}</a>` : ''}
                </div>
            `;
        });

        // Add a "View all news" link at the bottom only if we limited the items
        if (hasLimit && newsItems.length > displayNews.length) {
            const allNewsLink = isFrLocale ? 'nouvelles.html' : 'news.html';
            const allNewsText = isFrLocale ? 'Voir toutes les nouvelles' : 'View All News';
            
            html += `
                <div style="text-align: center; margin-top: 2rem; grid-column: 1 / -1;">
                    <a href="${allNewsLink}" class="btn btn-primary">${allNewsText}</a>
                </div>
            `;
        }

        newsContainer.innerHTML = html;

    } catch (error) {
        console.error('Error loading news data:', error);
        newsContainer.innerHTML = '<p>Error loading news items.</p>';
    }
});
