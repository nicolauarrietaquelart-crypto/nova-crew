import test from 'node:test';
import assert from 'node:assert/strict';
import {createOfficeApi} from '../src/office.mjs';



const token='coordination-v25-setup-secret-long';
function database(){
 const data=new Map();let gate=Promise.resolve();
 const ops=m=>({get:async k=>structuredClone(m.get(k)),put:async(k,v)=>m.set(k,structuredClone(v)),delete:async k=>m.delete(k),
 list:async({prefix='',reverse=false,limit=1e9}={})=>new Map([...m].filter(([k])=>k.startsWith(prefix)).sort(([a],[b])=>reverse?b.localeCompare(a):a.localeCompare(b)).slice(0,limit).map(([k,v])=>[k,structuredClone(v)]))});
 return {...ops(data),transaction:fn=>{const prev=gate;let release;gate=new Promise(r=>release=r);return prev.then(async()=>{const copy=new Map(structuredClone([...data]));try{const result=await fn(ops(copy));data.clear();for(const [k,v] of copy)data.set(k,v);return result;}finally{release();}});}};
}
async function setup(){
 const db=database(),api=createOfficeApi(db,{NOVA_SETUP_TOKEN:token});
 const call=async(op,body,cookie='')=>{const r=await api(new Request('https://nova.test/api/office/'+op,{method:body?'POST':'GET',headers:{origin:'https://nova.test','content-type':'application/json',...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined}));const set=r.headers.get('set-cookie');return {status:r.status,body:await r.json().catch(()=>null),cookie:set?set.split(';')[0]:''};};
 const s=await call('setup',{setupToken:token,username:'gestor',name:'Nicolau',password:'gestor-password-123'});
 const g=s.cookie||(await call('login',{username:'gestor',password:'gestor-password-123'})).cookie;
 const save=async(kind,record)=>{const r=await call('save',{kind,record},g);assert.equal(r.status,200,JSON.stringify(r.body));return r.body.record;};
 await call('settings',{record:{name:'NOVA',taxId:'B1',address:'X',email:'a@b.c',invoicePrefix:'N',vat:21,paymentDays:30}},g);
 const client=await save('clients',{name:'Cliente'});
 const coordW=await save('workers',{name:'Coord',costRate:10,createAccess:false}),hand=await save('workers',{name:'Hand',costRate:10,createAccess:false});
 const d=new Date().toISOString().slice(0,10);
 const service=await save('services',{name:'Show',clientId:client.id,venue:'Palau',date:d,endDate:d,start:'08:00',end:'20:00',required:2});
 const cu=await call('user',{record:{name:'Coord',username:'coord',role:'worker',workerId:coordW.id,password:'coord-password-123'}},g);assert.equal(cu.status,200,JSON.stringify(cu.body));const coordUser=cu.body.record;
 await call('user',{record:{name:'Hand',username:'hand',role:'worker',workerId:hand.id,password:'hand-password-123'}},g);
 const svc=await save('services',{...service,coordinatorId:coordUser.id});
 const aHand=await save('assignments',{serviceId:svc.id,workerId:hand.id,role:'HAND B',date:d,endDate:d,start:'08:00',end:'16:00',costRate:9.3,chargeRate:18.6});
 const aCoord=await save('assignments',{serviceId:svc.id,workerId:coordW.id,role:'HAND B',date:d,endDate:d,start:'08:00',end:'16:00',costRate:9.3,chargeRate:18.6});
 const c=(await call('login',{username:'coord',password:'coord-password-123'})).cookie,h=(await call('login',{username:'hand',password:'hand-password-123'})).cookie;
 return {call,g,c,h,svc,aHand,aCoord,save};
}

test('the service coordinator clocks themself by geolocation; a plain worker cannot',async()=>{
 const f=await setup();
 assert.equal((await f.call('clock',{id:f.aHand.id,revision:f.aHand.revision,action:'in',mode:'geo',latitude:41,longitude:2},f.h)).status,403);
 assert.equal((await f.call('clock',{id:f.aHand.id,revision:f.aHand.revision,action:'in'},f.h)).status,403);
 assert.equal((await f.call('clock',{id:f.aCoord.id,revision:f.aCoord.revision,action:'in',mode:'geo'},f.c)).status,403,'location is required');
 const ok=await f.call('clock',{id:f.aCoord.id,revision:f.aCoord.revision,action:'in',mode:'geo',latitude:41.36,longitude:2.15},f.c);
 assert.equal(ok.status,200,JSON.stringify(ok.body));
 const st=(await f.call('state',null,f.c)).body;
 assert.ok(st.normalCoordinationServiceIds.includes(f.svc.id));
});

test('a coordinator edits schedule, real times, absence, diets and rating of their staff, with history',async()=>{
 const f=await setup();
 let r=await f.call('coord-update',{id:f.aHand.id,revision:f.aHand.revision,changes:{start:'09:00',end:'17:00',realIn:'09:05',dietCount:1,rating:4,contacted:true}},f.c);
 assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.record.start,'09:00');assert.equal(r.body.record.hours,8);assert.ok(r.body.record.checkIn);assert.equal(r.body.record.dietCount,1);
 r=await f.call('coord-update',{id:f.aHand.id,revision:r.body.record.revision,changes:{realOut:'17:05'}},f.c);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.ok(r.body.record.checkOut>r.body.record.checkIn);
 assert.equal((await f.call('coord-update',{id:f.aHand.id,revision:r.body.record.revision,changes:{absent:true}},f.c)).status,409,'absence needs no entry');
 assert.equal((await f.call('coord-update',{id:f.aHand.id,revision:r.body.record.revision,changes:{realIn:'10:00'}},f.h)).status,403,'plain workers cannot edit');
 const hist=await f.call('history',{kind:'services',id:f.svc.id},f.g);
 assert.equal(hist.status,200);
 const coordEntries=hist.body.entries.filter(e=>e.action==='coord-update');
 assert.equal(coordEntries.length,2);assert.equal(coordEntries[0].subject,'Hand');assert.match(coordEntries[1].detail,/horario 08:00–16:00 → 09:00–17:00/);
});

