const MALE_FIRST_NAMES = new Set([
    'dmitro',
    'evgueniy',
    'ivan',
    'karlen',
    'khachatur',
    'lev',
    'petro',
    'roman',
    'serhii',
    'tigran',
    'timotii',
    'valerii',
    'vitalii',
    'vladyslav',
    'yaroslav'
]);

function fold(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('en');
}

function nameParts(fullName) {
    return String(fullName || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
}

function surnameKey(fullName) {
    const parts = nameParts(fullName);
    return parts.at(-1) || '';
}

function firstNameKey(fullName) {
    return nameParts(fullName)[0] || '';
}

function genderRank(fullName) {
    return MALE_FIRST_NAMES.has(fold(firstNameKey(fullName))) ? 0 : 1;
}

function compareNames(a, b) {
    const surnameCompare = surnameKey(a).localeCompare(surnameKey(b), 'fr', { sensitivity: 'base' });
    if (surnameCompare) return surnameCompare;

    const genderCompare = genderRank(a) - genderRank(b);
    if (genderCompare) return genderCompare;

    const firstNameCompare = firstNameKey(a).localeCompare(firstNameKey(b), 'fr', { sensitivity: 'base' });
    if (firstNameCompare) return firstNameCompare;

    return String(a || '').localeCompare(String(b || ''), 'fr', { sensitivity: 'base' });
}

globalThis.comparePublisherNames = compareNames;

function publisherNameFromRow(row) {
    return row.querySelector('b')?.textContent?.trim() || row.textContent?.trim() || '';
}

function sortContainer(container, getName) {
    if (!container || container.dataset.s13Sorting === '1') return;

    const items = [...container.children];
    if (items.length < 2) return;

    const sorted = [...items].sort((a, b) => compareNames(getName(a), getName(b)));
    const changed = sorted.some((item, index) => item !== items[index]);
    if (!changed) return;

    container.dataset.s13Sorting = '1';
    const fragment = document.createDocumentFragment();
    sorted.forEach(item => fragment.append(item));
    container.append(fragment);
    delete container.dataset.s13Sorting;
}

function sortPublishers() {
    sortContainer(document.getElementById('publishers-list'), publisherNameFromRow);
    sortContainer(document.getElementById('publisher-picker-list'), button => button.textContent?.trim() || '');
}

for (const id of ['publishers-list', 'publisher-picker-list']) {
    const container = document.getElementById(id);
    if (!container) continue;

    new MutationObserver(() => queueMicrotask(sortPublishers)).observe(container, {
        childList: true
    });
}

sortPublishers();
