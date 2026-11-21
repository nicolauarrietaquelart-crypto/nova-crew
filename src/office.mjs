import {STANDARD_TARIFFS, STANDARD_EXCEPTIONS} from './tariffs.mjs';
import {createCrewBridge} from './crew-bridge.mjs';
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
function validateGeofence(service,input){
 if(service.venueLat==null||service.venueLng==null)return;
 const latitude=Number(input.latitude),longitude=Number(input.longitude);
 if(input.latitude==null||input.longitude==null||!Number.isFinite(latitude)||!Number.isFinite(longitude))fail('Activa la ubicación para fichar en este recinto.',403);
 if(latitude < -90||latitude > 90||longitude < -180||longitude > 180)fail('Coordenadas incorrectas.');
 const rad=Math.PI/180,lat1=latitude*rad,lat2=service.venueLat*rad,dLat=(service.venueLat-latitude)*rad,dLon=(service.venueLng-longitude)*rad;
 const hav=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
 const distance=6371000*2*Math.asin(Math.min(1,Math.sqrt(hav)));
 if(distance>(service.radiusMeters||500))fail('Fuera del radio autorizado de fichaje ('+Math.round(distance)+' m).',403);
}
const categoryKey = v => String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const categoryMinimum = role => ({'HAND B':5,'HAND A':3,'HAND M':4,'HAND C1':0,'CREW HEAD':6,'FORKLIFTER':5})[text(role).toUpperCase().replace(/\s+/g,' ')]||0;
const tariffLookup = async(db,id) => {const base=STANDARD_TARIFFS.find(t=>t.id===id);const override=await db.get(key('tariffs',id));return override?{...base,...override}:base;};
const PAYMENT_TERMS=[30,60,90];
function termDays(v){const n=Number(v??30);if(!PAYMENT_TERMS.includes(n))fail('El plazo de cobro debe ser 30, 60 o 90 días.');return n;}
async function clientTerm(db,clientId,config){const c=clientId?await db.get(key('clients',clientId)):null;return Number(c?.paymentDays)||Number(config.paymentDays)||30;}
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
async function audit(db,actor,action,kind,id,detail){const stamp=now();await db.put(`office/audit/${stamp}/${uid()}`,{id:uid(),time:stamp,actor:actor.id,name:actor.name,action,kind,recordId:id,...(detail?{detail:String(detail).slice(0,600)}:{})});}
const AUDIT_SKIP=new Set(['revision','updatedAt','updatedBy','createdAt','id','lines','payments','net','tax','total','positions']);
function changedFields(old,next){if(!old)return '';return Object.keys({...old,...next}).filter(k=>!AUDIT_SKIP.has(k)&&JSON.stringify(old[k]??'')!==JSON.stringify(next[k]??'')).concat(old.lines&&JSON.stringify(old.lines)!==JSON.stringify(next.lines)?['lines']:[]).join(',');}
const defaults = {name:'',taxId:'',address:'',email:'',phone:'',iban:'',invoicePrefix:'NOVA',vat:21,paymentDays:30,footer:'',staffNotice:'',emergencyPhone:''};
async function settings(db){return {...defaults,...await db.get('office/settings')};}
async function scope(db,actor){if(actor.role==='manager')return null;const services=await rows(db,'services'),a=await rows(db,'assignments'),coordinators=await rows(db,'serviceCoordinators'),blocks=await rows(db,'serviceBlocks'),operators=await rows(db,'serviceBlockOperators');return new Set([...services.filter(s=>s.coordinatorId===actor.id).map(s=>s.id),...a.filter(x=>x.workerId===actor.workerId).map(x=>x.serviceId),...coordinators.filter(c=>c.userId===actor.id&&!c.archived).map(c=>c.serviceId),...blocks.filter(c=>c.coordinatorId===actor.id&&!c.archived).map(c=>c.serviceId),...operators.filter(o=>o.userId===actor.id&&!o.archived).map(o=>o.serviceId)]);}
async function canCoordinate(db,actor,id){if(actor.role==='manager')return;const service=await record(db,'services',id);if(service.coordinatorId===actor.id)return;const allowed=(await rows(db,'serviceCoordinators')).some(c=>c.serviceId===id&&c.userId===actor.id&&!c.archived)||(await rows(db,'serviceBlocks')).some(c=>c.serviceId===id&&c.coordinatorId===actor.id&&!c.archived)||(await rows(db,'serviceBlockOperators')).some(o=>o.serviceId===id&&o.userId===actor.id&&!o.archived);if(!allowed)fail('No coordinas este servicio.',403);}
function datesBetween(from,to){const out=[];let d=from;for(let i=0;i<62&&d&&d<=(to||from);i++){out.push(d);d=new Date(Date.parse(d+'T12:00:00Z')+86400000).toISOString().slice(0,10);}return out;}
const assignmentDates=a=>datesBetween(a.date,a.endDate||a.date);
/* Crew Control belongs only to the worker designated Crew Head of a service, and only for the days of the Crew Head blocks. */
async function crewHeadDays(db,actor){
 const set=new Set();if(actor.role!=='worker'||!actor.workerId)return set;
 const ops=(await rows(db,'serviceBlockOperators')).filter(o=>o.userId===actor.id&&o.kind==='crew_head'&&!o.archived);if(!ops.length)return set;
 const blocks=await rows(db,'serviceBlocks');
 for(const o of ops){const block=blocks.find(x=>x.id===o.blockId&&!x.archived);if(block)for(const d of datesBetween(block.date,block.endDate||block.date))set.add(block.serviceId+'|'+d);}
 return set;
}
const isCrewDay=(set,a)=>assignmentDates(a).some(d=>set.has(a.serviceId+'|'+d));
async function crewDayClosed(db,a){for(const d of assignmentDates(a))if(await db.get(key('crewDayClosures',a.serviceId+'_'+d)))return true;return false;}
async function requireCrewHead(db,actor,a){
 if(actor.role!=='worker'||!actor.workerId)fail('Crew Control es exclusivo del Crew Head asignado.',403);
 if(!isCrewDay(await crewHeadDays(db,actor),a))fail('Solo el Crew Head asignado a este servicio y día puede modificarlo.',403);
 if(await crewDayClosed(db,a))fail('Este día ya está cerrado por el Crew Head. Gestoría puede reabrirlo.',409);
}
async function coordinatesService(db,actor,serviceId){
 if(actor.role!=='worker'||!actor.workerId)return false;
 const s=await db.get(key('services',serviceId));if(!s||s.archived)return false;
 if(s.coordinatorId===actor.id)return true;
 if((await rows(db,'serviceCoordinators')).some(c=>c.serviceId===serviceId&&c.userId===actor.id&&!c.archived))return true;
 if((await rows(db,'serviceBlocks')).some(b=>b.serviceId===serviceId&&b.coordinatorId===actor.id&&!b.archived))return true;
 if((await rows(db,'serviceBlockOperators')).some(o=>o.serviceId===serviceId&&o.userId===actor.id&&!o.archived))return true;
 return [...await crewHeadDays(db,actor)].some(x=>x.startsWith(serviceId+'|'));
}
async function requireCoordinatorEdit(db,actor,a){
 if(actor.role!=='worker'||!actor.workerId)fail('Solo coordinadores trabajadores.',403);
 await canCoordinateAssignment(db,actor,a);
 if(await crewDayClosed(db,a))fail('Este día ya está cerrado. Gestoría puede reabrirlo.',409);
 if((await rows(db,'coordClosures')).some(c=>!c.archived&&c.closedBy===actor.id&&c.assignmentIds.includes(a.id)))fail('Ya cerraste la coordinación de este día. Gestoría puede reabrirla.',409);
}
/* Cambios de coordinación sobre un turno (presente, contactado, no presentado, horarios, pausa, dietas, valoraciones y notas). */
const MADRID_HM=new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',hour12:false});
const MADRID_DAY=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid'});
const madridHM=iso=>iso?MADRID_HM.format(new Date(iso)):'';
const madridDay=iso=>MADRID_DAY.format(new Date(iso));
const addDay=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
function madridISO(day,t){for(const off of [1,2]){const d=new Date(Date.parse(day+'T'+t+':00Z')-off*3600000);if(madridHM(d.toISOString())===t&&madridDay(d.toISOString())===day)return d.toISOString();}return new Date(Date.parse(day+'T'+t+':00Z')-3600000).toISOString();}
function coordApply(a,c,all){
 const next={...a},events=[],hm=v=>{const t=String(v??'');if(t&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))fail('Hora incorrecta.');return t;};
 if(c.status!=null){
  const st=c.status;if(!['pending','contacted','present','absent'].includes(st))fail('Estado incorrecto.');
  if(st==='present'){if(!c.realIn&&!a.checkIn)c={...c,realIn:madridHM(new Date().toISOString())};c={...c,absent:false};}
  else c={...c,realIn:'',realOut:'',absent:st==='absent',...(st==='contacted'?{contacted:true}:st==='pending'?{contacted:false}:{})};
 }
 if(c.start!=null||c.end!=null){
  const start=hm(c.start??a.start),end=hm(c.end??a.end);
  if(!start||!end)fail('Indica inicio y fin.');
  if(start!==a.start||end!==a.end){
   if(a.checkOut)fail('No se modifica el horario previsto de un turno ya finalizado.',409);
   const endDate=end<=start?addDay(a.date,1):a.date,span=(Date.parse(endDate+'T'+end+':00Z')-Date.parse(a.date+'T'+start+':00Z'))/3600000;
   if(span<=0||span>24)fail('Horario incorrecto.');
   for(const o of all)if(o.workerId===a.workerId&&o.id!==a.id&&a.date+'T'+start<(o.endDate||o.date)+'T'+o.end&&endDate+'T'+end>o.date+'T'+o.start)fail('Ya tiene otro turno en ese horario.',409);
   const hours=money(span-Number(a.pause||0));if(hours<=0)fail('La pausa supera la duración del turno.');
   Object.assign(next,{start,end,endDate,hours});events.push('horario '+a.start+'–'+a.end+' → '+start+'–'+end);
  }
 }
 if(c.realIn!=null){
  const t=hm(c.realIn);
  if(t){if(madridHM(a.checkIn)!==t){next.checkIn=madridISO(next.date,t);next.noShow=false;if(next.status==='pending')next.status='confirmed';events.push('entrada '+t);}}
  else if(a.checkIn){next.checkIn='';next.checkOut='';events.push('deshace entrada');}
 }
 if(c.realOut!=null){
  const t=hm(c.realOut);
  if(t){if(!next.checkIn)fail('Registra primero la entrada.',409);const inT=madridHM(next.checkIn),inDay=madridDay(next.checkIn);if(madridHM(a.checkOut)!==t||!a.checkOut||next.checkIn!==a.checkIn){next.checkOut=madridISO(t<=inT?addDay(inDay,1):inDay,t);events.push('salida '+t);}}
  else if(next.checkOut){next.checkOut='';events.push('deshace salida');}
 }
 if(c.absent!=null){
  const absent=c.absent===true;
  if(absent&&!a.noShow){if(next.checkIn)fail('Tiene entrada registrada. Quita la entrada antes de marcar No presentado.',409);Object.assign(next,{noShow:true,workerHours:0,workerUnits:0});events.push('no presentado');}
  if(!absent&&a.noShow){const h=Math.max(Number(a.minimumHours||0),Number(a.actualHours??a.hours??0));Object.assign(next,{noShow:false,workerHours:h,workerUnits:a.rateUnit==='day'?1:h});events.push('deshace no presentado');}
 }
 if(c.actualPause!=null){const t=hm(c.actualPause)||'00:00';if(t!==(a.actualPause||'')){next.actualPause=t;events.push('pausa '+t);}}
 if(next.checkIn&&next.checkOut&&(next.checkIn!==a.checkIn||next.checkOut!==a.checkOut||next.actualPause!==a.actualPause)){
  const p=next.actualPause?Number(next.actualPause.slice(0,2))+Number(next.actualPause.slice(3,5))/60:Number(a.pause||0);
  const actual=money(Math.max(0,(Date.parse(next.checkOut)-Date.parse(next.checkIn))/3600000-p));
  const wh=Math.max(Number(a.minimumHours||0),actual);Object.assign(next,{actualHours:actual,workerHours:wh,workerUnits:a.rateUnit==='day'?1:wh});
 }
 if(c.contacted!=null&&(c.contacted===true)!==(a.contacted===true)){next.contacted=c.contacted===true;events.push(next.contacted?'contactado':'no contactado');}
 if(c.dietCount!=null&&c.dietCount!==''&&number(c.dietCount,0,3)!==Number(a.dietCount||0)){next.dietCount=number(c.dietCount,0,3);events.push('dietas '+next.dietCount);}
 const R=['ratingUniformidad','ratingActitud','ratingPuntualidad'];
 if(R.some(k=>c[k]!=null)){
  for(const k of R)if(c[k]!=null)next[k]=number(c[k],0,5);
  const vals=R.map(k=>Number(next[k]||0)).filter(n=>n>0),avg=vals.length?Math.round(vals.reduce((x,y)=>x+y,0)/vals.length):0;
  if(R.some(k=>Number(next[k]||0)!==Number(a[k]||0))){next.rating=avg;events.push('valoración '+R.map(k=>Number(next[k]||0)).join('/'));}
 } else if(c.rating!=null&&number(c.rating,0,5)!==Number(a.rating||0)){next.rating=number(c.rating,0,5);events.push('valoración '+next.rating);}
 if(c.coordNotes!=null&&text(c.coordNotes,1000)!==(a.coordNotes||'')){next.coordNotes=text(c.coordNotes,1000);events.push('notas');}
 return {next,events};
}
const INCIDENT_TYPES=['general','delay','absence','behaviour','safety','material','category_change','other'];
async function canCoordinateAssignment(db,actor,assignment){
 if(actor.role==='manager')fail('El escaneo operativo QR corresponde a coordinadores trabajadores, no a Gestoría.',403);
 if(actor.role!=='worker'||!actor.workerId)fail('Acceso de trabajador requerido.',403);
 const service=await record(db,'services',assignment.serviceId);
 if(isCrewDay(await crewHeadDays(db,actor),assignment))return;
 const blocks=await rows(db,'serviceBlocks'),operators=await rows(db,'serviceBlockOperators');
 const slot=assignment.orderLineId?await db.get(key('orderLines',assignment.orderLineId)):null;
 const ownBlock=slot?.blockId?blocks.find(b=>b.id===slot.blockId&&!b.archived):null;
 if(slot?.coordinatorId&&slot.coordinatorId!==ownBlock?.coordinatorId){
  if(slot.coordinatorId!==actor.id)fail('No coordinas esta línea de personal.',403);
  return;
 }
 if(ownBlock){
  if(ownBlock.coordinatorId===actor.id||operators.some(o=>o.blockId===ownBlock.id&&o.userId===actor.id&&!o.archived))return;
  if(ownBlock.coordinatorId||operators.some(o=>o.blockId===ownBlock.id&&!o.archived))fail('No coordinas este bloque ni su personal.',403);
 }
 if(blocks.some(b=>b.serviceId===service.id&&!b.archived&&b.date===assignment.date&&b.serviceType===slot?.serviceType&&b.coordinatorId)){
  fail('El fichaje debe validarlo el coordinador del bloque.',403);
 }
 // Block coordinators only reach their own block; only the general coordinator of the service reaches unblocked staff.
 if(service.coordinatorId===actor.id)return;
 if(!(await rows(db,'serviceCoordinators')).some(c=>c.serviceId===service.id&&c.userId===actor.id&&!c.archived))fail('No coordinas a este trabajador.',403);
}
async function canService(db,actor,id){if(actor.role==='manager')return;const s=await scope(db,actor);if(!s.has(id))fail('No tienes acceso a ese servicio.',403);}
function publicAssignment(a,actor){
 if(actor.role==='manager')return a;
 const {costRate,chargeRate,baseCostRate,baseChargeRate,clientHours,billableHours,clientUnits,workerHours,workerUnits,minimumHours,incrementPercent,settlementStatus,settledAt,noShowChargeApproved,...rest}=a;
 // Worker receives only their own gross remuneration and settlement state, never customer rates.
 if(actor.role!=='manager'&&a.workerId===actor.workerId)return {...rest,grossPay:a.settlementStatus==='confirmed'?money((a.workerUnits??a.workerHours??a.hours??0)*(a.costRate??0)):null,payStatus:a.settlementStatus==='confirmed'?'confirmed':'pending'};
 return rest;
}
async function view(db,actor){
 const serviceScope=await scope(db,actor);const allServices=await rows(db,'services');
 const services=allServices.filter(s=>!serviceScope||serviceScope.has(s.id)).map(s=>{if(actor.role==='manager')return s;const {clientId,notes,...safe}=s;return safe;});
 let assignments=(await rows(db,'assignments')).filter(a=>(!serviceScope||serviceScope.has(a.serviceId))&&(actor.role==='manager'||a.workerId===actor.workerId));
 const workerIds=new Set(assignments.map(a=>a.workerId));
 const workers=(await rows(db,'workers')).filter(w=>actor.role==='manager'||w.id===actor.workerId).map(w=>actor.role==='manager'?w:{id:w.id,name:w.name,phone:w.phone,email:w.email,specialty:w.specialty,contractType:w.contractType||'eventual',revision:w.revision});
 const staffServiceIds=new Set(assignments.filter(a=>a.workerId===actor.workerId&&a.status!=='rejected').map(a=>a.serviceId));
 const documents=(await rows(db,'documents')).filter(d=>actor.role==='manager'||(actor.workerId&&(d.workerId===actor.workerId||(d.shareWithStaff&&staffServiceIds.has(d.serviceId)))));
 const availability=(await rows(db,'availability')).filter(a=>actor.role==='manager'||a.workerId===actor.workerId);
  const weeklyAvailability=actor.workerId?await db.get(key('weeklyAvailability',actor.workerId))||null:null;
 const allCoordinators=await rows(db,'serviceCoordinators'),allBlocks=await rows(db,'serviceBlocks'),allOperators=await rows(db,'serviceBlockOperators');const coordinatorIds=new Set([...services.map(s=>s.coordinatorId),...allCoordinators.map(c=>c.userId),...allBlocks.map(c=>c.coordinatorId),...allOperators.map(o=>o.userId)].filter(Boolean));
 const directory=(await rows(db,'users')).filter(u=>u.active&&(coordinatorIds.has(u.id)||u.role==='manager')).map(u=>({id:u.id,name:u.name,role:u.role}));
 const assignedServices=[...new Set([...allServices.filter(x=>x.coordinatorId===actor.id&&!x.archived).map(x=>x.id),...allCoordinators.filter(c=>c.userId===actor.id&&!c.archived).map(c=>c.serviceId),...allBlocks.filter(c=>c.coordinatorId===actor.id&&!c.archived).map(c=>c.serviceId),...allOperators.filter(o=>o.userId===actor.id&&!o.archived).map(o=>o.serviceId)])];
  const allSlots=actor.role==='manager'?[]:await rows(db,'orderLines');
  const ownBlockIds=new Set([...allBlocks.filter(b=>b.coordinatorId===actor.id&&!b.archived).map(b=>b.id),...allOperators.filter(o=>o.userId===actor.id&&!o.archived).map(o=>o.blockId)]);
  const ownAssignedServices=new Set([...allServices.filter(x=>x.coordinatorId===actor.id&&!x.archived).map(x=>x.id),...allCoordinators.filter(c=>c.userId===actor.id&&!c.archived).map(c=>c.serviceId)]);
  const assignedSlots=new Set(allSlots.filter(l=>!l.archived&&(l.coordinatorId&&l.coordinatorId!==allBlocks.find(b=>b.id===l.blockId)?.coordinatorId?l.coordinatorId===actor.id:ownBlockIds.has(l.blockId)||l.coordinatorId===actor.id)).map(l=>l.id));
  const crewDays=await crewHeadDays(db,actor),blockCrewDay=b=>datesBetween(b.date,b.endDate||b.date).some(d=>crewDays.has(b.serviceId+'|'+d));
  const coordinatorBlocks=actor.role==='manager'?[]:allBlocks.filter(b=>!b.archived&&(ownAssignedServices.has(b.serviceId)||ownBlockIds.has(b.id)||blockCrewDay(b))).map(b=>({id:b.id,serviceId:b.serviceId,date:b.date,endDate:b.endDate,start:b.start,end:b.end,serviceType:b.serviceType,team:b.team,placeId:b.placeId,revision:b.revision,lead:blockCrewDay(b),operators:allOperators.filter(o=>o.blockId===b.id&&!o.archived).map(o=>({id:o.id,userId:o.userId,kind:o.kind,revision:o.revision}))}));
  const coordinatorRoster=actor.role==='manager'?[]:(await rows(db,'assignments')).filter(a=>!a.archived&&(ownAssignedServices.has(a.serviceId)||assignedSlots.has(a.orderLineId)||isCrewDay(crewDays,a))).map(a=>{const slot=allSlots.find(l=>l.id===a.orderLineId);return {id:a.id,serviceId:a.serviceId,workerId:a.workerId,role:a.role,categoryId:a.categoryId||'',crew:isCrewDay(crewDays,a),team:a.team,placeId:a.placeId,date:a.date,start:a.start,endDate:a.endDate,end:a.end,blockId:slot?.blockId||'',serviceType:slot?.serviceType||'',status:a.status,contacted:a.contacted===true,vestColor:a.vestColor||'',dietCount:a.dietCount??0,pauseScheduledHours:a.pauseScheduledHours??0,rating:a.rating??0,pauseStart:a.pauseStart||'',pauseEnd:a.pauseEnd||'',checkIn:a.checkIn,checkOut:a.checkOut,noShow:a.noShow===true,actualHours:a.actualHours??null,hours:a.hours,pause:a.pause||0,actualPause:a.actualPause||'',ratingUniformidad:a.ratingUniformidad||0,ratingActitud:a.ratingActitud||0,ratingPuntualidad:a.ratingPuntualidad||0,coordNotes:a.coordNotes||'',revision:a.revision}});
  const coordinatorWorkers=actor.role==='manager'?[]:(await rows(db,'workers')).filter(w=>coordinatorRoster.some(a=>a.workerId===w.id)).map(w=>({id:w.id,name:w.name,phone:w.phone,specialty:w.specialty}));
  const coordinatorCandidates=actor.role==='manager'?[]:(await rows(db,'users')).filter(u=>u.active&&u.role==='worker'&&coordinatorRoster.some(a=>a.workerId===u.workerId)).map(u=>({id:u.id,name:u.name,workerId:u.workerId}));
  const messages=(await rows(db,'messages')).filter(m=>actor.role==='manager'||m.senderId===actor.id||m.recipientId===actor.id).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).slice(-200);
  const profile=actor.workerId?await db.get(key('employeeProfiles',actor.workerId))||{}:{};
  const trainingAcks=(await rows(db,'trainingAcks')).filter(a=>actor.role==='manager'||a.workerId===actor.workerId);
  const hasProfilePhoto=!!(actor.workerId&&await db.get(key('employeePhotos',actor.workerId)));
  const controlledWorkerIds=new Set(coordinatorRoster.map(a=>a.workerId));
  const incidents=(await rows(db,'incidents')).filter(i=>actor.role==='manager'||(assignedServices.includes(i.serviceId)&&(i.createdBy===actor.id||!!i.workerId&&controlledWorkerIds.has(i.workerId)))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const coordClosures=(await rows(db,'coordClosures')).filter(c=>!c.archived),crewClosuresAll=(await rows(db,'crewDayClosures')).filter(c=>!c.archived);
  const closedIds=new Set(coordClosures.flatMap(c=>c.assignmentIds));
  const isClosedA=a=>closedIds.has(a.id)||assignmentDates(a).some(d=>crewClosuresAll.some(c=>c.serviceId===a.serviceId&&c.date===d));
  for(const r of coordinatorRoster){const src=assignments.find(x=>x.id===r.id)||r;r.closed=isClosedA(src);r.closedByMe=coordClosures.some(c=>c.closedBy===actor.id&&c.assignmentIds.includes(r.id));}
  const companySettings=await settings(db);
  const result={ok:true,user:cleanUser(actor),company:{name:companySettings.name,phone:companySettings.phone,address:companySettings.address,email:companySettings.email,staffNotice:companySettings.staffNotice||'',emergencyPhone:companySettings.emergencyPhone||''},users:directory,workers,services,assignments:assignments.map(a=>{const p=publicAssignment(a,actor);p.closed=isClosedA(a);if(actor.role!=='manager'&&a.orderLineId){const slot=allSlots.find(l=>l.id===a.orderLineId);if(slot)p.serviceType=slot.serviceType||'';}return p;}),coordinatorRoster,coordinatorBlocks,coordinatorWorkers,coordinatorCandidates,coordinatorServiceIds:assignedServices,normalCoordinationServiceIds:[...new Set([...allServices.filter(x=>x.coordinatorId===actor.id&&!x.archived).map(x=>x.id),...allCoordinators.filter(c=>c.userId===actor.id&&!c.archived).map(c=>c.serviceId),...allBlocks.filter(c=>c.coordinatorId===actor.id&&!c.archived).map(c=>c.serviceId),...allOperators.filter(o=>o.userId===actor.id&&!o.archived&&o.kind!=='crew_head').map(o=>o.serviceId)])],crewTeams:(await rows(db,'crewTeams')).filter(t=>!t.archived&&actor.role!=='manager'&&coordinatorBlocks.some(b=>b.id===t.blockId)),crewHeadDays:[...crewDays].map(x=>{const [serviceId,date]=x.split('|');return {serviceId,date};}),crewDayClosures:(await rows(db,'crewDayClosures')).filter(c=>actor.role==='manager'||crewDays.has(c.serviceId+'|'+c.date)),categoryOptions:crewDays.size?(await tariffCatalog(db)).filter(t=>t.active!==false).map(t=>({id:t.id,name:t.name,schedule:t.schedule||'Tarifa estándar 2026'})):[],documents,availability,weeklyAvailability,messages,profile,hasProfilePhoto,trainingAcks,incidents,servicePlaces:(await rows(db,'servicePlaces')).filter(p=>!p.archived&&(!serviceScope||serviceScope.has(p.serviceId)))};
 {const offs=(await rows(db,'offers'));result.offers=actor.role==='manager'?offs.filter(o=>o.status==='open'||o.closedAt>new Date(Date.now()-14*86400000).toISOString()):offs.filter(o=>o.status==='open'&&o.targets.includes(actor.workerId)&&(o.info.endDate||o.info.date)>=new Date().toISOString().slice(0,10)).map(o=>({id:o.id,info:o.info,message:o.message,status:o.status,createdAt:o.createdAt,myAnswer:o.responses[actor.workerId]?.answer||''}));}
 result.onCall=(await rows(db,'onCall')).filter(o=>actor.role==='manager'||(o.date>=new Date(Date.now()-86400000).toISOString().slice(0,10)&&o.date<=new Date(Date.now()+8*86400000).toISOString().slice(0,10)));
 if(actor.role==='manager')Object.assign(result,{coordClosures,employeeProfiles:await rows(db,'employeeProfiles'),weeklyAvailabilityRows:await rows(db,'weeklyAvailability'),employeePhotoIds:[...(await db.list({prefix:'office/employeePhotos/'})).values()].map(p=>p.workerId).filter(Boolean),tariffs:await tariffCatalog(db),tariffExceptions:STANDARD_EXCEPTIONS,orderLines:await rows(db,'orderLines'),serviceDays:await rows(db,'serviceDays'),serviceBlocks:await rows(db,'serviceBlocks'),serviceBlockOperators:await rows(db,'serviceBlockOperators'),serviceCoordinators:await rows(db,'serviceCoordinators'),clients:await rows(db,'clients'),invoices:await rows(db,'invoices'),quotes:await rows(db,'quotes'),users:(await rows(db,'users')).map(cleanUser),settings:await settings(db),audit:[...(await db.list({prefix:'office/audit/',reverse:true,limit:200})).values()]});
 return result;
}
function invoiceLines(input){if(!Array.isArray(input)||input.length<1||input.length>100)fail('Añade entre 1 y 100 líneas.');return input.map(l=>{const quantity=number(l.quantity,0.01,1e5),price=number(l.price,0,1e6),vat=number(l.vat,0,100);const net=money(quantity*price);return {description:required(l.description,'el concepto'),quantity,price,vat,net,tax:money(net*vat/100)};});}
function totals(lines){const net=money(lines.reduce((n,l)=>n+l.net,0)),tax=money(lines.reduce((n,l)=>n+l.tax,0));return {net,tax,total:money(net+tax)};}
function personInput(b){return {name:required(b.name,'el nombre'),taxId:text(b.taxId,40),email:text(b.email),phone:text(b.phone,40),address:text(b.address,500),notes:text(b.notes,3000),active:b.active!==false};}
async function saveEntity(db,actor,kind,b){
 managerOnly(actor);if(kind==='expenses')fail('Los gastos de empresa no se gestionan desde el área operativa.',403);if(!['clients','workers','services','assignments','invoices','quotes','tariffs','orderLines'].includes(kind))fail('Tipo de registro incorrecto.');
 const old=b.id?(kind==='tariffs'?await db.get(key('tariffs',text(b.id))):await record(db,kind,text(b.id))):null;revision(old,b);
 if(old?.archived)fail('El registro está archivado.',409);if(kind==='services'&&old?.settlementStatus==='confirmed')fail('El servicio ya está liquidado y permanece bloqueado. Registra una rectificación por separado.',409);
 let data;
 if(kind==='tariffs'){
    const id=required(b.id,'el código de tarifa'),base=STANDARD_TARIFFS.find(t=>t.id===id);
    if(!/^[a-zA-Z0-9_ -]{2,80}$/.test(id))fail('Código de tarifa incorrecto.');
    if(base?.source==='PW-BCN-2026'&&b.unit&&b.unit!==base.unit)fail('No cambies la unidad original; crea una tarifa personalizada.');
    const workerRate=b.workerRate===''||b.workerRate==null?null:number(b.workerRate,0,1e5);
    const clientRate=b.clientRate===''||b.clientRate==null?(workerRate==null?null:money(workerRate*2)):number(b.clientRate,0,1e6);
    data={name:required(b.name,'el nombre de tarifa'),group:text(b.group)||'Personalizado',schedule:text(b.schedule)||base?.schedule||'Tarifa estándar 2026',unit:b.unit==='day'?'day':'hour',minHours:number(b.minHours??0,0,24),workerRate,clientRate,incrementPercent:number(b.incrementPercent??0,0,500),active:b.active!==false,source:base?.source||'custom',notes:text(b.notes,2000)};
    const value={...(base||{}),...old,...data,id,revision:(old?.revision||0)+1,updatedAt:now(),updatedBy:actor.id};
    await db.put(key('tariffs',id),value);await audit(db,actor,'tariff-save','tariffs',id);return value;
   }
   if(kind==='orderLines'){
    const service=await record(db,'services',required(b.serviceId,'el servicio'));if(service.archived||service.status==='cancelled'||service.settlementStatus==='confirmed')fail('Servicio cerrado o liquidado.');
    const tariff=await tariffLookup(db,required(b.categoryId,'la categoría'));if(!tariff||!tariff.active)fail('Categoría no disponible.');
    if(service.tariffSchedule&&(tariff.schedule||'Tarifa estándar 2026')!==service.tariffSchedule)fail('Esta categoría no pertenece a la tarifa elegida para el servicio.',409);
    const startDate=date(b.date||service.date),endDate=date(b.endDate||startDate),start=time(b.start||service.start),end=time(b.end||service.end);
    if(endDate+'T'+end<=startDate+'T'+start)fail('Horario del bloque incorrecto.');
    if(startDate<service.date||endDate>service.endDate)fail('La plaza está fuera del periodo de la comanda. Amplía primero las fechas del servicio.');
    if(old&&old.serviceId!==service.id)fail('No se puede mover una plaza entre servicios.');
    if(b.placeId){const place=await record(db,'servicePlaces',b.placeId);if(place.serviceId!==service.id||place.archived)fail('Ubicación ajena al servicio.');}
    if(b.coordinatorId){const coordinator=await record(db,'users',b.coordinatorId);if(!coordinator.active||coordinator.role!=='worker'||!coordinator.workerId)fail('El coordinador debe ser un trabajador activo, no un gestor de oficina.');}
    const assigned=(await rows(db,'assignments')).some(a=>a.orderLineId===old?.id&&!a.archived);
    if(assigned&&['categoryId','date','endDate','start','end'].some(k=>String(b[k]??old[k])!==String(old[k])))fail('Esta plaza ya está asignada: modifica primero el turno del trabajador.',409);
    data={serviceId:service.id,categoryId:tariff.id,role:text(b.role)||tariff.name,serviceType:text(b.serviceType)||'Montaje',team:text(b.team),placeId:text(b.placeId),coordinatorId:text(b.coordinatorId),date:startDate,endDate,start,end,pause:number(b.pause??0,0,24),notes:text(b.notes,1500),status:b.status==='cancelled'?'cancelled':'open'};
   }
   if(kind==='clients')data={...personInput(b),contact:text(b.contact),paymentDays:termDays(b.paymentDays)};
 if(kind==='workers')data={...personInput(b),specialty:text(b.specialty),costRate:number(b.costRate),startDate:b.startDate?date(b.startDate):'',endDate:b.endDate?date(b.endDate):'',iban:text(b.iban,60),emergency:text(b.emergency),contractType:['eventual','indefinite','fixed_discontinuous'].includes(b.contractType)?b.contractType:'eventual',employmentNotes:text(b.employmentNotes,1500),...(Array.isArray(b.categories)?{categories:[...new Map(b.categories.map(c=>text(c,100)).filter(Boolean).map(c=>[categoryKey(c),c])).values()].slice(0,150)}:{})};
 if(kind==='services'){
  const client=await record(db,'clients',required(b.clientId,'el cliente'));if(!client.active||client.archived)fail('El cliente está inactivo.');
  if(b.coordinatorId){const user=await record(db,'users',b.coordinatorId);if(!user.active||user.role!=='worker'||!user.workerId)fail('El coordinador del servicio debe ser un trabajador, no un gestor de oficina.',403);}
  const startDate=date(b.date),endDate=date(b.endDate||b.date),start=time(b.start),end=time(b.end);
  if(endDate+'T'+end<=startDate+'T'+start)fail('El fin debe ser posterior al inicio. Para un turno nocturno elige el día siguiente.');
  const tariffSchedule=text(b.tariffSchedule)||old?.tariffSchedule||'Tarifa estándar 2026';
   if(!(await tariffCatalog(db)).some(t=>(t.schedule||'Tarifa estándar 2026')===tariffSchedule))fail('Tarifa del servicio no válida.');
   if(old&&old.tariffSchedule&&tariffSchedule!==old.tariffSchedule&&(await rows(db,'orderLines')).some(l=>l.serviceId===old.id&&!l.archived))fail('Para cambiar la tarifa de un servicio con puestos, revisa antes sus categorías.',409);
   const status=text(b.status)||'planned';if(!['planned','confirmed','in_progress','completed','cancelled'].includes(status))fail('Estado incorrecto.');
  const venueLat=b.venueLat===''||b.venueLat==null?null:Number(b.venueLat),venueLng=b.venueLng===''||b.venueLng==null?null:Number(b.venueLng);
   if((venueLat==null)!==(venueLng==null))fail('Introduce latitud y longitud o deja ambas vacías.');
   if(venueLat!=null&&(!Number.isFinite(venueLat)||!Number.isFinite(venueLng)||venueLat < -90||venueLat >90||venueLng < -180||venueLng>180))fail('Coordenadas del recinto incorrectas.');
   data={name:required(b.name,'el nombre'),clientId:client.id,tariffSchedule,date:startDate,endDate,start,end,venue:required(b.venue,'el recinto'),venueLat,venueLng,radiusMeters:number(b.radiusMeters??500,100,5000),status,coordinatorId:text(b.coordinatorId),required:number(b.required,0,10000),notes:text(b.notes,5000),employeeNotes:text(b.employeeNotes,3000),callTime:b.callTime?time(b.callTime):''};
 }
 if(kind==='assignments'){
  const service=await record(db,'services',required(b.serviceId,'el servicio')),worker=await record(db,'workers',required(b.workerId,'el trabajador'));
  if(service.settlementStatus==='confirmed'||service.archived||service.status==='cancelled'||!worker.active||worker.archived)fail('Servicio o trabajador inactivo.');
  const all=await rows(db,'assignments');
  // A position (orderLine) carries its own day and hours; use them when the form leaves them empty.
  const lineDefaults=b.orderLineId?await db.get(key('orderLines',text(b.orderLineId)))||{}:{};
  if(!b.date&&lineDefaults.date){b={...b,date:lineDefaults.date,endDate:b.endDate||lineDefaults.endDate||lineDefaults.date,start:b.start||lineDefaults.start,end:b.end||lineDefaults.end};}
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
   const role=line?.role||text(b.role)||assignedTariff?.name||worker.specialty;
   const tariffCandidate=await tariffLookup(db,line?.categoryId||'')||assignedTariff;
    if(line&&assignedTariff&&line.categoryId!==assignedTariff.id)fail('La categoría de la asignación debe coincidir con su puesto.',409);
   const venueNorm=service.venue.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   const exception=tariffCandidate?.id==='hand-montador'&&STANDARD_EXCEPTIONS.some(e=>e.venueContains&&venueNorm.includes(e.venueContains));
   const minimum=exception?3:(tariffCandidate?.minHours??categoryMinimum(role));
   if(old?.settlementStatus==='confirmed'||service.settlementStatus==='confirmed')fail('Liquidación confirmada: no se pueden cambiar sus importes.',409);
   if((await rows(db,'invoices')).some(i=>i.serviceId===service.id&&i.status!=='draft'&&!i.archived))fail('El servicio tiene una factura emitida. Se necesita una rectificación.',409);
   const actualHours=b.actualHours===''||b.actualHours==null?(old?.actualHours??null):number(b.actualHours,0,744);
   const clientHours=b.clientHours===''||b.clientHours==null?(old?.clientHours??null):number(b.clientHours,0,744);
   const noShow=b.noShow===true||b.noShow==='true',noShowChargeApproved=b.noShowChargeApproved===true||b.noShowChargeApproved==='true';if(noShowChargeApproved&&!noShow)fail('El cargo por ausencia requiere marcar No presentado.');if(noShowChargeApproved&&!text(b.notes))fail('Indica el acuerdo contractual que permite cobrar la cancelación.');
   const tariff=tariffCandidate;
   if(Array.isArray(worker.categories)&&worker.categories.length&&tariff&&!worker.categories.some(c=>categoryKey(c)===categoryKey(tariff.name)||categoryKey(c)===categoryKey(tariff.id)))fail(worker.name+' no tiene abierta la categoría '+tariff.name+' en su ficha.',409);
   const costRate=number(b.costRate===''||b.costRate==null?(tariff?.workerRate??worker.costRate):b.costRate);
   const chargeRate=number(b.chargeRate===''||b.chargeRate==null?(tariff?.clientRate??costRate*2):b.chargeRate);
   const supplement=number(b.incrementPercent??tariff?.incrementPercent??0,0,500);
   const effectiveCostRate=money(costRate*(1+supplement/100)),effectiveChargeRate=money(chargeRate*(1+supplement/100));
   const workerHours=noShow?0:Math.max(minimum,actualHours??hours),billableHours=noShow&&!noShowChargeApproved?0:Math.max(minimum,clientHours??hours);
   const workerUnits=tariff?.unit==='day'?(noShow?0:1):workerHours,clientUnits=tariff?.unit==='day'?(billableHours>0?1:0):billableHours;
   data={serviceId:service.id,workerId:worker.id,role,team:text(b.team),placeId:line?.placeId||text(b.placeId),date:startDate,endDate,start,end,pause,hours,minimumHours:minimum,actualHours,clientHours,workerHours,billableHours,workerUnits,clientUnits,rateUnit:tariff?.unit||'hour',noShow,noShowChargeApproved,categoryId:tariff?.id||text(b.categoryId),orderLineId:line?.id||'',incrementPercent:supplement,baseCostRate:costRate,baseChargeRate:chargeRate,costRate:effectiveCostRate,chargeRate:effectiveChargeRate,settlementStatus:old?.settlementStatus||'pending',settledAt:old?.settledAt||'',status:old?.status||'pending',checkIn:old?.checkIn||'',checkOut:old?.checkOut||'',notes:text(b.notes,1500)};
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
 if(kind==='quotes'&&!old&&!b.preparedBy){data.preparedBy=actor.id;data.preparedByName=actor.name;}
 const id=old?.id||uid(),value={...old,...data,id,revision:(old?.revision||0)+1,createdAt:old?.createdAt||now(),updatedAt:now(),updatedBy:actor.id};
 await db.put(key(kind,id),value);await audit(db,actor,old?'update':'create',kind,id,changedFields(old,value));return value;
}
const crewBridge=createCrewBridge({rows,key,record,fail,uid,now,text,money,crewHeadDays,audit,tariffCatalog,datesBetween});
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
   if(op==='employee-photo'){
     const workerId=text(url.searchParams.get('workerId')||actor.workerId);
     if(actor.role!=='manager'&&workerId!==actor.workerId)fail('No puedes consultar fotos de otros trabajadores.',403);
     const info=await storage.get(key('employeePhotos',workerId));if(!info)fail('Fotografía no encontrada.',404);
     const chunks=[];for(let i=0;i<info.chunks;i++)chunks.push(await storage.get('office/photoData/'+workerId+'/'+i));
     if(chunks.some(x=>typeof x!=='string'))fail('Fotografía incompleta.',500);
     const bytes=Uint8Array.from(atob(chunks.join('')),x=>x.charCodeAt(0));
     return new Response(bytes,{headers:{'content-type':info.mime,'cache-control':'private, no-store','x-content-type-options':'nosniff','content-disposition':'inline'}});
    }
    if(op==='document'){
    const d=await record(storage,'documents',url.searchParams.get('id'));if(actor.role!=='manager'){const shared=d.shareWithStaff&&actor.workerId&&(await rows(storage,'assignments')).some(a=>a.serviceId===d.serviceId&&a.workerId===actor.workerId&&!a.archived&&a.status!=='rejected');if(!actor.workerId||(d.workerId!==actor.workerId&&!shared))fail('No tienes acceso a este documento.',403);}
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
   if(op==='save'&&b.kind==='workers'&&b.record?.createAccess!==false){managerOnly(actor);b.onboardingPassword=random().slice(0,32);b.onboardingPasswordFields=await passwordFields(b.onboardingPassword);}
  const result=await storage.transaction(async db=>{
   const currentActor=await record(db,'users',actor.id);if(!currentActor.active||currentActor.version!==actor.version)fail('La sesión ha cambiado. Inicia sesión de nuevo.',401);
   if(op==='save'){
     const kind=text(b.kind),input=b.record||{},saved=await saveEntity(db,actor,kind,input);
     if(kind==='assignments'&&saved.orderLineId&&saved.status!=='rejected')for(const o of (await rows(db,'offers')).filter(o=>o.orderLineId===saved.orderLineId&&o.status==='open'))await db.put(key('offers',o.id),{...o,status:'filled',filledBy:saved.workerId,closedAt:now(),closedBy:actor.id,revision:o.revision+1});
     if(kind!=='workers'||input.createAccess===false)return {record:saved};
     const existing=(await rows(db,'users')).find(u=>u.workerId===saved.id&&u.active);
     if(existing)return {record:saved,access:{username:existing.username,existing:true}};
     const username=text(input.username,100).toLowerCase()||('emp-'+random().slice(0,12));
     if(!/^[a-z0-9@._+-]{3,100}$/.test(username))fail('Usuario incorrecto.');
     if(await db.get('office/username/'+username))fail('Ese usuario ya existe.',409);
     const u={id:uid(),username,name:saved.name,role:'worker',active:saved.active,workerId:saved.id,version:1,revision:1,createdAt:now(),...b.onboardingPasswordFields};
     await db.put(key('users',u.id),u);await db.put('office/username/'+username,u.id);
     await audit(db,actor,'create-access','users',u.id);
     return {record:saved,access:{username,password:b.onboardingPassword,existing:false}};
    }
    if(op==='availability-weekly'){
     const targetId=actor.role==='manager'?required(b.workerId,'el trabajador'):actor.workerId;
     if(!targetId)fail('No tienes ficha de trabajador.',403);await record(db,'workers',targetId);
     const input=b.days||{};const days={};
     for(const d of ['mon','tue','wed','thu','fri','sat','sun']){
      const raw=input[d]||{},shift=raw.morning!=null||raw.afternoon!=null;
      // Mañana = 06:00–15:00, tarde = 15:00–24:00. Se guardan también como horas para el buscador de turnos.
      const a=shift?{slots:[...(raw.morning?Array.from({length:9},(_,i)=>6+i):[]),...(raw.afternoon?Array.from({length:9},(_,i)=>15+i):[])]}:raw,slots=Array.isArray(a.slots)?[...new Set(a.slots.map(Number))].sort((x,y)=>x-y):null;
      if(slots&&slots.some(h=>!Number.isInteger(h)||h<0||h>23))fail('La hora seleccionada debe ser válida.');
      const available=slots?slots.length>0:a.available===true;
      const start=slots?.length?String(slots[0]).padStart(2,'0')+':00':a.start?time(a.start):'08:00';
      const end=slots?.length?String(slots.at(-1)+1).padStart(2,'0')+':00':a.end?time(a.end):'23:00';
      if(start>=end)fail('Horario semanal incorrecto en '+d);
      days[d]={available,start,end,...(slots?{slots}:{}),...(shift?{morning:raw.morning===true,afternoon:raw.afternoon===true}:{})};
     }
     const value={workerId:targetId,days,updatedAt:now(),updatedBy:actor.id};
     await db.put(key('weeklyAvailability',targetId),value);
     await audit(db,actor,'availability-weekly','workers',targetId);return {record:value};
    }
    if(op==='employee-profile'){
     if(!actor.workerId)fail('No tienes ficha de trabajador.',403);
     const allowed=['nationality','postalCode','city','province','country','shirtSize','drivingLicense','ownVehicle','languages','skills','education','contactNotes','preferredPhone'];
     const input=b.record||{},old=await db.get(key('employeeProfiles',actor.workerId))||{};
     revision(old.revision?old:null,input);
     const update={};for(const field of allowed)if(Object.hasOwn(input,field))update[field]=Array.isArray(input[field])?input[field].slice(0,30).map(x=>text(x,100)):text(input[field],250);
     const value={...old,...update,workerId:actor.workerId,revision:(old.revision||0)+1,updatedAt:now()};
     await db.put(key('employeeProfiles',actor.workerId),value);await audit(db,actor,'employee-profile','workers',actor.workerId);return {record:value};
    }
    if(op==='message-send'){
     const recipientId=text(b.recipientId),content=required(b.content,'el mensaje');
     if(content.length>2000)fail('El mensaje supera 2000 caracteres.');
     if(actor.role!=='manager'){
      const recipient=await record(db,'users',recipientId);if(recipient.role!=='manager'||!recipient.active)fail('El trabajador solo puede escribir a Gestoría.',403);
     }else{const recipient=await record(db,'users',recipientId);if(!recipient.active)fail('Destinatario inactivo.');}
     if(recipientId===actor.id)fail('Selecciona otro destinatario.');
     const id=uid(),value={id,senderId:actor.id,recipientId,content:text(b.content,2000),createdAt:now()};
     await db.put(key('messages',id),value);await audit(db,actor,'send','messages',id);return {record:value};
    }
    if(op==='crew-open')return await crewBridge.open(db,actor,b);
    if(op==='crew-snapshot')return b.mode==='put'?await crewBridge.put(db,actor,text(b.code,10),b.payload):await crewBridge.get(db,actor,text(b.code,10));
    if(op==='message-broadcast'){
     managerOnly(actor);const content=required(b.content,'el mensaje');if(content.length>2000)fail('El mensaje supera 2000 caracteres.');
     const audience=b.audience||{},type=text(audience.type,20),value=text(audience.value,200);
     const users=(await rows(db,'users')).filter(u=>u.active&&u.role==='worker'&&u.workerId);
     const workers=new Map((await rows(db,'workers')).filter(w=>!w.archived&&w.active!==false).map(w=>[w.id,w]));
     let label='';let targets=users.filter(u=>workers.has(u.workerId));
     if(type==='all')label='Todos los trabajadores';
     else if(type==='service'){const sv=await record(db,'services',value);const ids=new Set((await rows(db,'assignments')).filter(a=>a.serviceId===sv.id&&!a.archived&&a.status!=='rejected').map(a=>a.workerId));targets=targets.filter(u=>ids.has(u.workerId));label='Personal de '+sv.name;}
     else if(type==='contract'){if(!['fixed','eventual'].includes(value))fail('Tipo de contrato incorrecto.');targets=targets.filter(u=>{const c=workers.get(u.workerId).contractType||'eventual';return value==='eventual'?c==='eventual':c!=='eventual';});label=value==='eventual'?'Trabajadores eventuales':'Trabajadores fijos';}
     else if(type==='category'){if(!value)fail('Elige una categoría.');const norm=v=>String(v||'').trim().toUpperCase().replace(/\s+/g,' ');targets=targets.filter(u=>norm(workers.get(u.workerId).specialty)===norm(value));label='Categoría '+value;}
     else fail('Elige a quién enviar el mensaje.');
     if(!targets.length)fail('No hay trabajadores con acceso en ese grupo.',409);
     if(targets.length>1500)fail('Demasiados destinatarios en un solo envío.');
     const broadcastId=uid(),createdAt=now();
     for(const u of targets){const id=uid();await db.put(key('messages',id),{id,senderId:actor.id,recipientId:u.id,content,createdAt,broadcastId,audience:label});}
     await audit(db,actor,'broadcast','messages',broadcastId);return {broadcastId,sent:targets.length,audience:label};
    }
    if(op==='incident-report'){
     const service=await record(db,'services',required(b.serviceId,'el servicio'));
     if(actor.role!=='manager')await canCoordinate(db,actor,service.id);
     if(service.archived)fail('Servicio archivado.');
     const workerId=text(b.workerId);if(workerId){
      const assigned=(await rows(db,'assignments')).filter(a=>a.workerId===workerId&&a.serviceId===service.id&&!a.archived);
      if(!assigned.length)fail('Trabajador ajeno al servicio.',403);
      if(actor.role!=='manager'){
        let permitted=false;for(const a of assigned){try{await canCoordinateAssignment(db,actor,a);permitted=true;break}catch{}}
        if(!permitted)fail('No coordinas el turno de este trabajador.',403);
      }
     }
     const type=INCIDENT_TYPES.includes(b.type)?b.type:'general',severity=['low','medium','high'].includes(b.severity)?b.severity:'medium';
     let assignmentId='',requestedCategoryId='',requestedCategory='',currentCategory='';
     if(type==='category_change'){
      if(!workerId)fail('Indica el trabajador para solicitar el cambio de categoría.');
      const target=await record(db,'assignments',required(b.assignmentId,'el turno del trabajador'));
      if(target.workerId!==workerId||target.serviceId!==service.id||target.archived)fail('Turno incorrecto para este trabajador.',403);
      if(actor.role!=='manager')await canCoordinateAssignment(db,actor,target);
      const tariff=(await tariffCatalog(db)).find(t=>t.id===text(b.requestedCategoryId)&&t.active!==false);
      if(!tariff)fail('Categoría solicitada no válida.');
      if(tariff.id===target.categoryId)fail('El trabajador ya tiene esa categoría.',409);
      assignmentId=target.id;requestedCategoryId=tariff.id;requestedCategory=tariff.name;currentCategory=target.role||target.categoryId||'';
     }
     const id=uid(),value={id,serviceId:service.id,workerId,type,severity,measure:text(b.measure,1000),assignmentId,requestedCategoryId,requestedCategory,currentCategory,description:required(b.description,'la incidencia').slice(0,2000),status:'open',createdAt:now(),createdBy:actor.id,revision:1};
     await db.put(key('incidents',id),value);await audit(db,actor,'incident-report','incidents',id);return {record:value};
    }
    if(op==='responsible-set'){
     managerOnly(actor);const kind=b.kind==='quotes'?'quotes':'services',field=kind==='quotes'?'preparedBy':'closedBy';
     const r=await record(db,kind,b.id);revision(r,b);
     const userId=text(b.userId);let name='';
     if(userId){const u=await record(db,'users',userId);if(!u.active||u.role!=='manager')fail('Elige un usuario de Gestoría.');name=u.name;}
     const value={...r,[field]:userId,[field+'Name']:name,revision:r.revision+1,updatedAt:now()};
     await db.put(key(kind,r.id),value);await audit(db,actor,field==='preparedBy'?'set-prepared-by':'set-closed-by',kind,r.id,name||'Sin asignar');return {record:value};
    }
    if(op==='history'){
     managerOnly(actor);const kind=b.kind==='quotes'?'quotes':'services',r=await record(db,kind,b.id),ids=new Set([r.id]);
     if(kind==='services'){for(const k of ['assignments','orderLines','serviceBlocks','serviceDays','invoices','incidents','quotes'])for(const x of await rows(db,k))if(x.serviceId===r.id)ids.add(x.id);}
     const workers=await rows(db,'workers'),assigns=await rows(db,'assignments');
     const out=[];for(const e of (await db.list({prefix:'office/audit/'})).values())if(ids.has(e.recordId)){const as=e.kind==='assignments'?assigns.find(a=>a.id===e.recordId):null;out.push({...e,subject:as?workers.find(w=>w.id===as.workerId)?.name||'':''});}
     return {entries:out.sort((x,y)=>y.time.localeCompare(x.time)).slice(0,400)};
    }
    if(op==='offer-create'){
     managerOnly(actor);const l=await record(db,'orderLines',required(b.orderLineId,'el puesto'));const service=await record(db,'services',l.serviceId);
     if(['completed','cancelled'].includes(service.status))fail('El servicio está cerrado.',409);
     if((await rows(db,'assignments')).some(a=>a.orderLineId===l.id&&!a.archived&&a.status!=='rejected'))fail('Ese puesto ya está cubierto.',409);
     const audience=['all','fixed','eventual','category','workers'].includes(b.audience)?b.audience:'all';
     const users=(await rows(db,'users')).filter(u=>u.active&&u.role==='worker'&&u.workerId),withAccess=new Set(users.map(u=>u.workerId));
     const tariff=(await tariffCatalog(db)).find(t=>t.id===l.categoryId),category=tariff?.name||l.role||'';
     const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
     let targets=(await rows(db,'workers')).filter(w=>w.active!==false&&!w.archived&&withAccess.has(w.id));
     const fixed=w=>['indefinite','fixed_discontinuous'].includes(w.contractType);
     if(audience==='fixed')targets=targets.filter(fixed);
     if(audience==='eventual')targets=targets.filter(w=>!fixed(w));
     if(audience==='category')targets=targets.filter(w=>Array.isArray(w.categories)&&w.categories.length?w.categories.some(c=>norm(c)===norm(category)):norm(w.specialty)===norm(category));
     if(audience==='workers'){const ids=new Set(Array.isArray(b.workerIds)?b.workerIds.map(String):[]);targets=targets.filter(w=>ids.has(w.id));}
     if(!targets.length)fail('No hay trabajadores con acceso en ese grupo.',409);
     const id=uid(),v={id,orderLineId:l.id,serviceId:service.id,audience,targets:targets.map(w=>w.id),message:text(b.message,500),
      info:{serviceName:service.name,venue:l.locationName||service.venue,date:l.date,endDate:l.endDate||l.date,start:l.start,end:l.end,category,serviceType:l.serviceType||'',callTime:service.callTime||''},
      responses:{},status:'open',createdBy:actor.id,createdByName:actor.name,createdAt:now(),revision:1};
     await db.put(key('offers',id),v);await audit(db,actor,'offer-create','orderLines',l.id,category+' · '+targets.length+' trabajadores');return {record:v};
    }
    if(op==='offer-respond'){
     if(actor.role!=='worker'||!actor.workerId)fail('Solo trabajadores.',403);
     const o=await record(db,'offers',required(b.id,'la oferta'));if(!o.targets.includes(actor.workerId))fail('Esta oferta no es para ti.',403);
     if(o.status!=='open')fail(o.status==='filled'?'Este puesto ya está cubierto. ¡Gracias!':'Esta oferta ya no está disponible.',409);
     const answer=b.answer==='yes'?'yes':'no';
     const v={...o,responses:{...o.responses,[actor.workerId]:{answer,at:now(),name:actor.name}},revision:o.revision+1,updatedAt:now()};
     await db.put(key('offers',o.id),v);await audit(db,actor,'offer-'+answer,'orderLines',o.orderLineId);return {record:{id:o.id,status:v.status,myAnswer:answer}};
    }
    if(op==='offer-close'){
     managerOnly(actor);const o=await record(db,'offers',required(b.id,'la oferta'));
     const status=b.status==='filled'?'filled':'cancelled';
     const v={...o,status,filledBy:text(b.workerId),closedAt:now(),closedBy:actor.id,revision:o.revision+1};
     await db.put(key('offers',o.id),v);await audit(db,actor,'offer-'+status,'orderLines',o.orderLineId);return {record:v};
    }
    if(op==='activity-by-service'){
     managerOnly(actor);const limit=Math.min(60,Math.max(5,Number(b.limit)||20));
     const users=await rows(db,'users'),managers=new Set(users.filter(u=>u.role==='manager').map(u=>u.id));
     const services=(await rows(db,'services')).filter(x=>!x.archived).sort((x,y)=>String(y.createdAt||y.date).localeCompare(String(x.createdAt||x.date))).slice(0,limit);
     const related=new Map();const link=(id,sid)=>{if(id)related.set(id,sid);};
     for(const sv of services)link(sv.id,sv.id);
     const sids=new Set(services.map(x=>x.id));
     for(const k of ['quotes','assignments','orderLines','serviceBlocks','serviceDays','invoices','incidents','offers'])for(const x of await rows(db,k))if(sids.has(x.serviceId))link(x.id,x.serviceId);
     const quotes=await rows(db,'quotes'),clients=await rows(db,'clients'),workers=await rows(db,'workers'),assigns=await rows(db,'assignments');
     const groups=new Map(services.map(sv=>[sv.id,[]]));
     for(const e of (await db.list({prefix:'office/audit/'})).values()){if(!managers.has(e.actor))continue;const sid=related.get(e.recordId);if(!sid)continue;const as=e.kind==='assignments'?assigns.find(a=>a.id===e.recordId):null;groups.get(sid).push({time:e.time,name:e.name,action:e.action,kind:e.kind,detail:e.detail||'',subject:as?workers.find(w=>w.id===as.workerId)?.name||'':''});}
     const createdBy=list=>list.filter(x=>x.action==='create').sort((a,c)=>a.time.localeCompare(c.time))[0]?.name||'';
     return {groups:services.map(sv=>{const es=groups.get(sv.id).sort((x,y)=>y.time.localeCompare(x.time)),q=quotes.find(x=>x.serviceId===sv.id);
      return {service:{id:sv.id,name:sv.name,date:sv.date,endDate:sv.endDate,status:sv.status,client:clients.find(c=>c.id===sv.clientId)?.name||''},
       quote:q?{id:q.id,number:q.number||'',preparedBy:q.preparedByName||users.find(u=>u.id===q.preparedBy)?.name||''}:null,
       serviceCreatedBy:createdBy(es.filter(x=>x.kind==='services')),closedBy:sv.closedByName||'',count:es.length,entries:es.slice(0,40)};})};
    }
    if(op==='oncall-set'){
     managerOnly(actor);const from=date(b.from),to=date(b.to||b.from);if(to<from)fail('La fecha final es anterior a la inicial.');
     const userId=text(b.userId);let u=null;if(userId){u=await record(db,'users',userId);if(u.role!=='manager'||!u.active)fail('La guardia debe hacerla un usuario de Gestoría.');}
     const days=datesBetween(from,to);if(days.length>370)fail('Máximo un año de guardias a la vez.');
     const wd=Array.isArray(b.weekdays)&&b.weekdays.length?new Set(b.weekdays.map(Number)):null,out=[];
     for(const d of days){if(wd&&!wd.has(new Date(d+'T12:00:00Z').getUTCDay()))continue;const k=key('onCall',d),old=await db.get(k);
      if(!u){if(old)await db.delete(k);continue;}
      const v={id:d,date:d,userId:u.id,name:u.name,phone:text(b.phone,40),notes:text(b.notes,300),updatedBy:actor.id,updatedAt:now(),revision:(old?.revision||0)+1};await db.put(k,v);out.push(v);}
     await audit(db,actor,u?'oncall-set':'oncall-clear','onCall',from,(u?u.name:'Sin guardia')+' · '+from+(to!==from?' → '+to:''));return {records:out};
    }
    if(op==='geocode'){
     if(actor.role!=='manager')fail('Solo Gestoría.',403);
     const q=required(b.q,'la búsqueda').slice(0,200);if(q.length<3)return {results:[]};
     const gkey=env?.GOOGLE_MAPS_API_KEY;
     try{
      if(gkey){
       const r=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':gkey,'X-Goog-FieldMask':'places.displayName,places.formattedAddress,places.location'},body:JSON.stringify({textQuery:q,languageCode:'es',regionCode:'ES',pageSize:6})});
       const j=await r.json();if(!r.ok)throw new Error('google '+r.status+' '+(j.error?.message||''));
       return {provider:'google',results:(j.places||[]).slice(0,6).map(x=>({name:x.displayName?.text||'',address:x.formattedAddress||'',lat:x.location?.latitude,lng:x.location?.longitude}))};
      }
      const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=es&countrycodes=es,ad,pt,fr&q='+encodeURIComponent(q),{headers:{'User-Agent':'NOVA-Crew/1.0 (gestion de personal de eventos)','Accept':'application/json'}});
      if(!r.ok)throw new Error('geo '+r.status);const j=await r.json();
      return {provider:'osm',results:(Array.isArray(j)?j:[]).map(x=>{const a=x.address||{};const name=x.name||a.amenity||a.building||a.road||x.display_name.split(',')[0];const street=[a.road,a.house_number].filter(Boolean).join(' ');const city=a.city||a.town||a.village||a.municipality||'';return {name,address:[street,a.postcode,city].filter(Boolean).join(', ')||x.display_name,lat:Number(x.lat),lng:Number(x.lon)};})};
     }catch(e){fail('El buscador de direcciones no responde ahora. Escribe la dirección a mano.',503);}
    }
    if(op==='tariff-category-create'){
     managerOnly(actor);const catalog=await tariffCatalog(db),name=required(b.name,'el nombre de la categoría').slice(0,100);
     const schedules=[...new Set(catalog.map(t=>t.schedule||'Tarifa estándar 2026'))];if(!schedules.length)schedules.push('Tarifa estándar 2026');
     const workerRate=b.workerRate===''||b.workerRate==null?null:number(b.workerRate,0,1e5),clientRate=b.clientRate===''||b.clientRate==null?(workerRate==null?null:money(workerRate*2)):number(b.clientRate,0,1e6);
     const out=[];for(const sc of schedules){if(catalog.some(t=>(t.schedule||'Tarifa estándar 2026')===sc&&t.name.toLowerCase()===name.toLowerCase()))continue;
      const id='cat-'+uid(),v={id,name,group:text(b.group)||'Personalizado',schedule:sc,unit:b.unit==='day'?'day':'hour',minHours:number(b.minHours??0,0,24),workerRate,clientRate,incrementPercent:0,active:true,source:'custom',notes:'',revision:1,createdAt:now(),updatedAt:now()};
      await db.put(key('tariffs',id),v);out.push(v);}
     if(!out.length)fail('Esa categoría ya existe en todas las tarifas.',409);
     await audit(db,actor,'tariff-category-create','tariffs',out[0].id,name+' · '+out.length+' tarifas');return {records:out};
    }
    if(op==='tariff-category-sync'){
     managerOnly(actor);const catalog=await tariffCatalog(db),from=required(b.name,'la categoría').toLowerCase(),rename=text(b.newName).slice(0,100);
     const matches=catalog.filter(t=>t.name.toLowerCase()===from);if(!matches.length)fail('Categoría no encontrada.',404);
     for(const t of matches){const v={...t,...(rename?{name:rename}:{}),...(b.group!=null?{group:text(b.group)||'Personalizado'}:{}),...(b.unit?{unit:b.unit==='day'?'day':'hour'}:{}),...(b.minHours!=null&&b.minHours!==''?{minHours:number(b.minHours,0,24)}:{}),...(b.active!=null?{active:b.active===true}:{}),revision:(t.revision||0)+1,updatedAt:now()};await db.put(key('tariffs',t.id),v);}
     await audit(db,actor,'tariff-category-sync','tariffs',matches[0].id,b.name+(rename?' → '+rename:''));return {count:matches.length};
    }
    if(op==='coord-day-close'){
     if(actor.role!=='worker'||!actor.workerId)fail('Solo coordinadores.',403);
     const service=await record(db,'services',required(b.serviceId,'el servicio')),day=date(b.date),id=service.id+'_'+day+'_'+actor.id;
     const old=await db.get(key('coordClosures',id));if(old&&!old.archived)fail('Ya cerraste este día.',409);
     const mine=[];for(const a of (await rows(db,'assignments')).filter(a=>a.serviceId===service.id&&!a.archived&&a.status!=='rejected'&&assignmentDates(a).includes(day))){try{await canCoordinateAssignment(db,actor,a);mine.push(a);}catch{}}
     if(!mine.length)fail('No coordinas a nadie en este servicio ese día.',403);
     const open=mine.filter(a=>a.checkIn&&!a.checkOut&&!a.noShow);
     if(open.length)fail('Hay '+open.length+' persona(s) sin hora de fin. Regístrala antes de cerrar.',409);
     const value={id,serviceId:service.id,date:day,assignmentIds:mine.map(a=>a.id),closedBy:actor.id,closedByName:actor.name,closedAt:now(),summary:{assigned:mine.length,attended:mine.filter(a=>a.checkIn).length,absent:mine.filter(a=>!a.checkIn).length},revision:(old?.revision||0)+1};
     await db.put(key('coordClosures',id),value);await audit(db,actor,'coord-day-close','services',service.id,day+' · '+mine.length+' personas');return {record:value};
    }
    if(op==='coord-day-reopen'){
     managerOnly(actor);const c=await record(db,'coordClosures',required(b.id,'el cierre'));
     await db.put(key('coordClosures',c.id),{...c,archived:true,reopenedBy:actor.id,reopenedAt:now(),revision:c.revision+1});await audit(db,actor,'coord-day-reopen','services',c.serviceId,c.date+' · '+c.closedByName);return {};
    }
    if(op==='crew-day-close'){
     if(actor.role!=='worker'||!actor.workerId)fail('Solo el Crew Head cierra el día.',403);
     const service=await record(db,'services',required(b.serviceId,'el servicio')),day=date(b.date);
     if(!(await crewHeadDays(db,actor)).has(service.id+'|'+day))fail('Solo el Crew Head asignado a este servicio y día puede cerrarlo.',403);
     const closureKey=key('crewDayClosures',service.id+'_'+day);
     if(await db.get(closureKey))fail('Este día ya está cerrado.',409);
     const staff=(await rows(db,'assignments')).filter(a=>a.serviceId===service.id&&!a.archived&&a.status!=='rejected'&&assignmentDates(a).includes(day));
     const open=staff.filter(a=>a.checkIn&&!a.checkOut&&!a.noShow);
     if(open.length)fail('Hay '+open.length+' fichaje(s) sin salida. Regístralos antes de cerrar el día.',409);
     const value={id:service.id+'_'+day,serviceId:service.id,date:day,closedBy:actor.id,closedByName:actor.name,closedAt:now(),notes:text(b.notes,2000),summary:{assigned:staff.length,attended:staff.filter(a=>a.checkIn).length,absent:staff.filter(a=>!a.checkIn).length},revision:1};
     await db.put(closureKey,value);await audit(db,actor,'crew-day-close','services',service.id);return {record:value};
    }
    if(op==='crew-day-reopen'){
     managerOnly(actor);const service=await record(db,'services',required(b.serviceId,'el servicio')),day=date(b.date);
     const closureKey=key('crewDayClosures',service.id+'_'+day);if(!await db.get(closureKey))fail('El día no está cerrado.',409);
     await db.delete(closureKey);await audit(db,actor,'crew-day-reopen','services',service.id);return {};
    }
    if(op==='incident-resolve'){
     managerOnly(actor);const incident=await record(db,'incidents',b.id);revision(incident,b);
     if(incident.status==='resolved')return {record:incident};
     const value={...incident,status:'resolved',resolvedAt:now(),resolvedBy:actor.id,revision:incident.revision+1};
     await db.put(key('incidents',value.id),value);await audit(db,actor,'incident-resolve','incidents',value.id);return {record:value};
    }
    if(op==='employee-photo-upload'){
     if(actor.role!=='manager'&&!actor.workerId)fail('No tienes ficha de trabajador.',403);
     if(actor.role==='manager'&&b.workerId)await record(db,'workers',text(b.workerId));
     const mime=b.mime==='image/png'?'image/png':b.mime==='image/jpeg'?'image/jpeg':null;
     if(!mime)fail('La foto debe ser JPEG o PNG.');
     const content=String(b.content||'');
     if(!/^[A-Za-z0-9+/]+={0,2}$/.test(content)||content.length%4!==0||content.length>1400000)fail('La foto debe ocupar menos de 1 MB.');
     const head=atob(content.slice(0,64));
     if((mime==='image/jpeg'&&!head.startsWith('\xff\xd8\xff'))||(mime==='image/png'&&!head.startsWith('\x89PNG')))fail('Contenido de imagen no válido.');
     const workerId=actor.role==='manager'&&b.workerId?text(b.workerId):actor.workerId;if(!workerId)fail('Indica el trabajador.');const old=await db.get(key('employeePhotos',workerId));
     if(old)for(let i=0;i<old.chunks;i++)await db.delete('office/photoData/'+workerId+'/'+i);
     const chunks=Math.ceil(content.length/60000);for(let i=0;i<chunks;i++)await db.put('office/photoData/'+workerId+'/'+i,content.slice(i*60000,(i+1)*60000));
     await db.put(key('employeePhotos',workerId),{workerId,mime,chunks,updatedAt:now()});
     await audit(db,actor,'employee-photo','workers',workerId);return {ok:true};
    }
    if(op==='training-ack'){
     if(!actor.workerId)fail('No tienes ficha de trabajador.',403);
     const doc=await record(db,'documents',b.documentId);
     if(doc.workerId!==actor.workerId||doc.type!=='training')fail('Formación no asignada.',403);
     const id=actor.workerId+'_'+doc.id,old=await db.get(key('trainingAcks',id));
     if(old)return {record:old};
     const value={id,workerId:actor.workerId,documentId:doc.id,acknowledgedAt:now()};
     await db.put(key('trainingAcks',id),value);await audit(db,actor,'training-ack','documents',doc.id);return {record:value};
    }
    
    
    
    
    if(op==='service-block-lead-update'){
      fail('El tipo de servicio y el equipo del bloque los modifica Gestoría. El Crew Head solo ajusta horarios o abre una incidencia.',403);
      const block=await record(db,'serviceBlocks',b.id);revision(block,b);
      const permitted=(await rows(db,'serviceBlockOperators')).some(o=>o.blockId===block.id&&o.userId===actor.id&&o.kind==='crew_head'&&!o.archived);
      if(!permitted)fail('No eres Crew Head de este bloque.',403);
      const service=await record(db,'services',block.serviceId);
      if(block.archived||service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Turno cerrado.',409);
      const serviceType=required(b.serviceType,'el tipo de servicio'),team=text(b.team,100);
      const value={...block,serviceType,team,revision:block.revision+1,updatedAt:now()};
      await db.put(key('serviceBlocks',block.id),value);
      const slots=(await rows(db,'orderLines')).filter(l=>l.blockId===block.id&&!l.archived);
      for(const slot of slots)await db.put(key('orderLines',slot.id),{...slot,serviceType,team,revision:slot.revision+1});
      await audit(db,actor,'crew-head-block-update','serviceBlocks',block.id);
      return {record:value};
    }
    if(op==='service-block-operator-save'){
      const input=b.record||{},block=await record(db,'serviceBlocks',required(input.blockId,'el bloque'));
      if(block.archived)fail('Bloque archivado.',409);
      const service=await record(db,'services',block.serviceId);
      if(service.archived||service.status==='completed'||service.status==='cancelled'||service.settlementStatus==='confirmed')fail('Servicio cerrado.',409);
      const operators=await rows(db,'serviceBlockOperators');
      const leadAllowed=actor.role==='worker'&&operators.some(o=>o.blockId===block.id&&o.userId===actor.id&&o.kind==='crew_head'&&!o.archived);
      if(actor.role!=='manager'&&!leadAllowed)fail('Solo el gestor o el Crew Head autorizado para este bloque puede añadir coordinadores.',403);
      const kind=actor.role==='manager'&&input.kind==='crew_head'?'crew_head':'coordinator';
      const worker=await record(db,'users',required(input.userId,'el trabajador'));
      if(!worker.active||worker.role!=='worker'||!worker.workerId)fail('El coordinador debe ser un trabajador activo.',403);
      if(leadAllowed&&actor.role!=='manager'){
        const slots=(await rows(db,'orderLines')).filter(l=>l.blockId===block.id&&!l.archived);
        const assigned=await rows(db,'assignments');
        if(!assigned.some(a=>a.workerId===worker.workerId&&!a.archived&&slots.some(l=>l.id===a.orderLineId)))fail('El nuevo coordinador debe formar parte del personal asignado a tu bloque.',403);
      }
      const existing=operators.find(o=>o.blockId===block.id&&o.userId===worker.id&&!o.archived);
      if(existing){if(existing.kind===kind)return {record:existing};if(actor.role!=='manager')fail('El Crew Head no puede cambiar niveles de permisos.',403);const v={...existing,kind,revision:existing.revision+1};await db.put(key('serviceBlockOperators',existing.id),v);await audit(db,actor,'block-operator-update','serviceBlockOperators',v.id);return {record:v};}
      const value={id:uid(),blockId:block.id,serviceId:block.serviceId,userId:worker.id,kind,revision:1,createdAt:now()};
      await db.put(key('serviceBlockOperators',value.id),value);await audit(db,actor,'block-operator-add','serviceBlockOperators',value.id);return {record:value};
    }
    if(op==='service-block-operator-remove'){
      const old=await record(db,'serviceBlockOperators',b.id);revision(old,b);
      const block=await record(db,'serviceBlocks',old.blockId),operators=await rows(db,'serviceBlockOperators');
      const leadAllowed=actor.role==='worker'&&operators.some(o=>o.blockId===block.id&&o.userId===actor.id&&o.kind==='crew_head'&&!o.archived);
      if(actor.role!=='manager'&&!(leadAllowed&&old.kind==='coordinator'))fail('No tienes permiso para retirar este coordinador.',403);
      const value={...old,archived:true,revision:old.revision+1};
      await db.put(key('serviceBlockOperators',old.id),value);await audit(db,actor,'block-operator-remove','serviceBlockOperators',old.id);return {record:value};
    }
    if(op==='service-coordinator-save'){
      managerOnly(actor);const input=b.record||{},service=await record(db,'services',required(input.serviceId,'el servicio'));
      if(service.archived||service.settlementStatus==='confirmed')fail('Servicio no editable.',409);
      const user=await record(db,'users',required(input.userId,'el coordinador'));if(!user.active||user.role!=='worker'||!user.workerId)fail('Solo un trabajador puede coordinar servicios.',409);
      const prev=(await rows(db,'serviceCoordinators')).find(x=>x.serviceId===service.id&&x.userId===user.id&&!x.archived);
      if(prev)return {record:prev};
      const value={id:uid(),serviceId:service.id,userId:user.id,createdAt:now(),revision:1};
      await db.put(key('serviceCoordinators',value.id),value);await audit(db,actor,'coordinator-add','serviceCoordinators',value.id);return {record:value};
    }
    if(op==='service-coordinator-delete'){
      managerOnly(actor);const value=await record(db,'serviceCoordinators',b.id);revision(value,b);
      const service=await record(db,'services',value.serviceId);if(service.settlementStatus==='confirmed')fail('Servicio liquidado.',409);
      await db.put(key('serviceCoordinators',value.id),{...value,archived:true,revision:value.revision+1});
      await audit(db,actor,'coordinator-remove','serviceCoordinators',value.id);return {};
    }
    if(op==='service-block-save'){
      managerOnly(actor);const input=b.record||{},service=await record(db,'services',required(input.serviceId,'el servicio'));
      if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio no editable.',409);
      const old=input.id?await record(db,'serviceBlocks',input.id):null;revision(old,input);
      if(old&&old.serviceId!==service.id)fail('No puedes mover un bloque a otro servicio.');
      const d=date(input.date),last=date(input.endDate||input.date),start=time(input.start),end=time(input.end);
      if(last+'T'+end<=d+'T'+start)fail('El final del bloque debe ser posterior al inicio.');
      if(Date.parse(last+'T'+end+'Z')-Date.parse(d+'T'+start+'Z')>48*3600000)fail('Bloque de más de 48 h. Divide en jornadas.');
      const placeId=text(input.placeId),coordinatorId=text(input.coordinatorId);
      if(placeId){const place=await record(db,'servicePlaces',placeId);if(place.serviceId!==service.id||place.archived)fail('Ubicación ajena al servicio.');}
      if(coordinatorId){const u=await record(db,'users',coordinatorId);if(!u.active||u.role!=='worker'||!u.workerId)fail('El coordinador debe tener una ficha de trabajador.',409);}
      const serviceType=required(input.serviceType,'el tipo de servicio'),team=text(input.team);
      const slots=old?(await rows(db,'orderLines')).filter(l=>l.blockId===old.id&&!l.archived&&l.status!=='cancelled'):[];
      const changed=old&&['date','endDate','start','end','placeId','serviceType','team'].some(k=>
        String(({date:d,endDate:last,start,end,placeId,serviceType,team,coordinatorId})[k])!==String(old[k]));
      if(changed){
        const assigned=await rows(db,'assignments');
        if(slots.some(l=>assigned.some(a=>a.orderLineId===l.id&&!a.archived)))
          fail('Este bloque ya tiene personal asignado. Cambia los turnos individuales antes de mover sus fechas o ubicación.',409);
      }
      const value={...old,id:old?.id||uid(),serviceId:service.id,date:d,endDate:last,start,end,serviceType,team,placeId,coordinatorId,notes:text(input.notes,1000),revision:(old?.revision||0)+1,createdAt:old?.createdAt||now(),updatedAt:now()};
      await db.put(key('serviceBlocks',value.id),value);
      for(const slot of slots){
        const updated={...slot,date:d,endDate:last,start,end,serviceType,team,placeId,coordinatorId,revision:slot.revision+1};
        await db.put(key('orderLines',slot.id),updated);
      }
      const dates=[d,last],existingDays=await rows(db,'serviceDays');
      for(const x of dates)if(!existingDays.some(v=>v.serviceId===service.id&&v.date===x&&!v.archived)){
        const dayValue={id:uid(),serviceId:service.id,date:x,name:'Jornada',revision:1};
        await db.put(key('serviceDays',dayValue.id),dayValue);
      }
      await db.put(key('services',service.id),{...service,date:d<service.date?d:service.date,endDate:last>service.endDate?last:service.endDate,revision:service.revision+1,updatedAt:now()});
      if(!old){
        const categories=Array.isArray(b.categories)?b.categories:[];
        if(categories.length<1||categories.length>50)fail('Añade entre 1 y 50 categorías al bloque.');
        const count=categories.reduce((n,c)=>n+Number(c.quantity||0),0);
        if(count>200||count<1)fail('Máximo 200 puestos por bloque.');
        const created=[];
        for(const item of categories){
          const amount=number(item.quantity,1,200);if(!Number.isInteger(amount))fail('Número de puestos incorrecto.');
          for(let i=0;i<amount;i++){
            const slot=await saveEntity(db,actor,'orderLines',{serviceId:service.id,categoryId:item.categoryId,
              serviceType,team,placeId,coordinatorId,date:d,endDate:last,start,end,pause:input.pause??0,notes:input.notes||''});
            const linked={...slot,blockId:value.id};await db.put(key('orderLines',slot.id),linked);created.push(linked);
          }
        }
        await audit(db,actor,'block-create','serviceBlocks',value.id);return {record:value,positions:created};
      }
      await audit(db,actor,'block-update','serviceBlocks',value.id);return {record:value};
    }
    if(op==='line-delete'){
      managerOnly(actor);const l=await record(db,'orderLines',required(b.id,'el puesto')),service=await record(db,'services',l.serviceId);
      if(['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('El servicio está cerrado.',409);
      const as=(await rows(db,'assignments')).filter(a=>a.orderLineId===l.id&&!a.archived);
      if(as.some(a=>a.checkIn))fail('Este puesto tiene fichajes. No se puede eliminar.',409);
      const stamp=now();
      for(const a of as){await db.put(key('assignments',a.id),{...a,archived:true,revision:a.revision+1,updatedAt:stamp});await audit(db,actor,'archive','assignments',a.id,'puesto eliminado');}
      await db.put(key('orderLines',l.id),{...l,archived:true,status:'cancelled',revision:l.revision+1,updatedAt:stamp});
      for(const o of (await rows(db,'offers')).filter(o=>o.orderLineId===l.id&&o.status==='open'))await db.put(key('offers',o.id),{...o,status:'cancelled',closedAt:stamp,revision:o.revision+1});
      await audit(db,actor,'line-delete','orderLines',l.id,(l.role||'')+' '+l.date+' '+l.start+'–'+l.end);return {};
    }
    if(op==='service-block-add-positions'){
      managerOnly(actor);const block=await record(db,'serviceBlocks',b.blockId),service=await record(db,'services',block.serviceId);
      if(block.archived||service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Bloque cerrado.',409);
      const categories=Array.isArray(b.categories)?b.categories:[];
      if(categories.length<1||categories.length>50)fail('Añade una categoría.');
      const positions=[];let total=0;
      for(const cat of categories){
        const quantity=number(cat.quantity,1,200);if(!Number.isInteger(quantity))fail('Cantidad incorrecta.');
        total+=quantity;if(total>200)fail('Máximo 200 puestos de una vez.');
        for(let i=0;i<quantity;i++){
          const raw=await saveEntity(db,actor,'orderLines',{serviceId:service.id,categoryId:cat.categoryId,
            serviceType:block.serviceType,team:block.team,placeId:block.placeId,coordinatorId:block.coordinatorId,
            date:block.date,endDate:block.endDate,start:block.start,end:block.end,pause:cat.pause??0});
          const value={...raw,blockId:block.id};await db.put(key('orderLines',value.id),value);positions.push(value);
        }
      }
      await audit(db,actor,'block-add-positions','serviceBlocks',block.id);return {positions};
    }
    if(op==='service-block-delete'){
      managerOnly(actor);const block=await record(db,'serviceBlocks',b.id);revision(block,b);
      const slots=(await rows(db,'orderLines')).filter(l=>l.blockId===block.id&&!l.archived&&l.status!=='cancelled');
      const assignments=await rows(db,'assignments');
      if(slots.some(l=>assignments.some(a=>a.orderLineId===l.id&&!a.archived)))fail('Este bloque tiene trabajadores asignados.',409);
      for(const l of slots)await db.put(key('orderLines',l.id),{...l,archived:true,revision:l.revision+1});
      await db.put(key('serviceBlocks',block.id),{...block,archived:true,revision:block.revision+1});
      await audit(db,actor,'block-delete','serviceBlocks',block.id);return {};
    }
    if(op==='service-place-save'){
      managerOnly(actor);
      const input=b.record||{},service=await record(db,'services',required(input.serviceId,'el servicio'));
      if(service.archived||service.status==='cancelled'||service.settlementStatus==='confirmed')fail('Servicio no editable.',409);
      const old=input.id?await record(db,'servicePlaces',input.id):null;revision(old,input);
      if(old&&old.serviceId!==service.id)fail('No se puede cambiar una ubicación de servicio.');
      const lat=input.lat===''||input.lat==null?null:number(input.lat,-90,90);
      const lng=input.lng===''||input.lng==null?null:number(input.lng,-180,180);
      if((lat==null)!==(lng==null))fail('Introduce latitud y longitud juntas.');
      const mapsUrl=text(input.mapsUrl,700);
      if(mapsUrl){
        let url;try{url=new URL(mapsUrl)}catch{fail('Enlace de Maps no válido.');}
        if(url.protocol!=='https:'||!['www.google.com','google.com','maps.google.com','maps.app.goo.gl','www.google.es','google.es','www.google.co.uk','google.co.uk','www.google.fr','google.fr'].includes(url.hostname))fail('Introduce un enlace HTTPS de Google Maps.');
      }
      const value={...old,id:old?.id||uid(),serviceId:service.id,
        name:required(input.name,'el nombre de la ubicación'),address:text(input.address,500),
        mapsUrl,lat,lng,radiusMeters:number(input.radiusMeters??500,100,5000),
        revision:(old?.revision||0)+1,createdAt:old?.createdAt||now(),updatedAt:now()};
      await db.put(key('servicePlaces',value.id),value);await audit(db,actor,old?'place-update':'place-create','servicePlaces',value.id);
      return {record:value};
    }
    if(op==='service-place-delete'){
      managerOnly(actor);const place=await record(db,'servicePlaces',b.id);revision(place,b);
      const service=await record(db,'services',place.serviceId);
      if(service.settlementStatus==='confirmed')fail('Servicio liquidado.',409);
      if((await rows(db,'orderLines')).some(l=>l.placeId===place.id&&!l.archived&&l.status!=='cancelled'))fail('Esta ubicación tiene puestos asociados. Reasígnalos antes de eliminarla.',409);
      const value={...place,archived:true,revision:place.revision+1};await db.put(key('servicePlaces',place.id),value);
      await audit(db,actor,'place-delete','servicePlaces',place.id);return {record:value};
    }
    if(op==='service-day-save'){
      managerOnly(actor);
      const input=b.record||{},service=await record(db,'services',required(input.serviceId,'el servicio'));
      if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio no editable.',409);
      const d=date(input.date),old=input.id?await record(db,'serviceDays',input.id):null;revision(old,input);
      if(old&&old.serviceId!==service.id)fail('No se pueden mover jornadas entre servicios.');
      if(old&&old.date!==d&&(await rows(db,'orderLines')).some(l=>l.serviceId===service.id&&l.date===old.date&&!l.archived&&l.status!=='cancelled'))fail('La jornada tiene puestos: cambia primero sus fechas.',409);
      if((await rows(db,'serviceDays')).some(x=>x.id!==old?.id&&x.serviceId===service.id&&x.date===d&&!x.archived))fail('Esa jornada ya existe.',409);
      const value={...old,id:old?.id||uid(),serviceId:service.id,date:d,name:text(input.name,140)||'Jornada',notes:text(input.notes,800),revision:(old?.revision||0)+1};
      await db.put(key('serviceDays',value.id),value);
      const serviceNew={...service,date:d<service.date?d:service.date,endDate:d>service.endDate?d:service.endDate,revision:service.revision+1,updatedAt:now()};
      await db.put(key('services',service.id),serviceNew);
      await audit(db,actor,old?'day-update':'day-create','serviceDays',value.id);return {record:value,service:serviceNew};
    }
    if(op==='service-day-delete'){
      managerOnly(actor);const value=await record(db,'serviceDays',b.id);revision(value,b);
      const service=await record(db,'services',value.serviceId);if(service.settlementStatus==='confirmed')fail('Servicio liquidado.',409);
      if((await rows(db,'orderLines')).some(l=>l.serviceId===service.id&&l.date===value.date&&!l.archived&&l.status!=='cancelled'))fail('Esta jornada tiene puestos. Elimina o mueve sus puestos primero.',409);
      await db.put(key('serviceDays',value.id),{...value,archived:true,revision:value.revision+1});
      await audit(db,actor,'day-delete','serviceDays',value.id);return {};
    }
    
    if(op==='quote-plan-save'){
      managerOnly(actor);
      const input=b.record||{},old=input.id?await record(db,'quotes',input.id):null;
      if(old&&old.status!=='draft')fail('Solo puedes modificar presupuestos en borrador.',409);
      const plan=Array.isArray(input.staffPlan)?input.staffPlan:[];
      if(plan.length<1||plan.length>100)fail('Incluye entre 1 y 100 bloques de personal.');
      const client=await record(db,'clients',required(input.clientId,'el cliente'));
      if(!client.active||client.archived)fail('Cliente inactivo.');
      const rates=await tariffCatalog(db),lines=[],validated=[],config=await settings(db);
      const chosenSchedule=text(input.schedule)||'Tarifa estándar 2026';
      for(const raw of plan){
        const tariff=rates.find(x=>x.id===text(raw.categoryId));
        if(!tariff||!tariff.active)fail('Categoría no disponible.');
        if((tariff.schedule||'Tarifa estándar 2026')!==chosenSchedule)fail('La categoría no pertenece a la tarifa seleccionada.');
        if(tariff.clientRate==null)fail('Configura el precio cliente de '+tariff.name+' antes de presupuestar.');
        const qty=number(raw.quantity??1,1,100);if(!Number.isInteger(qty))fail('Número de personas no válido.');
        const d=date(raw.date),last=date(raw.endDate||raw.date),from=time(raw.start),to=time(raw.end);
        const span=(Date.parse(last+'T'+to+':00Z')-Date.parse(d+'T'+from+':00Z'))/3600000;
        const pause=number(raw.pause??0,0,24);if(span<=pause||span>48)fail('Horario del bloque incorrecto.');
        const billable=tariff.unit==='day'?1:Math.max(span-pause,tariff.minHours);
        const unitPrice=money(tariff.clientRate*(1+(tariff.incrementPercent||0)/100));
        const locationName=text(raw.locationName,150);
        if(raw.coordinatorId){const u=await record(db,'users',raw.coordinatorId);if(!u.active||u.role!=='worker'||!u.workerId)fail('El coordinador del bloque debe ser trabajador, no gestor de oficina.',403);}
        const detail={quantity:qty,categoryId:tariff.id,role:tariff.name,serviceType:text(raw.serviceType,100)||'Servicio',team:text(raw.team,100),
          date:d,endDate:last,start:from,end:to,pause,locationName,locationAddress:text(raw.locationAddress,400),
          placeMapsUrl:text(raw.placeMapsUrl,700),coordinatorId:text(raw.coordinatorId),unitPrice,billable};
        validated.push(detail);
        lines.push({description:detail.serviceType+' · '+tariff.name+' · '+d+' '+from+'–'+to+(locationName?' · '+locationName:''),
          quantity:money(qty*billable),price:unitPrice,vat:config.vat});
      }
      const dates=validated.flatMap(x=>[x.date,x.endDate]).sort();
      const quoteData={id:old?.id,revision:old?.revision,clientId:client.id,date:input.date||now().slice(0,10),
        dueDate:input.dueDate||input.date||now().slice(0,10),notes:input.notes||'',lines};
      const saved=await saveEntity(db,actor,'quotes',quoteData);
      const full={...saved,staffPlan:validated,schedule:chosenSchedule,serviceName:text(input.serviceName,200),serviceVenue:text(input.serviceVenue,200),serviceVenueLat:Number.isFinite(Number(input.serviceVenueLat))&&input.serviceVenueLat!==''?Number(input.serviceVenueLat):null,serviceVenueLng:Number.isFinite(Number(input.serviceVenueLng))&&input.serviceVenueLng!==''?Number(input.serviceVenueLng):null,planStartDate:dates[0],planEndDate:dates[dates.length-1]};
      await db.put(key('quotes',full.id),full);
      await audit(db,actor,'quote-plan-save','quotes',full.id);return {record:full};
    }
    if(op==='tariff-schedule-create'){
      managerOnly(actor);
      const name=required(b.name,'el nombre de la tarifa').slice(0,100);
      const catalog=await tariffCatalog(db);
      if(catalog.some(t=>(t.schedule||'Tarifa estándar 2026').toLowerCase()===name.toLowerCase()))fail('Ya existe una tarifa con este nombre.',409);
      const source=text(b.source)||'Tarifa estándar 2026',base=catalog.filter(t=>(t.schedule||'Tarifa estándar 2026')===source&&t.active);const increase=number(b.increasePercent??0,0,500),applyTo=['client','worker','both'].includes(b.applyTo)?b.applyTo:'client';
      if(!base.length)fail('No hay categorías de la tarifa de origen.',409);
      if(base.length>100)fail('La tarifa supera 100 categorías.');
      const created=[];
      for(const item of base){
        const id='cat-'+uid(),v={...item,id,schedule:name,source:'custom',workerRate:item.workerRate==null?null:money(item.workerRate*(applyTo==='client'?1:1+increase/100)),clientRate:item.clientRate==null?null:money(item.clientRate*(applyTo==='worker'?1:1+increase/100)),revision:1,createdAt:now(),updatedAt:now()};
        await db.put(key('tariffs',id),v);created.push(v);
      }
      await audit(db,actor,'tariff-schedule-create','tariffs',created[0].id);
      return {records:created};
    }
    
    if(op==='service-create'){
      managerOnly(actor);
      const info=b.service||{},quoteId=text(b.quoteId),quote=quoteId?await record(db,'quotes',quoteId):null;
      if(quote){
        if(quote.archived||!['draft','issued','accepted'].includes(quote.status))fail('Este presupuesto está rechazado o anulado.',409);
        if(quote.serviceId)fail('Este presupuesto ya tiene un servicio.',409);
        if(info.clientId&&info.clientId!==quote.clientId)fail('El cliente no coincide con el presupuesto.');
      }
      let items=Array.isArray(b.positions)?b.positions:[];
      const fromQuote=!!(quote?.staffPlan?.length&&items.length===0);
      if(fromQuote)items=quote.staffPlan.flatMap(x=>Array.from({length:x.quantity},()=>({...x})));
      if(items.length>300)fail('Máximo 300 puestos por servicio. Divide la planificación en varios servicios.');
      const allDates=items.flatMap(x=>[x.date,x.endDate||x.date]).filter(Boolean).map(date).sort();
      const startDate=info.date||allDates[0],endDate=info.endDate&&info.endDate>=(allDates.at(-1)||'')?info.endDate:allDates.at(-1)||info.endDate;
      const firstStart=items.filter(x=>x.date===startDate).map(x=>x.start).filter(Boolean).sort()[0];
      const lastEnd=items.filter(x=>(x.endDate||x.date)===endDate).map(x=>x.end).filter(Boolean).sort().at(-1);
      const service=await saveEntity(db,actor,'services',{
        name:info.name||quote?.serviceName,clientId:quote?.clientId||info.clientId,tariffSchedule:quote?.schedule||info.tariffSchedule||'Tarifa estándar 2026',
        venue:info.venue||quote?.serviceVenue||items[0]?.locationName||'Ubicación por asignar',
        venueLat:info.venueLat!==''&&info.venueLat!=null?info.venueLat:(quote?.serviceVenueLat??null),venueLng:info.venueLng!==''&&info.venueLng!=null?info.venueLng:(quote?.serviceVenueLng??null),
        date:startDate,start:info.start||firstStart||'08:00',
        endDate:endDate||startDate,end:info.end||lastEnd||'23:59',
        coordinatorId:info.coordinatorId||'',required:items.length,status:'planned',notes:info.notes||''
      });
      const allPlaceNames=[...(Array.isArray(b.places)?b.places:[])];
      for(const item of items)if(item.locationName&&!allPlaceNames.some(p=>p.name===item.locationName&&p.address===item.locationAddress))
        allPlaceNames.push({name:item.locationName,address:item.locationAddress,mapsUrl:item.placeMapsUrl,lat:item.placeLat,lng:item.placeLng});
      const createdPlaces=[],placeMap=new Map();
      for(const place of allPlaceNames){
        const name=required(place.name,'el nombre de ubicación'),lat=place.lat===''||place.lat==null?null:number(place.lat,-90,90),lng=place.lng===''||place.lng==null?null:number(place.lng,-180,180);
        if((lat==null)!==(lng==null))fail('Coordenadas incompletas de '+name);
        const mapsUrl=text(place.mapsUrl,700);if(mapsUrl){let url;try{url=new URL(mapsUrl)}catch{fail('Enlace de Google Maps inválido.');}if(url.protocol!=='https:'||!['www.google.com','google.com','maps.google.com','maps.app.goo.gl','www.google.es','google.es','www.google.co.uk','google.co.uk','www.google.fr','google.fr'].includes(url.hostname))fail('Enlace de Maps no permitido.');}
        const recordPlace={id:uid(),serviceId:service.id,name,address:text(place.address,500),mapsUrl,lat,lng,radiusMeters:number(place.radiusMeters??500,100,5000),revision:1,createdAt:now()};
        await db.put(key('servicePlaces',recordPlace.id),recordPlace);createdPlaces.push(recordPlace);
        placeMap.set(name+'|'+(place.address||''),recordPlace.id);
      }
      const dates=[...new Set(items.flatMap(x=>[x.date,x.endDate||x.date]).concat([service.date,service.endDate]).filter(Boolean))].sort();
      const days=[];
      for(const d of dates){
        const value={id:uid(),serviceId:service.id,date:date(d),name:'Jornada',notes:'',revision:1};
        await db.put(key('serviceDays',value.id),value);days.push(value);
      }
      const positions=[],assigned=[],createdBlocks=[],blockIds=new Map();
      for(const item of items){
        const placeId=item.placeId||(item.locationName?placeMap.get(item.locationName+'|'+(item.locationAddress||''))||'':'');
        if(placeId&&!createdPlaces.some(p=>p.id===placeId))fail('La ubicación del puesto no pertenece al servicio.');
        const d=item.date||service.date,last=item.endDate||d,start=item.start||service.start,end=item.end||service.end;
        const serviceType=text(item.serviceType)||'Servicio',team=text(item.team),coordinatorId=text(item.coordinatorId);
        if(coordinatorId){const u=await record(db,'users',coordinatorId);if(!u.active||u.role!=='worker'||!u.workerId)fail('El coordinador debe tener una ficha de trabajador.',403);}
        const blockKey=JSON.stringify([d,last,start,end,serviceType,team,placeId,coordinatorId]);
        if(!blockIds.has(blockKey)){
          const value={id:uid(),serviceId:service.id,date:d,endDate:last,start,end,serviceType,team,placeId,coordinatorId,notes:text(item.notes,1000),revision:1,createdAt:now()};
          await db.put(key('serviceBlocks',value.id),value);createdBlocks.push(value);blockIds.set(blockKey,value.id);
        }
        const slot=await saveEntity(db,actor,'orderLines',{
          serviceId:service.id,categoryId:item.categoryId,serviceType:item.serviceType||'Servicio',
          team:item.team||'',placeId,coordinatorId:item.coordinatorId||'',
          date:item.date||service.date,start:item.start||service.start,
          endDate:item.endDate||item.date||service.endDate,end:item.end||service.end,
          pause:item.pause??0,notes:item.notes||''
        });
        const linked={...slot,blockId:blockIds.get(blockKey)};await db.put(key('orderLines',linked.id),linked);positions.push(linked);
        if(item.workerId){
          const assignment=await saveEntity(db,actor,'assignments',{
            serviceId:service.id,orderLineId:slot.id,categoryId:slot.categoryId,
            workerId:item.workerId,role:slot.role,team:slot.team,
            date:slot.date,start:slot.start,endDate:slot.endDate,end:slot.end,pause:slot.pause,
            costRate:item.costRate??'',chargeRate:item.chargeRate??''
          });
          assigned.push(assignment);
        }
      }
      if(quote){
        await db.put(key('quotes',quote.id),{...quote,status:'accepted',serviceId:service.id,revision:quote.revision+1,updatedAt:now()});
        await audit(db,actor,'quote-to-service','quotes',quote.id);
      }
      return {record:service,positions,assigned,places:createdPlaces,days,blocks:createdBlocks,fromQuote};
    }
    if(op==='order-line-bulk'){
     managerOnly(actor);const count=number(b.quantity,1,100),created=[];
     for(let i=0;i<count;i++)created.push(await saveEntity(db,actor,'orderLines',b.record||{}));
     return {records:created};
    }
   if(op==='archive'){
    managerOnly(actor);const kind=text(b.kind);if(!['clients','workers','services','assignments','quotes','invoices','orderLines'].includes(kind))fail('Tipo incorrecto.');const r=await record(db,kind,b.id);revision(r,b);
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
    const value={name:required(s.name,'la razón social'),taxId:required(s.taxId,'el NIF'),address:required(s.address,'la dirección'),email:text(s.email),phone:text(s.phone),iban:text(s.iban,60),invoicePrefix:prefix,vat:number(s.vat,0,100),paymentDays:termDays(s.paymentDays),footer:text(s.footer,3000),staffNotice:text(s.staffNotice,1500),emergencyPhone:text(s.emergencyPhone,40),revision:(old.revision||0)+1};await db.put('office/settings',value);await audit(db,actor,'settings','settings','company');return {};
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
    if(actor.role==='worker'||actor.role==='coordinator'){const ticket=await db.get('office/qr/'+b.qrHash);if(!ticket)fail('QR no válido o caducado.',409);const assignment=await record(db,'assignments',ticket.assignmentId);await canCoordinateAssignment(db,actor,assignment);}
    const ticket=await db.get('office/qr/'+b.qrHash);if(!ticket||ticket.expires<Date.now())fail('QR caducado, utilizado o sustituido. Genera uno nuevo.',409);
    const a=await record(db,'assignments',ticket.assignmentId);await canCoordinateAssignment(db,actor,a);await canService(db,actor,a.serviceId);const service=await record(db,'services',a.serviceId);
    if(a.archived||service.archived||['completed','cancelled'].includes(service.status))fail('Servicio no disponible.',409);
    const effectivePlace=a.placeId?await db.get(key('servicePlaces',a.placeId)):null;
    validateGeofence(effectivePlace?.lat!=null?{venueLat:effectivePlace.lat,venueLng:effectivePlace.lng,radiusMeters:effectivePlace.radiusMeters}:service,b);
     const stamp=now();if(ticket.action==='in'&&a.checkIn||ticket.action==='out'&&(!a.checkIn||a.checkOut))fail('El estado del fichaje ha cambiado. Genera otro QR.',409);
    await db.put(key('assignments',a.id),{...a,...(ticket.action==='in'?{checkIn:stamp,status:'confirmed'}:{checkOut:stamp}),revision:a.revision+1,updatedAt:stamp});
    await db.delete('office/qr/'+b.qrHash);await db.delete('office/qr-active/'+a.id);await audit(db,actor,'qr-'+ticket.action,'assignments',a.id);return {workerId:a.workerId,action:ticket.action,time:stamp};
   }
   
    if(op==='crew-attendance'){
      if(actor.role!=='worker'||!actor.workerId)fail('Solo coordinadores trabajadores.',403);
      const a=await record(db,'assignments',b.id);revision(a,b);await requireCrewHead(db,actor,a);
      const service=await record(db,'services',a.serviceId);
      if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio cerrado.',409);
      const reason=required(b.reason,'el motivo del fichaje manual').slice(0,400);
      const event=b.event;
      if(!['in','out','undo-in','undo-out'].includes(event))fail('Acción de fichaje inválida.');
      if(event==='in'&&a.checkIn)fail('Entrada ya registrada.',409);
      if(event==='out'&&(!a.checkIn||a.checkOut))fail('Registra primero una entrada abierta.',409);
      if(event==='undo-in'&&(!a.checkIn||a.checkOut))fail('No puede deshacerse esta entrada.',409);
      if(event==='undo-out'&&!a.checkOut)fail('No hay salida registrada.',409);
      const next={...a,revision:a.revision+1,updatedAt:now()};
      if(event==='in')next.checkIn=now();
      if(event==='out')next.checkOut=now();
      if(event==='undo-in')next.checkIn='';
      if(event==='undo-out')next.checkOut='';
      await db.put(key('assignments',a.id),next);
      await audit(db,actor,'crew-attendance-'+event,'assignments',a.id);
      const id=uid();await db.put('office/crewAttendanceAudit/'+id,{id,assignmentId:a.id,actorId:actor.id,reason,event,before:{checkIn:a.checkIn,checkOut:a.checkOut},after:{checkIn:next.checkIn,checkOut:next.checkOut},createdAt:now()});
      return {record:publicAssignment(next,actor)};
    }
    if(op==='crew-team-save'){
      if(actor.role!=='worker'||!actor.workerId)fail('Solo trabajadores coordinadores.',403);
      const data=b.record||{},block=await record(db,'serviceBlocks',required(data.blockId,'el turno'));
      if(block.archived)fail('Turno archivado.',409);
      const service=await record(db,'services',block.serviceId);
      if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio cerrado.',409);
      const crewDays=await crewHeadDays(db,actor);
      if(!datesBetween(block.date,block.endDate||block.date).some(d=>crewDays.has(block.serviceId+'|'+d)))fail('Solo el Crew Head de este servicio y día planifica equipos.',403);
      if(await db.get(key('crewDayClosures',block.serviceId+'_'+block.date)))fail('Este día ya está cerrado por el Crew Head.',409);
      const old=data.id?await record(db,'crewTeams',data.id):null;
      revision(old,data);if(old&&old.blockId!==block.id)fail('No se puede mover un equipo.',409);
      const name=required(data.name,'el nombre del equipo').slice(0,100);
      const others=(await rows(db,'crewTeams')).filter(t=>t.blockId===block.id&&!t.archived&&t.id!==old?.id);
      if(others.some(t=>t.name.toLowerCase()===name.toLowerCase()))fail('Equipo ya existente.',409);
      const value={...old,id:old?.id||uid(),blockId:block.id,serviceId:block.serviceId,name,capacity:number(data.capacity??20,1,200),
        vestColor:text(data.vestColor,30),revision:(old?.revision||0)+1,createdAt:old?.createdAt||now(),updatedAt:now()};
      await db.put(key('crewTeams',value.id),value);await audit(db,actor,'crew-team-save','crewTeams',value.id);return {record:value};
    }
    if(op==='crew-team-delete'){
      if(actor.role!=='worker'||!actor.workerId)fail('Solo coordinadores.',403);
      const old=await record(db,'crewTeams',b.id);revision(old,b);
      const slots=(await rows(db,'orderLines')).filter(l=>l.blockId===old.blockId&&!l.archived);
      const assigned=(await rows(db,'assignments')).filter(a=>!a.archived&&slots.some(l=>l.id===a.orderLineId));
      const teamBlock=await record(db,'serviceBlocks',old.blockId),crewDays=await crewHeadDays(db,actor);
      if(!datesBetween(teamBlock.date,teamBlock.endDate||teamBlock.date).some(d=>crewDays.has(teamBlock.serviceId+'|'+d)))fail('Solo el Crew Head de este servicio y día gestiona equipos.',403);
      if(assigned.some(a=>a.team===old.name))fail('Reasigna al personal antes de eliminar el equipo.',409);
      await db.put(key('crewTeams',old.id),{...old,archived:true,revision:old.revision+1});
      await audit(db,actor,'crew-team-delete','crewTeams',old.id);return {};
    }
    if(op==='crew-bulk-control'){
      if(actor.role!=='worker'||!actor.workerId)fail('Solo coordinadores trabajadores.',403);
      const items=Array.isArray(b.items)?b.items:[];
      if(!items.length||items.length>120)fail('Selecciona entre 1 y 120 trabajadores.');
      const seen=new Set(),prepared=[];
      const allowedFields=['team','vestColor','contacted','dietCount','pauseScheduledHours','pauseStart','pauseEnd','rating'];
      if(!allowedFields.includes(b.field))fail('Cambio masivo no permitido.');
      for(const item of items){
        if(seen.has(item.id))fail('Trabajador duplicado en la selección.',409);seen.add(item.id);
        const a=await record(db,'assignments',item.id);revision(a,item);
        await requireCrewHead(db,actor,a);
        const service=await record(db,'services',a.serviceId);
        if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio cerrado.',409);
        let value=b.value;
        if(b.field==='team')value=text(value,100);
        if(b.field==='vestColor')value=text(value,30);
        if(b.field==='contacted')value=value===true;
        if(b.field==='dietCount')value=number(value,0,3);
        if(b.field==='pauseScheduledHours')value=number(value,0,3);
        if(b.field==='rating')value=number(value,0,5);
        if(b.field==='pauseStart'||b.field==='pauseEnd'){
          value=value?time(value):'';
          const start=b.field==='pauseStart'?value:(a.pauseStart||''),end=b.field==='pauseEnd'?value:(a.pauseEnd||'');
          if(start&&end&&(start>=end||start<a.start||end>a.end))fail('La pausa debe estar dentro del horario del trabajador.',409);
        }
        prepared.push({old:a,value});
      }
      // No writes occur until every worker, revision and permission is checked.
      const updated=[];
      for(const {old,value} of prepared){
        const next={...old,[b.field]:value,revision:old.revision+1,updatedAt:now()};
        await db.put(key('assignments',old.id),next);updated.push(publicAssignment(next,actor));
        await audit(db,actor,'crew-bulk-'+b.field,'assignments',old.id);
      }
      return {records:updated};
    }
    if(op==='assignment-history'){
     const a=await record(db,'assignments',b.id);if(actor.role!=='manager')await canCoordinateAssignment(db,actor,a);
     const out=[];for(const e of (await db.list({prefix:'office/audit/'})).values())if(e.recordId===a.id)out.push({time:e.time,name:e.name,action:e.action,detail:e.detail||''});
     return {entries:out.sort((x,y)=>y.time.localeCompare(x.time)).slice(0,100)};
    }
    if(op==='coord-update'||op==='coord-bulk'){
     const items=op==='coord-bulk'?(Array.isArray(b.items)?b.items:[]):[{id:b.id,revision:b.revision}];
     if(!items.length||items.length>200)fail('Selecciona entre 1 y 200 trabajadores.');
     if(new Set(items.map(i=>i.id)).size!==items.length)fail('Trabajador duplicado en la selección.',409);
     const all=(await rows(db,'assignments')).filter(x=>!x.archived),prepared=[];
     for(const item of items){
      const a=await record(db,'assignments',item.id);revision(a,item);await requireCoordinatorEdit(db,actor,a);
      const service=await record(db,'services',a.serviceId);
      if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio cerrado.',409);
      const name=op==='coord-bulk'?((await db.get(key('workers',a.workerId)))?.name||'Personal')+': ':'';
      try{prepared.push({a,...coordApply(a,b.changes||{},all)});}catch(e){if(e.status)e.message=name+e.message;throw e;}
     }
     // Nothing is written until every worker, revision and permission has been checked.
     const out=[];
     for(const {a,next,events} of prepared){
      if(!events.length){out.push(publicAssignment(a,actor));continue;}
      next.revision=a.revision+1;next.updatedAt=now();
      await db.put(key('assignments',a.id),next);
      if(next.checkIn!==a.checkIn||next.checkOut!==a.checkOut){const id=uid();await db.put('office/crewAttendanceAudit/'+id,{id,assignmentId:a.id,actorId:actor.id,reason:text((b.changes||{}).reason,400)||'Coordinación',event:'coord-edit',before:{checkIn:a.checkIn,checkOut:a.checkOut},after:{checkIn:next.checkIn,checkOut:next.checkOut},createdAt:now()});}
      await audit(db,actor,op==='coord-bulk'?'coord-bulk':'coord-update','assignments',a.id,events.join(' · '));
      out.push(publicAssignment(next,actor));
     }
     return op==='coord-bulk'?{records:out}:{record:out[0]};
    }
    if(op==='coordinator-control'){
     const a=await record(db,'assignments',b.id);revision(a,b);
     if(actor.role!=='manager'){if(['team','vestColor'].includes(b.field))await requireCrewHead(db,actor,a);else await requireCoordinatorEdit(db,actor,a);}
     const service=await record(db,'services',a.serviceId);
     if(service.archived||['completed','cancelled'].includes(service.status)||service.settlementStatus==='confirmed')fail('Servicio cerrado.',409);
     const update={};
     if(b.field==='contacted')update.contacted=b.value===true;
     else if(b.field==='team')update.team=text(b.value,100);
     else if(b.field==='vestColor')update.vestColor=text(b.value,30);
     else if(b.field==='dietCount')update.dietCount=number(b.value,0,3);
     else if(b.field==='pauseScheduledHours')update.pauseScheduledHours=number(b.value,0,3);
     else if(b.field==='rating')update.rating=number(b.value,0,5);
     else fail('Campo operativo no permitido.');
     const value={...a,...update,revision:a.revision+1,updatedAt:now()};
     await db.put(key('assignments',a.id),value);await audit(db,actor,'coordinator-'+b.field,'assignments',a.id);
     return {record:publicAssignment(value,actor)};
    }
    if(op==='coordinator-shift'){
     if(actor.role==='manager')fail('Usa Gestoría para modificar turnos.');
     const a=await record(db,'assignments',b.id);revision(a,b);await requireCrewHead(db,actor,a);
     const service=await record(db,'services',a.serviceId);
     if(service.settlementStatus==='confirmed'||service.status==='completed'||service.status==='cancelled')fail('Servicio cerrado.',409);
     if(a.checkOut)fail('No se modifica un turno ya fichado y finalizado.',409);
     const dateStart=date(b.date||a.date),dateEnd=date(b.endDate||a.endDate),start=time(b.start||a.start),end=time(b.end||a.end);
     const slot=a.orderLineId?await db.get(key('orderLines',a.orderLineId)):null,block=slot?.blockId?await db.get(key('serviceBlocks',slot.blockId)):null;
     if(!isCrewDay(await crewHeadDays(db,actor),{serviceId:a.serviceId,date:dateStart,endDate:dateStart}))fail('El nuevo horario debe empezar en un día en el que eres Crew Head de este servicio.',403);
     const difference=(Date.parse(dateEnd+'T'+end+':00Z')-Date.parse(dateStart+'T'+start+':00Z'))/3600000;
     if(difference<=0||difference>48)fail('Horario inválido.');
     const others=(await rows(db,'assignments')).filter(x=>x.workerId===a.workerId&&x.id!==a.id&&!x.archived);
     for(const other of others){
      const earlier=dateStart+'T'+start<other.endDate+'T'+other.end;
      const later=dateEnd+'T'+end>other.date+'T'+other.start;
      if(earlier&&later)fail('El trabajador ya tiene otro turno en ese horario.',409);
     }
     const hours=money(difference-a.pause);if(hours<=0)fail('Pausa superior a la duración del turno.');
     const value={...a,date:dateStart,endDate:dateEnd,start,end,hours,revision:a.revision+1,updatedAt:now()};
     await db.put(key('assignments',a.id),value);await audit(db,actor,'coordinator-shift','assignments',a.id);return {record:publicAssignment(value,actor)};
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
    const config=await settings(db),day=now().slice(0,10),dueDate=new Date(Date.now()+(await clientTerm(db,q.clientId,config))*86400000).toISOString().slice(0,10);
    const invoice=await saveEntity(db,actor,'invoices',{clientId:q.clientId,serviceId:q.serviceId,date:day,dueDate,notes:q.notes,lines:q.lines});
    await db.put(key('quotes',q.id),{...q,invoiceId:invoice.id,revision:q.revision+1,updatedAt:now()});await audit(db,actor,'quote-invoice','quotes',q.id);return {record:invoice};
   }
   if(op==='clock'){
    const a=await record(db,'assignments',b.id);revision(a,b);const s=await record(db,'services',a.serviceId);
    if(a.archived||s.archived||['cancelled','completed'].includes(s.status))fail('El servicio no admite fichajes.',409);
     if(actor.role!=='manager'&&actor.workerId===a.workerId&&b.mode==='geo'){
      if(!(await coordinatesService(db,actor,a.serviceId)))fail('El fichaje por geolocalización es para coordinadores del servicio. Muestra tu QR al coordinador.',403);
      if(b.latitude==null||b.longitude==null)fail('Activa la ubicación para fichar por geolocalización.',403);
     } else if(actor.role!=='manager'&&s.coordinatorId&&actor.workerId===a.workerId&&!(await coordinatesService(db,actor,a.serviceId)))fail('Este servicio requiere fichaje QR validado por coordinación.',403);
     const effectivePlace=a.placeId?await db.get(key('servicePlaces',a.placeId)):null;
     validateGeofence(effectivePlace?.lat!=null?{venueLat:effectivePlace.lat,venueLng:effectivePlace.lng,radiusMeters:effectivePlace.radiusMeters}:s,b);
    if(actor.role!=='manager'&&a.workerId!==actor.workerId)fail('No puedes fichar a otra persona.',403);await canService(db,actor,a.serviceId);
    const stamp=now();let update={};if(b.action==='in'){if(a.checkIn)fail('Ya hay una entrada registrada.',409);if(a.status==='rejected')fail('La asignación está rechazada.');update={checkIn:stamp,status:'confirmed'};}
    else if(b.action==='out'){if(!a.checkIn||a.checkOut)fail('Debe existir una entrada abierta.',409);update={checkOut:stamp};}
    else fail('Fichaje incorrecto.');await db.put(key('assignments',a.id),{...a,...update,revision:a.revision+1,updatedAt:stamp});await audit(db,actor,'clock-'+b.action,'assignments',a.id,b.mode==='geo'?'Geolocalización':'');return {};
   }
   if(op==='availability'){
    const workerId=actor.role==='manager'?b.workerId:actor.workerId;if(!workerId)fail('Tu cuenta no está vinculada a un trabajador.');await record(db,'workers',workerId);const day=date(b.date),id=workerId+'_'+day;const old=await db.get(key('availability',id));revision(old,b);const status=b.status;if(!['available','unavailable'].includes(status))fail('Disponibilidad incorrecta.');const slots=Array.isArray(b.slots)?[...new Set(b.slots.map(Number))].sort((x,y)=>x-y):null;
    if(slots&&slots.some(h=>!Number.isInteger(h)||h<0||h>23))fail('Hora seleccionada no válida.');
    const start=slots?.length?String(slots[0]).padStart(2,'0')+':00':b.start?time(b.start):'';
    const end=slots?.length?String(slots.at(-1)+1).padStart(2,'0')+':00':b.end?time(b.end):'';
    if(start&&end&&start>=end)fail('La hora final debe ser posterior a la inicial.');
    await db.put(key('availability',id),{id,workerId,date:day,status,start,end,...(slots?{slots}:{}),notes:text(b.notes,500),revision:(old?.revision||0)+1,updatedAt:now()});await audit(db,actor,'availability','availability',id);return {};
   }
   if(op==='settlement-confirm'){
     managerOnly(actor);const s=await record(db,'services',b.serviceId);revision(s,b);
     if(s.status!=='completed'||s.settlementStatus==='confirmed')fail('Finaliza el servicio y revisa que no esté liquidado.',409);
     const aa=(await rows(db,'assignments')).filter(a=>a.serviceId===s.id&&!a.archived);
     if(!aa.length)fail('No hay personal para liquidar.');
     if(aa.some(a=>a.checkIn&&!a.checkOut&&!a.noShow))fail('Hay trabajadores con fichaje abierto. Ciérralos o corrige los fichajes antes de liquidar.',409);
     const stamp=now(),cost=money(aa.reduce((n,a)=>n+(a.workerUnits??a.workerHours??a.hours)*a.costRate,0)),revenue=money(aa.reduce((n,a)=>n+(a.clientUnits??a.billableHours??a.hours)*a.chargeRate,0));
     for(const a of aa)await db.put(key('assignments',a.id),{...a,settlementStatus:'confirmed',settledAt:stamp,revision:a.revision+1,updatedAt:stamp});
     await db.put(key('services',s.id),{...s,settlementStatus:'confirmed',settledAt:stamp,settlementCost:cost,settlementRevenue:revenue,...(s.closedBy?{}:{closedBy:actor.id,closedByName:actor.name}),revision:s.revision+1,updatedAt:stamp});
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
    const day=b.date?date(b.date):'';
    const existing=(await rows(db,'invoices')).filter(i=>i.serviceId===service.id&&!i.archived);
    if(existing.some(i=>!Array.isArray(i.assignmentIds)))fail('Este servicio ya tiene una factura completa o borrador.',409);
    const invoiced=new Set(existing.flatMap(i=>i.assignmentIds));
    const assignments=(await rows(db,'assignments')).filter(a=>a.serviceId===service.id&&!a.archived&&!invoiced.has(a.id)&&(!day||a.date===day)&&(a.clientUnits??a.billableHours??a.hours)>0&&(a.status!=='rejected'||a.noShowChargeApproved));
    if(!assignments.length)fail(day?'No queda personal pendiente de facturar ese día.':'Todo el personal de este servicio ya está facturado.',409);
    const config=await settings(db),workers=await rows(db,'workers'),dmy=d=>d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4);
    const lines=assignments.sort((x,y)=>(x.date+x.start).localeCompare(y.date+y.start)).map(a=>({description:`${service.name} · ${dmy(a.date)} · ${workers.find(w=>w.id===a.workerId)?.name||'Personal'} · ${a.role}${a.noShow?' · Cancelación pactada (no presentado)':''}`,quantity:a.clientUnits??a.billableHours??a.hours,price:a.chargeRate,vat:config.vat}));
    const today=now().slice(0,10),due=new Date(Date.parse(today+'T12:00:00Z')+(await clientTerm(db,service.clientId,config))*86400000).toISOString().slice(0,10);
    const saved=await saveEntity(db,actor,'invoices',{clientId:service.clientId,serviceId:service.id,date:today,dueDate:due,lines,notes:day?'Cierre parcial del servicio · jornada del '+dmy(day):(existing.length?'Resto del servicio pendiente de facturar':'')});
    const value={...saved,scope:day?'day':'service',serviceDate:day,assignmentIds:assignments.map(a=>a.id)};
    await db.put(key('invoices',value.id),value);return {record:value};
   }
   if(op==='invoice-mark-sent'){
    managerOnly(actor);const r=await record(db,'invoices',b.id);revision(r,b);if(r.status==='draft')fail('Emite la factura antes de marcarla como enviada.',409);
    const value={...r,sentAt:now(),sentTo:text(b.to,200),revision:r.revision+1};await db.put(key('invoices',r.id),value);await audit(db,actor,'invoice-sent','invoices',r.id);return {record:value};
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
   if(op==='document-upload'||op==='employee-document-upload'){
    const personal=op==='employee-document-upload';
    if(personal){if(!actor.workerId)fail('No tienes ficha de trabajador.',403);if(!['identity','training','medical','other'].includes(b.type))fail('El trabajador no puede publicar contratos como documentos oficiales.',403);}
    else managerOnly(actor);
    const workerId=personal?actor.workerId:text(b.workerId),clientId=personal?'':text(b.clientId),serviceId=personal?'':text(b.serviceId);
    if(workerId)await record(db,'workers',workerId);if(clientId)await record(db,'clients',clientId);if(serviceId)await record(db,'services',serviceId);
    const content=String(b.content||'');if(!/^[A-Za-z0-9+/]+={0,2}$/.test(content)||content.length%4!==0)fail('Archivo incorrecto.');const size=atob(content).length;if(size>5*1024*1024||size<1)fail('El archivo debe ocupar entre 1 byte y 5 MB.');
    if(!personal&&(text(b.type)||'contract')==='contract'&&b.periodStart&&b.periodEnd&&date(b.periodEnd)<date(b.periodStart))fail('El fin del contrato es anterior al inicio.');
    const name=required(b.name,'el nombre de archivo').replace(/[\r\n/\\]/g,'_');if(!/\.(pdf|png|jpg|jpeg)$/i.test(name))fail('Sube un PDF, PNG o JPEG.');const bytes=atob(content.slice(0,Math.min(content.length,80)));
    if((/\.pdf$/i.test(name)&&!bytes.startsWith('%PDF-'))||(/\.png$/i.test(name)&&!bytes.startsWith('\x89PNG'))||(/\.jpe?g$/i.test(name)&&!bytes.startsWith('\xff\xd8\xff')))fail('El contenido no corresponde al tipo de archivo.');
    const id=uid(),chunks=Math.ceil(content.length/60000);for(let i=0;i<chunks;i++)await db.put(`office/file/${id}/${i}`,content.slice(i*60000,(i+1)*60000));const d={id,name,size,chunks,workerId,clientId,serviceId,shareWithStaff:!personal&&!!serviceId&&!workerId&&(b.shareWithStaff===true||b.shareWithStaff==='on'),type:personal?text(b.type):(text(b.type)||'contract'),expires:b.expires?date(b.expires):'',...(!personal&&(text(b.type)||'contract')==='contract'?{contractKind:text(b.contractKind,80),periodStart:b.periodStart?date(b.periodStart):'',periodEnd:b.periodEnd?date(b.periodEnd):''}:{}),notes:text(b.notes,2000),source:personal?'employee':'manager',createdAt:now(),createdBy:actor.id,revision:1};await db.put(key('documents',id),d);await audit(db,actor,'upload','documents',id);return {record:d};
   }
   fail('Operación desconocida.',404);
  });return reply({ok:true,...result});
 }catch(e){if(!e.status)console.error('NOVA Office request failed',e.name);return reply({ok:false,error:e.status?e.message:'No se ha podido guardar. Inténtalo de nuevo.'},e.status||500);}}
}
export class OfficeState {
 constructor(ctx,env){this.api=createOfficeApi(ctx.storage,env);}
 fetch(req){return this.api(req);}
}
