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

/* Stable card shell. */
.territory-card {
    position: relative !important;
    display: block !important;
    min-height: 270px !important;
    padding: var(--card-pad) !important;
}

.territory-card > div:first-child {
    position: relative !important;
    z-index: 2 !important;
    margin: 0 !important;
    padding: 0 !important;
}

.territory-card .card-day-counter {
    position: absolute !important;
    top: var(--card-pad) !important;
    right: var(--card-pad) !important;
    z-index: 5 !important;
    margin: 0 !important;
    min-width: 44px !important;
    min-height: 34px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Information at the far-right edge, vertically centered. */
.territory-card .card-info-area {
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
}

.territory-card .card-info-text {
    position: absolute !important;
    top: 47% !important;
    right: 8px !important;
    width: 58% !important;
    max-width: 58% !important;
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
    text-align: right !important;
    color: rgba(255,255,255,.94) !important;
    overflow-wrap: anywhere !important;
}

/* The four small buttons physically live in this single 2x2 grid. */
.territory-card > .card-action-grid {
    position: absolute !important;
    left: var(--card-pad) !important;
    bottom: var(--card-pad) !important;
    z-index: 4 !important;
    display: grid !important;
    grid-template-columns: var(--card-action-size) var(--card-action-size) !important;
    grid-template-rows: var(--card-action-size) var(--card-action-size) !important;
    gap: var(--card-action-gap) !important;
    width: calc(var(--card-action-size) * 2 + var(--card-action-gap)) !important;
    height: calc(var(--card-action-size) * 2 + var(--card-action-gap)) !important;
    margin: 0 !important;
    padding: 0 !important;
    align-items: stretch !important;
    justify-items: stretch !important;
}

.territory-card > .card-action-grid > a.card-map-action {
    grid-column: 1 !important;
    grid-row: 1 !important;
}

.territory-card > .card-action-grid > .copy-map-btn {
    grid-column: 2 !important;
    grid-row: 1 !important;
}

.territory-card > .card-action-grid > button[onclick*="editTerritory"] {
    grid-column: 1 !important;
    grid-row: 2 !important;
}

.territory-card > .card-action-grid > button[onclick*="showHistory"] {
    grid-column: 2 !important;
    grid-row: 2 !important;
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

/* Main issue/return/lock button is independent at bottom-right. */
.territory-card > .card-main-action {
    position: absolute !important;
    right: var(--card-pad) !important;
    bottom: var(--card-pad) !important;
    z-index: 4 !important;
    width: var(--card-main-size) !important;
    min-width: var(--card-main-size) !important;
    max-width: var(--card-main-size) !important;
    height: var(--card-main-size) !important;
    min-height: var(--card-main-size) !important;
    max-height: var(--card-main-size) !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Old wrappers no longer influence geometry. */
.territory-card .card-map-actions,
.territory-card .territory-actions {
    display: none !important;
}

/* Publisher rows stay symmetric. */
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

    #cities-container button {
        min-height: 50px !important;
        border: 0 !important;
        outline: 0 !important;
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

    #publishers-list {
        grid-auto-rows: 68px !important;
    }

    #publishers-list > div,
    .publisher-row {
        height: 68px !important;
        min-height: 68px !important;
        max-height: 68px !important;
        grid-template-columns: minmax(0, 1fr) 104px !important;
    }

    #publishers-list > div > div,
    .publisher-row > div {
        grid-template-columns: repeat(2, 48px) !important;
        width: 104px !important;
        min-width: 104px !important;
        max-width: 104px !important;
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

    .territory-card {
        transition: none !important;
    }

    .territory-card:hover {
        transform: none !important;
        filter: none !important;
        box-shadow: 0 12px 30px rgba(0,0,0,.20) !important;
    }

    .territory-card .card-info-text p {
        font-size: 11px !important;
        line-height: 1.45 !important;
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
        if (/Срок\s+сдачи|Échéance|Echeance/i.test(p.textContent || '')) p.remove();
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
}

function makeIconOnly(button, iconClass, title, main = false) {
    if (!button) return;

    setHtmlOnce(button, `<i class="fa-solid ${iconClass}"></i>`);
    button.title = title;
    button.setAttribute('aria-label', title);
    button.classList.remove('tile-secondary-btn', 'tile-primary-btn');
    button.classList.add(main ? 'card-main-action' : 'card-icon-action');
}

function cleanMapControls(card) {
    const mapLink = card.querySelector('a.mini-btn[href], a.card-map-action[href]');
    if (mapLink) {
        setHtmlOnce(mapLink, '<i class="fa-solid fa-location-dot"></i>');
        const title = isFr() ? 'Carte' : 'Карта';
        mapLink.title = title;
        mapLink.setAttribute('aria-label', title);
        mapLink.classList.add('card-map-action');
    }

    const copyButton = card.querySelector('button.copy-map-btn');
    if (copyButton) {
        const title = isFr() ? 'Copier le lien de la carte' : 'Скопировать ссылку на карту';
        copyButton.title = title;
        copyButton.setAttribute('aria-label', title);
        copyButton.classList.add('card-icon-action');
    }
}

function buildActionGrid(card) {
    let actionGrid = card.querySelector(':scope > .card-action-grid');
    if (!actionGrid) {
        actionGrid = document.createElement('div');
        actionGrid.className = 'card-action-grid';
        card.appendChild(actionGrid);
    }

    const mapLink = card.querySelector('a.card-map-action[href]');
    const copyButton = card.querySelector('button.copy-map-btn');
    const editButton = card.querySelector('button[onclick*="editTerritory"]');
    const historyButton = card.querySelector('button[onclick*="showHistory"]');

    [mapLink, copyButton, editButton, historyButton].forEach((button) => {
        if (button && button.parentElement !== actionGrid) actionGrid.appendChild(button);
    });

    const oldMapWrapper = card.querySelector('.card-info-area > div:not(.card-info-text)');
    if (oldMapWrapper && !oldMapWrapper.querySelector('a,button')) oldMapWrapper.style.display = 'none';

    const oldActions = [...card.children].find((element) => element.classList.contains('border-t'));
    const mainAction = oldActions?.querySelector('.card-main-action, button[onclick*="issueTerritory"], button[onclick*="returnTerritory"], button:disabled');
    if (mainAction && mainAction.parentElement !== card) card.appendChild(mainAction);
    if (oldActions && !oldActions.querySelector('button')) oldActions.style.display = 'none';
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
    buildActionGrid(card);
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
