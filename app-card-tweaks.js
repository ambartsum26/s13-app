const $ = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-touch-card-layout';
style.textContent = `
/* Precise territory-card geometry: actions left, information right. */
.territory-card {
    grid-template-columns: minmax(108px, .78fr) minmax(0, 1.42fr) !important;
    grid-template-rows: 1fr auto !important;
    column-gap: 16px !important;
    row-gap: 10px !important;
}

.territory-card > div:first-child {
    grid-column: 1 !important;
    grid-row: 1 !important;
    align-self: start !important;
    min-width: 0 !important;
    padding-right: 0 !important;
}

/* Remaining-days counter is always fixed at the top-right corner. */
.territory-card .card-day-counter {
    position: absolute !important;
    top: 14px !important;
    right: 14px !important;
    z-index: 3 !important;
    margin: 0 !important;
    min-width: 42px !important;
    min-height: 34px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Information area is split without changing business data. */
.territory-card > .card-info-area,
.territory-card > div:nth-child(2) {
    grid-column: 1 / -1 !important;
    grid-row: 1 !important;
    align-self: stretch !important;
    min-width: 0 !important;
    min-height: 132px !important;
    margin: 0 !important;
    padding: 42px 0 0 !important;
    display: grid !important;
    grid-template-columns: minmax(96px, .72fr) minmax(0, 1.48fr) !important;
    grid-template-rows: 1fr auto !important;
    column-gap: 16px !important;
    line-height: 1.45 !important;
}

.territory-card .card-info-text {
    grid-column: 2 !important;
    grid-row: 1 / 3 !important;
    align-self: center !important;
    justify-self: end !important;
    width: 100% !important;
    min-width: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    justify-content: center !important;
    gap: 4px !important;
    padding: 4px 0 4px 8px !important;
    text-align: right !important;
}

.territory-card .card-info-text p {
    width: 100% !important;
    margin: 0 !important;
    color: rgba(255,255,255,.92) !important;
    text-align: right !important;
    overflow-wrap: anywhere !important;
}

.territory-card .card-info-text p i {
    margin-left: 0 !important;
}

/* Map/copy controls form the first left-aligned button row. */
.territory-card .card-map-actions {
    grid-column: 1 !important;
    grid-row: 2 !important;
    align-self: end !important;
    justify-self: start !important;
    margin: 0 !important;
    padding: 0 !important;
    display: grid !important;
    grid-template-columns: repeat(2, 42px) !important;
    gap: 8px !important;
    width: max-content !important;
}

.territory-card .card-map-actions > span {
    display: none !important;
}

/* Edit/history/main action row is also anchored to the left. */
.territory-actions {
    grid-column: 1 / -1 !important;
    grid-row: 2 !important;
    width: 100% !important;
    min-height: 56px !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 8px !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}

.territory-actions > div:first-child {
    display: grid !important;
    grid-template-columns: repeat(2, 42px) !important;
    gap: 8px !important;
    width: max-content !important;
    flex: 0 0 auto !important;
}

.territory-actions > .card-main-action,
.territory-actions > button.card-main-action {
    margin-left: 0 !important;
}

/* Publishers stay perfectly symmetric. */
#publishers-list {
    grid-auto-rows: minmax(60px, auto) !important;
}

#publishers-list > div,
.publisher-row {
    min-height: 60px !important;
    height: 100% !important;
    grid-template-columns: minmax(0, 1fr) 92px !important;
    align-items: center !important;
}

#publishers-list > div > div,
.publisher-row > div {
    width: 92px !important;
    min-width: 92px !important;
    justify-self: end !important;
}

/* Full touch-screen adaptation, including iPad/tablet widths. */
@media (hover: none), (pointer: coarse) {
    html {
        scroll-behavior: auto !important;
    }

    button,
    a,
    input,
    select,
    textarea {
        -webkit-tap-highlight-color: transparent !important;
    }

    button,
    a {
        touch-action: manipulation !important;
    }

    button:not([data-language-toggle]),
    a#map-link,
    a.mini-btn,
    .copy-map-btn,
    .app-section-button,
    .app-city-controls button,
    .app-status-toolbar button,
    .app-status-toolbar a {
        min-height: 48px !important;
    }

    [data-language-toggle] {
        width: 96px !important;
        height: 48px !important;
        min-height: 48px !important;
    }

    #cities-container {
        gap: 8px !important;
        scroll-snap-type: x mandatory !important;
        -webkit-overflow-scrolling: touch !important;
    }

    #cities-container button {
        min-height: 50px !important;
        padding: 0 18px !important;
        font-size: 11px !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        scroll-snap-align: start !important;
    }

    /* Prevent Safari from leaving a fake hover state after tapping. */
    #cities-container button:hover {
        background: #33323f !important;
        color: #c8c7d1 !important;
        transform: none !important;
        box-shadow: none !important;
    }

    #cities-container button.bg-indigo-600,
    #cities-container button.bg-indigo-600:hover,
    #cities-container button.bg-indigo-600:active {
        background: var(--dz-green) !important;
        color: #fff !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        transform: none !important;
    }

    #city-menu button {
        min-height: 50px !important;
    }

    #publishers-search,
    #publisher-picker-search,
    #dialog-fields input {
        min-height: 52px !important;
        height: 52px !important;
        font-size: 14px !important;
    }

    #publishers-list > div,
    .publisher-row {
        min-height: 68px !important;
        padding: 10px 10px 10px 14px !important;
        grid-template-columns: minmax(0, 1fr) 104px !important;
        gap: 12px !important;
    }

    #publishers-list > div > div,
    .publisher-row > div {
        width: 104px !important;
        min-width: 104px !important;
        grid-template-columns: repeat(2, 48px) !important;
        gap: 8px !important;
    }

    #publishers-list > div button,
    .publisher-row button {
        width: 48px !important;
        min-width: 48px !important;
        height: 48px !important;
        min-height: 48px !important;
    }

    #publisher-picker-list button,
    #history-modal button,
    #dialog-modal button,
    #confirm-modal button {
        min-height: 50px !important;
    }

    .territory-card {
        min-height: 270px !important;
        grid-template-columns: minmax(116px, .8fr) minmax(0, 1.4fr) !important;
        column-gap: 18px !important;
        transition: none !important;
    }

    .territory-card:hover {
        transform: none !important;
        filter: none !important;
        box-shadow: 0 12px 30px rgba(0,0,0,.20) !important;
    }

    .territory-card > .card-info-area,
    .territory-card > div:nth-child(2) {
        min-height: 150px !important;
        grid-template-columns: minmax(108px, .74fr) minmax(0, 1.46fr) !important;
        column-gap: 18px !important;
        padding-top: 44px !important;
    }

    .territory-card .card-map-actions,
    .territory-actions > div:first-child {
        grid-template-columns: repeat(2, 48px) !important;
        gap: 8px !important;
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
        flex-basis: 48px !important;
        border-radius: 11px !important;
    }

    .territory-card .card-main-action {
        width: 60px !important;
        min-width: 60px !important;
        height: 60px !important;
        min-height: 60px !important;
        flex-basis: 60px !important;
        border-radius: 13px !important;
    }

    .territory-card .card-day-counter {
        top: 14px !important;
        right: 14px !important;
        min-width: 48px !important;
        min-height: 38px !important;
        font-size: 16px !important;
    }

    .territory-card .card-info-text p {
        font-size: 11px !important;
        line-height: 1.45 !important;
    }

    .territory-card a.mini-btn.card-map-action:hover,
    .territory-card .card-icon-action:not(:disabled):hover,
    .territory-card .card-main-action:not(:disabled):hover,
    #publishers-list > div:hover,
    .publisher-row:hover {
        transform: none !important;
    }

    .territory-card a.mini-btn.card-map-action:active,
    .territory-card .card-icon-action:not(:disabled):active,
    .territory-card .card-main-action:not(:disabled):active,
    button:not([data-language-toggle]):not(:disabled):active,
    a#map-link:active,
    a.mini-btn:active {
        background: var(--dz-green-bright) !important;
        color: #11141a !important;
        transform: scale(.97) !important;
    }

    .s13-popup-overlay > .glass-panel {
        max-height: calc(100dvh - 20px) !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
    }
}

@media (max-width: 639px) {
    .territory-card {
        grid-template-columns: minmax(94px, .72fr) minmax(0, 1.38fr) !important;
        column-gap: 12px !important;
    }

    .territory-card > .card-info-area,
    .territory-card > div:nth-child(2) {
        grid-template-columns: minmax(88px, .68fr) minmax(0, 1.42fr) !important;
        column-gap: 12px !important;
    }
}
`;
document.head.appendChild(style);

