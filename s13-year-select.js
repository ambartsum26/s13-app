const FIRST_SERVICE_YEAR = 2024;

function currentServiceYear(now = new Date()) {
    return now.getFullYear() + (now.getMonth() >= 8 ? 1 : 0);
}

function serviceYearOptions(isFr) {
    const current = currentServiceYear();
    const options = [];

    for (let year = current; year >= FIRST_SERVICE_YEAR; year--) {
        options.push({
            value: String(year),
            label: isFr
                ? `${year} — sept. ${year - 1} à août ${year}`
                : `${year} — сент. ${year - 1} → авг. ${year}`
        });
    }

    return options;
}

function isS13YearRequest(title, fields) {
    return title === 'S-13'
        && Array.isArray(fields)
        && fields.length === 1
        && typeof fields[0]?.label === 'string';
}

function installS13YearSelector() {
    const original = window.requestAppFields;
    if (typeof original !== 'function' || original.__s13YearSelectorWrapped) return false;

    const wrapped = function (title, fields) {
        if (!isS13YearRequest(title, fields)) return original(title, fields);

        const isFr = document.documentElement.lang === 'fr';
        const current = currentServiceYear();
        const field = {
            ...fields[0],
            label: isFr
                ? `Année de service (septembre–août, depuis ${FIRST_SERVICE_YEAR})`
                : `Служебный год (сентябрь–август, с ${FIRST_SERVICE_YEAR})`,
            type: 'select',
            value: String(current),
            options: serviceYearOptions(isFr)
        };

        return original(title, [field]);
    };

    Object.defineProperty(wrapped, '__s13YearSelectorWrapped', { value: true });
    window.requestAppFields = wrapped;
    return true;
}

if (!installS13YearSelector()) {
    window.addEventListener('DOMContentLoaded', installS13YearSelector, { once: true });
}
