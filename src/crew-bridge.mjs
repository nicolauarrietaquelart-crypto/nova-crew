/* Bridge between the original Crew Control v11.2.46 interface (service snapshot API)
   and NOVA Crew operational data.

   NOVA remains the source of truth for the roster: who works, their category,
   planned schedule and attendance. Crew Control keeps its own operational layer
   (scenarios, teams, pause shifts, requirements, ratings, notes) in a snapshot
   stored per service and day. Only the Crew Head assigned to that service and day
   can open or save it. Personnel cannot be added or removed and categories cannot
   be changed from Crew Control: a category change becomes an incident for Gestoría. */

const TZ='Europe/Madrid';
const IDENTITY=['personal','movil','especialidad','categoria','trabajo','blockId','blockLabel','serviceDate','hLlam','pausa'];
const INCIDENT_TYPE={'RETRASO':'delay','AUSENCIA':'absence','ACTITUD':'behaviour','SEGURIDAD':'safety','DAÑOS':'material','UNIFORMIDAD':'other','CAMBIO CATEGORIA':'category_change','OTRO':'other'};
const SEVERITY={'LEVE':'low','MEDIA':'medium','GRAVE':'high'};

export const toDMY=d=>d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4);
const addDays=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
function offsetMinutes(ms){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:TZ,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(ms));
 const g=t=>Number(parts.find(p=>p.type===t).value);
 return Math.round((Date.UTC(g('year'),g('month')-1,g('day'),g('hour'),g('minute'))-ms)/60000);
}
export function localHM(iso){
 if(!iso)return '';
 return new Intl.DateTimeFormat('es-ES',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso));
}
export function localISO(day,hm){
 const guess=Date.parse(day+'T'+hm+':00Z');
 return new Date(guess-offsetMinutes(guess)*60000).toISOString();
}
const hoursToHM=h=>{const m=Math.round(Number(h||0)*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
const validHM=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||''));
const norm=v=>String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toUpperCase().replace(/\s+/g,' ');