test('Gestoría marks who prepared the quote and who closed the service',async()=>{
 const f=await setup();
 const q=await f.save('quotes',{clientId:f.svc.clientId,serviceId:f.svc.id,date:f.svc.date,dueDate:f.svc.date,lines:[{description:'Personal',quantity:1,price:100,vat:21}]});
 const st=(await f.call('state',null,f.g)).body;const me=st.users.find(u=>u.role==='manager');
 assert.equal(q.preparedBy,me.id,'creator is the default author');
 const other=(await f.call('user',{record:{name:'Fran',username:'fran',role:'manager',password:'fran-password-123'}},f.g)).body.record;
 const r=await f.call('responsible-set',{kind:'quotes',id:q.id,revision:q.revision,userId:other.id},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.record.preparedByName,'Fran');
 const workerUser=st.users.find(u=>u.role==='worker');
 const svc=(await f.call('state',null,f.g)).body.services[0];
 assert.equal((await f.call('responsible-set',{kind:'services',id:svc.id,revision:svc.revision,userId:workerUser.id},f.g)).status,400);
 const s2=await f.call('responsible-set',{kind:'services',id:svc.id,revision:svc.revision,userId:other.id},f.g);
 assert.equal(s2.status,200);assert.equal(s2.body.record.closedBy,other.id);
 assert.equal((await f.call('responsible-set',{kind:'services',id:svc.id,revision:s2.body.record.revision,userId:other.id},f.c)).status,403);
 const h=await f.call('history',{kind:'quotes',id:q.id},f.g);
 assert.ok(h.body.entries.some(e=>e.action==='set-prepared-by'&&e.detail==='Fran'));
});

test('coordinator sets Crew Control statuses and bulk edits all or nothing',async()=>{
 const f=await setup();
 let r=await f.call('coord-update',{id:f.aHand.id,revision:f.aHand.revision,changes:{status:'contacted'}},f.c);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.record.contacted,true);assert.ok(!r.body.record.checkIn);
 const st=(await f.call('state',null,f.c)).body,rows=st.coordinatorRoster;
 assert.equal(rows.length,2);
 // all-or-nothing: Fin real without entry fails for both
 const fail=await f.call('coord-bulk',{items:rows.map(a=>({id:a.id,revision:a.revision})),changes:{realOut:'18:00'}},f.c);
 assert.equal(fail.status,409);
 const after=(await f.call('state',null,f.c)).body.coordinatorRoster;assert.deepEqual(after.map(a=>a.revision),rows.map(a=>a.revision));
 r=await f.call('coord-bulk',{items:rows.map(a=>({id:a.id,revision:a.revision})),changes:{status:'present'}},f.c);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.ok(r.body.records.every(a=>a.checkIn));
 r=await f.call('coord-bulk',{items:r.body.records.map(a=>({id:a.id,revision:a.revision})),changes:{realIn:'08:00',realOut:'16:30',actualPause:'00:30',dietCount:1,ratingUniformidad:5,ratingActitud:4,ratingPuntualidad:3}},f.c);
 assert.equal(r.status,200,JSON.stringify(r.body));
 for(const a of r.body.records){assert.equal(a.actualHours,8);assert.equal(a.rating,4);assert.equal(a.dietCount,1);}
 r=await f.call('coord-update',{id:r.body.records[0].id,revision:r.body.records[0].revision,changes:{status:'absent'}},f.c);
 assert.equal(r.status,200);assert.equal(r.body.record.noShow,true);assert.ok(!r.body.record.checkIn);
 assert.equal((await f.call('coord-bulk',{items:[{id:f.aHand.id,revision:99}],changes:{status:'present'}},f.h)).status,409);
 const h=await f.call('assignment-history',{id:f.aHand.id},f.c);assert.equal(h.status,200);assert.ok(h.body.entries.some(e=>e.action==='coord-bulk'));
 assert.equal((await f.call('assignment-history',{id:f.aHand.id},f.h)).status,403);
});

test('a coordinator closes their day: shifts are hidden as closed, frozen, and Gestoría can reopen',async()=>{
 const f=await setup();
 let r=await f.call('coord-update',{id:f.aHand.id,revision:f.aHand.revision,changes:{realIn:'08:00'}},f.c);assert.equal(r.status,200);
 const day=f.aHand.date;
 assert.equal((await f.call('coord-day-close',{serviceId:f.svc.id,date:day},f.c)).status,409,'open check-in blocks closing');
 r=await f.call('coord-update',{id:f.aHand.id,revision:r.body.record.revision,changes:{realOut:'16:00'}},f.c);assert.equal(r.status,200);
 assert.equal((await f.call('coord-day-close',{serviceId:f.svc.id,date:day},f.h)).status,403);
 const c=await f.call('coord-day-close',{serviceId:f.svc.id,date:day},f.c);assert.equal(c.status,200,JSON.stringify(c.body));
 const coordState=(await f.call('state',null,f.c)).body;assert.ok(coordState.coordinatorRoster.every(a=>a.closed));
 const handState=(await f.call('state',null,f.h)).body;assert.equal(handState.assignments[0].closed,true);
 assert.equal((await f.call('coord-update',{id:f.aHand.id,revision:r.body.record.revision,changes:{dietCount:1}},f.c)).status,409);
 const g=(await f.call('state',null,f.g)).body;assert.equal(g.coordClosures.length,1);
 assert.equal((await f.call('coord-day-reopen',{id:g.coordClosures[0].id},f.c)).status,403);
 assert.equal((await f.call('coord-day-reopen',{id:g.coordClosures[0].id},f.g)).status,200);
 assert.equal((await f.call('state',null,f.h)).body.assignments[0].closed,false);
 assert.equal((await f.call('coord-update',{id:f.aHand.id,revision:r.body.record.revision,changes:{dietCount:1}},f.c)).status,200);
});

