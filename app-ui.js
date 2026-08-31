const byId = (id) => document.getElementById(id);
const isFrench = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-application-ui';
style.textContent = `
:root {
    --app-bg: #050b16;
    --app-panel: rgba(15, 23, 42, .94);
    --app-panel-2: rgba(19, 29, 47, .96);
    --app-control: #1c283a;
    --app-control-hover: #10b981;
    --app-text: #ffffff;
    --app-muted: #94a3b8;
    --app-green: #10b981;
    --app-blue: #2563eb;
    --app-red: #e11d48;
    --app-yellow: #d99a16;
}

html,
body {
    background: var(--app-bg) !important;
}

body {
    min-height: 100dvh;
    overflow-x: hidden;
    padding: 14px !important;
}

*,
*::before,
*::after {
    border-color: transparent !important;
}

#home-page,
#sidebar,
button[onclick="toggleMobileSidebar()"] {
    display: none !important;
}

.glass-panel {
    background: linear-gradient(145deg, rgba(15, 23, 42, .97), rgba(9, 17, 31, .94)) !important;
    border: none !important;
    box-shadow: 0 18px 54px rgba(0, 0, 0, .24) !important;
    backdrop-filter: blur(22px) !important;
}

/* ---------- Header ---------- */
.app-header {
    position: sticky;
    top: 12px;
    z-index: 45;
    max-width: 1600px;
    min-height: 72px;
    margin-bottom: 18px !important;
    padding: 14px 16px !important;
    border-radius: 24px !important;
}

.app-logo {
    width: 44px !important;
    height: 44px !important;
    flex: 0 0 44px;
    border-radius: 14px !important;
    background: var(--app-green) !important;
    color: #fff !important;
    box-shadow: 0 12px 30px rgba(16, 185, 129, .24) !important;
}

#app-title {
    color: #fff !important;
    font-size: .95rem !important;
    font-weight: 800 !important;
    letter-spacing: -.015em !important;
}

#db-status {
    margin-top: 3px !important;
    font-size: 10px !important;
}

.app-header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    flex: 0 0 auto;
}

.app-section-button {
    min-height: 42px;
    padding: 0 15px !important;
    border-radius: 13px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
}

/* ---------- Buttons ---------- */
button:not([data-language-toggle]),
a#map-link,
a.mini-btn,
.copy-map-btn {
    background: var(--app-control) !important;
    color: #fff !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    text-decoration: none !important;
    transition: background-color .18s ease, color .18s ease, transform .18s ease, box-shadow .18s ease !important;
}

button:not([data-language-toggle]):not(:disabled):hover,
a#map-link:hover,
a.mini-btn:hover,
.copy-map-btn:hover {
    background: var(--app-control-hover) !important;
    color: #fff !important;
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(16, 185, 129, .18) !important;
}

button:not([data-language-toggle]):focus-visible,
a#map-link:focus-visible,
a.mini-btn:focus-visible,
input:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, .13) !important;
}

button:disabled {
    opacity: .42 !important;
    cursor: not-allowed !important;
    transform: none !important;
}

/* Language switch keeps its own RU green / FR red logic. */
[data-language-toggle] {
    width: 94px !important;
    height: 42px !important;
    padding: 4px !important;
    border: none !important;
    outline: none !important;
    border-radius: 13px !important;
    background: #0b1424 !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .035) !important;
}

[data-language-toggle]:hover {
    transform: none !important;
}

#lang-slider {
    box-shadow: 0 6px 18px rgba(0, 0, 0, .22) !important;
}

/* ---------- Main application layout ---------- */
.app-main-wrap {
    display: block !important;
    width: 100%;
    max-width: 1600px;
    margin-left: auto;
    margin-right: auto;
}

.app-main-wrap > main {
    width: 100%;
}

#territories-page,
#publishers-page {
    animation: appPageIn .18s ease-out;
}

@keyframes appPageIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ---------- City navigation ---------- */
#city-switcher-panel {
    padding: 10px !important;
    border-radius: 22px !important;
    overflow: hidden;
}

#cities-container {
    display: flex !important;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
}

#cities-container::-webkit-scrollbar {
    display: none;
}

#cities-container button {
    width: auto !important;
    min-width: max-content;
    min-height: 42px;
    padding: 0 15px !important;
    border-radius: 13px !important;
    background: var(--app-control) !important;
    color: #dbe5f2 !important;
    text-align: center !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    scroll-snap-align: start;
    transform: none !important;
}

#cities-container button:hover {
    background: var(--app-green) !important;
    color: #fff !important;
    transform: translateY(-1px) scale(1.015) !important;
}

#cities-container button.bg-indigo-600 {
    background: #36455b !important;
    color: #fff !important;
    box-shadow: 0 7px 18px rgba(0, 0, 0, .16) !important;
}

.app-city-controls {
    padding: 17px 18px !important;
    border-radius: 24px !important;
}

#active-city-title {
    font-size: clamp(1.05rem, 2vw, 1.35rem) !important;
    letter-spacing: -.02em;
}

.app-city-controls button,
.app-status-toolbar button,
.app-status-toolbar a {
    min-height: 40px;
    border-radius: 12px !important;
}

/* ---------- City popup menu ---------- */
#city-menu {
    top: calc(100% + 9px) !important;
    bottom: auto !important;
    right: 0 !important;
    width: 260px !important;
    margin: 0 !important;
    padding: 7px !important;
    border: none !important;
    border-radius: 17px !important;
    background: rgba(15, 23, 42, .99) !important;
    box-shadow: 0 22px 60px rgba(0, 0, 0, .42) !important;
    overflow: hidden !important;
}

#city-menu button {
    min-height: 42px;
    padding: 0 12px !important;
    border-radius: 11px !important;
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--app-control) !important;
    color: #fff !important;
}

#city-menu button + button {
    margin-top: 5px;
}

#city-menu button:hover {
    background: var(--app-green) !important;
}

/* ---------- Status toolbar ---------- */
.app-status-toolbar {
    padding: 14px 16px !important;
    border-radius: 24px !important;
}

.app-status-grid {
    display: grid !important;
    grid-template-columns: repeat(4, minmax(116px, 1fr));
    gap: 9px !important;
    flex: 1 1 620px;
}

.status-chip {
    width: 100%;
    height: 54px !important;
    padding: 0 13px !important;
    border: none !important;
    border-radius: 15px !important;
    box-shadow: none !important;
}

.status-chip-free { background: rgba(5, 110, 76, .58) !important; }
.status-chip-busy { background: rgba(30, 78, 190, .58) !important; }
.status-chip-overdue { background: rgba(190, 24, 70, .56) !important; }
.status-chip-waiting { background: rgba(176, 112, 8, .58) !important; }

.status-chip span {
    text-transform: none !important;
    letter-spacing: 0 !important;
    font-size: 10px !important;
}

.status-chip b {
    font-size: 15px !important;
}

/* ---------- Territory cards ---------- */
#grid {
    align-items: stretch;
    grid-template-columns: 1fr !important;
}

#grid > article::before {
    display: none !important;
}

.territory-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 260px !important;
    padding: 17px !important;
    border: none !important;
    border-radius: 24px !important;
    overflow: visible !important;
    box-shadow: 0 16px 38px rgba(0, 0, 0, .22) !important;
    transform-origin: center;
    transition: transform .2s ease, box-shadow .2s ease, filter .2s ease !important;
}

.territory-card.status-free {
    background: linear-gradient(145deg, rgba(6, 105, 76, .91), rgba(5, 78, 58, .82)) !important;
}

.territory-card.status-busy {
    background: linear-gradient(145deg, rgba(30, 78, 190, .90), rgba(25, 55, 140, .82)) !important;
}

.territory-card.status-overdue {
    background: linear-gradient(145deg, rgba(190, 24, 70, .89), rgba(132, 18, 50, .84)) !important;
}

.territory-card.status-waiting {
    background: linear-gradient(145deg, rgba(176, 112, 8, .90), rgba(116, 75, 6, .84)) !important;
}

.territory-card:hover {
    z-index: 5;
    transform: translateY(-5px) scale(1.018) !important;
    box-shadow: 0 24px 52px rgba(0, 0, 0, .31) !important;
    filter: brightness(1.035);
}

.territory-card .uppercase {
    text-transform: none !important;
    letter-spacing: 0 !important;
}

.territory-card .badge {
    min-height: 28px;
    padding: 0 10px !important;
    border: none !important;
    border-radius: 10px !important;
    background: rgba(3, 7, 18, .36) !important;
    color: #fff !important;
    font-size: 10px !important;
    font-weight: 750 !important;
}

.territory-card h3 {
    margin-top: 2px;
    font-size: 1.45rem !important;
    line-height: 1.08 !important;
}

.territory-card > div:nth-child(2) {
    flex: 1 1 auto;
    line-height: 1.55;
}

.territory-actions {
    margin-top: auto !important;
    padding-top: 12px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    border: none !important;
}

.territory-actions > div {
    display: flex;
    align-items: center;
    gap: 7px !important;
    min-width: 0;
}

.tile-secondary-btn,
.tile-primary-btn,
.mini-btn,
.copy-map-btn,
.square-btn,
.action-btn {
    min-height: 36px !important;
    border: none !important;
    border-radius: 11px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 7px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    white-space: nowrap;
}

.tile-secondary-btn,
.tile-primary-btn,
.action-btn {
    width: auto !important;
    padding: 0 11px !important;
}

.square-btn,
.copy-map-btn {
    width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
    padding: 0 !important;
}

.mini-btn {
    height: 36px !important;
    padding: 0 11px !important;
}

/* ---------- Publishers ---------- */
#publishers-page > .glass-panel {
    padding: 17px 18px !important;
    border-radius: 24px !important;
}

#publishers-title {
    font-size: 1.25rem !important;
    letter-spacing: -.02em;
}

#publishers-search,
#publisher-picker-search,
#dialog-fields input {
    height: 44px !important;
    border: none !important;
    outline: none !important;
    border-radius: 13px !important;
    background: #0a1322 !important;
    color: #fff !important;
    box-shadow: none !important;
}

#publishers-search:focus,
#publisher-picker-search:focus,
#dialog-fields input:focus {
    background: #101c2e !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, .11) !important;
}

#publishers-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px !important;
}

#publishers-list > div,
.publisher-row {
    min-height: 58px;
    padding: 10px 11px 10px 15px !important;
    border: none !important;
    border-radius: 17px !important;
    background: rgba(15, 23, 42, .90) !important;
    box-shadow: 0 10px 26px rgba(0, 0, 0, .14) !important;
    transition: background-color .18s ease, transform .18s ease, box-shadow .18s ease !important;
}

#publishers-list > div:hover {
    background: rgba(27, 38, 56, .98) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 15px 32px rgba(0, 0, 0, .20) !important;
}

/* ---------- Modals and popup surfaces ---------- */
.s13-popup-overlay {
    background: rgba(2, 6, 15, .76) !important;
    backdrop-filter: blur(16px) !important;
}

.s13-popup-overlay > .glass-panel {
    background: #0f1929 !important;
    border: none !important;
    border-radius: 24px !important;
    box-shadow: 0 28px 90px rgba(0, 0, 0, .50) !important;
}

#dialog-modal .border-b,
#dialog-modal .border-t,
#history-modal .border-b,
#publisher-picker-modal .border-b,
.territory-actions.border-t {
    border: none !important;
}

#history-list > div {
    background: #0a1322 !important;
    border: none !important;
    border-radius: 15px !important;
}

#publisher-picker-list button {
    min-height: 44px;
    padding: 0 13px !important;
    border: none !important;
    border-radius: 12px !important;
    background: var(--app-control) !important;
    color: #fff !important;
}

#publisher-picker-list button:hover {
    background: var(--app-green) !important;
}

/* ---------- Tablet ---------- */
@media (min-width: 640px) {
    #grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    #publishers-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 900px) {
    #grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
}

@media (min-width: 1280px) {
    #grid {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
}

@media (max-width: 1023px) {
    body { padding: 11px !important; }

    .app-header {
        top: 8px;
        border-radius: 21px !important;
        margin-bottom: 14px !important;
    }

    .app-status-grid {
        grid-template-columns: repeat(2, minmax(130px, 1fr));
        flex-basis: 100%;
    }
}

/* ---------- Phone ---------- */
@media (max-width: 639px) {
    body { padding: 8px !important; }

    .app-header {
        top: 6px;
        min-height: 66px;
        padding: 11px 12px !important;
        border-radius: 19px !important;
    }

    .app-logo {
        width: 40px !important;
        height: 40px !important;
        flex-basis: 40px;
        border-radius: 12px !important;
    }

    #app-title {
        font-size: .80rem !important;
    }

    #db-status {
        font-size: 9px !important;
    }

    #city-switcher-panel,
    .app-city-controls,
    .app-status-toolbar,
    #publishers-page > .glass-panel {
        border-radius: 19px !important;
    }

    .app-city-controls {
        padding: 14px !important;
        align-items: stretch !important;
    }

    .app-city-controls > div:first-child {
        width: 100%;
    }

    .app-city-controls > div:last-child {
        width: 100%;
        display: grid !important;
        grid-template-columns: 1fr 42px;
    }

    .app-city-controls > div:last-child > button:first-child {
        width: 100%;
    }

    .app-status-toolbar {
        padding: 11px !important;
    }

    .app-status-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px !important;
    }

    .status-chip {
        min-width: 0;
        height: 52px !important;
        padding: 0 10px !important;
    }

    .app-status-actions {
        width: 100%;
        display: grid !important;
        grid-template-columns: 42px minmax(0, 1fr) minmax(0, 1fr);
        gap: 7px !important;
    }

    .app-status-actions > * {
        width: 100% !important;
        justify-content: center;
    }

    .territory-card {
        min-height: 248px !important;
        padding: 15px !important;
        border-radius: 20px !important;
    }

    .territory-actions {
        align-items: stretch !important;
        flex-direction: column !important;
    }

    .territory-actions > div {
        display: grid !important;
        grid-template-columns: 1fr 1fr;
        width: 100%;
    }

    .territory-actions .tile-secondary-btn,
    .territory-actions .tile-primary-btn,
    .territory-actions .action-btn {
        width: 100% !important;
        min-height: 40px !important;
    }

    .s13-popup-overlay {
        align-items: flex-end !important;
        padding: 8px !important;
    }

    .s13-popup-overlay > .glass-panel {
        width: 100% !important;
        max-width: none !important;
        max-height: calc(100dvh - 16px);
        overflow-y: auto;
        padding: 18px !important;
        border-radius: 24px 24px 18px 18px !important;
    }
}

@media (max-width: 519px) {
    .app-section-button {
        width: 42px;
        padding: 0 !important;
    }

    .app-section-button span {
        display: none;
    }

    [data-language-toggle] {
        width: 86px !important;
    }
}

/* No hover enlargement on touch devices. */
@media (hover: none), (pointer: coarse) {
    .territory-card:hover,
    #publishers-list > div:hover,
    #cities-container button:hover {
        transform: none !important;
    }

    button:not([data-language-toggle]):not(:disabled):active,
    a#map-link:active,
    a.mini-btn:active {
        background: var(--app-green) !important;
        transform: scale(.985) !important;
    }
}
`;
document.head.appendChild(style);

