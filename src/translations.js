// Translation System
class TranslationManager {
    constructor() {
        this.currentLang = 'fr';
        this.translations = {};
        this.supportedLanguages = ['fr', 'en', 'es'];
        this.init();
    }

    async init() {
        // Load all translations
        await this.loadTranslations();
        
        // Get language from localStorage or browser
        const savedLang = localStorage.getItem('preferred-language') || 
                         this.getBrowserLanguage() || 
                         'fr';
        
        await this.setLanguage(savedLang);
        
        // Setup language switcher
        this.setupLanguageSwitcher();
    }

    getBrowserLanguage() {
        const browserLang = navigator.language.substring(0, 2);
        return this.supportedLanguages.includes(browserLang) ? browserLang : 'fr';
    }

    async loadTranslations() {
        for (const lang of this.supportedLanguages) {
            try {
                const response = await fetch(`./translations/${lang}.json`);
                this.translations[lang] = await response.json();
            } catch (error) {
                console.error(`Failed to load ${lang} translations:`, error);
            }
        }
    }

    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            lang = 'fr';
        }
        
        this.currentLang = lang;
        localStorage.setItem('preferred-language', lang);
        
        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', lang);
        
        // Translate all elements
        this.translatePage();
        
        // Update active language button
        this.updateLanguageButtons();
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return translation;
    }

    setupLanguageSwitcher() {
        // Create language switcher if not exists
        const existingSwitcher = document.querySelector('.language-switcher');
        if (!existingSwitcher) {
            this.createLanguageSwitcher();
        }
        
        // Add event listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    }

    createLanguageSwitcher() {
        const languageNames = {
            'fr': 'Français',
            'en': 'English',
            'es': 'Español'
        };

        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <div class="lang-dropdown">
                <button class="lang-current" id="currentLang">
                    <span class="flag flag-${this.currentLang}"></span>
                    <span class="lang-name">${languageNames[this.currentLang]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="lang-options">
                    ${this.supportedLanguages.map(lang => `
                        <button class="lang-btn ${lang === this.currentLang ? 'active' : ''}" 
                                data-lang="${lang}">
                            <span class="flag flag-${lang}"></span>
                            <span>${languageNames[lang]}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add to navigation
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.appendChild(switcher);
        }

        // Add dropdown functionality
        const dropdown = switcher.querySelector('.lang-dropdown');
        const currentBtn = dropdown.querySelector('.lang-current');
        const options = dropdown.querySelector('.lang-options');

        currentBtn.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    updateLanguageButtons() {
        const currentBtn = document.querySelector('#currentLang .lang-name');
        const flagSpan = document.querySelector('#currentLang .flag');
        
        const languageNames = {
            'fr': 'Français',
            'en': 'English',
            'es': 'Español'
        };

        if (currentBtn) {
            currentBtn.textContent = languageNames[this.currentLang];
        }
        
        if (flagSpan) {
            flagSpan.className = `flag flag-${this.currentLang}`;
        }

        // Update active state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
        });
    }
}

// Initialize translation manager
const translationManager = new TranslationManager();
