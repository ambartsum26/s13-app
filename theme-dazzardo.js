const css = `
:root{
  --app-bg:#06100e;
  --app-bg-2:#091613;
  --panel:#0b1714;
  --panel-2:#0e1d19;
  --panel-3:#11231e;
  --line:#213a32;
  --line-strong:#2d4c42;
  --text:#f3f7f5;
  --muted:#8ca098;
  --accent:#b8ff2c;
  --accent-2:#91e91b;
  --accent-soft:rgba(184,255,44,.10);
  --accent-border:rgba(184,255,44,.28);
}

*{scrollbar-color:#2a433a #06100e;}
html{background:var(--app-bg)!important;}
body{
  background:
    radial-gradient(circle at 18% -8%,rgba(184,255,44,.07),transparent 28%),
    radial-gradient(circle at 92% 8%,rgba(58,190,134,.05),transparent 24%),
    linear-gradient(180deg,#06100e 0%,#081410 52%,#06100e 100%)!important;
  color:var(--text)!important;
}
body::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.014) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);
  background-size:34px 34px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.38),transparent 72%);
  z-index:-1;
}

.glass-panel{
  background:linear-gradient(145deg,rgba(14,29,25,.985),rgba(8,18,15,.97))!important;
  border:1px solid var(--line)!important;
  box-shadow:0 18px 50px rgba(0,0,0,.24)!important;
  backdrop-filter:blur(16px)!important;
}
.glass-panel.rounded-3xl{border-radius:20px!important;}

header.glass-panel{
  background:rgba(7,17,14,.96)!important;
  border-color:#1c332b!important;
  box-shadow:0 10px 28px rgba(0,0,0,.2)!important;
}
header .bg-gradient-to-tr{
  background:var(--accent)!important;
  color:#07110e!important;
  box-shadow:0 0 0 1px rgba(184,255,44,.22),0 10px 28px rgba(184,255,44,.11)!important;
}
#app-title{letter-spacing:.04em!important;font-weight:800!important;}
#db-status{color:#9ecf78!important;}

#sidebar{
  background:linear-gradient(180deg,#0a1713 0%,#07120f 100%)!important;
  border-color:#1f382f!important;
  box-shadow:0 20px 55px rgba(0,0,0,.28)!important;
}
.sidebar-btn{
  border-color:transparent!important;
  border-radius:13px!important;
  color:#aebfba!important;
  min-height:46px!important;
  font-weight:700!important;
  background:transparent!important;
}
.sidebar-btn:hover{
  background:rgba(184,255,44,.08)!important;
  border-color:rgba(184,255,44,.16)!important;
  color:#f8ffe9!important;
  transform:translateX(2px)!important;
}
.sidebar-btn.nav-active{
  background:rgba(184,255,44,.105)!important;
  border-color:rgba(184,255,44,.28)!important;
  color:var(--accent)!important;
  box-shadow:inset 3px 0 0 var(--accent)!important;
}
.sidebar-btn.nav-active i{color:var(--accent)!important;}
#cities-container{border-left-color:#274139!important;}
#cities-container button{
  border:1px solid transparent!important;
  border-radius:11px!important;
  color:#849a92!important;
  background:transparent!important;
}
#cities-container button.bg-indigo-600{
  background:rgba(184,255,44,.08)!important;
  color:var(--accent)!important;
  border-color:rgba(184,255,44,.22)!important;
}
#cities-container button:hover{
  background:rgba(184,255,44,.11)!important;
  color:#fff!important;
  border-color:rgba(184,255,44,.28)!important;
}

button:not([data-language-toggle]),a#map-link,a.mini-btn,.copy-map-btn{
  background:transparent!important;
  border-color:#355149!important;
  color:#dfe8e5!important;
  box-shadow:none!important;
}
button:not([data-language-toggle]):not(:disabled):hover,
a#map-link:hover,a.mini-btn:hover,.copy-map-btn:hover{
  background:var(--accent)!important;
  color:#07110e!important;
  border-color:var(--accent)!important;
  box-shadow:0 10px 26px rgba(184,255,44,.15)!important;
}
button:not([data-language-toggle]):focus-visible,
a#map-link:focus-visible,a.mini-btn:focus-visible{
  outline:2px solid var(--accent)!important;
  outline-offset:2px!important;
}
button:disabled{opacity:.4!important;cursor:not-allowed!important;}

[data-language-toggle]{
  background:#06100e!important;
  border-color:#294238!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.01)!important;
}
#lang-slider{box-shadow:none!important;}

input{
  background:#07120f!important;
  border-color:#294139!important;
  color:#edf4f1!important;
  box-shadow:none!important;
}
input::placeholder{color:#657970!important;}
input:focus{border-color:var(--accent)!important;box-shadow:0 0 0 3px rgba(184,255,44,.07)!important;}

#city-controls{
  background:linear-gradient(145deg,#0d1c18,#091411)!important;
  border-color:#223d34!important;
}
#active-city-title{letter-spacing:.01em!important;}

/* Territory stats */
#territories-page>section.glass-panel:nth-of-type(1){
  background:linear-gradient(145deg,#0d1b18,#091411)!important;
}
#territories-page>section.glass-panel:nth-of-type(1) .h-11{
  background:rgba(255,255,255,.018)!important;
  border-color:#294139!important;
  box-shadow:none!important;
}
#territories-page>section.glass-panel:nth-of-type(1) .h-11:hover{
  border-color:#36594e!important;
}

/* Territory cards preserve state colors */
#grid>article{
  position:relative;
  overflow:hidden;
  border-radius:18px!important;
  min-height:236px!important;
  box-shadow:0 14px 34px rgba(0,0,0,.2)!important;
  background-image:linear-gradient(145deg,rgba(255,255,255,.022),rgba(255,255,255,0))!important;
}
#grid>article[class*="bg-emerald-900"]{background-color:#0f241c!important;border-color:#2f7656!important;}
#grid>article[class*="bg-blue-900"]{background-color:#0f1f31!important;border-color:#315f95!important;}
#grid>article[class*="bg-rose-900"]{background-color:#291518!important;border-color:#8e3f48!important;}
#grid>article[class*="bg-amber-900"]{background-color:#2a2313!important;border-color:#8f7638!important;}
#grid>article:hover{transform:translateY(-4px)!important;box-shadow:0 22px 48px rgba(0,0,0,.32)!important;}
#grid>article::before{background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)!important;}
#grid>article h3{font-size:1.5rem!important;letter-spacing:-.025em!important;}
#grid>article .badge{background:rgba(4,10,8,.32)!important;border-color:currentColor!important;backdrop-filter:blur(8px);}
#grid>article .pt-3.border-t{border-color:rgba(255,255,255,.08)!important;}

/* Dashboard */
#home-page{background:transparent!important;border:0!important;box-shadow:none!important;}
#home-page .glass-panel{background:linear-gradient(145deg,#0d1a17,#091411)!important;border-color:#223c33!important;}
#home-page section.grid>div.glass-panel{min-height:102px;}
#home-page section.grid>div.glass-panel .text-2xl{letter-spacing:-.03em!important;}
#home-page section.flex>button{
  background:#0a1612!important;
  border-color:#284039!important;
}
#home-page section.flex>button:hover{
  background:rgba(184,255,44,.09)!important;
  border-color:rgba(184,255,44,.35)!important;
  color:#fff!important;
}
#home-page section.grid.xl\\:grid-cols-2>.glass-panel button{
  border-color:transparent!important;
  border-bottom-color:#20372f!important;
  border-radius:10px!important;
}
#home-page section.grid.xl\\:grid-cols-2>.glass-panel button:hover{
  background:rgba(184,255,44,.075)!important;
  border-color:rgba(184,255,44,.18)!important;
}
#home-page section:last-child .grid{border-color:#20372f!important;}

/* Publishers */
#publishers-page>.glass-panel{
  background:linear-gradient(145deg,#0d1a17,#091411)!important;
  border-color:#223c33!important;
}
#publishers-list>div{
  background:linear-gradient(145deg,#0d1a17,#091411)!important;
  border-color:#243c34!important;
  border-radius:16px!important;
  box-shadow:0 10px 26px rgba(0,0,0,.16)!important;
}
#publishers-list>div:hover{
  border-color:rgba(184,255,44,.32)!important;
  background:linear-gradient(145deg,#10211c,#0a1713)!important;
}
#publishers-list>div b{font-weight:700!important;}

/* Menus + modals */
#city-menu,
#dialog-modal .glass-panel,
#confirm-modal .glass-panel,
#history-modal .glass-panel,
#publisher-picker-modal .glass-panel{
  background:linear-gradient(180deg,#0f1e1a,#091411)!important;
  border-color:#294239!important;
  box-shadow:0 28px 78px rgba(0,0,0,.5)!important;
}
#city-menu{border-radius:15px!important;overflow:hidden!important;}
#city-menu button{border:0!important;border-radius:0!important;}
#city-menu button:hover,
#publisher-picker-list button:hover{
  background:var(--accent)!important;
  color:#07110e!important;
}
#dialog-modal,#confirm-modal,#history-modal,#publisher-picker-modal{
  background:rgba(2,8,6,.78)!important;
  backdrop-filter:blur(12px)!important;
}
#dialog-modal .glass-panel,
#confirm-modal .glass-panel,
#history-modal .glass-panel,
#publisher-picker-modal .glass-panel{border-radius:18px!important;}
#dialog-title,#history-title,#publisher-picker-title{font-weight:800!important;}
#dialog-fields label>span{color:#83978f!important;letter-spacing:.08em!important;}
#history-list>div{
  background:#081310!important;
  border-color:#223a32!important;
  border-radius:14px!important;
}
#publisher-picker-list button{
  background:#081310!important;
  border-color:#263f36!important;
  border-radius:12px!important;
}

/* Copy buttons and icon controls */
.square-btn,.copy-map-btn{border-radius:10px!important;}
.mini-btn,.action-btn{border-radius:10px!important;}

::-webkit-scrollbar{width:10px;height:10px;}
::-webkit-scrollbar-track{background:#06100e;}
::-webkit-scrollbar-thumb{background:#274038;border-radius:999px;border:2px solid #06100e;}
::-webkit-scrollbar-thumb:hover{background:#3a5a50;}

@media (max-width:1023px){
  body{padding:10px!important;}
  header.glass-panel{
    position:sticky;
    top:6px;
    z-index:55;
    border-radius:17px!important;
    padding:11px 12px!important;
    margin-bottom:12px!important;
  }
  header .w-10.h-10{width:36px!important;height:36px!important;border-radius:11px!important;}
  #app-title{font-size:.76rem!important;}
  #db-status{font-size:.6rem!important;}
  #sidebar.mobile-open{
    top:68px!important;
    left:10px!important;
    right:10px!important;
    max-height:calc(100vh - 82px)!important;
    border-radius:18px!important;
    background:linear-gradient(180deg,#0a1713,#07120f)!important;
    border-color:#223b32!important;
    box-shadow:0 26px 80px rgba(0,0,0,.6)!important;
    padding:12px!important;
  }
  #sidebar.mobile-open::before{
    content:"";
    position:fixed;
    inset:0;
    background:rgba(1,6,5,.56);
    backdrop-filter:blur(6px);
    z-index:-1;
  }
  main{gap:12px!important;}
  #territories-page,#home-page{gap:12px!important;}
  #city-controls{padding:13px!important;border-radius:17px!important;}
  #city-controls>div:last-child{width:100%;justify-content:flex-end;}
  #territories-page>section.glass-panel:nth-of-type(1){padding:13px!important;border-radius:17px!important;}
  #territories-page>section.glass-panel:nth-of-type(1)>.flex:first-child{display:grid!important;grid-template-columns:1fr 1fr!important;width:100%;gap:8px!important;}
  #territories-page>section.glass-panel:nth-of-type(1) .h-11{width:100%!important;justify-content:flex-start!important;padding:0 11px!important;border-radius:14px!important;}
  #territories-page>section.glass-panel:nth-of-type(1)>.flex:last-child{width:100%;justify-content:flex-end;margin-top:2px;}
  #grid{grid-template-columns:1fr!important;gap:10px!important;}
  #grid>article{min-height:auto!important;padding:13px!important;border-radius:16px!important;}
  #home-page section.grid.grid-cols-2{gap:8px!important;}
  #home-page section.grid.grid-cols-2>div{padding:12px!important;border-radius:16px!important;min-height:88px!important;}
  #home-page section.grid.xl\\:grid-cols-2{grid-template-columns:1fr!important;gap:10px!important;}
  #home-page .glass-panel{border-radius:16px!important;}
  #home-page section.flex{margin-inline:-1px;padding-bottom:3px!important;}
  #home-page section.flex>button{min-width:148px!important;padding:10px 11px!important;border-radius:14px!important;}
  #home-page section:last-child .grid{grid-template-columns:1fr!important;gap:3px!important;}
  #publishers-page .glass-panel{border-radius:16px!important;padding:13px!important;}
  #publishers-list>div{padding:11px!important;border-radius:14px!important;}
  #dialog-modal>div,#confirm-modal>div,#publisher-picker-modal>div,#history-modal>div{
    width:calc(100vw - 20px)!important;
    max-width:none!important;
    max-height:calc(100vh - 20px)!important;
    border-radius:18px!important;
  }
  #history-list{max-height:58vh;overflow:auto;padding-right:2px;}
}

@media (max-width:560px){
  [data-language-toggle]{width:76px!important;height:36px!important;}
  #home-page section.grid.grid-cols-2{grid-template-columns:1fr 1fr!important;}
  #home-page section.grid.grid-cols-2>div .text-2xl{font-size:1.28rem!important;}
  #home-page section.grid.grid-cols-2>div .w-10.h-10{width:32px!important;height:32px!important;border-radius:10px!important;}
  #city-controls{align-items:flex-start!important;}
  #active-city-title{font-size:1rem!important;}
  #city-controls>div:last-child{justify-content:space-between!important;}
  #territories-page>section.glass-panel:nth-of-type(1)>.flex:last-child{justify-content:space-between!important;}
  #territories-page>section.glass-panel:nth-of-type(1)>.flex:last-child>*{flex:1 1 auto;}
  #map-link{justify-content:center!important;}
  #publishers-page .flex-col.sm\\:flex-row{gap:10px!important;}
  #publishers-page .flex-col.sm\\:flex-row>button{width:100%!important;}
  #dialog-fields input{height:42px!important;}
}
`;

const old = document.getElementById('dazzardo-inspired-theme');
if (old) old.remove();
const style = document.createElement('style');
style.id = 'dazzardo-inspired-theme';
style.textContent = css;
document.head.appendChild(style);
