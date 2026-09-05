const byId = (id) => document.getElementById(id);
const isFrench = () => document.documentElement.lang === 'fr';

const style = document.createElement('style');
style.id = 's13-application-ui';
style.textContent = `
:root {
    color-scheme: dark;
    --dz-bg: #0b0d12;
    --dz-bg-soft: #10131a;
    --dz-panel: rgba(25, 28, 37, .94);
    --dz-panel-solid: #191c25;
    --dz-panel-raised: #20242f;
    --dz-control: #292e3a;
    --dz-control-hover: #343b49;
    --dz-line: rgba(255,255,255,.085);
    --dz-line-strong: rgba(255,255,255,.14);
    --dz-text: #f5f7fb;
    --dz-text-soft: #c4cad5;
    --dz-muted: #8f98a8;
    --dz-green: #35c985;
    --dz-green-bright: #53dfa0;
    --dz-green-soft: rgba(53,201,133,.14);
    --dz-blue: #6d93ff;
    --dz-blue-soft: rgba(78,123,255,.15);
    --dz-rose: #ff6f91;
    --dz-rose-soft: rgba(255,86,125,.15);
    --dz-amber: #f2b653;
    --dz-amber-soft: rgba(242,182,83,.15);
    --dz-radius: 16px;
    --dz-radius-sm: 12px;
    --dz-shadow: 0 18px 54px rgba(0,0,0,.28);
    --dz-shadow-soft: 0 10px 30px rgba(0,0,0,.18);
    --card-action-size: 44px;
}

html {
    min-width: 320px;
    background: var(--dz-bg) !important;
    scroll-behavior: smooth;
}
body {
    min-height: 100dvh;
    overflow-x: hidden;
    padding: clamp(8px, 1.5vw, 20px) !important;
    color: var(--dz-text) !important;
    background:
        radial-gradient(circle at 12% -10%, rgba(53,201,133,.10), transparent 31rem),
        radial-gradient(circle at 96% 12%, rgba(87,111,255,.08), transparent 28rem),
        var(--dz-bg) !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-size: 14px;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
}
body, button, input, textarea, select { font-family: inherit !important; }
button, a, input, textarea, select { -webkit-tap-highlight-color: transparent; }
button, a { touch-action: manipulation; }
h1, h2, h3, h4, h5, h6, b, strong { font-weight: 800 !important; letter-spacing: -.015em; }
button, label { font-weight: 700 !important; }
p, span, small, li, td, th { letter-spacing: 0; }
input, textarea, select { font-weight: 650 !important; text-transform: none !important; }
input::placeholder, textarea::placeholder { color: #70798a !important; font-weight: 600 !important; text-transform: none !important; }
::selection { background: rgba(53,201,133,.34); color: #fff; }

#home-page, #sidebar, button[onclick="toggleMobileSidebar()"] { display: none !important; }

.glass-panel {
    background: var(--dz-panel) !important;
    border: 1px solid var(--dz-line) !important;
    box-shadow: var(--dz-shadow-soft) !important;
    backdrop-filter: blur(18px) saturate(125%) !important;
    -webkit-backdrop-filter: blur(18px) saturate(125%) !important;
}

/* Password gate */
body[data-auth-state="locked"] {
    display: flow-root;
    background:
        radial-gradient(circle at 50% 4%, rgba(53,201,133,.16), transparent 30rem),
        var(--dz-bg) !important;
}
#auth-panel {
    box-sizing: border-box;
    width: min(430px, calc(100vw - 24px));
    max-width: none !important;
    margin: clamp(64px, 12vh, 124px) auto 0 !important;
    padding: 22px !important;
    border: 1px solid var(--dz-line-strong) !important;
    border-radius: 22px !important;
    background: rgba(24,27,35,.94) !important;
    color: var(--dz-text) !important;
    box-shadow: 0 28px 90px rgba(0,0,0,.44) !important;
    backdrop-filter: blur(22px) saturate(130%);
    -webkit-backdrop-filter: blur(22px) saturate(130%);
}
#auth-panel h1 {
    margin: 8px 0 24px !important;
    font-size: clamp(1.35rem, 5vw, 1.7rem) !important;
    line-height: 1.1;
    text-transform: none !important;
}
#auth-panel label {
    margin: 0 0 8px !important;
    color: var(--dz-text-soft) !important;
    font-size: 12px !important;
    text-transform: none !important;
}
#auth-panel #auth-email,
#auth-panel #auth-email-label { display: none !important; }
#auth-panel input {
    width: 100%;
    min-height: 50px !important;
    padding: 0 14px !important;
    border: 1px solid var(--dz-line-strong) !important;
    border-radius: 13px !important;
    background: #10131a !important;
    color: #fff !important;
    font-size: 16px !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.025) !important;
}
#auth-panel #auth-submit {
    width: 100%;
    min-height: 50px !important;
    margin-top: 16px !important;
    border: 0 !important;
    border-radius: 13px !important;
    background: var(--dz-green) !important;
    color: #06130d !important;
    font-size: 14px !important;
    font-weight: 800 !important;
}
#auth-panel #auth-submit:not(:disabled):hover { background: var(--dz-green-bright) !important; }
#auth-panel #auth-hint {
    margin: 16px 0 0 !important;
    color: var(--dz-muted) !important;
    font-size: 12px !important;
    line-height: 1.5 !important;
    text-transform: none !important;
}
#auth-message {
    min-height: 1.5em !important;
    margin: 13px 0 0 !important;
    color: #ff9db3 !important;
    font-size: 12px !important;
    line-height: 1.45 !important;
    text-transform: none !important;
}
#auth-panel #auth-language {
    float: none !important;
    margin: 0 0 0 auto !important;
}

/* Top application bar */
.app-header {
    position: sticky;
    top: clamp(6px, 1.2vw, 14px);
    z-index: 45;
    max-width: 1560px;
    min-height: 68px;
    margin: 0 auto 14px !important;
    padding: 11px 12px !important;
    border-radius: 18px !important;
    background: rgba(23,26,34,.88) !important;
    border: 1px solid var(--dz-line) !important;
    box-shadow: 0 14px 44px rgba(0,0,0,.26) !important;
    backdrop-filter: blur(20px) saturate(135%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(135%) !important;
}
.app-header > div:first-child { min-width: 0; }
.app-logo {
    width: 44px !important;
    height: 44px !important;
    flex: 0 0 44px;
    border-radius: 13px !important;
    background: linear-gradient(145deg, var(--dz-green-bright), #24ad70) !important;
    color: #07140e !important;
    border: 1px solid rgba(255,255,255,.16) !important;
    box-shadow: 0 8px 26px rgba(53,201,133,.18) !important;
}
#app-title {
    color:#fff !important;
    font-size: clamp(.82rem, 1.7vw, 1rem) !important;
    line-height:1.08 !important;
    font-weight:850 !important;
    letter-spacing:-.02em !important;
    text-transform: none !important;
}
#db-status {
    margin-top:4px !important;
    color:#75dca8 !important;
    font-size:10px !important;
    font-weight:650 !important;
    text-transform: none !important;
}
#db-status .animate-pulse { animation: statusPulse 2.4s ease-in-out infinite !important; }
@keyframes statusPulse { 50% { opacity: .45; } }
.app-header-actions { display:flex; align-items:center; justify-content:flex-end; gap:7px; flex:0 0 auto; }
.app-section-button {
    min-width: 44px;
    height:44px;
    min-height:44px;
    padding:0 14px !important;
    border-radius:12px !important;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    font-size:11px;
    white-space:nowrap;
}

/* Interactive controls */
button:not([data-language-toggle]), a#map-link, a.mini-btn, .copy-map-btn {
    background: var(--dz-control) !important;
    color: var(--dz-text) !important;
    border: 1px solid var(--dz-line) !important;
    outline: none !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.025) !important;
    text-decoration: none !important;
    transition: background-color .16s ease, border-color .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease !important;
}
@media (hover:hover) and (pointer:fine) {
    button:not([data-language-toggle]):not(:disabled):hover, a#map-link:hover, a.mini-btn:hover, .copy-map-btn:hover {
        background: var(--dz-control-hover) !important;
        border-color: rgba(83,223,160,.34) !important;
        color:#fff !important;
        transform:translateY(-1px) !important;
        box-shadow: 0 8px 22px rgba(0,0,0,.18) !important;
    }
}
button:not([data-language-toggle]):not(:disabled):active, a#map-link:active, a.mini-btn:active, .copy-map-btn:active {
    transform: scale(.975) !important;
}
button:not([data-language-toggle]):focus-visible, a#map-link:focus-visible, a.mini-btn:focus-visible, .copy-map-btn:focus-visible,
input:focus-visible, textarea:focus-visible, select:focus-visible, [data-language-toggle]:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(83,223,160,.22) !important;
    border-color: rgba(83,223,160,.62) !important;
}
button:disabled { opacity:.42 !important; cursor:not-allowed !important; transform:none !important; }
button[onclick*="delete"], button[onclick*="Delete"] { color:#ff9ab0 !important; }
@media (hover:hover) and (pointer:fine) {
    button[onclick*="delete"]:not(:disabled):hover, button[onclick*="Delete"]:not(:disabled):hover {
        background: rgba(255,86,125,.15) !important;
        border-color: rgba(255,111,145,.34) !important;
        color:#ffd4de !important;
    }
}

[data-language-toggle] {
    width:94px !important;
    height:44px !important;
    min-height:44px !important;
    padding:4px !important;
    border:1px solid var(--dz-line) !important;
    outline:none !important;
    border-radius:12px !important;
    background:#0f1218 !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035) !important;
}
[data-language-toggle] span { font-weight:800 !important; letter-spacing:.02em !important; }
[data-language-toggle]:hover { transform:none !important; }
#lang-slider, #auth-lang-slider {
    top:4px !important;
    bottom:4px !important;
    border-radius:9px !important;
    box-shadow:0 5px 16px rgba(0,0,0,.25) !important;
}

.app-main-wrap { display:block !important; width:100%; max-width:1560px; margin:0 auto; }
.app-main-wrap > main { width:100%; }

/* City switcher */
#city-switcher-panel {
    padding:7px !important;
    border-radius:16px !important;
    overflow:hidden;
    background:var(--dz-panel) !important;
    box-shadow:var(--dz-shadow-soft) !important;
}
#cities-container {
    display:flex !important;
    align-items:center;
    justify-content:flex-start;
    gap:6px !important;
    width:100%;
    margin:0 !important;
    padding:0 !important;
    overflow-x:auto;
    overflow-y:hidden;
    scrollbar-width:none;
    scroll-snap-type:x proximity;
    overscroll-behavior-x: contain;
}
#cities-container::-webkit-scrollbar { display:none; }
#cities-container button {
    flex:1 1 150px !important;
    width:auto !important;
    min-width:136px !important;
    max-width:280px !important;
    min-height:46px !important;
    padding:0 15px !important;
    border:1px solid transparent !important;
    border-radius:11px !important;
    background:transparent !important;
    color:var(--dz-text-soft) !important;
    text-align:center !important;
    font-size:11px !important;
    font-weight:750 !important;
    text-transform:none !important;
    box-shadow:none !important;
    scroll-snap-align:start;
    transform:none !important;
}
@media (hover:hover) and (pointer:fine) {
    #cities-container button:hover { background:rgba(255,255,255,.05) !important; color:#fff !important; border-color:var(--dz-line) !important; }
}
#cities-container button.bg-indigo-600,
#cities-container button.bg-indigo-600:hover {
    background:var(--dz-green-soft) !important;
    color:#92efbf !important;
    border:1px solid rgba(53,201,133,.26) !important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.03) !important;
}

/* Context panels */
.app-city-controls,
#publishers-page > .glass-panel {
    position:relative;
    padding:16px !important;
    border-radius:16px !important;
    background:var(--dz-panel) !important;
    box-shadow:var(--dz-shadow-soft) !important;
}
.app-city-controls { overflow:visible !important; }
.app-city-controls::before,
#publishers-page > .glass-panel::before { content:none !important; display:none !important; }
#active-city-title {
    color:#fff !important;
    font-size:clamp(1.12rem,2vw,1.42rem) !important;
    line-height:1.08 !important;
    font-weight:850 !important;
    letter-spacing:-.025em !important;
    text-transform:none !important;
}
.app-city-controls button, .app-status-toolbar button, .app-status-toolbar a { min-height:44px; border-radius:12px !important; }

#city-menu {
    right:0 !important;
    width:260px !important;
    margin:0 !important;
    padding:6px !important;
    border:1px solid var(--dz-line-strong) !important;
    border-radius:14px !important;
    background:#20242e !important;
    box-shadow:0 24px 70px rgba(0,0,0,.48) !important;
    overflow:hidden !important;
}
#city-menu button {
    min-height:44px;
    padding:0 12px !important;
    border-radius:10px !important;
    display:flex;
    align-items:center;
    gap:8px;
    background:transparent !important;
    color:#fff !important;
    text-transform:none !important;
}
#city-menu button + button { margin-top:3px; }
@media (hover:hover) and (pointer:fine) {
    #city-menu button:hover { background:rgba(255,255,255,.06) !important; border-color:transparent !important; }
}

/* Status summary: labels remain visible, color is supplemental rather than the only cue */
.app-status-toolbar {
    padding:9px !important;
    border-radius:16px !important;
    background:var(--dz-panel) !important;
    box-shadow:var(--dz-shadow-soft) !important;
}
.app-status-grid { display:grid !important; grid-template-columns:repeat(4,minmax(128px,1fr)); gap:7px !important; flex:1 1 680px; }
.status-chip {
    width:100%;
    min-width:0;
    height:62px !important;
    padding:0 12px !important;
    border:1px solid var(--dz-line) !important;
    border-radius:12px !important;
    box-shadow:none !important;
    display:flex !important;
    align-items:center !important;
    justify-content:flex-start !important;
    gap:10px !important;
    background:#171a22 !important;
}
.status-chip > div:first-child {
    display:flex !important;
    flex:0 0 30px;
    width:30px !important;
    height:30px !important;
    border-radius:9px !important;
    align-items:center !important;
    justify-content:center !important;
}
.status-chip > div:first-child i { display:block !important; font-size:11px !important; }
.status-chip > div:last-child {
    min-width:0;
    display:flex !important;
    flex-direction:column !important;
    align-items:flex-start !important;
    justify-content:center !important;
    gap:2px;
}
.status-chip > div:last-child > span {
    display:block !important;
    color:var(--dz-muted) !important;
    font-size:9px !important;
    line-height:1.1 !important;
    font-weight:750 !important;
    letter-spacing:.055em !important;
}
.status-chip b {
    font-variant-numeric:tabular-nums;
    color:#fff !important;
    font-size:1.25rem !important;
    line-height:1 !important;
    font-weight:850 !important;
}
.status-chip-free { border-color:rgba(53,201,133,.16) !important; }
.status-chip-free > div:first-child { background:var(--dz-green-soft) !important; color:var(--dz-green-bright) !important; }
.status-chip-busy { border-color:rgba(109,147,255,.16) !important; }
.status-chip-busy > div:first-child { background:var(--dz-blue-soft) !important; color:#8aa8ff !important; }
.status-chip-overdue { border-color:rgba(255,111,145,.18) !important; }
.status-chip-overdue > div:first-child { background:var(--dz-rose-soft) !important; color:#ff8faa !important; }
.status-chip-waiting { border-color:rgba(242,182,83,.18) !important; }
.status-chip-waiting > div:first-child { background:var(--dz-amber-soft) !important; color:#f5c36d !important; }
.app-status-actions { display:flex !important; align-items:center; gap:7px !important; }

/* Territory cards */
#grid { align-items:stretch; grid-template-columns:1fr !important; gap:12px !important; }
.territory-card {
    --card-state:#35c985;
    --card-state-soft:rgba(53,201,133,.13);
    border:1px solid color-mix(in srgb, var(--card-state) 24%, transparent) !important;
    border-radius:16px !important;
    overflow:hidden !important;
    background:linear-gradient(145deg, var(--card-state-soft), rgba(24,27,35,.96) 58%) !important;
    box-shadow:0 12px 34px rgba(0,0,0,.22) !important;
    transform-origin:center;
    transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease !important;
}
.territory-card.status-free { --card-state:#35c985; --card-state-soft:rgba(53,201,133,.16); }
.territory-card.status-busy { --card-state:#6d93ff; --card-state-soft:rgba(75,116,240,.17); }
.territory-card.status-overdue { --card-state:#ff6f91; --card-state-soft:rgba(229,69,107,.17); }
.territory-card.status-waiting { --card-state:#f2b653; --card-state-soft:rgba(213,145,34,.17); }
.territory-card::before {
    content:'' !important;
    display:block !important;
    position:absolute !important;
    top:0 !important;
    left:18px !important;
    right:18px !important;
    height:2px !important;
    background:linear-gradient(90deg,transparent,var(--card-state),transparent) !important;
    opacity:.7;
    pointer-events:none;
}
@media (hover:hover) and (pointer:fine) {
    .territory-card:hover {
        z-index:5;
        transform:translateY(-3px) !important;
        border-color:color-mix(in srgb, var(--card-state) 44%, transparent) !important;
        box-shadow:0 20px 48px rgba(0,0,0,.28) !important;
    }
}
.territory-card .territory-kicker,
.territory-card .badge.card-free-badge { display:none !important; }
.territory-card h3 {
    margin:0 !important;
    color:#fff !important;
    font-size:2.15rem !important;
    line-height:.95 !important;
    font-weight:880 !important;
    letter-spacing:-.045em !important;
    text-transform:none !important;
}
.territory-card .badge {
    min-width:44px;
    min-height:34px;
    padding:0 10px !important;
    border:1px solid color-mix(in srgb, var(--card-state) 30%, transparent) !important;
    border-radius:10px !important;
    display:inline-flex !important;
    align-items:center;
    justify-content:center;
    background:rgba(10,12,17,.46) !important;
    color:#fff !important;
    font-size:13px !important;
    font-weight:850 !important;
    font-variant-numeric:tabular-nums;
    backdrop-filter:blur(8px);
}
.territory-card .card-info-text p {
    color:rgba(245,247,251,.84) !important;
    font-size:11px !important;
    line-height:1.38 !important;
    font-weight:600 !important;
    text-transform:none !important;
    letter-spacing:0 !important;
}
.territory-card .card-info-text p b { color:#fff !important; font-weight:780 !important; }
.territory-card .card-icon-action,
.territory-card a.card-map-action,
.territory-card .copy-map-btn.card-icon-action,
.territory-card a.mini-btn.card-map-action,
.territory-card .card-main-action {
    border:1px solid rgba(255,255,255,.08) !important;
    outline:none !important;
    border-radius:12px !important;
    display:inline-flex !important;
    align-items:center !important;
    justify-content:center !important;
    background:rgba(17,20,27,.78) !important;
    color:#fff !important;
    box-shadow:0 7px 18px rgba(0,0,0,.13) !important;
    text-decoration:none !important;
    backdrop-filter:blur(8px);
}
.territory-card .card-icon-action i,
.territory-card a.card-map-action i,
.territory-card .card-main-action i { margin:0 !important; padding:0 !important; color:#fff !important; font-size:14px !important; line-height:1 !important; }
.territory-card .card-main-action i { font-size:18px !important; }
@media (hover:hover) and (pointer:fine) {
    .territory-card a.mini-btn.card-map-action:hover,
    .territory-card .card-icon-action:not(:disabled):hover,
    .territory-card .card-main-action:not(:disabled):hover {
        background:color-mix(in srgb, var(--card-state) 22%, #151820) !important;
        border-color:color-mix(in srgb, var(--card-state) 42%, transparent) !important;
        color:#fff !important;
        transform:translateY(-1px) !important;
    }
}
.territory-card .card-lock-action { opacity:.48 !important; pointer-events:none !important; }
.territory-card .waiting-return-line { color:rgba(245,247,251,.82) !important; }

/* Publishers */
#publishers-title {
    color:#fff !important;
    font-size:1.25rem !important;
    font-weight:850 !important;
    letter-spacing:-.025em !important;
    text-transform:none !important;
}
#publishers-search, #publisher-picker-search, #dialog-fields input {
    height:46px !important;
    border:1px solid var(--dz-line) !important;
    outline:none !important;
    border-radius:12px !important;
    background:#11141b !important;
    color:#fff !important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.025) !important;
}
#publishers-search:focus, #publisher-picker-search:focus, #dialog-fields input:focus {
    background:#151923 !important;
    border-color:rgba(83,223,160,.52) !important;
    box-shadow:0 0 0 3px rgba(83,223,160,.12) !important;
}
#publishers-list {
    display:grid !important;
    grid-template-columns:1fr !important;
    grid-auto-rows:minmax(64px,auto) !important;
    gap:8px !important;
    align-items:stretch !important;
}
#publishers-list > div, .publisher-row {
    display:grid !important;
    grid-template-columns:minmax(0,1fr) 96px !important;
    align-items:center !important;
    gap:12px !important;
    box-sizing:border-box !important;
    min-height:64px !important;
    margin:0 !important;
    padding:9px 10px 9px 15px !important;
    border:1px solid var(--dz-line) !important;
    border-radius:13px !important;
    background:#171a22 !important;
    box-shadow:none !important;
    transition:background-color .16s ease,border-color .16s ease,transform .16s ease !important;
}
#publishers-list > div > b, .publisher-row > b {
    display:block !important;
    min-width:0 !important;
    overflow:hidden !important;
    text-overflow:ellipsis !important;
    white-space:nowrap !important;
    color:#eef1f6 !important;
    font-size:13px !important;
    font-weight:720 !important;
    text-transform:none !important;
}
#publishers-list > div > div, .publisher-row > div {
    display:grid !important;
    grid-template-columns:repeat(2,44px) !important;
    gap:8px !important;
    width:96px !important;
    min-width:96px !important;
    max-width:96px !important;
    justify-self:end !important;
}
#publishers-list > div button, .publisher-row button {
    width:44px !important;
    min-width:44px !important;
    max-width:44px !important;
    height:44px !important;
    min-height:44px !important;
    max-height:44px !important;
    margin:0 !important;
    padding:0 !important;
    border-radius:11px !important;
}
@media (hover:hover) and (pointer:fine) {
    #publishers-list > div:hover { background:#1c2029 !important; border-color:var(--dz-line-strong) !important; transform:translateY(-1px) !important; }
}

/* Empty-state messaging */
.s13-empty-state {
    grid-column:1 / -1;
    min-height:148px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    gap:9px;
    padding:24px;
    border:1px dashed rgba(255,255,255,.11);
    border-radius:16px;
    color:var(--dz-muted);
    text-align:center;
    background:rgba(255,255,255,.018);
}
.s13-empty-state i { color:#697386; font-size:20px; }
.s13-empty-state span { max-width:420px; font-size:12px; font-weight:650 !important; text-transform:none !important; line-height:1.45; }

/* Popovers and dialogs */
.s13-popup-overlay {
    background:rgba(4,6,10,.76) !important;
    backdrop-filter:blur(12px) saturate(110%) !important;
    -webkit-backdrop-filter:blur(12px) saturate(110%) !important;
}
.s13-popup-overlay > .glass-panel {
    background:#1b1f28 !important;
    border:1px solid var(--dz-line-strong) !important;
    border-radius:18px !important;
    box-shadow:0 30px 90px rgba(0,0,0,.52) !important;
}
#dialog-modal .border-b, #dialog-modal .border-t, #history-modal .border-b, #publisher-picker-modal .border-b { border-color:var(--dz-line) !important; }
#history-list > div {
    background:#13161d !important;
    border:1px solid var(--dz-line) !important;
    border-radius:12px !important;
}
#publisher-picker-list button {
    min-height:46px;
    padding:0 13px !important;
    border:1px solid var(--dz-line) !important;
    border-radius:11px !important;
    background:#222733 !important;
    color:#fff !important;
    text-transform:none !important;
}

@media (min-width:640px) {
    #grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
    #publishers-list { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
}
@media (min-width:980px) { #grid { grid-template-columns:repeat(3,minmax(0,1fr)) !important; } }
@media (min-width:1460px) { #grid { grid-template-columns:repeat(4,minmax(0,1fr)) !important; } }

@media (max-width:1023px) {
    .app-status-grid { grid-template-columns:repeat(2,minmax(128px,1fr)); flex-basis:100%; }
}

@media (max-width:639px) {
    body { padding:7px !important; }
    .app-header { top:5px; min-height:62px; padding:8px 9px !important; margin-bottom:9px !important; border-radius:15px !important; }
    .app-logo { width:40px !important; height:40px !important; flex-basis:40px; border-radius:11px !important; }
    #app-title { font-size:.78rem !important; }
    #db-status { font-size:9px !important; }
    #city-switcher-panel, .app-city-controls, .app-status-toolbar, #publishers-page > .glass-panel { border-radius:14px !important; }
    #cities-container button { flex:0 0 auto !important; min-width:138px !important; max-width:none !important; min-height:48px !important; }
    .app-city-controls { padding:13px !important; align-items:stretch !important; }
    .app-city-controls > div:first-child { width:100%; }
    .app-city-controls > div:last-child { width:100%; display:grid !important; grid-template-columns:1fr 44px; gap:7px !important; }
    .app-city-controls > div:last-child > button:first-child { width:100%; }
    .app-status-toolbar { padding:7px !important; }
    .app-status-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px !important; }
    .status-chip { height:58px !important; padding:0 9px !important; gap:8px !important; }
    .status-chip > div:first-child { width:27px !important; height:27px !important; flex-basis:27px; }
    .status-chip > div:last-child > span { font-size:8px !important; }
    .status-chip b { font-size:1.15rem !important; }
    .app-status-actions { width:100%; display:grid !important; grid-template-columns:44px minmax(0,1fr) minmax(0,1fr); gap:6px !important; }
    .app-status-actions > * { width:100% !important; justify-content:center; }
    .territory-card { border-radius:14px !important; }
    .territory-card h3 { font-size:1.95rem !important; }
    .s13-popup-overlay { align-items:flex-end !important; padding:7px !important; }
    .s13-popup-overlay > .glass-panel {
        width:100% !important;
        max-width:none !important;
        max-height:calc(100dvh - 14px);
        overflow-y:auto;
        padding:16px !important;
        border-radius:18px 18px 13px 13px !important;
    }
}

@media (max-width:519px) {
    .app-section-button { width:44px; padding:0 !important; }
    .app-section-button span { display:none; }
    [data-language-toggle] { width:86px !important; }
    #auth-panel { padding:18px !important; border-radius:18px !important; }
}

@media (max-width:359px) {
    .app-header { gap:6px !important; }
    .app-header-actions { gap:4px; }
    [data-language-toggle] { width:78px !important; }
    .app-logo { width:38px !important; height:38px !important; flex-basis:38px; }
    .app-status-grid { grid-template-columns:1fr 1fr; }
    .status-chip { padding:0 7px !important; }
}

@media (hover:none), (pointer:coarse) {
    :root { --card-action-size:48px; }
    button:not([data-language-toggle]), a#map-link, a.mini-btn, .copy-map-btn { min-height:48px; }
    #publishers-list > div, .publisher-row { min-height:70px !important; grid-template-columns:minmax(0,1fr) 104px !important; }
    #publishers-list > div > div, .publisher-row > div { grid-template-columns:repeat(2,48px) !important; width:104px !important; min-width:104px !important; max-width:104px !important; }
    #publishers-list > div button, .publisher-row button { width:48px !important; min-width:48px !important; max-width:48px !important; height:48px !important; min-height:48px !important; max-height:48px !important; }
    .territory-card:hover, #publishers-list > div:hover, #cities-container button:hover { transform:none !important; }
}

@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior:auto; }
    *, *::before, *::after {
        animation-duration:.001ms !important;
        animation-iteration-count:1 !important;
        transition-duration:.001ms !important;
        scroll-behavior:auto !important;
    }
}
`;
document.head.appendChild(style);

