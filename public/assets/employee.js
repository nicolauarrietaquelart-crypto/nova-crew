'use strict';
(() => {
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0);
const today=()=>new Date().toLocaleDateString('en-CA');
const human=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short'}):'—';
const stamp=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const names={dashboard:'Inicio',clock:'Control horario',availability:'Disponibilidad',services:'Mis servicios',calendar:'Mi agenda',coordination:'Coordinación',crewControl:'Crew Control',company:'Datos empresa',training:'Formación',documents:'Documentación',tutorials:'Tutoriales',settlements:'Liquidaciones',contracts:'Contratos',messages:'Mensajes',profile:'Mi perfil'};
const navPaths={
 crewControl:'M3 4h18v16H3z M8 9h8 M8 13h8 M8 17h5',
 dashboard:'m3 10 9-7 9 7v10H4V10 M9 20v-7h6v7',
 clock:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18 M12 7v5l3 2',
 availability:'M3 5h18v16H3z M8 3v4 M16 3v4 M3 10h18 M8 15l3 3 5-5',
 services:'M3 7h18v14H3z M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M3 12h18',
 calendar:'M3 5h18v16H3z M8 3v4 M16 3v4 M3 10h18',
 coordination:'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-2a6 6 0 0 1 12 0v2 M17 11a3 3 0 1 0 0-6 M16 14a5 5 0 0 1 6 5v2',
 company:'M4 21V3h16v18 M9 7h2 M14 7h2 M9 12h2 M14 12h2 M10 21v-5h4v5',
 training:'m2 9 10-5 10 5-10 5z M6 11v6c3 3 9 3 12 0v-6',
 documents:'M6 2h8l5 5v15H6z M14 2v5h5 M9 13h6 M9 17h6',
 tutorials:'M3 4h18v16H3z M10 8l6 4-6 4z',
 settlements:'M3 3h18v18H3z M7 10h10 M7 14h10',
 contracts:'M5 3h10l4 4v14H5z M15 3v5h4 M8 12h8 M8 16h5',
 messages:'M3 4h18v14H7l-4 3z M7 9h10 M7 13h7',
 profile:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-2a8 8 0 0 1 16 0v2'
};
const navIcon=k=>'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(navPaths[k]||navPaths.dashboard)+'"/></svg>';

let state={},page='dashboard',month=today().slice(0,7),isLoading=false;
async function api(op,body){
 const r=await fetch('/api/office/'+op,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 let d;try{d=await r.json()}catch{throw Error('Respuesta inválida del servidor.')}
 if(!r.ok)throw Error(d.error||'No se ha podido completar la operación.');
 return d;
}
function placeForAssignment(a){return (state.servicePlaces||[]).find(p=>p.id===a?.placeId&&!p.archived)||null}
function coordinatingServices(){const ids=new Set(state.coordinatorServiceIds||[]);return list('services').filter(s=>ids.has(s.id))}
function locationForAssignment(a){const p=placeForAssignment(a),sv=service(a?.serviceId);return p?.lat!=null&&p?.lng!=null?{venueLat:p.lat,venueLng:p.lng,radiusMeters:p.radiusMeters,name:p.name}:sv}
async function attendanceLocation(serviceId,assignmentId=''){
 const relevant=myAssignments().find(a=>a.id===assignmentId),sv=service(serviceId);
 const specific=locationForAssignment(relevant),hasSpecific=specific?.venueLat!=null&&specific?.venueLng!=null;
 const hasAnyPlaces=(state.servicePlaces||[]).some(p=>p.serviceId===serviceId&&p.lat!=null&&p.lng!=null);
 if(!hasSpecific&&!hasAnyPlaces&&!(sv.venueLat!=null&&sv.venueLng!=null))return {};
 if(!navigator.geolocation)throw new Error('El fichaje de este servicio requiere ubicación, pero tu navegador no la admite.');
 const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:12000,maximumAge:0}));
 return {latitude:position.coords.latitude,longitude:position.coords.longitude};
}
function notice(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500)}
function error(e){notice(e.message||String(e))}
function list(k){return(state[k]||[]).filter(x=>!x.archived)}
function worker(){return state.workers?.find(w=>w.id===state.user?.workerId)||{}}
function service(id){return state.services?.find(s=>s.id===id)||{}}
function myAssignments(){return list('assignments').filter(a=>a.workerId===state.user.workerId)}
function status(s){return '<span class="badge '+esc(s)+'">'+esc(({confirmed:'Confirmado',pending:'Pendiente',rejected:'Rechazado',planned:'Planificado',completed:'Finalizado',in_progress:'En curso',cancelled:'Cancelado'})[s]||s)+'</span>'}
function box(title,content){return '<section class="panel"><div class="panel-head"><h2>'+esc(title)+'</h2></div>'+content+'</section>'}
function btn(action,label,id,cls='secondary'){return '<button type="button" class="'+cls+'" data-action="'+action+'" data-id="'+esc(id||'')+'">'+esc(label)+'</button>'}
function modal(title,html){$('#employee-modal').classList.remove('clock-dialog');$('#modal-title').textContent=title;$('#modal-body').innerHTML=html;if(!$('#employee-modal').open)$('#employee-modal').showModal()}
function serviceCard(a){
 const s=service(a.serviceId),place=placeForAssignment(a),d=new Date(a.date+'T12:00:00');
 const dateTile='<div class="date-tile"><strong>'+d.getDate()+'</strong><small>'+d.toLocaleDateString('es-ES',{month:'short'})+'</small></div>';
 const text='<div class="service-info"><strong>'+esc(s.name||'Servicio')+'</strong><small>'+esc(place?.name||s.venue||'')+' · '+esc(a.role)+' · '+esc(a.team||'Equipo por confirmar')+'</small><small>'+human(a.date)+' '+esc(a.start)+' → '+human(a.endDate)+' '+esc(a.end)+' · '+a.hours+' h previstas</small></div>';
 const acts='<div class="service-actions">'+status(a.status)+btn('detail','Ver detalles',a.id)+(a.status==='pending'?btn('confirm','Confirmar',a.id,'primary')+btn('reject','Rechazar',a.id):'')+(a.status!=='rejected'&&!a.checkOut&&s.status!=='completed'&&s.status!=='cancelled'?btn('open-clock','Fichar',a.id,'primary'):'')+'</div>';
 return '<article class="service-card">'+dateTile+text+acts+'</article>';
}
function renderNav(){
 const pc=Object.entries(names).filter(([key])=>key!=='crewControl'||coordinatingServices().length>0).map(([key,label])=>'<button type="button" data-page="'+key+'" class="'+(page===key?'active':'')+'"><span class="nova-nav-icon">'+navIcon(key)+'</span><span>'+esc(label)+'</span>'+(key==='coordination'&&state.coordinatorRoster?.length?'<b>'+state.coordinatorRoster.length+'</b>':'')+'</button>').join('');
 $('#employee-nav').innerHTML=pc;
 $('#mobile-nav').innerHTML=['dashboard','clock','services','calendar','coordination'].map(k=>'<button data-page="'+k+'" class="'+(page===k?'active':'')+'">'+navIcon(k)+'<small>'+esc(names[k])+'</small></button>').join('');
}

