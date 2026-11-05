/*
 * EMULATOR-ONLY administrative cutover rehearsal.
 *
 * NEVER use against a real Firebase project. Requires Firebase Emulator REST
 * and its bypass token; this bypass token is NOT a production credential.
 * No plaintext or crypto secret reaches this coordinator.
 *
 * A small group is frozen (no client writes); a complete replacement of all
 * ciphertext and the recovery envelope plus custodian UID happens in ONE
 * conditional Firestore commit. Larger groups require versioned generations.
 */
const PROJECT = 'demo-s13-e2ee';
const COLLECTIONS = Object.freeze(['cities', 'territories', 'publishers', 'addressMarkers']);
const MAX_RECORDS = 400;
const MAX_COMMIT_BYTES = 9_000_000;
const encoder = new TextEncoder();

function fail(message) {
    throw new Error('Cutover rehearsal: ' + message);
}

function identifier(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) {
        fail('invalid group or user identifier');
    }
    return value;
}

function checkEnvelope(row, groupId) {
    if (!row || !COLLECTIONS.includes(row.collection) ||
        typeof row.documentId !== 'string' || !row.documentId ||
        row.documentId.length > 256 || row.documentId.includes('/')) {
        fail('invalid record path');
    }
    const data = row.envelope;
    const required = ['version', 'kind', 'cipher', 'groupId', 'collection',
        'documentId', 'nonce', 'ciphertext'];
    if (!data || Object.keys(data).sort().join(',') !== required.sort().join(',') ||
        data.version !== 1 || data.kind !== 's13-encrypted-document' ||
        data.cipher !== 'AES-256-GCM' || data.groupId !== groupId ||
        data.collection !== row.collection || data.documentId !== row.documentId ||
        typeof data.nonce !== 'string' || !/^[A-Za-z0-9_-]{16}$/.test(data.nonce) ||
        typeof data.ciphertext !== 'string' ||
        data.ciphertext.length < 22 || data.ciphertext.length > 700000 ||
        !/^[A-Za-z0-9_-]+$/.test(data.ciphertext)) {
        fail('invalid encrypted envelope; plaintext rejected');
    }
}

function checkRecovery(groupId, r) {
    const required = ['version', 'kind', 'groupId', 'kdf', 'cipher', 'salt', 'nonce', 'wrappedKey'];
    if (!r || Object.keys(r).sort().join(',') !== required.sort().join(',') ||
        r.version !== 1 || r.kind !== 's13-group-recovery' ||
        r.groupId !== groupId || r.kdf !== 'HKDF-SHA256' ||
        r.cipher !== 'AES-256-GCM' ||
        typeof r.salt !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(r.salt) ||
        typeof r.nonce !== 'string' || !/^[A-Za-z0-9_-]{16}$/.test(r.nonce) ||
        typeof r.wrappedKey !== 'string' || !/^[A-Za-z0-9_-]{64}$/.test(r.wrappedKey)) {
        fail('invalid recovery envelope');
    }
}

const asFields = object => Object.fromEntries(Object.entries(object).map(([key, value]) => {
    if (Number.isSafeInteger(value)) return [key, { integerValue: String(value) }];
    if (typeof value === 'string') return [key, { stringValue: value }];
    fail('unexpected field type in ciphertext document');
}));

async function responseJson(response) {
    const parsed = await response.json();
    if (!response.ok) fail('emulator request failed: ' +
        response.status + ' ' + String(parsed?.error?.message || 'unknown error').slice(0, 120));
    return parsed;
}

