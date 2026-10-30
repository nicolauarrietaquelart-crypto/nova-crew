/* NOVA Crew · Unified coordination for every non-Crew-Head service. */
(()=>{
'use strict';
const el=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statuses=['PENDIENTE','CONTACTADO','NO CONTACTADO','PRESENTE','NO PRESENTADO'];
let active=null,workers=[],selected=new Set(),query='',statusFilter='ALL',timeFilter='ALL',busy=false;
const account=()=>window.novaActiveAccount||window.NOVA_API?.account||'demo';
const service=id=>typeof services!=='undefined'?services.find(x=>x.id===id):null;
const toastMessage=(title,msg)=>{if(typeof toast==='function')toast(title,msg)};
const countStatus=st=>workers.filter(w=>w.status===st).length;
const selectedWorkers=()=>workers.filter(w=>selected.has(w.id));
const roleTitle=s=>s.id==='svc7'?'SFX':s.id==='svc2'?'LOGÍSTICA':s.id==='svc1'?'STAGE':'GENERAL';
const visible=()=>workers.filter(w=>{
  const q=query.trim().toLocaleLowerCase('es');
  return (!q||[w.name,w.role,w.phone].join(' ').toLocaleLowerCase('es').includes(q)) &&
   (statusFilter==='ALL'||w.status===statusFilter)&&
   (timeFilter==='ALL'||w.start===timeFilter);
});
const stars=(id,number,context='row')=>{
 const val=Math.min(5,Math.max(0,Number(number)||0));
 return '<div class="nova-rating" role="group" aria-label="Valoración de '+escape(id)+'">'+
 [1,2,3,4,5].map(n=>'<button type="button" class="nova-star '+(n<=val?'active':'')+'" data-nova-rate="'+n+'" data-nova-rate-id="'+escape(id)+'" data-nova-rate-context="'+context+'" title="'+n+' estrellas" aria-label="'+n+' estrellas" '+(busy?'disabled':'')+'>'+(n<=val?'★':'☆')+'</button>').join('')+
 '</div>';
};
function applyRoles(){
 const coord=account()==='coord';
 const set=(id,patch)=>{const s=service(id);if(s)Object.assign(s,patch)};
 // One general Crew Head can manage every section. A normal coordinator only manages their type.
 set('svc2',coord?{role:'HAND B',specialty:'HAND B',privilege:'basic',assignedCoordinator:true,team:'LOGÍSTICA'}:{role:'FORKLIFTER',specialty:'FORKLIFTER',privilege:'worker',assignedCoordinator:false,team:'LOGÍSTICA'});
 set('svc1',coord?{role:'HAND B',specialty:'HAND B',privilege:'basic',assignedCoordinator:true,team:'STAGE'}:{role:'HAND B',specialty:'HAND B',privilege:'worker',assignedCoordinator:false,team:'STAGE'});
 set('svc3',coord?{role:'HAND A',specialty:'HAND A',privilege:'worker',assignedCoordinator:false,team:'LUCES'}:{role:'CREW HEAD',specialty:'CREW HEAD',privilege:'crew',assignedCoordinator:true,team:'PRINCIPAL'});
 set('svc4',coord?{role:'CREW HEAD',specialty:'CREW HEAD',privilege:'crew',assignedCoordinator:false,team:'OPERACIONES'}:{role:'CREW HEAD',specialty:'CREW HEAD',privilege:'crew',assignedCoordinator:true,team:'OPERACIONES'});
 set('svc6',{role:'HAND B',specialty:'HAND B',privilege:coord?'worker':'basic',assignedCoordinator:!coord,team:'GENERAL'});
 set('svc7',coord?{role:'CREW HEAD',specialty:'CREW HEAD',privilege:'crew',assignedCoordinator:false,team:'OPERACIONES'}:{role:'HAND B',specialty:'HAND B',privilege:'basic',assignedCoordinator:true,team:'SFX'});
}
function refreshOtherViews(){
 applyRoles();
 ['renderHomeServices','renderServices','renderCoordination','updateHomeNextService','syncCoordPermissionsV9'].forEach(name=>{try{if(typeof window[name]==='function')window[name]()}catch(err){console.warn(name,err)}});
 try{window.NOVA_V15_CONFIRM?.refresh?.()}catch{}
 try{window.NOVA_V15?.updateAlerts?.()}catch{}
}
const originalEnter=window.enterApp;
if(typeof originalEnter==='function')window.enterApp=function(...args){
 applyRoles();const out=originalEnter.apply(this,args);
 setTimeout(refreshOtherViews,40);return out;
};
function filterButton(title,key,value){
 const activeFlag=key==='status'?statusFilter===value:timeFilter===value;
 return '<button type="button" class="nova-filter-button '+(activeFlag?'on':'')+'" data-nova-filter="'+key+'" data-nova-filter-value="'+escape(value)+'">'+escape(title)+'</button>';
}
function sidebar(){
 const times=[...new Set(workers.map(w=>w.start))].sort();
 const metrics=[
  ['PERSONAS',workers.length],['PRESENTES',countStatus('PRESENTE')],['CONTACTADOS',countStatus('CONTACTADO')],['NO PRESENTADOS',countStatus('NO PRESENTADO')]
 ];
 return '<aside class="nova-coord-sidebar">'+
 '<div class="nova-coord-sidehead"><span>CONTROL OPERATIVO</span><strong>'+escape(roleTitle(active))+'</strong><small>'+escape(active.time)+' · '+workers.length+' trabajadores</small></div>'+
 '<div class="nova-coord-sidebody">'+
 '<div class="nova-coord-metrics">'+metrics.map(([label,count])=>'<div><b>'+count+'</b><span>'+label+'</span></div>').join('')+'</div>'+
 '<div class="nova-coord-side-title">Estado de asistencia</div>'+
 '<div class="nova-coord-filters">'+
 filterButton('Todos','status','ALL')+
 filterButton('Presentes','status','PRESENTE')+
 filterButton('Contactados','status','CONTACTADO')+
 filterButton('No contactados','status','NO CONTACTADO')+
 filterButton('No presentados','status','NO PRESENTADO')+
 filterButton('Pendientes','status','PENDIENTE')+'</div>'+
 '<div class="nova-coord-side-title">Hora de entrada</div>'+
 '<div class="nova-coord-filters">'+filterButton('Todas','time','ALL')+times.map(v=>filterButton(v,'time',v)).join('')+'</div>'+
 '<div class="nova-coord-side-title">Selección</div>'+
 '<div class="nova-coord-side-actions"><button data-nova-select-visible type="button">Seleccionar visibles</button><button data-nova-clear type="button">Limpiar selección</button></div>'+
 '<div class="nova-coord-selected">'+selected.size+' seleccionados</div>'+
 '<button class="btn dark nova-coord-edit" type="button" data-nova-bulk>Editar selección</button>'+
 '<div class="nova-coord-sidebar-foot">Incidencias: '+workers.filter(w=>w.incident).length+' · Dietas: '+workers.filter(w=>w.diet==='Sí').length+'</div>'+
 '</div></aside>';
}
function render(){
 const root=el('workerCoordDetail');if(!root||!active)return;
 const serviceType=roleTitle(active),list=visible();
 root.innerHTML='<div class="nova-unified-control">'+
 '<div class="nova-unified-heading"><div><span class="kicker">'+escape(serviceType)+' · '+escape(active.type||'SERVICIO')+'</span>'+
 '<h2>'+escape(active.name)+'</h2><p>'+escape(active.venue)+' · '+escape(active.date)+' · '+escape(active.time)+'</p></div>'+
 '<button type="button" class="btn light" data-nova-refresh>Actualizar</button></div>'+
 '<div class="nova-unified-layout">'+sidebar()+'<section class="nova-unified-main">'+
 '<div class="nova-unified-tools"><div><b>'+list.length+' trabajadores</b><span>'+escape(serviceType)+' · '+selected.size+' seleccionados</span></div>'+
 '<input id="novaUnifiedSearch" type="search" placeholder="Buscar trabajador…" value="'+escape(query)+'" autocomplete="off">'+
 '<button class="btn dark" data-nova-bulk type="button">Editar seleccionados ('+selected.size+')</button></div>'+
 '<div class="nova-unified-list">'+
 list.map(w=>
 '<article class="nova-unified-worker '+(selected.has(w.id)?'selected':'')+'" data-nova-worker="'+escape(w.id)+'">'+
 '<button class="nova-unified-name" type="button" data-nova-select="'+escape(w.id)+'" aria-pressed="'+(selected.has(w.id)?'true':'false')+'"><strong>'+escape(w.name)+'</strong>'+
 (w.isCoordinator?'<small>COORDINADOR · '+escape(serviceType)+'</small>':'')+'</button>'+
 '<div class="nova-unified-role"><span>'+escape(w.role)+'</span><small>'+escape(w.start)+'–'+escape(w.end)+'</small></div>'+
 '<select aria-label="Estado de '+escape(w.name)+'" data-nova-status="'+escape(w.id)+'">'+statuses.map(v=>'<option value="'+v+'" '+(w.status===v?'selected':'')+'>'+v+'</option>').join('')+'</select>'+
 stars(w.id,w.rating)+
 '<div class="nova-unified-last">'+(w.phone?'<a href="tel:'+escape(w.phone.replace(/[^\d+]/g,''))+'">Llamar</a>':'')+
 '<button class="btn light" type="button" data-nova-edit="'+escape(w.id)+'">Ficha</button></div>'+
 '</article>').join('')+
 (list.length?'':'<div class="nova-unified-empty">No hay trabajadores que coincidan con estos filtros.</div>')+
 '</div><p class="nova-unified-hint">Pulsa un nombre o una fila para seleccionarla en naranja. Las estrellas se guardan como valoraciones, separadas de las incidencias.</p>'+
 '</section></div></div>';
}
async function load(s,keep=false){
 active=s;if(!keep){selected.clear();query='';statusFilter='ALL';timeFilter='ALL'}
 const root=el('workerCoordDetail');if(root)root.innerHTML='<article class="glass card">Cargando personal del servicio…</article>';
 try{
  const res=await window.NOVA_API.smallCoord(s.id,'get');
  if(active?.id!==s.id)return;
  if(!res.ok)throw Error(res.error||'Error al cargar personal');
  workers=res.workers||[];
  if(account()==='demo'){
   const p=typeof portalProfile!=='undefined'?portalProfile:null;
   if(p?.name){const own=workers.find(w=>w.id==='demo');if(own)own.name=p.name}
  }
  render();
 }catch(e){root.innerHTML='<article class="glass card"><h3>La coordinación no ha cargado</h3><p>'+escape(e.message)+'</p><button type="button" class="btn dark" data-nova-refresh>Reintentar</button></article>'}
}
async function patch(id,changes){
 if(!active||busy)return;
 busy=true;
 try{
  const r=await window.NOVA_API.smallCoord(active.id,'patch',id,changes);
  if(!r.ok)throw Error(r.error||'Error de guardado');
  workers=r.workers||workers;render();
 }catch(e){toastMessage('No se ha podido guardar',e.message);await load(active,true)}
 finally{busy=false}
}
function edit(ids){
 if(!ids.length){toastMessage('Coordinación','Selecciona uno o más trabajadores pulsando sus nombres.');return}
 const first=workers.find(w=>w.id===ids[0]);if(!first||typeof openDemoModal!=='function')return;
 const multi=ids.length>1;
 const row=(id,label,val)=>'<label>'+label+'<input type="time" id="'+id+'" value="'+escape(val||'')+'"></label>';
 const starsModal=()=>{
  const val=multi?0:Number(first.rating)||0;
  return '<label class="nova-modal-stars-label">Valoración'+
   '<div class="nova-modal-stars">'+[1,2,3,4,5].map(n=>'<button type="button" data-nova-modalstar="'+n+'" class="'+(n<=val?'on':'')+'" title="'+n+' estrellas">'+(n<=val?'★':'☆')+'</button>').join('')+'</div>'+
   '<input type="hidden" id="novaModalRating" value="'+(multi?'':val)+'">'+
   '<small>Incidencias y estrellas se guardan por separado</small></label>';
 };
 openDemoModal(multi?'Editar '+ids.length+' trabajadores':'Ficha de '+first.name,
 '<div class="basic-modal-grid">'+row('novaEditStart','Inicio',multi?'':first.start)+row('novaEditEnd','Fin',multi?'':first.end)+
 '<label>Estado<select id="novaEditStatus"><option value="">Mantener</option>'+statuses.map(v=>'<option value="'+v+'" '+(!multi&&v===first.status?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>Pausa<select id="novaEditPause"><option value="">Mantener</option>'+['00:00','00:15','00:30','00:45','01:00'].map(v=>'<option '+(!multi&&v===first.pause?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>Dieta<select id="novaEditDiet"><option value="">Mantener</option><option '+(!multi&&first.diet==='Sí'?'selected':'')+'>Sí</option><option '+(!multi&&first.diet==='No'?'selected':'')+'>No</option></select></label>'+
 starsModal()+
 '<label class="nova-incident-field">Incidencia / observaciones<input type="text" maxlength="200" id="novaEditIncident" value="'+(multi?'':escape(first.incident||''))+'"></label>'+
 '</div><div class="crew-modal-actions"><button type="button" class="btn light" id="novaEditCancel">Cancelar</button><button type="button" class="btn primary" id="novaEditSubmit">Guardar cambios</button></div>');
 setTimeout(()=>{
  el('novaEditCancel').onclick=()=>closeDemoModal();
  el('novaEditSubmit').onclick=async()=>{
   const fields={start:el('novaEditStart').value,end:el('novaEditEnd').value,status:el('novaEditStatus').value,pause:el('novaEditPause').value,diet:el('novaEditDiet').value,rating:el('novaModalRating').value,incident:el('novaEditIncident').value};
   const c=Object.fromEntries(Object.entries(fields).filter(([k,v])=>v!==''));if('rating' in c)c.rating=Number(c.rating);
   if(!Object.keys(c).length){closeDemoModal();return}
   const b=el('novaEditSubmit');b.disabled=true;b.textContent='Guardando…';
   try{
    for(const id of ids){const r=await window.NOVA_API.smallCoord(active.id,'patch',id,c);if(!r.ok)throw Error(r.error||'No se pudo guardar');workers=r.workers||workers}
    closeDemoModal();selected.clear();render();toastMessage('Coordinación','Cambios guardados.');
   }catch(e){b.disabled=false;b.textContent='Guardar cambios';toastMessage('Error al guardar',e.message)}
  };
 },0);
}
document.addEventListener('click',e=>{
 const modalStar=e.target.closest('[data-nova-modalstar]');
 if(modalStar){
  const n=Number(modalStar.dataset.novaModalstar);
  if(el('novaModalRating'))el('novaModalRating').value=String(n);
  document.querySelectorAll('[data-nova-modalstar]').forEach(st=>{const on=Number(st.dataset.novaModalstar)<=n;st.classList.toggle('on',on);st.textContent=on?'★':'☆'});
  return;
 }
 if(!e.target.closest('#workerCoordDetail')||!active)return;
 const rate=e.target.closest('[data-nova-rate-id]');
 if(rate){patch(rate.dataset.novaRateId,{rating:Number(rate.dataset.novaRate)});return}
 const action=e.target.closest('[data-nova-edit]');
 if(action){edit([action.dataset.novaEdit]);return}
 if(e.target.closest('[data-nova-refresh]')){load(active,true);return}
 if(e.target.closest('[data-nova-bulk]')){edit([...selected]);return}
 if(e.target.closest('[data-nova-select-visible]')){visible().forEach(w=>selected.add(w.id));render();return}
 if(e.target.closest('[data-nova-clear]')){selected.clear();render();return}
 const filter=e.target.closest('[data-nova-filter]');
 if(filter){if(filter.dataset.novaFilter==='status')statusFilter=filter.dataset.novaFilterValue;else timeFilter=filter.dataset.novaFilterValue;render();return}
 const clickName=e.target.closest('[data-nova-select]');
 const row=e.target.closest('[data-nova-worker]');
 if(!clickName&&!row)return;
 if(!clickName&&e.target.closest('button,a,select,input'))return;
 const id=(clickName||row).dataset.novaSelect||(clickName||row).dataset.novaWorker;
 if(selected.has(id))selected.delete(id);else selected.add(id);render();
});
document.addEventListener('change',e=>{
 const sel=e.target.closest('[data-nova-status]');if(!sel||!active)return;
 patch(sel.dataset.novaStatus,{status:sel.value});
});
document.addEventListener('input',e=>{
 if(e.target?.id!=='novaUnifiedSearch')return;
 query=e.target.value;const position=e.target.selectionStart;render();
 const node=el('novaUnifiedSearch');node?.focus();try{node?.setSelectionRange(position,position)}catch{}
});
const oldBasic=window.renderWorkerCoord;
window.renderWorkerCoord=function(s){
 if(!['svc1','svc2','svc6','svc7'].includes(s?.id))return oldBasic(s);
 const user=account();
 if(!((user==='demo'&&['svc6','svc7'].includes(s.id))||(user==='coord'&&['svc1','svc2'].includes(s.id)))){
  toastMessage('Sin acceso','Este servicio no está dentro de tu coordinación.');return;
 }
 load(s);
};
window.NOVA_HIERARCHY={applyRoles,refresh:refreshOtherViews};
applyRoles();
})();