function setAppTitle() {
    const title = byId('app-title');
    if (!title) return;
    const value = isFrench() ? 'Assistant de territoires' : 'Ассистент по участкам';
    if (title.textContent !== value) title.textContent = value;
}

function decorateLanguageToggle(toggle) {
    if (!toggle) return;
    const label = isFrench() ? 'Changer de langue' : 'Сменить язык';
    toggle.setAttribute('title', `${label} / ${isFrench() ? 'Сменить язык' : 'Changer de langue'}`);
    toggle.setAttribute('aria-label', toggle.title);
}

function decorateHeader() {
    const header = document.querySelector('body > header');
    if (!header) return;
    header.classList.add('app-header');
    header.querySelector('button[onclick="toggleMobileSidebar()"]')?.remove();
    header.querySelector('.fa-location-dot')?.parentElement?.classList.add('app-logo');

    let actions = header.querySelector('.app-header-actions');
    if (!actions) {
        actions = document.createElement('div');
        actions.className = 'app-header-actions';
        header.appendChild(actions);
    }

    let sectionButton = byId('app-section-button');
    if (!sectionButton) {
        sectionButton = document.createElement('button');
        sectionButton.id = 'app-section-button';
        sectionButton.type = 'button';
        sectionButton.className = 'app-section-button';
        actions.appendChild(sectionButton);
    }

    const languageToggle = header.querySelector('[data-language-toggle]');
    decorateLanguageToggle(languageToggle);
    if (languageToggle && languageToggle.parentElement !== actions) actions.appendChild(languageToggle);

    const logout = byId('auth-logout');
    if (logout && logout.parentElement !== actions) actions.appendChild(logout);
}

