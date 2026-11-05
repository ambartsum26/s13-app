/*
 * Firestore E2EE handover test with Firebase Emulators ONLY.
 * Project/host guards in emulator-cutover.mjs forbid production.
 */
import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import {
    createGroupVault, encryptDocument, decryptDocument, recoverGroupVault
} from './crypto.js';
import { createTransferRequest, prepareEncryptedTransfer } from './handover.js';
import { createEmulatorCutover } from './emulator-cutover.mjs';

const projectId = 'demo-s13-e2ee';
const host = process.env.FIRESTORE_EMULATOR_HOST;
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!host || !authHost || !/^(127\.0\.0\.1|localhost):[0-9]{2,5}$/.test(host)) {
    throw new Error('Both local Firebase emulators required.');
}
const base = 'http://' + host + '/v1/projects/' + projectId + '/databases/(default)/documents';
const apps = [];
function session(name) {
    const app = initializeApp({
        projectId, apiKey: 'synthetic-test-key', authDomain: projectId + '.firebaseapp.com'
    }, name);
    apps.push(app);
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://' + authHost, { disableWarnings: true });
    const db = getFirestore(app);
    const [hostname, port] = host.split(':');
    connectFirestoreEmulator(db, hostname, Number(port));
    return { auth, db };
}

function fields(data) {
    return Object.fromEntries(Object.entries(data).map(([key, value]) =>
        [key, Number.isInteger(value) ? { integerValue: String(value) } : { stringValue: value }]));
}

async function rest(url, options) {
    const response = await fetch(url, {
        ...options,
        headers: { Authorization: 'Bearer owner',
            ...(options?.body ? { 'Content-Type': 'application/json' } : {}) }
    });
    const data = await response.json();
    assert.ok(response.ok, 'fixture endpoint ' + response.status + ': ' + JSON.stringify(data));
    return data;
}

async function seedGroup(groupId, uid) {
    const url = base + '/e2eeGroups?documentId=' + groupId;
    await rest(url, { method: 'POST', body: JSON.stringify({
        fields: fields({
            schemaVersion: 2, custodianUid: uid,
            status: 'active', revision: 0, handoverId: ''
        })
    }) });
}

async function denied(action) {
    await assert.rejects(action, error => {
        assert.equal(error.code, 'permission-denied');
        return true;
    });
}

