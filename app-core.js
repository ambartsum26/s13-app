import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAGWi3iNv1bROpOoulUwh20XSsLokFYrz8x",
    authDomain: "fir-13-app.firebaseapp.com",
    projectId: "fir-13-app",
    storageBucket: "fir-13-app.firebasestorage.app",
    messagingSenderId: "1080215970738",
    appId: "1:1080215970738:web:2d66b3b8a9ea26f1e6baab",
    measurementId: "G-70HBSY6MC6"
};

const db = getFirestore(initializeApp(firebaseConfig));

const I = {
    ru: {
        app: "АССИСТЕНТ ПО УЧАСТКАМ",
        home: "Главная",
        territories: "Участки",
        publishers: "Возвещатели",
        connected: "Firebase подключен",
        addCity: "Город",
        editCity: "Изменить город",
        renameCity: "Изменить название",
        cityMap: "Изменить ссылку на карту",
        free: "Свободно",
        busy: "В обработке",
        overdue: "Просрочено",
        waiting: "Ожидание",
        map: "Карта",
        territory: "Участок",
        issue: "Выдать",
        ret: "Сдать",
        history: "История выдач",
        empty: "История пуста",
        issued: "Выдан",
        returned: "Сдан",
        inProgress: "В ОБРАБОТКЕ",
        due: "Срок сдачи (4 мес.):",
        lastReturn: "Последняя сдача:",
        again: "Можно выдать снова:",
        daysAgain: "До повторной выдачи:",
        days: "дн.",
        noMap: "Ссылка не добавлена",
        nobody: "Никому не выдан",
        russian: "Русскоговорящие:",
        addPublisher: "Добавить возвещателя",
        search: "Поиск по имени",
        choosePublisher: "Выберите возвещателя",
        inBase: "в базе",
        cancel: "Отмена",
        ok: "ОК",
        confirm: "Подтвердить",
        cantIssue: "Этот участок пока нельзя выдать. С момента последней сдачи должен пройти один год.",
        publisherExists: "Такой возвещатель уже есть в базе.",
        firstPublisher: "Сначала добавьте возвещателя в базу.",
        alreadyIssued: "Этот участок уже выдан.",
        anotherOpen: "У этого участка уже есть другая открытая выдача.",
        invalidDate: "Проверьте дату. Используйте формат ДД.ММ.ГГГГ.",
        returnBeforeIssue: "Дата сдачи не может быть раньше даты выдачи.",
        duplicateTerritory: "Участок с таким номером уже есть в этом городе.",
        appError: "Ошибка приложения"
    },
    fr: {
        app: "ASSISTANT DE TERRITOIRES",
        home: "Accueil",
        territories: "Territoires",
        publishers: "Proclamateurs",
        connected: "Firebase connecté",
        addCity: "Ville",
        editCity: "Modifier la ville",
        renameCity: "Modifier le nom",
        cityMap: "Modifier le lien de la carte",
        free: "Libres",
        busy: "Attribués",
        overdue: "En retard",
        waiting: "Attente",
        map: "Carte",
        territory: "Territoire",
        issue: "Attribuer",
        ret: "Rendre",
        history: "Historique",
        empty: "L'historique est vide",
        issued: "Attribué",
        returned: "Rendu",
        inProgress: "EN COURS",
        due: "Échéance (4 mois) :",
        lastReturn: "Dernier retour :",
        again: "Peut être attribué à nouveau :",
        daysAgain: "Avant la prochaine attribution :",
        days: "j.",
        noMap: "Aucun lien",
        nobody: "Non attribué",
        russian: "Russophones :",
        addPublisher: "Ajouter un proclamateur",
        search: "Recherche par nom",
        choosePublisher: "Choisir un proclamateur",
        inBase: "dans la base",
        cancel: "Annuler",
        ok: "OK",
        confirm: "Confirmer",
        cantIssue: "Ce territoire ne peut pas encore être attribué. Un an doit s'écouler depuis son dernier retour.",
        publisherExists: "Ce proclamateur existe déjà.",
        firstPublisher: "Ajoutez d’abord un proclamateur dans la base.",
        alreadyIssued: "Ce territoire est déjà attribué.",
        anotherOpen: "Ce territoire a déjà une autre attribution en cours.",
        invalidDate: "Vérifiez la date. Utilisez le format JJ/MM/AAAA.",
        returnBeforeIssue: "La date de retour ne peut pas être antérieure à la date d’attribution.",
        duplicateTerritory: "Un territoire portant ce numéro existe déjà dans cette ville.",
        appError: "Erreur de l’application"
    }
};

