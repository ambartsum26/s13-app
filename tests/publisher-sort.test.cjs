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
    'Irina TKACHENKO',
    'Alla TURII',
    'Viktoriia TURII',
    'Evgueniy VELCHEV',
    'Larysa VELCHEVA',
    'Dmitro YERMOLAIEV',
    'Valentyna YERMOLAIEVA'
];

assert.deepEqual(actual, expected);
assert.ok(actual.indexOf('Ivan HODAR') < actual.indexOf('Aleksandra HODAR'));
assert.ok(actual.indexOf('Petro HRYTSYK') < actual.indexOf('Nadia HRYTSYK'));
assert.ok(actual.indexOf('Roman DRANCHUK') < actual.indexOf('Nataliia DRANCHUK'));
assert.ok(actual.indexOf('Serhii TKACHENKO') < actual.indexOf('Irina TKACHENKO'));

console.log('PASS: publishers are sorted by surname, with men first when surnames match.');
