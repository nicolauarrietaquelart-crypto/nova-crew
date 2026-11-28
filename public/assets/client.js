/* NOVA Crew · Área Clientes (v59) */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const fmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
const longDay=d=>new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid'}).format(new Date());
let S=null,page='home',tab='',detailId='',editReqId='',editSvcId='',dirty=false,rev=0,draft=null;

async function api(op,body){const r=await fetch('/api/office/'+op,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});const d=await r.json().catch(()=>({ok:false,error:'Error de conexión.'}));if(!r.ok||d.ok===false){const e=new Error(d.error||'No se ha podido completar.');e.status=r.status;throw e;}return d;}
function toast(m,err){const t=$('#cl-toast');t.textContent=m;t.className='show'+(err?' err':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',3200);}
function modal(title,html){$('#cl-modal-title').textContent=title;$('#cl-modal-body').innerHTML=html;const d=$('#cl-modal');if(!d.open)d.showModal();}
const closeModal=()=>{const d=$('#cl-modal');if(d.open)d.close();};

/* ---------- acceso ---------- */
let authTab='login';
function authScreen(){$('#cl-app').hidden=true;$('#cl-auth').hidden=false;const reg=authTab==='register';
 $('#cl-auth-card').innerHTML=`<div class="cl-tabs"><button data-action="auth-tab" data-id="login" class="${reg?'':'on'}">Iniciar sesión</button><button data-action="auth-tab" data-id="register" class="${reg?'on':''}">Crear cuenta</button></div>
 <span class="cl-eyebrow">${reg?'NUEVO CLIENTE':'BIENVENIDO'}</span><h2>${reg?'Crea tu cuenta de empresa':'Entra en tu área'}</h2><p>${reg?'En un minuto podrás pedir presupuestos. Los datos fiscales los completas después.':'Accede con el usuario de tu empresa.'}</p>
 <form id="auth-form" class="cl-form">${reg?`<label>Empresa<input name="company" required autocomplete="organization"></label><label>NIF / CIF<input name="taxId" autocomplete="off"></label><label>Persona de contacto<input name="contact" required autocomplete="name"></label><div class="cl-grid" style="grid-template-columns:1fr 1fr"><label>Correo<input name="email" type="email" required autocomplete="email"></label><label>Teléfono<input name="phone" type="tel" required autocomplete="tel"></label></div>`:''}
 <label>Usuario<input name="username" required autocomplete="username" ${reg?'placeholder="p. ej. nombre de tu empresa"':''}></label><label>Contraseña<input name="password" type="password" required minlength="${reg?12:1}" autocomplete="${reg?'new-password':'current-password'}" ${reg?'placeholder="Mínimo 12 caracteres"':''}></label>
 <div class="cl-err" hidden></div><button class="btn primary" type="submit">${reg?'Crear cuenta y entrar':'Entrar'}</button></form>
 <p class="cl-foot">¿Eres trabajador o gestor? <a href="/">Accede aquí</a></p>`;
 $('#auth-form').onsubmit=async e=>{e.preventDefault();const f=e.target,b=Object.fromEntries(new FormData(f)),err=f.querySelector('.cl-err'),btn=f.querySelector('button');err.hidden=true;btn.disabled=true;
  try{const r=await api(reg?'client-register':'login',b);if(r.user?.role!=='client'){location.replace(r.user?.role==='worker'?'/empleado.html':'/');return;}page=reg?'profile':'home';await load();if(reg)toast('Cuenta creada. Completa tus datos fiscales para poder facturar.');}catch(x){err.textContent=x.message;err.hidden=false;}finally{btn.disabled=false;}};}

async function load(){let st;try{st=await api('state');}catch(e){if(e.status===401){authScreen();return;}throw e;}
 if(st.user?.role!=='client'){location.replace(st.user?.role==='worker'?'/empleado.html':'/');return;}
 S=st;$('#cl-auth').hidden=true;$('#cl-app').hidden=false;render();}

/* ---------- utilidades de negocio ---------- */
const ICONS={home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',order:'<path d="M12 5v14M5 12h14"/>',requests:'<path d="M4 6h16M4 12h16M4 18h10"/>',quotes:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',services:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',invoices:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',profile:'<path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-6h6v6M9 10h.01M15 10h.01"/>'};
const ic=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]||''}</svg>`;
const REQ={pending:['Recibida','orange'],in_review:['En revisión','blue'],quoted:['Presupuestada','blue'],accepted:['Aceptada','green'],rejected:['Rechazada','red'],done:['Gestionada','green'],cancelled:['Anulada','']};
const QST={issued:['Pendiente de tu respuesta','orange'],accepted:['Aceptado','green'],rejected:['Rechazado','red'],invoiced:['Facturado','green']};
const IST={issued:['Pendiente de pago','orange'],partial:['Pago parcial','blue'],paid:['Pagada','green']};
const SST={planned:['Planificado','blue'],confirmed:['Confirmado','green'],in_progress:['En curso','orange'],completed:['Finalizado',''],cancelled:['Cancelado','red']};
const badge=(m,k)=>{const [l,c]=m[k]||[k||'—',''];return `<span class="badge ${c}">${esc(l)}</span>`;};
const fiscalOk=()=>!!(S.client.taxId&&S.client.address);
const pendingQuotes=()=>S.quotes.filter(q=>q.status==='issued');
/* En curso: aceptado y todavía sin factura emitida. Cuando se emite la factura pasa a Finalizados. */
const invoiced=s=>S.invoices.some(i=>i.serviceId===s.id);
const upcoming=()=>S.services.filter(s=>s.status!=='cancelled'&&!invoiced(s)).sort((a,b)=>a.date.localeCompare(b.date));
const unpaid=()=>S.invoices.filter(i=>i.status!=='paid');
const reqTypeLabel={quote:'Presupuesto',change:'Cambio en servicio',names:'Nombres del personal','quote-response':'Respuesta a presupuesto',signup:'Alta'};
const dtile=d=>{const x=new Date(d+'T12:00:00');return `<div class="dt"><b>${x.getDate()}</b><small>${x.toLocaleDateString('es-ES',{month:'short'})}</small></div>`;};
const catName=id=>S.categories.find(c=>c.id===id)?.name||id;

/* ---------- navegación ---------- */
const NAV=[['home','Inicio'],['order','Nuevo pedido'],['requests','Mis peticiones'],['quotes','Presupuestos'],['services','Servicios'],['invoices','Facturas'],['profile','Datos fiscales']];
const TITLES={home:'Inicio',order:'Nuevo pedido',requests:'Mis peticiones',quotes:'Presupuestos',services:'Servicios',invoices:'Facturas',profile:'Datos fiscales'};
function navCount(k){if(k==='quotes')return pendingQuotes().length;if(k==='requests')return S.requests.filter(r=>['pending','in_review'].includes(r.status)&&r.type==='quote').length;if(k==='invoices')return unpaid().length;if(k==='profile')return fiscalOk()?0:1;return 0;}
function render(){const call=String(S.onCall||'').replace(/\s/g,'');
 $('#cl-company-name').textContent=S.client.name;$('#cl-initials').textContent=S.client.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
 for(const el of [$('#cl-oncall'),$('#cl-oncall-side')]){el.href='tel:'+call;el.querySelector('b').textContent=S.onCall;}
 $('#cl-nav').innerHTML=NAV.map(([k,l])=>{const n=navCount(k);return `<button data-page="${k}" class="${page===k?'on':''}">${ic(k)}${l}${n?`<b>${n}</b>`:''}</button>`;}).join('');
 $('#cl-title').textContent=page==='order'&&editSvcId?'Modificar servicio':detailId?({quotes:'Presupuesto',services:'Servicio',invoices:'Factura'}[page]||TITLES[page]):TITLES[page];
 const fn={home,order:orderPage,requests:requestsPage,quotes:quotesPage,services:servicesPage,invoices:invoicesPage,profile:profilePage}[page]||home;
 $('#cl-content').innerHTML='';fn();$('#cl-side').classList.remove('open');}
function go(p,id=''){page=p;detailId=id;tab='';if(p!=='order'){editReqId='';editSvcId='';draft=null;}dirty=false;render();window.scrollTo({top:0,behavior:'smooth'});}

const urgentBox=()=>`<div class="urgent"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff7a00" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/></svg><div><b>¿Urgencia durante un servicio o alguien no se ha presentado?</b><span class="muted">Llama al teléfono de guardia, disponible 24 h: <b>${esc(S.onCall)}</b></span></div><a class="btn dark" href="tel:${esc(String(S.onCall).replace(/\s/g,''))}">Llamar a guardia</a></div>`;

