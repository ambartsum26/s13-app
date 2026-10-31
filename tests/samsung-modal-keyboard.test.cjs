const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'samsung-modal-keyboard.css'), 'utf8');
const source = fs.readFileSync(path.join(__dirname, '..', 'app-modal-viewport.js'), 'utf8');

// Production bundle stays unchanged. The new module runs separately in the app.
assert.match(html, /src="\.\/app-modal-viewport\.js"/);
assert.match(css, /html\.s13-samsung-oneui #dialog-modal #dialog-fields/);
assert.match(css, /html\.s13-samsung-oneui #publisher-picker-modal #publisher-picker-list/);
assert.match(css, /html\.s13-samsung-oneui #history-modal #history-list/);
assert.match(css, /--s13-modal-view-height, 100dvh/);
assert.match(css, /position: sticky/);
assert.match(css, /overflow-y: auto !important/);

const listeners = {};
const properties = new Map();
const panelStyle = {
    setProperty: (key, value) => properties.set(key, value),
    removeProperty: key => properties.delete(key)
};
let open = true;
let samsung = true;
let usePhoneLayout = true;
const area = {
    clientHeight: 130, scrollTop: 0,
    getBoundingClientRect: () => ({ top: 50, bottom: 180 })
};
const input = {
    matches: selector => selector === 'input, textarea, select',
    getBoundingClientRect: () => ({ top: 175, bottom: 210 })
};
const dialog = {
    id: 'dialog-modal', style: panelStyle,
    classList: { contains: name => name === 'hidden' && !open },
    contains: element => element === input,
    querySelector: selector => selector === '#dialog-fields' ? area : null
};
const media = {
    get matches() { return usePhoneLayout; },
    addEventListener: (name, callback) => { listeners.media = callback; }
};
const viewport = {
    height: 400, offsetTop: 0,
    addEventListener: (name, callback) => { listeners['visual-' + name] = callback; }
};
const observers = [];
class MockObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
}
const context = {
    window: {
        matchMedia: () => media,
        visualViewport: viewport,
        requestAnimationFrame: callback => callback(),
        addEventListener: (name, callback) => { listeners['window-' + name] = callback; }
    },
    document: {
        documentElement: { classList: { contains: () => samsung } },
        getElementById: id => id === 'dialog-modal' ? dialog : null,
        activeElement: input,
        addEventListener: (name, callback) => { listeners['document-' + name] = callback; }
    },
    MutationObserver: MockObserver
};
vm.runInNewContext(source, context, { filename: 'app-modal-viewport.js' });
assert.equal(properties.get('--s13-modal-view-height'), '400px');
assert.equal(properties.get('--s13-modal-view-top'), '0px');
assert.ok(area.scrollTop > 0, 'Focused input must scroll inside the dialog fields');

area.scrollTop = 0;
viewport.height = 260;
viewport.offsetTop = 8;
listeners['visual-resize']();
assert.equal(properties.get('--s13-modal-view-height'), '260px');
assert.equal(properties.get('--s13-modal-view-top'), '8px');

open = false;
for (const observer of observers) observer.callback();
assert.equal(properties.size, 0, 'Closed modal must remove viewport overrides');

open = true;
samsung = false;
for (const observer of observers) observer.callback();
assert.equal(properties.size, 0, 'Other devices must retain original layout');

samsung = true;
usePhoneLayout = false;
listeners.media();
assert.equal(properties.size, 0, 'Desktop layouts must retain original layout');

console.log('Samsung keyboard-safe modal regression checks passed.');
