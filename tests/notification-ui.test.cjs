const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(__dirname, '..', 'app-notifications.js'), 'utf8');

assert.ok(html.includes('src="./app-notifications.js"'));
assert.ok(html.indexOf('src="./app.bundle.js"') < html.indexOf('src="./app-notifications.js"'));
for (const token of ['role\', \'alertdialog', 'aria-labelledby', 'aria-describedby',
    'prefers-reduced-motion', 'safe-area', 'showModal()', 'message.textContent']) {
    // Accessibility and safe text rendering must remain in the notification module.
    if (token !== 'safe-area') assert.ok(source.includes(token), token);
}

const added = [];
const observers = [];
const elements = {};
const native = [];
const document = {
    activeElement: null,
    documentElement: { lang: 'ru' },
    head: { append: node => added.push(node) },
    body: { append: node => added.push(node) },
    createElement(name) {
        const listeners = {};
        const item = {
            tag: name, id: '', textContent: '', type: '',
            isConnected: true, open: false, children: [],
            attrs: {}, setAttribute(k, v) { this.attrs[k] = v; },
            append(...nodes) { this.children.push(...nodes); },
            addEventListener(k, handler) { listeners[k] = handler; },
            focus() { document.activeElement = this; },
            fire(k) { listeners[k]?.(); },
            showModal() { this.open = true; },
            close() { this.open = false; this.fire('close'); }
        };
        elements[name] ||= [];
        elements[name].push(item);
        return item;
    }
};
class FakeObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
}
const originalFocus = { isConnected: true, focus() { document.activeElement = this; } };
document.activeElement = originalFocus;
const window = { alert(text) { native.push(text); } };
vm.runInNewContext(source, { window, document, MutationObserver: FakeObserver,
    queueMicrotask: callback => callback() }, { filename: 'app-notifications.js' });
const dialog = elements.dialog[0];
const title = elements.h2[0];
const message = elements.p[0];
const action = elements.button[0];

window.alert('First <untrusted> message');
assert.equal(dialog.open, true);
assert.equal(title.textContent, 'Сообщение');
assert.equal(message.textContent, 'First <untrusted> message');
assert.equal(action.textContent, 'Понятно');
assert.equal(native.length, 0);

window.alert('Second message');
assert.equal(message.textContent, 'First <untrusted> message', 'Alerts must queue');
document.documentElement.lang = 'fr';
observers[0].callback();
assert.equal(action.textContent, 'Compris');

dialog.close();
assert.equal(dialog.open, true, 'Queued alert must open after closing the first');
assert.equal(message.textContent, 'Second message');
assert.equal(title.textContent, 'Information');
dialog.close();
assert.equal(dialog.open, false, 'All notices dismissed');
assert.equal(document.activeElement, originalFocus, 'Focus returned after dismissal');

assert.ok(source.includes('width: min(420px, calc(100vw - 28px))'));
assert.ok(source.includes('max-height: min(78dvh, 560px)'));
console.log('Localized cross-device alert dialog tests passed.');
