/* NOVA Crew · two-level coordination: Crew Head (full) / HAND coordinator (scoped) */
(()=>{
'use strict';
const $$=sel=>document.querySelector(sel);
const X=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=null,workers=[],selected=new Set(),filter='';
const getService=id=>typeof services!=='undefined'?services.find(s=>s.id===id):null;
const account=()=>window.novaActiveAccount||window.NOVA_API?.account||'demo';
function applyRoles(){
 const s=getService('svc7');if(!s)return;
 const isCrew=account()==='coord';
 s.role=isCrew?'CREW HEAD':'HAND B';
 s.specialty=s.role;
 s.privilege=isCrew?'crew':'basic';
 s.team=isCrew?'OPERACIONES':'SFX';
 s.assignedCoordinator=true;
}
function syncScreens(){
 applyRoles();
 if(typeof renderHomeServices==='function')renderHomeServices();
 if(typeof renderServices==='function')renderServices();
 if(typeof renderCoordination==='function')renderCoordination();
 if(typeof updateHomeNextService==='function')updateHomeNextService();
 if(typeof renderCalendar==='function')renderCalendar();
 if(typeof syncCoordPermissionsV9==='function')syncCoordPermissionsV9();
 window.NOVA_V15_CONFIRM?.refresh?.();
 window.NOVA_V15?.updateAlerts?.();
}
const oldEnter=window.enterApp;
if(typeof oldEnter==='function')window.enterApp=function(...args){
 applyRoles();
 const out=oldEnter.apply(this,args);
 setTimeout(syncScreens,30);
 return out;
};
function render(){
 const box=$$('#workerCoordDetail');if(!box||!active)return;
 const type=active.id==='svc7'?'SFX':'GENERAL';
 const actor=account();
 const heading=type==='SFX'?'Coordinación SFX':'Coordinación de HANDS';
 const sub=type==='SFX'?'Concierto general: Álvaro Costa (Crew Head). Solo puedes gestionar a los cuatro trabajadores de SFX.':'Servicio reducido: cuatro HANDS en total, incluido Pau, sin Crew Head.';
 const visible=workers.filter(w=>[w.name,w.role,w.phone].join(' ').toLowerCase().includes(filter.toLowerCase()));
 box.innerHTML='<div class="nova-small-scope">'+
 '<div class="nova-small-heading"><div><span class="kicker">COORDINACIÓN NORMAL · '+X(type)+'</span><h2>'+X(heading)+'</h2><p>'+X(active.name)+'</p><small>'+X(sub)+'</small></div><button type="button" class="btn light" data-nova-reload>Actualizar</button></div>'+
 '<div class="nova-small-toolbar"><span class="nova-small-count">'+workers.length+' HANDS · '+workers.filter(w=>w.isCoordinator).length+' coordinador de equipo</span><input id="novaSmallSearch" type="search" placeholder="Buscar trabajador…" value="'+X(filter)+'"><button type="button" class="btn dark" data-nova-mass>Editar seleccionados ('+selected.size+')</button></div>'+
 '<div class="nova-small-table-wrap"><table class="nova-small-table"><thead><tr><th>Personal</th><th>Categoría</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Teléfono</th><th>Ficha</th></tr></thead><tbody>'+
 visible.map(w=>'<tr class="'+(selected.has(w.id)?'is-selected':'')+'">'+
 '<td><button type="button" class="nova-small-person" data-nova-select="'+X(w.id)+'"><strong>'+X(w.name)+'</strong>'+(w.isCoordinator?'<small>COORDINADOR '+X(type)+'</small>':'')+'</button></td>'+
 '<td>'+X(w.role)+'</td><td>'+X(w.start)+'</td><td>'+X(w.end)+'</td><td><select data-nova-status="'+X(w.id)+'" aria-label="Estado de '+X(w.name)+'">'+
 ['PENDIENTE','PRESENTE','CONTACTADO','NO CONTACTADO','NO PRESENTADO'].map(st=>'<option '+(st===w.status?'selected':'')+'>'+st+'</option>').join('')+'</select></td>'+
 '<td>'+(w.phone?'<a href="tel:'+X(w.phone.replace(/[^\d+]/g,''))+'">'+X(w.phone)+'</a>':'—')+'</td>'+
 '<td><button type="button" class="btn light" data-nova-edit="'+X(w.id)+'">Editar</button></td></tr>').join('')+
 '</tbody></table></div><p class="nova-small-help">Pulsa un nombre para seleccionarlo. La edición se guarda en Cloudflare. El Crew Head puede ver los cambios de SFX desde Crew Control.</p></div>';
}
async function load(s,quiet=false){
 active=s;filter='';if(!quiet)selected.clear();
 const box=$$('#workerCoordDetail');if(box)box.innerHTML='<div class="glass card"><p>Cargando personal del servicio…</p></div>';
 try{
  const data=await window.NOVA_API.smallCoord(s.id,'get');
  if(!data.ok)throw new Error(data.error||'No se pudo cargar el equipo.');
  if(active?.id!==s.id)return;
  workers=data.workers||[];
  if(account()==='demo'){
    const profile=typeof portalProfile!=='undefined'?portalProfile:null;
    const own=workers.find(w=>w.id==='demo');
    if(own && profile?.name)own.name=profile.name;
  }
  render();
 }catch(err){
  if(box)box.innerHTML='<article class="glass card"><h3>No se pudo abrir la coordinación</h3><p>'+X(err.message)+'</p><button class="btn dark" data-nova-reload>Reintentar</button></article>';
 }
}
async function patchOne(id,changes){
 const res=await window.NOVA_API.smallCoord(active.id,'patch',id,changes);
 if(!res.ok)throw Error(res.error||'No se pudo guardar');
 workers=res.workers||workers;render();
}
function toastResult(title,msg){if(typeof toast==='function')toast(title,msg)}
function editModal(ids){
 if(!ids.length)return toastResult('Selecciona personal','Pulsa los nombres de los trabajadores que quieras editar.');
 const multi=ids.length>1;
 const first=workers.find(w=>w.id===ids[0]);
 if(typeof openDemoModal!=='function')return;
 const opt=(w,label,value)=>'<label>'+label+'<input id="'+w+'" type="time" value="'+(value||'')+'"></label>';
 const options=['PENDIENTE','PRESENTE','CONTACTADO','NO CONTACTADO','NO PRESENTADO'];
 openDemoModal(multi?'Edición masiva de '+ids.length+' HANDS':'Ficha de '+first.name,
  '<p class="muted">'+(multi?'Los campos que dejes vacíos no se cambiarán.':'Gestionas este trabajador dentro del equipo asignado.')+'</p>'+
  '<div class="basic-modal-grid">'+opt('nsStart','Inicio',multi?'':first.start)+opt('nsEnd','Fin',multi?'':first.end)+
  '<label>Estado<select id="nsStatus"><option value="">Mantener</option>'+options.map(v=>'<option '+(!multi&&first.status===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
  '<label>Pausa<select id="nsPause"><option value="">Mantener</option>'+['00:00','00:15','00:30','00:45','01:00','01:30'].map(v=>'<option '+(!multi&&first.pause===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
  '<label>Dieta<select id="nsDiet"><option value="">Mantener</option><option'+(!multi&&first.diet==='Sí'?' selected':'')+'>Sí</option><option'+(!multi&&first.diet==='No'?' selected':'')+'>No</option></select></label>'+
  '<label>Valoración (0-5)<select id="nsRating"><option value="">Mantener</option>'+[0,1,2,3,4,5].map(v=>'<option value="'+v+'" '+(!multi&&Number(first.rating)===v?'selected':'')+'>'+v+' estrellas</option>').join('')+'</select></label>'+
  '<label style="grid-column:1/-1">Incidencia o nota<input id="nsIncident" type="text" maxlength="200" placeholder="Opcional" value="'+(multi?'':X(first.incident||''))+'"></label></div>'+
  '<div class="crew-modal-actions"><button type="button" class="btn light" id="nsCancel">Cancelar</button><button type="button" class="btn primary" id="nsSave">Guardar cambios</button></div>');
 setTimeout(()=>{
  $$('#nsCancel').onclick=()=>closeDemoModal();
  $$('#nsSave').onclick=async()=>{
   const fields={start:$$('#nsStart').value,end:$$('#nsEnd').value,status:$$('#nsStatus').value,pause:$$('#nsPause').value,diet:$$('#nsDiet').value,rating:$$('#nsRating').value,incident:$$('#nsIncident').value};
   const changes=Object.fromEntries(Object.entries(fields).filter(([key,v])=>multi? v!=='' : (key==='rating'?v!=='' : v!=='')));
   if('rating' in changes)changes.rating=Number(changes.rating);
   if(!Object.keys(changes).length){closeDemoModal();return}
   const b=$$('#nsSave');b.disabled=true;b.textContent='Guardando…';
   try{
    for(const id of ids){const result=await window.NOVA_API.smallCoord(active.id,'patch',id,changes);if(!result.ok)throw new Error(result.error||'Error al guardar');workers=result.workers||workers;}
    selected.clear();closeDemoModal();render();toastResult('Coordinación','Cambios guardados en el servicio.');
   }catch(e){b.disabled=false;b.textContent='Guardar cambios';toastResult('No se pudo guardar',e.message)}
  };
 },0);
}
document.addEventListener('click',e=>{
 if(!active||!e.target.closest('#workerCoordDetail'))return;
 const v=e.target.closest('[data-nova-select]');if(v){if(selected.has(v.dataset.novaSelect))selected.delete(v.dataset.novaSelect);else selected.add(v.dataset.novaSelect);render();return}
 const edit=e.target.closest('[data-nova-edit]');if(edit){editModal([edit.dataset.novaEdit]);return}
 if(e.target.closest('[data-nova-mass]')){editModal([...selected]);return}
 if(e.target.closest('[data-nova-reload]')){load(active,true);return}
});
document.addEventListener('change',async e=>{
 const status=e.target.closest('[data-nova-status]');if(!status||!active)return;
 status.disabled=true;
 try{await patchOne(status.dataset.novaStatus,{status:status.value});toastResult('Estado actualizado','Guardado en Cloudflare.')}
 catch(err){toastResult('Error',err.message);await load(active,true)}
});
document.addEventListener('input',e=>{
 if(e.target?.id!=='novaSmallSearch')return;
 const pos=e.target.selectionStart;
 filter=e.target.value;
 render();
 const input=$$('#novaSmallSearch');if(input){input.focus();input.setSelectionRange(pos,pos)}
});
const oldBasic=window.renderWorkerCoord;
window.renderWorkerCoord=function(s){
 if(!['svc6','svc7'].includes(s?.id))return oldBasic(s);
 if(account()!=='demo'){if(typeof toast==='function')toast('Coordinación','Esta coordinación no está asignada a tu usuario.');return}
 load(s);
};
window.NOVA_HIERARCHY={applyRoles,refresh:syncScreens};
applyRoles();
})();