function moveCitiesToApplicationBar() {
    const territoriesPage = byId('territories-page');
    const citiesContainer = byId('cities-container');
    if (!territoriesPage || !citiesContainer) return;

    let panel = byId('city-switcher-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'city-switcher-panel';
        panel.className = 'glass-panel';
        territoriesPage.insertBefore(panel, territoriesPage.firstChild);
    }
    if (citiesContainer.parentElement !== panel) panel.appendChild(citiesContainer);
    citiesContainer.classList.remove('hidden');
    citiesContainer.setAttribute('role', 'navigation');
    citiesContainer.setAttribute('aria-label', isFrench() ? 'Villes' : 'Города');
}

function decorateCities() {
    const container = byId('cities-container');
    if (!container) return;
    container.setAttribute('aria-label', isFrench() ? 'Villes' : 'Города');
    container.querySelectorAll('button').forEach((button) => {
        const selected = button.classList.contains('bg-indigo-600');
        button.setAttribute('aria-current', selected ? 'page' : 'false');
        button.title = button.textContent?.trim() || '';
    });
}

function removeLegacyNavigation() {
    byId('sidebar')?.remove();
    const main = document.querySelector('main');
    main?.parentElement?.classList.add('app-main-wrap');
}

function decorateFixedSections() {
    byId('city-controls')?.classList.add('app-city-controls');
    const statFree = byId('st-free');
    const toolbar = statFree?.closest('section');
    if (!toolbar) return;
    toolbar.classList.add('app-status-toolbar');
    statFree.closest('.flex.flex-wrap')?.classList.add('app-status-grid');
    toolbar.querySelector(':scope > div:last-child')?.classList.add('app-status-actions');
    [
        ['st-free','status-chip-free'],
        ['st-busy','status-chip-busy'],
        ['st-overdue','status-chip-overdue'],
        ['st-waiting','status-chip-waiting']
    ].forEach(([id, className]) => byId(id)?.closest('.h-11')?.classList.add('status-chip', className));
}

