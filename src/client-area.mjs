/* v59 · Área de cliente de NOVA Crew.
   El cliente solo ve SUS datos: peticiones, presupuestos emitidos, servicios (sin nombres de trabajadores
   salvo que la gestoría lo active), facturas emitidas y sus datos fiscales. Nunca ve costes internos. */

export function createClientArea(h){
 const {serviceFromQuote,rows,key,record,fail,uid,now,text,money,audit,saveEntity,tariffCatalog,settings,date,time,number,required,revision,onCallPhone}=h;

 const STATUS_OPEN=['pending','in_review'];
 const clientOf=async(db,actor)=>{const c=await record(db,'clients',actor.clientId);if(c.archived||c.active===false)fail('La cuenta de cliente está desactivada.',403);return c;};
 const span=(d,last,from,to)=>(Date.parse(last+'T'+to+':00Z')-Date.parse(d+'T'+from+':00Z'))/3600000;
 const overnightEnd=(d,from,to)=>to<=from?new Date(Date.parse(d+'T12:00:00Z')+86400000).toISOString().slice(0,10):d;

 async function rateCard(db,client){
  const schedule=client.tariffSchedule||'Tarifa estándar 2026';
  const all=(await tariffCatalog(db)).filter(t=>t.active&&t.clientRate!=null);
  let list=all.filter(t=>(t.schedule||'Tarifa estándar 2026')===schedule);if(!list.length)list=all.filter(t=>(t.schedule||'Tarifa estándar 2026')==='Tarifa estándar 2026');
  return list.map(t=>({id:t.id,name:t.name,group:t.group||'',unit:t.unit||'hour',minHours:t.minHours||0,price:money(t.clientRate*(1+(t.incrementPercent||0)/100))})).sort((a,b)=>(a.group+a.name).localeCompare(b.group+b.name));
 }
 function estimateLine(l,card){const t=card.find(x=>x.id===l.categoryId);if(!t)return null;const hrs=span(l.date,l.endDate||overnightEnd(l.date,l.start,l.end),l.start,l.end)-(l.pause||0);const billable=t.unit==='day'?1:Math.max(hrs,t.minHours);return {billable:money(billable),price:t.price,net:money(billable*t.price*l.quantity)};}

 async function view(db,actor){
  const client=await clientOf(db,actor),cfg=await settings(db),card=await rateCard(db,client),vat=Number(cfg.vat??21);
  const requests=(await rows(db,'clientRequests')).filter(r=>r.clientId===client.id&&!r.archived).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const quotes=(await rows(db,'quotes')).filter(q=>q.clientId===client.id&&!q.archived&&q.status!=='draft').map(q=>({contactName:q.contactName||'',contactPhone:q.contactPhone||'',id:q.id,ref:q.ref||'',number:q.number,status:q.status,date:q.date,dueDate:q.dueDate,serviceName:q.serviceName||'',serviceVenue:q.serviceVenue||'',serviceId:q.serviceId||'',lines:q.lines,net:q.net,tax:q.tax,total:q.total,notes:q.notes||'',issuer:q.issuer||null,customer:q.customer||null,respondedAt:q.clientRespondedAt||'',clientComment:q.clientComment||'',revision:q.revision,
   staffPlan:(q.staffPlan||[]).map(x=>({quantity:x.quantity,role:x.role,serviceType:x.serviceType,date:x.date,endDate:x.endDate,start:x.start,end:x.end,pause:x.pause,locationName:x.locationName||''}))})).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const invoices=(await rows(db,'invoices')).filter(i=>i.clientId===client.id&&!i.archived&&i.status!=='draft').map(i=>({id:i.id,number:i.number,status:i.status,date:i.date,dueDate:i.dueDate,serviceId:i.serviceId||'',lines:i.lines,net:i.net,tax:i.tax,total:i.total,paid:i.paid||0,notes:i.notes||'',issuer:i.issuer||null,customer:i.customer||null})).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const svcs=(await rows(db,'services')).filter(s=>s.clientId===client.id&&!s.archived);
  const ids=new Set(svcs.map(s=>s.id));
  const lines=(await rows(db,'orderLines')).filter(l=>ids.has(l.serviceId)&&!l.archived&&l.status!=='cancelled');
  const blocks=(await rows(db,'serviceBlocks')).filter(b=>ids.has(b.serviceId)&&!b.archived);
  const asg=(await rows(db,'assignments')).filter(a=>ids.has(a.serviceId)&&!a.archived&&a.status!=='rejected');
  const workers=new Map((await rows(db,'workers')).map(w=>[w.id,w]));
  const services=svcs.map(s=>{
   const pos=lines.filter(l=>l.serviceId===s.id).map(l=>{const a=asg.find(x=>x.orderLineId===l.id);const bk=blocks.find(b=>b.id===l.blockId);
    return {id:l.id,categoryId:l.categoryId||'',date:l.date,endDate:l.endDate,start:l.start,end:l.end,pause:l.pause||0,role:l.role,serviceType:bk?.serviceType||l.serviceType||'',team:bk?.team||'',location:bk?.locationName||'',covered:!!a,present:!!a?.checkIn,worker:s.showWorkerNames&&a?(workers.get(a.workerId)?.name||''):''};})
    .sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
   return {id:s.id,ref:s.ref||'',name:s.name,venue:s.venue||'',date:s.date,endDate:s.endDate||s.date,status:s.status,showWorkerNames:!!s.showWorkerNames,positions:pos,quoteId:s.quoteId||''};
  }).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const {passwordHash,salt,iterations,...user}=actor;
  /* El cliente nunca ve la tarifa aplicada: solo nombres de perfil, sin precios. Los importes llegan en el presupuesto emitido. */
  const categories=card.map(({price,minHours,...c})=>c);
  return {ok:true,user,client:{...client},company:{name:cfg.name,phone:cfg.phone,email:cfg.email,address:cfg.address,iban:cfg.iban||''},onCall:cfg.emergencyPhone||onCallPhone,vat,categories,requests,quotes,services,invoices};
 }

 function cleanLines(input){
  if(!Array.isArray(input)||!input.length)fail('Añade al menos una línea de personal.');if(input.length>60)fail('Máximo 60 líneas por petición.');
  return input.map(l=>{const quantity=number(l.quantity??1,1,200);if(!Number.isInteger(quantity))fail('Número de personas no válido.');const d=date(l.date),from=time(l.start),to=time(l.end);
   return {categoryId:required(l.categoryId,'la categoría'),quantity,date:d,start:from,end:to,endDate:overnightEnd(d,from,to),pause:number(l.pause??0,0,8),serviceType:text(l.serviceType,80)||'',notes:text(l.notes,300)};});
 }

 async function op(db,actor,name,b){
  const client=await clientOf(db,actor);
  if(name==='client-profile'){
   const r=b.record||{};revision(client,r);
   const fiscal={legalName:text(r.legalName,200),taxId:text(r.taxId,40).toUpperCase(),street:text(r.street,250),postalCode:text(r.postalCode,12),city:text(r.city,80),province:text(r.province,80),country:text(r.country,80)||'España',email:text(r.email,200),billingEmail:text(r.billingEmail,200),phone:text(r.phone,40),contact:text(r.contact,120)};
   if(!fiscal.legalName)fail('Falta la razón social.');if(!fiscal.taxId)fail('Falta el NIF/CIF.');if(!fiscal.street||!fiscal.postalCode||!fiscal.city)fail('Completa la dirección fiscal (calle, CP y población).');
   const address=[fiscal.street,[fiscal.postalCode,fiscal.city].filter(Boolean).join(' '),fiscal.province&&fiscal.province!==fiscal.city?fiscal.province:'',fiscal.country&&fiscal.country!=='España'?fiscal.country:''].filter(Boolean).join(', ');
   const value={...client,...fiscal,name:fiscal.legalName,address,revision:client.revision+1,updatedAt:now(),updatedByClient:now()};
   await db.put(key('clients',client.id),value);await audit(db,actor,'client-profile','clients',client.id,'Datos fiscales actualizados por el cliente');return {record:value};
  }
  if(name==='client-request-save'){
   const r=b.record||{},old=r.id?await record(db,'clientRequests',r.id):null;
   if(old&&(old.clientId!==client.id||old.archived))fail('Petición no encontrada.',404);
   if(old&&!STATUS_OPEN.includes(old.status))fail('Esta petición ya está gestionada. Pide el cambio sobre el presupuesto o el servicio.',409);
   if(old)revision(old,r);
   const ls=cleanLines(r.lines),card=await rateCard(db,client);for(const l of ls){const t=card.find(x=>x.id===l.categoryId);if(!t)fail('Categoría no disponible.');l.role=t.name;}
   const dates=ls.map(l=>l.date).sort();
   const value={...(old||{}),id:old?.id||uid(),clientId:client.id,type:'quote',status:'pending',title:required(r.title,'el nombre del evento').slice(0,200),venue:text(r.venue,200),address:text(r.address,400),venueLat:Number.isFinite(Number(r.venueLat))&&r.venueLat!==''&&r.venueLat!==null?Number(r.venueLat):null,venueLng:Number.isFinite(Number(r.venueLng))&&r.venueLng!==''&&r.venueLng!==null?Number(r.venueLng):null,contactName:required(r.contactName,'la persona de contacto').slice(0,120),contactPhone:required(r.contactPhone,'el teléfono de contacto').slice(0,40),contactOnSite:text(r.contactOnSite,200),notes:text(r.notes,3000),lines:ls,dateFrom:dates[0],dateTo:ls.map(l=>l.endDate).sort().slice(-1)[0],
    createdAt:old?.createdAt||now(),createdBy:old?.createdBy||actor.id,updatedAt:now(),revision:(old?.revision||0)+1,changedByClient:!!old};
   await db.put(key('clientRequests',value.id),value);await audit(db,actor,old?'client-request-update':'client-request','clientRequests',value.id,value.title);return {record:value};
  }
  if(name==='client-request-cancel'){
   const r=await record(db,'clientRequests',required(b.id,'la petición'));if(r.clientId!==client.id)fail('Petición no encontrada.',404);revision(r,b);
   if(!STATUS_OPEN.includes(r.status))fail('Esta petición ya está gestionada.',409);
   const value={...r,status:'cancelled',updatedAt:now(),revision:r.revision+1};await db.put(key('clientRequests',r.id),value);await audit(db,actor,'client-request-cancel','clientRequests',r.id);return {record:value};
  }
  if(name==='client-service-request'){
   /* Cambios en un servicio ya confirmado, o pedir los nombres del personal. Llegan a la gestoría como petición. */
   const s=await record(db,'services',required(b.serviceId,'el servicio'));if(s.clientId!==client.id||s.archived)fail('Servicio no encontrado.',404);
   const type=b.type==='names'?'names':'change';const message=text(b.message,3000);
   let lines=[],before=[];
   if(type==='change'&&Array.isArray(b.lines)){lines=cleanLines(b.lines);const card=await rateCard(db,client);for(const l of lines){const t=card.find(x=>x.id===l.categoryId);if(!t)fail('Categoría no disponible.');l.role=t.name;}
    const cur=(await rows(db,'orderLines')).filter(l=>l.serviceId===s.id&&!l.archived&&l.status!=='cancelled');const m=new Map();for(const l of cur){const k=[l.date,l.start,l.end,l.categoryId,l.serviceType||'',Number(l.pause||0)].join('|');const x=m.get(k)||{categoryId:l.categoryId,role:l.role,date:l.date,start:l.start,end:l.end,pause:Number(l.pause||0),serviceType:l.serviceType||'',quantity:0};x.quantity++;m.set(k,x);}before=[...m.values()].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));}
   if(type==='change'&&!message&&!lines.length)fail('Describe el cambio que necesitas.');
   const value={id:uid(),clientId:client.id,type,status:'pending',serviceId:s.id,title:(type==='names'?'Nombres del personal · ':'Cambio de turnos · ')+s.name,notes:message||(type==='names'?'El cliente solicita conocer los nombres del personal asignado.':''),lines,before,createdAt:now(),createdBy:actor.id,revision:1};
   await db.put(key('clientRequests',value.id),value);await audit(db,actor,'client-'+type,'services',s.id,message.slice(0,200));return {record:value};
  }
  if(name==='client-quote-respond'){
   const q=await record(db,'quotes',required(b.id,'el presupuesto'));if(q.clientId!==client.id||q.archived)fail('Presupuesto no encontrado.',404);revision(q,b);
   if(q.status!=='issued')fail('Este presupuesto ya está respondido.',409);if(!['accepted','rejected'].includes(b.status))fail('Respuesta no válida.');
   const comment=text(b.comment,2000);const value={...q,status:b.status,clientRespondedAt:now(),clientRespondedBy:actor.name,clientComment:comment,revision:q.revision+1,updatedAt:now()};
   await db.put(key('quotes',q.id),value);
   /* v61 · Al aceptar: se crea el servicio con sus puestos desde el presupuesto y la petición sale de «Por atender». */
   let service=null;
   if(b.status==='accepted'&&!q.serviceId&&(q.staffPlan||[]).length){
    const rq=q.requestId?await db.get(key('clientRequests',q.requestId)):null;
    const notes=[q.contactName?'Contacto del cliente: '+q.contactName+(q.contactPhone?' · '+q.contactPhone:''):'',rq?.notes||''].filter(Boolean).join('\n');
    const res=await serviceFromQuote(db,{...actor,role:'manager',name:'Área Clientes · '+client.name},{quoteId:q.id,service:{notes}});service=res.record;
    const sv=await db.get(key('services',service.id));await db.put(key('services',service.id),{...sv,fromClientArea:true,contactName:q.contactName||'',contactPhone:q.contactPhone||''});
   }
   const note={id:uid(),clientId:client.id,type:'quote-response',status:service?'done':'pending',serviceId:service?.id||'',managerNote:service?'Servicio creado automáticamente en Servicios: falta asignar el personal.':'',quoteId:q.id,title:(b.status==='accepted'?'Presupuesto ACEPTADO · ':'Presupuesto rechazado · ')+(q.ref||q.number||'')+(q.serviceName?' · '+q.serviceName:''),notes:comment,lines:[],createdAt:now(),createdBy:actor.id,revision:1};
   await db.put(key('clientRequests',note.id),note);
   for(const r of (await rows(db,'clientRequests')).filter(r=>r.quoteId===q.id&&r.type==='quote'&&r.status==='quoted'))await db.put(key('clientRequests',r.id),{...r,status:b.status==='accepted'?'accepted':'rejected',updatedAt:now(),revision:r.revision+1});
   await audit(db,actor,'quote-status','quotes',q.id,(b.status==='accepted'?'Aceptado':'Rechazado')+' por el cliente desde su área');return {record:value};
  }
  fail('Operación no disponible en el área de cliente.',403);
 }
 return {view,op,rateCard,estimateLine};
}
