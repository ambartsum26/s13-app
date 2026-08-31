const $ = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-card-tweaks';
style.textContent = `
/* Global application typography: bold, uppercase, work-focused. */
body,
button,
a,
h1, h2, h3, h4, h5, h6,
p,
span,
b,
strong,
small,
label,
li,
td,
th {
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: .018em !important;
}

input,
textarea,
select {
    font-weight: 800 !important;
}

input::placeholder,
textarea::placeholder {
    font-weight: 800 !important;
    text-transform: uppercase !important;
}

/* Top status blocks: keep only the quantity; color itself communicates status. */
.status-chip {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 14px !important;
}

.status-chip > div:first-child {
    display: none !important;
}

.status-chip > div:last-child {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.status-chip > div:last-child > span,
.status-chip i {
    display: none !important;
}

.status-chip b {
    color: #ffffff !important;
    font-size: 1.35rem !important;
    line-height: 1 !important;
    font-weight: 900 !important;
}

/* Cities: fill the row, stay centered, selected city is red. */
#cities-container {
    justify-content: center !important;
}

#cities-container button {
    flex: 1 1 150px !important;
    min-width: 135px !important;
    max-width: 280px !important;
    min-height: 48px !important;
    padding: 0 18px !important;
    font-size: 13px !important;
}

#cities-container button.bg-indigo-600 {
    background: #dc2626 !important;
    color: #ffffff !important;
    box-shadow: 0 10px 25px rgba(220, 38, 38, .22) !important;
}

#cities-container button.bg-indigo-600:hover {
    background: #dc2626 !important;
}

/* Clean territory headings and make the territory number the visual anchor. */
.territory-card .territory-kicker {
    display: none !important;
}

.territory-card h3 {
    margin-top: 0 !important;
    font-size: 2.15rem !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    letter-spacing: -.035em !important;
}

.territory-card .badge.card-day-counter {
    min-width: 44px !important;
    min-height: 36px !important;
    padding: 0 11px !important;
    border-radius: 12px !important;
    background: rgba(3, 7, 18, .34) !important;
    color: #ffffff !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
}

.territory-card .badge.card-free-badge {
    display: none !important;
}

/* The card's controls form one fixed 2x2 block with equal spacing. */
.territory-actions {
    width: 100% !important;
    margin-top: auto !important;
    padding-top: 14px !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: space-between !important;
    gap: 14px !important;
}

.territory-actions .card-small-actions {
    display: grid !important;
    grid-template-columns: repeat(2, 42px) !important;
    grid-template-rows: repeat(2, 42px) !important;
    gap: 8px !important;
    width: max-content !important;
    flex: 0 0 auto !important;
}

/* All ordinary card actions are identical square icon buttons. */
.territory-card .card-icon-action {
    width: 42px !important;
    min-width: 42px !important;
    height: 42px !important;
    min-height: 42px !important;
    padding: 0 !important;
    border-radius: 12px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 14px !important;
}

.territory-card .card-icon-action i {
    margin: 0 !important;
    font-size: 14px !important;
}

/* Issue / return / lock stay larger than ordinary controls. */
.territory-card .card-main-action {
    width: 58px !important;
    min-width: 58px !important;
    height: 58px !important;
    min-height: 58px !important;
    padding: 0 !important;
    border-radius: 17px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex: 0 0 58px !important;
    font-size: 20px !important;
}

.territory-card .card-main-action i {
    margin: 0 !important;
    font-size: 19px !important;
}

.territory-card .card-lock-action {
    background: rgba(3, 7, 18, .30) !important;
    color: #ffffff !important;
    opacity: .62 !important;
    pointer-events: none !important;
    box-shadow: none !important;
}

.territory-card .card-main-action:not(:disabled):hover {
    background: #10b981 !important;
}

.territory-card .waiting-return-line {
    font-size: 12px !important;
    color: rgba(255,255,255,.88) !important;
}

/* The old inline map row is moved into the fixed action block. */
.territory-card .card-map-row-empty {
    display: none !important;
}

@media (max-width: 639px) {
    #cities-container {
        justify-content: flex-start !important;
    }

    #cities-container button {
        flex: 0 0 auto !important;
        min-width: 150px !important;
        max-width: none !important;
    }

    .territory-card h3 {
        font-size: 1.95rem !important;
    }

    .territory-actions {
        flex-direction: row !important;
        align-items: flex-end !important;
        gap: 12px !important;
    }

    .territory-actions .card-small-actions {
        grid-template-columns: repeat(2, 44px) !important;
        grid-template-rows: repeat(2, 44px) !important;
        gap: 8px !important;
    }

    .territory-actions .card-icon-action {
        width: 44px !important;
        min-width: 44px !important;
        height: 44px !important;
        min-height: 44px !important;
    }

    .territory-actions .card-main-action {
        width: 58px !important;
        min-width: 58px !important;
        height: 58px !important;
        min-height: 58px !important;
    }
}
`;
document.head.appendChild(style);