test('v28: weekly morning/afternoon availability, contracts, on-call, draft quotes and shared tariff categories',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand'),me=st.users.find(u=>u.role==='manager');
 // weekly availability: only the worker sets it (morning 08–16, afternoon 16–24, night 00–08)
 let r=await f.call('availability-weekly',{workerId:hand.id,days:{mon:{morning:true}}},f.g);assert.equal(r.status,403);
 r=await f.call('availability-weekly',{days:{mon:{morning:true,afternoon:false},sat:{morning:true,afternoon:true},sun:{night:true},fri:{morning:false,afternoon:true}}},f.h);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.deepEqual(r.body.record.days.mon.slots,[8,9,10,11,12,13,14,15]);assert.equal(r.body.record.days.sat.end,'24:00');assert.equal(r.body.record.days.tue.available,false);
 assert.deepEqual(r.body.record.days.sun.slots,[0,1,2,3,4,5,6,7]);assert.equal(r.body.record.days.sun.night,true);assert.equal(r.body.record.days.fri.afternoon,true);
 // contract with period
 const pdf=Buffer.from('%PDF-1.4 contrato').toString('base64');
 r=await f.call('document-upload',{workerId:hand.id,type:'contract',contractKind:'Fijo discontinuo',periodStart:'2026-01-01',periodEnd:'2026-12-31',name:'contrato.pdf',content:pdf},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.record.contractKind,'Fijo discontinuo');
 assert.equal((await f.call('document-upload',{workerId:hand.id,type:'contract',periodStart:'2026-05-01',periodEnd:'2026-01-01',name:'c.pdf',content:pdf},f.g)).status,400);
 const hs=(await f.call('state',null,f.h)).body;assert.ok(hs.documents.some(d=>d.periodEnd==='2026-12-31'));
 // on-call
 const today=new Date().toISOString().slice(0,10);
 r=await f.call('oncall-set',{from:today,to:today,userId:me.id,phone:'600111222'},f.g);assert.equal(r.status,200);assert.equal(r.body.records.length,1);
 {const hs=(await f.call('state',null,f.h)).body;assert.equal(hs.onCall.length,0,'workers do not see who is on call');assert.equal(hs.onCallPhone,'670 514 308');}
 assert.ok((await f.call('state',null,f.g)).body.onCall.some(o=>o.date===today&&o.phone==='600111222'));
 assert.equal((await f.call('oncall-set',{from:today,userId:st.users.find(u=>u.role==='worker').id},f.g)).status,400);
 r=await f.call('oncall-set',{from:today,userId:''},f.g);assert.equal((await f.call('state',null,f.g)).body.onCall.length,0);
 // draft quote can create a service
 const q=await f.save('quotes',{clientId:f.svc.clientId,date:today,dueDate:today,lines:[{description:'Personal',quantity:1,price:100,vat:21}]});
 r=await f.call('service-create',{quoteId:q.id,service:{name:'Desde borrador',clientId:f.svc.clientId,venue:'Palau',date:today,endDate:today,start:'08:00',end:'18:00'},positions:[]},f.g);
 assert.notEqual(r.status,409,JSON.stringify(r.body));
 // shared category across schedules
 await f.call('tariff-schedule-create',{name:'Tarifa 2027',source:'Tarifa estándar 2026',increasePercent:5,applyTo:'both'},f.g);
 r=await f.call('tariff-category-create',{name:'Drone pilot',group:'Técnicos',unit:'hour',minHours:4,workerRate:20},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.ok(r.body.records.length>=2);
 r=await f.call('tariff-category-sync',{name:'Drone pilot',newName:'Piloto de dron',minHours:5},f.g);assert.equal(r.status,200);
 const tariffs=(await f.call('state',null,f.g)).body.tariffs.filter(t=>t.name==='PILOTO DE DRON');assert.ok(tariffs.length>=2&&tariffs.every(t=>t.minHours===5));
});

test('v28: address search returns places (OpenStreetMap by default) and only for Gestoría',async()=>{
 const f=await setup();const real=globalThis.fetch;let url='';
 globalThis.fetch=async u=>{url=String(u);return new Response(JSON.stringify([{name:'Palau Sant Jordi',lat:'41.3633',lon:'2.1525',display_name:'Palau Sant Jordi, Barcelona',address:{road:'Passeig Olímpic',house_number:'5',postcode:'08038',city:'Barcelona'}}]),{status:200,headers:{'content-type':'application/json'}});};
 try{
  const r=await f.call('geocode',{q:'Palau Sant Jordi'},f.g);
  assert.equal(r.status,200,JSON.stringify(r.body));assert.match(url,/nominatim/);
  assert.equal(r.body.results[0].name,'Palau Sant Jordi');assert.equal(r.body.results[0].address,'Passeig Olímpic 5, 08038, Barcelona');assert.equal(r.body.results[0].lat,41.3633);
  assert.equal((await f.call('geocode',{q:'Palau Sant Jordi'},f.c)).status,403);
  globalThis.fetch=async()=>{throw new Error('down')};
  assert.equal((await f.call('geocode',{q:'Palau Sant Jordi'},f.g)).status,503);
 }finally{globalThis.fetch=real;}
});

