const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const stripExports = source => source.replace(/^export\s+/gm, '');

const utilities = fs.readFileSync('./app-security-utils.js', 'utf8');
const securityContext = vm.createContext({ URL, Set, String });
vm.runInContext(`${stripExports(utilities)}\nglobalThis.__allowed = isAllowedAppUrl; globalThis.__get = safeStorageGet; globalThis.__set = safeStorageSet;`, securityContext);

const allowed = securityContext.__allowed;
assert.equal(allowed('https://maps.google.com/example', 'https://app.example/'), true);
assert.equal(allowed('http://example.test/map', 'https://app.example/'), true);
assert.equal(allowed('/relative/path', 'https://app.example/'), true);
assert.equal(allowed('#section', 'https://app.example/'), true);
assert.equal(allowed('blob:https://app.example/123', 'https://app.example/'), true);
assert.equal(allowed('javascript:alert(1)', 'https://app.example/'), false);
assert.equal(allowed('data:text/html,<script>alert(1)</script>', 'https://app.example/'), false);
assert.equal(allowed('file:///etc/passwd', 'https://app.example/'), false);
assert.equal(allowed('vbscript:msgbox(1)', 'https://app.example/'), false);
assert.equal(allowed('', 'https://app.example/'), false);

const throwingStorage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
};
assert.equal(securityContext.__get(throwingStorage, 'x'), null);
assert.equal(securityContext.__set(throwingStorage, 'x', 'y'), false);
console.log('PASS: unsafe URL schemes are rejected and blocked storage fails closed.');

const dataSource = fs.readFileSync('./app-data.js', 'utf8');
const compareStart = dataSource.indexOf('function comparableField');
const compareEnd = dataSource.indexOf('// Legacy records', compareStart);
assert.ok(compareStart >= 0 && compareEnd > compareStart);
const dataContext = vm.createContext({ JSON });
vm.runInContext(`${dataSource.slice(compareStart, compareEnd)}\nglobalThis.__changed = fieldChanged;`, dataContext);
const changed = dataContext.__changed;
assert.equal(changed('cities', {}, { mapUrl: '' }, 'mapUrl'), false);
assert.equal(changed('territories', {}, { mapUrl: '', russianSpeakers: 0 }, 'mapUrl'), false);
assert.equal(changed('territories', {}, { russianSpeakers: 0 }, 'russianSpeakers'), false);
assert.equal(changed('cities', { mapUrl: 'https://a.example' }, { mapUrl: '' }, 'mapUrl'), true);
console.log('PASS: missing legacy optional fields compare as their visible UI defaults.');

const appSource = fs.readFileSync('./app.js', 'utf8');
const hardeningImport = appSource.indexOf("import './app-hardening.js';");
assert.ok(hardeningImport >= 0);
assert.ok(hardeningImport < appSource.indexOf("import './app-ui.js';"));
assert.ok(hardeningImport < appSource.indexOf("import './s13-export.js';"));
console.log('PASS: browser hardening loads before UI and export modules.');

const hardeningSource = fs.readFileSync('./app-hardening.js', 'utf8');
assert.match(hardeningSource, /javascript:/i.negate ? /$a/ : /isAllowedAppUrl/);
assert.match(hardeningSource, /data-s13-blocked-href/);
assert.match(hardeningSource, /installPopupAccessibility/);
assert.match(hardeningSource, /installListboxKeyboardNavigation/);
assert.match(hardeningSource, /installSessionStorageFallback/);

const rules = fs.readFileSync('./firestore.rules', 'utf8');
assert.match(rules, /request\.auth\.uid == 'fJT9srxZezNyAVC1NO2Rm6jdK4G3'/);
assert.match(rules, /data\.mapUrl\.matches\('https\?:\/\/\.\*'\)/);
assert.match(rules, /match \/cities\/\{cityId\}/);
assert.match(rules, /match \/territories\/\{territoryId\}/);
assert.match(rules, /match \/publishers\/\{publisherId\}/);
assert.match(rules, /match \/\{document=\*\*\}[\s\S]*allow read, write: if false;/);
assert.doesNotMatch(rules, /match \/\{document=\*\*\}[\s\S]*request\.auth\.uid/);
console.log('PASS: repository rules validate known collections and default-deny unknown paths.');
