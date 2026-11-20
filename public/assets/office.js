'use strict';
(() => {
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',briefcase:'M3 7h18v14H3z M8 7V3h8v4 M3 12a30 30 0 0 0 18 0 M12 10v5',calendar:'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h2 M14 14h2 M8 17h2',file:'M14 2H5v20h14V7z M14 2v5h5 M8 12h8 M8 16h6',folder:'M3 7V4h6l2 3h10v13H3z',wallet:'M3 6h16v4 M3 6v14h18V10H3z M16 14h5',shield:'M12 3 3 7v5c0 5 9 10 9 10s9-5 9-10V7z M8 12l3 3 5-6',clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',plus:'M12 5v14 M5 12h14',search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',refresh:'M20 7V3l-4 4 M20 7a9 9 0 1 0 1 9 M20 7h-5',close:'M6 6l12 12 M18 6 6 18',arrow:'M5 12h14 M14 7l5 5-5 5',logout:'M9 4H3v16h6 M8 12h13 M16 7l5 5-5 5',menu:'M3 6h18 M3 12h18 M3 18h18',download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',upload:'M12 16V3 M7 8l5-5 5 5 M4 16v5h16v-5',edit:'m16 3 5 5-13 13H3v-5z M13 6l5 5',trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',check:'M5 12l4 4L20 5',chevron:'M9 5l7 7-7 7',left:'M15 5l-7 7 7 7',chart:'M4 3v18h18 M8 16v-5 M13 16V6 M18 16V9',building:'M4 21V3h12v18 M16 10h5v11 M8 7h4 M8 11h4 M8 15h4 M8 21v-3h4v3',info:'M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',euro:'M17.5 6.5A7 7 0 1 0 17.5 17.5 M4 10.5h9 M4 13.5h9',message:'M3 4h18v14H7l-4 3z M7 9h10 M7 13h7',availability:'M3 5h18v16H3z M8 3v4 M16 3v4 M3 10h18 M8 15l3 3 5-5'};
const icon=(n)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]||paths.file}"/></svg>`;
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0),day=()=>new Date().toISOString().slice(0,10),fmt=d=>d?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d.slice(0,10)+'T12:00:00')):'—',stamp=d=>d?new Date(d).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
const statuses={planned:'Planificado',confirmed:'Confirmado',in_progress:'En curso',completed:'Finalizado',cancelled:'Cancelado',pending:'Pendiente',draft:'Borrador',issued:'Emitido',partial:'Cobro parcial',paid:'Pagado',rejected:'Rechazado',accepted:'Aceptado',available:'Disponible',unavailable:'No disponible',overdue:'Vencida'};
const fmtTime=t=>{if(!t)return '—';const d=new Date(t);return Number.isNaN(d.getTime())?t:d.toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})};
const badge=s=>`<span class="badge ${esc(s)}">${esc(statuses[s]||s)}</span>`;
const navs=[['dashboard','Inicio','grid','HOY'],['quotes','Presupuestos','file','1 · PLANIFICAR'],['services','Servicios','briefcase'],['calendar','Calendario','calendar'],['clients','Clientes','building'],['workers','Trabajadores','users','2 · EQUIPO'],['availability','Disponibilidad','availability'],['messages','Mensajes','message'],['incidents','Incidencias','info'],['documents','Documentación','folder'],['closed','Cierre y liquidación','check','3 · CERRAR Y COBRAR'],['invoices','Facturación','euro'],['tariffs','Tarifas por categoría','wallet','CONFIGURACIÓN'],['users','Accesos','shield'],['settings','Ajustes de empresa','settings'],['audit','Actividad','clock']];
const descriptions={incidents:'Incidencias comunicadas por los coordinadores y revisión de Gestoría.',messages:'Mensajes privados entre Gestoría y los trabajadores.',orders:'Peticiones, bloques horarios y plazas por cubrir.',closed:'Servicios finalizados: liquidación del personal y facturación.',tariffs:'Tarifario 2026, precios e incrementos personalizables.',dashboard:'Servicios, personal y asignaciones pendientes.',services:'Crea servicios desde presupuestos y asigna a cada trabajador su categoría.',calendar:'Tu planificación, día a día.',assignments:'Personal, turnos, confirmaciones y fichajes.',workers:'Las personas que hacen que todo funcione.',clients:'Contactos y datos de facturación en un único lugar.',documents:'Contratos y documentación vinculados a cada persona o servicio.',availability:'Quién está libre, ocupado o no disponible cada día de la semana.',quotes:'Prepara propuestas y conviértelas en servicios.',invoices:'Borradores, emisión, vencimientos y seguimiento de cobros.',expenses:'Costes y gastos asociados a tus operaciones.',users:'Crea accesos y controla qué puede consultar cada persona.',audit:'Historial de las operaciones guardadas en el servidor.',settings:'Datos fiscales, serie de facturación y preferencias.'};
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
function modal(title,html){$('#modal').classList.remove('wide-modal');$('#modal-title').textContent=title;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();const input=$('#modal-content input:not([type=hidden])');if(input)setTimeout(()=>input.focus(),50);}
function formHandler(handler){$('#editor').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,submit=f.querySelector('[type=submit]'),error=f.querySelector('.form-error');submit.disabled=true;error.hidden=true;try{const result=await handler(Object.fromEntries(new FormData(f)),f);$('#modal').close();if(data.user)await load();if(result?.access?.password){modal('Acceso del trabajador creado',`<div class="notice">Estas credenciales solo se muestran una vez. Entrégalas de forma segura al trabajador y pídele que cambie la contraseña inicial.</div><div class="detail-grid"><div><small>Usuario</small><strong>${esc(result.access.username)}</strong></div><div><small>Contraseña temporal</small><strong style="overflow-wrap:anywhere">${esc(result.access.password)}</strong></div></div><div class="form-footer">${button('copy-credentials','Copiar acceso','check',`data-username="${esc(result.access.username)}" data-password="${esc(result.access.password)}"`,'')}<button type="button" class="btn primary" data-action="close">Entendido</button></div>`);}else toast('Cambios guardados');}catch(err){error.hidden=false;error.className='form-error error';error.textContent=err.message;}finally{submit.disabled=false;}};}
async function authScreen(){let status;try{status=await api('status');}catch(e){$('#auth-card').innerHTML=`<div class="error">${esc(e.message)}</div>`;return;}
 const setup=!status.configured;
 $('#auth-card').innerHTML=`<div class="eyebrow">${setup?'PRIMER ACCESO':'BIENVENIDO A NOVA'}</div><h2>${setup?'Crea tu espacio de trabajo':'Entrar en tu cuenta'}</h2><p>${setup?'Crea la primera cuenta de gestor. Después podrás dar acceso a tu equipo.':'Accede a tus servicios, tu equipo y tus operaciones.'}</p>${setup&&!status.setupAvailable?`<div class="notice">${status.setupState==='too_short'?'El secreto NOVA_SETUP_TOKEN ha llegado a Cloudflare, pero tiene menos de 24 caracteres. Actualiza su valor en GitHub con una clave privada de al menos 24 caracteres y ejecuta de nuevo el workflow.':'La clave de instalación todavía no está disponible en este despliegue. Añade NOVA_SETUP_TOKEN en los secretos del repositorio de GitHub y ejecuta de nuevo el workflow.'}</div>`:''}<form id="auth-form">${setup?field('setupToken','Clave de instalación de Cloudflare','','password','required autocomplete="off"')+field('name','Tu nombre','','text','required autocomplete="name"'):''}${field('username','Usuario o correo','','text','required autocomplete="username"')}<label>Contraseña<div class="password-wrap"><input name="password" id="auth-password" type="password" minlength="${setup?12:1}" maxlength="128" required autocomplete="${setup?'new-password':'current-password'}"><button type="button" class="icon-btn" data-action="show-password" aria-label="Mostrar contraseña">${icon('eye')}</button></div></label><div class="form-error" hidden role="alert"></div><button class="btn primary" type="submit" ${setup&&!status.setupAvailable?'disabled':''}>${setup?'Crear cuenta de gestor':'Acceder'}${icon('arrow')}</button></form><p class="footnote">${setup?'Contraseña de al menos 12 caracteres. La clave de instalación solo se utiliza para crear el primer gestor.':'Si has olvidado tu contraseña, solicita al gestor que la restablezca desde Usuarios y accesos.'}</p>`;
 $('#auth-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;const err=f.querySelector('.form-error');err.hidden=true;try{await api(setup?'setup':'login',Object.fromEntries(new FormData(f)));await load();}catch(ex){err.className='form-error error';err.hidden=false;err.textContent=ex.message;}finally{b.disabled=false;}};
}
async function load(){const state=await api('state');if(state.user?.role==='worker'){window.location.replace('/empleado.html');return;}data=state;$('#auth').hidden=true;$('#app').hidden=false;$('#account-name').textContent=data.user.name;$('#account-role').textContent=({manager:'Gestor',coordinator:'Coordinador',worker:'Trabajador'})[data.user.role];$('#avatar').textContent=data.user.name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();$('#workspace-name').textContent='NOVA Crew';$('#sync').innerHTML='<span class="live-dot"></span>Actualizado '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});if(location.hash.startsWith('#/trabajador/')){const id=decodeURIComponent(location.hash.slice(13));if(list('workers').some(x=>x.id===id)&&page!=='worker-page'){workerFocus=id;page='worker-page'}}if(location.hash.startsWith('#/servicio/')){const id=decodeURIComponent(location.hash.slice(11));if(list('services').some(x=>x.id===id)){serviceFocus=id;page='service-workspace'}}renderNav();render();}
function allowed(){return manager()?navs.map(x=>x[0]):isWorker()?['dashboard','services','calendar','assignments','documents','availability']:['dashboard','services','calendar','assignments','workers','documents','availability'];}
function renderNav(){if(!['service-workspace','service-create','quote-create','worker-page'].includes(page)&&!allowed().includes(page))page='dashboard';$('#nav').innerHTML=navs.filter(n=>allowed().includes(n[0])).map(n=>`${n[3]?`<div class="nav-label">${n[3]}</div>`:''}<button data-page="${n[0]}" class="${(['service-workspace','service-create'].includes(page)?'services':page==='quote-create'?'quotes':page==='worker-page'?'workers':page)===n[0]?'active':''}">${icon(n[2])}<span class="nav-text">${n[1]}</span>${navBadge(n[0])}</button>`).join('');}
function navBadge(k){const n=!data.user||!manager()?0:k==='messages'?unreadMessages().length:k==='incidents'?openIncidents().length:k==='invoices'?list('invoices').filter(invoiceOverdue).length:0;return n?`<b class="nav-badge">${n}</b>`:'';}
function render(){if(page==='worker-page')return workerPage();if(page==='service-workspace')return serviceWorkspacePage();if(page==='service-create')return serviceWizard(serviceCreateQuoteId,true);if(page==='quote-create')return quotePlanEditor(planQuoteId,true);const n=navs.find(n=>n[0]===page);$('#page-title').textContent=isWorker()&&page==='dashboard'?'Mi espacio':n[1];$('#breadcrumb').textContent=n[1];$('#page-description').textContent=descriptions[page];$('#section-label').textContent=manager()?'PANEL DE GESTIÓN':isWorker()?'ÁREA DE TRABAJADOR':'COORDINACIÓN';$('#page-actions').innerHTML='';
 if(page==='tariffs')return tariffGroupsPage();if(page==='incidents')return managerIncidentsPage();if(page==='messages')return managerMessagesPage();if(page==='closed')return closedPage();if(page==='dashboard')return dashboard();if(page==='calendar')return calendar();if(page==='settings')return settingsPage();if(page==='availability')return manager()?teamAvailabilityPage():availabilityPage();if(page==='invoices'&&manager())return invoicesPage();if(page==='audit')return auditPage();
 if(manager()&&['tariffs','services','clients','workers','invoices','quotes','users','assignments','documents'].includes(page)){
 const labels={tariffs:'Nueva categoría',services:'Crear servicio',clients:'Nuevo cliente',workers:'Nuevo trabajador',invoices:'Nueva factura',quotes:'Nuevo presupuesto',expenses:'Nuevo gasto',users:'Crear usuario',assignments:'Asignar personal',documents:'Subir documento'};
 $('#page-actions').innerHTML+=(["workers",'clients'].includes(page)?button('import','Importar CSV','upload','', ''):'')+(page==='services'?button('service-wizard','Crear servicio','plus'):page==='quotes'?button('quote-plan-new','Nuevo presupuesto de personal','plus'):button('new',labels[page],'plus',`data-kind="${page}"`));
 }
 collection();}
function stat(label,value,detail,ico='chart',orange=false){return `<div class="stat ${orange?'orange':''}"><div class="stat-icon">${icon(ico)}</div><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`;}
function toolbar(rows){return `<div class="toolbar"><div class="searchbox">${icon('search')}<input id="search" aria-label="Buscar registros" placeholder="Buscar…" value="${esc(query)}"></div><select id="filter" aria-label="Filtrar estado"><option value="">Todos los estados</option>${Object.entries(statuses).map(([v,l])=>`<option value="${v}" ${filter===v?'selected':''}>${l}</option>`).join('')}</select><span class="record-count">${rows.length} registros</span>${manager()?button('export','Exportar','download','',' small'):''}</div>`;}
function serviceInScope(r){return serviceScope==='all'||phaseMatches(servicePhase(r),serviceScope);}
function filtered(kind){return list(kind).filter(r=>kind!=='services'||!manager()||serviceInScope(r)).filter(r=>!filter||r.status===filter||r.type===filter||(['workers','clients','users'].includes(kind)&&(r.active===false?'unavailable':'available')===filter)||(filter==='overdue'&&((kind==='invoices'&&r.status!=='draft'&&r.paid<r.total&&r.dueDate<day())||(kind==='documents'&&r.expires&&r.expires<day())))).filter(r=>!query||[...Object.values(r).filter(v=>typeof v==='string'),name('clients',r.clientId),name('workers',r.workerId),name('services',r.serviceId)].join(' ').toLowerCase().includes(query.toLowerCase()));}
function rowActions(r,kind){return `<div class="row-actions">${action('view','Ver detalle',r.id,kind)}${manager()&&(!['invoices','quotes'].includes(kind)||r.status==='draft')?action('edit','Editar',r.id,kind,'edit'):''}</div>`;}
function table(headers,rows){return `<div class="panel"><div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`;}







