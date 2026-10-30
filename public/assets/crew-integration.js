/* Crew Control fills the NOVA Crew viewport, rather than appearing in a nested card. */
(()=>{
'use strict';
const root=document.getElementById('crewControlRoot');
if(!root)return;
let iframe=null, overlay=null, current=null, previousFocus=null;
function isManager(service){
  const actor=window.novaActiveAccount||window.NOVA_API?.account;
  return !!service && (service.coordinatorUserId===actor || service.privilege==='crew' || service.assignedCoordinator);
}
function ensureWorkspace(){
  if(overlay)return;
  overlay=document.createElement('section');
  overlay.id='crewFullscreenWorkspace';
  overlay.className='crew-fullscreen-workspace hidden';
  overlay.setAttribute('aria-label','Crew Control');
  overlay.innerHTML='<iframe title="Crew Control" class="crew-fullscreen-frame" id="ccFullFrame" referrerpolicy="same-origin"></iframe>';
  document.body.appendChild(overlay);
  iframe=overlay.querySelector('iframe');
}
function backToPortal(){
  if(!overlay)return;
  overlay.classList.add('hidden');
  document.body.classList.remove('crew-fullscreen-active');
  // Destroy listeners and Cloudflare polling as the user exits Crew Control.
  iframe?.remove();
  iframe=null;
  overlay.remove();
  overlay=null;
  current=null;
  if(typeof window.navigate==='function')window.navigate('coordination');
  else document.querySelector('.nav-btn[data-page="coordination"]')?.click();
  try{previousFocus?.focus?.()}catch{}
}
function openQR(){document.getElementById('novaQrQuick')?.click();}
window.renderCrewControl=function(service){
  if(!isManager(service)){
    if(typeof toast==='function')toast('Crew Control','No tienes permisos para gestionar este servicio.');
    return;
  }
  previousFocus=document.activeElement;
  ensureWorkspace();
  overlay.classList.remove('hidden');
  document.body.classList.add('crew-fullscreen-active');
  if(current!==service.id || !iframe?.getAttribute('src')){
    current=service.id;
    iframe.src=`/crew-control-full.html?service=${encodeURIComponent(service.id)}`;
  }
};
window.closeCrewFullscreen=backToPortal;
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==iframe?.contentWindow)return;
  if(event.data?.type==='NOVA_CC_QR')openQR();
  if(event.data?.type==='NOVA_CC_BACK')backToPortal();
});
})();