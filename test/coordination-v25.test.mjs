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