let planRows=[],planQuoteId='';
function quoteScheduleNames(){return [...new Set(list('tariffs').filter(t=>t.active).map(t=>t.schedule||'Tarifa estándar 2026'))]}
function quotePlanRates(){
 const form=$('#quote-plan-form'),schedule=form?.elements.schedule.value||'Tarifa estándar 2026';
 return list('tariffs').filter(t=>t.active&&(t.schedule||'Tarifa estándar 2026')===schedule);
}
function quotePlanRowHTML(p={},i=0){
 const rates=quotePlanRates(),date=$('#quote-plan-form')?.elements.date?.value||day();
 const f=(key,label,value='',type='text',attr='')=>'<label>'+label+'<input data-plan="'+key+'" value="'+esc(value)+'" type="'+type+'" '+attr+'></label>';
 return '<section class="quote-plan-row" data-plan-index="'+i+'"><header><strong>Bloque '+(i+1)+'</strong><div class="row-actions">'+
 button('quote-plan-duplicate','Duplicar','plus','data-index="'+i+'" type="button"','')+
 button('quote-plan-remove','Eliminar','trash','data-index="'+i+'" type="button"','')+'</div></header>'+
 '<div class="quote-plan-grid">'+
 f('serviceType','Tipo de servicio',p.serviceType||'LOAD IN')+
 f('date','Día',p.date||date,'date','required')+f('start','Inicio',p.start||'08:00','time','required')+
 f('endDate','Día final',p.endDate||p.date||date,'date','required')+f('end','Fin',p.end||'18:00','time','required')+
 '<label>Categoría de personal<select data-plan="categoryId" required>'+selectOptions(rates.map(r=>({id:r.id,name:r.name+(r.clientRate==null?' · Sin tarifa':' · '+euro(r.clientRate))})),p.categoryId)+'</select></label>'+
 f('quantity','N.º trabajadores',p.quantity||1,'number','min="1" max="100" step="1"')+
 f('team','Equipo / escenario',p.team||'')+
 '<label>Coordinador de este día y tipo de servicio<select data-plan="coordinatorId">'+selectOptions(list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId),p.coordinatorId,'Sin asignar')+'</select></label>'+
 f('locationName','Ubicación / recinto',p.locationName||'')+
 f('locationAddress','Dirección del lugar',p.locationAddress||'')+
 f('pause','Pausa (horas)',p.pause??0,'number','min="0" max="24" step="0.5"')+
 '</div></section>';
}
function captureQuotePlanRows(){
 const root=$('#quote-plan-rows');if(!root)return;
 planRows=[...root.querySelectorAll('.quote-plan-row')].map(row=>
  Object.fromEntries([...row.querySelectorAll('[data-plan]')].map(el=>[el.dataset.plan,el.value])));
}
function drawQuotePlanRows(){const root=$('#quote-plan-rows');if(root)root.innerHTML=planRows.map(quotePlanRowHTML).join('');quotePlanEstimate()}
function quotePlanEstimate(){
 const root=$('#quote-plan-estimate');if(!root)return;
 const config=data.settings||{vat:21},rates=quotePlanRates();let base=0,invalid=0,crew=0;
 for(const p of $$('#quote-plan-rows .quote-plan-row').map(row=>
   Object.fromEntries([...row.querySelectorAll('[data-plan]')].map(el=>[el.dataset.plan,el.value])))){
  if(!p.categoryId)continue;
  const t=rates.find(x=>x.id===p.categoryId),n=Number(p.quantity),pause=Number(p.pause||0);
  const from=Date.parse(p.date+'T'+p.start+':00Z'),to=Date.parse(p.endDate+'T'+p.end+':00Z');
  if(!t||t.clientRate==null||!Number.isFinite(from)||!Number.isFinite(to)||to<=from||!Number.isInteger(n)||n<1){invalid++;continue}
  const units=t.unit==='day'?1:Math.max((to-from)/3600000-pause,t.minHours);
  if(units<=0){invalid++;continue}
  base+=Math.round(n*units*t.clientRate*(1+(t.incrementPercent||0)/100)*100)/100;crew+=n;
 }
 root.innerHTML='<div class="quote-plan-total"><div><small>Personal presupuestado</small><strong>'+crew+'</strong></div>'+
 '<div><small>Base estimada</small><strong>'+euro(base)+'</strong></div>'+
 '<div><small>Con IVA ('+esc(config.vat??21)+'%)</small><strong>'+euro(base*(1+Number(config.vat??21)/100))+'</strong></div></div>'+
 (invalid?'<p class="error">Revisa '+invalid+' bloques: categoría sin precio, fechas u horas incorrectas.</p>':'');
}
function quotePlanEditor(id='',refresh=false){
 if(!refresh)planQuoteId=id;
 page='quote-create';renderNav();$('#page-title').textContent=id?'Editar presupuesto':'Nuevo presupuesto';
 $('#breadcrumb').textContent='Presupuestos / '+(id?'Editar':'Nuevo');$('#section-label').textContent='PLANIFICACIÓN DE PERSONAL';
 $('#page-description').textContent='Jornadas, tipos de servicio, horarios, ubicaciones y categorías.';
 $('#page-actions').innerHTML=button('quote-create-cancel','Volver a presupuestos','left','','');
 const q=id?find('quotes',id):null;if(q&&q.status!=='draft')return toast('Solo puedes editar un presupuesto en borrador.',true);
 planQuoteId=id;
 const schedules=quoteScheduleNames(),chosen=q?.schedule||schedules[0]||'Tarifa estándar 2026';
 const d=q?.date||day(),due=q?.dueDate||new Date(Date.now()+30*86400000).toISOString().slice(0,10);
 planRows=q?.staffPlan?.length?q.staffPlan.map(x=>({...x})):[{quantity:1,date:d,endDate:d,start:'08:00',end:'18:00',pause:0,serviceType:'LOAD IN'}];
 const form='<form id="quote-plan-form"><div class="form-grid">'+
 field('serviceName','Nombre del evento / servicio',q?.serviceName||'','text','required',true)+
 select('clientId','Cliente',list('clients').filter(c=>c.active),q?.clientId)+
 select('schedule','Tarifa aplicable',schedules.map(name=>({id:name,name})),chosen)+
 field('serviceVenue','Ubicación principal (opcional)',q?.serviceVenue||'')+
 field('date','Fecha del presupuesto',d,'date','required')+field('dueDate','Válido hasta',due,'date','required')+
 '<label class="wide">Observaciones<textarea name="notes">'+esc(q?.notes||'')+'</textarea></label></div>'+
 '<div class="subhead"><div><h3>Jornadas, tipos de servicio y personal</h3><p>Añade un bloque por horario, ubicación y categoría. Puedes duplicar bloques para otros días.</p></div>'+
 button('quote-plan-add','Añadir bloque','plus','type="button"','')+'</div>'+
 '<div id="quote-plan-rows"></div><div id="quote-plan-estimate"></div>'+
 '<div class="form-error" role="alert" hidden></div>'+
 '<div class="form-footer"><button type="button" class="btn" data-action="close">Cancelar</button><button type="submit" class="btn primary">Guardar presupuesto</button></div></form>';
 $('#content').innerHTML='<div class="service-create-intro"><h2>'+esc(q?'Editar presupuesto':'Presupuesto de personal')+'</h2><p>Organiza las líneas por jornada y tipo de servicio.</p></div>'+form;window.scrollTo({top:0,behavior:'auto'});
 drawQuotePlanRows();
 const formEl=$('#quote-plan-form');
 formEl.elements.schedule.addEventListener('change',()=>{
  const previous=planRows.map(x=>({...x}));captureQuotePlanRows();
  const rates=quotePlanRates();
  planRows=planRows.map((r,i)=>{const oldRate=list('tariffs').find(x=>x.id===r.categoryId);
   return {...r,categoryId:rates.find(t=>t.name===oldRate?.name)?.id||''};
  });drawQuotePlanRows();
 });
 formEl.addEventListener('input',e=>{if(e.target.closest('.quote-plan-row'))quotePlanEstimate()});
 formEl.onsubmit=async e=>{
  e.preventDefault();const submit=formEl.querySelector('[type=submit]'),err=formEl.querySelector('.form-error');
  captureQuotePlanRows();err.hidden=true;
  try{
   if(planRows.some(p=>!p.categoryId||!p.quantity))throw Error('Todos los bloques necesitan categoría y cantidad.');
   submit.disabled=true;
   const record={...Object.fromEntries(new FormData(formEl)),staffPlan:planRows,...(q?{id:q.id,revision:q.revision}:{})};
   const result=await api('quote-plan-save',{record});
   page='quotes';await load();detail('quotes',result.record.id);
   toast('Presupuesto guardado · '+planRows.length+' bloques');
  }catch(ex){err.className='form-error error';err.textContent=ex.message;err.hidden=false}finally{submit.disabled=false}
 };
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
 modal('Duplicar tarifa',formWrap(field('name','Nombre de la nueva tarifa','','text','required',true)+select('source','Copiar todas las categorías de',sources.map(name=>({id:name,name})),sources[0])+field('increasePercent','Incremento (%)',0,'number','min="0" max="500" step="0.01"')+select('applyTo','Aplicar el incremento a',[{id:'client',name:'Tarifa cliente'},{id:'worker',name:'Pago trabajador'},{id:'both',name:'Ambos precios'}],'client')+'<p class="footnote wide">Se crea una copia independiente de todas las categorías y mínimos. No se modifica la tarifa original.</p>','Duplicar tarifa'));
 formHandler(b=>api('tariff-schedule-create',b));
}
let wizardPositions=[],serviceCreateQuoteId='';
function wizardPositionRow(p={},index=0){
 const chosen=$('#service-wizard-form [name=tariffSchedule]')?.value||'Tarifa estándar 2026',tariffs=list('tariffs').filter(t=>t.active&&(t.schedule||'Tarifa estándar 2026')===chosen),workers=list('workers').filter(w=>w.active);
 const f=(key,label,value='',type='text')=>'<label>'+label+'<input data-position="'+key+'" type="'+type+'" value="'+esc(value)+'"></label>';
 return '<section class="position-row" data-position-index="'+index+'"><header><strong>Línea '+(index+1)+'</strong><div class="row-actions">'+button('wizard-duplicate-position','Duplicar','plus','data-index="'+index+'" type="button"','')+'<button type="button" data-action="wizard-remove-position" data-index="'+index+'" class="btn">Eliminar</button></div></header><div class="form-grid">'+
 '<label>Categoría individual<select data-position="categoryId" required>'+selectOptions(tariffs.map(t=>({id:t.id,name:(t.schedule||'Tarifa estándar 2026')+' · '+t.name})),p.categoryId)+'</select></label>'+
 '<label>Trabajador (opcional)<select data-position="workerId">'+selectOptions(workers.map(w=>({id:w.id,name:w.name})),p.workerId,'Dejar sin asignar')+'</select></label>'+
 f('serviceType','Tipo de servicio',p.serviceType||'Montaje')+f('quantity','N.º puestos con esta categoría',p.quantity||1,'number')+f('team','Equipo / escenario',p.team)+
 f('date','Fecha',p.date||$('#service-wizard-form [name=date]')?.value||'','date')+f('start','Inicio',p.start||'08:00','time')+
 f('endDate','Fecha de fin',p.endDate||p.date||$('#service-wizard-form [name=date]')?.value||'','date')+f('end','Fin',p.end||'18:00','time')+
 f('pause','Pausa (h)',p.pause??0,'number')+
 f('locationName','Ubicación',p.locationName||'')+f('locationAddress','Dirección',p.locationAddress||'')+
 '<label>Coordinador de este puesto<select data-position="coordinatorId">'+selectOptions(list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId),p.coordinatorId,'Sin asignar')+'</select></label></div></section>';
}
function wizardRows(){
 const root=$('#wizard-positions');if(root)root.innerHTML=wizardPositions.map(wizardPositionRow).join('');
}
function captureWizardPositions(){
 const nodes=$$('#wizard-positions .position-row');
 wizardPositions=nodes.map(el=>Object.fromEntries([...el.querySelectorAll('[data-position]')].map(input=>[input.dataset.position,input.value])));
}

function serviceWizard(quoteId='',refresh=false){
 if(!refresh)serviceCreateQuoteId=quoteId;
 page='service-create';renderNav();
 $('#page-title').textContent='Crear servicio';$('#breadcrumb').textContent='Servicios / Nuevo servicio';$('#section-label').textContent='PLANIFICACIÓN OPERATIVA';
 $('#page-description').textContent='Organiza jornadas, tipos de servicio, horarios, personal y ubicaciones en una página.';
 $('#page-actions').innerHTML=button('service-create-cancel','Volver a servicios','left','','');
 const quote=quoteId?find('quotes',quoteId):null,clients=list('clients').filter(c=>c.active),coordinators=list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId);
 wizardPositions=quote?.staffPlan?.length?[]:[{}];
 const eligible=list('quotes').filter(q=>['issued','accepted'].includes(q.status)&&(!q.serviceId||q.id===quoteId));
 const start=quote?.planStartDate||day(),end=quote?.planEndDate||start;
 const body='<div class="service-create-intro"><h2>Datos generales y planificación</h2><p>Configura el servicio y añade tantos puestos individuales como necesites.</p></div><form id="service-wizard-form"><div class="notice">Selecciona un presupuesto existente o crea un servicio nuevo. Los bloques de un presupuesto de personal se trasladarán automáticamente a sus jornadas y puestos.</div>'+
 '<div class="form-grid"><label class="wide">Presupuesto existente (opcional)<select name="quoteId" id="wizard-quote">'+selectOptions(eligible.map(q=>({id:q.id,name:(q.number||'Presupuesto')+' · '+name('clients',q.clientId)})),quoteId,'Crear sin presupuesto')+'</select></label>'+
 field('name','Nombre del servicio',quote?.serviceName||'','text','required',true)+
 select('clientId','Cliente',clients,quote?.clientId)+select('tariffSchedule','Tarifa aplicable',quoteScheduleNames().map(name=>({id:name,name})),quote?.schedule||quoteScheduleNames()[0]||'Tarifa estándar 2026')+field('venue','Recinto principal',quote?.serviceVenue||'','text','required')+
 field('date','Primer día',start,'date','required')+field('start','Hora de inicio','08:00','time','required')+
 field('endDate','Último día',end,'date','required')+field('end','Hora de fin','23:59','time','required')+
 select('coordinatorId','Coordinador principal',coordinators,'')+'</div>'+
 '<div id="wizard-quote-preview"></div>'+
 '<div class="subhead"><div><h3>Jornadas, horarios y puestos</h3><p>Una línea genera puestos individuales según la cantidad. Cada trabajador se podrá asignar por separado.</p></div><div class="row-actions">'+button('wizard-add-day','Añadir otro día','calendar','type="button"','')+button('wizard-add-position','Añadir línea','plus','type="button"','')+'</div></div>'+
 '<div id="wizard-positions"></div><div class="form-error" role="alert" hidden></div><div class="form-footer"><button type="button" class="btn" data-action="close">Cancelar</button><button class="btn primary" type="submit">Crear servicio y jornadas</button></div></form>';
 $('#content').innerHTML=body;
 window.scrollTo({top:0,behavior:'auto'});
 function quotePreview(){
  const q=find('quotes',$('#wizard-quote').value),area=$('#wizard-quote-preview');
  area.innerHTML=q?.staffPlan?.length?'<div class="notice"><strong>'+q.staffPlan.length+' bloques presupuestados · '+q.staffPlan.reduce((a,r)=>a+r.quantity,0)+' puestos</strong><p>Se crearán las jornadas, horarios, categorías y ubicaciones exactamente desde el presupuesto. Puedes añadir más puestos después en la página del servicio.</p></div>':'';
 }
 wizardRows();quotePreview();
 $('#wizard-quote').onchange=()=>{
  const q=find('quotes',$('#wizard-quote').value);
  if(q){
   const form=$('#service-wizard-form');form.elements.clientId.value=q.clientId;form.elements.tariffSchedule.value=q.schedule||'Tarifa estándar 2026';
   if(q.serviceName)form.elements.name.value=q.serviceName;
   if(q.serviceVenue)form.elements.venue.value=q.serviceVenue;
   if(q.planStartDate)form.elements.date.value=q.planStartDate;
   if(q.planEndDate)form.elements.endDate.value=q.planEndDate;
  }
  captureWizardPositions();wizardPositions=q?.staffPlan?.length?[]:(wizardPositions.length?wizardPositions:[{}]);
  wizardRows();quotePreview();
 };
 $('#service-wizard-form [name=tariffSchedule]').onchange=()=>{captureWizardPositions();const valid=new Set(list('tariffs').filter(t=>t.active&&(t.schedule||'Tarifa estándar 2026')===$('#service-wizard-form [name=tariffSchedule]').value).map(t=>t.id));wizardPositions=wizardPositions.map(x=>({...x,categoryId:valid.has(x.categoryId)?x.categoryId:''}));wizardRows()};
 const form=$('#service-wizard-form');
 form.onsubmit=async e=>{
  e.preventDefault();const submit=form.querySelector('[type=submit]'),err=form.querySelector('.form-error');
  err.hidden=true;captureWizardPositions();
  try{
   const b=Object.fromEntries(new FormData(form));
   if(wizardPositions.some(p=>!p.categoryId))throw Error('Elige una categoría para cada línea, o elimina las líneas vacías.');
   const positions=[];for(const row of wizardPositions){const qty=Number(row.quantity||1);if(!Number.isInteger(qty)||qty<1||qty>100)throw Error('Cada línea debe tener entre 1 y 100 puestos.');if(qty>1&&row.workerId)throw Error('Para asignar un trabajador concreto, utiliza una línea de un solo puesto.');for(let i=0;i<qty;i++)positions.push({...row,quantity:1});}
   if(positions.length>300)throw Error('El máximo es de 300 puestos por servicio. Divide el evento en varios servicios.');
   submit.disabled=true;
   const result=await api('service-create',{quoteId:b.quoteId,service:b,positions});
   await load();openServicePage(result.record.id);
   toast('Servicio creado con '+result.positions.length+' puestos y '+result.days.length+' jornadas');
  }catch(ex){err.className='form-error error';err.textContent=ex.message;err.hidden=false}finally{submit.disabled=false}
 };
}
let serviceFocus='',serviceTab='planning',blockCategoryRows=[{categoryId:'',quantity:1}],blockEditorId='',blockEditorService='';
function openServicePage(id){
 if(!find('services',id))return toast('Servicio no encontrado',true);
 serviceFocus=id;serviceTab='planning';page='service-workspace';query='';filter='';
 if(location.hash!=='#/servicio/'+encodeURIComponent(id))history.pushState({serviceId:id},'','#/servicio/'+encodeURIComponent(id));
 renderNav();serviceWorkspacePage();window.scrollTo({top:0,behavior:'auto'});
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
 return '<div class="table-wrap"><table><thead><tr><th>Categoría</th><th>Trabajador</th><th>Equipo / Horario</th><th>Confirmación / fichaje</th><th></th></tr></thead><tbody>'+
 posts.map(p=>{
   const a=assignments.find(x=>x.orderLineId===p.id&&!x.archived);
   return '<tr><td><strong>'+esc(p.role)+'</strong><small>'+esc(p.serviceType||'')+'</small></td>'+
   '<td>'+(a?esc(name('workers',a.workerId)):'<span class="unfilled-tag">Sin cubrir</span>')+'</td>'+
   '<td>'+esc(p.team||'—')+'<small>'+esc(p.date)+' · '+esc(p.start)+'–'+esc(p.end)+'</small><small>Coordinador: '+esc(name('users',p.coordinatorId||list('serviceBlocks').find(b=>b.id===p.blockId)?.coordinatorId))+'</small></td><td>'+(a?badge(a.status)+'<small>Entrada: '+(a.checkIn?fmtTime(a.checkIn):'—')+' · Salida: '+(a.checkOut?fmtTime(a.checkOut):'—')+'</small>':'—')+'</td><td><div class="row-actions">'+
   (a?action('view','Ver turno',a.id,'assignments')+action('edit','Modificar asignación',a.id,'assignments','edit')+button('attendance-service-edit','Corregir fichaje','clock','data-id="'+esc(a.id)+'"',''):button('assign-slot','Asignar','plus','data-id="'+esc(p.id)+'"',''))+
   action('edit','Editar puesto',p.id,'orderLines','edit')+'</div></td></tr>';
 }).join('')+'</tbody></table></div>';
}
function serviceWorkspacePage(){
 const {sv,days,blocks,places,coordinators,positions,assigned}=serviceRows();
 if(!sv){page='services';return render()}
 $('#page-title').textContent=sv.name;$('#breadcrumb').textContent='Servicios / '+sv.name;
 $('#section-label').textContent='SERVICIO · '+(statuses[sv.status]||sv.status||'').toUpperCase();
 $('#page-description').textContent=fmt(sv.date)+' – '+fmt(sv.endDate)+' · '+sv.venue;
 $('#page-actions').innerHTML=button('service-back','Volver a servicios','left','','')+
 button('edit','Editar servicio','edit','data-kind="services" data-id="'+esc(sv.id)+'"','');
 const svStaff=staffing(sv),totalUnfilled=svStaff.missing;
 const menu=[['planning','Jornadas y horarios'],['staff','Personal y fichajes'],['places','Ubicaciones'],['coordinators','Responsables y permisos'],['closing','Cierre y facturación']];
 const nav='<div class="service-workspace-nav">'+menu.map(([k,label])=>'<button class="'+(serviceTab===k?'selected':'')+'" type="button" data-action="service-tab" data-tab="'+k+'">'+label+'</button>').join('')+'</div>';
 const top='<div class="service-overview"><div><span class="eyebrow">CLIENTE Y RECINTO</span><h3 class="so-client">'+esc(name('clients',sv.clientId))+'</h3><p>'+esc(sv.venue)+'</p>'+
 '<div class="service-meta">'+badge(sv.status)+'<span>'+fmt(sv.date)+' — '+fmt(sv.endDate)+'</span><span>Tarifa: '+esc(sv.tariffSchedule||'Estándar')+'</span></div></div>'+
 '<div class="service-metrics"><div><strong>'+svStaff.need+'</strong><small>Puestos</small></div><div><strong>'+assigned.length+'</strong><small>Asignados</small></div><div class="'+(totalUnfilled?'warn':'')+'"><strong>'+totalUnfilled+'</strong><small>Sin cubrir</small></div><div><strong>'+assigned.filter(a=>a.checkIn&&!a.checkOut).length+'</strong><small>Presentes ahora</small></div></div>'+(()=>{const ph=servicePhase(sv);return '<div class="service-flow-bar">'+flowStepper(ph)+'<div class="service-next"><div><span class="eyebrow">'+(ph.next?'SIGUIENTE PASO':'ESTADO')+'</span><strong class="flow-label '+ph.tone+'">'+esc(ph.label)+'</strong></div>'+(nextButton(ph,false)||'<span class="flow-ok">'+icon('check')+'Nada pendiente</span>')+'</div></div>';})()+'</div>';
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
    (dayRecord?button('service-day-edit','Editar jornada','edit','data-id="'+esc(dayRecord.id)+'"','')+button('service-day-remove','Eliminar jornada','trash','data-id="'+esc(dayRecord.id)+'"',''):'')+'</div></header>'+
    blocksOn.map(block=>{
     const posts=positions.filter(p=>p.blockId===block.id);
     return '<article class="service-block"><div class="service-block-heading"><div><span class="eyebrow">'+esc(block.start)+' – '+esc(block.end)+'</span><h4>'+esc(block.serviceType)+'</h4>'+
     '<p>'+esc(block.team||'Sin equipo')+' · '+esc(servicePlaceName(block.placeId))+'</p><p><strong>Coordinador del turno:</strong> '+esc(block.coordinatorId?name('users',block.coordinatorId):'Sin asignar')+'</p></div>'+
     '<div class="service-block-tools">'+button('service-block-add-positions','Añadir puestos','plus','data-id="'+esc(block.id)+'"','')+
     button('service-block-operators','Crew Head y coordinadores','users','data-id="'+esc(block.id)+'"','')+
     button('service-block-edit','Editar bloque','edit','data-id="'+esc(block.id)+'"','')+
     button('service-block-remove','Eliminar bloque','trash','data-id="'+esc(block.id)+'"','')+'</div></div>'+
     servicePostTable(posts,assigned)+'</article>';
    }).join('')+
    (legacy.length?'<article class="service-block"><div class="service-block-heading"><div><h4>Puestos existentes</h4><p>Asignaciones anteriores no agrupadas por bloque</p></div></div>'+servicePostTable(legacy,assigned)+'</article>':'')+
    (!blocksOn.length&&!legacy.length?'<p class="service-empty">Todavía no hay horarios para esta jornada.</p>':'')+
    '</section>';
   }).join('');
 }else if(serviceTab==='staff'){
  body='<div class="service-section-header"><div><h3>Personal y fichajes del servicio</h3><p>Asigna cada trabajador a un puesto, revisa sus confirmaciones y corrige los fichajes desde su turno.</p></div>'+
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
 if(serviceTab==='places'){
  const docs=list('documents').filter(d=>d.serviceId===sv.id&&d.shareWithStaff);
  body+='<div class="service-section-header" style="margin-top:26px"><div><h3>Documentación para el personal</h3><p>Plan de autoprotección, PRL del recinto u otras instrucciones. La descargan los trabajadores asignados desde la página del servicio.</p></div>'+button('service-doc-new','Subir documento','upload','data-id="'+esc(sv.id)+'"','')+'</div>'+
  (docs.length?'<div class="panel">'+docs.map(d=>'<div class="list-item"><div class="grow"><p>'+esc(d.name)+'</p><small>'+fmt(d.createdAt)+' · '+Math.round(d.size/1024)+' KB</small></div><a class="icon-btn" href="/api/office/document?id='+encodeURIComponent(d.id)+'" aria-label="Descargar">'+icon('download')+'</a></div>').join('')+'</div>':'<div class="panel empty">Sin documentos compartidos con el personal.</div>');
 }
 }else if(serviceTab==='closing'){
  body=serviceClosingTab(sv);
 }else{
  const allUsers=list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId);
  body='<div class="service-section-header"><div><h3>Coordinación por día y turno</h3><p>Asigna Crew Heads y coordinadores normales desde cada tipo de servicio. Los permisos se limitan al bloque elegido.</p></div>'+
   button('service-coordinator-new','Añadir coordinador','plus','','')+'</div>'+
   '<div class="panel"><div class="list-item"><span class="grow">Coordinador general (opcional)</span><strong>'+esc(name('users',sv.coordinatorId))+'</strong>'+
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
 '<div class="wide">'+button('service-maps-search','Buscar en Google Maps','search','type="button"','')+'</div>';
 modal(old?'Editar ubicación':'Añadir ubicación',formWrap(content));
 const link=$('#editor [name=mapsUrl]');
 link.addEventListener('change',()=>{
  const m=link.value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)||link.value.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if(m){$('#editor [name=lat]').value=m[1];$('#editor [name=lng]').value=m[2];}
 });
 formHandler(b=>api('service-place-save',{record:{...b,serviceId:serviceFocus,...(old?{id:old.id,revision:old.revision}:{})}}));
}
function serviceBlockCategoryField(c={},i=0){
 return '<div class="block-category-row" data-category-index="'+i+'">'+
 '<label>Categoría<select data-cat="categoryId" required>'+selectOptions(list('tariffs').filter(t=>t.active&&(!find('services',serviceFocus)?.tariffSchedule||(t.schedule||'Tarifa estándar 2026')===find('services',serviceFocus).tariffSchedule)).map(t=>({id:t.id,name:t.name})),c.categoryId)+'</select></label>'+
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
 coordinators=list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId);
 blockEditorId=id;blockEditorService=serviceFocus;blockCategoryRows=[{categoryId:'',quantity:1}];
 const fields=field('serviceType','Tipo de servicio (LOAD IN, SHOW CALL...)',old?.serviceType||'LOAD IN','text','required',true)+
 field('date','Fecha inicio',old?.date||preDate||sv.date,'date','required')+
 field('start','Hora inicio',old?.start||'08:00','time','required')+
 field('endDate','Fecha fin',old?.endDate||preDate||sv.date,'date','required')+
 field('end','Hora fin',old?.end||'18:00','time','required')+
 select('placeId','Ubicación',places.map(p=>({id:p.id,name:p.name})),old?.placeId||'')+
 select('coordinatorId','Trabajador coordinador de este día y tipo de servicio',coordinators,old?.coordinatorId||'')+
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
function serviceBlockOperatorsEditor(blockId){
 const block=find('serviceBlocks',blockId);if(!block)return;
 const operators=list('serviceBlockOperators').filter(o=>o.blockId===block.id),staff=list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId);
 const people='<div class="service-operator-list">'+operators.map(o=>'<div class="list-item"><div class="grow"><strong>'+esc(name('users',o.userId))+'</strong><small>'+esc(o.kind==='crew_head'?'Crew Head · responsable del bloque':'Coordinador de este bloque')+'</small></div>'+
 button('block-operator-remove','Quitar','trash','data-id="'+esc(o.id)+'"','')+'</div>').join('')+'</div>';
 const form='<form id="block-operator-form"><div class="notice"><strong>'+esc(block.date)+' · '+esc(block.serviceType)+' · '+esc(block.start)+'–'+esc(block.end)+'</strong><p>Los permisos se limitan a este bloque; Crew Head puede añadir coordinadores normales sin ser gestor de oficina.</p></div>'+
 people+'<div class="form-grid">'+select('userId','Trabajador',staff,'',true)+select('kind','Permiso del bloque',[{id:'crew_head',name:'Crew Head (responsable)'},{id:'coordinator',name:'Coordinador normal'}],'coordinator')+'</div>'+
 '<div class="form-footer"><button type="button" class="btn" data-action="close">Cerrar</button><button type="submit" class="btn primary">Asignar al bloque</button></div><div class="form-error" hidden></div></form>';
 modal('Personal que coordina este turno',form);
 $('#block-operator-form').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,err=form.querySelector('.form-error'),submit=form.querySelector('[type=submit]');submit.disabled=true;err.hidden=true;
  try{await api('service-block-operator-save',{record:{...Object.fromEntries(new FormData(form)),blockId}});await load();serviceBlockOperatorsEditor(blockId);toast('Permiso asignado')}
  catch(ex){err.textContent=ex.message;err.className='form-error error';err.hidden=false}
  finally{submit.disabled=false}
 };
}
function serviceCoordinatorEditor(){
 const all=list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId);
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

