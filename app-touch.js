const touchStyle = document.createElement('style');
touchStyle.id = 's13-touch-optimizations';
touchStyle.textContent = `
/* Final interaction layer for phones, tablets and touch-only iPad use. */
html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
}

@media (max-width: 639px) {
    body {
        padding-top: max(7px, env(safe-area-inset-top)) !important;
        padding-right: max(7px, env(safe-area-inset-right)) !important;
        padding-bottom: max(7px, env(safe-area-inset-bottom)) !important;
        padding-left: max(7px, env(safe-area-inset-left)) !important;
    }

    .app-header { gap: 6px !important; }
    .app-header-actions { gap: 6px !important; }
}

/* Primary-touch devices: phones and tablets. */
@media (hover: none), (pointer: coarse) {
    html,
    body {
        overscroll-behavior-x: none;
    }

    button,
    a[href],
    [role="button"] {
        min-height: 48px;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none;
        user-select: none;
        -webkit-user-select: none;
    }

    input,
    select,
    textarea {
        min-height: 48px !important;
        font-size: 16px !important;
        -webkit-tap-highlight-color: transparent !important;
    }

    #auth-panel input {
        height: 48px !important;
        min-height: 48px !important;
        font-size: 16px !important;
    }

    #auth-panel button,
    .app-section-button,
    .app-city-controls button,
    .app-status-toolbar button,
    .app-status-toolbar a,
    #city-menu button,
    #publisher-picker-list button,
    #publisher-picker-add,
    .s13-popup-overlay button {
        min-height: 48px !important;
    }

    .app-section-button {
        height: 48px !important;
    }

    [data-language-toggle] {
        width: 88px !important;
        height: 48px !important;
        min-height: 48px !important;
    }

    #publishers-search,
    #publisher-picker-search,
    #dialog-fields input,
    #dialog-fields select,
    #dialog-fields textarea {
        height: 48px !important;
        min-height: 48px !important;
        font-size: 16px !important;
    }

    #cities-container {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-x: contain;
        scroll-padding-inline: 8px;
        touch-action: pan-x !important;
    }

    #cities-container button {
        min-height: 50px !important;
    }

    #publishers-list { grid-auto-rows: 68px !important; }

    #publishers-list > div,
    .publisher-row {
        height: 68px !important;
        min-height: 68px !important;
        max-height: 68px !important;
        grid-template-columns: minmax(0,1fr) 104px !important;
    }

    #publishers-list > div > div,
    .publisher-row > div {
        grid-template-columns: repeat(2,48px) !important;
        width: 104px !important;
        min-width: 104px !important;
        max-width: 104px !important;
    }

    #publishers-list > div button,
    .publisher-row button,
    .territory-card .card-icon-action,
    .territory-card a.card-map-action,
    .territory-card .copy-map-btn.card-icon-action,
    .territory-card a.mini-btn.card-map-action {
        width: 48px !important;
        min-width: 48px !important;
        max-width: 48px !important;
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
    }

    .territory-card .card-main-action {
        width: 60px !important;
        min-width: 60px !important;
        max-width: 60px !important;
        height: 60px !important;
        min-height: 60px !important;
        max-height: 60px !important;
    }

    .status-chip.s13-filter-control,
    .status-chip[role="button"] {
        min-height: 58px !important;
        touch-action: manipulation !important;
    }

    .s13-popup-overlay {
        overscroll-behavior: contain;
        padding-bottom: max(7px, env(safe-area-inset-bottom)) !important;
    }

    .s13-popup-overlay > .glass-panel {
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
    }

    /* Touch-only: prevent hover from sticking after a tap. */
    button:not([data-language-toggle]):not(:disabled):hover,
    a#map-link:hover,
    a.mini-btn:hover,
    .copy-map-btn:hover {
        background: var(--dz-control) !important;
        color: #fff !important;
        box-shadow: none !important;
        transform: none !important;
    }

    [data-language-toggle]:hover { transform: none !important; }

    #city-menu button:hover,
    #publisher-picker-list button:hover {
        background: #393846 !important;
        color: #fff !important;
        transform: none !important;
    }

    #cities-container button:hover {
        background: #33323f !important;
        color: #c8c7d1 !important;
        transform: none !important;
    }

    #cities-container button.bg-indigo-600,
    #cities-container button.bg-indigo-600:hover,
    #cities-container button.bg-indigo-600:active {
        background: var(--dz-green) !important;
        color: #fff !important;
        transform: none !important;
    }

    #publishers-list > div:hover,
    .publisher-row:hover {
        background: var(--dz-panel-soft) !important;
        transform: none !important;
    }

    .territory-card:hover {
        transform: none !important;
        filter: none !important;
        box-shadow: 0 12px 30px rgba(0,0,0,.20) !important;
    }

    .territory-card a.mini-btn.card-map-action:hover,
    .territory-card .card-icon-action:not(:disabled):hover {
        background: #2b2b37 !important;
        color: #fff !important;
        transform: none !important;
    }

    .territory-card a.mini-btn.card-map-action:hover i,
    .territory-card .card-icon-action:not(:disabled):hover i {
        color: #fff !important;
    }

    .territory-card .card-main-action:not(:disabled):hover {
        background: #262631 !important;
        color: #fff !important;
        transform: none !important;
    }

    .territory-card .card-main-action:not(:disabled):hover i {
        color: #fff !important;
    }

    /* Clear pressed feedback for finger input. */
    button:not([data-language-toggle]):not(:disabled):active,
    a#map-link:active,
    a.mini-btn:active,
    .copy-map-btn:active,
    #city-menu button:active,
    #publisher-picker-list button:active,
    #publisher-picker-add:active {
        background: var(--dz-green-bright) !important;
        color: #11141a !important;
        transform: scale(.975) !important;
    }

    [data-language-toggle]:active {
        transform: scale(.975) !important;
    }

    .territory-card a.mini-btn.card-map-action:active,
    .territory-card .card-icon-action:not(:disabled):active,
    .territory-card .card-main-action:not(:disabled):active {
        background: var(--dz-green-bright) !important;
        color: #11141a !important;
        transform: scale(.965) !important;
    }

    .territory-card a.mini-btn.card-map-action:active i,
    .territory-card .card-icon-action:not(:disabled):active i,
    .territory-card .card-main-action:not(:disabled):active i {
        color: #11141a !important;
    }
}

/* Explicit tablet-touch mode. Chrome on iPad gets this from maxTouchPoints + tablet viewport,
   so touch behavior does not depend on how the browser reports hover/pointer capabilities. */
html.s13-tablet-touch body {
    padding-top: max(11px, env(safe-area-inset-top)) !important;
    padding-right: max(11px, env(safe-area-inset-right)) !important;
    padding-bottom: max(11px, env(safe-area-inset-bottom)) !important;
    padding-left: max(11px, env(safe-area-inset-left)) !important;
    overscroll-behavior-x: none;
}

html.s13-tablet-touch .app-header {
    top: max(8px, env(safe-area-inset-top)) !important;
}

html.s13-tablet-touch button,
html.s13-tablet-touch a[href],
html.s13-tablet-touch [role="button"] {
    min-height: 48px !important;
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none;
    user-select: none;
    -webkit-user-select: none;
}

html.s13-tablet-touch input,
html.s13-tablet-touch select,
html.s13-tablet-touch textarea {
    min-height: 48px !important;
    font-size: 16px !important;
}

html.s13-tablet-touch .app-section-button,
html.s13-tablet-touch [data-language-toggle] {
    height: 48px !important;
    min-height: 48px !important;
}

html.s13-tablet-touch [data-language-toggle] {
    width: 88px !important;
}

html.s13-tablet-touch .app-city-controls button,
html.s13-tablet-touch .app-status-toolbar button,
html.s13-tablet-touch .app-status-toolbar a,
html.s13-tablet-touch #city-menu button,
html.s13-tablet-touch #publisher-picker-list button,
html.s13-tablet-touch #publisher-picker-add,
html.s13-tablet-touch .s13-popup-overlay button {
    min-height: 48px !important;
}

html.s13-tablet-touch #publishers-search,
html.s13-tablet-touch #publisher-picker-search,
html.s13-tablet-touch #dialog-fields input,
html.s13-tablet-touch #dialog-fields select,
html.s13-tablet-touch #dialog-fields textarea {
    height: 48px !important;
    min-height: 48px !important;
    font-size: 16px !important;
}

html.s13-tablet-touch #cities-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scroll-padding-inline: 8px;
    touch-action: pan-x !important;
}

html.s13-tablet-touch #cities-container button {
    min-height: 50px !important;
}

html.s13-tablet-touch #publishers-list {
    grid-auto-rows: 68px !important;
}

html.s13-tablet-touch #publishers-list > div,
html.s13-tablet-touch .publisher-row {
    height: 68px !important;
    min-height: 68px !important;
    max-height: 68px !important;
    grid-template-columns: minmax(0,1fr) 104px !important;
}

html.s13-tablet-touch #publishers-list > div > div,
html.s13-tablet-touch .publisher-row > div {
    grid-template-columns: repeat(2,48px) !important;
    width: 104px !important;
    min-width: 104px !important;
    max-width: 104px !important;
}

html.s13-tablet-touch #publishers-list > div button,
html.s13-tablet-touch .publisher-row button,
html.s13-tablet-touch .territory-card .card-icon-action,
html.s13-tablet-touch .territory-card a.card-map-action,
html.s13-tablet-touch .territory-card .copy-map-btn.card-icon-action,
html.s13-tablet-touch .territory-card a.mini-btn.card-map-action {
    width: 48px !important;
    min-width: 48px !important;
    max-width: 48px !important;
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
}

html.s13-tablet-touch .territory-card .card-main-action {
    width: 60px !important;
    min-width: 60px !important;
    max-width: 60px !important;
    height: 60px !important;
    min-height: 60px !important;
    max-height: 60px !important;
}

html.s13-tablet-touch .status-chip.s13-filter-control,
html.s13-tablet-touch .status-chip[role="button"] {
    min-height: 58px !important;
}

html.s13-tablet-touch .app-city-controls,
html.s13-tablet-touch .app-status-toolbar,
html.s13-tablet-touch #city-switcher-panel,
html.s13-tablet-touch #publishers-page > .glass-panel {
    scroll-margin-top: 86px;
}

html.s13-tablet-touch .s13-popup-overlay {
    overscroll-behavior: contain;
    padding-left: max(12px, env(safe-area-inset-left)) !important;
    padding-right: max(12px, env(safe-area-inset-right)) !important;
    padding-bottom: max(12px, env(safe-area-inset-bottom)) !important;
}

html.s13-tablet-touch .s13-popup-overlay > .glass-panel {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}

/* Force finger semantics on tablet-touch even if Chrome reports hover support. */
html.s13-tablet-touch button:not([data-language-toggle]):not(:disabled):hover,
html.s13-tablet-touch a#map-link:hover,
html.s13-tablet-touch a.mini-btn:hover,
html.s13-tablet-touch .copy-map-btn:hover {
    background: var(--dz-control) !important;
    color: #fff !important;
    box-shadow: none !important;
    transform: none !important;
}

html.s13-tablet-touch #city-menu button:hover,
html.s13-tablet-touch #publisher-picker-list button:hover {
    background: #393846 !important;
    color: #fff !important;
    transform: none !important;
}

html.s13-tablet-touch #cities-container button:hover {
    background: #33323f !important;
    color: #c8c7d1 !important;
    transform: none !important;
}

html.s13-tablet-touch #cities-container button.bg-indigo-600,
html.s13-tablet-touch #cities-container button.bg-indigo-600:hover,
html.s13-tablet-touch #cities-container button.bg-indigo-600:active {
    background: var(--dz-green) !important;
    color: #fff !important;
    transform: none !important;
}

html.s13-tablet-touch #publishers-list > div:hover,
html.s13-tablet-touch .publisher-row:hover {
    background: var(--dz-panel-soft) !important;
    transform: none !important;
}

html.s13-tablet-touch .territory-card:hover {
    transform: none !important;
    filter: none !important;
    box-shadow: 0 12px 30px rgba(0,0,0,.20) !important;
}

html.s13-tablet-touch .territory-card a.mini-btn.card-map-action:hover,
html.s13-tablet-touch .territory-card .card-icon-action:not(:disabled):hover {
    background: #2b2b37 !important;
    color: #fff !important;
    transform: none !important;
}

html.s13-tablet-touch .territory-card a.mini-btn.card-map-action:hover i,
html.s13-tablet-touch .territory-card .card-icon-action:not(:disabled):hover i {
    color: #fff !important;
}

html.s13-tablet-touch .territory-card .card-main-action:not(:disabled):hover {
    background: #262631 !important;
    color: #fff !important;
    transform: none !important;
}

html.s13-tablet-touch .territory-card .card-main-action:not(:disabled):hover i {
    color: #fff !important;
}

html.s13-tablet-touch button:not([data-language-toggle]):not(:disabled):active,
html.s13-tablet-touch a#map-link:active,
html.s13-tablet-touch a.mini-btn:active,
html.s13-tablet-touch .copy-map-btn:active,
html.s13-tablet-touch #city-menu button:active,
html.s13-tablet-touch #publisher-picker-list button:active,
html.s13-tablet-touch #publisher-picker-add:active {
    background: var(--dz-green-bright) !important;
    color: #11141a !important;
    transform: scale(.975) !important;
}

html.s13-tablet-touch [data-language-toggle]:active {
    transform: scale(.975) !important;
}

html.s13-tablet-touch .territory-card a.mini-btn.card-map-action:active,
html.s13-tablet-touch .territory-card .card-icon-action:not(:disabled):active,
html.s13-tablet-touch .territory-card .card-main-action:not(:disabled):active {
    background: var(--dz-green-bright) !important;
    color: #11141a !important;
    transform: scale(.965) !important;
}

html.s13-tablet-touch .territory-card a.mini-btn.card-map-action:active i,
html.s13-tablet-touch .territory-card .card-icon-action:not(:disabled):active i,
html.s13-tablet-touch .territory-card .card-main-action:not(:disabled):active i {
    color: #11141a !important;
}

@media (max-width: 639px) and (hover: none),
       (max-width: 639px) and (pointer: coarse) {
    .app-city-controls > div:last-child {
        grid-template-columns: minmax(0, 1fr) 48px !important;
    }

    .app-status-actions {
        grid-template-columns: 48px minmax(0, 1fr) minmax(0, 1fr) !important;
    }

    .app-section-button {
        width: 48px !important;
        min-width: 48px !important;
        padding: 0 !important;
    }

    .app-section-button span { display: none !important; }
    .app-header-actions { flex-shrink: 0; }
}

@media (max-width: 359px) and (hover: none),
       (max-width: 359px) and (pointer: coarse) {
    [data-language-toggle] { width: 78px !important; }

    .app-header {
        padding-left: 8px !important;
        padding-right: 8px !important;
        gap: 4px !important;
    }

    .app-header-actions { gap: 4px !important; }

    .app-logo {
        width: 34px !important;
        height: 34px !important;
        flex-basis: 34px !important;
    }

    #db-status { display: none !important; }
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
    }
}
`;
document.head.appendChild(touchStyle);

function syncTabletTouchMode() {
    const touchPoints = navigator.maxTouchPoints || 0;
    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    const longSide = Math.max(window.innerWidth, window.innerHeight);
    const isTabletTouch = touchPoints > 0 && shortSide >= 640 && longSide <= 1600;
    document.documentElement.classList.toggle('s13-tablet-touch', isTabletTouch);
}

let tabletTouchFrame = 0;
function scheduleTabletTouchSync() {
    cancelAnimationFrame(tabletTouchFrame);
    tabletTouchFrame = requestAnimationFrame(syncTabletTouchMode);
}

syncTabletTouchMode();
window.addEventListener('resize', scheduleTabletTouchSync, { passive: true });
window.addEventListener('orientationchange', scheduleTabletTouchSync, { passive: true });
