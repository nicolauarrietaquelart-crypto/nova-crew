/* NOVA Crew · puente de Crew Control. Abre el día asignado al Crew Head, añade «Volver al área de empleado»
   y deja la gestión de personal, PDF y cierre del servicio completo a Gestoría. */
(()=>{'use strict';
const params=new URLSearchParams(location.search),today=new Date().toLocaleDateString('en-CA');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const human=d=>new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
try{localStorage.removeItem('crew-control-remembered-service')}catch{}
const header=document.querySelector('header .wrap');
const back=document.createElement('a');back.href='/empleado.html';back.className='nova-back';back.title='Volver al área de empleado';back.innerHTML='‹ <span>Volver al área de empleado</span>';
const daySelect=document.createElement('select');daySelect.className='nova-day';daySelect.hidden=true;daySelect.setAttribute('aria-label','Día como Crew Head');
if(header){const brand=header.querySelector('.brand');(brand||header.firstChild).after(back);back.after(daySelect);}
const start=document.getElementById('startScreen'),app=document.getElementById('appScreen');
const panel=document.createElement('section');panel.id='novaCrewStart';panel.className='card login-card';panel.innerHTML='<div class="nova-status">Cargando tus servicios como Crew Head…</div>';
(start||app).before(panel);
const status=(text,error=false)=>{let box=panel.querySelector('.nova-status');if(!box){box=document.createElement('div');box.className='nova-status';panel.append(box);}box.className='nova-status'+(error?' error':'');box.textContent=text;};
const sync=()=>{const open=app&&!app.classList.contains('hidden');panel.classList.toggle('hidden',open);};
if(app)new MutationObserver(sync).observe(app,{attributes:true,attributeFilter:['class']});
const startStatus=document.getElementById('startStatus');
if(startStatus)new MutationObserver(()=>{const t=startStatus.textContent.trim();if(t&&!/Abriendo/.test(t))status(t,/error|no está|no disponible/i.test(startStatus.className+' '+t));}).observe(startStatus,{childList:true,subtree:true,characterData:true,attributes:true});
async function api(op,body){const r=await fetch('/api/office/'+op,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'No se ha podido abrir Crew Control.'),{status:r.status});return d;}
let days=[],services={};
async function openDay(day){
 status('Abriendo '+(services[day.serviceId]?.name||'el servicio')+' · '+human(day.date)+'…');
 try{
  const {code}=await api('crew-open',{serviceId:day.serviceId,date:day.date});
  history.replaceState(null,'','?service='+encodeURIComponent(day.serviceId)+'&date='+encodeURIComponent(day.date));
  daySelect.value=day.serviceId+'|'+day.date;
  const input=document.getElementById('serviceCodeInput'),remember=document.getElementById('crewRememberService');
  if(remember)remember.checked=false;
  input.value=code;
  await window.openExistingService();
  for(const id of ['serviceName','serviceDate','venue']){const el=document.getElementById(id);if(el){el.readOnly=true;el.title='Lo gestiona Gestoría en NOVA Crew';}}
 }catch(e){status(e.message,true);}
}
async function init(){
 let state;
 try{state=await api('state');}catch(e){if(e.status===401){location.replace('/empleado.html');return;}status(e.message,true);return;}
 if(state.user?.role!=='worker'){location.replace('/');return;}
 services=Object.fromEntries((state.services||[]).map(s=>[s.id,s]));
 days=(state.crewHeadDays||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
 if(!days.length){panel.innerHTML='<h2>Crew Control</h2><p>Crew Control está disponible solo para el trabajador asignado como Crew Head de un servicio, en los días de su asignación.</p><a class="nova-back" style="margin:0" href="/empleado.html">‹ Volver al área de empleado</a>';return;}
 daySelect.innerHTML=days.map(d=>'<option value="'+esc(d.serviceId+'|'+d.date)+'">'+esc(new Date(d.date+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short'})+' · '+(services[d.serviceId]?.name||'Servicio'))+'</option>').join('');
 daySelect.hidden=days.length<2;
 daySelect.onchange=()=>{const [serviceId,date]=daySelect.value.split('|');location.href='/crew-control/?service='+encodeURIComponent(serviceId)+'&date='+encodeURIComponent(date);};
 panel.innerHTML='<h2>Crew Control</h2><p>Eres Crew Head en estos días. Elige el servicio que quieres abrir.</p><div class="nova-days">'+days.map((d,i)=>'<button type="button" data-i="'+i+'" class="'+(d.date===today?'today':'')+'"><span>'+esc(services[d.serviceId]?.name||'Servicio')+'<br><small>'+esc(services[d.serviceId]?.venue||'')+'</small></span><small>'+esc(d.date===today?'Hoy':human(d.date))+'</small></button>').join('')+'</div><div class="nova-status" hidden></div>';
 panel.querySelector('.nova-status').hidden=true;
 panel.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{panel.querySelector('.nova-status').hidden=false;openDay(days[Number(b.dataset.i)]);});
 const wanted=days.find(d=>d.serviceId===params.get('service')&&d.date===params.get('date'));
 const pick=wanted||(days.length===1?days[0]:days.find(d=>d.date===today));
 if(pick){panel.querySelector('.nova-status').hidden=false;openDay(pick);}
}
init();
})();
