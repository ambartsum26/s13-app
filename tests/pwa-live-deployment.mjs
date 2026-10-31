import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';

const origin = 'https://ambartsum26.github.io';
const base = origin + '/s13-app/';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

try {
  // Android-like viewport and UA, with a fresh, unsigned-in browser profile.
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  // This is a live production hosting test, not an authorization/data test.
  // Never load app.bundle.js or invoke Firebase against the real project.
  await page.route('**/app.bundle.js', route => route.fulfill({
    status: 200, contentType: 'text/javascript',
    body: '// intentionally disabled Firebase during PWA installation smoke test'
  }));

  const response = await page.goto(base, { waitUntil: 'load', timeout: 30000 });
  assert.equal(response.status(), 200, 'Published app homepage is inaccessible');
  const result = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    assert: if (!link) return { error: 'No web app manifest link' };
    const manifestResponse = await fetch(link.href, { cache: 'no-store' });
    const manifest = await manifestResponse.json();

    // Service worker registration is a browser-level feature: validate that
    // the deployed worker controls only the /s13-app/ GitHub Pages directory.
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(
        () => reject(new Error('No registered service worker after 15s')), 15000
      ))
    ]);
    return {
      link: link.href,
      status: manifestResponse.status,
      display: manifest.display,
      name: manifest.name,
      start: new URL(manifest.start_url, link.href).href,
      scope: new URL(manifest.scope, link.href).href,
      id: new URL(manifest.id, link.href).href,
      worker: ready.scope,
      icons: manifest.icons.map(icon => ({ src: icon.src, sizes: icon.sizes }))
    };
  });

  assert.equal(result.error, undefined, result.error || 'Manifest present');
  assert.equal(result.status, 200);
  assert.equal(result.link, base + 'manifest.json');
  assert.equal(result.name, 'Ассистент по участкам');
  assert.equal(result.display, 'standalone');
  assert.equal(result.start, base, 'start_url must stay inside project subpath');
  assert.equal(result.scope, base, 'scope must stay inside project subpath');
  assert.equal(result.id, base, 'id must remain stable for installed PWA');
  assert.equal(result.worker, base, 'Worker scope must match deployed PWA scope');
  assert.ok(result.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(result.icons.some(icon => icon.sizes === '512x512'));

  const cdp = await context.newCDPSession(page);
  const manifestInfo = await cdp.send('Page.getAppManifest');
  assert.equal(manifestInfo.url, base + 'manifest.json', 'Chrome did not discover manifest');
  assert.deepEqual(manifestInfo.errors, [], 'Chrome manifest parsing errors');
  const installInfo = await cdp.send('Page.getInstallabilityErrors');
  assert.deepEqual(installInfo.installabilityErrors, [], 'Live Chrome installability errors');
  assert.deepEqual(pageErrors, [], 'Production page errors with Firebase disabled');

  console.log('PASS LIVE GitHub Pages Android PWA:', {
    url: base, manifest: result.link,
    display: result.display, workerScope: result.worker,
    icons: result.icons.map(icon => icon.sizes)
  });
  await context.close();
} finally {
  await browser.close();
}
