import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const app = initializeApp({
    apiKey: 'AIzaSyAGWi3iNv1bROpOULUwh20XSsLokFYrzx8',
    authDomain: 'fir-13-app.firebaseapp.com',
    projectId: 'fir-13-app',
    storageBucket: 'fir-13-app.firebasestorage.app',
    messagingSenderId: '1080215970738',
    appId: '1:1080215970738:web:2d66b3b8a9ea26f1e6baab',
    measurementId: 'G-70HBSY6MC6'
});

export const db = getFirestore(app);
const auth = getAuth(app);

// The technical email is not a secret. Firebase Auth still validates the password,
// and firestore.rules enforce the owner UID on the server.
const OWNER_EMAIL = 'admin@s13.com';
const OWNER_UID = '8JAUBlCS2CXO0xTJzY1cnOafzuE2';

export const isOwner = () => auth.currentUser?.uid === OWNER_UID;
export function requireOwner() {
    if (!isOwner()) throw new Error('Owner sign-in required');
}

const $ = id => document.getElementById(id);
const messages = {
    ru: {
        title: 'Вход в приложение',
        password: 'Пароль',
        login: 'Войти',
        logout: 'Выйти',
        working: 'Вход…',
        checking: 'Проверка входа…',
        hint: 'Введите пароль владельца.',
        invalid: 'Не удалось войти. Проверьте пароль.',
        network: 'Нет связи. Проверьте интернет и повторите вход.',
        limited: 'Слишком много попыток. Попробуйте позже.',
        disabled: 'Этот пользователь отключён в Firebase Authentication.',
        providerDisabled: 'В Firebase Authentication не включён вход Email/Password.',
        unauthorizedDomain: 'Домен приложения не разрешён в Firebase Authentication.',
        appNotAuthorized: 'Это приложение или домен не разрешены для данного Firebase API key.',
        apiKey: 'Firebase API key не разрешает запрос авторизации. Проверьте ограничения ключа и Identity Toolkit API.',
        denied: 'У этого аккаунта нет доступа к приложению.',
        failed: 'Не удалось проверить вход. Обновите страницу.',
        logoutFailed: 'Не удалось выйти. Проверьте подключение и повторите.',
        unknown: 'Firebase отклонил вход.'
    },
    fr: {
        title: 'Connexion',
        password: 'Mot de passe',
        login: 'Se connecter',
        logout: 'Se déconnecter',
        working: 'Connexion…',
        checking: 'Vérification…',
        hint: 'Saisissez le mot de passe du propriétaire.',
        invalid: 'Connexion impossible. Vérifiez le mot de passe.',
        network: 'Vérifiez votre connexion Internet et réessayez.',
        limited: 'Trop de tentatives. Réessayez plus tard.',
        disabled: 'Cet utilisateur est désactivé dans Firebase Authentication.',
        providerDisabled: 'La connexion Email/Password n’est pas activée dans Firebase Authentication.',
        unauthorizedDomain: 'Le domaine de l’application n’est pas autorisé dans Firebase Authentication.',
        appNotAuthorized: 'Cette application ou ce domaine n’est pas autorisé pour cette clé Firebase API.',
        apiKey: 'La clé Firebase API ne permet pas la requête d’authentification. Vérifiez les restrictions de la clé et Identity Toolkit API.',
        denied: 'Ce compte ne peut pas accéder à cette application.',
        failed: 'Vérification impossible. Actualisez la page.',
        logoutFailed: 'Déconnexion impossible. Vérifiez votre connexion et réessayez.',
        unknown: 'Firebase a refusé la connexion.'
    }
};

let busy = false;
let authMessageKey = '';
let authMessageCode = '';

const text = key => messages[document.documentElement.lang === 'fr' ? 'fr' : 'ru'][key];

function configurePasswordOnlyForm() {
    const email = $('auth-email');
    const emailLabel = $('auth-email-label');

    if (email) {
        email.value = OWNER_EMAIL;
        email.required = false;
        email.hidden = true;
        email.setAttribute('aria-hidden', 'true');
        email.setAttribute('tabindex', '-1');
    }

    if (emailLabel) {
        emailLabel.hidden = true;
        emailLabel.setAttribute('aria-hidden', 'true');
    }
}