test('v29: open a slot to a group, workers answer, Gestoría decides; payment terms; manager-only activity by service',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand');
 await f.save('workers',{...hand,contractType:'fixed_discontinuous',categories:['HAND B'],createAccess:false});
 const svc2=await f.save('services',{...f.svc,id:undefined,revision:undefined,name:'Servicio oferta'});
 const blk=await f.call('service-block-save',{record:{serviceId:svc2.id,serviceType:'LOAD IN',date:f.svc.date,endDate:f.svc.date,start:'18:00',end:'22:00',team:'Principal'},categories:[{categoryId:'HAND B',quantity:1}]},f.g);
 assert.equal(blk.status,200,JSON.stringify(blk.body));const line=blk.body.positions[0];
 let r=await f.call('offer-create',{orderLineId:line.id,audience:'fixed',message:'¿Quién puede?'},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));assert.deepEqual(r.body.record.targets,[hand.id]);const offerId=r.body.record.id;
 const hs=(await f.call('state',null,f.h)).body;assert.equal(hs.offers.length,1);assert.equal(hs.offers[0].info.category,'HAND B');
 assert.equal((await f.call('state',null,f.c)).body.offers.length,0,'eventual coordinator is not in the fixed group');
 assert.equal((await f.call('offer-respond',{id:offerId,answer:'yes'},f.c)).status,403);
 r=await f.call('offer-respond',{id:offerId,answer:'yes'},f.h);assert.equal(r.status,200);
 const go=(await f.call('state',null,f.g)).body.offers.find(o=>o.id===offerId);assert.equal(go.responses[hand.id].answer,'yes');
 assert.equal((await f.call('state',null,f.h)).body.assignments.filter(a=>a.orderLineId===line.id).length,0,'answering does not assign');
 const a=await f.save('assignments',{serviceId:svc2.id,orderLineId:line.id,workerId:hand.id,categoryId:line.categoryId,date:line.date,endDate:line.endDate,start:line.start,end:line.end});
 assert.ok(a.id);assert.equal((await f.call('state',null,f.g)).body.offers.find(o=>o.id===offerId).status,'filled');
 assert.equal((await f.call('offer-respond',{id:offerId,answer:'yes'},f.h)).status,409);
 // payment terms
 const bad=await f.call('save',{kind:'clients',record:{name:'Cliente 45',paymentDays:45}},f.g);assert.equal(bad.status,400);
 assert.equal((await f.call('save',{kind:'clients',record:{name:'Cliente 60',paymentDays:60}},f.g)).status,200);
 // activity
 const act=await f.call('activity-by-service',{},f.g);assert.equal(act.status,200);
 const g=act.body.groups.find(x=>x.service.id===f.svc.id);assert.ok(g.count>0);assert.ok(g.entries.every(e=>e.name==='Nicolau'));
 assert.ok(!g.entries.some(e=>e.action.startsWith('offer-yes')),'worker actions are excluded');
 assert.equal((await f.call('activity-by-service',{},f.c)).status,403);
});

test('v30: delete individual position lines; blocked when there are clock-ins',async()=>{
 const f=await setup();
 const blk=await f.call('service-block-save',{record:{serviceId:f.svc.id,serviceType:'LOAD OUT',date:f.svc.date,endDate:f.svc.date,start:'20:00',end:'23:00',team:'Principal'},categories:[{categoryId:'HAND B',quantity:3}]},f.g);
 const [l1,l2,l3]=blk.body.positions;const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand');
 assert.equal((await f.call('line-delete',{id:l1.id},f.g)).status,200);
 const a=await f.save('assignments',{serviceId:f.svc.id,orderLineId:l2.id,workerId:hand.id,categoryId:l2.categoryId,date:l2.date,endDate:l2.endDate,start:l2.start,end:l2.end});
 assert.equal((await f.call('line-delete',{id:l2.id},f.c)).status,403);
 assert.equal((await f.call('line-delete',{id:l2.id},f.g)).status,200);
 const s2=(await f.call('state',null,f.g)).body;
 assert.ok(s2.orderLines.filter(l=>l.id===l1.id||l.id===l2.id).every(l=>l.archived||l.status==='cancelled'));assert.ok(s2.assignments.filter(x=>x.id===a.id).every(x=>x.archived));
 const b2=await f.save('assignments',{serviceId:f.svc.id,orderLineId:l3.id,workerId:f.aCoord.workerId,categoryId:l3.categoryId,date:l3.date,endDate:l3.endDate,start:l3.start,end:l3.end});
 assert.equal((await f.call('coord-update',{id:b2.id,revision:b2.revision,changes:{realIn:'20:00'}},f.c)).status,200);
 assert.equal((await f.call('line-delete',{id:l3.id},f.g)).status,409);
});

test('v31: Crew Head by category gets Crew Control for the service day; block coordinator must be assigned and is shown to staff',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand'),coordW=st.workers.find(w=>w.name==='Coord');
 const coordUser=st.users.find(u=>u.workerId===coordW.id),handUser=st.users.find(u=>u.workerId===hand.id);
 const blk=(await f.call('service-block-save',{record:{serviceId:f.svc.id,serviceType:'MONTAJE',date:f.svc.date,endDate:f.svc.date,start:'18:00',end:'22:00',team:'Principal'},categories:[{categoryId:'HAND B',quantity:1}]},f.g)).body;
 const block=blk.record||st.serviceBlocks?.[0]||(await f.call('state',null,f.g)).body.serviceBlocks.find(b=>b.serviceType==='MONTAJE');
 const line=blk.positions[0];
 const other=(await f.call('save',{kind:'workers',record:{name:'Otro',costRate:10,createAccess:false}},f.g)).body.record;
 const otherUser=(await f.call('user',{record:{name:'Otro',username:'otro',role:'worker',workerId:other.id,password:'otro-password-123'}},f.g)).body.record;
 assert.equal((await f.call('block-coordinator-set',{blockId:block.id,userId:otherUser.id},f.g)).status,409,'not assigned to the service');
 const a=await f.save('assignments',{serviceId:f.svc.id,orderLineId:line.id,workerId:hand.id,categoryId:line.categoryId,date:line.date,endDate:line.endDate,start:line.start,end:line.end});
 let r=await f.call('block-coordinator-set',{blockId:block.id,userId:coordUser.id},f.g);assert.equal(r.status,200,JSON.stringify(r.body));
 const hs=(await f.call('state',null,f.h)).body.assignments.find(x=>x.id===a.id);assert.equal(hs.coordinator.name,'Coord');
 // Crew Head by category: assign "CREW HEAD" role to Otro on that day -> Crew Control for the whole service day
 await f.save('assignments',{serviceId:f.svc.id,workerId:other.id,role:'CREW HEAD',date:f.svc.date,endDate:f.svc.date,start:'07:00',end:'23:00',costRate:12,chargeRate:24});
 const oc=(await f.call('login',{username:'otro',password:'otro-password-123'})).cookie;
 const os=(await f.call('state',null,oc)).body;assert.ok(os.crewHeadDays.some(d=>d.serviceId===f.svc.id&&d.date===f.svc.date),JSON.stringify(os.crewHeadDays));
 assert.ok(os.coordinatorRoster.some(x=>x.id===a.id&&x.crew),'crew head sees the whole service');
 assert.equal((await f.call('crew-open',{serviceId:f.svc.id,date:f.svc.date},oc)).status,200);
 assert.equal((await f.call('block-coordinator-set',{blockId:block.id,userId:coordUser.id},f.c)).status,403);
});

