const $ = (id) => document.getElementById(id);
const isFrench = () => document.documentElement.lang === 'fr';

const FILTERS = [
    { counterId: 'st-free', status: 'free' },
    { counterId: 'st-busy', status: 'busy' },
    { counterId: 'st-overdue', status: 'overdue' },
    { counterId: 'st-waiting', status: 'waiting' }
];

const labels = {
    ru: {
        free: 'Показать свободные участки',
        busy: 'Показать участки в обработке',
        overdue: 'Показать просроченные участки',
        waiting: 'Показать участки в режиме ожидания',
        all: 'Показать все участки'
    },
    fr: {
        free: 'Afficher les territoires libres',
        busy: 'Afficher les territoires attribués',
        overdue: 'Afficher les territoires en retard',
        waiting: 'Afficher les territoires en attente',
        all: 'Afficher tous les territoires'
    }
};

let activeFilter = null;

const style = document.createElement('style');
style.id = 's13-status-filters';
style.textContent = `
#grid > article.s13-filter-hidden { display:none !important; }
.status-chip.s13-filter-control {
    cursor:pointer !important;
    user-select:none;
    transition:transform .16s ease, box-shadow .16s ease, filter .16s ease !important;
}
.status-chip.s13-filter-control:hover { filter:brightness(1.08); }
.status-chip.s13-filter-control:focus-visible {
    outline:none !important;
    box-shadow:0 0 0 3px rgba(255,255,255,.62) !important;
}
.status-chip.s13-filter-active {
    box-shadow:0 0 0 3px rgba(255,255,255,.92) !important;
    transform:translateY(-1px) !important;
    filter:brightness(1.08);
}
@media (hover:none), (pointer:coarse) {
    .status-chip.s13-filter-control:hover { filter:none; }
    .status-chip.s13-filter-active { transform:none !important; filter:brightness(1.08); }
}
`;
document.head.appendChild(style);

function cardStatus(card) {
    if (card.classList.contains('status-free') || card.classList.contains('bg-emerald-900/40')) return 'free';
    if (card.classList.contains('status-busy') || card.classList.contains('bg-blue-900/40')) return 'busy';
    if (card.classList.contains('status-overdue') || card.classList.contains('bg-rose-900/40')) return 'overdue';
    if (card.classList.contains('status-waiting') || card.classList.contains('bg-amber-900/40')) return 'waiting';
    return '';
}

function chipFor(counterId) {
    const counter = $(counterId);
    return counter?.closest('.status-chip, .h-11') || null;
}

function updateControls() {
    const dictionary = labels[isFrench() ? 'fr' : 'ru'];

    FILTERS.forEach(({ counterId, status }) => {
        const chip = chipFor(counterId);
        if (!chip) return;

        const selected = activeFilter === status;
        chip.classList.toggle('s13-filter-active', selected);
        chip.setAttribute('aria-pressed', String(selected));
        chip.setAttribute('aria-label', selected ? dictionary.all : dictionary[status]);
        chip.title = selected ? dictionary.all : dictionary[status];
    });
}

function applyFilter() {
    document.querySelectorAll('#grid > article').forEach(card => {
        const hidden = !!activeFilter && cardStatus(card) !== activeFilter;
        card.classList.toggle('s13-filter-hidden', hidden);
    });
    updateControls();
}

function toggleFilter(status) {
    activeFilter = activeFilter === status ? null : status;
    applyFilter();
}

function setupControl(counterId, status) {
    const chip = chipFor(counterId);
    if (!chip || chip.dataset.s13FilterReady === '1') return;

    chip.dataset.s13FilterReady = '1';
    chip.dataset.s13Filter = status;
    chip.classList.add('s13-filter-control');
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');

    chip.addEventListener('click', () => toggleFilter(status));
    chip.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleFilter(status);
    });
}

function setupFilters() {
    FILTERS.forEach(({ counterId, status }) => setupControl(counterId, status));
    applyFilter();
}

const grid = $('grid');
if (grid) {
    new MutationObserver(() => queueMicrotask(applyFilter)).observe(grid, {
        childList: true,
        subtree: false
    });
}

new MutationObserver(() => queueMicrotask(() => {
    setupFilters();
    updateControls();
})).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

setupFilters();
