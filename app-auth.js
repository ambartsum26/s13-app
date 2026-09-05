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
const OWNER_EMAIL_KEY = 's13-owner-email';

export const isOwner = () => auth.currentUser?.uid === OWNER_UID;
export function requireOwner() {
    if (!isOwner()) throw new Error('Owner sign-in required');
}

const $ = id => document.getElementById(id);
const messages = {
    ru: {
        title: 'Вход в приложение',
        email: 'Электронная почта',
        password: 'Пароль',
        login: 'Войти',
        logout: 'Выйти',
        working: 'Вход…',
        checking: 'Проверка входа…',
        hintPassword: 'Введите пароль владельца.',
        hintSetup: 'При первом входе укажите почту владельца. После успешного входа на этом устройстве останется только поле пароля.',
        switchAccount: 'Сменить аккаунт',
        invalid: 'Не удалось войти. Проверьте пароль.',
        invalidSetup: 'Не удалось войти. Проверьте почту и пароль.',
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
        email: 'Adresse e-mail',
        password: 'Mot de passe',
        login: 'Se connecter',
        logout: 'Se déconnecter',
        working: 'Connexion…',
        checking: 'Vérification…',
        hintPassword: 'Saisissez le mot de passe du propriétaire.',
        hintSetup: 'Lors de la première connexion, saisissez l’adresse e-mail du propriétaire. Ensuite, seul le mot de passe sera demandé sur cet appareil.',
        switchAccount: 'Changer de compte',
        invalid: 'Connexion impossible. Vérifiez le mot de passe.',
        invalidSetup: 'Connexion impossible. Vérifiez l’adresse e-mail et le mot de passe.',
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
let rememberedEmail = readRememberedEmail();
let authMessageKey = '';
let authMessageCode = '';

const text = key => messages[document.documentElement.lang === 'fr' ? 'fr' : 'ru'][key];

function readRememberedEmail() {
    try {
        return localStorage.getItem(OWNER_EMAIL_KEY)?.trim() || '';
    } catch {
        return '';
    }
}

function rememberEmail(email) {
    rememberedEmail = email.trim();
    try {
        if (rememberedEmail) localStorage.setItem(OWNER_EMAIL_KEY, rememberedEmail);
        else localStorage.removeItem(OWNER_EMAIL_KEY);
    } catch {
        // Password-only mode is a convenience. Authentication still works if storage is unavailable.
    }
}

function ensureSwitchAccountButton() {
    let button = $('auth-switch-account');
    if (button) return button;

    button = document.createElement('button');
    button.id = 'auth-switch-account';
    button.type = 'button';
    button.style.width = '100%';
    button.style.marginTop = '8px';
    button.style.background = 'transparent';
    button.style.color = '#c8c7d1';
    button.style.fontSize = '12px';
    button.style.textDecoration = 'underline';
    button.style.textUnderlineOffset = '3px';

    button.addEventListener('click', () => {
        rememberEmail('');
        $('auth-email').value = '';
        message();
        syncEmailMode();
        $('auth-email').focus();
    });

    $('auth-form').append(button);
    return button;
}

function syncEmailMode() {
    const hasRememberedEmail = !!rememberedEmail;
    const email = $('auth-email');
    const emailLabel = $('auth-email-label');
    const switchButton = ensureSwitchAccountButton();

    email.hidden = hasRememberedEmail;
    emailLabel.hidden = hasRememberedEmail;
    email.required = !hasRememberedEmail;

    if (hasRememberedEmail) email.value = rememberedEmail;

    switchButton.hidden = !hasRememberedEmail;
    switchButton.textContent = text('switchAccount');
    $('auth-hint').textContent = text(hasRememberedEmail ? 'hintPassword' : 'hintSetup');
}

function renderMessage() {
    const base = authMessageKey ? text(authMessageKey) : '';
    $('auth-message').textContent = authMessageCode ? `${base} (${authMessageCode})` : base;
}

function updateLabels() {
    for (const [id, key] of Object.entries({
        'auth-title': 'title',
        'auth-email-label': 'email',
        'auth-password-label': 'password',
        'auth-logout-label': 'logout'
    })) {
        $(id).textContent = text(key);
    }

    $('auth-logout').title = text('logout');
    $('auth-logout').setAttribute('aria-label', text('logout'));
    $('auth-submit').textContent = text(busy ? 'working' : 'login');
    syncEmailMode();
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
    if (invalid.includes(code)) return rememberedEmail ? 'invalid' : 'invalidSetup';
    return 'unknown';
}

function showAccess(allowed) {
    document.body.dataset.authState = allowed ? 'owner' : 'locked';
    $('auth-panel').setAttribute('aria-hidden', String(allowed));
    $('auth-password').value = '';
}

export function observeOwner(onChange) {
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

            if (allowed && user?.email) {
                rememberEmail(user.email);
                syncEmailMode();
            }

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

        const email = (rememberedEmail || $('auth-email').value).trim();
        if (!email) {
            syncEmailMode();
            $('auth-email').focus();
            return;
        }

        busy = true;
        $('auth-submit').disabled = true;
        message();
        updateLabels();

        try {
            await persistence;
            const credential = await signInWithEmailAndPassword(auth, email, $('auth-password').value);

            if (credential.user?.uid !== OWNER_UID) {
                await signOut(auth);
                message('denied');
                return;
            }

            rememberEmail(credential.user.email || email);
            syncEmailMode();
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
