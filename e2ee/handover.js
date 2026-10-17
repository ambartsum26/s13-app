/*
 * EXPERIMENTAL, OFFLINE handover between two devices with synthetic data.
 *
 * Recipient generates a non-exportable ECDH private key, sends their public
 * request, and must keep this page open. The current custodian encrypts a
 * snapshot under an ephemeral ECDH key. Recipient decrypts the snapshot and
 * creates an entirely NEW AES group key and recovery code on their device.
 *
 * NOT a production transfer workflow: sender authenticity, snapshot freeze,
 * privileged Firestore re-provisioning and atomic publication are NOT present.
 * ECDH encryption alone cannot prove who the sender is.
 */
import { createGroupVault, decryptDocument, encryptDocument } from './crypto.js';

const VERSION = 1;
const MAX_RECORDS = 1000;
const MAX_BYTES = 8_000_000;
const KINDS = new Set(['cities', 'territories', 'publishers', 'addressMarkers']);
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function api() {
    if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
        throw new Error('Secure-context Web Crypto required.');
    }
    return globalThis.crypto;
}

function encode(bytes) {
    let raw = '';
    for (let start = 0; start < bytes.length; start += 16384) {
        raw += String.fromCharCode(...bytes.subarray(start, start + 16384));
    }
    return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decode(value, limit) {
    if (typeof value !== 'string' || !value || value.length > Math.ceil(limit * 4 / 3) + 4 ||
        !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoded transfer field.');
    let decoded;
    try {
        decoded = atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '='));
    } catch {
        throw new Error('Invalid encoded transfer field.');
    }
    if (decoded.length > limit) throw new Error('Transfer field too large.');
    const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
    if (encode(bytes) !== value) throw new Error('Invalid encoded transfer field.');
    return bytes;
}

function identifier(value, label) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) {
        throw new Error('Invalid ' + label + '.');
    }
    return value;
}

function context(groupId, row) {
    if (!KINDS.has(row?.collection) || typeof row.documentId !== 'string' ||
        !row.documentId || row.documentId.length > 256 || row.documentId.includes('/')) {
        throw new Error('Invalid transfer document path.');
    }
    return { groupId, collection: row.collection, documentId: row.documentId };
}

function checkRows(rows) {
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > MAX_RECORDS) {
        throw new Error('Invalid transfer record count.');
    }
    const seen = new Set();
    for (const row of rows) {
        const key = row.collection + '/' + row.documentId;
        if (seen.has(key)) throw new Error('Duplicate transfer record.');
        seen.add(key);
    }
}

async function importPublic(encoded) {
    const raw = decode(encoded, 128);
    return api().subtle.importKey('spki', raw,
        { name: 'ECDH', namedCurve: 'P-256' }, false, []);
}

