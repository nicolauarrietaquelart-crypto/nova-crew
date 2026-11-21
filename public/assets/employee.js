'use strict';
(() => {
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0);
const today=()=>new Date().toLocaleDateString('en-CA');
const human=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short'}):'—';
const stamp=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const names={dashboard:'Inicio',clock:'Fichaje',availability:'Disponibilidad',services:'Mis servicios',calendar:'Mi agenda',coordination:'Coordinación',crewControl:'Crew Control',company:'Datos empresa',training:'Formación',documents:'Documentación',tutorials:'Tutoriales',settlements:'Liquidaciones',contracts:'Contratos',messages:'Mensajes',profile:'Mi perfil',service:'Servicio'};
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
 profile:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-2a8 8 0 0 1 16 0v2',
 more:'M5 12h.01 M12 12h.01 M19 12h.01'
};
const navIcon=k=>'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(navPaths[k]||navPaths.dashboard)+'"/></svg>';

let state={},page='dashboard',month=today().slice(0,7),isLoading=false;
async function api(op,body){
 const r=await fetch('/api/office/'+op,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 let d;try{d=await r.json()}catch{throw Error('Respuesta inválida del servidor.')}
 if(!r.ok)throw Object.assign(Error(d.error||'No se ha podido completar la operación.'),{status:r.status});
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
let toastTimer=null;
function notice(m,isError=false){const t=$('#toast');t.textContent=m;t.classList.toggle('error-toast',isError);t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),isError?6000:3500)}
function error(e){if(e?.code===1)return notice('Permiso de ubicación denegado. Actívalo en el navegador para fichar en este recinto.',true);if(e?.code===3)return notice('No se ha podido obtener tu ubicación a tiempo. Inténtalo de nuevo.',true);notice(e?.message||String(e),true)}
function list(k){return(state[k]||[]).filter(x=>!x.archived)}
function worker(){return state.workers?.find(w=>w.id===state.user?.workerId)||{}}
function service(id){return state.services?.find(s=>s.id===id)||{}}
function myAssignments(){return list('assignments').filter(a=>a.workerId===state.user.workerId)}
function box(title,content){return '<section class="panel"><div class="panel-head"><h2>'+esc(title)+'</h2></div>'+content+'</section>'}
function btn(action,label,id,cls='secondary'){return '<button type="button" class="'+cls+'" data-action="'+action+'" data-id="'+esc(id||'')+'">'+esc(label)+'</button>'}
function modal(title,html){$('#employee-modal').classList.remove('clock-dialog','ccm-dialog');$('#modal-title').textContent=title;$('#modal-body').innerHTML=html;if(!$('#employee-modal').open)$('#employee-modal').showModal()}
/* ---------- NOVA Crew · área de empleado v18 ---------- */
const STATUS_ES={confirmed:'Confirmado',pending:'Por confirmar',rejected:'Rechazado',planned:'Planificado',completed:'Finalizado',in_progress:'En curso',cancelled:'Cancelado',live:'En curso ahora',done:'Fichaje cerrado'};
function status(s){return '<span class="badge '+esc(s)+'">'+esc(STATUS_ES[s]||s)+'</span>'}
const startMs=a=>Date.parse(a.date+'T'+(a.start||'00:00')+':00');
const endMs=a=>Date.parse((a.endDate||a.date)+'T'+(a.end||'23:59')+':00');
const shiftClosed=a=>!!a.closed||['completed','cancelled'].includes(service(a.serviceId).status);
function shiftState(a){if(a.checkOut)return 'done';if(a.checkIn)return 'live';const now=Date.now();if(now>=startMs(a)&&now<=endMs(a))return 'live';return now<startMs(a)?'upcoming':'past';}
const canClock=a=>{const sv=service(a.serviceId);if(a.status==='rejected'||a.checkOut||a.closed||['completed','cancelled'].includes(sv.status))return false;if(a.checkIn)return true;return Date.now()>=startMs(a)-4*3600000&&Date.now()<=endMs(a)+4*3600000;};
const monthLabel=m=>{const d=new Date(m+'-01T12:00:00');const t=d.toLocaleDateString('es-ES',{month:'long',year:'numeric'});return t.charAt(0).toUpperCase()+t.slice(1)};
const empSeenKey=()=>'nova-emp-msg-seen-'+(state.user?.id||'');
function empSeen(){try{return localStorage.getItem(empSeenKey())||''}catch{return ''}}
function empMarkSeen(){try{localStorage.setItem(empSeenKey(),new Date().toISOString())}catch{}}
function unreadCount(){const seen=empSeen();return (state.messages||[]).filter(m=>m.senderId!==state.user?.id&&m.createdAt>seen).length}
function pendingTraining(){return list('documents').filter(d=>d.type==='training'&&!(state.trainingAcks||[]).some(ack=>ack.documentId===d.id))}
function mapsLink(a){const p=placeForAssignment(a),s=service(a.serviceId);if(p?.mapsUrl)return p.mapsUrl;const q=p?.lat!=null?p.lat+','+p.lng:[p?.name||s.venue,p?.address].filter(Boolean).join(', ');return q?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q):''}
const NAV_GROUPS=[['DÍA A DÍA',['dashboard','clock','services','calendar','availability']],['COORDINACIÓN',['coordination']],['MI EMPRESA',['messages','documents','contracts','training','settlements','company','tutorials']],['CUENTA',['profile']]];
function navCount(k){if(k==='services')return myAssignments().filter(a=>!shiftClosed(a)&&a.status==='pending'&&endMs(a)>Date.now()).length;if(k==='messages')return unreadCount();if(k==='training')return pendingTraining().length;if(k==='coordination')return (state.coordinatorRoster||[]).filter(a=>!a.crew&&!isCrewHeadDay(a.serviceId,a.date)&&a.date===today()&&!a.checkIn&&!a.noShow&&endMs(a)>Date.now()).length;return 0}
function renderNav(){
 const isCoord=isNormalCoordinator()||isCrewHead();
 const item=key=>{const n=navCount(key);return '<button type="button" data-page="'+key+'" class="'+(page===key?'active':'')+'"><span class="nova-nav-icon">'+navIcon(key)+'</span><span class="nav-text">'+esc(names[key])+'</span>'+(n?'<b class="nav-count">'+n+'</b>':'')+'</button>'};
 $('#employee-nav').innerHTML=NAV_GROUPS.filter(([g])=>g!=='COORDINACIÓN'||isCoord).map(([g,keys])=>'<div class="nav-group">'+esc(g)+'</div>'+keys.filter(k=>k==='crewControl'?isCrewHead():k==='coordination'?(isNormalCoordinator()||isCrewHead()):true).map(item).join('')).join('');
 const mob=['dashboard','services','clock',(isNormalCoordinator()||isCrewHead())?'coordination':'messages','more'];
 $('#mobile-nav').innerHTML=mob.map(k=>k==='more'?'<button data-action="mobile-more">'+navIcon('more')+'<small>Más</small></button>':k==='clock'?'<button data-page="clock" class="mobile-clock"><span class="fab">'+navIcon('clock')+'</span><small>Fichar</small></button>':'<button data-page="'+k+'" class="'+(page===k?'active':'')+'">'+navIcon(k)+(navCount(k)?'<b class="nav-count">'+navCount(k)+'</b>':'')+'<small>'+esc(k==='services'?'Servicios':k==='dashboard'?'Inicio':names[k])+'</small></button>').join('');
}
/* Hilo del turno: Asignado → Confirmado → Entrada → Salida → Certificado */
const SHIFT_FLOW=['Asignado','Confirmación','Entrada','Salida','Certificado'];
function shiftPhase(a){
 const s=service(a.serviceId),place=placeForAssignment(a);
 if(a.status==='rejected')return {step:-1,label:'Has indicado que no puedes',tone:'muted',text:'La oficina ya lo sabe. No tienes que hacer nada más.'};
 if(a.noShow)return {step:2,tone:'bad',label:'No presentado',text:'Si fue un error, escribe a la oficina.',act:['go-messages','Escribir a la oficina']};
 if(a.status==='pending')return {step:1,tone:'warn',label:'Pendiente de confirmar',text:'Confirma si puedes ir para que la oficina cuente contigo.',act:['confirm','Confirmar']};
 if(!a.checkIn){
  if(canClock(a))return {step:2,tone:'live',label:'Toca fichar entrada',text:'Ficha la entrada al llegar a '+(place?.name||s.venue||'el recinto')+'.',act:['open-clock','Fichar entrada']};
  if(endMs(a)<Date.now())return {step:2,tone:'bad',label:'Sin fichaje',text:'No consta tu entrada. Escribe a la oficina si trabajaste.',act:['go-messages','Escribir a la oficina']};
  return {step:2,tone:'warn',label:'Confirmado',text:'Preséntate '+(a.date===today()?'hoy':human(a.date))+' a las '+(s.callTime||a.start)+' en '+(place?.name||s.venue||'el recinto')+'. Revisa las observaciones y la documentación.'};
 }
 if(!a.checkOut)return {step:3,tone:'live',label:'Trabajando',text:'Cuando termines, ficha la salida.',act:canClock(a)?['open-clock','Fichar salida']:null};
 if(a.payStatus!=='confirmed')return {step:4,tone:'warn',label:'Gestoría revisando',text:'Turno terminado. Gestoría revisará tus horas y certificará la liquidación.'};
 return {step:5,tone:'ok',label:'Certificado',text:'Horas e importe certificados. Ya lo tienes en tus liquidaciones.',act:['go-settlements','Ver liquidación']};
}
function shiftStepper(ph,compact=false){
 if(ph.step<0)return '';
 return '<div class="flow shift-flow '+(compact?'compact':'')+'">'+SHIFT_FLOW.map((l,i)=>{const state=i<ph.step?'done':i===ph.step?'current '+ph.tone:'';return '<div class="flow-step '+state+'" title="'+l+'"><i>'+(i<ph.step?'✓':i+1)+'</i>'+(compact?'':'<span>'+l+'</span>')+'</div>'}).join('<b class="flow-line"></b>')+'</div>';
}
function shiftNext(ph,a,withButton=true){
 return '<div class="shift-next '+(ph.tone==='ok'?'ok':'')+'"><span class="grow">'+esc(ph.text)+'</span>'+(withButton&&ph.act?btn(ph.act[0],ph.act[1],a.id,'primary'):'')+'</div>';
}
function serviceCard(a,opts={}){
 const s=service(a.serviceId),place=placeForAssignment(a),d=new Date(a.date+'T12:00:00'),st=shiftState(a);
 const dateTile='<div class="date-tile '+(a.date===today()?'today':'')+'"><strong>'+d.getDate()+'</strong><small>'+d.toLocaleDateString('es-ES',{month:'short'})+'</small></div>';
 const when=a.date===today()?'Hoy':a.date===new Date(Date.now()+864e5).toLocaleDateString('en-CA')?'Mañana':human(a.date);
 const ph=shiftPhase(a);const text='<div class="service-info"><strong>'+esc(s.name||'Servicio')+'</strong><small>'+esc(when)+' · '+esc(a.start)+'–'+esc(a.end)+(a.endDate&&a.endDate!==a.date?' (fin '+human(a.endDate)+')':'')+'</small><small>'+esc(place?.name||s.venue||'')+' · '+esc(a.role||'')+(a.team?' · '+esc(a.team):'')+'</small>'+shiftStepper(ph,true)+'<small class="flow-label '+ph.tone+'">'+esc(ph.label)+'</small></div>';
 const badges=(st==='live'?status('live'):'')+(st==='done'?status('done'):'')+status(a.status);
 const acts='<div class="service-actions"><div class="badges">'+badges+'</div><div class="actions-row">'+(a.status==='pending'?btn('confirm','Confirmar',a.id,'primary')+btn('reject','No puedo',a.id):'')+(canClock(a)?btn('open-clock',a.checkIn?'Fichar salida':'Fichar entrada',a.id,'primary'):'')+btn('detail','Detalles',a.id)+'</div></div>';
 return '<article class="service-card '+(st==='live'?'is-live':'')+'">'+dateTile+text+acts+'</article>';
}
function dashboard(){
 const as=myAssignments().filter(a=>a.status!=='rejected'&&!shiftClosed(a));
 const live=as.filter(a=>shiftState(a)==='live').sort((a,b)=>startMs(a)-startMs(b));
 const upcoming=as.filter(a=>shiftState(a)==='upcoming').sort((a,b)=>startMs(a)-startMs(b));
 const pending=myAssignments().filter(a=>!shiftClosed(a)&&a.status==='pending'&&endMs(a)>Date.now()).sort((a,b)=>startMs(a)-startMs(b));
 const week=upcoming.filter(a=>startMs(a)<Date.now()+7*864e5);
 const m=today().slice(0,7),monthRows=myAssignments().filter(a=>a.status!=='rejected'&&a.date.startsWith(m));
 const monthHours=monthRows.reduce((n,a)=>n+Number(a.hours||0),0),monthGross=monthRows.filter(a=>a.payStatus==='confirmed').reduce((n,a)=>n+Number(a.grossPay||0),0);
 const focus=live[0]||upcoming[0],sv=focus&&service(focus.serviceId),isLive=focus&&live.includes(focus);
 const maps=focus&&mapsLink(focus);
 const hero='<section class="employee-next-hero '+(isLive?'live':'')+'"><div><span class="eyebrow">'+(isLive?'<span class="pulse"></span>TURNO EN CURSO':focus?'PRÓXIMO SERVICIO':'SIN SERVICIOS PRÓXIMOS')+'</span>'+
  '<h2>'+esc(sv?.name||'Nada programado por ahora')+'</h2>'+
  '<p class="muted">'+(focus?esc((focus.date===today()?'Hoy':human(focus.date))+' · '+focus.start+'–'+focus.end+' · '+(placeForAssignment(focus)?.name||sv.venue||'')+' · '+(focus.role||'')):'Cuando la oficina te asigne un turno aparecerá aquí. Mantén tu disponibilidad al día.')+'</p>'+
  (focus?shiftStepper(shiftPhase(focus))+'<p class="muted">'+esc(shiftPhase(focus).text)+'</p>':'')+
  (focus&&!isLive?'<div class="employee-countdown" id="next-countdown" data-date="'+esc(focus.date)+'" data-start="'+esc(focus.start)+'"></div>':'')+
  (isLive?'<div class="live-clock"><div><small>Entrada</small><strong>'+(focus.checkIn?stamp(focus.checkIn):'Pendiente')+'</strong></div><div><small>Salida prevista</small><strong>'+esc(focus.end)+'</strong></div></div>':'')+
  '<div class="actions-row">'+(focus&&focus.status==='pending'?btn('confirm','Confirmar turno',focus.id,'primary'):'')+(focus&&canClock(focus)?btn('open-clock',focus.checkIn?'Fichar salida':'Fichar entrada',focus.id,'primary'):'')+(focus?btn('detail','Ver detalles',focus.id):btn('go-availability','Indicar disponibilidad','','primary'))+(maps?'<a class="secondary btn-link" href="'+esc(maps)+'" target="_blank" rel="noopener noreferrer">Cómo llegar</a>':'')+'</div></div>'+
  '<div class="employee-next-aside"><div><span>Esta semana</span><b>'+week.length+' turno'+(week.length===1?'':'s')+'</b></div><div><span>Horas previstas en '+esc(monthLabel(m).split(' ')[0].toLowerCase())+'</span><b>'+monthHours.toLocaleString('es-ES')+' h</b></div><div><span>Bruto certificado del mes</span><b>'+(monthRows.some(a=>a.payStatus==='confirmed')?euro(monthGross):'Pendiente')+'</b></div><div><span>Mensajes nuevos</span><b>'+unreadCount()+'</b></div></div></section>';
 const alerts=[],todo=[];
 const offersOpen=openOffers();
 pending.forEach(a=>todo.push(['detail',a.id,'Confirma tu turno en '+(service(a.serviceId).name||'un servicio'),(a.date===today()?'Hoy':human(a.date))+' · '+a.start+'–'+a.end,'Confirmar']));
 as.filter(a=>a.status==='confirmed'&&canClock(a)&&!a.checkOut&&a!==focus).forEach(a=>todo.push(['open-clock',a.id,(a.checkIn?'Ficha la salida de ':'Ficha la entrada en ')+(service(a.serviceId).name||'tu turno'),a.start+'–'+a.end,a.checkIn?'Fichar salida':'Fichar entrada']));
 if(pendingTraining().length)alerts.push(['training','Tienes '+pendingTraining().length+' formación(es) pendiente(s) de leer','Ver formación']);
 const expiring=list('documents').filter(d=>d.expires&&d.expires<=new Date(Date.now()+30*864e5).toLocaleDateString('en-CA'));
 if(expiring.length)alerts.push(['documents',expiring.length+' documento(s) caducado(s) o a punto de caducar','Renovar']);
 if(unreadCount())alerts.push(['messages','Tienes '+unreadCount()+' mensaje(s) nuevo(s) de la oficina','Leer']);
 const hasWeekly=Object.values(state.weeklyAvailability?.days||{}).some(d=>d?.slots?.length||d?.available);
 if(!hasWeekly&&!list('availability').some(a=>a.date>=today()))alerts.push(['availability','Aún no has indicado tu disponibilidad. Ayuda a la oficina a planificar.','Indicar']);
 const crewToday=crewDayList().filter(d=>d.date>=today()&&!(state.crewDayClosures||[]).some(c=>c.serviceId===d.serviceId&&c.date===d.date)&&!['completed','cancelled'].includes(service(d.serviceId).status)).sort((a,b)=>a.date.localeCompare(b.date))[0];
 const oc=(state.onCall||[]).find(o=>o.date===today());
 $('#employee-content').innerHTML=(oc?'<div class="emp-oncall"><span>🛡️ Oficina de guardia hoy: <b>'+esc(oc.name)+'</b></span>'+(oc.phone?'<a href="tel:'+esc(oc.phone.replace(/[^+\d]/g,''))+'">Llamar '+esc(oc.phone)+'</a>':'')+'</div>':'')+(crewToday?'<a class="crew-banner" href="/crew-control/?service='+encodeURIComponent(crewToday.serviceId)+'&date='+encodeURIComponent(crewToday.date)+'"><span><b>'+(crewToday.date===today()?'Hoy eres Crew Head':'Serás Crew Head el '+esc(human(crewToday.date)))+'</b><small>'+esc(service(crewToday.serviceId).name||'')+'</small></span><strong>Abrir Crew Control →</strong></a>':'')+'<div class="section-title"><h2>Hola, '+esc(state.user.name.split(' ')[0])+'</h2><p class="muted">'+esc(new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))+'</p></div>'+hero+
 (offersOpen.length?'<div class="emp-todo-head"><h3>Servicios disponibles</h3><small class="muted">La oficina busca gente</small></div><div class="offer-list">'+offersOpen.map(o=>offerCard(o)).join('')+'</div>':'')+((todo.length||alerts.length)?'<div class="emp-todo-head"><h3>Lo que tienes pendiente</h3><small class="muted">'+(todo.length+alerts.length)+' paso'+(todo.length+alerts.length===1?'':'s')+'</small></div><div class="emp-todo">'+todo.map(([act,id,t,d,c],i)=>'<button class="emp-todo-item" data-action="'+act+'" data-id="'+esc(id)+'"><span class="step-num">'+(i+1)+'</span><span class="grow"><p>'+esc(t)+'</p><small>'+esc(d)+'</small></span><b>'+esc(c)+' →</b></button>').join('')+alerts.map(([p,t,c],i)=>'<button class="emp-todo-item" data-page="'+p+'"><span class="step-num">'+(todo.length+i+1)+'</span><span class="grow"><p>'+esc(t)+'</p></span><b>'+esc(c)+' →</b></button>').join('')+'</div>':'<div class="emp-todo-head"><h3>Todo al día</h3><small class="muted">No tienes nada pendiente</small></div>')+
 (pending.length?box('Pendientes de confirmar ('+pending.length+')','<div class="service-list">'+pending.slice(0,5).map(a=>serviceCard(a)).join('')+'</div>'):'')+
 box('Próximos 7 días',week.filter(a=>a.status!=='pending').length?'<div class="service-list">'+week.filter(a=>a.status!=='pending').slice(0,6).map(a=>serviceCard(a)).join('')+'</div>':'<div class="empty">No tienes turnos confirmados para los próximos 7 días.</div>');
 if(focus&&!isLive){nextServiceCountdown();if(nextCountTimer)clearInterval(nextCountTimer);nextCountTimer=setInterval(()=>{if($('#next-countdown'))nextServiceCountdown();else{clearInterval(nextCountTimer);nextCountTimer=null}},1000)}
}
let servicesTab='upcoming';
function servicesPage(){
 const all=myAssignments();
 const groups={upcoming:all.filter(a=>!shiftClosed(a)&&['upcoming','live'].includes(shiftState(a))&&a.status!=='rejected').sort((a,b)=>startMs(a)-startMs(b)),pending:all.filter(a=>!shiftClosed(a)&&a.status==='pending'&&endMs(a)>Date.now()).sort((a,b)=>startMs(a)-startMs(b)),history:all.filter(a=>shiftClosed(a)||['past','done'].includes(shiftState(a))||a.status==='rejected').sort((a,b)=>startMs(b)-startMs(a))};
 if(servicesTab==='history')servicesTab='upcoming';
 const tabs=[['upcoming','Próximos'],['pending','Por confirmar']];
 const rows=groups[servicesTab]||[];
 $('#employee-content').innerHTML='<div class="section-title"><h2>Mis servicios</h2><p class="muted">Confirma tus turnos, consulta los detalles y ficha desde aquí.</p></div>'+
 '<div class="seg">'+tabs.map(([k,l])=>'<button class="'+(servicesTab===k?'active':'')+'" data-action="services-tab" data-tab="'+k+'">'+l+'<b>'+groups[k].length+'</b></button>').join('')+'</div>'+
 (rows.length?'<div class="service-list">'+rows.map(a=>serviceCard(a)).join('')+'</div>':'<div class="panel empty">'+({upcoming:'No tienes servicios próximos.',pending:'No tienes asignaciones pendientes de respuesta.',history:'Todavía no hay servicios en tu historial.'})[servicesTab]+'</div>');
}
function calendarPage(){
 const [y,m]=month.split('-').map(Number),first=new Date(y,m-1,1),last=new Date(y,m,0).getDate(),offset=(first.getDay()+6)%7;
 const as=myAssignments().filter(a=>a.status!=='rejected'),avail=list('availability');
 let cells=['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(d=>'<div class="cal-weekday">'+d+'</div>').join('');
 for(let i=0;i<offset;i++)cells+='<div class="cal-day off"></div>';
 for(let i=1;i<=last;i++){
  const date=month+'-'+String(i).padStart(2,'0'),events=as.filter(a=>a.date<=date&&(a.endDate||a.date)>=date),av=avail.find(r=>r.date===date);
  cells+='<div class="cal-day '+(date===today()?'today ':'')+(date<today()?'past ':'')+(av?.status==='unavailable'?'unavail':'')+'"><strong>'+i+'</strong>'+events.map(a=>'<button class="cal-event '+esc(a.status)+'" data-action="detail" data-id="'+esc(a.id)+'" title="'+esc(service(a.serviceId).name)+'"><b>'+esc(a.start)+'</b> '+esc(service(a.serviceId).name||'Turno')+'</button>').join('')+(av?.status==='unavailable'&&!events.length?'<small class="cal-note">No disponible</small>':'')+'</div>';
 }
 const monthAs=as.filter(a=>a.date.startsWith(month));
 $('#employee-content').innerHTML='<div class="panel"><div class="cal-head"><button class="secondary" data-action="prev-month" aria-label="Mes anterior">‹</button><h2>'+esc(monthLabel(month))+'</h2><button class="secondary" data-action="next-month" aria-label="Mes siguiente">›</button></div>'+
 '<div class="actions-row" style="justify-content:flex-end;margin:-4px 0 10px">'+btn('ics-all','Añadir mis servicios al calendario del móvil','')+'</div><p class="muted cal-summary">'+monthAs.length+' turno(s) · '+monthAs.reduce((n,a)=>n+Number(a.hours||0),0).toLocaleString('es-ES')+' h previstas'+(month!==today().slice(0,7)?' · <button class="text-link" data-action="this-month">Volver a hoy</button>':'')+'</p><div class="calendar-grid">'+cells+'</div>'+
 '<div class="cal-legend"><span class="lg confirmed">Confirmado</span><span class="lg pending">Por confirmar</span><span class="lg unavail">No disponible</span></div></div>';
}
function availabilityPage(){
 const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate(),records=list('availability'),as=myAssignments().filter(a=>a.status!=='rejected');
 const offset=(new Date(y,m-1,1).getDay()+6)%7;
 const weekly=state.weeklyAvailability?.days||{},keys=['sun','mon','tue','wed','thu','fri','sat'];
 const dayNames=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
 let html=dayNames.map(d=>'<div class="availability-day-heading">'+d+'</div>').join('');
 html+=Array.from({length:offset},()=>'<div class="availability-cell-spacer" aria-hidden="true"></div>').join('');
 for(let d=1;d<=last;d++){
  const date=month+'-'+String(d).padStart(2,'0'),a=records.find(r=>r.date===date),st=a?.status||'',past=date<today();
  const habit=weekly[keys[new Date(date+'T12:00:00').getDay()]],habitSlots=Array.isArray(habit?.slots)?habit.slots.length:habit?.available?1:0;
  const shift=as.find(x=>x.date<=date&&(x.endDate||x.date)>=date);
  const label=shift?'Turno '+shift.start:a?.slots?.length?a.slots.length+' h':st==='unavailable'?'No disponible':st==='available'?'Disponible':habitSlots?(weekShiftLabel(habit)||'Habitual'):'Sin indicar';
  html+='<button class="availability-cell '+esc(st||(habitSlots?'habit':''))+(shift?' has-shift':'')+(date===today()?' today':'')+'" data-action="availability" data-date="'+date+'" '+(past?'disabled':'')+'><strong>'+d+'</strong><small>'+esc(label)+'</small></button>';
 }
 const hasWeekly=Object.values(weekly).some(d=>d?.slots?.length||d?.available);
 $('#employee-content').innerHTML='<div class="section-title"><h2>Disponibilidad</h2><p class="muted">Indica cuándo puedes trabajar. La oficina lo verá al planificar.</p></div>'+
 '<div class="panel avail-habit"><div class="emp-todo-head"><h3>Disponibilidad habitual</h3><small class="muted">'+(hasWeekly?'Se aplica sola cada semana':'Sin configurar')+'</small></div>'+weekGridHTML(weekly)+'<p class="muted compact">Mañana 06–15 h · Tarde 15–24 h. Para un día concreto, tócalo en el calendario.</p></div>'+
 '<div class="panel"><div class="cal-head"><button class="secondary" data-action="prev-month" aria-label="Mes anterior">‹</button><h2>'+esc(monthLabel(month))+'</h2><button class="secondary" data-action="next-month" aria-label="Mes siguiente">›</button></div>'+
 '<div class="availability-grid">'+html+'</div><div class="cal-legend"><span class="lg available">Disponible</span><span class="lg habit">Semana habitual</span><span class="lg unavail">No disponible</span><span class="lg shift">Con turno</span></div><p class="muted compact">Pulsa un día para elegir horas concretas o marcarlo como no disponible. Los días pasados no se pueden modificar.</p></div>';
}
function settlementsPage(){
 const all=myAssignments().filter(a=>a.status!=='rejected').sort((a,b)=>b.date.localeCompare(a.date));
 const months=[...new Set([today().slice(0,7),...all.map(a=>a.date.slice(0,7))])].sort().reverse(),current=selectedPayrollMonth||months[0];
 selectedPayrollMonth=current;
 const rows=all.filter(a=>a.date.startsWith(current)),confirmed=rows.filter(a=>a.payStatus==='confirmed'),pend=rows.filter(a=>a.payStatus!=='confirmed');
 const sum=r=>r.reduce((n,a)=>n+(a.grossPay||0),0),hours=rows.reduce((n,a)=>n+Number(a.hours||0),0);
 $('#employee-content').innerHTML='<div class="section-title"><h2>Liquidaciones</h2><p class="muted">Los importes aparecen cuando Gestoría certifica la liquidación del servicio.</p></div>'+
 '<div class="actions-row" style="margin-bottom:16px"><label class="month-pick">Periodo<select class="field" id="payroll-month">'+months.map(m=>'<option value="'+esc(m)+'" '+(m===current?'selected':'')+'>'+esc(monthLabel(m))+'</option>').join('')+'</select></label>'+btn('download-payroll','Descargar CSV','','secondary')+'</div>'+
 '<div class="stats"><div class="stat orange"><span class="muted">Bruto certificado</span><strong>'+euro(sum(confirmed))+'</strong><small>'+confirmed.length+' servicio(s) certificados</small></div><div class="stat"><span class="muted">Pendientes de certificar</span><strong>'+pend.length+'</strong><small>Sin importe hasta su certificación</small></div><div class="stat"><span class="muted">Servicios del periodo</span><strong>'+rows.length+'</strong><small>'+esc(monthLabel(current))+'</small></div><div class="stat"><span class="muted">Horas previstas</span><strong>'+hours.toLocaleString('es-ES')+' h</strong><small>Según turnos asignados</small></div></div>'+
 box('Detalle del periodo',rows.length?'<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Fecha</th><th>Servicio</th><th>Categoría</th><th>Horario</th><th>Horas</th><th>Bruto</th><th>Estado</th></tr></thead><tbody>'+
 rows.map(a=>'<tr><td>'+human(a.date)+'</td><td>'+esc(service(a.serviceId).name||'Servicio')+'</td><td>'+esc(a.role||'—')+'</td><td>'+esc(a.start+'–'+a.end)+'</td><td>'+Number(a.hours||0).toLocaleString('es-ES')+' h</td><td>'+(a.payStatus==='confirmed'?'<strong>'+euro(a.grossPay)+'</strong>':'<span class="muted">—</span>')+'</td><td>'+(a.payStatus==='confirmed'?'<span class="badge confirmed">Certificada</span>':'<span class="badge pending">Pendiente de certificar</span>')+'</td></tr>').join('')+'</tbody>'+(confirmed.length?'<tfoot><tr><td colspan="5"><strong>Total certificado</strong></td><td><strong>'+euro(sum(confirmed))+'</strong></td><td></td></tr></tfoot>':'')+'</table></div>':'<div class="empty">Sin servicios durante este periodo.</div>')+
 '<div class="notice">Importe <strong>bruto</strong> certificado por Gestoría. No es una nómina ni acredita transferencias; no incluye retenciones, cotizaciones ni otros ajustes laborales.</div>';
}
function tutorialsPage(){
 $('#employee-content').innerHTML='<div class="section-title"><h2>Guías rápidas</h2><p class="muted">Todo lo que necesitas para usar tu área de empleado.</p></div><div class="guide-list">'+guides.map(([title,body],i)=>'<details class="panel guide" '+(i===0?'open':'')+'><summary>'+esc(title)+'</summary><p class="muted">'+esc(body)+'</p></details>').join('')+'</div>';
}
function messagesPage(){
 const messages=state.messages||[],users=(state.users||[]).filter(u=>u.role==='manager'),seen=empSeen();
 const chat=messages.map(m=>{const mine=m.senderId===state.user.id;return '<div class="bubble '+(mine?'mine':'')+(!mine&&m.createdAt>seen?' new':'')+'">'+(m.broadcastId?'<span class="bubble-tag">Aviso · '+esc(m.audience||'Gestoría')+'</span>':'')+'<p>'+esc(m.content)+'</p><small>'+(mine?'Tú':esc((state.users||[]).find(u=>u.id===m.senderId)?.name||'Oficina'))+' · '+stamp(m.createdAt)+'</small></div>'}).join('');
 $('#employee-content').innerHTML='<div class="section-title"><h2>Mensajes</h2><p class="muted">Conversación privada con la oficina.</p></div><section class="panel chat"><div class="chat-scroll" id="emp-chat">'+(chat||'<p class="empty">Todavía no hay mensajes. Escribe a la oficina si necesitas algo.</p>')+'</div>'+
 '<form id="employee-message-form" class="chat-compose">'+(users.length>1?'<select class="field" name="recipientId" required aria-label="Destinatario">'+users.map(u=>'<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>').join('')+'</select>':'<input type="hidden" name="recipientId" value="'+esc(users[0]?.id||'')+'">')+'<textarea name="content" class="field" maxlength="2000" required rows="2" placeholder="Escribe tu mensaje…"></textarea><button class="primary" type="submit">Enviar</button></form></section>';
 empMarkSeen();renderNav();
 const sc=$('#emp-chat');if(sc)sc.scrollTop=sc.scrollHeight;
 const f=$('#employee-message-form');if(!users.length){f.querySelector('button').disabled=true}
 f.onsubmit=async ev=>{ev.preventDefault();const b=f.querySelector('button');b.disabled=true;try{await api('message-send',Object.fromEntries(new FormData(f)));await load();notice('Mensaje enviado')}catch(e){error(e)}finally{b.disabled=false}};
}
/* Página completa del servicio (como «Resumen del servicio»), no ventana emergente. */
let serviceDetailId='',servicePrev='services';
function openServicePage(id){
 if(!myAssignments().some(a=>a.id===id))return;
 if(page!=='service')servicePrev=page;serviceDetailId=id;page='service';
 if(location.hash!=='#/servicio/'+id)history.pushState({serviceId:id},'','#/servicio/'+encodeURIComponent(id));
 if($('#employee-modal').open)$('#employee-modal').close();
 render();window.scrollTo({top:0});
}
async function detail(id){return openServicePage(id)}
function serviceDetailPage(){
 const a=myAssignments().find(x=>x.id===serviceDetailId);if(!a){page='services';return render()}
 const s=service(a.serviceId),place=placeForAssignment(a),maps=mapsLink(a),st=shiftState(a),c=state.company||{};
 const docs=list('documents').filter(d=>d.shareWithStaff&&d.serviceId===s.id);
 const coord=(state.users||[]).find(u=>u.id===s.coordinatorId)?.name;
 const ref=String(s.id||'').slice(0,8).toUpperCase();
 const line=(k,v,extra='')=>'<div class="sd-line"><span>'+esc(k)+'</span><strong>'+esc(v||'—')+extra+'</strong></div>';
 $('#page-title').textContent=s.name||'Servicio';
 $('#employee-content').innerHTML='<button class="back-link" data-action="service-back">‹ Volver a '+esc((names[servicePrev]||'Mis servicios').toLowerCase())+'</button>'+
 '<header class="sd-head"><div><span class="eyebrow">RESUMEN DEL SERVICIO</span><h2>'+esc(s.name||'Servicio')+'</h2><p class="muted">'+esc((a.date===today()?'Hoy':human(a.date))+' · '+a.start+'–'+a.end+' · '+(place?.name||s.venue||''))+'</p><div class="badges">'+(st==='live'?status('live'):'')+(st==='done'?status('done'):'')+status(a.status)+'</div></div>'+
 '<div class="actions-row">'+(isCrewHeadDay(a.serviceId,a.date)?'<a class="primary btn-link" href="'+esc(crewControlUrl(a.serviceId,a.date))+'">Abrir Crew Control</a>':(()=>{const e=coordEntries().find(x=>x.serviceId===a.serviceId&&x.date===a.date);return e?btn('coord-open','Abrir mi coordinación',e.key,'primary'):''})())+(a.status==='pending'?btn('confirm','Confirmar asistencia',a.id,'primary')+btn('reject','No puedo',a.id):'')+(canClock(a)?btn('open-clock',a.checkIn?'Fichar salida':'Fichar entrada',a.id,'primary'):'')+(maps?'<a class="secondary btn-link" href="'+esc(maps)+'" target="_blank" rel="noopener noreferrer">Cómo llegar</a>':'')+btn('ics-one','Añadir a mi calendario',a.id)+'</div></header>'+
 (()=>{const ph=shiftPhase(a);return ph.step<0?'':'<section class="panel sd-flow"><span class="eyebrow">TU TURNO · SIGUIENTE PASO</span>'+shiftStepper(ph)+shiftNext(ph,a,false)+'</section>'})()+
 (c.staffNotice?'<div class="sd-mandatory"><b>!</b><p>'+esc(c.staffNotice)+'</p></div>':'')+
 '<div class="sd-grid"><section class="panel sd-notes"><h3>Observaciones</h3>'+(s.employeeNotes?'<p class="sd-pre">'+esc(s.employeeNotes)+'</p>':'<p class="muted">Sin observaciones para este servicio.</p>')+'</section>'+
 '<section class="panel"><h3>Documentación del servicio</h3>'+(docs.length?'<p class="muted">Léela atentamente antes de acudir.</p>'+docs.map(d=>'<a class="sd-doc" href="/api/office/document?id='+encodeURIComponent(d.id)+'">'+esc(d.name)+'<span>Descargar</span></a>').join(''):'<p class="muted">No hay documentación específica para este servicio.</p>')+'</section></div>'+
 '<div class="sd-grid"><section class="panel"><h3>Datos del servicio</h3>'+
  line('Referencia',ref)+line('Tipo de servicio',a.serviceType)+line('Fecha',human(a.date)+(a.endDate&&a.endDate!==a.date?' → '+human(a.endDate):''))+line('Especialidad',a.role)+line('Equipo',a.team||'Por asignar')+
  (s.callTime?line('Hora de llamada',human(a.date)+' · '+s.callTime):'')+line('Hora de inicio',human(a.date)+' · '+a.start)+line('Hora de fin',human(a.endDate||a.date)+' · '+a.end,' (*)')+(a.pause?line('Pausa',a.pause+' h'):'')+line('Horas previstas',a.hours+' h')+
  '<p class="muted compact">(*) El horario está sujeto a las necesidades del servicio.</p></section>'+
 '<section class="panel"><h3>Datos del recinto</h3>'+line('Recinto',place?.name||s.venue)+(place?.address?line('Dirección',place.address):'')+(maps?'<a class="secondary btn-link" style="margin-top:12px" href="'+esc(maps)+'" target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a>':'')+
 '<h3 style="margin-top:22px">Tu fichaje</h3>'+line('Entrada',stamp(a.checkIn))+line('Salida',stamp(a.checkOut))+
 '<h3 style="margin-top:22px">Contacto</h3>'+(a.coordinator?'<div class="sd-coord"><span>Tu coordinador</span><strong>'+esc(a.coordinator.name)+'</strong>'+(a.coordinator.phone?'<a class="primary btn-link" href="tel:'+esc(a.coordinator.phone.replace(/[^+\d]/g,''))+'">Llamar · '+esc(a.coordinator.phone)+'</a>':'')+'</div>':line('Coordinación','Oficina'))+(c.emergencyPhone?'<div class="sd-line"><span>Teléfono de guardia (solo urgencias)</span><strong><a href="tel:'+esc(c.emergencyPhone.replace(/[^+\d]/g,''))+'">'+esc(c.emergencyPhone)+'</a></strong></div>':'')+(a.coordinator?'':btn('go-messages','Escribir a la oficina','','secondary'))+'</section></div>';
}

/* Coordinación: selector de servicios y vista reducida tipo Crew Control (sin equipos). */
let coordKey='',coordFilter='all',coordSearch='',coordShiftSel='all',geoCache=null,coordRefreshTimer=null;
const coordRoster=()=>state.coordinatorRoster||[];
const coordWorkerName=id=>(state.coordinatorWorkers||[]).find(w=>w.id===id)?.name||'Personal';
const coordWorkerPhone=id=>(state.coordinatorWorkers||[]).find(w=>w.id===id)?.phone||'';
const normalCoordIds=()=>new Set(state.normalCoordinationServiceIds||[]);
const isNormalCoordinator=()=>normalCoordIds().size>0;
const isCrewHeadDay=(serviceId,date)=>crewDayList().some(d=>d.serviceId===serviceId&&d.date===date);
const crewControlUrl=(serviceId,date)=>'/crew-control/?service='+encodeURIComponent(serviceId)+'&date='+encodeURIComponent(date);
function coordEntries(){
 const map=new Map(),t=today(),blocks=state.coordinatorBlocks||[];
 const add=(serviceId,date,blockId)=>{const k=serviceId+'|'+date+'|'+(blockId||'-');if(!map.has(k))map.set(k,{key:k,serviceId,date,blockId,rows:[]});return map.get(k);};
 for(const a of coordRoster()){if(a.crew||isCrewHeadDay(a.serviceId,a.date)||a.closed||['completed','cancelled'].includes(service(a.serviceId).status))continue;add(a.serviceId,a.date,a.blockId).rows.push(a);}
 for(const b of blocks){if(b.lead||['completed','cancelled'].includes(service(b.serviceId).status))continue;let d=b.date;for(let n=0;d&&d<=(b.endDate||b.date)&&n<14;n++){if(d>=t&&!isCrewHeadDay(b.serviceId,d)&&!(state.coordinatorRoster||[]).some(a=>a.blockId===b.id&&a.date===d&&a.closed))add(b.serviceId,d,b.id);d=new Date(Date.parse(d+'T12:00:00Z')+864e5).toISOString().slice(0,10);}}
 return [...map.values()].sort((a,b)=>{const ga=a.date===t?0:a.date>t?1:2,gb=b.date===t?0:b.date>t?1:2;const ba=blocks.find(x=>x.id===a.blockId),bb=blocks.find(x=>x.id===b.blockId);return ga-gb||(ga===2?b.date.localeCompare(a.date):a.date.localeCompare(b.date))||String(ba?.start||'').localeCompare(String(bb?.start||''));});
}
function coordRole(e){
 const b=(state.coordinatorBlocks||[]).find(x=>x.id===e.blockId);
 if(b)return (b.serviceType||'Turno')+' · '+b.start+'–'+b.end;
 const r=e.rows[0];return r?(r.serviceType||'Turno')+' · '+r.start+'–'+r.end:'Coordinación';
}
const hmOf=iso=>iso?new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso)):'';
const hmNow=()=>hmOf(new Date().toISOString());
/* Coordinación tipo Crew Control (sin equipos): estados, selección por turno, ficha y edición masiva. */
let coordSel=new Set();
const CI=(()=>{const w=p=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';return{
 check:w('<path d="M20 6 9 17l-5-5"/>'),x:w('<path d="M18 6 6 18M6 6l12 12"/>'),close:w('<path d="M18 6 6 18M6 6l12 12"/>'),
 phone:w('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
 gear:w('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
 qr:w('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>')};})();
const COORD_STATUS=[['pending','NO CONTACTADO'],['contacted','CONTACTADO'],['present','PRESENTE'],['absent','NO PRESENTADO']];
const coordStatus=a=>a.noShow?'absent':a.checkIn?'present':a.contacted?'contacted':'pending';
const coordState=a=>a.noShow?'absent':a.checkOut?'done':a.checkIn?'present':a.contacted?'contacted':'pending';
const coordShiftKey=a=>(a.serviceType||'Servicio')+' · '+a.start+'–'+a.end;
function coordDayClosed(e){const s=service(e.serviceId);return ['completed','cancelled'].includes(s.status)||(state.crewDayClosures||[]).some(c=>c.serviceId===e.serviceId&&c.date===e.date)}
function coordinationPage(){
 const entries=coordEntries();
 if(coordKey&&!entries.some(e=>e.key===coordKey))coordKey='';
 const t=today();
 if(!coordKey){
  coordSel.clear();
  const closedCrew=d=>(state.crewDayClosures||[]).some(c=>c.serviceId===d.serviceId&&c.date===d.date);
  const crewDays=crewDayList().filter(d=>d.date>=today()&&!closedCrew(d)&&!['completed','cancelled'].includes(service(d.serviceId).status)),crewDates=[...new Set(crewDays.map(d=>d.date))];
  const crew=crewDates.map(date=>({key:'crew|'+date,date,crew:true,services:crewDays.filter(d=>d.date===date).map(d=>d.serviceId),serviceId:crewDays.find(d=>d.date===date).serviceId,rows:(state.coordinatorRoster||[]).filter(a=>a.date===date&&crewDays.some(d=>d.date===date&&d.serviceId===a.serviceId))}));
  const listE=[...entries,...crew].sort((a,b)=>a.date.localeCompare(b.date));
  $('#employee-content').innerHTML='<div class="section-title"><h2>Coordinación</h2><p class="muted">Todos los servicios que coordinas. Si eres Crew Head, se abre Crew Control.</p></div>'+
  (listE.length?'<div class="coord-list">'+listE.map(e=>{if(e.crew&&e.services.length>1){const d=new Date(e.date+'T12:00:00');return '<div class="coord-card crew multi '+(e.date===t?'today':'')+'"><div class="date-tile '+(e.date===t?'today':'')+'"><strong>'+d.getDate()+'</strong><small>'+d.toLocaleDateString('es-ES',{month:'short'})+'</small></div><div class="coord-card-main"><strong>'+(e.date===t?'Hoy':human(e.date))+' · Crew Head</strong><span class="coord-role crew">'+e.services.length+' servicios · elige cuál abrir en Crew Control</span><div class="crew-svc-list">'+e.services.map(sid=>'<a href="'+esc(crewControlUrl(sid,e.date))+'">'+esc(service(sid).name||'Servicio')+' ›</a>').join('')+'</div></div></div>'}if(e.crew){const s=service(e.serviceId),d=new Date(e.date+'T12:00:00');return '<a class="coord-card crew '+(e.date===t?'today':'')+'" href="'+esc(crewControlUrl(e.serviceId,e.date))+'"><div class="date-tile '+(e.date===t?'today':'')+'"><strong>'+d.getDate()+'</strong><small>'+d.toLocaleDateString('es-ES',{month:'short'})+'</small></div><div class="coord-card-main"><strong>'+esc(s.name||'Servicio')+'</strong><small>'+esc((e.date===t?'Hoy':human(e.date))+' · '+(s.venue||''))+'</small><span class="coord-role crew">Crew Head · abre Crew Control</span></div><div class="coord-card-count"><b>'+e.rows.filter(a=>a.checkIn).length+'/'+e.rows.length+'</b><small>presentes</small></div><span class="coord-go">›</span></a>'}const s=service(e.serviceId),present=e.rows.filter(a=>a.checkIn).length,d=new Date(e.date+'T12:00:00');
   return '<button class="coord-card '+(e.date===t?'today':e.date<t?'past':'')+'" data-action="coord-enter" data-id="'+esc(e.key)+'"><div class="date-tile '+(e.date===t?'today':'')+'"><strong>'+d.getDate()+'</strong><small>'+d.toLocaleDateString('es-ES',{month:'short'})+'</small></div><div class="coord-card-main"><strong>'+esc(s.name||'Servicio')+'</strong><small>'+esc((e.date===t?'Hoy':human(e.date))+' · '+(s.venue||''))+'</small><span class="coord-role">'+esc(coordRole(e))+'</span></div><div class="coord-card-count"><b>'+present+'/'+e.rows.length+'</b><small>presentes</small></div><span class="coord-go">›</span></button>';}).join('')+'</div>':'<div class="panel empty">No coordinas ningún turno ahora mismo.</div>');
  return;
 }
 const e=entries.find(x=>x.key===coordKey),s=service(e.serviceId),closed=coordDayClosed(e);
 for(const id of [...coordSel])if(!e.rows.some(a=>a.id===id))coordSel.delete(id);
 const counts={all:e.rows.length};for(const k of ['pending','contacted','present','done','absent'])counts[k]=e.rows.filter(a=>k==='present'?a.checkIn&&!a.noShow:coordState(a)===k).length;
 const q=coordSearch.toLocaleLowerCase();
 const visible=e.rows.filter(a=>(coordFilter==='all'||(coordFilter==='present'?a.checkIn&&!a.noShow:coordState(a)===coordFilter))&&(!q||[coordWorkerName(a.workerId),a.role,a.serviceType].join(' ').toLocaleLowerCase().includes(q)));
 const groups=[...new Set(e.rows.map(coordShiftKey))].sort((x,y)=>x.split(' · ')[1].localeCompare(y.split(' · ')[1]));
 const tile=(k,l)=>'<button class="cc-tile '+k+(coordFilter===k?' selected':'')+'" data-action="coord-filter" data-id="'+k+'"><b>'+counts[k]+(k==='present'?'<small>/'+counts.all+'</small>':'')+'</b><span>'+l+'</span></button>';
 const pauseTxt=a=>a.actualPause&&a.actualPause!=='00:00'?a.actualPause.replace(/^0?(\d+):(\d\d)$/,(m,h,mm)=>(+h?h+' h ':'')+(+mm?mm+' min':'')).trim():a.actualPause==='00:00'?'Sin pausa':Number(a.pause||0)?Math.round(Number(a.pause)*60)+' min':'Sin pausa';
 const rateOf=a=>{const v=[a.ratingUniformidad,a.ratingActitud,a.ratingPuntualidad].map(Number).filter(n=>n>0);const n=v.length?v.reduce((x,y)=>x+y,0)/v.length:Number(a.rating||0);return n?(Math.round(n*10)/10).toString().replace('.',','):''};
 const row=a=>{const st=coordStatus(a),ph=coordWorkerPhone(a.workerId),sel=coordSel.has(a.id),r=rateOf(a),diets=Number(a.dietCount||0);
  const clock=a.checkIn?hmOf(a.checkIn)+(a.checkOut?' – '+hmOf(a.checkOut):''):a.noShow?'No presentado':'—';
  return '<div class="cc-row2 cc-r3 st-'+st+(a.checkOut?' st-done':'')+(sel?' selected':'')+'" data-coord-row="'+esc(a.id)+'" aria-selected="'+(sel?'true':'false')+'">'+
  '<select class="cc-status st-'+st+'" data-coord-status="'+esc(a.id)+'" '+(closed?'disabled':'')+' aria-label="Estado">'+COORD_STATUS.map(([k,l])=>'<option value="'+k+'" '+(st===k?'selected':'')+'>'+l+'</option>').join('')+'</select>'+
  '<button class="cc-name" data-action="coord-edit" data-id="'+esc(a.id)+'"><strong>'+esc(coordWorkerName(a.workerId))+'</strong><small>'+esc(a.role||'')+'</small></button>'+
  '<span class="cc-cell cc-phone">'+(ph?'<a href="tel:'+esc(ph.replace(/[^+\d]/g,''))+'">'+CI.phone+'<span>'+esc(ph)+'</span></a>':'<em>Sin teléfono</em>')+'</span>'+
  '<span class="cc-cell cc-sched"><small>Horario</small><b>'+esc(a.start+'–'+a.end)+'</b></span>'+
  '<span class="cc-cell cc-clock"><small>Fichaje</small><b>'+esc(clock)+'</b></span>'+
  '<span class="cc-cell"><small>Pausa</small><b>'+esc(pauseTxt(a))+'</b></span>'+
  '<span class="cc-cell"><small>Dietas</small><b>'+diets+'</b></span>'+
  '<span class="cc-cell cc-rate"><small>Valoración</small><b>'+(r?'★ '+r:'—')+'</b></span>'+
  '</div>'};
 const groupHtml=g=>{const rs=visible.filter(a=>coordShiftKey(a)===g).sort((a,b)=>coordWorkerName(a.workerId).localeCompare(coordWorkerName(b.workerId)));if(!rs.length)return '';
  const all=e.rows.filter(a=>coordShiftKey(a)===g),pres=all.filter(a=>a.checkIn&&!a.noShow).length,allSel=rs.every(a=>coordSel.has(a.id));
  return '<section class="cc-group"><header>'+(closed?'':'<button class="cc-groupsel'+(allSel?' on':'')+'" data-coord-group="'+esc(g)+'" title="Seleccionar todo el turno" aria-label="Seleccionar todo el turno">'+CI.check+'</button>')+'<strong>'+esc(g)+'</strong><span class="cc-group-count">'+pres+'/'+all.length+' presentes</span></header>'+
  '<div class="cc-colhead"><span>Estado</span><span>Trabajador</span><span>Teléfono</span><span>Horario</span><span>Fichaje</span><span>Pausa</span><span>Dietas</span><span>Valoración</span></div>'+rs.map(row).join('')+'</section>'};
 $('#employee-content').innerHTML='<div class="cc-lite">'+
 '<div class="cc-top"><button class="back-link" data-action="coord-back">‹ Coordinación</button><div class="cc-title"><div><h2>'+esc(s.name||'Servicio')+'</h2><p class="muted">'+esc((e.date===t?'Hoy':human(e.date))+' · '+(s.venue||'')+' · '+coordRole(e))+'</p></div><div class="cc-actions">'+(closed?'<span class="badge done">Día cerrado</span>':'<button class="btn primary cc-scan" data-action="scan-qr" data-id="'+esc(e.serviceId)+'" title="Escanear QR" aria-label="Escanear QR">'+CI.qr+'</button>')+btn('incident-report','Incidencia',e.serviceId)+(closed?'':btn('coord-close-day','Cerrar día',e.key,'secondary cc-close'))+'</div></div></div>'+
 '<div class="cc-tiles">'+tile('present','Presentes')+tile('contacted','Contactados')+tile('pending','No contactados')+tile('absent','No presentados')+tile('done','Con salida')+tile('all','Todos')+'</div>'+
 '<label class="coord-search"><input type="search" id="coord-search" placeholder="Buscar persona o categoría…" value="'+esc(coordSearch)+'"></label>'+
 (visible.length?groups.map(groupHtml).join(''):'<div class="empty">Sin personal para este filtro.</div>')+
 (coordSel.size&&!closed?'<div class="cc-bulkbar"><b>'+coordSel.size+' seleccionado'+(coordSel.size>1?'s':'')+'</b><div class="cc-bulk-actions">'+
  '<button data-action="coord-bulk-status" data-id="present" class="cc-ib present" title="Presente" aria-label="Presente">'+CI.check+'</button><button data-action="coord-bulk-status" data-id="contacted" class="cc-ib contacted" title="Contactado" aria-label="Contactado">'+CI.phone+'</button><button data-action="coord-bulk-status" data-id="absent" class="cc-ib absent" title="No presentado" aria-label="No presentado">'+CI.x+'</button><button data-action="coord-bulk-edit" class="cc-ib dark" title="Edición masiva" aria-label="Edición masiva">'+CI.gear+'</button><button data-action="coord-bulk-clear" class="cc-ib ghost" title="Quitar selección" aria-label="Quitar selección">'+CI.close+'</button></div></div>':'')+
 '</div>';
 document.querySelectorAll('[data-coord-status]').forEach(el=>el.onchange=()=>coordSetStatus([el.dataset.coordStatus],el.value));
 if(!closed){document.querySelectorAll('[data-coord-row]').forEach(el=>el.onclick=ev=>{if(ev.target.closest('a,button,select,input,label,textarea'))return;const id=el.dataset.coordRow;coordSel.has(id)?coordSel.delete(id):coordSel.add(id);coordinationPage()});
 document.querySelectorAll('[data-coord-group]').forEach(el=>el.onclick=()=>{const ids=visible.filter(a=>coordShiftKey(a)===el.dataset.coordGroup).map(a=>a.id),on=ids.every(id=>coordSel.has(id));ids.forEach(id=>on?coordSel.delete(id):coordSel.add(id));coordinationPage()});}
}
function coordCloseModal(k){
 const e=coordEntries().find(x=>x.key===k);if(!e)return;
 const open=e.rows.filter(a=>a.checkIn&&!a.checkOut&&!a.noShow),pending=e.rows.filter(a=>!a.checkIn&&!a.noShow);
 modal('Cerrar el día','<div class="ccm"><p><b>'+esc(service(e.serviceId).name||'Servicio')+'</b> · '+esc(human(e.date))+'</p>'+
 '<div class="cc-close-sum"><div><b>'+e.rows.filter(a=>a.checkIn).length+'</b><small>con entrada</small></div><div><b>'+e.rows.filter(a=>a.noShow).length+'</b><small>no presentados</small></div><div><b>'+pending.length+'</b><small>sin marcar</small></div></div>'+
 (open.length?'<div class="notice">'+open.length+' persona(s) siguen sin hora de fin: '+esc(open.map(a=>coordWorkerName(a.workerId)).join(', '))+'. Regístrala antes de cerrar (puedes seleccionar a todos y usar «Fin ahora»).</div>':'<p class="muted">Al cerrar, el día deja de aparecer en Coordinación y en Mis servicios, y ya no podrás modificarlo. Si hace falta, Gestoría puede reabrirlo.</p>')+
 '<div class="ccm-actions"><span></span><div><button type="button" class="ccm-link" data-action="modal-close-x">Cancelar</button>'+(open.length?'':'<button class="primary" data-action="coord-close-confirm" data-id="'+esc(k)+'">Cerrar día</button>')+'</div></div></div>');
}
async function coordSend(ids,changes,msg){
 const rows=ids.map(id=>coordRoster().find(x=>x.id===id)).filter(Boolean);if(!rows.length)return;
 try{
  if(rows.length===1)await api('coord-update',{id:rows[0].id,revision:rows[0].revision,changes});
  else await api('coord-bulk',{items:rows.map(a=>({id:a.id,revision:a.revision})),changes});
  await load();notice(msg||'Cambios guardados');
 }catch(err){error(err);await load().catch(()=>{});}
}
function coordSetStatus(ids,status){const l=COORD_STATUS.find(x=>x[0]===status)?.[1]||status;return coordSend(ids,{status},(ids.length>1?ids.length+' trabajadores · ':coordWorkerName(coordRoster().find(a=>a.id===ids[0])?.workerId)+' · ')+l.toLowerCase())}
function coordQuick(id,ev){return ev==='in'?coordSetStatus([id],'present'):coordSend([id],{realOut:hmNow()},'Fin registrado')}
const STAR_KEYS=[['ratingUniformidad','Uniformidad'],['ratingActitud','Actitud'],['ratingPuntualidad','Puntualidad']];
function starRow(k,l,v){return '<div class="cc-rate"><strong>'+l+'</strong><div class="cc-starbar" data-star="'+k+'">'+[1,2,3,4,5].map(n=>'<button type="button" data-v="'+n+'" class="'+(n<=v?'on':'')+'" aria-label="'+n+'">★</button>').join('')+'</div></div>'}
function bindStars(root,draft){root.querySelectorAll('.cc-starbar').forEach(bar=>bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=bar.dataset.star,v=Number(b.dataset.v);draft[k]=draft[k]===v?0:v;bar.querySelectorAll('button').forEach(x=>x.classList.toggle('on',Number(x.dataset.v)<=draft[k]));}))}
function coordEditModal(id){
 const a=coordRoster().find(x=>x.id===id);if(!a)return;
 const e=coordEntries().find(x=>x.serviceId===a.serviceId&&x.date===a.date),closed=e?coordDayClosed(e):false;
 const name=coordWorkerName(a.workerId),draft={};STAR_KEYS.forEach(([k])=>draft[k]=Number(a[k]||0));
 const pauseLbl=Number(a.pause||0)?(Number(a.pause)*60)+' min':'SIN PAUSA';
 modal(name,'<div class="ccm"><p class="ccm-sub">'+esc((a.role||'')+' · '+(a.serviceType||'')+' · '+human(a.date))+'</p>'+
  '<form id="coord-edit-form" class="ccm-grid">'+
  '<div class="ccm-full ccm-planned"><span><strong>Horario previsto:</strong> <span id="ccm-planned-text">'+esc(a.start+' – '+a.end)+'</span> · Pausa '+esc(pauseLbl)+' · '+Number(a.dietCount||0)+' dietas</span>'+(closed||a.checkOut?'':'<button type="button" class="ccm-link" id="ccm-edit-planned">Cambiar</button>')+
   '<div class="ccm-planned-edit" hidden><label>Inicio<input type="time" name="start" value="'+esc(a.start)+'"></label><label>Fin<input type="time" name="end" value="'+esc(a.end)+'"></label></div></div>'+
  '<div class="ccm-status"><label>Estado<select name="status" '+(closed?'disabled':'')+'>'+COORD_STATUS.map(([k,l])=>'<option value="'+k+'" '+(coordStatus(a)===k?'selected':'')+'>'+l+'</option>').join('')+'</select></label></div>'+
  '<div class="ccm-arrival '+(a.checkIn?'':'empty')+'"><span>LLEGADA REGISTRADA</span><strong>'+(a.checkIn?esc(hmOf(a.checkIn)):'Todavía no registrada')+'</strong></div>'+
  '<div><label class="ccm-label">Entrada real</label><div class="ccm-now"><input type="time" name="realIn" value="'+esc(hmOf(a.checkIn))+'"><button type="button" data-now="realIn">Ahora</button></div></div>'+
  '<div><label class="ccm-label">Fin real</label><div class="ccm-now"><input type="time" name="realOut" value="'+esc(hmOf(a.checkOut))+'"><button type="button" data-now="realOut">Ahora</button></div></div>'+
  '<div><label class="ccm-label">Pausa aplicada</label><div class="ccm-now"><input type="time" step="900" name="actualPause" value="'+esc(a.actualPause||(Number(a.pause||0)?String(Math.floor(a.pause)).padStart(2,'0')+':'+String(Math.round((a.pause%1)*60)).padStart(2,'0'):'00:00'))+'"><button type="button" id="ccm-nopause">Sin pausa</button></div></div>'+
  '<div><label class="ccm-label">N.º dietas aplicado</label><select name="dietCount">'+[[0,'0 · Sin dieta'],[1,'1 dieta'],[2,'2 dietas'],[3,'3 dietas']].map(([n,l])=>'<option value="'+n+'" '+(Number(a.dietCount||0)===n?'selected':'')+'>'+l+'</option>').join('')+'</select></div>'+
  '<div class="ccm-rates">'+STAR_KEYS.map(([k,l])=>starRow(k,l,draft[k])).join('')+'</div>'+
  '<div><label class="ccm-label">Notas</label><textarea name="coordNotes" maxlength="1000" placeholder="Incidencias, valoración, observaciones…">'+esc(a.coordNotes||'')+'</textarea></div>'+
  '<div class="ccm-full ccm-actions"><div><button type="button" class="ccm-link" data-action="coord-worker-incident" data-id="'+esc(a.id)+'">Incidencia</button><button type="button" class="ccm-link" data-action="crew-category" data-id="'+esc(a.id)+'">Cambiar categoría</button><button type="button" class="ccm-link" data-action="coord-history" data-id="'+esc(a.id)+'">Historial</button></div><div><button type="button" class="ccm-link" data-action="modal-close-x">Cancelar</button>'+(closed?'':'<button class="primary" type="submit">Guardar ficha</button>')+'</div></div>'+
  '</form></div>');
 $('#employee-modal').classList.add('ccm-dialog');
 const f=$('#coord-edit-form');bindStars(f,draft);
 f.querySelectorAll('[data-now]').forEach(b=>b.onclick=()=>{f.elements[b.dataset.now].value=hmNow();if(b.dataset.now==='realIn')f.elements.status.value='present';});
 $('#ccm-nopause').onclick=()=>{f.elements.actualPause.value='00:00'};
 const ep=$('#ccm-edit-planned');if(ep)ep.onclick=()=>{f.querySelector('.ccm-planned-edit').hidden=false;ep.hidden=true;};
 f.elements.realIn.oninput=()=>{if(f.elements.realIn.value)f.elements.status.value='present'};
 f.elements.status.onchange=()=>{const v=f.elements.status.value;if(v==='present'&&!f.elements.realIn.value)f.elements.realIn.value=hmNow();if(v!=='present'){f.elements.realIn.value='';f.elements.realOut.value='';}};
 f.onsubmit=async ev=>{ev.preventDefault();const d=Object.fromEntries(new FormData(f));
  const changes={dietCount:Number(d.dietCount),coordNotes:d.coordNotes||'',...draft};
  if(!f.querySelector('.ccm-planned-edit').hidden){changes.start=d.start;changes.end=d.end;}
  if(d.status==='present'){changes.absent=false;changes.realIn=d.realIn||hmNow();changes.realOut=d.realOut||'';if(d.actualPause)changes.actualPause=d.actualPause;}
  else changes.status=d.status;
  try{await api('coord-update',{id:a.id,revision:a.revision,changes});$('#employee-modal').close();await load();notice('Ficha guardada');}catch(err){error(err)}};
}
async function coordHistory(id){
 const a=coordRoster().find(x=>x.id===id);if(!a)return;
 modal('Historial · '+coordWorkerName(a.workerId),'<div id="ccm-hist"><p class="muted">Cargando…</p></div><button class="secondary" data-action="coord-edit" data-id="'+esc(id)+'">‹ Volver a la ficha</button>');
 try{const {entries}=await api('assignment-history',{id});const L={'coord-update':'Coordinación','coord-bulk':'Edición masiva','qr-in':'Entrada por QR','qr-out':'Salida por QR','clock-in':'Entrada','clock-out':'Salida',create:'Asignado',update:'Modificado por Gestoría',confirmed:'Confirmado',rejected:'Rechazado','crew-control-shift':'Crew Control · horario','attendance-adjust':'Corrección de Gestoría'};
  $('#ccm-hist').innerHTML=entries.length?'<div class="history-list">'+entries.map(x=>'<div class="history-item"><span class="history-time">'+esc(new Date(x.time).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))+'</span><span class="history-dot"></span><div><p><b>'+esc(x.name||'Sistema')+'</b> · '+esc(L[x.action]||x.action)+'</p>'+(x.detail?'<small>'+esc(x.detail)+'</small>':'')+'</div></div>').join('')+'</div>':'<p class="muted">Sin cambios registrados.</p>';
 }catch(err){$('#ccm-hist').innerHTML='<p class="muted">'+esc(err.message)+'</p>'}
}
function coordBulkModal(){
 const ids=[...coordSel];if(!ids.length)return;const draft={ratingUniformidad:0,ratingActitud:0,ratingPuntualidad:0};
 const fld=(k,label,input)=>'<div class="ccb-field"><label class="ccb-apply"><input type="checkbox" data-apply="'+k+'"> '+label+'</label>'+input+'</div>';
 modal('Edición masiva · '+ids.length+' trabajador'+(ids.length>1?'es':''),'<form id="coord-bulk-form" class="ccm-grid"><p class="ccm-full muted">Marca solo los campos que quieras cambiar. Se aplica a todos los seleccionados o a ninguno.</p>'+
  fld('planned','Horario previsto','<div class="ccm-now"><input type="time" name="start"><input type="time" name="end"></div>')+
  fld('realIn','Entrada real','<div class="ccm-now"><input type="time" name="realIn"><button type="button" data-now="realIn">Ahora</button></div>')+
  fld('realOut','Fin real','<div class="ccm-now"><input type="time" name="realOut"><button type="button" data-now="realOut">Ahora</button></div>')+
  fld('actualPause','Pausa aplicada','<input type="time" step="900" name="actualPause" value="00:00">')+
  fld('dietCount','N.º dietas','<select name="dietCount"><option value="0">0 · Sin dieta</option><option value="1">1 dieta</option><option value="2">2 dietas</option><option value="3">3 dietas</option></select>')+
  fld('rating','Valoración','<div class="ccm-rates">'+STAR_KEYS.map(([k,l])=>starRow(k,l,0)).join('')+'</div>')+
  '<div class="ccm-full ccm-actions"><span></span><div><button type="button" class="ccm-link" data-action="modal-close-x">Cancelar</button><button class="primary" type="submit">Aplicar a '+ids.length+'</button></div></div></form>');
 $('#employee-modal').classList.add('ccm-dialog');
 const f=$('#coord-bulk-form');bindStars(f,draft);
 const tick=k=>{const c=f.querySelector('[data-apply="'+k+'"]');if(c)c.checked=true};
 f.querySelectorAll('[data-now]').forEach(b=>b.onclick=()=>{f.elements[b.dataset.now].value=hmNow();tick(b.dataset.now)});
 f.querySelectorAll('input,select').forEach(el=>{if(el.dataset.apply)return;el.addEventListener('input',()=>{const k=el.name==='start'||el.name==='end'?'planned':el.name;tick(k)})});
 f.querySelectorAll('.cc-starbar button').forEach(b=>b.addEventListener('click',()=>tick('rating')));
 f.onsubmit=async ev=>{ev.preventDefault();const on=k=>f.querySelector('[data-apply="'+k+'"]').checked,changes={};
  if(on('planned')){if(!f.elements.start.value||!f.elements.end.value)return notice('Indica inicio y fin del horario previsto',true);changes.start=f.elements.start.value;changes.end=f.elements.end.value;}
  if(on('realIn')){changes.realIn=f.elements.realIn.value;if(changes.realIn)changes.absent=false;}
  if(on('realOut'))changes.realOut=f.elements.realOut.value;
  if(on('actualPause'))changes.actualPause=f.elements.actualPause.value||'00:00';
  if(on('dietCount'))changes.dietCount=Number(f.elements.dietCount.value);
  if(on('rating'))Object.assign(changes,draft);
  if(!Object.keys(changes).length)return notice('Marca al menos un campo',true);
  $('#employee-modal').close();await coordSend(ids,changes,'Edición masiva aplicada a '+ids.length);coordSel.clear();coordinationPage();};
}
async function redeemToken(token,serviceId){
 try{return await api('qr-redeem',{token});}
 catch(e){
  if(!/ubicaci/i.test(e.message))throw e;
  if(!geoCache||Date.now()-geoCache.at>60000){
   if(!navigator.geolocation)throw new Error('Este recinto exige ubicación y el navegador no la admite.');
   const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:12000,maximumAge:30000})).catch(err=>{throw new Error(err.code===1?'Permite la ubicación para validar fichajes en este recinto.':'No se ha podido obtener tu ubicación.')});
   geoCache={latitude:pos.coords.latitude,longitude:pos.coords.longitude,at:Date.now()};
  }
  return api('qr-redeem',{token,latitude:geoCache.latitude,longitude:geoCache.longitude});
 }
}
let scanReload=null;
function scanQr(serviceId){
 const s=service(serviceId);
 window.NovaQrScanner.open({title:'Escanear QR',subtitle:(s.name||'')+' · el fichaje se registra al instante',onToken:async token=>{
  const r=await redeemToken(token,serviceId);
  const name=coordWorkerName(r.workerId),time=new Date(r.time).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  clearTimeout(scanReload);scanReload=setTimeout(()=>load(),600);
  return {label:name+' · '+(r.action==='in'?'Entrada':'Salida')+' '+time,short:name.split(' ')[0]+' '+(r.action==='in'?'entrada':'salida')};
 }});
}
function redeemQr(serviceId){return scanQr(serviceId)}

