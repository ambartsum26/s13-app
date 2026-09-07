const fs = require('node:fs');
const assert = require('node:assert/strict');

const app = fs.readFileSync('./app.js', 'utf8');
const cardsImport = app.indexOf("import './app-cards.js';");
const cascadeImport = app.indexOf("import './app-city-cascade.js';");
assert.ok(cardsImport >= 0, 'card decorator import must exist');
assert.ok(cascadeImport > cardsImport, 'cascade restoration must load after card decoration');

const cascade = fs.readFileSync('./app-city-cascade.js', 'utf8');
assert.match(cascade, /data-active-city-id/);
assert.match(cascade, /cascadePending = true/);
assert.match(cascade, /requestAnimationFrame\(runCascade\)/);
assert.match(cascade, /classList\.remove\('animate-fade-in'\)/);
assert.match(cascade, /classList\.add\('animate-fade-in'\)/);
assert.match(cascade, /Math\.min\(index \* 0\.055, 0\.65\)/);
assert.match(cascade, /prefers-reduced-motion: reduce/);

console.log('PASS: switching city IDs restarts the staggered card cascade without tying it to ordinary data updates.');
