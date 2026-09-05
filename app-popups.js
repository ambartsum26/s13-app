const byId = (id) => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

const popupSpecs = [
    { id: 'history-modal', zIndex: 80, labelId: 'history-title', close: () => window.closeHistory?.() },
    { id: 'publisher-picker-modal', zIndex: 100, labelId: 'publisher-picker-title', close: () => window.closePicker?.() },
    { id: 'confirm-modal', zIndex: 110, labelId: 'confirm-text', close: () => window.closeConfirm?.(false) },
    { id: 'dialog-modal', zIndex: 9999, labelId: 'dialog-title', close: () => window.closeDialog?.(false) }
];

const isOpen = (element) => !!element && !element.classList.contains('hidden');
const previousFocus = new Map();

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

function focusableElements(modal) {
    return [...modal.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && !element.hidden;
    });
}

function focusPopup(spec, modal) {
    const current = document.activeElement;
    if (current instanceof HTMLElement && current !== document.body && !modal.contains(current)) {
        previousFocus.set(spec.id, current);
    }

    requestAnimationFrame(() => {
        if (!isOpen(modal)) return;
        const target = modal.querySelector('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)') || focusableElements(modal)[0];
        target?.focus({ preventScroll: true });
    });
}

function restorePopupFocus(spec) {
    const target = previousFocus.get(spec.id);
    previousFocus.delete(spec.id);
    if (target instanceof HTMLElement && target.isConnected) {
        requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
}

function trapFocus(event, modal) {
    if (event.key !== 'Tab') return;
    const focusables = focusableElements(modal);
    if (!focusables.length) {
        event.preventDefault();
        return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !modal.contains(active))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (active === last || !modal.contains(active))) {
        event.preventDefault();
        first.focus();
    }
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
        const html = '<i class="fa-solid fa-pen" aria-hidden="true"></i>' + `<span id="btn-edit-city-label" class="hidden">${currentLabel}</span>`;
        if (editButton.innerHTML !== html) editButton.innerHTML = html;
        editButton.title = isFr() ? 'Modifier la ville' : 'Изменить город';
        editButton.setAttribute('aria-label', editButton.title);
        editButton.classList.remove('px-3.5');
        editButton.classList.add('w-10', 'px-0');
    }

    const menu = byId('city-menu');
    if (!menu) return;

    const nameButton = menu.querySelector('button[onclick*="renameCity"]');
    const mapButton = menu.querySelector('button[onclick*="editCityMap"]');

    if (nameButton) {
        const html = '<i class="fa-solid fa-signature w-5 mr-1" aria-hidden="true"></i>' + (isFr() ? 'Nom' : 'Название');
        if (nameButton.innerHTML !== html) nameButton.innerHTML = html;
    }

    if (mapButton) {
        const html = '<i class="fa-solid fa-earth-americas w-5 mr-1" aria-hidden="true"></i>' + (isFr() ? 'Lien de carte' : 'Ссылка на карту');
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
            from { opacity: 0; transform: translateY(10px) scale(.988); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .s13-popup-overlay > .glass-panel { animation: popupSurfaceIn .18s cubic-bezier(.2,.8,.2,1); }
        #dialog-modal { z-index: 9999 !important; }
        #city-menu {
            z-index: 500 !important;
            top: auto !important;
            bottom: calc(100% + .65rem) !important;
            margin-top: 0 !important;
            max-height: min(320px, calc(100vh - 2rem));
            overflow-y: auto !important;
        }
        @media (prefers-reduced-motion: reduce) {
            .s13-popup-overlay > .glass-panel { animation: none !important; }
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
        if (spec.labelId) modal.setAttribute('aria-labelledby', spec.labelId);

        modal.addEventListener('pointerdown', (event) => {
            if (event.target === modal) spec.close();
        });

        let wasOpen = isOpen(modal);
        new MutationObserver(() => {
            const open = isOpen(modal);
            if (open && !wasOpen) {
                closeAuxiliaryMenus();
                applyCompactUi();
                focusPopup(spec, modal);
            } else if (!open && wasOpen) {
                restorePopupFocus(spec);
            }
            wasOpen = open;
            syncScrollLock();
        }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', (event) => {
        const topPopup = getTopOpenPopup();
        if (topPopup) {
            const modal = byId(topPopup.id);
            if (modal && event.key === 'Tab') {
                trapFocus(event, modal);
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                topPopup.close();
            }
            return;
        }

        if (event.key === 'Escape') byId('city-menu')?.classList.add('hidden');
    });

    syncScrollLock();
}

setupPopupBehavior();
