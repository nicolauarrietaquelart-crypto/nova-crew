/* Embed original Crew Control as first-class tool in NOVA Crew. */
(()=>{
'use strict';
const root=document.getElementById('crewControlRoot');
if(!root)return;
let current=null;
let iframe=null;
let resizeObserver=null;
const original=window.renderCrewControl;
function managerAllowed(service){
 const uid=window.novaActiveAccount||window.NOVA_API?.account;
 return !!service && (service.coordinatorUserId===uid || service.privilege==='crew' || service.assignedCoordinator);
}
window.renderCrewControl=function(service){
 if(!managerAllowed(service)){if(typeof toast==='function')toast('Crew Control','No tienes asignación de gestión de este servicio.');return;}
 if(current===service.id && iframe){return;}
 current=service.id;
 root.innerHTML=`<div class="ccframe-toolbar"><div><strong>Crew Control</strong><small>Interfaz original v11.2.30 · Almacenamiento Cloudflare · Datos ficticios</small></div><div class="ccframe-toolbar-actions"><button type="button" class="btn light" id="ccframeReload">Actualizar</button><button type="button" class="btn dark" id="ccframeQr">Escanear QR</button></div></div><div class="ccframe-container"><iframe title="Crew Control original" class="ccframe" id="ccframe" src="/crew-control-full.html?service=${encodeURIComponent(service.id)}" loading="eager" referrerpolicy="same-origin"></iframe></div>`;
 iframe=root.querySelector('iframe');
 document.getElementById('ccframeReload').onclick=()=>{iframe?.contentWindow?.location.reload()};
 document.getElementById('ccframeQr').onclick=()=>document.getElementById('novaQrQuick')?.click();
};
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='NOVA_CC_QR')document.getElementById('novaQrQuick')?.click();});
})();
