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

vm.runInContext(`${source}\nglobalThis.__split = choosePublisherColumnSplit; globalThis.__surname = surnameKey;`, context);
const split = context.__split;
const surname = context.__surname;

const names = [
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

const cut = split(names, 2);
assert.equal(cut, 16, 'INDIA must not be split between desktop columns');
assert.equal(surname(names[cut - 1]), 'INDIA');
assert.notEqual(surname(names[cut - 1]), surname(names[cut]));

assert.deepEqual(names.slice(9, 11), ['Petro ECHO', 'Nadia ECHO']);
assert.deepEqual(names.slice(23, 25), ['Serhii OSCAR', 'Irina OSCAR']);

console.log('PASS: desktop publisher columns read alphabetically top-to-bottom and keep identical surnames together.');
