import { startApplication } from './app-core.js';
import { db } from './app-auth.js';
import { doc, getDocFromServer } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import './app-ui.js';
import './app-popups.js';
import './app-cards.js';
import './app-filters.js';
import './app-publisher-roster.js';
import './app-publisher-sort.js';
import './app-picker-add.js';
import './s13-export.js';
import './app-touch.js';

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
            background:#dc2626 !important;
            background-image:none !important;
            transition:background-color .2s ease, box-shadow .2s ease !important;
        }
        body[data-firebase-state="connected"] .app-logo {
            background:#16a34a !important;
            box-shadow:0 0 0 1px rgba(34,197,94,.32), 0 8px 22px rgba(22,163,74,.22) !important;
        }
        body[data-firebase-state="disconnected"] .app-logo {
            background:#dc2626 !important;
            box-shadow:0 0 0 1px rgba(239,68,68,.32), 0 8px 22px rgba(220,38,38,.20) !important;
        }
    `;
    document.head.appendChild(style);

    return logo;
}

function installFirebaseIndicator(logo) {
    const status = $('db-status');
    const title = $('app-title');

    // The header no longer shows an app title or a separate Firebase text/dot.
    title?.remove();
    if (status) {
        status.hidden = true;
        status.setAttribute('aria-hidden', 'true');
        status.style.display = 'none';
        if (status.parentElement) status.parentElement.style.display = 'none';
    }

    let verificationVersion = 0;

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

    const syncFromCoreStatus = () => setState(coreStatusIsConnected());

    if (status) {
        new MutationObserver(syncFromCoreStatus).observe(status, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    new MutationObserver(() => {
        if (document.body.dataset.authState !== 'owner') {
            setState(false);
            return;
        }
        // Wait for app-core to confirm Firebase after authentication.
        setState(false);
    }).observe(document.body, {
        attributes: true,
        attributeFilter: ['data-auth-state']
    });

    window.addEventListener('offline', () => {
        verificationVersion++;
        setState(false);
    });

    window.addEventListener('online', async () => {
        const version = ++verificationVersion;
        setState(false);
        if (document.body.dataset.authState !== 'owner') return;

        try {
            // A server-only read verifies Firebase itself, not merely Internet access.
            await getDocFromServer(doc(db, 'appMigrations', 'firebase-connection-probe'));
            if (version === verificationVersion) setState(true);
        } catch {
            if (version === verificationVersion) setState(false);
        }
    });

    new MutationObserver(() => {
        if (document.body.dataset.firebaseState === 'connected') setState(true);
        else setState(false);
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    setState(false);
}

const jwLogo = installJwBrand();
installFirebaseIndicator(jwLogo);
startApplication();
