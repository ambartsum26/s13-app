/*
 * E2EE Firestore rules integration test — synthetic data + Firebase Emulators ONLY.
 * DO NOT point this test at a production Firebase project.
 *
 * firebase emulators:exec --config e2ee/firebase-prototype.json
 * --only firestore,auth --project demo-s13-e2ee "node e2ee/test-emulator.mjs"
 */
import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
    getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, deleteDoc, getDocs, collection
} from 'firebase/firestore';
import { createGroupVault, encryptDocument, recoverGroupVault, decryptDocument } from './crypto.js';
import { createEncryptedTerritoryService } from './territory-service.js';
import { createGroupFirestoreTransport } from './firestore-transport.js';

const projectId = 'demo-s13-e2ee';
const emulatorEnv = process.env.FIRESTORE_EMULATOR_HOST;
if (!emulatorEnv || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    throw new Error('Both Firebase emulators MUST be running. No production access permitted.');
}

const httpAddress = 'http://' + emulatorEnv;
const apps = [];

function appFor(name) {
    const app = initializeApp({
        projectId,
        apiKey: 'synthetic-firebase-api-key',
        authDomain: projectId + '.firebaseapp.com'
    }, name);
    apps.push(app);
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST, {
        disableWarnings: true
    });
    const db = getFirestore(app);
    const [host, port] = emulatorEnv.split(':');
    connectFirestoreEmulator(db, host, Number(port));
    return { auth, db };
}

async function seedGroup(groupId, ownerUid) {
    // The REST token "owner" is an emulator-only privileged seed. Application
    // clients are explicitly forbidden from creating group metadata by rules.
    const endpoint = httpAddress + '/v1/projects/' + projectId
        + '/databases/(default)/documents/e2eeGroups?documentId=' + groupId;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer owner',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                custodianUid: { stringValue: ownerUid },
                schemaVersion: { integerValue: '1' }
            }
        })
    });
    const body = await response.text();
    assert.equal(response.ok, true,
        'Emulator fixture failed (' + response.status + '): ' + body);
}

async function denied(action, purpose) {
    await assert.rejects(action, error => {
        assert.equal(error.code, 'permission-denied', purpose + ': ' + error.message);
        return true;
    }, purpose);
}

