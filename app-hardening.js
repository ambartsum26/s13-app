import { isAllowedAppUrl, safeStorageGet, safeStorageSet, safeStorageRemove } from './app-security-utils.js';

function memoryStorage() {
    const values = new Map();
    return {
        get length() { return values.size; },
        clear() { values.clear(); },
        getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
        key(index) { return [...values.keys()][index] ?? null; },
        removeItem(key) { values.delete(String(key)); },
        setItem(key, value) { values.set(String(key), String(value)); }
    };
}

function installSessionStorageFallback() {
    try {
        const storage = window.sessionStorage;
        storage.getItem('__s13_storage_probe__');
        return storage;
    } catch {
        const fallback = memoryStorage();
        try {
            Object.defineProperty(window, 'sessionStorage', {
                configurable: true,
                enumerable: true,
                value: fallback
            });
        } catch {
            try {
                Object.defineProperty(Window.prototype, 'sessionStorage', {
                    configurable: true,
                    get: () => fallback
                });
            } catch {
                // The fallback is still used by this module even if the browser
                // does not let us shadow Window.sessionStorage.
            }
        }
        return fallback;
    }
}

const session = installSessionStorageFallback();

function installCriticalUtilityFallback() {
    const style = document.createElement('style');
    style.id = 's13-critical-utility-fallback';
    style.textContent = `
        .hidden{display:none!important}.block{display:block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}
        .fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.inset-0{inset:0}
        .items-center{align-items:center}.items-start{align-items:flex-start}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.justify-end{justify-content:flex-end}
        .flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.flex-1{flex:1 1 0%}.shrink-0{flex-shrink:0}.min-w-0{min-width:0}.w-full{width:100%}.min-h-screen{min-height:100vh}
        .overflow-hidden{overflow:hidden}.overflow-y-auto{overflow-y:auto}.overflow-x-auto{overflow-x:auto}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}
        .cursor-not-allowed{cursor:not-allowed}.opacity-45{opacity:.45}.space-y-2>*+*{margin-top:.5rem}.space-y-3>*+*{margin-top:.75rem}.space-y-4>*+*{margin-top:1rem}
        .gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}
        [data-s13-blocked-href="1"]{display:none!important}[data-s13-blocked-href="1"]+.copy-map-btn{display:none!important}
        @media(min-width:640px){.sm\\:flex-row{flex-direction:row}.sm\\:items-center{align-items:center}.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(min-width:1024px){.lg\\:block{display:block}.lg\\:hidden{display:none}}
    `;
    document.head.appendChild(style);
}

function trustedInlineHandler(element, value) {
    if (element.tagName !== 'BUTTON') return false;
    const source = String(value || '').trim();
    const classes = element.classList;

    const recordAction = source.match(/^(issueTerritory|returnTerritory|editTerritory|showHistory|editPublisher|deletePublisher)\('([A-Za-z0-9_-]{1,200})'\)$/);
    if (recordAction) {
        const action = recordAction[1];
        if (action === 'issueTerritory' || action === 'returnTerritory') {
            return classes.contains('action-btn') || classes.contains('h-8');
        }
        return classes.contains('square-btn');
    }

    const historyAction = source.match(/^(editHistory|deleteHistory)\((\d+)\)$/);
    return !!historyAction && classes.contains('square-btn');
}