/* ---------- Inicio ---------- */
function home(){const up=upcoming(),pq=pendingQuotes(),un=unpaid(),open=S.requests.filter(r=>r.type==='quote'&&['pending','in_review'].includes(r.status));
 $('#cl-content').innerHTML=`<section class="hero"><div><span class="cl-eyebrow">HOLA, ${esc((S.user.name||'').split(' ')[0].toUpperCase())}</span><h2>¿Qué necesitas para tu próximo evento?</h2><p>Dinos fechas, horarios y perfiles. Te enviamos el presupuesto y lo aceptas desde aquí.</p></div><button class="btn primary" data-page="order">＋ Nuevo pedido</button></section>
 ${fiscalOk()?'':`<div class="notice"><span><b>Completa tus datos fiscales</b> para que podamos emitir tus presupuestos y facturas.</span><button class="btn small" data-page="profile">Completar ahora</button></div>`}
 ${urgentBox()}
 <div class="kpis"><button class="kpi ${pq.length?'hot':''}" data-page="quotes"><small>Presupuestos por responder</small><strong>${pq.length}</strong></button><button class="kpi" data-page="requests"><small>Peticiones en curso</small><strong>${open.length}</strong></button><button class="kpi" data-page="services"><small>Servicios en curso</small><strong>${up.length}</strong></button><button class="kpi" data-page="invoices"><small>Facturas pendientes</small><strong>${un.length}</strong></button></div>
 ${pq.length?`<div class="sec-head"><h2>Presupuestos esperando tu respuesta</h2></div><div class="list">${pq.map(quoteItem).join('')}</div><br>`:''}
 <div class="sec-head"><h2>Servicios en curso</h2><button class="btn small" data-page="services">Ver todos</button></div>
 ${up.length?`<div class="list">${up.slice(0,5).map(serviceItem).join('')}</div>`:`<div class="panel empty"><b>No tienes servicios próximos</b>Cuando aceptes un presupuesto, el servicio aparecerá aquí.</div>`}`;}

