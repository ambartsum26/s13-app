// Keep RU/FR consistent on the login page and after authentication.
// Only the non-sensitive display language is persisted.
const LANGUAGE_KEY = 's13-ui-language';
const originalToggleLanguage = window.toggleLanguage;

function readLanguage() {
    try {
        const value = window.localStorage.getItem(LANGUAGE_KEY);
        return value === 'fr' || value === 'ru' ? value : null;
    } catch {
        return null;
    }
}

function saveLanguage(language) {
    try {
        window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
        // Browsers with restricted storage still allow session-only language changes.
    }
}

if (typeof originalToggleLanguage === 'function') {
    // app-core.js initializes its private language state as RU. The inline
    // head preload already paints the login screen in FR when it was saved.
    // Synchronize the core state once, then preserve subsequent user choices.
    if (readLanguage() === 'fr') originalToggleLanguage();

    window.toggleLanguage = (...args) => {
        const result = originalToggleLanguage(...args);
        saveLanguage(document.documentElement.lang === 'fr' ? 'fr' : 'ru');
        return result;
    };

    // Other tabs may update the same UI preference.
    window.addEventListener('storage', event => {
        if (event.key !== LANGUAGE_KEY) return;
        if (event.newValue !== 'fr' && event.newValue !== 'ru') return;
        if (document.documentElement.lang !== event.newValue) {
            originalToggleLanguage();
        }
    });
}
