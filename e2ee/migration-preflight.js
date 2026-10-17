/*
 * EXPERIMENTAL, offline and read-only migration preflight.
 *
 * This module has NO Firebase SDK or network calls and NEVER writes to a DB.
 * Only synthetic fixtures may be used until a separate, approved import
 * workflow, snapshot consistency and independent security review exist.
 *
 * An encrypted archive MUST be kept separate from its offline recoveryCode.
 */
import { createGroupVault, encryptDocument, decryptDocument, recoverGroupVault } from './crypto.js';

const COLLECTIONS = Object.freeze(['cities', 'territories', 'publishers', 'addressMarkers']);
const MAX_ROWS = 400;
const MAX_ARCHIVE_BYTES = 8_000_000;
const MAX_ROW_BYTES = 500_000;
const encoder = new TextEncoder();

function failure(reason) {
    const error = new Error('E2EE preflight: ' + reason);
    error.code = 's13/migrationPreflight';
    throw error;
}

function groupIdValid(id) {
    return typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(id);
}

function rowKey(row) {
    if (!row || !COLLECTIONS.includes(row.collection) ||
        typeof row.documentId !== 'string' || !row.documentId ||
        row.documentId.length > 256 || row.documentId.includes('/')) {
        failure('unknown collection or invalid document ID');
    }
    return row.collection + '/' + row.documentId;
}

function validateJson(value, depth = 0) {
    if (depth > 32) failure('record nesting too deep');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            if (!Object.hasOwn(value, i)) failure('sparse arrays unsupported');
            validateJson(value[i], depth + 1);
        }
        return;
    }
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        const keys = Object.keys(value);
        for (const key of keys) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                failure('unsafe JSON field');
            }
            validateJson(value[key], depth + 1);
        }
        return;
    }
    failure('unsupported non-JSON field; convert Firestore types explicitly first');
}