function numberFromText(value) {
    const match = String(value || '').match(/\d+/);
    return match ? match[0] : '';
}

function cardStatus(card) {
    if (card.classList.contains('status-free') || card.classList.contains('bg-emerald-900/40')) return 'free';
    if (card.classList.contains('status-busy') || card.classList.contains('bg-blue-900/40')) return 'busy';
    if (card.classList.contains('status-overdue') || card.classList.contains('bg-rose-900/40')) return 'overdue';
    if (card.classList.contains('status-waiting') || card.classList.contains('bg-amber-900/40')) return 'waiting';
    return '';
}

function cleanHeading(card, status) {
    const headingRow = card.firstElementChild;
    if (!headingRow) return;

    const kicker = headingRow.querySelector('div > span');
    if (kicker) kicker.classList.add('territory-kicker');

    let badge = headingRow.querySelector('.badge');

    if (status === 'free') {
        badge?.classList.add('card-free-badge');
        return;
    }

    if (status === 'busy' && badge) {
        const days = numberFromText(badge.textContent);
        if (days) {
            badge.textContent = days;
            badge.classList.add('card-day-counter');
        }
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

        badge.textContent = days || badge.textContent || '0';
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
            p.textContent = `${isFr() ? 'Rendu' : 'Сдали'}: ${date}`;
            p.classList.add('waiting-return-line');
            return;
        }

        if (/Можно выдать снова:|Peut être attribué à nouveau\s*:/i.test(text)) {
            p.remove();
            return;
        }

        if (/До повторной выдачи:|Avant la prochaine attribution\s*:/i.test(text)) {
            p.remove();
        }
    });
}

function makeIconOnly(button, iconClass, title, main = false) {
    if (!button) return;
    button.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.classList.remove('tile-secondary-btn', 'tile-primary-btn');
    button.classList.add(main ? 'card-main-action' : 'card-icon-action');
}

function makeMapIconOnly(link) {
    if (!link) return;
    link.innerHTML = '<i class="fa-solid fa-map"></i>';
    link.title = isFr() ? 'Carte' : 'Карта';
    link.setAttribute('aria-label', link.title);
    link.classList.add('card-icon-action');
    link.classList.remove('mini-btn');
}

