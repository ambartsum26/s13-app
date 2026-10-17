/*
 * Experimental end-to-end encryption core for the S-13 territory assistant.
 *
 * NOT connected to Firebase or the production UI. Use synthetic records only
 * until the group-access design, migration and recovery procedures are reviewed.
 * Runs in a secure-context browser through the built-in Web Crypto API.
 */

const VERSION = 1;
const RECOVERY_PREFIX = 'S13R1-';
const MAX_PLAINTEXT_BYTES = 500_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function cryptoApi() {
    const api = globalThis.crypto;
    if (!api || !api.subtle || !api.getRandomValues) {
        throw new Error('Web Crypto is required in a secure context.');
    }
    return api;
}

function randomBytes(length) {
    return cryptoApi().getRandomValues(new Uint8Array(length));
}

function encodeBase64Url(bytes) {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 16384) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value, maxBytes) {
    if (typeof value !== 'string' || !value || value.length > Math.ceil(maxBytes * 4 / 3) + 4 ||
        !/^[A-Za-z0-9_-]+$/.test(value)) {
        throw new Error('Invalid encoded data.');
    }
    let binary;
    try {
        binary = atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '='));
    } catch {
        throw new Error('Invalid encoded data.');
    }
    if (binary.length > maxBytes) throw new Error('Encoded data is too large.');
    const result = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) result[i] = binary.charCodeAt(i);
    if (encodeBase64Url(result) !== value) throw new Error('Invalid encoded data.');
    return result;
}

function checkGroupId(id) {
    if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(id)) {
        throw new Error('Invalid group identifier.');
    }
    return id;
}

function checkContext(context) {
    const groupId = checkGroupId(context?.groupId);
    const collection = context?.collection;
    const documentId = context?.documentId;
    if (typeof collection !== 'string' || !/^[a-z][A-Za-z0-9_-]{0,63}$/.test(collection)) {
        throw new Error('Invalid collection identifier.');
    }
    if (typeof documentId !== 'string' || !documentId || documentId.length > 256 || documentId.includes('/')) {
        throw new Error('Invalid document identifier.');
    }
    return { groupId, collection, documentId };
}

function documentAad(context) {
    return encoder.encode(JSON.stringify(['s13-e2ee', 'document', VERSION,
        context.groupId, context.collection, context.documentId]));
}

function recoveryAad(groupId) {
    return encoder.encode(JSON.stringify(['s13-e2ee', 'recovery', VERSION, groupId]));
}

function checkAesKey(key, usage) {
    if (!key || key.type !== 'secret' || key.algorithm?.name !== 'AES-GCM' ||
        key.algorithm.length !== 256 || !key.usages?.includes(usage)) {
        throw new Error('AES-256-GCM group key required.');
    }
}

async function importGroupKey(raw) {
    return cryptoApi().subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 },
        false, ['encrypt', 'decrypt']);
}

