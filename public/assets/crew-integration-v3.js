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
   // Apply layout constraints after the original v11.2.33 stylesheet loads.
   const layout=document.createElement('style');
   layout.id='nova-crew-11233-layout';
   layout.textContent="html{height:auto!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin!important}\nbody{padding-top:88px!important;min-height:100vh!important;height:auto!important;overflow-y:visible!important;overflow-x:hidden!important}\nbody>header,body>header.crew-header-floating-v11233{position:fixed!important;top:9px!important;left:12px!important;right:12px!important;width:calc(100% - 24px)!important;height:68px!important;min-height:68px!important;border-radius:0!important;margin:0!important;z-index:1300!important;background:#111!important;box-shadow:0 8px 25px rgba(0,0,0,.20)!important;border-bottom:3px solid #f58220!important}\nbody>main.wrap{padding-top:0!important;margin-top:0!important}\n#startScreen{display:none!important}\n#initialPdfUploadPanel,#sidebarPdfManager{display:none!important}\n@media(min-width:901px){body.control-sidebar-open main.wrap{width:calc(100% - 335px)!important;max-width:none!important;margin:8px 12px 0 323px!important;padding:0!important}body.control-sidebar-open .personnel-sidebar-v121.personnel-sidebar-portal-v1215{position:fixed!important;left:12px!important;top:91px!important;width:298px!important;max-width:298px!important;max-height:calc(100dvh - 103px)!important;overflow-y:auto!important;z-index:1250!important}body.control-sidebar-open .personnel-main-v121{width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0!important}}\n@media(max-width:900px){body{padding-top:77px!important}body>header,body>header.crew-header-floating-v11233{top:6px!important;left:7px!important;right:7px!important;width:calc(100% - 14px)!important;height:62px!important;min-height:62px!important;border-radius:0!important}body.control-sidebar-open main.wrap{width:100%!important;max-width:100%!important;margin:0!important;padding:8px!important}body.control-sidebar-open .personnel-sidebar-v121{position:static!important;top:auto!important;left:auto!important;width:100%!important;max-width:none!important;max-height:none!important;margin:0 0 12px!important;overflow:visible!important}}\n.nova-sfx-cordinator-note{margin:0 0 12px;padding:12px 16px;border:1px solid #edd6bd;background:#fff7ed;border-radius:12px;font:600 13px/1.5 Arial,sans-serif;color:#33291c}";

   doc.head.appendChild(layout);
   if(service.id==='svc7'){
     const marker=doc.createElement('div');
     marker.className='nova-sfx-cordinator-note';
     marker.textContent='Coordinación por equipos: Álvaro Costa · Crew Head general | SFX: Pau Ferrer Soler · HAND B y coordinador de SFX';
     const frame=doc.getElementById('appScreen');
     if(frame)frame.insertBefore(marker,frame.firstChild);
   }

   doc.documentElement.style.setProperty('overflow-y','auto','important');
   doc.documentElement.style.setProperty('overflow-x','hidden','important');
   doc.body.style.setProperty('overflow-y','visible','important');
   doc.body.style.setProperty('height','auto','important');
   doc.querySelector('.cc-portal-back')?.addEventListener('click',ev=>{
    ev.preventDefault();ev.stopImmediatePropagation();back();
   },true);
  }catch(err){console.warn('Crew Control: no se pudo aplicar el ajuste de scroll',err)}
 });
 iframe.src='/crew-control-full.html?service='+encodeURIComponent(service.id)+'&ui=fullscreen-v11233-hierarchy';
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