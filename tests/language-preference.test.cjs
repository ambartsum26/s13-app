const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(__dirname, '..', 'app-language-state.js'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, '..', 'app-core.js'), 'utf8');
const auth = fs.readFileSync(path.join(__dirname, '..', 'app-auth.js'), 'utf8');

assert.ok(html.includes('localStorage.getItem(\'s13-ui-language\')'));
assert.ok(html.includes('src="./app-language-state.js"'));
assert.ok(html.indexOf('src="./app.bundle.js"') < html.indexOf('src="./app-language-state.js"'));
assert.match(core, /let lang = 'ru';/);
assert.match(auth, /attributeFilter: \['lang'\]/);

function boot(stored = null, blocked = false) {
    const memory = new Map(stored ? [['s13-ui-language', stored]] : []);
    const storage = {
        getItem(k) {
            if (blocked) throw new Error('Storage denied');
            return memory.has(k) ? memory.get(k) : null;
        },
        setItem(k, v) {
            if (blocked) throw new Error('Storage denied');
            memory.set(k, v);
        }
    };
    let coreLanguage = 'ru';
    let toggles = 0;
    const listeners = {};
    const document = { documentElement: { lang: stored === 'fr' ? 'fr' : 'ru' } };
    const window = {
        localStorage: storage,
        toggleLanguage() {
            coreLanguage = coreLanguage === 'ru' ? 'fr' : 'ru';
            document.documentElement.lang = coreLanguage;
            toggles++;
        },
        addEventListener(type, listener) { listeners[type] = listener; }
    };
    vm.runInNewContext(source, { window, document }, { filename: 'app-language-state.js' });
    return { window, document, memory, listeners, get toggles() { return toggles; } };
}

let app = boot('fr');
assert.equal(app.toggles, 1, 'Saved FR syncs private app language on login');
assert.equal(app.document.documentElement.lang, 'fr');
app.window.toggleLanguage();
assert.equal(app.document.documentElement.lang, 'ru');
assert.equal(app.memory.get('s13-ui-language'), 'ru');
app.window.toggleLanguage();
assert.equal(app.memory.get('s13-ui-language'), 'fr');

app.listeners.storage({ key: 's13-ui-language', newValue: 'ru' });
assert.equal(app.document.documentElement.lang, 'ru');

app = boot('xx');
assert.equal(app.toggles, 0, 'Invalid language defaults to RU');
app.window.toggleLanguage();
assert.equal(app.memory.get('s13-ui-language'), 'fr');

app = boot(null, true);
assert.equal(app.toggles, 0, 'Disabled storage does not crash initialization');
app.window.toggleLanguage();
assert.equal(app.document.documentElement.lang, 'fr');

console.log('RU/FR preference persistence regressions passed.');