test('v32: internal notes, sanctions and client vetoes are manager-only and block assignment; categories delete across tariffs',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand');
 const otherClient=(await f.call('save',{kind:'clients',record:{name:'Vetador SL',paymentDays:30}},f.g)).body.record;
 let r=await f.call('worker-admin',{id:hand.id,internalNotes:'Llega tarde a menudo',sanction:{active:true,until:'2099-01-01',reason:'Retrasos'},vetoedClients:[otherClient.id]},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal((await f.call('worker-admin',{id:hand.id,internalNotes:'x'},f.h)).status,403);
 const hs=(await f.call('state',null,f.h)).body.workers[0];assert.equal(hs.internalNotes,undefined);assert.equal(hs.sanction,undefined);assert.equal(hs.vetoedClients,undefined);
 const d=new Date().toISOString().slice(0,10);
 const svc2=(await f.call('save',{kind:'services',record:{name:'Otro',clientId:f.svc.clientId,venue:'X',date:d,endDate:d,start:'19:00',end:'21:00'}},f.g)).body.record;
 const blocked=await f.call('save',{kind:'assignments',record:{serviceId:svc2.id,workerId:hand.id,role:'HAND B',date:d,endDate:d,start:'19:00',end:'21:00',costRate:9.3,chargeRate:18.6}},f.g);
 assert.equal(blocked.status,409);assert.match(blocked.body.error,/bloqueado/);
 await f.call('worker-admin',{id:hand.id,sanction:{active:false}},f.g);
 const svc3=(await f.call('save',{kind:'services',record:{name:'Vetado',clientId:otherClient.id,venue:'X',date:d,endDate:d,start:'19:00',end:'21:00'}},f.g)).body.record;
 const veto=await f.call('save',{kind:'assignments',record:{serviceId:svc3.id,workerId:hand.id,role:'HAND B',date:d,endDate:d,start:'19:00',end:'21:00',costRate:9.3,chargeRate:18.6}},f.g);
 assert.equal(veto.status,409);assert.match(veto.body.error,/vetado/);
 assert.equal((await f.call('save',{kind:'assignments',record:{serviceId:svc2.id,workerId:hand.id,role:'HAND B',date:d,endDate:d,start:'19:00',end:'21:00',costRate:9.3,chargeRate:18.6}},f.g)).status,200);
 // categories: uppercase and delete everywhere
 r=await f.call('tariff-category-create',{name:'Drone pilot',group:'Técnicos',workerRate:20},f.g);assert.equal(r.status,200);assert.equal(r.body.records[0].name,'DRONE PILOT');
 r=await f.call('tariff-category-delete',{name:'DRONE PILOT'},f.g);assert.equal(r.status,200);
 assert.ok(!(await f.call('state',null,f.g)).body.tariffs.some(t=>t.name==='DRONE PILOT'));
});

test('v33: realtime revision changes after every mutation and not after reads',async()=>{
 const f=await setup();
 const rev=async c=>(await f.call('rev',null,c)).body.rev;
 const r0=await rev(f.h);assert.equal(typeof r0,'number');
 await f.call('assignment-history',{id:f.aHand.id},f.g);
 assert.equal(await rev(f.h),r0,'reads do not bump the revision');
 const st=(await f.call('state',null,f.c)).body,cur=st.coordinatorRoster.find(a=>a.id===f.aHand.id);const r=await f.call('coord-update',{id:f.aHand.id,revision:cur.revision,changes:{status:'contacted'}},f.c);assert.equal(r.status,200,JSON.stringify(r.body));
 const r1=await rev(f.g);assert.ok(r1>r0,'the manager sees the coordinator change');
 assert.equal((await f.call('rev',null,'')).status,401);
});

