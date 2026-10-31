const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ui = fs.readFileSync(path.join(__dirname, '..', 'app-ui.js'), 'utf8');
const touch = fs.readFileSync(path.join(__dirname, '..', 'app-touch.js'), 'utf8');

function section(start, end) {
    const i = html.indexOf(start);
    assert.ok(i !== -1, `Missing responsive query: ${start}`);
    const j = html.indexOf(end, i + start.length);
    assert.ok(j > i, `Missing end marker after ${start}`);
    return html.slice(i, j);
}

const ipad = section(
    '@media (min-width: 640px) and (max-width: 1199px)',
    '/* iPad portrait / narrow Split View'
);
assert.match(ipad, /html body #grid[\s\S]*?repeat\(2, minmax\(0, 1fr\)\) !important/);
const ipadPortrait = section(
    '@media (min-width: 640px) and (max-width: 899px)',
    '/* Keep four status'
);
assert.match(ipadPortrait, /#publishers-list[\s\S]*?grid-template-columns: minmax\(0, 1fr\) !important/);

const tabletToolbar = section(
    '@media (min-width: 640px) and (max-width: 1099px)',
    '@media (min-width: 640px) and (max-width: 759px)'
);
assert.match(tabletToolbar, /\.app-status-grid[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(tabletToolbar, /\.app-status-actions[\s\S]*?width: 100%/);

const desktop = section(
    '@media (min-width: 1200px) and (max-width: 1499px)',
    '/* Desktop keyboard'
);
assert.match(desktop, /repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(desktop, /repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(desktop, /max-width: 1680px !important/);
assert.match(html, /status-chip\[role="button"\]:focus-visible/);
assert.match(html, /@media \(min-width: 1100px\) and \(hover: hover\) and \(pointer: fine\)/);
assert.match(html, /max-height: calc\(100dvh - 32px/);
assert.match(html, /safe-area-inset-bottom/);
assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);

// The responsive rules must target the actual interface created by app-ui.js.
assert.match(ui, /classList\.add\('app-main-wrap'\)/);
assert.match(ui, /classList\.add\('app-status-toolbar'\)/);
assert.match(ui, /classList\.add\('publisher-row'\)/);
assert.match(touch, /s13-tablet-touch/);
console.log('iPad and desktop responsive layout checks passed.');
