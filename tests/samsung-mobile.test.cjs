const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const samsung = fs.readFileSync(path.join(__dirname, '..', 'app-samsung-oneui.js'), 'utf8');
const touch = fs.readFileSync(path.join(__dirname, '..', 'app-touch.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function between(start, end) {
    const first = samsung.indexOf(start);
    assert.ok(first >= 0, `Missing Samsung rule: ${start}`);
    const last = samsung.indexOf(end, first + start.length);
    assert.ok(last > first, `Missing Samsung rule boundary: ${end}`);
    return samsung.slice(first, last);
}

assert.match(samsung, /SamsungBrowser/i);
assert.match(samsung, /getHighEntropyValues\(\['model', 'platform'\]\)/);
assert.match(samsung, /if \(html\.classList\.contains\('s13-apple-liquid-glass'\)\) return/);
assert.match(html, /viewport-fit=cover/);

const phone = between('@media (max-width: 639px)', '/* The narrow Samsung header');
for (const side of ['top', 'right', 'bottom', 'left']) {
    assert.match(phone, new RegExp('padding-' + side + ': max\\(8px, env\\(safe-area-inset-' + side));
}
assert.match(phone, /top: max\(6px, env\(safe-area-inset-top/);
assert.match(phone, /max-height: calc\(100dvh - 16px - env\(safe-area-inset-top/);
assert.match(phone, /overscroll-behavior: contain/);
assert.match(phone, /-webkit-overflow-scrolling: touch/);

const compact = between('@media (max-width: 519px)', '@media (max-width: 359px)');
assert.match(compact, /\.app-header \.app-section-button/);
assert.match(compact, /\.app-header #auth-logout/);
assert.match(compact, /width: 48px !important/);
assert.match(compact, /padding: 0 !important/);
assert.match(compact, /\.app-section-button span/);

const narrow = between('@media (max-width: 359px)', '@media (min-width: 640px)');
assert.match(narrow, /\.app-logo/);
assert.match(narrow, /width: 34px !important/);
assert.match(narrow, /width: 78px !important/);
assert.match(touch, /min-height: 48px !important/);

console.log('Samsung One UI responsive checks passed.');
