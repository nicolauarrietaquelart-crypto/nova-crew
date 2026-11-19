'use strict';
(() => {
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',briefcase:'M3 7h18v14H3z M8 7V3h8v4 M3 12a30 30 0 0 0 18 0 M12 10v5',calendar:'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h2 M14 14h2 M8 17h2',file:'M14 2H5v20h14V7z M14 2v5h5 M8 12h8 M8 16h6',folder:'M3 7V4h6l2 3h10v13H3z',wallet:'M3 6h16v4 M3 6v14h18V10H3z M16 14h5',shield:'M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7z M8 12l3 3 5-6',clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',plus:'M12 5v14 M5 12h14',search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',refresh:'M20 7V3l-4 4 M20 7a9 9 0 1 0 1 9 M20 7h-5',close:'M6 6l12 12 M18 6 6 18',arrow:'M5 12h14 M14 7l5 5-5 5',logout:'M9 4H3v16h6 M8 12h13 M16 7l5 5-5 5',menu:'M3 6h18 M3 12h18 M3 18h18',download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',upload:'M12 16V3 M7 8l5-5 5 5 M4 16v5h16v-5',edit:'m16 3 5 5-13 13H3v-5z M13 6l5 5',trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',check:'M5 12l4 4L20 5',chevron:'M9 5l7 7-7 7',left:'M15 5l-7 7 7 7',chart:'M4 3v18h18 M8 16v-5 M13 16V6 M18 16V9',building:'M4 21V3h12v18 M16 10h5v11 M8 7h4 M8 11h4 M8 15h4 M8 21v-3h4v3',info:'M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};
const icon=(n)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]||paths.file}"/></svg>`;
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0),day=()=>new Date().toISOString().slice(0,10),fmt=d=>d?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d.slice(0,10)+'T12:00:00')):'—',stamp=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const statuses={planned:'Planificado',confirmed:'Confirmado',in_progress:'En curso',completed:'Finalizado',cancelled:'Cancelado',pending:'Pendiente',draft:'Borrador',issued:'Emitido',partial:'Cobro parcial',paid:'Pagado',rejected:'Rechazado',accepted:'Aceptado',available:'Disponible',unavailable:'No disponible',overdue:'Vencida'};
const badge=s=>`<span class="badge ${esc(s)}">${esc(statuses[s]||s)}</span>`;
const navs=[['dashboard','Inicio','grid','OPERACIONES'],['quotes','Presupuestos','file'],['services','Servicios','briefcase'],['calendar','Calendario','calendar'],['assignments','Personal asignado','users'],['closed','Servicios finalizados','check'],['workers','Trabajadores','users','PERSONAL'],['clients','Clientes','building'],['documents','Documentación','folder'],['tariffs','Tarifas por categoría','wallet','CONFIGURACIÓN'],['messages','Mensajes','file'],['incidents','Incidencias','info'],['users','Accesos','shield'],['audit','Actividad','clock']];
const descriptions={incidents:'Incidencias comunicadas por los coordinadores y revisión de Gestoría.',messages:'Mensajes privados entre Gestoría y los trabajadores.',orders:'Peticiones, bloques horarios y plazas por cubrir.',closed:'Servicios finalizados y liquidaciones.',tariffs:'Tarifario 2026, precios e incrementos personalizables.',dashboard:'Servicios, personal y asignaciones pendientes.',services:'Crea servicios desde presupuestos y asigna a cada trabajador su categoría.',calendar:'Tu planificación, día a día.',assignments:'Personal, turnos, confirmaciones y fichajes.',workers:'Las personas que hacen que todo funcione.',clients:'Contactos y datos de facturación en un único lugar.',documents:'Contratos y documentación vinculados a cada persona o servicio.',availability:'Consulta y registra la disponibilidad del equipo.',quotes:'Prepara propuestas y conviértelas en servicios.',invoices:'Borradores, emisión, vencimientos y seguimiento de cobros.',expenses:'Costes y gastos asociados a tus operaciones.',users:'Crea accesos y controla qué puede consultar cada persona.',audit:'Historial de las operaciones guardadas en el servidor.',settings:'Datos fiscales, serie de facturación y preferencias.'};
let data={},page='dashboard',query='',filter='',month=day().slice(0,7),polling=false,busy=false;let toastTimer;
const manager=()=>data.user?.role==='manager',isWorker=()=>data.user?.role==='worker';
const list=k=>(data[k]||[]).filter(r=>!r.archived),find=(k,id)=>(data[k]||[]).find(x=>x.id===id),name=(k,id)=>find(k,id)?.name||'—';
async function api(op,body){const r=await fetch('/api/office/'+op,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});let d;try{d=await r.json();}catch{throw new Error('Respuesta del servidor no válida.');}if(!r.ok){if(r.status===401&&data.user){data={};$('#app').hidden=true;$('#auth').hidden=false;await authScreen();}throw new Error(d.error||'No se ha podido completar la operación.');}return d;}
function toast(msg,error=false){clearTimeout(toastTimer);$('#toast').textContent=msg;$('#toast').className='show'+(error?' error-toast':'');toastTimer=setTimeout(()=>$('#toast').className='',5000);}
const button=(action,label,ico='plus',extra='',cls='primary')=>`<button class="btn ${cls}" data-action="${action}" ${extra}>${icon(ico)}${label}</button>`;
const action=(a,label,id,kind='',ico='eye')=>`<button class="icon-btn" title="${esc(label)}" aria-label="${esc(label)}" data-action="${a}" data-id="${esc(id)}" data-kind="${kind}">${icon(ico)}</button>`;
const empty=(title,body,cta='')=>`<div class="empty">${icon('folder')}<h3>${title}</h3><p>${body}</p>${cta}</div>`;
function selectOptions(items,value='',placeholder='Seleccionar…'){return `<option value="">${esc(placeholder)}</option>`+items.map(i=>`<option value="${esc(i.id)}" ${String(i.id)===String(value)?'selected':''}>${esc(i.name)}</option>`).join('');}
const field=(name,label,value='',type='text',attrs='',wide=false)=>`<label class="${wide?'wide':''}">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
const select=(n,label,items,v='',wide=false)=>`<label class="${wide?'wide':''}">${label}<select name="${n}">${selectOptions(items,v)}</select></label>`;
const notes=(v='',label='Notas internas')=>`<label class="wide">${label}<textarea name="notes" maxlength="5000">${esc(v)}</textarea></label>`;
const bool=(name,label,v=true)=>`<label class="checkbox-label wide"><input type="checkbox" name="${name}" ${v?'checked':''}>${label}</label>`;
function formWrap(content,buttonLabel='Guardar',attrs=''){return `<form id="editor" ${attrs}><div class="form-grid">${content}</div><div class="form-error" role="alert" hidden></div><div class="form-footer"><button class="btn" type="button" data-action="close">Cancelar</button><button class="btn primary" type="submit">${buttonLabel}</button></div></form>`;}
function modal(title,html){$('#modal-title').textContent=title;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();const input=$('#modal-content input:not([type=hidden])');if(input)setTimeout(()=>input.focus(),50);}
function formHandler(handler){$('#editor').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,submit=f.querySelector('[type=submit]'),error=f.querySelector('.form-error');submit.disabled=true;error.hidden=true;try{const result=await handler(Object.fromEntries(new FormData(f)),f);$('#modal').close();if(data.user)await load();if(result?.access?.password){modal('Acceso del trabajador creado',`<div class="notice">Estas credenciales solo se muestran una vez. Entrégalas de forma segura al trabajador y pídele que cambie la contraseña inicial.</div><div class="detail-grid"><div><small>Usuario</small><strong>${esc(result.access.username)}</strong></div><div><small>Contraseña temporal</small><strong style="overflow-wrap:anywhere">${esc(result.access.password)}</strong></div></div><div class="form-footer">${button('copy-credentials','Copiar acceso','check',`data-username="${esc(result.access.username)}" data-password="${esc(result.access.password)}"`,'')}<button type="button" class="btn primary" data-action="close">Entendido</button></div>`);}else toast('Cambios guardados');}catch(err){error.hidden=false;error.className='form-error error';error.textContent=err.message;}finally{submit.disabled=false;}};}
async function authScreen(){let status;try{status=await api('status');}catch(e){$('#auth-card').innerHTML=`<div class="error">${esc(e.message)}</div>`;return;}
 const setup=!status.configured;
 $('#auth-card').innerHTML=`<div class="eyebrow">${setup?'PRIMER ACCESO':'BIENVENIDO A NOVA'}</div><h2>${setup?'Crea tu espacio de trabajo':'Entrar en tu cuenta'}</h2><p>${setup?'Crea la primera cuenta de gestor. Después podrás dar acceso a tu equipo.':'Accede a tus servicios, tu equipo y tus operaciones.'}</p>${setup&&!status.setupAvailable?`<div class="notice">${status.setupState==='too_short'?'El secreto NOVA_SETUP_TOKEN ha llegado a Cloudflare, pero tiene menos de 24 caracteres. Actualiza su valor en GitHub con una clave privada de al menos 24 caracteres y ejecuta de nuevo el workflow.':'La clave de instalación todavía no está disponible en este despliegue. Añade NOVA_SETUP_TOKEN en los secretos del repositorio de GitHub y ejecuta de nuevo el workflow.'}</div>`:''}<form id="auth-form">${setup?field('setupToken','Clave de instalación de Cloudflare','','password','required autocomplete="off"')+field('name','Tu nombre','','text','required autocomplete="name"'):''}${field('username','Usuario o correo','','text','required autocomplete="username"')}<label>Contraseña<div class="password-wrap"><input name="password" id="auth-password" type="password" minlength="${setup?12:1}" maxlength="128" required autocomplete="${setup?'new-password':'current-password'}"><button type="button" class="icon-btn" data-action="show-password" aria-label="Mostrar contraseña">${icon('eye')}</button></div></label><div class="form-error" hidden role="alert"></div><button class="btn primary" type="submit" ${setup&&!status.setupAvailable?'disabled':''}>${setup?'Crear cuenta de gestor':'Acceder'}${icon('arrow')}</button></form><p class="footnote">${setup?'Contraseña de al menos 12 caracteres. La clave de instalación solo se utiliza para crear el primer gestor.':'Si has olvidado tu contraseña, solicita al gestor que la restablezca desde Usuarios y accesos.'}</p>`;
 $('#auth-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;const err=f.querySelector('.form-error');err.hidden=true;try{await api(setup?'setup':'login',Object.fromEntries(new FormData(f)));await load();}catch(ex){err.className='form-error error';err.hidden=false;err.textContent=ex.message;}finally{b.disabled=false;}};
}
async function load(){const state=await api('state');if(state.user?.role==='worker'){window.location.replace('/empleado.html');return;}data=state;$('#auth').hidden=true;$('#app').hidden=false;$('#account-name').textContent=data.user.name;$('#account-role').textContent=({manager:'Gestor',coordinator:'Coordinador',worker:'Trabajador'})[data.user.role];$('#avatar').textContent=data.user.name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();$('#workspace-name').textContent='NOVA Crew';$('#sync').innerHTML='<span class="live-dot"></span>Actualizado '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});if(location.hash.startsWith('#/servicio/')){const id=decodeURIComponent(location.hash.slice(11));if(list('services').some(x=>x.id===id)){serviceFocus=id;page='service-workspace'}}renderNav();render();}
function allowed(){return manager()?navs.map(x=>x[0]):isWorker()?['dashboard','services','calendar','assignments','documents','availability']:['dashboard','services','calendar','assignments','workers','documents','availability'];}
function renderNav(){if(page!=='service-workspace'&&!allowed().includes(page))page='dashboard';$('#nav').innerHTML=navs.filter(n=>allowed().includes(n[0])).map(n=>`${n[3]?`<div class="nav-label">${n[3]}</div>`:''}<button data-page="${n[0]}" class="${(page==='service-workspace'?'services':page)===n[0]?'active':''}">${icon(n[2])}${n[1]}</button>`).join('');}
function render(){if(page==='service-workspace')return serviceWorkspacePage();const n=navs.find(n=>n[0]===page);$('#page-title').textContent=isWorker()&&page==='dashboard'?'Mi espacio':n[1];$('#breadcrumb').textContent=n[1];$('#page-description').textContent=descriptions[page];$('#section-label').textContent=manager()?'PANEL DE GESTIÓN':isWorker()?'ÁREA DE TRABAJADOR':'COORDINACIÓN';$('#page-actions').innerHTML=(!isWorker()&&page==='assignments')?button('scan','Escanear QR','shield','',''):'';
 if(page==='tariffs')return tariffGroupsPage();if(page==='incidents')return managerIncidentsPage();if(page==='messages')return managerMessagesPage();if(page==='closed')return closedPage();if(page==='dashboard')return dashboard();if(page==='calendar')return calendar();if(page==='settings')return settingsPage();if(page==='availability')return availabilityPage();if(page==='audit')return auditPage();
 if(manager()&&['tariffs','services','clients','workers','invoices','quotes','expenses','users','assignments','documents'].includes(page)){
 const labels={tariffs:'Nueva categoría',services:'Crear servicio',clients:'Nuevo cliente',workers:'Nuevo trabajador',invoices:'Nueva factura',quotes:'Nuevo presupuesto',expenses:'Nuevo gasto',users:'Crear usuario',assignments:'Asignar personal',documents:'Subir documento'};
 $('#page-actions').innerHTML+=(["workers",'clients'].includes(page)?button('import','Importar CSV','upload','', ''):'')+(page==='services'?button('service-wizard','Crear servicio','plus'):button('new',labels[page],'plus',`data-kind="${page}"`));
 }
 collection();}
function stat(label,value,detail,ico='chart',orange=false){return `<div class="stat ${orange?'orange':''}"><div class="stat-icon">${icon(ico)}</div><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`;}
function dashboard(){
 const services=list('services').filter(s=>!['completed','cancelled'].includes(s.status)),next=services.filter(s=>s.endDate>=day()).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));const a=list('assignments'),open=a.filter(a=>a.checkIn&&!a.checkOut),pending=a.filter(a=>a.status==='pending');let stats;
 if(manager()){
 const unfilled=list('orderLines').filter(l=>!list('assignments').some(a=>a.orderLineId===l.id));
 stats=stat('Servicios activos',services.length,`${next.length} próximos o en curso`,'briefcase',true)+stat('Trabajadores activos',list('workers').filter(w=>w.active).length,'Fichas de personal','users')+stat('Puestos sin cubrir',unfilled.length,'Personal pendiente de asignar','users')+stat('Confirmaciones pendientes',pending.length,'Turnos por confirmar','clock');
 }else stats=stat('Mis servicios',services.length,'Servicios asignados','briefcase',true)+stat('Por confirmar',pending.length,'Asignaciones pendientes','clock')+stat('Entradas abiertas',open.length,'Fichajes sin salida','check')+stat('Mis documentos',list('documents').length,'Documentación disponible','folder');
 const missing=false;const upcoming=next.slice(0,6);
 $('#content').innerHTML=`${missing?`<div class="notice">${icon('info')}Completa los datos de empresa antes de emitir facturas. <button class="text-btn" data-page="settings">Ir a Ajustes</button></div>`:''}<div class="stats">${stats}</div><div class="dashboard-grid"><div class="panel"><div class="panel-head"><div><h3>Próximos servicios</h3><p>Todo listo para la siguiente producción</p></div><button class="text-btn" data-page="services">Ver todos ${icon('arrow')}</button></div>${upcoming.length?upcoming.map(s=>`<div class="list-item"><div class="date-tile">${Number(s.date.slice(8))}<small>${new Date(s.date+'T12:00:00').toLocaleDateString('es-ES',{month:'short'})}</small></div><div class="grow"><p>${esc(s.name)}</p><small>${esc(s.venue)} · ${s.start}–${s.end}</small></div>${badge(s.status)}${action('view','Ver servicio',s.id,'services','chevron')}</div>`).join(''):empty('Sin servicios próximos','Los servicios que organices aparecerán aquí.',manager()?button('service-wizard','Crear servicio','plus'):'')}</div><div><div class="panel"><div class="panel-head"><h3>Control de personal</h3>${icon('users')}</div><div class="list-item"><div class="grow"><p>${pending.length} confirmaciones pendientes</p><small>Revisa las respuestas a las asignaciones</small></div><button class="text-btn" data-page="assignments">Ver</button></div><div class="list-item"><div class="grow"><p>${open.length} fichajes abiertos</p><small>Entradas registradas sin hora de salida</small></div><button class="text-btn" data-page="assignments">Ver</button></div><div class="list-item"><div class="grow"><p>${list('documents').filter(d=>d.expires&&d.expires<=new Date(Date.now()+30*86400000).toISOString().slice(0,10)).length} documentos por revisar</p><small>Caducados o con vencimiento en 30 días</small></div><button class="text-btn" data-page="documents">Ver</button></div></div><div class="panel"><div class="panel-head"><h3>Accesos rápidos</h3></div><div class="list-item">${button('navigate','Planificación','calendar','data-page="calendar"','')}${manager()?button('new','Asignar personal','plus','data-kind="assignments"',''):button('availability','Disponibilidad','calendar','','')}</div></div></div></div>`;
}
function toolbar(rows){return `<div class="toolbar"><div class="searchbox">${icon('search')}<input id="search" aria-label="Buscar registros" placeholder="Buscar…" value="${esc(query)}"></div><select id="filter" aria-label="Filtrar estado"><option value="">Todos los estados</option>${Object.entries(statuses).map(([v,l])=>`<option value="${v}" ${filter===v?'selected':''}>${l}</option>`).join('')}</select><span class="record-count">${rows.length} registros</span>${manager()?button('export','Exportar','download','',' small'):''}</div>`;}
function filtered(kind){return list(kind).filter(r=>!filter||r.status===filter||r.type===filter||(['workers','clients','users'].includes(kind)&&(r.active===false?'unavailable':'available')===filter)||(filter==='overdue'&&((kind==='invoices'&&r.status!=='draft'&&r.paid<r.total&&r.dueDate<day())||(kind==='documents'&&r.expires&&r.expires<day())))).filter(r=>!query||[...Object.values(r).filter(v=>typeof v==='string'),name('clients',r.clientId),name('workers',r.workerId),name('services',r.serviceId)].join(' ').toLowerCase().includes(query.toLowerCase()));}
function rowActions(r,kind){return `<div class="row-actions">${action('view','Ver detalle',r.id,kind)}${manager()&&(!['invoices','quotes'].includes(kind)||r.status==='draft')?action('edit','Editar',r.id,kind,'edit'):''}</div>`;}
function table(headers,rows){return `<div class="panel"><div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`;}


function managerIncidentsPage(){
 const records=list('incidents').sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 $('#page-actions').innerHTML='';
 $('#content').innerHTML=table(['Servicio','Trabajador','Incidencia','Estado',''],records.map(i=>'<tr><td>'+esc(name('services',i.serviceId))+'</td><td>'+esc(name('workers',i.workerId))+'</td><td>'+esc(i.description)+'<small>'+esc(i.createdAt.slice(0,16).replace('T',' '))+'</small></td><td>'+esc(i.status==='resolved'?'Resuelta':'Pendiente')+'</td><td>'+(i.status==='resolved'?'':button('incident-resolve','Resolver','check','data-id="'+esc(i.id)+'"',''))+'</td></tr>').join(''));
}
function managerMessagesPage(){
 const msgs=list('messages').sort((a,b)=>a.createdAt.localeCompare(b.createdAt)),userName=id=>name('users',id);
 const candidates=list('users').filter(u=>u.active&&u.role!=='manager');
 $('#page-actions').innerHTML='';
 const html=boxMessages(msgs,userName)+
 '<form id="manager-message-form" class="panel" style="display:grid;gap:12px"><h3>Enviar mensaje</h3>'+
 '<label>Trabajador<select name="recipientId" required>'+selectOptions(candidates.map(u=>({id:u.id,name:u.name})))+'</select></label>'+
 '<label>Mensaje<textarea name="content" maxlength="2000" required></textarea></label>'+
 '<button type="submit" class="btn primary">Enviar mensaje</button></form>';
 $('#content').innerHTML=html;
 $('#manager-message-form').onsubmit=async ev=>{ev.preventDefault();try{await api('message-send',Object.fromEntries(new FormData(ev.target)));await load();toast('Mensaje enviado')}catch(e){toast(e.message,true)}};
}
function boxMessages(msgs,userName){
 return '<section class="panel"><div class="panel-head"><h3>Conversaciones recientes</h3></div>'+
 (msgs.length?msgs.slice(-100).map(m=>'<div class="list-item"><div class="grow"><strong>'+esc(userName(m.senderId))+' → '+esc(userName(m.recipientId))+'</strong><small>'+esc(m.createdAt.slice(0,16).replace('T',' '))+'</small><p>'+esc(m.content)+'</p></div></div>').join(''):'<p class="footnote">No hay mensajes todavía.</p>')+'</section>';
}



function tariffGroupsPage(){
 const rates=filtered('tariffs'),schedules=[...new Set(rates.map(r=>r.schedule||'Tarifa estándar 2026'))];
 $('#page-actions').innerHTML=button('tariff-new-schedule','Nueva tarifa','plus')+button('new','Añadir categoría','plus','data-kind="tariffs"','');
 $('#content').innerHTML='<p class="footnote">Cada tarifa contiene sus categorías, como HAND B, HAND A, Crew Head o Forklifter. Los precios y mínimos se editan por categoría.</p>'+
 schedules.map(schedule=>{
 const cats=rates.filter(t=>(t.schedule||'Tarifa estándar 2026')===schedule),groups=[...new Set(cats.map(c=>c.group||'Personalizado'))];
 return '<section class="panel tariff-schedule"><header><h3>'+esc(schedule)+'</h3><small>'+cats.length+' categorías</small></header>'+
 groups.map(group=>'<details class="tariff-group" open><summary class="tariff-group-head"><strong>'+esc(group)+'</strong><span>'+cats.filter(c=>(c.group||'Personalizado')===group).length+' categorías</span></summary>'+
 '<div class="table-wrap"><table><thead><tr><th>Categoría</th><th>Pago bruto</th><th>Tarifa cliente</th><th>Mínimo</th><th></th></tr></thead><tbody>'+
 cats.filter(c=>(c.group||'Personalizado')===group).map(t=>'<tr><td><strong>'+esc(t.name)+'</strong><small>'+esc(t.unit==='day'?'Por jornada':'Por hora')+'</small></td><td>'+(t.workerRate==null?'Por definir':euro(t.workerRate))+'</td><td>'+(t.clientRate==null?'Por definir':euro(t.clientRate))+'</td><td>'+esc(t.minHours)+' h</td><td>'+action('edit','Editar categoría',t.id,'tariffs','edit')+'</td></tr>').join('')+'</tbody></table></div></details>').join('')+'</section>';
 }).join('');
}
function newTariffSchedule(){
 const sources=[...new Set(list('tariffs').map(t=>t.schedule||'Tarifa estándar 2026'))];
 modal('Nueva tarifa',formWrap(field('name','Nombre de la tarifa','','text','required',true)+select('source','Copiar las categorías de',sources.map(name=>({id:name,name})),sources[0]),'Crear tarifa'));
 formHandler(b=>api('tariff-schedule-create',b));
}
let wizardPositions=[];
function wizardPositionRow(p={},index=0){
 const tariffs=list('tariffs').filter(t=>t.active),workers=list('workers').filter(w=>w.active);
 const f=(key,label,value='',type='text')=>'<label>'+label+'<input data-position="'+key+'" type="'+type+'" value="'+esc(value)+'"></label>';
 return '<section class="position-row" data-position-index="'+index+'"><header><strong>Puesto '+(index+1)+'</strong><button type="button" data-action="wizard-remove-position" data-index="'+index+'" class="btn">Eliminar</button></header><div class="form-grid">'+
 '<label>Categoría individual<select data-position="categoryId" required>'+selectOptions(tariffs.map(t=>({id:t.id,name:(t.schedule||'Tarifa estándar 2026')+' · '+t.name})),p.categoryId)+'</select></label>'+
 '<label>Trabajador (opcional)<select data-position="workerId">'+selectOptions(workers.map(w=>({id:w.id,name:w.name})),p.workerId,'Dejar sin asignar')+'</select></label>'+
 f('serviceType','Tipo de servicio',p.serviceType||'Montaje')+f('team','Equipo / escenario',p.team)+
 f('date','Fecha',p.date||'','date')+f('start','Inicio',p.start||'','time')+
 f('endDate','Fecha de fin',p.endDate||'','date')+f('end','Fin',p.end||'','time')+
 f('pause','Pausa (h)',p.pause??0,'number')+'</div></section>';
}
function wizardRows(){
 const root=$('#wizard-positions');if(root)root.innerHTML=wizardPositions.map(wizardPositionRow).join('');
}
function captureWizardPositions(){
 const nodes=$('#wizard-positions .position-row');
 wizardPositions=nodes.map(el=>Object.fromEntries([...el.querySelectorAll('[data-position]')].map(input=>[input.dataset.position,input.value])));
}
function serviceWizard(quoteId=''){
 const quote=quoteId?find('quotes',quoteId):null,clients=list('clients').filter(c=>c.active),coordinators=list('users').filter(u=>u.active&&(u.workerId||u.role==='manager'));
 wizardPositions=[{}];
 const eligible=list('quotes').filter(q=>['issued','accepted'].includes(q.status)&&(!q.serviceId||q.id===quoteId));
 const body='<form id="service-wizard-form"><div class="notice">Crea un servicio y sus puestos en un solo paso. Cada trabajador tiene categoría, horario y equipo propios.</div>'+
 '<div class="form-grid"><label class="wide">Presupuesto existente (opcional)<select name="quoteId" id="wizard-quote">'+selectOptions(eligible.map(q=>({id:q.id,name:(q.number||'Presupuesto')+' · '+name('clients',q.clientId)})),quoteId,'Crear sin presupuesto')+'</select></label>'+
 field('name','Nombre del servicio','','text','required',true)+
 select('clientId','Cliente',clients,quote?.clientId)+field('venue','Recinto / ubicación','','text','required')+
 field('date','Fecha',day(),'date','required')+field('start','Inicio','08:00','time','required')+
 field('endDate','Fecha de fin',day(),'date','required')+field('end','Fin','18:00','time','required')+
 select('coordinatorId','Trabajador que coordina',coordinators,'')+'</div>'+
 '<div class="subhead"><h3>Puestos de trabajo</h3>'+button('wizard-add-position','Añadir puesto','plus','type="button"','')+'</div>'+
 '<div id="wizard-positions"></div><div class="form-error" role="alert" hidden></div><div class="form-footer"><button type="button" class="btn" data-action="close">Cancelar</button><button class="btn primary" type="submit">Crear servicio</button></div></form>';
 modal('Crear servicio',body);wizardRows();
 $('#wizard-quote').onchange=()=>{const q=find('quotes',$('#wizard-quote').value);if(q)$('#service-wizard-form [name=clientId]').value=q.clientId;};
 const form=$('#service-wizard-form');
 form.onsubmit=async e=>{
 e.preventDefault();const submit=form.querySelector('[type=submit]'),err=form.querySelector('.form-error');
 err.hidden=true;captureWizardPositions();
 try{
  const b=Object.fromEntries(new FormData(form)),positions=wizardPositions.filter(p=>p.categoryId);
  if(wizardPositions.some(p=>!p.categoryId))throw Error('Elige una categoría para cada puesto, o elimina los puestos vacíos.');
  submit.disabled=true;
  const result=await api('service-create',{quoteId:b.quoteId,service:b,positions});
  $('#modal').close();page='services';query='';filter='';await load();detail('services',result.record.id);
  toast('Servicio creado con '+positions.length+' puestos individuales');
 }catch(ex){err.className='form-error error';err.textContent=ex.message;err.hidden=false}finally{submit.disabled=false}
 };
}


let serviceFocus='',serviceTab='planning',blockCategoryRows=[{categoryId:'',quantity:1}],blockEditorId='',blockEditorService='';
function openServicePage(id){
 if(!find('services',id))return toast('Servicio no encontrado',true);
 serviceFocus=id;serviceTab='planning';page='service-workspace';query='';filter='';
 history.replaceState(null,'','#/servicio/'+encodeURIComponent(id));
 renderNav();serviceWorkspacePage();
}
function servicePlaceName(id){return list('servicePlaces').find(x=>x.id===id)?.name||'Ubicación general'}
function serviceRows(){
 const sv=find('services',serviceFocus),days=list('serviceDays').filter(x=>x.serviceId===serviceFocus),
 blocks=list('serviceBlocks').filter(x=>x.serviceId===serviceFocus),places=list('servicePlaces').filter(x=>x.serviceId===serviceFocus),
 coordinators=list('serviceCoordinators').filter(x=>x.serviceId===serviceFocus),
 positions=list('orderLines').filter(x=>x.serviceId===serviceFocus&&x.status!=='cancelled'),
 assigned=list('assignments').filter(x=>x.serviceId===serviceFocus);
 return {sv,days,blocks,places,coordinators,positions,assigned};
}
function servicePostTable(posts,assignments){
 if(!posts.length)return '<div class="empty">Todavía no hay puestos en este bloque.</div>';
 return '<div class="table-wrap"><table><thead><tr><th>Categoría</th><th>Trabajador</th><th>Equipo / Horario</th><th></th></tr></thead><tbody>'+
 posts.map(p=>{
   const a=assignments.find(x=>x.orderLineId===p.id&&!x.archived);
   return '<tr><td><strong>'+esc(p.role)+'</strong><small>'+esc(p.serviceType||'')+'</small></td>'+
   '<td>'+(a?esc(name('workers',a.workerId)):'<span class="unfilled-tag">Sin cubrir</span>')+'</td>'+
   '<td>'+esc(p.team||'—')+'<small>'+esc(p.start)+'–'+esc(p.end)+'</small></td><td><div class="row-actions">'+
   (a?action('view','Ver trabajador',a.id,'assignments'):button('assign-slot','Asignar','plus','data-id="'+esc(p.id)+'"',''))+
   action('edit','Editar puesto',p.id,'orderLines','edit')+'</div></td></tr>';
 }).join('')+'</tbody></table></div>';
}
function serviceWorkspacePage(){
 const {sv,days,blocks,places,coordinators,positions,assigned}=serviceRows();
 if(!sv){page='services';return render()}
 $('#page-title').textContent=sv.name;$('#breadcrumb').textContent='Servicios / '+sv.name;
 $('#section-label').textContent='SERVICIO · '+esc(sv.status||'');
 $('#page-description').textContent=fmt(sv.date)+' – '+fmt(sv.endDate)+' · '+sv.venue;
 $('#page-actions').innerHTML=button('service-back','Volver a servicios','left','','')+
 button('edit','Editar servicio','edit','data-kind="services" data-id="'+esc(sv.id)+'"','');
 const totalUnfilled=positions.filter(p=>!assigned.some(a=>a.orderLineId===p.id&&!a.archived)).length;
 const menu=[['planning','Jornadas y horarios'],['staff','Personal'],['places','Ubicaciones'],['coordinators','Coordinadores']];
 const nav='<div class="service-workspace-nav">'+menu.map(([k,label])=>'<button class="'+(serviceTab===k?'selected':'')+'" type="button" data-action="service-tab" data-tab="'+k+'">'+label+'</button>').join('')+'</div>';
 const top='<div class="service-overview"><div><span class="eyebrow">SERVICIO</span><h2>'+esc(sv.name)+'</h2><p>'+esc(name('clients',sv.clientId))+' · '+esc(sv.venue)+'</p>'+
 '<div class="service-meta">'+badge(sv.status)+'<span>'+fmt(sv.date)+' — '+fmt(sv.endDate)+'</span></div></div>'+
 '<div class="service-metrics"><div><strong>'+positions.length+'</strong><small>Puestos</small></div><div><strong>'+assigned.length+'</strong><small>Asignados</small></div><div><strong>'+totalUnfilled+'</strong><small>Sin cubrir</small></div><div><strong>'+places.length+'</strong><small>Ubicaciones</small></div></div></div>';
 let body='';
 if(serviceTab==='planning'){
  const allDates=[...new Set([sv.date,...days.map(d=>d.date),...blocks.map(b=>b.date),...positions.map(l=>l.date)].filter(Boolean))].sort();
  body='<div class="service-section-header"><div><h3>Jornadas y tipos de servicio</h3><p>Crea jornadas, añade horarios y organiza diferentes equipos en cada ubicación.</p></div>'+
   button('service-day-new','Añadir jornada','plus','','')+'</div>'+
   allDates.map(date=>{
    const blocksOn=blocks.filter(b=>b.date===date).sort((a,b)=>a.start.localeCompare(b.start)),
    legacy=positions.filter(p=>p.date===date&&!p.blockId);
    const dayRecord=days.find(d=>d.date===date);
    return '<section class="service-day-panel"><header><div><span class="eyebrow">JORNADA</span><h3>'+fmt(date)+'</h3><small>'+esc(dayRecord?.name||'Planificación del día')+'</small></div>'+
    '<div class="service-day-actions">'+button('service-block-new','Añadir tipo / horario','plus','data-date="'+date+'"','')+
    (dayRecord?button('service-day-edit','Editar jornada','edit','data-id="'+esc(dayRecord.id)+'"',''):'')+'</div></header>'+
    blocksOn.map(block=>{
     const posts=positions.filter(p=>p.blockId===block.id);
     return '<article class="service-block"><div class="service-block-heading"><div><span class="eyebrow">'+esc(block.start)+' – '+esc(block.end)+'</span><h4>'+esc(block.serviceType)+'</h4>'+
     '<p>'+esc(block.team||'Sin equipo')+' · '+esc(servicePlaceName(block.placeId))+
     (block.coordinatorId?' · Coord.: '+esc(name('users',block.coordinatorId)):'')+'</p></div>'+
     '<div class="service-block-tools">'+button('service-block-add-positions','Añadir puestos','plus','data-id="'+esc(block.id)+'"','')+
     button('service-block-edit','Editar bloque','edit','data-id="'+esc(block.id)+'"','')+
     button('service-block-remove','Eliminar bloque','trash','data-id="'+esc(block.id)+'"','')+'</div></div>'+
     servicePostTable(posts,assigned)+'</article>';
    }).join('')+
    (legacy.length?'<article class="service-block"><div class="service-block-heading"><div><h4>Puestos existentes</h4><p>Asignaciones anteriores no agrupadas por bloque</p></div></div>'+servicePostTable(legacy,assigned)+'</article>':'')+
    (!blocksOn.length&&!legacy.length?'<p class="service-empty">Todavía no hay horarios para esta jornada.</p>':'')+
    '</section>';
   }).join('');
 }else if(serviceTab==='staff'){
  body='<div class="service-section-header"><div><h3>Personal del servicio</h3><p>Asigna cada trabajador a un puesto y categoría concreta.</p></div>'+
  button('service-block-new','Crear bloque de personal','plus','','')+'</div>'+
  (positions.length?servicePostTable(positions,assigned):'<div class="panel empty">Añade primero un bloque de horario y sus puestos.</div>');
 }else if(serviceTab==='places'){
  body='<div class="service-section-header"><div><h3>Ubicaciones</h3><p>Puedes tener varios recintos, escenarios o puntos de encuentro en un mismo servicio.</p></div>'+
  button('service-place-new','Nueva ubicación','plus','','')+'</div>'+
  (places.length?'<div class="service-place-grid">'+places.map(p=>{
   const mapsLink=p.mapsUrl||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([p.name,p.address].filter(Boolean).join(', '));
   const src='https://www.google.com/maps?q='+encodeURIComponent(p.lat!=null?p.lat+','+p.lng:(p.address||p.name))+'&output=embed';
   return '<section class="service-place-card"><div><h4>'+esc(p.name)+'</h4><p>'+esc(p.address||'Sin dirección')+'</p>'+
   '<small>'+esc(p.lat!=null?'Radio de fichaje: '+p.radiusMeters+' m · Coordenadas configuradas':'Sin geolocalización configurada')+'</small></div>'+
   '<div class="service-place-actions"><a href="'+esc(mapsLink)+'" target="_blank" rel="noopener noreferrer">Abrir Google Maps</a>'+
   button('service-place-edit','Editar','edit','data-id="'+esc(p.id)+'"','')+
   button('service-place-remove','Eliminar','trash','data-id="'+esc(p.id)+'"','')+'</div>'+
   '<details><summary>Ver mapa</summary><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa de '+esc(p.name)+'" src="'+esc(src)+'"></iframe></details></section>';
  }).join('')+'</div>':'<div class="panel empty">Añade tu primera ubicación. Puedes buscarla en Google Maps y guardar sus datos.</div>');
 }else{
  const allUsers=list('users').filter(u=>u.active);
  body='<div class="service-section-header"><div><h3>Coordinación</h3><p>Asigna varios coordinadores al mismo servicio. También puedes asignar uno por bloque.</p></div>'+
   button('service-coordinator-new','Añadir coordinador','plus','','')+'</div>'+
   '<div class="panel"><div class="list-item"><span class="grow">Coordinador principal</span><strong>'+esc(name('users',sv.coordinatorId))+'</strong>'+
   button('edit','Cambiar','edit','data-kind="services" data-id="'+esc(sv.id)+'"','')+'</div>'+
   coordinators.map(c=>'<div class="list-item"><div class="grow"><strong>'+esc(name('users',c.userId))+'</strong><small>Coordinador adicional</small></div>'+
    button('service-coordinator-remove','Quitar','trash','data-id="'+esc(c.id)+'"','')+'</div>').join('')+'</div>';
 }
 $('#content').innerHTML=top+nav+body;
}
function serviceDayEditor(id=''){
 const old=find('serviceDays',id),sv=find('services',serviceFocus);
 const form=field('date','Día',old?.date||sv.date,'date','required')+
 field('name','Nombre de la jornada',old?.name||'Jornada')+
 notes(old?.notes||'','Observaciones');
 modal(old?'Editar jornada':'Añadir jornada',formWrap(form));
 formHandler(b=>api('service-day-save',{record:{...b,serviceId:serviceFocus,...(old?{id:old.id,revision:old.revision}:{})}}));
}
function servicePlaceEditor(id=''){
 const old=find('servicePlaces',id);
 const content=field('name','Nombre de la ubicación',old?.name||'','text','required',true)+
 field('address','Dirección o punto de encuentro',old?.address||'','text','',true)+
 field('mapsUrl','Enlace de Google Maps (opcional)',old?.mapsUrl||'','url','placeholder="https://www.google.com/maps/..."',true)+
 field('lat','Latitud para fichaje (opcional)',old?.lat??'','number','step="any" min="-90" max="90"')+
 field('lng','Longitud para fichaje (opcional)',old?.lng??'','number','step="any" min="-180" max="180"')+
 field('radiusMeters','Radio de fichaje (m)',old?.radiusMeters||500,'number','min="100" max="5000"')+
 '<p class="footnote wide">Busca la ubicación en Google Maps, copia el enlace y pégalo aquí. Si el enlace incluye coordenadas se completarán automáticamente; si es corto, puedes introducirlas manualmente. No se solicita acceso a tu cuenta Google.</p>'+
 '<div class="wide">'+button('service-maps-search','Buscar en Google Maps','search','','')+'</div>';
 modal(old?'Editar ubicación':'Añadir ubicación',formWrap(content));
 const link=$('#editor [name=mapsUrl]');
 link.addEventListener('change',()=>{
  const m=link.value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)||link.value.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if(m){$('#editor [name=lat]').value=m[1];$('#editor [name=lng]').value=m[2];}
 });
 formHandler(b=>api('service-place-save',{record:{...b,serviceId:serviceFocus,...(old?{id:old.id,revision:old.revision}:{})}}));
}
function serviceBlockCategoryField(c={},i=0){
 return '<div class="block-category-row" data-category-index="'+i+'">'+
 '<label>Categoría<select data-cat="categoryId" required>'+selectOptions(list('tariffs').filter(t=>t.active).map(t=>({id:t.id,name:(t.schedule||'Tarifa estándar 2026')+' · '+t.name})),c.categoryId)+'</select></label>'+
 '<label>N.º trabajadores<input data-cat="quantity" type="number" min="1" max="200" step="1" value="'+esc(c.quantity||1)+'"></label>'+
 '<button type="button" class="btn" data-action="block-category-remove" data-index="'+i+'">Quitar</button></div>';
}
function captureBlockCategories(){
 const root=$('#block-categories');if(!root)return;
 blockCategoryRows=[...root.querySelectorAll('.block-category-row')].map(row=>Object.fromEntries([...row.querySelectorAll('[data-cat]')].map(el=>[el.dataset.cat,el.value])));
}
function drawBlockCategories(){
 const root=$('#block-categories');if(root)root.innerHTML=blockCategoryRows.map(serviceBlockCategoryField).join('');
}
function serviceBlockEditor(id='',preDate=''){
 const old=find('serviceBlocks',id),sv=find('services',serviceFocus),places=list('servicePlaces').filter(p=>p.serviceId===serviceFocus),
 coordinators=list('users').filter(u=>u.active&&(u.workerId||u.role==='manager'));
 blockEditorId=id;blockEditorService=serviceFocus;blockCategoryRows=[{categoryId:'',quantity:1}];
 const fields=field('serviceType','Tipo de servicio (LOAD IN, SHOW CALL...)',old?.serviceType||'LOAD IN','text','required',true)+
 field('date','Fecha inicio',old?.date||preDate||sv.date,'date','required')+
 field('start','Hora inicio',old?.start||'08:00','time','required')+
 field('endDate','Fecha fin',old?.endDate||preDate||sv.date,'date','required')+
 field('end','Hora fin',old?.end||'18:00','time','required')+
 select('placeId','Ubicación',places.map(p=>({id:p.id,name:p.name})),old?.placeId||'')+
 select('coordinatorId','Coordinador de este bloque',coordinators,old?.coordinatorId||'')+
 field('team','Equipo / escenario',old?.team||'')+
 (!old?field('pause','Pausa prevista (h)',0,'number','min="0" max="24" step="0.5"'):'')+
 notes(old?.notes||'','Notas de producción')+
 (!old?'<div class="wide"><div class="subhead"><h3>Categorías y trabajadores requeridos</h3>'+
 button('block-category-add','Añadir categoría','plus','type="button"','')+'</div><div id="block-categories"></div></div>':'');
 modal(old?'Editar tipo de servicio':'Añadir tipo de servicio y horario',formWrap(fields,old?'Guardar cambios':'Crear bloque y puestos'));
 if(!old)drawBlockCategories();
 formHandler(async b=>{
  if(!old){captureBlockCategories();if(!blockCategoryRows.length||blockCategoryRows.some(x=>!x.categoryId))throw Error('Selecciona las categorías del bloque.');}
  return api('service-block-save',{record:{...b,serviceId:serviceFocus,...(old?{id:old.id,revision:old.revision}:{})},
    ...(!old?{categories:blockCategoryRows}:{})});
 });
}
function blockAddCategories(id){
 const block=find('serviceBlocks',id);if(!block)return;
 blockEditorId=id;blockCategoryRows=[{categoryId:'',quantity:1}];
 modal('Añadir personal · '+block.serviceType,formWrap('<div class="wide"><div class="subhead"><h3>Puestos individuales por categoría</h3>'+
 button('block-category-add','Añadir categoría','plus','type="button"','')+'</div><div id="block-categories"></div></div>','Crear puestos'));
 drawBlockCategories();
 formHandler(async()=>{
  captureBlockCategories();if(!blockCategoryRows.length||blockCategoryRows.some(x=>!x.categoryId))throw Error('Selecciona al menos una categoría.');
  return api('service-block-add-positions',{blockId:block.id,categories:blockCategoryRows});
 });
}
function serviceCoordinatorEditor(){
 const all=list('users').filter(u=>u.active&&(u.workerId||u.role==='manager'));
 modal('Añadir coordinador',formWrap(select('userId','Trabajador que coordinará',all,'',true),'Asignar coordinador'));
 formHandler(b=>api('service-coordinator-save',{record:{serviceId:serviceFocus,userId:b.userId}}));
}
function confirmServiceAction(type,id){
 const conf={
  place:{kind:'servicePlaces',label:'ubicación',op:'service-place-delete'},
  day:{kind:'serviceDays',label:'jornada',op:'service-day-delete'},
  block:{kind:'serviceBlocks',label:'bloque de servicio',op:'service-block-delete'},
  coordinator:{kind:'serviceCoordinators',label:'coordinador',op:'service-coordinator-delete'}
 }[type];if(!conf)return;
 const record=find(conf.kind,id);if(!record)return;
 modal('Eliminar '+conf.label,'<p>¿Quieres quitar este elemento? Si tiene trabajadores o puestos vinculados, el servidor impedirá eliminarlo.</p>'+
 '<div class="form-footer">'+button('close','Cancelar','close','','')+
 button('service-remove-confirm','Eliminar','trash','data-delete-type="'+type+'" data-id="'+esc(id)+'"','danger')+'</div>');
}

function ordersPage(){
 const slots=list('orderLines'),assigned=list('assignments');
 $('#page-actions').innerHTML=button('new','Nueva plaza','plus','data-kind="orderLines"')+button('service-wizard','Crear servicio','plus','data-kind="services"','');
 $('#content').innerHTML='<div class="notice">Cada fila es una plaza individual de una petición. Puede quedar sin cubrir y asignarse después. Los importes de categorías pendientes deben configurarse antes de facturar.</div>'+table(['Servicio','Día / Turno','Categoría / Tipo','Trabajador','Acciones'],slots.filter(l=>l.status!=='cancelled').map(l=>{
 const a=assigned.find(a=>a.orderLineId===l.id&&!a.archived);
 return '<tr><td><strong>'+esc(name('services',l.serviceId))+'</strong></td><td>'+esc(l.date)+' '+esc(l.start)+'–'+esc(l.end)+'</td><td>'+esc(l.role)+'<small>'+esc(l.serviceType)+' · '+esc(l.team)+'</small></td><td>'+(a?esc(name('workers',a.workerId)):'<strong>Por cubrir</strong>')+'</td><td><div class="row-actions">'+(a?action('view','Ver trabajador',a.id,'assignments'):button('assign-slot','Asignar trabajador','plus','data-id="'+esc(l.id)+'"',''))+action('edit','Editar plaza',l.id,'orderLines','edit')+'</div></td></tr>';
 }));
}
function closedPage(){
 const services=list('services').filter(s=>['completed','cancelled'].includes(s.status)).sort((a,b)=>b.date.localeCompare(a.date));
 $('#page-actions').innerHTML='';
 $('#content').innerHTML=table(['Servicio','Cliente','Fecha','Liquidación',''],services.map(s=>'<tr><td><strong>'+esc(s.name)+'</strong></td><td>'+esc(name('clients',s.clientId))+'</td><td>'+esc(s.date)+'</td><td>'+(s.settlementStatus==='confirmed'?'Confirmada · '+euro(s.settlementCost):'Pendiente')+'</td><td>'+action('view','Ver servicio',s.id,'services')+'</td></tr>'));
}

function collection(){const rows=filtered(page);let html='';const tr=c=>`<tr>${c.map(s=>`<td>${s}</td>`).join('')}</tr>`;
 if(page==='tariffs')html=table(['Categoría','Grupo / Unidad','Pago bruto','Cliente','Mínimo',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong><small>${esc(r.id)}</small>`,esc(r.group)+'<small>'+esc(r.unit==='day'?'Por show/día':'Por hora')+'</small>',r.workerRate==null?'Pendiente':euro(r.workerRate),r.clientRate==null?'Pendiente':euro(r.clientRate),r.minHours+' h',action('edit','Modificar tarifa',r.id,'tariffs','edit')])));
  if(['clients','workers'].includes(page))html=table([page==='workers'?'Trabajador':'Cliente','Contacto',page==='workers'?'Especialidad':'NIF','Estado',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong><small>${esc(r.email)}</small>`,esc(r.phone||'—'),esc(page==='workers'?r.specialty:r.taxId),badge(r.active===false?'unavailable':'available'),rowActions(r,page)])));
 if(page==='services')html=table(['Servicio','Cliente / Recinto','Fecha','Personal','Estado',''],rows.map(r=>tr([`<button class="service-title-link" data-action="open-service" data-id="${esc(r.id)}">${esc(r.name)}</button><small>${r.start}–${r.end}</small>`,`${manager()?esc(name('clients',r.clientId))+'<small>':''}${esc(r.venue)}${manager()?'</small>':''}`,fmt(r.date),`${list('assignments').filter(a=>a.serviceId===r.id&&a.status!=='rejected').length}${manager()?' / '+r.required:''}`,badge(r.status),rowActions(r,page)])));
 if(page==='assignments')html=table(['Trabajador / Servicio','Horario','Equipo','Confirmación','Entrada / Salida',''],rows.map(r=>tr([`<strong>${esc(name('workers',r.workerId))}</strong><small>${esc(name('services',r.serviceId))}</small>`,`${fmt(r.date)}<small>${r.start}–${r.end} · ${r.hours} h</small>`,`${esc(r.team||'—')}<small>${esc(r.role)}</small>`,badge(r.status),`${stamp(r.checkIn)}<small>${stamp(r.checkOut)}</small>`,rowActions(r,page)])));
 if(['quotes','invoices'].includes(page))html=table(['Documento','Cliente','Fecha / Vencimiento','Total','Pendiente','Estado',''],rows.map(r=>tr([`<strong>${esc(r.number||'Borrador')}</strong><small>${esc(name('services',r.serviceId))}</small>`,esc(name('clients',r.clientId)),`${fmt(r.date)}<small>${fmt(r.dueDate)}</small>`,euro(r.total),page==='invoices'?euro(r.total-r.paid):'—',badge(page==='invoices'&&r.status!=='draft'&&r.paid<r.total&&r.dueDate<day()?'overdue':r.status),rowActions(r,page)])));
 if(page==='expenses')html=table(['Concepto','Proveedor','Fecha','Servicio','Importe','Estado',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong>`,esc(r.supplier),fmt(r.date),esc(name('services',r.serviceId)),euro(r.amount),badge(r.status),rowActions(r,page)])));
 if(page==='users')html=table(['Usuario','Nombre','Acceso','Trabajador','Estado',''],rows.map(r=>tr([`<strong>${esc(r.username)}</strong>`,esc(r.name),esc(({manager:'Gestor',coordinator:'Coordinador',worker:'Trabajador'})[r.role]),esc(name('workers',r.workerId)),badge(r.active?'available':'unavailable'),rowActions(r,page)])));
 if(page==='documents')html=table(['Documento','Trabajador / Cliente','Tipo','Subido','Caducidad',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong><small>${(r.size/1024).toFixed(0)} KB</small>`,`${esc(name('workers',r.workerId))}<small>${esc(name('clients',r.clientId))}</small>`,esc(r.type),fmt(r.createdAt),r.expires?`${fmt(r.expires)} ${r.expires<day()?badge('overdue'):''}`:'—',`<a class="icon-btn" href="/api/office/document?id=${encodeURIComponent(r.id)}" title="Descargar" aria-label="Descargar ${esc(r.name)}">${icon('download')}</a>`])));
 $('#content').innerHTML=toolbar(rows)+(rows.length?html:`<div class="panel">${empty(query||filter?'Sin resultados':'Todavía no hay registros',query||filter?'Prueba con otra búsqueda o cambia el filtro.':'Empieza añadiendo tu primer registro. Se guardará en tu espacio de trabajo.')}</div>`);
 const input=$('#search');input.oninput=()=>{query=input.value;const p=input.selectionStart;collection();$('#search').focus();$('#search').setSelectionRange(p,p);};$('#filter').onchange=e=>{filter=e.target.value;collection();};
}
function editor(kind,id='',preset={}){
 const r={...(id?find(kind,id):{}),...preset};let fields='';const amount=(n,l,v=0)=>field(n,l,v,'number','min="0" step="0.01"');
 if(kind==='tariffs')fields=field('schedule','Tarifa',r.schedule||'Tarifa estándar 2026','text','required')+field('id','Código único de categoría',r.id||'','text',id?'readonly':'required pattern="[A-Za-z0-9_ -]{2,80}"')+field('name','Categoría',r.name||'','text','required',true)+field('group','Grupo',r.group||'Personalizado')+select('unit','Unidad',[{id:'hour',name:'Hora'},{id:'day',name:'Show / Día'}],r.unit||'hour')+amount('minHours','Mínimo (horas)',r.minHours??0)+field('workerRate','Pago bruto trabajador (€ por unidad)',r.workerRate??'','number','min="0" step="0.01"')+field('clientRate','Tarifa cliente (€ por unidad)',r.clientRate??'','number','min="0" step="0.01"')+amount('incrementPercent','Incremento trabajador y cliente (%)',r.incrementPercent??0)+bool('active','Categoría activa',r.active!==false)+notes(r.notes,'Notas y condiciones');
  if(kind==='orderLines')fields=select('serviceId','Servicio',list('services').filter(s=>s.status!=='cancelled'&&s.settlementStatus!=='confirmed'),r.serviceId)+select('categoryId','Categoría',list('tariffs').filter(t=>t.active).map(t=>({id:t.id,name:t.name})),r.categoryId)+field('serviceType','Tipo de servicio',r.serviceType||'LOAD IN')+field('team','Equipo o escenario',r.team)+field('date','Día',r.date||day(),'date','required')+field('start','Inicio',r.start||'08:00','time','required')+field('endDate','Día final',r.endDate||r.date||day(),'date','required')+field('end','Fin',r.end||'18:00','time','required')+amount('pause','Pausa (h)',r.pause??0)+(id?'':field('quantity','Número de plazas individuales a crear',1,'number','min="1" max="100" step="1"'))+notes(r.notes,'Observaciones de la plaza');
  if(['workers','clients'].includes(kind))fields=field('name',kind==='workers'?'Nombre y apellidos':'Razón social',r.name,'text','required maxlength="200"',true)+field('taxId',kind==='workers'?'DNI / NIE':'NIF / CIF',r.taxId)+field('phone','Móvil',r.phone,'tel')+field('email','Correo electrónico',r.email,'email')+(kind==='workers'?field('specialty','Especialidad',r.specialty):field('contact','Persona de contacto',r.contact))+field('address','Dirección',r.address,'text','',true)+(kind==='workers'?amount('costRate','Coste por hora (€)',r.costRate)+select('contractType','Tipo de contrato',[{id:'eventual',name:'Eventual / por servicio'},{id:'indefinite',name:'Indefinido'},{id:'fixed_discontinuous',name:'Fijo discontinuo'}],r.contractType||'eventual')+field('username','Usuario de acceso (opcional, se genera si está vacío)','', 'text',id?'readonly':'autocomplete="off"',true)+field('iban','IBAN',r.iban)+field('startDate','Fecha de alta',r.startDate,'date')+field('endDate','Fin de contrato',r.endDate,'date')+field('emergency','Contacto de emergencia',r.emergency,'text','',true):field('paymentDays','Plazo de pago (días)',r.paymentDays??30,'number','min="0" max="365"'))+notes(r.notes)+bool('active','Ficha activa',r.active!==false);
 if(kind==='services')fields=field('name','Nombre del servicio',r.name,'text','required',true)+select('clientId','Cliente',list('clients').filter(c=>c.active),r.clientId)+field('venue','Recinto / ubicación',r.venue,'text','required')+field('venueLat','Latitud del recinto (opcional)',r.venueLat??'','number','step="any" min="-90" max="90"')+field('venueLng','Longitud del recinto (opcional)',r.venueLng??'','number','step="any" min="-180" max="180"')+field('radiusMeters','Radio de fichaje en metros',r.radiusMeters??500,'number','min="100" max="5000"')+field('date','Día de inicio',r.date||day(),'date','required')+field('start','Hora de inicio',r.start||'08:00','time','required')+field('endDate','Día de fin',r.endDate||r.date||day(),'date','required')+field('end','Hora de fin',r.end||'18:00','time','required')+select('coordinatorId','Trabajador que coordina el servicio',list('users').filter(u=>u.active&&(u.role==='manager'||u.workerId)),r.coordinatorId)+field('required','Personal requerido',r.required??1,'number','min="0" max="10000"')+select('status','Estado',Object.entries(statuses).filter(([v])=>['planned','confirmed','in_progress','completed','cancelled'].includes(v)).map(([id,name])=>({id,name})),r.status||'planned')+notes(r.notes);
 if(kind==='assignments')fields=select('orderLineId','Puesto del servicio (opcional)',list('orderLines').filter(l=>l.status!=='cancelled'&&!list('assignments').some(a=>a.orderLineId===l.id&&a.id!==r.id)).map(l=>({id:l.id,name:`${name('services',l.serviceId)} · ${l.role} · ${l.date} ${l.start}`})),r.orderLineId)+select('categoryId','Categoría / tarifa',list('tariffs').map(t=>({id:t.id,name:t.name})),r.categoryId)+select('serviceId','Servicio',list('services').filter(s=>s.status!=='cancelled'),r.serviceId)+select('workerId','Trabajador',list('workers').filter(w=>w.active),r.workerId)+field('role','Especialidad / función',r.role)+field('team','Equipo',r.team)+field('date','Día de inicio',r.date||'','date')+field('start','Hora de inicio',r.start||'','time')+field('endDate','Día de fin',r.endDate||'','date')+field('end','Hora de fin',r.end||'','time')+amount('pause','Pausa no computable (h)',r.pause)+amount('costRate','Pago al trabajador por unidad (€)',r.baseCostRate??r.costRate)+amount('chargeRate','Tarifa al cliente por unidad (€)',r.baseChargeRate??r.chargeRate??((r.costRate??find('workers',r.workerId)?.costRate??0)*2))+amount('incrementPercent','Incremento de tarifa (%)',r.incrementPercent??0)+field('actualHours','Horas reales trabajador (vacío = previstas)',r.actualHours??'','number','min="0" max="744" step="0.01"')+field('clientHours','Horas facturables cliente (vacío = previstas)',r.clientHours??'','number','min="0" max="744" step="0.01"')+bool('noShow','No presentado: coste trabajador cero',r.noShow===true)+bool('noShowChargeApproved','Cobrar cancelación al cliente según acuerdo documentado en notas',r.noShowChargeApproved===true)+notes(r.notes)+`<p class="footnote wide">Deja el horario vacío para usar el del servicio. Para jornadas nocturnas indica el día de fin. La app comprueba solapes y asignaciones duplicadas.</p>`;
 if(['invoices','quotes'].includes(kind))fields=select('clientId','Cliente',list('clients'),r.clientId)+select('serviceId','Servicio (opcional)',list('services'),r.serviceId)+field('date','Fecha del documento',r.date||day(),'date','required')+field('dueDate',kind==='quotes'?'Válido hasta':'Fecha de vencimiento',r.dueDate||day(),'date','required')+`<div class="wide"><div class="subhead"><h3>Conceptos</h3><button type="button" class="text-btn" data-action="add-line">${icon('plus')} Añadir línea</button></div><div id="invoice-lines">${(r.lines||[{description:'',quantity:1,price:0,vat:data.settings.vat}]).map(lineHTML).join('')}</div><div class="lines-summary" id="lines-total"></div></div>`+notes(r.notes,'Observaciones del documento');
 if(kind==='expenses')fields=field('name','Concepto',r.name,'text','required',true)+field('supplier','Proveedor',r.supplier)+field('date','Fecha',r.date||day(),'date','required')+amount('amount','Importe total (€)',r.amount)+amount('vat','IVA incluido (%)',r.vat??21)+select('serviceId','Servicio (opcional)',list('services'),r.serviceId)+select('status','Estado',[{id:'pending',name:'Pendiente de pago'},{id:'paid',name:'Pagado'}],r.status||'pending')+notes(r.notes);
 if(kind==='users')fields=field('name','Nombre para mostrar',r.name,'text','required')+field('username','Usuario o correo',r.username,'text','required minlength="3" autocomplete="off"')+select('role','Rol',[{id:'manager',name:'Gestor: acceso completo'},{id:'worker',name:'Trabajador: su información'}],r.role||'worker')+select('workerId','Ficha de trabajador vinculada',list('workers'),r.workerId)+field('password',id?'Nueva contraseña (opcional)':'Contraseña inicial','','password',`minlength="12" maxlength="128" autocomplete="new-password" ${id?'':'required'}`,true)+bool('active','Permitir acceso',r.active!==false)+`<p class="footnote wide">El trabajador necesita una ficha vinculada. Los cambios de permisos, estado o contraseña cierran sus sesiones existentes.</p>`;
 if(kind==='documents')fields=field('file','Archivo PDF, PNG o JPEG (máximo 5 MB)','','file','required accept=".pdf,.png,.jpg,.jpeg"',true)+select('workerId','Trabajador (puede descargarlo)',list('workers'),r.workerId)+select('clientId','Cliente',list('clients'),r.clientId)+select('serviceId','Servicio',list('services'),r.serviceId)+select('type','Tipo',[{id:'contract',name:'Contrato de trabajo'},{id:'identity',name:'Identificación'},{id:'training',name:'Formación / PRL'},{id:'medical',name:'Reconocimiento / aptitud'},{id:'other',name:'Otro documento'}],r.type||'contract')+field('expires','Fecha de caducidad (opcional)',r.expires,'date')+notes(r.notes);
 const names={tariffs:'tarifa',orderLines:'plaza',clients:'cliente',workers:'trabajador',services:'servicio',assignments:'asignación',invoices:'factura',quotes:'presupuesto',expenses:'gasto',users:'usuario',documents:'documento'};
 modal(`${id?'Editar':'Nuevo'} ${names[kind]}`,formWrap(fields));
 if(kind==='orderLines'){
  const applyOrderService=()=>{const sv=find('services',$('[name=serviceId]').value);if(sv)for(const k of ['date','start','endDate','end'])$('[name='+k+']').value=sv[k];};
  $('[name=serviceId]').onchange=applyOrderService;if(!id&&r.serviceId)applyOrderService();
 }
 if(kind==='assignments'){
 const applyService=()=>{const s=find('services',$('[name=serviceId]').value);if(!s)return;for(const k of ['date','start','endDate','end'])$(`[name=${k}]`).value=s[k];};
 $('[name=serviceId]').onchange=applyService;if(!id&&r.serviceId&&!r.orderLineId)applyService();
 const applyTariff=()=>{const t=find('tariffs',$('[name=categoryId]').value);if(!t)return;$('[name=role]').value=t.name;$('[name=costRate]').value=t.workerRate??'';$('[name=chargeRate]').value=t.clientRate??'';$('[name=incrementPercent]').value=t.incrementPercent??0;};
 $('[name=categoryId]').onchange=applyTariff;
 const applyLine=()=>{const l=find('orderLines',$('[name=orderLineId]').value);if(!l)return;$('[name=serviceId]').value=l.serviceId;$('[name=categoryId]').value=l.categoryId;for(const k of ['date','start','endDate','end','pause'])$('[name='+k+']').value=l[k];$('[name=team]').value=l.team||'';applyTariff();$('[name=role]').value=l.role;};
 $('[name=orderLineId]').onchange=applyLine;if(!id&&r.orderLineId)applyLine();
 $('[name=workerId]').onchange=()=>{const w=find('workers',$('[name=workerId]').value);if(w){if(!$('[name=categoryId]').value){$('[name=role]').value=w.specialty||'';$('[name=costRate]').value=w.costRate||0;$('[name=chargeRate]').value=(Number(w.costRate)||0)*2;}}};
 }
 if(['invoices','quotes'].includes(kind))lineTotal();
 formHandler(async (input,f)=>{
 if(['clients','workers','users','tariffs'].includes(kind))input.active=f.elements.active.checked;if(kind==='assignments'){input.noShow=f.elements.noShow.checked;input.noShowChargeApproved=f.elements.noShowChargeApproved.checked;}
 if(['invoices','quotes'].includes(kind))input.lines=$$('.invoice-line').map(el=>Object.fromEntries([...el.querySelectorAll('input')].map(i=>[i.dataset.field,i.value])));
 if(kind==='documents'){const file=f.elements.file.files[0];if(!file||file.size>5*1024*1024)throw new Error('Selecciona un archivo de hasta 5 MB.');const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('No se ha podido leer el archivo.'));reader.readAsDataURL(file);});delete input.file;await api('document-upload',{...input,name:file.name,content});return;}
 if(kind==='orderLines'&&!id&&Number(input.quantity)>1){const quantity=Number(input.quantity);delete input.quantity;await api('order-line-bulk',{quantity,record:input});return;}
 return await api(kind==='users'?'user':'save',{kind,record:{...input,...(id?{id,revision:r.revision}:{})}});
 });
}
function lineHTML(l){return `<div class="invoice-line"><label>Concepto<input data-field="description" value="${esc(l.description)}" required maxlength="200"></label><label>Cantidad<input data-field="quantity" type="number" min="0.01" step="0.01" value="${l.quantity}" required></label><label>Precio (€)<input data-field="price" type="number" min="0" step="0.01" value="${l.price}" required></label><label>IVA (%)<input data-field="vat" type="number" min="0" max="100" step="0.01" value="${l.vat}" required></label><button type="button" class="icon-btn" data-action="remove-line" title="Eliminar línea" aria-label="Eliminar línea">${icon('trash')}</button></div>`;}
function lineTotal(){const n=$$('.invoice-line').reduce((n,l)=>{const v=Object.fromEntries([...l.querySelectorAll('input')].map(i=>[i.dataset.field,Number(i.value)]));const net=Math.round(v.quantity*v.price*100)/100;return n+net+Math.round(net*v.vat)/100;},0);if($('#lines-total'))$('#lines-total').textContent='Total: '+euro(n);}
function detail(kind,id){const r=find(kind,id);if(!r)return;const detailItem=(l,v)=>`<div><small>${l}</small><strong>${esc(v||'—')}</strong></div>`;let html='';
 if(kind==='services'){
 const a=list('assignments').filter(a=>a.serviceId===r.id);
 html=`<div class="detail-grid">${detailItem('Cliente',manager()?name('clients',r.clientId):'Servicio asignado')}${detailItem('Recinto',r.venue)}${detailItem('Inicio',fmt(r.date)+' · '+r.start)}${detailItem('Fin',fmt(r.endDate)+' · '+r.end)}${detailItem('Coordinador',name('users',r.coordinatorId))}<div><small>Estado</small>${badge(r.status)}</div></div>${manager()?`<div class="detail-actions">${button('add-slot','Añadir puesto','plus',`data-id="${id}"`)}${button('assign-service','Asignar personal','plus',`data-id="${id}"`)}${r.status==='completed'&&r.settlementStatus!=='confirmed'?button('settlement-confirm','Confirmar liquidación','check',`data-id="${id}"`,''):''}${r.settlementStatus==='confirmed'?'<strong>Liquidación confirmada</strong>':''}</div>`:''}<div class="subhead"><h3>Personal asignado (${a.length})</h3></div>${a.length?table(['Persona','Función','Horario','Estado'],a.map(a=>`<tr><td>${esc(name('workers',a.workerId))}</td><td>${esc(a.role)}</td><td>${a.start}–${a.end}</td><td>${badge(a.status)}</td></tr>`)):empty('Sin asignaciones','Añade personal para empezar a organizar el servicio.')}${r.notes?`<div class="notice">${esc(r.notes)}</div>`:''}`;
 if(manager()){
   const slots=list('orderLines').filter(l=>l.serviceId===id&&l.status!=='cancelled');
   if(slots.length)html+='<div class="subhead"><h3>Puestos individuales ('+slots.length+')</h3></div>'+table(['Categoría','Bloque','Estado',''],slots.map(l=>{
     const person=list('assignments').find(a=>a.orderLineId===l.id);
     return '<tr><td>'+esc(l.role)+'<small>'+esc(l.serviceType)+' · '+esc(l.team)+'</small></td><td>'+esc(l.date)+' · '+esc(l.start)+'–'+esc(l.end)+'</td><td>'+(person?esc(name('workers',person.workerId)):'<strong>Por cubrir</strong>')+'</td><td>'+(person?'':button('assign-slot','Asignar','plus','data-id="'+esc(l.id)+'"',''))+'</td></tr>';
   }));
   html+='<p class="footnote">Las tarifas del PDF son importes brutos; los costes empresariales adicionales no están incluidos en el margen previsto.</p>';
  }
 }else if(kind==='assignments'){
 html=`<div class="detail-grid">${detailItem('Trabajador',name('workers',r.workerId))}${detailItem('Servicio',name('services',r.serviceId))}${detailItem('Horario',fmt(r.date)+' '+r.start+' → '+fmt(r.endDate)+' '+r.end)}${detailItem('Equipo / función',r.team+' · '+r.role)}${detailItem('Horas previstas / pausa',r.hours+' h / '+r.pause+' h')}${manager()?detailItem('Horas trabajador / facturables',(r.workerHours??r.hours)+' h / '+(r.billableHours??r.hours)+' h')+detailItem('Asistencia',r.noShow?(r.noShowChargeApproved?'No presentado · cancelación autorizada':'No presentado · no facturable'):'Prevista / registrada'):''}${detailItem('Entrada',stamp(r.checkIn))}${detailItem('Salida',stamp(r.checkOut))}<div><small>Confirmación</small>${badge(r.status)}</div></div>${manager()?`<div class="metric-row"><span>Coste/h: ${euro(r.costRate)}</span><span>Tarifa/h: ${euro(r.chargeRate)}</span></div>`:''}<div class="detail-actions">${(manager()||r.workerId===data.user.workerId)&&!r.checkIn?button('confirm','Confirmar','check',`data-id="${id}" data-status="confirmed"`)+button('confirm','Rechazar','close',`data-id="${id}" data-status="rejected"`,''):''}${!r.checkOut?button('clock',r.checkIn?'Registrar salida':'Registrar entrada','clock',`data-id="${id}" data-clock="${r.checkIn?'out':'in'}"`,'dark'):''}${r.workerId===data.user.workerId&&!r.checkOut?button('qr','Mostrar mi QR','shield',`data-id="${id}"`,''):''}${manager()?button('attendance-adjust','Corregir fichaje','edit',`data-id="${id}"`,''):''}</div><p class="footnote">Los fichajes se registran con la hora del servidor y quedan en el historial de actividad.</p>`;
 }else if(['invoices','quotes'].includes(kind)){
 html=`${paper(r,kind)}<div class="detail-actions">${r.status==='draft'?button('issue',kind==='invoices'?'Emitir factura':'Emitir presupuesto','check',`data-kind="${kind}" data-id="${id}"`):button('print','Imprimir / Guardar PDF','download',`data-id="${id}" data-kind="${kind}"`,'')}${kind==='invoices'&&r.status!=='draft'&&r.paid<r.total?button('payment','Registrar cobro','wallet',`data-id="${id}"`):''}${kind==='quotes'&&r.status==='issued'?button('quote-status','Aceptar y crear servicio','check',`data-id="${id}" data-status="accepted"`,'')+button('quote-status','Rechazado','close',`data-id="${id}" data-status="rejected"`,''):''}</div>${kind==='quotes'&&r.status==='accepted'&&!r.serviceId?button('service-wizard','Crear servicio desde presupuesto','plus',`data-quote-id="${id}"`,''):kind==='quotes'&&r.serviceId?button('view','Ver servicio vinculado','briefcase',`data-kind="services" data-id="${r.serviceId}"`,''):''}${r.payments?.length?`<h3>Cobros registrados</h3>${table(['Fecha','Importe','Referencia'],r.payments.map(p=>`<tr><td>${fmt(p.date)}</td><td>${euro(p.amount)}</td><td>${esc(p.reference)}</td></tr>`))}`:''}`;
 }else{
 const labels={name:'Nombre',username:'Usuario',taxId:'NIF / DNI',email:'Correo',phone:'Móvil',address:'Dirección',specialty:'Especialidad',contact:'Contacto',iban:'IBAN',emergency:'Emergencias',startDate:'Alta',endDate:'Fin de contrato',costRate:'Coste/h',role:'Rol',supplier:'Proveedor',amount:'Importe',date:'Fecha',notes:'Notas'};
 html=`<div class="detail-grid">${Object.entries(labels).filter(([k])=>r[k]!==undefined&&r[k]!=='').map(([k,l])=>detailItem(l,k==='amount'||k==='costRate'?euro(r[k]):r[k])).join('')}</div>`;
 if(kind==='workers')html+=`<div class="detail-actions">${manager()?button('worker-user','Acceso del empleado','shield',`data-id="${id}"`)+button('worker-document','Subir contrato','upload',`data-id="${id}"`,''):''}</div><h3>Documentación</h3>${list('documents').filter(d=>d.workerId===id).map(d=>`<div class="list-item"><span class="grow">${esc(d.name)}</span><a class="icon-btn" aria-label="Descargar" href="/api/office/document?id=${d.id}">${icon('download')}</a></div>`).join('')||'<p class="footnote">Sin documentos vinculados.</p>'}`;
 }
 if(manager()&&!['users','documents'].includes(kind)&&(!['invoices','quotes'].includes(kind)||r.status==='draft'))html+=`<div class="form-footer">${button('archive','Archivar','trash',`data-kind="${kind}" data-id="${id}"`,'danger')}${button('edit','Editar','edit',`data-kind="${kind}" data-id="${id}"`,'')}</div>`;
 if(kind==='workers'&&manager()){
  const linked=list('users').find(u=>u.workerId===r.id),profile=(data.employeeProfiles||[]).find(p=>p.workerId===r.id)||{},weekly=(data.weeklyAvailabilityRows||[]).find(x=>x.workerId===r.id),hasPhoto=(data.employeePhotoIds||[]).includes(r.id);
  const contract=({eventual:'Eventual / por servicio',indefinite:'Indefinido',fixed_discontinuous:'Fijo discontinuo'})[r.contractType]||'Eventual / por servicio';
  html+='<h3 style="margin-top:20px">Ficha laboral y acceso</h3><div class="detail-grid">'+
   '<div><small>Contrato</small><strong>'+esc(contract)+'</strong></div>'+
   '<div><small>Usuario</small><strong>'+esc(linked?.username||'Sin cuenta')+'</strong></div>'+
   '<div><small>Acceso</small><strong>'+esc(linked?.active?'Activo':'No activo')+'</strong></div>'+
   '<div><small>Disponibilidad habitual</small><strong>'+esc(weekly?Object.values(weekly.days||{}).filter(d=>d.available).length+' días':'Sin configurar')+'</strong></div></div>';
  if(hasPhoto)html+='<img src="/api/office/employee-photo?workerId='+encodeURIComponent(id)+'" alt="Foto del trabajador" style="max-width:96px;height:96px;object-fit:cover;border-radius:17px;margin-top:12px">';
  if(Object.keys(profile).length)html+='<h3 style="margin-top:18px">Perfil declarado</h3><div class="detail-grid">'+Object.entries(profile).filter(([k,v])=>!['id','workerId','revision','updatedAt'].includes(k)&&v!==''&&v!=null).map(([k,v])=>'<div><small>'+esc(k)+'</small><strong>'+esc(Array.isArray(v)?v.join(', '):v)+'</strong></div>').join('')+'</div>';
  const shifts=list('assignments').filter(a=>a.workerId===id);
  if(shifts.length)html+='<h3 style="margin-top:18px">Historial de turnos</h3>'+table(['Servicio','Horario','Fichajes','Estado'],shifts.map(a=>'<tr><td>'+esc(name('services',a.serviceId))+'</td><td>'+esc(a.date)+' '+esc(a.start)+'–'+esc(a.end)+'</td><td>'+stamp(a.checkIn)+' / '+stamp(a.checkOut)+'</td><td>'+esc(a.status)+'</td></tr>'));
 }
 modal(kind==='services'?r.name:kind==='assignments'?'Detalle de asignación':r.number||r.name||'Detalle',html);
}
function paper(r,kind){const c=r.customer||find('clients',r.clientId)||{},s=r.issuer||data.settings;return `<div class="invoice-paper"><div class="invoice-top"><div><div class="company">${esc(s.name||'Completa los datos de empresa')}</div><p>${esc(s.taxId)}<br>${esc(s.address)}<br>${esc(s.email)} · ${esc(s.phone)}</p></div><div><h1>${kind==='quotes'?'PRESUPUESTO':'FACTURA'}</h1><strong>${esc(r.number||'BORRADOR · SIN EMITIR')}</strong><p>Fecha: ${fmt(r.date)}<br>${kind==='quotes'?'Validez':'Vencimiento'}: ${fmt(r.dueDate)}</p></div></div><div class="notice"><b>${esc(c.name)}</b><br>${esc(c.taxId)}<br>${esc(c.address)}</div><div class="table-wrap"><table class="detail-table"><thead><tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>IVA</th><th>Base</th></tr></thead><tbody>${r.lines.map(l=>`<tr><td>${esc(l.description)}</td><td>${l.quantity}</td><td>${euro(l.price)}</td><td>${l.vat}%</td><td>${euro(l.net)}</td></tr>`).join('')}</tbody></table></div><div class="invoice-totals"><div><span>Base imponible</span><span>${euro(r.net)}</span></div><div><span>IVA</span><span>${euro(r.tax)}</span></div><div><span>Total EUR</span><span>${euro(r.total)}</span></div></div><div class="invoice-foot">${esc(r.notes)}${s.iban?'\nPago por transferencia: '+esc(s.iban):''}${s.footer?'\n'+esc(s.footer):''}</div></div>`;}
function payment(id){const r=find('invoices',id);modal('Registrar cobro · '+r.number,formWrap(amountField('amount','Importe cobrado (€)',Math.round((r.total-r.paid)*100)/100)+field('date','Fecha del cobro',day(),'date','required')+field('reference','Referencia / método de pago','','text','',true)));formHandler(async b=>api('payment',{...b,id,revision:r.revision}));}
function amountField(n,l,v){return field(n,l,v,'number','min="0.01" step="0.01" required');}
function calendar(){const d=new Date(month+'-01T12:00:00'),count=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),first=(d.getDay()+6)%7;$('#page-actions').innerHTML=`<div class="calendar-controls"><button class="icon-btn" data-action="month" data-dir="-1" aria-label="Mes anterior">${icon('left')}</button><strong>${esc(d.toLocaleDateString('es-ES',{month:'long',year:'numeric'}))}</strong><button class="icon-btn" data-action="month" data-dir="1" aria-label="Mes siguiente">${icon('chevron')}</button></div>`;$('#content').innerHTML=`<div class="panel calendar-scroll"><div class="calendar">${['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(x=>`<div class="day-name">${x}</div>`).join('')}${Array.from({length:first},()=>'<div class="day blank"></div>').join('')}${Array.from({length:count},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0');return `<div class="day ${date===day()?'today':''}"><strong>${i+1}</strong>${list('services').filter(s=>s.date<=date&&s.endDate>=date&&s.status!=='cancelled').map(s=>`<button class="event" data-action="view" data-kind="services" data-id="${s.id}">${esc(s.start)} ${esc(s.name)}</button>`).join('')}</div>`;}).join('')}</div></div>`;}
function availabilityPage(){if(data.user.workerId||manager())$('#page-actions').innerHTML=button('availability','Registrar disponibilidad','plus');const r=filtered('availability').sort((a,b)=>b.date.localeCompare(a.date));$('#content').innerHTML=r.length?table(['Trabajador','Día','Disponibilidad','Notas'],r.map(a=>`<tr><td>${esc(name('workers',a.workerId))}</td><td>${fmt(a.date)}</td><td>${badge(a.status)}</td><td>${esc(a.notes)}</td></tr>`)):`<div class="panel">${empty('Disponibilidad por registrar','Indica en qué días estás disponible para que el gestor pueda planificar.')}</div>`;}
function availability(){modal('Registrar disponibilidad',formWrap((manager()?select('workerId','Trabajador',list('workers').filter(w=>w.active),''):``)+field('date','Día',day(),'date','required')+select('status','Disponibilidad',[{id:'available',name:'Disponible'},{id:'unavailable',name:'No disponible'}],'available')+notes('','Observaciones')));formHandler(async b=>{const w=b.workerId||data.user.workerId;const old=find('availability',w+'_'+b.date);await api('availability',{...b,revision:old?.revision});});}
function settingsFields(){const s=data.settings;return field('name','Razón social',s.name,'text','required',true)+field('taxId','NIF / CIF',s.taxId,'text','required')+field('phone','Teléfono',s.phone)+field('address','Dirección fiscal',s.address,'text','required',true)+field('email','Correo de facturación',s.email,'email')+field('iban','IBAN de cobro',s.iban)+field('invoicePrefix','Serie de facturación',s.invoicePrefix,'text','required pattern="[A-Za-z0-9-]{1,15}"')+field('vat','IVA por defecto (%)',s.vat,'number','min="0" max="100" step="0.01"')+field('paymentDays','Plazo de pago (días)',s.paymentDays,'number','min="0" max="365"')+`<label class="wide">Pie de factura<textarea name="footer">${esc(s.footer)}</textarea></label>`;}
function settingsPage(){$('#page-actions').innerHTML=button('backup','Exportar datos','download','','');$('#content').innerHTML=`<div class="panel settings-form"><div class="notice">La serie y la numeración se aplican al emitir el documento. Las facturas emitidas conservan sus datos y no se pueden editar. La exportación contiene registros y metadatos; descarga los archivos de contratos desde Documentos.</div><form id="settings-form"><div class="form-grid">${settingsFields()}</div><div class="form-footer"><button class="btn primary" type="submit">Guardar ajustes</button></div></form></div><p class="footnote">La emisión y el registro de cobros se gestionan aquí. Este panel no realiza presentaciones tributarias, firma electrónica ni envíos a organismos externos.</p>`;$('#settings-form').onsubmit=async e=>{e.preventDefault();try{await api('settings',{record:{...Object.fromEntries(new FormData(e.target)),revision:data.settings.revision}});await load();toast('Datos de empresa guardados');}catch(err){toast(err.message,true);}};}
function auditPage(){const labels={create:'Creación',update:'Modificación',archive:'Archivo',issue:'Emisión',payment:'Cobro',upload:'Documento subido',user:'Usuario actualizado',settings:'Ajustes',setup:'Primer gestor',confirmed:'Asignación confirmada',rejected:'Rechazo',availability:'Disponibilidad','clock-in':'Entrada','clock-out':'Salida','qr-in':'Entrada por QR','qr-out':'Salida por QR','attendance-adjust':'Corrección de fichaje','quote-invoice':'Conversión a factura',password:'Contraseña cambiada'};$('#content').innerHTML=table(['Fecha y hora','Persona','Operación','Sección','Referencia / Motivo'],(data.audit||[]).map(a=>`<tr><td>${stamp(a.time)}</td><td>${esc(a.name)}</td><td>${esc(labels[a.action]||a.action)}</td><td>${esc(navs.find(n=>n[0]===a.kind)?.[1]||a.kind)}</td><td><small>${esc(a.recordId)}</small>${a.reason?`<small>${esc(a.reason)}</small><small>${stamp(a.before?.checkIn)} → ${stamp(a.after?.checkIn)}</small><small>${stamp(a.before?.checkOut)} → ${stamp(a.after?.checkOut)}</small>`:''}</td></tr>`));}
function download(text,filename,type='text/plain'){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function exportCSV(){const rows=filtered(page);if(!rows.length)return toast('No hay registros para exportar');const cols=[...new Set(rows.flatMap(r=>Object.keys(r).filter(k=>typeof r[k]!=='object')))];const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';download('\ufeff'+[cols,...rows.map(r=>cols.map(c=>r[c]))].map(r=>r.map(cell).join(';')).join('\r\n'),`NOVA_${page}_${day()}.csv`,'text/csv;charset=utf-8');}
function parseCSV(source){source=source.replace(/^\ufeff/,'');const delimiter=source.split('\n')[0].includes(';')?';':',';let rows=[],row=[],v='',quoted=false;for(let i=0;i<source.length;i++){const c=source[i];if(c==='"'){if(quoted&&source[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===delimiter&&!quoted){row.push(v);v='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&source[i+1]==='\n')i++;row.push(v);if(row.some(x=>x.trim()))rows.push(row);row=[];v='';}else v+=c;}if(quoted)throw new Error('El CSV contiene comillas sin cerrar.');row.push(v);if(row.some(x=>x.trim()))rows.push(row);return rows;}
function importCSV(){const kind=page;modal('Importar '+(kind==='workers'?'trabajadores':'clientes'),`<div class="notice">Columnas: <b>name</b> (obligatoria), email, phone, taxId, address, ${kind==='workers'?'specialty, costRate':'contact, paymentDays'}. Máximo 200 filas por importación. Se crean fichas nuevas; revisa posibles duplicados.</div><input type="file" id="csv-file" accept=".csv,text/csv"><div id="import-preview"></div><div class="form-footer"><button class="btn" data-action="csv-template" data-kind="${kind}">Descargar plantilla</button><button class="btn primary" id="import-run" disabled>Importar</button></div>`);let prepared=[];$('#csv-file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1024*1024)throw new Error('CSV demasiado grande.');const csv=parseCSV(await file.text());const headers=csv.shift().map(x=>x.trim());if(!headers.includes('name'))throw new Error('Falta la columna name.');if(csv.length>200)throw new Error('Divide el archivo en bloques de hasta 200 filas.');prepared=csv.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]||''])));if(prepared.some(r=>!r.name.trim()))throw new Error('Hay filas sin nombre.');const duplicate=prepared.filter(r=>list(kind).some(x=>x.name.toLowerCase()===r.name.toLowerCase()||(r.taxId&&x.taxId===r.taxId)));if(duplicate.length)throw new Error('Ya existen '+duplicate.length+' fichas del archivo. Retíralas del CSV para evitar duplicados.');$('#import-preview').innerHTML=`<div class="notice">${prepared.length} fichas listas para importar.</div><div class="import-preview">${table(['Nombre','Correo','Móvil'],prepared.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${esc(r.phone)}</td></tr>`))}</div>`;$('#import-run').disabled=!prepared.length;}catch(err){prepared=[];$('#import-run').disabled=true;$('#import-preview').innerHTML=`<div class="error">${esc(err.message)}</div>`;}};
 $('#import-run').onclick=async e=>{e.target.disabled=true;let saved=0;try{for(const row of prepared){await api('save',{kind,record:{...row,active:true}});saved++;}$('#modal').close();await load();toast(saved+' fichas importadas');}catch(err){prepared=prepared.slice(saved);$('#import-preview').innerHTML=`<div class="error">${saved} fichas guardadas. ${esc(err.message)}. Quedan ${prepared.length} sin importar.</div>`;await load();}finally{e.target.disabled=false;}};}
