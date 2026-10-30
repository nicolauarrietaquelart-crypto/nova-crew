/* NOVA Crew · attendance in modal, shared with Control horario */
(()=>{
'use strict';
let modal=null,parent=null,next=null;
function close(){
 if(!modal)return;
 const panel=modal.querySelector('.clock-layout');
 if(panel&&parent){if(next&&next.parentNode===parent)parent.insertBefore(panel,next);else parent.appendChild(panel);}
 const selector=panel?.querySelector('#clockServicePicker');if(selector)selector.disabled=false;
 modal.remove();modal=null;parent=null;next=null;
}
function open(serviceId){
 if(modal){close();}
 const panel=document.querySelector('#page-clock .clock-layout');
 if(!panel)return;
 parent=panel.parentNode;next=panel.nextSibling;
 modal=document.createElement('div');modal.className='nova-gps-modal-backdrop';
 modal.innerHTML='<section class="nova-gps-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="novaGpsModalHeading"><header><div><small>CONTROL HORARIO</small><h2 id="novaGpsModalHeading">Fichar con geolocalización</h2></div><button type="button" class="nova-gps-modal-close" aria-label="Cerrar">×</button></header><div class="nova-gps-modal-content"></div></section>';
 document.body.appendChild(modal);modal.querySelector('.nova-gps-modal-content').appendChild(panel);
 const selector=panel.querySelector('#clockServicePicker');
 if(selector){if(serviceId&&[...selector.options].some(o=>o.value===serviceId)){selector.value=serviceId;selector.dispatchEvent(new Event('change',{bubbles:true}));}}
 modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.nova-gps-modal-close'))close();});
 modal.querySelector('.nova-gps-modal-close').focus();
}
window.NOVA_GPS_MODAL_OPEN=open;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal)close()});
document.addEventListener('click',e=>{
 const nav=e.target.closest('#mainNav [data-page="clock"]');
 if(!nav)return;
 e.preventDefault();e.stopImmediatePropagation();
 document.getElementById('sidebar')?.classList.remove('open');
 document.getElementById('novaQrQuick')?.click();
},true);
const style=document.createElement('style');style.textContent=`
.nova-gps-modal-backdrop{position:fixed;inset:0;z-index:16000;padding:20px;display:grid;place-items:center;background:rgba(14,16,22,.52);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.nova-gps-modal-sheet{background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(244,246,249,.92));border:1px solid #fff;box-shadow:0 25px 75px #0004;border-radius:23px;width:min(780px,100%);max-height:92dvh;display:flex;flex-direction:column;overflow:hidden}
.nova-gps-modal-sheet>header{display:flex;align-items:center;justify-content:space-between;padding:17px 22px;border-bottom:1px solid #ddd}
.nova-gps-modal-sheet>header small{font-size:10px;font-weight:800;letter-spacing:.12em;color:#f58220}.nova-gps-modal-sheet h2{margin:5px 0;font-size:22px}
.nova-gps-modal-close{display:grid;place-items:center;width:43px;height:43px;border-radius:12px;border:1px solid #e5e5e9;background:#fff;color:#f58220;font-size:26px}
.nova-gps-modal-content{overflow:auto;overscroll-behavior:contain;padding:16px;-webkit-overflow-scrolling:touch}
.nova-gps-modal-content .clock-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important}
.nova-gps-modal-content .clock-side{display:none!important}
.nova-gps-modal-content .clock-main{width:100%;min-width:0}
@media(max-width:900px){.nova-gps-modal-backdrop{padding:8px;align-items:end}.nova-gps-modal-sheet{max-height:94dvh;border-radius:22px 22px 10px 10px;animation:novaGpsRise .3s cubic-bezier(.2,.8,.2,1)}.nova-gps-modal-content{padding:10px}.nova-gps-modal-content .location-compare{grid-template-columns:1fr!important}.nova-gps-modal-content .clock-main{padding:14px!important}}
@keyframes novaGpsRise{from{opacity:.4;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.nova-gps-modal-sheet{animation:none!important}}
`;document.head.appendChild(style);
})();