function decoratePublishers() {
    byId('publishers-list')?.querySelectorAll(':scope > div').forEach((row) => {
        if (row.classList.contains('s13-empty-state')) return;
        row.classList.add('publisher-row');
        const edit = row.querySelector('button[onclick*="editPublisher"]');
        const remove = row.querySelector('button[onclick*="deletePublisher"]');
        if (edit) {
            edit.title = isFrench() ? 'Modifier' : 'Изменить';
            edit.setAttribute('aria-label', edit.title);
        }
        if (remove) {
            remove.title = isFrench() ? 'Supprimer' : 'Удалить';
            remove.setAttribute('aria-label', remove.title);
        }
    });
}

function syncSectionButton() {
    const button = byId('app-section-button');
    if (!button) return;
    const publishersOpen = !byId('publishers-page')?.classList.contains('hidden');
    if (publishersOpen) {
        button.innerHTML = `<i class="fa-solid fa-map-location-dot" aria-hidden="true"></i><span>${isFrench() ? 'Territoires' : 'Участки'}</span>`;
        button.title = isFrench() ? 'Territoires' : 'Участки';
    } else {
        button.innerHTML = `<i class="fa-solid fa-users" aria-hidden="true"></i><span>${isFrench() ? 'Proclamateurs' : 'Возвещатели'}</span>`;
        button.title = isFrench() ? 'Proclamateurs' : 'Возвещатели';
    }
    button.setAttribute('aria-label', button.title);
}