function normalized(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function inspect(snapshot, expectedCounts = null) {
    if (!Array.isArray(snapshot) || snapshot.length === 0 || snapshot.length > MAX_ROWS) {
        failure('empty snapshot or more than 400 records');
    }
    const counts = Object.fromEntries(COLLECTIONS.map(kind => [kind, 0]));
    const byPath = new Set();
    const cities = new Set();
    const publishers = new Set();
    const territoryNumbers = new Set();
    const publisherNames = new Set();
    let historyEntries = 0;

    for (const row of snapshot) {
        const path = rowKey(row);
        if (byPath.has(path)) failure('duplicate document path');
        byPath.add(path);
        validateJson(row.data);
        if (row.data === null || Array.isArray(row.data) || typeof row.data !== 'object' ||
            Object.hasOwn(row.data, 'id')) {
            failure('record body is not a supported Firestore JSON map');
        }
        const bytes = encoder.encode(JSON.stringify(row.data)).length;
        if (bytes > MAX_ROW_BYTES) failure('document exceeds 500 KB before encryption');
        counts[row.collection]++;
        if (row.collection === 'cities') {
            if (typeof row.data.name !== 'string' || !row.data.name.trim()) failure('invalid city');
            cities.add(row.documentId);
        } else if (row.collection === 'publishers') {
            if (typeof row.data.fullName !== 'string' || !row.data.fullName.trim()) {
                failure('invalid publisher');
            }
            const nk = normalized(row.data.fullName);
            if (publisherNames.has(nk)) failure('duplicate publisher name');
            publisherNames.add(nk);
            publishers.add(row.documentId);
        }
    }
    for (const row of snapshot) {
        if (row.collection !== 'territories') continue;
        const territory = row.data;
        if (typeof territory.cityId !== 'string' || !cities.has(territory.cityId)) {
            failure('territory points to a missing city');
        }
        if (typeof territory.number !== 'string' && !Number.isSafeInteger(territory.number)) {
            failure('invalid territory number');
        }
        const tk = territory.cityId + '/' + normalized(territory.number);
        if (territoryNumbers.has(tk)) failure('duplicate territory number inside city');
        territoryNumbers.add(tk);
        const history = territory.history ?? [];
        if (!Array.isArray(history)) failure('invalid history list');
        historyEntries += history.length;
        for (const row of history) {
            if (!row || typeof row !== 'object' || Array.isArray(row) ||
                typeof row.publisher !== 'string' ||
                typeof row.issuedAt !== 'string' ||
                (row.returnedAt != null && typeof row.returnedAt !== 'string')) {
                failure('unrecognized history record');
            }
            // A removed legacy publisher is not automatically recreated.
            // The original history string and publisherId are preserved verbatim.
        }
    }
    if (expectedCounts) {
        if (!expectedCounts || typeof expectedCounts !== 'object' ||
            Object.keys(expectedCounts).length !== COLLECTIONS.length) {
            failure('incomplete expected collection inventory');
        }
        for (const kind of COLLECTIONS) {
            if (!Number.isSafeInteger(expectedCounts[kind]) ||
                expectedCounts[kind] !== counts[kind]) {
                failure('snapshot count differs from independent inventory: ' + kind);
            }
        }
    }
    return Object.freeze({
        documentCount: snapshot.length,
        counts: Object.freeze(counts),
        historyEntries
    });
}

function ordered(snapshot) {
    return [...snapshot].sort((a, b) => rowKey(a).localeCompare(rowKey(b), 'en'));
}

async function sha256(value) {
    const bytes = encoder.encode(value);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    return [...digest].map(b => b.toString(16).padStart(2, '0')).join('');
}

function manifestBody(groupId, rows, recoveryEnvelope, inventory) {
    return JSON.stringify({
        version: 1,
        groupId,
        encryptedRecords: rows,
        recoveryEnvelope,
        inventory
    });
}

function validateArchiveShape(archive) {
    if (!archive || archive.version !== 1 || archive.kind !== 's13-encrypted-backup' ||
        !groupIdValid(archive.groupId) || !Array.isArray(archive.encryptedRecords) ||
        archive.encryptedRecords.length === 0 || archive.encryptedRecords.length > MAX_ROWS ||
        typeof archive.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(archive.sha256) ||
        !archive.recoveryEnvelope || !archive.inventory) {
        failure('invalid encrypted backup manifest');
    }
    const paths = new Set();
    for (const row of archive.encryptedRecords) {
        const path = rowKey(row);
        if (paths.has(path)) failure('duplicate encrypted document');
        paths.add(path);
        const e = row.envelope;
        if (!e || e.version !== 1 || e.kind !== 's13-encrypted-document' ||
            e.cipher !== 'AES-256-GCM' || e.groupId !== archive.groupId ||
            e.collection !== row.collection || e.documentId !== row.documentId ||
            typeof e.nonce !== 'string' || typeof e.ciphertext !== 'string') {
            failure('invalid encrypted record envelope');
        }
        if (Object.keys(row).sort().join() !== 'collection,documentId,envelope') {
            failure('archive contains unexpected record fields');
        }
    }
    if (encoder.encode(JSON.stringify(archive)).length > MAX_ARCHIVE_BYTES) {
        failure('encrypted backup exceeds 8 MB');
    }
}

export function inspectLegacySnapshot(snapshot, expectedCounts) {
    return inspect(snapshot, expectedCounts);
}

/**
 * No reads or writes to Firebase. Returns a secret recoveryCode ONLY to the
 * in-memory caller, plus a separate encrypted archive that does not hold it.
 */
export async function prepareMigrationPreview({ groupId, snapshot, expectedCounts }) {
    if (!groupIdValid(groupId)) failure('invalid group ID');
    const inventory = inspect(snapshot, expectedCounts);
    const vault = await createGroupVault(groupId);
    const encryptedRecords = [];
    for (const row of ordered(snapshot)) {
        const { collection, documentId, data } = row;
        const envelope = await encryptDocument(vault.key,
            { groupId, collection, documentId }, data);
        encryptedRecords.push({ collection, documentId, envelope });
    }
    const archive = {
        version: 1, kind: 's13-encrypted-backup', groupId,
        encryptedRecords, recoveryEnvelope: vault.recoveryEnvelope,
        inventory, sha256: await sha256(manifestBody(
            groupId, encryptedRecords, vault.recoveryEnvelope, inventory))
    };
    validateArchiveShape(archive);
    const restored = await restoreMigrationPreview({ archive, recoveryCode: vault.recoveryCode });
    const source = ordered(snapshot);
    for (let i = 0; i < source.length; i++) {
        if (rowKey(source[i]) !== rowKey(restored.records[i]) ||
            JSON.stringify(source[i].data) !== JSON.stringify(restored.records[i].data)) {
            failure('encrypted restoration differs from source');
        }
    }
    return Object.freeze({ archive, recoveryCode: vault.recoveryCode, inventory });
}

/** Verify ciphertext integrity and fully restore *in memory*, never to Firestore. */
export async function restoreMigrationPreview({ archive, recoveryCode }) {
    validateArchiveShape(archive);
    const digest = await sha256(manifestBody(
        archive.groupId, archive.encryptedRecords, archive.recoveryEnvelope,
        archive.inventory));
    if (digest !== archive.sha256) failure('encrypted archive checksum mismatch');
    const key = await recoverGroupVault(archive.recoveryEnvelope, recoveryCode);
    const records = [];
    for (const row of archive.encryptedRecords) {
        const data = await decryptDocument(key, {
            groupId: archive.groupId,
            collection: row.collection,
            documentId: row.documentId
        }, row.envelope);
        records.push({ collection: row.collection, documentId: row.documentId, data });
    }
    const inventory = inspect(records, archive.inventory.counts);
    if (inventory.documentCount !== archive.inventory.documentCount ||
        inventory.historyEntries !== archive.inventory.historyEntries) {
        failure('restored record or assignment count mismatch');
    }
    return { records, inventory };
}
