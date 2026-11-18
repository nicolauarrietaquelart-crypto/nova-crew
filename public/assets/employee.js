'use strict';
(() => {
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0);
const today=()=>new Date().toLocaleDateString('en-CA');
const human=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short'}):'—';
const stamp=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const names={dashboard:'Mi espacio',services:'Mis servicios',calendar:'Mi calendario',availability:'Disponibilidad',documents:'Documentos',settlements:'Liquidaciones',profile:'Mi perfil'};
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
 const pc=Object.entries(names).map(([key,label])=>'<button type="button" data-page="'+key+'" class="'+(page===key?'active':'')+'">'+esc(label)+'</button>').join('');
 $('#employee-nav').innerHTML=pc;
 $('#mobile-nav').innerHTML=['dashboard','services','calendar','availability','documents'].map(k=>'<button data-page="'+k+'" class="'+(page===k?'active':'')+'">'+esc(names[k])+'</button>').join('');
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
 $('#employee-content').innerHTML='<div class="notice">Selecciona un día para indicar tu disponibilidad. Los cambios se guardan en tu perfil y los verá Gestoría.</div><div class="cal-head"><button class="secondary" data-action="prev-month">Anterior</button><h2>'+new Date(y,m-1,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'})+'</h2><button class="secondary" data-action="next-month">Siguiente</button></div><div class="availability-grid">'+html+'</div>';
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
 const w=worker();$('#employee-content').innerHTML=box('Datos personales','<div class="line"><span>Nombre</span><strong>'+esc(w.name||state.user.name)+'</strong></div><div class="line"><span>Especialidad</span><strong>'+esc(w.specialty||'—')+'</strong></div><div class="line"><span>Correo</span><strong>'+esc(w.email||'—')+'</strong></div><div class="line"><span>Móvil</span><strong>'+esc(w.phone||'—')+'</strong></div>')+box('Seguridad','<p class="muted">Puedes cambiar tu contraseña. Para modificar datos laborales, contacta con Gestoría.</p><div class="actions-row" style="margin-top:12px">'+btn('password','Cambiar contraseña')+'</div>');
}
function render(){
 if(!state.user)return;
 renderNav();$('#page-title').textContent=names[page];$('#employee-name').textContent=state.user.name;
 $('#employee-avatar').textContent=state.user.name.split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase();
 ({dashboard,services:servicesPage,calendar:calendarPage,availability:availabilityPage,documents:documentsPage,settlements:settlementsPage,profile:profilePage})[page]();
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
 modal('Disponibilidad · '+human(date),'<p>Indica tu disponibilidad para esta fecha:</p><div class="actions-row">'+btn('set-available','Disponible',date,'primary')+btn('set-unavailable','No disponible',date)+'</div>');
}
function passwordModal(){
 modal('Cambiar contraseña','<form id="password-form" style="display:grid;gap:12px"><label class="form-label">Contraseña actual<input class="field" name="current" type="password" required></label><label class="form-label">Nueva contraseña (12 caracteres mínimo)<input class="field" name="password" type="password" minlength="12" required></label><button class="primary">Cambiar contraseña</button></form>');
 $('#password-form').onsubmit=async ev=>{ev.preventDefault();try{await api('password',Object.fromEntries(new FormData(ev.target)));location.replace('/empleado.html')}catch(e){error(e)}};
}
document.addEventListener('click',async ev=>{
 const el=ev.target.closest('[data-page],[data-action]');if(!el)return;
 const p=el.dataset.page,action=el.dataset.action,id=el.dataset.id;
 if(p){page=p;render();$('.sidebar').classList.remove('open');return}
 if(action==='refresh')return load();
 if(action==='logout'){try{await api('logout',{})}catch{}state={};location.replace('/empleado.html');return}
 if(action==='detail')return detail(id);
 if(action==='confirm'||action==='reject'){const a=myAssignments().find(x=>x.id===id);if(a)return mutation('confirm',{id,revision:a.revision,status:action==='confirm'?'confirmed':'rejected'},'Respuesta guardada')}
 if(action==='qr')return showQR(id);
 if(action==='availability')return availabilityModal(el.dataset.date);
 if(action==='set-available'||action==='set-unavailable'){
  const a=list('availability').find(x=>x.date===id);$('#employee-modal').close();
  return mutation('availability',{date:id,status:action==='set-available'?'available':'unavailable',...(a?{revision:a.revision}:{})},'Disponibilidad actualizada');
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
$('#modal-close').onclick=()=>$('#employee-modal').close();
$('#mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');
load();
})();