function showEmptyTerritories() {
    byId('publishers-page')?.classList.add('hidden');
    byId('territories-page')?.classList.remove('hidden');
    const controls = byId('city-controls');
    controls?.classList.remove('hidden');
    controls?.classList.add('flex');
    const title = byId('active-city-title');
    if (title) title.textContent = isFrench() ? 'Ajoutez une ville' : 'Добавьте город';
    scheduleEmptyStates();
}

function openTerritoriesApplication() {
    const cityButtons = [...(byId('cities-container')?.querySelectorAll('button') || [])];
    const selected = cityButtons.find((button) => button.classList.contains('bg-indigo-600'));
    const rememberedName = sessionStorage.getItem('s13-last-city-name');
    const remembered = cityButtons.find((button) => button.textContent === rememberedName);
    const target = selected || remembered || cityButtons[0];
    if (target) target.click();
    else showEmptyTerritories();
    syncSectionButton();
}

function setupNavigation() {
    const originalShowPublishersPage = window.showPublishersPage;
    window.showPublishersPage = () => {
        originalShowPublishersPage?.();
        decoratePublishers();
        syncSectionButton();
        scheduleEmptyStates();
    };

    window.showHomePage = openTerritoriesApplication;

    const sectionButton = byId('app-section-button');
    if (sectionButton) {
        sectionButton.onclick = () => {
            const publishersOpen = !byId('publishers-page')?.classList.contains('hidden');
            if (publishersOpen) openTerritoriesApplication();
            else window.showPublishersPage?.();
        };
    }

    byId('cities-container')?.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) sessionStorage.setItem('s13-last-city-name', button.textContent || '');
    }, true);
}

