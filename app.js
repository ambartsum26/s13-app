import './app-core.js';
import './app-ui.js';
import './popup-fixes.js';
import './app-card-tweaks.js';
import './s13-export.js';

function installJwBrand() {
    const header = document.querySelector('header');
    if (!header) return;

    const logo = header.querySelector('.app-logo') || header.querySelector('.fa-location-dot')?.parentElement;
    if (!logo) return;

    logo.classList.add('app-logo');
    logo.setAttribute('aria-label', 'JW');
    logo.innerHTML = '<span aria-hidden="true" style="color:#fff;font-size:15px;font-weight:900;line-height:1;letter-spacing:-0.04em;text-transform:uppercase;">JW</span>';
}

installJwBrand();
document.addEventListener('DOMContentLoaded', installJwBrand, { once: true });
