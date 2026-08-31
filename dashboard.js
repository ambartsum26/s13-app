import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAGWi3iNv1bROpOoulUwh20XSsLokFYrz8x",
    authDomain: "fir-13-app.firebaseapp.com",
    projectId: "fir-13-app",
    storageBucket: "fir-13-app.firebasestorage.app",
    messagingSenderId: "1080215970738",
    appId: "1:1080215970738:web:2d66b3b8a9ea26f1e6baab",
    measurementId: "G-70HBSY6MC6"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
let cities = [];
let territories = [];

const $ = id => document.getElementById(id);
const isFr = () => document.documentElement.lang === 'fr';

function esc(value) {
    const d = document.createElement('div');
    d.textContent = value ?? '';
    return d.innerHTML;
}
function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [y,m,d] = value.split('-').map(Number);
    const x = new Date(y,m-1,d); x.setHours(0,0,0,0);
    return x.getFullYear()===y && x.getMonth()===m-1 && x.getDate()===d ? x : null;
}
function dateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmt(value) {
    if (!parseDate(value)) return value || '';
    const [y,m,d] = value.split('-');
    return isFr() ? `${d}/${m}/${y}` : `${d}.${m}.${y}`;
}
function addCalendarMonths(value, months) {
    const source = parseDate(value); if (!source) return null;
    const first = new Date(source.getFullYear(), source.getMonth()+months, 1);
    const last = new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
    const target = new Date(first.getFullYear(), first.getMonth(), Math.min(source.getDate(), last));
    target.setHours(0,0,0,0); return target;
}
function addCalendarYear(value) {
    const source = parseDate(value); if (!source) return null;
    const y = source.getFullYear()+1, m = source.getMonth();
    const last = new Date(y,m+1,0).getDate();
    const target = new Date(y,m,Math.min(source.getDate(),last));
    target.setHours(0,0,0,0); return target;
}
function dayNumber(d){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)}
function daysBetween(a,b){return dayNumber(b)-dayNumber(a)}
function latestCompleted(t){return (t.history||[]).filter(h=>parseDate(h?.returnedAt)).reduce((best,h)=>!best||parseDate(h.returnedAt)>parseDate(best.returnedAt)?h:best,null)}
function activeHistory(t){const h=Array.isArray(t?.history)?t.history:[];for(let i=h.length-1;i>=0;i--){if(h[i]&&!h[i].returnedAt)return h[i]}return null}
function cityName(id){return cities.find(c=>c.id===id)?.name||'—'}
function classify(t){
    const today=parseDate(dateStr()), active=activeHistory(t);
    if(active){const due=addCalendarMonths(active.issuedAt,4);return{state:due&&today>due?'overdue':'busy',active,due}}
    const done=latestCompleted(t); if(!done)return{state:'free'};
    const available=addCalendarYear(done.returnedAt);
    return{state:available&&today<available?'waiting':'free',done,available};
}
function labels(){
    return isFr()?{
        free:'Libres',busy:'Attribués',overdue:'En retard',waiting:'Attente',total:'Territoires',cities:'Villes',
        attention:'À surveiller',soon:'Bientôt disponibles',recent:'Dernières actions',activity:'Répartition',none:'Aucune donnée',days:'j.',
        overdueBy:'En retard de',dueIn:'Échéance dans',availableIn:'Disponible dans',issued:'Attribué',returned:'Rendu'
    }:{
        free:'Свободно',busy:'В обработке',overdue:'Просрочено',waiting:'Ожидание',total:'Участков',cities:'Городов',
        attention:'Требуют внимания',soon:'Скоро можно выдать',recent:'Последние действия',activity:'Распределение',none:'Нет данных',days:'дн.',
        overdueBy:'Просрочено на',dueIn:'До срока',availableIn:'Можно выдать через',issued:'Выдан',returned:'Сдан'
    };
}