async function deriveKey(privateKey, publicKey, salt, groupId, toUid) {
    const bits = new Uint8Array(await api().subtle.deriveBits(
        { name: 'ECDH', public: publicKey }, privateKey, 256));
    try {
        const ikm = await api().subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
        return api().subtle.deriveKey({
            name: 'HKDF', hash: 'SHA-256', salt,
            info: encoder.encode(JSON.stringify(['s13-handover-key', VERSION, groupId, toUid]))
        }, ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    } finally {
        bits.fill(0);
    }
}

function additionalData(packageMeta, recipientPublicKey) {
    return encoder.encode(JSON.stringify([
        's13-handover-data', VERSION, packageMeta.groupId, packageMeta.fromUid,
        packageMeta.toUid, packageMeta.transferId, packageMeta.senderPublicKey,
        recipientPublicKey
    ]));
}

/** Recipient only: request has PUBLIC information; privateKey is closure-local. */
export async function createTransferRequest({ groupId, newCustodianUid }) {
    identifier(groupId, 'groupId');
    identifier(newCustodianUid, 'new custodian UID');
    const keys = await api().subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    const recipientPublicKey = encode(new Uint8Array(
        await api().subtle.exportKey('spki', keys.publicKey)));
    const request = Object.freeze({
        version: VERSION,
        kind: 's13-handover-request',
        groupId, toUid: newCustodianUid,
        transferId: encode(api().getRandomValues(new Uint8Array(24))),
        recipientPublicKey
    });
    let consumed = false;

    return Object.freeze({
        request,
        async accept(encryptedPackage) {
            if (consumed) throw new Error('Transfer request already consumed.');
            const meta = encryptedPackage;
            if (meta?.version !== VERSION || meta.kind !== 's13-handover-package' ||
                meta.groupId !== groupId || meta.toUid !== newCustodianUid ||
                meta.transferId !== request.transferId ||
                typeof meta.fromUid !== 'string' || !meta.fromUid ||
                meta.fromUid === newCustodianUid) {
                throw new Error('Transfer request/package mismatch.');
            }
            identifier(meta.fromUid, 'previous custodian UID');
            const senderPublicKey = await importPublic(meta.senderPublicKey);
            const salt = decode(meta.salt, 32);
            const nonce = decode(meta.nonce, 12);
            if (salt.length !== 32 || nonce.length !== 12) throw new Error('Invalid transfer nonce.');
            const key = await deriveKey(keys.privateKey, senderPublicKey, salt, groupId, newCustodianUid);
            const ciphertext = decode(meta.ciphertext, MAX_BYTES + 16);
            const plaintext = new Uint8Array(await api().subtle.decrypt({
                name: 'AES-GCM', iv: nonce,
                additionalData: additionalData(meta, recipientPublicKey),
                tagLength: 128
            }, key, ciphertext));
            try {
                const rows = JSON.parse(decoder.decode(plaintext));
                checkRows(rows);
                for (const row of rows) {
                    context(groupId, row);
                    if (row.data === null || typeof row.data !== 'object' || Array.isArray(row.data)) {
                        throw new Error('Invalid transfer record body.');
                    }
                }
                // Only the new custodian's device produces the successor key.
                const next = await createGroupVault(groupId);
                const encryptedRecords = [];
                for (const row of rows) {
                    encryptedRecords.push({
                        collection: row.collection,
                        documentId: row.documentId,
                        envelope: await encryptDocument(next.key, context(groupId, row), row.data)
                    });
                }
                consumed = true;
                return {
                    groupId,
                    oldCustodianUid: meta.fromUid,
                    newCustodianUid,
                    encryptedRecords,
                    recoveryEnvelope: next.recoveryEnvelope,
                    recoveryCode: next.recoveryCode,
                    newKey: next.key
                };
            } finally {
                plaintext.fill(0);
            }
        }
    });
}

/**
 * Existing responsible: decrypt a CONSISTENT snapshot and encrypt a package
 * to the recipient's PUBLIC request. This method never generates new owner's
 * key, never updates live Firestore, and does not transmit an offline code.
 */
export async function prepareEncryptedTransfer({
    groupId, currentCustodianUid, currentKey, request, records
}) {
    identifier(groupId, 'groupId');
    identifier(currentCustodianUid, 'current custodian UID');
    if (request?.version !== VERSION || request.kind !== 's13-handover-request' ||
        request.groupId !== groupId || request.toUid === currentCustodianUid) {
        throw new Error('Invalid recipient request.');
    }
    identifier(request.toUid, 'new custodian UID');
    const transferId = decode(request.transferId, 24);
    if (transferId.length !== 24) throw new Error('Invalid transfer ID.');
    const receiver = await importPublic(request.recipientPublicKey);
    checkRows(records);

    const clearRows = [];
    for (const row of records) {
        const checked = context(groupId, row);
        clearRows.push({
            collection: checked.collection,
            documentId: checked.documentId,
            data: await decryptDocument(currentKey, checked, row.envelope)
        });
    }
    const plaintext = encoder.encode(JSON.stringify(clearRows));
    if (plaintext.length > MAX_BYTES) throw new Error('Encrypted handover exceeds limit.');
    const sender = await api().subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    const salt = api().getRandomValues(new Uint8Array(32));
    const nonce = api().getRandomValues(new Uint8Array(12));
    const meta = {
        version: VERSION, kind: 's13-handover-package', groupId,
        fromUid: currentCustodianUid, toUid: request.toUid,
        transferId: request.transferId,
        senderPublicKey: encode(new Uint8Array(await api().subtle.exportKey('spki', sender.publicKey)))
    };
    try {
        const key = await deriveKey(sender.privateKey, receiver, salt, groupId, request.toUid);
        const ciphertext = await api().subtle.encrypt({
            name: 'AES-GCM', iv: nonce,
            additionalData: additionalData(meta, request.recipientPublicKey),
            tagLength: 128
        }, key, plaintext);
        return Object.freeze({
            ...meta, salt: encode(salt), nonce: encode(nonce),
            ciphertext: encode(new Uint8Array(ciphertext))
        });
    } finally {
        plaintext.fill(0);
    }
}