function installInnerHtmlGuard() {
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (!descriptor?.get || !descriptor?.set || descriptor.configurable === false) return;

    const blockedTags = new Set([
        'SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'BASE', 'META', 'LINK', 'FORM',
        'IMG', 'SVG', 'MATH', 'VIDEO', 'AUDIO', 'SOURCE', 'TRACK'
    ]);
    const urlAttributes = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);
    const trustedIds = new Set(['auth-lang-slider', 'publisher-picker-add-label', 'btn-edit-city-label']);

    const sanitize = value => {
        const template = document.createElement('template');
        descriptor.set.call(template, String(value ?? ''));

        template.content.querySelectorAll('*').forEach(element => {
            if (blockedTags.has(element.tagName)) {
                element.remove();
                return;
            }

            [...element.attributes].forEach(attribute => {
                const name = attribute.name.toLowerCase();
                const attributeValue = attribute.value;

                if (name.startsWith('on')) {
                    if (name !== 'onclick' || !trustedInlineHandler(element, attributeValue)) {
                        element.removeAttribute(attribute.name);
                    }
                    return;
                }

                if (name === 'srcdoc' || name === 'xmlns') {
                    element.removeAttribute(attribute.name);
                    return;
                }

                if (name === 'style') {
                    const trustedJw = element.tagName === 'SPAN' && element.textContent.trim() === 'JW' && element.getAttribute('aria-hidden') === 'true';
                    if (!trustedJw) element.removeAttribute(attribute.name);
                    return;
                }

                if (name === 'id' && !trustedIds.has(attributeValue)) {
                    element.removeAttribute(attribute.name);
                    return;
                }

                if (urlAttributes.has(name) && !isAllowedAppUrl(attributeValue, location.href)) {
                    element.removeAttribute(attribute.name);
                }
            });

            if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
                element.setAttribute('rel', 'noopener noreferrer');
            }
        });

        return descriptor.get.call(template);
    };

    Object.defineProperty(Element.prototype, 'innerHTML', {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
            descriptor.set.call(this, sanitize(value));
        }
    });
}

function installAnchorGuard() {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
    if (!descriptor?.get || !descriptor?.set || descriptor.configurable === false) return;

    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
            if (isAllowedAppUrl(value, location.href)) {
                delete this.dataset.s13BlockedHref;
                this.removeAttribute('aria-disabled');
                descriptor.set.call(this, value);
                if (this.target === '_blank') this.rel = 'noopener noreferrer';
                return;
            }

            descriptor.set.call(this, '#');
            this.dataset.s13BlockedHref = '1';
            this.setAttribute('aria-disabled', 'true');
        }
    });

    document.addEventListener('click', event => {
        const link = event.target.closest?.('a[data-s13-blocked-href="1"]');
        if (!link) return;
        event.preventDefault();
        event.stopPropagation();
    }, true);
}

function secureBlankLinks(root = document) {
    root.querySelectorAll?.('a[target="_blank"]').forEach(link => {
        link.rel = 'noopener noreferrer';
        const raw = link.getAttribute('href');
        if (raw && !isAllowedAppUrl(raw, location.href)) {
            link.href = '#';
        }
    });
}

function installBlankLinkObserver() {
    secureBlankLinks();
    new MutationObserver(records => {
        records.forEach(record => record.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            if (node.matches?.('a[target="_blank"]')) secureBlankLinks(node.parentElement || document);
            else secureBlankLinks(node);
        }));
    }).observe(document.body, { childList: true, subtree: true });
}

function installListboxKeyboardNavigation() {
    const pickerList = document.getElementById('publisher-picker-list');
    if (pickerList) pickerList.setAttribute('role', 'listbox');

    const syncRoles = root => {
        root?.querySelectorAll?.('#publisher-picker-list button, .s13-publisher-suggestions button').forEach(button => {
            button.setAttribute('role', 'option');
        });
    };
    syncRoles(document);

    new MutationObserver(() => syncRoles(document)).observe(document.body, { childList: true, subtree: true });

    document.addEventListener('keydown', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.id === 'publisher-picker-search' && event.key === 'ArrowDown') {
            const first = document.querySelector('#publisher-picker-list button');
            if (first) {
                event.preventDefault();
                event.stopPropagation();
                first.focus();
            }
            return;
        }

        const panel = target.closest?.('#publisher-picker-list, .s13-publisher-suggestions');
        if (!panel || target.tagName !== 'BUTTON') return;
        const buttons = [...panel.querySelectorAll('button:not(:disabled)')];
        const index = buttons.indexOf(target);
        if (index < 0) return;

        let next = null;
        if (event.key === 'ArrowDown') next = buttons[Math.min(buttons.length - 1, index + 1)];
        if (event.key === 'ArrowUp') next = buttons[Math.max(0, index - 1)];
        if (event.key === 'Home') next = buttons[0];
        if (event.key === 'End') next = buttons.at(-1);

        if (next) {
            event.preventDefault();
            next.focus();
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            const input = panel.id === 'publisher-picker-list'
                ? document.getElementById('publisher-picker-search')
                : panel.previousElementSibling;
            panel.classList.remove('is-open');
            input?.focus?.();
        }
    }, true);
}