let emptyStateTimer = null;
function emptyState(container, icon, text) {
    let node = container.querySelector(':scope > .s13-empty-state');
    if (!node) {
        node = document.createElement('div');
        node.className = 's13-empty-state';
        node.setAttribute('role', 'status');
        node.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span></span>`;
        container.appendChild(node);
    }
    const label = node.querySelector('span');
    if (label) label.textContent = text;
}

function syncEmptyStates() {
    if (document.body.dataset.authState !== 'owner') return;

    const grid = byId('grid');
    if (grid) {
        const existing = grid.querySelector(':scope > .s13-empty-state');
        const hasCards = !!grid.querySelector(':scope > article');
        const territoriesVisible = !byId('territories-page')?.classList.contains('hidden');
        if (!territoriesVisible || hasCards) {
            existing?.remove();
        } else {
            const hasCities = !!byId('cities-container')?.querySelector('button');
            emptyState(
                grid,
                hasCities ? 'fa-map' : 'fa-location-dot',
                hasCities
                    ? (isFrench() ? 'Aucun territoire dans cette ville pour le moment.' : 'В этом городе пока нет участков.')
                    : (isFrench() ? 'Ajoutez une ville pour commencer.' : 'Добавьте город, чтобы начать.')
            );
        }
    }

    const publishers = byId('publishers-list');
    if (publishers) {
        const existing = publishers.querySelector(':scope > .s13-empty-state');
        const hasRows = [...publishers.children].some((node) => !node.classList.contains('s13-empty-state'));
        const visible = !byId('publishers-page')?.classList.contains('hidden');
        if (!visible || hasRows) {
            existing?.remove();
        } else {
            const searching = !!byId('publishers-search')?.value.trim();
            emptyState(
                publishers,
                searching ? 'fa-magnifying-glass' : 'fa-users',
                searching
                    ? (isFrench() ? 'Aucun résultat.' : 'Ничего не найдено.')
                    : (isFrench() ? 'La base des proclamateurs est vide.' : 'База возвещателей пока пуста.')
            );
        }
    }
}

function scheduleEmptyStates() {
    clearTimeout(emptyStateTimer);
    emptyStateTimer = setTimeout(syncEmptyStates, 220);
}

function observeStableSurfaces() {
    const publishers = byId('publishers-list');
    if (publishers) {
        new MutationObserver(() => queueMicrotask(() => {
            decoratePublishers();
            scheduleEmptyStates();
        })).observe(publishers, { childList:true, subtree:false });
    }

    const grid = byId('grid');
    if (grid) new MutationObserver(scheduleEmptyStates).observe(grid, { childList:true, subtree:false });

    const cities = byId('cities-container');
    if (cities) {
        new MutationObserver(() => queueMicrotask(() => {
            decorateCities();
            scheduleEmptyStates();
        })).observe(cities, { childList:true, subtree:false });
    }

    byId('publishers-search')?.addEventListener('input', scheduleEmptyStates);

    new MutationObserver(() => {
        queueMicrotask(() => {
            setAppTitle();
            syncSectionButton();
            decoratePublishers();
            decorateCities();
            decorateLanguageToggle(document.querySelector('header [data-language-toggle]'));
            decorateLanguageToggle(byId('auth-language'));
            scheduleEmptyStates();
        });
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
}

function initApplicationUi() {
    decorateHeader();
    moveCitiesToApplicationBar();
    removeLegacyNavigation();
    decorateFixedSections();
    setupNavigation();
    observeStableSurfaces();
    setAppTitle();
    syncSectionButton();
    decoratePublishers();
    decorateCities();
    decorateLanguageToggle(document.querySelector('header [data-language-toggle]'));
    decorateLanguageToggle(byId('auth-language'));
    scheduleEmptyStates();
}

initApplicationUi();
