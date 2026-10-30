
/* NOVA Crew v15 · Presentation demo updates · all accounts are fictional. */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $id=s=>document.getElementById(s);
let shifts=[];
let fetching=false;
let lastAccount='';
const pending=()=>window.NOVA_V15_CONFIRM?.pending?.()||0;
const currentServices=()=>typeof assignedServices==='function'?assignedServices():[];
function closeProfile(){$id('v15ProfileMenu')?.classList.add('hidden');$id('v15ProfileToggle')?.setAttribute('aria-expanded','false')}
function closeAlert(){$id('v15AlertPanel')?.classList.add('hidden')}
function formatDay(s){try{return new Date(s.date+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}catch{return s.date}}
function openShiftCard(s){const requested=!!s.interest;
  return `<article class="v15-shift" data-shift="${esc(s.id)}"><span class="v15-shift-tag">${esc(formatDay(s))} · ${esc(s.role)} · ${esc(s.places)} plaza${s.places===1?'':'s'}</span><h4>${esc(s.name)}</h4><p>${esc(s.time)} · ${esc(s.venue)}</p>${requested?'<span class="v15-shift-requested">✓ Interés enviado · Pendiente de oficina</span>':'<span class="muted" style="font-size:11px">No supone una asignación</span>'}<button type="button" class="btn ${requested?'light':'dark'}" data-v15-shift="${esc(s.id)}" data-cancel="${requested?'yes':'no'}">${requested?'Retirar interés':'Me interesa'}</button></article>`;
}
function renderShifts(){const target=$id('v15OpenShifts');if(target)target.innerHTML=shifts.length?shifts.map(openShiftCard).join(''):'<p class="v15-empty">No hay servicios libres anunciados.</p>';
  updateAlerts();}
async function fetchShifts(){if(fetching||!window.NOVA_API?.account)return;fetching=true;try{const d=await window.NOVA_API.openShifts();if(d?.ok)shifts=d.shifts||[];renderShifts()}catch(e){const target=$id('v15OpenShifts');if(target)target.textContent='No se han podido cargar las vacantes. Revisa la conexión.';}finally{fetching=false}}
async function sendInterest(id,cancel){const api=window.NOVA_API;if(!api?.account)return;const s=shifts.find(s=>s.id===id);if(!s)return;try{await api.expressInterest(id,cancel);s.interest=cancel?null:{status:'ENVIADO',requestedAt:new Date().toISOString()};renderShifts();toast('Disponibilidad',cancel?'Has retirado tu interés.':'Interés enviado a la oficina (demo). El servicio NO se ha asignado.')}catch(e){toast('No disponible',e.message||'No se ha podido guardar.')}}
function updateCounters(){const list=currentServices(),b=$id('v15UpcomingCount');if(b)b.textContent=String(list.length);
  const nav=document.querySelector('.nav-btn[data-page="services"] b');if(nav)nav.textContent=String(list.length);
  const home=$id('homeCoordCounterValue');if(home)home.textContent=String(list.filter(s=>s.assignedCoordinator||s.privilege==='crew').length);
}
function updateAlerts(){updateCounters();const count=pending();const dot=$id('v15BellDot');if(dot)dot.style.display=count?'':'none';const btn=$id('assignmentAlertBtn');if(btn)btn.title=count?`${count} servicios por confirmar`:'Servicios libres y avisos';
 const panel=$id('v15AlertPanel');if(!panel)return;
 let messages=currentServices().filter(s=>window.NOVA_V15_CONFIRM?.statusOf(s.id)==='PENDIENTE').map(s=>`<div class="v15-alert-item"><b>${esc(s.name)}</b><small>${esc(s.date)} · Por confirmar</small><button type="button" class="btn light" data-v15-go="services">Revisar asignación</button></div>`);
 for(const s of shifts){messages.push(`<div class="v15-alert-item"><b>${esc(s.name)}</b><small>Servicio libre · ${esc(formatDay(s))} · ${esc(s.role)}${s.interest?' · Interés enviado':''}</small><button type="button" class="btn light" data-v15-go="home">${s.interest?'Ver solicitud':'Me interesa / Ver detalles'}</button></div>`)}
 panel.innerHTML=`<div class="v15-alert-head"><h3>Servicios y avisos ${count?'· '+count+' por confirmar':''}</h3><button type="button" class="icon-only" data-v15-close="true" aria-label="Cerrar">×</button></div>`+(messages.join('')||'<p class="v15-empty">No hay avisos pendientes.</p>');
}
function mountProfileMenu(){const btn=$id('v15ProfileToggle');if(!btn)return;btn.addEventListener('click',e=>{e.stopPropagation();closeAlert();const menu=$id('v15ProfileMenu');const hide=!menu.classList.contains('hidden');menu.classList.toggle('hidden',hide);btn.setAttribute('aria-expanded',String(!hide))});
 $id('assignmentAlertBtn').addEventListener('click',e=>{e.stopPropagation();closeProfile();$id('v15AlertPanel').classList.toggle('hidden')});
 document.addEventListener('click',e=>{if(!e.target.closest('.v15-profile-wrap'))closeProfile();if(!e.target.closest('#v15AlertPanel,#assignmentAlertBtn'))closeAlert();const action=e.target.closest('[data-v15-profile]');if(action){if(action.dataset.v15Profile==='logout'){closeProfile();closeAlert();window.NOVA_API?.logout?.();logout();}else{closeProfile();navigate('profile')}};
 const shift=e.target.closest('[data-v15-shift]');if(shift)sendInterest(shift.dataset.v15Shift,shift.dataset.cancel==='yes');
 const go=e.target.closest('[data-v15-go]');if(go){closeAlert();navigate(go.dataset.v15Go);if(go.dataset.v15Go==='home')$id('v15OpenShifts')?.scrollIntoView({behavior:'smooth',block:'start'})}
 if(e.target.closest('[data-v15-close]'))closeAlert();
 });
}
function addSelfShiftControls(){const s=window.homeNextService;if(!s)return;
 const card=$id('serviceDetail'),root=card?.querySelector('.side-stack');if(!root||card.querySelector('#v15ShiftCard'))return;
 const uid=window.novaActiveAccount||'demo';const worker=window.novaCloudShifts?.[s.id+'/'+uid];
 const start=worker?.start||s.time.split('–')[0],end=worker?.end||s.time.split('–')[1];
 root.insertAdjacentHTML('beforeend',`<article id="v15ShiftCard" class="glass card"><h4>Mi turno</h4><p class="muted" style="font-size:11px">Modifica tu horario si terminas antes o tu turno cambia. Se refleja en tu ficha.</p><div class="v15-shift-times"><label>Inicio<input type="time" id="v15Start" value="${esc(start)}"></label><label>Fin<input type="time" id="v15End" value="${esc(end)}"></label></div><button class="btn light" type="button" id="v15SaveShift">Guardar mi horario</button></article>`);
 $id('v15SaveShift').onclick=async()=>{try{const result=await window.NOVA_API.updateShift(s.id,uid,$id('v15Start').value,$id('v15End').value);window.novaCloudShifts=window.novaCloudShifts||{};window.novaCloudShifts[s.id+'/'+uid]={start:result.start,end:result.end};toast('Horario guardado','El turno de este trabajador ha sido actualizado en la demo.');if(typeof updateDemoWorkerFromServer==='function')updateDemoWorkerFromServer()}catch(e){toast('Horario',e.message)}};
}
function patchFunctions(){const previousDetail=window.renderServiceDetail; if(typeof previousDetail==='function')window.renderServiceDetail=function(s){previousDetail(s);const root=$id('serviceDetail')?.querySelector('.side-stack');if(!root)return; const current=$id('v15ShiftCard');if(current)current.remove(); const uid=window.novaActiveAccount||'demo';const assigned=currentServices().some(x=>x.id===s.id);if(!assigned)return;const override=window.novaCloudShifts?.[s.id+'/'+uid];const start=override?.start||s.time.split('–')[0],end=override?.end||s.time.split('–')[1];root.insertAdjacentHTML('beforeend',`<article class="glass card" id="v15ShiftCard"><h4>Mi turno</h4><p class="muted">Puedes actualizar tu horario real de la demo.</p><div class="v15-shift-times"><label>Inicio<input id="v15Start" type="time" value="${esc(start)}"></label><label>Fin<input id="v15End" type="time" value="${esc(end)}"></label></div><button class="btn light" id="v15SaveShift" type="button">Guardar horario</button></article>`);$id('v15SaveShift').onclick=async()=>{try{const d=await window.NOVA_API.updateShift(s.id,uid,$id('v15Start').value,$id('v15End').value);window.novaCloudShifts=window.novaCloudShifts||{};window.novaCloudShifts[s.id+'/'+uid]={start:d.start,end:d.end};toast('Turno actualizado','Horario guardado para tu trabajador demo.');renderServiceDetail(s)}catch(e){toast('Turno',e.message)}};};
 const oldEnter=window.enterApp; if(typeof oldEnter==='function')window.enterApp=function(){oldEnter();setTimeout(()=>{if(lastAccount!==(window.novaActiveAccount||'demo')){lastAccount=window.novaActiveAccount||'demo';window.NOVA_V15_CONFIRM?.refresh?.()}fetchShifts();updateCounters();updateAlerts()},150)};
 const oldNavigate=window.navigate;if(typeof oldNavigate==='function')window.navigate=function(page){oldNavigate(page);updateCounters();if(page==='home')fetchShifts();};
}
window.NOVA_V15={updateAlerts,fetchShifts};
mountProfileMenu();patchFunctions();updateCounters();updateAlerts();
})();
