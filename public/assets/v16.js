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
 root.innerHTML='<div class="v16-urgent-head"><strong>⚠ SERVICIOS URGENTES</strong><span>Respuesta pendiente</span></div>'+list.map(s=>'<article class="v16-urgent-row"><div><b>'+escapeText(s.name)+'</b><small>'+escapeText(s.date)+' · '+escapeText(s.time)+' · '+escapeText(s.role)+' · '+s.places+' plazas</small></div><button class="btn dark" data-v16-open="'+escapeText(s.id)+'">Responder</button></article>').join('');
}
function escapeText(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))}
function refresh(){notifyUrgent()}
function askNotify(){try{if(!('Notification' in window))return;if(Notification.permission==='granted')return;if(Notification.permission==='default')Notification.requestPermission().catch(()=>{});}catch(e){}}
function showNotification(s){try{if(Notification.permission==='granted')new Notification('NOVA Crew · Servicio urgente',{body:s.name+' · '+s.date,tag:'nova-'+s.id});}catch(e){}}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-v16-open]');if(b){const id=b.dataset.v16Open;document.querySelector('[data-v15-shift-open="'+id+'"]')?.click();if(!document.querySelector('[data-v15-shift-open="'+id+'"]')){document.getElementById('notificationsBtn')?.click();setTimeout(()=>document.querySelector('[data-v15-shift-open="'+id+'"]')?.click(),0);}return;}
 if(e.target.closest('#v16OpenAdvancedCrew')){if(typeof toast==='function')toast('Crew Control','El control operativo completo sigue en adaptación. Puedes utilizar el Crew Control integrado.');}
});
const start=()=>{refresh();if(timer)clearInterval(timer);timer=setInterval(refresh,2500);};
window.NOVA_V16={refresh,requestAlerts:askNotify};
document.addEventListener('DOMContentLoaded',start);
if(document.readyState!=='loading')start();
})();