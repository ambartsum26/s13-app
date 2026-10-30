const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.match(html, /viewport-fit=cover/);
assert.match(html, /interactive-widget=resizes-content/);
assert.match(html, /-webkit-tap-highlight-color:\s*transparent/);
assert.match(html, /touch-action:\s*manipulation/);
assert.match(html, /prefers-reduced-motion:\s*reduce/);
assert.match(html, /@media \(hover:\s*hover\) and \(pointer:\s*fine\)/);
assert.match(html, /max-height:\s*calc\(100dvh/);
assert.match(html, /safe-area-inset-bottom/);
assert.match(html, /input, textarea, select\s*\{\s*font-size:\s*16px/);
assert.doesNotMatch(html, /transition:\s*all\s+\.2s/);
assert.match(html, /id="publishers-search" type="search"/);
assert.match(html, /id="publisher-picker-search" type="search"/);

console.log('Mobile UI design regressions passed.');