test('v37: diets per tariff, line-update changes category/schedule/diets, negative tariff increment, OPERATIVO group',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body;
 assert.ok(st.tariffs.every(t=>t.group!=='Montaje'&&t.group!=='Operativo'),'Montaje and Operativo are merged');
 assert.ok(st.tariffs.some(t=>t.group==='OPERATIVO'));assert.ok(!st.tariffs.some(t=>t.name==='HAND / MONTADOR/A'),'HAND / MONTADOR/A removed');
 // diet rates: default 10 / 16.5 and editable per tariff
 let r=await f.call('diet-rate-set',{schedule:'Tarifa estándar 2026',clientRate:17},f.g);assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.record.workerRate,10);assert.equal(r.body.record.clientRate,17);
 // negative increment copies diets with discount
 r=await f.call('tariff-schedule-create',{name:'NAVIDAD -20',source:'Tarifa estándar 2026',increasePercent:-20,applyTo:'client'},f.g);assert.equal(r.status,200,JSON.stringify(r.body));
 const hb=(await f.call('state',null,f.g)).body.tariffs.find(t=>t.schedule==='NAVIDAD -20'&&t.id!=='x'&&t.clientRate);assert.ok(hb);
 assert.equal((await f.call('state',null,f.g)).body.dietRates.find(d=>d.schedule==='NAVIDAD -20').clientRate,13.6);
 // a line with diets: assignment inherits one diet and invoice gets a diet line
 const cat=st.tariffs.find(t=>t.id==='steelhand'),cat2=st.tariffs.find(t=>t.id==='climber');
 const line=(await f.call('save',{kind:'orderLines',record:{serviceId:f.svc.id,categoryId:cat.id,date:f.svc.date,start:'08:00',end:'14:00',diets:true}},f.g)).body.record;assert.equal(line.diets,true);
 const w=await f.save('workers',{name:'Dieta W',costRate:10,createAccess:false});
 const a=await f.save('assignments',{serviceId:f.svc.id,workerId:w.id,orderLineId:line.id,categoryId:cat.id});
 assert.equal(a.dietCount,1);assert.equal(a.dietWorkerRate,10);assert.equal(a.dietClientRate,17);
 r=await f.call('line-update',{id:line.id,categoryId:cat2.id,start:'09:00',end:'15:00',pause:0,diets:true,dietCount:2},f.g);assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.assignment.categoryId,cat2.id);assert.equal(r.body.assignment.start,'09:00');assert.equal(r.body.assignment.dietCount,2);assert.equal(r.body.assignment.costRate,cat2.workerRate);
 r=await f.call('invoice-from-service',{serviceId:f.svc.id},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));{const ls=r.body.record.lines,i=ls.findIndex(l=>l.sub&&/^Dietas/.test(l.description));assert.ok(i>0&&ls[i].quantity===2&&ls[i].price===17,JSON.stringify(ls));assert.match(ls[i-1].description,/· 09:00–15:00 · Sin pausa$/);assert.ok(!ls.some(l=>/Dieta W/.test(l.description)),'no worker names on the invoice');assert.equal(ls[i].unit,'diet');}
});

test('v40: offers skip people already in the service; mass offers need the category; urgent goes to everyone; HAND and STEELHAND open by default',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand');
 const svc=await f.save('services',{...f.svc,id:undefined,revision:undefined,name:'Servicio v40',date:'2027-02-10',endDate:'2027-02-10'});
 const shift=await f.save('assignments',{serviceId:svc.id,workerId:hand.id,role:'HAND B',date:svc.date,endDate:svc.date,start:'17:00',end:'23:00',costRate:9.3,chargeRate:18.6});
 const inSvc=new Set([hand.id]);
 const withAccess=new Set(st.users.filter(u=>u.active&&u.role==='worker'&&u.workerId).map(u=>u.workerId));
 const blk=await f.call('service-block-save',{record:{serviceId:svc.id,serviceType:'LOAD IN',date:svc.date,endDate:svc.date,start:'18:00',end:'22:00',team:'Principal'},categories:[{categoryId:'steelhand',quantity:1},{categoryId:'climber',quantity:1}]},f.g);
 assert.equal(blk.status,200,JSON.stringify(blk.body));const [steel,climb]=blk.body.positions;
 // urgent: everyone with access except people already in the service
 let r=await f.call('offer-create',{orderLineId:climb.id,audience:'category',urgent:true},f.g);assert.equal(r.status,200,JSON.stringify(r.body));
 const expected=st.workers.filter(w=>w.active!==false&&!w.archived&&withAccess.has(w.id)&&!inSvc.has(w.id)).map(w=>w.id).sort();
 assert.deepEqual(r.body.record.targets.slice().sort(),expected);assert.equal(r.body.record.audience,'all');
 assert.ok(!r.body.record.targets.some(id=>inSvc.has(id)));
 // non-urgent climber: nobody has it → refused
 assert.equal((await f.call('offer-create',{orderLineId:climb.id,audience:'all'},f.g)).status,409);
 // steelhand is open by default for everybody not in the service
 r=await f.call('offer-create',{orderLineId:steel.id,audience:'all'},f.g);assert.equal(r.status,200,JSON.stringify(r.body));assert.deepEqual(r.body.record.targets.slice().sort(),expected);
 // closing STEELHAND explicitly removes the default
 const other=st.workers.find(w=>expected.includes(w.id));
 await f.save('workers',{...other,categories:['HAND B'],createAccess:false});
 r=await f.call('offer-create',{orderLineId:steel.id,audience:'all'},f.g);assert.ok(r.status===409||!r.body.record.targets.includes(other.id),JSON.stringify(r.body));
});

test('v42: blocks have no schedule; each category row sets its own start/end (overnight included)',async()=>{
 const f=await setup();
 const r=await f.call('service-block-save',{record:{serviceId:f.svc.id,serviceType:'LOAD IN',date:'2027-03-01',team:'Principal'},categories:[{categoryId:'steelhand',quantity:2,start:'07:00',end:'15:00'},{categoryId:'HAND B',quantity:1,start:'22:00',end:'04:00',pause:0.5}]},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));const ps=r.body.positions;assert.equal(ps.length,3);
 assert.deepEqual(ps.filter(p=>p.categoryId==='steelhand').map(p=>p.start+'-'+p.end+'-'+p.endDate),['07:00-15:00-2027-03-01','07:00-15:00-2027-03-01']);
 const night=ps.find(p=>p.categoryId==='HAND B');assert.equal(night.start,'22:00');assert.equal(night.endDate,'2027-03-02');assert.equal(night.pause,0.5);
 const add=await f.call('service-block-add-positions',{blockId:r.body.record.id,categories:[{categoryId:'steelhand',quantity:1,start:'10:00',end:'12:00'}]},f.g);
 assert.equal(add.status,200,JSON.stringify(add.body));assert.equal(add.body.positions[0].start,'10:00');assert.equal(add.body.positions[0].end,'12:00');
});

