const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto: crypto } = require('node:crypto');
const strip = source => source.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, '').replace(/^export /gm, '');
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

// Optimistic document store: concurrent commits invalidate every transaction
// read, including missing guard documents. No production Firebase calls.
function database() {
    const data = new Map(), versions = new Map();
    let sequence = 0, retries = 0;
    const put = (path, value) => {
        if (value === undefined) data.delete(path); else data.set(path, clone(value));
        versions.set(path, (versions.get(path) || 0) + 1);
    };
    const snapshot = ref => {
        const value = clone(data.get(ref.path));
        return { id: ref.id, exists: () => value !== undefined, data: () => clone(value) };
    };
    return {
        data, put, retries: () => retries,
        collection: (_, name) => ({ name }),
        doc: (base, name, id) => {
            const path = base.name ? `${base.name}/generated-${++sequence}` : `${name}/${id}`;
            return { path, id: path.split('/')[1] };
        },
        where: (field, op, value) => ({ field, value }),
        query: (source, filter) => ({ ...source, filter }),
        getDocsFromServer: async source => ({ docs: [...data.keys()]
            .filter(path => path.startsWith(source.name + '/'))
            .filter(path => !source.filter || data.get(path)[source.filter.field] === source.filter.value)
            .map(path => snapshot({ path, id: path.split('/')[1] })) }),
        runTransaction: async (_, callback) => {
            for (let attempt = 0; attempt < 10; attempt++) {
                const reads = new Map(), writes = [];
                const result = await callback({
                    get: async ref => {
                        assert.equal(writes.length, 0, 'Firestore requires all reads before writes');
                        reads.set(ref.path, versions.get(ref.path) || 0);
                        return snapshot(ref);
                    },
                    set: (ref, value) => writes.push(() => put(ref.path, value)),
                    update: (ref, value) => writes.push(() => {
                        assert.ok(data.has(ref.path));
                        put(ref.path, { ...data.get(ref.path), ...value });
                    }),
                    delete: ref => writes.push(() => put(ref.path, undefined))
                });
                if ([...reads].some(([path, version]) => (versions.get(path) || 0) !== version)) {
                    retries++;
                    continue;
                }
                writes.forEach(write => write());
                return result;
            }
            throw new Error('retry limit');
        }
    };
}

function dom() {
    const nodes = new Map();
    function element() {
        const classes = new Set(['hidden']);
        return {
            children: [], dataset: {}, value: '', textContent: '', innerHTML: '',
            classList: { contains: value => classes.has(value), add: value => classes.add(value),
                remove: value => classes.delete(value), toggle: (value, on) => on ? classes.add(value) : classes.delete(value) },
            focus() {}, addEventListener() {}, querySelectorAll() { return []; },
            append(...children) { children.forEach(child => this.insertBefore(child, null)); },
            insertBefore(child, before) {
                child.remove();
                const index = before ? this.children.indexOf(before) : this.children.length;
                this.children.splice(index, 0, child); child.parent = this;
            },
            remove() {
                if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
                this.parent = null;
            },
            replaceWith(next) { const parent = this.parent; parent.insertBefore(next, this); this.remove(); }
        };
    }
    const get = id => {
        if (!nodes.has(id)) nodes.set(id, element());
        return nodes.get(id);
    };
    return { get, document: { getElementById: get, createElement: element, querySelector: () => null,
        addEventListener() {}, documentElement: { lang: 'ru' } } };
}

function application(store) {
    const ui = dom(), alerts = [];
    const context = vm.createContext({ ...store, db: {}, crypto, console: { error() {} },
        requireOwner() {}, isOwner: () => true, document: ui.document, alert: text => alerts.push(text) });
    context.window = context;
    vm.runInContext('(function(){' + strip(fs.readFileSync('app-data.js', 'utf8')) +
        ';Object.assign(globalThis,{changeHistory,historyRecordIndex,validateHistory,saveUniqueRecord,updateExistingRecord,dataError});})()', context);
    vm.runInContext('(function(){' + strip(fs.readFileSync('app-core.js', 'utf8')) +
        ';globalThis.evaluateCore=code=>eval(code);})()', context);
    const seed = history => context.evaluateCore(`territories=${JSON.stringify([{ id: 'T', number: '1', history }])};historyTerritoryId='T';`);
    return { c: context, ui, alerts, seed };
}

const record = (publisher, issuedAt = '2020-01-01', returnedAt = '2020-02-01') => ({ publisher, issuedAt, returnedAt });
const history = store => store.data.get('territories/T').history;
const settle = () => new Promise(resolve => setImmediate(resolve));

