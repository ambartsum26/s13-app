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
    'Karlen AMBARTSUMOV',
    'Tigran AMBARTSUMOV',
    'Irina AMBARTSUMOVA',
    'Zarina AMBARTSUMOVA',
    'Stella ARUSTAMIAN',
    'Svitlana BROZHYK',
    'Zina BROZHYK',
    'Elmira BSHOIAN',
    'Roman DRANCHUK',
    'Nataliia DRANCHUK',
    'Ivan HODAR',
    'Aleksandra HODAR',
    'Petro HRYTSYK',
    'Nadia HRYTSYK',
    'Valerii KOVALCHUK',
    'Vladyslav KOVALCHUK',
    'Tatiana LOKTIONOVA',
    'Vitalii LYTVYNCHUK',
    'Khachatur MADUNTSEV',
    'Lilia MADUNTSEVA',
    'Valerii MAGDALIANOV',
    'Kateryna MYKYTIUK',
    'Valériia MYKYTIUK',
    'Lev OTINOV',
    'Timotii OTINOV',
    'Olya OTINOVA',
    'Yaroslav ROMANOV',
    'Anna SEDRAKYAN',
    'Serhii TKACHENKO',
    'Irina TKACHENKO'
];

const cut = split(names, 2);
assert.equal(cut, 16, 'KOVALCHUK must not be split between desktop columns');
assert.equal(surname(names[cut - 1]), 'KOVALCHUK');
assert.notEqual(surname(names[cut - 1]), surname(names[cut]));

assert.deepEqual(names.slice(12, 14), ['Petro HRYTSYK', 'Nadia HRYTSYK']);
assert.deepEqual(names.slice(28, 30), ['Serhii TKACHENKO', 'Irina TKACHENKO']);

console.log('PASS: desktop publisher columns read alphabetically top-to-bottom and keep identical surnames together.');