let lang = 'ru';
let view = 'home';
let cities = [];
let territories = [];
let publishers = [];
let activeCityId = null;
let unsubTerritories = null;
let territorySig = '';
let publisherSig = '';
let historyTerritoryId = null;

const $ = id => document.getElementById(id);
const tr = key => I[lang][key] || key;

function dateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, month, day] = value.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
    return d;
}

function fmt(value) {
    if (!value) return '';
    if (!parseDate(value)) return value;
    const [year, month, day] = value.split('-');
    return lang === 'fr' ? `${day}/${month}/${year}` : `${day}.${month}.${year}`;
}

function inputDate(value) {
    if (!value?.trim()) return null;
    const raw = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return parseDate(raw) ? raw : null;
    }

    const separator = raw.includes('/') ? '/' : raw.includes('.') ? '.' : null;
    if (!separator) return null;

    const parts = raw.split(separator);
    if (parts.length !== 3) return null;

    const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    return parseDate(iso) ? iso : null;
}

function addCalendarYears(value, years = 1) {
    const source = parseDate(value);
    if (!source) return null;
    const targetYear = source.getFullYear() + years;
    const targetMonth = source.getMonth();
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    const target = new Date(targetYear, targetMonth, Math.min(source.getDate(), lastDay));
    target.setHours(0, 0, 0, 0);
    return target;
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

function addYear(value) {
    return addCalendarYears(value, 1);
}

function localDate(d) {
    return d ? dateStr(d) : '';
}

function dayNumber(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

function daysBetween(from, to) {
    return dayNumber(to) - dayNumber(from);
}

function latestCompleted(t) {
    const completed = (t.history || []).filter(h => parseDate(h?.returnedAt));
    return completed.reduce(
        (best, h) => !best || parseDate(h.returnedAt) > parseDate(best.returnedAt) ? h : best,
        null
    );
}

function activeHistory(t) {
    const history = Array.isArray(t?.history) ? t.history : [];
    for (let i = history.length - 1; i >= 0; i--) {
        const record = history[i];
        if (record && !record.returnedAt) return { record, index: i };
    }
    return null;
}

function canIssue(t) {
    if (activeHistory(t)) return false;
    const completed = latestCompleted(t);
    const availableDate = completed && addYear(completed.returnedAt);
    if (!availableDate) return true;
    return parseDate(dateStr()) >= availableDate;
}

function waitDays(t) {
    const completed = latestCompleted(t);
    const availableDate = completed && addYear(completed.returnedAt);
    if (!availableDate) return 0;
    return Math.max(0, daysBetween(parseDate(dateStr()), availableDate));
}

function norm(value) {
    return (value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
}

function setDbError(error) {
    console.error(error);
    const status = $('db-status');
    if (status) {
        status.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500"></span>${tr('appError')}`;
    }
}

function territoryNumberExists(number, excludeId = null) {
    const key = norm(number);
    return territories.some(t => t.id !== excludeId && norm(t.number) === key);
}

function applyText() {
    document.documentElement.lang = lang;
    setText('app-title', tr('app'));
    setText('nav-home-label', tr('home'));
    setText('nav-territories-label', tr('territories'));
    setText('nav-publishers-label', tr('publishers'));
    setText('btn-add-city-label', tr('addCity'));
    setText('btn-edit-city-label', tr('editCity'));
    setText('stat-free-label', tr('free'));
    setText('stat-busy-label', tr('busy'));
    setText('stat-overdue-label', tr('overdue'));
    setText('stat-waiting-label', tr('waiting'));
    setText('map-label', tr('map'));
    setText('add-territory-label', tr('territory'));
    setText('publishers-title', tr('publishers'));
    setText('publisher-add-label', tr('addPublisher'));
    setText('pub-base-label', tr('inBase'));

    if ($('publishers-search')) $('publishers-search').placeholder = tr('search');
    if ($('publisher-picker-title')) $('publisher-picker-title').textContent = tr('choosePublisher');
    if ($('publisher-picker-search')) $('publisher-picker-search').placeholder = tr('search');

    if (view === 'territories') renderTerritories();
    if (view === 'publishers') renderPublishers();
}

window.toggleLanguage = () => {
    lang = lang === 'ru' ? 'fr' : 'ru';
    $('lang-slider')?.classList.toggle('translate-x-[calc(100%+4px)]', lang === 'fr');
    $('lang-slider')?.classList.toggle('bg-rose-500', lang === 'fr');
    $('lang-slider')?.classList.toggle('bg-emerald-500', lang === 'ru');
    applyText();
};

function setView(nextView) {
    view = nextView;
    ['home', 'territories', 'publishers'].forEach(name => {
        $(`${name}-page`)?.classList.toggle('hidden', name !== nextView);
        $(`nav-${name}`)?.classList.toggle('nav-active', name === nextView);
    });

    if (nextView !== 'territories' && unsubTerritories) {
        unsubTerritories();
        unsubTerritories = null;
    }

    if (innerWidth < 1024) $('sidebar')?.classList.remove('mobile-open');
}

window.showHomePage = () => setView('home');
window.showPublishersPage = () => {
    setView('publishers');
    renderPublishers();
};
window.toggleMobileSidebar = () => $('sidebar')?.classList.toggle('mobile-open');
window.toggleTerritoriesMenu = () => {
    $('cities-container')?.classList.toggle('hidden');
    $('territory-chevron')?.classList.toggle('rotate-180');
};

window.showTerritoryCity = id => {
    if (!cities.some(c => c.id === id)) return;
    activeCityId = id;
    setView('territories');
    $('cities-container')?.classList.remove('hidden');
    $('territory-chevron')?.classList.add('rotate-180');
    $('city-controls')?.classList.remove('hidden');
    $('city-controls')?.classList.add('flex');
    setText('active-city-title', cities.find(c => c.id === id)?.name || '');
    renderCities();
    updateMap();
    territorySig = '';
    subscribeTerritories();
};

let dialogResolve = null;
function dialog(title, fields) {
    return new Promise(resolve => {
        dialogResolve = resolve;
        setText('dialog-title', title);
        $('dialog-fields').innerHTML = '';

        fields.forEach((field, index) => {
            const wrapper = document.createElement('label');
            wrapper.className = 'block space-y-1';

            const label = document.createElement('span');
            label.className = 'text-[10px] uppercase text-slate-400 font-bold';
            label.textContent = field.label;

            const input = document.createElement('input');
            input.id = `dlg-${index}`;
            input.value = field.value || '';
            input.placeholder = field.placeholder || '';
            input.className = 'w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs focus:outline-none focus:border-indigo-500';

            wrapper.append(label, input);
            $('dialog-fields').append(wrapper);
        });

        $('dialog-modal').classList.remove('hidden');
        $('dialog-modal').classList.add('flex');
        $('dlg-0')?.focus();
    });
}

window.closeDialog = ok => {
    const resolve = dialogResolve;
    dialogResolve = null;
    $('dialog-modal').classList.add('hidden');
    $('dialog-modal').classList.remove('flex');
    resolve?.(ok ? [...$('dialog-fields').querySelectorAll('input')].map(x => x.value) : null);
};

let confirmResolve = null;
function confirmBox(text) {
    return new Promise(resolve => {
        confirmResolve = resolve;
        setText('confirm-text', text);
        $('confirm-modal').classList.remove('hidden');
        $('confirm-modal').classList.add('flex');
    });
}

window.closeConfirm = ok => {
    const resolve = confirmResolve;
    confirmResolve = null;
    $('confirm-modal').classList.add('hidden');
    $('confirm-modal').classList.remove('flex');
    resolve?.(ok);
};

function renderCities() {
    const container = $('cities-container');
    if (!container) return;
    container.innerHTML = '';

    [...cities]
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .forEach(city => {
            const button = document.createElement('button');
            button.textContent = city.name;
            button.onclick = () => showTerritoryCity(city.id);
            button.className = `w-full text-left px-3 py-2 rounded-xl text-xs ${
                view === 'territories' && activeCityId === city.id
                    ? 'font-bold bg-indigo-600 text-white'
                    : 'font-semibold text-slate-400 hover:bg-slate-800 hover:text-white'
            }`;
            container.append(button);
        });
}

function updateMap() {
    const city = cities.find(c => c.id === activeCityId);
    const link = $('map-link');
    if (!link) return;

    if (city?.mapUrl && city.mapUrl !== '#') {
        link.href = city.mapUrl;
        link.classList.remove('hidden');
        link.classList.add('flex');
    } else {
        link.classList.add('hidden');
        link.classList.remove('flex');
    }
}

window.addCity = async () => {
    const values = await dialog(tr('addCity'), [
        { label: lang === 'fr' ? 'Nom de la ville' : 'Название города' },
        { label: tr('map'), placeholder: 'https://www.google.com/maps/d/...' }
    ]);
    if (!values?.[0]?.trim()) return;

    await addDoc(collection(db, 'cities'), {
        name: values[0].trim(),
        mapUrl: values[1]?.trim() || ''
    });
};

window.editCityMenu = () => $('city-menu')?.classList.toggle('hidden');
document.addEventListener('click', event => {
    if (!event.target.closest('#city-menu-wrap')) $('city-menu')?.classList.add('hidden');
});

window.renameCity = async () => {
    const city = cities.find(c => c.id === activeCityId);
    if (!city) return;
    const values = await dialog(tr('renameCity'), [{ label: tr('renameCity'), value: city.name }]);
    if (values?.[0]?.trim()) {
        await updateDoc(doc(db, 'cities', city.id), { name: values[0].trim() });
    }
};

window.editCityMap = async () => {
    const city = cities.find(c => c.id === activeCityId);
    if (!city) return;
    const values = await dialog(tr('cityMap'), [{ label: tr('map'), value: city.mapUrl || '' }]);
    if (values) {
        await updateDoc(doc(db, 'cities', city.id), { mapUrl: values[0].trim() });
    }
};

window.addTerritory = async () => {
    if (!activeCityId) return;
    const values = await dialog(tr('territory'), [
        { label: lang === 'fr' ? 'Numéro' : 'Номер участка' },
        { label: tr('map'), placeholder: 'https://...' }
    ]);

    const number = values?.[0]?.trim();
    if (!number) return;
    if (territoryNumberExists(number)) {
        alert(tr('duplicateTerritory'));
        return;
    }

    await addDoc(collection(db, 'territories'), {
        cityId: activeCityId,
        number,
        mapUrl: values[1]?.trim() || '',
        russianSpeakers: 0,
        history: []
    });
};

function subscribeTerritories() {
    if (unsubTerritories) unsubTerritories();
    if (!activeCityId) return;

    const q = query(collection(db, 'territories'), where('cityId', '==', activeCityId));
    unsubTerritories = onSnapshot(
        q,
        snapshot => {
            const next = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => parseInt(a.number) - parseInt(b.number) || (a.number || '').localeCompare(b.number || ''));

            const signature = JSON.stringify(next);
            if (signature === territorySig) return;
            territorySig = signature;
            territories = next;

            if (view === 'territories') renderTerritories();
            if (historyTerritoryId) showHistory(historyTerritoryId);
        },
        setDbError
    );
}

function esc(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function attr(value) {
    return esc(value).replace(/"/g, '&quot;');
}

function renderTerritories() {
    let free = 0;
    let busy = 0;
    let overdue = 0;
    let waiting = 0;

    const grid = $('grid');
    if (!grid) return;
    grid.innerHTML = '';

    territories.forEach(t => {
        const active = activeHistory(t);
        const current = active?.record || null;
        const isBusy = !!active;
        const lastDone = latestCompleted(t);
        const isWaiting = !isBusy && !!lastDone && !canIssue(t);

        let days = 0;
        let isOverdue = false;
        let due = '-';

        if (isBusy && parseDate(current.issuedAt)) {
            const start = parseDate(current.issuedAt);
            const today = parseDate(dateStr());
            const dueDate = addCalendarMonths(current.issuedAt, 4);
            days = Math.max(0, daysBetween(start, today));
            isOverdue = !!dueDate && today > dueDate;
            due = dueDate ? fmt(localDate(dueDate)) : '-';
        }

        if (isBusy) {
            if (isOverdue) overdue++;
            else busy++;
        } else if (isWaiting) {
            waiting++;
        } else {
            free++;
        }

        let cls = 'bg-emerald-900/40 border-emerald-500/60';
        let badge = '';

        if (isBusy && !isOverdue) {
            cls = 'bg-blue-900/40 border-blue-500/60';
            badge = `<span class="badge bg-blue-950 text-blue-300 border-blue-500/30">${tr('busy')} (${days} ${tr('days')})</span>`;
        }

        if (isOverdue) {
            cls = 'bg-rose-900/40 border-rose-500/70';
            badge = `<span class="badge bg-rose-950 text-rose-300 border-rose-500/30">${tr('overdue')} (${days} ${tr('days')})</span>`;
        }

        if (isWaiting) {
            cls = 'bg-amber-900/40 border-amber-500/70';
        }

        let info;
        if (isBusy) {
            info = `<p><i class="fa-solid fa-user mr-1"></i><b>${esc(current.publisher)}</b></p>
                    <p class="text-[11px] text-slate-300">${tr('due')} <b>${due}</b></p>`;
        } else if (isWaiting) {
            info = `<p class="text-[11px] text-amber-100/80">${tr('lastReturn')} <b>${fmt(lastDone.returnedAt)}</b></p>
                    <p class="text-[11px] text-amber-100/80">${tr('again')} <b>${fmt(localDate(addYear(lastDone.returnedAt)))}</b></p>
                    <p class="text-[11px] text-amber-300">${tr('daysAgain')} <b class="text-white">${waitDays(t)}</b> ${tr('days')}</p>`;
        } else {
            info = `<p class="italic text-slate-300/70">${tr('nobody')}</p>`;
        }

        const action = isBusy
            ? `<button onclick="returnTerritory('${t.id}')" class="action-btn">${tr('ret')}</button>`
            : isWaiting
                ? `<button disabled class="action-btn opacity-45 cursor-not-allowed"><i class="fa-solid fa-lock mr-1"></i>${tr('issue')}</button>`
                : `<button onclick="issueTerritory('${t.id}')" class="h-8 px-3.5 bg-white text-slate-950 rounded-xl text-xs font-bold">${tr('issue')}</button>`;

        const card = document.createElement('article');
        card.dataset.territoryId = t.id;
        card.className = `border ${cls} rounded-3xl p-4 space-y-4 shadow-xl`;
        card.innerHTML = `
            <div class="flex justify-between gap-2">
                <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold">${tr('territory')}</span>
                    <h3 class="text-xl font-extrabold">№ ${esc(t.number)}</h3>
                </div>
                ${badge}
            </div>
            <div class="space-y-2 text-xs">
                ${info}
                <p title="${tr('russian')}"><i class="fa-solid fa-user-group text-sky-400 mr-1"></i><b>${t.russianSpeakers || 0}</b></p>
                <div>
                    ${t.mapUrl
                        ? `<a href="${attr(t.mapUrl)}" target="_blank" class="mini-btn"><i class="fa-solid fa-map mr-1"></i>${tr('map')}</a>`
                        : `<span class="text-[10px] text-slate-400 italic">${tr('noMap')}</span>`}
                </div>
            </div>
            <div class="pt-3 border-t border-white/10 flex justify-between">
                <div class="flex gap-1">
                    <button onclick="editTerritory('${t.id}')" class="square-btn"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="showHistory('${t.id}')" class="square-btn"><i class="fa-solid fa-clock-rotate-left"></i></button>
                </div>
                ${action}
            </div>`;

        grid.append(card);
    });

    setText('st-free', free);
    setText('st-busy', busy);
    setText('st-overdue', overdue);
    setText('st-waiting', waiting);
}

window.editTerritory = async id => {
    const t = territories.find(x => x.id === id);
    if (!t) return;

    const values = await dialog(`${tr('territory')} №${t.number}`, [
        { label: lang === 'fr' ? 'Numéro' : 'Номер', value: t.number },
        { label: tr('map'), value: t.mapUrl || '' },
        { label: tr('russian'), value: String(t.russianSpeakers || 0) }
    ]);
    if (!values) return;

    const number = values[0].trim() || t.number;
    if (territoryNumberExists(number, id)) {
        alert(tr('duplicateTerritory'));
        return;
    }

    await updateDoc(doc(db, 'territories', id), {
        number,
        mapUrl: values[1].trim(),
        russianSpeakers: Math.max(0, parseInt(values[2]) || 0)
    });
};

window.issueTerritory = async id => {
    const t = territories.find(x => x.id === id);
    if (!t) return;

    if (activeHistory(t)) {
        alert(tr('alreadyIssued'));
        return;
    }

    if (!canIssue(t)) {
        const completed = latestCompleted(t);
        alert(`${tr('cantIssue')}\n\n${tr('lastReturn')} ${fmt(completed.returnedAt)}\n${tr('again')} ${fmt(localDate(addYear(completed.returnedAt)))}`);
        return;
    }

    if (!publishers.length) {
        alert(tr('firstPublisher'));
        showPublishersPage();
        return;
    }

    const publisher = await pickPublisher();
    if (!publisher) return;

    const history = [
        ...(t.history || []),
        {
            publisherId: publisher.id,
            publisher: publisher.fullName,
            issuedAt: dateStr(),
            returnedAt: null
        }
    ];

    await updateDoc(doc(db, 'territories', id), { history });
};

window.returnTerritory = async id => {
    const t = territories.find(x => x.id === id);
    const active = activeHistory(t);
    if (!t || !active) return;

    const today = parseDate(dateStr());
    const issued = parseDate(active.record.issuedAt);
    if (issued && today < issued) {
        alert(tr('returnBeforeIssue'));
        return;
    }

    const history = [...(t.history || [])];
    history[active.index] = { ...history[active.index], returnedAt: dateStr() };
    await updateDoc(doc(db, 'territories', id), { history });
};

window.showHistory = id => {
    historyTerritoryId = id;
    const t = territories.find(x => x.id === id);
    if (!t) return;

    setText('history-title', `${tr('history')} №${t.number}`);
    $('history-list').innerHTML = '';

    if (!(t.history || []).length) {
        $('history-list').innerHTML = `<p class="text-xs text-slate-400 italic">${tr('empty')}</p>`;
    }

    (t.history || []).forEach((h, i) => {
        const row = document.createElement('div');
        row.className = 'bg-slate-950 border border-slate-800 rounded-2xl p-3 flex justify-between gap-2';
        row.innerHTML = `
            <div>
                <b>#${i + 1} ${esc(h.publisher)}</b>
                <p class="text-[11px] text-slate-400">${tr('issued')}: ${fmt(h.issuedAt)} | ${tr('returned')}: ${h.returnedAt ? fmt(h.returnedAt) : tr('inProgress')}</p>
            </div>
            <div class="flex gap-1">
                <button onclick="editHistory(${i})" class="square-btn"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteHistory(${i})" class="square-btn text-rose-400"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        $('history-list').append(row);
    });

    $('history-modal').classList.remove('hidden');
    $('history-modal').classList.add('flex');
};

window.closeHistory = () => {
    historyTerritoryId = null;
    $('history-modal').classList.add('hidden');
    $('history-modal').classList.remove('flex');
};

window.editHistory = async i => {
    const t = territories.find(x => x.id === historyTerritoryId);
    const h = t?.history?.[i];
    if (!h) return;

    const values = await dialog(`${tr('history')} #${i + 1}`, [
        { label: tr('publishers'), value: h.publisher },
        { label: tr('issued'), value: fmt(h.issuedAt) },
        { label: tr('returned'), value: fmt(h.returnedAt) }
    ]);
    if (!values) return;

    const publisherName = values[0].trim() || h.publisher;
    const issuedAt = inputDate(values[1]);
    const returnedRaw = values[2].trim();
    const returnedAt = returnedRaw ? inputDate(returnedRaw) : null;

    if (!issuedAt || (returnedRaw && !returnedAt)) {
        alert(tr('invalidDate'));
        return;
    }

    if (returnedAt && parseDate(returnedAt) < parseDate(issuedAt)) {
        alert(tr('returnBeforeIssue'));
        return;
    }

    if (!returnedAt) {
        const anotherOpen = (t.history || []).some((record, index) => index !== i && record && !record.returnedAt);
        if (anotherOpen) {
            alert(tr('anotherOpen'));
            return;
        }
    }

    const history = [...t.history];
    history[i] = {
        ...h,
        publisherId: norm(publisherName) === norm(h.publisher) ? (h.publisherId || null) : null,
        publisher: publisherName,
        issuedAt,
        returnedAt
    };

    await updateDoc(doc(db, 'territories', t.id), { history });
};

window.deleteHistory = async i => {
    const t = territories.find(x => x.id === historyTerritoryId);
    if (!t?.history?.[i]) return;

    if (!await confirmBox(`${lang === 'fr' ? 'Supprimer' : 'Удалить'} #${i + 1} (${t.history[i].publisher})?`)) return;

    const history = [...t.history];
    history.splice(i, 1);
    await updateDoc(doc(db, 'territories', t.id), { history });
};

function subscribePublishers() {
    onSnapshot(
        collection(db, 'publishers'),
        snapshot => {
            const next = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

            const signature = JSON.stringify(next);
            if (signature === publisherSig) return;
            publisherSig = signature;
            publishers = next;

            if (view === 'publishers') renderPublishers();
            if (!$('publisher-picker-modal').classList.contains('hidden')) renderPicker();
        },
        setDbError
    );
}

function renderPublishers() {
    const q = ($('publishers-search')?.value || '').toLocaleLowerCase();
    const list = $('publishers-list');
    if (!list) return;

    setText('publishers-count', publishers.length);
    list.innerHTML = '';

    publishers
        .filter(p => (p.fullName || '').toLocaleLowerCase().includes(q))
        .forEach(p => {
            const row = document.createElement('div');
            row.className = 'bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex justify-between items-center';
            row.innerHTML = `
                <b>${esc(p.fullName)}</b>
                <div class="flex gap-1">
                    <button onclick="editPublisher('${p.id}')" class="square-btn"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deletePublisher('${p.id}')" class="square-btn text-rose-400"><i class="fa-solid fa-trash"></i></button>
                </div>`;
            list.append(row);
        });
}
window.renderPublishers = renderPublishers;

window.addPublisher = async () => {
    const values = await dialog(tr('addPublisher'), [{ label: tr('publishers'), placeholder: 'Иван Иванов' }]);
    const fullName = values?.[0]?.trim().replace(/\s+/g, ' ');
    if (!fullName) return;

    if (publishers.some(p => norm(p.fullName) === norm(fullName))) {
        alert(tr('publisherExists'));
        return;
    }

    await addDoc(collection(db, 'publishers'), {
        fullName,
        nameKey: norm(fullName),
        createdAt: dateStr()
    });
};

window.editPublisher = async id => {
    const p = publishers.find(x => x.id === id);
    if (!p) return;

    const values = await dialog(
        lang === 'fr' ? 'Modifier le proclamateur' : 'Изменить возвещателя',
        [{ label: tr('publishers'), value: p.fullName }]
    );
    const fullName = values?.[0]?.trim().replace(/\s+/g, ' ');
    if (!fullName) return;

    if (publishers.some(x => x.id !== id && norm(x.fullName) === norm(fullName))) {
        alert(tr('publisherExists'));
        return;
    }

    await updateDoc(doc(db, 'publishers', id), {
        fullName,
        nameKey: norm(fullName)
    });
};

window.deletePublisher = async id => {
    const p = publishers.find(x => x.id === id);
    if (!p) return;

    if (await confirmBox(`${lang === 'fr' ? 'Supprimer' : 'Удалить'} ${p.fullName}?`)) {
        await deleteDoc(doc(db, 'publishers', id));
    }
};

let pickerResolve = null;
function pickPublisher() {
    return new Promise(resolve => {
        pickerResolve = resolve;
        $('publisher-picker-search').value = '';
        renderPicker();
        $('publisher-picker-modal').classList.remove('hidden');
        $('publisher-picker-modal').classList.add('flex');
        $('publisher-picker-search').focus();
    });
}

function renderPicker() {
    const q = $('publisher-picker-search').value.toLocaleLowerCase();
    const list = $('publisher-picker-list');
    list.innerHTML = '';

    publishers
        .filter(p => (p.fullName || '').toLocaleLowerCase().includes(q))
        .forEach(p => {
            const button = document.createElement('button');
            button.className = 'w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-indigo-950 border border-slate-800';
            button.textContent = p.fullName;
            button.onclick = () => closePicker(p);
            list.append(button);
        });
}
window.renderPicker = renderPicker;

function closePicker(p) {
    const resolve = pickerResolve;
    pickerResolve = null;
    $('publisher-picker-modal').classList.add('hidden');
    $('publisher-picker-modal').classList.remove('flex');
    resolve?.(p || null);
}
window.closePicker = () => closePicker(null);

function scheduleMidnight() {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 1, 0);

    setTimeout(() => {
        if (view === 'territories') renderTerritories();
        scheduleMidnight();
    }, Math.max(1000, nextDay.getTime() - now.getTime()));
}

async function init() {
    try {
        const snapshot = await getDocs(collection(db, 'cities'));
        cities = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        activeCityId = cities[0]?.id || null;
        renderCities();

        onSnapshot(
            collection(db, 'cities'),
            snap => {
                const next = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (JSON.stringify(next) === JSON.stringify(cities)) return;

                cities = next;
                renderCities();

                if (activeCityId && !cities.some(c => c.id === activeCityId)) {
                    activeCityId = cities[0]?.id || null;
                    if (!activeCityId) showHomePage();
                }

                if (view === 'territories') {
                    setText('active-city-title', cities.find(c => c.id === activeCityId)?.name || '');
                    updateMap();
                }
            },
            setDbError
        );

        // Автоматический импорт имён из истории больше не запускается.
        // Иначе удалённый возвещатель снова появлялся бы после перезапуска приложения.
        subscribePublishers();

        const status = $('db-status');
        if (status) {
            status.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span>${tr('connected')}`;
        }

        applyText();
        showHomePage();
        scheduleMidnight();
    } catch (error) {
        setDbError(error);
    }
}

init();
