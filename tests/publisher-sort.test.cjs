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

vm.runInContext(`${source}\nglobalThis.__compareNames = compareNames;`, context);
const compareNames = context.__compareNames;

const names = [
    'Khachatur MADUNTSEV',
    'Lilia MADUNTSEVA',
    'Valerii MAGDALIANOV',
    'Lev OTINOV',
    'Olya OTINOVA',
    'Tatiana LOKTIONOVA',
    'Kateryna MYKYTIUK',
    'Valériia MYKYTIUK',
    'Valentyna YERMOLAIEVA',
    'Valerii KOVALCHUK',
    'Nadia HRYTSYK',
    'Petro HRYTSYK',
    'Vitalii LYTVYNCHUK',
    'Timotii OTINOV',
    'Stella ARUSTAMIAN',
    'Vladyslav KOVALCHUK',
    'Svitlana BROZHYK',
    'Zina BROZHYK',
    'Evgueniy VELCHEV',
    'Anna SEDRAKYAN',
    'Larysa VELCHEVA',
    'Viktoriia TURII',
    'Alla TURII',
    'Yaroslav ROMANOV',
    'Karlen AMBARTSUMOV',
    'Zarina AMBARTSUMOVA',
    'Irina AMBARTSUMOVA',
    'Tigran AMBARTSUMOV',
    'Serhii TKACHENKO',
    'Irina TKACHENKO',
    'Dmitro YERMOLAIEV',
    'Elmira BSHOIAN',
    'Ivan HODAR',
    'Aleksandra HODAR',
    'Roman DRANCHUK',
    'Nataliia DRANCHUK'
];

const actual = [...names].sort(compareNames);
const expected = [
    'Karlen AMBARTSUMOV',
    'Tigran AMBARTSUMOV',
    'Irina AMBARTSUMOVA',
    'Zarina AMBARTSUMOVA',
    'Stella ARUSTAMIAN',
    'Svitlana BROZHYK',
    'Zina BROZHYK',
    'Elmira BSHOIAN',
    'Nataliia DRANCHUK',
    'Roman DRANCHUK',
    'Aleksandra HODAR',
    'Ivan HODAR',
    'Nadia HRYTSYK',
    'Petro HRYTSYK',
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
    'Irina TKACHENKO',
    'Serhii TKACHENKO',
    'Alla TURII',
    'Viktoriia TURII',
    'Evgueniy VELCHEV',
    'Larysa VELCHEVA',
    'Dmitro YERMOLAIEV',
    'Valentyna YERMOLAIEVA'
];

assert.deepEqual(actual, expected);
assert.ok(actual.indexOf('Aleksandra HODAR') < actual.indexOf('Ivan HODAR'));
assert.ok(actual.indexOf('Alla TURII') < actual.indexOf('Viktoriia TURII'));
assert.ok(actual.indexOf('Karlen AMBARTSUMOV') < actual.indexOf('Stella ARUSTAMIAN'));

console.log('PASS: publishers are displayed as First name SURNAME but sorted by surname, then by first name.');