function numberFromText(value) {
    const match = String(value || '').match(/\d+/);
    return match ? match[0] : '';
}

function cardStatus(card) {
    if (card.classList.contains('bg-emerald-900/40')) return 'free';
    if (card.classList.contains('bg-blue-900/40')) return 'busy';
    if (card.classList.contains('bg-rose-900/40')) return 'overdue';
    if (card.classList.contains('bg-amber-900/40')) return 'waiting';
    if (card.classList.contains('status-free')) return 'free';
    if (card.classList.contains('status-busy')) return 'busy';
    if (card.classList.contains('status-overdue')) return 'overdue';
    if (card.classList.contains('status-waiting')) return 'waiting';
    return '';
}

function setHtmlOnce(element, html) {
    if (element && element.innerHTML !== html) element.innerHTML = html;
}

function setTextOnce(element, text) {
    if (element && element.textContent !== text) element.textContent = text;
}

function decorateCardShell(card, status) {
    card.classList.add('territory-card');
    ['free', 'busy', 'overdue', 'waiting'].forEach((name) => {
        card.classList.toggle(`status-${name}`, status === name);
    });

    const actions = [...card.children].find((element) => element.classList.contains('border-t'));
    actions?.classList.add('territory-actions');
}

function cleanHeading(card, status) {
    const headingRow = card.firstElementChild;
    if (!headingRow) return;

    const kicker = headingRow.querySelector('div > span');
    kicker?.classList.add('territory-kicker');

    let badge = headingRow.querySelector('.badge');

    if (status === 'free') {
        badge?.classList.add('card-free-badge');
        return;
    }

    if ((status === 'busy' || status === 'overdue') && badge) {
        const days = numberFromText(badge.textContent);
        if (days) setTextOnce(badge, days);
        badge.classList.add('card-day-counter');
        return;
    }

    if (status === 'waiting') {
        const info = card.children[1];
        const daysLine = [...(info?.querySelectorAll('p') || [])].find((p) =>
            /До повторной выдачи|Avant la prochaine attribution/i.test(p.textContent || '')
        );
        const days = numberFromText(daysLine?.textContent);

        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'badge';
            headingRow.appendChild(badge);
        }

        if (days) setTextOnce(badge, days);
        badge.classList.add('card-day-counter');
    }
}

