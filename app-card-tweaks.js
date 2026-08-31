const $ = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-card-tweaks';
style.textContent = `
/* Bold uppercase application typography. Inputs keep their entered value unchanged. */
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

/* Top status blocks: color + quantity only. */
.status-chip {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 14px !important;
}

.status-chip > div:first-child,
.status-chip > div:last-child > span,
.status-chip i {
    display: none !important;
}

.status-chip > div:last-child {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.status-chip b {
    color: #fff !important;
    font-size: 1.35rem !important;
    line-height: 1 !important;
    font-weight: 900 !important;
}

/* Cities fill the available row; active city is red. */
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

#cities-container button.bg-indigo-600,
#cities-container button.bg-indigo-600:hover {
    background: #dc2626 !important;
    color: #fff !important;
    box-shadow: 0 10px 25px rgba(220, 38, 38, .22) !important;
}

/* Territory number is the main visual anchor. */
.territory-card .territory-kicker,
.territory-card .badge.card-free-badge {
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
    color: #fff !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
}

/* Stable card layout. Nothing is moved in DOM. */
.territory-card > div:nth-child(2) {
    display: flex !important;
    flex-direction: column !important;
    min-height: 112px;
}

/* Map + copy stay in their original row but use the same 42px grid as edit + history. */
.territory-card > div:nth-child(2) > div:last-child {
    margin-top: auto !important;
    display: grid !important;
    grid-template-columns: repeat(2, 42px) !important;
    gap: 8px !important;
    align-items: center !important;
    width: max-content !important;
}

.territory-actions {
    width: 100% !important;
    margin-top: 0 !important;
    padding-top: 12px !important;
    display: flex !important;
    align-items: flex-end !important;
    justify-content: space-between !important;
    gap: 14px !important;
}

.territory-actions > div:first-child {
    display: grid !important;
    grid-template-columns: repeat(2, 42px) !important;
    gap: 8px !important;
    width: max-content !important;
}

.territory-card .card-icon-action,
.territory-card a.card-map-action,
.territory-card .copy-map-btn.card-icon-action {
    width: 42px !important;
    min-width: 42px !important;
    max-width: 42px !important;
    height: 42px !important;
    min-height: 42px !important;
    max-height: 42px !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    outline: none !important;
    border-radius: 12px !important;
    background: #1c283a !important;
    color: #fff !important;
    box-shadow: none !important;
    text-decoration: none !important;
    line-height: 1 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex: 0 0 42px !important;
    transition: background-color .18s ease, transform .18s ease, box-shadow .18s ease !important;
}

.territory-card .card-icon-action i,
.territory-card a.card-map-action i {
    margin: 0 !important;
    padding: 0 !important;
    color: #fff !important;
    font-size: 14px !important;
    line-height: 1 !important;
}

/* Dedicated map-link reset: old mini-btn sizing must never leak through. */
.territory-card a.mini-btn.card-map-action {
    width: 42px !important;
    min-width: 42px !important;
    max-width: 42px !important;
    height: 42px !important;
    min-height: 42px !important;
    max-height: 42px !important;
    padding: 0 !important;
    background: #1c283a !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    box-shadow: none !important;
}

.territory-card a.mini-btn.card-map-action:hover,
.territory-card .card-icon-action:not(:disabled):hover {
    background: #10b981 !important;
    color: #fff !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 9px 20px rgba(16,185,129,.18) !important;
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
    color: #fff !important;
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

    .territory-card > div:nth-child(2) > div:last-child,
    .territory-actions > div:first-child {
        grid-template-columns: repeat(2, 44px) !important;
        gap: 8px !important;
    }

    .territory-card .card-icon-action,
    .territory-card a.card-map-action,
    .territory-card .copy-map-btn.card-icon-action,
    .territory-card a.mini-btn.card-map-action {
        width: 44px !important;
        min-width: 44px !important;
        max-width: 44px !important;
        height: 44px !important;
        min-height: 44px !important;
        max-height: 44px !important;
        flex-basis: 44px !important;
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

function setHtmlOnce(element, html) {
    if (element && element.innerHTML !== html) element.innerHTML = html;
}

function setTextOnce(element, text) {
    if (element && element.textContent !== text) element.textContent = text;
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

    if (status === 'busy' && badge) {
        const days = numberFromText(badge.textContent);
        if (days) {
            setTextOnce(badge, days);
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
        setHtmlOnce(mapLink, '<i class="fa-solid fa-map-location-dot"></i>');
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
    cleanHeading(card, status);
    if (status === 'waiting') cleanWaitingInfo(card);
    cleanActions(card, status);
}

function cleanCards() {
    $('grid')?.querySelectorAll(':scope > article').forEach(cleanCard);
}

/* React only when app-core replaces cards. Never observe inside card DOM. */
const grid = $('grid');
if (grid) {
    new MutationObserver(() => queueMicrotask(cleanCards)).observe(grid, {
        childList: true,
        subtree: false
    });
}

/* Language changes only rewrite existing labels/icons once. */
new MutationObserver(() => queueMicrotask(cleanCards)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

cleanCards();
