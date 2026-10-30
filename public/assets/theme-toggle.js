/* NOVA Crew theme toggle. Shared visual preference, no account data. */
(()=>{
'use strict';
const button=document.getElementById('novaThemeToggle');
if(!button)return;
const key='nova-crew-theme-v1';
const moon='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/></svg>';
const sun='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
function setTheme(dark){
 document.documentElement.dataset.novaTheme=dark?'dark':'light';
 button.setAttribute('aria-pressed',String(dark));
 button.setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');
 button.title=dark?'Modo claro':'Modo oscuro';
 button.innerHTML=dark?sun:moon;
 const theme=document.querySelector('meta[name="theme-color"]');
 if(theme)theme.content=dark?'#171b22':'#101014';
 try{localStorage.setItem(key,dark?'dark':'light')}catch{}
}
let saved='light';try{saved=localStorage.getItem(key)||'light'}catch{}
setTheme(saved==='dark');
button.addEventListener('click',()=>setTheme(document.documentElement.dataset.novaTheme!=='dark'));
})();