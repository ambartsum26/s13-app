const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const pwa = fs.readFileSync(path.join(root,'app-pwa.js'),'utf8');
const sw = fs.readFileSync(path.join(root,'sw.js'),'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));

assert.match(html, /<link rel="manifest" href="\.\/manifest\.json">/);
assert.match(html, /rel="icon" type="image\/png"/);
assert.match(html, /rel="apple-touch-icon"/);
assert.match(html, /src="\.\/app-pwa\.js"/);
assert.match(html, /name="theme-color" content="#020617"/);
assert.equal(manifest.name, 'Ассистент по участкам');
assert.equal(manifest.short_name, 'Участки');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.id, './');
assert.equal(manifest.prefer_related_applications, false);
assert.ok(manifest.icons.some(icon=>icon.sizes==='192x192' && icon.type==='image/png'));
assert.ok(manifest.icons.some(icon=>icon.sizes==='512x512' && icon.type==='image/png'));
for (const icon of manifest.icons) {
  const url = new URL(icon.src);
  assert.equal(url.protocol,'https:','Icons must load securely');
  assert.equal(url.hostname,'raw.githubusercontent.com','Use only the pinned, licensed source');
  assert.match(url.pathname,/\/53f787d4ae233df1236d600728f705417e026f50\/icon-(192|512)\.png$/);
  assert.equal(icon.purpose,'any');
}
const base = new URL('https://example.github.io/s13-app/manifest.json');
assert.equal(new URL(manifest.start_url,base).href,'https://example.github.io/s13-app/');
assert.equal(new URL(manifest.scope,base).href,'https://example.github.io/s13-app/');
assert.equal(new URL(manifest.id,base).href,'https://example.github.io/s13-app/');
assert.match(pwa,/navigator\.serviceWorker\.register\('\.\/sw\.js', \{ scope: '\.\/'/);
assert.match(pwa,/window\.isSecureContext/);
assert.match(sw,/self\.addEventListener\('install'/);
assert.match(sw,/self\.addEventListener\('activate'/);
assert.doesNotMatch(sw,/\bcaches\.|CacheStorage|cache\.put|fetch\s*\(/,
 'The app must never cache private records or authenticated responses');
console.log('PWA manifest, path scope, icon declarations and network-only worker OK');
