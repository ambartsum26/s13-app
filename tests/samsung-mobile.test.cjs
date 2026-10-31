const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const samsung = fs.readFileSync(path.join(__dirname, '..', 'app-samsung-oneui.js'), 'utf8');
const touch = fs.readFileSync(path.join(__dirname, '..', 'app-touch.js'), 'utf8');

function between(content, start, end) {
    const a = content.indexOf(start);
    const b = content.indexOf(end, a + start.length);
    assert.ok(a >= 0 && b > a, `Expected section: ${start}`);
    return content.slice(a, b);
}

assert.match(samsung, /SamsungBrowser/);
assert.match(samsung, /getHighEntropyValues\(\['model', 'platform'\]\)/);
assert.match(samsung, /if \(html\.classList\.contains\('s13-apple-liquid-glass'\)\) return/);
assert.match(html, /viewport-fit=cover/);
assert.match(touch, /min-height: 48px !important/);

const samsungCss = between(html, '/* Galaxy phones: honor display cutouts', '/* S13 workstation and iPad layout');
const phone = between(samsungCss, '@media (max-width: 639px)', '/* Icon-only controls');
assert.match(phone, /html\.s13-samsung-oneui body\[data-auth-state\]/);
for (const side of ['top', 'right', 'bottom', 'left']) {
    assert.match(phone, new RegExp('padding-' + side + ': max\\(8px, env\\(safe-area-inset-' + side));
}
assert.match(phone, /top: max\(6px, env\(safe-area-inset-top/);
assert.match(phone, /max-height: calc\(100dvh - 16px - env\(safe-area-inset-top/);
assert.match(phone, /overscroll-behavior: contain/);
assert.match(phone, /-webkit-overflow-scrolling: touch/);

const compact = between(samsungCss, '@media (max-width: 519px)', '@media (max-width: 359px)');
assert.match(compact, /\.app-header \.app-section-button/);
assert.match(compact, /\.app-header #auth-logout/);
assert.match(compact, /width: 48px !important/);
assert.match(compact, /padding: 0 !important/);
assert.match(compact, /\.app-section-button span/);

const narrow = between(html, '@media (max-width: 359px)', '/* S13 workstation and iPad layout');
assert.match(narrow, /\.app-logo/);
assert.match(narrow, /width: 34px !important/);
assert.match(narrow, /width: 78px !important/);

console.log('Samsung One UI responsive checks passed.');
