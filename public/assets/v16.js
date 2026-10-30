/* NOVA Crew v16 urgent demo UI; fictional staffing only */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
let timer=null;
function notifyUrgent(){
 const list=window.NOVA_V15?.visibleShifts?.().filter(s=>s.urgent)||[];
 const root=$('v16UrgentBanner');if(!root)return;
 if(!list.length){root.classList.add('hidden');root.innerHTML='';return}
 root.classList.remove('hidden');
 root.innerHTML='<div class="v16-urgent-head"><strong>⚠ SERVICIOS URGENTES</strong><button type="button" class="v16-urgent-enable" id="v16AllowBrowserAlerts">Activar avisos</button></div>'+list.map(s=>'<article class="v16-urgent-row"><div><b>'+escapeText(s.name)+'</b><small>'+escapeText(s.date)+' · '+escapeText(s.time)+' · '+escapeText(s.role)+' · '+s.places+' plazas</small></div><button class="btn dark" data-v16-open="'+escapeText(s.id)+'">Responder</button></article>').join('');
}
function escapeText(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))}
function refresh(){notifyUrgent()}
function askNotify(){try{if(!('Notification' in window)){if(typeof toast==='function')toast('Avisos','Este navegador no admite notificaciones del sistema.');return}if(Notification.permission==='default'){Notification.requestPermission().then(result=>{if(typeof toast==='function')toast('Avisos',result==='granted'?'Avisos activados mientras el navegador está abierto.':'No se concedió permiso para avisos.');}).catch(()=>{});}else if(typeof toast==='function'){toast('Avisos',Notification.permission==='granted'?'Avisos habilitados.':'Permiso denegado en el navegador.')} }catch(e){}}
function showNotification(s){try{if(Notification.permission==='granted')new Notification('NOVA Crew · Servicio urgente',{body:s.name+' · '+s.date,tag:'nova-'+s.id});}catch(e){}}
document.addEventListener('click',e=>{
 if(e.target.closest('#v16AllowBrowserAlerts')){askNotify();return;}
 const b=e.target.closest('[data-v16-open]');if(b){const id=b.dataset.v16Open;document.querySelector('[data-v15-shift-open="'+id+'"]')?.click();if(!document.querySelector('[data-v15-shift-open="'+id+'"]')){document.getElementById('notificationsBtn')?.click();setTimeout(()=>document.querySelector('[data-v15-shift-open="'+id+'"]')?.click(),0);}return;}
 if(e.target.closest('#v16OpenAdvancedCrew')){if(typeof toast==='function')toast('Crew Control','El control operativo completo sigue en adaptación. Puedes utilizar el Crew Control integrado.');}
});
const start=()=>{refresh();if(timer)clearInterval(timer);timer=setInterval(refresh,2500);};
window.NOVA_V16={refresh,requestAlerts:askNotify};
document.addEventListener('DOMContentLoaded',start);
if(document.readyState!=='loading')start();
})();