function setAppTitle() {
    const title = byId('app-title');
    if (!title) return;
    const value = isFrench() ? 'Assistant de territoires' : 'Ассистент по участкам';
    if (title.textContent !== value) title.textContent = value;
}

function decorateHeader() {
    const header = document.querySelector('body > header');
    if (!header) return;

    header.classList.add('app-header');
    header.querySelector('button[onclick="toggleMobileSidebar()"]')?.remove();

    const locationIcon = header.querySelector('.fa-location-dot');
    locationIcon?.parentElement?.classList.add('app-logo');

    let actions = header.querySelector('.app-header-actions');
    if (!actions) {
        actions = document.createElement('div');
        actions.className = 'app-header-actions';
        header.appendChild(actions);
    }

    let sectionButton = byId('app-section-button');
    if (!sectionButton) {
        sectionButton = document.createElement('button');
        sectionButton.id = 'app-section-button';
        sectionButton.type = 'button';
        sectionButton.className = 'app-section-button';
        actions.appendChild(sectionButton);
    }

    const languageToggle = header.querySelector('[data-language-toggle]');
    if (languageToggle && languageToggle.parentElement !== actions) {
        actions.appendChild(languageToggle);
    }

    sectionButton.onclick = () => {
        const publishersOpen = !byId('publishers-page')?.classList.contains('hidden');
        if (publishersOpen) {
            window.showHomePage?.();
        } else {
            window.showPublishersPage?.();
        }
    };
}