test('v43: catering/pause/uniform/EPI/notes live on each service type and workers see them; service edit has only dates',async()=>{
 const f=await setup();
 const r=await f.call('service-block-save',{record:{serviceId:f.svc.id,serviceType:'SHOW CALL',date:f.svc.date,clientCatering:'true',hasPause:'true',uniform:'Ropa negra',notes:'Entrada puerta 5'},categories:[{categoryId:'steelhand',quantity:1,start:'01:00',end:'02:00'}]},f.g);
 assert.equal(r.status,200,JSON.stringify(r.body));const blk=r.body.record;
 assert.equal(blk.clientCatering,true);assert.equal(blk.uniform,'Ropa negra');assert.equal(blk.epi,'Guantes+Botas+Chaleco+Casco');
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand');
 const a=await f.save('assignments',{serviceId:f.svc.id,orderLineId:r.body.positions[0].id,workerId:hand.id,categoryId:'steelhand',date:f.svc.date,endDate:f.svc.date,start:'01:00',end:'02:00'});
 const mine=(await f.call('state',null,f.h)).body.assignments.find(x=>x.id===a.id);
 assert.deepEqual(mine.blockInfo,{serviceType:'SHOW CALL',clientCatering:true,hasPause:true,uniform:'Ropa negra',epi:'Guantes+Botas+Chaleco+Casco',notes:'Entrada puerta 5'});
 const svc=st.services.find(s=>s.id===f.svc.id);
 const e=await f.call('save',{kind:'services',record:{id:svc.id,revision:svc.revision,clientId:svc.clientId,name:'Renombrado',venue:svc.venue,date:svc.date,endDate:svc.endDate,tariffSchedule:svc.tariffSchedule}},f.g);
 assert.equal(e.status,200,JSON.stringify(e.body));assert.equal(e.body.record.name,'Renombrado');assert.equal(e.body.record.start,svc.start);assert.equal(e.body.record.status,svc.status);
});

test('v44: N/YYYY references shared by quotes and services, vehicles with clash-free bookings',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body;
 assert.ok(st.services.every(s=>/^\d+\/\d{4}$/.test(s.ref)),'existing services get a reference');
 const s1=await f.save('services',{...f.svc,id:undefined,revision:undefined,ref:undefined,name:'Nuevo A',date:'2027-01-10',endDate:'2027-01-10'});
 const s2=await f.save('services',{...f.svc,id:undefined,revision:undefined,ref:undefined,name:'Nuevo B',date:'2027-01-11',endDate:'2027-01-11'});
 assert.equal(s1.ref,'1/2027');assert.equal(s2.ref,'2/2027');
 let r=await f.call('vehicle-save',{record:{name:'Furgo 1',plate:'1234abc'}},f.g);assert.equal(r.status,200,JSON.stringify(r.body));const v=r.body.record;assert.equal(v.plate,'1234ABC');
 r=await f.call('vehicle-book',{record:{vehicleId:v.id,date:'2027-01-10',start:'08:00',end:'14:00',serviceId:s1.id}},f.g);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.record.serviceName,'1/2027 · Nuevo A');
 r=await f.call('vehicle-book',{record:{vehicleId:v.id,date:'2027-01-10',start:'13:00',end:'18:00',other:'Taller'}},f.g);assert.equal(r.status,409);
 r=await f.call('vehicle-book',{record:{vehicleId:v.id,date:'2027-01-10',start:'14:00',end:'18:00',serviceId:'other',other:'Taller'}},f.g);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.record.other,'Taller');
 const hs=(await f.call('state',null,f.h)).body;assert.equal(hs.vehicles,undefined,'workers do not see vehicles');
 const gs=(await f.call('state',null,f.g)).body;assert.equal(gs.vehicleBookings.length,2);
});

test('v45: runner assignments reserve a company vehicle under the runner name, external vehicles book nothing, clashes refused',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand');
 const svc=await f.save('services',{...f.svc,id:undefined,revision:undefined,ref:undefined,name:'Runner test',date:'2027-04-01',endDate:'2027-04-01'});
 const v=(await f.call('vehicle-save',{record:{name:'Furgo 1'}},f.g)).body.record;
 const blk=(await f.call('service-block-save',{record:{serviceId:svc.id,serviceType:'RUNNERS',date:'2027-04-01'},categories:[{categoryId:'runner-sin-vehiculo',quantity:2,start:'08:00',end:'14:00'}]},f.g)).body;
 const [l1,l2]=blk.positions;
 const a=await f.save('assignments',{serviceId:svc.id,orderLineId:l1.id,workerId:hand.id,categoryId:l1.categoryId,date:l1.date,endDate:l1.endDate,start:l1.start,end:l1.end,vehicleId:v.id});
 assert.equal(a.vehicle,v.id);
 let bk=(await f.call('state',null,f.g)).body.vehicleBookings.filter(x=>x.vehicleId===v.id);
 assert.equal(bk.length,1);assert.equal(bk[0].driver,'Hand');assert.equal(bk[0].assignmentId,a.id);assert.equal(bk[0].start,'08:00');
 // the same van can't go to another runner at the same time
 const w2=await f.save('workers',{name:'Runner Dos',costRate:10,createAccess:false});
 const r=await f.call('save',{kind:'assignments',record:{serviceId:svc.id,orderLineId:l2.id,workerId:w2.id,categoryId:l2.categoryId,date:l2.date,endDate:l2.endDate,start:l2.start,end:l2.end,vehicleId:v.id}},f.g);
 assert.equal(r.status,409,JSON.stringify(r.body));
 // external vehicle: no booking
 const a2=await f.save('assignments',{serviceId:svc.id,orderLineId:l2.id,workerId:w2.id,categoryId:l2.categoryId,date:l2.date,endDate:l2.endDate,start:l2.start,end:l2.end,vehicleId:'external'});
 assert.equal(a2.vehicle,'external');
 // moving the shift moves the booking; switching to external frees the van
 await f.call('line-update',{id:l1.id,start:'09:00',end:'15:00'},f.g);
 bk=(await f.call('state',null,f.g)).body.vehicleBookings.filter(x=>x.vehicleId===v.id);assert.equal(bk[0].start,'09:00');
 const cur=(await f.call('state',null,f.g)).body.assignments.find(x=>x.id===a.id);
 assert.equal((await f.call('assignment-vehicle',{id:a.id,vehicleId:'external'},f.g)).status,200);
 assert.equal((await f.call('state',null,f.g)).body.vehicleBookings.filter(x=>x.vehicleId===v.id).length,0);
});