async function runMutation(op,b,msg){if(busy)return;busy=true;try{await api(op,b);$('#modal').close();await load();toast(msg);}finally{busy=false;}}
document.addEventListener('click',async e=>{const el=e.target.closest('[data-action],[data-page]');if(!el)return;const a=el.dataset.action,id=el.dataset.id,kind=el.dataset.kind;try{
 if(el.dataset.page){if(page==='service-workspace')history.replaceState(null,'',location.pathname+location.search);page=el.dataset.page;query='';filter='';document.body.classList.remove('nav-open');renderNav();render();if(!a||a==='navigate')return;}
 if(a==='open-service')return openServicePage(id);
 if(a==='service-back'){history.replaceState(null,'',location.pathname+location.search);page='services';renderNav();return render()}

 if(a==='service-day-new')return serviceDayEditor();
 if(a==='service-day-edit')return serviceDayEditor(id);
 if(a==='service-block-new')return serviceBlockEditor('',el.dataset.date||'');
 if(a==='service-block-edit')return serviceBlockEditor(id);
 if(a==='service-block-add-positions')return blockAddCategories(id);
 if(a==='block-category-add'){captureBlockCategories();blockCategoryRows.push({categoryId:'',quantity:1});return drawBlockCategories()}
 if(a==='block-category-remove'){captureBlockCategories();blockCategoryRows.splice(Number(el.dataset.index),1);return drawBlockCategories()}
 if(a==='service-place-new')return servicePlaceEditor();
 if(a==='service-place-edit')return servicePlaceEditor(id);
 if(a==='service-maps-search'){
  const q=[$('#editor [name=address]')?.value,$('#editor [name=name]')?.value].filter(Boolean).join(', ');
  window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q||'España'),'_blank','noopener,noreferrer');return;
 }
 if(a==='service-coordinator-new')return serviceCoordinatorEditor();
 if(a==='service-place-remove')return confirmServiceAction('place',id);
 if(a==='service-day-remove')return confirmServiceAction('day',id);
 if(a==='service-block-remove')return confirmServiceAction('block',id);
 if(a==='service-coordinator-remove')return confirmServiceAction('coordinator',id);
 if(a==='service-remove-confirm'){
  const type=el.dataset.deleteType,ops={place:'service-place-delete',day:'service-day-delete',block:'service-block-delete',coordinator:'service-coordinator-delete'};
  const kinds={place:'servicePlaces',day:'serviceDays',block:'serviceBlocks',coordinator:'serviceCoordinators'};
  if(!ops[type])return;const record=find(kinds[type],id);
  return runMutation(ops[type],{id,revision:record.revision},'Elemento eliminado');
 }

 if(a==='service-tab'){serviceTab=el.dataset.tab;return serviceWorkspacePage()}
 if(a==='tariff-new-schedule')return newTariffSchedule();
  if(a==='service-wizard')return serviceWizard(el.dataset.quoteId||'');
  if(a==='new'&&kind==='services')return serviceWizard();
  if(a==='new'||a==='edit')return editor(kind,id);
 if(a==='view'&&kind==='services')return openServicePage(id);
 if(a==='view')return detail(kind,id);
 if(a==='close')return $('#modal').close();
 if(a==='refresh'){await load();return toast('Datos actualizados');}
 if(a==='logout'){await api('logout',{});data={};$('#modal').close();$('#app').hidden=true;$('#auth').hidden=false;return authScreen();}
 if(a==='show-password'){const i=$('#auth-password');i.type=i.type==='password'?'text':'password';return;}
 if(a==='add-line'){$('#invoice-lines').insertAdjacentHTML('beforeend',lineHTML({description:'',quantity:1,price:0,vat:data.settings.vat}));lineTotal();return;}
 if(a==='remove-line'){if($$('.invoice-line').length>1)el.closest('.invoice-line').remove();lineTotal();return;}
 if(a==='wizard-add-position'){captureWizardPositions();wizardPositions.push({});return wizardRows()}
  if(a==='wizard-remove-position'){captureWizardPositions();wizardPositions.splice(Number(el.dataset.index),1);return wizardRows()}
  if(a==='add-slot')return editor('orderLines','',{serviceId:id});
  if(a==='assign-slot')return editor('assignments','',{orderLineId:id,serviceId:find('orderLines',id)?.serviceId});
  if(a==='assign-service')return editor('assignments','',{serviceId:id});
 if(a==='worker-user'){const existing=list('users').find(u=>u.workerId===id);return existing?editor('users',existing.id):editor('users','',{workerId:id,name:name('workers',id)});}
 if(a==='worker-document')return editor('documents','',{workerId:id});
 if(a==='settlement-confirm')return runMutation('settlement-confirm',{serviceId:id,revision:find('services',id).revision},'Liquidación confirmada');
  if(a==='quote-service')return runMutation('quote-from-order',{serviceId:id},'Presupuesto creado');
  if(a==='invoice-service')return runMutation('invoice-from-service',{serviceId:id},'Borrador creado. Revisa conceptos, tarifas e impuestos antes de emitir.');
 if(a==='clock')return runMutation('clock',{id,revision:find('assignments',id).revision,action:el.dataset.clock},'Fichaje registrado');
 if(a==='confirm')return runMutation('confirm',{id,revision:find('assignments',id).revision,status:el.dataset.status},'Respuesta guardada');
 if(a==='issue'){
 const r=find(kind,id);modal('Confirmar emisión',`<div class="notice">Se asignará un número definitivo a este ${kind==='quotes'?'presupuesto':'documento'}. Sus conceptos y datos fiscales quedarán bloqueados.</div><div class="metric-row"><span>Cliente: <b>${esc(name('clients',r.clientId))}</b></span><span>Total: <b>${euro(r.total)}</b></span></div><div class="form-footer"><button class="btn" data-action="close">Cancelar</button><button class="btn primary" data-action="issue-confirm" data-kind="${kind}" data-id="${id}">Emitir documento</button></div>`);return;
 }
 if(a==='issue-confirm')return runMutation('issue',{kind,id,revision:find(kind,id).revision},'Documento emitido');
 if(a==='payment')return payment(id);
 if(a==='qr')return showQR(id);
 if(a==='scan')return scanner();
 if(a==='attendance-adjust')return adjustAttendance(id);
 if(a==='quote-invoice')return runMutation('quote-invoice',{id},'Borrador de factura creado');
 if(a==='quote-status'&&el.dataset.status==='accepted')return serviceWizard(id);
  if(a==='quote-status')return runMutation('quote-status',{id,revision:find('quotes',id).revision,status:el.dataset.status},'Presupuesto actualizado');
 if(a==='print'){$('#print-area').innerHTML=paper(find(kind,id),kind);window.print();return;}
 if(a==='archive'){
 const r=find(kind,id);modal('Archivar registro',`<p class="footnote">Se retirará este registro de las listas activas. El servidor conservará su historial y comprobará sus relaciones antes de archivarlo.</p><div class="form-footer"><button class="btn" data-action="close">Cancelar</button><button class="btn danger" data-action="archive-confirm" data-kind="${kind}" data-id="${id}">Archivar</button></div>`);return;
 }
 if(a==='incident-resolve')return runMutation('incident-resolve',{id,revision:find('incidents',id).revision},'Incidencia resuelta');
  if(a==='copy-credentials'){navigator.clipboard?.writeText('Usuario: '+el.dataset.username+'\nContraseña temporal: '+el.dataset.password).then(()=>toast('Credenciales copiadas')).catch(()=>toast('No se pudo copiar',true));return;}
  if(a==='archive-confirm')return runMutation('archive',{kind,id,revision:find(kind,id).revision},'Registro archivado');
 if(a==='availability')return availability();
 if(a==='month'){const d=new Date(month+'-01T12:00:00');d.setMonth(d.getMonth()+Number(el.dataset.dir));month=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');return calendar();}
 if(a==='backup'){const d=await api('backup');download(JSON.stringify(d,null,2),`NOVA_registros_${day()}.json`,'application/json');return;}
 if(a==='export')return exportCSV();
 if(a==='import')return importCSV();
 if(a==='csv-template'){const keys=kind==='workers'?['name','email','phone','taxId','address','specialty','costRate']:['name','email','phone','taxId','address','contact','paymentDays'];download('\ufeff'+keys.join(';')+'\r\n',`NOVA_plantilla_${kind}.csv`,'text/csv;charset=utf-8');return;}
 }catch(err){toast(err.message,true);}
});

