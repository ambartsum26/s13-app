const html = document.documentElement;

function isAppleTouchDevice() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const touchPoints = navigator.maxTouchPoints || 0;

    return /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1);
}

if (isAppleTouchDevice()) {
    html.classList.add('s13-apple-liquid-glass');
}

const style = document.createElement('style');
style.id = 's13-apple-liquid-glass-style';
style.textContent = `
html.s13-apple-liquid-glass {
    --s13-glass-surface: rgba(39, 39, 49, .56);
    --s13-glass-surface-strong: rgba(34, 34, 44, .72);
    --s13-glass-control: rgba(67, 66, 82, .50);
    --s13-glass-control-pressed: rgba(92, 91, 110, .68);
    --s13-glass-border: rgba(255, 255, 255, .16);
    --s13-glass-border-soft: rgba(255, 255, 255, .10);
    --s13-glass-highlight: rgba(255, 255, 255, .22);
    --s13-glass-shadow: 0 12px 34px rgba(0, 0, 0, .24);
}

html.s13-apple-liquid-glass body {
    background:
        radial-gradient(900px 520px at 8% -8%, rgba(32,191,114,.12), transparent 64%),
        radial-gradient(760px 520px at 100% 12%, rgba(89,111,230,.10), transparent 62%),
        var(--dz-bg) !important;
    background-attachment: fixed !important;
}

html.s13-apple-liquid-glass .app-header,
html.s13-apple-liquid-glass #city-switcher-panel,
html.s13-apple-liquid-glass .app-city-controls,
html.s13-apple-liquid-glass .app-status-toolbar,
html.s13-apple-liquid-glass #publishers-page > .glass-panel,
html.s13-apple-liquid-glass .s13-popup-overlay > .glass-panel {
    position: relative;
    isolation: isolate;
    background: var(--s13-glass-surface) !important;
    border: 1px solid var(--s13-glass-border) !important;
    box-shadow: var(--s13-glass-shadow), inset 0 1px 0 rgba(255,255,255,.08) !important;
    -webkit-backdrop-filter: saturate(1.28) blur(24px) !important;
    backdrop-filter: saturate(1.28) blur(24px) !important;
}

html.s13-apple-liquid-glass .app-header::before,
html.s13-apple-liquid-glass #city-switcher-panel::before,
html.s13-apple-liquid-glass .app-city-controls::after,
html.s13-apple-liquid-glass .app-status-toolbar::before,
html.s13-apple-liquid-glass #publishers-page > .glass-panel::after,
html.s13-apple-liquid-glass .s13-popup-overlay > .glass-panel::before {
    content: '' !important;
    display: block !important;
    position: absolute;
    z-index: -1;
    pointer-events: none;
    inset: 1px 1px auto 1px;
    height: 42%;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,0));
    opacity: .72;
}

html.s13-apple-liquid-glass .app-header {
    background: rgba(35,35,45,.52) !important;
}

html.s13-apple-liquid-glass #city-switcher-panel,
html.s13-apple-liquid-glass .app-city-controls,
html.s13-apple-liquid-glass .app-status-toolbar,
html.s13-apple-liquid-glass #publishers-page > .glass-panel {
    background: rgba(40,40,51,.50) !important;
}

html.s13-apple-liquid-glass .app-section-button,
html.s13-apple-liquid-glass #auth-logout,
html.s13-apple-liquid-glass .app-city-controls button,
html.s13-apple-liquid-glass .app-status-actions button,
html.s13-apple-liquid-glass .app-status-actions a,
html.s13-apple-liquid-glass #city-menu button,
html.s13-apple-liquid-glass #publisher-picker-list button,
html.s13-apple-liquid-glass #publisher-picker-add,
html.s13-apple-liquid-glass #publishers-list > div button,
html.s13-apple-liquid-glass .publisher-row button,
html.s13-apple-liquid-glass .s13-publisher-suggestions button {
    background: var(--s13-glass-control) !important;
    border: 1px solid var(--s13-glass-border-soft) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08) !important;
    -webkit-backdrop-filter: saturate(1.18) blur(16px) !important;
    backdrop-filter: saturate(1.18) blur(16px) !important;
}

html.s13-apple-liquid-glass [data-language-toggle] {
    background: rgba(18,18,25,.46) !important;
    border: 1px solid var(--s13-glass-border-soft) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
    -webkit-backdrop-filter: saturate(1.18) blur(18px) !important;
    backdrop-filter: saturate(1.18) blur(18px) !important;
}

html.s13-apple-liquid-glass #lang-slider {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18) !important;
}

html.s13-apple-liquid-glass #cities-container button {
    background: rgba(66,65,80,.46) !important;
    border: 1px solid rgba(255,255,255,.09) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07) !important;
    -webkit-backdrop-filter: saturate(1.16) blur(14px) !important;
    backdrop-filter: saturate(1.16) blur(14px) !important;
}

html.s13-apple-liquid-glass #cities-container button.bg-indigo-600,
html.s13-apple-liquid-glass #cities-container button.bg-indigo-600:hover,
html.s13-apple-liquid-glass #cities-container button.bg-indigo-600:active {
    background: var(--dz-green) !important;
    border-color: rgba(255,255,255,.14) !important;
    color: #fff !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18) !important;
}

html.s13-apple-liquid-glass .status-chip {
    border: 1px solid rgba(255,255,255,.13) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important;
    -webkit-backdrop-filter: saturate(1.18) blur(18px) !important;
    backdrop-filter: saturate(1.18) blur(18px) !important;
}

html.s13-apple-liquid-glass .status-chip-free { background: rgba(11,143,98,.72) !important; }
html.s13-apple-liquid-glass .status-chip-busy { background: rgba(47,88,188,.72) !important; }
html.s13-apple-liquid-glass .status-chip-overdue { background: rgba(184,43,80,.72) !important; }
html.s13-apple-liquid-glass .status-chip-waiting { background: rgba(167,107,13,.72) !important; }

html.s13-apple-liquid-glass #publishers-search,
html.s13-apple-liquid-glass #publisher-picker-search,
html.s13-apple-liquid-glass #dialog-fields input,
html.s13-apple-liquid-glass #dialog-fields select,
html.s13-apple-liquid-glass #dialog-fields textarea {
    background: rgba(17,17,24,.48) !important;
    border: 1px solid rgba(255,255,255,.10) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.05) !important;
    -webkit-backdrop-filter: saturate(1.12) blur(16px) !important;
    backdrop-filter: saturate(1.12) blur(16px) !important;
}

html.s13-apple-liquid-glass #publishers-search:focus,
html.s13-apple-liquid-glass #publisher-picker-search:focus,
html.s13-apple-liquid-glass #dialog-fields input:focus,
html.s13-apple-liquid-glass #dialog-fields select:focus,
html.s13-apple-liquid-glass #dialog-fields textarea:focus {
    background: rgba(27,27,36,.62) !important;
    border-color: rgba(49,209,127,.34) !important;
    box-shadow: 0 0 0 3px rgba(49,209,127,.10), inset 0 1px 0 rgba(255,255,255,.06) !important;
}

html.s13-apple-liquid-glass #publishers-list > div,
html.s13-apple-liquid-glass .publisher-row {
    background: rgba(45,45,57,.58) !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
    -webkit-backdrop-filter: saturate(1.12) blur(14px) !important;
    backdrop-filter: saturate(1.12) blur(14px) !important;
}

html.s13-apple-liquid-glass #city-menu,
html.s13-apple-liquid-glass .s13-publisher-suggestions {
    background: rgba(34,34,44,.76) !important;
    border: 1px solid var(--s13-glass-border) !important;
    box-shadow: 0 22px 60px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.08) !important;
    -webkit-backdrop-filter: saturate(1.30) blur(28px) !important;
    backdrop-filter: saturate(1.30) blur(28px) !important;
}

html.s13-apple-liquid-glass .s13-popup-overlay {
    background: rgba(9,9,14,.48) !important;
    -webkit-backdrop-filter: saturate(1.08) blur(14px) !important;
    backdrop-filter: saturate(1.08) blur(14px) !important;
}

html.s13-apple-liquid-glass .s13-popup-overlay > .glass-panel {
    background: rgba(39,39,50,.70) !important;
    border-color: rgba(255,255,255,.18) !important;
    box-shadow: 0 28px 80px rgba(0,0,0,.40), inset 0 1px 0 rgba(255,255,255,.10) !important;
}

html.s13-apple-liquid-glass #history-list > div {
    background: rgba(29,29,39,.60) !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    backdrop-filter: blur(12px) !important;
}

/* Territory cards intentionally stay dense and readable; only their controls become glass. */
html.s13-apple-liquid-glass .territory-card .card-icon-action,
html.s13-apple-liquid-glass .territory-card a.card-map-action,
html.s13-apple-liquid-glass .territory-card .copy-map-btn.card-icon-action,
html.s13-apple-liquid-glass .territory-card a.mini-btn.card-map-action,
html.s13-apple-liquid-glass .territory-card .card-main-action {
    background: rgba(28,28,37,.62) !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08) !important;
    -webkit-backdrop-filter: saturate(1.16) blur(14px) !important;
    backdrop-filter: saturate(1.16) blur(14px) !important;
}

/* Finger interaction: slight optical compression instead of desktop hover. */
html.s13-apple-liquid-glass .app-section-button:active,
html.s13-apple-liquid-glass #auth-logout:active,
html.s13-apple-liquid-glass .app-city-controls button:active,
html.s13-apple-liquid-glass .app-status-actions button:active,
html.s13-apple-liquid-glass .app-status-actions a:active,
html.s13-apple-liquid-glass #city-menu button:active,
html.s13-apple-liquid-glass #publisher-picker-list button:active,
html.s13-apple-liquid-glass #publisher-picker-add:active,
html.s13-apple-liquid-glass #publishers-list > div button:active,
html.s13-apple-liquid-glass .publisher-row button:active {
    background: var(--s13-glass-control-pressed) !important;
    transform: scale(.965) !important;
}

html.s13-apple-liquid-glass .territory-card .card-icon-action:active,
html.s13-apple-liquid-glass .territory-card a.card-map-action:active,
html.s13-apple-liquid-glass .territory-card .copy-map-btn.card-icon-action:active,
html.s13-apple-liquid-glass .territory-card a.mini-btn.card-map-action:active,
html.s13-apple-liquid-glass .territory-card .card-main-action:active {
    background: rgba(68,68,82,.76) !important;
    transform: scale(.955) !important;
}

/* JW keeps its existing semantic Firebase green/red fill and never becomes glass or glowing. */
html.s13-apple-liquid-glass .app-logo {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
}

@media (max-width: 639px) {
    html.s13-apple-liquid-glass .app-header,
    html.s13-apple-liquid-glass #city-switcher-panel,
    html.s13-apple-liquid-glass .app-city-controls,
    html.s13-apple-liquid-glass .app-status-toolbar,
    html.s13-apple-liquid-glass #publishers-page > .glass-panel {
        -webkit-backdrop-filter: saturate(1.24) blur(20px) !important;
        backdrop-filter: saturate(1.24) blur(20px) !important;
    }

    html.s13-apple-liquid-glass .s13-popup-overlay > .glass-panel {
        border-bottom-color: rgba(255,255,255,.11) !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    html.s13-apple-liquid-glass *,
    html.s13-apple-liquid-glass *::before,
    html.s13-apple-liquid-glass *::after {
        transition-duration: .01ms !important;
    }
}

@media (prefers-reduced-transparency: reduce) {
    html.s13-apple-liquid-glass .app-header,
    html.s13-apple-liquid-glass #city-switcher-panel,
    html.s13-apple-liquid-glass .app-city-controls,
    html.s13-apple-liquid-glass .app-status-toolbar,
    html.s13-apple-liquid-glass #publishers-page > .glass-panel,
    html.s13-apple-liquid-glass .s13-popup-overlay > .glass-panel,
    html.s13-apple-liquid-glass #city-menu,
    html.s13-apple-liquid-glass .s13-publisher-suggestions {
        background: rgba(38,38,49,.94) !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
    }
}
`;
document.head.appendChild(style);
