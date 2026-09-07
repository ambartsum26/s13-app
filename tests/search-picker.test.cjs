const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('./app-picker-add.js', 'utf8');

const searchContext = vm.createContext({});
const searchStart = source.indexOf('const CYRILLIC_TO_LATIN');
const searchEnd = source.indexOf('window.publisherNameMatches');
vm.runInContext(`${source.slice(searchStart, searchEnd)}\nglobalThis.score = publisherMatchScore;`, searchContext);
const matches = (name, query) => Number.isFinite(searchContext.score(name, query));

assert.equal(matches('Тест АЛЬФА', 'Тест'), true);
assert.equal(matches('Test ALFA', 'Тест'), true);
assert.equal(matches('Demo ECHO', 'ECHO Demo'), true);
assert.equal(matches('Valéria KILO', 'Valeria'), true);
assert.equal(matches('Demo ECHO', 'Omega'), false);
console.log('PASS: publisher search supports Cyrillic, transliteration, accents and reversed word order.');

let removed = 0;
const inside = {};
const focusContext = vm.createContext({
    document: { activeElement: inside },
    setTimeout: callback => callback()
});
const closeStart = source.indexOf('function scheduleSuggestionClose');
const closeEnd = source.indexOf('function installDialogAutocomplete', closeStart);
vm.runInContext(source.slice(closeStart, closeEnd), focusContext);
const panel = {
    contains: element => element === inside,
    classList: { remove: () => { removed++; } }
};
focusContext.scheduleSuggestionClose(panel);
assert.equal(removed, 0, 'Moving focus to a suggestion must keep the list open');
focusContext.document.activeElement = {};
focusContext.scheduleSuggestionClose(panel);
assert.equal(removed, 1);
console.log('PASS: keyboard focus no longer closes publisher suggestions prematurely.');

let currentSession = 7;
let finishSave;
let selection = null;
const save = new Promise(resolve => { finishSave = resolve; });
const pickerContext = vm.createContext({
    window: {
        currentPublisherPickerSession: () => currentSession,
        requestAppFields: async () => ['Synthetic Person', 'male'],
        selectPublisherForPickerSession: (session, publisher) => { selection = { session, publisher }; }
    },
    requireOwner() {},
    dictionary: () => ({ field: 'Name', gender: 'Gender', chooseGender: 'Choose', male: 'Male', female: 'Female' }),
    normalize: value => String(value || '').trim(),
    $: () => ({ value: '' }),
    saveUniqueRecord: () => save,
    today: () => '2026-09-07',
    alert() {},
    console
});
const addStart = source.indexOf('async function addPublisherFromPicker');
const addEnd = source.indexOf('function installButton', addStart);
vm.runInContext(source.slice(addStart, addEnd), pickerContext);

(async () => {
    const adding = pickerContext.addPublisherFromPicker();
    currentSession = 8;
    finishSave('SYNTHETIC-ID');
    await adding;
    assert.equal(selection.session, 7);
    assert.equal(selection.publisher.id, 'SYNTHETIC-ID');
    console.log('PASS: delayed publisher creation retains its original picker session.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
