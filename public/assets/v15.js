/* NOVA Crew v15 · Presentation demo updates · all accounts are fictional. */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const $id=s=>document.getElementById(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE_KEY='nova_v15_demo_state';
let shifts=[];
let fetching=false;
let lastAccount='';

const pending=()=>window.NOVA_V15_CONFIRM?.pending?.()||0;
const currentServices=()=>typeof assignedServices==='function'?assignedServices():[];

function readState(){
  try{
    const raw=sessionStorage.getItem(STORAGE_KEY);
    const state=raw?JSON.parse(raw):{};
    return {
      dismissed:Array.isArray(state.dismissed)?state.dismissed:[],
      accepted:Array.isArray(state.accepted)?state.accepted:[],
      noticeDismissed:Array.isArray(state.noticeDismissed)?state.noticeDismissed:[]
    };
  }catch{return {dismissed:[],accepted:[],noticeDismissed:[]};}
}
function writeState(state){sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function mutateState(fn){const s=readState();fn(s);writeState(s);return s;}
function resetDemoState(){sessionStorage.removeItem(STORAGE_KEY);}

function closeProfile(){$id('v15ProfileMenu')?.classList.add('hidden');$id('v15ProfileToggle')?.setAttribute('aria-expanded','false');}
function closeAlert(){$id('v15AlertPanel')?.classList.add('hidden');}
function formatDay(s){try{return new Date((s.date||'')+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'});}catch{return s.date||'';}}
function sortShifts(list){
  return [...list].sort((a,b)=>{
    const ua=(a.urgent?1:0),ub=(b.urgent?1:0);
    if(ua!==ub)return ub-ua;
    return String(a.date).localeCompare(String(b.date));
  });
}
function visibleShifts(){
  const state=readState();
  return sortShifts(shifts.filter(s=>!state.accepted.includes(s.id)&&!state.dismissed.includes(s.id)));
}
function combinedAlertCount(){
  const st=readState();
  const pendingCount=currentServices().filter(s=>window.NOVA_V15_CONFIRM?.statusOf?.(s.id)==='PENDIENTE'&&!st.noticeDismissed.includes(`pending-${s.id}`)).length;
  const generic=buildGenericNotices().filter(n=>!st.noticeDismissed.includes(n.id)).length;
  return pendingCount+visibleShifts().length+generic;
}

function shiftCardHtml(s){
  return `<article class="v15-shift ${s.urgent?'urgent':''}" data-shift="${esc(s.id)}">
    <div class="v15-shift-head">
      <span class="v15-shift-tag">${s.urgent?'<span class="v15-urgent-pill">URGENTE</span> ':''}${esc(formatDay(s))} · ${esc(s.role)} · ${esc(s.places)} plaza${s.places===1?'':'s'}</span>
    </div>
    <h4>${esc(s.name)}</h4>
    <p>${esc(s.time)} · ${esc(s.venue)}</p>
    <button type="button" class="btn dark" data-v15-shift-open="${esc(s.id)}">Ver servicio</button>
  </article>`;
}
function renderShifts(){
  const target=$id('v15OpenShifts');
  if(!target)return;
  const list=visibleShifts();
  target.innerHTML=list.length?list.map(shiftCardHtml).join(''):'<p class="v15-empty">No hay servicios disponibles en este momento.</p>';
}
async function fetchShifts(){
  if(fetching||!window.NOVA_API?.account)return;
  fetching=true;
  try{
    const d=await window.NOVA_API.openShifts();
    if(d?.ok)shifts=(d.shifts||[]).map(s=>({...s,interest:null}));
    renderShifts();
    updateAlerts();
  }catch(e){
    const target=$id('v15OpenShifts');
    if(target)target.textContent='No se han podido cargar los servicios disponibles.';
  }finally{fetching=false;}
}

function buildGenericNotices(){
  const notices=[];
  if(!(typeof trainingState!=='undefined' && trainingState.completed)){
    notices.push({id:'training',title:'Formación pendiente',text:'Tienes 1 curso pendiente de completar.',button:'Ir a formación',action:()=>navigate('training')});
  }
  notices.push({id:'docs',title:'Documentación pendiente',text:'Tienes 2 documentos pendientes de revisión.',button:'Ver documentación',action:()=>navigate('documents')});
  return notices;
}

function renderNoticeItem(n){
  return `<div class="v15-alert-item">
    <button type="button" class="v15-dismiss" data-v15-dismiss-notice="${esc(n.id)}" aria-label="Borrar aviso">×</button>
    <div class="v15-alert-copy"><b>${esc(n.title)}</b><small>${esc(n.text)}</small></div>
    <div class="v15-alert-actions"><button type="button" class="btn light" data-v15-notice-action="${esc(n.id)}">${esc(n.button||'Abrir')}</button></div>
  </div>`;
}
function renderPendingService(s){
  const status=window.NOVA_V15_CONFIRM?.statusOf?.(s.id)||'PENDIENTE';
  return `<div class="v15-alert-item">
    <button type="button" class="v15-dismiss" data-v15-dismiss-notice="pending-${esc(s.id)}" aria-label="Borrar aviso">×</button>
    <div class="v15-alert-copy"><b>${esc(s.name)}</b><small>${esc(s.date)} · ${status==='PENDIENTE'?'Por confirmar':'Asignado'}</small></div>
    <div class="v15-alert-actions"><button type="button" class="btn light" data-v15-go="services">Revisar asignación</button></div>
  </div>`;
}
function renderOpenServiceAlert(s){
  return `<div class="v15-alert-item ${s.urgent?'urgent':''}">
    <button type="button" class="v15-dismiss" data-v15-dismiss-open="${esc(s.id)}" aria-label="Ocultar">×</button>
    <div class="v15-alert-copy">
      <b>${s.urgent?'<span class="v15-urgent-inline">URGENTE</span> ':''}${esc(s.name)}</b>
      <small>Servicio disponible · ${esc(formatDay(s))} · ${esc(s.role)} · ${esc(s.time)}</small>
    </div>
    <div class="v15-alert-actions"><button type="button" class="btn light" data-v15-shift-open="${esc(s.id)}">Ver servicio</button></div>
  </div>`;
}

function updateCounters(){
  const list=currentServices();
  const b=$id('v15UpcomingCount');if(b)b.textContent=String(list.length);
  const nav=document.querySelector('.nav-btn[data-page="services"] b');if(nav)nav.textContent=String(list.length);
  const home=$id('homeCoordCounterValue');if(home)home.textContent=String(list.filter(s=>s.assignedCoordinator||s.privilege==='crew').length);
}

function updateAlerts(){
  updateCounters();
  const count=combinedAlertCount();
  const dot=$id('v15BellDot');if(dot)dot.style.display=count?'':'none';
  const btn=$id('notificationsBtn');if(btn)btn.title=count?`${count} avisos pendientes`:'Notificaciones y servicios disponibles';
  const panel=$id('v15AlertPanel');if(!panel)return;

  const state=readState();
  const pendingItems=currentServices()
    .filter(s=>window.NOVA_V15_CONFIRM?.statusOf?.(s.id)==='PENDIENTE' && !state.noticeDismissed.includes(`pending-${s.id}`))
    .map(renderPendingService).join('');
  const openItems=visibleShifts().map(renderOpenServiceAlert).join('');
  const genericItems=buildGenericNotices().filter(n=>!state.noticeDismissed.includes(n.id)).map(renderNoticeItem).join('');

  panel.innerHTML=`
    <div class="v15-alert-head">
      <h3>Servicios y avisos</h3>
      <button type="button" class="icon-only" data-v15-close="true" aria-label="Cerrar">×</button>
    </div>
    ${openItems?`<div class="v15-alert-section"><div class="v15-alert-section-title">Servicios disponibles</div>${openItems}</div>`:''}
    ${pendingItems?`<div class="v15-alert-section"><div class="v15-alert-section-title">Servicios por confirmar</div>${pendingItems}</div>`:''}
    ${genericItems?`<div class="v15-alert-section"><div class="v15-alert-section-title">Avisos</div>${genericItems}</div>`:''}
    ${!openItems && !pendingItems && !genericItems?'<p class="v15-empty">No hay avisos pendientes.</p>':''}`;
}

function openInterestConfirmShift(s){
  if(typeof openDemoModal!=='function')return;
  openDemoModal('Confirmar disponibilidad',`
    <div class="v15-modal-stack">
      <p>Vas a comunicar a oficina que <b>sí</b> puedes hacer este servicio:</p>
      <div class="v15-modal-service-box">
        <b>${esc(s.name)}</b>
        <small>${esc(formatDay(s))} · ${esc(s.time)} · ${esc(s.role)} · ${esc(s.venue)}</small>
      </div>
      <div class="warning-box">Si posteriormente rechazas un servicio tras aceptar disponibilidad, puede haber penalizaciones internas.</div>
      <div class="crew-modal-actions">
        <button type="button" class="btn light" id="v15ConfirmBack">Volver</button>
        <button type="button" class="btn primary" id="v15ConfirmFinal">Confirmar disponibilidad</button>
      </div>
    </div>`);
  setTimeout(()=>{
    $id('v15ConfirmBack').onclick=()=>openShiftModal(s.id);
    $id('v15ConfirmFinal').onclick=async()=>{
      const b=$id('v15ConfirmFinal');b.disabled=true;b.textContent='Enviando…';
      try{
        // Compartir la solicitud con el backend; nunca asigna automáticamente el servicio.
        await window.NOVA_API.expressInterest(s.id,false);
        mutateState(st=>{
          if(!st.accepted.includes(s.id))st.accepted.push(s.id);
          st.dismissed=st.dismissed.filter(x=>x!==s.id);
        });
        closeDemoModal();
        renderShifts();
        updateAlerts();
        toast('Disponibilidad enviada','Tu interés ha quedado registrado. No es una asignación.');
      }catch(error){
        b.disabled=false;b.textContent='Confirmar disponibilidad';
        toast('No se ha enviado',error?.message||'Revisa la conexión.');
      }
    };
  },0);
}

function openShiftModal(id){
  const s=shifts.find(x=>x.id===id);
  if(!s||typeof openDemoModal!=='function')return;
  openDemoModal('Servicio disponible',`
    <div class="v15-modal-stack">
      <div class="v15-modal-service-box">
        <div class="v15-modal-service-head">${s.urgent?'<span class="v15-urgent-pill">URGENTE</span>':''}<b>${esc(s.name)}</b></div>
        <small>${esc(formatDay(s))} · ${esc(s.time)}</small>
      </div>
      <div class="kv v15-modal-kv">
        <span>Recinto</span><b>${esc(s.venue)}</b>
        <span>Categoría</span><b>${esc(s.role)}</b>
        <span>Plazas</span><b>${esc(s.places)}</b>
        <span>Estado</span><b>Disponible</b>
      </div>
      <p class="muted">Si aceptas, se enviará tu disponibilidad a oficina para valoración. No supone asignación automática.</p>
      <div class="crew-modal-actions">
        <button type="button" class="btn light" id="v15NoAttend">No puedo asistir</button>
        <button type="button" class="btn primary" id="v15YesAttend">Sí, me interesa</button>
      </div>
    </div>`);
  setTimeout(()=>{
    $id('v15NoAttend').onclick=()=>{
      mutateState(st=>{if(!st.dismissed.includes(s.id))st.dismissed.push(s.id);});
      closeDemoModal?.();
      renderShifts();updateAlerts();window.NOVA_V16?.refresh?.();
      toast('Servicio descartado','El servicio desaparece de la lista de disponibles.');
    };
    $id('v15YesAttend').onclick=()=>openInterestConfirmShift(s);
  },0);
}

function hideHomeAvailableSection(){
  const section=document.querySelector('.v15-home-open-shifts');
  if(section)section.style.display='none';
}

function handleNoticeAction(id){
  const notice=buildGenericNotices().find(n=>n.id===id);
  closeAlert();
  notice?.action?.();
}

function mountProfileMenu(){
  const btn=$id('v15ProfileToggle');
  if(btn)btn.addEventListener('click',e=>{
    e.stopPropagation();
    closeAlert();
    const menu=$id('v15ProfileMenu');
    const hide=!menu.classList.contains('hidden');
    menu.classList.toggle('hidden',hide);
    btn.setAttribute('aria-expanded',String(!hide));
  });

  const openAlerts=e=>{
    e.stopPropagation();
    closeProfile();
    $('#notificationsDropdown')?.classList.add('hidden');
    const panel=$id('v15AlertPanel');
    panel?.classList.toggle('hidden');
    updateAlerts();
  };
  $id('notificationsBtn')?.addEventListener('click',e=>{e.stopImmediatePropagation();openAlerts(e);},true);

  document.addEventListener('click',e=>{
    if(!e.target.closest('.v15-profile-wrap'))closeProfile();
    if(!e.target.closest('#v15AlertPanel,#notificationsBtn'))closeAlert();

    const action=e.target.closest('[data-v15-profile]');
    if(action){
      if(action.dataset.v15Profile==='logout'){
        resetDemoState();
        closeProfile();
        closeAlert();
        window.NOVA_API?.logout?.();
        logout();
      }else{
        closeProfile();
        navigate('profile');
      }
      return;
    }

    const shiftOpen=e.target.closest('[data-v15-shift-open]');
    if(shiftOpen){openShiftModal(shiftOpen.dataset.v15ShiftOpen);return;}

    const go=e.target.closest('[data-v15-go]');
    if(go){closeAlert();navigate(go.dataset.v15Go);return;}

    const disOpen=e.target.closest('[data-v15-dismiss-open]');
    if(disOpen){
      mutateState(st=>{if(!st.dismissed.includes(disOpen.dataset.v15DismissOpen))st.dismissed.push(disOpen.dataset.v15DismissOpen);});
      renderShifts();updateAlerts();return;
    }

    const disNotice=e.target.closest('[data-v15-dismiss-notice]');
    if(disNotice){
      mutateState(st=>{if(!st.noticeDismissed.includes(disNotice.dataset.v15DismissNotice))st.noticeDismissed.push(disNotice.dataset.v15DismissNotice);});
      updateAlerts();return;
    }

    const noticeAction=e.target.closest('[data-v15-notice-action]');
    if(noticeAction){handleNoticeAction(noticeAction.dataset.v15NoticeAction);return;}

    if(e.target.closest('[data-v15-close]'))closeAlert();
  });
}

function addSelfShiftControls(){
  const s=window.homeNextService;if(!s)return;
  const card=$id('serviceDetail'),root=card?.querySelector('.side-stack');if(!root||card.querySelector('#v15ShiftCard'))return;
  const uid=window.novaActiveAccount||'demo';
  const worker=window.novaCloudShifts?.[s.id+'/'+uid];
  const start=worker?.start||s.time.split('–')[0],end=worker?.end||s.time.split('–')[1];
  root.insertAdjacentHTML('beforeend',`<article id="v15ShiftCard" class="glass card"><h4>Mi turno</h4><p class="muted" style="font-size:11px">Modifica tu horario si terminas antes o tu turno cambia. Se refleja en tu ficha.</p><div class="v15-shift-times"><label>Inicio<input type="time" id="v15Start" value="${esc(start)}"></label><label>Fin<input type="time" id="v15End" value="${esc(end)}"></label></div><button class="btn light" type="button" id="v15SaveShift">Guardar mi horario</button></article>`);
  $id('v15SaveShift').onclick=async()=>{try{const result=await window.NOVA_API.updateShift(s.id,uid,$id('v15Start').value,$id('v15End').value);window.novaCloudShifts=window.novaCloudShifts||{};window.novaCloudShifts[s.id+'/'+uid]={start:result.start,end:result.end};toast('Horario guardado','El turno de este trabajador ha sido actualizado en la demo.');if(typeof updateDemoWorkerFromServer==='function')updateDemoWorkerFromServer();}catch(e){toast('Horario',e.message);}};
}

function patchFunctions(){
  const previousDetail=window.renderServiceDetail;
  if(typeof previousDetail==='function')window.renderServiceDetail=function(s){
    previousDetail(s);
    const root=$id('serviceDetail')?.querySelector('.side-stack');if(!root)return;
    const current=$id('v15ShiftCard');if(current)current.remove();
    const uid=window.novaActiveAccount||'demo';
    const assigned=currentServices().some(x=>x.id===s.id);if(!assigned)return;
    const override=window.novaCloudShifts?.[s.id+'/'+uid];
    const start=override?.start||s.time.split('–')[0],end=override?.end||s.time.split('–')[1];
    root.insertAdjacentHTML('beforeend',`<article class="glass card" id="v15ShiftCard"><h4>Mi turno</h4><p class="muted">Puedes actualizar tu horario real de la demo.</p><div class="v15-shift-times"><label>Inicio<input id="v15Start" type="time" value="${esc(start)}"></label><label>Fin<input id="v15End" type="time" value="${esc(end)}"></label></div><button class="btn light" id="v15SaveShift" type="button">Guardar horario</button></article>`);
    $id('v15SaveShift').onclick=async()=>{try{const d=await window.NOVA_API.updateShift(s.id,uid,$id('v15Start').value,$id('v15End').value);window.novaCloudShifts=window.novaCloudShifts||{};window.novaCloudShifts[s.id+'/'+uid]={start:d.start,end:d.end};toast('Turno actualizado','Horario guardado para tu trabajador demo.');renderServiceDetail(s);}catch(e){toast('Turno',e.message);}};
  };

  const oldEnter=window.enterApp;
  if(typeof oldEnter==='function')window.enterApp=function(){
    oldEnter();
    setTimeout(()=>{
      if(lastAccount!==(window.novaActiveAccount||'demo')){
        lastAccount=window.novaActiveAccount||'demo';
        window.NOVA_V15_CONFIRM?.refresh?.();
      }
      hideHomeAvailableSection();
      fetchShifts();
      updateCounters();
      updateAlerts();
    },150);
  };

  const oldNavigate=window.navigate;
  if(typeof oldNavigate==='function')window.navigate=function(page){oldNavigate(page);updateCounters();if(page==='home')fetchShifts();};
}

window.NOVA_V15={updateAlerts,fetchShifts,visibleShifts,getAllShifts:()=>shifts.slice(),isDismissed:id=>readState().dismissed.includes(id)||readState().accepted.includes(id)};
mountProfileMenu();
patchFunctions();
hideHomeAvailableSection();
renderShifts();
updateCounters();
updateAlerts();
})();