try {
    const owner = session('cutover-old');
    const recipient = session('cutover-new');
    const outsider = session('cutover-stranger');
    const oldUser = (await createUserWithEmailAndPassword(
        owner.auth, 'owner-cutover@example.test', 'SyntheticOwnerPassword-123')).user;
    const newUser = (await createUserWithEmailAndPassword(
        recipient.auth, 'recipient-cutover@example.test', 'SyntheticRecipientPassword-123')).user;
    await createUserWithEmailAndPassword(
        outsider.auth, 'outsider-cutover@example.test', 'SyntheticOutsiderPassword-123');

    const groupId = 'group-cutover';
    await seedGroup(groupId, oldUser.uid);
    const vault = await createGroupVault(groupId);
    const documents = [
        { collection: 'cities', documentId: 'city-1', data: { name: 'Ville Fictive' } },
        { collection: 'publishers', documentId: 'person-1', data: { fullName: 'Test Person' } },
        { collection: 'territories', documentId: 'territory-1', data: {
            cityId: 'city-1', number: '7', history: [{
                id: 'hist-1', publisher: 'Test Person',
                issuedAt: '2025-09-01', returnedAt: '2025-09-15'
            }]
        } }
    ];
    const encryptedRecords = [];
    for (const row of documents) {
        const envelope = await encryptDocument(vault.key, {
            groupId, collection: row.collection, documentId: row.documentId
        }, row.data);
        const ref = doc(owner.db, 'e2eeGroups', groupId, row.collection, row.documentId);
        await setDoc(ref, envelope);
        encryptedRecords.push({ collection: row.collection, documentId: row.documentId, envelope });
    }
    const recoveryRefOwner = doc(owner.db, 'e2eeGroups', groupId, 'recovery', 'current');
    await setDoc(recoveryRefOwner, vault.recoveryEnvelope);

    // Offline backup verified independently by decrypting copied ciphertext.
    const backup = structuredClone(encryptedRecords);
    const recoveryCopy = structuredClone(vault.recoveryEnvelope);
    const recoveryKey = await recoverGroupVault(recoveryCopy, vault.recoveryCode);
    const fromBackup = await decryptDocument(recoveryKey,
        { groupId, collection: 'territories', documentId: 'territory-1' },
        backup[2].envelope);
    assert.deepEqual(fromBackup, documents[2].data);
    console.log('PASS: backup rehearsal decrypts copied records before any freeze.');

    const requester = await createTransferRequest({
        groupId, newCustodianUid: newUser.uid
    });
    const packageForRecipient = await prepareEncryptedTransfer({
        groupId, currentCustodianUid: oldUser.uid, currentKey: vault.key,
        request: requester.request, records: encryptedRecords
    });
    const replacement = await requester.accept(packageForRecipient);
    assert.equal(replacement.encryptedRecords.length, documents.length);

    const cutover = createEmulatorCutover({ host, projectId });
    assert.throws(() => createEmulatorCutover({
        host: 'real.firebaseio.com:443', projectId
    }), /local demo/);
    assert.throws(() => createEmulatorCutover({
        host, projectId: 'some-real-firebase-project'
    }), /local demo/);

    const oldTerritory = doc(owner.db, 'e2eeGroups', groupId, 'territories', 'territory-1');
    const newTerritory = doc(recipient.db, 'e2eeGroups', groupId, 'territories', 'territory-1');
    await denied(() => getDoc(newTerritory));
    await cutover.freeze({
        groupId, fromUid: oldUser.uid, handoverId: requester.request.transferId
    });
    await denied(() => setDoc(oldTerritory, encryptedRecords[2].envelope));
    await denied(() => getDoc(newTerritory));
    assert.ok((await getDoc(oldTerritory)).exists());
    console.log('PASS: freeze prevents old owner writes while keeping encrypted backup readable.');

    // A trusted operator may cancel before cutover; it must not delete or rotate data.
    await cutover.abort({
        groupId, fromUid: oldUser.uid, handoverId: requester.request.transferId
    });
    await setDoc(oldTerritory, encryptedRecords[2].envelope);
    assert.deepEqual(await decryptDocument(vault.key, {
        groupId, collection: 'territories', documentId: 'territory-1'
    }, (await getDoc(oldTerritory)).data()), documents[2].data);
    await cutover.freeze({
        groupId, fromUid: oldUser.uid, handoverId: requester.request.transferId
    });

    const approvals = {
        backupRestored: true,
        recipientDecryptedAll: true,
        identityVerifiedOutsideApp: true
    };
    const candidate = {
        groupId, fromUid: oldUser.uid, toUid: newUser.uid,
        handoverId: requester.request.transferId,
        encryptedRecords: replacement.encryptedRecords,
        recoveryEnvelope: replacement.recoveryEnvelope,
        approvals
    };
    await assert.rejects(() => cutover.dryRun({
        ...candidate, approvals: { ...approvals, backupRestored: false }
    }), /approval|required/);
    await assert.rejects(() => cutover.dryRun({
        ...candidate, encryptedRecords: replacement.encryptedRecords.slice(1)
    }), /incomplete/);
    await assert.rejects(() => cutover.dryRun({
        ...candidate,
        encryptedRecords: [...replacement.encryptedRecords.slice(0, 2),
            { ...replacement.encryptedRecords[2], envelope: { publisher: 'OPEN TEXT' } }]
    }), /plaintext|invalid/);
    const plan = await cutover.dryRun(candidate);
    assert.equal(plan.documentCount, documents.length);
    assert.equal(plan.writes.length, documents.length + 2);
    console.log('PASS: dry-run demands restored backup, verified recipient and exact ciphertext set.');

    // Simulate a concurrent privileged mutation: it must NOT silently overwrite.
    const privilegedSnapshot = await rest(base + '/e2eeGroups/' + groupId +
        '/territories/territory-1');
    const mutated = await encryptDocument(vault.key, {
        groupId, collection: 'territories', documentId: 'territory-1'
    }, documents[2].data);
    await rest(base + ':commit', { method: 'POST', body: JSON.stringify({
        writes: [{ update: {
            name: privilegedSnapshot.name,
            fields: fields(mutated)
        }, currentDocument: { updateTime: privilegedSnapshot.updateTime } }]
    }) });
    await assert.rejects(() => cutover.apply(plan), /emulator request failed/);
    await denied(() => setDoc(oldTerritory, encryptedRecords[2].envelope));
    await denied(() => getDoc(newTerritory));
    const stillOld = await rest(base + '/e2eeGroups/' + groupId);
    assert.equal(stillOld.fields.custodianUid.stringValue, oldUser.uid);
    assert.equal(stillOld.fields.status.stringValue, 'frozen');
    console.log('PASS: stale snapshot blocks atomic cutover; old owner remains until deliberate retry.');

    const freshPlan = await cutover.dryRun(candidate);
    await cutover.apply(freshPlan);
    await denied(() => getDoc(oldTerritory));
    await denied(() => setDoc(oldTerritory, encryptedRecords[2].envelope));
    await denied(() => getDoc(doc(outsider.db, 'e2eeGroups', groupId, 'territories', 'territory-1')));

    const newSnapshot = (await getDoc(newTerritory)).data();
    const context = { groupId, collection: 'territories', documentId: 'territory-1' };
    assert.deepEqual(await decryptDocument(replacement.newKey, context, newSnapshot), documents[2].data);
    await assert.rejects(() => decryptDocument(vault.key, context, newSnapshot));
    const recoveredNewKey = await recoverGroupVault(
        (await getDoc(doc(recipient.db, 'e2eeGroups', groupId, 'recovery', 'current'))).data(),
        replacement.recoveryCode);
    assert.deepEqual(await decryptDocument(recoveredNewKey, context, newSnapshot), documents[2].data);

    const after = await rest(base + '/e2eeGroups/' + groupId);
    assert.equal(after.fields.custodianUid.stringValue, newUser.uid);
    assert.equal(after.fields.status.stringValue, 'active');
    assert.equal(Number(after.fields.revision.integerValue), 1);
    await setDoc(newTerritory, newSnapshot);
    await assert.rejects(() => cutover.apply(freshPlan), /frozen|emulator request failed/);
    // The previous offline backup still exists and is decryptable by the OLD key.
    assert.deepEqual(await decryptDocument(vault.key, context, backup[2].envelope), documents[2].data);
    console.log('PASS: atomic cutover moves server ownership and ciphertext to the new custodian.');
} finally {
    await Promise.allSettled(apps.map(x => deleteApp(x)));
}