(async () => {
    const store = database();
    const a = application(store), b = application(store);
    const old = record('Original');
    store.put('territories/T', { number: '1', history: [old] }); a.seed([old]);
    const editing = a.c.editHistory(0);
    store.put('territories/T', { number: '1', history: [old, record('Second tab', '2020-03-01', '2020-04-01')] });
    a.c.evaluateCore("dialogResolve(['Edited','01.01.2020','01.02.2020'])");
    await editing;
    assert.deepEqual(history(store).map(row => row.publisher), ['Edited', 'Second tab']);
    assert.ok(history(store).every(row => typeof row.id === 'string'));
    console.log('PASS: stale edit preserves additions from another tab; legacy records gain IDs.');

    const selected = clone(history(store)[1]);
    a.seed(history(store));
    const deleting = a.c.deleteHistory(1);
    await b.c.changeHistory('T', rows => rows.splice(0, 1));
    a.c.evaluateCore('confirmResolve(true)'); await deleting;
    assert.equal(history(store).length, 0);
    assert.equal(a.alerts.length, 0);
    console.log('PASS: delete follows record ID after an earlier row was removed.');

    store.put('territories/T', { history: [selected] }); a.seed([selected]);
    const conflicting = a.c.editHistory(0);
    await b.c.changeHistory('T', rows => { rows[0].publisher = 'Changed elsewhere'; });
    a.c.evaluateCore("dialogResolve(['Overwritten','01.01.2020','01.02.2020'])"); await conflicting;
    assert.equal(history(store)[0].publisher, 'Changed elsewhere');
    assert.match(a.alerts.pop(), /другой вкладке/);

    store.put('territories/T', { history: [old, old] });
    await assert.rejects(a.c.changeHistory('T', rows => rows.splice(a.c.historyRecordIndex(rows, old), 1)),
        { code: 's13/conflict' });
    assert.equal(history(store).length, 2);
    console.log('PASS: conflicting edits and ambiguous legacy duplicates are rejected safely.');

    store.put('territories/T', { history: [] });
    store.put('publishers/P', { fullName: 'Publisher' });
    for (const app of [a, b]) {
        app.seed([]);
        app.c.evaluateCore("publishers=[{id:'P',fullName:'Publisher'}]");
    }
    const firstIssue = a.c.issueTerritory('T'), secondIssue = b.c.issueTerritory('T');
    for (const app of [a, b]) app.c.evaluateCore("pickerResolve.resolve(publishers[0])");
    await Promise.all([firstIssue, secondIssue]);
    assert.equal(history(store).length, 1);
    assert.equal(a.alerts.length + b.alerts.length, 1);
    assert.ok(store.retries() > 0);
    a.seed(history(store)); await a.c.returnTerritory('T');
    assert.match(history(store)[0].returnedAt, /^\d{4}-\d{2}-\d{2}$/);
    console.log('PASS: simultaneous issue creates one assignment; return preserves its ID.');

    const create = app => app.c.saveUniqueRecord('publishers', { fullName: '  New   Person ', nameKey: 'new person' });
    const results = await Promise.allSettled([create(a), create(b)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.find(result => result.status === 'rejected').reason.code, 's13/publisherExists');
    store.put('publishers/legacy', { fullName: 'Legacy Person' });
    await assert.rejects(a.c.saveUniqueRecord('publishers', { fullName: 'legacy person' }), { code: 's13/publisherExists' });
    const legacy = { id: 'legacy', fullName: 'Legacy Person' };
    await a.c.saveUniqueRecord('publishers', { fullName: 'Legacy Renamed', nameKey: 'legacy renamed' }, legacy);
    await a.c.saveUniqueRecord('publishers', { fullName: 'Legacy Renamed' }, { id: 'legacy', fullName: 'Legacy Renamed' }, true);
    await a.c.saveUniqueRecord('publishers', { fullName: 'Legacy Renamed' });
    console.log('PASS: concurrent duplicates blocked; legacy rename, delete and name reuse work.');

    const territoryResults = await Promise.allSettled([a, b].map(app =>
        app.c.saveUniqueRecord('territories', { cityId: 'C', number: '7', history: [] })));
    assert.equal(territoryResults.filter(result => result.status === 'fulfilled').length, 1);
    await a.c.saveUniqueRecord('territories', { cityId: 'Other', number: '7', history: [] });
    console.log('PASS: territory number uniqueness is scoped to the city.');

    store.put('cities/C', { name: 'Original', mapUrl: 'old-map' });
    const cityNameResults = await Promise.allSettled([a, b].map((app, index) =>
        app.c.updateExistingRecord('cities', 'C', { name: `Name ${index}` }, { name: 'Original' })));
    assert.equal(cityNameResults.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(cityNameResults.find(result => result.status === 'rejected').reason.code, 's13/conflict');

    store.put('cities/C', { name: 'Original', mapUrl: 'old-map' });
    await Promise.all([
        a.c.updateExistingRecord('cities', 'C', { name: 'Renamed' }, { name: 'Original' }),
        b.c.updateExistingRecord('cities', 'C', { mapUrl: 'new-map' }, { mapUrl: 'old-map' })
    ]);
    assert.deepEqual(store.data.get('cities/C'), { name: 'Renamed', mapUrl: 'new-map' });
    console.log('PASS: same city field conflicts while unrelated city edits are merged.');

    const earlier = { id: 'H1', ...record('Earlier', '2025-01-01', '2025-02-01') };
    const later = { id: 'H2', ...record('Later', '2025-03-01', '2025-04-01') };
    store.put('territories/T', { history: [earlier, later] });
    a.seed([earlier, later]);
    const overlapEdit = a.c.editHistory(0);
    a.c.evaluateCore("dialogResolve(['Earlier','01.01.2025','15.03.2025'])");
    await overlapEdit;
    assert.equal(history(store)[0].returnedAt, '2025-02-01');
    assert.match(a.alerts.pop(), /пересекаются/);

    const broken = { id: 'BROKEN', publisher: 'Broken', issuedAt: 'not-a-date', returnedAt: null };
    store.put('territories/T', { history: [broken] });
    a.seed([broken]);
    await a.c.returnTerritory('T');
    assert.equal(history(store)[0].returnedAt, null);
    assert.match(a.alerts.pop(), /дату/);
    assert.doesNotThrow(() => a.c.evaluateCore("territories=[{id:'M',number:'9',history:{legacy:true}}];renderTerritories()"));
    console.log('PASS: overlapping and invalid dates are rejected; malformed legacy history does not break rendering.');

    const linked = { id: 'LINK', ...record('Old name', '2025-01-01', '2025-02-01') };
    store.put('territories/T', { history: [linked] });
    store.put('publishers/P2', { fullName: 'Demo ECHO', gender: 'male' });
    a.seed([linked]);
    a.c.evaluateCore("publishers=[{id:'P2',fullName:'Demo ECHO',gender:'male'}]");
    const linkEdit = a.c.editHistory(0);
    a.c.evaluateCore("dialogResolve(['Demo ECHO','01.01.2025','01.02.2025'])");
    await linkEdit;
    assert.equal(history(store)[0].publisherId, 'P2');
    console.log('PASS: choosing an existing publisher while editing history preserves its database ID.');

    store.put('territories/A', { history: [] });
    store.put('territories/B', { history: [] });
    store.put('publishers/NEW', { fullName: 'New Person', gender: 'male' });
    a.c.evaluateCore("territories=[{id:'A',number:'1',history:[]},{id:'B',number:'2',history:[]}];publishers=[{id:'NEW',fullName:'New Person',gender:'male'}]");
    const cancelledIssue = a.c.issueTerritory('A');
    const stalePickerSession = a.c.currentPublisherPickerSession();
    a.c.closePicker();
    await cancelledIssue;
    const currentIssue = a.c.issueTerritory('B');
    const currentPickerSession = a.c.currentPublisherPickerSession();
    assert.notEqual(currentPickerSession, stalePickerSession);
    assert.equal(a.c.selectPublisherForPickerSession(stalePickerSession, { id: 'NEW', fullName: 'New Person', gender: 'male' }), false);
    a.c.selectPublisherForPickerSession(currentPickerSession, { id: 'NEW', fullName: 'New Person', gender: 'male' });
    await currentIssue;
    assert.equal(store.data.get('territories/A').history.length, 0);
    assert.equal(store.data.get('territories/B').history.length, 1);
    console.log('PASS: a delayed publisher selection cannot affect a newer territory picker.');

    // Real render function: an unrelated update must preserve DOM identity.
    a.c.evaluateCore("territories=[{id:'A',number:'1',history:[]},{id:'B',number:'2',history:[]}];renderTerritories()");
    const grid = a.ui.get('grid'), originalA = grid.children[0], originalB = grid.children[1];
    a.c.evaluateCore("territories[1]={...territories[1],russianSpeakers:3};renderTerritories()");
    assert.equal(grid.children[0], originalA);
    assert.notEqual(grid.children[1], originalB);
    a.c.evaluateCore("territories.reverse();renderTerritories()");
    assert.equal(grid.children[1], originalA);
    a.c.evaluateCore("territories=[];renderTerritories()"); assert.equal(grid.children.length, 0);
    console.log('PASS: unchanged cards keep their DOM nodes; ordering and removal stay correct.');
    await settle();
})().catch(error => { console.error(error); process.exitCode = 1; });