const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const strip = s => s.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm,'').replace(/^export /gm,'');
function dom() {
 const nodes = new Map();
 const get = id => {
  if(!nodes.has(id)) {const classes=new Set(['hidden']);nodes.set(id,{value:'',textContent:'',innerHTML:'',dataset:{},style:{},disabled:false,children:[],handlers:{},classList:{contains:x=>classes.has(x),add:(...x)=>x.forEach(v=>classes.add(v)),remove:(...x)=>x.forEach(v=>classes.delete(v)),toggle(x,b){if(b??!classes.has(x))classes.add(x);else classes.delete(x)}},setAttribute(){},removeAttribute(){},replaceChildren(){this.children=[];this.innerHTML='';this.textContent=''},querySelectorAll(){return []},append(){},focus(){},addEventListener(e,f){this.handlers[e]=f}});}
  return nodes.get(id);
 };
 return {nodes,get,document:{getElementById:get,querySelector:()=>get('add-territory-button'),createElement:()=>get('new-'+nodes.size),addEventListener(){},documentElement:{lang:'ru'},body:{dataset:{}}}};
}
const flush = () => new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const d=dom(), auth={currentUser:null};let callback, loginCalls=0;const access=[];
 const c=vm.createContext({document:d.document,initializeApp:()=>({}),getFirestore:()=>({}),getAuth:()=>auth,onAuthStateChanged:(_,f)=>{callback=f},setPersistence:async()=>{},browserSessionPersistence:{},signInWithEmailAndPassword:async()=>{loginCalls++;throw {code:'auth/invalid-credential'}},signOut:async()=>{auth.currentUser=null;callback(null)},MutationObserver:class{observe(){}},alert:()=>{}});
 vm.runInContext(strip(fs.readFileSync('./app-auth.js','utf8')),c);
 c.access=access;vm.runInContext('observeOwner(value=>access.push(value))',c);await flush();
 callback(null);assert.deepEqual(access,[false]);assert.equal(d.document.body.dataset.authState,'locked');
 auth.currentUser={uid:'other'};callback(auth.currentUser);assert.equal(d.document.body.dataset.authState,'locked');assert.deepEqual(access,[false]);assert.match(d.get('auth-message').textContent,/нет доступа/);
 auth.currentUser={uid:'8JAUBlCS2CXO0xTJzY1cnOafzuE2'};callback(auth.currentUser);assert.equal(d.document.body.dataset.authState,'owner');assert.deepEqual(access,[false,true]);
 await d.get('auth-logout').handlers.click();assert.equal(d.document.body.dataset.authState,'locked');assert.deepEqual(access,[false,true,false]);
 d.get('auth-password').value='synthetic-test';await d.get('auth-form').handlers.submit({preventDefault(){}});assert.equal(loginCalls,1);assert.equal(d.get('auth-password').value,'');assert.equal(d.get('auth-submit').disabled,false);assert.match(d.get('auth-message').textContent,/Проверьте почту/);
 console.log('PASS: signed-out and other UID blocked, owner allowed, logout locked, invalid login cleared and reported.');

 const d2=dom();let owner=false, accessCallback, reads=0, pendingRead, unsubscribed=0;
 const subs=[];
 const core={document:d2.document,console,db:{},isOwner:()=>owner,requireOwner:()=>{if(!owner)throw Error('denied')},observeOwner:f=>{accessCallback=f},getDocs:()=>{reads++;return new Promise(r=>pendingRead=r)},collection:(_,name)=>({name}),onSnapshot:(ref,ok,error)=>{subs.push({ref,ok,error});return ()=>{unsubscribed++}},query:()=>({name:'territories'}),where:()=>({}),alert:()=>{},setTimeout:()=>1,clearTimeout(){},innerWidth:1200};
 core.window=core;const cc=vm.createContext(core);
 vm.runInContext('(function(){'+strip(fs.readFileSync('./app-core.js','utf8'))+';globalThis.evaluateCore=code=>eval(code);startApplication();})()',cc);
 accessCallback(false);assert.equal(reads,0);
 owner=true;accessCallback(true);assert.equal(reads,1);
 owner=false;accessCallback(false);pendingRead({docs:[{id:'C',data:()=>({name:'City'})}]});await flush();assert.equal(subs.length,0);assert.equal(cc.evaluateCore('cities.length'),0);
 owner=true;accessCallback(true);pendingRead({docs:[{id:'C',data:()=>({name:'City'})}]});await flush();assert.equal(subs.length,2);
 vm.runInContext("window.showTerritoryCity('C')",cc);assert.equal(subs.length,3);
 owner=false;accessCallback(false);assert.equal(unsubscribed,3);
 subs[1].ok({docs:[{id:'P',data:()=>({fullName:'Stale'})}]});subs[2].ok({docs:[{id:'T',data:()=>({number:'1'})}]});
 assert.equal(cc.evaluateCore('cities.length+territories.length+publishers.length'),0);
 assert.equal(d2.get('grid').innerHTML,'');assert.equal(d2.get('publishers-list').innerHTML,'');
 console.log('PASS: no pre-login reads, stale initial load ignored, all three subscriptions stopped, cached UI data cleared.');
 const html=fs.readFileSync('./index.html','utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 assert.match(html,/body data-auth-state="locked"/);
 const rules=fs.readFileSync('./firestore.rules','utf8');assert.match(rules,/request.auth != null/);assert.match(rules,/8JAUBlCS2CXO0xTJzY1cnOafzuE2/);assert.doesNotMatch(rules,/if true/);
 console.log('PASS: locked initial HTML, unique IDs, owner UID matches rule source. Rules still need server simulator validation.');
})().catch(e=>{console.error(e);process.exitCode=1});

