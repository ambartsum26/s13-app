const html = document.documentElement;

function markSamsungDevice() {
    if (html.classList.contains('s13-apple-liquid-glass')) return;
    html.classList.add('s13-samsung-oneui');
}

function detectSamsungDevice() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const syncSamsung = /SamsungBrowser/i.test(ua) || /\bSAMSUNG\b/i.test(ua) || /\bSM-[A-Z0-9-]+\b/i.test(ua + ' ' + platform);

    if (syncSamsung) markSamsungDevice();

    const uaData = navigator.userAgentData;
    if (!uaData?.getHighEntropyValues) return;

    uaData.getHighEntropyValues(['model', 'platform']).then(values => {
        const model = String(values?.model || '');
        const platformName = String(values?.platform || '');
        if (/^SM-/i.test(model) || /samsung/i.test(model) || /samsung/i.test(platformName)) markSamsungDevice();
    }).catch(() => {});
}

detectSamsungDevice();

const style = document.createElement('style');
style.id = 's13-samsung-oneui-style';
style.textContent = `
html.s13-samsung-oneui {
    --s13-oneui-bg: #0f1014;
    --s13-oneui-surface: #23242a;
    --s13-oneui-surface-2: #2c2d34;
    --s13-oneui-control: #373840;
    --s13-oneui-control-pressed: #45464f;
    --s13-oneui-border: rgba(255,255,255,.065);
    --s13-oneui-shadow: 0 10px 28px rgba(0,0,0,.22);
}

html.s13-samsung-oneui body {
    background: var(--s13-oneui-bg) !important;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}

html.s13-samsung-oneui .glass-panel,
html.s13-samsung-oneui .app-header,
html.s13-samsung-oneui #city-switcher-panel,
html.s13-samsung-oneui .app-city-controls,
html.s13-samsung-oneui .app-status-toolbar,
html.s13-samsung-oneui #publishers-page > .glass-panel {
    background: var(--s13-oneui-surface) !important;
    border: 1px solid var(--s13-oneui-border) !important;
    box-shadow: var(--s13-oneui-shadow) !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}

html.s13-samsung-oneui .app-header {
    min-height: 68px !important;
    padding: 10px 12px !important;
    border-radius: 26px !important;
}

html.s13-samsung-oneui .app-logo {
    border-radius: 15px !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui .app-header-actions {
    gap: 8px !important;
}

html.s13-samsung-oneui .app-section-button,
html.s13-samsung-oneui #auth-logout,
html.s13-samsung-oneui .app-city-controls button,
html.s13-samsung-oneui .app-status-actions button,
html.s13-samsung-oneui .app-status-actions a,
html.s13-samsung-oneui #city-menu button,
html.s13-samsung-oneui #publisher-picker-list button,
html.s13-samsung-oneui #publisher-picker-add,
html.s13-samsung-oneui #publishers-list > div button,
html.s13-samsung-oneui .publisher-row button,
html.s13-samsung-oneui .s13-publisher-suggestions button {
    background: var(--s13-oneui-control) !important;
    border: 1px solid var(--s13-oneui-border) !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui .app-section-button,
html.s13-samsung-oneui #auth-logout {
    border-radius: 999px !important;
    padding-inline: 16px !important;
}

html.s13-samsung-oneui [data-language-toggle] {
    background: #17181d !important;
    border: 1px solid var(--s13-oneui-border) !important;
    border-radius: 999px !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #lang-slider {
    border-radius: 999px !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #city-switcher-panel,
html.s13-samsung-oneui .app-city-controls,
html.s13-samsung-oneui .app-status-toolbar,
html.s13-samsung-oneui #publishers-page > .glass-panel {
    border-radius: 24px !important;
}

html.s13-samsung-oneui #city-switcher-panel {
    padding: 9px !important;
}

html.s13-samsung-oneui #cities-container {
    gap: 7px !important;
}

html.s13-samsung-oneui #cities-container button {
    min-height: 50px !important;
    border-radius: 18px !important;
    background: var(--s13-oneui-surface-2) !important;
    border: 1px solid var(--s13-oneui-border) !important;
    color: #e8e8ef !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #cities-container button.bg-indigo-600,
html.s13-samsung-oneui #cities-container button.bg-indigo-600:hover,
html.s13-samsung-oneui #cities-container button.bg-indigo-600:active {
    background: var(--dz-green) !important;
    color: #fff !important;
    border-color: transparent !important;
}

html.s13-samsung-oneui .app-city-controls {
    padding: 16px !important;
}

html.s13-samsung-oneui #active-city-title {
    font-size: clamp(1.12rem, 2vw, 1.38rem) !important;
    letter-spacing: -.02em !important;
}

html.s13-samsung-oneui .app-status-toolbar {
    padding: 10px !important;
}

html.s13-samsung-oneui .status-chip {
    min-height: 62px !important;
    border-radius: 20px !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui .status-chip-free { background: #0d815b !important; }
html.s13-samsung-oneui .status-chip-busy { background: #3157ac !important; }
html.s13-samsung-oneui .status-chip-overdue { background: #a82e50 !important; }
html.s13-samsung-oneui .status-chip-waiting { background: #986512 !important; }

html.s13-samsung-oneui .status-chip b {
    font-size: 1.42rem !important;
}

html.s13-samsung-oneui #publishers-search,
html.s13-samsung-oneui #publisher-picker-search,
html.s13-samsung-oneui #dialog-fields input,
html.s13-samsung-oneui #dialog-fields select,
html.s13-samsung-oneui #dialog-fields textarea {
    min-height: 50px !important;
    border-radius: 20px !important;
    background: #18191e !important;
    border: 1px solid rgba(255,255,255,.075) !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #publishers-search:focus,
html.s13-samsung-oneui #publisher-picker-search:focus,
html.s13-samsung-oneui #dialog-fields input:focus,
html.s13-samsung-oneui #dialog-fields select:focus,
html.s13-samsung-oneui #dialog-fields textarea:focus {
    background: #1d1e24 !important;
    border-color: rgba(32,191,114,.42) !important;
    box-shadow: 0 0 0 3px rgba(32,191,114,.10) !important;
}

html.s13-samsung-oneui #publishers-list > div,
html.s13-samsung-oneui .publisher-row {
    background: var(--s13-oneui-surface-2) !important;
    border: 1px solid var(--s13-oneui-border) !important;
    border-radius: 20px !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #publishers-list > div button,
html.s13-samsung-oneui .publisher-row button {
    border-radius: 16px !important;
}

html.s13-samsung-oneui #city-menu,
html.s13-samsung-oneui .s13-publisher-suggestions {
    background: #2a2b32 !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    border-radius: 24px !important;
    box-shadow: 0 18px 50px rgba(0,0,0,.36) !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}

html.s13-samsung-oneui #city-menu button,
html.s13-samsung-oneui #publisher-picker-list button,
html.s13-samsung-oneui .s13-publisher-suggestions button {
    min-height: 50px !important;
    border-radius: 16px !important;
}

html.s13-samsung-oneui .s13-popup-overlay {
    background: rgba(0,0,0,.60) !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}

html.s13-samsung-oneui .s13-popup-overlay > .glass-panel {
    background: #27282f !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    border-radius: 28px !important;
    box-shadow: 0 24px 70px rgba(0,0,0,.42) !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
}

html.s13-samsung-oneui #history-list > div {
    background: #1c1d22 !important;
    border: 1px solid rgba(255,255,255,.06) !important;
    border-radius: 18px !important;
}

html.s13-samsung-oneui .territory-card {
    border-radius: 22px !important;
    box-shadow: 0 10px 28px rgba(0,0,0,.24) !important;
}

html.s13-samsung-oneui .territory-card .card-icon-action,
html.s13-samsung-oneui .territory-card a.card-map-action,
html.s13-samsung-oneui .territory-card .copy-map-btn.card-icon-action,
html.s13-samsung-oneui .territory-card a.mini-btn.card-map-action {
    border-radius: 16px !important;
    background: rgba(24,25,30,.78) !important;
    border: 1px solid rgba(255,255,255,.09) !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui .territory-card .card-main-action {
    border-radius: 20px !important;
    background: rgba(24,25,30,.82) !important;
    border: 1px solid rgba(255,255,255,.09) !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #auth-panel {
    background: var(--s13-oneui-surface) !important;
    border: 1px solid var(--s13-oneui-border) !important;
    border-radius: 28px !important;
    box-shadow: 0 24px 70px rgba(0,0,0,.30) !important;
}

html.s13-samsung-oneui #auth-panel input {
    min-height: 50px !important;
    background: #18191e !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    border-radius: 18px !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #auth-panel button:not([data-language-toggle]),
html.s13-samsung-oneui #auth-panel #auth-submit {
    min-height: 50px !important;
    border-radius: 999px !important;
    box-shadow: none !important;
}

html.s13-samsung-oneui #auth-panel #auth-submit {
    background: var(--dz-green) !important;
}

html.s13-samsung-oneui #auth-panel [data-language-toggle],
html.s13-samsung-oneui #auth-panel #auth-language {
    border-radius: 999px !important;
    background: #17181d !important;
    border: 1px solid var(--s13-oneui-border) !important;
}

html.s13-samsung-oneui .app-section-button:active,
html.s13-samsung-oneui #auth-logout:active,
html.s13-samsung-oneui .app-city-controls button:active,
html.s13-samsung-oneui .app-status-actions button:active,
html.s13-samsung-oneui .app-status-actions a:active,
html.s13-samsung-oneui #city-menu button:active,
html.s13-samsung-oneui #publisher-picker-list button:active,
html.s13-samsung-oneui #publisher-picker-add:active,
html.s13-samsung-oneui #publishers-list > div button:active,
html.s13-samsung-oneui .publisher-row button:active {
    background: var(--s13-oneui-control-pressed) !important;
    transform: scale(.97) !important;
}

html.s13-samsung-oneui .app-logo {
    box-shadow: none !important;
}

@media (max-width: 639px) {
    html.s13-samsung-oneui body {
        padding: 8px !important;
    }

    html.s13-samsung-oneui .app-header {
        top: 6px !important;
        min-height: 64px !important;
        padding: 8px 9px !important;
        border-radius: 24px !important;
        margin-bottom: 10px !important;
    }

    html.s13-samsung-oneui .app-logo {
        width: 42px !important;
        height: 42px !important;
        flex-basis: 42px !important;
        border-radius: 15px !important;
    }

    html.s13-samsung-oneui #city-switcher-panel,
    html.s13-samsung-oneui .app-city-controls,
    html.s13-samsung-oneui .app-status-toolbar,
    html.s13-samsung-oneui #publishers-page > .glass-panel {
        border-radius: 22px !important;
    }

    html.s13-samsung-oneui .app-status-grid {
        grid-template-columns: repeat(2, minmax(0,1fr)) !important;
    }

    html.s13-samsung-oneui .status-chip {
        min-height: 60px !important;
        border-radius: 18px !important;
    }

    html.s13-samsung-oneui .territory-card {
        border-radius: 22px !important;
    }

    /* One UI phone dialogs behave like large bottom sheets. */
    html.s13-samsung-oneui .s13-popup-overlay {
        align-items: flex-end !important;
        padding: 8px !important;
    }

    html.s13-samsung-oneui .s13-popup-overlay > .glass-panel {
        width: 100% !important;
        max-width: none !important;
        max-height: calc(100dvh - 16px) !important;
        overflow-y: auto !important;
        border-radius: 30px 30px 22px 22px !important;
        padding: 18px !important;
    }

    html.s13-samsung-oneui .s13-popup-overlay > .glass-panel::before {
        content: '';
        display: block;
        width: 38px;
        height: 4px;
        margin: -4px auto 14px;
        border-radius: 999px;
        background: rgba(255,255,255,.20);
    }

    html.s13-samsung-oneui #publishers-list > div,
    html.s13-samsung-oneui .publisher-row {
        border-radius: 20px !important;
    }
}

@media (min-width: 640px) and (max-width: 1366px) {
    html.s13-samsung-oneui .app-header,
    html.s13-samsung-oneui #city-switcher-panel,
    html.s13-samsung-oneui .app-city-controls,
    html.s13-samsung-oneui .app-status-toolbar,
    html.s13-samsung-oneui #publishers-page > .glass-panel {
        border-radius: 26px !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    html.s13-samsung-oneui *,
    html.s13-samsung-oneui *::before,
    html.s13-samsung-oneui *::after {
        transition-duration: .01ms !important;
    }
}
`;

document.head.appendChild(style);