/* ---------- Nuevo pedido / editar petición (v60: sin precios, más guiado) ---------- */
const WORK_TYPES=['Montaje','Show','Desmontaje','Carga','Descarga','Operativo'];
const PAUSES=[[0,'Sin pausa'],[0.5,'30 min'],[1,'1 h'],[1.5,'1 h 30'],[2,'2 h']];
function blankLine(d){return {categoryId:'',quantity:1,date:d,start:'08:00',end:'16:00',pause:0,serviceType:'Montaje'};}
function lineHours(l){if(!l.date||!l.start||!l.end)return 0;const end=l.end<=l.start?new Date(Date.parse(l.date+'T12:00:00Z')+864e5).toISOString().slice(0,10):l.date;return Math.max(0,(Date.parse(end+'T'+l.end+':00Z')-Date.parse(l.date+'T'+l.start+':00Z'))/36e5-Number(l.pause||0));}
const shortDay=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'}):'';
function lineCard(l,i){const groups=[...new Set(S.categories.map(c=>c.group||'Otros'))];const night=l.end&&l.start&&l.end<=l.start;const custom=l.serviceType&&!WORK_TYPES.includes(l.serviceType);
 return `<article class="turno" data-i="${i}"><header><span class="turno-n">⏱</span><div class="grow"><b>Turno</b><small class="turno-sum">${esc(l.start)}–${esc(l.end)}${night?' (termina al día siguiente)':''} · ${l.quantity} persona${l.quantity==1?'':'s'}</small></div><button type="button" class="btn small" data-action="line-dup" data-i="${i}" title="Añade otro turno igual en este día">Duplicar</button><button type="button" class="btn small bad" data-action="line-del" data-i="${i}" aria-label="Quitar turno">Quitar</button></header>
 <div class="turno-grid"><label class="span2">¿Qué perfil necesitas?<select data-f="categoryId" required><option value="">Elige un perfil…</option>${groups.map(g=>`<optgroup label="${esc(g)}">${S.categories.filter(c=>(c.group||'Otros')===g).map(c=>`<option value="${esc(c.id)}" ${c.id===l.categoryId?'selected':''}>${esc(c.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>
 <label>¿Cuántas personas?<div class="stepper"><button type="button" data-action="qty" data-i="${i}" data-d="-1" aria-label="Menos">−</button><input data-f="quantity" type="number" min="1" max="200" value="${esc(l.quantity)}"><button type="button" data-action="qty" data-i="${i}" data-d="1" aria-label="Más">+</button></div></label>
 <label>Desde<input data-f="start" type="time" step="900" value="${esc(l.start)}"></label><label>Hasta<input data-f="end" type="time" step="900" value="${esc(l.end)}"></label>
 <label>Pausa<select data-f="pause">${PAUSES.map(([v,t])=>`<option value="${v}" ${Number(l.pause||0)===v?'selected':''}>${t}</option>`).join('')}</select></label>
 <div class="span2"><span class="lbl">Tipo de trabajo</span><div class="chips">${WORK_TYPES.map(w=>`<button type="button" class="chip ${l.serviceType===w?'on':''}" data-action="wtype" data-i="${i}" data-v="${w}">${w}</button>`).join('')}<input data-f="serviceType" class="chip-other" placeholder="Otro…" value="${custom?esc(l.serviceType):''}"></div></div></div></article>`;}
/* Buscador de ubicación (Google Places vía la gestoría): al elegir, rellena recinto y dirección. */
function placeSearch(input,addr){const box=input.parentElement.querySelector('.place-results');let t=null,seq=0;
 input.addEventListener('input',()=>{clearTimeout(t);draft.venueLat=null;draft.venueLng=null;const q=input.value.trim();if(q.length<3){box.hidden=true;return;}
  t=setTimeout(async()=>{const my=++seq;box.hidden=false;box.innerHTML='<p class="muted">Buscando…</p>';
   try{const r=await api('client-geocode',{q});if(my!==seq)return;const rs=r.results||[];
    box.innerHTML=rs.length?rs.map((x,i)=>`<button type="button" data-i="${i}"><b>${esc(x.name)}</b><small>${esc(x.address||'')}</small></button>`).join('')+'<p class="muted small">¿No aparece? Escríbelo tal cual y continúa.</p>':'<p class="muted">Sin resultados. Prueba con el nombre del recinto y la ciudad, o escríbelo a mano.</p>';
    box.querySelectorAll('button').forEach(b=>b.onmousedown=ev=>{ev.preventDefault();const x=rs[Number(b.dataset.i)];input.value=x.name||x.address;addr.value=x.address||'';draft.venue=input.value;draft.address=addr.value;draft.venueLat=x.lat;draft.venueLng=x.lng;box.hidden=true;dirty=true;orderPage();});
   }catch(ex){box.innerHTML='<p class="muted">'+esc(ex.message)+'</p>';}},400);});
 input.addEventListener('blur',()=>setTimeout(()=>box.hidden=true,200));}
let calMonth='';
function dayPicker(){if(!calMonth)calMonth=(draft.days[0]||today()).slice(0,7);const d=new Date(calMonth+'-01T12:00:00'),count=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),first=(d.getDay()+6)%7,t=today(),sel=new Set(draft.days);
 return `<div class="dpick"><div class="dpick-h"><button type="button" class="btn small" data-action="cal-month" data-d="-1" aria-label="Mes anterior">‹</button><b>${esc(d.toLocaleDateString('es-ES',{month:'long',year:'numeric'}))}</b><button type="button" class="btn small" data-action="cal-month" data-d="1" aria-label="Mes siguiente">›</button></div>
 <div class="dpick-g">${['L','M','X','J','V','S','D'].map(x=>`<span class="dn">${x}</span>`).join('')}${'<span></span>'.repeat(first)}${Array.from({length:count},(_,i)=>{const ds=calMonth+'-'+String(i+1).padStart(2,'0');return `<button type="button" class="dd ${sel.has(ds)?'on':''} ${ds===t?'today':''}" data-action="day-toggle" data-d="${ds}" ${ds<t?'disabled':''}>${i+1}</button>`;}).join('')}</div>
 <p class="muted small" style="margin:8px 0 0">${draft.days.length?`<b>${draft.days.length} día${draft.days.length>1?'s':''}:</b> ${draft.days.map(shortDay).map(esc).join(' · ')}`:'Pulsa los días para marcarlos. Puedes marcar días sueltos o seguidos.'}</p></div>`;}
function orderPage(){const r=editReqId?S.requests.find(x=>x.id===editReqId):null,sv=editSvcId?S.services.find(x=>x.id===editSvcId):null;
 if(!draft)calMonth='';
 if(!draft&&sv){const m=new Map();for(const p of sv.positions){const k=[p.date,p.start,p.end,p.categoryId,p.serviceType,p.pause].join('|');const x=m.get(k)||{categoryId:p.categoryId,date:p.date,start:p.start,end:p.end,pause:Number(p.pause||0),serviceType:p.serviceType?p.serviceType.charAt(0)+p.serviceType.slice(1).toLowerCase():'',quantity:0};x.quantity++;m.set(k,x);}draft={title:sv.name,venue:sv.venue,address:'',contactName:'',contactPhone:'',notes:'',lines:[...m.values()]};}
 if(!draft)draft=r?{title:r.title,venue:r.venue,address:r.address,venueLat:r.venueLat,venueLng:r.venueLng,contactName:r.contactName||'',contactPhone:r.contactPhone||'',notes:r.notes,lines:r.lines.map(l=>({...l}))}:{title:'',venue:'',address:'',contactName:S.client.contact||S.user.name||'',contactPhone:S.client.phone||'',notes:'',lines:[]};
 if(!draft.days)draft.days=[...new Set(draft.lines.map(l=>l.date))].sort();
 $('#cl-content').innerHTML=`${sv?'':r?`<div class="notice"><span>Estás modificando <b>${esc(r.title)}</b>. La gestoría verá los cambios al momento.</span><button class="btn small" data-action="order-cancel-edit">Descartar cambios</button></div>`:`<p class="lead">Rellena estos tres pasos. Te enviaremos el <b>presupuesto con el precio</b> para que lo aceptes desde aquí.</p>`}
 <form id="order-form" class="order"><div class="order-main">
${sv?`<section class="panel step"><div class="step-h"><span>✎</span><div><h3>Modificar «${esc(sv.name)}»</h3><small>Cambia días, turnos, personas u horarios. La gestoría recibe el cambio al momento y te lo confirma. Si es urgente y el servicio ya ha empezado, llama a guardia: <b>${esc(S.onCall)}</b>.</small></div></div><label class="wide" style="display:flex;flex-direction:column;gap:5px;font-size:12.5px;font-weight:700">Comentario para la gestoría<textarea name="notes" placeholder="p. ej. El sábado empezamos una hora antes">${esc(draft.notes)}</textarea></label></section>`:` <section class="panel step"><div class="step-h"><span>1</span><div><h3>¿Qué evento es?</h3><small>Nombre y lugar.</small></div></div><div class="cl-grid">
  <label class="wide">Nombre del evento *<input name="title" required maxlength="200" value="${esc(draft.title)}" placeholder="p. ej. Concierto en el Palau Sant Jordi"></label>
  <label class="wide place">Recinto o ubicación<input name="venue" value="${esc(draft.venue)}" placeholder="Escribe y elige: p. ej. Palau Sant Jordi" autocomplete="off"><div class="place-results" hidden></div></label><label class="wide">Dirección<input name="address" value="${esc(draft.address)}" placeholder="Se rellena al elegir el recinto"></label>${draft.venueLat?`<a class="place-map" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${draft.venueLat},${draft.venueLng}">📍 Ver en Google Maps</a>`:''}</div></section>
 <section class="panel step"><div class="step-h"><span>2</span><div><h3>¿Con quién hablamos?</h3><small>La persona de contacto para este pedido. Puede ser distinta en cada petición.</small></div></div><div class="cl-grid">
  <label>Persona de contacto *<input name="contactName" required maxlength="120" value="${esc(draft.contactName)}" autocomplete="name"></label><label>Teléfono de contacto *<input name="contactPhone" required type="tel" maxlength="40" value="${esc(draft.contactPhone)}" autocomplete="tel"></label>
  <label class="wide">Observaciones<textarea name="notes" placeholder="Accesos, vestuario, EPI, carga y descarga, catering…">${esc(draft.notes)}</textarea></label></div></section>
`} <section class="panel step"><div class="step-h"><span>3</span><div><h3>¿Qué días?</h3><small>Marca en el calendario todos los días que necesitas personal.</small></div></div>${dayPicker()}</section>
 <section class="panel step"><div class="step-h"><span>4</span><div><h3>Turnos de cada día</h3><small>Para cada día, añade los turnos: perfil, número de personas y horario. Si termina después de medianoche, pon la hora de fin igualmente (p. ej. 22:00 → 06:00).</small></div></div>
  ${draft.days.length?draft.days.map((d,di)=>{const idx=draft.lines.map((l,i)=>[l,i]).filter(([l])=>l.date===d);return `<div class="day-block"><div class="day-block-h"><b>${esc(longDay(d))}</b><span class="muted small">${idx.length} turno${idx.length===1?'':'s'}</span>${di>0&&draft.lines.some(l=>l.date===draft.days[di-1])?`<button type="button" class="btn small" data-action="day-copy-prev" data-d="${d}">Copiar turnos del día anterior</button>`:''}${idx.length&&draft.days.length>1?`<button type="button" class="btn small" data-action="day-copy-all" data-d="${d}">Usar estos turnos en todos los días</button>`:''}</div>
   <div class="turnos">${idx.map(([l,i])=>lineCard(l,i)).join('')}</div><button type="button" class="add-line" data-action="line-add" data-d="${d}">＋ Añadir turno el ${esc(shortDay(d))}</button></div>`;}).join(''):'<div class="empty"><b>Primero marca los días</b>en el calendario de arriba.</div>'}</section></div>
 <aside class="order-side"><div class="panel sum"><h3>Resumen</h3><div class="sum-row"><span>Turnos</span><b id="sum-t">0</b></div><div class="sum-row"><span>Personas</span><b id="sum-p">0</b></div><div class="sum-row"><span>Horas de trabajo</span><b id="sum-h">0 h</b></div><div class="sum-row"><span>Días</span><b id="sum-d">—</b></div>
  <p class="muted small">El precio te llega en el presupuesto. El pago se hace por transferencia bancaria cuando recibas la factura.</p>
  <button class="btn primary" type="submit" style="width:100%">${sv?'Enviar cambios a la gestoría':r?'Guardar cambios':'Enviar petición'}</button><button type="button" class="btn" ${sv?`data-action="open-service" data-id="${sv.id}"`:'data-page="requests"'} style="width:100%;margin-top:8px">Cancelar</button></div></aside></form>`;
 const f=$('#order-form');const sync=()=>{for(const k of ['title','venue','address','contactName','contactPhone','notes'])if(f[k])draft[k]=f[k].value;
  f.querySelectorAll('.turno').forEach(row=>{const l=draft.lines[row.dataset.i];row.querySelectorAll('[data-f]').forEach(i=>{if(i.dataset.f==='serviceType'){if(i.value.trim())l.serviceType=i.value.trim();}else l[i.dataset.f]=i.value;});
   row.querySelector('.turno-sum').textContent=`${l.start}–${l.end}${l.end<=l.start?' (termina al día siguiente)':''} · ${l.quantity} persona${l.quantity==1?'':'s'}`;});
  const ls=draft.lines;$('#sum-t').textContent=ls.length;$('#sum-p').textContent=ls.reduce((n,l)=>n+Number(l.quantity||0),0);$('#sum-h').textContent=Math.round(ls.reduce((n,l)=>n+lineHours(l)*Number(l.quantity||0),0)*10)/10+' h';
  const ds=[...new Set(ls.map(l=>l.date).filter(Boolean))].sort();$('#sum-d').textContent=ds.length?(ds.length===1?fmt(ds[0]):fmt(ds[0])+' – '+fmt(ds[ds.length-1])):'—';};
 f.addEventListener('input',()=>{dirty=true;sync();});f.addEventListener('change',sync);sync();if(f.venue)placeSearch(f.venue,f.address);
 f.onsubmit=async e=>{e.preventDefault();sync();const btn=f.querySelector('[type=submit]');
  if(!draft.days.length){toast('Marca al menos un día en el calendario.',true);return;}
  const empty=draft.days.find(d=>!draft.lines.some(l=>l.date===d));if(empty){toast('Añade al menos un turno el '+shortDay(empty)+' (o desmárcalo).',true);return;}
  const bad=draft.lines.findIndex(l=>!l.categoryId);if(bad>=0){toast('Elige el perfil de todos los turnos.',true);f.querySelector('.turno[data-i="'+bad+'"]').scrollIntoView({behavior:'smooth',block:'center'});return;}
  btn.disabled=true;
  if(sv){try{await api('client-service-request',{serviceId:sv.id,type:'change',message:draft.notes||'',lines:draft.lines.map(l=>({...l,quantity:Number(l.quantity),pause:Number(l.pause||0)}))});dirty=false;draft=null;editSvcId='';await load();page='services';detailId=sv.id;render();toast('Cambios enviados a la gestoría. Te confirmaremos en cuanto estén aplicados.');}catch(x){toast(x.message,true);}finally{btn.disabled=false;}return;}
  try{const rec={title:draft.title,venue:draft.venue,address:draft.address,venueLat:draft.venueLat??'',venueLng:draft.venueLng??'',contactName:draft.contactName,contactPhone:draft.contactPhone,notes:draft.notes,lines:draft.lines.map(l=>({...l,quantity:Number(l.quantity),pause:Number(l.pause||0)})),...(r?{id:r.id,revision:r.revision}:{})};
   await api('client-request-save',{record:rec});dirty=false;draft=null;editReqId='';await load();go('requests');toast(r?'Petición actualizada':'¡Petición enviada! Te avisaremos con el presupuesto.');}
  catch(x){toast(x.message,true);}finally{btn.disabled=false;}};}

/* ---------- Peticiones ---------- */
function requestsPage(){const mine=S.requests.filter(r=>r.type!=='signup'&&r.type!=='quote-response');const t=tab||'open';const open=mine.filter(r=>['pending','in_review','quoted'].includes(r.status)),closed=mine.filter(r=>!['pending','in_review','quoted'].includes(r.status));const rows=t==='open'?open:closed;
 $('#cl-content').innerHTML=`<div class="sec-head"><div class="tabs"><button data-action="tab" data-id="open" class="${t==='open'?'on':''}">En curso<b>${open.length}</b></button><button data-action="tab" data-id="closed" class="${t==='closed'?'on':''}">Históricas<b>${closed.length}</b></button></div><button class="btn primary small" data-page="order">＋ Nuevo pedido</button></div>
 ${rows.length?`<div class="list">${rows.map(r=>{const q=r.quoteId&&S.quotes.find(x=>x.id===r.quoteId);const dates=r.dateFrom?(r.dateFrom===r.dateTo?fmt(r.dateFrom):fmt(r.dateFrom)+' – '+fmt(r.dateTo)):fmt(String(r.createdAt).slice(0,10));
  const people=(r.lines||[]).reduce((n,l)=>n+Number(l.quantity||0),0);
  return `<div class="item" style="cursor:default">${r.dateFrom?dtile(r.dateFrom):''}<div class="grow"><strong>${esc(r.title)}</strong><small>${esc(reqTypeLabel[r.type]||'')} · ${dates}${people?' · '+people+' personas · '+r.lines.length+' turno'+(r.lines.length>1?'s':''):''}${r.venue?' · '+esc(r.venue):''}${r.contactName?' · Contacto: '+esc(r.contactName):''}</small>${r.managerNote?`<small style="display:block;margin-top:4px">💬 ${esc(r.managerNote)}</small>`:''}</div>${badge(REQ,r.status)}
   ${['pending','in_review'].includes(r.status)&&r.type==='quote'?`<button class="btn small" data-action="req-edit" data-id="${r.id}">Modificar</button><button class="btn small bad" data-action="req-cancel" data-id="${r.id}">Anular</button>`:''}${q?`<button class="btn small primary" data-action="open-quote" data-id="${q.id}">Ver presupuesto</button>`:''}</div>`;}).join('')}</div>`
 :`<div class="panel empty"><b>${t==='open'?'No tienes peticiones en curso':'Sin peticiones anteriores'}</b>${t==='open'?'Pide un presupuesto en «Nuevo pedido».':''}</div>`}`;}

/* ---------- Presupuestos ---------- */
const quoteItem=q=>`<button class="item" data-action="open-quote" data-id="${q.id}">${q.staffPlan?.[0]?.date?dtile(q.staffPlan[0].date):dtile(q.date)}<div class="grow"><strong>${esc(q.serviceName||'Presupuesto')}</strong><small>${esc(q.number||q.ref)} · ${fmt(q.date)}${q.status==='issued'?' · válido hasta '+fmt(q.dueDate):''}</small></div><span class="amount">${euro(q.total)}</span>${badge(QST,q.status)}</button>`;
function quotesPage(){if(detailId)return quoteDetail(detailId);const t=tab||'pending';const groups={pending:S.quotes.filter(q=>q.status==='issued'),accepted:S.quotes.filter(q=>q.status==='accepted'||q.status==='invoiced'),rejected:S.quotes.filter(q=>q.status==='rejected')};
 $('#cl-content').innerHTML=`<div class="tabs">${[['pending','Por responder'],['accepted','Aceptados'],['rejected','Rechazados']].map(([k,l])=>`<button data-action="tab" data-id="${k}" class="${t===k?'on':''}">${l}<b>${groups[k].length}</b></button>`).join('')}</div>
 ${groups[t].length?`<div class="list">${groups[t].map(quoteItem).join('')}</div>`:`<div class="panel empty"><b>No hay presupuestos aquí</b>Cuando preparemos tu presupuesto aparecerá en «Por responder».</div>`}`;}
function quoteDetail(id){const q=S.quotes.find(x=>x.id===id);if(!q){detailId='';return quotesPage();}
 const plan=q.staffPlan||[];
 $('#cl-content').innerHTML=`<div class="doc-actions"><button class="btn small" data-action="back">← Volver</button><button class="btn small" data-action="print">Descargar PDF</button></div>${paper(q,'quote')}
 ${plan.length?`<div class="respond"><h3 style="margin:0 0 8px">Detalle de turnos</h3><table class="cl"><thead><tr><th>Fecha</th><th>Horario</th><th>Perfil</th><th>Tipo</th><th class="num">Personas</th></tr></thead><tbody>${plan.map(p=>`<tr><td>${fmt(p.date)}</td><td>${esc(p.start)}–${esc(p.end)}${p.pause?` <small class="muted">(pausa ${p.pause} h)</small>`:''}</td><td>${esc(p.role)}</td><td>${esc(p.serviceType)}${p.locationName?' · '+esc(p.locationName):''}</td><td class="num">${p.quantity}</td></tr>`).join('')}</tbody></table></div>`:''}
 ${q.status==='issued'?`<div class="respond"><h3 style="margin:0 0 4px">¿Aceptas este presupuesto?</h3><p class="muted small" style="margin:0 0 10px">Al aceptarlo, preparamos el servicio con el personal indicado. El pago se realiza por transferencia bancaria cuando recibas la factura.</p><textarea id="q-comment" placeholder="Comentario para la gestoría (opcional)"></textarea><div class="form-actions"><button class="btn bad" data-action="quote-reply" data-id="${q.id}" data-status="rejected">Rechazar</button><button class="btn ok" data-action="quote-reply" data-id="${q.id}" data-status="accepted">✓ Aceptar presupuesto</button></div></div>`
 :`<div class="respond"><b>${q.status==='rejected'?'Rechazado':'Aceptado'}</b>${q.respondedAt?` el ${fmt(q.respondedAt.slice(0,10))}`:''}${q.clientComment?` · «${esc(q.clientComment)}»`:''}</div>`}`;}

/* ---------- Servicios ---------- */
const serviceItem=s=>{const cov=s.positions.filter(p=>p.covered).length;return `<button class="item" data-action="open-service" data-id="${s.id}">${dtile(s.date)}<div class="grow"><strong>${esc(s.name)}</strong><small>${s.ref?esc(s.ref)+' · ':''}${s.date===s.endDate?fmt(s.date):fmt(s.date)+' – '+fmt(s.endDate)}${s.venue?' · '+esc(s.venue):''} · ${cov}/${s.positions.length} puestos cubiertos</small></div>${invoiced(s)?'<span class="badge green">Facturado</span>':badge(SST,s.status)}</button>`;};
function servicesPage(){if(detailId)return serviceDetail(detailId);const t=tab||'next';const next=upcoming(),past=S.services.filter(s=>!next.includes(s));const rows=t==='next'?next:past;
 $('#cl-content').innerHTML=`${urgentBox()}<div class="tabs"><button data-action="tab" data-id="next" class="${t==='next'?'on':''}">En curso<b>${next.length}</b></button><button data-action="tab" data-id="past" class="${t==='past'?'on':''}">Finalizados y facturados<b>${past.length}</b></button></div>
 ${rows.length?`<div class="list">${rows.map(serviceItem).join('')}</div>`:`<div class="panel empty"><b>No hay servicios</b>${t==='next'?'Pide un presupuesto y, al aceptarlo, aparecerá aquí.':''}</div>`}`;}
function serviceDetail(id){const s=S.services.find(x=>x.id===id);if(!s){detailId='';return servicesPage();}
 const days=[...new Set(s.positions.map(p=>p.date))].sort();const cov=s.positions.filter(p=>p.covered).length,pres=s.positions.filter(p=>p.present).length;
 const inv=S.invoices.filter(i=>i.serviceId===s.id),q=S.quotes.find(x=>x.serviceId===s.id||x.id===s.quoteId);
 $('#cl-content').innerHTML=`<button class="btn small" data-action="back" style="margin-bottom:12px">← Volver</button>${urgentBox()}
 <section class="panel"><div class="svc-top"><div><span class="cl-eyebrow">${esc(s.ref||'SERVICIO')}</span><h2>${esc(s.name)}</h2><p class="muted" style="margin:4px 0 0">${s.venue?esc(s.venue)+' · ':''}${s.date===s.endDate?longDay(s.date):fmt(s.date)+' – '+fmt(s.endDate)}</p></div><div class="svc-actions">${badge(SST,s.status)}${invoiced(s)||s.status==='cancelled'?'':`<button class="btn small primary" data-action="svc-edit" data-id="${s.id}">Modificar turnos y horarios</button><button class="btn small" data-action="svc-change" data-id="${s.id}">Otro cambio</button>`}${s.showWorkerNames?'':`<button class="btn small" data-action="svc-names" data-id="${s.id}">Pedir nombres del personal</button>`}</div></div>
  <div class="kv"><div><small>Personas en total</small><b>${s.positions.length}</b></div><div><small>Cubiertos</small><b>${cov} / ${s.positions.length}</b></div><div><small>Presentes ahora</small><b>${pres}</b></div>${q?`<div><small>Presupuesto aceptado</small><b><a href="#" data-action="open-quote" data-id="${q.id}">${esc(q.number||q.ref)}</a> · ${euro(q.total)}</b></div>`:''}${inv.length?`<div><small>Factura</small><b>${inv.map(i=>`<a href="#" data-action="open-invoice" data-id="${i.id}">${esc(i.number)}</a>`).join(', ')}</b></div>`:''}</div></section>
 <section class="panel"><h3>Personal por día</h3><p class="muted small">${s.showWorkerNames?'Se muestran los nombres del personal a petición tuya.':'Por privacidad no mostramos los nombres del personal. Puedes pedirlos con el botón de arriba.'}</p>
 ${days.length?days.map(d=>{const g=new Map();for(const p of s.positions.filter(p=>p.date===d)){const k=[p.start,p.end,p.role,p.serviceType,p.pause,p.location].join('|');const x=g.get(k)||{...p,n:0,cov:0,pres:0,names:[]};x.n++;if(p.covered)x.cov++;if(p.present)x.pres++;if(p.worker)x.names.push(p.worker);g.set(k,x);}
  return `<div class="day-group"><h4>${longDay(d)}</h4><table class="cl"><thead><tr><th>Horario</th><th>Perfil</th><th>Tipo de trabajo</th><th class="num">Personas</th><th>Estado</th>${s.showWorkerNames?'<th>Personal</th>':''}</tr></thead><tbody>${[...g.values()].map(p=>`<tr><td><b>${esc(p.start)}–${esc(p.end)}</b>${p.pause?` <small class="muted">pausa ${p.pause} h</small>`:''}</td><td>${esc(p.role)}</td><td>${esc(p.serviceType||'—')}${p.location?' · '+esc(p.location):''}</td><td class="num"><b>${p.n}</b></td><td>${p.pres?`<span class="dot ok"></span>${p.pres}/${p.n} presentes`:p.cov===p.n?'<span class="dot ok"></span>Todos cubiertos':`<span class="dot warn"></span>${p.cov}/${p.n} cubiertos`}</td>${s.showWorkerNames?`<td>${esc(p.names.join(', ')||'—')}</td>`:''}</tr>`).join('')}</tbody></table></div>`;}).join(''):'<div class="empty">Todavía no hay turnos cargados para este servicio.</div>'}</section>`;}

/* ---------- Facturas ---------- */
function invoicesPage(){if(detailId)return invoiceDetail(detailId);const t=tab||'pending';const pend=unpaid(),paid=S.invoices.filter(i=>i.status==='paid');const rows=t==='pending'?pend:paid;
 $('#cl-content').innerHTML=`<div class="notice"><span>El pago de las facturas se realiza por <b>transferencia bancaria</b>${S.company.iban?' a <b>'+esc(S.company.iban)+'</b>':''}. Indica el número de factura en el concepto.</span></div>
 <div class="tabs"><button data-action="tab" data-id="pending" class="${t==='pending'?'on':''}">Pendientes<b>${pend.length}</b></button><button data-action="tab" data-id="paid" class="${t==='paid'?'on':''}">Pagadas<b>${paid.length}</b></button></div>
 ${rows.length?`<div class="list">${rows.map(i=>`<button class="item" data-action="open-invoice" data-id="${i.id}">${dtile(i.date)}<div class="grow"><strong>Factura ${esc(i.number)}</strong><small>${fmt(i.date)} · vence ${fmt(i.dueDate)}${i.serviceId?' · '+esc(S.services.find(s=>s.id===i.serviceId)?.name||''):''}</small></div><span class="amount">${euro(i.total)}</span>${badge(IST,i.status)}</button>`).join('')}</div>`:`<div class="panel empty"><b>No hay facturas ${t==='pending'?'pendientes':'pagadas'}</b></div>`}`;}
function invoiceDetail(id){const i=S.invoices.find(x=>x.id===id);if(!i){detailId='';return invoicesPage();}
 $('#cl-content').innerHTML=`<div class="doc-actions"><button class="btn small" data-action="back">← Volver</button><button class="btn small primary" data-action="print">Descargar PDF</button></div>${paper(i,'invoice')}`;}

/* Documento (mismo diseño que la gestoría) */
function paper(r,kind){const q=kind==='quote',c=r.customer||S.client,s=r.issuer||S.company,sv=r.serviceId?S.services.find(x=>x.id===r.serviceId):null;
 const docNo=r.number||(r.ref?'Presupuesto '+r.ref:''),vatRates=[...new Set((r.lines||[]).map(l=>Number(l.vat)))];
 const kv=(k,v)=>v?`<div class="doc-kv"><span>${k}</span><b>${v}</b></div>`:'';
 const qty=l=>l.unit==='diet'?l.quantity+' dieta'+(l.quantity==1?'':'s'):l.unit==='day'?l.quantity+' día'+(l.quantity==1?'':'s'):Number(l.quantity).toLocaleString('es-ES')+' h';
 const rows=(r.lines||[]).map(l=>`<tr class="${l.sub?'doc-sub':''}"><td class="doc-desc">${l.sub?'<span class="doc-sub-mark">↳</span>':''}${esc(l.description)}</td><td class="num">${qty(l)}</td><td class="num">${euro(l.price)}</td><td class="num">${l.vat}%</td><td class="num"><b>${euro(l.net)}</b></td></tr>`).join('');
 return `<article class="doc ${q?'doc-quote':'doc-invoice'}"><header class="doc-head"><div class="doc-issuer"><div class="doc-logo">${esc((s.name||'N').trim().charAt(0).toUpperCase())}</div><div><h2>${esc(s.name||'')}</h2><p>${s.taxId?'NIF '+esc(s.taxId)+'<br>':''}${esc(s.address||'')}${s.email||s.phone?'<br>'+[s.email,s.phone].filter(Boolean).map(esc).join(' · '):''}</p></div></div><div class="doc-title"><h1>${q?'Presupuesto':'Factura'}</h1><div class="doc-number">${esc(docNo)}</div></div></header>
 <section class="doc-meta">${kv('Fecha',fmt(r.date))}${kv(q?'Válido hasta':'Vencimiento',fmt(r.dueDate))}${r.ref?kv('Referencia',esc(r.ref)):''}</section>
 <section class="doc-parties"><div class="doc-box"><small>${q?'Presupuesto para':'Facturar a'}</small><strong>${esc(c.name||'—')}</strong><p>${c.taxId?'NIF/CIF '+esc(c.taxId)+'<br>':''}${esc(c.address||'')}${r.contactName?'<br>Contacto: <b>'+esc(r.contactName)+'</b>'+(r.contactPhone?' · '+esc(r.contactPhone):''):''}</p></div>${sv||r.serviceName?`<div class="doc-box"><small>Servicio</small><strong>${esc(sv?.name||r.serviceName)}</strong><p>${sv?esc(sv.venue)+'<br>'+(sv.date===sv.endDate?fmt(sv.date):fmt(sv.date)+' – '+fmt(sv.endDate)):esc(r.serviceVenue||'')}</p></div>`:''}</section>
 <table class="doc-lines"><thead><tr><th>Concepto</th><th class="num">${q?'Cant.':'Horas'}</th><th class="num">Precio</th><th class="num">IVA</th><th class="num">Importe</th></tr></thead><tbody>${rows}</tbody></table>
 <section class="doc-bottom"><div class="doc-terms">${r.notes?`<h4>Observaciones</h4><p>${esc(r.notes)}</p>`:''}<h4>Condiciones</h4><p>${q?`Presupuesto válido hasta el ${fmt(r.dueDate)}. Precios por hora según categoría; la pausa no se factura. Las horas reales y dietas se ajustan en la factura final.`:`Forma de pago: transferencia bancaria${s.iban?' a la cuenta <b>'+esc(s.iban)+'</b>':''}. Vencimiento: ${fmt(r.dueDate)}.`}</p></div>
 <div class="doc-totals"><div><span>Base imponible</span><span>${euro(r.net)}</span></div><div><span>IVA${vatRates.length===1?' ('+vatRates[0]+'%)':''}</span><span>${euro(r.tax)}</span></div><div class="doc-total"><span>Total</span><span>${euro(r.total)}</span></div>${!q&&r.paid?`<div><span>Pagado</span><span>${euro(r.paid)}</span></div><div class="doc-due"><span>Pendiente</span><span>${euro(r.total-r.paid)}</span></div>`:''}</div></section>
 <footer class="doc-foot">${esc(s.name||'')}${s.taxId?' · NIF '+esc(s.taxId):''}</footer></article>`;}

/* ---------- Datos fiscales ---------- */
function profilePage(){const c=S.client;
 $('#cl-content').innerHTML=`<form id="pf" class="panel"><h3>Datos fiscales para presupuestos y facturas</h3><p class="muted small">Aparecen en tus presupuestos y facturas. Si cambian, actualízalos aquí y la gestoría los verá al momento (las facturas ya emitidas no cambian).</p>
 <div class="cl-grid"><label class="wide">Razón social<input name="legalName" required value="${esc(c.legalName||c.name)}"></label><label>NIF / CIF<input name="taxId" required value="${esc(c.taxId||'')}"></label><label>Persona de contacto<input name="contact" value="${esc(c.contact||'')}"></label><label>Teléfono<input name="phone" type="tel" value="${esc(c.phone||'')}"></label>
 <label class="wide">Dirección fiscal (calle y número)<input name="street" required value="${esc(c.street||(!c.postalCode?c.address:'')||'')}"></label><label>Código postal<input name="postalCode" required value="${esc(c.postalCode||'')}"></label><label>Población<input name="city" required value="${esc(c.city||'')}"></label><label>Provincia<input name="province" value="${esc(c.province||'')}"></label><label>País<input name="country" value="${esc(c.country||'España')}"></label>
 <label>Correo de contacto<input name="email" type="email" value="${esc(c.email||'')}"></label><label>Correo para facturas<input name="billingEmail" type="email" value="${esc(c.billingEmail||c.email||'')}"></label></div>
 <div class="form-actions"><button class="btn primary" type="submit">Guardar datos fiscales</button></div></form>
 <section class="panel"><h3>Tu acceso</h3><p class="muted small">Usuario: <b>${esc(S.user.username)}</b></p><button class="btn small" data-action="password">Cambiar contraseña</button></section>`;
 const f=$('#pf');f.addEventListener('input',()=>dirty=true);f.onsubmit=async e=>{e.preventDefault();const btn=f.querySelector('[type=submit]');btn.disabled=true;try{await api('client-profile',{record:{...Object.fromEntries(new FormData(f)),revision:S.client.revision}});dirty=false;await load();toast('Datos fiscales guardados');}catch(x){toast(x.message,true);}finally{btn.disabled=false;}};}

/* ---------- eventos ---------- */
document.addEventListener('click',async e=>{const el=e.target.closest('[data-action],[data-page]');if(!el)return;
 if(el.dataset.page){e.preventDefault();if(dirty&&!confirm('Tienes cambios sin guardar. ¿Salir igualmente?'))return;return go(el.dataset.page);}
 const a=el.dataset.action,id=el.dataset.id;
 if(a==='auth-tab'){authTab=id;return authScreen();}
 if(a==='menu')return $('#cl-side').classList.toggle('open');
 if(a==='modal-close')return closeModal();
 if(a==='logout'){await api('logout',{}).catch(()=>{});S=null;return authScreen();}
 if(a==='tab'){tab=id;return render();}
 if(a==='back'){detailId='';return render();}
 if(a==='print'){$('#print-area').innerHTML=$('#cl-content .doc').outerHTML;window.print();return;}
 if(a==='open-quote'){e.preventDefault();page='quotes';detailId=id;return render();}
 if(a==='open-service'){if(dirty&&!confirm('Tienes cambios sin enviar. ¿Salir?'))return;editSvcId='';draft=null;dirty=false;page='services';detailId=id;return render();}
 if(a==='svc-edit'){editSvcId=id;editReqId='';draft=null;page='order';detailId='';render();window.scrollTo({top:0});return;}
 if(a==='open-invoice'){e.preventDefault();page='invoices';detailId=id;return render();}
 if(a==='line-add'){const d=el.dataset.d;const prev=[...draft.lines].reverse().find(l=>l.date===d)||draft.lines[draft.lines.length-1];draft.lines.push(prev?{...prev,date:d,categoryId:''}:blankLine(d));draft.lines.sort((x,y)=>x.date.localeCompare(y.date));dirty=true;return orderPage();}
 if(a==='day-toggle'){const d=el.dataset.d;if(draft.days.includes(d)){const n=draft.lines.filter(l=>l.date===d).length;if(n&&!confirm('Ese día tiene '+n+' turno(s). ¿Quitarlo?'))return;draft.days=draft.days.filter(x=>x!==d);draft.lines=draft.lines.filter(l=>l.date!==d);}else{draft.days=[...draft.days,d].sort();const prev=[...draft.days].filter(x=>x<d).pop()||[...draft.days].filter(x=>x>d)[0];const src=draft.lines.filter(l=>l.date===prev);draft.lines.push(...(src.length?src.map(l=>({...l,date:d})):[blankLine(d)]));draft.lines.sort((x,y)=>x.date.localeCompare(y.date));}dirty=true;const y=window.scrollY;orderPage();window.scrollTo({top:y});return;}
 if(a==='cal-month'){const [yy,mm]=calMonth.split('-').map(Number);const nd=new Date(yy,mm-1+Number(el.dataset.d),1);calMonth=nd.getFullYear()+'-'+String(nd.getMonth()+1).padStart(2,'0');const y=window.scrollY;orderPage();window.scrollTo({top:y});return;}
 if(a==='day-copy-prev'||a==='day-copy-all'){const d=el.dataset.d;if(a==='day-copy-prev'){const prev=draft.days[draft.days.indexOf(d)-1];draft.lines=draft.lines.filter(l=>l.date!==d).concat(draft.lines.filter(l=>l.date===prev).map(l=>({...l,date:d})));}else{if(!confirm('¿Poner los turnos de este día en todos los días marcados? Se sustituyen los que haya.'))return;const src=draft.lines.filter(l=>l.date===d);draft.lines=draft.days.flatMap(x=>src.map(l=>({...l,date:x})));}draft.lines.sort((x,y)=>x.date.localeCompare(y.date));dirty=true;return orderPage();}
 if(a==='line-dup'){const i=Number(el.dataset.i);draft.lines.splice(i+1,0,{...draft.lines[i]});dirty=true;return orderPage();}
 if(a==='qty'){const l=draft.lines[Number(el.dataset.i)];l.quantity=Math.max(1,Math.min(200,Number(l.quantity||1)+Number(el.dataset.d)));dirty=true;const inp=el.parentElement.querySelector('input');inp.value=l.quantity;inp.dispatchEvent(new Event('input',{bubbles:true}));return;}
 if(a==='wtype'){const l=draft.lines[Number(el.dataset.i)];l.serviceType=el.dataset.v;el.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===el));el.parentElement.querySelector('.chip-other').value='';dirty=true;return;}
 if(a==='line-del'){draft.lines.splice(Number(el.dataset.i),1);dirty=true;return orderPage();}
 if(a==='req-edit'){editReqId=id;draft=null;page='order';detailId='';return render();}
 if(a==='order-cancel-edit'){editReqId='';draft=null;dirty=false;return go('requests');}
 if(a==='req-cancel'){const r=S.requests.find(x=>x.id===id);if(!confirm('¿Anular la petición «'+r.title+'»?'))return;try{await api('client-request-cancel',{id,revision:r.revision});await load();toast('Petición anulada');}catch(x){toast(x.message,true);}return;}
 if(a==='quote-reply'){const q=S.quotes.find(x=>x.id===id),st=el.dataset.status;if(!confirm(st==='accepted'?'¿Aceptar el presupuesto por '+euro(q.total)+'?':'¿Rechazar este presupuesto?'))return;
  try{await api('client-quote-respond',{id,status:st,comment:$('#q-comment')?.value||'',revision:q.revision});await load();toast(st==='accepted'?'¡Presupuesto aceptado! Nos ponemos con ello.':'Presupuesto rechazado');}catch(x){toast(x.message,true);}return;}
 if(a==='svc-change'){modal('Solicitar un cambio',`<form id="chg" class="cl-form"><p class="muted small" style="margin:0">Describe el cambio (horarios, número de personas, perfiles…). La gestoría lo recibe al momento y te confirmará. Si es urgente y el servicio ya ha empezado, llama a guardia: <b>${esc(S.onCall)}</b>.</p><textarea name="message" required placeholder="p. ej. El día 12 necesitamos 2 personas más de 18:00 a 23:00"></textarea><div class="form-actions"><button class="btn primary" type="submit">Enviar cambio</button></div></form>`);
  $('#chg').onsubmit=async ev=>{ev.preventDefault();try{await api('client-service-request',{serviceId:id,type:'change',message:ev.target.message.value});closeModal();await load();toast('Cambio enviado a la gestoría');}catch(x){toast(x.message,true);}};return;}
 if(a==='svc-names'){if(!confirm('¿Pedir a la gestoría los nombres del personal de este servicio?'))return;try{await api('client-service-request',{serviceId:id,type:'names'});await load();toast('Solicitud enviada. Verás los nombres cuando la gestoría la apruebe.');}catch(x){toast(x.message,true);}return;}
 if(a==='password'){modal('Cambiar contraseña',`<form id="pw" class="cl-form"><label>Contraseña actual<input name="current" type="password" required autocomplete="current-password"></label><label>Nueva contraseña<input name="password" type="password" minlength="12" required autocomplete="new-password" placeholder="Mínimo 12 caracteres"></label><div class="form-actions"><button class="btn primary" type="submit">Guardar</button></div></form>`);
  $('#pw').onsubmit=async ev=>{ev.preventDefault();try{await api('password',Object.fromEntries(new FormData(ev.target)));closeModal();toast('Contraseña cambiada. Vuelve a entrar.');setTimeout(()=>location.reload(),1200);}catch(x){toast(x.message,true);}};return;}
});

/* Tiempo real: si la gestoría cambia algo, se actualiza solo (salvo si estás escribiendo). */
setInterval(async()=>{if(!S||document.hidden||dirty||$('#cl-modal').open)return;try{const r=await api('rev');if(rev&&r.rev!==rev){const y=window.scrollY;await load();window.scrollTo({top:y});}rev=r.rev;}catch{}},5000);
load().catch(e=>{authScreen();toast(e.message,true);});
})();