/* Control horario como página e integración con el calendario del móvil (.ics). */
let clockMonth='';
function clockPage(){
 const as=myAssignments().filter(a=>a.status!=='rejected');
 const now=Date.now(),todayShifts=as.filter(a=>canClock(a)).sort((a,b)=>startMs(a)-startMs(b));
 const months=[...new Set([today().slice(0,7),...as.filter(a=>a.checkIn).map(a=>a.date.slice(0,7))])].sort().reverse();
 if(!clockMonth||!months.includes(clockMonth))clockMonth=months[0];
 const hm=iso=>iso?new Date(iso).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}):'—';
 const worked=a=>a.checkIn&&a.checkOut?Math.max(0,(Date.parse(a.checkOut)-Date.parse(a.checkIn))/3600000):0;
 const history=as.filter(a=>a.date.startsWith(clockMonth)&&(a.checkIn||endMs(a)<now)).sort((a,b)=>startMs(b)-startMs(a));
 const total=history.reduce((n,a)=>n+worked(a),0),days=new Set(history.filter(a=>a.checkIn).map(a=>a.date)).size,missing=history.filter(a=>!a.checkIn).length;
 const open=as.find(a=>a.checkIn&&!a.checkOut);
 $('#employee-content').innerHTML='<div class="section-title"><h2>Control horario</h2><p class="muted">Ficha tus turnos y consulta tu historial de entradas y salidas.</p></div>'+
 '<section class="clock-hero '+(open?'live':'')+'">'+(todayShifts.length?todayShifts.map(a=>{const s=service(a.serviceId);return '<div class="clock-hero-row"><div><span class="eyebrow">'+(a.checkIn?'<span class="pulse"></span>EN CURSO':'TURNO DE '+(a.date===today()?'HOY':human(a.date).toUpperCase()))+'</span><h3>'+esc(s.name||'Servicio')+'</h3><p class="muted">'+esc(a.start+'–'+a.end+' · '+(placeForAssignment(a)?.name||s.venue||'')+' · '+(a.role||''))+'</p><p class="muted">Entrada: <b>'+hm(a.checkIn)+'</b> · Salida: <b>'+hm(a.checkOut)+'</b></p></div>'+btn('open-clock',a.checkIn?'Fichar salida':'Fichar entrada',a.id,'primary clock-big')+'</div>';}).join(''):'<div class="clock-hero-row"><div><span class="eyebrow">SIN TURNOS PARA FICHAR</span><h3>No tienes ningún turno en curso</h3><p class="muted">El botón de fichar se activa desde unas horas antes del inicio de cada turno.</p></div></div>')+'</section>'+
 '<div class="actions-row" style="margin:18px 0 12px"><label class="month-pick">Mes<select class="field" id="clock-month">'+months.map(m=>'<option value="'+m+'" '+(m===clockMonth?'selected':'')+'>'+esc(monthLabel(m))+'</option>').join('')+'</select></label></div>'+
 '<div class="stats"><div class="stat orange"><span class="muted">Horas fichadas</span><strong>'+total.toLocaleString('es-ES',{maximumFractionDigits:1})+' h</strong><small>Entre entrada y salida</small></div><div class="stat"><span class="muted">Días trabajados</span><strong>'+days+'</strong><small>'+esc(monthLabel(clockMonth))+'</small></div><div class="stat"><span class="muted">Turnos sin fichaje</span><strong>'+missing+'</strong><small>Turnos pasados sin entrada</small></div><div class="stat"><span class="muted">Fichaje abierto</span><strong>'+(open?'Sí':'No')+'</strong><small>'+(open?esc(service(open.serviceId).name||''):'Todo cerrado')+'</small></div></div>'+
 box('Historial de fichajes',history.length?'<div style="overflow-x:auto"><table class="pay-table"><thead><tr><th>Fecha</th><th>Servicio</th><th>Turno previsto</th><th>Entrada</th><th>Salida</th><th>Horas</th></tr></thead><tbody>'+history.map(a=>'<tr><td>'+human(a.date)+'</td><td><button class="text-link" data-action="detail" data-id="'+esc(a.id)+'">'+esc(service(a.serviceId).name||'Servicio')+'</button></td><td>'+esc(a.start+'–'+a.end)+'</td><td>'+(a.checkIn?hm(a.checkIn):'<span class="badge pending">Sin fichar</span>')+'</td><td>'+(a.checkOut?hm(a.checkOut):a.checkIn?'<span class="badge live">Abierto</span>':'—')+'</td><td>'+(worked(a)?worked(a).toLocaleString('es-ES',{maximumFractionDigits:2})+' h':'—')+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Sin fichajes en este mes.</div>')+
 '<p class="muted compact">Si ves un error en un fichaje, escribe a la oficina desde Mensajes indicando el día y la hora correctos.</p>';
}
function icsEscape(v){return String(v||'').replace(/\\/g,'\\\\').replace(/[,;]/g,m=>'\\'+m).replace(/\r?\n/g,'\\n')}
function icsFor(list){
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
 const dt=(d,t)=>d.replace(/-/g,'')+'T'+String(t||'00:00').replace(':','')+'00';
 const ev=list.map(a=>{const s=service(a.serviceId),p=placeForAssignment(a);return ['BEGIN:VEVENT','UID:'+a.id+'@nova-crew','DTSTAMP:'+stamp,'DTSTART:'+dt(a.date,a.start),'DTEND:'+dt(a.endDate||a.date,a.end),'SUMMARY:'+icsEscape((s.name||'Servicio')+' · '+(a.role||'')),'LOCATION:'+icsEscape([p?.name||s.venue,p?.address].filter(Boolean).join(', ')),'DESCRIPTION:'+icsEscape([(s.callTime?'Hora de llamada '+s.callTime:''),(a.team?'Equipo '+a.team:''),s.employeeNotes||''].filter(Boolean).join('\n')),'END:VEVENT'].join('\r\n');});
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//NOVA Crew//Area de empleado//ES','CALSCALE:GREGORIAN',...ev,'END:VCALENDAR'].join('\r\n');
}
function downloadIcs(list,filename){
 if(!list.length)return notice('No hay servicios para añadir al calendario.');
 const url=URL.createObjectURL(new Blob([icsFor(list)],{type:'text/calendar;charset=utf-8'})),link=document.createElement('a');
 link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 notice('Calendario descargado: ábrelo para añadirlo a tu móvil.');
}

function rejectModal(id){
 const a=myAssignments().find(x=>x.id===id);if(!a)return;
 modal('No puedo hacer este turno','<form id="reject-form" style="display:grid;gap:12px"><p class="muted">'+esc(service(a.serviceId).name||'Servicio')+' · '+human(a.date)+' '+esc(a.start)+'–'+esc(a.end)+'</p><p class="muted">La oficina recibirá tu respuesta. Si quieres, explica el motivo en un mensaje.</p><label class="form-label">Motivo (opcional, se enviará como mensaje)<textarea class="field" name="reason" maxlength="500"></textarea></label><button class="primary" type="submit">Confirmar que no puedo</button></form>');
 $('#reject-form').onsubmit=async e=>{e.preventDefault();const reason=e.target.elements.reason.value.trim();try{await api('confirm',{id,revision:a.revision,status:'rejected'});const to=(state.users||[]).find(u=>u.role==='manager');if(reason&&to)await api('message-send',{recipientId:to.id,content:'No puedo hacer el turno '+(service(a.serviceId).name||'')+' del '+human(a.date)+' ('+a.start+'–'+a.end+'). Motivo: '+reason});$('#employee-modal').close();await load();notice('Respuesta enviada a la oficina')}catch(ex){error(ex)}};
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
function downloadPayroll(){
 const entries=myAssignments().filter(a=>a.date.startsWith(selectedPayrollMonth));
 const csvCell=v=>{let x=String(v??'');if(/^[=+@-]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"';};
 const data=[['Fecha','Servicio','Categoría','Bruto EUR','Estado'],...entries.map(a=>[a.date,service(a.serviceId).name,a.role,a.payStatus==='confirmed'?(a.grossPay||0).toFixed(2):'',a.payStatus==='confirmed'?'Certificada':'Pendiente de certificar'])];
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
/* Fichaje en ventana: mostrar mi QR · escanear QRs (coordinación) · fichar por geolocalización (coordinación) */
let clockMode='',qrRefreshTimer=null;
function isCoordinatorAnywhere(){return (state.coordinatorServiceIds||[]).length>0||crewDayList().length>0}
function scanServices(){
 const ids=new Set([...(state.coordinatorServiceIds||[]),...crewDayList().map(d=>d.serviceId)]);
 const t=today();
 return list('services').filter(s=>ids.has(s.id)&&!['completed','cancelled'].includes(s.status)&&(s.endDate||s.date)>=t).sort((a,b)=>a.date.localeCompare(b.date));
}
function coordinatesMyService(a){return (state.coordinatorServiceIds||[]).includes(a.serviceId)||crewDayList().some(d=>d.serviceId===a.serviceId)}
function clockableShifts(){return clockAssignments().filter(a=>canClock(a))}
function geoShifts(){return clockableShifts().filter(a=>coordinatesMyService(a)||!service(a.serviceId).coordinatorId)}
function stopQrRefresh(){if(qrRefreshTimer){clearInterval(qrRefreshTimer);qrRefreshTimer=null}}
function closeClock(){
 stopQrRefresh();
 if(clockCountdown){clearInterval(clockCountdown);clockCountdown=null}
 if($('#employee-modal').open)$('#employee-modal').close();
}
function openClockModal(preferredId=''){
 stopQrCamera();stopQrRefresh();
 const coord=isCoordinatorAnywhere(),geo=geoShifts();
 if(preferredId){clockSelection=preferredId;const a=clockAssignments().find(x=>x.id===preferredId);if(a)clockMode=geo.some(x=>x.id===a.id)?'geo':'qr';}
 if(!clockMode||(clockMode==='scan'&&!coord)||(clockMode==='geo'&&!geo.length&&!coord))clockMode=coord&&scanServices().length?'scan':'qr';
 const opt=(k,title,sub,ic,show=true)=>show?'<button type="button" class="clock-opt '+(clockMode===k?'active':'')+'" data-action="clock-mode" data-id="'+k+'"><span class="clock-opt-icon">'+ic+'</span><span><b>'+title+'</b><small>'+sub+'</small></span></button>':'';
 const qrIc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>';
 const scanIc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 12h10"/></svg>';
 const geoIc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
 modal('Fichaje','<div class="clock-popup clock-v2"><div class="clock-opts">'+
  opt('scan','Escanear QRs','Ficha a tu personal escaneando su QR',scanIc,coord)+
  opt('qr','Mostrar mi QR','Enséñalo a tu coordinador o Crew Head',qrIc)+
  opt('geo','Fichar por geolocalización',coord?'Tu propio fichaje como coordinador':'Este turno no tiene coordinador',geoIc,coord||geo.length>0)+
  '</div><div id="clock-mode-body"></div></div>');
 $('#employee-modal').classList.add('clock-dialog');
 renderClockMode();
}
function shiftPicker(shifts){
 if(!shifts.some(a=>a.id===clockSelection))clockSelection=(shifts.find(a=>a.checkIn&&!a.checkOut)||shifts[0])?.id||'';
 if(shifts.length<2)return '';
 return '<label class="form-label">Turno<select id="clock-service-picker" class="field">'+shifts.map(a=>'<option value="'+esc(a.id)+'" '+(a.id===clockSelection?'selected':'')+'>'+esc(service(a.serviceId).name||'Servicio')+' · '+esc(a.date===today()?'hoy':human(a.date))+' · '+esc(a.start)+'–'+esc(a.end)+'</option>').join('')+'</select></label>';
}
function shiftSummary(a){const s=service(a.serviceId),place=placeForAssignment(a);return '<div class="clock-current"><span class="eyebrow">'+(a.checkIn?'<span class="pulse"></span>EN CURSO · TOCA SALIDA':'TOCA ENTRADA')+'</span><h3>'+esc(s.name||'Servicio')+'</h3><p class="muted">'+esc((place?.name||s.venue||'')+' · '+(a.date===today()?'Hoy':human(a.date))+' '+a.start+'–'+a.end)+'</p><p class="muted">Entrada: <b>'+stamp(a.checkIn)+'</b> · Salida: <b>'+stamp(a.checkOut)+'</b></p></div>'}
function renderClockMode(){
 const root=$('#clock-mode-body');if(!root)return;stopQrRefresh();
 if(clockMode==='scan'){
  const svs=scanServices();
  root.innerHTML='<p class="muted compact">Elige el servicio y escanea los QR de tu personal. Se marcan presentes al instante, aquí y en Crew Control.</p>'+(svs.length?'<div class="clock-scan-list">'+svs.map(s=>{const crew=crewDayList().some(d=>d.serviceId===s.id);return '<button type="button" class="clock-scan-item" data-action="clock-scan" data-id="'+esc(s.id)+'"><span><b>'+esc(s.name)+'</b><small>'+esc((s.date<=today()&&(s.endDate||s.date)>=today()?'Hoy':human(s.date))+' · '+(s.venue||'')+(crew?' · Crew Head':''))+'</small></span><strong>Escanear ›</strong></button>'}).join('')+'</div>':'<div class="empty">No tienes servicios activos que coordinar.</div>');
  return;
 }
 if(clockMode==='qr'){
  const shifts=clockableShifts();
  if(!shifts.length){root.innerHTML='<div class="empty">No tienes ningún turno para fichar ahora. El QR se activa 4 horas antes del inicio.</div>';return}
  root.innerHTML=shiftPicker(shifts)+'<div id="clock-qr" class="clock-qr"><p class="muted">Generando tu QR…</p></div>';
  bindShiftPicker();renderMyQr();
  return;
 }
 const shifts=geoShifts();
 if(!shifts.length){const next=myAssignments().filter(a=>a.status!=='rejected'&&!shiftClosed(a)&&!a.checkOut&&coordinatesMyService(a)&&endMs(a)>Date.now()).sort((a,b)=>startMs(a)-startMs(b))[0];root.innerHTML='<div class="empty">'+(next?'Tu próximo turno como coordinador es <b>'+esc(service(next.serviceId).name||'')+'</b> el '+esc(human(next.date))+' a las '+esc(next.start)+'. El fichaje por geolocalización se activa 4 horas antes del inicio.':'No tienes turnos propios en servicios que coordinas. Para fichar por geolocalización tienes que estar asignado al servicio además de coordinarlo.')+'</div>';return}
 root.innerHTML=shiftPicker(shifts)+'<div id="clock-service-summary"></div>';
 bindShiftPicker();renderClockModal();
}
function bindShiftPicker(){const p=$('#clock-service-picker');if(p)p.onchange=e=>{clockSelection=e.target.value;renderClockMode()}}
function qrSvg(token){
 const qr=new window.NOVA_QR_Encoder(0,window.NOVA_QR_Level.M);qr.addData(token);qr.make();
 const size=qr.getModuleCount(),paths=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(qr.isDark(y,x))paths.push('M'+(x+4)+' '+(y+4)+'h1v1h-1z');
 return '<div class="qr-svg"><svg viewBox="0 0 '+(size+8)+' '+(size+8)+'" role="img" aria-label="QR temporal"><rect width="100%" height="100%" fill="white"/><path d="'+paths.join('')+'" fill="black"/></svg></div>';
}
async function renderMyQr(){
 const box=$('#clock-qr'),a=clockAssignments().find(x=>x.id===clockSelection);if(!box||!a)return;
 try{
  if(!window.NOVA_QR_Encoder)throw Error('Codificador QR no disponible.');
  const d=await api('qr-issue',{id:a.id});if(!$('#clock-qr'))return;
  let left=Math.round((d.expiresAt-Date.now())/1000);
  box.innerHTML=shiftSummary(a)+qrSvg(d.token)+'<p class="clock-qr-meta"><b>QR de '+(d.action==='in'?'entrada':'salida')+'</b> · se renueva en <span id="qr-left">'+left+'</span> s</p>'+btn('clock-qr-new','Generar otro ahora',a.id,'secondary');
  stopQrRefresh();
  qrRefreshTimer=setInterval(()=>{if(!$('#clock-qr')||!$('#employee-modal').open)return stopQrRefresh();left--;const el=$('#qr-left');if(el)el.textContent=Math.max(0,left);if(left<=3){stopQrRefresh();load().then(()=>{if($('#clock-qr'))renderMyQr()}).catch(()=>{})}},1000);
 }catch(e){box.innerHTML='<div class="notice">'+esc(e.message)+'</div>'}
}
async function forcedLocation(){
 if(!navigator.geolocation)throw new Error('Tu navegador no permite obtener la ubicación.');
 const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:12000,maximumAge:0})).catch(err=>{throw new Error(err.code===1?'Permite la ubicación para fichar por geolocalización.':'No se ha podido obtener tu ubicación.')});
 return {latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy};
}
function renderClockModal(){
 const root=$('#clock-service-summary');if(!root)return;
 const a=clockAssignments().find(x=>x.id===clockSelection);
 if(!a){root.innerHTML='<p class="empty">No hay turnos para fichar.</p>';return}
 const sv=service(a.serviceId),place=placeForAssignment(a),geo=locationForAssignment(a),closed=!!a.checkOut||['completed','cancelled'].includes(sv.status);
 const asCoord=coordinatesMyService(a),distanceEnabled=geo.venueLat!=null&&geo.venueLng!=null;
 root.innerHTML=shiftSummary(a)+
 (!distanceEnabled?'<p class="muted compact">'+esc((place?.name||sv.venue||'Recinto')+' · sin radio configurado: se registra tu ubicación al fichar.')+'</p>':'<div class="clock-location"><div><small>Recinto</small><strong>'+esc(place?.name||sv.venue||'Sin recinto')+'</strong><span>'+esc(distanceEnabled?Number(geo.radiusMeters||500)+' m de radio autorizado':'Sin radio configurado')+'</span></div>'+
 '<div class="clock-distance"><strong id="clock-distance">—</strong><small>distancia</small></div>'+
 '<div><small>Tu ubicación</small><strong id="clock-my-location">Sin comprobar</strong><span id="clock-location-detail">'+(asCoord?'Se envía al fichar':'Pulsa comprobar')+'</span></div></div>')+
 (distanceEnabled?'<div class="clock-geo-note">'+btn('check-location','Comprobar mi ubicación',a.id)+'</div>':'')+
 (closed?'<div class="notice">El fichaje de este turno ya está cerrado.</div>':
 '<div class="clock-popup-actions">'+btn('self-clock',a.checkIn?'Fichar salida':'Fichar entrada',a.id,'primary')+'</div><p class="muted compact">'+(asCoord?'Como coordinador nadie puede escanearte: tu fichaje se registra con tu ubicación y la hora del servidor.':'Fichaje personal con la hora del servidor.')+'</p>');
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
let selectedCrewService='',selectedCrewBlock='all',crewFilter='all';
let crewSelectedIds=new Set(),crewDay='all',crewWorkTypes=new Set(),crewSearch='',crewShowHidden=false;
function crewAllRoster(){return state.coordinatorRoster||[]}
function crewAuthorizedWorkers(){return state.coordinatorWorkers||[]}
function crewName(a){return crewAuthorizedWorkers().find(w=>w.id===a.workerId)?.name||'Personal'}
function crewPhone(a){return crewAuthorizedWorkers().find(w=>w.id===a.workerId)?.phone||''}
function crewRecordOpen(a){return !!a.checkIn&&!a.checkOut}
function crewTeamItems(blockId){return (state.crewTeams||[]).filter(x=>x.blockId===blockId)}
function crewWorkLabel(a){return a.serviceType||'Sin tipo'}
function crewShiftId(a){return [a.date,a.start,a.end,a.serviceType].join('|')}
/* ---------- Crew Control v18 · exclusivo del Crew Head, por servicio y día ---------- */
let crewKey='';
const INCIDENT_TYPE_ES={general:'General',delay:'Retraso',absence:'Ausencia',behaviour:'Comportamiento',safety:'Seguridad / PRL',material:'Material / equipo',category_change:'Cambio de categoría',other:'Otra'};
const SEVERITY_ES={low:'Baja',medium:'Media',high:'Alta'};
function crewDayList(){return (state.crewHeadDays||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.serviceId.localeCompare(b.serviceId))}
function isCrewHead(){return crewDayList().length>0}
function crewSelection(){
 const days=crewDayList();if(!days.length)return null;
 let sel=days.find(d=>d.serviceId+'|'+d.date===crewKey);
 if(!sel)sel=days.find(d=>d.date===today())||days.find(d=>d.date>today())||days[days.length-1];
 crewKey=sel.serviceId+'|'+sel.date;selectedCrewService=sel.serviceId;crewDay=sel.date;return sel;
}
const crewDates=a=>{const out=[];let d=a.date;for(let i=0;i<62&&d<=(a.endDate||a.date);i++){out.push(d);d=new Date(Date.parse(d+'T12:00:00Z')+864e5).toISOString().slice(0,10);}return out};
function crewServiceRoster(){const sel=crewSelection();if(!sel)return [];return crewAllRoster().filter(a=>a.crew&&a.serviceId===sel.serviceId&&crewDates(a).includes(sel.date))}
function crewBlocks(){const sel=crewSelection();if(!sel)return [];return (state.coordinatorBlocks||[]).filter(b=>b.lead&&b.serviceId===sel.serviceId&&crewDates(b).includes(sel.date))}
function crewClosed(){const sel=crewSelection();return sel&&(state.crewDayClosures||[]).find(c=>c.serviceId===sel.serviceId&&c.date===sel.date)}
function crewScopedRecords(){
 const records=crewServiceRoster();
 const valid=new Set(records.map(a=>a.id));crewSelectedIds=new Set([...crewSelectedIds].filter(id=>valid.has(id)));
 return records.filter(a=>(selectedCrewBlock==='all'||a.blockId===selectedCrewBlock)&&(!crewWorkTypes.size||crewWorkTypes.has(crewWorkLabel(a)))&&(!crewSearch||[crewName(a),crewPhone(a),a.role,a.team].join(' ').toLocaleLowerCase().includes(crewSearch.toLocaleLowerCase())));
}
function crewCard(a,locked){
 const present=crewRecordOpen(a),checked=crewSelectedIds.has(a.id),phone=crewPhone(a);
 return '<article class="cc-person '+(checked?'cc-selected':'')+' '+(present?'cc-present':'')+'" data-id="'+esc(a.id)+'">'+
 '<div class="cc-person-top"><label class="cc-pick">'+(locked?'':'<input type="checkbox" data-crew-select="'+esc(a.id)+'" '+(checked?'checked':'')+'>')+'<span class="cc-person-name">'+esc(crewName(a))+'</span></label>'+
 '<button type="button" class="cc-presence '+(present?'on':a.checkOut?'done':'')+'" '+(locked?'disabled':'data-action="crew-attendance" data-id="'+esc(a.id)+'"')+'>'+(present?'Presente':a.checkOut?'Finalizado':'Pendiente')+'</button></div>'+
 '<div class="cc-person-role">'+esc(a.role)+' · '+esc(a.start)+'–'+esc(a.end)+(a.checkIn?' · Entrada '+esc(stamp(a.checkIn).split(', ').pop()):'')+(a.checkOut?' · Salida '+esc(stamp(a.checkOut).split(', ').pop()):'')+'</div>'+
 '<div class="cc-person-fields">'+
 '<button type="button" '+(locked?'disabled':'data-action="crew-team" data-id="'+esc(a.id)+'"')+' class="cc-mini"><span>Equipo</span><b>'+esc(a.team||'Sin equipo')+'</b></button>'+
 '<button type="button" '+(locked?'disabled':'data-action="crew-details" data-id="'+esc(a.id)+'"')+' class="cc-mini"><span>Chaleco</span><b>'+esc(a.vestColor||'—')+'</b></button>'+
 '<button type="button" '+(locked?'disabled':'data-action="crew-details" data-id="'+esc(a.id)+'"')+' class="cc-mini"><span>Pausa</span><b>'+esc(a.pauseStart?a.pauseStart+(a.pauseEnd?'–'+a.pauseEnd:''):(a.pauseScheduledHours?a.pauseScheduledHours+' h':'—'))+'</b></button>'+
 '<button type="button" '+(locked?'disabled':'data-action="crew-details" data-id="'+esc(a.id)+'"')+' class="cc-mini"><span>Dieta</span><b>'+Number(a.dietCount||0)+'</b></button>'+
 '<button type="button" '+(locked?'disabled':'data-action="crew-details" data-id="'+esc(a.id)+'"')+' class="cc-mini"><span>Valoración</span><b>'+'★'.repeat(Number(a.rating||0))+'☆'.repeat(5-Number(a.rating||0))+'</b></button></div>'+
 '<div class="cc-person-bottom">'+
 (locked?'':'<button type="button" data-action="crew-contact" data-id="'+esc(a.id)+'" class="cc-action '+(a.contacted?'contacted':'')+'">'+(a.contacted?'Contactado':'Marcar contacto')+'</button>')+
 (phone?'<a class="cc-action" href="tel:'+esc(phone.replace(/[^+\d]/g,''))+'">Llamar</a>':'')+
 (locked?'':'<button type="button" class="cc-action" data-action="edit-coord-shift" data-id="'+esc(a.id)+'">Horario</button><button type="button" class="cc-action" data-action="crew-category" data-id="'+esc(a.id)+'">Categoría</button><button type="button" class="cc-action" data-action="crew-worker-incident" data-id="'+esc(a.id)+'">Incidencia</button>')+
 '</div></article>';
}
function crewControlPage(){
 const sel=crewSelection();
 if(!sel){$('#employee-content').innerHTML='<div class="panel empty">Crew Control está disponible solo para el Crew Head asignado a un servicio, en los días de su asignación.</div>';return}
 const svc=service(sel.serviceId),roster=crewServiceRoster(),blocks=crewBlocks(),closure=crewClosed(),locked=!!closure;
 if(selectedCrewBlock!=='all'&&!blocks.some(b=>b.id===selectedCrewBlock))selectedCrewBlock='all';
 const types=[...new Set(roster.map(crewWorkLabel))].sort(),records=crewScopedRecords();
 const present=records.filter(crewRecordOpen).length,finished=records.filter(a=>a.checkOut).length,absent=records.filter(a=>!a.checkIn).length,contacted=records.filter(a=>a.contacted).length,noTeam=records.filter(a=>!a.team).length;
 const stats=[['present','Presentes',present],['absent','Sin llegar',absent],['finished','Finalizados',finished],['contacted','Contactados',contacted],['no-team','Sin equipo',noTeam]];
 const visible=a=>crewFilter==='all'||(crewFilter==='present'&&crewRecordOpen(a))||(crewFilter==='absent'&&!a.checkIn)||(crewFilter==='finished'&&a.checkOut)||(crewFilter==='contacted'&&a.contacted)||(crewFilter==='no-team'&&!a.team);
 const groupIds=[...new Set(records.map(a=>crewShiftId(a)))];
 const rosterGroups=groupIds.map(k=>{
  const items=records.filter(a=>crewShiftId(a)===k),first=items[0],shown=items.filter(visible);
  return '<section class="cc-work-group"><div class="cc-work-heading"><div><strong>'+esc(crewWorkLabel(first))+'</strong><small>'+esc(first.start)+'–'+esc(first.end)+' · '+items.length+' trabajadores · '+items.filter(crewRecordOpen).length+' presentes</small></div>'+
  (locked||!first.blockId?'':'<button type="button" data-action="crew-plan-teams" data-id="'+esc(first.blockId)+'" class="cc-small-btn">Planificar equipos</button>')+'</div>'+
  '<div class="cc-people">'+(shown.map(a=>crewCard(a,locked)).join('')||'<div class="cc-empty">Sin trabajadores para este filtro.</div>')+'</div></section>';
 }).join('');
 const days=crewDayList(),menu=days.map(d=>'<option value="'+esc(d.serviceId+'|'+d.date)+'" '+(d.serviceId+'|'+d.date===crewKey?'selected':'')+'>'+esc(human(d.date)+' · '+(service(d.serviceId).name||'Servicio'))+'</option>').join('');
 const shiftOptions='<option value="all">Todos los turnos del día</option>'+blocks.map(b=>'<option value="'+esc(b.id)+'" '+(selectedCrewBlock===b.id?'selected':'')+'>'+esc(b.start)+'–'+esc(b.end)+' · '+esc(b.serviceType)+'</option>').join('');
 const typeButtons=types.map(t=>'<button type="button" class="cc-filter-chip '+(!crewWorkTypes.size||crewWorkTypes.has(t)?'active':'')+'" data-action="crew-toggle-type" data-value="'+esc(t)+'">'+esc(t)+'</button>').join('');
 const summary=stats.map(([key,label,n])=>'<button type="button" class="cc-stat '+(crewFilter===key?'selected':'')+'" data-action="crew-filter" data-filter="'+key+'"><strong>'+n+'</strong><small>'+label+'</small></button>').join('');
 const openIncidents=(state.incidents||[]).filter(i=>i.serviceId===sel.serviceId&&i.status!=='resolved').length;
 $('#employee-content').innerHTML='<section class="cc-app"><div class="cc-app-header"><div><span class="cc-kicker">CREW CONTROL · CREW HEAD</span><h2>'+esc(svc.name||'Servicio')+'</h2><p>'+esc(human(sel.date))+' · '+esc(svc.venue||'')+' · '+roster.length+' trabajadores en el día</p></div>'+
 '<div class="cc-top-actions">'+(locked?'':btn('scan-qr','Escanear QR',sel.serviceId,'primary'))+btn('crew-incident-board','Incidencias'+(openIncidents?' ('+openIncidents+')':''),sel.serviceId)+btn('crew-export','Exportar CSV',sel.serviceId)+btn('crew-print','Imprimir',sel.serviceId)+(locked?'':btn('crew-close-day','Cerrar el día',sel.serviceId))+'</div></div>'+
 (locked?'<div class="cc-closed">Día cerrado por '+esc(closure.closedByName||'el Crew Head')+' el '+esc(stamp(closure.closedAt))+'. '+esc(closure.notes||'')+' Para hacer cambios, Gestoría debe reabrirlo.</div>':'')+
 '<div class="cc-layout"><aside class="cc-operational"><div class="cc-operational-title"><strong>Control operativo</strong><small>Tus días como Crew Head</small></div>'+
 '<label class="form-label">Servicio y día<select class="field" id="crew-key-select">'+menu+'</select></label>'+
 '<label class="form-label">Turno<select class="field" id="crew-block-select">'+shiftOptions+'</select></label>'+
 (types.length>1?'<span class="cc-sidebar-heading">Tipos de servicio</span><div class="cc-work-filters">'+typeButtons+'</div>':'')+
 '<div class="cc-stats">'+summary+'</div>'+
 (locked?'':'<button class="cc-side-btn" type="button" data-action="crew-plan-teams" data-id="'+esc(selectedCrewBlock!=='all'?selectedCrewBlock:(blocks[0]?.id||''))+'">Planificar equipos</button><button class="cc-side-btn" type="button" data-action="crew-bulk">Edición masiva / pausas</button><button class="cc-side-btn" type="button" data-action="incident-report" data-id="'+esc(sel.serviceId)+'">Nueva incidencia</button>')+
 (!locked&&blocks.length?'<div class="cc-leads"><span>Coordinadores de turno</span>'+blocks.map(b=>'<button type="button" data-action="crew-delegate" data-id="'+esc(b.id)+'">'+esc(b.start+'–'+b.end+' · '+b.serviceType)+'</button>').join('')+'</div>':'')+
 '<p class="cc-rules">El Crew Head ajusta horarios y opera el día. Los cambios de categoría se solicitan a Gestoría mediante incidencia.</p>'+
 '</aside><div class="cc-main"><div class="cc-toolbar"><div class="cc-search"><span>Buscar</span><input type="search" id="crew-search" placeholder="Nombre, categoría, equipo..." value="'+esc(crewSearch)+'"></div>'+
 (locked?'':'<div class="cc-toolbar-right"><span>'+crewSelectedIds.size+' seleccionados</span><button type="button" data-action="crew-select-visible">Seleccionar visibles</button><button type="button" data-action="crew-clear-selected">Deseleccionar</button><button type="button" class="cc-mass-btn" data-action="crew-bulk">Editar seleccionados</button></div>')+'</div>'+
 '<div class="cc-groups">'+(rosterGroups||'<div class="cc-empty">No hay personal asignado este día.</div>')+'</div></div></div>'+
 '<div class="cc-mobile-foot"><strong>'+present+'/'+records.length+' presentes</strong><span>'+absent+' sin llegar</span><span>'+noTeam+' sin equipo</span>'+(locked?'':'<button type="button" data-action="crew-bulk">Editar</button>')+'</div></section>';
}
function incidentModal(serviceId,preset={}){
 const people=(state.coordinatorRoster||[]).filter(a=>a.serviceId===serviceId),workers=state.coordinatorWorkers||[];
 const crewPeople=people;
 const uniq=[...new Map(people.map(a=>[a.workerId,a])).values()];
 const cats=(state.categoryOptions||[]).filter(c=>!service(serviceId).tariffSchedule||c.schedule===service(serviceId).tariffSchedule);
 modal('Nueva incidencia','<form id="incident-form" style="display:grid;gap:12px"><p class="muted">Queda registrada con tu usuario y la revisa Gestoría.</p>'+
 '<div class="crew-filters"><label class="form-label">Tipo<select class="field" name="type">'+Object.entries(INCIDENT_TYPE_ES).filter(([k])=>k!=='category_change'||crewPeople.length).map(([k,v])=>'<option value="'+k+'" '+(preset.type===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label class="form-label">Gravedad<select class="field" name="severity">'+Object.entries(SEVERITY_ES).map(([k,v])=>'<option value="'+k+'" '+((preset.severity||'medium')===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div>'+
 '<label class="form-label">Trabajador<select class="field" name="workerId"><option value="">Incidencia general</option>'+uniq.map(a=>'<option value="'+esc(a.workerId)+'" '+(preset.workerId===a.workerId?'selected':'')+'>'+esc(workers.find(w=>w.id===a.workerId)?.name||'Personal')+'</option>').join('')+'</select></label>'+
 '<div id="category-request" class="category-request" hidden><label class="form-label">Turno afectado<select class="field" name="assignmentId">'+crewPeople.map(a=>'<option value="'+esc(a.id)+'" data-worker="'+esc(a.workerId)+'" '+(preset.assignmentId===a.id?'selected':'')+'>'+esc((workers.find(w=>w.id===a.workerId)?.name||'Personal')+' · '+human(a.date)+' '+a.start+'–'+a.end+' · '+a.role)+'</option>').join('')+'</select></label>'+
 '<label class="form-label">Categoría solicitada<select class="field" name="requestedCategoryId"><option value="">Seleccionar…</option>'+cats.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('')+'</select></label><p class="muted compact">No cambia la categoría: Gestoría revisa la solicitud y la aplica si procede.</p></div>'+
 '<label class="form-label">Descripción<textarea class="field" name="description" maxlength="2000" required>'+esc(preset.description||'')+'</textarea></label>'+
 '<label class="form-label">Medida o actuación tomada (opcional)<textarea class="field" name="measure" maxlength="1000"></textarea></label><button class="primary" type="submit">Registrar incidencia</button></form>');
 const f=$('#incident-form'),req=$('#category-request');
 const sync=()=>{const cat=f.elements.type.value==='category_change';req.hidden=!cat;f.elements.requestedCategoryId.required=cat;if(cat&&f.elements.assignmentId.value){const w=f.elements.assignmentId.selectedOptions[0]?.dataset.worker;if(w)f.elements.workerId.value=w;}};
 f.elements.type.onchange=sync;f.elements.assignmentId.onchange=sync;sync();
 f.onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f));if(data.type!=='category_change'){delete data.assignmentId;delete data.requestedCategoryId;}try{await api('incident-report',{serviceId,...data});$('#employee-modal').close();await load();notice(data.type==='category_change'?'Solicitud de cambio de categoría enviada a Gestoría':'Incidencia registrada')}catch(ex){error(ex)}};
}
function crewIncidentBoard(){
 const incidents=(state.incidents||[]).filter(i=>i.serviceId===selectedCrewService);
 const workers=state.coordinatorWorkers||[];
 modal('Incidencias del servicio',incidents.length?incidents.map(i=>'<div class="incident-row '+esc(i.status)+'"><div class="incident-head"><strong>'+esc(INCIDENT_TYPE_ES[i.type]||'General')+'</strong><span class="badge '+(i.status==='resolved'?'confirmed':'pending')+'">'+(i.status==='resolved'?'Resuelta':'Abierta')+'</span>'+(i.severity?'<span class="sev '+esc(i.severity)+'">'+esc(SEVERITY_ES[i.severity]||'')+'</span>':'')+'</div>'+
 (i.workerId?'<small>'+esc(workers.find(w=>w.id===i.workerId)?.name||'Trabajador')+'</small>':'')+(i.type==='category_change'?'<small>'+esc((i.currentCategory||'—')+' → '+(i.requestedCategory||''))+'</small>':'')+'<p>'+esc(i.description)+'</p>'+(i.measure?'<p class="muted">Medida: '+esc(i.measure)+'</p>':'')+'<small>'+esc(stamp(i.createdAt))+'</small></div>').join(''):'<div class="empty">No hay incidencias visibles.</div>')+'<div class="actions-row" style="margin-top:14px">'+btn('incident-report','Nueva incidencia',selectedCrewService,'primary')+'</div>';
}
function crewExport(){
 const sel=crewSelection();if(!sel)return;
 const rows=crewServiceRoster().sort((a,b)=>(a.start+crewName(a)).localeCompare(b.start+crewName(b)));
 const cell=v=>{let x=String(v??'');if(/^[=+@-]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'};
 const data=[['Trabajador','Teléfono','Categoría','Tipo de servicio','Inicio','Fin','Equipo','Chaleco','Entrada','Salida','Pausa','Dietas','Valoración','Contactado'],...rows.map(a=>[crewName(a),crewPhone(a),a.role,a.serviceType,a.start,a.end,a.team,a.vestColor,a.checkIn?stamp(a.checkIn):'',a.checkOut?stamp(a.checkOut):'',a.pauseStart?a.pauseStart+'-'+(a.pauseEnd||''):(a.pauseScheduledHours||''),a.dietCount||0,a.rating||0,a.contacted?'Sí':'No'])];
 const url=URL.createObjectURL(new Blob(['﻿'+data.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');
 link.href=url;link.download='CrewControl_'+(service(sel.serviceId).name||'servicio').replace(/[^\w-]+/g,'_')+'_'+sel.date+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function crewCloseDay(){
 const sel=crewSelection();if(!sel)return;const roster=crewServiceRoster(),open=roster.filter(crewRecordOpen),absent=roster.filter(a=>!a.checkIn);
 modal('Cerrar el día · '+human(sel.date),'<form id="crew-close-form" style="display:grid;gap:12px"><div class="cc-close-summary"><div><b>'+roster.length+'</b><span>trabajadores</span></div><div><b>'+roster.filter(a=>a.checkIn).length+'</b><span>con entrada</span></div><div><b>'+absent.length+'</b><span>sin llegar</span></div><div class="'+(open.length?'warn':'')+'"><b>'+open.length+'</b><span>sin salida</span></div></div>'+
 (open.length?'<div class="notice">Hay '+open.length+' trabajador(es) sin salida registrada. Regístrala antes de cerrar.</div>':'<p class="muted">Al cerrar, el día queda bloqueado y Gestoría recibe el resumen para liquidar. Solo Gestoría puede reabrirlo.</p>')+
 '<label class="form-label">Observaciones para Gestoría (opcional)<textarea class="field" name="notes" maxlength="2000"></textarea></label><button class="primary" type="submit" '+(open.length?'disabled':'')+'>Cerrar el día y notificar a Gestoría</button></form>');
 $('#crew-close-form').onsubmit=async e=>{e.preventDefault();try{await api('crew-day-close',{serviceId:sel.serviceId,date:sel.date,notes:e.target.elements.notes.value});$('#employee-modal').close();await load();notice('Día cerrado. Gestoría ya tiene el resumen.')}catch(ex){error(ex)}};
}

function crewBulkModal(){
 const chosen=crewAllRoster().filter(a=>crewSelectedIds.has(a.id));
 if(!chosen.length)return error(new Error('Selecciona primero uno o varios trabajadores.'));
 const fields=[['team','Equipo'],['vestColor','Chaleco'],['contacted','Contacto'],['pauseScheduledHours','Duración de pausa (h)'],['pauseStart','Inicio de pausa'],['pauseEnd','Fin de pausa'],['dietCount','Dietas'],['rating','Valoración (0–5)']];
 const choices='<select class="field" name="field" id="cc-bulk-field">'+fields.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select>';
 modal('Edición masiva · '+chosen.length+' trabajadores','<form id="cc-bulk-form" style="display:grid;gap:13px"><p class="muted">Solo se modifican los turnos seleccionados y autorizados. Se respetan los permisos individuales.</p>'+
 '<label class="form-label">Campo a modificar'+choices+'</label><label class="form-label">Nuevo valor<input id="cc-bulk-value" name="value" class="field" required autocomplete="off" placeholder="Nombre de equipo o valor"></label>'+
 '<button class="primary" type="submit">Aplicar a '+chosen.length+' trabajadores</button></form>');
 const field=$('#cc-bulk-field'),value=$('#cc-bulk-value');
 function update(){const k=field.value;value.type=k==='contacted'?'checkbox':['pauseScheduledHours','dietCount','rating'].includes(k)?'number':k.startsWith('pause')?'time':'text';value.required=k!=='contacted';value.placeholder=k==='team'?'Nombre del equipo':k==='vestColor'?'Color de chaleco':'Valor';if(value.type==='number'){value.min=0;value.max=k==='rating'?5:3;value.step=k==='pauseScheduledHours'?'0.5':'1'}else{value.removeAttribute('min');value.removeAttribute('max');value.removeAttribute('step')}}
 field.onchange=update;update();
 $('#cc-bulk-form').onsubmit=async e=>{
  e.preventDefault();
  const k=field.value,v=value.type==='checkbox'?value.checked:value.type==='number'?Number(value.value):value.value;
  try{await api('crew-bulk-control',{field:k,value:v,items:chosen.map(a=>({id:a.id,revision:a.revision}))});
   crewSelectedIds.clear();$('#employee-modal').close();await load();notice('Actualizados '+chosen.length+' trabajadores');
  }catch(ex){error(ex)}
 };
}
function crewAttendanceModal(id){
 const a=crewAllRoster().find(x=>x.id===id);if(!a)return;
 const actions=!a.checkIn?[['in','Registrar entrada']]:!a.checkOut?[['out','Registrar salida'],['undo-in','Anular entrada']]:[['undo-out','Anular salida']];
 modal('Asistencia · '+crewName(a),'<form id="cc-attendance-form" style="display:grid;gap:13px"><p class="muted">El fichaje manual queda registrado con tu usuario, la hora y el motivo. Para asistencia ordinaria utiliza el QR.</p>'+
 '<label class="form-label">Acción<select name="event" class="field">'+actions.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select></label>'+
 '<label class="form-label">Motivo de corrección<textarea name="reason" class="field" maxlength="400" required placeholder="Ej.: QR no disponible en el recinto"></textarea></label>'+
 '<button class="primary" type="submit">Guardar asistencia</button></form>');
 $('#cc-attendance-form').onsubmit=async e=>{e.preventDefault();try{await api('crew-attendance',{id,revision:a.revision,...Object.fromEntries(new FormData(e.target))});$('#employee-modal').close();await load();notice('Asistencia actualizada y auditada')}catch(ex){error(ex)}};
}
function crewPlanningModal(blockId='all'){
 const blocks=crewBlocks(),chosen=blocks.find(b=>b.id===blockId)||blocks[0];
 if(!chosen)return error(new Error('No hay un bloque disponible para planificar.'));
 const list=crewTeamItems(chosen.id),roster=crewServiceRoster().filter(a=>a.blockId===chosen.id);
 const numberFor=name=>roster.filter(a=>a.team===name).length;
 const teams=list.map(t=>'<div class="cc-planning-team"><div><strong>'+esc(t.name)+'</strong><small>'+numberFor(t.name)+' / '+t.capacity+' trabajadores · '+esc(t.vestColor||'Sin chaleco definido')+'</small></div>'+
 '<button type="button" class="secondary" data-action="crew-delete-team" data-id="'+esc(t.id)+'">Eliminar</button></div>').join('');
 const blockOptions=blocks.map(b=>'<option value="'+esc(b.id)+'" '+(b.id===chosen.id?'selected':'')+'>'+esc(b.date+' · '+b.serviceType+' · '+b.start+'–'+b.end)+'</option>').join('');
 modal('Planificar equipos · '+chosen.serviceType,'<label class="form-label">Día y turno<select class="field" id="cc-plan-block">'+blockOptions+'</select></label>'+
 '<div class="cc-planning-teams">'+(teams||'<p class="muted">Todavía no hay equipos definidos para este bloque.</p>')+'</div>'+
 '<form id="cc-team-create" style="display:grid;gap:11px"><label class="form-label">Nuevo equipo<input class="field" name="name" placeholder="Principal, Secundario, Luces..." required maxlength="100"></label>'+
 '<div class="crew-filters"><label class="form-label">Personal requerido<input class="field" name="capacity" type="number" min="1" max="200" value="10"></label>'+
 '<label class="form-label">Chaleco<input class="field" name="vestColor" maxlength="30" placeholder="Naranja"></label></div>'+
 '<button type="submit" class="primary">Crear equipo</button></form>'+
 '<div class="actions-row" style="margin-top:15px">'+btn('crew-auto-teams','Distribuir personal sin equipo',chosen.id,'primary')+'</div>'+
 '<p class="muted">La distribución automática no cambia a Crew Head ni a Forklifter. Puedes asignar cualquier equipo manualmente desde la ficha del trabajador.</p>');
 $('#cc-plan-block').onchange=e=>crewPlanningModal(e.target.value);
 $('#cc-team-create').onsubmit=async e=>{
  e.preventDefault();try{await api('crew-team-save',{record:{blockId:chosen.id,...Object.fromEntries(new FormData(e.target))}});await load();crewPlanningModal(chosen.id);notice('Equipo creado')}catch(ex){error(ex)}
 };
}
async function crewAutoTeams(blockId){
 const teams=crewTeamItems(blockId),workers=crewServiceRoster().filter(a=>a.blockId===blockId);
 if(!teams.length)return error(new Error('Define primero al menos un equipo.'));
 const person=crewAuthorizedWorkers(),protectedWorker=a=>{
  const spec=(person.find(x=>x.id===a.workerId)?.specialty||a.role||'').toUpperCase();
  return /CREW\s*HEAD|FORKLIFT/.test(spec);
 };
 const target=workers.filter(a=>!a.team&&!protectedWorker(a));
 if(!target.length)return notice('No queda personal sin equipo que pueda distribuirse automáticamente.');
 const remaining=new Map(teams.map(t=>[t.name,Math.max(0,t.capacity-workers.filter(a=>a.team===t.name).length)]));
 const allocation=new Map(teams.map(t=>[t.name,[]]));
 for(const worker of target){
  const team=[...remaining].filter(([_,count])=>count>0).sort((a,b)=>b[1]-a[1])[0];
  if(!team)break;allocation.get(team[0]).push(worker);remaining.set(team[0],team[1]-1);
 }
 const total=[...allocation.values()].reduce((n,v)=>n+v.length,0);
 if(!total)return error(new Error('Todos los equipos están completos.'));
 try{
  for(const [name,group] of allocation)if(group.length){
   const assigned=await api('crew-bulk-control',{field:'team',value:name,items:group.map(a=>({id:a.id,revision:a.revision}))});
   const vestColor=teams.find(t=>t.name===name)?.vestColor;
   if(vestColor)await api('crew-bulk-control',{field:'vestColor',value:vestColor,items:assigned.records.map(a=>({id:a.id,revision:a.revision}))});
  }
  await load();crewPlanningModal(blockId);notice('Asignados '+total+' trabajadores a sus equipos');
 }catch(ex){error(ex)}
}
function crewTeamModal(id){
 const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(!a)return;
 modal('Equipo del trabajador','<form id="crew-team-form" style="display:grid;gap:12px"><label class="form-label">Equipo / escenario<input class="field" name="team" maxlength="100" value="'+esc(a.team||'')+'"></label><button class="primary" type="submit">Guardar equipo</button></form>');
 $('#crew-team-form').onsubmit=async e=>{e.preventDefault();try{await api('coordinator-control',{id,revision:a.revision,field:'team',value:e.target.elements.team.value});$('#employee-modal').close();await load();notice('Equipo actualizado')}catch(ex){error(ex)}};
}
function crewOperationalModal(id){
 const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(!a)return;
 modal('Control operativo','<form id="crew-details-form" style="display:grid;gap:12px"><p class="muted">Estos ajustes operativos no sustituyen la liquidación laboral de Gestoría.</p>'+
 '<label class="form-label">Chaleco<input class="field" name="vestColor" maxlength="30" value="'+esc(a.vestColor||'')+'"></label>'+
 '<label class="form-label">Horas de pausa previstas<select class="field" name="pauseScheduledHours">'+[0,1,2,3].map(n=>'<option value="'+n+'" '+(Number(a.pauseScheduledHours)===n?'selected':'')+'>'+n+' h</option>').join('')+'</select></label>'+
 '<label class="form-label">Dietas<select class="field" name="dietCount">'+[0,1,2,3].map(n=>'<option value="'+n+'" '+(Number(a.dietCount)===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
 '<label class="form-label">Valoración (0–5)<select class="field" name="rating">'+[0,1,2,3,4,5].map(n=>'<option value="'+n+'" '+(Number(a.rating)===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label><button class="primary" type="submit">Guardar control operativo</button></form>');
 $('#crew-details-form').onsubmit=async ev=>{
  ev.preventDefault();const data=Object.fromEntries(new FormData(ev.target));
  try{
   let revision=a.revision;
   for(const [field,value] of Object.entries(data)){
    const result=await api('coordinator-control',{id,revision,field,value:field==='vestColor'?value:Number(value)});
    revision=result.record.revision;
   }
   $('#employee-modal').close();await load();notice('Control operativo guardado');
  }catch(e){error(e)}
 };
}
function crewLeadBlockEditor(blockId){
 const block=(state.coordinatorBlocks||[]).find(b=>b.id===blockId&&b.lead);if(!block)return;
 modal('Crew Head · gestionar bloque','<form id="crew-block-form" style="display:grid;gap:12px"><div class="notice">'+esc(block.date+' · '+block.start+'–'+block.end)+'<p>Solo puedes modificar el tipo de servicio y equipo del bloque autorizado. Las horas de cada trabajador se modifican desde su ficha en Crew Control.</p></div>'+
 '<label class="form-label">Tipo de servicio<input class="field" name="serviceType" required maxlength="150" value="'+esc(block.serviceType)+'"></label>'+
 '<label class="form-label">Equipo / escenario<input class="field" name="team" maxlength="100" value="'+esc(block.team||'')+'"></label>'+
 '<button type="submit" class="primary">Guardar bloque</button></form>');
 $('#crew-block-form').onsubmit=async e=>{e.preventDefault();try{await api('service-block-lead-update',{id:block.id,revision:block.revision,...Object.fromEntries(new FormData(e.target))});$('#employee-modal').close();await load();notice('Bloque actualizado')}catch(ex){error(ex)}};
}
function crewDelegateModal(blockId){
 const block=(state.coordinatorBlocks||[]).find(b=>b.id===blockId&&b.lead);if(!block)return;
 const roster=(state.coordinatorRoster||[]).filter(a=>a.blockId===blockId),allowedIds=new Set(roster.map(a=>a.workerId));
 const candidates=(state.coordinatorCandidates||[]).filter(u=>allowedIds.has(u.workerId));
 const operators=block.operators||[];
 modal('Coordinadores de '+block.serviceType,'<div class="notice">'+esc(block.date+' · '+block.start+'–'+block.end)+'<p>Como Crew Head puedes designar coordinadores normales de este bloque, pero no conceder permisos sobre otros turnos.</p></div>'+
 operators.filter(o=>o.kind==='coordinator').map(o=>'<div class="line"><strong>'+esc((state.coordinatorCandidates||[]).find(u=>u.id===o.userId)?.name||'Coordinador')+'</strong>'+btn('crew-remove-delegate','Quitar',o.id)+'</div>').join('')+
 '<form id="crew-delegate-form" style="display:grid;gap:13px"><label class="form-label">Trabajador del bloque<select class="field" name="userId" required><option value="">Seleccionar</option>'+
 candidates.filter(u=>!operators.some(o=>o.userId===u.id)).map(u=>'<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>').join('')+'</select></label><button class="primary" type="submit">Añadir coordinador normal</button></form>');
 $('#crew-delegate-form').onsubmit=async e=>{e.preventDefault();try{await api('service-block-operator-save',{record:{blockId,userId:e.target.elements.userId.value,kind:'coordinator'}});$('#employee-modal').close();await load();notice('Coordinador añadido')}catch(err){error(err)}};
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
 const t=today(),docs=list('documents').filter(d=>d.type==='contract').sort((a,b)=>(b.periodStart||b.createdAt||'').localeCompare(a.periodStart||a.createdAt||''));
 const st=d=>d.periodStart&&d.periodStart>t?['pending','Próximo']:d.periodEnd&&d.periodEnd<t?['rejected','Finalizado']:['confirmed','Vigente'];
 const cur=docs.find(d=>st(d)[1]==='Vigente');
 $('#employee-content').innerHTML='<div class="section-title"><h2>Contratos</h2><p class="muted">Los contratos que la oficina ha subido a tu ficha, por periodo.</p></div>'+
 (cur?'<div class="panel contract-current"><span class="eyebrow">CONTRATO VIGENTE</span><h3>'+esc(cur.contractKind||'Contrato')+'</h3><p class="muted">'+(cur.periodStart?'Desde el '+human(cur.periodStart):'')+(cur.periodEnd?' hasta el '+human(cur.periodEnd):' · sin fecha de fin')+'</p><a class="primary btn-link" href="/api/office/document?id='+encodeURIComponent(cur.id)+'">Descargar contrato</a></div>':'')+
 box('Todos mis contratos',docs.length?docs.map(d=>{const [tone,l]=st(d);return '<div class="document"><div><strong>'+esc(d.contractKind||d.name)+'</strong> <span class="badge '+tone+'">'+l+'</span><br><small>'+(d.periodStart?human(d.periodStart):'—')+' → '+(d.periodEnd?human(d.periodEnd):'Indefinido')+' · '+esc(d.name)+'</small></div><a href="/api/office/document?id='+encodeURIComponent(d.id)+'">Descargar</a></div>'}).join(''):'<div class="empty">No hay contratos cargados en tu ficha.</div>')+
 '<p class="muted compact">Los documentos son archivos subidos por la oficina; no implican firma electrónica.</p>';
}

const guides=[
 ['Fichaje por QR','Abre Control horario, muestra tu QR temporal al coordinador y espera la validación. El código caduca a los 90 segundos.'],
 ['Gestión de coordinación','En Coordinación, selecciona el servicio asignado, consulta el personal y valida los QR. Solo puedes gestionar los servicios que coordinas.'],
 ['Operativa Crew Head','Consulta la asistencia de cada equipo y corrige horarios dentro de las funciones autorizadas. Comunica las incidencias a la oficina.'],
 ['Documentación','Descarga tus contratos, fichas y certificados desde Documentación y Contratos.'],
 ['Disponibilidad','Marca tu disponibilidad por día o define horarios semanales habituales.'],
 ['Liquidaciones','Consulta los importes brutos por servicio y los periodos confirmados, antes de retenciones.']
];
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

function hoursFromLegacy(value){if(Array.isArray(value?.slots))return new Set(value.slots.map(Number));if(!value?.available)return new Set();const start=Number((value.start||'08:00').slice(0,2)),end=Number((value.end||'23:00').slice(0,2));return new Set(Array.from({length:Math.max(0,end-start)},(_,i)=>i+start))}
function availabilityHourCells(key,selected){
 return Array.from({length:24},(_,h)=>'<button type="button" class="availability-hour '+(selected.has(h)?'selected':'')+'" data-weekday="'+key+'" data-hour="'+h+'" aria-pressed="'+selected.has(h)+'">'+String(h).padStart(2,'0')+'</button>').join('');
}
function bindHourDrag(container,selected,paint){
 let dragging=false,start=0,mode=true,original=null,activeKey='';
 const cellAt=e=>document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-hour]');
 container.addEventListener('pointerdown',e=>{
  const cell=e.target.closest('[data-hour]');if(!cell)return;
  activeKey=cell.dataset.weekday||'date';const picked=selected[activeKey];if(!picked)return;
  start=Number(cell.dataset.hour);mode=!picked.has(start);original=new Set(picked);dragging=true;
  try{container.setPointerCapture(e.pointerId)}catch{}
  apply(start);e.preventDefault();
 });
 function apply(end){
  const set=new Set(original);
  for(let n=Math.min(start,end);n<=Math.max(start,end);n++)mode?set.add(n):set.delete(n);
  selected[activeKey]=set;paint();
 }
 container.addEventListener('pointermove',e=>{if(!dragging)return;const cell=cellAt(e);if(cell&&(cell.dataset.weekday||'date')===activeKey)apply(Number(cell.dataset.hour))});
 container.addEventListener('pointerup',e=>{dragging=false;try{container.releasePointerCapture(e.pointerId)}catch{}});
 container.addEventListener('pointercancel',()=>dragging=false);
 container.addEventListener('click',e=>{if(e.detail!==0)return;const cell=e.target.closest('[data-hour]');if(!cell)return;const key=cell.dataset.weekday||'date',set=selected[key];if(set.has(Number(cell.dataset.hour)))set.delete(Number(cell.dataset.hour));else set.add(Number(cell.dataset.hour));paint()});
}
const WEEK_DAYS=[['mon','Lunes'],['tue','Martes'],['wed','Miércoles'],['thu','Jueves'],['fri','Viernes'],['sat','Sábado'],['sun','Domingo']];
function weekShiftOf(d){if(!d)return {morning:false,afternoon:false};if(d.morning!=null||d.afternoon!=null)return {morning:!!d.morning,afternoon:!!d.afternoon};const s=Array.isArray(d.slots)?d.slots.map(Number):d.available?[8,16]:[];return {morning:s.some(h=>h<15),afternoon:s.some(h=>h>=15)};}
function weekShiftLabel(d){const x=weekShiftOf(d);return x.morning&&x.afternoon?'Mañana y tarde':x.morning?'Mañana':x.afternoon?'Tarde':'';}
function weekGridHTML(days){const D=[['mon','L'],['tue','M'],['wed','X'],['thu','J'],['fri','V'],['sat','S'],['sun','D']];return '<div class="wk-mini"><span></span>'+D.map(([,l])=>'<b>'+l+'</b>').join('')+[['morning','Mañana'],['afternoon','Tarde']].map(([sl,lab])=>'<span>'+lab+'</span>'+D.map(([k])=>{const on=weekShiftOf(days[k])[sl];return '<button type="button" class="wk-dot '+(on?'on':'')+'" data-action="emp-week" data-id="'+k+'|'+sl+'" aria-pressed="'+on+'" aria-label="'+lab+' '+k+'">'+(on?'✓':'')+'</button>'}).join('')).join('')+'</div>'}
async function toggleEmpWeek(cell){const [k,sl]=cell.split('|'),days={};for(const [d] of WEEK_DAYS)days[d]=weekShiftOf(state.weeklyAvailability?.days?.[d]);days[k][sl]=!days[k][sl];try{await api('availability-weekly',{days});await load();notice('Disponibilidad habitual guardada')}catch(e){error(e)}}
function weeklyAvailabilityModal(){
 const current=state.weeklyAvailability?.days||{};
 const days={mon:'Lunes',tue:'Martes',wed:'Miércoles',thu:'Jueves',fri:'Viernes',sat:'Sábado',sun:'Domingo'};
 const selected=Object.fromEntries(Object.keys(days).map(key=>[key,hoursFromLegacy(current[key])]));
 const headers='<div class="hour-row-label">Día / hora</div>'+Array.from({length:24},(_,h)=>'<span class="availability-hour-heading">'+String(h).padStart(2,'0')+'</span>').join('');
 const rows=Object.entries(days).map(([key,label])=>'<div class="hour-row-label">'+label+'</div>'+availabilityHourCells(key,selected[key])).join('');
 modal('Disponibilidad semanal · lunes a domingo','<p class="muted">Arrastra para seleccionar o quitar cada hora. Puedes marcar varias franjas separadas en el mismo día.</p>'+
 '<div class="weekly-hours-scroll"><div id="weekly-hour-grid" class="weekly-hour-grid">'+headers+rows+'</div></div>'+
 '<div class="actions-row" style="margin-top:14px"><button type="button" class="secondary" id="week-all">Toda la semana</button><button type="button" class="secondary" id="week-clear">Limpiar</button><button type="button" class="primary" id="week-save">Guardar disponibilidad semanal</button></div>');
 const grid=$('#weekly-hour-grid');
 const paint=()=>grid.querySelectorAll('[data-hour]').forEach(el=>{const on=selected[el.dataset.weekday].has(Number(el.dataset.hour));el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on))});
 bindHourDrag(grid,selected,paint);
 $('#week-all').onclick=()=>{for(const d of Object.keys(days))selected[d]=new Set(Array.from({length:24},(_,i)=>i));paint()};
 $('#week-clear').onclick=()=>{for(const d of Object.keys(days))selected[d].clear();paint()};
 $('#week-save').onclick=async()=>{try{const data=Object.fromEntries(Object.keys(days).map(key=>[key,{slots:[...selected[key]].sort((a,b)=>a-b)}]));await api('availability-weekly',{days:data});$('#employee-modal').close();await load();notice('Semana guardada')}catch(e){error(e)}};
}
let qrCamera=null,qrFrame=null;
function stopQrCamera(){if(qrFrame)cancelAnimationFrame(qrFrame);qrFrame=null;if(qrCamera)qrCamera.getTracks().forEach(track=>track.stop());qrCamera=null}
function coordShift(id){
 const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(!a)return;
 modal('Cambiar horario del personal','<form id="coord-shift-form" style="display:grid;gap:12px"><label class="form-label">Día de inicio<input class="field" name="date" type="date" value="'+esc(a.date)+'" required></label><label class="form-label">Hora inicio<input class="field" name="start" type="time" value="'+esc(a.start)+'" required></label><label class="form-label">Día final<input class="field" name="endDate" type="date" value="'+esc(a.endDate)+'" required></label><label class="form-label">Hora fin<input class="field" name="end" type="time" value="'+esc(a.end)+'" required></label><button class="primary" type="submit">Guardar horario</button></form>');
 $('#coord-shift-form').onsubmit=async ev=>{ev.preventDefault();try{await api('coordinator-shift',{id,revision:a.revision,...Object.fromEntries(new FormData(ev.target))});$('#employee-modal').close();await load();notice('Horario actualizado')}catch(e){error(e)}};
}

/* v29 · Campana de notificaciones: ofertas de servicio, turnos asignados y mensajes. */
function openOffers(){return (state.offers||[]).filter(o=>o.status==='open')}
function notifItems(){
 const items=[];
 for(const o of openOffers())items.push({kind:'offer',o,new:!o.myAnswer});
 for(const a of myAssignments().filter(a=>a.status==='pending'&&!shiftClosed(a)&&endMs(a)>Date.now()).sort((x,y)=>startMs(x)-startMs(y)))items.push({kind:'shift',a,new:true});
 const seen=empSeen();for(const m of (state.messages||[]).filter(m=>m.senderId!==state.user?.id&&m.createdAt>seen).slice(-5).reverse())items.push({kind:'msg',m,new:true});
 return items;
}
function offerWhen(i){return (i.date===today()?'Hoy':human(i.date))+' · '+i.start+'–'+i.end}
function offerCard(o,compact=false){
 const i=o.info;return '<div class="offer-card '+(o.myAnswer?'answered':'')+'"><span class="eyebrow">SERVICIO DISPONIBLE · '+esc(i.category)+'</span><strong>'+esc(i.serviceName)+'</strong><small>'+esc(offerWhen(i)+(i.venue?' · '+i.venue:'')+(i.serviceType?' · '+i.serviceType:''))+'</small>'+(o.message?'<p>'+esc(o.message)+'</p>':'')+
 (o.myAnswer==='yes'?'<div class="offer-ans yes">Has dicho que te interesa. La oficina decidirá y te avisará si te lo asigna. <button class="text-link" data-action="offer-answer" data-id="'+esc(o.id)+'" data-answer="no">Ya no puedo</button></div>':o.myAnswer==='no'?'<div class="offer-ans no">Has indicado que no puedes. <button class="text-link" data-action="offer-answer" data-id="'+esc(o.id)+'" data-answer="yes">Al final sí puedo</button></div>':
 '<div class="offer-actions"><button class="primary" data-action="offer-answer" data-id="'+esc(o.id)+'" data-answer="yes">Me interesa</button><button class="secondary" data-action="offer-answer" data-id="'+esc(o.id)+'" data-answer="no">No puedo</button></div>')+'</div>';
}
function renderBell(){
 const head=document.querySelector('header.top');if(!head)return;
 let b=$('#emp-bell');if(!b){b=document.createElement('button');b.id='emp-bell';b.type='button';b.className='emp-bell';b.setAttribute('aria-label','Notificaciones');b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><span class="emp-bell-n" hidden></span>';const pill=head.querySelector('.session-pill');head.insertBefore(b,pill);b.onclick=e=>{e.stopPropagation();toggleBellPanel();};}
 const n=notifItems().filter(x=>x.new).length,badge=b.querySelector('.emp-bell-n');badge.hidden=!n;badge.textContent=n>9?'9+':n;b.classList.toggle('has',n>0);
 if($('#emp-bell-panel')?.classList.contains('open'))fillBellPanel();
}
function toggleBellPanel(force){
 let p=$('#emp-bell-panel');if(!p){p=document.createElement('div');p.id='emp-bell-panel';p.className='emp-bell-panel';document.body.appendChild(p);document.addEventListener('click',e=>{if(p.classList.contains('open')&&!p.contains(e.target)&&e.target.id!=='emp-bell')p.classList.remove('open')});}
 const open=force??!p.classList.contains('open');p.classList.toggle('open',open);if(open)fillBellPanel();
}
function fillBellPanel(){
 const p=$('#emp-bell-panel');if(!p)return;const items=notifItems();
 p.innerHTML='<div class="ebp-head"><b>Notificaciones</b><button class="icon-close" data-action="bell-close" aria-label="Cerrar">×</button></div>'+(items.length?items.map(x=>{
  if(x.kind==='offer')return offerCard(x.o,true);
  if(x.kind==='shift'){const s=service(x.a.serviceId);return '<button class="ebp-item" data-action="detail" data-id="'+esc(x.a.id)+'"><span class="ebp-ic shift">＋</span><span class="grow"><b>Te han asignado un turno</b><small>'+esc((s.name||'Servicio')+' · '+(x.a.date===today()?'Hoy':human(x.a.date))+' · '+x.a.start+'–'+x.a.end)+'</small><em>Pendiente de confirmar</em></span></button>';}
  return '<button class="ebp-item" data-page="messages"><span class="ebp-ic msg">✉</span><span class="grow"><b>Mensaje de la oficina</b><small>'+esc(String(x.m.content||'').slice(0,110))+'</small></span></button>';
 }).join(''):'<p class="ebp-empty">No tienes notificaciones.</p>');
}
async function answerOffer(id,answer){
 try{await api('offer-respond',{id,answer});await load();notice(answer==='yes'?'¡Gracias! La oficina verá que te interesa y te avisará si te lo asigna.':'Anotado: no puedes ese servicio.');}catch(e){error(e);await load().catch(()=>{});}
}

function render(){
 if(!state.user)return;
 if(page==='crewControl'&&!isCrewHead())page='dashboard';if(page==='coordination'&&!isNormalCoordinator()&&!isCrewHead())page='dashboard';
 renderNav();renderBell();$('#page-title').textContent=names[page];$('#employee-name').textContent=state.user.name;
 $('#employee-avatar').innerHTML=state.hasProfilePhoto?'<img alt="Foto de perfil" src="/api/office/employee-photo?workerId='+encodeURIComponent(state.user.workerId)+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">':esc(state.user.name.split(' ').slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase());
 ({service:serviceDetailPage,dashboard,clock:dashboard,availability:availabilityPage,services:servicesPage,calendar:calendarPage,coordination:coordinationPage,crewControl:crewControlPage,company:companyPage,training:trainingPage,documents:documentsPage,tutorials:tutorialsPage,settlements:settlementsPage,contracts:contractsPage,messages:messagesPage,profile:profilePage})[page]();
}
async function load(){
 if(isLoading)return;isLoading=true;
 try{
  state=await api('state');
  if(state.user.role!=='worker'){window.location.replace('/');return}
  $('#employee-login').hidden=true;$('#employee-app').hidden=false;
  const m=location.hash.match(/^#\/servicio\/(.+)$/);if(m&&page!=='service'&&myAssignments().some(a=>a.id===decodeURIComponent(m[1]))){serviceDetailId=decodeURIComponent(m[1]);page='service';}
  render();
 }catch(e){
  if(e.status===401||String(e.message).includes('sesión')){state={};$('#employee-app').hidden=true;$('#employee-login').hidden=false}else error(e);
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
let selectedAvailabilitySlots={date:new Set()};
function availabilityModal(date){
 const old=list('availability').find(a=>a.date===date);
 selectedAvailabilitySlots={date:hoursFromLegacy(old)};
 const grid=Array.from({length:24},(_,h)=>'<button type="button" class="availability-hour" data-hour="'+h+'" aria-pressed="false">'+String(h).padStart(2,'0')+':00</button>').join('');
 modal('Disponibilidad · '+human(date),'<p class="muted">Selecciona o deselecciona horas sueltas, o arrastra para marcar varias horas. Se pueden crear franjas separadas.</p>'+
 '<div id="availability-time-grid" class="availability-hour-grid">'+grid+'</div>'+
 '<p class="muted" id="availability-hours-count"></p><div class="actions-row">'+
 btn('set-available','Guardar horas disponibles',date,'primary')+btn('set-unavailable','Marcar no disponible',date)+'</div>');
 const root=$('#availability-time-grid');
 const paint=()=>{
  root.querySelectorAll('[data-hour]').forEach(el=>{const checked=selectedAvailabilitySlots.date.has(Number(el.dataset.hour));el.classList.toggle('selected',checked);el.setAttribute('aria-pressed',String(checked))});
  $('#availability-hours-count').textContent=selectedAvailabilitySlots.date.size+' horas seleccionadas';
 };
 bindHourDrag(root,selectedAvailabilitySlots,paint);paint();
}
function passwordModal(){
 modal('Cambiar contraseña','<form id="password-form" style="display:grid;gap:12px"><label class="form-label">Contraseña actual<input class="field" name="current" type="password" required></label><label class="form-label">Nueva contraseña (12 caracteres mínimo)<input class="field" name="password" type="password" minlength="12" required></label><button class="primary">Cambiar contraseña</button></form>');
 $('#password-form').onsubmit=async ev=>{ev.preventDefault();try{await api('password',Object.fromEntries(new FormData(ev.target)));location.replace('/empleado.html')}catch(e){error(e)}};
}
document.addEventListener('click',async ev=>{
 const el=ev.target.closest('[data-page],[data-action]');if(!el)return;
 if(el.closest('#emp-bell-panel')&&el.dataset.action!=='offer-answer')$('#emp-bell-panel').classList.remove('open');
 const p=el.dataset.page,action=el.dataset.action,id=el.dataset.id;
 if(p==='crewControl'){location.href='/crew-control/';return}
 if(p){stopQrCamera();const fromMobileFab=el.classList.contains('mobile-clock');$('.sidebar').classList.remove('open');if(location.hash)history.replaceState(null,'',location.pathname);if(p==='clock'){$('.sidebar').classList.remove('open');return openClockModal('');}page=p;render();window.scrollTo({top:0});return}
 if(action==='refresh')return load();
 if(action==='check-location')return verifyClockPosition(id);
 if(action==='open-clock')return openClockModal(id);
 if(action==='go-services'){page='services';return render()}
 if(action==='coord-enter'){coordSel.clear();coordKey=id;coordFilter='all';coordShiftSel='all';coordSearch='';coordinationPage();return window.scrollTo({top:0})}
 if(action==='coord-back'){coordKey='';return coordinationPage()}
 if(action==='coord-filter'){coordFilter=id;return coordinationPage()}
 if(action==='coord-shift'){coordShiftSel=id;return coordinationPage()}
 if(action==='coord-edit')return coordEditModal(id);
 if(action==='coord-close-day')return coordCloseModal(id);
 if(action==='coord-close-confirm'){const [serviceId,date]=id.split('|');try{await api('coord-day-close',{serviceId,date});$('#employee-modal').close();coordKey='';coordSel.clear();await load();page='coordination';render();notice('Día cerrado. Ya no aparece en Coordinación ni en Mis servicios.');}catch(err){error(err)}return}
 if(action==='coord-history')return coordHistory(id);
 if(action==='coord-bulk-status')return coordSetStatus([...coordSel],id).then(()=>{coordSel.clear();coordinationPage()});
 if(action==='coord-bulk-edit')return coordBulkModal();
 if(action==='coord-bulk-clear'){coordSel.clear();return coordinationPage()}
 if(action==='modal-close-x'){$('#employee-modal').close();return}
 if(action==='coord-quick')return coordQuick(id,el.dataset.ev);
 if(action==='coord-worker-incident'){const a=coordRoster().find(x=>x.id===id);if(a)return incidentModal(a.serviceId,{workerId:a.workerId});return}
 if(action==='service-back'){history.replaceState(null,'',location.pathname);page=servicePrev||'services';render();return window.scrollTo({top:0})}
 if(action==='go-messages'){page='messages';return render()}
 if(action==='go-settlements'){page='settlements';return render()}
 if(action==='ics-one'){const a=myAssignments().find(x=>x.id===id);if(a)downloadIcs([a],'NOVA_'+(service(a.serviceId).name||'servicio').replace(/[^\w-]+/g,'_')+'_'+a.date+'.ics');return}
 if(action==='ics-all'){downloadIcs(myAssignments().filter(a=>a.status!=='rejected'&&endMs(a)>Date.now()),'NOVA_mis_servicios.ics');return}
 if(action==='services-tab'){servicesTab=el.dataset.tab;return servicesPage()}
 if(action==='go-availability'){page='availability';return render()}
 if(action==='this-month'){month=today().slice(0,7);return render()}
 if(action==='mobile-more'){$('.sidebar').classList.toggle('open');return}
 if(action==='redeem-qr')return redeemQr(id);
 if(action==='scan-qr')return scanQr(id);
 if(action==='edit-coord-shift')return coordShift(id);
 if(action==='crew-open'){const days=crewDayList().filter(d=>d.serviceId===id);const pick=days.find(d=>d.date===today())||days.find(d=>d.date>today())||days[days.length-1];location.href='/crew-control/'+(pick?'?service='+encodeURIComponent(pick.serviceId)+'&date='+encodeURIComponent(pick.date):'');return}
 if(action==='crew-category'){const a=crewAllRoster().find(x=>x.id===id);if(a&&$('#employee-modal').open)$('#employee-modal').close();if(a)return incidentModal(a.serviceId,{type:'category_change',assignmentId:a.id,workerId:a.workerId,severity:'low'});return}
 if(action==='crew-worker-incident'){const a=crewAllRoster().find(x=>x.id===id);if(a)return incidentModal(a.serviceId,{workerId:a.workerId});return}
 if(action==='crew-export')return crewExport();
 if(action==='crew-close-day')return crewCloseDay();
 if(action==='crew-filter'){const f=el.dataset.filter||'all';crewFilter=crewFilter===f?'all':f;return crewControlPage()}
 if(action==='crew-toggle-type'){const t=el.dataset.value;if(crewWorkTypes.has(t))crewWorkTypes.delete(t);else crewWorkTypes.add(t);return crewControlPage()}
 if(action==='crew-select-visible'){crewScopedRecords().forEach(a=>crewSelectedIds.add(a.id));return crewControlPage()}
 if(action==='crew-clear-selected'){crewSelectedIds.clear();return crewControlPage()}
 if(action==='crew-bulk')return crewBulkModal();
 if(action==='crew-attendance')return crewAttendanceModal(id);
 if(action==='crew-plan-teams')return crewPlanningModal(id);
 if(action==='crew-auto-teams')return crewAutoTeams(id);
 if(action==='crew-incident-board')return crewIncidentBoard();
 if(action==='crew-print')return window.print();
 if(action==='crew-delete-team'){const t=(state.crewTeams||[]).find(x=>x.id===id);if(!t)return;return api('crew-team-delete',{id:t.id,revision:t.revision}).then(()=>load().then(()=>{crewPlanningModal(t.blockId);notice('Equipo eliminado')})).catch(error)}
 if(action==='crew-contact'){const a=(state.coordinatorRoster||[]).find(x=>x.id===id);if(a)return mutation('coordinator-control',{id,revision:a.revision,field:'contacted',value:!a.contacted},'Estado de contacto actualizado')}
 if(action==='crew-team')return crewTeamModal(id);
 if(action==='crew-details')return crewOperationalModal(id);
 if(action==='crew-block-edit')return crewLeadBlockEditor(id);
 if(action==='crew-delegate')return crewDelegateModal(id);
 if(action==='crew-remove-delegate'){const block=(state.coordinatorBlocks||[]).find(b=>b.lead&&b.operators?.some(o=>o.id===id));const record=block?.operators.find(o=>o.id===id);if(record)return mutation('service-block-operator-remove',{id,revision:record.revision},'Coordinador retirado')}
 if(action==='incident-report')return incidentModal(id);
 if(action==='tutorial')return modal(guides[Number(id)]?.[0]||'Guía','<p>'+esc(guides[Number(id)]?.[1]||'')+'</p>');
 if(action==='weekly')return weeklyAvailabilityModal();
 if(action==='emp-week')return toggleEmpWeek(id);
 if(action==='offer-answer')return answerOffer(id,el.dataset.answer);
 if(action==='bell-close')return toggleBellPanel(false);
 if(action==='edit-profile')return extendedProfile();
 if(action==='profile-tab'){profileTab=el.dataset.tab;return profilePage()}
 if(action==='upload-photo')return employeePhotoModal();
 if(action==='document-upload')return uploadPersonalDocument();
 if(action==='payroll-month'){selectedPayrollMonth=el.dataset.month;return settlementsPage()}
 if(action==='download-payroll')return downloadPayroll();
 if(action==='training-ack')return mutation('training-ack',{documentId:id},'Formación marcada como leída');
 if(action==='clock-mode'){clockMode=id;document.querySelectorAll('.clock-opt').forEach(x=>x.classList.toggle('active',x.dataset.id===id));return renderClockMode()}
 if(action==='clock-scan'){closeClock();return scanQr(id)}
 if(action==='clock-qr-new')return renderMyQr();
 if(action==='self-clock'){const a=myAssignments().find(x=>x.id===id);if(a){try{const geoMode=coordinatesMyService(a);const location=geoMode?await forcedLocation():await attendanceLocation(a.serviceId,a.id);await mutation('clock',{id,revision:a.revision,action:a.checkIn?'out':'in',...location,...(geoMode?{mode:'geo'}:{})},'Fichaje registrado');if($('#employee-modal').open&&$('#employee-modal').classList.contains('clock-dialog'))renderClockModal();}catch(e){error(e)}return}}

 if(action==='logout'){try{await api('logout',{})}catch{}state={};location.replace('/empleado.html');return}
 if(action==='detail')return detail(id);
 if(action==='coord-open'){coordKey=id;coordSel.clear();coordFilter='all';page='coordination';render();return window.scrollTo({top:0})}
 if(action==='reject')return rejectModal(id);
 if(action==='confirm'){const a=myAssignments().find(x=>x.id===id);if(a){if($('#employee-modal').open)$('#employee-modal').close();return mutation('confirm',{id,revision:a.revision,status:'confirmed'},'Turno confirmado')}}
 if(action==='qr')return showQR(id);
 if(action==='availability')return availabilityModal(el.dataset.date);
 if(action==='set-available'||action==='set-unavailable'){
  const a=list('availability').find(x=>x.date===id),slots=action==='set-available'?[...selectedAvailabilitySlots.date].sort((x,y)=>x-y):[];
  if(action==='set-available'&&!slots.length)return error(new Error('Selecciona al menos una hora disponible.'));
  $('#employee-modal').close();return mutation('availability',{date:id,status:action==='set-available'?'available':'unavailable',slots,...(a?{revision:a.revision}:{})},'Disponibilidad actualizada');
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
$('#employee-content').addEventListener('change',e=>{
 if(e.target.id==='clock-month'){clockMonth=e.target.value;return clockPage()}
 if(e.target.id==='payroll-month'){selectedPayrollMonth=e.target.value;return settlementsPage()}
 if(e.target.id==='crew-key-select'){crewKey=e.target.value;selectedCrewBlock='all';crewWorkTypes.clear();crewSelectedIds.clear();crewControlPage()}
 if(e.target.id==='crew-block-select'){selectedCrewBlock=e.target.value;crewControlPage()}
 if(e.target.matches('[data-crew-select]')){const id=e.target.dataset.crewSelect;if(e.target.checked)crewSelectedIds.add(id);else crewSelectedIds.delete(id);e.target.closest('.cc-person')?.classList.toggle('cc-selected',e.target.checked);const counter=$('.cc-toolbar-right span');if(counter)counter.textContent=crewSelectedIds.size+' seleccionados'}
});
$('#employee-content').addEventListener('input',e=>{
 if(e.target.id==='coord-search'){coordSearch=e.target.value;const c=e.target.selectionStart;coordinationPage();const f=$('#coord-search');if(f){f.focus();f.setSelectionRange(c,c)}return}
 if(e.target.id!=='crew-search')return;
 crewSearch=e.target.value;const cursor=e.target.selectionStart;crewControlPage();
 const field=$('#crew-search');if(field){field.focus();field.setSelectionRange(cursor,cursor)}
});
$('#modal-close').onclick=()=>{stopQrCamera();closeClock()};$('#employee-modal').addEventListener('close',()=>{stopQrCamera();stopQrRefresh();$('#employee-modal').classList.remove('clock-dialog','ccm-dialog')});
$('#mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');
function canAutoRefresh(){const f=document.activeElement;return state.user&&!document.hidden&&!$('#employee-modal').open&&!isLoading&&!(f&&f.matches('input,textarea,select'))&&!$('.sidebar').classList.contains('open')}
setInterval(()=>{if(canAutoRefresh()){const y=window.scrollY;load().then(()=>window.scrollTo({top:y}))}},45000);
setInterval(()=>{if(page==='coordination'&&coordKey&&canAutoRefresh()&&!document.querySelector('.nqr')){const y=window.scrollY;load().then(()=>window.scrollTo({top:y}))}},12000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&canAutoRefresh())load()});
window.addEventListener('online',()=>{if(state.user)load()});
window.addEventListener('popstate',()=>{const m=location.hash.match(/^#\/servicio\/(.+)$/);if(m&&myAssignments().some(a=>a.id===decodeURIComponent(m[1]))){serviceDetailId=decodeURIComponent(m[1]);page='service';}else if(page==='service')page=servicePrev||'services';render();});
load();
/* v33 tiempo real */
(()=>{let rev=null,pending=false;setInterval(async()=>{if(!state.user||document.hidden||pending)return;try{const r=await fetch('/api/office/rev',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return;const d=await r.json();if(rev===null){rev=d.rev;return;}if(d.rev===rev||!canAutoRefresh()||document.querySelector('.nqr'))return;pending=true;rev=d.rev;const y=window.scrollY;try{await load();window.scrollTo({top:y});}finally{pending=false;}}catch{}},3000);})();
})();
