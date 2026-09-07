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

function publisherProfile(value) {
    return typeof value === 'string'
        ? { fullName: value, gender: '' }
        : { fullName: value?.fullName || '', gender: value?.gender || '' };
}

function publisherGenderForName(fullName) {
    return MALE_FIRST_NAMES.has(fold(firstNameKey(fullName))) ? 'male' : '';
}

function genderRank(value) {
    const publisher = publisherProfile(value);
    const gender = publisher.gender || publisherGenderForName(publisher.fullName);
    if (gender === 'male') return 0;
    if (gender === 'female') return 1;
    return 2;
}

function comparePublishers(a, b) {
    const left = publisherProfile(a);
    const right = publisherProfile(b);
    const surnameCompare = surnameKey(left.fullName).localeCompare(surnameKey(right.fullName), 'fr', { sensitivity: 'base' });
    if (surnameCompare) return surnameCompare;

    const genderCompare = genderRank(left) - genderRank(right);
    if (genderCompare) return genderCompare;

    const firstNameCompare = firstNameKey(left.fullName).localeCompare(firstNameKey(right.fullName), 'fr', { sensitivity: 'base' });
    if (firstNameCompare) return firstNameCompare;

    return left.fullName.localeCompare(right.fullName, 'fr', { sensitivity: 'base' });
}

function compareNames(a, b) {
    return comparePublishers(a, b);
}

globalThis.comparePublisherNames = compareNames;
globalThis.comparePublisherRecords = comparePublishers;
globalThis.publisherGenderForName = publisherGenderForName;

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
    sortContainer(document.getElementById('publishers-list'), row => ({
        fullName: publisherNameFromRow(row),
        gender: row.dataset.publisherGender || ''
    }));
    sortContainer(document.getElementById('publisher-picker-list'), button => ({
        fullName: button.textContent?.trim() || '',
        gender: button.dataset.publisherGender || ''
    }));
}

for (const id of ['publishers-list', 'publisher-picker-list']) {
    const container = document.getElementById(id);
    if (!container) continue;

    new MutationObserver(() => queueMicrotask(sortPublishers)).observe(container, {
        childList: true
    });
}

sortPublishers();
