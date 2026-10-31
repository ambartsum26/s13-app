/* Installation support without offline storage of authenticated Firestore data.
 * Never cache user records, auth responses, HTML or JavaScript bundles.
 * The app requires an internet connection for sign-in and data.
 */
self.addEventListener('install', () => {
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});
// Intentionally do not intercept fetch requests; the page stays network-first.
