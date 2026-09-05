import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const app = initializeApp({
    apiKey: 'AIzaSyAGWi3iNv1bROpOoulUwh20XSsLokFYrz8x',
    authDomain: 'fir-13-app.firebaseapp.com',
    projectId: 'fir-13-app',
    storageBucket: 'fir-13-app.firebasestorage.app',
    messagingSenderId: '1080215970738',
    appId: '1:1080215970738:web:2d66b3b8a9ea26f1e6baab',
    measurementId: 'G-70HBSY6MC6'
});
export const db = getFirestore(app);
const auth = getAuth(app);
// This UI check is mirrored by firestore.rules; the server rules enforce access.
const OWNER_UID = '8JAUBlCS2CXO0xTJzY1cnOafzuE2';
export const isOwner = () => auth.currentUser?.uid === OWNER_UID;
export function requireOwner() {
    if (!isOwner()) throw new Error('Owner sign-in required');
}

const $ = id => document.getElementById(id);
const messages = {
    ru: { title: 'Вход в приложение', email: 'Электронная почта', password: 'Пароль', login: 'Войти', logout: 'Выйти', working: 'Вход…', checking: 'Проверка входа…', hint: 'Вход доступен только владельцу. Сеанс действует до закрытия вкладки.', unavailable: 'Вход сейчас недоступен из-за настройки приложения. Обратитесь к администратору.', invalid: 'Не удалось войти. Проверьте почту и пароль.', network: 'Нет связи. Проверьте интернет и повторите вход.', limited: 'Слишком много попыток. Попробуйте позже.', denied: 'У этого аккаунта нет доступа к приложению.', failed: 'Не удалось проверить вход. Обновите страницу.', logoutFailed: 'Не удалось выйти. Проверьте подключение и повторите.' },
    fr: { title: 'Connexion', email: 'Adresse e-mail', password: 'Mot de passe', login: 'Se connecter', logout: 'Se déconnecter', working: 'Connexion…', checking: 'Vérification…', hint: 'Accès réservé au propriétaire. La session se termine à la fermeture de cet onglet.', unavailable: 'Connexion indisponible à cause de la configuration de l’application. Contactez l’administrateur.', invalid: 'Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.', network: 'Vérifiez votre connexion Internet et réessayez.', limited: 'Trop de tentatives. Réessayez plus tard.', denied: 'Ce compte ne peut pas accéder à cette application.', failed: 'Vérification impossible. Actualisez la page.', logoutFailed: 'Déconnexion impossible. Vérifiez votre connexion et réessayez.' }
};
let busy = false;
const text = key => messages[document.documentElement.lang === 'fr' ? 'fr' : 'ru'][key];
function updateLabels() {
    for (const [id, key] of Object.entries({ 'auth-title': 'title', 'auth-email-label': 'email', 'auth-password-label': 'password', 'auth-hint': 'hint', 'auth-logout-label': 'logout' })) $(id).textContent = text(key);
    $('auth-logout').title = text('logout');
    $('auth-logout').setAttribute('aria-label', text('logout'));
    $('auth-submit').textContent = text(busy ? 'working' : 'login');
    if ($('auth-message').dataset.key) $('auth-message').textContent = text($('auth-message').dataset.key);
}
function message(key = '') {
    $('auth-message').dataset.key = key;
    $('auth-message').textContent = key ? text(key) : '';
}
function showAccess(allowed) {
    document.body.dataset.authState = allowed ? 'owner' : 'locked';
    $('auth-panel').setAttribute('aria-hidden', String(allowed));
    $('auth-password').value = '';
}

export function observeOwner(onChange) {
    updateLabels();
    message('checking');
    new MutationObserver(updateLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    let lastAccess = null;
    const deliver = allowed => {
        if (allowed === lastAccess) return;
        lastAccess = allowed;
        onChange(allowed);
    };
    // Never load Firestore until Firebase has restored and checked the session.
    const persistence = setPersistence(auth, browserSessionPersistence);
    persistence.then(() => {
        onAuthStateChanged(auth, user => {
            const allowed = user?.uid === OWNER_UID;
            showAccess(allowed);
            message(user && !allowed ? 'denied' : '');
            deliver(allowed);
        }, () => {
            showAccess(false);
            message('failed');
            deliver(false);
        });
    }).catch(() => { showAccess(false); message('failed'); deliver(false); });

    $('auth-form').addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        $('auth-submit').disabled = true;
        message();
        updateLabels();
        try {
            await persistence;
            await signInWithEmailAndPassword(auth, $('auth-email').value.trim(), $('auth-password').value);
        } catch (error) {
            // Log only a known-format code, never credentials or the error object.
            const code = /^auth\/[a-z-]+$/.test(error?.code || '') ? error.code : 'auth/unknown';
            console.warn('S13 sign-in:', code);
            const invalid = ['auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
            message(code === 'auth/network-request-failed' ? 'network' : code === 'auth/too-many-requests' ? 'limited' : invalid.includes(code) ? 'invalid' : 'unavailable');
        } finally {
            $('auth-password').value = '';
            busy = false;
            $('auth-submit').disabled = false;
            updateLabels();
        }
    });
    $('auth-logout').addEventListener('click', async () => {
        $('auth-logout').disabled = true;
        try { await signOut(auth); }
        catch { alert(text('logoutFailed')); }
        finally { $('auth-logout').disabled = false; }
    });
}
