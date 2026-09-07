const grid = document.getElementById('grid');
const body = document.body;

if (grid && body) {
    let activeCityId = body.dataset.activeCityId || '';
    let cascadePending = false;
    let frame = 0;

    const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const runCascade = () => {
        frame = 0;
        if (!cascadePending || reducedMotion()) {
            cascadePending = false;
            return;
        }

        const cards = [...grid.querySelectorAll(':scope > article')];
        if (!cards.length) return;

        cascadePending = false;

        cards.forEach(card => {
            card.classList.remove('animate-fade-in');
            card.style.animationDelay = '';
        });

        // One shared reflow is enough to restart the CSS animation on cards
        // that were already shown earlier in this session.
        void grid.offsetWidth;

        cards.forEach((card, index) => {
            card.classList.add('animate-fade-in');
            card.style.animationDelay = `${Math.min(index * 0.055, 0.65)}s`;
        });
    };

    const scheduleCascade = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(runCascade);
    };

    new MutationObserver(() => {
        const nextCityId = body.dataset.activeCityId || '';
        if (!nextCityId || nextCityId === activeCityId) return;
        activeCityId = nextCityId;
        cascadePending = true;
        scheduleCascade();
    }).observe(body, {
        attributes: true,
        attributeFilter: ['data-active-city-id']
    });

    new MutationObserver(() => {
        if (cascadePending) scheduleCascade();
    }).observe(grid, {
        childList: true,
        subtree: false
    });
}
