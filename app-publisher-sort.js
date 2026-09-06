function surnameKey(fullName) {
    const parts = String(fullName || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
    return parts.at(-1) || '';
}

function compareNames(a, b) {
    const surnameCompare = surnameKey(a).localeCompare(surnameKey(b), 'fr', { sensitivity: 'base' });
    if (surnameCompare) return surnameCompare;
    return String(a || '').localeCompare(String(b || ''), 'fr', { sensitivity: 'base' });
}

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
