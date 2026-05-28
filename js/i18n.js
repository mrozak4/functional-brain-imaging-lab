// js/i18n.js
const I18n = {
    locale: 'en',
    translations: {},

    async init() {
        // Detect locale from URL (e.g., /fr/ or data-lang="fr" on html)
        const path = window.location.pathname;
        if (path.includes('/fr/')) {
            this.locale = 'fr';
        } else {
            const htmlLang = document.documentElement.lang;
            if (htmlLang && htmlLang.startsWith('fr')) {
                this.locale = 'fr';
            }
        }
        
        // Load appropriate translation file
        try {
            const prefix = this.locale === 'fr' ? '../' : './';
            const response = await fetch(`${prefix}data/i18n/${this.locale}.json`);
            if (response.ok) {
                this.translations = await response.json();
            } else {
                // If nested prefix failed, try root
                const rootResponse = await fetch(`/data/i18n/${this.locale}.json`);
                if (rootResponse.ok) {
                    this.translations = await rootResponse.json();
                }
            }
        } catch (error) {
            console.error('Error loading translations:', error);
        }

        this.applyTranslations();
    },

    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key
            }
        }
        return value;
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});
