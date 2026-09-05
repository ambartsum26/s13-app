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
        unavailable: 'Вход сейчас недоступен из-за настройки приложения. Обратитесь к администратору.',
        invalid: 'Не удалось войти. Проверьте пароль.',
        invalidSetup: 'Не удалось войти. Проверьте почту и пароль.',
        network: 'Нет связи. Проверьте интернет и повторите вход.',
        limited: 'Слишком много попыток. Попробуйте позже.',
        denied: 'У этого аккаунта нет доступа к приложению.',
        failed: 'Не удалось проверить вход. Обновите страницу.',
        logoutFailed: 'Не удалось выйти. Проверьте подключение и повторите.'
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
        unavailable: 'Connexion indisponible à cause de la configuration de l’application. Contactez l’administrateur.',
        invalid: 'Connexion impossible. Vérifiez le mot de passe.',
        invalidSetup: 'Connexion impossible. Vérifiez l’adresse e-mail et le mot de passe.',
        network: 'Vérifiez votre connexion Internet et réessayez.',
        limited: 'Trop de tentatives. Réessayez plus tard.',
        denied: 'Ce compte ne peut pas accéder à cette application.',
        failed: 'Vérification impossible. Actualisez la page.',
        logoutFailed: 'Déconnexion impossible. Vérifiez votre connexion et réessayez.'
    }
};

let busy = false;
let rememberedEmail = readRememberedEmail();

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

    if ($('auth-message').dataset.key) {
        $('auth-message').textContent = text($('auth-message').dataset.key);
    }
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
        }, () => {
            showAccess(false);
            message('failed');
            deliver(false);
        });
    }).catch(() => {
        showAccess(false);
        message('failed');
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
            // Log only a known-format code, never credentials or the error object.
            const code = /^auth\/[a-z-]+$/.test(error?.code || '') ? error.code : 'auth/unknown';
            console.warn('S13 sign-in:', code);

            const invalid = [
                'auth/invalid-credential',
                'auth/invalid-login-credentials',
                'auth/wrong-password',
                'auth/user-not-found',
                'auth/invalid-email'
            ];

            const key = code === 'auth/network-request-failed'
                ? 'network'
                : code === 'auth/too-many-requests'
                    ? 'limited'
                    : invalid.includes(code)
                        ? (rememberedEmail ? 'invalid' : 'invalidSetup')
                        : 'unavailable';

            message(key);
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
