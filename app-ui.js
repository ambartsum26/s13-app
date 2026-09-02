const byId = (id) => document.getElementById(id);
const isFrench = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-application-ui';
style.textContent = `
:root {
    --dz-bg: #17171f;
    --dz-panel: #262631;
    --dz-panel-soft: #2d2d39;
    --dz-control: #383746;
    --dz-text: #f7f7fb;
    --dz-green: #20bf72;
    --dz-green-bright: #31d17f;
}

html, body { background: var(--dz-bg) !important; }
body {
    min-height: 100dvh;
    overflow-x: hidden;
    padding: 18px !important;
    color: var(--dz-text) !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
}
body, button, a, h1, h2, h3, h4, h5, h6, p, span, b, strong, small, label, li, td, th {
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: .015em !important;
}
input, textarea, select { font-weight: 800 !important; }
input::placeholder, textarea::placeholder { font-weight: 800 !important; text-transform: uppercase !important; }
*, *::before, *::after { border-color: transparent !important; }
#home-page, #sidebar, button[onclick="toggleMobileSidebar()"] { display: none !important; }

.glass-panel {
    background: var(--dz-panel) !important;
    border: none !important;
    box-shadow: 0 14px 36px rgba(0,0,0,.20) !important;
    backdrop-filter: none !important;
}

.app-header {
    position: sticky;
    top: 14px;
    z-index: 45;
    max-width: 1560px;
    min-height: 66px;
    margin: 0 auto 14px !important;
    padding: 11px 13px !important;
    border-radius: 17px !important;
    background: #23232d !important;
    box-shadow: 0 12px 34px rgba(0,0,0,.24) !important;
}
.app-header > div:first-child { min-width: 0; }
.app-logo {
    width: 42px !important;
    height: 42px !important;
    flex: 0 0 42px;
    border-radius: 11px !important;
    background: var(--dz-green) !important;
    color: #fff !important;
    box-shadow: none !important;
}
#app-title { color:#fff !important; font-size:.92rem !important; line-height:1.05 !important; font-weight:900 !important; letter-spacing:-.01em !important; }
#db-status { margin-top:4px !important; font-size:9px !important; color:#61d99b !important; }
#db-status .animate-pulse { animation:none !important; }
.app-header-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px; flex:0 0 auto; }
.app-section-button {
    height:40px;
    min-height:40px;
    padding:0 13px !important;
    border-radius:10px !important;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    font-size:10px;
    white-space:nowrap;
}

button:not([data-language-toggle]), a#map-link, a.mini-btn, .copy-map-btn {
    background:var(--dz-control) !important;
    color:#fff !important;
    border:none !important;
    outline:none !important;
    box-shadow:none !important;
    text-decoration:none !important;
    transition:background-color .16s ease,color .16s ease,transform .16s ease !important;
}
button:not([data-language-toggle]):not(:disabled):hover, a#map-link:hover, a.mini-btn:hover, .copy-map-btn:hover {
    background:var(--dz-green-bright) !important;
    color:#11141a !important;
    transform:translateY(-1px) !important;
}
button:not([data-language-toggle]):focus-visible, a#map-link:focus-visible, a.mini-btn:focus-visible, input:focus-visible {
    outline:none !important;
    box-shadow:0 0 0 3px rgba(49,209,127,.14) !important;
}
button:disabled { opacity:.42 !important; cursor:not-allowed !important; transform:none !important; }

[data-language-toggle] {
    width:90px !important;
    height:40px !important;
    padding:4px !important;
    border:none !important;
    outline:none !important;
    border-radius:10px !important;
    background:#17171f !important;
    box-shadow:none !important;
}
[data-language-toggle]:hover { transform:none !important; }
#lang-slider { border-radius:8px !important; box-shadow:none !important; }

.app-main-wrap { display:block !important; width:100%; max-width:1560px; margin:0 auto; }
.app-main-wrap > main { width:100%; }

#city-switcher-panel {
    padding:8px !important;
    border-radius:15px !important;
    overflow:hidden;
    background:var(--dz-panel) !important;
    box-shadow:0 10px 30px rgba(0,0,0,.18) !important;
}
#cities-container {
    display:flex !important;
    align-items:center;
    justify-content:center;
    gap:6px !important;
    width:100%;
    margin:0 !important;
    padding:0 !important;
    overflow-x:auto;
    overflow-y:hidden;
    scrollbar-width:none;
    scroll-snap-type:x proximity;
}
#cities-container::-webkit-scrollbar { display:none; }
#cities-container button {
    flex:1 1 150px !important;
    width:auto !important;
    min-width:135px !important;
    max-width:280px !important;
    min-height:44px !important;
    padding:0 15px !important;
    border:0 !important;
    outline:0 !important;
    border-radius:10px !important;
    background:#33323f !important;
    color:#c8c7d1 !important;
    text-align:center !important;
    font-size:10px !important;
    font-weight:900 !important;
    box-shadow:none !important;
    scroll-snap-align:start;
    transform:none !important;
}
#cities-container button:hover { background:var(--dz-green-bright) !important; color:#11141a !important; box-shadow:none !important; }
#cities-container button.bg-indigo-600,
#cities-container button.bg-indigo-600:hover {
    background:var(--dz-green) !important;
    color:#fff !important;
    border:0 !important;
    outline:0 !important;
    box-shadow:none !important;
}

.app-city-controls,
#publishers-page > .glass-panel {
    position:relative;
    padding:15px 16px !important;
    border-radius:15px !important;
    background:var(--dz-panel) !important;
    box-shadow:0 10px 30px rgba(0,0,0,.18) !important;
}
.app-city-controls { overflow:visible !important; }
.app-city-controls::before,
#publishers-page > .glass-panel::before {
    content:none !important;
    display:none !important;
}
#active-city-title { color:#fff !important; font-size:clamp(1.05rem,2vw,1.3rem) !important; line-height:1.05 !important; font-weight:900 !important; letter-spacing:-.015em !important; }
.app-city-controls button, .app-status-toolbar button, .app-status-toolbar a { min-height:40px; border-radius:10px !important; }

#city-menu {
    right:0 !important;
    width:250px !important;
    margin:0 !important;
    padding:6px !important;
    border:none !important;
    border-radius:13px !important;
    background:#2d2c38 !important;
    box-shadow:0 20px 60px rgba(0,0,0,.42) !important;
    overflow:hidden !important;
}
#city-menu button {
    min-height:40px;
    padding:0 11px !important;
    border-radius:9px !important;
    display:flex;
    align-items:center;
    gap:7px;
    background:#393846 !important;
    color:#fff !important;
}
#city-menu button + button { margin-top:5px; }
#city-menu button:hover { background:var(--dz-green-bright) !important; color:#11141a !important; }

.app-status-toolbar {
    padding:10px !important;
    border-radius:15px !important;
    background:var(--dz-panel) !important;
    box-shadow:0 10px 30px rgba(0,0,0,.18) !important;
}
.app-status-grid { display:grid !important; grid-template-columns:repeat(4,minmax(104px,1fr)); gap:7px !important; flex:1 1 650px; }
.status-chip {
    width:100%;
    height:58px !important;
    padding:0 12px !important;
    border:none !important;
    border-radius:11px !important;
    box-shadow:none !important;
    display:flex !important;
    align-items:center !important;
    justify-content:center !important;
}
.status-chip > div:first-child, .status-chip > div:last-child > span, .status-chip i { display:none !important; }
.status-chip > div:last-child { width:100% !important; display:flex !important; align-items:center !important; justify-content:center !important; }
.status-chip b { color:#fff !important; font-size:1.4rem !important; line-height:1 !important; font-weight:950 !important; }
.status-chip-free { background:#0b8f62 !important; }
.status-chip-busy { background:#2f58bc !important; }
.status-chip-overdue { background:#b82b50 !important; }
.status-chip-waiting { background:#a76b0d !important; }
.app-status-actions { display:flex !important; align-items:center; gap:7px !important; }

#grid { align-items:stretch; grid-template-columns:1fr !important; gap:12px !important; }
#grid > article::before { display:none !important; }
.territory-card {
    border:none !important;
    border-radius:15px !important;
    overflow:hidden !important;
    box-shadow:0 12px 30px rgba(0,0,0,.20) !important;
    transform-origin:center;
    transition:transform .17s ease,box-shadow .17s ease,filter .17s ease !important;
}
.territory-card.status-free { background:linear-gradient(145deg,#0d9c6b 0%,#087553 100%) !important; }
.territory-card.status-busy { background:linear-gradient(145deg,#3965d4 0%,#2448a5 100%) !important; }
.territory-card.status-overdue { background:linear-gradient(145deg,#d03b62 0%,#a32549 100%) !important; }
.territory-card.status-waiting { background:linear-gradient(145deg,#c58616 0%,#93610b 100%) !important; }
.territory-card:hover { z-index:5; transform:translateY(-4px) scale(1.012) !important; box-shadow:0 20px 42px rgba(0,0,0,.29) !important; filter:brightness(1.025); }
.territory-card .territory-kicker,
.territory-card .badge.card-free-badge { display:none !important; }
.territory-card h3 { margin:0 !important; color:#fff !important; font-size:2.15rem !important; line-height:.95 !important; font-weight:950 !important; letter-spacing:-.035em !important; }
.territory-card .badge {
    min-width:42px;
    min-height:32px;
    padding:0 9px !important;
    border:none !important;
    border-radius:9px !important;
    display:inline-flex !important;
    align-items:center;
    justify-content:center;
    background:rgba(23,23,31,.30) !important;
    color:#fff !important;
    font-size:14px !important;
    font-weight:950 !important;
}
.territory-card .card-icon-action,
.territory-card a.card-map-action,
.territory-card .copy-map-btn.card-icon-action,
.territory-card a.mini-btn.card-map-action {
    border:none !important;
    outline:none !important;
    border-radius:10px !important;
    display:inline-flex !important;
    align-items:center !important;
    justify-content:center !important;
    background:#2b2b37 !important;
    color:#fff !important;
    box-shadow:none !important;
    text-decoration:none !important;
}
.territory-card .card-icon-action i,
.territory-card a.card-map-action i { margin:0 !important; padding:0 !important; color:#fff !important; font-size:14px !important; line-height:1 !important; }
.territory-card a.mini-btn.card-map-action:hover,
.territory-card .card-icon-action:not(:disabled):hover { background:var(--dz-green-bright) !important; color:#11141a !important; transform:translateY(-1px) !important; }
.territory-card a.mini-btn.card-map-action:hover i,
.territory-card .card-icon-action:not(:disabled):hover i { color:#11141a !important; }
.territory-card .card-main-action {
    border-radius:12px !important;
    display:inline-flex !important;
    align-items:center !important;
    justify-content:center !important;
    background:#262631 !important;
    color:#fff !important;
    font-size:19px !important;
}
.territory-card .card-main-action i { margin:0 !important; color:#fff !important; font-size:18px !important; }
.territory-card .card-main-action:not(:disabled):hover { background:var(--dz-green-bright) !important; color:#11141a !important; }
.territory-card .card-main-action:not(:disabled):hover i { color:#11141a !important; }
.territory-card .card-lock-action { background:#2b2b37 !important; color:#fff !important; opacity:.58 !important; pointer-events:none !important; box-shadow:none !important; }
.territory-card .waiting-return-line { color:rgba(255,255,255,.92) !important; font-size:10px !important; }

#publishers-title { color:#fff !important; font-size:1.16rem !important; font-weight:950 !important; letter-spacing:-.015em !important; }
#publishers-search, #publisher-picker-search, #dialog-fields input {
    height:42px !important;
    border:none !important;
    outline:none !important;
    border-radius:10px !important;
    background:#191922 !important;
    color:#fff !important;
    box-shadow:none !important;
}
#publishers-search:focus, #publisher-picker-search:focus, #dialog-fields input:focus { background:#20202a !important; box-shadow:0 0 0 3px rgba(49,209,127,.10) !important; }
#publishers-list {
    display:grid !important;
    grid-template-columns:1fr !important;
    grid-auto-rows:60px !important;
    gap:8px !important;
    align-items:stretch !important;
}
#publishers-list > div, .publisher-row {
    display:grid !important;
    grid-template-columns:minmax(0,1fr) 92px !important;
    align-items:center !important;
    gap:12px !important;
    box-sizing:border-box !important;
    height:60px !important;
    min-height:60px !important;
    max-height:60px !important;
    margin:0 !important;
    padding:9px 10px 9px 14px !important;
    border:none !important;
    border-radius:12px !important;
    background:var(--dz-panel-soft) !important;
    box-shadow:none !important;
    transition:background-color .16s ease,transform .16s ease !important;
}
#publishers-list > div > b, .publisher-row > b {
    display:block !important;
    min-width:0 !important;
    overflow:hidden !important;
    text-overflow:ellipsis !important;
    white-space:nowrap !important;
}
#publishers-list > div > div, .publisher-row > div {
    display:grid !important;
    grid-template-columns:repeat(2,42px) !important;
    gap:8px !important;
    width:92px !important;
    min-width:92px !important;
    max-width:92px !important;
    justify-self:end !important;
}
#publishers-list > div button, .publisher-row button {
    width:42px !important;
    min-width:42px !important;
    max-width:42px !important;
    height:42px !important;
    min-height:42px !important;
    max-height:42px !important;
    margin:0 !important;
    padding:0 !important;
    border-radius:10px !important;
}
#publishers-list > div:hover { background:#373644 !important; transform:translateY(-1px) !important; }

.s13-popup-overlay { background:rgba(13,13,18,.82) !important; backdrop-filter:blur(10px) !important; }
.s13-popup-overlay > .glass-panel { background:#2b2b37 !important; border:none !important; border-radius:16px !important; box-shadow:0 28px 80px rgba(0,0,0,.48) !important; }
#dialog-modal .border-b, #dialog-modal .border-t, #history-modal .border-b, #publisher-picker-modal .border-b { border:none !important; }
#history-list > div { background:#1d1d27 !important; border:none !important; border-radius:11px !important; }
#publisher-picker-list button { min-height:42px; padding:0 12px !important; border:none !important; border-radius:10px !important; background:#393846 !important; color:#fff !important; }
#publisher-picker-list button:hover { background:var(--dz-green-bright) !important; color:#11141a !important; }

@media (min-width:640px) {
    #grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
    #publishers-list { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
}
@media (min-width:980px) { #grid { grid-template-columns:repeat(3,minmax(0,1fr)) !important; } }
@media (min-width:1460px) { #grid { grid-template-columns:repeat(4,minmax(0,1fr)) !important; } }

@media (max-width:1023px) {
    body { padding:11px !important; }
    .app-header { top:8px; border-radius:15px !important; }
    .app-status-grid { grid-template-columns:repeat(2,minmax(125px,1fr)); flex-basis:100%; }
}

@media (max-width:639px) {
    body { padding:7px !important; }
    .app-header { top:5px; min-height:60px; padding:9px 10px !important; margin-bottom:9px !important; border-radius:13px !important; }
    .app-logo { width:38px !important; height:38px !important; flex-basis:38px; border-radius:10px !important; }
    #app-title { font-size:.72rem !important; }
    #db-status { font-size:8px !important; }
    #city-switcher-panel, .app-city-controls, .app-status-toolbar, #publishers-page > .glass-panel { border-radius:13px !important; }
    #cities-container { justify-content:flex-start !important; }
    #cities-container button { flex:0 0 auto !important; min-width:142px !important; max-width:none !important; min-height:42px !important; }
    .app-city-controls { padding:12px 12px 12px 16px !important; align-items:stretch !important; }
    .app-city-controls > div:first-child { width:100%; }
    .app-city-controls > div:last-child { width:100%; display:grid !important; grid-template-columns:1fr 40px; gap:7px !important; }
    .app-city-controls > div:last-child > button:first-child { width:100%; }
    .app-status-toolbar { padding:8px !important; }
    .app-status-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px !important; }
    .status-chip { min-width:0; height:52px !important; padding:0 8px !important; }
    .status-chip b { font-size:1.25rem !important; }
    .app-status-actions { width:100%; display:grid !important; grid-template-columns:40px minmax(0,1fr) minmax(0,1fr); gap:6px !important; }
    .app-status-actions > * { width:100% !important; justify-content:center; }
    .territory-card { border-radius:13px !important; }
    .territory-card h3 { font-size:1.9rem !important; }
    .s13-popup-overlay { align-items:flex-end !important; padding:7px !important; }
    .s13-popup-overlay > .glass-panel { width:100% !important; max-width:none !important; max-height:calc(100dvh - 14px); overflow-y:auto; padding:16px !important; border-radius:16px 16px 12px 12px !important; }
}

@media (max-width:519px) {
    .app-section-button { width:40px; padding:0 !important; }
    .app-section-button span { display:none; }
    [data-language-toggle] { width:84px !important; }
}

@media (hover:none), (pointer:coarse) {
    button, a, input, select, textarea { -webkit-tap-highlight-color:transparent !important; }
    button, a { touch-action:manipulation !important; }
    #cities-container button { min-height:50px !important; border:0 !important; outline:0 !important; box-shadow:none !important; }
    #cities-container button.bg-indigo-600,
    #cities-container button.bg-indigo-600:hover,
    #cities-container button.bg-indigo-600:active {
        background:var(--dz-green) !important;
        color:#fff !important;
        border:0 !important;
        outline:0 !important;
        box-shadow:none !important;
        transform:none !important;
    }
    #publishers-list { grid-auto-rows:68px !important; }
    #publishers-list > div, .publisher-row {
        height:68px !important;
        min-height:68px !important;
        max-height:68px !important;
        grid-template-columns:minmax(0,1fr) 104px !important;
    }
    #publishers-list > div > div, .publisher-row > div {
        grid-template-columns:repeat(2,48px) !important;
        width:104px !important;
        min-width:104px !important;
        max-width:104px !important;
    }
    #publishers-list > div button, .publisher-row button {
        width:48px !important;
        min-width:48px !important;
        max-width:48px !important;
        height:48px !important;
        min-height:48px !important;
        max-height:48px !important;
    }
    .territory-card:hover, #publishers-list > div:hover, #cities-container button:hover { transform:none !important; }
    button:not([data-language-toggle]):not(:disabled):active, a#map-link:active, a.mini-btn:active {
        background:var(--dz-green-bright) !important;
        color:#11141a !important;
        transform:scale(.985) !important;
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
    header.querySelector('.fa-location-dot')?.parentElement?.classList.add('app-logo');

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
    if (languageToggle && languageToggle.parentElement !== actions) actions.appendChild(languageToggle);
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
    if (citiesContainer.parentElement !== panel) panel.appendChild(citiesContainer);
    citiesContainer.classList.remove('hidden');
}

function removeLegacyNavigation() {
    byId('sidebar')?.remove();
    const main = document.querySelector('main');
    main?.parentElement?.classList.add('app-main-wrap');
}

function decorateFixedSections() {
    byId('city-controls')?.classList.add('app-city-controls');
    const statFree = byId('st-free');
    const toolbar = statFree?.closest('section');
    if (!toolbar) return;
    toolbar.classList.add('app-status-toolbar');
    statFree.closest('.flex.flex-wrap')?.classList.add('app-status-grid');
    toolbar.querySelector(':scope > div:last-child')?.classList.add('app-status-actions');
    [
        ['st-free','status-chip-free'],
        ['st-busy','status-chip-busy'],
        ['st-overdue','status-chip-overdue'],
        ['st-waiting','status-chip-waiting']
    ].forEach(([id, className]) => byId(id)?.closest('.h-11')?.classList.add('status-chip', className));
}

function decoratePublishers() {
    byId('publishers-list')?.querySelectorAll(':scope > div').forEach((row) => {
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

function showEmptyTerritories() {
    byId('publishers-page')?.classList.add('hidden');
    byId('territories-page')?.classList.remove('hidden');
    const controls = byId('city-controls');
    controls?.classList.remove('hidden');
    controls?.classList.add('flex');
    const title = byId('active-city-title');
    if (title) title.textContent = isFrench() ? 'Ajoutez une ville' : 'Добавьте город';
}

function openTerritoriesApplication() {
    const cityButtons = [...(byId('cities-container')?.querySelectorAll('button') || [])];
    const selected = cityButtons.find((button) => button.classList.contains('bg-indigo-600'));
    const rememberedName = sessionStorage.getItem('s13-last-city-name');
    const remembered = cityButtons.find((button) => button.textContent === rememberedName);
    const target = selected || remembered || cityButtons[0];
    if (target) target.click();
    else showEmptyTerritories();
    syncSectionButton();
}

function setupNavigation() {
    const originalShowPublishersPage = window.showPublishersPage;
    window.showPublishersPage = () => {
        originalShowPublishersPage?.();
        decoratePublishers();
        syncSectionButton();
    };

    window.showHomePage = openTerritoriesApplication;

    const sectionButton = byId('app-section-button');
    if (sectionButton) {
        sectionButton.onclick = () => {
            const publishersOpen = !byId('publishers-page')?.classList.contains('hidden');
            if (publishersOpen) openTerritoriesApplication();
            else window.showPublishersPage?.();
        };
    }

    byId('cities-container')?.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) sessionStorage.setItem('s13-last-city-name', button.textContent || '');
    }, true);
}

function observeStableSurfaces() {
    const publishers = byId('publishers-list');
    if (publishers) {
        new MutationObserver(() => queueMicrotask(decoratePublishers)).observe(publishers, { childList:true, subtree:false });
    }

    new MutationObserver(() => {
        queueMicrotask(() => {
            setAppTitle();
            syncSectionButton();
            decoratePublishers();
        });
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
}

function initApplicationUi() {
    decorateHeader();
    moveCitiesToApplicationBar();
    removeLegacyNavigation();
    decorateFixedSections();
    setupNavigation();
    observeStableSurfaces();
    setAppTitle();
    syncSectionButton();
    decoratePublishers();
}

initApplicationUi();