export function createCrewBridge(h){
 const {rows,key,record,fail,uid,now,text,money,crewHeadDays,audit,tariffCatalog,datesBetween}=h;
 const codeKey=code=>'office/crewCodes/'+code,dayKey=(serviceId,date)=>'office/crewCodeByDay/'+serviceId+'_'+date,snapKey=code=>'office/crewSnapshots/'+code;

 async function open(db,actor,b){
  const serviceId=text(b.serviceId),date=text(b.date,10);
  if(!(await crewHeadDays(db,actor)).has(serviceId+'|'+date))fail('Crew Control solo está disponible para el Crew Head asignado a este servicio y día.',403);
  let code=await db.get(dayKey(serviceId,date));
  if(!code){
   for(let i=0;i<30&&!code;i++){const c=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');if(!await db.get(codeKey(c)))code=c;}
   if(!code)fail('No se ha podido preparar Crew Control. Inténtalo de nuevo.',503);
   await db.put(codeKey(code),{serviceId,date});await db.put(dayKey(serviceId,date),code);
  }
  return {code,serviceId,date};
 }

 async function context(db,actor,code){
  if(!/^\d{6}$/.test(String(code||'')))fail('Código de servicio no válido',403);
  const map=await db.get(codeKey(code));if(!map)fail('El servicio ya no está disponible.',404);
  if(!(await crewHeadDays(db,actor)).has(map.serviceId+'|'+map.date))fail('Solo el Crew Head asignado a este servicio y día puede usar Crew Control.',403);
  const service=await record(db,'services',map.serviceId);
  const assignments=(await rows(db,'assignments')).filter(a=>a.serviceId===service.id&&!a.archived&&a.status!=='rejected'&&datesBetween(a.date,a.endDate||a.date).includes(map.date)).sort((a,b)=>(a.start+a.id).localeCompare(b.start+b.id));
  const slots=new Map((await rows(db,'orderLines')).filter(l=>l.serviceId===service.id).map(l=>[l.id,l]));
  const blocks=new Map((await rows(db,'serviceBlocks')).filter(x=>x.serviceId===service.id&&!x.archived).map(x=>[x.id,x]));
  const workers=new Map((await rows(db,'workers')).map(w=>[w.id,w]));
  const users=await rows(db,'users'),operators=(await rows(db,'serviceBlockOperators')).filter(o=>!o.archived&&o.serviceId===service.id);
  const coordUsers=new Set([service.coordinatorId,...[...blocks.values()].filter(x=>x.date===map.date).map(x=>x.coordinatorId),...operators.filter(o=>blocks.get(o.blockId)?.date===map.date).map(o=>o.userId)].filter(Boolean));
  const coordWorkerIds=new Set(users.filter(u=>coordUsers.has(u.id)).map(u=>u.workerId).filter(Boolean));
  const closure=await db.get(key('crewDayClosures',service.id+'_'+map.date));
  return {code,map,service,assignments,slots,blocks,workers,coordWorkerIds,closure,dmy:toDMY(map.date)};
 }

 function rosterRow(ctx,a,stored,index){
  const w=ctx.workers.get(a.workerId)||{},slot=ctx.slots.get(a.orderLineId),block=slot?ctx.blocks.get(slot.blockId):null;
  const base=stored||{id:a.id,status:'PENDIENTE',included:true,arrivalAt:'',actualStart:'',actualEnd:'',actualPause:'',actualDiet:'',notes:'',teamId:'',scenarioId:'',_fieldTimes:{},sortOrder:index+1};
  const row={...base,id:a.id,personal:w.name||'Personal',movil:w.phone||'',especialidad:a.role||a.categoryId||'',categoria:a.role||a.categoryId||'',
   trabajo:slot?.serviceType||block?.serviceType||'SERVICIO',blockId:slot?.blockId||'',blockLabel:block?block.serviceType+' '+block.start+'-'+block.end:'',
   serviceDate:ctx.dmy,hLlam:ctx.service.callTime||'',inicio:a.start,fin:a.end,pausa:hoursToHM(a.pause),nDieta:Number(a.dietCount||0),
   isCoordinator:ctx.coordWorkerIds.has(a.workerId)};
  // Attendance registered elsewhere in NOVA (QR, Gestoría) is reflected with a new field version.
  const ft={...(base._fieldTimes||{})},arrival=a.checkIn?localHM(a.checkIn):'';
  const bump=field=>{ft[field]=Number(ft[field]||0)+1;};
  if(a.checkIn){
   if(row.status!=='PRESENTE'){row.status='PRESENTE';bump('status');}
   if(row.arrivalAt!==arrival){row.arrivalAt=arrival;bump('arrivalAt');}
  }else if(row.status==='PRESENTE'){
   row.status='PENDIENTE';bump('status');
   if(row.arrivalAt){row.arrivalAt='';bump('arrivalAt');}
  }
  if(a.checkOut)row.actualEnd=localHM(a.checkOut);
  row._fieldTimes=ft;
  return row;
 }

 function build(ctx,stored){
  const previous=new Map((stored?.workers||[]).map(w=>[String(w.id),w]));
  const types=[...new Set(ctx.assignments.map(a=>ctx.slots.get(a.orderLineId)?.serviceType||'SERVICIO'))];
  const base=stored||{scenarios:[],teams:[],incidents:[],requirements:[],workOrder:types,hiddenWorkTypes:[],pauseShifts:[],audit:[],createdAt:now()};
  return {...base,code:ctx.code,serviceName:ctx.service.name,serviceDate:ctx.dmy,venue:ctx.service.venue||'',
   closed:['completed','cancelled'].includes(ctx.service.status)||ctx.service.settlementStatus==='confirmed',
   closedAt:base.closedAt||'',closedDays:ctx.closure?{[ctx.dmy]:ctx.closure.closedAt}:{},
   workOrder:[...new Set([...(base.workOrder||[]),...types])],
   workers:ctx.assignments.map((a,i)=>rosterRow(ctx,a,previous.get(a.id),i)),
   novaServiceId:ctx.service.id,novaDate:ctx.map.date};
 }
 async function current(db,ctx){
  const stored=await db.get(snapKey(ctx.code));
  const next=build(ctx,stored);
  const comparable=v=>JSON.stringify({...v,_syncRevision:0,_syncSequence:0});
  if(!stored||comparable(stored)!==comparable(next)){
   next._syncRevision=uid();next._syncSequence=Number(stored?._syncSequence||0)+1;
   await db.put(snapKey(ctx.code),next);
  }else{next._syncRevision=stored._syncRevision;next._syncSequence=stored._syncSequence;}
  return next;
 }
 async function get(db,actor,code){const ctx=await context(db,actor,code);return {service:await current(db,ctx)};}

 function versionsValid(before,after){
  const old=new Map((before.workers||[]).map(w=>[String(w.id),w]));
  for(const w of after.workers){
   const p=old.get(String(w.id));if(!p)continue;
   for(const field of ['status','arrivalAt']){
    const pv=Number(p._fieldTimes?.[field]||0),nv=Number(w._fieldTimes?.[field]||0),changed=w[field]!==p[field];
    if(!Number.isSafeInteger(nv)||nv!==pv+Number(changed))return false;
   }
  }
  return true;
 }

 async function put(db,actor,code,input){
  const ctx=await context(db,actor,code);
  const prev=await current(db,ctx);
  if(String(input?.revision||'')!==String(prev._syncRevision||''))fail('Otro dispositivo ha modificado este servicio. Actualiza para sincronizar antes de guardar.',409);
  const snap=input?.service;
  if(!snap||typeof snap!=='object'||Array.isArray(snap)||!Array.isArray(snap.workers))fail('Instantánea de servicio no válida',422);
  if(new TextEncoder().encode(JSON.stringify(snap)).byteLength>1900000)fail('El servicio supera el tamaño máximo que se puede guardar',413);
  if(prev.closed)fail('El servicio está cerrado por Gestoría.',409);
  if(ctx.closure)fail('Este día ya está cerrado. Solo Gestoría puede reabrirlo.',409);
  if(snap.closed)fail('El cierre del servicio completo corresponde a Gestoría. Usa «Cerrar el día actual».',403);
  const ids=new Set(snap.workers.map(w=>String(w.id||'')));
  if(ids.size!==snap.workers.length)fail('ID de trabajador vacío o duplicado. Guardado bloqueado para proteger los fichajes.',422);
  const prevIds=new Set(prev.workers.map(w=>w.id));
  if([...ids].some(id=>!prevIds.has(id)))fail('Solo Gestoría puede añadir personal al servicio.',403);
  if([...prevIds].some(id=>!ids.has(id)))fail('Solo Gestoría puede retirar personal del servicio.',403);
  if(!versionsValid(prev,snap))fail('El servicio contiene fichajes de una versión anterior. Recarga el servicio antes de volver a guardar.',422);

  const prevById=new Map(prev.workers.map(w=>[w.id,w])),stamp=now(),date=ctx.map.date;
  const teams=new Map((snap.teams||[]).map(t=>[String(t.id),t]));
  const others=(await rows(db,'assignments')).filter(x=>!x.archived);
  for(const w of snap.workers){
   const p=prevById.get(w.id),a0=ctx.assignments.find(x=>x.id===w.id);if(!a0)continue;
   const a={...a0};let changed=false;const events=[];
   // Schedule: the Crew Head may adjust planned start and end on the same service day.
   if(w.inicio!==p.inicio||w.fin!==p.fin){
    if(a.checkOut)fail('No se modifica el horario de un turno ya finalizado ('+p.personal+').',409);
    if(!validHM(w.inicio)||!validHM(w.fin))fail('Horario incorrecto para '+p.personal+'.');
    const sameDay=(a.endDate||a.date)===a.date||((a.endDate||a.date)===addDays(a.date,1)&&a.end<=a.start);
    const startDate=a.date,endDate=sameDay?(w.fin<=w.inicio?addDays(a.date,1):a.date):(a.endDate||a.date);
    const span=(Date.parse(endDate+'T'+w.fin+':00Z')-Date.parse(startDate+'T'+w.inicio+':00Z'))/3600000;
    if(span<=0||span>48)fail('Horario incorrecto para '+p.personal+'.');
    for(const o of others)if(o.workerId===a.workerId&&o.id!==a.id&&startDate+'T'+w.inicio<(o.endDate||o.date)+'T'+o.end&&endDate+'T'+w.fin>o.date+'T'+o.start)fail(p.personal+' ya tiene otro turno en ese horario.',409);
    const hours=money(span-Number(a.pause||0));if(hours<=0)fail('La pausa supera la duración del turno de '+p.personal+'.');
    Object.assign(a,{start:w.inicio,end:w.fin,endDate,hours});changed=true;events.push('shift');
   }
   // Real schedule (Crew Head): actual start/end and pause become the worker's real hours in NOVA.
   if(['actualStart','actualEnd','actualPause'].some(f=>String(w[f]??'')!==String(p[f]??''))){
    let actual=null;
    if(validHM(w.actualStart)&&validHM(w.actualEnd)){
     const toMin=v=>Number(v.slice(0,2))*60+Number(v.slice(3,5));
     let span=toMin(w.actualEnd)-toMin(w.actualStart);if(span<=0)span+=1440;
     const pause=validHM(w.actualPause)?toMin(w.actualPause):0;
     actual=money(Math.max(0,span-pause)/60);
    }
    if(actual!==(a.actualHours??null)){
     const minimum=Number(a.minimumHours||0),workerHours=a.noShow?0:Math.max(minimum,actual??Number(a.hours||0));
     Object.assign(a,{actualHours:actual,workerHours,workerUnits:a.rateUnit==='day'?(a.noShow?0:1):workerHours});
     changed=true;events.push('shift');
    }
   }
   // Attendance in Crew Control becomes NOVA check-in and check-out.
   const present=w.status==='PRESENTE'&&validHM(w.arrivalAt);
   if(present&&!a.checkOut&&(!a.checkIn||localHM(a.checkIn)!==w.arrivalAt)){a.checkIn=localISO(date,w.arrivalAt);if(a.status==='pending')a.status='confirmed';changed=true;events.push('in');}
   if(!present&&a.checkIn&&!a.checkOut){a.checkIn='';changed=true;events.push('undo-in');}
   if(a.checkIn&&validHM(w.actualEnd)&&w.actualEnd!==p.actualEnd){
    const reference=validHM(w.actualStart)?w.actualStart:(a.start||localHM(a.checkIn)),endDay=w.actualEnd<=reference?addDays(date,1):date;
    a.checkOut=localISO(endDay,w.actualEnd);changed=true;events.push('out');
   }
   if(!w.actualEnd&&p.actualEnd&&a.checkOut){a.checkOut='';changed=true;events.push('undo-out');}
   if(w.status==='CONTACTADO'&&!a.contacted){a.contacted=true;changed=true;}
   const team=teams.get(String(w.teamId||''));
   const teamName=team?text(team.name,100):'';
   if(teamName!==(a.team||'')&&String(w.teamId||'')!==String(p.teamId||'')){a.team=teamName;a.vestColor=team&&!team.noVest?text(team.colorName||'',30):'';changed=true;}
   const diet=w.actualDiet===''||w.actualDiet==null?null:Math.max(0,Math.min(3,Math.round(Number(w.actualDiet))));
   if(diet!=null&&Number.isFinite(diet)&&diet!==Number(a.dietCount||0)&&String(w.actualDiet)!==String(p.actualDiet)){a.dietCount=diet;changed=true;}
   const ratings=[w.ratingPuntualidad,w.ratingUniformidad,w.ratingActitud].map(Number).filter(n=>n>0&&n<=5);
   const rating=ratings.length?Math.round(ratings.reduce((n,x)=>n+x,0)/ratings.length):0;
   if(JSON.stringify([w.ratingPuntualidad,w.ratingUniformidad,w.ratingActitud])!==JSON.stringify([p.ratingPuntualidad,p.ratingUniformidad,p.ratingActitud])){const n=v=>{const x=Number(v);return x>0&&x<=5?Math.round(x):0;};const r3=[n(w.ratingPuntualidad),n(w.ratingUniformidad),n(w.ratingActitud)];if(rating!==Number(a.rating||0)||r3.join()!==[a.ratingPuntualidad||0,a.ratingUniformidad||0,a.ratingActitud||0].join()){a.rating=rating;a.ratingPuntualidad=r3[0];a.ratingUniformidad=r3[1];a.ratingActitud=r3[2];changed=true;}}
   if(changed){
    a.revision=Number(a0.revision||0)+1;a.updatedAt=stamp;await db.put(key('assignments',a.id),a);
    for(const event of events){
     if(event==='shift'){await audit(db,actor,'crew-control-shift','assignments',a.id);continue;}
     const id=uid();await db.put('office/crewAttendanceAudit/'+id,{id,assignmentId:a.id,actorId:actor.id,reason:'Crew Control (Crew Head)',event,before:{checkIn:a0.checkIn,checkOut:a0.checkOut},after:{checkIn:a.checkIn,checkOut:a.checkOut},createdAt:stamp});
     await audit(db,actor,'crew-attendance-'+event,'assignments',a.id);
    }
   }
  }
  // New incidents reach Gestoría; a category change is only a request there.
  const known=new Set((prev.incidents||[]).map(i=>String(i.id)));
  const catalog=await tariffCatalog(db);
  const incidents=[];
  for(const incident of Array.isArray(snap.incidents)?snap.incidents:[]){
   if(known.has(String(incident.id))||incident.novaIncidentId){incidents.push(incident);continue;}
   const target=incident.workerId?ctx.assignments.find(x=>x.id===String(incident.workerId)):null;
   const type=INCIDENT_TYPE[norm(incident.category)]||'general';
   const value={id:uid(),serviceId:ctx.service.id,workerId:target?.workerId||'',type,severity:SEVERITY[norm(incident.severity)]||'medium',measure:text(incident.actionTaken,1000),assignmentId:'',requestedCategoryId:'',requestedCategory:'',currentCategory:'',
    description:(text(incident.description,1900)||'Incidencia')+(incident.trabajo&&incident.trabajo!=='GENERAL'?' · '+text(incident.trabajo,100):''),status:'open',createdAt:now(),createdBy:actor.id,source:'crew-control',revision:1};
   if(type==='category_change'){
    if(!target)fail('Selecciona el trabajador para solicitar el cambio de categoría.');
    const wanted=norm(incident.newCategory);
    const tariff=catalog.filter(t=>t.active!==false).sort((x,y)=>Number((y.schedule||'Tarifa estándar 2026')===(ctx.service.tariffSchedule||'Tarifa estándar 2026'))-Number((x.schedule||'Tarifa estándar 2026')===(ctx.service.tariffSchedule||'Tarifa estándar 2026'))).find(t=>norm(t.name)===wanted||norm(t.id)===wanted);
    Object.assign(value,{assignmentId:target.id,requestedCategoryId:tariff?.id||'',requestedCategory:tariff?.name||text(incident.newCategory,100),currentCategory:target.role||target.categoryId||''});
   }
   await db.put(key('incidents',value.id),value);await audit(db,actor,'incident-report','incidents',value.id);
   incidents.push({...incident,novaIncidentId:value.id});
  }
  // «Cerrar el día actual» closes the NOVA day for Gestoría.
  const closingNow=Boolean(snap.closedDays?.[ctx.dmy]);
  let closure=null;
  if(closingNow){
   const refreshed=(await rows(db,'assignments')).filter(a=>a.serviceId===ctx.service.id&&!a.archived&&a.status!=='rejected'&&datesBetween(a.date,a.endDate||a.date).includes(date));
   const open=refreshed.filter(a=>a.checkIn&&!a.checkOut&&!a.noShow);
   if(open.length)fail('Indica el fin real de '+open.length+' trabajador(es) presentes antes de cerrar el día.',422);
   closure={id:ctx.service.id+'_'+date,serviceId:ctx.service.id,date,closedBy:actor.id,closedByName:actor.name,closedAt:stamp,notes:'Cerrado desde Crew Control',summary:{assigned:refreshed.length,attended:refreshed.filter(a=>a.checkIn).length,absent:refreshed.filter(a=>!a.checkIn).length},revision:1};
   await db.put(key('crewDayClosures',closure.id),closure);await audit(db,actor,'crew-day-close','services',ctx.service.id);
  }
  // Store the operational layer, then rebuild the roster from NOVA.
  const ctx2=await context(db,actor,code);
  const merged={...snap,incidents,closed:false,closedDays:{}};
  merged.workers=snap.workers.map(w=>{const p=prevById.get(w.id),out={...w};for(const field of IDENTITY)out[field]=p[field];return out;});
  const next=build(ctx2,merged);
  next._syncRevision=uid();next._syncSequence=Number(prev._syncSequence||0)+1;
  await db.put(snapKey(code),next);
  return {service:next,revision:next._syncRevision};
 }
 return {open,get,put};
}
