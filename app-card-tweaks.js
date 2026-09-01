const $ = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

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

    if (status === 'overdue' && badge) {
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
    cleanHeading(card, status);
    if (status === 'waiting') cleanWaitingInfo(card);
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