function configureLanguageToggle() {
    const button = $('auth-language');
    if (!button) return;

    button.setAttribute('data-language-toggle', '');
    button.setAttribute('title', 'Сменить язык / Changer de langue');
    button.setAttribute('aria-label', 'Сменить язык / Changer de langue');
    button.className = 'relative w-24 h-10 shrink-0 bg-slate-950/80 rounded-xl border border-slate-800 p-1 flex items-center justify-between overflow-hidden shadow-inner';

    // Inline geometry overrides the older auth-panel button rules so this is
    // visually identical to the language switcher in the main application bar.
    button.style.cssText = [
        'float:none',
        'margin:-8px -8px 8px auto',
        'display:flex',
        'position:relative',
        'width:96px',
        'height:40px',
        'min-height:40px',
        'padding:4px',
        'border:1px solid #1e293b',
        'border-radius:12px',
        'background:rgba(2,6,23,.8)',
        'color:#fff',
        'box-shadow:inset 0 2px 4px rgba(0,0,0,.06)',
        'overflow:hidden',
        'align-items:center',
        'justify-content:space-between'
    ].join(';');

    if (button.dataset.languageToggleReady !== '1') {
        button.innerHTML = `
            <div id="auth-lang-slider" class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-500 rounded-lg transition-all duration-300"></div>
            <span class="relative z-10 w-1/2 text-center text-xs font-bold">RU</span>
            <span class="relative z-10 w-1/2 text-center text-xs font-bold text-slate-300">FR</span>`;
        button.dataset.languageToggleReady = '1';
    }

    const isFr = document.documentElement.lang === 'fr';
    const slider = $('auth-lang-slider');
    slider?.classList.toggle('translate-x-[calc(100%+4px)]', isFr);
    slider?.classList.toggle('bg-rose-500', isFr);
    slider?.classList.toggle('bg-emerald-500', !isFr);
}

function renderMessage() {
    const base = authMessageKey ? text(authMessageKey) : '';
    $('auth-message').textContent = authMessageCode ? `${base} (${authMessageCode})` : base;
}

function updateLabels() {
    $('auth-title').textContent = text('title');
    $('auth-password-label').textContent = text('password');
    $('auth-hint').textContent = text('hint');
    $('auth-logout-label').textContent = text('logout');
    $('auth-logout').title = text('logout');
    $('auth-logout').setAttribute('aria-label', text('logout'));
    $('auth-submit').textContent = text(busy ? 'working' : 'login');
    configurePasswordOnlyForm();
    configureLanguageToggle();
    renderMessage();
}

function message(key = '', code = '') {
    authMessageKey = key;
    authMessageCode = code;
    renderMessage();
}

function safeAuthCode(error) {
    const raw = typeof error?.code === 'string' ? error.code.trim() : '';
    if (!raw.startsWith('auth/') || raw.length > 220) return 'auth/unknown';
    return raw.replace(/[^a-zA-Z0-9_./:\-]/g, '?');
}

function errorMessageKey(code) {
    const invalid = [
        'auth/invalid-credential',
        'auth/invalid-login-credentials',
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/invalid-email'
    ];

    if (code === 'auth/network-request-failed') return 'network';
    if (code === 'auth/too-many-requests') return 'limited';
    if (code === 'auth/user-disabled') return 'disabled';
    if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') return 'providerDisabled';
    if (code === 'auth/unauthorized-domain') return 'unauthorizedDomain';
    if (code === 'auth/app-not-authorized') return 'appNotAuthorized';
    if (code === 'auth/invalid-api-key' || code.includes('api-key') || code.includes('referer')) return 'apiKey';
    if (invalid.includes(code)) return 'invalid';
    return 'unknown';
}

function showAccess(allowed) {
    document.body.dataset.authState = allowed ? 'owner' : 'locked';
    $('auth-panel').setAttribute('aria-hidden', String(allowed));
    $('auth-password').value = '';
}

export function observeOwner(onChange) {
    configurePasswordOnlyForm();
    updateLabels();
    message('checking');

    new MutationObserver(updateLabels).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

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
        }, error => {
            const code = safeAuthCode(error);
            console.warn('S13 auth state:', code);
            showAccess(false);
            message('failed', code);
            deliver(false);
        });
    }).catch(error => {
        const code = safeAuthCode(error);
        console.warn('S13 auth persistence:', code);
        showAccess(false);
        message('failed', code);
        deliver(false);
    });

    $('auth-form').addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;

        busy = true;
        $('auth-submit').disabled = true;
        message();
        updateLabels();

        try {
            await persistence;
            const credential = await signInWithEmailAndPassword(auth, OWNER_EMAIL, $('auth-password').value);

            if (credential.user?.uid !== OWNER_UID) {
                await signOut(auth);
                message('denied');
                return;
            }
        } catch (error) {
            // Never log credentials or the complete Firebase error object.
            const code = safeAuthCode(error);
            console.warn('S13 sign-in:', code);
            message(errorMessageKey(code), code);
        } finally {
            $('auth-password').value = '';
            busy = false;
            $('auth-submit').disabled = false;
            updateLabels();
        }
    });

    $('auth-logout').addEventListener('click', async () => {
        $('auth-logout').disabled = true;
        try {
            await signOut(auth);
        } catch {
            alert(text('logoutFailed'));
        } finally {
            $('auth-logout').disabled = false;
        }
    });
}
