import { db, requireOwner } from './app-auth.js';
import {
    collection, doc, query, where, getDocsFromServer, runTransaction
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export function dataError(code) {
    return Object.assign(new Error(code), { code: `s13/${code}` });
}

function comparable(record) {
    return JSON.stringify(Object.keys(record).filter(key => key !== 'id').sort()
        .map(key => [key, record[key]]));
}

// Legacy records gain IDs only when their territory is explicitly saved.
// A changed/ambiguous legacy record is rejected rather than guessed by position.
export function historyRecordIndex(history, expected) {
    const matches = history.map((record, index) => ({ record, index })).filter(({ record }) =>
        expected.id ? record.id === expected.id : comparable(record) === comparable(expected));
    if (matches.length !== 1 || comparable(matches[0].record) !== comparable(expected)) {
        throw dataError('conflict');
    }
    return matches[0].index;
}

function validIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// A territory cannot be assigned to two people during overlapping periods.
// Same-day return/reassignment is allowed; invalid legacy dates must be fixed
// before another history change can be saved.
export function validateHistory(history) {
    const periods = history.map(record => {
        if (!record || !validIsoDate(record.issuedAt) ||
            (record.returnedAt && !validIsoDate(record.returnedAt))) {
            throw dataError('invalidDate');
        }
        if (record.returnedAt && record.returnedAt < record.issuedAt) {
            throw dataError('returnBeforeIssue');
        }
        return { start: record.issuedAt, end: record.returnedAt || null };
    }).sort((a, b) => a.start.localeCompare(b.start));

    for (let index = 1; index < periods.length; index++) {
        const previous = periods[index - 1];
        if (!previous.end || previous.end > periods[index].start) {
            throw dataError('historyOverlap');
        }
    }
}

export async function changeHistory(territoryId, change) {
    requireOwner();
    const ref = doc(db, 'territories', territoryId);
    return runTransaction(db, async transaction => {
        requireOwner();
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw dataError('conflict');
        const territory = snapshot.data();
        if (territory.history != null && !Array.isArray(territory.history)) throw dataError('conflict');
        const history = (territory.history || []).map(record => ({ ...record }));
        await change(history, territory, transaction);
        validateHistory(history);
        const ids = new Set();
        for (const record of history) {
            if (!record.id || ids.has(record.id)) record.id = crypto.randomUUID();
            ids.add(record.id);
        }
        requireOwner();
        transaction.update(ref, { history });
    });
}

// Update selected fields only if the values shown to the editor are still
// current. Unrelated changes are preserved, while same-field edits conflict.
export async function updateExistingRecord(kind, id, values, expected) {
    requireOwner();
    const ref = doc(db, kind, id);
    return runTransaction(db, async transaction => {
        requireOwner();
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists() || Object.keys(expected).some(key =>
            JSON.stringify(snapshot.data()[key]) !== JSON.stringify(expected[key]))) {
            throw dataError('conflict');
        }
        requireOwner();
        transaction.update(ref, values);
        return id;
    });
}

const normalize = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

// All creates, renames and deletes in a scope update this same guard.
// Reading it BEFORE the server query makes a concurrent scope change retry
// the whole transaction, including the query (also covers legacy documents).
export async function saveUniqueRecord(kind, values, expected = null, remove = false) {
    requireOwner();
    const field = kind === 'territories' ? 'number' : 'fullName';
    const scope = kind === 'territories' ? values.cityId : 'all';
    const guardRef = doc(db, 'appLocks', `${kind}_${scope}`);
    const ref = expected ? doc(db, kind, expected.id) : doc(collection(db, kind));
    const source = kind === 'territories'
        ? query(collection(db, kind), where('cityId', '==', scope))
        : collection(db, kind);
    return runTransaction(db, async transaction => {
        requireOwner();
        const guard = await transaction.get(guardRef);
        if (expected) {
            const current = await transaction.get(ref);
            if (!current.exists() || Object.keys(values).some(key =>
                JSON.stringify(current.data()[key]) !== JSON.stringify(expected[key]))) {
                throw dataError('conflict');
            }
        }
        if (!remove) {
            const snapshot = await getDocsFromServer(source);
            if (snapshot.docs.some(item => item.id !== ref.id && normalize(item.data()[field]) === normalize(values[field]))) {
                throw dataError(kind === 'territories' ? 'duplicateTerritory' : 'publisherExists');
            }
        }
        requireOwner();
        transaction.set(guardRef, { revision: (guard.data()?.revision || 0) + 1 });
        if (remove) transaction.delete(ref);
        else if (expected) transaction.update(ref, values);
        else transaction.set(ref, values);
        return ref.id;
    });
}
