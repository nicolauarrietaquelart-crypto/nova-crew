/* NOVA Crew · Dedicated fullscreen Crew Control (Cloudflare demo) */
(()=>{
'use strict';
const root=document.getElementById('crewControlRoot');
if(!root)return;
let overlay=null, iframe=null, current=null, previousFocus=null;
let qrOriginalParent=null,qrOriginalNext=null;
function qrElement(){return document.getElementById('novaQrOverlay');}
function restoreQr(){
 const qr=qrElement();
 if(!qr||!qrOriginalParent)return;
 if(!qr.classList.contains('hidden'))document.getElementById('novaQrClose')?.click();
 if(qrOriginalNext&&qrOriginalNext.parentNode===qrOriginalParent)
   qrOriginalParent.insertBefore(qr,qrOriginalNext);
 else qrOriginalParent.appendChild(qr);
 qr.classList.remove('nova-crew-qr-over-workspace');
 qrOriginalParent=null;qrOriginalNext=null;
}
function openCrewQr(){
 const qr=qrElement(),button=document.getElementById('novaQrQuick');
 if(!overlay||!qr||!button){
   if(typeof window.toast==='function')window.toast('Fichaje QR','No se encuentra el lector QR de NOVA CREW.');
   return;
 }
 if(qr.parentElement!==overlay){
   qrOriginalParent=qr.parentElement;
   qrOriginalNext=qr.nextSibling;
   overlay.appendChild(qr);
 }
 qr.classList.add('nova-crew-qr-over-workspace');
 window.NOVA_QR_CONTEXT?.chooseService?.(current);
 button.click(); // reuse the exact NOVA CREW QR application, camera, and API session
}
let gpsDialog=null,gpsOriginalParent=null,gpsOriginalNext=null;
function closeCrewGps(){
 if(!gpsDialog)return;
 const panel=gpsDialog.querySelector('.clock-layout');
 if(panel&&gpsOriginalParent){
  if(gpsOriginalNext?.parentNode===gpsOriginalParent)gpsOriginalParent.insertBefore(panel,gpsOriginalNext);
  else gpsOriginalParent.appendChild(panel);
 }
 const selector=panel?.querySelector('#clockServicePicker');if(selector)selector.disabled=false;
 gpsDialog.remove();gpsDialog=null;gpsOriginalParent=null;gpsOriginalNext=null;
}
function openCrewGps(){
 if(!overlay||!current)return;
 const service=typeof serviceById==='function'?serviceById(current):null;
 const actor=window.novaActiveAccount||window.NOVA_API?.account;
 if(!service||service.coordinatorUserId!==actor){
  window.toast?.('Geolocalización','Solo puedes fichar aquí cuando eres el coordinador de este servicio.');
  return;
 }
 closeCrewGps();
 const panel=document.querySelector('#page-clock .clock-layout');
 if(!panel){window.toast?.('Geolocalización','No se ha encontrado el formulario de control horario.');return;}
 gpsOriginalParent=panel.parentNode;gpsOriginalNext=panel.nextSibling;
 gpsDialog=document.createElement('div');gpsDialog.className='nova-crew-gps-backdrop';
 gpsDialog.innerHTML='<section class="nova-crew-gps-dialog" role="dialog" aria-modal="true" aria-labelledby="novaCrewGpsTitle"><header><div><small>CONTROL HORARIO</small><h2 id="novaCrewGpsTitle">Fichar con geolocalización</h2></div><button type="button" class="nova-crew-gps-close" aria-label="Cerrar fichaje">×</button></header><div class="nova-crew-gps-content"></div></section>';
 overlay.appendChild(gpsDialog);
 gpsDialog.querySelector('.nova-crew-gps-content').appendChild(panel);
 gpsDialog.addEventListener('click',e=>{if(e.target===gpsDialog||e.target.closest('.nova-crew-gps-close'))closeCrewGps();});
 const selector=panel.querySelector('#clockServicePicker');
 if(selector){selector.value=current;selector.dispatchEvent(new Event('change',{bubbles:true}));selector.disabled=true;}
 gpsDialog.querySelector('.nova-crew-gps-close').focus();
}
window.NOVA_CREW_GPS_OPEN=openCrewGps;
const gpsStyle=document.createElement('style');
gpsStyle.textContent=`
.nova-crew-gps-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(10,13,20,.68);backdrop-filter:blur(11px);-webkit-backdrop-filter:blur(11px)}
.nova-crew-gps-dialog{width:min(790px,100%);max-height:min(850px,92dvh);display:flex;flex-direction:column;overflow:hidden;background:#f6f7f9;border:1px solid #ffffffc9;border-radius:22px;box-shadow:0 30px 85px #0005}
.nova-crew-gps-dialog>header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 22px;background:#17181c;color:white}
.nova-crew-gps-dialog>header small{font-size:10px;font-weight:800;letter-spacing:.11em;color:#ff943f}.nova-crew-gps-dialog h2{margin:4px 0 0;font-size:21px}
.nova-crew-gps-close{width:42px;height:42px;flex:0 0 42px;border:1px solid #ffffff46;border-radius:12px;color:white;background:#ffffff20;font-size:26px;cursor:pointer}
.nova-crew-gps-content{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:18px}
.nova-crew-gps-content .clock-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;margin:0!important}
.nova-crew-gps-content .clock-side{display:none!important}
.nova-crew-gps-content .clock-main{min-width:0!important;width:100%!important}
.nova-crew-gps-content #clockServicePicker{opacity:.8}
@media(max-width:900px){.nova-crew-gps-backdrop{padding:8px;align-items:end}.nova-crew-gps-dialog{max-height:93dvh;border-radius:22px 22px 12px 12px;animation:novaCrewGpsUp .3s cubic-bezier(.22,1,.36,1)}.nova-crew-gps-content{padding:12px}.nova-crew-gps-content .location-compare{grid-template-columns:minmax(0,1fr)!important}.nova-crew-gps-content .clock-main{padding:14px!important}.nova-crew-gps-content .inline-actions{display:grid!important;grid-template-columns:1fr!important}.nova-crew-gps-content .inline-actions button{min-height:52px!important}}
@keyframes novaCrewGpsUp{from{opacity:.5;transform:translateY(25px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.nova-crew-gps-dialog{animation:none!important}}
`;
document.head.appendChild(gpsStyle);
function allowed(s){
 const actor=window.novaActiveAccount||window.NOVA_API?.account;
 return !!s && (s.coordinatorUserId===actor||s.privilege==='crew'||s.assignedCoordinator);
}
function destroy(){
 closeCrewGps();
 restoreQr();
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
   // NOVA integration-only overrides: do not edit the upstream Crew Control HTML.
   const integrationCSS=doc.createElement('style');
   integrationCSS.textContent='button[onclick*="requestDuplicateService"],button[onclick*="closeService()"],button[onclick*="exitService()"]{display:none!important}';
   doc.head.appendChild(integrationCSS);
   const hide=()=>{for(const b of doc.querySelectorAll('button')){const name=(b.textContent||'').trim().toLowerCase();if((name==='duplicar'||name==='salir')&&!b.classList.contains('cc-portal-back'))b.style.setProperty('display','none','important');}};
   hide();
   new MutationObserver(hide).observe(doc.body,{childList:true,subtree:true});
   // The original Crew Control owns its layout and Cloudflare adapter.
   // Do not inject competing CSS or load services a second time.
   doc.querySelector('.cc-portal-back')?.addEventListener('click',ev=>{
    ev.preventDefault();ev.stopImmediatePropagation();back();
   },true);
  }catch(err){console.warn('Crew Control: no se pudo aplicar el ajuste de scroll',err)}
 });
 const reference=String(service.serviceReference||service.reference||(/^\d{6}$/.test(String(service.code||''))?service.code:'')).trim();
 iframe.src='/crew-control-full.html?service='+encodeURIComponent(service.id)+(reference?'&reference='+encodeURIComponent(reference):'')+'&ui=cloudflare&rev=20261101-cloudflare-fix-r2';
 overlay.appendChild(iframe);
 // The old embedded card is never displayed, even if its markup was created earlier.
 root.replaceChildren();
}
window.renderCrewControl=open;
window.closeCrewFullscreen=back;
window.addEventListener('message',event=>{
 if(!iframe||event.source!==iframe.contentWindow||event.origin!==location.origin)return;
 if(event.data?.type==='NOVA_CC_BACK')back();
 if(event.data?.type==='NOVA_CC_QR')openCrewQr();
 if(event.data?.type==='NOVA_CC_ERROR' && typeof window.toast==='function')window.toast('Crew Control',event.data.error||'No se pudo cargar el servicio.');
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
  if(!qrElement()?.classList.contains('hidden')){
   ev.preventDefault();ev.stopImmediatePropagation();
   document.getElementById('novaQrClose')?.click();
   return;
  }
  // Escape may be consumed by an open modal; visible back button remains primary.
  if(!document.getElementById('novaQrOverlay')?.classList.contains('hidden'))return;
  back();
 }
},true);
})();