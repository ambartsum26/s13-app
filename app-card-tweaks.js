const $ = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-card-tweaks';
style.textContent = `
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

/* Clean territory headings. */
.territory-card .territory-kicker {
    display: none !important;
}

.territory-card .badge.card-day-counter {
    min-width: 42px !important;
    min-height: 34px !important;
    padding: 0 11px !important;
    border-radius: 12px !important;
    background: rgba(3, 7, 18, .34) !important;
    font-size: 15px !important;
    font-weight: 850 !important;
    line-height: 1 !important;
}

.territory-card .badge.card-free-badge {
    display: none !important;
}

/* Secondary card actions return to compact icon buttons. */
.territory-card .card-icon-action {
    width: 40px !important;
    min-width: 40px !important;
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 !important;
    border-radius: 12px !important;
    font-size: 14px !important;
}

/* Issue / return / lock are deliberately larger than ordinary buttons. */
.territory-card .card-main-action {
    width: 50px !important;
    min-width: 50px !important;
    height: 50px !important;
    min-height: 50px !important;
    padding: 0 !important;
    border-radius: 15px !important;
    font-size: 18px !important;
}

.territory-card .card-main-action i {
    font-size: 17px !important;
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
    color: rgba(255,255,255,.86) !important;
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

    .territory-actions {
        flex-direction: row !important;
        align-items: center !important;
    }

    .territory-actions > div {
        display: flex !important;
        width: auto !important;
    }

    .territory-actions .card-icon-action {
        width: 42px !important;
        min-width: 42px !important;
    }

    .territory-actions .card-main-action {
        width: 52px !important;
        min-width: 52px !important;
        height: 52px !important;
        min-height: 52px !important;
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

        badge.textContent = days || '0';
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
    new MutationObserver(() => queueMicrotask(cleanCards)).observe(grid, { childList: true });
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
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

cleanCards();
fixCityMapUi();
