const assert = require('node:assert/strict');

(async () => {
    globalThis.crypto ??= require('node:crypto').webcrypto;
    const { createGroupVault, encryptDocument, decryptDocument } = await import('../e2ee/crypto.js');
    const { createE2eeSession } = await import('../e2ee/session.js');
    const { createTransferRequest, prepareEncryptedTransfer } = await import('../e2ee/handover.js');

    const groupId = 'demo-group';
    const oldUid = 'owner-old';
    const newUid = 'owner-new';
    const originalVault = await createGroupVault(groupId);
    const context = { groupId, collection: 'territories', documentId: 'territory-7' };
    const record = {
        number: '7',
        cityId: 'city-1',
        history: [{
            id: 'h-1', publisherId: 'p-1', publisher: 'Тестовый Возвещатель',
            issuedAt: '2025-09-01', returnedAt: '2025-09-08'
        }]
    };
    const sealed = await encryptDocument(originalVault.key, context, record);
    const pubContext = { groupId, collection: 'publishers', documentId: 'p-1' };
    const pubData = { fullName: 'Тестовый Возвещатель' };
    const encryptedPublisher = await encryptDocument(originalVault.key, pubContext, pubData);

    let observer;
    let transportClosed = 0;
    let fetchGate;
    let blockFetch = false;
    let readCounter = 0;
    const auth = { currentUser: { uid: oldUid } };
    const transport = {
        groupId,
        close() { transportClosed++; },
        async get(kind, id) {
            readCounter++;
            if (blockFetch) await new Promise(resolve => { fetchGate = resolve; });
            if (kind === 'cities') {
                return encryptDocument(originalVault.key,
                    { groupId, collection: 'cities', documentId: id }, { name: 'Test City' });
            }
            return null;
        },
        async list(kind) {
            if (kind !== 'publishers') return [];
            return [{ id: 'p-1', envelope: encryptedPublisher }];
        },
        async mutate() { throw new Error('not needed'); },
        async issue() { throw new Error('not needed'); }
    };
    const manager = createE2eeSession({
        auth, groupId, custodianUid: oldUid,
        loadRecoveryEnvelope: async () => originalVault.recoveryEnvelope,
        makeTransport: () => transport,
        subscribeAuth(callback) {
            observer = callback;
            return () => { observer = null; };
        }
    });
    assert.equal(manager.unlocked, false);
    await assert.rejects(() => manager.searchPublishers('тестовый'), { code: 's13/e2eeLocked' });
    await manager.unlockWithRecoveryCode(originalVault.recoveryCode);
    assert.equal(manager.unlocked, true);
    assert.deepEqual((await manager.searchPublishers('тестовый')).map(x => x.fullName),
        ['Тестовый Возвещатель']);
    manager.lock();
    assert.equal(manager.unlocked, false);
    assert.ok(transportClosed > 0);
    await assert.rejects(() => manager.searchPublishers('тестовый'), { code: 's13/e2eeLocked' });
    console.log('PASS: recovery code unlocks a private session; lock prevents later reads.');

    await manager.unlockWithRecoveryCode(originalVault.recoveryCode);
    blockFetch = true;
    const pendingRead = manager.readCity('city-1');
    while (!fetchGate) await new Promise(resolve => setImmediate(resolve));
    manager.lock();
    fetchGate();
    await assert.rejects(() => pendingRead, { code: 's13/e2eeLocked' });
    console.log('PASS: logout or lock suppresses data from an in-flight asynchronous read.');

    blockFetch = false;
    await manager.unlockWithRecoveryCode(originalVault.recoveryCode);
    auth.currentUser = null;
    observer(null);
    assert.equal(manager.unlocked, false);
    await assert.rejects(() => manager.readCity('city-1'), { code: 's13/e2eeLocked' });
    auth.currentUser = { uid: 'intruder' };
    await assert.rejects(() => manager.unlockWithRecoveryCode(originalVault.recoveryCode), { code: 's13/e2eeLocked' });
    auth.currentUser = { uid: oldUid };
    await assert.rejects(() => manager.unlockWithRecoveryCode('wrong-code'));
    assert.equal(manager.unlocked, false);
    await manager.unlockWithRecoveryCode(originalVault.recoveryCode);
    manager.close();
    assert.equal(observer, null);
    assert.equal(manager.unlocked, false);
    await assert.rejects(() => manager.unlockWithRecoveryCode(originalVault.recoveryCode), { code: 's13/e2eeLocked' });
    console.log('PASS: UID changes, bad recovery secrets, and disposal fail closed.');

    const recipient = await createTransferRequest({ groupId, newCustodianUid: newUid });
    const records = [
        { collection: 'territories', documentId: 'territory-7', envelope: sealed },
        { collection: 'publishers', documentId: 'p-1', envelope: encryptedPublisher }
    ];
    const transfer = await prepareEncryptedTransfer({
        groupId, currentCustodianUid: oldUid, currentKey: originalVault.key,
        request: recipient.request, records
    });
    assert.equal(transfer.toUid, newUid);
    assert.ok(!JSON.stringify(transfer).includes('Тестовый Возвещатель'));
    assert.ok(!JSON.stringify(transfer).includes(originalVault.recoveryCode));
    await assert.rejects(() => recipient.accept({ ...transfer, fromUid: 'fake-sender' }));
    const newVault = await recipient.accept(transfer);
    assert.equal(newVault.newCustodianUid, newUid);
    assert.equal(newVault.oldCustodianUid, oldUid);
    assert.notEqual(newVault.recoveryCode, originalVault.recoveryCode);
    assert.notEqual(newVault.recoveryEnvelope.wrappedKey, originalVault.recoveryEnvelope.wrappedKey);
    const newSealed = newVault.encryptedRecords.find(x => x.collection === 'territories');
    assert.deepEqual(await decryptDocument(newVault.newKey, context, newSealed.envelope), record);
    const newPublisher = newVault.encryptedRecords.find(x => x.collection === 'publishers');
    assert.deepEqual(await decryptDocument(newVault.newKey, pubContext, newPublisher.envelope), pubData);
    await assert.rejects(() => decryptDocument(originalVault.key, context, newSealed.envelope));
    await assert.rejects(() => recipient.accept(transfer), /consumed/);
    assert.ok(!JSON.stringify(newVault.encryptedRecords).includes('Тестовый Возвещатель'));
    console.log('PASS: new custodian creates their own key, preserves data and old key cannot decrypt new records.');

    const differentRecipient = await createTransferRequest({ groupId, newCustodianUid: 'other-person' });
    await assert.rejects(() => differentRecipient.accept(transfer), /mismatch/);
    await assert.rejects(() => prepareEncryptedTransfer({
        groupId, currentCustodianUid: oldUid, currentKey: originalVault.key,
        request: recipient.request, records: [records[0], records[0]]
    }), /Duplicate/);
    const corrupt = {
        ...transfer,
        ciphertext: (transfer.ciphertext[0] === 'A' ? 'B' : 'A') +
            transfer.ciphertext.slice(1)
    };
    const interrupted = await createTransferRequest({ groupId, newCustodianUid: newUid });
    await assert.rejects(() => interrupted.accept(corrupt), /mismatch/);
    console.log('PASS: swapped recipient, duplicate records, and mismatched transfer requests are rejected.');
})().catch(error => {
    console.error('FAIL: E2EE session and handover tests:', error);
    process.exitCode = 1;
});
