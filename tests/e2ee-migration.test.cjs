const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    globalThis.crypto ??= require('node:crypto').webcrypto;
    const {
        inspectLegacySnapshot, prepareMigrationPreview, restoreMigrationPreview
    } = await import('../e2ee/migration-preflight.js');
    const source = [
        { collection: 'cities', documentId: 'ville-a',
            data: { name: 'Ville Exemple', mapUrl: 'https://maps.google.com/test' } },
        { collection: 'cities', documentId: 'ville-b',
            data: { name: 'Autre Ville', mapUrl: '' } },
        { collection: 'publishers', documentId: 'publisher-1',
            data: { fullName: 'Émile Fictif', gender: 'male', createdAt: '2025-06-18' } },
        { collection: 'publishers', documentId: 'publisher-2',
            data: { fullName: 'Иван Пример', nameKey: 'иван пример' } },
        { collection: 'territories', documentId: 'territory-1',
            data: { cityId: 'ville-a', number: '1', mapUrl: 'https://maps.google.com/test-1',
                history: [
                    { publisher: 'Ancien Fictif', issuedAt: '2024-09-01', returnedAt: '2024-10-01' },
                    { publisherId: 'publisher-1', publisher: 'Émile Fictif',
                        issuedAt: '2025-09-01', returnedAt: '2025-10-17' }
                ], russianSpeakers: 2 } },
        { collection: 'territories', documentId: 'territory-2',
            data: { cityId: 'ville-a', number: '2', history: [
                { publisherId: 'publisher-2', publisher: 'Иван Пример',
                    issuedAt: '2026-10-17', returnedAt: null }
            ] } },
        { collection: 'addressMarkers', documentId: 'marker-1',
            data: { cityId: 'ville-a', territoryId: 'territory-1',
                street: 'Rue Exemple', houseNumber: '12' } }
    ];
    const sourceFrozen = structuredClone(source);
    const counts = { cities: 2, territories: 2, publishers: 2, addressMarkers: 1 };
    const inventory = inspectLegacySnapshot(source, counts);
    assert.equal(inventory.documentCount, 7);
    assert.equal(inventory.historyEntries, 3);
    assert.deepEqual(inventory.counts, counts);
    const result = await prepareMigrationPreview({
        groupId: 'synthetic-migration-group',
        snapshot: source, expectedCounts: counts
    });
    assert.deepEqual(source, sourceFrozen, 'preflight must not mutate source');
    assert.equal(result.archive.encryptedRecords.length, 7);
    assert.equal(result.archive.inventory.historyEntries, 3);
    assert.ok(result.recoveryCode.startsWith('S13R1-'));
    const rawArchive = JSON.stringify(result.archive);
    assert.ok(!rawArchive.includes(result.recoveryCode));
    for (const phrase of ['Émile Fictif', 'Rue Exemple', 'Иван Пример', '2024-09-01']) {
        assert.ok(!rawArchive.includes(phrase), 'Archive must contain ciphertext only');
    }
    const restored = await restoreMigrationPreview({
        archive: JSON.parse(rawArchive),
        recoveryCode: result.recoveryCode
    });
    const keyFor = row => row.collection + '/' + row.documentId;
    assert.deepEqual(new Map(restored.records.map(row => [keyFor(row), row.data])),
        new Map(source.map(row => [keyFor(row), row.data])));
    console.log('PASS: legacy snapshot is preserved through encrypted offline archive/recovery.');

    const altered = structuredClone(result.archive);
    altered.encryptedRecords[0].envelope.ciphertext =
        (altered.encryptedRecords[0].envelope.ciphertext[0] === 'A' ? 'B' : 'A') +
        altered.encryptedRecords[0].envelope.ciphertext.slice(1);
    await assert.rejects(() => restoreMigrationPreview({
        archive: altered, recoveryCode: result.recoveryCode
    }), /checksum mismatch/);
    await assert.rejects(() => restoreMigrationPreview({
        archive: result.archive, recoveryCode: 'fake'
    }));
    const removed = structuredClone(result.archive);
    removed.encryptedRecords.pop();
    await assert.rejects(() => restoreMigrationPreview({
        archive: removed, recoveryCode: result.recoveryCode
    }), /checksum mismatch/);
    console.log('PASS: changed/missing ciphertext and wrong recovery code reject restoration.');

    function badFixture(edit) {
        const rows = structuredClone(source);
        edit(rows);
        return rows;
    }
    const testFailure = (snapshot, expectedMessage) => {
        assert.throws(() => inspectLegacySnapshot(snapshot, counts), expectedMessage);
    };
    testFailure(badFixture(rows => rows.pop()), /inventory/);
    testFailure(badFixture(rows => rows.push(structuredClone(rows[0]))), /duplicate/);
    testFailure(badFixture(rows => { rows[4].data.cityId = 'missing-city'; }), /missing city/);
    testFailure(badFixture(rows => { rows[5].data.number = '1'; }), /duplicate territory/);
    testFailure(badFixture(rows => { rows[2].data.fullName = 'ИВАН  ПРИМЕР'; }), /duplicate publisher/);
    testFailure(badFixture(rows => { rows[4].data.history[0].issuedAt = '2024-02-31'; }), /malformed history/);
    testFailure(badFixture(rows => { rows[4].data.history[1].issuedAt = '2024-09-15'; }), /overlapping/);
    testFailure(badFixture(rows => { rows[4].data.history[0].returnedAt = '2024-08-31'; }), /return precedes/);
    testFailure(badFixture(rows => { rows[4].data.history = 'corrupt'; }), /invalid history/);
    testFailure(badFixture(rows => { rows[0].data.randomNumber = Infinity; }), /non-JSON/);
    testFailure(badFixture(rows => { rows[0].data.mapUrl = undefined; }), /non-JSON/);
    testFailure(badFixture(rows => { rows[0].data.name = 'x'.repeat(500_001); }), /500 KB/);
    testFailure(badFixture(rows => { rows[0].collection = 'appLocks'; }), /unknown collection/);
    assert.throws(() => inspectLegacySnapshot([
        { collection: 'cities', documentId: 'a', data: { name: 'A' } }
    ], counts), /inventory/);
    assert.throws(() => inspectLegacySnapshot([
        { collection: 'cities', documentId: 'a', data: { name: 'A' } }
    ], { cities: 1 }), /incomplete expected/);
    await assert.rejects(() => prepareMigrationPreview({
        groupId: 'synthetic-migration-group', snapshot: source
    }), /independent collection inventory/);
    console.log('PASS: incomplete snapshots, legacy conflicts, malformed dates and unsupported types fail closed.');

    const content = fs.readFileSync('e2ee/migration-preflight.js', 'utf8');
    assert.ok(!content.includes('firebase/firestore'));
    assert.ok(!content.includes('firebase-admin'));
    assert.ok(!content.includes('getDocs('));
    assert.ok(!content.includes('setDoc('));
    assert.ok(!content.includes('runTransaction('));
    console.log('PASS: migration preflight remains an offline tool without DB access.');
})().catch(error => {
    console.error('FAIL: synthetic migration preflight:', error);
    process.exitCode = 1;
});
