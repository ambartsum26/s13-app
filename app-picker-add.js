import { saveUniqueRecord } from './app-data.js';
import { db, requireOwner } from './app-auth.js';
import { collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const $ = id => document.getElementById(id);
const isFrench = () => document.documentElement.lang === 'fr';

const text = {
    ru: {
        button: 'Добавить и выбрать',
        title: 'Добавить возвещателя',
        field: 'Имя и фамилия',
        placeholder: 'Имя ФАМИЛИЯ',
        exists: 'Такой возвещатель уже есть в базе.',
        failed: 'Не удалось добавить возвещателя. Проверьте подключение и повторите.'
    },
    fr: {
        button: 'Ajouter et sélectionner',
        title: 'Ajouter un proclamateur',
        field: 'Prénom et nom',
        placeholder: 'Prénom NOM',
        exists: 'Ce proclamateur existe déjà dans la base.',
        failed: 'Impossible d’ajouter le proclamateur. Vérifiez la connexion et réessayez.'
    }
};

function dictionary() {
    return text[isFrench() ? 'fr' : 'ru'];
}

function normalize(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

function latinFold(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('en')
        .replace(/[^a-z]/g, '');
}

function publisherMatchScore(name, query) {
    const rawQuery = String(query || '').trim();
    if (!rawQuery) return 0;

    const needle = latinFold(rawQuery);
    const haystack = latinFold(name);
    if (!needle || !haystack) return Number.POSITIVE_INFINITY;
    if (haystack === needle) return 0;
    if (haystack.startsWith(needle)) return 10 + (haystack.length - needle.length) / 100;

    const inside = haystack.indexOf(needle);
    if (inside >= 0) return 100 + inside;

    let cursor = -1;
    let first = -1;
    let previous = -1;
    let gaps = 0;

    for (const letter of needle) {
        const next = haystack.indexOf(letter, cursor + 1);
        if (next < 0) return Number.POSITIVE_INFINITY;
        if (first < 0) first = next;
        if (previous >= 0) gaps += Math.max(0, next - previous - 1);
        previous = next;
        cursor = next;
    }

    return 1000 + first * 10 + gaps;
}

function publisherMatches(name, query) {
    return Number.isFinite(publisherMatchScore(name, query));
}

window.publisherNameMatches = publisherMatches;
window.publisherSearchScore = publisherMatchScore;

function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function updateButtonText() {
    const label = $('publisher-picker-add-label');
    if (label) label.textContent = dictionary().button;
}

function selectWhenAvailable(fullName) {
    const list = $('publisher-picker-list');
    if (!list) return;

    const expected = normalize(fullName).toLocaleLowerCase();
    const trySelect = () => {
        const button = [...list.querySelectorAll('button')].find(item =>
            normalize(item.textContent).toLocaleLowerCase() === expected
        );
        if (!button) return false;
        button.click();
        return true;
    };

    if (trySelect()) return;

    const observer = new MutationObserver(() => {
        if (trySelect()) observer.disconnect();
    });
    observer.observe(list, { childList: true });
    setTimeout(() => observer.disconnect(), 8000);
}

async function addPublisherFromPicker() {
    requireOwner();
    const d = dictionary();
    const search = normalize($('publisher-picker-search')?.value);
    const values = await window.requestAppFields?.(d.title, [{
        label: d.field,
        value: search,
        placeholder: d.placeholder
    }]);

    const fullName = normalize(values?.[0]);
    if (!fullName) return;

    try {
        const id = await saveUniqueRecord('publishers', {
            fullName,
            nameKey: fullName.toLocaleLowerCase(),
            createdAt: today()
        });

        const input = $('publisher-picker-search');
        if (input) input.value = fullName;
        window.renderPicker?.();
        selectWhenAvailable(fullName);
        return id;
    } catch (error) {
        if (error?.code === 's13/publisherExists') {
            alert(d.exists);
            return;
        }
        console.error('Add publisher from picker failed:', error);
        alert(d.failed);
    }
}

function installButton() {
    const modal = $('publisher-picker-modal');
    const list = $('publisher-picker-list');
    if (!modal || !list || $('publisher-picker-add')) return;

    const button = document.createElement('button');
    button.id = 'publisher-picker-add';
    button.type = 'button';
    button.className = 'w-full min-h-11 mt-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2';
    button.innerHTML = '<i class="fa-solid fa-user-plus"></i><span id="publisher-picker-add-label"></span>';
    button.addEventListener('click', addPublisherFromPicker);
    list.insertAdjacentElement('afterend', button);

    const style = document.createElement('style');
    style.id = 's13-picker-add-style';
    style.textContent = `
#publisher-picker-add {
    background:rgba(16,185,129,.14) !important;
    border:1px solid rgba(16,185,129,.34) !important;
    color:#d1fae5 !important;
    touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
}
#publisher-picker-add:hover { background:rgba(16,185,129,.24) !important; }
#publisher-picker-add:active { transform:scale(.985); }
#dialog-modal { z-index:9999 !important; }
.s13-publisher-search-hidden { display:none !important; }
.s13-publisher-suggestions {
    position:absolute;
    left:0;
    right:0;
    top:calc(100% + 6px);
    z-index:10020;
    display:none;
    max-height:260px;
    overflow-y:auto;
    padding:6px;
    border-radius:12px;
    background:#23232d;
    box-shadow:0 18px 52px rgba(0,0,0,.42);
}
.s13-publisher-suggestions.is-open { display:block; }
.s13-publisher-suggestions button {
    width:100%;
    min-height:44px;
    padding:0 12px !important;
    border-radius:9px !important;
    display:flex;
    align-items:center;
    justify-content:flex-start;
    text-align:left;
    background:#393846 !important;
    color:#fff !important;
    font-size:12px;
}
.s13-publisher-suggestions button + button { margin-top:4px; }
.s13-publisher-suggestions button:active {
    background:var(--dz-green-bright) !important;
    color:#11141a !important;
}
@media (hover:none), (pointer:coarse) {
    #publisher-picker-add { min-height:48px !important; }
    #publisher-picker-add:hover { background:rgba(16,185,129,.14) !important; }
    .s13-publisher-suggestions button { min-height:48px !important; }
}
`;
    document.head.appendChild(style);
    updateButtonText();
}

const coreRenderPublishers = window.renderPublishers;
const coreRenderPicker = window.renderPicker;
const searchRepairing = new Set();

function preserveInput(input, callback) {
    if (!input) return callback();
    const value = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = '';
    callback();
    input.value = value;
    try { input.setSelectionRange(start, end); } catch {}
    return value;
}

function renderPublishersSearch() {
    const input = $('publishers-search');
    const list = $('publishers-list');
    if (!input || !list || typeof coreRenderPublishers !== 'function') return;

    searchRepairing.add('publishers-search');
    const queryText = preserveInput(input, coreRenderPublishers) || '';

    [...list.children].forEach(row => {
        const name = row.querySelector(':scope > b')?.textContent || '';
        row.classList.toggle('s13-publisher-search-hidden', !publisherMatches(name, queryText));
    });

    setTimeout(() => searchRepairing.delete('publishers-search'), 0);
}

function renderPickerSearch() {
    const input = $('publisher-picker-search');
    const list = $('publisher-picker-list');
    if (!input || !list || typeof coreRenderPicker !== 'function') return;

    searchRepairing.add('publisher-picker-search');
    const queryText = preserveInput(input, coreRenderPicker) || '';

    [...list.querySelectorAll(':scope > button')].forEach(button => {
        button.classList.toggle('s13-publisher-search-hidden', !publisherMatches(button.textContent || '', queryText));
    });

    setTimeout(() => searchRepairing.delete('publisher-picker-search'), 0);
}

window.renderPublishers = renderPublishersSearch;
window.renderPicker = renderPickerSearch;

function repairSearchAfterCoreRender(inputId, listId, renderer) {
    const input = $(inputId);
    const list = $(listId);
    if (!input || !list) return;

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('inputmode', 'text');

    new MutationObserver(() => {
        if (searchRepairing.has(inputId) || !input.value.trim()) return;
        queueMicrotask(() => {
            if (!searchRepairing.has(inputId) && input.value.trim()) renderer();
        });
    }).observe(list, { childList: true });
}

repairSearchAfterCoreRender('publishers-search', 'publishers-list', renderPublishersSearch);
repairSearchAfterCoreRender('publisher-picker-search', 'publisher-picker-list', renderPickerSearch);

let publisherCache = [];
let stopPublisherCache = null;

function publisherComparator(a, b) {
    const compare = window.comparePublisherNames;
    return typeof compare === 'function'
        ? compare(a.fullName, b.fullName)
        : a.fullName.localeCompare(b.fullName, 'fr', { sensitivity: 'base' });
}

function syncPublisherCache() {
    const owner = document.body.dataset.authState === 'owner';

    if (!owner) {
        stopPublisherCache?.();
        stopPublisherCache = null;
        publisherCache = [];
        return;
    }

    if (stopPublisherCache) return;

    stopPublisherCache = onSnapshot(collection(db, 'publishers'), snapshot => {
        publisherCache = snapshot.docs
            .map(item => ({ id: item.id, fullName: normalize(item.data()?.fullName) }))
            .filter(item => item.fullName)
            .sort(publisherComparator);

        if ($('publishers-search')?.value.trim()) renderPublishersSearch();
        if ($('publisher-picker-search')?.value.trim()) renderPickerSearch();
        installDialogAutocomplete();
    }, error => {
        console.warn('Publisher autocomplete cache unavailable:', error?.code || 'unknown');
    });
}

function isPublisherDialog() {
    const modal = $('dialog-modal');
    if (!modal || modal.classList.contains('hidden')) return false;

    const title = $('dialog-title')?.textContent || '';
    const labels = [...($('dialog-fields')?.querySelectorAll('label > span') || [])]
        .map(label => label.textContent || '')
        .join(' ');
    const combined = `${title} ${labels}`;

    if (/возвещател|proclamateur/i.test(combined)) return true;
    if (/истори|historique/i.test(title) && ($('dialog-fields')?.querySelectorAll('input').length || 0) >= 3) return true;
    return false;
}

function dialogMatches(queryText) {
    return publisherCache
        .map(item => ({ ...item, score: publisherMatchScore(item.fullName, queryText) }))
        .filter(item => Number.isFinite(item.score))
        .sort((a, b) => a.score - b.score || publisherComparator(a, b))
        .slice(0, 10);
}

function installDialogAutocomplete() {
    if (!isPublisherDialog()) return;
    const input = $('dialog-fields')?.querySelector('input');
    if (!input || input.dataset.s13PublisherAutocomplete === '1') return;

    input.dataset.s13PublisherAutocomplete = '1';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'words');
    input.spellcheck = false;

    const wrapper = input.parentElement;
    if (!wrapper) return;
    wrapper.style.position = 'relative';

    const panel = document.createElement('div');
    panel.className = 's13-publisher-suggestions';
    panel.setAttribute('role', 'listbox');
    input.insertAdjacentElement('afterend', panel);

    const render = () => {
        const queryText = input.value.trim();
        panel.innerHTML = '';

        if (!queryText) {
            panel.classList.remove('is-open');
            return;
        }

        const matches = dialogMatches(queryText);
        matches.forEach(item => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('role', 'option');
            button.textContent = item.fullName;
            button.addEventListener('pointerdown', event => event.preventDefault());
            button.addEventListener('click', () => {
                input.value = item.fullName;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                panel.classList.remove('is-open');
                input.focus();
            });
            panel.appendChild(button);
        });

        panel.classList.toggle('is-open', matches.length > 0);
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown') return;
        const first = panel.querySelector('button');
        if (!first) return;
        event.preventDefault();
        first.focus();
    });
    input.addEventListener('blur', () => setTimeout(() => panel.classList.remove('is-open'), 120));

    render();
}

function installDialogObservers() {
    const dialogModal = $('dialog-modal');
    const dialogFields = $('dialog-fields');
    const dialogTitle = $('dialog-title');

    if (dialogModal) new MutationObserver(() => queueMicrotask(installDialogAutocomplete)).observe(dialogModal, { attributes: true, attributeFilter: ['class'] });
    if (dialogFields) new MutationObserver(() => queueMicrotask(installDialogAutocomplete)).observe(dialogFields, { childList: true, subtree: true });
    if (dialogTitle) new MutationObserver(() => queueMicrotask(installDialogAutocomplete)).observe(dialogTitle, { childList: true, characterData: true, subtree: true });
}

new MutationObserver(() => {
    updateButtonText();
    queueMicrotask(installDialogAutocomplete);
}).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

new MutationObserver(syncPublisherCache).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-auth-state']
});

installButton();
installDialogObservers();
syncPublisherCache();
