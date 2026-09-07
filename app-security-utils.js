const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);

export function isAllowedAppUrl(value, base = 'https://example.invalid/') {
    const raw = String(value ?? '').trim();
    if (!raw) return false;
    if (raw.startsWith('#')) return true;

    try {
        const url = new URL(raw, base);
        return SAFE_PROTOCOLS.has(url.protocol);
    } catch {
        return false;
    }
}

export function safeStorageGet(storage, key) {
    try {
        return storage?.getItem?.(key) ?? null;
    } catch {
        return null;
    }
}

export function safeStorageSet(storage, key, value) {
    try {
        storage?.setItem?.(key, String(value));
        return true;
    } catch {
        return false;
    }
}

export function safeStorageRemove(storage, key) {
    try {
        storage?.removeItem?.(key);
        return true;
    } catch {
        return false;
    }
}
