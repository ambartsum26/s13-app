import { getApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore(getApps().length ? getApp() : undefined);
const HISTORY_GROUPS_PER_SHEET = 4;
let rememberedCityId = sessionStorage.getItem('s13-active-city-id') || null;

const originalShowTerritoryCity = window.showTerritoryCity;
if (typeof originalShowTerritoryCity === 'function') {
    window.showTerritoryCity = function (id) {
        if (id) {
            rememberedCityId = id;
            sessionStorage.setItem('s13-active-city-id', id);
        }
        return originalShowTerritoryCity(id);
    };
}

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) return null;
    return date;
}

function fmtFr(value) {
    if (!value) return '';
    const date = parseIsoDate(value);
    if (!date) return esc(value);
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}

function normalize(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function compareTerritoryNumbers(a, b) {
    const an = Number.parseInt(a?.number, 10);
    const bn = Number.parseInt(b?.number, 10);
    if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
    return String(a?.number || '').localeCompare(String(b?.number || ''), 'fr', { numeric: true });
}

function latestCompletedBefore(history, endExclusive) {
    let best = null;
    for (let i = 0; i < Math.min(endExclusive, history.length); i++) {
        const record = history[i];
        if (!record?.returnedAt || !parseIsoDate(record.returnedAt)) continue;
        if (!best || parseIsoDate(record.returnedAt) > parseIsoDate(best.returnedAt)) best = record;
    }
    return best?.returnedAt || '';
}

async function resolveActiveCity() {
    const snapshot = await getDocs(collection(db, 'cities'));
    const cities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const storedId = rememberedCityId || sessionStorage.getItem('s13-active-city-id');
    const byId = cities.find(city => city.id === storedId);
    if (byId) return byId;

    const activeName = (
        document.getElementById('active-city-title')?.textContent ||
        document.querySelector('#cities-container button.bg-indigo-600')?.textContent ||
        ''
    ).trim();

    if (activeName) {
        const byName = cities.find(city => normalize(city.name) === normalize(activeName));
        if (byName) {
            rememberedCityId = byName.id;
            sessionStorage.setItem('s13-active-city-id', byName.id);
            return byName;
        }
    }

    if (cities.length === 1) {
        rememberedCityId = cities[0].id;
        sessionStorage.setItem('s13-active-city-id', cities[0].id);
        return cities[0];
    }

    return null;
}

async function loadTerritories(cityId) {
    const snapshot = await getDocs(
        query(collection(db, 'territories'), where('cityId', '==', cityId))
    );

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort(compareTerritoryNumbers);
}

function buildHeaderGroups() {
    return Array.from({ length: HISTORY_GROUPS_PER_SHEET }, () =>
        '<th colspan="2" class="assigned-to">Attribué à</th>'
    ).join('');
}

function buildSubHeaders() {
    return Array.from({ length: HISTORY_GROUPS_PER_SHEET }, () =>
        '<th>Attribué le</th><th>Entièrement<br>parcouru le</th>'
    ).join('');
}

function buildTerritoryRows(territories, startIndex) {
    return territories.map(territory => {
        const history = Array.isArray(territory.history) ? territory.history : [];
        const names = [];
        const dates = [];

        for (let slot = 0; slot < HISTORY_GROUPS_PER_SHEET; slot++) {
            const record = history[startIndex + slot];
            names.push(
                `<td colspan="2" class="person">${record?.publisher ? `<b>${esc(record.publisher)}</b>` : '&nbsp;'}</td>`
            );
            dates.push(
                `<td class="date-cell">${record?.issuedAt ? fmtFr(record.issuedAt) : '&nbsp;'}</td>` +
                `<td class="date-cell">${record?.returnedAt ? fmtFr(record.returnedAt) : '&nbsp;'}</td>`
            );
        }

        const previousCompletion = latestCompletedBefore(history, startIndex);

        return `
            <tbody class="territory-pair">
                <tr class="person-row">
                    <td rowspan="2" class="territory-no"><b>${esc(territory.number)}</b></td>
                    <td rowspan="2" class="last-complete">${previousCompletion ? fmtFr(previousCompletion) : '&nbsp;'}</td>
                    ${names.join('')}
                </tr>
                <tr class="date-row">${dates.join('')}</tr>
            </tbody>`;
    }).join('');
}

function buildSheet(city, territories, sheetIndex, sheetCount) {
    const startIndex = sheetIndex * HISTORY_GROUPS_PER_SHEET;
    const serviceYear = new Date().getFullYear();
    const finalClass = sheetIndex === sheetCount - 1 ? 'sheet final-sheet' : 'sheet';

    return `
        <div class="Section1 ${finalClass}">
            <div class="sheet-heading">
                <h1>REGISTRE D’ATTRIBUTION DES TERRITOIRES</h1>
                <div class="sheet-meta">
                    <span><b>Année de service :</b> ${serviceYear}</span>
                    <span><b>Ville :</b> ${esc(city.name)}</span>
                </div>
            </div>

            <table class="register-table">
                <colgroup>
                    <col class="col-number">
                    <col class="col-last">
                    ${'<col class="col-date"><col class="col-date">'.repeat(HISTORY_GROUPS_PER_SHEET)}
                </colgroup>
                <thead>
                    <tr>
                        <th rowspan="2">Terr.<br>n°</th>
                        <th rowspan="2">Parcouru pour<br>la dernière fois le*</th>
                        ${buildHeaderGroups()}
                    </tr>
                    <tr>${buildSubHeaders()}</tr>
                </thead>
                ${buildTerritoryRows(territories, startIndex)}
            </table>

            <div class="sheet-footer">
                <p>* Lorsque vous commencez une nouvelle feuille, notez dans cette colonne la date à laquelle chaque territoire a été entièrement parcouru pour la dernière fois.</p>
                <div class="footer-line"><span>S-13-F 1/22</span>${sheetCount > 1 ? `<span>Feuille ${sheetIndex + 1}/${sheetCount}</span>` : '<span></span>'}</div>
            </div>
        </div>`;
}

function makeDocument(city, territories) {
    const maxHistory = Math.max(
        0,
        ...territories.map(territory => Array.isArray(territory.history) ? territory.history.length : 0)
    );
    const sheetCount = Math.max(1, Math.ceil(maxHistory / HISTORY_GROUPS_PER_SHEET));
    const sheets = Array.from({ length: sheetCount }, (_, index) =>
        buildSheet(city, territories, index, sheetCount)
    ).join('');

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word">
<meta name="Originator" content="Microsoft Word">
<style>
    @page Section1 {
        size: 841.9pt 595.3pt;
        mso-page-orientation: landscape;
        margin: 24pt 24pt 24pt 24pt;
    }

    body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 7.5pt;
        color: #000;
        background: #fff;
    }

    .Section1 {
        page: Section1;
    }

    .sheet {
        page-break-after: always;
    }

    .sheet.final-sheet {
        page-break-after: auto;
    }

    .sheet-heading {
        margin-bottom: 7pt;
    }

    h1 {
        margin: 0 0 5pt;
        padding: 0;
        font-size: 13pt;
        line-height: 1.1;
        text-align: left;
        font-weight: 700;
    }

    .sheet-meta {
        display: table;
        width: 100%;
        font-size: 8pt;
    }

    .sheet-meta span {
        display: table-cell;
        width: 50%;
    }

    .sheet-meta span:last-child {
        text-align: right;
    }

    .register-table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        border-spacing: 0;
    }

    .register-table thead {
        display: table-header-group;
    }

    .register-table th,
    .register-table td {
        border: 0.8pt solid #000;
        padding: 2pt 2.5pt;
        text-align: center;
        vertical-align: middle;
        white-space: normal;
        overflow-wrap: anywhere;
        word-wrap: break-word;
        line-height: 1.08;
    }

    .register-table th {
        background: #eeeeee;
        font-weight: 700;
        font-size: 6.8pt;
    }

    .register-table .assigned-to {
        font-size: 7pt;
    }

    .col-number { width: 5.5%; }
    .col-last { width: 13.5%; }
    .col-date { width: 10.125%; }

    .territory-pair {
        page-break-inside: avoid;
    }

    .person-row td,
    .date-row td {
        height: 15pt;
    }

    .territory-no {
        font-size: 8.5pt;
    }

    .last-complete,
    .date-cell {
        font-size: 6.8pt;
        white-space: nowrap;
    }

    .person {
        font-size: 7.2pt;
        min-height: 15pt;
    }

    .sheet-footer {
        margin-top: 5pt;
        font-size: 6.6pt;
        line-height: 1.15;
    }

    .sheet-footer p {
        margin: 0 0 4pt;
        font-style: italic;
    }

    .footer-line {
        display: table;
        width: 100%;
    }

    .footer-line span {
        display: table-cell;
        width: 50%;
    }

    .footer-line span:last-child {
        text-align: right;
    }
</style>
</head>
<body>${sheets}</body>
</html>`;
}

function safeFileName(value) {
    const normalized = String(value || 'ville')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
    return normalized || 'ville';
}

window.exportOfficialRegister = async () => {
    try {
        const city = await resolveActiveCity();
        if (!city) {
            alert('Sélectionnez d’abord une ville.');
            return;
        }

        const territories = await loadTerritories(city.id);
        const html = makeDocument(city, territories);
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `S-13_${safeFileName(city.name)}.doc`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (error) {
        console.error('S-13 export error:', error);
        alert('Impossible de créer le formulaire S-13.');
    }
};
