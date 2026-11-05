/*
 * EXPERIMENTAL E2EE session controller (not used by the production UI).
 * Keeps non-extractable group keys inside a private closure only.
 *
 * Authentication proves UID only; the OFFLINE recovery code is required
 * to unwrap a group key. Never persist a recovery code in browser storage.
 */
import { recoverGroupVault } from './crypto.js';
import { createEncryptedTerritoryService } from './territory-service.js';

function unauthorized() {
    const error = new Error('E2EE session locked or not authorized.');
    error.code = 's13/e2eeLocked';
    return error;
}

export function createE2eeSession({
    auth, groupId, custodianUid, loadRecoveryEnvelope, makeTransport, subscribeAuth
}) {
    if (!auth || typeof custodianUid !== 'string' || !custodianUid ||
        typeof groupId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(groupId) ||
        typeof loadRecoveryEnvelope !== 'function' || typeof makeTransport !== 'function') {
        throw new Error('Invalid E2EE session configuration.');
    }

    let current = null;
    let revision = 0;
    let destroyed = false;

    function authorized() {
        return !destroyed && auth.currentUser?.uid === custodianUid;
    }

    function lock() {
        revision++;
        if (current) current.transport.close();
        current = null;
    }

    function check(session, token) {
        if (!session || !authorized() || current !== session || revision !== token) {
            throw unauthorized();
        }
    }

    const unsubscribe = typeof subscribeAuth === 'function'
        ? subscribeAuth(user => {
            if (!user || user.uid !== custodianUid) lock();
        })
        : null;

    async function unlockWithRecoveryCode(recoveryCode) {
        // Closing an earlier session first also invalidates in-flight operations.
        lock();
        const token = revision;
        if (!authorized()) throw unauthorized();
        const envelope = await loadRecoveryEnvelope(groupId);
        if (!authorized() || revision !== token) throw unauthorized();
        if (envelope?.groupId !== groupId) throw new Error('Recovery group mismatch.');

        const key = await recoverGroupVault(envelope, recoveryCode);
        if (!authorized() || revision !== token) throw unauthorized();
        const transport = makeTransport({ auth, groupId, custodianUid });
        if (!transport || transport.groupId !== groupId ||
            typeof transport.close !== 'function') {
            transport?.close?.();
            throw new Error('Invalid E2EE transport.');
        }
        if (!authorized() || revision !== token) {
            transport.close();
            throw unauthorized();
        }
        current = { transport, service: createEncryptedTerritoryService({
            groupId, key, transport
        }) };
        return true;
    }

    async function call(method, ...args) {
        const session = current;
        const token = revision;
        check(session, token);
        try {
            const value = await session.service[method](...args);
            check(session, token);
            return value;
        } catch (error) {
            check(session, token);
            throw error;
        }
    }

    return Object.freeze({
        get unlocked() {
            return Boolean(current && authorized());
        },
        unlockWithRecoveryCode,
        lock,
        async readCity(id) { return call('readCity', id); },
        async listTerritories(cityId) { return call('listTerritories', cityId); },
        async searchPublishers(query) { return call('searchPublishers', query); },
        async issueTerritory(values) { return call('issueTerritory', values); },
        async returnTerritory(values) { return call('returnTerritory', values); },
        async prepareS13(values) { return call('prepareS13', values); },
        close() {
            lock();
            destroyed = true;
            if (typeof unsubscribe === 'function') unsubscribe();
        }
    });
}
