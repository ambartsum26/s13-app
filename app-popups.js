const byId = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const popupSpecs = [
    { id: 'history-modal', zIndex: 80, close: () => window.closeHistory?.() },
    { id: 'publisher-picker-modal', zIndex: 100, close: () => window.closePicker?.() },
    { id: 'confirm-modal', zIndex: 110, close: () => window.closeConfirm?.(false) },
    { id: 'dialog-modal', zIndex: 9999, close: () => window.closeDialog?.(false) }
];

const isOpen = (element) => !!element && !element.classList.contains('hidden');

function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
}

function getTopOpenPopup() {
    return [...popupSpecs]
        .sort((a, b) => b.zIndex - a.zIndex)
        .find((spec) => isOpen(byId(spec.id)));
}

function closeAuxiliaryMenus() {
    byId('city-menu')?.classList.add('hidden');
}

function syncScrollLock() {
    const value = popupSpecs.some((spec) => isOpen(byId(spec.id))) ? 'hidden' : '';
    if (document.body.style.overflow !== value) document.body.style.overflow = value;
}

function simplifyStaticLabels() {
    byId('active-city-title')?.previousElementSibling?.classList.add('hidden');

    const publishersTitle = byId('publishers-title');
    publishersTitle?.previousElementSibling?.classList.add('hidden');
    byId('publishers-count')?.parentElement?.classList.add('hidden');

    setText(byId('publisher-add-label'), isFr() ? 'Ajouter' : 'Добавить');
    setText(byId('publisher-picker-title'), isFr() ? 'Proclamateur' : 'Возвещатель');

    const publisherSearch = byId('publishers-search');
    if (publisherSearch) publisherSearch.placeholder = isFr() ? 'Recherche' : 'Поиск';

    const pickerSearch = byId('publisher-picker-search');
    if (pickerSearch) pickerSearch.placeholder = isFr() ? 'Recherche' : 'Поиск';
}

function simplifyDialogLabels() {
    const title = byId('dialog-title');
    if (title) {
        const replacements = isFr()
            ? new Map([
                ['Modifier le nom', 'Nom'],
                ['Modifier le lien de la carte', 'Lien de carte'],
                ['Modifier le lien de la carte principale', 'Lien de carte'],
                ['Ajouter un proclamateur', 'Proclamateur'],
                ['Modifier le proclamateur', 'Proclamateur']
            ])
            : new Map([
                ['Изменить название', 'Название'],
                ['Изменить ссылку на карту', 'Ссылка на карту'],
                ['Изменить ссылку на основную карту города', 'Ссылка на карту'],
                ['Добавить возвещателя', 'Возвещатель'],
                ['Изменить возвещателя', 'Возвещатель']
            ]);
        if (replacements.has(title.textContent)) setText(title, replacements.get(title.textContent));
    }

    byId('dialog-fields')?.querySelectorAll('label > span').forEach((label) => {
        const replacements = isFr()
            ? new Map([
                ['Nom de la ville', 'Nom'],
                ['Numéro', 'N°'],
                ['Modifier le nom', 'Nom'],
                ['Proclamateurs', 'Nom']
            ])
            : new Map([
                ['Название города', 'Название'],
                ['Номер участка', 'Номер'],
                ['Изменить название', 'Название'],
                ['Возвещатели', 'Имя']
            ]);
        if (replacements.has(label.textContent)) setText(label, replacements.get(label.textContent));
    });
}

function ensureCityEditControls() {
    const editButton = document.querySelector('#city-menu-wrap > button');
    if (editButton) {
        const currentLabel = byId('btn-edit-city-label')?.textContent || (isFr() ? 'Modifier la ville' : 'Изменить город');
        const html = '<i class="fa-solid fa-pen"></i>' + `<span id="btn-edit-city-label" class="hidden">${currentLabel}</span>`;
        if (editButton.innerHTML !== html) editButton.innerHTML = html;
        editButton.title = isFr() ? 'Ville' : 'Город';
        editButton.setAttribute('aria-label', editButton.title);
        editButton.classList.remove('px-3.5');
        editButton.classList.add('w-10', 'px-0');
    }

    const menu = byId('city-menu');
    if (!menu) return;

    const nameButton = menu.querySelector('button[onclick*="renameCity"]');
    const mapButton = menu.querySelector('button[onclick*="editCityMap"]');

    if (nameButton) {
        const html = '<i class="fa-solid fa-signature w-5 mr-1"></i>' + (isFr() ? 'Nom' : 'Название');
        if (nameButton.innerHTML !== html) nameButton.innerHTML = html;
    }

    if (mapButton) {
        const html = '<i class="fa-solid fa-earth-americas w-5 mr-1"></i>' + (isFr() ? 'Lien de carte' : 'Ссылка на карту');
        if (mapButton.innerHTML !== html) mapButton.innerHTML = html;
    }
}

function applyCompactUi() {
    ensureCityEditControls();
    simplifyStaticLabels();
    simplifyDialogLabels();
}