/* ---------- NOVA Crew · mejoras de gestión (v18) ---------- */
let serviceScope='active',incidentTab='open',msgPeer='',availWeek='';
const svcPositions=id=>list('orderLines').filter(l=>l.serviceId===id&&l.status!=='cancelled');
const svcAssigned=id=>list('assignments').filter(a=>a.serviceId===id&&a.status!=='rejected');
function staffing(s){
 const pos=svcPositions(s.id),as=svcAssigned(s.id);
 const missing=pos.length?pos.filter(l=>!as.some(a=>a.orderLineId===l.id)).length:Math.max(0,(Number(s.required)||0)-as.length);
 const need=as.length+missing;
 return {assigned:as.length,need,missing,pct:need?Math.round(as.length/need*100):100,present:as.filter(a=>a.checkIn&&!a.checkOut).length,finished:as.filter(a=>a.checkOut).length,pending:as.filter(a=>a.status==='pending').length};
}
function progress(st,compact=false){return `<div class="staff-progress ${st.missing?'warn':'ok'}" title="${st.assigned} de ${st.need} puestos cubiertos"><i style="width:${st.pct}%"></i></div>${compact?'':`<small>${st.assigned}/${st.need} cubiertos${st.missing?' · faltan '+st.missing:''}</small>`}`;}
const settingsIncomplete=()=>{const s=data.settings||{};return !s.name||!s.taxId||!s.address;};
const invoiceOpen=i=>i.status!=='draft'&&(i.paid||0)<i.total;
const invoiceOverdue=i=>invoiceOpen(i)&&i.dueDate<day();
const seenKey=()=>'nova-msg-seen-'+(data.user?.id||'');
function messagesSeen(){try{return localStorage.getItem(seenKey())||''}catch{return ''}}
function markMessagesSeen(){try{localStorage.setItem(seenKey(),new Date().toISOString())}catch{}}
function unreadMessages(){const seen=messagesSeen(),me=data.user?.id;return list('messages').filter(m=>m.senderId!==me&&find('users',m.senderId)?.role!=='manager'&&m.createdAt>seen);}
const openIncidents=()=>list('incidents').filter(i=>i.status!=='resolved');
const isoAdd=(d,n)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);};
const relDay=d=>d===day()?'Hoy':d===isoAdd(day(),1)?'Mañana':fmt(d);

function dashboard(){
 const active=list('services').filter(s=>!['completed','cancelled'].includes(s.status));
 const upcoming=active.filter(s=>s.endDate>=day()).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
 const today=upcoming.filter(s=>s.date<=day()&&s.endDate>=day());
 const soon=upcoming.filter(s=>s.date<=isoAdd(day(),14));
 const as=list('assignments'),pending=as.filter(a=>a.status==='pending');
 const missing=soon.reduce((n,s)=>n+staffing(s).missing,0);
 const invoices=list('invoices'),receivable=invoices.filter(invoiceOpen),overdue=invoices.filter(invoiceOverdue);
 const receivableTotal=receivable.reduce((n,i)=>n+i.total-(i.paid||0),0);
 const stats=stat('Servicios activos',upcoming.length,`${today.length} hoy · ${upcoming.length-today.length} próximos`,'briefcase',true)+
  stat('Puestos sin cubrir',missing,'En los próximos 14 días','users')+
  stat('Confirmaciones pendientes',pending.length,'Turnos sin respuesta del trabajador','clock')+
  stat('Pendiente de cobro',euro(receivableTotal),overdue.length?`${overdue.length} factura(s) vencida(s)`:`${receivable.length} factura(s) emitidas`,'euro');
 const staleOpen=as.filter(a=>a.checkIn&&!a.checkOut&&(a.endDate||a.date)<day());
 const unsettled=list('services').filter(s=>s.status==='completed'&&s.settlementStatus!=='confirmed');
 const acceptedQuotes=list('quotes').filter(q=>q.status==='accepted'&&!q.serviceId);
 const expiring=list('documents').filter(d=>d.expires&&d.expires<=isoAdd(day(),30));
 const unread=unreadMessages(),incidents=openIncidents(),toClose=active.filter(s=>s.endDate<day());
 const attention=[
  [incidents.length,'Incidencias abiertas','Comunicadas por coordinadores','info','data-page="incidents"'],
  [missing,'Puestos sin cubrir','Servicios de los próximos 14 días','users','data-page="services"'],
  [toClose.length,'Servicios por cerrar','Ya terminaron y siguen sin marcar como finalizados','briefcase','data-action="svc-scope-go" data-scope="close"'],
  [staleOpen.length,'Fichajes sin cerrar','Entradas de días anteriores sin salida','clock','data-page="services"'],
  [unsettled.length,'Servicios por liquidar','Finalizados sin liquidación confirmada','check','data-page="closed"'],
  [overdue.length,'Facturas vencidas',euro(overdue.reduce((n,i)=>n+i.total-(i.paid||0),0))+' pendientes','euro','data-action="go-filter" data-target="invoices" data-filter="overdue"'],
  [billingQueue().length,'Pendiente de facturar',euro(billingQueue().reduce((n,x)=>n+x.amount,0))+' en servicios finalizados o días cerrados','euro','data-action="go-filter" data-target="invoices" data-filter=""'],
  [acceptedQuotes.length,'Presupuestos aceptados','Sin servicio creado','file','data-page="quotes"'],
  [expiring.length,'Documentos por revisar','Caducados o vencen en 30 días','folder','data-page="documents"'],
  [unread.length,'Mensajes nuevos','De trabajadores','message','data-page="messages"']
 ].filter(x=>x[0]>0);
 const todayPanel=today.length?today.map(s=>{const st=staffing(s);return `<button class="list-item list-link" data-action="open-service" data-id="${esc(s.id)}"><div class="live-badge"><span class="live-dot"></span>${s.start}</div><div class="grow"><p>${esc(s.name)}</p><small>${esc(s.venue)} · ${s.start}–${s.end}</small></div><div class="today-count"><strong>${st.present}</strong><small>presentes</small></div><div class="today-count"><strong>${st.finished}</strong><small>salidas</small></div><div class="today-count"><strong>${st.assigned}</strong><small>asignados</small></div>${icon('chevron')}</button>`}).join(''):`<p class="panel-empty">Hoy no hay servicios en curso.</p>`;
 const upcomingPanel=upcoming.filter(s=>!today.includes(s)).slice(0,7).map(s=>{const st=staffing(s);return `<button class="list-item list-link" data-action="open-service" data-id="${esc(s.id)}"><div class="date-tile">${Number(s.date.slice(8))}<small>${new Date(s.date+'T12:00:00').toLocaleDateString('es-ES',{month:'short'})}</small></div><div class="grow"><p>${esc(s.name)}</p><small>${relDay(s.date)} · ${esc(s.venue)} · ${s.start}–${s.end}</small></div><div class="progress-cell">${progress(st)}</div>${badge(s.status)}</button>`}).join('');
 const phases=list('services').map(sv=>({sv,ph:servicePhase(sv)}));
 const quotesOpen=list('quotes').filter(q=>['draft','sent'].includes(q.status)).length+acceptedQuotes.length;
 const stages=[['quotes','Presupuestos',quotesOpen,'file','abiertos'],['plan','Planificar',phases.filter(x=>x.ph.phase==='plan').length,'briefcase','sin puestos'],['staff','Personal',phases.filter(x=>['staff','ready'].includes(x.ph.phase)).length,'users',`${phases.filter(x=>x.ph.phase==='staff').length} con huecos`],['live','En curso',phases.filter(x=>x.ph.phase==='live').length,'clock','hoy'],['close','Cierre',phases.filter(x=>x.ph.phase==='close').length,'check','por cerrar'],['bill','Facturar',phases.filter(x=>x.ph.phase==='bill').length,'file','por facturar'],['collect','Cobrar',phases.filter(x=>x.ph.phase==='collect').length,'euro','por cobrar']];
 const pipeline=`<div class="pipeline">${stages.map(([k,l,n,ic,sub],i)=>`<button class="pipe-stage ${n?'has':''}" ${k==='quotes'?'data-page="quotes"':`data-action="flow-phase" data-scope="${k}"`} style="--i:${i}"><span class="pipe-icon">${icon(ic)}</span><strong data-count="${n}">${n}</strong><span>${l}</span><small>${esc(sub)}</small></button>`).join('<span class="pipe-arrow">›</span>')}</div>`;
 const order={live:0,close:1,staff:2,plan:3,bill:4,collect:5};
 const steps=phases.filter(x=>x.ph.next&&order[x.ph.phase]!=null&&!(x.ph.phase==='live'&&!staffing(x.sv).missing)).sort((a,b)=>order[a.ph.phase]-order[b.ph.phase]||a.sv.date.localeCompare(b.sv.date)).slice(0,8);
 const stepsPanel=`<div class="panel next-steps"><div class="panel-head"><div><h3>Siguientes pasos</h3><p>${steps.length?'Lo que toca hacer ahora, en orden, servicio a servicio':'Todos los servicios están al día'}</p></div></div>${steps.length?steps.map(({sv,ph},i)=>`<div class="list-item next-step" style="--i:${i}"><span class="step-num">${i+1}</span><div class="grow"><button class="service-title-link" data-action="open-service" data-id="${esc(sv.id)}">${esc(sv.name)}</button><small>${relDay(sv.date)} · <span class="flow-label ${ph.tone}">${esc(ph.label)}</span></small>${flowStepper(ph,true)}</div>${nextButton(ph)}</div>`).join(''):`<p class="panel-empty">${icon('check')} Nada pendiente. Buen trabajo.</p>`}</div>`;
 $('#page-actions').innerHTML=button('quote-plan-new','Nuevo presupuesto','file','','')+button('service-wizard','Crear servicio','plus');
 $('#content').innerHTML=`${settingsIncomplete()?`<div class="notice notice-row">${icon('info')}<span>Completa los <b>datos fiscales de la empresa</b> antes de emitir presupuestos o facturas.</span><button class="btn small" data-page="settings">Ir a Ajustes</button></div>`:''}<div class="stats">${stats}</div>${pipeline}
 <div class="dashboard-grid"><div>${stepsPanel}
  <div class="panel"><div class="panel-head"><div><h3>Hoy · ${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</h3><p>Asistencia en tiempo real de los servicios en curso</p></div></div>${todayPanel}</div>
  <div class="panel"><div class="panel-head"><div><h3>Próximos servicios</h3><p>Cobertura de personal por servicio</p></div><button class="text-btn" data-page="services">Ver todos ${icon('arrow')}</button></div>${upcomingPanel||empty('Sin servicios próximos','Los servicios que organices aparecerán aquí.',button('service-wizard','Crear servicio','plus'))}</div>
 </div><div>
  <div class="panel"><div class="panel-head"><div><h3>Requiere atención</h3><p>${attention.length?'Tareas pendientes de revisar':'Todo al día'}</p></div>${icon('info')}</div>${attention.length?attention.map(([n,t,d,ic,attr])=>`<button class="list-item list-link attention" ${attr}><span class="attention-icon">${icon(ic)}</span><div class="grow"><p>${t}</p><small>${esc(d)}</small></div><strong class="attention-count">${n}</strong></button>`).join(''):`<p class="panel-empty">${icon('check')} No hay tareas pendientes.</p>`}</div>
  <div class="panel"><div class="panel-head"><h3>Accesos rápidos</h3></div><div class="quick-grid">${button('service-wizard','Crear servicio','briefcase','','')}${button('quote-plan-new','Presupuesto','file','','')}${button('new','Trabajador','users','data-kind="workers"','')}${button('new','Factura','euro','data-kind="invoices"','')}${button('navigate','Disponibilidad','availability','data-page="availability"','')}${button('navigate','Calendario','calendar','data-page="calendar"','')}</div></div>
 </div></div>`;
}

