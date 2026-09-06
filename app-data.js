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
        const ids = new Set();
        for (const record of history) {
            if (!record.id || ids.has(record.id)) record.id = crypto.randomUUID();
            ids.add(record.id);
        }
        requireOwner();
        transaction.update(ref, { history });
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