function cleanWaitingInfo(card) {
    const info = card.children[1];
    if (!info) return;

    [...info.querySelectorAll('p')].forEach((p) => {
        const text = p.textContent || '';

        if (/Последняя сдача:|Dernier retour\s*:/i.test(text)) {
            const date = text.match(/\d{2}[./]\d{2}[./]\d{4}|\d{4}-\d{2}-\d{2}/)?.[0] || '';
            setTextOnce(p, `${isFr() ? 'Rendu' : 'Сдали'}: ${date}`);
            p.classList.add('waiting-return-line');
            return;
        }

        if (/Можно выдать снова:|Peut être attribué à nouveau\s*:/i.test(text) ||
            /До повторной выдачи:|Avant la prochaine attribution\s*:/i.test(text)) {
            p.remove();
        }
    });
}

function structureInfo(card) {
    const info = card.children[1];
    if (!info) return;

    info.classList.add('card-info-area');

    let textGroup = info.querySelector(':scope > .card-info-text');
    if (!textGroup) {
        textGroup = document.createElement('div');
        textGroup.className = 'card-info-text';

        [...info.children]
            .filter((element) => element.tagName === 'P')
            .forEach((paragraph) => textGroup.appendChild(paragraph));

        info.prepend(textGroup);
    }

    [...info.children].forEach((element) => {
        if (element !== textGroup && element.tagName === 'DIV') {
            element.classList.add('card-map-actions');
        }
    });
}

function makeIconOnly(button, iconClass, title, main = false) {
    if (!button) return;

    setHtmlOnce(button, `<i class="fa-solid ${iconClass}"></i>`);
    if (button.title !== title) button.title = title;
    if (button.getAttribute('aria-label') !== title) button.setAttribute('aria-label', title);

    button.classList.remove('tile-secondary-btn', 'tile-primary-btn');
    button.classList.add(main ? 'card-main-action' : 'card-icon-action');
}

function cleanMapControls(card) {
    const mapLink = card.querySelector('a.mini-btn[href]');
    if (mapLink) {
        setHtmlOnce(mapLink, '<i class="fa-solid fa-location-dot"></i>');
        const title = isFr() ? 'Carte' : 'Карта';
        mapLink.title = title;
        mapLink.setAttribute('aria-label', title);
        mapLink.classList.add('card-map-action');
    }

    const copyButton = card.querySelector('.copy-map-btn');
    if (copyButton) {
        setHtmlOnce(copyButton, '<i class="fa-solid fa-copy"></i>');
        const title = isFr() ? 'Copier le lien de la carte' : 'Скопировать ссылку на карту';
        copyButton.title = title;
        copyButton.setAttribute('aria-label', title);
        copyButton.classList.add('card-icon-action');
    }
}

function cleanActions(card, status) {
    makeIconOnly(card.querySelector('button[onclick*="editTerritory"]'), 'fa-pen', isFr() ? 'Modifier' : 'Изменить');
    makeIconOnly(card.querySelector('button[onclick*="showHistory"]'), 'fa-clock-rotate-left', isFr() ? 'Historique' : 'История');
    makeIconOnly(card.querySelector('button[onclick*="issueTerritory"]'), 'fa-paper-plane', isFr() ? 'Attribuer' : 'Выдать', true);
    makeIconOnly(card.querySelector('button[onclick*="returnTerritory"]'), 'fa-rotate-left', isFr() ? 'Rendre' : 'Сдать', true);

    const locked = card.querySelector('button:disabled');
    if (status === 'waiting' && locked) {
        makeIconOnly(locked, 'fa-lock', isFr() ? 'Indisponible' : 'Пока нельзя выдать', true);
        locked.classList.add('card-lock-action');
    }

    cleanMapControls(card);
}

function cleanCard(card) {
    if (!(card instanceof HTMLElement)) return;

    const status = cardStatus(card);
    decorateCardShell(card, status);
    cleanHeading(card, status);
    if (status === 'waiting') cleanWaitingInfo(card);
    structureInfo(card);
    cleanActions(card, status);
}

function cleanCards() {
    $('grid')?.querySelectorAll(':scope > article').forEach(cleanCard);
}

const grid = $('grid');
if (grid) {
    new MutationObserver(() => queueMicrotask(cleanCards)).observe(grid, {
        childList: true,
        subtree: false
    });
}

new MutationObserver(() => queueMicrotask(cleanCards)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

cleanCards();
