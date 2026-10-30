/* NOVA Crew · Dedicated fullscreen Crew Control (Cloudflare demo) */
(()=>{
'use strict';
const root=document.getElementById('crewControlRoot');
if(!root)return;
let overlay=null, iframe=null, current=null, previousFocus=null;
function allowed(s){
 const actor=window.novaActiveAccount||window.NOVA_API?.account;
 return !!s && (s.coordinatorUserId===actor||s.privilege==='crew'||s.assignedCoordinator);
}
function destroy(){
 if(iframe){iframe.remove();iframe=null}
 if(overlay){overlay.remove();overlay=null}
 current=null;
 document.body.classList.remove('crew-fullscreen-active');
}
function back(){
 if(!overlay)return;
 destroy();
 try{
  if(typeof window.navigate==='function')window.navigate('coordination');
  else document.querySelector('.nav-btn[data-page="coordination"]')?.click();
 }catch(err){console.error('NOVA Crew: error al volver',err)}
 try{previousFocus?.focus?.()}catch{}
}
function open(service){
 if(!allowed(service)){
  if(typeof window.toast==='function')window.toast('Crew Control','Sin permiso de gestión para este servicio.');
  return;
 }
 previousFocus=document.activeElement;
 if(!overlay){
  overlay=document.createElement('section');
  overlay.id='crewFullscreenWorkspace';
  overlay.className='crew-fullscreen-workspace';
  overlay.setAttribute('role','region');
  overlay.setAttribute('aria-label','Crew Control a pantalla completa');
  document.body.appendChild(overlay);
 }
 document.body.classList.add('crew-fullscreen-active');
 if(current===service.id && iframe)return;
 current=service.id;
 if(iframe)iframe.remove();
 iframe=document.createElement('iframe');
 iframe.id='ccFullFrame';
 iframe.className='crew-fullscreen-frame';
 iframe.title='Crew Control · '+(service.name||service.id);
 iframe.setAttribute('scrolling','yes');
 iframe.setAttribute('allow','camera');
 iframe.referrerPolicy='same-origin';
 const target=iframe;
 iframe.addEventListener('load',()=>{
  if(target!==iframe)return;
  try{
   const doc=target.contentDocument;
   if(!doc)return;
   doc.documentElement.style.setProperty('overflow-y','auto','important');
   doc.documentElement.style.setProperty('overflow-x','hidden','important');
   doc.body.style.setProperty('overflow-y','visible','important');
   doc.body.style.setProperty('height','auto','important');
   doc.querySelector('.cc-portal-back')?.addEventListener('click',ev=>{
    ev.preventDefault();ev.stopImmediatePropagation();back();
   },true);
  }catch(err){console.warn('Crew Control: no se pudo aplicar el ajuste de scroll',err)}
 });
 iframe.src='/crew-control-full.html?service='+encodeURIComponent(service.id)+'&ui=fullscreen-v2';
 overlay.appendChild(iframe);
 // The old embedded card is never displayed, even if its markup was created earlier.
 root.replaceChildren();
}
window.renderCrewControl=open;
window.closeCrewFullscreen=back;
window.addEventListener('message',event=>{
 if(!iframe||event.source!==iframe.contentWindow||event.origin!==location.origin)return;
 if(event.data?.type==='NOVA_CC_BACK')back();
 if(event.data?.type==='NOVA_CC_QR')document.getElementById('novaQrQuick')?.click();
});
// Intercept both navigation routes before old delegated click handlers can recreate the nested card.
document.addEventListener('click',ev=>{
 const trigger=ev.target.closest?.('[data-open-coordination],[data-service-coordination]');
 if(!trigger)return;
 const id=trigger.dataset.openCoordination||trigger.dataset.serviceCoordination;
 const s=typeof serviceById==='function'?serviceById(id):null;
 if(!s||s.privilege!=='crew')return;
 ev.preventDefault();ev.stopImmediatePropagation();
 if(typeof window.navigate==='function')window.navigate('crew-control');
 open(s);
},true);
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'&&overlay&&!overlay.classList.contains('hidden')){
  // Escape may be consumed by an open modal; visible back button remains primary.
  if(!document.getElementById('novaQrOverlay')?.classList.contains('hidden'))return;
  back();
 }
});
})();