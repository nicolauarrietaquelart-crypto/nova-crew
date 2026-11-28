/* NOVA Crew · Área Clientes (v59) */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const fmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
const longDay=d=>new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid'}).format(new Date());
let S=null,page='home',tab='',detailId='',editReqId='',dirty=false,rev=0,draft=null;

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
const upcoming=()=>S.services.filter(s=>(s.endDate||s.date)>=today()&&s.status!=='cancelled').sort((a,b)=>a.date.localeCompare(b.date));
const unpaid=()=>S.invoices.filter(i=>i.status!=='paid');
const reqTypeLabel={quote:'Presupuesto',change:'Cambio en servicio',names:'Nombres del personal','quote-response':'Respuesta a presupuesto',signup:'Alta'};
const dtile=d=>{const x=new Date(d+'T12:00:00');return `<div class="dt"><b>${x.getDate()}</b><small>${x.toLocaleDateString('es-ES',{month:'short'})}</small></div>`;};
const catName=id=>S.categories.find(c=>c.id===id)?.name||id;
function estimate(l){const t=S.categories.find(c=>c.id===l.categoryId);if(!t||!l.date||!l.start||!l.end)return null;const end=l.end<=l.start?new Date(Date.parse(l.date+'T12:00:00Z')+864e5).toISOString().slice(0,10):l.date;
 const hrs=(Date.parse(end+'T'+l.end+':00Z')-Date.parse(l.date+'T'+l.start+':00Z'))/36e5-Number(l.pause||0);if(hrs<=0)return null;const bill=t.unit==='day'?1:Math.max(hrs,t.minHours||0);return {bill,price:t.price,net:Math.round(bill*t.price*Number(l.quantity||1)*100)/100,unit:t.unit};}

/* ---------- navegación ---------- */
const NAV=[['home','Inicio'],['order','Nuevo pedido'],['requests','Mis peticiones'],['quotes','Presupuestos'],['services','Servicios'],['invoices','Facturas'],['profile','Datos fiscales']];
const TITLES={home:'Inicio',order:'Nuevo pedido',requests:'Mis peticiones',quotes:'Presupuestos',services:'Servicios',invoices:'Facturas',profile:'Datos fiscales'};
function navCount(k){if(k==='quotes')return pendingQuotes().length;if(k==='requests')return S.requests.filter(r=>['pending','in_review'].includes(r.status)&&r.type==='quote').length;if(k==='invoices')return unpaid().length;if(k==='profile')return fiscalOk()?0:1;return 0;}
function render(){const call=String(S.onCall||'').replace(/\s/g,'');
 $('#cl-company-name').textContent=S.client.name;$('#cl-initials').textContent=S.client.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
 for(const el of [$('#cl-oncall'),$('#cl-oncall-side')]){el.href='tel:'+call;el.querySelector('b').textContent=S.onCall;}
 $('#cl-nav').innerHTML=NAV.map(([k,l])=>{const n=navCount(k);return `<button data-page="${k}" class="${page===k?'on':''}">${ic(k)}${l}${n?`<b>${n}</b>`:''}</button>`;}).join('');
 $('#cl-title').textContent=detailId?({quotes:'Presupuesto',services:'Servicio',invoices:'Factura'}[page]||TITLES[page]):TITLES[page];
 const fn={home,order:orderPage,requests:requestsPage,quotes:quotesPage,services:servicesPage,invoices:invoicesPage,profile:profilePage}[page]||home;
 $('#cl-content').innerHTML='';fn();$('#cl-side').classList.remove('open');}
function go(p,id=''){page=p;detailId=id;tab='';if(p!=='order'){editReqId='';draft=null;}dirty=false;render();window.scrollTo({top:0,behavior:'smooth'});}

const urgentBox=()=>`<div class="urgent"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff7a00" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/></svg><div><b>¿Urgencia durante un servicio o alguien no se ha presentado?</b><span class="muted">Llama al teléfono de guardia, disponible 24 h: <b>${esc(S.onCall)}</b></span></div><a class="btn dark" href="tel:${esc(String(S.onCall).replace(/\s/g,''))}">Llamar a guardia</a></div>`;

