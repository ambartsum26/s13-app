const css = `
:root{
  --app-bg:#07110f;
  --app-bg-2:#0a1714;
  --panel:#0d1917;
  --panel-2:#101f1c;
  --panel-3:#132520;
  --line:#243a34;
  --line-soft:rgba(148,163,184,.14);
  --text:#f4f7f6;
  --muted:#8fa39d;
  --accent:#b7ff2a;
  --accent-2:#8eea19;
  --accent-soft:rgba(183,255,42,.09);
}

html{background:var(--app-bg)!important;}
body{
  background:
    radial-gradient(circle at 18% 0%,rgba(117,255,63,.065),transparent 28%),
    radial-gradient(circle at 88% 8%,rgba(33,180,128,.055),transparent 22%),
    linear-gradient(180deg,#07110f 0%,#081310 52%,#06100e 100%)!important;
  color:var(--text)!important;
}

body::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);
  background-size:36px 36px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.25),transparent 65%);
  z-index:-1;
}

.glass-panel{
  background:linear-gradient(145deg,rgba(14,27,24,.98),rgba(9,20,17,.96))!important;
  border:1px solid var(--line)!important;
  box-shadow:0 20px 60px rgba(0,0,0,.28)!important;
  backdrop-filter:blur(16px)!important;
}

header.glass-panel{
  background:rgba(8,18,15,.94)!important;
  border-color:#1d332c!important;
  box-shadow:0 10px 30px rgba(0,0,0,.22)!important;
}

header .bg-gradient-to-tr{
  background:var(--accent)!important;
  color:#07110f!important;
  box-shadow:0 0 0 1px rgba(183,255,42,.25),0 10px 30px rgba(183,255,42,.12)!important;
}

#app-title{letter-spacing:.035em!important;}
#db-status{color:#9bd36f!important;}

#sidebar{
  background:linear-gradient(180deg,#0b1714 0%,#08120f 100%)!important;
  border-color:#20372f!important;
}

.sidebar-btn{
  border-color:transparent!important;
  border-radius:14px!important;
  color:#aebfba!important;
  min-height:46px!important;
}
.sidebar-btn:hover{
  background:rgba(183,255,42,.085)!important;
  border-color:rgba(183,255,42,.18)!important;
  color:#f7ffe9!important;
  transform:translateX(2px)!important;
}
.sidebar-btn.nav-active{
  background:rgba(183,255,42,.11)!important;
  border-color:rgba(183,255,42,.3)!important;
  color:var(--accent)!important;
  box-shadow:inset 3px 0 0 var(--accent)!important;
}
.sidebar-btn.nav-active i{color:var(--accent)!important;}

#cities-container{
  border-left-color:#264039!important;
}
#cities-container button{
  border:1px solid transparent!important;
  color:#879c95!important;
  border-radius:12px!important;
}
#cities-container button.bg-indigo-600{
  background:rgba(183,255,42,.08)!important;
  color:var(--accent)!important;
  border-color:rgba(183,255,42,.22)!important;
}
#cities-container button:hover{
  background:rgba(183,255,42,.12)!important;
  color:#fff!important;
  border-color:rgba(183,255,42,.3)!important;
}

button:not([data-language-toggle]),a#map-link,a.mini-btn,.copy-map-btn{
  background:transparent!important;
  border-color:#355048!important;
  color:#dce7e3!important;
  box-shadow:none!important;
}
button:not([data-language-toggle]):not(:disabled):hover,a#map-link:hover,a.mini-btn:hover,.copy-map-btn:hover{
  background:var(--accent)!important;
  color:#07110f!important;
  border-color:var(--accent)!important;
  box-shadow:0 10px 28px rgba(183,255,42,.16)!important;
}
button:not([data-language-toggle]):focus-visible,a#map-link:focus-visible,a.mini-btn:focus-visible{
  outline:2px solid var(--accent)!important;
  outline-offset:2px!important;
}

[data-language-toggle]{
  background:#07110f!important;
  border-color:#294139!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.015)!important;
}
#lang-slider{box-shadow:none!important;}

input{
  background:#081310!important;
  border-color:#294039!important;
  color:#eef5f2!important;
}
input::placeholder{color:#62766f!important;}
input:focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px rgba(183,255,42,.08)!important;}

#city-controls,.glass-panel.rounded-3xl{
  border-radius:22px!important;
}

/* Territory cards keep their original status meaning, but use the new visual language. */
#grid>article{
  border-radius:20px!important;
  min-height:238px!important;
  box-shadow:0 14px 36px rgba(0,0,0,.2)!important;
  background-image:linear-gradient(145deg,rgba(255,255,255,.025),rgba(255,255,255,0))!important;
}
#grid>article[class*="bg-emerald-900"]{
  background-color:#10251d!important;
  border-color:#2c7453!important;
}
#grid>article[class*="bg-blue-900"]{
  background-color:#102033!important;
  border-color:#315f96!important;
}
#grid>article[class*="bg-rose-900"]{
  background-color:#2a1519!important;
  border-color:#8e3d48!important;
}
#grid>article[class*="bg-amber-900"]{
  background-color:#2b2413!important;
  border-color:#8e7537!important;
}
#grid>article:hover{
  transform:translateY(-4px)!important;
  box-shadow:0 22px 52px rgba(0,0,0,.34)!important;
}
#grid>article::before{
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.11),transparent)!important;
}

.badge{
  background:rgba(5,12,10,.38)!important;
  border-color:currentColor!important;
  backdrop-filter:blur(8px);
}

#publishers-list>div{
  background:linear-gradient(145deg,#0e1c18,#0a1512)!important;
  border-color:#243b34!important;
  border-radius:17px!important;
}
#publishers-list>div:hover{
  border-color:rgba(183,255,42,.35)!important;
  background:linear-gradient(145deg,#11221d,#0b1714)!important;
}

#city-menu,
#dialog-modal .glass-panel,
#confirm-modal .glass-panel,
#history-modal .glass-panel,
#publisher-picker-modal .glass-panel{
  background:linear-gradient(180deg,#101f1b,#0a1512)!important;
  border-color:#2a433a!important;
  box-shadow:0 28px 80px rgba(0,0,0,.5)!important;
}

#city-menu button:hover,
#publisher-picker-list button:hover{
  background:var(--accent)!important;
  color:#07110f!important;
}

#home-page .glass-panel{
  background:linear-gradient(145deg,#0d1a17,#0a1512)!important;
}
#home-page section.grid>div.glass-panel{
  min-height:104px;
}
#home-page section.flex>button{
  background:#0b1714!important;
  border-color:#294139!important;
}
#home-page section.flex>button:hover{
  background:rgba(183,255,42,.11)!important;
  border-color:rgba(183,255,42,.4)!important;
  color:#fff!important;
}

::-webkit-scrollbar{width:10px;height:10px;}
::-webkit-scrollbar-track{background:#07110f;}
::-webkit-scrollbar-thumb{background:#284239;border-radius:999px;border:2px solid #07110f;}
::-webkit-scrollbar-thumb:hover{background:#3e5d52;}

@media (max-width:1023px){
  body{padding:12px!important;}
  header.glass-panel{
    position:sticky;
    top:8px;
    z-index:55;
    border-radius:18px!important;
    padding:12px 13px!important;
    margin-bottom:14px!important;
  }
  header .w-10.h-10{width:38px!important;height:38px!important;border-radius:12px!important;}
  #app-title{font-size:.78rem!important;}
  #db-status{font-size:.62rem!important;}
  #sidebar.mobile-open{
    top:74px!important;
    left:12px!important;
    right:12px!important;
    max-height:calc(100vh - 92px)!important;
    border-radius:20px!important;
    background:#091511!important;
    box-shadow:0 28px 90px rgba(0,0,0,.62)!important;
  }
  main{gap:14px!important;}
  #territories-page,#home-page{gap:14px!important;}
  #city-controls{padding:14px!important;border-radius:18px!important;}
  #city-controls>div:last-child{width:100%;justify-content:flex-end;}
  #grid{grid-template-columns:1fr!important;gap:12px!important;}
  #grid>article{min-height:auto!important;padding:14px!important;border-radius:18px!important;}
  #home-page section.grid.grid-cols-2{gap:10px!important;}
  #home-page section.grid.grid-cols-2>div{padding:13px!important;border-radius:18px!important;min-height:92px!important;}
  #home-page section.grid.xl\\:grid-cols-2{grid-template-columns:1fr!important;gap:12px!important;}
  #home-page .glass-panel{border-radius:18px!important;}
  #home-page section.flex{margin-inline:-2px;padding-bottom:4px!important;}
  #home-page section.flex>button{min-width:150px!important;padding:11px 12px!important;border-radius:15px!important;}
  #publishers-page .glass-panel{border-radius:18px!important;}
  #publishers-list>div{padding:12px!important;}
  #dialog-modal>div,#confirm-modal>div,#publisher-picker-modal>div,#history-modal>div{
    width:calc(100vw - 24px)!important;
    max-width:none!important;
    max-height:calc(100vh - 24px)!important;
    border-radius:20px!important;
  }
}

@media (max-width:560px){
  [data-language-toggle]{width:78px!important;height:38px!important;}
  #home-page section.grid.grid-cols-2{grid-template-columns:1fr 1fr!important;}
  #home-page section.grid.grid-cols-2>div .text-2xl{font-size:1.35rem!important;}
  #home-page section.grid.grid-cols-2>div .w-10.h-10{width:34px!important;height:34px!important;border-radius:12px!important;}
  #city-controls{align-items:flex-start!important;}
  #active-city-title{font-size:1rem!important;}
}
`;

const style = document.createElement('style');
style.id = 'dazzardo-inspired-theme';
style.textContent = css;
document.head.appendChild(style);
