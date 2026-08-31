const byId = (id) => document.getElementById(id);

const popupSpecs = [
    {
        id: 'history-modal',
        zIndex: 80,
        close: () => window.closeHistory?.()
    },
    {
        id: 'publisher-picker-modal',
        zIndex: 100,
        close: () => window.closePicker?.()
    },
    {
        id: 'confirm-modal',
        zIndex: 110,
        close: () => window.closeConfirm?.(false)
    },
    {
        id: 'dialog-modal',
        zIndex: 9999,
        close: () => window.closeDialog?.(false)
    }
];

const isOpen = (element) =>
    !!element && !element.classList.contains('hidden');

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

function ensureCityEditControls() {
    const editButton = document.querySelector('#city-menu-wrap > button');
    if (editButton) {
        const currentLabel = byId('btn-edit-city-label')?.textContent ||
            (document.documentElement.lang === 'fr' ? 'Modifier la ville' : 'Изменить город');

        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i>' +
            `<span id="btn-edit-city-label" class="hidden">${currentLabel}</span>`;

        editButton.title = document.documentElement.lang === 'fr'
            ? 'Modifier la ville'
            : 'Изменить город';
        editButton.setAttribute('aria-label', editButton.title);
        editButton.classList.remove('px-3.5');
        editButton.classList.add('w-10', 'px-0');
    }

    const menu = byId('city-menu');
    if (!menu) return;

    const nameButton = menu.querySelector('button[onclick*="renameCity"]');
    const mapButton = menu.querySelector('button[onclick*="editCityMap"]');

    if (nameButton) {
        nameButton.innerHTML = '<i class="fa-solid fa-signature w-5 mr-1"></i>' +
            (document.documentElement.lang === 'fr' ? 'Modifier le nom' : 'Изменить название');
    }

    if (!mapButton) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'w-full text-left px-4 py-2.5 transition';
        button.setAttribute('onclick', 'editCityMap();editCityMenu()');
        button.innerHTML = '<i class="fa-solid fa-earth-americas w-5 mr-1"></i>' +
            (document.documentElement.lang === 'fr'
                ? 'Modifier le lien de la carte principale'
                : 'Изменить ссылку на основную карту города');
        menu.appendChild(button);
    } else {
        mapButton.innerHTML = '<i class="fa-solid fa-earth-americas w-5 mr-1"></i>' +
            (document.documentElement.lang === 'fr'
                ? 'Modifier le lien de la carte principale'
                : 'Изменить ссылку на основную карту города');
    }
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

        /* Меню изменения города раскрывается ВВЕРХ от карандаша,
           чтобы оба пункта всегда были видны. */
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

    ensureCityEditControls();

    const langObserver = new MutationObserver(ensureCityEditControls);
    langObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

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