try {
    const first = appFor('synthetic-first-custodian');
    const second = appFor('synthetic-second-custodian');
    const firstCredential = await createUserWithEmailAndPassword(
        first.auth, 'group-a@example.test', 'SyntheticTestPassword-123'
    );
    const secondCredential = await createUserWithEmailAndPassword(
        second.auth, 'group-b@example.test', 'SyntheticTestPassword-456'
    );
    await seedGroup('group-a', firstCredential.user.uid);
    await seedGroup('group-b', secondCredential.user.uid);

    const vaultA = await createGroupVault('group-a');
    const vaultB = await createGroupVault('group-b');
    const pathA = { groupId: 'group-a', collection: 'territories', documentId: 'sample-01' };
    const pathB = { groupId: 'group-b', collection: 'territories', documentId: 'sample-02' };
    const originalA = {
        number: '12',
        history: [{ publisher: 'Personne Fictive', issuedAt: '2026-09-01', returnedAt: '2026-10-12' }]
    };
    const originalB = { number: '9', history: [] };
    const ciphertextA = await encryptDocument(vaultA.key, pathA, originalA);
    const ciphertextB = await encryptDocument(vaultB.key, pathB, originalB);

    const refA = doc(first.db, 'e2eeGroups', 'group-a', 'territories', 'sample-01');
    const refBOwned = doc(second.db, 'e2eeGroups', 'group-b', 'territories', 'sample-02');
    await setDoc(refA, ciphertextA);
    await setDoc(refBOwned, ciphertextB);
    assert.deepEqual(await decryptDocument(vaultA.key, pathA, (await getDoc(refA)).data()), originalA);
    assert.deepEqual(await decryptDocument(vaultB.key, pathB, (await getDoc(refBOwned)).data()), originalB);
    assert.equal((await getDocs(collection(first.db, 'e2eeGroups', 'group-a', 'territories'))).size, 1);
    assert.equal((await getDoc(doc(first.db, 'e2eeGroups', 'group-a'))).data().custodianUid, firstCredential.user.uid);

    const recoveryRef = doc(first.db, 'e2eeGroups', 'group-a', 'recovery', 'current');
    await setDoc(recoveryRef, vaultA.recoveryEnvelope);
    const recovered = await recoverGroupVault((await getDoc(recoveryRef)).data(), vaultA.recoveryCode);
    assert.deepEqual(await decryptDocument(recovered, pathA, (await getDoc(refA)).data()), originalA);
    console.log('PASS: each group owns encrypted documents; offline recovery envelope decrypts.');

    await denied(() => getDoc(doc(second.db, 'e2eeGroups', 'group-a')), 'second custodian sees group metadata');
    await denied(() => getDoc(doc(second.db, 'e2eeGroups', 'group-a', 'territories', 'sample-01')),
        'second custodian reads first group');
    await denied(() => getDocs(collection(second.db, 'e2eeGroups', 'group-a', 'territories')),
        'second custodian lists first group');
    await denied(() => setDoc(doc(first.db, 'e2eeGroups', 'group-b', 'territories', 'sample-02'), ciphertextB),
        'first custodian writes second group');
    await denied(() => getDoc(doc(second.db, 'e2eeGroups', 'group-a', 'recovery', 'current')),
        'second custodian reads recovery envelope');
    console.log('PASS: other group cannot read/list/write records or retrieve recovery metadata.');

    await denied(() => setDoc(doc(first.db, 'e2eeGroups', 'rogue'), {
        custodianUid: firstCredential.user.uid,
        schemaVersion: 1
    }), 'browser self-provisioning group');
    await denied(() => setDoc(doc(first.db, 'e2eeGroups', 'group-a', 'territories', 'plaintext'), {
        number: '12',
        publisher: 'Plaintext'
    }), 'plaintext record');
    await denied(() => setDoc(doc(first.db, 'e2eeGroups', 'group-a', 'territories', 'sample-01'), {
        ...ciphertextA,
        groupId: 'group-b'
    }), 'mismatched groupId field');
    await denied(() => setDoc(doc(first.db, 'e2eeGroups', 'group-a', 'territories', 'sample-01'), {
        ...ciphertextA,
        documentId: 'sample-02'
    }), 'mismatched documentId field');
    await denied(() => deleteDoc(refA), 'unauthorized deletion of territory history');
    await denied(() => getDocs(collection(first.db, 'e2eeGroups')), 'bulk enumeration of groups');
    console.log('PASS: plaintext/mismatched records, group creation and deletes are rejected.');

    // Encrypted application operations through REAL Firestore transactions.
    const contextFor = (collectionName, documentId) => ({
        groupId: 'group-a', collection: collectionName, documentId
    });
    const cityRef = doc(first.db, 'e2eeGroups', 'group-a', 'cities', 'test-city');
    const publisherRef = doc(first.db, 'e2eeGroups', 'group-a', 'publishers', 'test-person');
    await setDoc(cityRef, await encryptDocument(vaultA.key,
        contextFor('cities', 'test-city'), { name: 'Ville Fictive' }));
    await setDoc(publisherRef, await encryptDocument(vaultA.key,
        contextFor('publishers', 'test-person'), { fullName: 'Émile Fictif' }));
    const adapter = createGroupFirestoreTransport({
        auth: first.auth, db: first.db, groupId: 'group-a',
        custodianUid: firstCredential.user.uid
    });
    const encryptedService = createEncryptedTerritoryService({
        groupId: 'group-a', key: vaultA.key, transport: adapter
    });
    assert.equal((await encryptedService.searchPublishers('emile')).length, 1);

    // The existing sample was returned 2026-10-12, so 2027-10-12 is allowed.
    await encryptedService.issueTerritory({
        territoryId: 'sample-01', publisherId: 'test-person',
        issuedAt: '2027-10-12', historyId: 'new-issue'
    });
    const beforeReturn = await encryptedService.prepareS13({
        cityId: 'test-city', serviceYear: 2028
    });
    // Territory must be assigned to the city to appear in annual report.
    assert.equal(beforeReturn.territories.length, 0);

    await encryptedService.returnTerritory({
        territoryId: 'sample-01', returnedAt: '2027-11-01'
    });
    const saved = (await getDoc(refA)).data();
    assert.ok(!JSON.stringify(saved).includes('Émile Fictif'));
    assert.ok(!JSON.stringify(saved).includes('2027-10-12'));
    assert.equal((await decryptDocument(vaultA.key, pathA, saved)).history.length, 2);
    console.log('PASS: encrypted publisher search and transactional issue/return use real Firestore.');

    await signOut(first.auth);
    await denied(() => getDoc(refA), 'read after sign-out');
    await assert.rejects(() => encryptedService.searchPublishers('emile'), /Group session is not authorized/);
    adapter.close();
    console.log('PASS: sign-out revokes Firestore access.');
} finally {
    await Promise.allSettled(apps.map(deleteApp));
}