/* ---------- Inicio ---------- */
function home(){const up=upcoming(),pq=pendingQuotes(),un=unpaid(),open=S.requests.filter(r=>r.type==='quote'&&['pending','in_review'].includes(r.status));
 $('#cl-content').innerHTML=`<section class="hero"><div><span class="cl-eyebrow">HOLA, ${esc((S.user.name||'').split(' ')[0].toUpperCase())}</span><h2>¿Qué necesitas para tu próximo evento?</h2><p>Dinos fechas, horarios y perfiles. Te enviamos el presupuesto y lo aceptas desde aquí.</p></div><button class="btn primary" data-page="order">＋ Nuevo pedido</button></section>
 ${fiscalOk()?'':`<div class="notice"><span><b>Completa tus datos fiscales</b> para que podamos emitir tus presupuestos y facturas.</span><button class="btn small" data-page="profile">Completar ahora</button></div>`}
 ${urgentBox()}
 <div class="kpis"><button class="kpi ${pq.length?'hot':''}" data-page="quotes"><small>Presupuestos por responder</small><strong>${pq.length}</strong></button><button class="kpi" data-page="requests"><small>Peticiones en curso</small><strong>${open.length}</strong></button><button class="kpi" data-page="services"><small>Próximos servicios</small><strong>${up.length}</strong></button><button class="kpi" data-page="invoices"><small>Facturas pendientes</small><strong>${un.length}</strong></button></div>
 ${pq.length?`<div class="sec-head"><h2>Presupuestos esperando tu respuesta</h2></div><div class="list">${pq.map(quoteItem).join('')}</div><br>`:''}
 <div class="sec-head"><h2>Próximos servicios</h2><button class="btn small" data-page="services">Ver todos</button></div>
 ${up.length?`<div class="list">${up.slice(0,5).map(serviceItem).join('')}</div>`:`<div class="panel empty"><b>No tienes servicios próximos</b>Cuando aceptes un presupuesto, el servicio aparecerá aquí.</div>`}`;}