async function showQR(id){
 const d=await api('qr-issue',{id});const qr=new window.NOVA_QR_Encoder(0,window.NOVA_QR_Level.M);qr.addData(d.token);qr.make();const n=qr.getModuleCount(),paths=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))paths.push(`M${x+4},${y+4}h1v1h-1z`);
 modal('Mi QR de '+(d.action==='in'?'entrada':'salida'),`<div class="qr-display"><svg viewBox="0 0 ${n+8} ${n+8}" role="img" aria-label="Código QR de fichaje"><rect width="100%" height="100%" fill="white"/><path d="${paths.join('')}" fill="black" stroke="none"/></svg><p class="footnote">Muéstralo al coordinador. Caduca en 90 segundos y solo puede utilizarse una vez.</p><input aria-label="Código para copiar" readonly value="${d.token}"><p class="footnote">También puedes copiar el código y entregárselo al coordinador.</p></div><div class="form-footer"><button class="btn primary" data-action="qr" data-id="${id}">Generar nuevo QR</button></div>`);
}
let cameraStream=null,cameraFrame=null;
function stopCamera(){if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;if(cameraFrame)cancelAnimationFrame(cameraFrame);cameraFrame=null;}
async function scanner(){
 modal('Validar fichaje por QR',formWrap(`<div class="wide"><video id="qr-video" autoplay playsinline muted hidden></video><div id="camera-note" class="notice">Puedes pegar el código del trabajador. En navegadores compatibles también puedes activar la cámara.</div><button type="button" class="btn" id="start-camera">Activar cámara</button></div>${field('token','Código QR del trabajador','','text','required autocomplete="off"',true)}`,'Validar fichaje'));
 formHandler(async b=>{await api('qr-redeem',{token:b.token.trim()});stopCamera();});
 $('#start-camera').onclick=async e=>{try{if(!('BarcodeDetector' in window))throw new Error('Este navegador no incorpora lector QR. Pega el código que aparece bajo el QR del trabajador.');stopCamera();cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const video=$('#qr-video');video.srcObject=cameraStream;video.hidden=false;await video.play();const detector=new BarcodeDetector({formats:['qr_code']});const detect=async()=>{if(!cameraStream||!$('#modal').open)return;try{const result=await detector.detect(video);if(result[0]){$('[name=token]').value=result[0].rawValue;stopCamera();$('#camera-note').textContent='Código leído. Pulsa Validar fichaje.';return;}}catch{}cameraFrame=requestAnimationFrame(detect);};detect();}catch(err){$('#camera-note').textContent=err.message;}};
}
function adjustAttendance(id){const r=find('assignments',id);const local=d=>d?new Date(new Date(d).getTime()-new Date(d).getTimezoneOffset()*60000).toISOString().slice(0,16):'';modal('Corregir fichaje',formWrap(field('checkIn','Entrada',local(r.checkIn),'datetime-local')+field('checkOut','Salida',local(r.checkOut),'datetime-local')+field('reason','Motivo de la corrección','','text','required',true)));formHandler(b=>api('attendance-adjust',{...b,id,revision:r.revision,checkIn:b.checkIn?new Date(b.checkIn).toISOString():'',checkOut:b.checkOut?new Date(b.checkOut).toISOString():''}));}
$('#modal').addEventListener('close',stopCamera);

