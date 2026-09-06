import { startApplication } from './app-core.js';
import { db } from './app-auth.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import './app-ui.js';
import './app-popups.js';
import './app-cards.js';
import './app-filters.js';
import './app-publisher-roster.js';
import './app-publisher-sort.js';
import './app-picker-add.js';
import './s13-export.js';
import './app-touch.js';
import './app-apple-glass.js';

const $ = id => document.getElementById(id);

function installJwBrand() {
    const header = document.querySelector('header');
    if (!header) return null;

    const logo = header.querySelector('.app-logo') || header.querySelector('.fa-location-dot')?.parentElement;
    if (!logo) return null;

    logo.classList.add('app-logo');
    logo.innerHTML = '<span aria-hidden="true" style="color:#fff;font-size:15px;font-weight:900;line-height:1;letter-spacing:-0.04em;text-transform:uppercase;">JW</span>';

    const style = document.createElement('style');
    style.id = 's13-firebase-logo-status';
    style.textContent = `
        .app-logo {
            background:#f43f5e !important;
            background-image:none !important;
            box-shadow:none !important;
            transition:background-color .2s ease !important;
        }
        body[data-firebase-state="connected"] .app-logo {
            background:var(--dz-green, #20bf72) !important;
            box-shadow:none !important;
        }
        body[data-firebase-state="disconnected"] .app-logo {
            background:#f43f5e !important;
            box-shadow:none !important;
        }
    `;
    document.head.appendChild(style);

    return logo;
}

function installFirebaseIndicator(logo) {
    const status = $('db-status');
    const title = $('app-title');

    // The header no longer shows the app title or a separate Firebase text/dot.
    title?.remove();
    if (status) {
        status.hidden = true;
        status.setAttribute('aria-hidden', 'true');
        status.style.display = 'none';
        if (status.parentElement) status.parentElement.style.display = 'none';
    }

    let stopProbe = null;

    const setState = connected => {
        const isConnected = !!connected && navigator.onLine && document.body.dataset.authState === 'owner';
        document.body.dataset.firebaseState = isConnected ? 'connected' : 'disconnected';

        if (!logo) return;
        const french = document.documentElement.lang === 'fr';
        const description = isConnected
            ? (french ? 'JW — Firebase connecté' : 'JW — Firebase подключен')
            : (french ? 'JW — Firebase déconnecté' : 'JW — Firebase отключен');
        logo.setAttribute('aria-label', description);
        logo.title = description;
    };

    const coreStatusIsConnected = () => {
        if (!status || !navigator.onLine) return false;
        const text = (status.textContent || '').trim();
        const hasError = !!status.querySelector('.bg-rose-500') || /ошибка|erreur/i.test(text);
        if (hasError) return false;
        return /firebase\s+подключен/i.test(text) || /firebase\s+connecté/i.test(text);
    };

    const syncFromCoreStatus = () => {
        if (!coreStatusIsConnected()) setState(false);
    };

    const stopFirebaseProbe = () => {
        stopProbe?.();
        stopProbe = null;
    };

    const startFirebaseProbe = () => {
        if (stopProbe || document.body.dataset.authState !== 'owner') return;

        // This listener is intentionally pointed at one tiny probe document.
        // includeMetadataChanges lets us distinguish a server-confirmed snapshot
        // from cached data when Firestore temporarily loses its backend connection.
        stopProbe = onSnapshot(
            doc(db, 'appMigrations', 'firebase-connection-probe'),
            { includeMetadataChanges: true },
            snapshot => setState(!snapshot.metadata.fromCache),
            () => setState(false)
        );
    };

    if (status) {
        new MutationObserver(syncFromCoreStatus).observe(status, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    new MutationObserver(() => {
        if (document.body.dataset.authState !== 'owner') {
            stopFirebaseProbe();
            setState(false);
            return;
        }

        setState(false);
        startFirebaseProbe();
    }).observe(document.body, {
        attributes: true,
        attributeFilter: ['data-auth-state']
    });

    window.addEventListener('offline', () => setState(false));
    window.addEventListener('online', () => {
        setState(false);
        if (document.body.dataset.authState === 'owner') startFirebaseProbe();
    });

    new MutationObserver(() => {
        setState(document.body.dataset.firebaseState === 'connected');
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    setState(false);
    if (document.body.dataset.authState === 'owner') startFirebaseProbe();
}

const jwLogo = installJwBrand();
installFirebaseIndicator(jwLogo);
startApplication();
