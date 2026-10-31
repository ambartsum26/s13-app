const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'app-core.js'), 'utf8');
const auth = fs.readFileSync(path.join(__dirname, '..', 'app-auth.js'), 'utf8');
const tailwind = fs.readFileSync(path.join(__dirname, '..', 'tailwind.generated.css'), 'utf8');

assert.match(html, /#lang-slider,\s*#auth-lang-slider\s*\{\s*left:\s*4px !important;/);
assert.match(html, /#lang-slider\[class\*="translate-x-"\],\s*#auth-lang-slider\[class\*="translate-x-"\]\s*\{\s*--tw-translate-x:\s*100% !important;/);
// CSS must beat the old dynamic app-ui border radius and the login button's inline radius.
assert.match(html, /button\\[data-language-toggle\\],\\s*#auth-panel #auth-language\\s*\\{\\s*border-radius:\\s*999px !important;/);
assert.match(html, /button\\[data-language-toggle\\] #lang-slider,\\s*#auth-panel #auth-lang-slider\\s*\\{\\s*border-radius:\\s*999px !important;/);
assert.match(html, /id="lang-slider"/);
assert.match(auth, /id="auth-lang-slider"/);
assert.match(app, /classList\.toggle\('translate-x-\[calc\(100%\+4px\)\]'/);
assert.match(auth, /classList\.toggle\('translate-x-\[calc\(100%\+4px\)\]'/);
assert.ok(tailwind.includes('--tw-translate-x:calc(100% + 4px)') ||
          tailwind.includes('--tw-translate-x:calc(100%+4px)'));

// For a flex language toggle with 4px inner padding, the label width
// and slider width are identical (half the available content width).
// Shifting by exactly one slider width centers it over FR.
for (const width of [78, 84, 88, 90, 96]) {
    const trackWidth = width - 8;
    const pillWidth = trackWidth / 2;
    const left = 4;
    const ruLabelCenter = left + pillWidth / 2;
    const frLabelCenter = left + pillWidth * 1.5;
    assert.equal(left + pillWidth / 2, ruLabelCenter);
    assert.equal(left + pillWidth + pillWidth / 2, frLabelCenter);
}
console.log('RU/FR slider alignment checks passed.');
