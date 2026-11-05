/*
 * EXPERIMENTAL Firebase transport for encrypted group records. NOT imported
 * by app.js and not deployed to production. Server rules remain authoritative.
 */
import {
    collection, doc, getDocFromServer, getDocsFromServer, runTransaction
} from 'firebase/firestore';

const KINDS = new Set(['cities', 'territories', 'publishers']);

export function createGroupFirestoreTransport({ auth, db, groupId, custodianUid }) {
    if (!auth || !db || !custodianUid || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(groupId || '')) {
        throw new Error('Invalid encrypted group transport configuration.');
    }

    let closed = false;
    function ownerCheck() {
        if (closed || !auth.currentUser || auth.currentUser.uid !== custodianUid) {
            throw new Error('Group session is not authorized.');
        }
    }
    function reference(kind, id) {
        if (!KINDS.has(kind) || typeof id !== 'string' || !id || id.includes('/')) {
            throw new Error('Invalid encrypted record path.');
        }
        return doc(db, 'e2eeGroups', groupId, kind, id);
    }
    function groupCollection(kind) {
        if (!KINDS.has(kind)) throw new Error('Invalid encrypted collection.');
        return collection(db, 'e2eeGroups', groupId, kind);
    }

    return Object.freeze({
        groupId,
        close() {
            closed = true;
        },
        async get(kind, id) {
            ownerCheck();
            const snapshot = await getDocFromServer(reference(kind, id));
            ownerCheck();
            return snapshot.exists() ? snapshot.data() : null;
        },
        async list(kind) {
            ownerCheck();
            const snapshot = await getDocsFromServer(groupCollection(kind));
            ownerCheck();
            return snapshot.docs.map(item => ({ id: item.id, envelope: item.data() }));
        },
        async mutate(kind, id, transform) {
            ownerCheck();
            const ref = reference(kind, id);
            return runTransaction(db, async transaction => {
                ownerCheck();
                const snapshot = await transaction.get(ref);
                if (!snapshot.exists()) throw new Error('Encrypted record missing.');
                const nextEnvelope = await transform(snapshot.data());
                ownerCheck();
                transaction.set(ref, nextEnvelope);
            });
        },
        async issue(territoryId, publisherId, transform) {
            ownerCheck();
            const territoryRef = reference('territories', territoryId);
            const publisherRef = reference('publishers', publisherId);
            return runTransaction(db, async transaction => {
                ownerCheck();
                // Firestore transactions must read all dependencies before writing.
                const territorySnapshot = await transaction.get(territoryRef);
                const publisherSnapshot = await transaction.get(publisherRef);
                if (!territorySnapshot.exists() || !publisherSnapshot.exists()) {
                    throw new Error('Encrypted issue dependency missing.');
                }
                const nextEnvelope = await transform(territorySnapshot.data(), publisherSnapshot.data());
                ownerCheck();
                transaction.set(territoryRef, nextEnvelope);
            });
        }
    });
}
