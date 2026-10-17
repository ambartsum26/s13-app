/*
 * EXPERIMENTAL E2EE application adapter. Not imported by the live application.
 * All sensitive reads are decrypted locally and all mutations re-encrypted
 * before transport; transport stores ONLY encrypted envelopes.
 *
 * Firebase Security Rules must independently verify group membership.
 */
import { decryptDocument, encryptDocument } from './crypto.js';

const KINDS = new Set(['cities', 'territories', 'publishers']);

function fail(code) {
    const error = new Error(code);
    error.code = 's13/' + code;
    return error;
}

function requireId(id) {
    if (typeof id !== 'string' || !id || id.length > 256 || id.includes('/')) {
        throw fail('invalidIdentifier');
    }
    return id;
}

function validIsoDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1900 || year > 9998) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function yearAfter(iso) {
    const [year, month, day] = iso.split('-').map(Number);
    const maxDay = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
    return [year + 1, month, Math.min(day, maxDay)]
        .map((value, index) => index === 0 ? String(value) : String(value).padStart(2, '0'))
        .join('-');
}

function clone(value) {
    return structuredClone(value);
}

export function validateTerritoryHistory(history) {
    if (!Array.isArray(history)) throw fail('invalidHistory');
    const periods = history.map(record => {
        if (!record || !validIsoDate(record.issuedAt) ||
            (record.returnedAt && !validIsoDate(record.returnedAt))) {
            throw fail('invalidDate');
        }
        if (record.returnedAt && record.returnedAt < record.issuedAt) {
            throw fail('returnBeforeIssue');
        }
        return { start: record.issuedAt, end: record.returnedAt || null };
    }).sort((a, b) => a.start.localeCompare(b.start));

    for (let index = 1; index < periods.length; index++) {
        if (!periods[index - 1].end || periods[index - 1].end > periods[index].start) {
            throw fail('historyOverlap');
        }
    }
}

function searchKey(value) {
    return String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '')
        .trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function activeAssignment(history) {
    return history.find(entry => !entry.returnedAt) || null;
}

function latestReturn(history) {
    return history.filter(h => h.returnedAt).reduce((latest, entry) =>
        !latest || latest.returnedAt < entry.returnedAt ? entry : latest, null);
}

function numberSort(a, b) {
    return String(a.number).localeCompare(String(b.number), 'fr', { numeric: true });
}

function forYear(territories, year) {
    const start = String(year - 1) + '-09-01';
    const end = String(year) + '-09-01';
    return territories.map(territory => {
        const history = territory.history ?? [];
        validateTerritoryHistory(history);
        const previousCompletion = history.filter(record =>
            record.returnedAt && record.returnedAt < start
        ).map(record => record.returnedAt).sort().at(-1) || '';
        const included = history.filter(record => record.issuedAt < end &&
            (!record.returnedAt || record.returnedAt >= start)
        ).sort((a, b) => a.issuedAt.localeCompare(b.issuedAt));
        return { ...territory, history: included, previousCompletion };
    });
}

export function createEncryptedTerritoryService({ groupId, key, transport }) {
    if (!groupId || typeof groupId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(groupId)) {
        throw fail('invalidGroup');
    }
    if (!transport || transport.groupId !== groupId ||
        typeof transport.get !== 'function' ||
        typeof transport.list !== 'function' ||
        typeof transport.mutate !== 'function' ||
        typeof transport.issue !== 'function') {
        throw fail('invalidTransport');
    }

    function context(kind, documentId) {
        if (!KINDS.has(kind)) throw fail('invalidCollection');
        return { groupId, collection: kind, documentId: requireId(documentId) };
    }

    async function unseal(kind, id, envelope) {
        if (!envelope) throw fail('missingRecord');
        const value = await decryptDocument(key, context(kind, id), envelope);
        if (value.id !== undefined) throw fail('invalidRecord');
        return { id, ...value };
    }

    async function seal(kind, id, record) {
        const { id: _discard, ...value } = record;
        return encryptDocument(key, context(kind, id), value);
    }

    async function read(kind, id) {
        return unseal(kind, id, await transport.get(kind, requireId(id)));
    }

    async function list(kind) {
        const rows = await transport.list(kind);
        if (!Array.isArray(rows)) throw fail('invalidTransport');
        return Promise.all(rows.map(row => unseal(kind, requireId(row.id), row.envelope)));
    }

    return Object.freeze({
        readCity(id) {
            return read('cities', id);
        },

        async searchPublishers(query = '') {
            const all = await list('publishers');
            const terms = searchKey(query).split(' ').filter(Boolean);
            return all.filter(person => {
                if (typeof person.fullName !== 'string') throw fail('invalidRecord');
                const normalized = searchKey(person.fullName);
                return terms.every(term => normalized.includes(term));
            }).sort((a, b) => searchKey(a.fullName).localeCompare(searchKey(b.fullName), 'fr'));
        },

        async listTerritories(cityId) {
            requireId(cityId);
            const all = await list('territories');
            const matched = all.filter(territory => territory.cityId === cityId);
            matched.forEach(territory => validateTerritoryHistory(territory.history ?? []));
            return matched.sort(numberSort);
        },

        async issueTerritory({ territoryId, publisherId, issuedAt, historyId }) {
            requireId(territoryId);
            requireId(publisherId);
            if (!validIsoDate(issuedAt)) throw fail('invalidDate');
            if (!historyId || typeof historyId !== 'string' || historyId.includes('/')) {
                throw fail('invalidIdentifier');
            }
            return transport.issue(territoryId, publisherId, async (territoryEnvelope, publisherEnvelope) => {
                const territory = await unseal('territories', territoryId, territoryEnvelope);
                const person = await unseal('publishers', publisherId, publisherEnvelope);
                if (!person.fullName || typeof person.fullName !== 'string') throw fail('invalidRecord');
                const history = clone(territory.history ?? []);
                validateTerritoryHistory(history);
                if (activeAssignment(history)) throw fail('alreadyIssued');
                const latest = latestReturn(history);
                if (latest && issuedAt < yearAfter(latest.returnedAt)) throw fail('cantIssue');
                if (history.some(entry => entry.id === historyId)) throw fail('conflict');
                history.push({
                    id: historyId,
                    publisherId,
                    publisher: person.fullName,
                    issuedAt,
                    returnedAt: null
                });
                validateTerritoryHistory(history);
                return seal('territories', territoryId, { ...territory, history });
            });
        },

        async returnTerritory({ territoryId, returnedAt }) {
            requireId(territoryId);
            if (!validIsoDate(returnedAt)) throw fail('invalidDate');
            return transport.mutate('territories', territoryId, async currentEnvelope => {
                const territory = await unseal('territories', territoryId, currentEnvelope);
                const history = clone(territory.history ?? []);
                validateTerritoryHistory(history);
                const active = activeAssignment(history);
                if (!active) throw fail('notIssued');
                if (returnedAt < active.issuedAt) throw fail('returnBeforeIssue');
                active.returnedAt = returnedAt;
                validateTerritoryHistory(history);
                return seal('territories', territoryId, { ...territory, history });
            });
        },

        async prepareS13({ cityId, serviceYear }) {
            requireId(cityId);
            if (!Number.isInteger(serviceYear) || serviceYear < 1901 || serviceYear > 9998) {
                throw fail('invalidServiceYear');
            }
            const city = await read('cities', cityId);
            if (!city.name || typeof city.name !== 'string') throw fail('invalidRecord');
            const territories = await this.listTerritories(cityId);
            return {
                city,
                territories: forYear(territories, serviceYear),
                serviceYear
            };
        }
    });
}