function installPopupAccessibility() {
    const popupSpecs = [
        ['history-modal', 'history-title'],
        ['publisher-picker-modal', 'publisher-picker-title'],
        ['confirm-modal', null],
        ['dialog-modal', 'dialog-title']
    ];
    const activators = new WeakMap();
    let lastActivator = null;

    const openPopup = () => popupSpecs
        .map(([id]) => document.getElementById(id))
        .filter(modal => modal && !modal.classList.contains('hidden'))
        .sort((a, b) => (Number(getComputedStyle(b).zIndex) || 0) - (Number(getComputedStyle(a).zIndex) || 0))[0] || null;

    document.addEventListener('pointerdown', event => {
        const target = event.target;
        if (target instanceof HTMLElement && !target.closest('.s13-popup-overlay')) lastActivator = target;
    }, true);
    document.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && !event.target.closest('.s13-popup-overlay')) {
            lastActivator = event.target;
        }
    }, true);

    popupSpecs.forEach(([id, labelId]) => {
        const modal = document.getElementById(id);
        if (!modal) return;
        if (labelId) modal.setAttribute('aria-labelledby', labelId);
        else modal.setAttribute('aria-describedby', 'confirm-text');

        let wasOpen = !modal.classList.contains('hidden');
        new MutationObserver(() => {
            const isOpen = !modal.classList.contains('hidden');
            if (isOpen && !wasOpen) {
                activators.set(modal, lastActivator?.isConnected ? lastActivator : null);
            }
            if (!isOpen && wasOpen) {
                const target = activators.get(modal);
                if (target?.isConnected) queueMicrotask(() => target.focus?.());
            }
            wasOpen = isOpen;
        }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const modal = openPopup();
        if (!modal) return;

        const focusable = [...modal.querySelectorAll(
            'button:not(:disabled), a[href]:not([aria-disabled="true"]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        )].filter(element => !element.closest('.hidden'));

        if (!focusable.length) {
            event.preventDefault();
            modal.tabIndex = -1;
            modal.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
            event.preventDefault();
            first.focus();
        }
    }, true);
}

function installCityIdNavigation() {
    const originalShowCity = window.showTerritoryCity;
    const originalHome = window.showHomePage;
    if (typeof originalShowCity !== 'function' || typeof originalHome !== 'function') return;

    const openStoredCity = () => {
        const id = safeStorageGet(session, 's13-active-city-id');
        if (!id) return false;

        const page = document.getElementById('territories-page');
        originalShowCity(id);
        const opened = !!page && !page.classList.contains('hidden');
        if (!opened) {
            safeStorageRemove(session, 's13-active-city-id');
            return false;
        }

        safeStorageSet(session, 's13-active-city-id', id);
        safeStorageRemove(session, 's13-last-city-name');
        document.body.dataset.activeCityId = id;
        return true;
    };

    window.showTerritoryCity = id => {
        const result = originalShowCity(id);
        const page = document.getElementById('territories-page');
        if (page && !page.classList.contains('hidden')) {
            safeStorageSet(session, 's13-active-city-id', id);
            safeStorageRemove(session, 's13-last-city-name');
            document.body.dataset.activeCityId = id;
        }
        return result;
    };

    window.showHomePage = () => {
        if (openStoredCity()) return;
        return originalHome();
    };

    const sectionButton = document.getElementById('app-section-button');
    sectionButton?.addEventListener('click', event => {
        const publishersOpen = !document.getElementById('publishers-page')?.classList.contains('hidden');
        if (!publishersOpen || !safeStorageGet(session, 's13-active-city-id')) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        if (!openStoredCity()) originalHome();
    }, true);
}

installCriticalUtilityFallback();
installInnerHtmlGuard();
installAnchorGuard();
installBlankLinkObserver();
installListboxKeyboardNavigation();
installPopupAccessibility();
queueMicrotask(installCityIdNavigation);
