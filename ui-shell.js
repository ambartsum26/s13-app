function syncLanguageControls() {
    const isFr = document.documentElement.lang === 'fr';
    const toggles = [...document.querySelectorAll('[data-language-toggle]')];

    toggles.forEach((toggle) => {
        const slider = toggle.querySelector(':scope > div');
        if (slider) {
            slider.style.transform = isFr ? 'translateX(calc(100% + 4px))' : 'translateX(0)';
        }

        const labels = toggle.querySelectorAll(':scope > span');
        if (labels[0]) labels[0].style.color = isFr ? '#9cb0a9' : '#07100e';
        if (labels[1]) labels[1].style.color = isFr ? '#07100e' : '#9cb0a9';
    });
}

function normalizeDuplicateIds() {
    const sliders = [...document.querySelectorAll('[id="lang-slider"]')];
    sliders.slice(1).forEach((slider) => slider.removeAttribute('id'));
}

function syncMobileDrawer() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || window.innerWidth >= 1024) return;

    const isOpen = sidebar.classList.contains('mobile-open');
    document.body.classList.toggle('drawer-open', isOpen);
}

function setupShell() {
    normalizeDuplicateIds();
    syncLanguageControls();
    syncMobileDrawer();

    new MutationObserver(syncLanguageControls).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        new MutationObserver(syncMobileDrawer).observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            document.body.classList.remove('drawer-open');
        } else {
            syncMobileDrawer();
        }
    });
}

setupShell();
