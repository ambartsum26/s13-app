const style = document.createElement('style');
style.id = 's13-borderless-ui';
style.textContent = `
/* Borderless visual layer. Keeps border widths so the layout does not shift. */
*,
*::before,
*::after {
    border-color: transparent !important;
}

button,
a,
input,
select,
textarea {
    outline-color: transparent !important;
}

/* Remove decorative separator/highlight lines that are not actual borders. */
#grid > article::before {
    display: none !important;
}

/* Active navigation is indicated by text/background only, without an outline. */
.sidebar-btn.nav-active,
#cities-container button.bg-indigo-600 {
    border-color: transparent !important;
}

/* Hover states keep their fill/color but never restore an outline. */
button:not([data-language-toggle]):not(:disabled):hover,
a#map-link:hover,
a.mini-btn:hover,
.copy-map-btn:hover,
#cities-container button:hover,
#publishers-list > div:hover {
    border-color: transparent !important;
}
`;

document.head.appendChild(style);
