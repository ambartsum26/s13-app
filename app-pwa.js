// PWA enhancement: does not affect Firebase login, UI or routing.
if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
            .catch(error => console.warn('PWA installation support unavailable:', error));
    }, { once: true });
}
// The user installs from Chrome/Samsung Internet's menu. Do not force prompts.
