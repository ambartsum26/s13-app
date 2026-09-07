const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('./app-publisher-sort.js', 'utf8');

const context = vm.createContext({
    document: {
        getElementById: () => null,
        createDocumentFragment: () => ({ append() {} })
    },
    MutationObserver: class { observe() {} },
    queueMicrotask() {}
});

vm.runInContext(`${source}\nglobalThis.__compareNames = compareNames; globalThis.__comparePublishers = comparePublishers;`, context);
const compareNames = context.__compareNames;
const comparePublishers = context.__comparePublishers;

// Synthetic fixtures only: production publisher names must never be copied into
// this public repository. The cases still cover surname ordering, accents and
// male-first ordering when a surname is shared.
const names = [
    'Valentyna ROMEO',
    'Petro ECHO',
    'Zarina ALPHA',
    'Irina OSCAR',
    'Lev LIMA',
    'Larysa QUEBEC',
    'Ivan DELTA',
    'Kateryna KILO',
    'Roman CHARLIE',
    'Karlen ALPHA',
    'Valerii HOTEL',
    'Stella BRAVO',
    'Nadia ECHO',
    'Yaroslav MIKE',
    'Dmitro ROMEO',
    'Aleksandra DELTA',
    'Viktoriia PAPA',
    'Tigran ALPHA',
    'Khachatur INDIA',
    'Timotii LIMA',
    'Svitlana FOXTROT',
    'Anna NOVEMBER',
    'Olya LIMA',
    'Lilia INDIA',
    'Irina ALPHA',
    'Serhii OSCAR',
    'Valériia KILO',
    'Vladyslav HOTEL',
    'Nataliia CHARLIE',
    'Alla PAPA'
];

const actual = [...names].sort(compareNames);
const expected = [
    'Karlen ALPHA',
    'Tigran ALPHA',
    'Irina ALPHA',
    'Zarina ALPHA',
    'Stella BRAVO',
    'Roman CHARLIE',
    'Nataliia CHARLIE',
    'Ivan DELTA',
    'Aleksandra DELTA',
    'Petro ECHO',
    'Nadia ECHO',
    'Svitlana FOXTROT',
    'Valerii HOTEL',
    'Vladyslav HOTEL',
    'Khachatur INDIA',
    'Lilia INDIA',
    'Kateryna KILO',
    'Valériia KILO',
    'Lev LIMA',
    'Timotii LIMA',
    'Olya LIMA',
    'Yaroslav MIKE',
    'Anna NOVEMBER',
    'Serhii OSCAR',
    'Irina OSCAR',
    'Alla PAPA',
    'Viktoriia PAPA',
    'Larysa QUEBEC',
    'Dmitro ROMEO',
    'Valentyna ROMEO'
];

assert.deepEqual(actual, expected);
assert.ok(actual.indexOf('Ivan DELTA') < actual.indexOf('Aleksandra DELTA'));
assert.ok(actual.indexOf('Petro ECHO') < actual.indexOf('Nadia ECHO'));
assert.ok(actual.indexOf('Roman CHARLIE') < actual.indexOf('Nataliia CHARLIE'));
assert.ok(actual.indexOf('Serhii OSCAR') < actual.indexOf('Irina OSCAR'));

const newPublishers = [
    { fullName: 'Anna SIERRA', gender: 'female' },
    { fullName: 'Sergei SIERRA', gender: 'male' }
].sort(comparePublishers);
assert.deepEqual(newPublishers.map(item => item.fullName), ['Sergei SIERRA', 'Anna SIERRA']);

console.log('PASS: publishers are sorted by surname, with stored gender supporting new names.');
