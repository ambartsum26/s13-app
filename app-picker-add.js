import { saveUniqueRecord } from './app-data.js';
import { requireOwner } from './app-auth.js';

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

    const expected = fullName.toLocaleLowerCase();
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
#dialog-modal { z-index:90 !important; }
@media (hover:none), (pointer:coarse) {
    #publisher-picker-add { min-height:48px !important; }
    #publisher-picker-add:hover { background:rgba(16,185,129,.14) !important; }
}
`;
    document.head.appendChild(style);
    updateButtonText();
}

new MutationObserver(updateButtonText).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

installButton();