test('v52: geolocation clock only for the block coordinator, or when the block has no coordinator even if there is a Crew Head',async()=>{
 const f=await setup();
 const st=(await f.call('state',null,f.g)).body,hand=st.workers.find(w=>w.name==='Hand'),coordW=st.workers.find(w=>w.name==='Coord'),coordUser=st.users.find(u=>u.workerId===coordW.id);
 const d=f.svc.date;
 const svc2=await f.save('services',{...f.svc,id:undefined,revision:undefined,ref:undefined,coordinatorId:'',name:'Bloques'});
 const withC=(await f.call('service-block-save',{record:{serviceId:svc2.id,serviceType:'LOAD IN',date:d},categories:[{categoryId:'steelhand',quantity:2,start:'17:00',end:'18:00'}]},f.g)).body;
 const noC=(await f.call('service-block-save',{record:{serviceId:svc2.id,serviceType:'SHOW CALL',date:d},categories:[{categoryId:'steelhand',quantity:1,start:'19:00',end:'20:00'}]},f.g)).body;
 const aH1=await f.save('assignments',{serviceId:svc2.id,orderLineId:withC.positions[0].id,workerId:hand.id,categoryId:'steelhand',date:d,endDate:d,start:'17:00',end:'18:00'});
 const aC=await f.save('assignments',{serviceId:svc2.id,orderLineId:withC.positions[1].id,workerId:coordW.id,categoryId:'steelhand',date:d,endDate:d,start:'17:00',end:'18:00'});
 const aH2=await f.save('assignments',{serviceId:svc2.id,orderLineId:noC.positions[0].id,workerId:hand.id,categoryId:'steelhand',date:d,endDate:d,start:'19:00',end:'20:00'});
 assert.equal((await f.call('block-coordinator-set',{blockId:withC.record.id,userId:coordUser.id},f.g)).status,200);
 // a Crew Head on that service day does not count as the block coordinator
 const crew=await f.save('workers',{name:'Crew',costRate:10,createAccess:false});
 await f.save('assignments',{serviceId:svc2.id,workerId:crew.id,categoryId:'CREW HEAD',date:d,endDate:d,start:'06:00',end:'07:00'});
 const geo=(a,c)=>f.call('clock',{id:a.id,revision:a.revision,action:'in',mode:'geo',latitude:41.36,longitude:2.15},c);
 assert.equal((await geo(aH1,f.h)).status,403,'block with coordinator: worker must show QR');
 assert.equal((await geo(aC,f.c)).status,200,'the block coordinator clocks by geolocation');
 const r=await geo(aH2,f.h);assert.equal(r.status,200,JSON.stringify(r.body));
 const mine=(await f.call('state',null,f.h)).body.assignments;
 assert.equal(mine.find(x=>x.id===aH1.id).geoClock,false);assert.equal(mine.find(x=>x.id===aH2.id).geoClock,true);
});

test('v53 · scanning a QR returns the worker card and marks them present',async()=>{
 const f=await setup();
 const qr=await f.call('qr-issue',{id:f.aHand.id},f.h);assert.equal(qr.status,200);
 const r=await f.call('qr-redeem',{token:qr.body.token},f.c);assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.status,'present');assert.equal(r.body.info.name,'Hand');assert.equal(r.body.info.role,'HAND B');assert.equal(r.body.info.start,'08:00');assert.equal(r.body.info.serviceName,'Show');
 const st=(await f.call('state',null,f.c)).body;const row=st.coordinatorRoster.find(x=>x.id===f.aHand.id);assert.ok(row.checkIn);assert.equal(row.noShow,false);
});

test('v53 · a manager deletes a service without clock-ins; with clock-ins it is refused',async()=>{
 const f=await setup();
 const svc2=await f.save('services',{name:'Borrar',clientId:f.svc.clientId,venue:'X',date:f.svc.date,endDate:f.svc.date,start:'18:00',end:'22:00',required:1});
 const a=await f.save('assignments',{serviceId:svc2.id,workerId:f.aHand.workerId,role:'HAND B',date:svc2.date,endDate:svc2.date,start:'18:00',end:'22:00',costRate:9.3,chargeRate:18.6});
 assert.equal((await f.call('service-delete',{id:svc2.id,revision:svc2.revision},f.c)).status,403);
 const ok=await f.call('service-delete',{id:svc2.id,revision:svc2.revision},f.g);assert.equal(ok.status,200,JSON.stringify(ok.body));
 const st=(await f.call('state',null,f.g)).body;assert.ok(!st.services.some(s=>s.id===svc2.id&&!s.archived));assert.ok(!st.assignments.some(x=>x.id===a.id&&!x.archived));
 const qr=await f.call('qr-issue',{id:f.aHand.id},f.h);await f.call('qr-redeem',{token:qr.body.token},f.c);
 const s1=(await f.call('state',null,f.g)).body.services.find(s=>s.id===f.svc.id);
 assert.equal((await f.call('service-delete',{id:s1.id,revision:s1.revision},f.g)).status,409);
});
