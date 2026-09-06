const touchStyle = document.createElement('style');
touchStyle.id = 's13-touch-optimizations';
touchStyle.textContent = `
/* Final interaction layer for phones, tablets and other coarse pointers. */
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

    .app-header {
        gap: 6px !important;
    }

    .app-header-actions {
        gap: 6px !important;
    }
}

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

    #auth-panel button {
        min-height: 48px !important;
    }

    .app-section-button {
        height: 48px !important;
        min-height: 48px !important;
    }

    [data-language-toggle] {
        width: 88px !important;
        height: 48px !important;
        min-height: 48px !important;
    }

    .app-city-controls button,
    .app-status-toolbar button,
    .app-status-toolbar a,
    #city-menu button,
    #publisher-picker-list button,
    #publisher-picker-add,
    .s13-popup-overlay button {
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

    #publishers-list > div button,
    .publisher-row button {
        width: 48px !important;
        min-width: 48px !important;
        max-width: 48px !important;
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
    }

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

    /* Neutralize sticky hover states that mobile Safari/Chrome can retain after a tap. */
    button:not([data-language-toggle]):not(:disabled):hover,
    a#map-link:hover,
    a.mini-btn:hover,
    .copy-map-btn:hover {
        background: var(--dz-control) !important;
        color: #fff !important;
        box-shadow: none !important;
        transform: none !important;
    }

    [data-language-toggle]:hover {
        transform: none !important;
    }

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

    /* Deliberate pressed feedback replaces hover feedback on touch. */
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

    .app-section-button span {
        display: none !important;
    }

    .app-header-actions {
        flex-shrink: 0;
    }
}

@media (max-width: 359px) and (hover: none),
       (max-width: 359px) and (pointer: coarse) {
    [data-language-toggle] {
        width: 78px !important;
    }

    .app-header {
        padding-left: 8px !important;
        padding-right: 8px !important;
        gap: 4px !important;
    }

    .app-header-actions {
        gap: 4px !important;
    }

    .app-logo {
        width: 34px !important;
        height: 34px !important;
        flex-basis: 34px !important;
    }

    #db-status {
        display: none !important;
    }
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