/* ---------- Nuevo pedido / editar petición ---------- */
function blankLine(){const d=new Date(Date.now()+7*864e5).toISOString().slice(0,10);return {categoryId:'',quantity:1,date:d,start:'08:00',end:'16:00',pause:0,serviceType:''};}
function orderPage(){const r=editReqId?S.requests.find(x=>x.id===editReqId):null;
 if(!draft)draft=r?{title:r.title,venue:r.venue,address:r.address,contactOnSite:r.contactOnSite,notes:r.notes,lines:r.lines.map(l=>({...l}))}:{title:'',venue:'',address:'',contactOnSite:'',notes:'',lines:[blankLine()]};
 const groups=[...new Set(S.categories.map(c=>c.group||'Otros'))];
 const catSel=v=>`<select data-f="categoryId" required><option value="">Perfil / categoría…</option>${groups.map(g=>`<optgroup label="${esc(g)}">${S.categories.filter(c=>(c.group||'Otros')===g).map(c=>`<option value="${esc(c.id)}" ${c.id===v?'selected':''}>${esc(c.name)} · ${euro(c.price)}${c.unit==='day'?'/día':'/h'}</option>`).join('')}</optgroup>`).join('')}</select>`;
 $('#cl-content').innerHTML=`${r?`<div class="notice"><span>Estás modificando la petición <b>${esc(r.title)}</b>. La gestoría verá los cambios al momento.</span><button class="btn small" data-action="order-cancel-edit">Descartar cambios</button></div>`:''}
 <form id="order-form"><section class="panel"><h3>1 · El evento</h3><p class="muted small">Cuéntanos qué es y dónde será.</p><div class="cl-grid">
  <label class="wide">Nombre del evento / servicio<input name="title" required maxlength="200" value="${esc(draft.title)}" placeholder="p. ej. Concierto Palau Sant Jordi"></label>
  <label>Recinto<input name="venue" value="${esc(draft.venue)}" placeholder="p. ej. Palau Sant Jordi"></label><label>Dirección<input name="address" value="${esc(draft.address)}"></label><label>Contacto en el recinto<input name="contactOnSite" value="${esc(draft.contactOnSite)}" placeholder="Nombre y teléfono"></label>
  <label class="wide">Observaciones<textarea name="notes" placeholder="Accesos, vestuario, EPI, carga y descarga, catering…">${esc(draft.notes)}</textarea></label></div></section>
 <section class="panel"><h3>2 · Personal que necesitas</h3><p class="muted small">Una línea por turno. Si un turno pasa de medianoche, pon la hora de fin del día siguiente (p. ej. 22:00 → 06:00).</p>
  <div class="lines"><div class="line line-h"><span>Perfil</span><span>Personas</span><span>Fecha</span><span>Inicio</span><span>Fin</span><span>Pausa (h)</span><span>Tipo de trabajo</span><span style="text-align:right">Estimado</span><span></span></div>
  ${draft.lines.map((l,i)=>`<div class="line" data-i="${i}">${catSel(l.categoryId)}<input data-f="quantity" type="number" min="1" max="200" value="${esc(l.quantity)}" aria-label="Personas"><input data-f="date" type="date" value="${esc(l.date)}" min="${today()}" aria-label="Fecha"><input data-f="start" type="time" value="${esc(l.start)}" aria-label="Inicio"><input data-f="end" type="time" value="${esc(l.end)}" aria-label="Fin"><input data-f="pause" type="number" min="0" max="8" step="0.25" value="${esc(l.pause||0)}" aria-label="Pausa"><input data-f="serviceType" value="${esc(l.serviceType||'')}" placeholder="Montaje, show, desmontaje…" aria-label="Tipo de trabajo"><span class="est">—</span><button type="button" class="del" data-action="line-del" data-i="${i}" aria-label="Quitar línea">×</button></div>`).join('')}</div>
  <button type="button" class="add-line" data-action="line-add" style="margin-top:10px;width:100%">＋ Añadir otro turno</button>
  <div class="est-box"><div><small>Horas estimadas</small><b id="est-h">0 h</b></div><div><small>Base imponible estimada</small><b id="est-net">${euro(0)}</b></div><div class="tot"><small>Total estimado (IVA ${S.vat}% incl.)</small><b id="est-tot">${euro(0)}</b></div></div>
  <p class="muted small" style="text-align:right;margin:8px 0 0">Estimación orientativa con tus tarifas. El importe definitivo llega en el presupuesto. El pago se realiza por transferencia bancaria.</p></section>
 <div class="form-actions"><button type="button" class="btn" data-page="requests">Cancelar</button><button class="btn primary" type="submit">${r?'Guardar cambios':'Enviar petición de presupuesto'}</button></div></form>`;
 const f=$('#order-form');const sync=()=>{draft.title=f.title.value;draft.venue=f.venue.value;draft.address=f.address.value;draft.contactOnSite=f.contactOnSite.value;draft.notes=f.notes.value;
  f.querySelectorAll('.line[data-i]').forEach(row=>{const l=draft.lines[row.dataset.i];row.querySelectorAll('[data-f]').forEach(i=>l[i.dataset.f]=i.value);});
  let h=0,n=0;f.querySelectorAll('.line[data-i]').forEach(row=>{const e=estimate(draft.lines[row.dataset.i]);row.querySelector('.est').textContent=e?euro(e.net):'—';if(e){h+=e.unit==='day'?0:e.bill*Number(draft.lines[row.dataset.i].quantity||1);n+=e.net;}});
  $('#est-h').textContent=Math.round(h*100)/100+' h';$('#est-net').textContent=euro(n);$('#est-tot').textContent=euro(n*(1+S.vat/100));};
 f.addEventListener('input',()=>{dirty=true;sync();});f.addEventListener('change',sync);sync();
 f.onsubmit=async e=>{e.preventDefault();sync();const btn=f.querySelector('[type=submit]');btn.disabled=true;
  try{if(draft.lines.some(l=>!l.categoryId))throw Error('Elige el perfil de cada turno.');
   const rec={title:draft.title,venue:draft.venue,address:draft.address,contactOnSite:draft.contactOnSite,notes:draft.notes,lines:draft.lines.map(l=>({...l,quantity:Number(l.quantity),pause:Number(l.pause||0)})),...(r?{id:r.id,revision:r.revision}:{})};
   await api('client-request-save',{record:rec});dirty=false;draft=null;editReqId='';await load();go('requests');toast(r?'Petición actualizada':'Petición enviada. Te avisaremos con el presupuesto.');}
  catch(x){toast(x.message,true);}finally{btn.disabled=false;}};}

