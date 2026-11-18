import test from 'node:test';
import assert from 'node:assert/strict';
import {createOfficeApi} from '../src/office.mjs';
const token='gestoria-tests-setup-secret-long-enough';
function database(){
 const data=new Map();let gate=Promise.resolve();
 const ops=m=>({get:async k=>structuredClone(m.get(k)),put:async(k,v)=>m.set(k,structuredClone(v)),delete:async k=>m.delete(k),
 list:async({prefix='',reverse=false,limit=1e9}={})=>new Map([...m].filter(([k])=>k.startsWith(prefix)).sort(([a],[b])=>reverse?b.localeCompare(a):a.localeCompare(b)).slice(0,limit).map(([k,v])=>[k,structuredClone(v)]))});
 return {...ops(data),transaction:fn=>{const prev=gate;let release;gate=new Promise(r=>release=r);return prev.then(async()=>{const copy=new Map(structuredClone([...data]));try{const result=await fn(ops(copy));data.clear();for(const [k,v] of copy)data.set(k,v);return result;}finally{release();}});}};
}
async function setup(){
 const db=database(),api=createOfficeApi(db,{NOVA_SETUP_TOKEN:token});let cookie='';
 async function call(op,body){
  const response=await api(new Request('https://nova.test/api/office/'+op,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'origin':'https://nova.test','content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}));
  if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];
  return {status:response.status,body:await response.json()};
 }
 assert.equal((await call('setup',{setupToken:token,username:'gestor',name:'Gestor',password:'password-long-enough'})).status,200);
 const save=async(kind,record)=>{const r=await call('save',{kind,record});assert.equal(r.status,200,JSON.stringify(r.body));return r.body.record;};
 const client=await save('clients',{name:'Cliente',taxId:'B12345678',address:'Barcelona'});
 const worker=await save('workers',{name:'Montador',specialty:'HAND B',costRate:9.30,createAccess:false});
 const service=await save('services',{name:'Concierto',clientId:client.id,venue:'Palau Sant Jordi',date:'2027-02-01',endDate:'2027-02-01',start:'09:00',end:'12:00',required:4});
 return {db,call,save,client,worker,service};
}
test('catalog contains source rates and avoids guessing HAND A rate',async()=>{
 const f=await setup(),state=(await f.call('state')).body;
 assert.equal(state.tariffs.find(t=>t.id==='coordinador-personal').workerRate,14.4);
 assert.equal(state.tariffs.find(t=>t.id==='combi-350kg').unit,'day');
 assert.equal(state.tariffs.find(t=>t.id==='HAND A').workerRate,null);
 const changed=await f.save('tariffs',{id:'HAND A',name:'HAND A',group:'Operativo',unit:'hour',minHours:3,workerRate:11.4,clientRate:22.8});
 assert.equal(changed.clientRate,22.8);
});
test('bulk comanda creates independent vacant slots, each fillable exactly once',async()=>{
 const f=await setup();
 const x=await f.call('order-line-bulk',{quantity:3,record:{serviceId:f.service.id,categoryId:'HAND B',date:'2027-02-01',start:'09:00',endDate:'2027-02-01',end:'12:00',serviceType:'LOAD IN',team:'Principal'}});
 assert.equal(x.status,200,JSON.stringify(x.body));
 assert.equal(x.body.records.length,3);
 assert.equal(new Set(x.body.records.map(l=>l.id)).size,3);
 const saved=await f.save('assignments',{serviceId:f.service.id,workerId:f.worker.id,orderLineId:x.body.records[0].id,categoryId:'HAND B',date:'2027-02-01',endDate:'2027-02-01',start:'09:00',end:'12:00',costRate:9.3,chargeRate:18.6});
 assert.equal(saved.workerHours,5);
 assert.equal(saved.billableHours,5);
 assert.equal(saved.costRate,9.3);
 assert.equal(saved.chargeRate,18.6);
 const duplicate=await f.call('save',{kind:'assignments',record:{serviceId:f.service.id,workerId:f.worker.id,orderLineId:x.body.records[1].id,categoryId:'HAND B',date:'2027-02-01',endDate:'2027-02-01',start:'09:00',end:'12:00'}});
 assert.equal(duplicate.status,409);
});
test('no show requires documented approval to create customer cancellation charge',async()=>{
 const f=await setup();
 const unbilled=await f.save('assignments',{serviceId:f.service.id,workerId:f.worker.id,role:'HAND B',costRate:9.3,chargeRate:18.6,noShow:true});
 assert.equal(unbilled.workerHours,0);
 assert.equal(unbilled.billableHours,0);
 const bad=await f.call('save',{kind:'assignments',record:{...unbilled,noShow:true,noShowChargeApproved:true,notes:''}});
 assert.equal(bad.status,400);
 const billed=await f.save('assignments',{...unbilled,noShow:true,noShowChargeApproved:true,notes:'Cláusula contractual de cancelación validada por gestor'});
 assert.equal(billed.workerHours,0);
 assert.equal(billed.billableHours,5);
});
test('daily rate bills one day, not the hours multiplied by daily price',async()=>{
 const f=await setup();
 const a=await f.save('assignments',{serviceId:f.service.id,workerId:f.worker.id,categoryId:'stage-manager',role:'Stage Manager',date:'2027-02-01',endDate:'2027-02-01',start:'09:00',end:'12:00',costRate:270,chargeRate:540});
 assert.equal(a.rateUnit,'day');assert.equal(a.workerUnits,1);assert.equal(a.clientUnits,1);
 const inv=await f.call('invoice-from-service',{serviceId:f.service.id});
 assert.equal(inv.status,200,JSON.stringify(inv.body));
 assert.equal(inv.body.record.lines[0].quantity,1);
 assert.equal(inv.body.record.lines[0].price,540);
});
test('confirmed settlement locks further edits',async()=>{
 const f=await setup();
 const a=await f.save('assignments',{serviceId:f.service.id,workerId:f.worker.id,role:'HAND B',costRate:9.3,chargeRate:18.6});
 const done=await f.save('services',{...f.service,status:'completed'});
 const settled=await f.call('settlement-confirm',{serviceId:done.id,revision:done.revision});
 assert.equal(settled.status,200,JSON.stringify(settled.body));
 assert.equal(settled.body.cost,46.5);
 const denied=await f.call('save',{kind:'assignments',record:{...a,clientHours:10}});
 assert.equal(denied.status,409);
});

test('quotation from comanda uses two-times customer tariff and hour minimum',async()=>{
 const f=await setup();
 const slot=await f.save('orderLines',{serviceId:f.service.id,categoryId:'hand-montador',date:'2027-02-01',endDate:'2027-02-01',start:'09:00',end:'12:00',serviceType:'LOAD IN'});
 assert.equal(slot.categoryId,'hand-montador');
 const quote=await f.call('quote-from-order',{serviceId:f.service.id});
 assert.equal(quote.status,200,JSON.stringify(quote.body));
 assert.equal(quote.body.record.lines[0].quantity,4);
 assert.equal(quote.body.record.lines[0].price,18.6);
});
test('editing an increased rate does not multiply the increment a second time',async()=>{
 const f=await setup();
 const a=await f.save('assignments',{serviceId:f.service.id,workerId:f.worker.id,role:'HAND B',costRate:10,chargeRate:20,incrementPercent:25});
 assert.equal(a.costRate,12.5);
 assert.equal(a.chargeRate,25);
 const edited=await f.save('assignments',{...a,costRate:a.baseCostRate,chargeRate:a.baseChargeRate});
 assert.equal(edited.costRate,12.5);
 assert.equal(edited.chargeRate,25);
});
test('Hand Montador minimum falls to three hours at Palau de la Música',async()=>{
 const f=await setup();
 const venue=await f.save('services',{...f.service,venue:'Palau de la Música Barcelona'});
 const assignment=await f.save('assignments',{serviceId:venue.id,workerId:f.worker.id,categoryId:'hand-montador',costRate:9.30,chargeRate:18.60});
 assert.equal(assignment.minimumHours,3);
 assert.equal(assignment.workerHours,3);
});

test('employee portal receives own gross liquidations but not customer rates',async()=>{
 const f=await setup();
 const a=await f.save('assignments',{serviceId:f.service.id,workerId:f.worker.id,categoryId:'hand-montador',costRate:9.30,chargeRate:18.60});
 assert.equal(a.costRate,9.30);
 const user=await f.call('user',{record:{username:'empleado-test',name:'Empleado',role:'worker',workerId:f.worker.id,password:'password-long-enough',active:true}});
 assert.equal(user.status,200,JSON.stringify(user.body));
 // Login with a dedicated worker session, never the manager's cookies.
 const api=createOfficeApi(f.db,{});
 const login=await api(new Request('https://nova.test/api/office/login',{method:'POST',headers:{origin:'https://nova.test','content-type':'application/json'},body:JSON.stringify({username:'empleado-test',password:'password-long-enough'})}));
 assert.equal(login.status,200);
 const session=login.headers.get('set-cookie').split(';')[0];
 const response=await api(new Request('https://nova.test/api/office/state',{headers:{cookie:session}}));
 assert.equal(response.status,200);
 const payload=await response.json();
 assert.equal(payload.user.role,'worker');
 assert.equal(payload.assignments.length,1);
 const item=payload.assignments[0];
 assert.equal(item.grossPay,37.2);
 assert.equal(item.chargeRate,undefined);
 assert.equal(item.baseChargeRate,undefined);
 assert.equal(item.clientHours,undefined);
 assert.equal(item.clientUnits,undefined);
 assert.equal(payload.tariffs,undefined);
 assert.equal(payload.clients,undefined);
});

test('creating a worker automatically creates only a worker account and one-time onboarding credentials',async()=>{
 const f=await setup();
 const created=await f.call('save',{kind:'workers',record:{name:'Trabajador eventual',specialty:'HAND M',costRate:9.30,contractType:'eventual'}});
 assert.equal(created.status,200,JSON.stringify(created.body));
 assert.equal(created.body.record.contractType,'eventual');
 assert.equal(created.body.access.existing,false);
 assert.ok(created.body.access.username);
 assert.ok(created.body.access.password.length>=12);
 const users=(await f.call('state')).body.users;
 const newUser=users.find(u=>u.workerId===created.body.record.id);
 assert.equal(newUser.role,'worker');
 assert.equal(newUser.username,created.body.access.username);
 assert.equal(newUser.passwordHash,undefined);
 const updated=await f.call('save',{kind:'workers',record:{...created.body.record,name:'Trabajador eventual actualizado'}});
 assert.equal(updated.status,200);
 assert.equal(updated.body.access.existing,true);
 assert.equal(updated.body.access.password,undefined);
 assert.equal((await f.call('state')).body.users.filter(u=>u.workerId===created.body.record.id).length,1);
});
test('worker can save their weekly availability and personal profile without seeing clients',async()=>{
 const f=await setup(),u=await f.call('user',{record:{username:'trabajador',name:'Trabajador',role:'worker',workerId:f.worker.id,password:'worker-password-strong'}});
 assert.equal(u.status,200);
 const api=createOfficeApi(f.db,{});
 const login=await api(new Request('https://nova.test/api/office/login',{method:'POST',headers:{origin:'https://nova.test','content-type':'application/json'},body:JSON.stringify({username:'trabajador',password:'worker-password-strong'})}));
 const cookie=login.headers.get('set-cookie').split(';')[0];
 const call=async(op,data)=>{const r=await api(new Request('https://nova.test/api/office/'+op,{method:'POST',headers:{cookie,origin:'https://nova.test','content-type':'application/json'},body:JSON.stringify(data)}));return{status:r.status,body:await r.json()}};
 const days=Object.fromEntries(['mon','tue','wed','thu','fri','sat','sun'].map(key=>[key,{available:key!=='sun',start:'08:00',end:'22:00'}]));
 assert.equal((await call('availability-weekly',{days})).status,200);
 assert.equal((await call('employee-profile',{record:{city:'Barcelona',languages:['Catalán','Español']}})).status,200);
 const response=await api(new Request('https://nova.test/api/office/state',{headers:{cookie}}));
 const state=await response.json();
 assert.equal(state.weeklyAvailability.days.mon.available,true);
 assert.equal(state.profile.city,'Barcelona');
 assert.equal(state.clients,undefined);
});

test('a worker can coordinate one service and validate QR without a third global role',async()=>{
 const f=await setup();
 const coordinator=await f.save('workers',{name:'Coordinador eventual',costRate:14.4,contractType:'eventual',createAccess:false});
 const coordinatorUser=await f.call('user',{record:{username:'coordinator-worker',name:'Coordinador',role:'worker',workerId:coordinator.id,password:'worker-coordinate-pass'}});
 assert.equal(coordinatorUser.status,200);
 const workerUser=await f.call('user',{record:{username:'assigned-hand',name:'Hand',role:'worker',workerId:f.worker.id,password:'worker-assigned-pass'}});
 assert.equal(workerUser.status,200);
 const service=await f.save('services',{...f.service,coordinatorId:coordinatorUser.body.record.id});
 const a=await f.save('assignments',{serviceId:service.id,workerId:f.worker.id,role:'HAND B',costRate:9.3,chargeRate:18.6});
 const api=createOfficeApi(f.db,{});
 const auth=async(username,password)=>{
  const r=await api(new Request('https://nova.test/api/office/login',{method:'POST',headers:{origin:'https://nova.test','content-type':'application/json'},body:JSON.stringify({username,password})}));
  assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];
 };
 const coordCookie=await auth('coordinator-worker','worker-coordinate-pass'),handCookie=await auth('assigned-hand','worker-assigned-pass');
 const call=async(op,b,cookie)=>{const response=await api(new Request('https://nova.test/api/office/'+op,{method:b?'POST':'GET',headers:{cookie,...(b?{origin:'https://nova.test','content-type':'application/json'}:{})},body:b?JSON.stringify(b):undefined}));return{status:response.status,body:await response.json()}};
 const state=(await call('state',null,coordCookie)).body;
 assert.equal(state.user.role,'worker');
 assert.equal(state.coordinatorRoster.length,1);
 assert.equal(state.clients,undefined);
 assert.equal(state.coordinatorRoster[0].chargeRate,undefined);
 const qr=await call('qr-issue',{id:a.id},handCookie);
 assert.equal(qr.status,200);
 const redeem=await call('qr-redeem',{token:qr.body.token},coordCookie);
 assert.equal(redeem.status,200,JSON.stringify(redeem.body));
 assert.equal(redeem.body.action,'in');
});
test('venue geofencing is checked at the clock event, without storing coordinates on the assignment',async()=>{
 const f=await setup();
 const service=await f.save('services',{...f.service,venueLat:41.387,venueLng:2.17,radiusMeters:500});
 const a=await f.save('assignments',{serviceId:service.id,workerId:f.worker.id,role:'HAND B',costRate:9.3,chargeRate:18.6});
 const workerUser=await f.call('user',{record:{username:'geo-worker',name:'Hand',role:'worker',workerId:f.worker.id,password:'geo-worker-long-pass'}});
 assert.equal(workerUser.status,200);
 const api=createOfficeApi(f.db,{});
 const login=await api(new Request('https://nova.test/api/office/login',{method:'POST',headers:{origin:'https://nova.test','content-type':'application/json'},body:JSON.stringify({username:'geo-worker',password:'geo-worker-long-pass'})}));
 const cookie=login.headers.get('set-cookie').split(';')[0];
 const clock=async(payload)=>{
  const r=await api(new Request('https://nova.test/api/office/clock',{method:'POST',headers:{cookie,origin:'https://nova.test','content-type':'application/json'},body:JSON.stringify({id:a.id,revision:a.revision,action:'in',...payload})}));
  return r.status;
 };
 assert.equal(await clock({}),403);
 assert.equal(await clock({latitude:42,longitude:2.17}),403);
 assert.equal(await clock({latitude:41.387,longitude:2.17}),200);
});
