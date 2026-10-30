/* NOVA Crew · Unified coordination for every non-Crew-Head service. */
(()=>{
'use strict';
const el=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statuses=['PENDIENTE','CONTACTADO','NO CONTACTADO','PRESENTE','NO PRESENTADO'];
let active=null,workers=[],incidents=[],selected=new Set(),query='',statusFilter='ALL',timeFilter='ALL',busy=false;
let expandedCoordSections={attendance:false,entry:false,selection:false};
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

/* The same three separate dimensions as the full Crew Control. */
const ratingFields=[['ratingUniformidad','Uniformidad','U'],['ratingActitud','Actitud','A'],['ratingPuntualidad','Puntualidad','P']];
const currentRating=(w,field)=>Number(w[field]??(field==='ratingActitud'?w.rating:0))||0;
const ratingSummary=w=>{
 const values=ratingFields.map(([f])=>currentRating(w,f));
 const nonzero=values.filter(x=>x>0);
 const avg=nonzero.length?(nonzero.reduce((a,b)=>a+b,0)/nonzero.length).toFixed(1):'—';
 return '<button type="button" class="nova-rating-summary" data-nova-edit="'+escape(w.id)+'" aria-label="Valorar Uniformidad, Actitud y Puntualidad de '+escape(w.name)+'"><span class="nova-rating-summary-main">★ '+avg+'</span><small>'+ratingFields.map(([f,label,short],i)=>short+' '+(values[i]||'—')).join(' · ')+'</small></button>';
};
function ratingModalRows(worker,multi){
 return '<div class="nova-three-ratings">'+ratingFields.map(([field,label])=>{
  const val=multi?0:currentRating(worker,field);
  return '<div class="nova-rating-row" data-nova-rating-row="'+field+'"><strong>'+label+'</strong><div class="nova-modal-stars" role="group" aria-label="Valoración '+label+'">'+
  [1,2,3,4,5].map(n=>'<button type="button" class="'+(n<=val?'on':'')+'" data-nova-modalstar="'+n+'" data-nova-rating-field="'+field+'" aria-label="'+label+' '+n+' estrellas" aria-pressed="'+(n===val?'true':'false')+'">★</button>').join('')+
  '</div><button type="button" class="nova-rating-clear" data-nova-clear-rating="'+field+'">'+(multi?'Sin cambio':'Sin valoración')+'</button>'+
  '<input type="hidden" data-nova-rating-input="'+field+'" value=""></div>';
 }).join('')+'</div>';
}
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
 '<button type="button" class="nova-coord-fold" data-nova-fold="attendance" aria-expanded="'+expandedCoordSections.attendance+'">Estado de asistencia <span>⌄</span></button>'+ (expandedCoordSections.attendance?
 '<div class="nova-coord-filters">'+
 filterButton('Todos','status','ALL')+
 filterButton('Presentes','status','PRESENTE')+
 filterButton('Contactados','status','CONTACTADO')+
 filterButton('No contactados','status','NO CONTACTADO')+
 filterButton('No presentados','status','NO PRESENTADO')+
 filterButton('Pendientes','status','PENDIENTE')+'</div>':'')+
 '<button type="button" class="nova-coord-fold" data-nova-fold="entry" aria-expanded="'+expandedCoordSections.entry+'">Hora de entrada <span>⌄</span></button>'+ (expandedCoordSections.entry?
 '<div class="nova-coord-filters">'+filterButton('Todas','time','ALL')+times.map(v=>filterButton(v,'time',v)).join('')+'</div>':'')+
 '<button type="button" class="nova-coord-fold" data-nova-fold="selection" aria-expanded="'+expandedCoordSections.selection+'">Selección <span>⌄</span></button>'+ (expandedCoordSections.selection?
 '<div class="nova-coord-side-actions"><button data-nova-select-visible type="button">Seleccionar visibles</button><button data-nova-clear type="button">Limpiar selección</button></div>'+
 '<div class="nova-coord-selected">'+selected.size+' seleccionados</div>'+
 '<button class="btn dark nova-coord-edit" type="button" data-nova-bulk>Editar selección</button>':'')+
 '<div class="nova-coord-sidebar-foot">Incidencias: '+workers.filter(w=>w.incident).length+' · Dietas: '+workers.reduce((sum,w)=>sum+(w.diet==='Sí'?1:Number(w.diet)||0),0)+'</div>'+
 '</div></aside>';
}
function render(){
 const root=el('workerCoordDetail');if(!root||!active)return;
 const serviceType=roleTitle(active),list=visible();
 root.innerHTML='<div class="nova-unified-control"><div class="nova-unified-layout">'+
 sidebar()+'<section class="nova-unified-main">'+
 '<div class="nova-unified-heading"><div><span class="kicker">'+escape(serviceType)+' · '+escape(active.type||'SERVICIO')+'</span>'+
 '<h2>'+escape(active.name)+'</h2><p>'+escape(active.venue)+' · '+escape(active.date)+' · '+escape(active.time)+'</p></div>'+
 '<div class="nova-coord-header-actions"><button type="button" class="btn light" data-nova-incident>+ Reportar incidencia</button><button type="button" class="btn light" data-nova-refresh>Actualizar</button></div></div>'+
 '<div class="nova-unified-tools"><div><b>'+list.length+' trabajadores</b><span>'+escape(serviceType)+' · '+selected.size+' seleccionados</span></div>'+
 '<input id="novaUnifiedSearch" type="search" placeholder="Buscar trabajador…" value="'+escape(query)+'" autocomplete="off">'+
 '<button class="btn dark" data-nova-bulk type="button">Editar seleccionados ('+selected.size+')</button></div>'+
 '<div class="nova-unified-list">'+
 list.map(w=>
 '<article class="nova-unified-worker '+(selected.has(w.id)?'selected':'')+'" data-nova-worker="'+escape(w.id)+'">'+
 '<button class="nova-unified-name" type="button" data-nova-open-worker="'+escape(w.id)+'" aria-label="Abrir ficha de '+escape(w.name)+'"><strong>'+escape(w.name)+'</strong>'+
 (w.isCoordinator?'<small>COORDINADOR · '+escape(serviceType)+'</small>':'')+'</button>'+
 '<div class="nova-unified-role"><span>'+escape(w.role)+'</span><small>'+escape(w.start)+'–'+escape(w.end)+'</small></div>'+
 '<select class="nova-status-select" data-status="'+escape(w.status)+'" aria-label="Estado de '+escape(w.name)+'" data-nova-status="'+escape(w.id)+'">'+statuses.map(v=>'<option value="'+v+'" '+(w.status===v?'selected':'')+'>'+v+'</option>').join('')+'</select>'+
 ratingSummary(w)+
 '<div class="nova-unified-last">'+(w.phone?'<a href="tel:'+escape(w.phone.replace(/[^\d+]/g,''))+'">Llamar</a>':'')+
 '</div>'+
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
  workers=res.workers||[];incidents=res.incidents||[];
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
 openDemoModal(multi?'Editar '+ids.length+' trabajadores':'Ficha de '+first.name,
 '<div class="nova-coord-edit-form"><div class="nova-locked-role"><strong>Categoría: '+escape(first.role)+'</strong><small>Categoría asignada · Cambios únicamente mediante incidencia</small></div><div class="basic-modal-grid">'+row('novaEditStart','Inicio',multi?'':first.start)+row('novaEditEnd','Fin',multi?'':first.end)+
 '<label>Estado<select id="novaEditStatus"><option value="">Mantener</option>'+statuses.map(v=>'<option value="'+v+'" '+(!multi&&v===first.status?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>Pausa<select id="novaEditPause"><option value="">Mantener</option>'+['00:00','01:00','02:00','03:00'].map(v=>'<option '+(!multi&&v===first.pause?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>Dietas<select id="novaEditDiet"><option value="">Mantener</option>'+['0','1','2','3'].map(n=>'<option value="'+n+'" '+(!multi&&String(first.diet)===(n==='0'?'No':n==='1'?'Sí':n)?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
 '</div>'+ratingModalRows(first,multi)+
 '<button type="button" class="btn light" id="novaOpenIncident">Reportar incidencia</button>'+
 '</div><div class="crew-modal-actions"><button type="button" class="btn light" id="novaEditCancel">Cancelar</button><button type="button" class="btn primary" id="novaEditSubmit">Guardar cambios</button></div>');
 setTimeout(()=>{
  el('novaEditCancel').onclick=()=>closeDemoModal();
  el('novaOpenIncident').onclick=()=>openIncident(multi?'':first.id);
  el('novaEditSubmit').onclick=async()=>{
   const fields={start:el('novaEditStart').value,end:el('novaEditEnd').value,status:el('novaEditStatus').value,pause:el('novaEditPause').value,diet:el('novaEditDiet').value};
   for(const [field] of ratingFields)fields[field]=document.querySelector('[data-nova-rating-input="'+field+'"]')?.value||'';
   const c=Object.fromEntries(Object.entries(fields).filter(([k,v])=>v!==''));for(const [field] of ratingFields){if(field in c)c[field]=Number(c[field]);}
   if(!Object.keys(c).length){closeDemoModal();return}
   const b=el('novaEditSubmit');b.disabled=true;b.textContent='Guardando…';
   try{
    for(const id of ids){const r=await window.NOVA_API.smallCoord(active.id,'patch',id,c);if(!r.ok)throw Error(r.error||'No se pudo guardar');workers=r.workers||workers}
    closeDemoModal();selected.clear();render();toastMessage('Coordinación','Cambios guardados.');
   }catch(e){b.disabled=false;b.textContent='Guardar cambios';toastMessage('Error al guardar',e.message)}
  };
 },0);
}
function openIncident(workerId=''){
 if(!active)return;
 const options=workers.map(w=>'<option value="'+escape(w.id)+'" '+(w.id===workerId?'selected':'')+'>'+escape(w.name)+'</option>').join('');
 const categories=['Retraso','Uniformidad','Actitud','Seguridad','Ausencia','Daños','Cambio de categoría','Otro'];
 const roles=['HAND B','HAND A','CREW HEAD','COORDINADOR','FORKLIFTER','RUNNER','SITE','CATERING'];
 openDemoModal('Reportar incidencia','<div class="basic-modal-grid">'+
 '<label>Ámbito<select id="novaIncidentScope"><option value="worker" '+(workerId?'selected':'')+'>Trabajador</option><option value="general" '+(!workerId?'selected':'')+'>General del servicio</option></select></label>'+
 '<label id="novaIncidentWorkerWrap">Trabajador<select id="novaIncidentWorker">'+options+'</select></label>'+
 '<label>Tipo de incidencia<select id="novaIncidentType">'+categories.map(x=>'<option>'+x+'</option>').join('')+'</select></label>'+
 '<label>Gravedad<select id="novaIncidentSeverity"><option>Leve</option><option>Moderada</option><option>Grave</option></select></label>'+
 '<label id="novaIncidentRoleWrap" class="full" hidden>Nueva categoría<select id="novaIncidentRole">'+roles.map(x=>'<option>'+x+'</option>').join('')+'</select></label>'+
 '<label class="full">Descripción<textarea id="novaIncidentNotes" rows="4" maxlength="1500" required></textarea></label>'+
 '</div><div class="crew-modal-actions"><button class="btn light" id="novaIncidentCancel">Cancelar</button><button class="btn primary" id="novaIncidentSave">Guardar incidencia</button></div>');
 const scope=el('novaIncidentScope'),type=el('novaIncidentType');
 const sync=()=>{el('novaIncidentWorkerWrap').hidden=scope.value==='general';el('novaIncidentRoleWrap').hidden=type.value!=='Cambio de categoría';if(scope.value==='general'&&type.value==='Cambio de categoría')type.value='Otro';};
 scope.onchange=sync;type.onchange=sync;sync();
 el('novaIncidentCancel').onclick=closeDemoModal;
 el('novaIncidentSave').onclick=async()=>{
   const button=el('novaIncidentSave');button.disabled=true;button.textContent='Guardando…';
   try{
     const result=await window.NOVA_API.smallIncident(active.id,{
       scope:scope.value,workerId:el('novaIncidentWorker').value,incidentType:type.value,
       severity:el('novaIncidentSeverity').value,notes:el('novaIncidentNotes').value.trim(),
       newRole:type.value==='Cambio de categoría'?el('novaIncidentRole').value:''
     });
     if(!result.ok)throw Error(result.error||'No se ha podido guardar');
     closeDemoModal();await load(active,true);toastMessage('Incidencia','Incidencia registrada correctamente.');
   }catch(error){button.disabled=false;button.textContent='Guardar incidencia';toastMessage('Error',error.message)}
 };
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-nova-incident]')){openIncident();return;}
 const serviceSheet=e.target.closest('#openWorkerCoordServiceSheet');
 if(serviceSheet){
  if(!active)return;
  if(typeof renderServiceDetail==='function')renderServiceDetail(active);
  if(typeof navigate==='function')navigate('service-detail');
  return;
 }
 const modalStar=e.target.closest('[data-nova-modalstar][data-nova-rating-field]');
 if(modalStar){
  const field=modalStar.dataset.novaRatingField,n=Number(modalStar.dataset.novaModalstar);
  const row=document.querySelector('[data-nova-rating-row="'+field+'"]');
  const input=row?.querySelector('[data-nova-rating-input]');
  if(!input||!ratingFields.some(([f])=>f===field))return;
  input.value=String(n);
  row.querySelectorAll('[data-nova-modalstar]').forEach(st=>{
   st.classList.toggle('on',Number(st.dataset.novaModalstar)<=n);
   st.setAttribute('aria-pressed',String(Number(st.dataset.novaModalstar)===n));
  });
  return;
 }
 const clear=e.target.closest('[data-nova-clear-rating]');
 if(clear){
  const field=clear.dataset.novaClearRating,row=document.querySelector('[data-nova-rating-row="'+field+'"]');
  const input=row?.querySelector('[data-nova-rating-input]');if(!input)return;
  input.value=clear.textContent==='Sin cambio'?'':'0';
  row.querySelectorAll('[data-nova-modalstar]').forEach(st=>{st.classList.remove('on');st.setAttribute('aria-pressed','false')});
  return;
 }
 if(!e.target.closest('#workerCoordDetail')||!active)return;
 const fold=e.target.closest('[data-nova-fold]');if(fold){const key=fold.dataset.novaFold;expandedCoordSections[key]=!expandedCoordSections[key];render();return}
 const action=e.target.closest('[data-nova-edit]');
 if(action){edit([action.dataset.novaEdit]);return}
 if(e.target.closest('[data-nova-refresh]')){load(active,true);return}
 if(e.target.closest('[data-nova-bulk]')){edit([...selected]);return}
 if(e.target.closest('[data-nova-select-visible]')){visible().forEach(w=>selected.add(w.id));render();return}
 if(e.target.closest('[data-nova-clear]')){selected.clear();render();return}
 const filter=e.target.closest('[data-nova-filter]');
 if(filter){if(filter.dataset.novaFilter==='status')statusFilter=filter.dataset.novaFilterValue;else timeFilter=filter.dataset.novaFilterValue;render();return}
 const openWorker=e.target.closest('[data-nova-open-worker]');if(openWorker){edit([openWorker.dataset.novaOpenWorker]);return}
 const clickName=e.target.closest('[data-nova-select]');
 const row=e.target.closest('[data-nova-worker]');
 if(!clickName&&!row)return;
 if(!clickName&&e.target.closest('button,a,select,input'))return;
 const id=(clickName||row).dataset.novaSelect||(clickName||row).dataset.novaWorker;
 if(selected.has(id))selected.delete(id);else selected.add(id);render();
});
document.addEventListener('change',e=>{
 const sel=e.target.closest('[data-nova-status]');if(!sel||!active)return;
 sel.dataset.status=sel.value;
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