let nextCountTimer=null;
function nextServiceCountdown(){
 const root=$('#next-countdown');if(!root)return;
 const date=root.dataset.date,start=root.dataset.start,target=new Date(date+'T'+start+':00').getTime();
 if(!Number.isFinite(target)){root.textContent='—';return}
 const delta=Math.max(0,target-Date.now()),seconds=Math.floor(delta/1000);
 const units=[Math.floor(seconds/86400),Math.floor(seconds%86400/3600),Math.floor(seconds%3600/60),seconds%60],labels=['días','horas','min','seg'];
 root.innerHTML=units.map((v,i)=>'<div><b>'+String(v).padStart(2,'0')+'</b><span>'+labels[i]+'</span></div>').join('');
}
function dashboard(){
 const as=myAssignments(),future=as.filter(a=>a.date>=today()&&a.status!=='rejected').sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)),open=as.filter(a=>a.checkIn&&!a.checkOut);
 const pending=as.filter(a=>a.status==='pending'),training=list('documents').filter(d=>d.type==='training'&&!(state.trainingAcks||[]).some(ack=>ack.documentId===d.id));
 const stats='<div class="stats"><div class="stat orange"><span class="muted">Próximos servicios</span><strong>'+future.length+'</strong><small>Programados</small></div><div class="stat"><span class="muted">Por confirmar</span><strong>'+pending.length+'</strong><small>Responde a tus asignaciones</small></div><div class="stat"><span class="muted">Fichajes abiertos</span><strong>'+open.length+'</strong><small>Entradas sin salida</small></div><div class="stat"><span class="muted">Documentos</span><strong>'+list('documents').length+'</strong><small>Disponibles para descargar</small></div></div>';
 const next=future[0],nextService=next&&service(next.serviceId);
 const hero='<section class="employee-next-hero"><div><span class="eyebrow">PRÓXIMO SERVICIO</span>'+
 '<h2>'+esc(nextService?.name||'Sin servicios próximos')+'</h2>'+
 '<p class="muted">'+(next?esc(human(next.date)+' · '+next.start+'–'+next.end+' · '+(nextService.venue||'')):'En cuanto tengas una asignación aparecerá aquí.')+'</p>'+
 (next?'<div class="employee-countdown" id="next-countdown" data-date="'+esc(next.date)+'" data-start="'+esc(next.start)+'"></div>':'')+
 '<div class="actions-row">'+btn('open-clock','Fichar',next?.id||'','primary')+(next?btn('detail','Ver servicio',next.id):'')+'</div></div>'+
 '<div class="employee-next-aside"><div><span>Servicios próximos</span><b>'+future.length+'</b></div><div><span>Coordinaciones</span><b>'+coordinatingServices().length+'</b></div><div><span>Documentos pendientes</span><b>'+list('documents').filter(d=>d.expires&&d.expires<today()).length+'</b></div><div><span>Formación</span><b>'+training.length+' pendiente(s)</b></div></div></section>';
 $('#employee-content').innerHTML='<div class="section-title"><h2>Hola, '+esc(state.user.name.split(' ')[0])+'</h2><p class="muted">Bienvenido a tu espacio personal</p></div>'+hero+stats+
 (pending.length?'<div class="notice"><strong>'+pending.length+' servicio(s) pendiente(s) de confirmar.</strong><div class="actions-row" style="margin-top:10px">'+btn('go-services','Ver asignaciones')+'</div></div>':'')+
 box('Próximos servicios',future.slice(0,5).length?'<div class="service-list">'+future.slice(0,5).map(serviceCard).join('')+'</div>':'<div class="empty">Todavía no tienes servicios próximos.</div>')+
 box('Control horario',open.length?'<div class="notice">Tienes '+open.length+' fichaje(s) abiertos. '+btn('open-clock','Abrir control horario')+'</div>':'<p class="muted">Abre el control horario para registrar entrada o salida. El fichaje se muestra en una ventana emergente.</p>');
 if(next){nextServiceCountdown();if(nextCountTimer)clearInterval(nextCountTimer);nextCountTimer=setInterval(()=>{if($('#next-countdown'))nextServiceCountdown();else{clearInterval(nextCountTimer);nextCountTimer=null}},1000)}
}
function servicesPage(){
 const as=myAssignments().sort((a,b)=>(b.date+b.start).localeCompare(a.date+a.start));
 $('#employee-content').innerHTML='<div class="section-title"><h2>Servicios y confirmaciones</h2><p class="muted">Tus turnos, estados y registro horario.</p></div>'+(as.length?'<div class="service-list">'+as.map(serviceCard).join('')+'</div>':'<div class="panel empty">No tienes asignaciones actualmente.</div>');
}
function calendarPage(){
 const [y,m]=month.split('-').map(Number),first=new Date(y,m-1,1),last=new Date(y,m,0).getDate(),offset=(first.getDay()+6)%7;
 const as=myAssignments();
 let cells=['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(d=>'<div class="cal-weekday">'+d+'</div>').join('');
 for(let i=0;i<offset;i++)cells+='<div class="cal-day off"></div>';
 for(let i=1;i<=last;i++){
  const date=month+'-'+String(i).padStart(2,'0'),events=as.filter(a=>a.date<=date&&a.endDate>=date);
  cells+='<div class="cal-day '+(date===today()?'today':'')+'"><strong>'+i+'</strong>'+events.map(a=>'<span class="cal-event" title="'+esc(service(a.serviceId).name)+'">'+esc(service(a.serviceId).name||'Turno')+'</span>').join('')+'</div>';
 }
 $('#employee-content').innerHTML='<div class="panel"><div class="cal-head"><button class="secondary" data-action="prev-month">Anterior</button><h2>'+first.toLocaleDateString('es-ES',{month:'long',year:'numeric'})+'</h2><button class="secondary" data-action="next-month">Siguiente</button></div><div class="calendar-grid">'+cells+'</div></div>';
}
function availabilityPage(){
 const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate(),records=list('availability');let html='';
 for(let d=1;d<=last;d++){
  const day=month+'-'+String(d).padStart(2,'0'),a=records.find(r=>r.date===day),st=a?.status||'';
  html+='<button class="availability-cell '+esc(st)+'" data-action="availability" data-date="'+day+'"><strong>'+d+'</strong><small>'+esc(st==='unavailable'?'No disponible':st==='available'?'Disponible':'Sin indicar')+'</small></button>';
 }
 $('#employee-content').innerHTML='<div class="actions-row" style="margin-bottom:16px">'+btn('weekly','Configurar semana habitual','','primary')+'</div><div class="notice">Selecciona un día para indicar tu disponibilidad. Los cambios se guardan en tu perfil y los verá la oficina.</div><div class="cal-head"><button class="secondary" data-action="prev-month">Anterior</button><h2>'+new Date(y,m-1,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'})+'</h2><button class="secondary" data-action="next-month">Siguiente</button></div><div class="availability-grid">'+html+'</div>';
}
function documentsPage(){
 const docs=list('documents');
 $('#employee-content').innerHTML='<div class="actions-row" style="margin-bottom:16px">'+btn('document-upload','Subir o renovar documento','','primary')+'</div>'+
 box('Mis documentos',docs.length?docs.map(d=>'<div class="document"><div><strong>'+esc(d.name)+'</strong><br><small>'+esc(d.type||'Documento')+(d.expires?' · Caduca '+human(d.expires):'')+(d.source==='employee'?' · Subido por ti':'')+'</small></div><a href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a></div>').join(''):'<div class="empty">Todavía no tienes documentos vinculados.</div>');
}
async function uploadPersonalDocument(){
 modal('Subir documentación','<form id="personal-doc-form" style="display:grid;gap:12px"><p class="muted">Sube un documento para revisión. Los contratos oficiales solo los publica el responsable.</p><label class="form-label">Tipo de documento<select class="field" name="type"><option value="identity">Identificación</option><option value="medical">Aptitud / reconocimiento</option><option value="training">Formación / PRL</option><option value="other">Otro</option></select></label><label class="form-label">Archivo PDF o imagen (máx. 5 MB)<input class="field" type="file" name="file" accept=".pdf,.png,.jpg,.jpeg" required></label><label class="form-label">Fecha de caducidad (opcional)<input class="field" type="date" name="expires"></label><button class="primary" type="submit">Enviar documento</button></form>');
 $('#personal-doc-form').onsubmit=async ev=>{
  ev.preventDefault();const form=ev.target,file=form.elements.file.files[0];
  if(!file||file.size>5*1024*1024)return error(new Error('El archivo debe ocupar menos de 5 MB.'));
  try{
   const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('Error al leer el archivo.'));reader.readAsDataURL(file)});
   await api('employee-document-upload',{name:file.name,content,type:form.elements.type.value,expires:form.elements.expires.value});
   $('#employee-modal').close();await load();notice('Documento enviado correctamente');
  }catch(ex){error(ex)}
 };
}
let selectedPayrollMonth='';
function settlementsPage(){
 const all=myAssignments().filter(a=>a.status!=='rejected').sort((a,b)=>b.date.localeCompare(a.date));
 const months=[...new Set(all.map(a=>a.date.slice(0,7)))],current=selectedPayrollMonth||months[0]||today().slice(0,7);
 selectedPayrollMonth=current;
 const rows=all.filter(a=>a.date.startsWith(current)),confirmed=rows.filter(a=>a.payStatus==='confirmed');
 const total=confirmed.reduce((sum,a)=>sum+(a.grossPay||0),0);
 $('#employee-content').innerHTML='<div class="notice">Liquidación <strong>bruta estimada</strong> según turnos y tarifas registrados. No es una nómina ni acredita transferencias; no incluye retenciones, cotizaciones del empleado ni otros ajustes laborales.</div>'+
 '<div class="actions-row" style="margin-bottom:16px">'+months.map(m=>'<button class="'+(m===current?'primary':'secondary')+'" data-action="payroll-month" data-month="'+esc(m)+'">'+esc(m)+'</button>').join('')+btn('download-payroll','Descargar CSV','','secondary')+'</div>'+
 '<div class="stats"><div class="stat orange"><span class="muted">Periodo '+esc(current)+'</span><strong>'+euro(total)+'</strong><small>Importes confirmados</small></div><div class="stat"><span class="muted">Servicios</span><strong>'+rows.length+'</strong><small>Del periodo</small></div></div>'+
 box('Detalle de liquidación',rows.length?'<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Servicio</th><th>Fecha</th><th>Importe bruto</th><th>Estado</th></tr></thead><tbody>'+
 rows.map(a=>'<tr><td>'+esc(service(a.serviceId).name||'Servicio')+'</td><td>'+human(a.date)+'</td><td>'+euro(a.grossPay)+'</td><td>'+(a.payStatus==='confirmed'?'Confirmada':'Pendiente')+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Sin servicios durante este periodo.</div>');
}
function downloadPayroll(){
 const entries=myAssignments().filter(a=>a.date.startsWith(selectedPayrollMonth));
 const csvCell=v=>{let x=String(v??'');if(/^[=+@-]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"';};
 const data=[['Fecha','Servicio','Categoría','Bruto EUR','Estado'],...entries.map(a=>[a.date,service(a.serviceId).name,a.role,(a.grossPay||0).toFixed(2),a.payStatus==='confirmed'?'Confirmada':'Pendiente'])];
 const csv='\ufeff'+data.map(row=>row.map(csvCell).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
 a.href=url;a.download='NOVA_liquidacion_'+selectedPayrollMonth+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

let profileTab='personal';
function profilePage(){
 const w=worker(),p=state.profile||{},type=({eventual:'Eventual / por servicio',indefinite:'Indefinido',fixed_discontinuous:'Fijo discontinuo'})[w.contractType]||'Eventual / por servicio';
 const tabs=[['personal','Datos personales'],['work','Datos laborales'],['skills','Idiomas y conocimientos']];
 const line=(a,b)=>'<div class="line"><span>'+esc(a)+'</span><strong>'+esc(Array.isArray(b)?b.join(', '):b||'—')+'</strong></div>';
 const content=profileTab==='personal'?
 line('Nombre',w.name||state.user.name)+line('Correo',w.email)+line('Móvil',w.phone)+line('Nacionalidad',p.nationality)+line('Ciudad',p.city)+line('Código postal',p.postalCode)+line('Provincia',p.province)+line('País',p.country):
 profileTab==='work'?line('Especialidad',w.specialty)+line('Tipo de contrato',type)+line('Alta',w.startDate)+line('Fin de contrato',w.endDate)+line('Talla',p.shirtSize)+line('Carnet de conducir',p.drivingLicense)+line('Vehículo',p.ownVehicle):
 line('Idiomas',p.languages)+line('Carnets / conocimientos',p.skills)+line('Formación académica',p.education);
 $('#employee-content').innerHTML='<div class="actions-row" style="margin-bottom:15px">'+btn('upload-photo','Actualizar fotografía','','primary')+btn('edit-profile','Editar datos')+'</div>'+
 '<div class="profile-tabs">'+tabs.map(([k,l])=>'<button type="button" class="'+(k===profileTab?'active':'')+'" data-action="profile-tab" data-tab="'+k+'">'+esc(l)+'</button>').join('')+'</div>'+
 box(tabs.find(([k])=>k===profileTab)?.[1]||'Mi perfil',content)+
 box('Seguridad','<p class="muted">Puedes cambiar tu contraseña. Para modificar tus datos de contratación, contacta con la oficina.</p><div class="actions-row" style="margin-top:12px">'+btn('password','Cambiar contraseña')+'</div>');
}
/* Original v15 clock opens as a modal, without replacing the current page. */
let clockSelection='',clockCountdown=null;
function clockAssignments(){
 return myAssignments().filter(a=>a.status!=='rejected'&&a.status!=='cancelled').sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
}
function closeClock(){
 if(clockCountdown){clearInterval(clockCountdown);clockCountdown=null}
 if($('#employee-modal').open)$('#employee-modal').close();
}
function clockPage(){openClockModal()}
function openClockModal(preferredId=''){
 stopQrCamera();
 const all=clockAssignments();
 const fallback=all.find(a=>a.checkIn&&!a.checkOut)||all.find(a=>a.date>=today()&&!a.checkOut)||all[0];
 clockSelection=(all.find(a=>a.id===(preferredId||clockSelection))||fallback)?.id||'';
 const options=all.map(a=>'<option value="'+esc(a.id)+'" '+(a.id===clockSelection?'selected':'')+'>'+esc(service(a.serviceId).name||'Servicio')+' · '+esc(a.date)+' · '+esc(a.start)+'</option>').join('');
 modal('Control horario · Fichaje con ubicación','<div class="clock-popup">'+
 (all.length?'<label class="form-label">Servicio para fichar<select id="clock-service-picker" class="field">'+options+'</select></label><div id="clock-service-summary"></div>':
 '<div class="empty">No tienes servicios asignados. Cuando la oficina te asigne un turno aparecerá aquí para fichar.</div>')+'</div>');
 $('#employee-modal').classList.add('clock-dialog');
 const picker=$('#clock-service-picker');if(picker)picker.onchange=e=>{clockSelection=e.target.value;renderClockModal()};
 renderClockModal();
}
function renderClockModal(){
 const root=$('#clock-service-summary');if(!root)return;
 const a=clockAssignments().find(x=>x.id===clockSelection);
 if(!a){root.innerHTML='<p class="empty">No hay turnos para fichar.</p>';return}
 const sv=service(a.serviceId),place=placeForAssignment(a),geo=locationForAssignment(a),closed=!!a.checkOut||['completed','cancelled'].includes(sv.status);
 const coordinator=!!sv.coordinatorId;
 const remaining=Date.parse(a.date+'T'+a.start+':00')-Date.now();
 const minutes=remaining>0?Math.ceil(remaining/60000):0;
 const distanceEnabled=geo.venueLat!=null&&geo.venueLng!=null;
 const insideWindow=remaining<=3600000;
 root.innerHTML='<div class="clock-current"><span class="eyebrow">SERVICIO SELECCIONADO</span><h3>'+esc(sv.name||'Servicio')+'</h3><p class="muted">'+esc(place?.name||sv.venue||'')+' · '+esc(a.role)+' · '+human(a.date)+' '+esc(a.start)+'–'+esc(a.end)+'</p></div>'+
 '<div class="clock-location"><div><small>Ubicación del servicio</small><strong>'+esc(place?.name||sv.venue||'Sin recinto')+'</strong><span>'+esc(distanceEnabled?Number(geo.radiusMeters||500)+' m de radio autorizado':'Sin restricción geográfica configurada')+'</span></div>'+
 '<div class="clock-distance"><strong id="clock-distance">—</strong><small>distancia</small></div>'+
 '<div><small>Tu ubicación</small><strong id="clock-my-location">'+(distanceEnabled?'Sin comprobar':'No requerida')+'</strong><span id="clock-location-detail">'+(distanceEnabled?'Pulsa comprobar ubicación':'Este servicio no exige GPS')+'</span></div></div>'+
 (distanceEnabled?'<div class="clock-geo-note">'+btn('check-location','Comprobar mi ubicación',a.id)+'</div>':'')+
 '<div class="clock-timing">'+(minutes>0?'Inicio previsto en '+minutes+' min. ':'')+'Entrada: <strong>'+stamp(a.checkIn)+'</strong> · Salida: <strong>'+stamp(a.checkOut)+'</strong></div>'+
 (closed?'<div class="notice">El fichaje de este turno ya está cerrado.</div>':
 '<div class="clock-popup-actions">'+
 (coordinator?btn('qr','Mostrar QR de '+(a.checkIn?'salida':'entrada'),a.id,'primary'):
 btn('self-clock',a.checkIn?'Registrar salida':'Registrar entrada',a.id,'primary'))+
 '</div><p class="muted compact">'+(coordinator?'El coordinador debe escanear tu QR para confirmar el fichaje.':'Fichaje personal con hora del servidor.')+'</p>')+
 (!insideWindow&&!a.checkIn?'<p class="muted compact">El turno todavía no está dentro de la hora previa al inicio. Revisa las condiciones de fichaje del servicio.</p>':'');
}
async function verifyClockPosition(id){
 const a=clockAssignments().find(a=>a.id===id);if(!a)return;
 const sv=locationForAssignment(a);
 try{
  const coords=await attendanceLocation(a.serviceId,a.id);
  const R=6371000,rad=Math.PI/180,lat1=coords.latitude*rad,lat2=Number(sv.venueLat)*rad;
  const dlat=lat2-lat1,dlon=(Number(sv.venueLng)-coords.longitude)*rad;
  const h=Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;
  const metres=Math.round(R*2*Math.asin(Math.min(1,Math.sqrt(h))));
  const badge=$('#clock-distance'),position=$('#clock-my-location'),detail=$('#clock-location-detail');
  if(badge)badge.textContent=metres>=1000?(metres/1000).toFixed(1)+' km':metres+' m';
  if(position)position.textContent=metres<=Number(sv.radiusMeters||500)?'Dentro del recinto':'Fuera del radio';
  if(detail)detail.textContent='Ubicación comprobada para este fichaje';
 }catch(e){error(e)}
}
function coordinationPage(){
 const services=coordinatingServices();
 const roster=state.coordinatorRoster||[],workers=state.coordinatorWorkers||[],blocks=state.coordinatorBlocks||[];
 const person=id=>workers.find(w=>w.id===id)?.name||'Personal';
 $('#employee-content').innerHTML='<div class="section-title"><h2>Coordinación de personal</h2><p class="muted">Puedes coordinar un servicio y trabajar como HAND en otro, utilizando la misma cuenta.</p></div>'+
 (services.length?services.map(s=>box(s.name+' · '+s.venue,
 '<div class="notice">'+(blocks.filter(b=>b.serviceId===s.id).map(b=>'<strong>'+esc(b.date)+' · '+esc(b.serviceType)+' · '+esc(b.start)+'–'+esc(b.end)+'</strong>').join('<br>')||'Coordinación general del servicio')+'</div><div class="actions-row" style="margin-bottom:12px">'+btn('scan-qr','Escanear QR',s.id,'primary')+btn('redeem-qr','Introducir código QR',s.id)+btn('crew-open','Abrir Crew Control',s.id,'primary')+btn('incident-report','Registrar incidencia',s.id)+'</div>'+
 '<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Trabajador</th><th>Categoría</th><th>Horario</th><th>Confirmación</th><th>Fichaje</th><th></th></tr></thead><tbody>'+
 roster.filter(a=>a.serviceId===s.id).map(a=>'<tr><td>'+esc(person(a.workerId))+'</td><td>'+esc(a.role)+'</td><td>'+esc(a.date)+' · '+esc(a.serviceType||'Servicio')+' · '+esc(a.start)+'–'+esc(a.end)+'</td><td>'+status(a.status)+'</td><td>'+esc(a.checkIn?'Presente':'Pendiente')+(a.checkOut?' · Salida registrada':'')+'</td><td>'+btn('edit-coord-shift','Horario',a.id)+'</td></tr>').join('')+'</tbody></table></div>')).join(''):'<div class="panel empty">No coordinas ningún servicio actualmente. Un gestor de oficina puede asignarte como coordinador de un día y tipo de servicio.</div>');
}

let selectedCrewService='',crewFilter='all';
function crewControlPage(){
 const svcs=coordinatingServices();
 if(!svcs.length){$('#employee-content').innerHTML='<div class="panel empty">No tienes servicios bajo tu coordinación.</div>';return}
 if(!svcs.some(s=>s.id===selectedCrewService))selectedCrewService=svcs[0].id;
 const sv=service(selectedCrewService),records=(state.coordinatorRoster||[]).filter(a=>a.serviceId===selectedCrewService),people=state.coordinatorWorkers||[];
 const person=id=>people.find(w=>w.id===id)?.name||'Personal';
 const present=records.filter(a=>a.checkIn&&!a.checkOut).length,absent=records.filter(a=>!a.checkIn).length,contacted=records.filter(a=>a.contacted).length,noTeam=records.filter(a=>!a.team).length;
 const matches=a=>crewFilter==='all'||(crewFilter==='present'&&a.checkIn&&!a.checkOut)||(crewFilter==='absent'&&!a.checkIn)||(crewFilter==='contacted'&&a.contacted)||(crewFilter==='no-team'&&!a.team);
 $('#employee-content').innerHTML='<div class="section-title"><h2>Crew Control</h2><p class="muted">Panel operativo del servicio asignado · no muestra salarios ni facturación</p></div>'+
 '<div class="panel"><div class="panel-head"><h2>'+esc(sv.name)+'</h2>'+btn('scan-qr','Escanear QR',sv.id,'primary')+'</div>'+
 '<label class="form-label">Servicio<select class="field" id="crew-service-select">'+svcs.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===selectedCrewService?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></label></div>'+
 '<div class="stats">'+[['Todos',records.length,'all'],['Presentes',present,'present'],['No presentados',absent,'absent'],['Contactados',contacted,'contacted']].map(([label,count,f])=>'<button class="stat '+(crewFilter===f?'orange':'')+'" data-action="crew-filter" data-filter="'+f+'" style="text-align:left;cursor:pointer"><span class="muted">'+label+'</span><strong>'+count+'</strong></button>').join('')+'</div>'+
 '<div class="actions-row" style="margin-bottom:14px">'+btn('crew-filter','Sin equipo ('+noTeam+')','','secondary')+btn('incident-report','Registrar incidencia',sv.id)+'</div>'+
 box('Plantilla · '+records.filter(matches).length+' trabajadores',records.filter(matches).length?
 '<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Personal</th><th>Equipo</th><th>Turno</th><th>Fichaje</th><th>Contacto</th><th>Acciones</th></tr></thead><tbody>'+
 records.filter(matches).map(a=>'<tr><td><strong>'+esc(person(a.workerId))+'</strong><br><small>'+esc(a.role)+'</small></td><td>'+esc(a.team||'Sin equipo')+'</td><td>'+esc(a.date)+' · '+esc(a.serviceType||'Servicio')+' · '+esc(a.start)+'–'+esc(a.end)+'</td><td>'+esc(a.checkIn?'Presente':'Pendiente')+(a.checkOut?' · Salida':'')+'</td><td>'+esc(a.contacted?'Contactado':'Pendiente')+'</td><td><div class="actions-row">'+btn('crew-contact',a.contacted?'Desmarcar contacto':'Contactado',a.id)+btn('crew-team','Equipo',a.id)+btn('edit-coord-shift','Horario',a.id)+'</div></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">No hay trabajadores con este filtro.</div>');
}
function crewTeamModal(id){
 const a=(state.coordinatorRoster||[]).find(a=>a.id===id);if(!a)return;
 modal('Cambiar equipo','<form id="crew-team-form" style="display:grid;gap:12px"><label class="form-label">Equipo del trabajador<input class="field" name="team" maxlength="100" value="'+esc(a.team||'')+'"></label><button class="primary" type="submit">Guardar equipo</button></form>');
 $('#crew-team-form').onsubmit=async e=>{e.preventDefault();try{await api('coordinator-control',{id,revision:a.revision,field:'team',value:e.target.elements.team.value});$('#employee-modal').close();await load();notice('Equipo actualizado')}catch(ex){error(ex)}};
}

function companyPage(){
 const c=state.company||{};
 $('#employee-content').innerHTML=box('Información de la empresa',
 '<div class="line"><span>Empresa</span><strong>'+esc(c.name||'No configurada')+'</strong></div>'+
 '<div class="line"><span>Dirección</span><strong>'+esc(c.address||'No indicada')+'</strong></div>'+
 '<div class="line"><span>Teléfono</span><strong>'+esc(c.phone||'No indicado')+'</strong></div>'+
 '<div class="line"><span>Correo</span><strong>'+esc(c.email||'No indicado')+'</strong></div>');
}
function trainingPage(){
 const docs=list('documents').filter(d=>d.type==='training'),acks=state.trainingAcks||[];
 $('#employee-content').innerHTML=box('Formación asignada',docs.length?docs.map(d=>'<div class="document"><div><strong>'+esc(d.name)+'</strong><br><small>'+human(d.createdAt.slice(0,10))+' · '+(acks.some(a=>a.documentId===d.id)?'Leída':'Pendiente')+'</small></div><div class="actions-row"><a class="secondary" style="display:inline-flex;align-items:center" href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a>'+(!acks.some(a=>a.documentId===d.id)?btn('training-ack','Marcar como leída',d.id,'primary'):'')+'</div></div>').join(''):'<div class="empty">No tienes formación documental asignada.</div>');
}
function contractsPage(){
 const docs=list('documents').filter(d=>d.type==='contract'),w=worker(),type=({eventual:'Eventual / por servicio',indefinite:'Indefinido',fixed_discontinuous:'Fijo discontinuo'})[w.contractType]||'Eventual / por servicio';
 $('#employee-content').innerHTML='<div class="notice">Modalidad registrada: <strong>'+esc(type)+'</strong>. Los documentos descargados son archivos almacenados por la oficina; no implica firma electrónica.</div>'+
 box('Mis contratos',docs.length?docs.map(d=>'<div class="document"><div><strong>'+esc(d.name)+'</strong><br><small>Documento contractual</small></div><a href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a></div>').join(''):'<div class="empty">No hay contratos cargados en tu ficha.</div>');
}
const guides=[
 ['Fichaje por QR','Abre Control horario, muestra tu QR temporal al coordinador y espera la validación. El código caduca a los 90 segundos.'],
 ['Gestión de coordinación','En Coordinación, selecciona el servicio asignado, consulta el personal y valida los QR. Solo puedes gestionar los servicios que coordinas.'],
 ['Operativa Crew Head','Consulta la asistencia de cada equipo y corrige horarios dentro de las funciones autorizadas. Comunica las incidencias a la oficina.'],
 ['Documentación','Descarga tus contratos, fichas y certificados desde Documentación y Contratos.'],
 ['Disponibilidad','Marca tu disponibilidad por día o define horarios semanales habituales.'],
 ['Liquidaciones','Consulta los importes brutos por servicio y los periodos confirmados, antes de retenciones.']
];
function tutorialsPage(){
 $('#employee-content').innerHTML='<div class="section-title"><h2>Guías rápidas del portal</h2></div><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+guides.map(([title,body],i)=>'<div class="panel"><h3>'+esc(title)+'</h3><p class="muted" style="margin:12px 0">'+esc(body)+'</p>'+btn('tutorial','Abrir guía',String(i))+'</div>').join('')+'</div>';
}
function messagesPage(){
 const messages=state.messages||[],users=(state.users||[]).filter(u=>u.role==='manager');
 $('#employee-content').innerHTML=box('Mensajes a la oficina','<div class="service-list">'+(messages.length?messages.map(m=>'<div class="document"><div><strong>'+(m.senderId===state.user.id?'Tú':'la oficina')+'</strong><small> · '+stamp(m.createdAt)+'</small><p>'+esc(m.content)+'</p></div></div>').join(''):'<p class="muted">No hay mensajes.</p>')+'</div><form id="employee-message-form" style="display:grid;gap:12px;margin-top:18px"><label class="form-label">Enviar a<select class="field" name="recipientId" required>'+users.map(u=>'<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>').join('')+'</select></label><label class="form-label">Mensaje<textarea name="content" class="field" maxlength="2000" required></textarea></label><button class="primary" type="submit">Enviar mensaje</button></form>');
 $('#employee-message-form').onsubmit=async ev=>{ev.preventDefault();try{await api('message-send',Object.fromEntries(new FormData(ev.target)));await load();notice('Mensaje enviado')}catch(e){error(e)}};
}

function employeePhotoModal(){
 modal('Fotografía de perfil','<form id="employee-photo-form" style="display:grid;gap:12px"><p class="muted">Sube una fotografía PNG o JPEG de menos de 1 MB. Solo tú y la oficina podrán consultarla.</p><label class="form-label">Fotografía<input type="file" name="photo" accept="image/png,image/jpeg" required></label><button class="primary" type="submit">Guardar fotografía</button></form>');
 $('#employee-photo-form').onsubmit=async ev=>{
  ev.preventDefault();
  const file=ev.target.elements.photo.files[0];
  if(!file||file.size>1024*1024||!['image/png','image/jpeg'].includes(file.type))return error(new Error('Selecciona un JPEG o PNG de menos de 1 MB.'));
  try{
   const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('No se pudo leer la imagen.'));reader.readAsDataURL(file)});
   await api('employee-photo-upload',{mime:file.type,content});
   $('#employee-modal').close();await load();notice('Fotografía guardada');
  }catch(e){error(e)}
 };
}

function extendedProfile(){
 const p=state.profile||{};
 const controls=[['nationality','Nacionalidad'],['postalCode','Código postal'],['city','Ciudad'],['province','Provincia'],['country','País'],['shirtSize','Talla de camiseta'],['drivingLicense','Carnet de conducir'],['ownVehicle','Vehículo propio'],['languages','Idiomas (separados por coma)'],['skills','Carnets y conocimientos (separados por coma)'],['education','Estudios (separados por coma)']];
 const fields=controls.map(([k,label])=>'<label class="form-label">'+esc(label)+'<input class="field" name="'+k+'" value="'+esc(Array.isArray(p[k])?p[k].join(', '):p[k]||'')+'"></label>').join('');
 modal('Editar mi perfil', '<form id="employee-profile-form" style="display:grid;gap:12px;grid-template-columns:1fr 1fr">'+fields+'<button class="primary" style="grid-column:1/-1" type="submit">Guardar cambios</button></form>');
 $('#employee-profile-form').onsubmit=async ev=>{ev.preventDefault();const input=Object.fromEntries(new FormData(ev.target));for(const k of ['languages','skills','education'])input[k]=input[k].split(',').map(x=>x.trim()).filter(Boolean);input.revision=p.revision;try{await api('employee-profile',{record:input});$('#employee-modal').close();await load();notice('Perfil actualizado')}catch(e){error(e)}};
}
function weeklyAvailabilityModal(){
 const current=state.weeklyAvailability?.days||{};
 const days={mon:'Lunes',tue:'Martes',wed:'Miércoles',thu:'Jueves',fri:'Viernes',sat:'Sábado',sun:'Domingo'};
 modal('Disponibilidad semanal','<form id="weekly-form" style="display:grid;gap:12px">'+Object.entries(days).map(([key,label])=>{
  const val=current[key]||{available:false,start:'08:00',end:'23:00'};
  return '<div class="line" style="align-items:center;gap:8px"><label style="flex:1"><input type="checkbox" name="'+key+'_available" '+(val.available?'checked':'')+'> '+label+'</label><input class="field" style="width:100px" aria-label="Inicio '+label+'" name="'+key+'_start" type="time" value="'+esc(val.start)+'"><input class="field" style="width:100px" aria-label="Fin '+label+'" name="'+key+'_end" type="time" value="'+esc(val.end)+'"></div>'
 }).join('')+'<button class="primary" type="submit">Guardar semana habitual</button></form>');
 $('#weekly-form').onsubmit=async e=>{e.preventDefault();const f=e.target,input=Object.fromEntries(new FormData(f)),data={};for(const key of Object.keys(days))data[key]={available:!!input[key+'_available'],start:input[key+'_start'],end:input[key+'_end']};try{await api('availability-weekly',{days:data});$('#employee-modal').close();await load();notice('Semana guardada')}catch(ex){error(ex)}};
}
function redeemQr(serviceId){
 modal('Validar QR de personal','<form id="qr-redeem-form" style="display:grid;gap:12px"><p class="muted">Introduce el código temporal que muestra el trabajador.</p><label class="form-label">Código QR<input class="field" name="token" required autocomplete="off"></label><button class="primary" type="submit">Registrar fichaje</button></form>');
 $('#qr-redeem-form').onsubmit=async e=>{e.preventDefault();try{await api('qr-redeem',{token:e.target.elements.token.value.trim(),...await attendanceLocation(serviceId)});$('#employee-modal').close();await load();notice('Fichaje validado')}catch(ex){error(ex)}};
}
let qrCamera=null,qrFrame=null;
function stopQrCamera(){if(qrFrame)cancelAnimationFrame(qrFrame);qrFrame=null;if(qrCamera)qrCamera.getTracks().forEach(track=>track.stop());qrCamera=null}
async function scanQr(serviceId){
 redeemQr(serviceId);
 if(!navigator.mediaDevices?.getUserMedia||!('BarcodeDetector' in window))return;
 try{
  const detector=new BarcodeDetector({formats:['qr_code']}),stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
  qrCamera=stream;
  const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=stream;video.style.cssText='width:100%;max-height:240px;border-radius:12px;object-fit:cover';
  $('#modal-body').prepend(video);await video.play();
  const scan=async()=>{if(!qrCamera||!$('#employee-modal').open)return;try{const codes=await detector.detect(video);if(codes.length){const code=codes[0].rawValue;stopQrCamera();$('#qr-redeem-form').elements.token.value=code;$('#qr-redeem-form').requestSubmit();return}}catch{}qrFrame=requestAnimationFrame(scan)};
  qrFrame=requestAnimationFrame(scan);
 }catch(e){error(new Error('Cámara no disponible; puedes introducir el código manualmente.'))}
}
function incidentModal(serviceId){
 const people=(state.coordinatorRoster||[]).filter(a=>a.serviceId===serviceId),workers=state.coordinatorWorkers||[];
 modal('Nueva incidencia','<form id="incident-form" style="display:grid;gap:12px"><p class="muted">La incidencia quedará registrada con tu usuario y podrá consultarla la oficina.</p><label class="form-label">Trabajador (opcional)<select class="field" name="workerId"><option value="">Incidencia general</option>'+people.map(a=>'<option value="'+esc(a.workerId)+'">'+esc(workers.find(w=>w.id===a.workerId)?.name||'Personal')+'</option>').join('')+'</select></label><label class="form-label">Descripción<textarea class="field" name="description" maxlength="2000" required></textarea></label><button class="primary" type="submit">Registrar incidencia</button></form>');
 $('#incident-form').onsubmit=async e=>{e.preventDefault();try{await api('incident-report',{serviceId,...Object.fromEntries(new FormData(e.target))});$('#employee-modal').close();await load();notice('Incidencia registrada')}catch(ex){error(ex)}};
}
function coordShift(id){
 const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(!a)return;
 modal('Cambiar horario del personal','<form id="coord-shift-form" style="display:grid;gap:12px"><label class="form-label">Día de inicio<input class="field" name="date" type="date" value="'+esc(a.date)+'" required></label><label class="form-label">Hora inicio<input class="field" name="start" type="time" value="'+esc(a.start)+'" required></label><label class="form-label">Día final<input class="field" name="endDate" type="date" value="'+esc(a.endDate)+'" required></label><label class="form-label">Hora fin<input class="field" name="end" type="time" value="'+esc(a.end)+'" required></label><button class="primary" type="submit">Guardar horario</button></form>');
 $('#coord-shift-form').onsubmit=async ev=>{ev.preventDefault();try{await api('coordinator-shift',{id,revision:a.revision,...Object.fromEntries(new FormData(ev.target))});$('#employee-modal').close();await load();notice('Horario actualizado')}catch(e){error(e)}};
}

function render(){
 if(!state.user)return;
 renderNav();$('#page-title').textContent=names[page];$('#employee-name').textContent=state.user.name;
 $('#employee-avatar').innerHTML=state.hasProfilePhoto?'<img alt="Foto de perfil" src="/api/office/employee-photo?workerId='+encodeURIComponent(state.user.workerId)+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">':esc(state.user.name.split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase());
 ({dashboard,clock:clockPage,availability:availabilityPage,services:servicesPage,calendar:calendarPage,coordination:coordinationPage,crewControl:crewControlPage,company:companyPage,training:trainingPage,documents:documentsPage,tutorials:tutorialsPage,settlements:settlementsPage,contracts:contractsPage,messages:messagesPage,profile:profilePage})[page]();
}
async function load(){
 if(isLoading)return;isLoading=true;
 try{
  state=await api('state');
  if(state.user.role!=='worker'){window.location.replace('/');return}
  $('#employee-login').hidden=true;$('#employee-app').hidden=false;render();
 }catch(e){
  if(String(e.message).includes('sesión')||String(e.message).includes('Inicia sesión')){$('#employee-app').hidden=true;$('#employee-login').hidden=false}else error(e);
 }finally{isLoading=false}
}
async function mutation(op,body,msg){try{await api(op,body);await load();notice(msg)}catch(e){error(e)}}
async function showQR(id){
 const a=myAssignments().find(x=>x.id===id);if(!a)return;
 try{
  const d=await api('qr-issue',{id});
  if(!window.NOVA_QR_Encoder)throw Error('Codificador QR no disponible.');
  const qr=new window.NOVA_QR_Encoder(0,window.NOVA_QR_Level.M);qr.addData(d.token);qr.make();
  const size=qr.getModuleCount(),paths=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(qr.isDark(y,x))paths.push('M'+(x+4)+' '+(y+4)+'h1v1h-1z');
  const img='<div class="qr-svg"><svg viewBox="0 0 '+(size+8)+' '+(size+8)+'" role="img" aria-label="QR temporal"><rect width="100%" height="100%" fill="white"/><path d="'+paths.join('')+'" fill="black"/></svg></div>';
  modal(d.action==='in'?'Mi QR de entrada':'Mi QR de salida',img+'<p class="muted">Muéstralo al coordinador. Caduca a los 90 segundos y solo puede utilizarse una vez.</p><p class="qr-token">'+esc(d.token)+'</p>'+btn('qr','Generar nuevo QR',id,'primary'));
 }catch(e){error(e)}
}
async function detail(id){
 const a=myAssignments().find(x=>x.id===id);if(!a)return;const s=service(a.serviceId);
 const rows=[['Servicio',s.name],['Recinto',s.venue],['Fecha y hora',human(a.date)+' '+a.start+' → '+human(a.endDate)+' '+a.end],['Especialidad',a.role],['Equipo',a.team||'Por asignar'],['Horas previstas',a.hours+' h'],['Pausa',a.pause+' h'],['Estado',a.status],['Entrada',stamp(a.checkIn)],['Salida',stamp(a.checkOut)]];
 modal('Detalle de mi servicio',rows.map(([k,v])=>'<div class="line"><span>'+esc(k)+'</span><strong>'+esc(v||'—')+'</strong></div>').join('')+'<div class="actions-row">'+(a.status==='pending'?btn('confirm','Confirmar',a.id,'primary')+btn('reject','Rechazar',a.id):'')+(a.status!=='rejected'&&!a.checkOut&&s.status!=='completed'&&s.status!=='cancelled'?btn('open-clock','Control horario',a.id,'primary'):'')+'</div>');
}

let selectedAvailabilityStart=8,selectedAvailabilityEnd=23,availabilityDragFrom=null;
function availabilityHoursPaint(){
 const cells=[...document.querySelectorAll('#availability-time-grid [data-hour]')];
 for(const el of cells){
  const n=Number(el.dataset.hour),active=n>=selectedAvailabilityStart&&n<selectedAvailabilityEnd;
  el.classList.toggle('selected',active);
  el.setAttribute('aria-pressed',String(active));
 }
 const s=$('#available-start'),e=$('#available-end');
 if(s)s.value=String(selectedAvailabilityStart).padStart(2,'0')+':00';
 if(e)e.value=String(selectedAvailabilityEnd).padStart(2,'0')+':00';
}
function availabilityHoursSelect(from,to){
 const lo=Math.max(0,Math.min(23,Math.min(from,to))),hi=Math.min(24,Math.max(from,to)+1);
 selectedAvailabilityStart=lo;selectedAvailabilityEnd=hi;availabilityHoursPaint();
}
function availabilityModal(date){
 const old=list('availability').find(a=>a.date===date);
 selectedAvailabilityStart=Math.min(23,Math.max(0,Number((old?.start||'08:00').slice(0,2))));
 selectedAvailabilityEnd=Math.max(selectedAvailabilityStart+1,Math.min(24,Number((old?.end||'23:00').slice(0,2))));
 const grid=Array.from({length:24},(_,h)=>'<button type="button" class="availability-hour" data-hour="'+h+'" aria-pressed="false">'+String(h).padStart(2,'0')+':00</button>').join('');
 modal('Disponibilidad · '+human(date),'<p class="muted">Selecciona una franja arrastrando sobre las horas, o indica las horas de inicio y fin.</p>'+
 '<div class="availability-hour-grid" id="availability-time-grid">'+grid+'</div>'+
 '<div class="availability-time-inputs"><label class="form-label">Desde<input type="time" class="field" id="available-start" value="'+esc(old?.start||'08:00')+'"></label>'+
 '<label class="form-label">Hasta<input type="time" class="field" id="available-end" value="'+esc(old?.end||'23:00')+'"></label></div>'+
 '<div class="actions-row">'+btn('set-available','Disponible',date,'primary')+btn('set-unavailable','No disponible',date)+'</div>');
 availabilityHoursPaint();
 const gridEl=$('#availability-time-grid');
 function commit(h){if(availabilityDragFrom!=null)availabilityHoursSelect(availabilityDragFrom,h)}
 gridEl.addEventListener('pointerdown',e=>{const cell=e.target.closest('[data-hour]');if(!cell)return;availabilityDragFrom=Number(cell.dataset.hour);availabilityHoursSelect(availabilityDragFrom,availabilityDragFrom);gridEl.setPointerCapture(e.pointerId);e.preventDefault()});
 gridEl.addEventListener('pointermove',e=>{if(availabilityDragFrom==null)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('#availability-time-grid [data-hour]');if(cell)commit(Number(cell.dataset.hour))});
 gridEl.addEventListener('pointerup',e=>{availabilityDragFrom=null;try{gridEl.releasePointerCapture(e.pointerId)}catch{}});
 gridEl.addEventListener('pointercancel',()=>availabilityDragFrom=null);
 gridEl.addEventListener('click',e=>{if(e.detail!==0)return;const cell=e.target.closest('[data-hour]');if(cell)availabilityHoursSelect(Number(cell.dataset.hour),Number(cell.dataset.hour))});
 $('#available-start').addEventListener('change',()=>{const start=$('#available-start').value,end=$('#available-end').value;selectedAvailabilityStart=Number(start.slice(0,2));selectedAvailabilityEnd=Number(end.slice(0,2));if(selectedAvailabilityStart<selectedAvailabilityEnd)availabilityHoursPaint()});
 $('#available-end').addEventListener('change',()=>{const start=$('#available-start').value,end=$('#available-end').value;selectedAvailabilityStart=Number(start.slice(0,2));selectedAvailabilityEnd=Number(end.slice(0,2));if(selectedAvailabilityStart<selectedAvailabilityEnd)availabilityHoursPaint()});
}
function passwordModal(){
 modal('Cambiar contraseña','<form id="password-form" style="display:grid;gap:12px"><label class="form-label">Contraseña actual<input class="field" name="current" type="password" required></label><label class="form-label">Nueva contraseña (12 caracteres mínimo)<input class="field" name="password" type="password" minlength="12" required></label><button class="primary">Cambiar contraseña</button></form>');
 $('#password-form').onsubmit=async ev=>{ev.preventDefault();try{await api('password',Object.fromEntries(new FormData(ev.target)));location.replace('/empleado.html')}catch(e){error(e)}};
}
document.addEventListener('click',async ev=>{
 const el=ev.target.closest('[data-page],[data-action]');if(!el)return;
 const p=el.dataset.page,action=el.dataset.action,id=el.dataset.id;
 if(p){stopQrCamera();$('.sidebar').classList.remove('open');if(p==='clock')return openClockModal();page=p;render();return}
 if(action==='refresh')return load();
 if(action==='check-location')return verifyClockPosition(id);
 if(action==='open-clock')return openClockModal(id);
 if(action==='go-services'){page='services';return render()}
 if(action==='redeem-qr')return redeemQr(id);
 if(action==='scan-qr')return scanQr(id);
 if(action==='edit-coord-shift')return coordShift(id);
 if(action==='crew-open'){selectedCrewService=id;page='crewControl';return render()}
 if(action==='crew-filter'){crewFilter=el.dataset.filter||'no-team';return crewControlPage()}
 if(action==='crew-contact'){const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(a)return mutation('coordinator-control',{id,revision:a.revision,field:'contacted',value:!a.contacted},'Estado de contacto actualizado')}
 if(action==='crew-team')return crewTeamModal(id);
 if(action==='incident-report')return incidentModal(id);
 if(action==='tutorial')return modal(guides[Number(id)]?.[0]||'Guía','<p>'+esc(guides[Number(id)]?.[1]||'')+'</p>');
 if(action==='weekly')return weeklyAvailabilityModal();
 if(action==='edit-profile')return extendedProfile();
 if(action==='profile-tab'){profileTab=el.dataset.tab;return profilePage()}
 if(action==='upload-photo')return employeePhotoModal();
 if(action==='document-upload')return uploadPersonalDocument();
 if(action==='payroll-month'){selectedPayrollMonth=el.dataset.month;return settlementsPage()}
 if(action==='download-payroll')return downloadPayroll();
 if(action==='training-ack')return mutation('training-ack',{documentId:id},'Formación marcada como leída');
 if(action==='self-clock'){const a=myAssignments().find(x=>x.id===id);if(a){try{const location=await attendanceLocation(a.serviceId,a.id);await mutation('clock',{id,revision:a.revision,action:a.checkIn?'out':'in',...location},'Fichaje registrado');if($('#employee-modal').open&&$('#employee-modal').classList.contains('clock-dialog'))renderClockModal();}catch(e){error(e)}return}}

 if(action==='logout'){try{await api('logout',{})}catch{}state={};location.replace('/empleado.html');return}
 if(action==='detail')return detail(id);
 if(action==='confirm'||action==='reject'){const a=myAssignments().find(x=>x.id===id);if(a)return mutation('confirm',{id,revision:a.revision,status:action==='confirm'?'confirmed':'rejected'},'Respuesta guardada')}
 if(action==='qr')return showQR(id);
 if(action==='availability')return availabilityModal(el.dataset.date);
 if(action==='set-available'||action==='set-unavailable'){
  const a=list('availability').find(x=>x.date===id);const start=$('#available-start')?.value,end=$('#available-end')?.value;$('#employee-modal').close();
  return mutation('availability',{date:id,status:action==='set-available'?'available':'unavailable',start,end,...(a?{revision:a.revision}:{})},'Disponibilidad actualizada');
 }
 if(action==='prev-month'||action==='next-month'){
  const [y,m]=month.split('-').map(Number),d=new Date(y,m-1+(action==='next-month'?1:-1),1);month=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');return render();
 }
 if(action==='password')return passwordModal();
});
$('#login-form').onsubmit=async e=>{
 e.preventDefault();const b=e.target.querySelector('button[type=submit]'),err=$('#login-error');b.disabled=true;err.hidden=true;
 try{await api('login',Object.fromEntries(new FormData(e.target)));await load()}catch(ex){err.textContent=ex.message;err.hidden=false}finally{b.disabled=false}
};
$('#employee-content').addEventListener('change',e=>{if(e.target.id==='crew-service-select'){selectedCrewService=e.target.value;crewControlPage()}});
$('#modal-close').onclick=()=>{stopQrCamera();closeClock()};$('#employee-modal').addEventListener('close',()=>{stopQrCamera();$('#employee-modal').classList.remove('clock-dialog')});
$('#mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');
load();
})();