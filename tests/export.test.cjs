const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const strip = source => source.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, '').replace(/^export /gm, '');
const c = vm.createContext({ window: {}, getFirestore: () => ({}), getApps: () => [], sessionStorage: { getItem: () => null } });
vm.runInContext(strip(fs.readFileSync('s13-export.js', 'utf8')), c);
assert.equal(vm.runInContext("currentServiceYear(new Date(2026,7,31))", c), 2026);
assert.equal(vm.runInContext("currentServiceYear(new Date(2026,8,1))", c), 2027);
const row = (publisher, issuedAt, returnedAt) => ({ publisher, issuedAt, returnedAt });
const source = [{ number: '1', history: [
    row('Previous', '2025-07-01', '2025-08-31'),
    row('Carried', '2025-08-25', '2025-09-01'),
    ...Array.from({ length: 5 }, (_, i) => row(`Person${i}`, `2026-0${i + 1}-01`, `2026-0${i + 1}-02`)),
    row('Next year', '2026-09-01', null)
] }];
const filtered = c.forServiceYear(source, 2026);
assert.equal(filtered[0].history.length, 6);
assert.equal(filtered[0].previousCompletion, '2025-08-31');
assert.equal(source[0].history.length, 8, 'Export must not modify source history');
const html = c.makeDocument({ name: 'City <safe>' }, filtered, 2026);
assert.match(html, /Année de service :<\/b> 2026/);
assert.match(html, /City &lt;safe&gt;/);
assert.match(html, /Feuille 2\/2/);
assert.match(html, /31\/08\/2025/);
assert.ok(!html.includes('Next year'));
for (const name of ['Carried', 'Person0', 'Person1', 'Person2', 'Person3', 'Person4']) assert.ok(html.includes(name));
assert.throws(() => c.forServiceYear([{ history: [row('Invalid', 'bad-date', null)] }], 2026));
console.log('PASS: September year boundary, carried assignments, prior completion, extra sheets, escaping and invalid dates.');
