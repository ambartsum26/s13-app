const byId = (id) => document.getElementById(id);

const popupSpecs = [
    {
        id: 'history-modal',
        zIndex: 80,
        close: () => window.closeHistory?.()
    },
    {
        id: 'dialog-modal',
        zIndex: 90,
        close: () => window.closeDialog?.(false)
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
    `;
    document.head.appendChild(style);

    popupSpecs.forEach((spec) => {
        const modal = byId(spec.id);
        if (!modal) return;

        modal.style.zIndex = String(spec.zIndex);
        modal.classList.add('s13-popup-overlay');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        // Клик именно по затемнённому фону закрывает окно.
        // Клики внутри карточки окна ничего не закрывают.
        modal.addEventListener('pointerdown', (event) => {
            if (event.target === modal) {
                spec.close();
            }
        });

        const observer = new MutationObserver(() => {
            if (isOpen(modal)) {
                closeAuxiliaryMenus();
            }
            syncScrollLock();
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['class']
        });
    });

    // Escape закрывает только самое верхнее открытое окно.
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

    // Мобильное боковое меню закрывается при клике вне него.
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