function normalizeActionLayout(card) {
    const actions = [...card.children].find((element) =>
        element.classList.contains('territory-actions') || element.classList.contains('border-t')
    );
    if (!actions) return;

    actions.classList.add('territory-actions');

    let smallActions = actions.querySelector('.card-small-actions');
    if (!smallActions) {
        smallActions = document.createElement('div');
        smallActions.className = 'card-small-actions';
        actions.prepend(smallActions);
    }

    const mapLink = card.querySelector('a[href].mini-btn, a[href].card-icon-action');
    const mapRow = mapLink?.parentElement;
    const copyButton = mapRow?.querySelector('.copy-map-btn') || card.querySelector('.copy-map-btn');
    const editButton = card.querySelector('button[onclick*="editTerritory"]');
    const historyButton = card.querySelector('button[onclick*="showHistory"]');

    makeMapIconOnly(mapLink);
    if (copyButton) {
        copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
        copyButton.title = isFr() ? 'Copier le lien de la carte' : 'Скопировать ссылку на карту';
        copyButton.setAttribute('aria-label', copyButton.title);
        copyButton.classList.add('card-icon-action');
    }

    [mapLink, copyButton, editButton, historyButton].forEach((control) => {
        if (control && control.parentElement !== smallActions) smallActions.appendChild(control);
    });

    if (mapRow && mapRow !== smallActions && mapRow.children.length === 0) {
        mapRow.classList.add('card-map-row-empty');
    }

    [...actions.children].forEach((child) => {
        if (child !== smallActions && child.matches('div') && child.children.length === 0) child.remove();
    });
}

function cleanActions(card, status) {
    makeIconOnly(
        card.querySelector('button[onclick*="editTerritory"]'),
        'fa-pen',
        isFr() ? 'Modifier' : 'Изменить'
    );

    makeIconOnly(
        card.querySelector('button[onclick*="showHistory"]'),
        'fa-clock-rotate-left',
        isFr() ? 'Historique' : 'История'
    );

    makeIconOnly(
        card.querySelector('button[onclick*="issueTerritory"]'),
        'fa-paper-plane',
        isFr() ? 'Attribuer' : 'Выдать',
        true
    );

    makeIconOnly(
        card.querySelector('button[onclick*="returnTerritory"]'),
        'fa-rotate-left',
        isFr() ? 'Rendre' : 'Сдать',
        true
    );

    const locked = card.querySelector('button:disabled');
    if (status === 'waiting' && locked) {
        makeIconOnly(
            locked,
            'fa-lock',
            isFr() ? 'Indisponible' : 'Пока нельзя выдать',
            true
        );
        locked.classList.add('card-lock-action');
        locked.disabled = true;
    }

    normalizeActionLayout(card);
}

function cleanCard(card) {
    if (!(card instanceof HTMLElement)) return;
    const status = cardStatus(card);
    cleanHeading(card, status);
    if (status === 'waiting') cleanWaitingInfo(card);
    cleanActions(card, status);
}

function cleanCards() {
    $('grid')?.querySelectorAll(':scope > article').forEach(cleanCard);
}

function fixCityMapUi() {
    const menu = $('city-menu');
    const mapButton = menu?.querySelector('button[onclick*="editCityMap"]');
    if (mapButton) {
        mapButton.innerHTML = `<i class="fa-solid fa-earth-americas w-5"></i><span>${isFr() ? 'Carte de la ville' : 'Карта города'}</span>`;
    }

    const title = $('dialog-title');
    const titleText = title?.textContent || '';
    const isMapDialog = /Изменить ссылку на карту|Изменить ссылку на основную карту города|Ссылка на карту|Modifier le lien de la carte|Lien de carte/i.test(titleText);
    if (!isMapDialog) return;

    title.textContent = isFr() ? 'Carte de la ville' : 'Карта города';

    $('dialog-fields')?.querySelectorAll('label > span').forEach((label) => {
        label.textContent = isFr() ? 'Lien' : 'Ссылка';
    });
}

const grid = $('grid');
if (grid) {
    new MutationObserver(() => queueMicrotask(cleanCards)).observe(grid, {
        childList: true,
        subtree: true
    });
}

const dialog = $('dialog-modal');
if (dialog) {
    new MutationObserver(() => queueMicrotask(fixCityMapUi)).observe(dialog, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

new MutationObserver(() => {
    queueMicrotask(() => {
        cleanCards();
        fixCityMapUi();
    });
}).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

cleanCards();
fixCityMapUi();
