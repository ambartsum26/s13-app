const css = `
:root{
  --dz-free:#22c55e;
  --dz-busy:#3b82f6;
  --dz-overdue:#ef4444;
  --dz-waiting:#f59e0b;
}

/* Readable working scale instead of the miniature showcase scale. */
.dz-app{
  grid-template-columns:240px minmax(0,1fr)!important;
  width:min(1660px,calc(100% - 28px))!important;
}
#sidebar{padding:24px 16px 18px!important;}
.dz-brand{height:auto!important;padding:4px 8px 24px!important;}
.dz-wordmark{font-size:24px!important;margin-bottom:8px!important;}
#app-title{font-size:11px!important;max-width:190px!important;line-height:1.25!important;}
#db-status{font-size:10px!important;margin-top:7px!important;gap:6px!important;}
#db-status span{width:7px!important;height:7px!important;flex-basis:7px!important;}
.dz-nav{gap:7px!important;margin-top:4px!important;}
.sidebar-btn{height:44px!important;border-radius:10px!important;padding:0 12px!important;font-size:13px!important;gap:11px!important;}
.sidebar-btn i{width:18px!important;font-size:12px!important;}
#cities-container{margin:6px 0 8px 25px!important;padding-left:10px!important;gap:3px!important;}
#cities-container button{min-height:34px!important;padding:6px 9px!important;font-size:11px!important;border-radius:8px!important;}

.dz-content{padding:18px 20px 28px!important;}
.dz-topbar{height:46px!important;padding:0 0 12px!important;justify-content:flex-end!important;}
.dz-top-left{display:none!important;}
.dz-icon-btn,.dz-avatar{display:none!important;}
[data-language-toggle]{width:82px!important;height:34px!important;border-radius:9px!important;padding:3px!important;}
[data-language-toggle] .dz-lang-slider,#lang-slider{left:3px!important;top:3px!important;bottom:3px!important;width:calc(50% - 3px)!important;border-radius:7px!important;}
[data-language-toggle] span{font-size:10px!important;}

.square-btn,.copy-map-btn{width:36px!important;height:36px!important;border-radius:9px!important;font-size:12px!important;}
.mini-btn,.action-btn{height:36px!important;padding:0 13px!important;border-radius:9px!important;font-size:11px!important;}

/* Home dashboard: keep the reference composition, make it usable. */
.dz-dashboard{gap:14px!important;}
.dz-overview-board{grid-template-columns:minmax(0,1fr) 235px!important;gap:13px!important;}
.dz-overview-main{grid-template-columns:340px minmax(0,1fr)!important;gap:13px!important;}
.dz-kpi-strip{gap:10px!important;}
.dz-kpi{height:108px!important;border-radius:13px!important;padding:15px!important;background:#565664!important;color:#fff!important;}
.dz-kpi span{font-size:11px!important;gap:7px!important;color:#d7d7df!important;}
.dz-kpi span i{font-size:11px!important;}
.dz-kpi strong{font-size:34px!important;margin-top:12px!important;color:#fff!important;}
.dz-kpi-line{height:4px!important;width:38px!important;margin-top:13px!important;}
.dz-kpi-free{box-shadow:inset 0 -4px 0 var(--dz-free)!important;}
.dz-kpi-busy{background:#565664!important;color:#fff!important;box-shadow:inset 0 -4px 0 var(--dz-busy)!important;}
.dz-kpi-busy span,.dz-kpi-busy strong{color:#fff!important;}
.dz-kpi-overdue{box-shadow:inset 0 -4px 0 var(--dz-overdue)!important;}
.dz-kpi-waiting{box-shadow:inset 0 -4px 0 var(--dz-waiting)!important;}
.dz-kpi-free .dz-kpi-line{background:var(--dz-free)!important;}
.dz-kpi-busy .dz-kpi-line{background:var(--dz-busy)!important;}
.dz-kpi-overdue .dz-kpi-line{background:var(--dz-overdue)!important;}
.dz-kpi-waiting .dz-kpi-line{background:var(--dz-waiting)!important;}

.dz-total-card{min-height:230px!important;border-radius:13px!important;padding:19px!important;}
.dz-total-card>span{font-size:12px!important;}
.dz-total-card>strong{font-size:48px!important;margin-top:16px!important;}
.dz-sparkline{display:none!important;}
.dz-total-foot{left:19px!important;right:19px!important;bottom:18px!important;padding-top:12px!important;}
.dz-total-foot b{font-size:24px!important;}.dz-total-foot small{font-size:10px!important;}

.dz-activity-card{min-height:230px!important;border-radius:13px!important;padding:15px!important;}
.dz-section-head,.dz-panel-head{margin-bottom:12px!important;}
.dz-section-head span,.dz-panel-head span{font-size:12px!important;}.dz-section-head b{font-size:12px!important;}.dz-panel-head i{font-size:11px!important;}
.dz-city-bars{gap:10px!important;}.dz-city-bar-head{font-size:10px!important;margin-bottom:6px!important;}.dz-city-bar-head b{font-size:10px!important;}.dz-city-meter{height:10px!important;border-radius:6px!important;}

.dz-lower-grid{gap:13px!important;}
.dz-panel{border-radius:13px!important;padding:15px!important;min-height:210px!important;}
.dz-alert-row,.dz-soon-row,.dz-recent-row{height:48px!important;border-radius:9px!important;margin-bottom:7px!important;padding:0 11px!important;gap:10px!important;}
.dz-alert-row{grid-template-columns:28px minmax(0,1fr) auto!important;}.dz-alert-index{width:26px!important;height:26px!important;font-size:9px!important;}
.dz-alert-row b,.dz-soon-row b,.dz-recent-row b{font-size:10px!important;}.dz-alert-row small,.dz-soon-row small,.dz-recent-row small{font-size:9px!important;margin-top:2px!important;}.dz-alert-row em,.dz-soon-row em,.dz-recent-row em{font-size:9px!important;}
.dz-recent-row{grid-template-columns:9px minmax(0,1fr) auto!important;}.dz-recent-dot{width:7px!important;height:7px!important;}.dz-empty{font-size:11px!important;padding:12px 2px!important;}

/* Territory controls and statistics. */
#territories-page{gap:13px!important;}
#city-controls{min-height:54px!important;}
#active-city-title{font-size:22px!important;}
#city-controls button{height:38px!important;min-width:38px!important;border-radius:9px!important;font-size:11px!important;padding:0 12px!important;}
#city-menu{width:210px!important;border-radius:10px!important;padding:7px!important;}
#city-menu button{height:38px!important;font-size:11px!important;border-radius:8px!important;}

#territories-page>section.glass-panel{gap:10px!important;}
#territories-page>section.glass-panel>div:first-child{grid-template-columns:repeat(4,minmax(130px,1fr))!important;gap:9px!important;}
#territories-page>section.glass-panel>div:first-child>div{height:70px!important;border-radius:11px!important;padding:11px 12px!important;gap:10px!important;}
#territories-page>section.glass-panel>div:first-child>div>div:first-child{width:34px!important;height:34px!important;border-radius:8px!important;font-size:12px!important;}
#territories-page>section.glass-panel>div:first-child span{font-size:9px!important;}
#territories-page>section.glass-panel>div:first-child b{font-size:20px!important;}
#territories-page>section.glass-panel>div:last-child{gap:7px!important;}
#territories-page>section.glass-panel>div:last-child>*,#map-link{height:70px!important;min-width:58px!important;border-radius:11px!important;font-size:11px!important;padding:0 14px!important;}

/* Restore territory status semantics exactly: green / blue / red / yellow. */
#grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:13px!important;}
#grid>article{min-height:245px!important;border-radius:14px!important;padding:17px!important;border:2px solid transparent!important;color:#fff!important;box-shadow:0 14px 30px rgba(0,0,0,.18)!important;}
#grid>article[class*="bg-emerald-900"]{background:#123b28!important;border-color:var(--dz-free)!important;color:#fff!important;}
#grid>article[class*="bg-blue-900"]{background:#142f57!important;border-color:var(--dz-busy)!important;color:#fff!important;}
#grid>article[class*="bg-rose-900"]{background:#4a1e27!important;border-color:var(--dz-overdue)!important;color:#fff!important;}
#grid>article[class*="bg-amber-900"]{background:#4a3716!important;border-color:var(--dz-waiting)!important;color:#fff!important;}
#grid>article h3{font-size:32px!important;color:#fff!important;margin-top:5px!important;}
#grid>article>div:nth-of-type(2){font-size:12px!important;color:#fff!important;line-height:1.55!important;}
#grid>article .text-slate-400,#grid>article .text-slate-300,#grid>article .text-amber-100\/80,#grid>article .text-amber-300,#grid>article .text-sky-400,#grid>article .text-white{color:rgba(255,255,255,.78)!important;}
#grid>article b{color:#fff!important;}
#grid>article .badge{font-size:9px!important;padding:6px 9px!important;border-radius:8px!important;background:rgba(0,0,0,.2)!important;color:#fff!important;}
#grid>article[class*="bg-blue-900"] .badge{border:1px solid rgba(96,165,250,.55)!important;}
#grid>article[class*="bg-rose-900"] .badge{border:1px solid rgba(248,113,113,.55)!important;}
#grid>article>div:last-child{border-top:1px solid rgba(255,255,255,.14)!important;padding-top:13px!important;}
#grid>article .square-btn,#grid>article .copy-map-btn,#grid>article .mini-btn,#grid>article .action-btn{background:rgba(0,0,0,.2)!important;color:#fff!important;border:1px solid rgba(255,255,255,.16)!important;}
#grid>article .square-btn:hover,#grid>article .copy-map-btn:hover,#grid>article .mini-btn:hover,#grid>article .action-btn:hover{background:rgba(255,255,255,.18)!important;color:#fff!important;}
#grid>article button[onclick*="issueTerritory"]{background:#fff!important;color:#20242c!important;border-color:#fff!important;height:36px!important;padding:0 14px!important;border-radius:9px!important;font-size:11px!important;font-weight:800!important;}

/* Publishers are a database, not a decorative leaderboard. */
#publishers-title{font-size:22px!important;}
#publisher-add-label{font-size:11px!important;}
#publishers-search,#publisher-picker-search,#dialog-fields input{height:44px!important;border-radius:9px!important;font-size:12px!important;padding-top:0!important;padding-bottom:0!important;}
#publishers-list{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;}
#publishers-list>div,#publishers-list>div:nth-child(n+4){grid-column:auto!important;min-height:62px!important;border-radius:11px!important;padding:12px!important;background:#565664!important;color:#fff!important;gap:10px!important;}
#publishers-list>div:nth-child(1),#publishers-list>div:nth-child(2),#publishers-list>div:nth-child(3){background:#565664!important;color:#fff!important;}
#publishers-list>div>b{font-size:12px!important;}
.dz-publisher-rank,.dz-publisher-avatar{display:none!important;}

/* Dialogs and history must be readable. */
#dialog-modal>.glass-panel,#confirm-modal>.glass-panel,#history-modal>.glass-panel,#publisher-picker-modal>.glass-panel{border-radius:13px!important;padding:20px!important;}
#dialog-modal h3,#history-modal h3,#publisher-picker-modal h3{font-size:15px!important;}
#dialog-fields label>span{font-size:10px!important;}
#confirm-text{font-size:13px!important;}
#history-list>div{border-radius:10px!important;padding:12px!important;font-size:12px!important;}
#history-list p{font-size:10px!important;}
#publisher-picker-list button{height:42px!important;border-radius:9px!important;font-size:12px!important;padding:0 12px!important;}

@media(max-width:1250px) and (min-width:1024px){
  .dz-app{grid-template-columns:215px minmax(0,1fr)!important;}
  #grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
  .dz-overview-main{grid-template-columns:300px minmax(0,1fr)!important;}
}

@media(max-width:1023px){
  .dz-content{padding:0 14px 24px!important;}
  .dz-mobile-head{height:66px!important;margin:0 -14px 14px!important;padding:0 14px!important;grid-template-columns:48px 1fr 48px!important;}
  .dz-mobile-menu{width:42px!important;height:42px!important;font-size:15px!important;}
  .dz-mobile-wordmark{font-size:20px!important;}
  .dz-mobile-lang{width:42px!important;height:42px!important;border-radius:10px!important;}
  .dz-mobile-lang:after{font-size:11px!important;}
  #sidebar{width:min(86vw,310px)!important;padding:22px 16px 18px!important;}

  .dz-dashboard{gap:11px!important;}
  .dz-overview-board{gap:11px!important;}
  .dz-kpi-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;}
  .dz-kpi{display:block!important;height:96px!important;padding:13px!important;border-radius:12px!important;}
  .dz-kpi-overdue,.dz-kpi-waiting{display:block!important;}
  .dz-kpi span{font-size:10px!important;}.dz-kpi strong{font-size:30px!important;margin-top:11px!important;}
  .dz-total-card{min-height:150px!important;border-radius:12px!important;padding:16px!important;}.dz-total-card>span{font-size:11px!important;}.dz-total-card>strong{font-size:42px!important;}
  .dz-activity-card{min-height:190px!important;border-radius:12px!important;padding:13px!important;}
  .dz-lower-grid{gap:10px!important;}.dz-panel{border-radius:12px!important;padding:13px!important;min-height:auto!important;}
  .dz-alert-row,.dz-soon-row,.dz-recent-row{height:52px!important;}

  #active-city-title{font-size:20px!important;}
  #city-controls{min-height:48px!important;}
  #city-controls button{height:38px!important;min-width:38px!important;font-size:11px!important;}
  #territories-page>section.glass-panel>div:first-child{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;}
  #territories-page>section.glass-panel>div:first-child>div{height:64px!important;}
  #territories-page>section.glass-panel>div:last-child{margin-top:8px!important;justify-content:flex-end!important;}
  #territories-page>section.glass-panel>div:last-child>*,#map-link{height:42px!important;min-width:42px!important;font-size:10px!important;padding:0 11px!important;}
  #grid{grid-template-columns:1fr!important;gap:10px!important;}
  #grid>article{min-height:210px!important;padding:15px!important;border-radius:13px!important;}
  #grid>article h3{font-size:30px!important;}
  #grid>article>div:nth-of-type(2){font-size:12px!important;}

  #publishers-list{grid-template-columns:1fr!important;gap:8px!important;}
  #publishers-list>div,#publishers-list>div:nth-child(n+4){min-height:58px!important;padding:11px!important;}
  #publishers-list>div>b{font-size:12px!important;}

  #dialog-modal,#confirm-modal,#history-modal,#publisher-picker-modal{padding:12px!important;}
  #dialog-modal>.glass-panel,#confirm-modal>.glass-panel,#history-modal>.glass-panel,#publisher-picker-modal>.glass-panel{padding:18px!important;max-height:calc(100dvh - 24px)!important;}
}
`;

const style = document.createElement('style');
style.id = 's13-usability-fix';
style.textContent = css;
document.head.appendChild(style);

// Remove showcase-only elements that have no application action.
[
  '.dz-top-left',
  '.dz-icon-btn',
  '.dz-avatar',
  '.dz-side-promo'
].forEach(selector => document.querySelectorAll(selector).forEach(el => el.remove()));

function syncMobileLanguageLabel() {
  const lang = document.documentElement.lang === 'fr' ? 'FR' : 'RU';
  document.querySelectorAll('.dz-mobile-lang').forEach(button => {
    button.setAttribute('data-current-lang', lang);
  });
}

new MutationObserver(syncMobileLanguageLabel).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang']
});
syncMobileLanguageLabel();