function managerIncidentsPage(){
 const all=list('incidents').sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 const rows=all.filter(i=>incidentTab==='all'||(incidentTab==='open'?i.status!=='resolved':incidentTab==='category'?i.type==='category_change'&&i.status!=='resolved':i.status==='resolved'));
 const tabs=[['open','Abiertas',all.filter(i=>i.status!=='resolved').length],['category','Cambios de categoría',all.filter(i=>i.type==='category_change'&&i.status!=='resolved').length],['resolved','Resueltas',all.filter(i=>i.status==='resolved').length],['all','Todas',all.length]];
 const types={general:'General',delay:'Retraso',absence:'Ausencia',behaviour:'Comportamiento',safety:'Seguridad / PRL',material:'Material / equipo',category_change:'Cambio de categoría',other:'Otra'},sev={low:'Baja',medium:'Media',high:'Alta'};
 $('#content').innerHTML=`<div class="segmented">${tabs.map(([k,l,n])=>`<button class="${incidentTab===k?'selected':''}" data-action="incident-tab" data-tab="${k}">${l}<b>${n}</b></button>`).join('')}</div>`+
 (rows.length?table(['Fecha','Servicio','Tipo','Trabajador','Incidencia','Comunicada por','Estado',''],rows.map(i=>`<tr><td>${stamp(i.createdAt)}</td><td><button class="service-title-link" data-action="open-service" data-id="${esc(i.serviceId)}">${esc(name('services',i.serviceId))}</button></td><td><strong>${esc(types[i.type]||'General')}</strong>${i.severity?`<small class="sev-${esc(i.severity)}">Gravedad ${esc(sev[i.severity]||'')}</small>`:''}</td><td>${esc(i.workerId?name('workers',i.workerId):'General')}</td><td class="wrap-cell">${i.type==='category_change'?`<strong>${esc(i.currentCategory||'—')} → ${esc(i.requestedCategory)}</strong><br>`:''}${esc(i.description)}${i.measure?`<small>Medida: ${esc(i.measure)}</small>`:''}</td><td>${esc(name('users',i.createdBy))}</td><td>${i.status==='resolved'?`<span class="badge completed">Resuelta</span><small>${stamp(i.resolvedAt)}</small>`:'<span class="badge overdue">Abierta</span>'}</td><td><div class="row-actions">${i.type==='category_change'&&i.status!=='resolved'&&i.assignmentId&&find('assignments',i.assignmentId)?button('incident-apply-category','Aplicar categoría','edit',`data-id="${esc(i.id)}"`,' small'):''}${i.status==='resolved'?'':button('incident-resolve','Resolver','check',`data-id="${esc(i.id)}"`,' small')}</div></td></tr>`)):`<div class="panel">${empty(incidentTab==='open'?'Sin incidencias abiertas':'Sin incidencias','Las incidencias y solicitudes de cambio de categoría que registren los Crew Head y coordinadores aparecerán aquí.')}</div>`);
}
function managerMessagesPage(){
 const me=data.user.id,msgs=list('messages').sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
 const peerOf=m=>find('users',m.senderId)?.role==='manager'?m.recipientId:m.senderId;
 const seen=messagesSeen();
 const workers=list('users').filter(u=>u.active&&u.role!=='manager');
 const threads=new Map();for(const m of msgs){const p=peerOf(m);if(!threads.has(p))threads.set(p,[]);threads.get(p).push(m);}
 for(const [p,t] of [...threads])if(t.every(m=>m.broadcastId))threads.delete(p);
 const broadcasts=[...msgs.filter(m=>m.broadcastId).reduce((map,m)=>{const g=map.get(m.broadcastId)||{...m,count:0};g.count++;map.set(m.broadcastId,g);return map;},new Map()).values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 const order=[...threads.keys()].sort((a,b)=>threads.get(b).at(-1).createdAt.localeCompare(threads.get(a).at(-1).createdAt));
 if(msgPeer!=='__groups'&&(!msgPeer||(!threads.has(msgPeer)&&!workers.some(u=>u.id===msgPeer))))msgPeer=order[0]||(broadcasts.length?'__groups':'');
 const peerList=order.map(id=>{const t=threads.get(id),last=t.at(-1),unread=t.filter(m=>m.senderId===id&&m.createdAt>seen).length;return `<button class="thread ${id===msgPeer?'selected':''}" data-action="msg-peer" data-id="${esc(id)}"><span class="avatar-sm">${esc(initials(name('users',id)))}</span><span class="grow"><strong>${esc(name('users',id))}</strong><small>${esc(last.content.slice(0,60))}</small></span><span class="thread-meta"><small>${stamp(last.createdAt)}</small>${unread?`<b>${unread}</b>`:''}</span></button>`}).join('');
 const thread=msgPeer==='__groups'?broadcasts.map(m=>`<div class="bubble mine"><span class="bubble-tag">${esc(m.audience||'Grupo')} · ${m.count} destinatario(s)</span><p>${esc(m.content)}</p><small>${esc(name('users',m.senderId))} · ${stamp(m.createdAt)}</small></div>`).join(''):(threads.get(msgPeer)||[]).map(m=>{const mine=find('users',m.senderId)?.role==='manager';return `<div class="bubble ${mine?'mine':''}">${m.broadcastId?`<span class="bubble-tag">Envío a ${esc(m.audience||'grupo')}</span>`:''}<p>${esc(m.content)}</p><small>${mine?esc(name('users',m.senderId))+' · ':''}${stamp(m.createdAt)}</small></div>`}).join('');
 const start=`<select id="msg-new-peer" aria-label="Nueva conversación"><option value="">Nueva conversación…</option>${workers.filter(u=>!threads.has(u.id)).map(u=>`<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('')}</select>`;
 const groupsItem=broadcasts.length?`<button class="thread ${msgPeer==='__groups'?'selected':''}" data-action="msg-peer" data-id="__groups"><span class="avatar-sm group">${icon('users')}</span><span class="grow"><strong>Envíos a grupos</strong><small>${esc(broadcasts[0].audience||'')} · ${esc(broadcasts[0].content.slice(0,40))}</small></span><span class="thread-meta"><small>${broadcasts.length}</small></span></button>`:'';
 $('#page-actions').innerHTML=button('broadcast','Mensaje a un grupo','users');
 $('#content').innerHTML=`<div class="chat-layout panel"><aside class="chat-threads"><div class="chat-threads-head">${start}</div>${groupsItem}${peerList||(groupsItem?'':'<p class="panel-empty">Todavía no hay conversaciones.</p>')}</aside><section class="chat-main">${msgPeer==='__groups'?`<header class="chat-head"><span class="avatar-sm group">${icon('users')}</span><div><strong>Envíos a grupos</strong><small>Mensajes enviados a varios trabajadores a la vez. Cada uno lo recibe en su chat privado.</small></div>${button('broadcast','Nuevo envío','plus','',' small')}</header><div class="chat-scroll" id="chat-scroll">${thread}</div>`:msgPeer?`<header class="chat-head"><span class="avatar-sm">${esc(initials(name('users',msgPeer)))}</span><div><strong>${esc(name('users',msgPeer))}</strong><small>Conversación privada con Gestoría</small></div></header><div class="chat-scroll" id="chat-scroll">${thread||'<p class="panel-empty">Escribe el primer mensaje.</p>'}</div><form id="manager-message-form" class="chat-compose"><input type="hidden" name="recipientId" value="${esc(msgPeer)}"><textarea name="content" maxlength="2000" required placeholder="Escribe un mensaje…" rows="2"></textarea><button type="submit" class="btn primary">${icon('arrow')}Enviar</button></form>`:`<div class="panel-empty">Selecciona o inicia una conversación.</div>`}</section></div>`;
 markMessagesSeen();renderNav();
 const sc=$('#chat-scroll');if(sc)sc.scrollTop=sc.scrollHeight;
 const sel=$('#msg-new-peer');if(sel)sel.onchange=()=>{if(sel.value){msgPeer=sel.value;managerMessagesPage();$('#manager-message-form textarea')?.focus();}};
 const f=$('#manager-message-form');if(f){const ta=f.querySelector('textarea');ta.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))f.requestSubmit();};f.onsubmit=async ev=>{ev.preventDefault();const b=f.querySelector('[type=submit]');b.disabled=true;try{await api('message-send',Object.fromEntries(new FormData(f)));await load();toast('Mensaje enviado')}catch(e){toast(e.message,true)}finally{b.disabled=false}};}
}
function broadcastModal(){
 const workerUsers=list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId).map(u=>({u,w:find('workers',u.workerId)})).filter(x=>x.w&&x.w.active!==false);
 const cats=[...new Set(workerUsers.map(x=>String(x.w.specialty||'').trim().toUpperCase()).filter(Boolean))].sort();
 const services=list('services').filter(s=>!['completed','cancelled'].includes(s.status)||s.endDate>=isoAdd(day(),-7)).sort((a,b)=>a.date.localeCompare(b.date));
 modal('Mensaje a un grupo',`<form id="broadcast-form"><div class="form-grid"><label class="wide">Destinatarios<select name="type" id="bc-type"><option value="all">Todos los trabajadores</option><option value="service">Todo el personal de un servicio</option><option value="contract-fixed">Trabajadores fijos (indefinidos y fijos discontinuos)</option><option value="contract-eventual">Trabajadores eventuales</option><option value="category">Por categoría (HAND, FORKLIFTER…)</option></select></label>
 <label class="wide" id="bc-service" hidden>Servicio<select name="service">${services.map(s=>`<option value="${esc(s.id)}">${esc(fmt(s.date)+' · '+s.name)}</option>`).join('')}</select></label>
 <label class="wide" id="bc-category" hidden>Categoría<select name="category">${cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label>
 <label class="wide">Mensaje<textarea name="content" maxlength="2000" required placeholder="Escribe el aviso…"></textarea></label></div>
 <div class="notice" id="bc-count"></div><div class="form-error" role="alert" hidden></div><div class="form-footer"><button class="btn" type="button" data-action="close">Cancelar</button><button class="btn primary" type="submit">${icon('arrow')}Enviar a todos</button></div></form>`);
 const f=$('#broadcast-form');
 const audience=()=>{const t=f.elements.type.value;return t==='service'?{type:'service',value:f.elements.service.value}:t.startsWith('contract')?{type:'contract',value:t.split('-')[1]}:t==='category'?{type:'category',value:f.elements.category.value}:{type:'all'};};
 const count=()=>{const a=audience();let r=workerUsers;if(a.type==='service'){const ids=new Set(list('assignments').filter(x=>x.serviceId===a.value&&x.status!=='rejected').map(x=>x.workerId));r=r.filter(x=>ids.has(x.w.id));}if(a.type==='contract')r=r.filter(x=>a.value==='eventual'?(x.w.contractType||'eventual')==='eventual':(x.w.contractType||'eventual')!=='eventual');if(a.type==='category')r=r.filter(x=>String(x.w.specialty||'').trim().toUpperCase()===a.value);return r;};
 const sync=()=>{const t=f.elements.type.value;$('#bc-service').hidden=t!=='service';$('#bc-category').hidden=t!=='category';const r=count();$('#bc-count').innerHTML=r.length?`<b>${r.length} trabajador(es)</b> con acceso recibirán el mensaje en su chat privado: ${esc(r.slice(0,8).map(x=>x.w.name).join(', '))}${r.length>8?'…':''}`:'Ningún trabajador con acceso en este grupo.';};
 f.onchange=sync;sync();
 f.onsubmit=async e=>{e.preventDefault();const err=f.querySelector('.form-error'),b=f.querySelector('[type=submit]');err.hidden=true;b.disabled=true;try{const r=await api('message-broadcast',{content:f.elements.content.value,audience:audience()});$('#modal').close();msgPeer='__groups';await load();toast('Mensaje enviado a '+r.sent+' trabajador(es)');}catch(ex){err.className='form-error error';err.textContent=ex.message;err.hidden=false}finally{b.disabled=false}};
}
const initials=n=>String(n||'?').split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();

function closedPage(){
 const services=list('services').filter(s=>['completed','cancelled'].includes(s.status)).sort((a,b)=>b.date.localeCompare(a.date));
 const invoiceFor=id=>list('invoices').find(i=>i.serviceId===id);
 const pend=services.filter(s=>s.status==='completed'&&s.settlementStatus!=='confirmed').length;
 const revenue=services.reduce((n,s)=>n+(s.settlementRevenue||0),0),cost=services.reduce((n,s)=>n+(s.settlementCost||0),0);
 $('#content').innerHTML=`<div class="stats">${stat('Servicios cerrados',services.length,'Finalizados y cancelados','check',true)+stat('Por liquidar',pend,'Finalizados sin confirmar','clock')+stat('Venta liquidada',euro(revenue),'Según horas facturables','euro')+stat('Margen bruto',euro(revenue-cost),revenue?Math.round((revenue-cost)/revenue*100)+' % sobre venta':'Sin liquidaciones','chart')}</div>`+
 (services.length?table(['Servicio','Cliente','Fecha','Liquidación','Factura',''],services.map(s=>{const inv=invoiceFor(s.id);return `<tr><td><button class="service-title-link" data-action="open-service" data-id="${esc(s.id)}">${esc(s.name)}</button><small>${esc(s.venue)}</small></td><td>${esc(name('clients',s.clientId))}</td><td>${fmt(s.date)}</td><td>${s.status==='cancelled'?badge('cancelled'):s.settlementStatus==='confirmed'?`<span class="badge completed">Confirmada</span><small>Coste ${euro(s.settlementCost)} · Venta ${euro(s.settlementRevenue)}</small>`:'<span class="badge pending">Pendiente</span>'}</td><td>${inv?`<button class="text-btn" data-action="view" data-kind="invoices" data-id="${esc(inv.id)}">${esc(inv.number||'Borrador')}</button>`:'—'}</td><td><div class="row-actions">${s.status==='completed'&&s.settlementStatus!=='confirmed'?button('settlement-confirm','Certificar','check',`data-id="${esc(s.id)}"`,' small'):''}${s.status==='completed'&&!inv?button('invoice-service','Facturar','euro',`data-id="${esc(s.id)}"`,' small'):''}${action('open-service','Abrir servicio',s.id,'','chevron')}</div></td></tr>`})):`<div class="panel">${empty('Sin servicios cerrados','Cuando marques un servicio como finalizado aparecerá aquí para liquidarlo y facturarlo.')}</div>`);
}

function serviceClosingTab(sv){
 const as=list('assignments').filter(a=>a.serviceId===sv.id);
 const st=staffing(sv),openClock=as.filter(a=>a.checkIn&&!a.checkOut&&!a.noShow).length,pending=as.filter(a=>a.status==='pending').length;
 const rows=as.filter(a=>a.status!=='rejected'||a.noShowChargeApproved).map(a=>{const wh=Number(a.workerUnits??a.workerHours??a.hours??0),ch=Number(a.clientUnits??a.billableHours??a.hours??0);return {a,wh,ch,cost:wh*(a.costRate||0),sale:ch*(a.chargeRate||0)};});
 const cost=rows.reduce((n,r)=>n+r.cost,0),sale=rows.reduce((n,r)=>n+r.sale,0),margin=sale-cost;
 const inv=list('invoices').filter(i=>i.serviceId===sv.id);
 const locked=sv.settlementStatus==='confirmed';
 const statuses2=[['planned','Planificado'],['confirmed','Confirmado'],['in_progress','En curso'],['completed','Finalizado'],['cancelled','Cancelado']];
 const checks=[[st.missing===0,st.missing?`${st.missing===1?'Falta 1 puesto':'Faltan '+st.missing+' puestos'} por cubrir`:'Todos los puestos cubiertos'],[pending===0,pending?`${pending} confirmaciones pendientes`:'Todas las asignaciones respondidas'],[openClock===0,openClock?`${openClock} fichajes abiertos sin salida`:'Sin fichajes abiertos'],[!settingsIncomplete(),settingsIncomplete()?'Faltan datos fiscales de la empresa':'Datos fiscales completos']];
 return `<div class="service-section-header"><div><h3>Estado, cierre y facturación</h3><p>Revisa la cobertura, cierra los fichajes, confirma la liquidación y prepara la factura.</p></div></div>
 <div class="closing-grid"><section class="panel pad"><h4>Estado del servicio</h4><div class="status-steps">${statuses2.map(([k,l])=>`<button class="${sv.status===k?'selected':''} ${k}" data-action="service-status" data-id="${esc(sv.id)}" data-status="${k}" ${locked?'disabled':''}>${l}</button>`).join('')}</div>${locked?'<p class="footnote">Servicio liquidado: el estado queda bloqueado.</p>':''}
 <h4 style="margin-top:20px">Comprobaciones</h4><ul class="checklist">${checks.map(([ok,t])=>`<li class="${ok?'ok':'ko'}">${icon(ok?'check':'info')}${t}</li>`).join('')}</ul></section>
 <section class="panel pad"><h4>Resumen económico previsto</h4><div class="money-grid"><div><small>Coste bruto personal</small><strong>${euro(cost)}</strong></div><div><small>Venta a cliente</small><strong>${euro(sale)}</strong></div><div><small>Margen bruto</small><strong class="${margin<0?'neg':''}">${euro(margin)}</strong><small>${sale?Math.round(margin/sale*100)+' %':'—'}</small></div></div>
 <div class="detail-actions">${locked?`<span class="badge completed">Liquidación certificada · ${stamp(sv.settledAt)}</span>`:button('settlement-confirm','Certificar liquidación','check',`data-id="${esc(sv.id)}" ${sv.status!=='completed'?'disabled title="Marca el servicio como finalizado"':''}`,'')}${inv.map(i=>button('view',(i.number||'Borrador')+(i.scope==='day'?' · '+fmt(i.serviceDate):'')+' · '+euro(i.total),'euro',`data-kind="invoices" data-id="${esc(i.id)}"`,'')).join('')}${(()=>{const q=billingQueue().filter(x=>x.service.id===sv.id);const pendingDays=[...new Set(list('assignments').filter(a=>a.serviceId===sv.id).map(a=>a.date))];return q.length||!inv.length?button('bill-create',inv.length?'Facturar lo pendiente':'Crear factura del servicio','euro',`data-id="${esc(sv.id)}"`)+(pendingDays.length>1?pendingDays.sort().map(d=>button('bill-create','Solo '+new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),'calendar',`data-id="${esc(sv.id)}" data-date="${d}"`,' small')).join(''):''):''})()}</div>
 <p class="footnote">Importes brutos según horas registradas y tarifas de cada asignación; no incluyen cotizaciones de empresa. La factura se crea como borrador y debe revisarse antes de emitirla.</p></section></div>
 ${(()=>{const cl=list('crewDayClosures').filter(c=>c.serviceId===sv.id).sort((a,b)=>a.date.localeCompare(b.date));return cl.length?'<section class="panel pad"><h4>Días cerrados por el Crew Head</h4>'+cl.map(c=>'<div class="list-item"><div class="grow"><p>'+fmt(c.date)+' · '+esc(c.closedByName||'Crew Head')+'</p><small>'+stamp(c.closedAt)+' · '+c.summary.attended+' con entrada · '+c.summary.absent+' sin llegar'+(c.notes?' · '+esc(c.notes):'')+'</small></div>'+(locked?'':button('crew-day-reopen','Reabrir','refresh','data-service="'+esc(c.serviceId)+'" data-date="'+esc(c.date)+'"',' small'))+'</div>').join('')+'</section>':'';})()}
 ${rows.length?table(['Trabajador','Categoría','Horas trabajador','Coste','Horas cliente','Venta','Fichaje'],rows.map(({a,wh,ch,cost,sale})=>`<tr><td><strong>${esc(name('workers',a.workerId))}</strong>${a.noShow?'<small>No presentado</small>':''}</td><td>${esc(a.role||'—')}</td><td>${wh.toLocaleString('es-ES')} h<small>${euro(a.costRate)}/u</small></td><td>${euro(cost)}</td><td>${ch.toLocaleString('es-ES')} h<small>${euro(a.chargeRate)}/u</small></td><td>${euro(sale)}</td><td>${a.checkIn?stamp(a.checkIn)+' → '+stamp(a.checkOut):'—'}<div class="row-actions">${action('edit','Editar asignación',a.id,'assignments','edit')}${button('attendance-service-edit','Fichaje','clock',`data-id="${esc(a.id)}"`,' small')}</div></td></tr>`).concat([`<tr class="total-row"><td colspan="3"><strong>Total</strong></td><td><strong>${euro(cost)}</strong></td><td></td><td><strong>${euro(sale)}</strong></td><td></td></tr>`])):'<div class="panel empty">Todavía no hay personal asignado.</div>'}`;
}

const weekdayKeys=['mon','tue','wed','thu','fri','sat','sun'];
function mondayOf(d){const x=new Date(d+'T12:00:00Z'),w=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-w);return x.toISOString().slice(0,10);}
function teamAvailabilityPage(){
 if(!availWeek)availWeek=mondayOf(day());
 const days=Array.from({length:7},(_,i)=>isoAdd(availWeek,i));
 const q=query.toLowerCase();
 const workers=list('workers').filter(w=>w.active!==false&&(!q||[w.name,w.specialty].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
 const avail=list('availability'),weekly=data.weeklyAvailabilityRows||[],as=list('assignments').filter(a=>a.status!=='rejected');
 const free=Object.fromEntries(days.map(d=>[d,0]));
 const cell=(w,d,i)=>{
  const shifts=as.filter(a=>a.workerId===w.id&&a.date<=d&&(a.endDate||a.date)>=d);
  if(shifts.length)return `<td class="av busy">${shifts.map(a=>`<button data-action="open-service" data-id="${esc(a.serviceId)}" title="${esc(name('services',a.serviceId))}"><b>${esc(name('services',a.serviceId))}</b><small>${a.start}–${a.end}${a.status==='pending'?' · sin confirmar':''}</small></button>`).join('')}</td>`;
  const r=avail.find(x=>x.workerId===w.id&&x.date===d);
  if(r){if(r.status==='unavailable')return `<td class="av no"><span>No disponible</span>${r.notes?`<small>${esc(r.notes)}</small>`:''}</td>`;free[d]++;return `<td class="av yes"><span>Disponible</span><small>${r.slots?.length?hourRanges(r.slots):'Todo el día'}</small></td>`;}
  const wk=weekly.find(x=>x.workerId===w.id)?.days?.[weekdayKeys[i]];
  const slots=Array.isArray(wk?.slots)?wk.slots:wk?.available?[1]:[];
  if(slots.length){free[d]++;return `<td class="av habit"><span>Habitual</span><small>${Array.isArray(wk.slots)?hourRanges(wk.slots):esc((wk.start||'')+'–'+(wk.end||''))}</small></td>`;}
  return '<td class="av none"><span>—</span></td>';
 };
 const body=workers.map(w=>`<tr><th scope="row"><button class="service-title-link" data-action="view" data-kind="workers" data-id="${esc(w.id)}">${esc(w.name)}</button><small>${esc(w.specialty||'')}</small></th>${days.map((d,i)=>cell(w,d,i)).join('')}</tr>`).join('');
 const label=new Date(availWeek+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' – '+new Date(days[6]+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
 $('#page-actions').innerHTML=`<div class="calendar-controls"><button class="icon-btn" data-action="avail-week" data-dir="-1" aria-label="Semana anterior">${icon('left')}</button><strong>${label}</strong><button class="icon-btn" data-action="avail-week" data-dir="1" aria-label="Semana siguiente">${icon('chevron')}</button><button class="btn small" data-action="avail-week" data-dir="0">Hoy</button></div>`+button('availability','Registrar disponibilidad','plus','','');
 $('#content').innerHTML=`<div class="toolbar"><div class="searchbox">${icon('search')}<input id="search" aria-label="Buscar trabajador" placeholder="Buscar trabajador o especialidad…" value="${esc(query)}"></div><div class="legend"><span class="lg busy">Asignado</span><span class="lg yes">Disponible</span><span class="lg habit">Habitual</span><span class="lg no">No disponible</span></div></div>
 <div class="panel"><div class="table-wrap"><table class="avail-table"><thead><tr><th>Trabajador</th>${days.map(d=>`<th class="${d===day()?'today':''}">${new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'numeric'})}<small>${free[d]} libres</small></th>`).join('')}</tr></thead><tbody>${body||`<tr><td colspan="8">${empty('Sin trabajadores','Añade fichas de personal para planificar su disponibilidad.')}</td></tr>`}</tbody></table></div></div><p class="footnote">La disponibilidad puntual prevalece sobre la semana habitual. Los trabajadores la indican desde su área de empleado.</p>`;
 const input=$('#search');input.oninput=()=>{query=input.value;const p=input.selectionStart;teamAvailabilityPage();$('#search').focus();$('#search').setSelectionRange(p,p);};
}
function hourRanges(slots){const s=[...new Set(slots.map(Number))].sort((a,b)=>a-b),out=[];let st=null,prev=null;for(const h of s){if(st===null){st=h;prev=h;continue}if(h===prev+1){prev=h;continue}out.push([st,prev]);st=h;prev=h;}if(st!==null)out.push([st,prev]);if(out.length===1&&out[0][0]===0&&out[0][1]===23)return 'Todo el día';return out.map(([a,b])=>String(a).padStart(2,'0')+'–'+String(b+1).padStart(2,'0')).join(', ');}

function globalSearch(){
 modal('Buscar en NOVA Crew',`<input id="gs-input" placeholder="Servicio, trabajador, cliente, factura…" autocomplete="off" aria-label="Buscar"><div id="gs-results" class="gs-results"><p class="footnote">Escribe al menos 2 caracteres. Atajo: Ctrl + K.</p></div>`);
 const input=$('#gs-input'),out=$('#gs-results');
 const run=()=>{const q=input.value.trim().toLowerCase();if(q.length<2){out.innerHTML='<p class="footnote">Escribe al menos 2 caracteres. Atajo: Ctrl + K.</p>';return}
  const has=(...v)=>v.filter(Boolean).join(' ').toLowerCase().includes(q);
  const groups=[
   ['Servicios',list('services').filter(s=>has(s.name,s.venue,name('clients',s.clientId))).slice(0,8).map(s=>[`data-action="open-service" data-id="${esc(s.id)}"`,s.name,`${fmt(s.date)} · ${s.venue}`,'briefcase'])],
   ['Trabajadores',list('workers').filter(w=>has(w.name,w.specialty,w.email,w.phone,w.taxId)).slice(0,8).map(w=>[`data-action="view" data-kind="workers" data-id="${esc(w.id)}"`,w.name,[w.specialty,w.phone].filter(Boolean).join(' · '),'users'])],
   ['Clientes',list('clients').filter(c=>has(c.name,c.taxId,c.email,c.contact)).slice(0,6).map(c=>[`data-action="view" data-kind="clients" data-id="${esc(c.id)}"`,c.name,c.taxId||'','building'])],
   ['Presupuestos',list('quotes').filter(r=>has(r.number,r.serviceName,name('clients',r.clientId))).slice(0,6).map(r=>[`data-action="view" data-kind="quotes" data-id="${esc(r.id)}"`,r.number||'Presupuesto en borrador',`${name('clients',r.clientId)} · ${euro(r.total)}`,'file'])],
   ['Facturas',list('invoices').filter(r=>has(r.number,name('clients',r.clientId),name('services',r.serviceId))).slice(0,6).map(r=>[`data-action="view" data-kind="invoices" data-id="${esc(r.id)}"`,r.number||'Factura en borrador',`${name('clients',r.clientId)} · ${euro(r.total)}`,'euro'])]
  ].filter(g=>g[1].length);
  out.innerHTML=groups.length?groups.map(([t,items])=>`<div class="gs-group"><small>${t}</small>${items.map(([attr,title,sub,ic])=>`<button class="gs-item" ${attr}>${icon(ic)}<span><strong>${esc(title)}</strong><small>${esc(sub)}</small></span></button>`).join('')}</div>`).join(''):'<p class="footnote">Sin resultados.</p>';
 };
 input.oninput=run;
 input.onkeydown=e=>{if(e.key==='Enter'){const first=out.querySelector('.gs-item');if(first){e.preventDefault();first.click();}}};
}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&data.user&&manager()){e.preventDefault();globalSearch();}});

/* Facturación: pendiente de facturar (servicios finalizados y días cerrados) + facturas. */
let invoiceTab='pending';
const billableUnits=a=>Number(a.clientUnits??a.billableHours??a.hours??0);
function billingQueue(){
 const inv=list('invoices'),billed=new Set(inv.flatMap(i=>i.assignmentIds||[])),fullBilled=new Set(inv.filter(i=>i.serviceId&&!Array.isArray(i.assignmentIds)).map(i=>i.serviceId));
 const pending=sid=>fullBilled.has(sid)?[]:list('assignments').filter(a=>a.serviceId===sid&&billableUnits(a)>0&&(a.status!=='rejected'||a.noShowChargeApproved)&&!billed.has(a.id));
 const amount=as=>as.reduce((n,a)=>n+billableUnits(a)*Number(a.chargeRate||0),0);
 const items=[];
 for(const s of list('services').filter(s=>s.status==='completed')){const as=pending(s.id);if(as.length)items.push({type:'service',service:s,as,amount:amount(as),days:[...new Set(as.map(a=>a.date))].sort()});}
 for(const c of list('crewDayClosures')){const s=find('services',c.serviceId);if(!s||s.archived||s.status==='completed'||s.status==='cancelled')continue;const as=pending(s.id).filter(a=>a.date===c.date);if(as.length)items.push({type:'day',service:s,date:c.date,closure:c,as,amount:amount(as)});}
 return items.sort((a,b)=>(a.date||a.service.endDate).localeCompare(b.date||b.service.endDate));
}
function invoicesPage(){
 const vat=Number(data.settings?.vat??21),queue=billingQueue(),inv=list('invoices');
 const groups={pending:queue,draft:inv.filter(i=>i.status==='draft'),open:inv.filter(invoiceOpen),paid:inv.filter(i=>i.status==='paid'),all:inv};
 const tabs=[['pending','Pendiente de facturar',queue.length],['draft','Borradores',groups.draft.length],['open','Emitidas por cobrar',groups.open.length],['paid','Cobradas',groups.paid.length],['all','Todas',inv.length]];
 $('#page-actions').innerHTML=button('new','Factura manual','plus','data-kind="invoices"','');
 const totalPending=queue.reduce((n,x)=>n+x.amount,0),totalOpen=groups.open.reduce((n,i)=>n+i.total-(i.paid||0),0),overdue=inv.filter(invoiceOverdue);
 let body='';
 if(invoiceTab==='pending'){
  body=queue.length?'<div class="billing-queue">'+queue.map(x=>{const s=x.service,hours=x.as.reduce((n,a)=>n+billableUnits(a),0);
   return '<article class="billing-card"><div class="billing-kind '+x.type+'">'+(x.type==='day'?'Cierre parcial · día cerrado':'Servicio finalizado')+'</div><h3>'+esc(s.name)+'</h3><p>'+esc(name('clients',s.clientId))+' · '+esc(s.venue)+'</p>'+
   '<div class="billing-meta"><span>'+(x.type==='day'?'Jornada '+fmt(x.date):fmt(s.date)+(s.endDate!==s.date?' – '+fmt(s.endDate):''))+'</span><span>'+x.as.length+' trabajador(es)</span><span>'+hours.toLocaleString('es-ES')+' h facturables</span></div>'+
   (x.closure?'<small class="billing-note">Cerrado por '+esc(x.closure.closedByName||'Crew Head')+' · '+x.closure.summary.attended+' con entrada · '+x.closure.summary.absent+' sin llegar</small>':'')+
   '<div class="billing-foot"><div><small>Base estimada</small><strong>'+euro(x.amount)+'</strong><small>'+euro(x.amount*(1+vat/100))+' con IVA</small></div><div class="row-actions">'+
   (x.type==='day'?button('bill-create','Facturar este día','euro','data-id="'+esc(s.id)+'" data-date="'+esc(x.date)+'"'):button('bill-create','Facturar servicio','euro','data-id="'+esc(s.id)+'"')+(x.days.length>1?x.days.map(d=>button('bill-create','Solo '+new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),'calendar','data-id="'+esc(s.id)+'" data-date="'+esc(d)+'"',' small')).join(''):''))+
   action('open-service','Abrir servicio',s.id,'','chevron')+'</div></div></article>';}).join('')+'</div>':
  '<div class="panel">'+empty('Nada pendiente de facturar','Aquí aparecen los servicios finalizados y los días cerrados por el Crew Head con personal sin facturar.')+'</div>';
 }else{
  const rows=groups[invoiceTab].slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  body=rows.length?table(['Factura','Cliente','Servicio','Fecha / vencimiento','Total','Pendiente','Estado',''],rows.map(r=>'<tr><td><strong>'+esc(r.number||'Borrador')+'</strong>'+(r.scope==='day'?'<small>Cierre parcial · '+fmt(r.serviceDate)+'</small>':'')+'</td><td>'+esc(name('clients',r.clientId))+'</td><td>'+(r.serviceId?'<button class="service-title-link" data-action="open-service" data-id="'+esc(r.serviceId)+'">'+esc(name('services',r.serviceId))+'</button>':'—')+'</td><td>'+fmt(r.date)+'<small>'+fmt(r.dueDate)+'</small></td><td>'+euro(r.total)+'</td><td>'+(r.status==='draft'?'—':euro(r.total-(r.paid||0)))+'</td><td>'+badge(invoiceOverdue(r)?'overdue':r.status)+(r.sentAt?'<small>Enviada '+stamp(r.sentAt)+'</small>':'')+'</td><td>'+rowActions(r,'invoices')+'</td></tr>')):'<div class="panel">'+empty('Sin facturas','No hay facturas en este apartado.')+'</div>';
 }
 $('#content').innerHTML='<div class="stats">'+stat('Pendiente de facturar',euro(totalPending),queue.length+' servicio(s) o día(s)','clock',true)+stat('Borradores',groups.draft.length,'Revisar y emitir','file')+stat('Por cobrar',euro(totalOpen),groups.open.length+' factura(s) emitida(s)','euro')+stat('Vencidas',overdue.length,euro(overdue.reduce((n,i)=>n+i.total-(i.paid||0),0)),'info')+'</div>'+
 '<div class="segmented">'+tabs.map(([k,l,n])=>'<button class="'+(invoiceTab===k?'selected':'')+'" data-action="invoice-tab" data-tab="'+k+'">'+l+'<b>'+n+'</b></button>').join('')+'</div>'+body;
}
function mailInvoice(id){
 const r=find('invoices',id);if(!r)return;const c=find('clients',r.clientId)||{},s=data.settings||{};
 const subject='Factura '+(r.number||'')+' · '+(name('services',r.serviceId)!=='—'?name('services',r.serviceId):s.name||'');
 const body='Hola,\n\nAdjuntamos la factura '+r.number+(r.scope==='day'?' correspondiente al cierre parcial de la jornada del '+fmt(r.serviceDate):'')+' por un total de '+euro(r.total)+', con vencimiento el '+fmt(r.dueDate)+'.'+(s.iban?'\n\nPago por transferencia: '+s.iban:'')+'\n\nUn saludo,\n'+(s.name||'');
 window.location.href='mailto:'+encodeURIComponent(c.email||'')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 modal('Enviar factura '+esc(r.number),'<div class="notice">Se ha abierto tu correo con el mensaje preparado'+(c.email?' para <b>'+esc(c.email)+'</b>':'. El cliente no tiene correo: añádelo en su ficha')+'. Adjunta el PDF con «Imprimir / Guardar PDF».</div><div class="form-footer">'+button('print','Imprimir / Guardar PDF','download','data-id="'+esc(r.id)+'" data-kind="invoices"','')+button('invoice-sent','Marcar como enviada','check','data-id="'+esc(r.id)+'" data-to="'+esc(c.email||'')+'"')+'</div>');
}

/* Ficha del trabajador como página y buscador de asignación por categoría, antigüedad y disponibilidad. */
let workerFocus='',photoBust=Date.now(),pickerSlot='',pickerQuery='',pickerShowAll=false;
const normCat=v=>String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const isFixed=w=>['indefinite','fixed_discontinuous'].includes(w.contractType);
const contractLabel=w=>({eventual:'Eventual',indefinite:'Indefinido',fixed_discontinuous:'Fijo discontinuo'})[w.contractType]||'Eventual';
const hasPhoto=id=>(data.employeePhotoIds||[]).includes(id);
const workerSince=w=>w.startDate||String(w.createdAt||'').slice(0,10)||'9999-12-31';
function seniorityText(w){const from=workerSince(w);if(from.startsWith('9999'))return 'Sin fecha de alta';const m=Math.max(0,Math.floor((Date.now()-Date.parse(from+'T12:00:00'))/(30.44*864e5)));const y=Math.floor(m/12),r=m%12;return (y?y+' año'+(y>1?'s':''):'')+(y&&r?' y ':'')+(r||!y?r+' mes'+(r===1?'':'es'):'')+' · alta '+fmt(from);}
function avatar(w,size=44){return hasPhoto(w.id)?`<img class="avatar-img" style="width:${size}px;height:${size}px" src="/api/office/employee-photo?workerId=${encodeURIComponent(w.id)}&v=${photoBust}" alt="Foto de ${esc(w.name)}" loading="lazy">`:`<span class="avatar-ph" style="width:${size}px;height:${size}px;font-size:${Math.round(size/2.8)}px">${esc(initials(w.name))}</span>`;}
function categoryNames(){return [...new Map(list('tariffs').filter(t=>t.active!==false).map(t=>[normCat(t.name),{name:t.name,group:t.group||'Personalizado'}])).values()];}
function workerCategories(w){return Array.isArray(w.categories)?w.categories:[];}
function hasCategory(w,category){const cats=workerCategories(w);return cats.length?cats.some(c=>normCat(c)===normCat(category)):normCat(w.specialty)===normCat(category);}
function slotHours(l){const out=[];let t=Date.parse(l.date+'T'+l.start+':00Z');const end=Date.parse((l.endDate||l.date)+'T'+l.end+':00Z');for(;t<end&&out.length<72;t+=3600000){const d=new Date(t);out.push([d.toISOString().slice(0,10),d.getUTCHours()]);}return out;}
function workerAvailability(w,l){
 const busy=list('assignments').find(a=>a.workerId===w.id&&a.status!=='rejected'&&a.orderLineId!==l.id&&(a.date+'T'+a.start)<((l.endDate||l.date)+'T'+l.end)&&((a.endDate||a.date)+'T'+a.end)>(l.date+'T'+l.start));
 if(busy)return {ok:false,kind:'busy',label:'Ocupado · '+name('services',busy.serviceId)+' '+busy.start+'–'+busy.end};
 const recs=list('availability').filter(r=>r.workerId===w.id),weekly=(data.weeklyAvailabilityRows||[]).find(x=>x.workerId===w.id)?.days||{};
 let unknown=false,source='';
 for(const [d,h] of slotHours(l)){
  const r=recs.find(x=>x.date===d);
  if(r){if(r.status==='unavailable')return {ok:false,kind:'no',label:'No disponible el '+fmt(d)};if(r.slots?.length&&!r.slots.map(Number).includes(h))return {ok:false,kind:'no',label:'Ese día solo '+hourRanges(r.slots)};source=source||'day';continue;}
  const wk=weekly[weekdayKeys[(new Date(d+'T12:00:00Z').getUTCDay()+6)%7]];
  if(wk&&Array.isArray(wk.slots)&&wk.slots.length){if(wk.slots.map(Number).includes(h)){source=source||'week';continue;}return {ok:false,kind:'no',label:'Fuera de su horario habitual ('+hourRanges(wk.slots)+')'};}
  if(wk&&!Array.isArray(wk.slots)&&wk.available){source=source||'week';continue;}
  unknown=true;
 }
 if(unknown)return isFixed(w)?{ok:true,kind:'fixed',label:'Fijo · disponible'}:{ok:false,kind:'unknown',label:'Sin disponibilidad indicada'};
 return {ok:true,kind:'yes',label:source==='day'?'Disponible ese día':'Disponible (horario habitual)'};
}
function openWorkerPage(id){
 if(!find('workers',id))return;workerFocus=id;page='worker-page';if($('#modal').open)$('#modal').close();
 if(location.hash!=='#/trabajador/'+id)history.pushState({workerId:id},'','#/trabajador/'+encodeURIComponent(id));
 renderNav();workerPage();window.scrollTo({top:0});
}
function workerPage(){
 const w=find('workers',workerFocus);if(!w){page='workers';return render();}
 const user=list('users').find(u=>u.workerId===w.id),profile=(data.employeeProfiles||[]).find(p=>p.workerId===w.id)||{},weekly=(data.weeklyAvailabilityRows||[]).find(x=>x.workerId===w.id)?.days||{};
 const shifts=list('assignments').filter(a=>a.workerId===w.id).sort((a,b)=>(b.date+b.start).localeCompare(a.date+a.start));
 const upcoming=shifts.filter(a=>(a.endDate||a.date)>=day()&&a.status!=='rejected').reverse(),past=shifts.filter(a=>(a.endDate||a.date)<day());
 const month=day().slice(0,7),monthShifts=shifts.filter(a=>a.date.startsWith(month)&&a.status!=='rejected'),monthHours=monthShifts.reduce((n,a)=>n+Number(a.workerHours??a.hours??0),0),monthCost=monthShifts.reduce((n,a)=>n+Number(a.workerUnits??a.workerHours??a.hours??0)*Number(a.costRate||0),0);
 const cats=categoryNames(),open=new Set(workerCategories(w).map(normCat)),groups=[...new Set(cats.map(c=>c.group))];
 const line=(k,v)=>`<div class="wp-line"><span>${k}</span><strong>${esc(v||'—')}</strong></div>`;
 const days={mon:'Lunes',tue:'Martes',wed:'Miércoles',thu:'Jueves',fri:'Viernes',sat:'Sábado',sun:'Domingo'};
 const labels={nationality:'Nacionalidad',postalCode:'Código postal',city:'Ciudad',province:'Provincia',country:'País',shirtSize:'Talla',drivingLicense:'Carnet de conducir',ownVehicle:'Vehículo propio',languages:'Idiomas',skills:'Carnets y conocimientos',education:'Estudios'};
 const shiftRow=a=>`<tr><td><button class="service-title-link" data-action="open-service" data-id="${esc(a.serviceId)}">${esc(name('services',a.serviceId))}</button></td><td>${fmt(a.date)}<small>${a.start}–${a.end}</small></td><td>${esc(a.role||'—')}</td><td>${badge(a.status)}</td><td>${a.checkIn?stamp(a.checkIn)+'<small>'+stamp(a.checkOut)+'</small>':'—'}</td><td>${Number(a.workerHours??a.hours??0).toLocaleString('es-ES')} h</td></tr>`;
 $('#page-title').textContent=w.name;$('#breadcrumb').textContent='Trabajadores / '+w.name;$('#section-label').textContent='FICHA DEL TRABAJADOR';$('#page-description').textContent=seniorityText(w);
 $('#page-actions').innerHTML=button('worker-back','Volver a trabajadores','left','','')+button('edit','Editar ficha','edit','data-kind="workers" data-id="'+esc(w.id)+'"','');
 $('#content').innerHTML=`<section class="wp-hero panel"><button class="wp-photo" data-action="worker-photo" data-id="${esc(w.id)}" title="Cambiar foto">${avatar(w,112)}<span>${hasPhoto(w.id)?'Cambiar foto':'Subir foto'}</span></button>
 <div class="wp-hero-main"><span class="eyebrow">${esc((w.specialty||'Sin especialidad').toUpperCase())}</span><h2>${esc(w.name)}</h2><div class="wp-badges"><span class="badge ${isFixed(w)?'confirmed':'pending'}">${contractLabel(w)}</span>${badge(w.active===false?'unavailable':'available')}<span class="badge issued">${user?.active?'Acceso activo · '+esc(user.username):'Sin acceso al área de empleado'}</span></div>
 <p class="muted">${esc(seniorityText(w))}</p><div class="wp-contact">${w.phone?`<a href="tel:${esc(w.phone.replace(/[^+\d]/g,''))}">${icon('info')}${esc(w.phone)}</a>`:''}${w.email?`<a href="mailto:${esc(w.email)}">${icon('message')}${esc(w.email)}</a>`:''}</div></div>
 <div class="wp-hero-stats"><div><strong>${upcoming.length}</strong><small>Próximos turnos</small></div><div><strong>${monthHours.toLocaleString('es-ES')} h</strong><small>Este mes</small></div><div><strong>${euro(monthCost)}</strong><small>Coste bruto del mes</small></div><div><strong>${past.length}</strong><small>Turnos realizados</small></div></div>
 <div class="wp-hero-actions">${button('worker-user','Acceso del empleado','shield',`data-id="${esc(w.id)}"`,'')}${button('worker-document','Subir documento','upload',`data-id="${esc(w.id)}"`,'')}${button('archive','Archivar','trash',`data-kind="workers" data-id="${esc(w.id)}"`,'danger')}</div></section>
 <section class="panel pad"><div class="wp-section-head"><div><h3>Categorías abiertas</h3><p class="footnote">Solo aparecerá en el buscador de turnos de las categorías que tenga abiertas. Pulsa para abrir o cerrar.${open.size?'':' Sin configurar: de momento se usa su especialidad ('+esc(w.specialty||'—')+').'}</p></div><strong>${open.size} abiertas</strong></div>
 ${groups.map(g=>`<div class="wp-cat-group"><small>${esc(g)}</small><div class="wp-cats">${cats.filter(c=>c.group===g).map(c=>`<button class="wp-cat ${open.has(normCat(c.name))?'on':''}" data-action="worker-category" data-id="${esc(w.id)}" data-cat="${esc(c.name)}">${open.has(normCat(c.name))?'✓ ':''}${esc(c.name)}</button>`).join('')}</div></div>`).join('')}</section>
 <div class="wp-grid"><section class="panel pad"><h3>Datos personales y laborales</h3>${line('DNI / NIE',w.taxId)}${line('Móvil',w.phone)}${line('Correo',w.email)}${line('Dirección',w.address)}${line('IBAN',w.iban?w.iban.replace(/^(.{4}).*(.{4})$/,'$1 •••• $2'):'')}${line('Contacto de emergencia',w.emergency)}${line('Contrato',contractLabel(w))}${line('Fecha de alta',w.startDate?fmt(w.startDate):'')}${line('Fin de contrato',w.endDate?fmt(w.endDate):'')}${line('Coste por hora',euro(w.costRate))}${Object.entries(labels).filter(([k])=>profile[k]&&String(profile[k]).length).map(([k,l])=>line(l,Array.isArray(profile[k])?profile[k].join(', '):profile[k])).join('')}</section>
 <section class="panel pad"><h3>Disponibilidad habitual</h3>${Object.entries(days).map(([k,l])=>{const d=weekly[k];const txt=Array.isArray(d?.slots)&&d.slots.length?hourRanges(d.slots):d?.available&&!Array.isArray(d?.slots)?(d.start||'')+'–'+(d.end||''):'';return line(l,txt||(isFixed(w)?'Fijo · disponible':'Sin indicar'));}).join('')}
 <h3 style="margin-top:18px">Próximos días indicados</h3>${list('availability').filter(r=>r.workerId===w.id&&r.date>=day()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10).map(r=>line(fmt(r.date),r.status==='unavailable'?'No disponible':r.slots?.length?hourRanges(r.slots):'Disponible')).join('')||'<p class="footnote">Sin días indicados.</p>'}</section></div>
 <section class="panel pad"><h3>Próximos turnos</h3>${upcoming.length?table(['Servicio','Fecha','Categoría','Estado','Fichajes','Horas'],upcoming.map(shiftRow)):'<p class="footnote">Sin turnos próximos.</p>'}</section>
 <section class="panel pad"><h3>Historial de turnos</h3>${past.length?table(['Servicio','Fecha','Categoría','Estado','Fichajes','Horas'],past.slice(0,50).map(shiftRow)):'<p class="footnote">Todavía no tiene turnos realizados.</p>'}</section>
 <section class="panel pad"><div class="wp-section-head"><h3>Documentación</h3>${button('worker-document','Subir documento','upload',`data-id="${esc(w.id)}"`,' small')}</div>${list('documents').filter(d=>d.workerId===w.id).map(d=>`<div class="list-item"><div class="grow"><p>${esc(d.name)}</p><small>${esc(d.type||'')} · ${fmt(d.createdAt)}${d.expires?' · caduca '+fmt(d.expires):''}${d.source==='employee'?' · subido por el trabajador':''}</small></div><a class="icon-btn" href="/api/office/document?id=${encodeURIComponent(d.id)}" aria-label="Descargar">${icon('download')}</a></div>`).join('')||'<p class="footnote">Sin documentos vinculados.</p>'}</section>`;
}
function workerPhotoUpload(id){
 const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg';
 input.onchange=async()=>{const f=input.files[0];if(!f)return;if(f.size>1024*1024)return toast('La foto debe ocupar menos de 1 MB.',true);
  try{const content=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=()=>rej(new Error('No se pudo leer la foto.'));r.readAsDataURL(f);});await api('employee-photo-upload',{workerId:id,mime:f.type,content});photoBust=Date.now();await load();toast('Foto actualizada');}catch(e){toast(e.message,true);}};
 input.click();
}
async function toggleWorkerCategory(id,cat){
 const w=find('workers',id);if(!w||busy)return;const cats=workerCategories(w),has=cats.some(c=>normCat(c)===normCat(cat));
 const next=has?cats.filter(c=>normCat(c)!==normCat(cat)):[...cats,cat];
 busy=true;try{await api('save',{kind:'workers',record:{...w,categories:next,createAccess:false}});await load();toast((has?'Categoría cerrada: ':'Categoría abierta: ')+cat);}catch(e){toast(e.message,true);}finally{busy=false;}
}
function assignPicker(slotId){
 const l=find('orderLines',slotId);if(!l)return;pickerSlot=slotId;
 const category=find('tariffs',l.categoryId)?.name||l.role||'';
 const all=list('workers').filter(w=>w.active!==false);
 const eligible=all.filter(w=>hasCategory(w,category));
 const q=normCat(pickerQuery);
 const rows=eligible.filter(w=>!q||normCat([w.name,w.specialty,w.phone].join(' ')).includes(q)).map(w=>({w,av:workerAvailability(w,l)})).filter(x=>pickerShowAll||x.av.ok).sort((a,b)=>Number(b.av.ok)-Number(a.av.ok)||workerSince(a.w).localeCompare(workerSince(b.w))||a.w.name.localeCompare(b.w.name));
 const available=eligible.filter(w=>workerAvailability(w,l).ok).length,unconfigured=all.filter(w=>!workerCategories(w).length).length;
 const html=`<div class="picker-slot"><div><span class="eyebrow">${esc(category||'Puesto')}</span><strong>${esc(name('services',l.serviceId))}</strong><small>${fmt(l.date)} · ${l.start}–${l.end}${l.serviceType?' · '+esc(l.serviceType):''}${l.team?' · '+esc(l.team):''}</small></div><div class="picker-count"><b>${available}</b><small>disponibles de ${eligible.length} con la categoría</small></div></div>
 <div class="picker-tools"><div class="searchbox">${icon('search')}<input id="picker-search" placeholder="Buscar trabajador…" value="${esc(pickerQuery)}" autocomplete="off"></div><label class="checkbox-label"><input type="checkbox" id="picker-all" ${pickerShowAll?'checked':''}>Ver también no disponibles</label></div>
 <div class="picker-list">${rows.map(({w,av})=>`<div class="picker-row ${av.ok?'':'off'}">${avatar(w,46)}<div class="grow"><strong>${esc(w.name)}</strong><small>${esc(w.specialty||'—')} · ${contractLabel(w)} · ${esc(seniorityText(w).split(' · ')[0])} de antigüedad</small><span class="av-tag ${av.kind}">${esc(av.label)}</span></div><div class="row-actions"><button class="icon-btn" data-action="picker-profile" data-id="${esc(w.id)}" title="Ver ficha" aria-label="Ver ficha de ${esc(w.name)}">${icon('eye')}</button>${av.kind==='busy'?'':button('picker-assign','Asignar','check',`data-id="${esc(w.id)}"`,av.ok?'primary small':' small')}</div></div>`).join('')||`<div class="empty"><h3>Nadie disponible</h3><p>Ningún trabajador con la categoría ${esc(category)} abierta tiene disponibilidad en este tramo.${pickerShowAll?'':' Marca «Ver también no disponibles» para ver al resto.'}</p></div>`}</div>
 ${unconfigured?`<p class="footnote">${unconfigured} trabajador(es) aún no tienen categorías abiertas; para ellos se usa su especialidad. Ábrelas desde su ficha.</p>`:''}<p class="footnote">Orden: disponibles primero y por antigüedad (fecha de alta). Los trabajadores fijos se consideran disponibles salvo que hayan indicado lo contrario.</p>
 <div class="form-footer">${button('picker-advanced','Asignación avanzada','edit',`data-id="${esc(l.id)}"`,'')}<button class="btn" data-action="close">Cerrar</button></div>`;
 modal('Asignar trabajador',html);$('#modal').classList.add('wide-modal');
 const s=$('#picker-search');s.oninput=()=>{pickerQuery=s.value;const p=s.selectionStart;assignPicker(slotId);const n=$('#picker-search');n.focus();n.setSelectionRange(p,p);};
 $('#picker-all').onchange=e=>{pickerShowAll=e.target.checked;assignPicker(slotId);};
}
async function pickerAssign(workerId){
 const l=find('orderLines',pickerSlot),w=find('workers',workerId);if(!l||!w||busy)return;
 const av=workerAvailability(w,l);if(!av.ok&&!confirm(w.name+': '+av.label+'. ¿Asignar igualmente?'))return;
 busy=true;try{await api('save',{kind:'assignments',record:{serviceId:l.serviceId,orderLineId:l.id,workerId:w.id,categoryId:l.categoryId,date:l.date,endDate:l.endDate||l.date,start:l.start,end:l.end,pause:l.pause||0,team:l.team||''}});$('#modal').close();await load();toast('Puesto asignado a '+w.name);}catch(e){toast(e.message,true);}finally{busy=false;}
}

/* ---------- Ciclo de vida del servicio: fase, progreso y siguiente paso ---------- */
const FLOW=[['plan','Planificar'],['staff','Personal'],['live','Día del servicio'],['close','Cierre'],['bill','Facturación'],['collect','Cobro']];
const FLOW_TABS=[['active','Activos'],['plan','Por planificar'],['staff','Por cubrir o confirmar'],['ready','Listos'],['live','En curso'],['close','Por cerrar'],['bill','Por facturar'],['collect','Por cobrar'],['done','Terminados']];
function servicePhase(s){
 if(s.status==='cancelled')return {phase:'cancelled',step:-1,label:'Cancelado',tone:'muted',next:null};
 const st=staffing(s),pos=svcPositions(s.id).length,as=svcAssigned(s.id),t=day();
 const openClock=as.filter(a=>a.checkIn&&!a.checkOut&&!a.noShow).length;
 const inv=list('invoices').filter(i=>i.serviceId===s.id),queue=billingQueue().find(x=>x.service.id===s.id&&x.type==='service');
 const draft=inv.find(i=>i.status==='draft'),unsent=inv.find(i=>i.status!=='draft'&&!i.sentAt),unpaid=inv.filter(invoiceOpen),overdue=unpaid.find(invoiceOverdue);
 const go=(label,act,extra='')=>({label,act,extra});
 if(!pos&&!as.length)return {phase:'plan',step:0,label:'Por planificar',tone:'warn',next:go('Añadir jornadas y puestos','flow-open',`data-id="${esc(s.id)}" data-tab="planning"`)};
 if(s.status!=='completed'&&s.date>t){
  if(st.missing)return {phase:'staff',step:1,label:`Faltan ${st.missing} por cubrir`,tone:'warn',next:go(`Asignar ${st.missing} puesto${st.missing>1?'s':''}`,'flow-open',`data-id="${esc(s.id)}" data-tab="staff"`)};
  if(st.pending)return {phase:'staff',step:1,label:`${st.pending} sin confirmar`,tone:'warn',next:go('Recordar a quien no ha confirmado','flow-remind',`data-id="${esc(s.id)}"`)};
  return {phase:'ready',step:1,done:true,label:'Equipo completo y confirmado',tone:'ok',next:null};
 }
 if(s.status!=='completed'&&s.date<=t&&s.endDate>=t)return {phase:'live',step:2,label:`En curso · ${st.present} presentes de ${st.assigned}`,tone:'live',next:st.missing?go(`Cubrir ${st.missing} puesto${st.missing>1?'s':''}`,'flow-open',`data-id="${esc(s.id)}" data-tab="staff"`):go('Ver fichajes','flow-open',`data-id="${esc(s.id)}" data-tab="staff"`)};
 if(s.status!=='completed')return {phase:'close',step:3,label:'Terminado sin cerrar',tone:'warn',next:openClock?go(`Cerrar ${openClock} fichaje${openClock>1?'s':''} abierto${openClock>1?'s':''}`,'flow-open',`data-id="${esc(s.id)}" data-tab="closing"`):go('Marcar como finalizado','service-status',`data-id="${esc(s.id)}" data-status="completed"`)};
 if(s.settlementStatus!=='confirmed'&&as.length)return {phase:'close',step:3,label:'Liquidación sin certificar',tone:'warn',next:openClock?go(`Cerrar ${openClock} fichaje${openClock>1?'s':''} abierto${openClock>1?'s':''}`,'flow-open',`data-id="${esc(s.id)}" data-tab="closing"`):go('Certificar liquidación','settlement-confirm',`data-id="${esc(s.id)}"`)};
 if(queue)return {phase:'bill',step:4,label:'Pendiente de facturar · '+euro(queue.amount),tone:'warn',next:go('Crear factura','bill-create',`data-id="${esc(s.id)}"`)};
 if(draft)return {phase:'bill',step:4,label:'Factura en borrador',tone:'warn',next:go('Revisar y emitir','view',`data-kind="invoices" data-id="${esc(draft.id)}"`)};
 if(unsent)return {phase:'bill',step:4,label:'Factura emitida sin enviar',tone:'warn',next:go('Enviar factura','invoice-mail',`data-id="${esc(unsent.id)}"`)};
 if(unpaid.length)return {phase:'collect',step:5,label:(overdue?'Vencida · ':'Por cobrar · ')+euro(unpaid.reduce((n,i)=>n+i.total-(i.paid||0),0)),tone:overdue?'bad':'warn',next:go('Registrar cobro','payment',`data-id="${esc((overdue||unpaid[0]).id)}"`)};
 if(!inv.length)return {phase:'bill',step:4,label:'Sin facturar',tone:'warn',next:go('Crear factura','bill-create',`data-id="${esc(s.id)}"`)};
 return {phase:'done',step:6,label:'Cobrado y cerrado',tone:'ok',next:null};
}
const phaseMatches=(ph,tab)=>tab==='active'?!['done','cancelled'].includes(ph.phase):tab===ph.phase;
function flowStepper(ph,compact=false){
 if(ph.step<0)return '<span class="flow-cancelled">Cancelado</span>';
 return `<div class="flow ${compact?'compact':''}">${FLOW.map(([k,l],i)=>{const state=i<ph.step||(i===ph.step&&ph.done)||ph.phase==='done'?'done':i===ph.step?'current '+ph.tone:'';return `<div class="flow-step ${state}" title="${l}"><i>${state.startsWith('done')?'✓':i+1}</i>${compact?'':`<span>${l}</span>`}</div>`;}).join('<b class="flow-line"></b>')}</div>`;
}
function nextButton(ph,small=true){return ph.next?`<button class="btn ${small?'small ':''}primary flow-next" data-action="${ph.next.act}" ${ph.next.extra}>${esc(ph.next.label)} ${icon('arrow')}</button>`:'';}
async function remindPending(serviceId){
 const pending=list('assignments').filter(a=>a.serviceId===serviceId&&a.status==='pending'),users=list('users').filter(u=>u.active&&u.role==='worker');
 const targets=pending.map(a=>({a,u:users.find(u=>u.workerId===a.workerId)})).filter(x=>x.u);
 if(!targets.length)return toast('Los trabajadores pendientes no tienen acceso al área de empleado. Llámalos desde su ficha.',true);
 const s=find('services',serviceId);if(busy)return;busy=true;
 try{for(const {a,u} of targets)await api('message-send',{recipientId:u.id,content:`Recordatorio: tienes pendiente confirmar tu turno en ${s.name} el ${fmt(a.date)} de ${a.start} a ${a.end}. Entra en tu área de empleado y confirma o indica si no puedes.`});await load();toast('Recordatorio enviado a '+targets.length+' trabajador(es)');}catch(e){toast(e.message,true)}finally{busy=false}
}

function collection(){const rows=filtered(page);let html='';const tr=c=>`<tr>${c.map(s=>`<td>${s}</td>`).join('')}</tr>`;
 if(page==='tariffs')html=table(['Categoría','Grupo / Unidad','Pago bruto','Cliente','Mínimo',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong><small>${esc(r.id)}</small>`,esc(r.group)+'<small>'+esc(r.unit==='day'?'Por show/día':'Por hora')+'</small>',r.workerRate==null?'Pendiente':euro(r.workerRate),r.clientRate==null?'Pendiente':euro(r.clientRate),r.minHours+' h',action('edit','Modificar tarifa',r.id,'tariffs','edit')])));
  if(['clients','workers'].includes(page))html=table([page==='workers'?'Trabajador':'Cliente','Contacto',page==='workers'?'Especialidad':'NIF','Estado',''],(page==='workers'?rows.slice().sort((a,b)=>workerSince(a).localeCompare(workerSince(b))):rows).map(r=>tr([page==='workers'?`<button class="worker-cell" data-action="view" data-kind="workers" data-id="${esc(r.id)}">${avatar(r,38)}<span><strong>${esc(r.name)}</strong><small>${contractLabel(r)} · ${esc(seniorityText(r).split(' · ')[0])}</small></span></button>`:`<strong>${esc(r.name)}</strong><small>${esc(r.email)}</small>`,esc(r.phone||'—'),esc(page==='workers'?r.specialty:r.taxId),badge(r.active===false?'unavailable':'available'),rowActions(r,page)])));
 if(page==='services')html=table(['Servicio','Fechas','Fase del servicio','Siguiente paso',''],rows.sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)).map(r=>{const ph=servicePhase(r);return tr([`<button class="service-title-link" data-action="open-service" data-id="${esc(r.id)}">${esc(r.name)}</button><small>${esc(name('clients',r.clientId))} · ${esc(r.venue)}</small>`,`${relDay(r.date)}${r.endDate!==r.date?`<small>hasta ${fmt(r.endDate)}</small>`:`<small>${r.start}–${r.end}</small>`}`,`${flowStepper(ph,true)}<small class="flow-label ${ph.tone}">${esc(ph.label)}</small>`,nextButton(ph)||'<span class="flow-ok">'+icon('check')+'Al día</span>',rowActions(r,page)]);}));
 if(page==='assignments')html=table(['Trabajador / Servicio','Horario','Equipo','Confirmación','Entrada / Salida',''],rows.map(r=>tr([`<strong>${esc(name('workers',r.workerId))}</strong><small>${esc(name('services',r.serviceId))}</small>`,`${fmt(r.date)}<small>${r.start}–${r.end} · ${r.hours} h</small>`,`${esc(r.team||'—')}<small>${esc(r.role)}</small>`,badge(r.status),`${stamp(r.checkIn)}<small>${stamp(r.checkOut)}</small>`,rowActions(r,page)])));
 if(['quotes','invoices'].includes(page))html=table(['Documento','Cliente','Fecha / Vencimiento','Total','Pendiente','Estado',''],rows.map(r=>tr([`<strong>${esc(r.number||'Borrador')}</strong><small>${esc(name('services',r.serviceId))}</small>`,esc(name('clients',r.clientId)),`${fmt(r.date)}<small>${fmt(r.dueDate)}</small>`,euro(r.total),page==='invoices'?euro(r.total-r.paid):'—',badge(page==='invoices'&&r.status!=='draft'&&r.paid<r.total&&r.dueDate<day()?'overdue':r.status),rowActions(r,page)])));
 if(page==='expenses')html=table(['Concepto','Proveedor','Fecha','Servicio','Importe','Estado',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong>`,esc(r.supplier),fmt(r.date),esc(name('services',r.serviceId)),euro(r.amount),badge(r.status),rowActions(r,page)])));
 if(page==='users')html=table(['Usuario','Nombre','Acceso','Trabajador','Estado',''],rows.map(r=>tr([`<strong>${esc(r.username)}</strong>`,esc(r.name),esc(({manager:'Gestor',coordinator:'Coordinador',worker:'Trabajador'})[r.role]),esc(name('workers',r.workerId)),badge(r.active?'available':'unavailable'),rowActions(r,page)])));
 if(page==='documents')html=table(['Documento','Trabajador / Cliente','Tipo','Subido','Caducidad',''],rows.map(r=>tr([`<strong>${esc(r.name)}</strong><small>${(r.size/1024).toFixed(0)} KB</small>`,`${esc(name('workers',r.workerId))}<small>${esc(name('clients',r.clientId))}</small>`,esc(r.type),fmt(r.createdAt),r.expires?`${fmt(r.expires)} ${r.expires<day()?badge('overdue'):''}`:'—',`<a class="icon-btn" href="/api/office/document?id=${encodeURIComponent(r.id)}" title="Descargar" aria-label="Descargar ${esc(r.name)}">${icon('download')}</a>`])));
 const scopeTabs=page==='services'&&manager()?(()=>{const phases=list('services').map(servicePhase);return `<div class="segmented flow-tabs">${FLOW_TABS.map(([k,l])=>{const n=phases.filter(ph=>phaseMatches(ph,k)).length;return `<button class="${serviceScope===k?'selected':''}" data-action="svc-scope" data-scope="${k}">${l}<b>${n}</b></button>`;}).join('')}</div>`;})():'';
 $('#content').innerHTML=scopeTabs+toolbar(rows)+(rows.length?html:`<div class="panel">${empty(query||filter?'Sin resultados':'Todavía no hay registros',query||filter?'Prueba con otra búsqueda o cambia el filtro.':'Empieza añadiendo tu primer registro. Se guardará en tu espacio de trabajo.')}</div>`);
 const input=$('#search');input.oninput=()=>{query=input.value;const p=input.selectionStart;collection();$('#search').focus();$('#search').setSelectionRange(p,p);};$('#filter').onchange=e=>{filter=e.target.value;collection();};
}
function editor(kind,id='',preset={}){
 const r={...(id?find(kind,id):{}),...preset};let fields='';const amount=(n,l,v=0)=>field(n,l,v,'number','min="0" step="0.01"');
 if(kind==='tariffs')fields=field('schedule','Tarifa',r.schedule||'Tarifa estándar 2026','text','required')+field('id','Código único de categoría',r.id||'','text',id?'readonly':'required pattern="[A-Za-z0-9_ -]{2,80}"')+field('name','Categoría',r.name||'','text','required',true)+field('group','Grupo',r.group||'Personalizado')+select('unit','Unidad',[{id:'hour',name:'Hora'},{id:'day',name:'Show / Día'}],r.unit||'hour')+amount('minHours','Mínimo (horas)',r.minHours??0)+field('workerRate','Pago bruto trabajador (€ por unidad)',r.workerRate??'','number','min="0" step="0.01"')+field('clientRate','Tarifa cliente (€ por unidad)',r.clientRate??'','number','min="0" step="0.01"')+amount('incrementPercent','Incremento trabajador y cliente (%)',r.incrementPercent??0)+bool('active','Categoría activa',r.active!==false)+notes(r.notes,'Notas y condiciones');
  if(kind==='orderLines')fields=select('serviceId','Servicio',list('services').filter(s=>s.status!=='cancelled'&&s.settlementStatus!=='confirmed'),r.serviceId)+select('categoryId','Categoría',list('tariffs').filter(t=>t.active).map(t=>({id:t.id,name:t.name})),r.categoryId)+field('serviceType','Tipo de servicio',r.serviceType||'LOAD IN')+field('team','Equipo o escenario',r.team)+select('coordinatorId','Trabajador coordinador de esta línea',list('users').filter(u=>u.active&&u.role==='worker'&&u.workerId),r.coordinatorId)+field('date','Día',r.date||day(),'date','required')+field('start','Inicio',r.start||'08:00','time','required')+field('endDate','Día final',r.endDate||r.date||day(),'date','required')+field('end','Fin',r.end||'18:00','time','required')+amount('pause','Pausa (h)',r.pause??0)+(id?'':field('quantity','Número de plazas individuales a crear',1,'number','min="1" max="100" step="1"'))+notes(r.notes,'Observaciones de la plaza');
  if(['workers','clients'].includes(kind))fields=field('name',kind==='workers'?'Nombre y apellidos':'Razón social',r.name,'text','required maxlength="200"',true)+field('taxId',kind==='workers'?'DNI / NIE':'NIF / CIF',r.taxId)+field('phone','Móvil',r.phone,'tel')+field('email','Correo electrónico',r.email,'email')+(kind==='workers'?field('specialty','Especialidad',r.specialty):field('contact','Persona de contacto',r.contact))+field('address','Dirección',r.address,'text','',true)+(kind==='workers'?amount('costRate','Coste por hora (€)',r.costRate)+select('contractType','Tipo de contrato',[{id:'eventual',name:'Eventual / por servicio'},{id:'indefinite',name:'Indefinido'},{id:'fixed_discontinuous',name:'Fijo discontinuo'}],r.contractType||'eventual')+field('username','Usuario de acceso (opcional, se genera si está vacío)','', 'text',id?'readonly':'autocomplete="off"',true)+field('iban','IBAN',r.iban)+field('startDate','Fecha de alta',r.startDate,'date')+field('endDate','Fin de contrato',r.endDate,'date')+field('emergency','Contacto de emergencia',r.emergency,'text','',true):field('paymentDays','Plazo de pago (días)',r.paymentDays??30,'number','min="0" max="365"'))+notes(r.notes)+bool('active','Ficha activa',r.active!==false);
 if(kind==='services')fields=select('tariffSchedule','Tarifa del servicio',quoteScheduleNames().map(name=>({id:name,name})),r.tariffSchedule||'Tarifa estándar 2026')+field('name','Nombre del servicio',r.name,'text','required',true)+select('clientId','Cliente',list('clients').filter(c=>c.active),r.clientId)+field('venue','Recinto / ubicación',r.venue,'text','required')+field('venueLat','Latitud del recinto (opcional)',r.venueLat??'','number','step="any" min="-90" max="90"')+field('venueLng','Longitud del recinto (opcional)',r.venueLng??'','number','step="any" min="-180" max="180"')+field('radiusMeters','Radio de fichaje en metros',r.radiusMeters??500,'number','min="100" max="5000"')+field('date','Día de inicio',r.date||day(),'date','required')+field('start','Hora de inicio',r.start||'08:00','time','required')+field('endDate','Día de fin',r.endDate||r.date||day(),'date','required')+field('end','Hora de fin',r.end||'18:00','time','required')+select('coordinatorId','Trabajador que coordina el servicio',list('users').filter(u=>u.active&&(u.role==='manager'||u.workerId)),r.coordinatorId)+field('callTime','Hora de llamada (opcional)',r.callTime||'','time')+field('required','Personal requerido',r.required??1,'number','min="0" max="10000"')+`<label class="wide">Observaciones para el personal<textarea name="employeeNotes" maxlength="3000" placeholder="Entrada por puerta 5, uniformidad, EPIs, catering…">${esc(r.employeeNotes||'')}</textarea><small>Las verá cada trabajador asignado en la página del servicio.</small></label>`+select('status','Estado',Object.entries(statuses).filter(([v])=>['planned','confirmed','in_progress','completed','cancelled'].includes(v)).map(([id,name])=>({id,name})),r.status||'planned')+notes(r.notes);
 if(kind==='assignments')fields=select('orderLineId','Puesto del servicio (opcional)',list('orderLines').filter(l=>l.status!=='cancelled'&&!list('assignments').some(a=>a.orderLineId===l.id&&a.id!==r.id)).map(l=>({id:l.id,name:`${name('services',l.serviceId)} · ${l.role} · ${l.date} ${l.start}`})),r.orderLineId)+select('categoryId','Categoría / tarifa',list('tariffs').map(t=>({id:t.id,name:t.name})),r.categoryId)+select('serviceId','Servicio',list('services').filter(s=>s.status!=='cancelled'),r.serviceId)+select('workerId','Trabajador',list('workers').filter(w=>w.active),r.workerId)+field('role','Especialidad / función',r.role)+field('team','Equipo',r.team)+field('date','Día de inicio',r.date||'','date')+field('start','Hora de inicio',r.start||'','time')+field('endDate','Día de fin',r.endDate||'','date')+field('end','Hora de fin',r.end||'','time')+amount('pause','Pausa no computable (h)',r.pause)+amount('costRate','Pago al trabajador por unidad (€)',r.baseCostRate??r.costRate)+amount('chargeRate','Tarifa al cliente por unidad (€)',r.baseChargeRate??r.chargeRate??((r.costRate??find('workers',r.workerId)?.costRate??0)*2))+amount('incrementPercent','Incremento de tarifa (%)',r.incrementPercent??0)+field('actualHours','Horas reales trabajador (vacío = previstas)',r.actualHours??'','number','min="0" max="744" step="0.01"')+field('clientHours','Horas facturables cliente (vacío = previstas)',r.clientHours??'','number','min="0" max="744" step="0.01"')+bool('noShow','No presentado: coste trabajador cero',r.noShow===true)+bool('noShowChargeApproved','Cobrar cancelación al cliente según acuerdo documentado en notas',r.noShowChargeApproved===true)+notes(r.notes)+`<p class="footnote wide">Deja el horario vacío para usar el del servicio. Para jornadas nocturnas indica el día de fin. La app comprueba solapes y asignaciones duplicadas.</p>`;
 if(['invoices','quotes'].includes(kind))fields=select('clientId','Cliente',list('clients'),r.clientId)+select('serviceId','Servicio (opcional)',list('services'),r.serviceId)+field('date','Fecha del documento',r.date||day(),'date','required')+field('dueDate',kind==='quotes'?'Válido hasta':'Fecha de vencimiento',r.dueDate||day(),'date','required')+`<div class="wide"><div class="subhead"><h3>Conceptos</h3><button type="button" class="text-btn" data-action="add-line">${icon('plus')} Añadir línea</button></div><div id="invoice-lines">${(r.lines||[{description:'',quantity:1,price:0,vat:data.settings.vat}]).map(lineHTML).join('')}</div><div class="lines-summary" id="lines-total"></div></div>`+notes(r.notes,'Observaciones del documento');
 if(kind==='expenses')fields=field('name','Concepto',r.name,'text','required',true)+field('supplier','Proveedor',r.supplier)+field('date','Fecha',r.date||day(),'date','required')+amount('amount','Importe total (€)',r.amount)+amount('vat','IVA incluido (%)',r.vat??21)+select('serviceId','Servicio (opcional)',list('services'),r.serviceId)+select('status','Estado',[{id:'pending',name:'Pendiente de pago'},{id:'paid',name:'Pagado'}],r.status||'pending')+notes(r.notes);
 if(kind==='users')fields=field('name','Nombre para mostrar',r.name,'text','required')+field('username','Usuario o correo',r.username,'text','required minlength="3" autocomplete="off"')+select('role','Rol',[{id:'manager',name:'Gestor: acceso completo'},{id:'worker',name:'Trabajador: su información'}],r.role||'worker')+select('workerId','Ficha de trabajador vinculada',list('workers'),r.workerId)+field('password',id?'Nueva contraseña (opcional)':'Contraseña inicial','','password',`minlength="12" maxlength="128" autocomplete="new-password" ${id?'':'required'}`,true)+bool('active','Permitir acceso',r.active!==false)+`<p class="footnote wide">El trabajador necesita una ficha vinculada. Los cambios de permisos, estado o contraseña cierran sus sesiones existentes.</p>`;
 if(kind==='documents')fields=field('file','Archivo PDF, PNG o JPEG (máximo 5 MB)','','file','required accept=".pdf,.png,.jpg,.jpeg"',true)+select('workerId','Trabajador (puede descargarlo)',list('workers'),r.workerId)+select('clientId','Cliente',list('clients'),r.clientId)+select('serviceId','Servicio',list('services'),r.serviceId)+select('type','Tipo',[{id:'contract',name:'Contrato de trabajo'},{id:'identity',name:'Identificación'},{id:'training',name:'Formación / PRL'},{id:'medical',name:'Reconocimiento / aptitud'},{id:'service',name:'Documentación del servicio / PRL recinto'},{id:'other',name:'Otro documento'}],r.type||'contract')+field('expires','Fecha de caducidad (opcional)',r.expires,'date')+bool('shareWithStaff','Compartir con todo el personal asignado al servicio (plan de autoprotección, PRL…). Solo si no está vinculado a un trabajador.',!!r.shareWithStaff)+notes(r.notes);
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
 if(preset._applyTariff){applyTariff();$('#modal-title').textContent='Aplicar cambio de categoría · '+name('workers',r.workerId);$('#editor').insertAdjacentHTML('beforebegin','<div class="notice">Solicitado por el Crew Head. Revisa la nueva categoría y sus tarifas antes de guardar; después marca la incidencia como resuelta.</div>');}
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
 html=`<div class="detail-grid">${detailItem('Cliente',manager()?name('clients',r.clientId):'Servicio asignado')}${detailItem('Recinto',r.venue)}${detailItem('Inicio',fmt(r.date)+' · '+r.start)}${detailItem('Fin',fmt(r.endDate)+' · '+r.end)}${detailItem('Coordinador',name('users',r.coordinatorId))}<div><small>Estado</small>${badge(r.status)}</div></div>${manager()?`<div class="detail-actions">${button('add-slot','Añadir puesto','plus',`data-id="${id}"`)}${button('assign-service','Asignar personal','plus',`data-id="${id}"`)}${r.status==='completed'&&r.settlementStatus!=='confirmed'?button('settlement-confirm','Certificar liquidación','check',`data-id="${id}"`,''):''}${r.settlementStatus==='confirmed'?'<strong>Liquidación confirmada</strong>':''}</div>`:''}<div class="subhead"><h3>Personal asignado (${a.length})</h3></div>${a.length?table(['Persona','Función','Horario','Estado'],a.map(a=>`<tr><td>${esc(name('workers',a.workerId))}</td><td>${esc(a.role)}</td><td>${a.start}–${a.end}</td><td>${badge(a.status)}</td></tr>`)):empty('Sin asignaciones','Añade personal para empezar a organizar el servicio.')}${r.notes?`<div class="notice">${esc(r.notes)}</div>`:''}`;
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
 if(kind==='quotes'&&r.staffPlan?.length)html='<div class="subhead"><h3>Planificación de personal · '+r.staffPlan.length+' bloques</h3>'+
 (r.status==='draft'?button('quote-plan-edit','Editar jornadas y categorías','edit','data-id="'+esc(r.id)+'"',''):'')+'</div>'+
 table(['Día / Horario','Tipo / ubicación','Categoría','Personas','Importe base'],r.staffPlan.map(p=>'<tr><td>'+esc(p.date)+'<small>'+esc(p.start)+'–'+esc(p.end)+'</small></td><td>'+esc(p.serviceType)+'<small>'+esc(p.locationName||r.serviceVenue||'Sin ubicación')+'</small></td><td>'+esc(p.role)+'</td><td>'+p.quantity+'</td><td>'+euro(p.quantity*p.billable*p.unitPrice)+'</td></tr>'))+'<div class="subhead"><h3>Documento</h3></div>';
 html+=`${paper(r,kind)}<div class="detail-actions">${r.status==='draft'?button('issue',kind==='invoices'?'Emitir factura':'Emitir presupuesto','check',`data-kind="${kind}" data-id="${id}"`):button('print','Imprimir / Guardar PDF','download',`data-id="${id}" data-kind="${kind}"`,'')}${kind==='invoices'&&r.status!=='draft'?button('invoice-mail',r.sentAt?'Reenviar por correo':'Enviar por correo','arrow',`data-id="${id}"`,''):''}${kind==='invoices'&&r.status!=='draft'&&r.paid<r.total?button('payment','Registrar cobro','wallet',`data-id="${id}"`):''}${kind==='quotes'&&r.status==='issued'?button('quote-status','Aceptar y crear servicio','check',`data-id="${id}" data-status="accepted"`,'')+button('quote-status','Rechazado','close',`data-id="${id}" data-status="rejected"`,''):''}</div>${kind==='quotes'&&r.status==='accepted'&&!r.serviceId?button('service-wizard','Crear servicio desde presupuesto','plus',`data-quote-id="${id}"`,''):kind==='quotes'&&r.serviceId?button('view','Ver servicio vinculado','briefcase',`data-kind="services" data-id="${r.serviceId}"`,''):''}${r.payments?.length?`<h3>Cobros registrados</h3>${table(['Fecha','Importe','Referencia'],r.payments.map(p=>`<tr><td>${fmt(p.date)}</td><td>${euro(p.amount)}</td><td>${esc(p.reference)}</td></tr>`))}`:''}`;
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
function settingsFields(){const s=data.settings;return field('name','Razón social',s.name,'text','required',true)+field('taxId','NIF / CIF',s.taxId,'text','required')+field('phone','Teléfono',s.phone)+field('address','Dirección fiscal',s.address,'text','required',true)+field('email','Correo de facturación',s.email,'email')+field('iban','IBAN de cobro',s.iban)+field('invoicePrefix','Serie de facturación',s.invoicePrefix,'text','required pattern="[A-Za-z0-9-]{1,15}"')+field('vat','IVA por defecto (%)',s.vat,'number','min="0" max="100" step="0.01"')+field('paymentDays','Plazo de pago (días)',s.paymentDays,'number','min="0" max="365"')+`<label class="wide">Pie de factura<textarea name="footer">${esc(s.footer)}</textarea></label>`+field('emergencyPhone','Teléfono de guardia (solo urgencias)',s.emergencyPhone||'','tel')+`<label class="wide">Aviso obligatorio para el personal<textarea name="staffNotice" maxlength="1500" placeholder="Es OBLIGATORIO presentarse con la camiseta corporativa y los EPI…">${esc(s.staffNotice||'')}</textarea><small>Aparece destacado en la página de cada servicio del área de empleado.</small></label>`;}
function settingsPage(){$('#page-actions').innerHTML=button('backup','Exportar datos','download','','');$('#content').innerHTML=`<div class="panel settings-form"><div class="notice">La serie y la numeración se aplican al emitir el documento. Las facturas emitidas conservan sus datos y no se pueden editar. La exportación contiene registros y metadatos; descarga los archivos de contratos desde Documentos.</div><form id="settings-form"><div class="form-grid">${settingsFields()}</div><div class="form-footer"><button class="btn primary" type="submit">Guardar ajustes</button></div></form></div><p class="footnote">La emisión y el registro de cobros se gestionan aquí. Este panel no realiza presentaciones tributarias, firma electrónica ni envíos a organismos externos.</p>`;$('#settings-form').onsubmit=async e=>{e.preventDefault();try{await api('settings',{record:{...Object.fromEntries(new FormData(e.target)),revision:data.settings.revision}});await load();toast('Datos de empresa guardados');}catch(err){toast(err.message,true);}};}
function auditPage(){const labels={create:'Creación',update:'Modificación',archive:'Archivo',issue:'Emisión',payment:'Cobro',upload:'Documento subido',user:'Usuario actualizado',settings:'Ajustes',setup:'Primer gestor',confirmed:'Asignación confirmada',rejected:'Rechazo',availability:'Disponibilidad','clock-in':'Entrada','clock-out':'Salida','qr-in':'Entrada por QR','qr-out':'Salida por QR','attendance-adjust':'Corrección de fichaje','quote-invoice':'Conversión a factura',password:'Contraseña cambiada'};$('#content').innerHTML=table(['Fecha y hora','Persona','Operación','Sección','Referencia / Motivo'],(data.audit||[]).map(a=>`<tr><td>${stamp(a.time)}</td><td>${esc(a.name)}</td><td>${esc(labels[a.action]||a.action)}</td><td>${esc(navs.find(n=>n[0]===a.kind)?.[1]||a.kind)}</td><td><small>${esc(a.recordId)}</small>${a.reason?`<small>${esc(a.reason)}</small><small>${stamp(a.before?.checkIn)} → ${stamp(a.after?.checkIn)}</small><small>${stamp(a.before?.checkOut)} → ${stamp(a.after?.checkOut)}</small>`:''}</td></tr>`));}
function download(text,filename,type='text/plain'){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function exportCSV(){const rows=filtered(page);if(!rows.length)return toast('No hay registros para exportar');const cols=[...new Set(rows.flatMap(r=>Object.keys(r).filter(k=>typeof r[k]!=='object')))];const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';download('\ufeff'+[cols,...rows.map(r=>cols.map(c=>r[c]))].map(r=>r.map(cell).join(';')).join('\r\n'),`NOVA_${page}_${day()}.csv`,'text/csv;charset=utf-8');}
function parseCSV(source){source=source.replace(/^\ufeff/,'');const delimiter=source.split('\n')[0].includes(';')?';':',';let rows=[],row=[],v='',quoted=false;for(let i=0;i<source.length;i++){const c=source[i];if(c==='"'){if(quoted&&source[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===delimiter&&!quoted){row.push(v);v='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&source[i+1]==='\n')i++;row.push(v);if(row.some(x=>x.trim()))rows.push(row);row=[];v='';}else v+=c;}if(quoted)throw new Error('El CSV contiene comillas sin cerrar.');row.push(v);if(row.some(x=>x.trim()))rows.push(row);return rows;}
function importCSV(){const kind=page;modal('Importar '+(kind==='workers'?'trabajadores':'clientes'),`<div class="notice">Columnas: <b>name</b> (obligatoria), email, phone, taxId, address, ${kind==='workers'?'specialty, costRate':'contact, paymentDays'}. Máximo 200 filas por importación. Se crean fichas nuevas; revisa posibles duplicados.</div><input type="file" id="csv-file" accept=".csv,text/csv"><div id="import-preview"></div><div class="form-footer"><button class="btn" data-action="csv-template" data-kind="${kind}">Descargar plantilla</button><button class="btn primary" id="import-run" disabled>Importar</button></div>`);let prepared=[];$('#csv-file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1024*1024)throw new Error('CSV demasiado grande.');const csv=parseCSV(await file.text());const headers=csv.shift().map(x=>x.trim());if(!headers.includes('name'))throw new Error('Falta la columna name.');if(csv.length>200)throw new Error('Divide el archivo en bloques de hasta 200 filas.');prepared=csv.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]||''])));if(prepared.some(r=>!r.name.trim()))throw new Error('Hay filas sin nombre.');const duplicate=prepared.filter(r=>list(kind).some(x=>x.name.toLowerCase()===r.name.toLowerCase()||(r.taxId&&x.taxId===r.taxId)));if(duplicate.length)throw new Error('Ya existen '+duplicate.length+' fichas del archivo. Retíralas del CSV para evitar duplicados.');$('#import-preview').innerHTML=`<div class="notice">${prepared.length} fichas listas para importar.</div><div class="import-preview">${table(['Nombre','Correo','Móvil'],prepared.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${esc(r.phone)}</td></tr>`))}</div>`;$('#import-run').disabled=!prepared.length;}catch(err){prepared=[];$('#import-run').disabled=true;$('#import-preview').innerHTML=`<div class="error">${esc(err.message)}</div>`;}};
 $('#import-run').onclick=async e=>{e.target.disabled=true;let saved=0;try{for(const row of prepared){await api('save',{kind,record:{...row,active:true}});saved++;}$('#modal').close();await load();toast(saved+' fichas importadas');}catch(err){prepared=prepared.slice(saved);$('#import-preview').innerHTML=`<div class="error">${saved} fichas guardadas. ${esc(err.message)}. Quedan ${prepared.length} sin importar.</div>`;await load();}finally{e.target.disabled=false;}};}
async function runMutation(op,b,msg){if(busy)return;busy=true;try{await api(op,b);$('#modal').close();await load();toast(msg);}catch(err){toast(err.message,true);}finally{busy=false;}}
document.addEventListener('click',async e=>{const el=e.target.closest('[data-action],[data-page]');if(!el)return;const a=el.dataset.action,id=el.dataset.id,kind=el.dataset.kind;try{
 if(el.dataset.page){if(['service-workspace','worker-page'].includes(page))history.replaceState(null,'',location.pathname+location.search);page=el.dataset.page;query='';filter='';document.body.classList.remove('nav-open');renderNav();render();if(!a||a==='navigate')return;}
 if(a==='service-home'){page='services';renderNav();return render()}
 if(a==='service-doc-new')return editor('documents','',{serviceId:id,shareWithStaff:true,type:'service'});
 if(a==='crew-day-reopen')return runMutation('crew-day-reopen',{serviceId:el.dataset.service,date:el.dataset.date},'Día reabierto para el Crew Head');
 if(a==='incident-apply-category'){const i=find('incidents',id);if(!i)return;return editor('assignments',i.assignmentId,{categoryId:i.requestedCategoryId,_applyTariff:true});}
 if(a==='invoice-tab'){invoiceTab=el.dataset.tab;return invoicesPage()}
 if(a==='bill-create'){if(busy)return;busy=true;try{const r=await api('invoice-from-service',{serviceId:id,...(el.dataset.date?{date:el.dataset.date}:{})});await load();invoiceTab='draft';if(page==='invoices')invoicesPage();detail('invoices',r.record.id);toast('Borrador de factura creado. Revísalo y emítelo.');}catch(err){toast(err.message,true)}finally{busy=false}return}
 if(a==='invoice-mail')return mailInvoice(id);
 if(a==='invoice-sent'){const r=find('invoices',id);return runMutation('invoice-mark-sent',{id,revision:r.revision,to:el.dataset.to||''},'Factura marcada como enviada')}
 if(a==='worker-back'){history.replaceState(null,'',location.pathname+location.search);page='workers';renderNav();return render()}
 if(a==='worker-photo')return workerPhotoUpload(id);
 if(a==='worker-category')return toggleWorkerCategory(id,el.dataset.cat);
 if(a==='picker-assign')return pickerAssign(id);
 if(a==='picker-profile')return openWorkerPage(id);
 if(a==='picker-advanced'){const l=find('orderLines',id);return editor('assignments','',{orderLineId:id,serviceId:l?.serviceId});}
 if(a==='flow-open'){serviceFocus=id;openServicePage(id);serviceTab=el.dataset.tab||'planning';return serviceWorkspacePage();}
 if(a==='flow-remind')return remindPending(id);
 if(a==='flow-phase'){page='services';serviceScope=el.dataset.scope;query='';filter='';renderNav();return render()}
 if(a==='svc-scope-go'){page='services';serviceScope=el.dataset.scope;query='';filter='';renderNav();return render()}
 if(a==='svc-scope'){serviceScope=el.dataset.scope;return render()}
 if(a==='incident-tab'){incidentTab=el.dataset.tab;return managerIncidentsPage()}
 if(a==='msg-peer'){msgPeer=id;return managerMessagesPage()}
 if(a==='broadcast')return broadcastModal();
 if(a==='go-filter'){if(el.dataset.target==='invoices')invoiceTab=el.dataset.filter==='overdue'?'open':'pending';page=el.dataset.target;query='';filter=el.dataset.filter||'';renderNav();return render()}
 if(a==='avail-week'){const dir=Number(el.dataset.dir);availWeek=dir?isoAdd(availWeek||mondayOf(day()),7*dir):mondayOf(day());return teamAvailabilityPage()}
 if(a==='service-status'){const sv=find('services',id);if(!sv||sv.status===el.dataset.status)return;return runMutation('save',{kind:'services',record:{...sv,status:el.dataset.status}},'Estado del servicio actualizado')}
 if(a==='global-search')return globalSearch();
 if(a==='open-service'){if($('#modal').open)$('#modal').close();return openServicePage(id);}
 if(a==='service-back'){history.replaceState(null,'',location.pathname+location.search);page='services';renderNav();return render()}

 if(a==='service-day-new')return serviceDayEditor();
 if(a==='service-day-edit')return serviceDayEditor(id);
 if(a==='service-block-new')return serviceBlockEditor('',el.dataset.date||'');
 if(a==='service-block-edit')return serviceBlockEditor(id);
 if(a==='service-block-add-positions')return blockAddCategories(id);
 if(a==='service-block-operators')return serviceBlockOperatorsEditor(id);
 if(a==='block-operator-remove'){const o=find('serviceBlockOperators',id);if(!o)return;return runMutation('service-block-operator-remove',{id:o.id,revision:o.revision},'Coordinador retirado')}
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
 if(a==='quote-create-cancel'){page='quotes';renderNav();return render()}
 if(a==='quote-plan-new')return quotePlanEditor();
 if(a==='quote-plan-edit')return quotePlanEditor(id);
 if(a==='quote-plan-add'){captureQuotePlanRows();planRows.push({...planRows.at(-1),quantity:1,categoryId:''});return drawQuotePlanRows()}
 if(a==='quote-plan-duplicate'){captureQuotePlanRows();planRows.splice(Number(el.dataset.index)+1,0,{...planRows[Number(el.dataset.index)]});return drawQuotePlanRows()}
 if(a==='quote-plan-remove'){captureQuotePlanRows();planRows.splice(Number(el.dataset.index),1);return drawQuotePlanRows()}
 if(a==='tariff-new-schedule')return newTariffSchedule();
  if(a==='service-create-cancel'){page='services';renderNav();return render()}
 if(a==='service-wizard')return serviceWizard(el.dataset.quoteId||'');
  if(a==='new'&&kind==='services')return serviceWizard();
 if(a==='edit'&&kind==='quotes'&&find('quotes',id)?.staffPlan?.length)return quotePlanEditor(id);
  if(a==='new'||a==='edit')return editor(kind,id);
 if(a==='view'&&kind==='workers')return openWorkerPage(id);
 if(a==='view'&&kind==='services'){if($('#modal').open)$('#modal').close();return openServicePage(id);}
 if(a==='view')return detail(kind,id);
 if(a==='close')return $('#modal').close();
 if(a==='refresh'){await load();return toast('Datos actualizados');}
 if(a==='logout'){await api('logout',{});data={};$('#modal').close();$('#app').hidden=true;$('#auth').hidden=false;return authScreen();}
 if(a==='show-password'){const i=$('#auth-password');i.type=i.type==='password'?'text':'password';return;}
 if(a==='add-line'){$('#invoice-lines').insertAdjacentHTML('beforeend',lineHTML({description:'',quantity:1,price:0,vat:data.settings.vat}));lineTotal();return;}
 if(a==='remove-line'){if($$('.invoice-line').length>1)el.closest('.invoice-line').remove();lineTotal();return;}
 if(a==='wizard-add-position'){captureWizardPositions();wizardPositions.push({});return wizardRows()}
  if(a==='wizard-duplicate-position'){captureWizardPositions();const i=Number(el.dataset.index);wizardPositions.splice(i+1,0,{...wizardPositions[i],workerId:''});return wizardRows()}
  if(a==='wizard-add-day'){captureWizardPositions();const last=wizardPositions.at(-1)||{};const source=last.date||$('#service-wizard-form [name=date]')?.value||day();const next=new Date(source+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);const date=next.toISOString().slice(0,10);wizardPositions.push({...last,date,endDate:date,workerId:''});return wizardRows()}
  if(a==='wizard-remove-position'){captureWizardPositions();wizardPositions.splice(Number(el.dataset.index),1);return wizardRows()}
  if(a==='add-slot')return editor('orderLines','',{serviceId:id});
  if(a==='assign-slot'){pickerQuery='';pickerShowAll=false;return assignPicker(id);}
  if(a==='assign-service')return editor('assignments','',{serviceId:id});
 if(a==='worker-user'){const existing=list('users').find(u=>u.workerId===id);return existing?editor('users',existing.id):editor('users','',{workerId:id,name:name('workers',id)});}
 if(a==='worker-document')return editor('documents','',{workerId:id});
 if(a==='settlement-confirm')return runMutation('settlement-confirm',{serviceId:id,revision:find('services',id).revision},'Liquidación certificada: los trabajadores ya ven su importe');
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
 
 if(a==='attendance-adjust'||a==='attendance-service-edit')return adjustAttendance(id);
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
$('#close-modal').innerHTML=icon('close');$('#close-modal').onclick=()=>$('#modal').close();$('#refresh').innerHTML=icon('refresh');$('#refresh').insertAdjacentHTML('beforebegin',`<button class="search-trigger" data-action="global-search" aria-label="Buscar (Ctrl+K)">${icon('search')}<span>Buscar…</span><kbd>Ctrl K</kbd></button>`);$('#menu').innerHTML=icon('menu');$('#logout').innerHTML=icon('logout');$('#menu').onclick=()=>document.body.classList.toggle('nav-open');$('#shade').onclick=()=>document.body.classList.remove('nav-open');
$('#account').onclick=()=>{modal('Cambiar mi contraseña',formWrap(field('current','Contraseña actual','','password','required autocomplete="current-password"',true)+field('password','Nueva contraseña (mínimo 12 caracteres)','','password','required minlength="12" maxlength="128" autocomplete="new-password"',true)));formHandler(async b=>{await api('password',b);data={};$('#app').hidden=true;$('#auth').hidden=false;await authScreen();});};
setInterval(async()=>{if(!data.user||document.hidden||$('#modal').open||['service-create','quote-create'].includes(page)||polling||busy||$('#search')===document.activeElement)return;polling=true;try{await load();}catch(err){$('#sync').textContent='Sin conexión · reintentando';}finally{polling=false;}},30000);
window.addEventListener('online',()=>{if(data.user)load().catch(e=>toast(e.message,true));});
// Remove the previous demo service worker, if one was installed, so it cannot serve stale screens.
if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
window.addEventListener('popstate',()=>{
 const wm=location.hash.match(/^#\/trabajador\/(.+)$/);if(wm&&find('workers',decodeURIComponent(wm[1]))){workerFocus=decodeURIComponent(wm[1]);page='worker-page';renderNav();return workerPage();}
 const match=location.hash.match(/^#\/servicio\/(.+)$/);
 if(match&&find('services',decodeURIComponent(match[1]))){serviceFocus=decodeURIComponent(match[1]);page='service-workspace';renderNav();serviceWorkspacePage();}
 else if(data.user){page='services';renderNav();render();}
});
(async()=>{try{await load();}catch{await authScreen();}})();
})();
