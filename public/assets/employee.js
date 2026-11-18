'use strict';
(() => {
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0);
const today=()=>new Date().toLocaleDateString('en-CA');
const human=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short'}):'—';
const stamp=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const names={dashboard:'Inicio',clock:'Control horario',availability:'Disponibilidad',services:'Mis servicios',calendar:'Mi agenda',coordination:'Coordinación',company:'Datos empresa',training:'Formación',documents:'Documentación',tutorials:'Tutoriales',settlements:'Liquidaciones',contracts:'Contratos',messages:'Mensajes',profile:'Mi perfil'};
const navPaths={
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
function notice(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500)}
function error(e){notice(e.message||String(e))}
function list(k){return(state[k]||[]).filter(x=>!x.archived)}
function worker(){return state.workers?.find(w=>w.id===state.user?.workerId)||{}}
function service(id){return state.services?.find(s=>s.id===id)||{}}
function myAssignments(){return list('assignments').filter(a=>a.workerId===state.user.workerId)}
function status(s){return '<span class="badge '+esc(s)+'">'+esc(({confirmed:'Confirmado',pending:'Pendiente',rejected:'Rechazado',planned:'Planificado',completed:'Finalizado',in_progress:'En curso',cancelled:'Cancelado'})[s]||s)+'</span>'}
function box(title,content){return '<section class="panel"><div class="panel-head"><h2>'+esc(title)+'</h2></div>'+content+'</section>'}
function btn(action,label,id,cls='secondary'){return '<button type="button" class="'+cls+'" data-action="'+action+'" data-id="'+esc(id||'')+'">'+esc(label)+'</button>'}
function modal(title,html){$('#modal-title').textContent=title;$('#modal-body').innerHTML=html;$('#employee-modal').showModal()}
function serviceCard(a){
 const s=service(a.serviceId),d=new Date(a.date+'T12:00:00');
 const dateTile='<div class="date-tile"><strong>'+d.getDate()+'</strong><small>'+d.toLocaleDateString('es-ES',{month:'short'})+'</small></div>';
 const text='<div class="service-info"><strong>'+esc(s.name||'Servicio')+'</strong><small>'+esc(s.venue||'')+' · '+esc(a.role)+' · '+esc(a.team||'Equipo por confirmar')+'</small><small>'+human(a.date)+' '+esc(a.start)+' → '+human(a.endDate)+' '+esc(a.end)+' · '+a.hours+' h previstas</small></div>';
 const acts='<div class="service-actions">'+status(a.status)+btn('detail','Ver detalles',a.id)+(a.status==='pending'?btn('confirm','Confirmar',a.id,'primary')+btn('reject','Rechazar',a.id):'')+(a.status!=='rejected'&&!a.checkOut&&s.status!=='completed'&&s.status!=='cancelled'?btn('qr','Fichar con QR',a.id,'primary'):'')+'</div>';
 return '<article class="service-card">'+dateTile+text+acts+'</article>';
}
function renderNav(){
 const pc=Object.entries(names).map(([key,label])=>'<button type="button" data-page="'+key+'" class="'+(page===key?'active':'')+'"><span class="nova-nav-icon">'+navIcon(key)+'</span><span>'+esc(label)+'</span>'+(key==='coordination'&&state.coordinatorRoster?.length?'<b>'+state.coordinatorRoster.length+'</b>':'')+'</button>').join('');
 $('#employee-nav').innerHTML=pc;
 $('#mobile-nav').innerHTML=['dashboard','clock','services','calendar','coordination'].map(k=>'<button data-page="'+k+'" class="'+(page===k?'active':'')+'">'+navIcon(k)+'<small>'+esc(names[k])+'</small></button>').join('');
}
function dashboard(){
 const as=myAssignments(),future=as.filter(a=>a.date>=today()&&a.status!=='rejected').sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)),open=as.filter(a=>a.checkIn&&!a.checkOut);
 const stats='<div class="stats"><div class="stat orange"><span class="muted">Próximos servicios</span><strong>'+future.length+'</strong><small>Programados</small></div><div class="stat"><span class="muted">Por confirmar</span><strong>'+as.filter(a=>a.status==='pending').length+'</strong><small>Responde a tus asignaciones</small></div><div class="stat"><span class="muted">Fichajes abiertos</span><strong>'+open.length+'</strong><small>Entradas sin salida</small></div><div class="stat"><span class="muted">Documentos</span><strong>'+list('documents').length+'</strong><small>Disponibles para descargar</small></div></div>';
 const next=future[0];
 const card=next?'<div class="notice"><strong>PRÓXIMO SERVICIO · '+human(next.date)+'</strong><p>'+esc(service(next.serviceId).name||'')+' · '+esc(next.start)+'–'+esc(next.end)+'</p></div>':'';
 $('#employee-content').innerHTML='<div class="section-title"><h2>Hola, '+esc(state.user.name.split(' ')[0])+'</h2><p class="muted">Bienvenido a tu espacio personal</p></div>'+stats+card+box('Próximos servicios',future.slice(0,5).length?'<div class="service-list">'+future.slice(0,5).map(serviceCard).join('')+'</div>':'<div class="empty">Todavía no tienes servicios próximos.</div>')+box('Control horario',open.length?'<div class="notice">Tienes '+open.length+' fichaje(s) de entrada abiertos. Accede al servicio para registrar la salida.</div>':'<p class="muted">Cuando estés asignado a un servicio podrás mostrar tu QR de entrada o salida al coordinador.</p>');
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
 $('#employee-content').innerHTML='<div class="actions-row" style="margin-bottom:16px">'+btn('weekly','Configurar semana habitual','','primary')+'</div><div class="notice">Selecciona un día para indicar tu disponibilidad. Los cambios se guardan en tu perfil y los verá Gestoría.</div><div class="cal-head"><button class="secondary" data-action="prev-month">Anterior</button><h2>'+new Date(y,m-1,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'})+'</h2><button class="secondary" data-action="next-month">Siguiente</button></div><div class="availability-grid">'+html+'</div>';
}
function documentsPage(){
 const docs=list('documents');
 $('#employee-content').innerHTML=box('Mis documentos',docs.length?docs.map(d=>'<div class="document"><div><strong>'+esc(d.name)+'</strong><br><small>'+esc(d.type||'Documento')+(d.expires?' · Caduca '+human(d.expires):'')+'</small></div><a href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a></div>').join(''):'<div class="empty">Todavía no tienes documentos vinculados.</div>');
}
function settlementsPage(){
 const a=myAssignments().filter(a=>a.status!=='rejected').sort((a,b)=>b.date.localeCompare(a.date));
 const total=a.filter(a=>a.payStatus==='confirmed').reduce((sum,x)=>sum+(x.grossPay||0),0);
 $('#employee-content').innerHTML='<div class="notice">Importes <strong>brutos estimados</strong> según las asignaciones y liquidaciones registradas, antes de IRPF y cotizaciones. No es una nómina ni acredita un pago bancario.</div><div class="stats"><div class="stat orange"><span class="muted">Liquidaciones confirmadas</span><strong>'+euro(total)+'</strong><small>Importe bruto</small></div></div>'+box('Mis liquidaciones',a.length?'<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Servicio</th><th>Día</th><th>Importe bruto</th><th>Estado</th></tr></thead><tbody>'+a.map(x=>'<tr><td>'+esc(service(x.serviceId).name||'Servicio')+'</td><td>'+human(x.date)+'</td><td>'+euro(x.grossPay)+'</td><td>'+(x.payStatus==='confirmed'?'Confirmada':'Pendiente')+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty">No hay liquidaciones disponibles.</div>');
}
function profilePage(){
 const w=worker();$('#employee-content').innerHTML=box('Datos personales','<div class="line"><span>Nombre</span><strong>'+esc(w.name||state.user.name)+'</strong></div><div class="line"><span>Especialidad</span><strong>'+esc(w.specialty||'—')+'</strong></div><div class="line"><span>Correo</span><strong>'+esc(w.email||'—')+'</strong></div><div class="line"><span>Móvil</span><strong>'+esc(w.phone||'—')+'</strong></div>')+box('Seguridad','<p class="muted">Puedes cambiar tu contraseña. Para modificar datos laborales, contacta con Gestoría.</p><div class="actions-row" style="margin-top:12px">'+btn('password','Cambiar contraseña')+btn('edit-profile','Editar perfil')+'</div>');
}

function clockPage(){
 const as=myAssignments().filter(a=>a.status!=='rejected'&&a.status!=='cancelled').sort((a,b)=>(b.date+b.start).localeCompare(a.date+a.start));
 $('#employee-content').innerHTML='<div class="section-title"><h2>Control horario</h2><p class="muted">Entradas, salidas y QR temporal por servicio</p></div>'+
 '<div class="notice">Si el servicio dispone de un coordinador, muéstrale el QR para registrar entrada o salida. En los servicios sin coordinador podrás realizar el fichaje personal. Las horas se guardan en el servidor.</div>'+
 box('Mis fichajes',as.length?'<div class="service-list">'+as.map(a=>{
 const sv=service(a.serviceId),closed=a.checkOut||sv.status==='completed'||sv.status==='cancelled';
 return '<article class="service-card"><div class="date-tile"><strong>'+esc(a.date.slice(8))+'</strong><small>'+esc(a.date.slice(5,7))+'</small></div><div class="service-info"><strong>'+esc(sv.name||'Servicio')+'</strong><small>'+esc(a.start)+'–'+esc(a.end)+' · '+esc(a.role)+'</small><small>Entrada: '+stamp(a.checkIn)+' · Salida: '+stamp(a.checkOut)+'</small></div><div class="service-actions">'+(closed?'':btn('qr','Mostrar QR',a.id,'primary')+(sv.coordinatorId?'':btn('self-clock',a.checkIn?'Registrar salida':'Registrar entrada',a.id)))+'</div></article>';
 }).join('')+'</div>':'<div class="empty">No hay servicios para fichar.</div>');
}
function coordinationPage(){
 const services=list('services').filter(s=>s.coordinatorId===state.user.id);
 const roster=state.coordinatorRoster||[],workers=state.coordinatorWorkers||[];
 const person=id=>workers.find(w=>w.id===id)?.name||'Personal';
 $('#employee-content').innerHTML='<div class="section-title"><h2>Coordinación de personal</h2><p class="muted">Puedes coordinar un servicio y trabajar como HAND en otro, utilizando la misma cuenta.</p></div>'+
 (services.length?services.map(s=>box(s.name+' · '+s.venue,
 '<div class="actions-row" style="margin-bottom:12px">'+btn('scan-qr','Escanear QR',s.id,'primary')+btn('redeem-qr','Introducir código QR',s.id)+'</div>'+
 '<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Trabajador</th><th>Categoría</th><th>Horario</th><th>Confirmación</th><th>Fichaje</th><th></th></tr></thead><tbody>'+
 roster.filter(a=>a.serviceId===s.id).map(a=>'<tr><td>'+esc(person(a.workerId))+'</td><td>'+esc(a.role)+'</td><td>'+esc(a.start)+'–'+esc(a.end)+'</td><td>'+status(a.status)+'</td><td>'+esc(a.checkIn?'Presente':'Pendiente')+(a.checkOut?' · Salida registrada':'')+'</td><td>'+btn('edit-coord-shift','Horario',a.id)+'</td></tr>').join('')+'</tbody></table></div>')).join(''):'<div class="panel empty">No coordinas ningún servicio actualmente. El gestor puede asignarte como coordinador desde una comanda.</div>');
}
function companyPage(){
 $('#employee-content').innerHTML=box('Datos de empresa','<div class="line"><span>Empresa</span><strong>Penny Wise</strong></div><div class="line"><span>Delegación</span><strong>Barcelona</strong></div><div class="line"><span>Dirección de referencia</span><strong>Zamora 45-47, Barcelona</strong></div><p class="muted" style="margin-top:12px">Los datos de contacto y condiciones laborales deben confirmarse con Gestoría.</p>');
}
function trainingPage(){
 const docs=list('documents').filter(d=>d.type==='training'),acks=state.trainingAcks||[];
 $('#employee-content').innerHTML=box('Formación asignada',docs.length?docs.map(d=>'<div class="document"><div><strong>'+esc(d.name)+'</strong><br><small>'+human(d.createdAt.slice(0,10))+' · '+(acks.some(a=>a.documentId===d.id)?'Leída':'Pendiente')+'</small></div><div class="actions-row"><a class="secondary" style="display:inline-flex;align-items:center" href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a>'+(!acks.some(a=>a.documentId===d.id)?btn('training-ack','Marcar como leída',d.id,'primary'):'')+'</div></div>').join(''):'<div class="empty">No tienes formación documental asignada.</div>');
}
function contractsPage(){
 const docs=list('documents').filter(d=>d.type==='contract'),w=worker(),type=({eventual:'Eventual / por servicio',indefinite:'Indefinido',fixed_discontinuous:'Fijo discontinuo'})[w.contractType]||'Eventual / por servicio';
 $('#employee-content').innerHTML='<div class="notice">Modalidad registrada: <strong>'+esc(type)+'</strong>. Los documentos descargados son archivos almacenados por Gestoría; no implica firma electrónica.</div>'+
 box('Mis contratos',docs.length?docs.map(d=>'<div class="document"><div><strong>'+esc(d.name)+'</strong><br><small>Documento contractual</small></div><a href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a></div>').join(''):'<div class="empty">No hay contratos cargados en tu ficha.</div>');
}
const guides=[
 ['Fichaje por QR','Abre Control horario, muestra tu QR temporal al coordinador y espera la validación. El código caduca a los 90 segundos.'],
 ['Gestión de coordinación','En Coordinación, selecciona el servicio asignado, consulta el personal y valida los QR. Solo puedes gestionar los servicios que coordinas.'],
 ['Operativa Crew Head','Consulta la asistencia de cada equipo y corrige horarios dentro de las funciones autorizadas. Comunica las incidencias a Gestoría.'],
 ['Documentación','Descarga tus contratos, fichas y certificados desde Documentación y Contratos.'],
 ['Disponibilidad','Marca tu disponibilidad por día o define horarios semanales habituales.'],
 ['Liquidaciones','Consulta los importes brutos por servicio y los periodos confirmados, antes de retenciones.']
];
function tutorialsPage(){
 $('#employee-content').innerHTML='<div class="section-title"><h2>Guías rápidas del portal</h2></div><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+guides.map(([title,body],i)=>'<div class="panel"><h3>'+esc(title)+'</h3><p class="muted" style="margin:12px 0">'+esc(body)+'</p>'+btn('tutorial','Abrir guía',String(i))+'</div>').join('')+'</div>';
}
function messagesPage(){
 const messages=state.messages||[],users=(state.users||[]).filter(u=>u.role==='manager');
 $('#employee-content').innerHTML=box('Mensajes a Gestoría','<div class="service-list">'+(messages.length?messages.map(m=>'<div class="document"><div><strong>'+(m.senderId===state.user.id?'Tú':'Gestoría')+'</strong><small> · '+stamp(m.createdAt)+'</small><p>'+esc(m.content)+'</p></div></div>').join(''):'<p class="muted">No hay mensajes.</p>')+'</div><form id="employee-message-form" style="display:grid;gap:12px;margin-top:18px"><label class="form-label">Enviar a<select class="field" name="recipientId" required>'+users.map(u=>'<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>').join('')+'</select></label><label class="form-label">Mensaje<textarea name="content" class="field" maxlength="2000" required></textarea></label><button class="primary" type="submit">Enviar mensaje</button></form>');
 $('#employee-message-form').onsubmit=async ev=>{ev.preventDefault();try{await api('message-send',Object.fromEntries(new FormData(ev.target)));await load();notice('Mensaje enviado')}catch(e){error(e)}};
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
 $('#qr-redeem-form').onsubmit=async e=>{e.preventDefault();try{await api('qr-redeem',{token:e.target.elements.token.value.trim()});$('#employee-modal').close();await load();notice('Fichaje validado')}catch(ex){error(ex)}};
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
function coordShift(id){
 const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(!a)return;
 modal('Cambiar horario del personal','<form id="coord-shift-form" style="display:grid;gap:12px"><label class="form-label">Día de inicio<input class="field" name="date" type="date" value="'+esc(a.date)+'" required></label><label class="form-label">Hora inicio<input class="field" name="start" type="time" value="'+esc(a.start)+'" required></label><label class="form-label">Día final<input class="field" name="endDate" type="date" value="'+esc(a.endDate)+'" required></label><label class="form-label">Hora fin<input class="field" name="end" type="time" value="'+esc(a.end)+'" required></label><button class="primary" type="submit">Guardar horario</button></form>');
 $('#coord-shift-form').onsubmit=async ev=>{ev.preventDefault();try{await api('coordinator-shift',{id,revision:a.revision,...Object.fromEntries(new FormData(ev.target))});$('#employee-modal').close();await load();notice('Horario actualizado')}catch(e){error(e)}};
}

function render(){
 if(!state.user)return;
 renderNav();$('#page-title').textContent=names[page];$('#employee-name').textContent=state.user.name;
 $('#employee-avatar').textContent=state.user.name.split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
 ({dashboard,clock:clockPage,availability:availabilityPage,services:servicesPage,calendar:calendarPage,coordination:coordinationPage,company:companyPage,training:trainingPage,documents:documentsPage,tutorials:tutorialsPage,settlements:settlementsPage,contracts:contractsPage,messages:messagesPage,profile:profilePage})[page]();
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
 modal('Detalle de mi servicio',rows.map(([k,v])=>'<div class="line"><span>'+esc(k)+'</span><strong>'+esc(v||'—')+'</strong></div>').join('')+'<div class="actions-row">'+(a.status==='pending'?btn('confirm','Confirmar',a.id,'primary')+btn('reject','Rechazar',a.id):'')+(a.status!=='rejected'&&!a.checkOut&&s.status!=='completed'&&s.status!=='cancelled'?btn('qr','Mostrar QR de fichaje',a.id,'primary'):'')+'</div>');
}
function availabilityModal(date){
 const old=list('availability').find(a=>a.date===date);
 modal('Disponibilidad · '+human(date),'<p>Indica tu disponibilidad para esta fecha y, opcionalmente, una franja horaria:</p><label class="form-label">Desde<input type="time" class="field" id="available-start" value="'+esc(old?.start||'08:00')+'"></label><label class="form-label">Hasta<input type="time" class="field" id="available-end" value="'+esc(old?.end||'23:00')+'"></label><div class="actions-row">'+btn('set-available','Disponible',date,'primary')+btn('set-unavailable','No disponible',date)+'</div>');
}
function passwordModal(){
 modal('Cambiar contraseña','<form id="password-form" style="display:grid;gap:12px"><label class="form-label">Contraseña actual<input class="field" name="current" type="password" required></label><label class="form-label">Nueva contraseña (12 caracteres mínimo)<input class="field" name="password" type="password" minlength="12" required></label><button class="primary">Cambiar contraseña</button></form>');
 $('#password-form').onsubmit=async ev=>{ev.preventDefault();try{await api('password',Object.fromEntries(new FormData(ev.target)));location.replace('/empleado.html')}catch(e){error(e)}};
}
document.addEventListener('click',async ev=>{
 const el=ev.target.closest('[data-page],[data-action]');if(!el)return;
 const p=el.dataset.page,action=el.dataset.action,id=el.dataset.id;
 if(p){stopQrCamera();page=p;render();$('.sidebar').classList.remove('open');return}
 if(action==='refresh')return load();
 if(action==='redeem-qr')return redeemQr(id);
 if(action==='scan-qr')return scanQr(id);
 if(action==='edit-coord-shift')return coordShift(id);
 if(action==='tutorial')return modal(guides[Number(id)]?.[0]||'Guía','<p>'+esc(guides[Number(id)]?.[1]||'')+'</p>');
 if(action==='weekly')return weeklyAvailabilityModal();
 if(action==='edit-profile')return extendedProfile();
 if(action==='training-ack')return mutation('training-ack',{documentId:id},'Formación marcada como leída');
 if(action==='self-clock'){const a=myAssignments().find(x=>x.id===id);if(a)return mutation('clock',{id,revision:a.revision,action:a.checkIn?'out':'in'},'Fichaje registrado')}

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
$('#modal-close').onclick=()=>{stopQrCamera();$('#employee-modal').close()};
$('#mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');
load();
})();