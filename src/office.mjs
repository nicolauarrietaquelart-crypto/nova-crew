import {STANDARD_TARIFFS, STANDARD_EXCEPTIONS} from './tariffs.mjs';
/* NOVA Crew operations. Persistent, isolated from legacy demonstration data. */
const enc = new TextEncoder();
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const hex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2,'0')).join('');
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const digest = async s => hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const equal = (a,b) => {let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;};
const text = (s,n=200) => String(s??'').trim().slice(0,n);
const fail = (s,code=400) => {throw Object.assign(new Error(s),{status:code});};
const required = (s,label) => {if(!text(s))fail(`Falta ${label}.`);return text(s);};
const number = (v,min=0,max=1e8) => {const n=Number(v??0);if(!Number.isFinite(n)||n<min||n>max)fail('Importe o cantidad incorrectos.');return n;};
const money = n => Math.round((n+Number.EPSILON)*100)/100;
const categoryMinimum = role => ({'HAND B':5,'HAND A':3,'HAND M':4,'HAND C1':0,'CREW HEAD':6,'FORKLIFTER':5})[text(role).toUpperCase().replace(/\s+/g,' ')]||0;
const tariffLookup = async(db,id) => {const base=STANDARD_TARIFFS.find(t=>t.id===id);const override=await db.get(key('tariffs',id));return override?{...base,...override}:base;};
const tariffCatalog = async db => {const custom=await rows(db,'tariffs');return [...STANDARD_TARIFFS.map(t=>({...t,...custom.find(c=>c.id===t.id)})),...custom.filter(c=>!STANDARD_TARIFFS.some(t=>t.id===c.id))];};
const date = s => {const d=text(s,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||Number.isNaN(Date.parse(d+'T12:00:00Z'))||new Date(d+'T12:00:00Z').toISOString().slice(0,10)!==d)fail('Fecha incorrecta.');return d;};
const time = s => {if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))fail('Hora incorrecta.');return s;};
const cleanUser = u => {const {passwordHash,salt,iterations,...safe}=u;return {...safe,role:safe.role==='coordinator'?'worker':safe.role};};
const cookie = v => `__Host-nova_session=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${v?28800:0}`;
const reply = (data,status=200,headers={}) => new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers}});
async function passwordHash(password,salt,iterations=100000){const k=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations,hash:'SHA-256'},k,256));}
async function passwordFields(password){if(typeof password!=='string'||password.length<12||password.length>128)fail('La contraseña debe tener entre 12 y 128 caracteres.');const salt=random();return {salt,iterations:100000,passwordHash:await passwordHash(password,salt)};}
const managerOnly = actor => {if(actor.role!=='manager')fail('Se requiere acceso de gestor.',403);};
const key = (kind,id) => `office/${kind}/${id}`;
const rows = async (db,kind) => [...(await db.list({prefix:`office/${kind}/`})).values()];
const record = async (db,kind,id) => {const r=await db.get(key(kind,id));if(!r)fail('Registro no encontrado.',404);return r;};
const revision = (old,input) => {if(old&&Number(input.revision)!==old.revision)fail('Otro dispositivo ha actualizado este registro. Recarga y revisa los cambios.',409);};
async function audit(db,actor,action,kind,id){const stamp=now();await db.put(`office/audit/${stamp}/${uid()}`,{id:uid(),time:stamp,actor:actor.id,name:actor.name,action,kind,recordId:id});}
const defaults = {name:'',taxId:'',address:'',email:'',phone:'',iban:'',invoicePrefix:'NOVA',vat:21,paymentDays:30,footer:''};
async function settings(db){return {...defaults,...await db.get('office/settings')};}
async function scope(db,actor){if(actor.role==='manager')return null;const services=await rows(db,'services'),a=await rows(db,'assignments');return new Set([...services.filter(s=>s.coordinatorId===actor.id).map(s=>s.id),...a.filter(x=>x.workerId===actor.workerId).map(x=>x.serviceId)]);}
async function canCoordinate(db,actor,id){if(actor.role==='manager')return;const service=await record(db,'services',id);if(service.coordinatorId!==actor.id)fail('No coordinas este servicio.',403);}
async function canService(db,actor,id){if(actor.role==='manager')return;const s=await scope(db,actor);if(!s.has(id))fail('No tienes acceso a ese servicio.',403);}
function publicAssignment(a,actor){
 if(actor.role==='manager')return a;
 const {costRate,chargeRate,baseCostRate,baseChargeRate,clientHours,billableHours,clientUnits,workerHours,workerUnits,minimumHours,incrementPercent,settlementStatus,settledAt,noShowChargeApproved,...rest}=a;
 // Worker receives only their own gross remuneration and settlement state, never customer rates.
 if(actor.role==='worker'&&a.workerId===actor.workerId)return {...rest,grossPay:money((a.workerUnits??a.workerHours??a.hours??0)*(a.costRate??0)),payStatus:a.settlementStatus==='confirmed'?'confirmed':'pending'};
 return rest;
}
async function view(db,actor){
 const serviceScope=await scope(db,actor);const allServices=await rows(db,'services');
 const services=allServices.filter(s=>!serviceScope||serviceScope.has(s.id)).map(s=>{if(actor.role==='manager')return s;const {clientId,notes,...safe}=s;return safe;});
 let assignments=(await rows(db,'assignments')).filter(a=>(!serviceScope||serviceScope.has(a.serviceId))&&(actor.role!=='worker'||a.workerId===actor.workerId));
 const workerIds=new Set(assignments.map(a=>a.workerId));
 const workers=(await rows(db,'workers')).filter(w=>actor.role==='manager'||(actor.role==='worker'?w.id===actor.workerId:workerIds.has(w.id))).map(w=>actor.role==='manager'?w:actor.role==='worker'?{id:w.id,name:w.name,phone:w.phone,email:w.email,specialty:w.specialty,revision:w.revision}:{id:w.id,name:w.name,phone:w.phone,specialty:w.specialty});
 const documents=(await rows(db,'documents')).filter(d=>actor.role==='manager'||(actor.workerId&&d.workerId===actor.workerId));
 const availability=(await rows(db,'availability')).filter(a=>actor.role==='manager'||a.workerId===actor.workerId);
 const coordinatorIds=new Set(services.map(s=>s.coordinatorId).filter(Boolean));
 const directory=(await rows(db,'users')).filter(u=>coordinatorIds.has(u.id)).map(u=>({id:u.id,name:u.name}));
 const assignedServices=allServices.filter(x=>x.coordinatorId===actor.id&&!x.archived).map(x=>x.id);
  const coordinatorRoster=actor.role==='manager'?[]:(await rows(db,'assignments')).filter(a=>assignedServices.includes(a.serviceId)&&!a.archived).map(a=>({id:a.id,serviceId:a.serviceId,workerId:a.workerId,role:a.role,team:a.team,date:a.date,start:a.start,endDate:a.endDate,end:a.end,status:a.status,checkIn:a.checkIn,checkOut:a.checkOut,revision:a.revision}));
  const coordinatorWorkers=actor.role==='manager'?[]:(await rows(db,'workers')).filter(w=>coordinatorRoster.some(a=>a.workerId===w.id)).map(w=>({id:w.id,name:w.name,phone:w.phone,specialty:w.specialty}));
  const result={ok:true,user:cleanUser(actor),users:directory,workers,services,assignments:assignments.map(a=>publicAssignment(a,actor)),coordinatorRoster,coordinatorWorkers,documents,availability};
 if(actor.role==='manager')Object.assign(result,{tariffs:await tariffCatalog(db),tariffExceptions:STANDARD_EXCEPTIONS,orderLines:await rows(db,'orderLines'),clients:await rows(db,'clients'),invoices:await rows(db,'invoices'),quotes:await rows(db,'quotes'),expenses:await rows(db,'expenses'),users:(await rows(db,'users')).map(cleanUser),settings:await settings(db),audit:[...(await db.list({prefix:'office/audit/',reverse:true,limit:200})).values()]});
 return result;
}
function invoiceLines(input){if(!Array.isArray(input)||input.length<1||input.length>100)fail('Añade entre 1 y 100 líneas.');return input.map(l=>{const quantity=number(l.quantity,0.01,1e5),price=number(l.price,0,1e6),vat=number(l.vat,0,100);const net=money(quantity*price);return {description:required(l.description,'el concepto'),quantity,price,vat,net,tax:money(net*vat/100)};});}
function totals(lines){const net=money(lines.reduce((n,l)=>n+l.net,0)),tax=money(lines.reduce((n,l)=>n+l.tax,0));return {net,tax,total:money(net+tax)};}
function personInput(b){return {name:required(b.name,'el nombre'),taxId:text(b.taxId,40),email:text(b.email),phone:text(b.phone,40),address:text(b.address,500),notes:text(b.notes,3000),active:b.active!==false};}
async function saveEntity(db,actor,kind,b){
 managerOnly(actor);if(!['clients','workers','services','assignments','invoices','quotes','expenses','tariffs','orderLines'].includes(kind))fail('Tipo de registro incorrecto.');
 const old=b.id?(kind==='tariffs'?await db.get(key('tariffs',text(b.id))):await record(db,kind,text(b.id))):null;revision(old,b);
 if(old?.archived)fail('El registro está archivado.',409);if(kind==='services'&&old?.settlementStatus==='confirmed')fail('El servicio ya está liquidado y permanece bloqueado. Registra una rectificación por separado.',409);
 let data;
 if(kind==='tariffs'){
    const id=required(b.id,'el código de tarifa'),base=STANDARD_TARIFFS.find(t=>t.id===id);
    if(!/^[a-zA-Z0-9_ -]{2,80}$/.test(id))fail('Código de tarifa incorrecto.');
    if(base?.source==='PW-BCN-2026'&&b.unit&&b.unit!==base.unit)fail('No cambies la unidad original; crea una tarifa personalizada.');
    const workerRate=b.workerRate===''||b.workerRate==null?null:number(b.workerRate,0,1e5);
    const clientRate=b.clientRate===''||b.clientRate==null?(workerRate==null?null:money(workerRate*2)):number(b.clientRate,0,1e6);
    data={name:required(b.name,'el nombre de tarifa'),group:text(b.group)||'Personalizado',unit:b.unit==='day'?'day':'hour',minHours:number(b.minHours??0,0,24),workerRate,clientRate,incrementPercent:number(b.incrementPercent??0,0,500),active:b.active!==false,source:base?.source||'custom',notes:text(b.notes,2000)};
    const value={...(base||{}),...old,...data,id,revision:(old?.revision||0)+1,updatedAt:now(),updatedBy:actor.id};
    await db.put(key('tariffs',id),value);await audit(db,actor,'tariff-save','tariffs',id);return value;
   }
   if(kind==='orderLines'){
    const service=await record(db,'services',required(b.serviceId,'el servicio'));if(service.archived||service.status==='cancelled'||service.settlementStatus==='confirmed')fail('Servicio cerrado o liquidado.');
    const tariff=await tariffLookup(db,required(b.categoryId,'la categoría'));if(!tariff||!tariff.active)fail('Categoría no disponible.');
    const startDate=date(b.date||service.date),endDate=date(b.endDate||startDate),start=time(b.start||service.start),end=time(b.end||service.end);
    if(endDate+'T'+end<=startDate+'T'+start)fail('Horario del bloque incorrecto.');
    if(startDate<service.date||endDate>service.endDate)fail('La plaza está fuera del periodo de la comanda. Amplía primero las fechas del servicio.');
    if(old&&old.serviceId!==service.id)fail('No se puede mover una plaza entre servicios.');
    const assigned=(await rows(db,'assignments')).some(a=>a.orderLineId===old?.id&&!a.archived);
    if(assigned&&['categoryId','date','endDate','start','end'].some(k=>String(b[k]??old[k])!==String(old[k])))fail('Esta plaza ya está asignada: modifica primero el turno del trabajador.',409);
    data={serviceId:service.id,categoryId:tariff.id,role:text(b.role)||tariff.name,serviceType:text(b.serviceType)||'Montaje',team:text(b.team),date:startDate,endDate,start,end,pause:number(b.pause??0,0,24),notes:text(b.notes,1500),status:b.status==='cancelled'?'cancelled':'open'};
   }
   if(kind==='clients')data={...personInput(b),contact:text(b.contact),paymentDays:number(b.paymentDays??30,0,365)};
 if(kind==='workers')data={...personInput(b),specialty:text(b.specialty),costRate:number(b.costRate),startDate:b.startDate?date(b.startDate):'',endDate:b.endDate?date(b.endDate):'',iban:text(b.iban,60),emergency:text(b.emergency),contractType:['eventual','indefinite','fixed_discontinuous'].includes(b.contractType)?b.contractType:'eventual',employmentNotes:text(b.employmentNotes,1500)};
 if(kind==='services'){
  const client=await record(db,'clients',required(b.clientId,'el cliente'));if(!client.active||client.archived)fail('El cliente está inactivo.');
  if(b.coordinatorId){const user=await record(db,'users',b.coordinatorId);if(!user.active||!['manager','worker','coordinator'].includes(user.role))fail('Coordinador no válido.');if(user.role!=='manager'&&!user.workerId)fail('El coordinador debe tener una ficha de trabajador.');}
  const startDate=date(b.date),endDate=date(b.endDate||b.date),start=time(b.start),end=time(b.end);
  if(endDate+'T'+end<=startDate+'T'+start)fail('El fin debe ser posterior al inicio. Para un turno nocturno elige el día siguiente.');
  const status=text(b.status)||'planned';if(!['planned','confirmed','in_progress','completed','cancelled'].includes(status))fail('Estado incorrecto.');
  data={name:required(b.name,'el nombre'),clientId:client.id,date:startDate,endDate,start,end,venue:required(b.venue,'el recinto'),status,coordinatorId:text(b.coordinatorId),required:number(b.required,0,10000),notes:text(b.notes,5000)};
 }
 if(kind==='assignments'){
  const service=await record(db,'services',required(b.serviceId,'el servicio')),worker=await record(db,'workers',required(b.workerId,'el trabajador'));
  if(service.settlementStatus==='confirmed'||service.archived||service.status==='cancelled'||!worker.active||worker.archived)fail('Servicio o trabajador inactivo.');
  const all=await rows(db,'assignments');
  const startDate=date(b.date||service.date);if(worker.endDate&&worker.endDate<startDate)fail('El contrato del trabajador finaliza antes del servicio.');if(worker.startDate&&worker.startDate>startDate)fail('El trabajador aún no está dado de alta en esa fecha.');const unavailable=(await rows(db,'availability')).find(a=>a.workerId===worker.id&&a.date>=startDate&&a.date<=(b.endDate||service.endDate)&&a.status==='unavailable');if(unavailable)fail('El trabajador ha indicado que no está disponible el '+unavailable.date+'.',409);
  const endDate=date(b.endDate||service.endDate),start=time(b.start||service.start),end=time(b.end||service.end),from=Date.parse(startDate+'T'+start+':00Z'),to=Date.parse(endDate+'T'+end+':00Z');
  if(to<=from)fail('El horario de fin debe ser posterior al inicio.');
  const pause=number(b.pause,0,24),hours=money((to-from)/3600000-pause);if(hours<=0)fail('La pausa supera la duración del turno.');
  for(const a of all.filter(a=>a.id!==old?.id&&!a.archived&&a.workerId===worker.id)){
   const other=await db.get(key('services',a.serviceId));if(other?.status==='cancelled'||other?.archived)continue;
   if(from<Date.parse(a.endDate+'T'+a.end+':00Z')&&to>Date.parse(a.date+'T'+a.start+':00Z'))fail('Este trabajador ya tiene otro servicio en ese horario.',409);
  }
  const assignedTariff=b.categoryId?await tariffLookup(db,b.categoryId):null;
   if(b.categoryId&&!assignedTariff)fail('Categoría no encontrada.');
   const line=b.orderLineId?await record(db,'orderLines',b.orderLineId):null;
   if(line&&(line.serviceId!==service.id||line.status==='cancelled'))fail('Plaza no válida para este servicio.');
   if(line&&(await rows(db,'assignments')).some(a=>a.id!==old?.id&&a.orderLineId===line.id&&!a.archived))fail('Esta plaza ya tiene un trabajador.',409);
   const role=text(b.role)||line?.role||assignedTariff?.name||worker.specialty;
   const tariffCandidate=assignedTariff||await tariffLookup(db,line?.categoryId||'');
   const venueNorm=service.venue.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   const exception=tariffCandidate?.id==='hand-montador'&&STANDARD_EXCEPTIONS.some(e=>e.venueContains&&venueNorm.includes(e.venueContains));
   const minimum=exception?3:(tariffCandidate?.minHours??categoryMinimum(role));
   if(old?.settlementStatus==='confirmed'||service.settlementStatus==='confirmed')fail('Liquidación confirmada: no se pueden cambiar sus importes.',409);
   if((await rows(db,'invoices')).some(i=>i.serviceId===service.id&&i.status!=='draft'&&!i.archived))fail('El servicio tiene una factura emitida. Se necesita una rectificación.',409);
   const actualHours=b.actualHours===''||b.actualHours==null?(old?.actualHours??null):number(b.actualHours,0,744);
   const clientHours=b.clientHours===''||b.clientHours==null?(old?.clientHours??null):number(b.clientHours,0,744);
   const noShow=b.noShow===true||b.noShow==='true',noShowChargeApproved=b.noShowChargeApproved===true||b.noShowChargeApproved==='true';if(noShowChargeApproved&&!noShow)fail('El cargo por ausencia requiere marcar No presentado.');if(noShowChargeApproved&&!text(b.notes))fail('Indica el acuerdo contractual que permite cobrar la cancelación.');
   const tariff=tariffCandidate;
   const costRate=number(b.costRate===''||b.costRate==null?(tariff?.workerRate??worker.costRate):b.costRate);
   const chargeRate=number(b.chargeRate===''||b.chargeRate==null?(tariff?.clientRate??costRate*2):b.chargeRate);
   const supplement=number(b.incrementPercent??tariff?.incrementPercent??0,0,500);
   const effectiveCostRate=money(costRate*(1+supplement/100)),effectiveChargeRate=money(chargeRate*(1+supplement/100));
   const workerHours=noShow?0:Math.max(minimum,actualHours??hours),billableHours=noShow&&!noShowChargeApproved?0:Math.max(minimum,clientHours??hours);
   const workerUnits=tariff?.unit==='day'?(noShow?0:1):workerHours,clientUnits=tariff?.unit==='day'?(billableHours>0?1:0):billableHours;
   data={serviceId:service.id,workerId:worker.id,role,team:text(b.team),date:startDate,endDate,start,end,pause,hours,minimumHours:minimum,actualHours,clientHours,workerHours,billableHours,workerUnits,clientUnits,rateUnit:tariff?.unit||'hour',noShow,noShowChargeApproved,categoryId:tariff?.id||text(b.categoryId),orderLineId:line?.id||'',incrementPercent:supplement,baseCostRate:costRate,baseChargeRate:chargeRate,costRate:effectiveCostRate,chargeRate:effectiveChargeRate,settlementStatus:old?.settlementStatus||'pending',settledAt:old?.settledAt||'',status:old?.status||'pending',checkIn:old?.checkIn||'',checkOut:old?.checkOut||'',notes:text(b.notes,1500)};
  if(old?.checkIn&&(data.workerId!==old.workerId||data.serviceId!==old.serviceId))fail('No se puede trasladar un fichaje a otra persona o servicio.',409);
 }
 if(kind==='invoices'||kind==='quotes'){
  if(old&&old.status!=='draft')fail('Solo se pueden editar borradores.',409);
  const client=await record(db,'clients',required(b.clientId,'el cliente'));if(client.archived)fail('El cliente está archivado.');
  if(b.serviceId)await record(db,'services',b.serviceId);
  const lines=invoiceLines(b.lines),issuedDate=date(b.date),dueDate=date(b.dueDate||b.date);if(dueDate<issuedDate)fail('El vencimiento no puede ser anterior a la fecha.');
  data={clientId:client.id,serviceId:text(b.serviceId),date:issuedDate,dueDate,notes:text(b.notes,4000),lines,...totals(lines),status:'draft',number:'',paid:0,payments:[]};
 }
 if(kind==='expenses'){
  if(b.serviceId)await record(db,'services',b.serviceId);
  data={name:required(b.name,'el concepto'),supplier:text(b.supplier),date:date(b.date),amount:number(b.amount),vat:number(b.vat,0,100),serviceId:text(b.serviceId),status:b.status==='paid'?'paid':'pending',notes:text(b.notes,2000)};
 }
 if(kind==='workers'&&data.startDate&&data.endDate&&data.endDate<data.startDate)fail('La fecha de fin de contrato es anterior al alta.');
 const id=old?.id||uid(),value={...old,...data,id,revision:(old?.revision||0)+1,createdAt:old?.createdAt||now(),updatedAt:now(),updatedBy:actor.id};
 await db.put(key(kind,id),value);await audit(db,actor,old?'update':'create',kind,id);return value;
}
export function createOfficeApi(storage,env={}){
 async function rate(name,limit){const k='office/rate/'+await digest(name);await storage.transaction(async db=>{const r=await db.get(k);const t=Date.now();if(r&&r.until>t&&r.count>=limit)fail('Demasiados intentos. Espera 15 minutos.',429);await db.put(k,{until:r&&r.until>t?r.until:t+900000,count:r&&r.until>t?r.count+1:1});});}
 async function auth(req){const token=(req.headers.get('cookie')||'').match(/(?:^|;\s*)__Host-nova_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)fail('Inicia sesión para continuar.',401);const k='office/session/'+await digest(token),s=await storage.get(k);if(!s||s.expires<Date.now()) {if(s)await storage.delete(k);fail('La sesión ha caducado.',401);}const u=await storage.get(key('users',s.userId));if(!u?.active||u.version!==s.version)fail('La cuenta o sesión ya no está activa.',401);if(u.role==='worker'){const w=await storage.get(key('workers',u.workerId));if(!w?.active||w.archived)fail('La ficha de trabajador está inactiva.',401);}return {actor:u,sessionKey:k};}
 async function session(u){const token=random();await storage.put('office/session/'+await digest(token),{userId:u.id,version:u.version,expires:Date.now()+28800000});return reply({ok:true,user:cleanUser(u)},200,{'set-cookie':cookie(token)});}
 return async function handle(req){try{
  const url=new URL(req.url),op=url.pathname.slice('/api/office/'.length)||'status';
  if(!['GET','POST'].includes(req.method))fail('Método no permitido.',405);
  if(req.method==='POST'){
   const origin=req.headers.get('origin');if(origin&&origin!==url.origin)fail('Origen no permitido.',403);
   if(!(req.headers.get('content-type')||'').startsWith('application/json'))fail('Se requiere JSON.',415);
   if(Number(req.headers.get('content-length'))>7500000)fail('El archivo supera el tamaño permitido.',413);
  }
  if(op==='status'&&req.method==='GET')return reply({ok:true,configured:Boolean(await storage.get('office/initialized')),setupAvailable:Boolean(env.NOVA_SETUP_TOKEN&&env.NOVA_SETUP_TOKEN.length>=24),setupState:!env.NOVA_SETUP_TOKEN?'missing':env.NOVA_SETUP_TOKEN.length<24?'too_short':'ready'});
  const raw=req.method==='POST'?await req.text():'';if(raw.length>7500000)fail('Petición demasiado grande.',413);let b={};if(raw){try{b=JSON.parse(raw);}catch{fail('JSON incorrecto.');}}
  const ip=req.headers.get('cf-connecting-ip')||'local';
  if(op==='setup'||op==='login'){
   if(req.method!=='POST')fail('Método no permitido.',405);
   await rate('ip/'+ip,30);
   if(op==='setup'){
    if(!env.NOVA_SETUP_TOKEN||env.NOVA_SETUP_TOKEN.length<24)fail('Configura NOVA_SETUP_TOKEN en los secretos del Worker de Cloudflare (mínimo 24 caracteres).',503);
    if(!equal(String(b.setupToken||''),env.NOVA_SETUP_TOKEN))fail('Clave de instalación incorrecta.',403);
    const credentials=await passwordFields(b.password);const username=required(b.username,'el usuario').toLowerCase();if(!/^[a-z0-9@._+-]{3,100}$/.test(username))fail('Usuario incorrecto.');
    const u={id:uid(),username,name:required(b.name,'el nombre'),role:'manager',active:true,workerId:'',version:1,revision:1,createdAt:now(),...credentials};
    await storage.transaction(async tx=>{if(await tx.get('office/initialized'))fail('La instalación ya está completada.',409);await tx.put(key('users',u.id),u);await tx.put('office/username/'+username,u.id);await tx.put('office/initialized',now());await audit(tx,u,'setup','users',u.id);});return session(u);
   }
   const username=text(b.username,100).toLowerCase();await rate('login/'+username,12);
   const id=await storage.get('office/username/'+username),u=id?await storage.get(key('users',id)):null;
   // Derive a hash even for unknown users, avoiding a cheap username timing oracle.
   const hash=await passwordHash(String(b.password||'').slice(0,128),u?.salt||'nova-invalid-user',u?.iterations||100000);
   if(!u?.active||!equal(hash,u.passwordHash))fail('Usuario o contraseña incorrectos.',401);
   return session(u);
  }
  const {actor,sessionKey}=await auth(req);
  if(req.method==='GET'){
   if(op==='state')return reply(await view(storage,actor));
   if(op==='document'){
    const d=await record(storage,'documents',url.searchParams.get('id'));if(actor.role!=='manager'&&(!actor.workerId||d.workerId!==actor.workerId))fail('No tienes acceso a este documento.',403);
    const chunks=[];for(let i=0;i<d.chunks;i++){const s=await storage.get(`office/file/${d.id}/${i}`);if(typeof s!=='string')fail('Documento incompleto. Contacta con el gestor.',500);chunks.push(s);}const bytes=Uint8Array.from(atob(chunks.join('')),c=>c.charCodeAt(0));
    return new Response(bytes,{headers:{'content-type':'application/octet-stream','content-disposition':`attachment; filename*=UTF-8''${encodeURIComponent(d.name)}`,'cache-control':'no-store','x-content-type-options':'nosniff'}});
   }
   if(op==='backup'){managerOnly(actor);return reply({version:1,exportedAt:now(),data:await view(storage,actor)});}
   fail('Ruta no encontrada.',404);
  }
  if(op==='logout'){await storage.delete(sessionKey);return reply({ok:true},200,{'set-cookie':cookie('')});}
  if(op==='password'){
   if(!equal(await passwordHash(String(b.current||''),actor.salt,actor.iterations),actor.passwordHash))fail('Contraseña actual incorrecta.',403);
   const fields=await passwordFields(b.password);
   await storage.transaction(async tx=>{const current=await record(tx,'users',actor.id);await tx.put(key('users',actor.id),{...current,...fields,version:current.version+1,revision:current.revision+1});await audit(tx,actor,'password','users',actor.id);});return reply({ok:true,relogin:true},200,{'set-cookie':cookie('')});
  }
  if(op==='qr-issue'){b.qrToken=random();b.qrHash=await digest(b.qrToken);}
  if(op==='qr-redeem'){if(!/^[a-f0-9]{64}$/.test(String(b.token||'')))fail('Código QR no válido.');b.qrHash=await digest(b.token);}
  if(op==='user'&&b.record?.password){managerOnly(actor);b.passwordFields=await passwordFields(b.record.password);}
  const result=await storage.transaction(async db=>{
   const currentActor=await record(db,'users',actor.id);if(!currentActor.active||currentActor.version!==actor.version)fail('La sesión ha cambiado. Inicia sesión de nuevo.',401);
   if(op==='save')return {record:await saveEntity(db,actor,text(b.kind),b.record||{})};
    if(op==='order-line-bulk'){
     managerOnly(actor);const count=number(b.quantity,1,100),created=[];
     for(let i=0;i<count;i++)created.push(await saveEntity(db,actor,'orderLines',b.record||{}));
     return {records:created};
    }
   if(op==='archive'){
    managerOnly(actor);const kind=text(b.kind);if(!['clients','workers','services','assignments','quotes','expenses','invoices','orderLines'].includes(kind))fail('Tipo incorrecto.');const r=await record(db,kind,b.id);revision(r,b);
    if(kind==='invoices'&&r.status!=='draft')fail('Una factura emitida no se puede eliminar ni archivar.',409);
    if(kind==='orderLines'&&(await rows(db,'assignments')).some(a=>a.orderLineId===r.id&&!a.archived))fail('Retira la asignación antes de eliminar la plaza.',409);
     if(kind==='assignments'&&(r.checkIn||(await record(db,'services',r.serviceId)).settlementStatus==='confirmed'))fail('No se puede retirar una asignación fichada o liquidada.',409);
    if(kind==='workers'&&(await rows(db,'assignments')).some(a=>a.workerId===r.id&&!a.archived))fail('El trabajador conserva asignaciones. Desactívalo en su ficha.',409);
    if(kind==='clients'&&(await rows(db,'services')).some(s=>s.clientId===r.id&&!s.archived))fail('El cliente tiene servicios. Desactívalo en su ficha.',409);
    if(kind==='services'&&(await rows(db,'assignments')).some(a=>a.serviceId===r.id&&!a.archived))fail('Retira primero las asignaciones o cancela el servicio.',409);
    await db.put(key(kind,r.id),{...r,archived:true,revision:r.revision+1,updatedAt:now()});await audit(db,actor,'archive',kind,r.id);return {};
   }
   if(op==='user'){
    managerOnly(actor);const input=b.record||{},old=input.id?await record(db,'users',input.id):null;revision(old,input);
    const username=required(input.username,'el usuario').toLowerCase();if(!/^[a-z0-9@._+-]{3,100}$/.test(username))fail('Usa un usuario o correo válido.');
    const existing=await db.get('office/username/'+username);if(existing&&existing!==old?.id)fail('Ese usuario ya existe.',409);
    const role=input.role;if(!['manager','worker'].includes(role))fail('Solo existen los roles Gestor y Trabajador.');
    if(role==='worker'&&!input.workerId)fail('Vincula el usuario a una ficha de trabajador.');if(input.workerId)await record(db,'workers',input.workerId);
    const all=await rows(db,'users');if(input.workerId&&all.some(u=>u.id!==old?.id&&u.workerId===input.workerId&&u.active))fail('El trabajador ya tiene un usuario activo.',409);
    const active=input.active!==false;if(old?.role==='manager'&&(!active||role!=='manager')&&!all.some(u=>u.id!==old.id&&u.role==='manager'&&u.active))fail('Debe quedar al menos un gestor activo.',409);
    const fields=input.password?b.passwordFields:null;
    if(!old&&!fields)fail('Introduce la contraseña inicial.');
    const u={...old,...fields,id:old?.id||uid(),username,name:required(input.name,'el nombre'),role,active,workerId:text(input.workerId),version:(old?.version||0)+1,revision:(old?.revision||0)+1,createdAt:old?.createdAt||now()};
    if(old&&old.username!==username)await db.delete('office/username/'+old.username);await db.put('office/username/'+username,u.id);await db.put(key('users',u.id),u);await audit(db,actor,'user','users',u.id);return {record:cleanUser(u)};
   }
   if(op==='settings'){
    managerOnly(actor);const old=await settings(db);revision(old.revision?old:null,b.record||{});const s=b.record||{};
    const prefix=required(s.invoicePrefix,'la serie');if(!/^[A-Za-z0-9-]{1,15}$/.test(prefix))fail('La serie solo admite letras, números y guiones.');
    const value={name:required(s.name,'la razón social'),taxId:required(s.taxId,'el NIF'),address:required(s.address,'la dirección'),email:text(s.email),phone:text(s.phone),iban:text(s.iban,60),invoicePrefix:prefix,vat:number(s.vat,0,100),paymentDays:number(s.paymentDays,0,365),footer:text(s.footer,3000),revision:(old.revision||0)+1};await db.put('office/settings',value);await audit(db,actor,'settings','settings','company');return {};
   }
   if(op==='confirm'){
    const a=await record(db,'assignments',b.id);revision(a,b);if(actor.role!=='manager'&&a.workerId!==actor.workerId)fail('Solo puedes responder a tus asignaciones.',403);
    if(a.archived)fail('Asignación retirada.',409);if(!['confirmed','rejected'].includes(b.status))fail('Respuesta incorrecta.');await db.put(key('assignments',a.id),{...a,status:b.status,revision:a.revision+1,updatedAt:now()});await audit(db,actor,b.status,'assignments',a.id);return {};
   }
   if(op==='qr-issue'){
    const a=await record(db,'assignments',b.id);if(!actor.workerId||a.workerId!==actor.workerId||a.archived)fail('Solo puedes generar tu propio QR.',403);
    const service=await record(db,'services',a.serviceId);if(service.archived||['completed','cancelled'].includes(service.status)||a.checkOut||a.status==='rejected')fail('La asignación no admite fichajes.',409);
    const token=b.qrToken,hash=b.qrHash;const old=await db.get('office/qr-active/'+a.id);if(old)await db.delete('office/qr/'+old);
    await db.put('office/qr/'+hash,{assignmentId:a.id,expires:Date.now()+90000,action:a.checkIn?'out':'in'});await db.put('office/qr-active/'+a.id,hash);return {token,expiresAt:Date.now()+90000,action:a.checkIn?'out':'in'};
   }
   if(op==='qr-redeem'){
    if(actor.role==='worker'||actor.role==='coordinator'){const ticket=await db.get('office/qr/'+b.qrHash);if(!ticket)fail('QR no válido o caducado.',409);const assignment=await record(db,'assignments',ticket.assignmentId);await canCoordinate(db,actor,assignment.serviceId);}
    const ticket=await db.get('office/qr/'+b.qrHash);if(!ticket||ticket.expires<Date.now())fail('QR caducado, utilizado o sustituido. Genera uno nuevo.',409);
    const a=await record(db,'assignments',ticket.assignmentId);await canService(db,actor,a.serviceId);const service=await record(db,'services',a.serviceId);
    if(a.archived||service.archived||['completed','cancelled'].includes(service.status))fail('Servicio no disponible.',409);
    const stamp=now();if(ticket.action==='in'&&a.checkIn||ticket.action==='out'&&(!a.checkIn||a.checkOut))fail('El estado del fichaje ha cambiado. Genera otro QR.',409);
    await db.put(key('assignments',a.id),{...a,...(ticket.action==='in'?{checkIn:stamp,status:'confirmed'}:{checkOut:stamp}),revision:a.revision+1,updatedAt:stamp});
    await db.delete('office/qr/'+b.qrHash);await db.delete('office/qr-active/'+a.id);await audit(db,actor,'qr-'+ticket.action,'assignments',a.id);return {workerId:a.workerId,action:ticket.action,time:stamp};
   }
   if(op==='attendance-adjust'){
    managerOnly(actor);const a=await record(db,'assignments',b.id);revision(a,b);required(b.reason,'el motivo de corrección');
    const checkIn=b.checkIn?new Date(b.checkIn).toISOString():'',checkOut=b.checkOut?new Date(b.checkOut).toISOString():'';
    if(checkOut&&(!checkIn||checkOut<=checkIn))fail('La salida debe ser posterior a la entrada.');
    await db.put(key('assignments',a.id),{...a,checkIn,checkOut,revision:a.revision+1,updatedAt:now()});
    const auditId=uid();await db.put(`office/audit/${now()}/${auditId}`,{id:auditId,time:now(),actor:actor.id,name:actor.name,action:'attendance-adjust',kind:'assignments',recordId:a.id,reason:text(b.reason,1000),before:{checkIn:a.checkIn,checkOut:a.checkOut},after:{checkIn,checkOut}});return {};
   }
   if(op==='quote-invoice'){
    managerOnly(actor);const q=await record(db,'quotes',b.id);if(q.status!=='accepted'||q.archived)fail('Acepta el presupuesto antes de crear una factura.');
    if(q.invoiceId)fail('Este presupuesto ya tiene una factura.',409);
    const config=await settings(db),day=now().slice(0,10),dueDate=new Date(Date.now()+config.paymentDays*86400000).toISOString().slice(0,10);
    const invoice=await saveEntity(db,actor,'invoices',{clientId:q.clientId,serviceId:q.serviceId,date:day,dueDate,notes:q.notes,lines:q.lines});
    await db.put(key('quotes',q.id),{...q,invoiceId:invoice.id,revision:q.revision+1,updatedAt:now()});await audit(db,actor,'quote-invoice','quotes',q.id);return {record:invoice};
   }
   if(op==='clock'){
    const a=await record(db,'assignments',b.id);revision(a,b);const s=await record(db,'services',a.serviceId);
    if(a.archived||s.archived||['cancelled','completed'].includes(s.status))fail('El servicio no admite fichajes.',409);
    if(actor.role!=='manager'&&a.workerId!==actor.workerId)fail('No puedes fichar a otra persona.',403);await canService(db,actor,a.serviceId);
    const stamp=now();let update={};if(b.action==='in'){if(a.checkIn)fail('Ya hay una entrada registrada.',409);if(a.status==='rejected')fail('La asignación está rechazada.');update={checkIn:stamp,status:'confirmed'};}
    else if(b.action==='out'){if(!a.checkIn||a.checkOut)fail('Debe existir una entrada abierta.',409);update={checkOut:stamp};}
    else fail('Fichaje incorrecto.');await db.put(key('assignments',a.id),{...a,...update,revision:a.revision+1,updatedAt:stamp});await audit(db,actor,'clock-'+b.action,'assignments',a.id);return {};
   }
   if(op==='availability'){
    const workerId=actor.role==='manager'?b.workerId:actor.workerId;if(!workerId)fail('Tu cuenta no está vinculada a un trabajador.');await record(db,'workers',workerId);const day=date(b.date),id=workerId+'_'+day;const old=await db.get(key('availability',id));revision(old,b);const status=b.status;if(!['available','unavailable'].includes(status))fail('Disponibilidad incorrecta.');await db.put(key('availability',id),{id,workerId,date:day,status,notes:text(b.notes,500),revision:(old?.revision||0)+1,updatedAt:now()});await audit(db,actor,'availability','availability',id);return {};
   }
   if(op==='settlement-confirm'){
     managerOnly(actor);const s=await record(db,'services',b.serviceId);revision(s,b);
     if(s.status!=='completed'||s.settlementStatus==='confirmed')fail('Finaliza el servicio y revisa que no esté liquidado.',409);
     const aa=(await rows(db,'assignments')).filter(a=>a.serviceId===s.id&&!a.archived);
     if(!aa.length)fail('No hay personal para liquidar.');
     if(aa.some(a=>a.checkIn&&!a.checkOut&&!a.noShow))fail('Hay trabajadores con fichaje abierto. Ciérralos o corrige los fichajes antes de liquidar.',409);
     const stamp=now(),cost=money(aa.reduce((n,a)=>n+(a.workerUnits??a.workerHours??a.hours)*a.costRate,0)),revenue=money(aa.reduce((n,a)=>n+(a.clientUnits??a.billableHours??a.hours)*a.chargeRate,0));
     for(const a of aa)await db.put(key('assignments',a.id),{...a,settlementStatus:'confirmed',settledAt:stamp,revision:a.revision+1,updatedAt:stamp});
     await db.put(key('services',s.id),{...s,settlementStatus:'confirmed',settledAt:stamp,settlementCost:cost,settlementRevenue:revenue,revision:s.revision+1,updatedAt:stamp});
     await audit(db,actor,'settlement-confirm','services',s.id);return {cost,revenue,margin:money(revenue-cost)};
    }
    if(op==='quote-from-order'){
     managerOnly(actor);const service=await record(db,'services',b.serviceId);
     if(service.archived||service.status==='cancelled')fail('No se puede presupuestar un servicio cancelado.');
     const slots=(await rows(db,'orderLines')).filter(l=>l.serviceId===service.id&&!l.archived&&l.status!=='cancelled');
     if(!slots.length)fail('Primero añade plazas a la comanda.');
     const config=await settings(db),lines=[];
     if(slots.length>100)fail('El presupuesto supera 100 líneas. Divide la petición en varios documentos.');
     for(const slot of slots){
      const tariff=await tariffLookup(db,slot.categoryId);if(!tariff||tariff.clientRate==null)fail('Configura la tarifa cliente de '+slot.role+' antes de presupuestar.');
      const raw=money((Date.parse(slot.endDate+'T'+slot.end+':00Z')-Date.parse(slot.date+'T'+slot.start+':00Z'))/3600000-slot.pause);
      if(raw<=0)fail('Pausa excesiva en la plaza '+slot.role);
      const venueNorm=service.venue.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const exception=tariff.id==='hand-montador'&&STANDARD_EXCEPTIONS.some(e=>venueNorm.includes(e.venueContains));
      const units=tariff.unit==='day'?1:Math.max(raw,exception?3:tariff.minHours);
      const price=money(tariff.clientRate*(1+(tariff.incrementPercent||0)/100));
      lines.push({description:service.name+' · '+slot.serviceType+' · '+slot.role+' · '+slot.date+' '+slot.start+'–'+slot.end,quantity:units,price,vat:config.vat});
     }
     const issuedDate=now().slice(0,10),dueDate=new Date(Date.parse(issuedDate+'T12:00:00Z')+30*86400000).toISOString().slice(0,10);
     return {record:await saveEntity(db,actor,'quotes',{clientId:service.clientId,serviceId:service.id,date:issuedDate,dueDate,notes:'Presupuesto generado desde comanda; revisar cantidades y condiciones.',lines})};
    }
    if(op==='invoice-from-service'){
    managerOnly(actor);const service=await record(db,'services',b.serviceId);if(service.archived||service.status==='cancelled')fail('Servicio inactivo.');
    if((await rows(db,'invoices')).some(i=>i.serviceId===service.id&&!i.archived))fail('Este servicio ya tiene una factura o borrador.',409);
    const assignments=(await rows(db,'assignments')).filter(a=>a.serviceId===service.id&&!a.archived&&(a.clientUnits??a.billableHours??a.hours)>0&&(a.status!=='rejected'||a.noShowChargeApproved));if(!assignments.length)fail('El servicio no tiene personal asignado.');
    const config=await settings(db),workers=await rows(db,'workers'),lines=assignments.map(a=>({description:`${service.name} · ${workers.find(w=>w.id===a.workerId)?.name||'Personal'} · ${a.role}${a.noShow?' · Cancelación pactada (no presentado)':''}`,quantity:a.clientUnits??a.billableHours??a.hours,price:a.chargeRate,vat:config.vat}));
    const day=now().slice(0,10),due=new Date(Date.parse(day+'T12:00:00Z')+config.paymentDays*86400000).toISOString().slice(0,10);return {record:await saveEntity(db,actor,'invoices',{clientId:service.clientId,serviceId:service.id,date:day,dueDate:due,lines})};
   }
   if(op==='issue'){
    managerOnly(actor);const kind=b.kind==='quotes'?'quotes':'invoices',r=await record(db,kind,b.id);revision(r,b);if(r.archived||r.status!=='draft')fail('El documento ya está emitido.',409);
    const config=await settings(db);if(!config.name||!config.taxId||!config.address)fail('Completa los datos fiscales de tu empresa en Ajustes.');const client=await record(db,'clients',r.clientId);if(!client.taxId||!client.address)fail('Completa el NIF y la dirección fiscal del cliente.');
    const year=r.date.slice(0,4),series=(kind==='quotes'?'P-':'')+config.invoicePrefix,counterKey=`office/counter/${kind}/${series}/${year}`,n=(await db.get(counterKey)||0)+1;
    const previous=(await rows(db,kind)).filter(i=>i.number&&i.date.startsWith(year)&&i.series===series).sort((a,b)=>b.date.localeCompare(a.date))[0];if(previous&&r.date<previous.date)fail('La fecha es anterior a la última emisión de esta serie.');
    const value={...r,series,number:`${series}-${year}-${String(n).padStart(5,'0')}`,status:'issued',issuer:config,customer:client,issuedAt:now(),revision:r.revision+1,updatedAt:now()};await db.put(counterKey,n);await db.put(key(kind,r.id),value);await audit(db,actor,'issue',kind,r.id);return {record:value};
   }
   if(op==='payment'){
    managerOnly(actor);const r=await record(db,'invoices',b.id);revision(r,b);if(!['issued','partial','paid'].includes(r.status))fail('Emite la factura antes de registrar un cobro.');const amount=money(number(b.amount,0.01)),paid=money(r.paid+amount);if(paid>r.total)fail('El cobro supera el importe pendiente.');const payments=[...r.payments,{id:uid(),date:date(b.date),amount,reference:text(b.reference),createdBy:actor.id}];await db.put(key('invoices',r.id),{...r,paid,payments,status:paid===r.total?'paid':'partial',revision:r.revision+1,updatedAt:now()});await audit(db,actor,'payment','invoices',r.id);return {};
   }
   if(op==='quote-status'){
    managerOnly(actor);const q=await record(db,'quotes',b.id);revision(q,b);if(q.status!=='issued'||!['accepted','rejected'].includes(b.status))fail('Solo se puede responder a un presupuesto emitido.');await db.put(key('quotes',q.id),{...q,status:b.status,revision:q.revision+1,updatedAt:now()});await audit(db,actor,b.status,'quotes',q.id);return {};
   }
   if(op==='document-upload'){
    managerOnly(actor);if(b.workerId)await record(db,'workers',b.workerId);if(b.clientId)await record(db,'clients',b.clientId);if(b.serviceId)await record(db,'services',b.serviceId);
    const content=String(b.content||'');if(!/^[A-Za-z0-9+/]+={0,2}$/.test(content)||content.length%4!==0)fail('Archivo incorrecto.');const size=atob(content).length;if(size>5*1024*1024||size<1)fail('El archivo debe ocupar entre 1 byte y 5 MB.');
    const name=required(b.name,'el nombre de archivo').replace(/[\r\n/\\]/g,'_');if(!/\.(pdf|png|jpg|jpeg)$/i.test(name))fail('Sube un PDF, PNG o JPEG.');const bytes=atob(content.slice(0,Math.min(content.length,80)));
    if((/\.pdf$/i.test(name)&&!bytes.startsWith('%PDF-'))||(/\.png$/i.test(name)&&!bytes.startsWith('\x89PNG'))||(/\.jpe?g$/i.test(name)&&!bytes.startsWith('\xff\xd8\xff')))fail('El contenido no corresponde al tipo de archivo.');
    const id=uid(),chunks=Math.ceil(content.length/60000);for(let i=0;i<chunks;i++)await db.put(`office/file/${id}/${i}`,content.slice(i*60000,(i+1)*60000));const d={id,name,size,chunks,workerId:text(b.workerId),clientId:text(b.clientId),serviceId:text(b.serviceId),type:text(b.type)||'contract',expires:b.expires?date(b.expires):'',notes:text(b.notes,2000),createdAt:now(),createdBy:actor.id,revision:1};await db.put(key('documents',id),d);await audit(db,actor,'upload','documents',id);return {record:d};
   }
   fail('Operación desconocida.',404);
  });return reply({ok:true,...result});
 }catch(e){if(!e.status)console.error('NOVA Office request failed',e.name);return reply({ok:false,error:e.status?e.message:'No se ha podido guardar. Inténtalo de nuevo.'},e.status||500);}}
}
export class OfficeState {
 constructor(ctx,env){this.api=createOfficeApi(ctx.storage,env);}
 fetch(req){return this.api(req);}
}