export function createEmulatorCutover({ host, projectId }) {
    if (projectId !== PROJECT || typeof host !== 'string' ||
        !/^(127\.0\.0\.1|localhost):[0-9]{2,5}$/.test(host) ||
        process.env.FIRESTORE_EMULATOR_HOST !== host ||
        !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        fail('local demo Firebase Emulators are mandatory');
    }
    const base = 'http://' + host + '/v1/projects/' + PROJECT + '/databases/(default)/documents';
    const commitUrl = base + ':commit';

    async function rest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: 'Bearer owner', // Firebase Emulator bypass ONLY
                ...(options.body ? { 'Content-Type': 'application/json' } : {})
            }
        });
        return responseJson(response);
    }

    async function read(fullName) {
        return rest('http://' + host + '/v1/' + fullName);
    }

    async function list(groupId, kind) {
        const output = [];
        let pageToken = '';
        do {
            const query = new URLSearchParams({ pageSize: '300' });
            if (pageToken) query.set('pageToken', pageToken);
            const result = await rest(base + '/e2eeGroups/' + encodeURIComponent(groupId) +
                '/' + kind + '?' + query);
            for (const item of result.documents || []) {
                output.push({
                    documentId: item.name.split('/').at(-1), collection: kind,
                    updateTime: item.updateTime
                });
                if (output.length > MAX_RECORDS) fail('too many records for atomic cutover');
            }
            pageToken = result.nextPageToken || '';
        } while (pageToken);
        return output;
    }

    async function commit(writes) {
        const body = JSON.stringify({ writes });
        if (encoder.encode(body).length > MAX_COMMIT_BYTES) {
            fail('commit larger than supported limit');
        }
        return rest(commitUrl, { method: 'POST', body });
    }

    const groupName = id => 'projects/' + PROJECT + '/databases/(default)/documents/e2eeGroups/' + id;
    const meta = fields => Object.fromEntries(Object.entries(fields).map(([key, data]) =>
        [key, data.stringValue ?? (data.integerValue == null ? null : Number(data.integerValue))]));

    function groupData({ custodianUid, status, revision, handoverId }) {
        return {
            custodianUid, schemaVersion: 2, status, revision, handoverId
        };
    }

    function update(name, data, updateTime) {
        if (!updateTime) fail('missing document version');
        return {
            update: { name, fields: asFields(data) },
            currentDocument: { updateTime }
        };
    }

    async function freeze({ groupId, fromUid, handoverId }) {
        identifier(groupId);
        identifier(fromUid);
        identifier(handoverId);
        const groupDoc = await read(groupName(groupId));
        const current = meta(groupDoc.fields);
        if (current.schemaVersion !== 2 || current.custodianUid !== fromUid ||
            current.status !== 'active' || current.handoverId !== '') {
            fail('group is not active for this custodian');
        }
        await commit([update(groupDoc.name, groupData({
            ...current, status: 'frozen', handoverId
        }), groupDoc.updateTime)]);
        return true;
    }

    async function inspectFrozen({ groupId, fromUid, handoverId }) {
        identifier(groupId);
        const groupDoc = await read(groupName(groupId));
        const current = meta(groupDoc.fields);
        if (current.schemaVersion !== 2 || current.status !== 'frozen' ||
            current.custodianUid !== fromUid || current.handoverId !== handoverId) {
            fail('group is not frozen for this transfer');
        }
        const rows = (await Promise.all(COLLECTIONS.map(kind => list(groupId, kind)))).flat();
        if (rows.length < 1) fail('group has no records');
        const recovery = await read(groupDoc.name + '/recovery/current');
        return { groupDoc, current, rows, recovery };
    }

    async function dryRun({ groupId, fromUid, toUid, handoverId,
        encryptedRecords, recoveryEnvelope, approvals }) {
        identifier(groupId);
        identifier(fromUid);
        identifier(toUid);
        identifier(handoverId);
        if (toUid === fromUid) fail('new responsible must differ from previous');
        if (!approvals || approvals.backupRestored !== true ||
            approvals.recipientDecryptedAll !== true ||
            approvals.identityVerifiedOutsideApp !== true) {
            fail('backup restore, recipient decryption and identity approval required');
        }

        const snapshot = await inspectFrozen({ groupId, fromUid, handoverId });
        if (!Array.isArray(encryptedRecords) || encryptedRecords.length !== snapshot.rows.length ||
            encryptedRecords.length > MAX_RECORDS) fail('incomplete replacement snapshot');

        const oldKeys = new Set(snapshot.rows.map(r => r.collection + '/' + r.documentId));
        const newKeys = new Set();
        for (const row of encryptedRecords) {
            checkEnvelope(row, groupId);
            const key = row.collection + '/' + row.documentId;
            if (!oldKeys.has(key) || newKeys.has(key)) fail('missing, duplicate or extra record');
            newKeys.add(key);
        }
        checkRecovery(groupId, recoveryEnvelope);

        const byPath = new Map(snapshot.rows.map(row => [row.collection + '/' + row.documentId, row]));
        const writes = encryptedRecords.map(row => {
            const original = byPath.get(row.collection + '/' + row.documentId);
            return update(groupName(groupId) + '/' + row.collection + '/' + row.documentId,
                row.envelope, original.updateTime);
        });
        // Replace recovery metadata in the SAME atomic server commit.
        writes.push(update(snapshot.recovery.name, recoveryEnvelope, snapshot.recovery.updateTime));
        writes.push(update(snapshot.groupDoc.name, groupData({
            ...snapshot.current,
            custodianUid: toUid,
            revision: snapshot.current.revision + 1,
            status: 'active',
            handoverId: ''
        }), snapshot.groupDoc.updateTime));
        if (writes.length > 450) fail('too many writes for atomic cutover');
        if (encoder.encode(JSON.stringify({ writes })).length > MAX_COMMIT_BYTES) {
            fail('atomic cutover exceeds 9 MB');
        }
        return Object.freeze({ groupId, fromUid, toUid, handoverId,
            documentCount: encryptedRecords.length, writes });
    }

    async function apply(plan) {
        if (!plan || plan.groupId == null || !Array.isArray(plan.writes)) {
            fail('invalid dry-run plan');
        }
        // Before committing, verify a frozen state matching this transfer.
        // Conditional updateTime preconditions guard every existing document.
        await inspectFrozen(plan);
        await commit(plan.writes);
        return { groupId: plan.groupId, documentCount: plan.documentCount };
    }

    async function abort({ groupId, fromUid, handoverId }) {
        const s = await inspectFrozen({ groupId, fromUid, handoverId });
        await commit([update(s.groupDoc.name, groupData({
            ...s.current, status: 'active', handoverId: ''
        }), s.groupDoc.updateTime)]);
    }

    return Object.freeze({ freeze, dryRun, apply, abort });
}