document.addEventListener('input',e=>{if(e.target.closest('#invoice-lines'))lineTotal();});
$('#close-modal').innerHTML=icon('close');$('#close-modal').onclick=()=>$('#modal').close();$('#refresh').innerHTML=icon('refresh');$('#menu').innerHTML=icon('menu');$('#logout').innerHTML=icon('logout');$('#menu').onclick=()=>document.body.classList.toggle('nav-open');$('#shade').onclick=()=>document.body.classList.remove('nav-open');
$('#account').onclick=()=>{modal('Cambiar mi contraseña',formWrap(field('current','Contraseña actual','','password','required autocomplete="current-password"',true)+field('password','Nueva contraseña (mínimo 12 caracteres)','','password','required minlength="12" maxlength="128" autocomplete="new-password"',true)));formHandler(async b=>{await api('password',b);data={};$('#app').hidden=true;$('#auth').hidden=false;await authScreen();});};
setInterval(async()=>{if(!data.user||document.hidden||$('#modal').open||polling||busy||$('#search')===document.activeElement)return;polling=true;try{await load();}catch(err){$('#sync').textContent='Sin conexión · reintentando';}finally{polling=false;}},30000);
window.addEventListener('online',()=>{if(data.user)load().catch(e=>toast(e.message,true));});
// Remove the previous demo service worker, if one was installed, so it cannot serve stale screens.
if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
(async()=>{try{await load();}catch{await authScreen();}})();
})();