function moveCitiesToApplicationBar() {
    const territoriesPage = byId('territories-page');
    const citiesContainer = byId('cities-container');
    if (!territoriesPage || !citiesContainer) return;

    let panel = byId('city-switcher-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'city-switcher-panel';
        panel.className = 'glass-panel';
        territoriesPage.insertBefore(panel, territoriesPage.firstChild);
    }

    if (citiesContainer.parentElement !== panel) {
        panel.appendChild(citiesContainer);
    }
    citiesContainer.classList.remove('hidden');
}

function removeLegacyNavigation() {
    byId('sidebar')?.remove();

    /* Avoid selectors containing Tailwind arbitrary-value brackets. */
    const main = document.querySelector('main');
    const layout = main?.parentElement;
    if (layout) layout.classList.add('app-main-wrap');
}

function decorateFixedSections() {
    byId('city-controls')?.classList.add('app-city-controls');

    const statFree = byId('st-free');
    const toolbar = statFree?.closest('section');
    if (!toolbar) return;

    toolbar.classList.add('app-status-toolbar');

    const stats = statFree.closest('.flex.flex-wrap');
    stats?.classList.add('app-status-grid');

    const actions = toolbar.querySelector(':scope > div:last-child');
    actions?.classList.add('app-status-actions');

    const statuses = [
        ['st-free', 'status-chip-free'],
        ['st-busy', 'status-chip-busy'],
        ['st-overdue', 'status-chip-overdue'],
        ['st-waiting', 'status-chip-waiting']
    ];

    statuses.forEach(([id, className]) => {
        const chip = byId(id)?.closest('.h-11');
        chip?.classList.add('status-chip', className);
    });
}

