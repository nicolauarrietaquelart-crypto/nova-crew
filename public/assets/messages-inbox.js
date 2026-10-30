/* NOVA Crew · internal message inbox for the employee demo */
(()=>{
'use strict';
const trigger=document.getElementById('messagesBtn');
if(!trigger)return;
let box=null,restoreFocus=null;
const deleted=new Set();
const close=()=>{if(!box)return;box.remove();box=null;restoreFocus?.focus?.();};
const safe=(value)=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const messages=[
 {from:'Departamento de Personal',subject:'Recordatorio sobre conducta profesional',date:'30 oct 2026',body:'Durante los últimos servicios hemos recibido quejas de algunos clientes por comportamientos poco profesionales de parte del personal. Os recordamos que es imprescindible mantener una actitud respetuosa, seguir las instrucciones del equipo responsable y evitar el uso del teléfono móvil durante el trabajo, salvo autorización. Gracias por vuestra colaboración.'},
 {from:'Coordinación',subject:'Revisión de la convocatoria',date:'29 oct 2026',body:'Comprueba los horarios y la ubicación de tu próximo servicio en el área de empleado. Recuerda presentarte con el equipo de protección individual indicado.'}
];
function open(){
 if(box){close();return;}
 restoreFocus=document.activeElement;
 box=document.createElement('div');box.className='nova-inbox-backdrop';box.setAttribute('role','presentation');
 box.innerHTML='<section class="nova-inbox" role="dialog" aria-modal="true" aria-labelledby="novaInboxTitle"><header><div><small>COMUNICACIONES INTERNAS</small><h2 id="novaInboxTitle">Mensajes</h2></div><button type="button" data-inbox-close aria-label="Cerrar mensajes">×</button></header><div class="nova-inbox-body"><nav aria-label="Bandeja de entrada">'+messages.map((m,i)=>deleted.has(i)?'':'<div class="nova-message-entry"><button type="button" class="nova-inbox-item '+(!i?'selected':'')+'" data-inbox-index="'+i+'"><strong>'+safe(m.subject)+'</strong><span>'+safe(m.from)+'</span><small>'+safe(m.date)+'</small></button><button type="button" class="nova-message-delete" data-inbox-delete="'+i+'" aria-label="Eliminar mensaje">×</button></div>').join('')+'</nav><article class="nova-inbox-article" id="novaInboxArticle" aria-live="polite"></article></div><footer>Mensajes de ejemplo · Entorno de demostración</footer></section>';
 document.body.append(box);
 const render=i=>{const m=messages[i];if(!m)return;box.querySelectorAll('[data-inbox-index]').forEach(b=>{const on=Number(b.dataset.inboxIndex)===i;b.classList.toggle('selected',on);b.setAttribute('aria-current',on?'true':'false')});box.querySelector('#novaInboxArticle').innerHTML='<small>'+safe(m.date)+' · '+safe(m.from)+'</small><h3>'+safe(m.subject)+'</h3><p>'+safe(m.body)+'</p>';};
 box.addEventListener('click',e=>{
 if(e.target===box||e.target.closest('[data-inbox-close]')){close();return;}
 const del=e.target.closest('[data-inbox-delete]');
 if(del){deleted.add(Number(del.dataset.inboxDelete));del.closest('.nova-message-entry')?.remove();const remaining=box.querySelector('[data-inbox-index]');if(remaining)render(Number(remaining.dataset.inboxIndex));else box.querySelector('#novaInboxArticle').innerHTML='<p>No quedan mensajes.</p>';return;}
 const item=e.target.closest('[data-inbox-index]');if(item)render(Number(item.dataset.inboxIndex));
});
let swipe=null;
box.addEventListener('touchstart',e=>{const entry=e.target.closest('.nova-message-entry');if(entry){const t=e.touches[0];swipe={entry,x:t.clientX,y:t.clientY};}},{passive:true});
box.addEventListener('touchend',e=>{if(!swipe)return;const {entry,x,y}=swipe;swipe=null;const t=e.changedTouches[0];if(t.clientX-x< -70&&Math.abs(t.clientX-x)>Math.abs(t.clientY-y)*1.3)entry.querySelector('[data-inbox-delete]')?.click();},{passive:true});
 render(0);box.querySelector('[data-inbox-close]').focus();
}
window.NOVA_openInbox=open;
trigger.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open();},true);
document.addEventListener('keydown',e=>{if(!box)return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const focusables=[...box.querySelectorAll('button:not([disabled])')];const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
const css=document.createElement('style');css.textContent=`
.nova-message-entry{position:relative;display:flex;align-items:stretch;border-bottom:1px solid #e3e3e6;touch-action:pan-y}.nova-message-entry .nova-inbox-item{flex:1;min-width:0;border-bottom:0;padding-right:4px}.nova-message-delete{align-self:center;display:grid;place-items:center;width:32px;height:32px;flex:0 0 32px;margin:0 8px;border:1px solid #dcdfe3;border-radius:50%;background:#fff;color:#666;font-size:20px;line-height:1;cursor:pointer}

.nova-inbox-backdrop{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:18px;background:rgba(10,12,17,.66);backdrop-filter:blur(12px)}
.nova-inbox{width:min(850px,100%);max-height:min(720px,92dvh);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(255,255,255,.25);border-radius:22px;background:#fafafa;color:#1a1a1e;box-shadow:0 25px 85px #0006;font-family:'Plus Jakarta Sans',sans-serif}
.nova-inbox>header{display:flex;align-items:center;justify-content:space-between;padding:24px 27px;background:#17181c;color:#fff}.nova-inbox>header small{font-size:10px;letter-spacing:.14em;color:#f58220;font-weight:800}.nova-inbox h2{margin:5px 0 0;font-size:27px}.nova-inbox>header button{border:1px solid #ffffff45;border-radius:12px;background:#ffffff12;color:#fff;font-size:28px;width:39px;height:39px;cursor:pointer}
.nova-inbox-body{display:grid;grid-template-columns:minmax(200px,34%) minmax(0,1fr);min-height:260px;overflow:auto}.nova-inbox nav{border-right:1px solid #e4e4e8;background:#f4f4f6}.nova-inbox-item{display:flex;flex-direction:column;gap:5px;width:100%;padding:18px 20px;border:0;border-bottom:1px solid #e3e3e6;text-align:left;background:transparent;color:#25252a;cursor:pointer}.nova-inbox-item.selected{background:#fff;box-shadow:inset 4px 0 #f58220}.nova-inbox-item strong{font-size:13px;line-height:1.4}.nova-inbox-item span,.nova-inbox-item small{font-size:11px;color:#757580}.nova-inbox-article{padding:27px;line-height:1.75;overflow:auto}.nova-inbox-article small{color:#777;font-size:11px}.nova-inbox-article h3{font-size:20px;line-height:1.35;margin:12px 0 20px}.nova-inbox-article p{font-size:14px;white-space:pre-line;color:#404047}.nova-inbox>footer{padding:12px 27px;border-top:1px solid #ebebed;color:#84848c;font-size:10px}
@media(max-width:600px){.nova-inbox{max-height:95dvh;border-radius:16px}.nova-inbox>header{padding:18px}.nova-inbox-body{grid-template-columns:1fr}.nova-inbox nav{border-right:0;border-bottom:1px solid #e4e4e8;max-height:180px;overflow:auto}.nova-inbox-item{padding:12px 15px}.nova-inbox-article{padding:20px}.nova-inbox-article h3{font-size:17px}}
`;document.head.append(css);
})();