async function deriveRecoveryWrappingKey(recoverySecret, salt, groupId) {
    const subtle = cryptoApi().subtle;
    const ikm = await subtle.importKey('raw', recoverySecret, 'HKDF', false, ['deriveKey']);
    return subtle.deriveKey({
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: encoder.encode('s13-e2ee:recovery-wrap:v1:' + groupId)
    }, ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/**
 * Enrollment for ONE responsible per group.
 * Keep recoveryCode OFFLINE, separate from recoveryEnvelope.
 * recoveryEnvelope may be stored by the app; it does NOT contain the recovery code.
 */
export async function createGroupVault(groupId) {
    checkGroupId(groupId);
    const rawKey = randomBytes(32);
    const recoverySecret = randomBytes(32);
    const salt = randomBytes(32);
    const nonce = randomBytes(12);
    try {
        const wrappingKey = await deriveRecoveryWrappingKey(recoverySecret, salt, groupId);
        const ciphertext = await cryptoApi().subtle.encrypt({
            name: 'AES-GCM',
            iv: nonce,
            additionalData: recoveryAad(groupId),
            tagLength: 128
        }, wrappingKey, rawKey);
        const key = await importGroupKey(rawKey);
        return {
            key,
            recoveryCode: RECOVERY_PREFIX + encodeBase64Url(recoverySecret),
            recoveryEnvelope: {
                version: VERSION,
                kind: 's13-group-recovery',
                groupId,
                kdf: 'HKDF-SHA256',
                cipher: 'AES-256-GCM',
                salt: encodeBase64Url(salt),
                nonce: encodeBase64Url(nonce),
                wrappedKey: encodeBase64Url(new Uint8Array(ciphertext))
            }
        };
    } finally {
        rawKey.fill(0);
        recoverySecret.fill(0);
    }
}

/** Recover a non-extractable group CryptoKey using the owner's OFFLINE recovery code. */
export async function recoverGroupVault(recoveryEnvelope, recoveryCode) {
    const envelope = recoveryEnvelope;
    const groupId = checkGroupId(envelope?.groupId);
    if (envelope?.version !== VERSION || envelope.kind !== 's13-group-recovery' ||
        envelope.kdf !== 'HKDF-SHA256' || envelope.cipher !== 'AES-256-GCM') {
        throw new Error('Unsupported recovery envelope.');
    }
    if (typeof recoveryCode !== 'string' || !recoveryCode.startsWith(RECOVERY_PREFIX)) {
        throw new Error('Invalid recovery code.');
    }

    const recoverySecret = decodeBase64Url(recoveryCode.slice(RECOVERY_PREFIX.length), 32);
    if (recoverySecret.length !== 32) throw new Error('Invalid recovery code.');
    try {
        const salt = decodeBase64Url(envelope.salt, 32);
        const nonce = decodeBase64Url(envelope.nonce, 12);
        const wrappedKey = decodeBase64Url(envelope.wrappedKey, 48);
        if (salt.length !== 32 || nonce.length !== 12 || wrappedKey.length !== 48) {
            throw new Error('Invalid recovery envelope.');
        }
        const wrappingKey = await deriveRecoveryWrappingKey(recoverySecret, salt, groupId);
        const raw = new Uint8Array(await cryptoApi().subtle.decrypt({
            name: 'AES-GCM',
            iv: nonce,
            additionalData: recoveryAad(groupId),
            tagLength: 128
        }, wrappingKey, wrappedKey));
        try {
            if (raw.length !== 32) throw new Error('Invalid group key.');
            return await importGroupKey(raw);
        } finally {
            raw.fill(0);
        }
    } finally {
        recoverySecret.fill(0);
    }
}

/** Encrypt a JSON document; its identity is cryptographically bound as AAD. */
export async function encryptDocument(key, context, data) {
    checkAesKey(key, 'encrypt');
    const checked = checkContext(context);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Expected a JSON document object.');
    }
    const plaintext = encoder.encode(JSON.stringify(data));
    if (plaintext.length > MAX_PLAINTEXT_BYTES) throw new Error('Document is too large.');
    const nonce = randomBytes(12);
    try {
        const ciphertext = await cryptoApi().subtle.encrypt({
            name: 'AES-GCM',
            iv: nonce,
            additionalData: documentAad(checked),
            tagLength: 128
        }, key, plaintext);
        return {
            version: VERSION,
            kind: 's13-encrypted-document',
            cipher: 'AES-256-GCM',
            ...checked,
            nonce: encodeBase64Url(nonce),
            ciphertext: encodeBase64Url(new Uint8Array(ciphertext))
        };
    } finally {
        plaintext.fill(0);
    }
}

/** Expected context MUST come from the authorized, independently selected record path. */
export async function decryptDocument(key, context, envelope) {
    checkAesKey(key, 'decrypt');
    const checked = checkContext(context);
    if (envelope?.version !== VERSION || envelope.kind !== 's13-encrypted-document' ||
        envelope.cipher !== 'AES-256-GCM' || envelope.groupId !== checked.groupId ||
        envelope.collection !== checked.collection || envelope.documentId !== checked.documentId) {
        throw new Error('Encrypted document context mismatch.');
    }
    const nonce = decodeBase64Url(envelope.nonce, 12);
    const ciphertext = decodeBase64Url(envelope.ciphertext, 700_000);
    if (nonce.length !== 12 || ciphertext.length < 16) throw new Error('Invalid encrypted document.');
    const plaintext = new Uint8Array(await cryptoApi().subtle.decrypt({
        name: 'AES-GCM',
        iv: nonce,
        additionalData: documentAad(checked),
        tagLength: 128
    }, key, ciphertext));
    try {
        const data = JSON.parse(decoder.decode(plaintext));
        if (data === null || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Invalid decrypted document.');
        }
        return data;
    } finally {
        plaintext.fill(0);
    }
}