function render(){
    const root=$('home-page'); if(!root)return;
    const L=labels(), today=parseDate(dateStr());
    const stats={free:0,busy:0,overdue:0,waiting:0};
    const attention=[], soon=[], recent=[];

    territories.forEach(t=>{
        const s=classify(t); stats[s.state]++;
        if(s.state==='overdue'){
            const late=Math.max(1,daysBetween(s.due,today));
            attention.push({cityId:t.cityId,city:cityName(t.cityId),number:t.number,text:`${L.overdueBy} ${late} ${L.days}`,rank:0,days:late});
        }else if(s.state==='busy'&&s.due){
            const left=daysBetween(today,s.due);
            if(left>=0&&left<=30)attention.push({cityId:t.cityId,city:cityName(t.cityId),number:t.number,text:`${L.dueIn} ${left} ${L.days}`,rank:1,days:left});
        }
        if(s.state==='waiting'&&s.available){
            const left=daysBetween(today,s.available);
            if(left>0&&left<=30)soon.push({cityId:t.cityId,city:cityName(t.cityId),number:t.number,text:`${L.availableIn} ${left} ${L.days}`,date:fmt(dateStr(s.available)),days:left});
        }
        (t.history||[]).forEach(h=>{
            if(parseDate(h.issuedAt))recent.push({city:cityName(t.cityId),number:t.number,publisher:h.publisher||'—',action:L.issued,date:h.issuedAt,order:0});
            if(parseDate(h.returnedAt))recent.push({city:cityName(t.cityId),number:t.number,publisher:h.publisher||'—',action:L.returned,date:h.returnedAt,order:1});
        });
    });

    attention.sort((a,b)=>a.rank-b.rank||(a.rank===0?b.days-a.days:a.days-b.days));
    soon.sort((a,b)=>a.days-b.days);
    recent.sort((a,b)=>(parseDate(b.date)-parseDate(a.date))||(b.order-a.order));

    const total=territories.length;
    const cityBars=[...cities].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(city=>{
        const own=territories.filter(t=>t.cityId===city.id);
        const c={free:0,busy:0,overdue:0,waiting:0}; own.forEach(t=>c[classify(t).state]++);
        const max=Math.max(1,own.length);
        return `<button onclick="showTerritoryCity('${city.id}')" class="dz-city-bar">
            <div class="dz-city-bar-head"><span>${esc(city.name)}</span><b>${own.length}</b></div>
            <div class="dz-city-meter">
                <i style="width:${c.free/max*100}%" class="free"></i><i style="width:${c.busy/max*100}%" class="busy"></i><i style="width:${c.overdue/max*100}%" class="overdue"></i><i style="width:${c.waiting/max*100}%" class="waiting"></i>
            </div>
        </button>`;
    }).join('') || `<div class="dz-empty">${L.none}</div>`;

    const attentionRows=attention.slice(0,5).map((x,i)=>`<button onclick="showTerritoryCity('${x.cityId}')" class="dz-alert-row"><span class="dz-alert-index">${String(i+1).padStart(2,'0')}</span><span><b>${esc(x.city)}</b><small>№ ${esc(x.number)}</small></span><em>${esc(x.text)}</em></button>`).join('')||`<div class="dz-empty">${L.none}</div>`;
    const soonRows=soon.slice(0,4).map(x=>`<button onclick="showTerritoryCity('${x.cityId}')" class="dz-soon-row"><span><b>${esc(x.city)} · № ${esc(x.number)}</b><small>${esc(x.date)}</small></span><em>${esc(x.text)}</em></button>`).join('')||`<div class="dz-empty">${L.none}</div>`;
    const recentRows=recent.slice(0,6).map(x=>`<div class="dz-recent-row"><span class="dz-recent-dot"></span><span><b>${esc(x.city)} · № ${esc(x.number)}</b><small>${esc(x.publisher)}</small></span><em>${esc(x.action)} · ${fmt(x.date)}</em></div>`).join('')||`<div class="dz-empty">${L.none}</div>`;

    root.className='dz-dashboard';
    root.innerHTML=`
      <section class="dz-overview-board">
        <div class="dz-overview-main">
          <div class="dz-kpi-strip">
            ${kpi(L.free,stats.free,'free','fa-circle-check')}
            ${kpi(L.busy,stats.busy,'busy','fa-clock')}
            ${kpi(L.overdue,stats.overdue,'overdue','fa-triangle-exclamation')}
            ${kpi(L.waiting,stats.waiting,'waiting','fa-hourglass-half')}
          </div>
          <div class="dz-activity-card">
            <div class="dz-section-head"><span>${L.activity}</span><b>${total}</b></div>
            <div class="dz-city-bars">${cityBars}</div>
          </div>
        </div>
        <aside class="dz-total-card">
          <span>${L.total}</span><strong>${total}</strong>
          <div class="dz-sparkline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="dz-total-foot"><b>${cities.length}</b><small>${L.cities}</small></div>
        </aside>
      </section>

      <section class="dz-lower-grid">
        <div class="dz-panel dz-attention"><div class="dz-panel-head"><span>${L.attention}</span><i class="fa-solid fa-arrow-trend-up"></i></div>${attentionRows}</div>
        <div class="dz-panel dz-soon"><div class="dz-panel-head"><span>${L.soon}</span><i class="fa-regular fa-clock"></i></div>${soonRows}</div>
        <div class="dz-panel dz-recent"><div class="dz-panel-head"><span>${L.recent}</span><i class="fa-solid fa-wave-square"></i></div>${recentRows}</div>
      </section>`;
}

function kpi(label,value,state,icon){return `<div class="dz-kpi dz-kpi-${state}"><span><i class="fa-solid ${icon}"></i>${label}</span><strong>${value}</strong><div class="dz-kpi-line"></div></div>`}

onSnapshot(collection(db,'cities'),s=>{cities=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>console.error('Dashboard cities:',e));
onSnapshot(collection(db,'territories'),s=>{territories=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>console.error('Dashboard territories:',e));
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
