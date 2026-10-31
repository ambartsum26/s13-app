// Samsung bottom sheets must follow the visual viewport when a soft keyboard opens.
// This standalone enhancement deliberately does not modify the production Firebase bundle.
const popupIds = ['dialog-modal', 'publisher-picker-modal', 'history-modal', 'confirm-modal'];
const phoneViewport = window.matchMedia('(max-width: 639px), (max-height: 540px) and (pointer: coarse)');
const visual = window.visualViewport;
const popups = popupIds.map(id => document.getElementById(id)).filter(Boolean);

function keyboardLayoutEnabled() {
    return Boolean(visual && phoneViewport.matches
        && document.documentElement.classList.contains('s13-samsung-oneui'));
}

function openPopup() {
    return popups.find(modal => !modal.classList.contains('hidden')) || null;
}

function revealFocusedInput(modal) {
    const focused = document.activeElement;
    if (!focused || !modal.contains(focused)
        || !focused.matches('input, textarea, select')) return;

    const scrollArea = modal.id === 'dialog-modal'
        ? modal.querySelector('#dialog-fields')
        : modal.id === 'publisher-picker-modal'
            ? modal.querySelector('#publisher-picker-list')
            : null;
    if (!scrollArea || scrollArea.clientHeight <= 0) return;

    const field = focused.getBoundingClientRect();
    const available = scrollArea.getBoundingClientRect();
    const padding = 12;

    if (field.bottom > available.bottom - padding) {
        scrollArea.scrollTop += field.bottom - available.bottom + padding;
    } else if (field.top < available.top + padding) {
        scrollArea.scrollTop -= available.top - field.top + padding;
    }
}

function updateKeyboardLayout() {
    const enabled = keyboardLayoutEnabled();
    for (const modal of popups) {
        if (!enabled || modal.classList.contains('hidden')) {
            modal.style.removeProperty('--s13-modal-view-height');
            modal.style.removeProperty('--s13-modal-view-top');
            continue;
        }
        // Keep the overlay inside the viewport after keyboard or browser-toolbar changes.
        modal.style.setProperty('--s13-modal-view-height',
            `${Math.max(1, Math.round(visual.height))}px`);
        modal.style.setProperty('--s13-modal-view-top',
            `${Math.max(0, Math.round(visual.offsetTop))}px`);
    }
    if (enabled) {
        const current = openPopup();
        if (current) revealFocusedInput(current);
    }
}

let updateScheduled = false;
function scheduleKeyboardLayout() {
    if (updateScheduled) return;
    updateScheduled = true;
    window.requestAnimationFrame(() => {
        updateScheduled = false;
        updateKeyboardLayout();
    });
}

visual?.addEventListener('resize', scheduleKeyboardLayout);
visual?.addEventListener('scroll', scheduleKeyboardLayout);
window.addEventListener('resize', scheduleKeyboardLayout);
phoneViewport.addEventListener?.('change', scheduleKeyboardLayout);
document.addEventListener('focusin', event => {
    if (popups.some(modal => modal.contains(event.target))) scheduleKeyboardLayout();
}, true);
for (const modal of popups) {
    new MutationObserver(scheduleKeyboardLayout).observe(modal, {
        attributes: true, attributeFilter: ['class']
    });
}
new MutationObserver(scheduleKeyboardLayout).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
});
scheduleKeyboardLayout();
