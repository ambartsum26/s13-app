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
    const [y, m, d] = value.split('-').map(Number);
    const x = new Date(y, m - 1, d);
    x.setHours(0, 0, 0, 0);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d ? x : null;
}

function dateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmt(value) {
    const d = parseDate(value);
    if (!d) return value || '';
    const [y, m, day] = value.split('-');
    return isFr() ? `${day}/${m}/${y}` : `${day}.${m}.${y}`;
}

function addCalendarMonths(value, months) {
    const source = parseDate(value);
    if (!source) return null;
    const first = new Date(source.getFullYear(), source.getMonth() + months, 1);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const target = new Date(first.getFullYear(), first.getMonth(), Math.min(source.getDate(), lastDay));
    target.setHours(0, 0, 0, 0);
    return target;
}

function addCalendarYear(value) {
    const source = parseDate(value);
    if (!source) return null;
    const y = source.getFullYear() + 1;
    const m = source.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const target = new Date(y, m, Math.min(source.getDate(), lastDay));
    target.setHours(0, 0, 0, 0);
    return target;
}

function dayNumber(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

function daysBetween(a, b) {
    return dayNumber(b) - dayNumber(a);
}

function latestCompleted(t) {
    return (t.history || [])
        .filter(h => parseDate(h?.returnedAt))
        .reduce((best, h) => !best || parseDate(h.returnedAt) > parseDate(best.returnedAt) ? h : best, null);
}

function activeHistory(t) {
    const history = Array.isArray(t?.history) ? t.history : [];
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i] && !history[i].returnedAt) return history[i];
    }
    return null;
}

function cityName(cityId) {
    return cities.find(c => c.id === cityId)?.name || '—';
}

function classify(t) {
    const today = parseDate(dateStr());
    const active = activeHistory(t);

    if (active) {
        const due = addCalendarMonths(active.issuedAt, 4);
        return { state: due && today > due ? 'overdue' : 'busy', active, due };
    }

    const done = latestCompleted(t);
    if (!done) return { state: 'free', done: null, available: null };

    const available = addCalendarYear(done.returnedAt);
    return { state: available && today < available ? 'waiting' : 'free', done, available };
}

function labels() {
    return isFr() ? {
        free: 'Libres',
        busy: 'Attribués',
        overdue: 'En retard',
        waiting: 'Attente',
        attention: 'À surveiller',
        soon: 'Bientôt disponibles',
        recent: 'Dernières actions',
        none: 'Aucune donnée',
        days: 'j.',
        overdueBy: 'En retard de',
        dueIn: 'Échéance dans',
        availableIn: 'Disponible dans',
        territoriesWord: 'territoires'
    } : {
        free: 'Свободно',
        busy: 'В обработке',
        overdue: 'Просрочено',
        waiting: 'Ожидание',
        attention: 'Требуют внимания',
        soon: 'Скоро можно выдать',
        recent: 'Последние действия',
        none: 'Нет данных',
        days: 'дн.',
        overdueBy: 'Просрочено на',
        dueIn: 'До срока',
        availableIn: 'Можно выдать через',
        territoriesWord: 'участков'
    };
}

