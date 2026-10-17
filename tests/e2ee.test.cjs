const assert = require('node:assert/strict');

(async () => {
    // Node 24 provides Web Crypto globally; fallback also permits local testing.
    globalThis.crypto ??= require('node:crypto').webcrypto;
    const {
        createGroupVault,
        recoverGroupVault,
        encryptDocument,
        decryptDocument
    } = await import('../e2ee/crypto.js');

    const first = await createGroupVault('synthetic-group-a');
    const second = await createGroupVault('synthetic-group-b');
    const path = {
        groupId: 'synthetic-group-a',
        collection: 'territories',
        documentId: 'demo-001'
    };
    const record = {
        number: '42',
        publisher: 'Иван Тестовый',
        history: [{ issuedAt: '2026-09-01', returnedAt: '2026-10-12' }],
        note: 'Échantillon fictif'
    };

    assert.equal(first.key.extractable, false);
    assert.equal(first.key.algorithm.name, 'AES-GCM');
    assert.equal(first.key.algorithm.length, 256);
    assert.ok(first.recoveryCode.startsWith('S13R1-'));
    assert.equal(first.recoveryEnvelope.groupId, path.groupId);
    assert.ok(!JSON.stringify(first.recoveryEnvelope).includes(first.recoveryCode));

    const ciphertext = await encryptDocument(first.key, path, record);
    assert.equal(ciphertext.version, 1);
    assert.equal(ciphertext.kind, 's13-encrypted-document');
    assert.ok(!JSON.stringify(ciphertext).includes('Тестовый'));
    assert.ok(!JSON.stringify(ciphertext).includes('2026-09-01'));
    assert.deepEqual(await decryptDocument(first.key, path, ciphertext), record);
    console.log('PASS: data roundtrip, non-extractable key and no plaintext in Firestore envelope.');

    const newCiphertext = await encryptDocument(first.key, path, record);
    assert.notEqual(newCiphertext.nonce, ciphertext.nonce);
    assert.notEqual(newCiphertext.ciphertext, ciphertext.ciphertext);
    console.log('PASS: each encryption uses a fresh random nonce.');

    await assert.rejects(() => decryptDocument(second.key, path, ciphertext));
    await assert.rejects(() => decryptDocument(first.key, {
        ...path, groupId: 'synthetic-group-b'
    }, ciphertext));
    await assert.rejects(() => decryptDocument(first.key, {
        ...path, collection: 'publishers'
    }, ciphertext));
    await assert.rejects(() => decryptDocument(first.key, {
        ...path, documentId: 'demo-002'
    }, ciphertext));
    await assert.rejects(() => decryptDocument(first.key, path, {
        ...ciphertext, ciphertext: ((ciphertext.ciphertext[0] === 'A' ? 'B' : 'A') + ciphertext.ciphertext.slice(1))
    }));
    await assert.rejects(() => decryptDocument(first.key, path, {
        ...ciphertext, nonce: ((ciphertext.nonce[0] === 'A' ? 'B' : 'A') + ciphertext.nonce.slice(1))
    }));
    console.log('PASS: cross-group access, document swaps and ciphertext tampering are rejected.');

    const recovered = await recoverGroupVault(first.recoveryEnvelope, first.recoveryCode);
    assert.equal(recovered.extractable, false);
    assert.deepEqual(await decryptDocument(recovered, path, ciphertext), record);
    await assert.rejects(() => recoverGroupVault(first.recoveryEnvelope, second.recoveryCode));
    await assert.rejects(() => recoverGroupVault(first.recoveryEnvelope, 'password'));
    await assert.rejects(() => recoverGroupVault({
        ...first.recoveryEnvelope, groupId: 'synthetic-group-b'
    }, first.recoveryCode));
    await assert.rejects(() => recoverGroupVault({
        ...first.recoveryEnvelope,
        wrappedKey: first.recoveryEnvelope.wrappedKey.slice(0, -1) + 'A'
    }, first.recoveryCode));
    await assert.rejects(() => globalThis.crypto.subtle.exportKey('raw', recovered));
    console.log('PASS: offline recovery works; wrong recovery codes and modified envelopes fail.');

    await assert.rejects(() => createGroupVault(''));
    await assert.rejects(() => encryptDocument(recovered, {
        groupId: 'synthetic-group-a', collection: 'territories', documentId: '../invalid'
    }, record), /Invalid document identifier/);
    await assert.rejects(() => encryptDocument(recovered, path, null));
    console.log('PASS: malformed identifiers and invalid input are rejected.');
})().catch(error => {
    console.error('FAIL: E2EE prototype regression:', error);
    process.exitCode = 1;
});
