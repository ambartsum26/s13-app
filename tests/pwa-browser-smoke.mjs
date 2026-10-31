import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8'};
const server = createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const full = path.resolve(root, '.'+(pathname==='/'?'/index.html':pathname));
    if (!full.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    const bytes = await readFile(full);
    res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(bytes);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
  for (const icon of manifest.icons) {
    const response=await fetch(icon.src,{signal:AbortSignal.timeout(15000)});
    assert.equal(response.status,200,'Missing remote icon: '+icon.src);
    assert.match(response.headers.get('content-type')||'',/image\/png/);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG header');
    const [w,h]=icon.sizes.split('x').map(Number);
    assert.equal(bytes.readUInt32BE(16),w,'Icon PNG width');
    assert.equal(bytes.readUInt32BE(20),h,'Icon PNG height');
    console.log('PASS external licensed icon',icon.sizes,bytes.length);
  }

  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  // Do not initialize real Firebase; only PWA metadata and worker are tested.
  await page.route('**/app.bundle.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'// Firebase disabled in PWA check'}));
  await page.goto(base+'/',{waitUntil:'load'});
  const found=await page.evaluate(async()=>{
    const link=document.querySelector('link[rel="manifest"]');
    if (!link) return null;
    const m=await (await fetch(link.href)).json();
    const ready=await navigator.serviceWorker.ready;
    return {name:m.name,display:m.display,scope:ready.scope,link:new URL(link.href).pathname};
  });
  assert.equal(found.name, 'Ассистент по участкам');
  assert.equal(found.display,'standalone');
  assert.equal(found.scope,base+'/');
  assert.equal(found.link,'/manifest.json');
  const cdp=await context.newCDPSession(page);
  const response=await cdp.send('Page.getInstallabilityErrors');
  assert.deepEqual(response.installabilityErrors,[],'Chrome installability errors');
  console.log('PASS Chromium PWA installability, scoped worker and standalone metadata');
  await context.close();
} finally {
  await browser.close();
  await new Promise((ok,fail)=>server.close(err=>err?fail(err):ok()));
}
