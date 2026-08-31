const getInitials = (name = '') => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || '—';

function decoratePublishers() {
    const list = document.getElementById('publishers-list');
    if (!list) return;

    [...list.children].forEach((row, index) => {
        if (!(row instanceof HTMLElement)) return;
        const nameNode = row.querySelector(':scope > b');
        if (!nameNode || row.dataset.dzDecorated === '1') return;

        const name = nameNode.textContent?.trim() || '—';
        const actions = row.querySelector(':scope > div:last-child');

        const rank = document.createElement('span');
        rank.className = 'dz-publisher-rank';
        rank.textContent = String(index + 1).padStart(2, '0');

        const avatar = document.createElement('span');
        avatar.className = 'dz-publisher-avatar';
        avatar.textContent = getInitials(name);

        const copy = document.createElement('div');
        copy.className = 'min-w-0 flex-1';

        nameNode.remove();
        copy.appendChild(nameNode);
        row.insertBefore(rank, row.firstChild);
        row.insertBefore(avatar, actions || null);
        row.insertBefore(copy, actions || null);
        row.dataset.dzDecorated = '1';
    });
}

function syncMobileLanguageLabel() {
    const lang = document.documentElement.lang === 'fr' ? 'FR' : 'RU';
    document.querySelectorAll('.dz-mobile-lang').forEach(button => {
        button.setAttribute('data-current-lang', lang);
    });
}

function syncSidebarOverlay() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || window.innerWidth >= 1024) {
        document.body.classList.remove('drawer-open');
        return;
    }
    document.body.classList.toggle('drawer-open', sidebar.classList.contains('mobile-open'));
}

function setupReferenceUi() {
    const publishers = document.getElementById('publishers-list');
    if (publishers) {
        new MutationObserver(() => queueMicrotask(decoratePublishers)).observe(publishers, {
            childList: true,
            subtree: true
        });
        decoratePublishers();
    }

    new MutationObserver(syncMobileLanguageLabel).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });
    syncMobileLanguageLabel();

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        new MutationObserver(syncSidebarOverlay).observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    window.addEventListener('resize', syncSidebarOverlay);
    syncSidebarOverlay();
}

setupReferenceUi();