/* ---------- Peticiones ---------- */
function requestsPage(){const mine=S.requests.filter(r=>r.type!=='signup'&&r.type!=='quote-response');const t=tab||'open';const open=mine.filter(r=>['pending','in_review','quoted'].includes(r.status)),closed=mine.filter(r=>!['pending','in_review','quoted'].includes(r.status));const rows=t==='open'?open:closed;
 $('#cl-content').innerHTML=`<div class="sec-head"><div class="tabs"><button data-action="tab" data-id="open" class="${t==='open'?'on':''}">En curso<b>${open.length}</b></button><button data-action="tab" data-id="closed" class="${t==='closed'?'on':''}">Históricas<b>${closed.length}</b></button></div><button class="btn primary small" data-page="order">＋ Nuevo pedido</button></div>
 ${rows.length?`<div class="list">${rows.map(r=>{const q=r.quoteId&&S.quotes.find(x=>x.id===r.quoteId);const dates=r.dateFrom?(r.dateFrom===r.dateTo?fmt(r.dateFrom):fmt(r.dateFrom)+' – '+fmt(r.dateTo)):fmt(String(r.createdAt).slice(0,10));
  const people=(r.lines||[]).reduce((n,l)=>n+Number(l.quantity||0),0);
  return `<div class="item" style="cursor:default">${r.dateFrom?dtile(r.dateFrom):''}<div class="grow"><strong>${esc(r.title)}</strong><small>${esc(reqTypeLabel[r.type]||'')} · ${dates}${people?' · '+people+' personas · '+r.lines.length+' turno'+(r.lines.length>1?'s':''):''}${r.venue?' · '+esc(r.venue):''}</small>${r.managerNote?`<small style="display:block;margin-top:4px">💬 ${esc(r.managerNote)}</small>`:''}</div>${badge(REQ,r.status)}
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
const serviceItem=s=>{const cov=s.positions.filter(p=>p.covered).length;return `<button class="item" data-action="open-service" data-id="${s.id}">${dtile(s.date)}<div class="grow"><strong>${esc(s.name)}</strong><small>${s.ref?esc(s.ref)+' · ':''}${s.date===s.endDate?fmt(s.date):fmt(s.date)+' – '+fmt(s.endDate)}${s.venue?' · '+esc(s.venue):''} · ${cov}/${s.positions.length} puestos cubiertos</small></div>${badge(SST,s.status)}</button>`;};
function servicesPage(){if(detailId)return serviceDetail(detailId);const t=tab||'next';const next=upcoming(),past=S.services.filter(s=>!next.includes(s));const rows=t==='next'?next:past;
 $('#cl-content').innerHTML=`${urgentBox()}<div class="tabs"><button data-action="tab" data-id="next" class="${t==='next'?'on':''}">Próximos<b>${next.length}</b></button><button data-action="tab" data-id="past" class="${t==='past'?'on':''}">Anteriores<b>${past.length}</b></button></div>
 ${rows.length?`<div class="list">${rows.map(serviceItem).join('')}</div>`:`<div class="panel empty"><b>No hay servicios</b>${t==='next'?'Pide un presupuesto y, al aceptarlo, aparecerá aquí.':''}</div>`}`;}
function serviceDetail(id){const s=S.services.find(x=>x.id===id);if(!s){detailId='';return servicesPage();}
 const days=[...new Set(s.positions.map(p=>p.date))].sort();const cov=s.positions.filter(p=>p.covered).length,pres=s.positions.filter(p=>p.present).length;
 const inv=S.invoices.filter(i=>i.serviceId===s.id),q=S.quotes.find(x=>x.serviceId===s.id||x.id===s.quoteId);
 $('#cl-content').innerHTML=`<button class="btn small" data-action="back" style="margin-bottom:12px">← Volver</button>${urgentBox()}
 <section class="panel"><div class="svc-top"><div><span class="cl-eyebrow">${esc(s.ref||'SERVICIO')}</span><h2>${esc(s.name)}</h2><p class="muted" style="margin:4px 0 0">${s.venue?esc(s.venue)+' · ':''}${s.date===s.endDate?longDay(s.date):fmt(s.date)+' – '+fmt(s.endDate)}</p></div><div class="svc-actions">${badge(SST,s.status)}<button class="btn small" data-action="svc-change" data-id="${s.id}">Solicitar un cambio</button>${s.showWorkerNames?'':`<button class="btn small" data-action="svc-names" data-id="${s.id}">Pedir nombres del personal</button>`}</div></div>
  <div class="kv"><div><small>Turnos</small><b>${s.positions.length}</b></div><div><small>Cubiertos</small><b>${cov} / ${s.positions.length}</b></div><div><small>Presentes ahora</small><b>${pres}</b></div><div><small>Coste estimado (IVA incl.)</small><b>${euro(s.estimateTotal)}</b></div>${q?`<div><small>Presupuesto</small><b><a href="#" data-action="open-quote" data-id="${q.id}">${esc(q.number||q.ref)}</a></b></div>`:''}${inv.length?`<div><small>Factura</small><b>${inv.map(i=>`<a href="#" data-action="open-invoice" data-id="${i.id}">${esc(i.number)}</a>`).join(', ')}</b></div>`:''}</div></section>
 <section class="panel"><h3>Personal por día</h3><p class="muted small">${s.showWorkerNames?'Se muestran los nombres del personal a petición tuya.':'Por privacidad no mostramos los nombres del personal. Puedes pedirlos con el botón de arriba.'} El coste por turno es una estimación con tu tarifa; el importe final es el de la factura.</p>
 ${days.length?days.map(d=>{const ps=s.positions.filter(p=>p.date===d);return `<div class="day-group"><h4>${longDay(d)}</h4><table class="cl"><thead><tr><th>Horario</th><th>Perfil</th><th>Tipo de trabajo</th><th>Estado</th>${s.showWorkerNames?'<th>Persona</th>':''}<th class="num">Estimado</th></tr></thead><tbody>${ps.map(p=>`<tr><td><b>${esc(p.start)}–${esc(p.end)}</b>${p.pause?` <small class="muted">pausa ${p.pause} h</small>`:''}</td><td>${esc(p.role)}</td><td>${esc(p.serviceType||'—')}${p.location?' · '+esc(p.location):''}</td><td>${p.present?'<span class="dot ok"></span>Presente':p.covered?'<span class="dot ok"></span>Cubierto':'<span class="dot warn"></span>Asignando'}</td>${s.showWorkerNames?`<td>${esc(p.worker||'—')}</td>`:''}<td class="num">${p.estimate!=null?euro(p.estimate):'—'}</td></tr>`).join('')}</tbody></table></div>`;}).join(''):'<div class="empty">Todavía no hay turnos cargados para este servicio.</div>'}</section>`;}

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
 <section class="doc-parties"><div class="doc-box"><small>${q?'Presupuesto para':'Facturar a'}</small><strong>${esc(c.name||'—')}</strong><p>${c.taxId?'NIF/CIF '+esc(c.taxId)+'<br>':''}${esc(c.address||'')}</p></div>${sv||r.serviceName?`<div class="doc-box"><small>Servicio</small><strong>${esc(sv?.name||r.serviceName)}</strong><p>${sv?esc(sv.venue)+'<br>'+(sv.date===sv.endDate?fmt(sv.date):fmt(sv.date)+' – '+fmt(sv.endDate)):esc(r.serviceVenue||'')}</p></div>`:''}</section>
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
 if(a==='open-service'){page='services';detailId=id;return render();}
 if(a==='open-invoice'){e.preventDefault();page='invoices';detailId=id;return render();}
 if(a==='line-add'){draft.lines.push({...(draft.lines[draft.lines.length-1]||blankLine())});dirty=true;return orderPage();}
 if(a==='line-del'){if(draft.lines.length===1)return toast('El pedido necesita al menos un turno.',true);draft.lines.splice(Number(el.dataset.i),1);dirty=true;return orderPage();}
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
