const $ = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-touch-card-layout';
style.textContent = `
:root {
    --card-pad: 14px;
    --card-action-size: 42px;
    --card-action-gap: 8px;
    --card-main-size: 56px;
}

.app-city-controls::before,
#publishers-page > .glass-panel::before {
    content: none !important;
    display: none !important;
}

.app-city-controls,
#publishers-page > .glass-panel {
    padding-left: 16px !important;
}

/* One real grid controls all four small buttons. */
.territory-card {
    position: relative !important;
    display: grid !important;
    grid-template-columns: var(--card-action-size) var(--card-action-size) minmax(0, 1fr) var(--card-main-size) !important;
    grid-template-rows: auto minmax(52px, 1fr) var(--card-action-size) var(--card-action-size) !important;
    column-gap: var(--card-action-gap) !important;
    row-gap: var(--card-action-gap) !important;
    min-height: 270px !important;
    padding: var(--card-pad) !important;
}

.territory-card > div:first-child {
    grid-column: 1 / -1 !important;
    grid-row: 1 !important;
    align-self: start !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 2 !important;
}

.territory-card .card-day-counter {
    position: absolute !important;
    top: var(--card-pad) !important;
    right: var(--card-pad) !important;
    z-index: 4 !important;
    margin: 0 !important;
    min-width: 44px !important;
    min-height: 34px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Flatten old wrappers so their controls participate in the same card grid. */
.territory-card > .card-info-area,
.territory-card > div:nth-child(2),
.territory-card .card-map-actions,
.territory-actions,
.territory-actions > div:first-child {
    display: contents !important;
}

.territory-card .card-map-actions > span {
    display: none !important;
}

/* Written information sits directly against the right edge. */
.territory-card .card-info-text {
    position: absolute !important;
    top: 47% !important;
    right: 8px !important;
    width: 58% !important;
    max-width: 58% !important;
    min-width: 0 !important;
    transform: translateY(-50%) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    justify-content: center !important;
    gap: 5px !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: right !important;
}

.territory-card .card-info-text p {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    color: rgba(255,255,255,.94) !important;
    text-align: right !important;
    overflow-wrap: anywhere !important;
}

/* Exact 2x2 matrix. */
.territory-card a.card-map-action {
    grid-column: 1 !important;
    grid-row: 3 !important;
}

.territory-card .copy-map-btn {
    grid-column: 2 !important;
    grid-row: 3 !important;
}

.territory-card button[onclick*="editTerritory"] {
    grid-column: 1 !important;
    grid-row: 4 !important;
}

.territory-card button[onclick*="showHistory"] {
    grid-column: 2 !important;
    grid-row: 4 !important;
}

.territory-card .card-icon-action,
.territory-card a.card-map-action,
.territory-card .copy-map-btn.card-icon-action,
.territory-card a.mini-btn.card-map-action {
    width: var(--card-action-size) !important;
    min-width: var(--card-action-size) !important;
    max-width: var(--card-action-size) !important;
    height: var(--card-action-size) !important;
    min-height: var(--card-action-size) !important;
    max-height: var(--card-action-size) !important;
    margin: 0 !important;
    padding: 0 !important;
    align-self: stretch !important;
    justify-self: stretch !important;
}

/* Main action remains separate at bottom-right. */
.territory-card .card-main-action {
    grid-column: 4 !important;
    grid-row: 4 !important;
    width: var(--card-main-size) !important;
    min-width: var(--card-main-size) !important;
    max-width: var(--card-main-size) !important;
    height: var(--card-main-size) !important;
    min-height: var(--card-main-size) !important;
    max-height: var(--card-main-size) !important;
    margin: 0 !important;
    padding: 0 !important;
    align-self: end !important;
    justify-self: end !important;
}

/* Publisher rows remain symmetric. */
#publishers-list {
    grid-auto-rows: 60px !important;
    align-items: stretch !important;
}

#publishers-list > div,
.publisher-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) 92px !important;
    align-items: center !important;
    gap: 12px !important;
    box-sizing: border-box !important;
    height: 60px !important;
    min-height: 60px !important;
    max-height: 60px !important;
    margin: 0 !important;
    padding: 9px 10px 9px 14px !important;
}

#publishers-list > div > b,
.publisher-row > b {
    display: block !important;
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    line-height: 1.2 !important;
}

#publishers-list > div > div,
.publisher-row > div {
    display: grid !important;
    grid-template-columns: repeat(2, 42px) !important;
    gap: 8px !important;
    width: 92px !important;
    min-width: 92px !important;
    max-width: 92px !important;
    justify-self: end !important;
    align-items: center !important;
}

#publishers-list > div button,
.publisher-row button {
    width: 42px !important;
    min-width: 42px !important;
    max-width: 42px !important;
    height: 42px !important;
    min-height: 42px !important;
    max-height: 42px !important;
    margin: 0 !important;
    padding: 0 !important;
}

@media (hover: none), (pointer: coarse) {
    :root {
        --card-action-size: 48px;
        --card-main-size: 60px;
    }

    html { scroll-behavior: auto !important; }

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

    #publishers-list {
        grid-auto-rows: 68px !important;
    }

    #publishers-list > div,
    .publisher-row {
        height: 68px !important;
        min-height: 68px !important;
        max-height: 68px !important;
        padding: 10px 10px 10px 14px !important;
        grid-template-columns: minmax(0, 1fr) 104px !important;
        gap: 12px !important;
    }

    #publishers-list > div > div,
    .publisher-row > div {
        width: 104px !important;
        min-width: 104px !important;
        max-width: 104px !important;
        grid-template-columns: repeat(2, 48px) !important;
        gap: 8px !important;
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

    #publisher-picker-list button,
    #history-modal button,
    #dialog-modal button,
    #confirm-modal button {
        min-height: 50px !important;
    }

    .territory-card {
        min-height: 270px !important;
        transition: none !important;
    }

    .territory-card:hover {
        transform: none !important;
        filter: none !important;
        box-shadow: 0 12px 30px rgba(0,0,0,.20) !important;
    }

    .territory-card .card-day-counter {
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
}

@media (max-width: 639px) {
    .territory-card .card-info-text {
        right: 6px !important;
        width: 61% !important;
        max-width: 61% !important;
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

    const actions = [...card.children].find((element) =>
        element.classList.contains('territory-actions') || element.classList.contains('border-t')
    );
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

function cleanBusyInfo(card) {
    const info = card.children[1];
    if (!info) return;

    [...info.querySelectorAll('p')].forEach((p) => {
        const text = p.textContent || '';
        if (/Срок\s+сдачи|Échéance|Echeance/i.test(text)) {
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
        if (element !== textGroup && element.tagName === 'DIV' &&
            (element.querySelector('a.mini-btn[href]') || element.querySelector('.copy-map-btn'))) {
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
    if (status === 'busy' || status === 'overdue') cleanBusyInfo(card);

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