function setupPopupBehavior() {
    const style = document.createElement('style');
    style.id = 's13-popup-behavior';
    style.textContent = `
        @keyframes popupSurfaceIn {
            from { opacity: 0; transform: translateY(8px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .s13-popup-overlay > .glass-panel { animation: popupSurfaceIn .18s ease-out; }
        #dialog-modal { z-index: 9999 !important; }
        #city-menu {
            z-index: 500 !important;
            top: auto !important;
            bottom: calc(100% + .65rem) !important;
            margin-top: 0 !important;
            max-height: min(320px, calc(100vh - 2rem));
            overflow-y: auto !important;
        }
    `;
    document.head.appendChild(style);

    applyCompactUi();

    new MutationObserver(() => queueMicrotask(applyCompactUi)).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    const dialogContentObserver = new MutationObserver(() => queueMicrotask(simplifyDialogLabels));
    const dialogTitle = byId('dialog-title');
    const dialogFields = byId('dialog-fields');
    if (dialogTitle) dialogContentObserver.observe(dialogTitle, { childList: true, characterData: true, subtree: true });
    if (dialogFields) dialogContentObserver.observe(dialogFields, { childList: true, characterData: true, subtree: true });

    popupSpecs.forEach((spec) => {
        const modal = byId(spec.id);
        if (!modal) return;

        modal.style.zIndex = String(spec.zIndex);
        modal.classList.add('s13-popup-overlay');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        modal.addEventListener('pointerdown', (event) => {
            if (event.target === modal) spec.close();
        });

        new MutationObserver(() => {
            if (isOpen(modal)) {
                closeAuxiliaryMenus();
                applyCompactUi();
            }
            syncScrollLock();
        }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const topPopup = getTopOpenPopup();
        if (topPopup) {
            event.preventDefault();
            topPopup.close();
            return;
        }

        byId('city-menu')?.classList.add('hidden');
    });

    syncScrollLock();
}

setupPopupBehavior();

 
// Internal navigation: closing a child returns to its existing parent surface.
function setupInternalBack() {
    let cityEdit = null;
    const closeDialog = window.closeDialog;
    window.closeDialog = ok => {
        if (cityEdit) cityEdit.returnToMenu = !!ok || cityEdit.back;
        closeDialog(ok);
    };
    for (const name of ['renameCity', 'editCityMap']) {
        const action = window[name];
        window[name] = async (...args) => {
            const context = { back: false, returnToMenu: false };
            cityEdit = context;
            try {
                await action(...args);
            } finally {
                if (cityEdit === context) cityEdit = null;
                if (context.returnToMenu && document.body.dataset.authState === 'owner') {
                    byId('city-menu')?.classList.remove('hidden');
                }
            }
        };
    }

    const buttons = [];
    function backButton(parent, action) {
        if (!parent) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 's13-back-button';
        button.onclick = action;
        parent.prepend(button);
        buttons.push(button);
        return button;
    }
    const updateLabels = () => buttons.forEach(button => {
        button.textContent = isFr() ? '← Retour' : '← Назад';
        button.setAttribute('aria-label', isFr() ? 'Revenir au niveau précédent' : 'На предыдущий уровень');
    });

    popupSpecs.forEach(spec => {
        const modal = byId(spec.id);
        backButton(modal?.firstElementChild, () => {
            if (spec.id === 'dialog-modal' && cityEdit) cityEdit.back = true;
            spec.close();
        });
    });
    backButton(byId('city-menu'), () => closeAuxiliaryMenus());

    // Keep a page stack in memory; never use the browser's history or replay writes.
    const pages = [];
    let current = null;
    let replaying = false;
    function remember(next) {
        if (document.body.dataset.authState !== 'owner') return;
        if (current && (current.page !== next.page || current.city !== next.city)) {
            if (!replaying) pages.push({ ...current, scroll: window.scrollY });
        }
        current = next;
        refresh();
    }
    const showCity = window.showTerritoryCity;
    window.showTerritoryCity = id => {
        showCity(id);
        remember({ page: 'territories', city: id });
    };
    const showPublishers = window.showPublishersPage;
    window.showPublishersPage = (...args) => {
        showPublishers(...args);
        remember({ page: 'publishers' });
    };
    const pageBack = backButton(document.querySelector('main'), () => {
        const previous = pages.pop();
        if (!previous) return;
        replaying = true;
        try {
            if (previous.page === 'publishers') window.showPublishersPage();
            else window.showTerritoryCity(previous.city);
        } finally {
            replaying = false;
            refresh();
        }
        requestAnimationFrame(() => window.scrollTo(0, previous.scroll || 0));
    });
    function refresh() {
        if (pageBack) pageBack.hidden = pages.length === 0;
    }
    new MutationObserver(() => {
        if (document.body.dataset.authState !== 'owner') {
            pages.length = 0;
            current = null;
            cityEdit = null;
            refresh();
        }
    }).observe(document.body, { attributes: true, attributeFilter: ['data-auth-state'] });

    const style = document.createElement('style');
    style.textContent = `
        .s13-back-button { min-height:44px; padding:8px 12px; margin-bottom:10px;
            border-radius:10px; font-size:13px; cursor:pointer; }
        .s13-back-button[hidden] { display:none !important; }
    `;
    document.head.appendChild(style);
    new MutationObserver(updateLabels).observe(document.documentElement, {
        attributes: true, attributeFilter: ['lang']
    });
    updateLabels();
    refresh();
}

setupInternalBack();
