import { db, isOwner } from './app-auth.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const MIGRATION_ID = 'publisher-roster-2026-09-06-v1';

// Current publisher roster supplied by the owner.
// Names are stored as "First name SURNAME" and ordered alphabetically by first name.
const PUBLISHER_ROSTER = [
    'Aleksandra HODAR',
    'Alla TURII',
    'Anna SEDRAKYAN',
    'Dmitro YERMOLAIEV',
    'Elmira BSHOIAN',
    'Evgueniy VELCHEV',
    'Irina AMBARTSUMOVA',
    'Irina TKACHENKO',
    'Ivan HODAR',
    'Karlen AMBARTSUMOV',
    'Kateryna MYKYTIUK',
    'Khachatur MADUNTSEV',
    'Larysa VELCHEVA',
    'Lev OTINOV',
    'Lilia MADUNTSEVA',
    'Nadia HRYTSYK',
    'Nataliia DRANCHUK',
    'Olya OTINOVA',
    'Petro HRYTSYK',
    'Roman DRANCHUK',
    'Serhii TKACHENKO',
    'Stella ARUSTAMIAN',
    'Svitlana BROZHYK',
    'Tatiana LOKTIONOVA',
    'Tigran AMBARTSUMOV',
    'Timotii OTINOV',
    'Valentyna YERMOLAIEVA',
    'Valerii KOVALCHUK',
    'Valerii MAGDALIANOV',
    'Valériia MYKYTIUK',
    'Viktoriia TURII',
    'Vitalii LYTVYNCHUK',
    'Vladyslav KOVALCHUK',
    'Yaroslav ROMANOV',
    'Zarina AMBARTSUMOVA',
    'Zina BROZHYK'
];

function normalize(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function identityKey(value) {
    return normalize(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(' ')
        .filter(Boolean)
        .sort()
        .join('|');
}

function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function migratePublisherRoster() {
    if (!isOwner()) return;

    const migrationRef = doc(db, 'appMigrations', MIGRATION_ID);
    const migration = await getDoc(migrationRef);
    if (!isOwner() || migration.exists()) return;

    const snapshot = await getDocs(collection(db, 'publishers'));
    if (!isOwner()) return;

    const existing = snapshot.docs.map(item => ({
        id: item.id,
        ref: item.ref,
        fullName: item.data().fullName || '',
        nameKey: item.data().nameKey || ''
    }));

    const used = new Set();
    const batch = writeBatch(db);

    for (const fullName of PUBLISHER_ROSTER) {
        const normalized = normalize(fullName);
        const identity = identityKey(fullName);

        const exact = existing.find(item =>
            !used.has(item.id) && normalize(item.fullName) === normalized
        );
        const match = exact || existing.find(item =>
            !used.has(item.id) && identityKey(item.fullName) === identity
        );

        if (match) {
            used.add(match.id);
            if (match.fullName !== fullName || match.nameKey !== normalized) {
                batch.update(match.ref, {
                    fullName,
                    nameKey: normalized
                });
            }
        } else {
            const newRef = doc(collection(db, 'publishers'));
            batch.set(newRef, {
                fullName,
                nameKey: normalized,
                createdAt: today()
            });
        }
    }

    for (const item of existing) {
        if (!used.has(item.id)) batch.delete(item.ref);
    }

    batch.set(migrationRef, {
        completed: true,
        version: MIGRATION_ID,
        rosterSize: PUBLISHER_ROSTER.length,
        completedAt: new Date().toISOString()
    });

    await batch.commit();
}

// Use a plain auth-state listener rather than observeOwner(), so the login form
// and the main application keep their single existing event-handler setup.
const auth = getAuth();
onAuthStateChanged(auth, () => {
    if (!isOwner()) return;
    migratePublisherRoster().catch(error => {
        console.error('Publisher roster migration failed:', error);
    });
});