function statusName(status) {
    const labels = isFrench()
        ? { free: 'Libres', busy: 'Attribués', overdue: 'En retard', waiting: 'Attente' }
        : { free: 'Свободно', busy: 'В обработке', overdue: 'Просрочено', waiting: 'Ожидание' };
    return labels[status] || '';
}

function getCardStatus(card) {
    if (card.classList.contains('bg-emerald-900/40')) return 'free';
    if (card.classList.contains('bg-blue-900/40')) return 'busy';
    if (card.classList.contains('bg-rose-900/40')) return 'overdue';
    if (card.classList.contains('bg-amber-900/40')) return 'waiting';
    return null;
}

function turnIconButtonIntoTextButton(button, iconClass, text) {
    if (!button || button.dataset.appTextButton === text) return;

    button.dataset.appTextButton = text;
    button.classList.remove('square-btn');
    button.classList.add('tile-secondary-btn');
    button.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${text}</span>`;
}

function decorateTerritoryCard(card) {
    if (!(card instanceof HTMLElement) || card.dataset.appDecorated === '1') return;
    card.dataset.appDecorated = '1';
    card.classList.add('territory-card');

    const status = getCardStatus(card);
    if (status) card.classList.add(`status-${status}`);

    const headingRow = card.firstElementChild;
    if (headingRow && status && !headingRow.querySelector('.badge')) {
        const badge = document.createElement('span');
        badge.className = 'badge app-generated-status';
        badge.textContent = statusName(status);
        headingRow.appendChild(badge);
    }

    const actions = [...card.children].find((element) => element.classList.contains('border-t'));
    actions?.classList.add('territory-actions');

    turnIconButtonIntoTextButton(
        card.querySelector('button[onclick*="editTerritory"]'),
        'fa-pen',
        isFrench() ? 'Modifier' : 'Изменить'
    );

    turnIconButtonIntoTextButton(
        card.querySelector('button[onclick*="showHistory"]'),
        'fa-clock-rotate-left',
        isFrench() ? 'Historique' : 'История'
    );

    const issueButton = card.querySelector('button[onclick*="issueTerritory"]');
    if (issueButton && !issueButton.dataset.appPrimaryButton) {
        const label = issueButton.textContent.trim();
        issueButton.dataset.appPrimaryButton = '1';
        issueButton.classList.add('tile-primary-btn');
        issueButton.innerHTML = `<i class="fa-solid fa-paper-plane"></i><span>${label}</span>`;
    }

    const returnButton = card.querySelector('button[onclick*="returnTerritory"]');
    if (returnButton && !returnButton.dataset.appPrimaryButton) {
        const label = returnButton.textContent.trim();
        returnButton.dataset.appPrimaryButton = '1';
        returnButton.classList.add('tile-primary-btn');
        returnButton.innerHTML = `<i class="fa-solid fa-rotate-left"></i><span>${label}</span>`;
    }

    card.querySelector('button.action-btn:disabled')?.classList.add('tile-primary-btn');
}

function decorateTerritoryCards() {
    byId('grid')?.querySelectorAll(':scope > article').forEach(decorateTerritoryCard);
}

function decoratePublishers() {
    byId('publishers-list')?.querySelectorAll(':scope > div').forEach((row) => {
        if (row.dataset.appDecorated === '1') return;
        row.dataset.appDecorated = '1';
        row.classList.add('publisher-row');

        const edit = row.querySelector('button[onclick*="editPublisher"]');
        const remove = row.querySelector('button[onclick*="deletePublisher"]');

        if (edit) {
            edit.title = isFrench() ? 'Modifier' : 'Изменить';
            edit.setAttribute('aria-label', edit.title);
        }

        if (remove) {
            remove.title = isFrench() ? 'Supprimer' : 'Удалить';
            remove.setAttribute('aria-label', remove.title);
        }
    });
}

function syncSectionButton() {
    const button = byId('app-section-button');
    if (!button) return;

    const publishersOpen = !byId('publishers-page')?.classList.contains('hidden');
    if (publishersOpen) {
        button.innerHTML = `<i class="fa-solid fa-map-location-dot"></i><span>${isFrench() ? 'Territoires' : 'Участки'}</span>`;
        button.title = isFrench() ? 'Territoires' : 'Участки';
    } else {
        button.innerHTML = `<i class="fa-solid fa-users"></i><span>${isFrench() ? 'Proclamateurs' : 'Возвещатели'}</span>`;
        button.title = isFrench() ? 'Proclamateurs' : 'Возвещатели';
    }
    button.setAttribute('aria-label', button.title);
}

function syncPopupText() {
    const cancel = isFrench() ? 'Annuler' : 'Отмена';
    const ok = isFrench() ? 'OK' : 'ОК';
    const confirm = isFrench() ? 'Confirmer' : 'Подтвердить';

    document.querySelectorAll('#dialog-modal button[onclick="closeDialog(false)"]').forEach((button) => {
        if (!button.querySelector('i')) button.textContent = cancel;
    });

    const dialogOk = document.querySelector('#dialog-modal button[onclick="closeDialog(true)"]');
    if (dialogOk) dialogOk.textContent = ok;

    const confirmCancel = document.querySelector('#confirm-modal button[onclick="closeConfirm(false)"]');
    const confirmOk = document.querySelector('#confirm-modal button[onclick="closeConfirm(true)"]');
    if (confirmCancel) confirmCancel.textContent = cancel;
    if (confirmOk) confirmOk.textContent = confirm;
}

function showEmptyTerritories() {
    byId('publishers-page')?.classList.add('hidden');

    const territoriesPage = byId('territories-page');
    territoriesPage?.classList.remove('hidden');

    const controls = byId('city-controls');
    controls?.classList.remove('hidden');
    controls?.classList.add('flex');

    const title = byId('active-city-title');
    if (title) title.textContent = isFrench() ? 'Ajoutez une ville' : 'Добавьте город';

    const addTerritory = byId('add-territory-label')?.closest('button');
    const exportButton = document.querySelector('button[onclick="exportOfficialRegister()"]');
    const editCityButton = document.querySelector('#city-menu-wrap > button');

    if (addTerritory) addTerritory.disabled = true;
    if (exportButton) exportButton.disabled = true;
    if (editCityButton) editCityButton.disabled = true;
    byId('map-link')?.classList.add('hidden');
}

function enableCityActions() {
    const hasCities = !!byId('cities-container')?.querySelector('button');
    const addTerritory = byId('add-territory-label')?.closest('button');
    const exportButton = document.querySelector('button[onclick="exportOfficialRegister()"]');
    const editCityButton = document.querySelector('#city-menu-wrap > button');

    if (addTerritory) addTerritory.disabled = !hasCities;
    if (exportButton) exportButton.disabled = !hasCities;
    if (editCityButton) editCityButton.disabled = !hasCities;
}

function openTerritoriesApplication() {
    const cityButtons = [...(byId('cities-container')?.querySelectorAll('button') || [])];
    const selected = cityButtons.find((button) => button.classList.contains('bg-indigo-600'));
    const rememberedName = sessionStorage.getItem('s13-last-city-name');
    const remembered = cityButtons.find((button) => button.textContent === rememberedName);
    const target = selected || remembered || cityButtons[0];

    if (target) {
        target.click();
        enableCityActions();
    } else {
        showEmptyTerritories();
    }

    syncSectionButton();
}

function setupNavigationOverride() {
    /* The application has no separate Home screen anymore. */
    window.showHomePage = openTerritoriesApplication;

    byId('cities-container')?.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            sessionStorage.setItem('s13-last-city-name', button.textContent || '');
        }
    }, true);
}

function observeApplication() {
    const grid = byId('grid');
    if (grid) {
        new MutationObserver(() => {
            queueMicrotask(decorateTerritoryCards);
        }).observe(grid, { childList: true });
    }

    const publishers = byId('publishers-list');
    if (publishers) {
        new MutationObserver(() => {
            queueMicrotask(decoratePublishers);
        }).observe(publishers, { childList: true });
    }

    const cities = byId('cities-container');
    if (cities) {
        new MutationObserver(() => {
            queueMicrotask(() => {
                cities.classList.remove('hidden');
                enableCityActions();

                const territoriesVisible = !byId('territories-page')?.classList.contains('hidden');
                const activeButton = cities.querySelector('button.bg-indigo-600');
                const firstButton = cities.querySelector('button');

                if (territoriesVisible && firstButton && !activeButton) {
                    openTerritoriesApplication();
                } else if (territoriesVisible && !firstButton) {
                    showEmptyTerritories();
                }
            });
        }).observe(cities, { childList: true });
    }

    ['territories-page', 'publishers-page'].forEach((id) => {
        const page = byId(id);
        if (!page) return;

        new MutationObserver(() => {
            queueMicrotask(syncSectionButton);
        }).observe(page, { attributes: true, attributeFilter: ['class'] });
    });

    new MutationObserver(() => {
        queueMicrotask(() => {
            setAppTitle();
            syncSectionButton();
            syncPopupText();
        });
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });
}

function initApplicationUi() {
    decorateHeader();
    moveCitiesToApplicationBar();
    removeLegacyNavigation();
    decorateFixedSections();
    setupNavigationOverride();
    observeApplication();

    setAppTitle();
    syncSectionButton();
    syncPopupText();
    decorateTerritoryCards();
    decoratePublishers();

    queueMicrotask(() => {
        const publishersVisible = !byId('publishers-page')?.classList.contains('hidden');
        if (!publishersVisible) openTerritoriesApplication();
    });
}

initApplicationUi();
