// Consistent, accessible replacement for the app's informational alerts.
// Destructive confirmations continue to use the existing confirmation modal.
const notice = document.createElement('dialog');
const fallbackAlert = window.alert.bind(window);

if (typeof notice.showModal === 'function') {
    notice.id = 's13-notice';
    notice.setAttribute('role', 'alertdialog');
    notice.setAttribute('aria-labelledby', 's13-notice-title');
    notice.setAttribute('aria-describedby', 's13-notice-message');

    const heading = document.createElement('h2');
    heading.id = 's13-notice-title';
    const message = document.createElement('p');
    message.id = 's13-notice-message';
    const action = document.createElement('button');
    action.type = 'button';

    const style = document.createElement('style');
    style.textContent = `
        #s13-notice {
            position: fixed;
            width: min(420px, calc(100vw - 28px));
            max-width: none;
            max-height: min(78dvh, 560px);
            overflow-y: auto;
            margin: auto;
            padding: 22px;
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 22px;
            background: #272731;
            color: #f8fafc;
            box-shadow: 0 24px 72px rgba(0,0,0,.58);
            font-family: system-ui, sans-serif;
            box-sizing: border-box;
            overscroll-behavior: contain;
        }
        #s13-notice::backdrop { background: rgba(8,9,14,.72); }
        #s13-notice-title { font-size: 16px; line-height: 1.35; font-weight: 750; margin: 0 0 10px; }
        #s13-notice-message {
            font-size: 14px; line-height: 1.5; margin: 0 0 20px;
            overflow-wrap: anywhere; white-space: pre-line;
        }
        #s13-notice button {
            display: block; margin-left: auto; padding: 0 22px;
            min-height: 48px; font-size: 14px; font-weight: 700;
            background: #20bf72 !important; color: #0f1720 !important; border: 0;
            border-radius: 999px; cursor: pointer;
        }
        #s13-notice button:focus-visible {
            outline: 3px solid #94f5c1; outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
            #s13-notice { scroll-behavior: auto; }
        }
    `;
    document.head.append(style);
    notice.append(heading, message, action);
    document.body.append(notice);

    const queue = [];
    let previousFocus = null;

    function localize() {
        const french = document.documentElement.lang === 'fr';
        heading.textContent = french ? 'Information' : 'Сообщение';
        action.textContent = french ? 'Compris' : 'Понятно';
        action.setAttribute('aria-label', action.textContent);
    }

    function showNext() {
        if (notice.open || !queue.length) return;
        message.textContent = queue.shift();
        localize();
        previousFocus = document.activeElement;
        try {
            notice.showModal();
            action.focus({ preventScroll: true });
        } catch {
            fallbackAlert(message.textContent);
            queueMicrotask(showNext);
        }
    }

    action.addEventListener('click', () => notice.close());
    notice.addEventListener('close', () => {
        if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') {
            previousFocus.focus({ preventScroll: true });
        }
        previousFocus = null;
        queueMicrotask(showNext);
    });
    new MutationObserver(localize).observe(document.documentElement, {
        attributes: true, attributeFilter: ['lang']
    });

    window.alert = text => {
        // The locked login screen intentionally hides all app-owned overlays.
        if (document.body.dataset.authState !== 'owner') {
            return fallbackAlert(text);
        }
        queue.push(String(text ?? ''));
        showNext();
    };
}
