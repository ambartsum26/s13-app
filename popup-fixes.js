const byId = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const popupSpecs = [
    { id: 'history-modal', zIndex: 80, close: () => window.closeHistory?.() },
    { id: 'publisher-picker-modal', zIndex: 100, close: () => window.closePicker?.() },
    { id: 'confirm-modal', zIndex: 110, close: () => window.closeConfirm?.(false) },
    { id: 'dialog-modal', zIndex: 9999, close: () => window.closeDialog?.(false) }
];

const isOpen = (element) =>
    !!element && !element.classList.contains('hidden');

function setText(element, value) {
    if (element && element.textContent !== value) {
        element.textContent = value;
    }
}

function getTopOpenPopup() {
    return [...popupSpecs]
        .sort((a, b) => b.zIndex - a.zIndex)
        .find((spec) => isOpen(byId(spec.id)));
}

function closeAuxiliaryMenus() {
    byId('city-menu')?.classList.add('hidden');

    if (window.innerWidth < 1024) {
        byId('sidebar')?.classList.remove('mobile-open');
    }
}

function syncScrollLock() {
    const anyModalOpen = popupSpecs.some((spec) => isOpen(byId(spec.id)));
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
}

function simplifyStaticLabels() {
    const currentCityLabel = byId('active-city-title')?.previousElementSibling;
    currentCityLabel?.classList.add('hidden');

    // Во вкладке «Возвещатели» оставляем только сам заголовок,
    // поиск, кнопку добавления и список. Служебные подписи скрыты.
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

        if (replacements.has(title.textContent)) {
            setText(title, replacements.get(title.textContent));
        }
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

        if (replacements.has(label.textContent)) {
            setText(label, replacements.get(label.textContent));
        }
    });
}

function ensureCityEditControls() {
    const editButton = document.querySelector('#city-menu-wrap > button');
    if (editButton) {
        const currentLabel = byId('btn-edit-city-label')?.textContent ||
            (isFr() ? 'Modifier la ville' : 'Изменить город');

        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i>' +
            `<span id="btn-edit-city-label" class="hidden">${currentLabel}</span>`;

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
        nameButton.innerHTML =
            '<i class="fa-solid fa-signature w-5 mr-1"></i>' +
            (isFr() ? 'Nom' : 'Название');
    }

    if (!mapButton) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'w-full text-left px-4 py-2.5 transition';
        button.setAttribute('onclick', 'editCityMap();editCityMenu()');
        button.innerHTML =
            '<i class="fa-solid fa-earth-americas w-5 mr-1"></i>' +
            (isFr() ? 'Lien de carte' : 'Ссылка на карту');
        menu.appendChild(button);
    } else {
        mapButton.innerHTML =
            '<i class="fa-solid fa-earth-americas w-5 mr-1"></i>' +
            (isFr() ? 'Lien de carte' : 'Ссылка на карту');
    }
}

function applyCompactUi() {
    ensureCityEditControls();
    simplifyStaticLabels();
    simplifyDialogLabels();
}

function setupPopupBehavior() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popupSurfaceIn {
            from { opacity: 0; transform: translateY(8px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .s13-popup-overlay > .glass-panel {
            animation: popupSurfaceIn .18s ease-out;
        }

        #dialog-modal {
            z-index: 9999 !important;
        }

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

    const langObserver = new MutationObserver(() => {
        queueMicrotask(applyCompactUi);
    });
    langObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    const dialogContentObserver = new MutationObserver(() => {
        queueMicrotask(simplifyDialogLabels);
    });
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
            if (event.target === modal) {
                spec.close();
            }
        });

        const observer = new MutationObserver(() => {
            if (isOpen(modal)) {
                closeAuxiliaryMenus();
                applyCompactUi();
                if (spec.id === 'dialog-modal') {
                    modal.style.zIndex = '9999';
                }
            }
            syncScrollLock();
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const topPopup = getTopOpenPopup();
        if (topPopup) {
            event.preventDefault();
            topPopup.close();
            return;
        }

        const cityMenu = byId('city-menu');
        if (cityMenu && !cityMenu.classList.contains('hidden')) {
            cityMenu.classList.add('hidden');
            return;
        }

        byId('sidebar')?.classList.remove('mobile-open');
    });

    document.addEventListener('pointerdown', (event) => {
        if (window.innerWidth >= 1024) return;

        const sidebar = byId('sidebar');
        if (!sidebar?.classList.contains('mobile-open')) return;

        const toggleButton = document.querySelector(
            'button[onclick="toggleMobileSidebar()"]'
        );

        if (sidebar.contains(event.target)) return;
        if (toggleButton?.contains(event.target)) return;

        sidebar.classList.remove('mobile-open');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            byId('sidebar')?.classList.remove('mobile-open');
        }
    });

    syncScrollLock();
}

setupPopupBehavior();