function render() {
    const root = $('home-page');
    if (!root) return;

    const L = labels();
    const today = parseDate(dateStr());
    const stats = { free: 0, busy: 0, overdue: 0, waiting: 0 };
    const attention = [];
    const soon = [];
    const recent = [];

    territories.forEach(t => {
        const status = classify(t);
        stats[status.state]++;

        if (status.state === 'overdue') {
            const lateDays = Math.max(1, daysBetween(status.due, today));
            attention.push({
                cityId: t.cityId,
                city: cityName(t.cityId),
                number: t.number,
                text: `${L.overdueBy} ${lateDays} ${L.days}`,
                severity: 'rose',
                priority: 0,
                days: lateDays
            });
        } else if (status.state === 'busy' && status.due) {
            const left = daysBetween(today, status.due);
            if (left >= 0 && left <= 30) {
                attention.push({
                    cityId: t.cityId,
                    city: cityName(t.cityId),
                    number: t.number,
                    text: `${L.dueIn} ${left} ${L.days}`,
                    severity: 'amber',
                    priority: 1,
                    days: left
                });
            }
        }

        if (status.state === 'waiting' && status.available) {
            const left = daysBetween(today, status.available);
            if (left > 0 && left <= 30) {
                soon.push({
                    cityId: t.cityId,
                    city: cityName(t.cityId),
                    number: t.number,
                    text: `${L.availableIn} ${left} ${L.days}`,
                    date: fmt(dateStr(status.available)),
                    days: left
                });
            }
        }

        (t.history || []).forEach(h => {
            if (parseDate(h.issuedAt)) {
                recent.push({
                    city: cityName(t.cityId),
                    number: t.number,
                    publisher: h.publisher || '—',
                    action: isFr() ? 'Attribué' : 'Выдан',
                    date: h.issuedAt,
                    eventOrder: 0
                });
            }

            if (parseDate(h.returnedAt)) {
                recent.push({
                    city: cityName(t.cityId),
                    number: t.number,
                    publisher: h.publisher || '—',
                    action: isFr() ? 'Rendu' : 'Сдан',
                    date: h.returnedAt,
                    eventOrder: 1
                });
            }
        });
    });

    attention.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.priority === 0 && a.days !== b.days) return b.days - a.days;
        if (a.priority === 1 && a.days !== b.days) return a.days - b.days;
        return a.city.localeCompare(b.city) || String(a.number).localeCompare(String(b.number));
    });

    soon.sort((a, b) => a.days - b.days || a.city.localeCompare(b.city) || String(a.number).localeCompare(String(b.number)));

    recent.sort((a, b) => {
        const byDate = parseDate(b.date) - parseDate(a.date);
        return byDate || b.eventOrder - a.eventOrder;
    });

    const cityCards = [...cities]
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map(city => {
            const count = territories.filter(t => t.cityId === city.id).length;
            return `<button onclick="showTerritoryCity('${city.id}')" class="text-left rounded-2xl border border-slate-700/70 px-4 py-3 min-w-[170px]">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-emerald-400"></i>
                    <b class="text-xs">${esc(city.name)}</b>
                </div>
                <div class="text-[11px] text-slate-400 mt-1">${count} ${L.territoriesWord}</div>
            </button>`;
        })
        .join('');

    const attentionRows = attention.slice(0, 5).map(item => `
        <button onclick="showTerritoryCity('${item.cityId}')" class="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left border-b border-slate-800/70 last:border-0">
            <b class="text-xs">${esc(item.city)} · № ${esc(item.number)}</b>
            <span class="text-[11px] ${item.severity === 'rose' ? 'text-rose-400' : 'text-amber-400'}">${esc(item.text)}</span>
        </button>`).join('') || `<p class="text-xs text-slate-500 p-3">${L.none}</p>`;

    const soonRows = soon.slice(0, 5).map(item => `
        <button onclick="showTerritoryCity('${item.cityId}')" class="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left border-b border-slate-800/70 last:border-0">
            <div>
                <b class="text-xs">${esc(item.city)} · № ${esc(item.number)}</b>
                <div class="text-[10px] text-slate-500">${esc(item.date)}</div>
            </div>
            <span class="text-[11px] text-emerald-400">${esc(item.text)}</span>
        </button>`).join('') || `<p class="text-xs text-slate-500 p-3">${L.none}</p>`;

    const recentRows = recent.slice(0, 7).map(item => `
        <div class="grid grid-cols-1 sm:grid-cols-[1.15fr_.55fr_1fr_1fr] gap-1 sm:gap-3 px-3 py-2.5 text-[11px] border-b border-slate-800/70 last:border-0">
            <span class="font-semibold sm:font-normal">${esc(item.city)}</span>
            <span>№ ${esc(item.number)}</span>
            <span>${esc(item.publisher)}</span>
            <span class="text-slate-400">${esc(item.action)} · ${fmt(item.date)}</span>
        </div>`).join('') || `<p class="text-xs text-slate-500 p-3">${L.none}</p>`;

    root.className = 'space-y-5';
    root.innerHTML = `
        <section class="grid grid-cols-2 xl:grid-cols-4 gap-3">
            ${statCard('fa-circle-check', L.free, stats.free, 'emerald')}
            ${statCard('fa-clock', L.busy, stats.busy, 'blue')}
            ${statCard('fa-triangle-exclamation', L.overdue, stats.overdue, 'rose')}
            ${statCard('fa-hourglass-half', L.waiting, stats.waiting, 'amber')}
        </section>

        <section class="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            ${cityCards || `<div class="text-xs text-slate-500">${L.none}</div>`}
        </section>

        <section class="grid xl:grid-cols-2 gap-4">
            <div class="glass-panel rounded-3xl p-4">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fa-solid fa-triangle-exclamation text-rose-400"></i>
                    <h3 class="font-extrabold text-sm">${L.attention}</h3>
                </div>
                ${attentionRows}
            </div>

            <div class="glass-panel rounded-3xl p-4">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fa-regular fa-clock text-emerald-400"></i>
                    <h3 class="font-extrabold text-sm">${L.soon}</h3>
                </div>
                ${soonRows}
            </div>
        </section>

        <section class="glass-panel rounded-3xl p-4">
            <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-wave-square text-sky-400"></i>
                <h3 class="font-extrabold text-sm">${L.recent}</h3>
            </div>
            ${recentRows}
        </section>`;
}

function statCard(icon, label, value, tone) {
    const toneClass = {
        emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
        blue: 'text-blue-400 border-blue-500/20 bg-blue-950/20',
        rose: 'text-rose-400 border-rose-500/20 bg-rose-950/20',
        amber: 'text-amber-400 border-amber-500/20 bg-amber-950/20'
    }[tone];

    return `<div class="glass-panel rounded-3xl p-4 border ${toneClass}">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl border border-current/20 flex items-center justify-center">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div>
                <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">${label}</div>
                <div class="text-2xl font-extrabold text-white">${value}</div>
            </div>
        </div>
    </div>`;
}

onSnapshot(collection(db, 'cities'), snapshot => {
    cities = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
}, error => console.error('Dashboard cities:', error));

onSnapshot(collection(db, 'territories'), snapshot => {
    territories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
}, error => console.error('Dashboard territories:', error));

new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
});

render();
