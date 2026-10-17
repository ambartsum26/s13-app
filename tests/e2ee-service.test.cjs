const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

(async () => {
    globalThis.crypto ??= require('node:crypto').webcrypto;
    const { createGroupVault, encryptDocument, decryptDocument } = await import('../e2ee/crypto.js');
    const { createEncryptedTerritoryService, validateTerritoryHistory } = await import('../e2ee/territory-service.js');

    function store(groupId) {
        const database = new Map();
        const versions = new Map();
        let retries = 0;
        const path = (kind, id) => groupId + '/' + kind + '/' + id;
        const snapshot = (kind, id) => structuredClone(database.get(path(kind, id)) ?? null);
        const version = (kind, id) => versions.get(path(kind, id)) ?? 0;
        const save = (kind, id, envelope) => {
            database.set(path(kind, id), structuredClone(envelope));
            versions.set(path(kind, id), version(kind, id) + 1);
        };

        async function transaction(reads, transform, targetKind, targetId) {
            for (let n = 0; n < 15; n++) {
                const taken = reads.map(([kind, id]) => ({
                    kind, id, version: version(kind, id), envelope: snapshot(kind, id)
                }));
                const updated = await transform(...taken.map(row => row.envelope));
                // Allow another transaction to commit, as Firestore does.
                await new Promise(resolve => setImmediate(resolve));
                if (taken.some(row => version(row.kind, row.id) !== row.version)) {
                    retries++;
                    continue;
                }
                save(targetKind, targetId, updated);
                return;
            }
            throw new Error('transaction retries exhausted');
        }

        return {
            groupId, database, retries: () => retries, snapshot,
            seed(kind, id, envelope) { save(kind, id, envelope); },
            async get(kind, id) { return snapshot(kind, id); },
            async list(kind) {
                return [...database.entries()].filter(([key]) => key.startsWith(groupId + '/' + kind + '/'))
                    .map(([pathKey, envelope]) => ({ id: pathKey.split('/')[2], envelope: structuredClone(envelope) }));
            },
            async mutate(kind, id, fn) {
                return transaction([[kind, id]], fn, kind, id);
            },
            async issue(territoryId, publisherId, fn) {
                return transaction([['territories', territoryId], ['publishers', publisherId]],
                    fn, 'territories', territoryId);
            }
        };
    }

    const vaultA = await createGroupVault('group-a');
    const vaultB = await createGroupVault('group-b');
    const database = store('group-a');
    async function seed(kind, id, record) {
        database.seed(kind, id, await encryptDocument(vaultA.key, {
            groupId: 'group-a', collection: kind, documentId: id
        }, record));
    }

    await seed('cities', 'ville-a', { name: 'Ville test' });
    await seed('cities', 'ville-b', { name: 'Autre ville' });
    await seed('publishers', 'person-1', { fullName: 'Émile Test' });
    await seed('publishers', 'person-2', { fullName: 'Иван Пример' });
    await seed('territories', 'sector-1', { cityId: 'ville-a', number: '2', history: [
        { id: 'old-1', publisher: 'Ancien Test', issuedAt: '2025-07-01', returnedAt: '2025-08-31' }
    ] });
    await seed('territories', 'sector-2', { cityId: 'ville-a', number: '10', history: [
        { id: 'carry', publisher: 'Carried Test', issuedAt: '2025-08-25', returnedAt: '2025-09-01' }
    ] });
    await seed('territories', 'sector-other', { cityId: 'ville-b', number: '1', history: [] });

    const service = createEncryptedTerritoryService({
        groupId: 'group-a', key: vaultA.key, transport: database
    });

    assert.deepEqual((await service.searchPublishers('emile')).map(p => p.fullName), ['Émile Test']);
    assert.deepEqual((await service.searchPublishers('иван')).map(p => p.fullName), ['Иван Пример']);
    assert.deepEqual((await service.listTerritories('ville-a')).map(t => t.number), ['2', '10']);
    assert.equal((await service.readCity('ville-a')).name, 'Ville test');
    assert.ok(!JSON.stringify([...database.database]).includes('Émile Test'));
    assert.ok(!JSON.stringify([...database.database]).includes('Carried Test'));
    console.log('PASS: client-side search and territory lists decrypt locally; stored records have no plaintext.');

    const base = {
        territoryId: 'sector-1', publisherId: 'person-1',
        issuedAt: '2026-09-01'
    };
    const attempts = await Promise.allSettled([
        service.issueTerritory({ ...base, historyId: 'issue-one' }),
        service.issueTerritory({ ...base, historyId: 'issue-two' })
    ]);
    assert.equal(attempts.filter(x => x.status === 'fulfilled').length, 1);
    assert.equal(attempts.filter(x => x.status === 'rejected').length, 1);
    assert.equal(attempts.find(x => x.status === 'rejected').reason.code, 's13/alreadyIssued');
    assert.ok(database.retries() > 0);
    let current = (await service.listTerritories('ville-a')).find(x => x.id === 'sector-1');
    assert.equal(current.history.length, 2);
    assert.equal(current.history[1].publisher, 'Émile Test');

    await assert.rejects(
        () => service.returnTerritory({ territoryId: 'sector-1', returnedAt: '2026-08-31' }),
        { code: 's13/returnBeforeIssue' }
    );
    await service.returnTerritory({ territoryId: 'sector-1', returnedAt: '2026-10-10' });
    await assert.rejects(
        () => service.returnTerritory({ territoryId: 'sector-1', returnedAt: '2026-10-11' }),
        { code: 's13/notIssued' }
    );
    await assert.rejects(
        () => service.issueTerritory({
            territoryId: 'sector-1', publisherId: 'person-1',
            issuedAt: '2027-10-09', historyId: 'too-early'
        }), { code: 's13/cantIssue' }
    );
    await service.issueTerritory({
        territoryId: 'sector-1', publisherId: 'person-1',
        issuedAt: '2027-10-10', historyId: 'after-cooldown'
    });
    assert.equal((await service.listTerritories('ville-a'))[0].history.length, 3);
    console.log('PASS: encrypted transactional issue/return, concurrent conflicts and 1-year cooldown.');

    const data = await service.prepareS13({ cityId: 'ville-a', serviceYear: 2026 });
    assert.equal(data.serviceYear, 2026);
    assert.equal(data.city.name, 'Ville test');
    const sector1 = data.territories.find(x => x.id === 'sector-1');
    const sector2 = data.territories.find(x => x.id === 'sector-2');
    assert.equal(sector1.history.length, 0);
    assert.equal(sector1.previousCompletion, '2025-08-31');
    assert.equal(sector2.history.length, 1);
    assert.equal(sector2.history[0].publisher, 'Carried Test');
    assert.ok(!data.territories.some(x => x.cityId === 'ville-b'));

    // Verify unchanged production S-13 renderer accepts locally decrypted data.
    const strip = source => source.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, '');
    const renderer = vm.createContext({
        window: {}, getFirestore: () => ({}), getApps: () => [],
        sessionStorage: { getItem: () => null }
    });
    vm.runInContext(strip(fs.readFileSync('s13-export.js', 'utf8')), renderer);
    const html = renderer.makeDocument(data.city, data.territories, data.serviceYear);
    assert.match(html, /REGISTRE D’ATTRIBUTION DES TERRITOIRES/);
    assert.match(html, /Année de service :<\/b> 2026/);
    assert.match(html, /Carried Test/);
    assert.match(html, /31\/08\/2025/);
    assert.ok(!html.includes('Émile Test'));
    console.log('PASS: locally decrypted annual data works with existing S-13 document renderer.');

    const rawEnvelope = database.snapshot('territories', 'sector-1');
    assert.ok(!JSON.stringify(rawEnvelope).includes('2026-10-10'));
    const corruptEnvelope = { ...rawEnvelope, groupId: 'group-b' };
    database.seed('territories', 'sector-1', corruptEnvelope);
    await assert.rejects(() => service.listTerritories('ville-a'), /context mismatch/);
    await assert.rejects(() => service.prepareS13({ cityId: 'ville-a', serviceYear: 2026 }));
    database.seed('territories', 'sector-1', rawEnvelope);
    assert.equal((await service.listTerritories('ville-a')).length, 2);
    console.log('PASS: corrupted ciphertext aborts search/report instead of silently omitting records.');

    const otherGroupStore = store('group-b');
    await assert.rejects(
        () => createEncryptedTerritoryService({
            groupId: 'group-a', key: vaultA.key, transport: otherGroupStore
        }), { code: 's13/invalidTransport' }
    );
    const otherService = createEncryptedTerritoryService({
        groupId: 'group-b', key: vaultB.key, transport: otherGroupStore
    });
    assert.deepEqual(await otherService.searchPublishers(''), []);
    assert.throws(() => validateTerritoryHistory([{
        issuedAt: '2026-09-31', returnedAt: null
    }]), { code: 's13/invalidDate' });
    assert.throws(() => validateTerritoryHistory([
        { issuedAt: '2026-09-01', returnedAt: null },
        { issuedAt: '2026-09-02', returnedAt: null }
    ]), { code: 's13/historyOverlap' });
    console.log('PASS: cross-group store mismatch and invalid history are rejected.');
})().catch(error => {
    console.error('FAIL: encrypted application adapter:', error);
    process.exitCode = 1;
});
