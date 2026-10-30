import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoApi } from '../src/worker.mjs';

function mockStorage(){
  const m=new Map(); let gate=Promise.resolve();
  const txStore={get:async k=>structuredClone(m.get(k)),put:async(k,v)=>{m.set(k,structuredClone(v))},delete:async k=>m.delete(k)};
  return {...txStore,transaction:fn=>{
    const previous=gate;
    let release;gate=new Promise(res=>release=res);
    return previous.then(async()=>{try{return await fn(txStore)}finally{release()}});
  }};
}
async function call(api,op,{user='',session='',body={},serviceId=''}={}){
  const isGet=['me','attendance','worker','roster','openShifts'].includes(op);
  const url=`https://demo.workers.dev/api?op=${op}${serviceId?'&serviceId='+serviceId:''}`;
  const res=await api(new Request(url,{method:isGet?'GET':'POST',headers:{...(session?{authorization:`Bearer ${session}`}:{})},...(isGet?{}:{body:JSON.stringify(body)})}));
  const data=await res.json();return Array.isArray(data)?Object.assign(data,{status:res.status}):{...data,status:res.status};
}
const login=(api,username,password)=>call(api,'login',{body:{username,password}});

test('login and profile synchronization across sessions', async()=>{
  const api=createDemoApi(mockStorage());
  assert.equal((await login(api,'demo','bad')).status,401);
  const first=await login(api,'demo','crew2026');
  const second=await login(api,'demo','crew2026');
  const name={firstName:'Bea',lastName:'Prueba',phone:'612 345 678'};
  assert.equal((await call(api,'saveProfile',{session:first.session,body:{profile:name}})).ok,true);
  assert.deepEqual((await call(api,'me',{session:second.session})).profile,name);
});

test('QR issuance, regeneration, invalidation, checkin and service authorization',async()=>{
  const api=createDemoApi(mockStorage());
  const w=await login(api,'demo','crew2026');
  const c=await login(api,'coord','coord2026');
  assert.equal((await call(api,'issue',{session:w.session,body:{serviceId:'svc5'}})).status,400);
  const one=await call(api,'issue',{session:w.session,body:{serviceId:'svc2'}});
  const two=await call(api,'issue',{session:w.session,body:{serviceId:'svc2'}});
  assert.notEqual(one.token,two.token);
  assert.equal((await call(api,'redeem',{session:c.session,body:{token:one.token,expectedService:'svc2'}})).status,400);
  assert.equal((await call(api,'redeem',{session:w.session,body:{token:two.token,expectedService:'svc2'}})).status,403);
  assert.equal((await call(api,'redeem',{session:c.session,body:{token:two.token,expectedService:'svc1'}})).status,400);
  const good=await call(api,'redeem',{session:c.session,body:{token:two.token,expectedService:'svc2'}});
  assert.equal(good.ok,true);assert.equal(good.record.status,'PRESENTE');
  assert.equal(good.record.workerId,'demo');assert.equal(good.record.team,'LOGÍSTICA');
  assert.equal((await call(api,'redeem',{session:c.session,body:{token:two.token,expectedService:'svc2'}})).status,400);
  const attend=await call(api,'attendance',{session:c.session,serviceId:'svc2'});
  assert.equal(attend.length,1);assert.equal(attend[0].workerId,'demo');
});

test('simultaneous scans have exactly one success',async()=>{
  const api=createDemoApi(mockStorage());
  const w=await login(api,'demo','crew2026');
  const c=await login(api,'coord','coord2026');
  const ticket=await call(api,'issue',{session:w.session,body:{serviceId:'svc2'}});
  const outcomes=await Promise.all([call(api,'redeem',{session:c.session,body:{token:ticket.token}}),call(api,'redeem',{session:c.session,body:{token:ticket.token}})]);
  assert.deepEqual(outcomes.map(v=>v.status).sort(),[200,400]);
});

test('Worker as HAND and scanner as Crew Head',async()=>{
  const api=createDemoApi(mockStorage());
  const w=await login(api,'demo','crew2026');
  const c=await login(api,'coord','coord2026');
  const ticket=await call(api,'issue',{session:c.session,body:{serviceId:'svc3'}});
  assert.equal(ticket.category,'HAND A');
  const out=await call(api,'redeem',{session:w.session,body:{token:ticket.token,expectedService:'svc3'}});
  assert.equal(out.record.team,'LUCES');assert.equal(out.record.workerName,'Álvaro Costa');
});

test('direct checkin only for uncoordinated services; profile name on scanned record',async()=>{
  const api=createDemoApi(mockStorage());
  const w=await login(api,'demo','crew2026');
  const c=await login(api,'coord','coord2026');
  const save=await call(api,'saveProfile',{session:w.session,body:{profile:{firstName:'Carmen',lastName:'Demo',phone:'123'}}});
  assert.equal(save.ok,true);
  const ticket=await call(api,'issue',{session:w.session,body:{serviceId:'svc2'}});
  const out=await call(api,'redeem',{session:c.session,body:{token:ticket.token}});
  assert.equal(out.record.workerName,'Carmen Demo');
  assert.equal((await call(api,'direct',{session:w.session,body:{serviceId:'svc2'}})).status,400);
  const direct=await call(api,'direct',{session:w.session,body:{serviceId:'svc5'}});
  assert.equal(direct.record.method,'DIRECTO');
  assert.equal(direct.record.workerName,'Carmen Demo');
});

test('invalid codes and unauthenticated requests are rejected',async()=>{
  const api=createDemoApi(mockStorage());
  assert.equal((await call(api,'me')).status,401);
  const c=await login(api,'coord','coord2026');
  assert.equal((await call(api,'redeem',{session:c.session,body:{token:'abc'}})).status,400);
  assert.equal((await call(api,'direct',{session:c.session,body:{serviceId:'svc5'}})).status,403);
});


test('one coordinator for each service, coordinator in roster and can clock own shift',async()=>{
  const api=createDemoApi(mockStorage());
  const demo=await login(api,'demo','crew2026');
  const coord=await login(api,'coord','coord2026');
  const roster=await call(api,'roster',{session:demo.session});
  assert.deepEqual(roster.coordinators,{svc1:'coord',svc2:'coord',svc3:'demo',svc4:'demo',svc5:null});
  assert.deepEqual(roster.roster.coord.assigned,['svc1','svc2','svc3','svc4']);
  assert.equal((await call(api,'issue',{session:coord.session,body:{serviceId:'svc2'}})).status,400);
  const self=await call(api,'selfClock',{session:coord.session,body:{serviceId:'svc2'}});
  assert.equal(self.record.workerName,'Álvaro Costa');
  assert.equal(self.record.category,'COORDINADOR');
  assert.equal(self.record.method,'GESTOR');
  assert.equal((await call(api,'selfClock',{session:demo.session,body:{serviceId:'svc2'}})).status,403);
  const token=await call(api,'issue',{session:demo.session,body:{serviceId:'svc2'}});
  const checkin=await call(api,'redeem',{session:coord.session,body:{token:token.token}});
  assert.equal(checkin.record.category,'FORKLIFTER');
  const rows=await call(api,'attendance',{session:coord.session,serviceId:'svc2'});
  assert.deepEqual(rows.map(r=>r.workerId).sort(),['coord','demo']);
});


test('two Crew Heads can manage ORBIT without adding a second coordinator',async()=>{
  const api=createDemoApi(mockStorage());
  const a=await login(api,'demo','crew2026'),b=await login(api,'coord','coord2026');
  const roster=await call(api,'roster',{session:b.session});
  assert.equal(roster.coordinators.svc4,'demo');
  const own=await call(api,'selfClock',{session:b.session,body:{serviceId:'svc4'}});
  assert.equal(own.status,200);assert.equal(own.record.category,'CREW HEAD');
  const emitted=await call(api,'issue',{session:b.session,body:{serviceId:'svc4'}});
  // The second Crew Head clocks in directly; does not need another Crew Head to scan.
  assert.equal(emitted.status,200);
  const redeemed=await call(api,'redeem',{session:a.session,body:{token:emitted.token}});
  assert.equal(redeemed.status,200);
  assert.equal(redeemed.record.category,'CREW HEAD');
});

test('free-shift interest never assigns a shift and cannot be withdrawn',async()=>{
  const api=createDemoApi(mockStorage());const a=await login(api,'demo','crew2026');
  const before=await call(api,'roster',{session:a.session});
  const available=await call(api,'openShifts',{session:a.session});
  assert.equal(available.shifts[0].urgent,true,'The most urgent available service should be first.');
  assert.equal(available.status,200);assert.ok(available.shifts.length>=2);
  const id=available.shifts[0].id;
  const requested=await call(api,'interest',{session:a.session,body:{shiftId:id}});
  assert.equal(requested.status,200);assert.equal(requested.status,200);assert.equal(requested.ok,true);
  const updated=await call(api,'openShifts',{session:a.session});
  assert.equal(updated.shifts[0].interest.status,'ENVIADO');
  const after=await call(api,'roster',{session:a.session});
  assert.deepEqual(after.roster.demo.assigned,before.roster.demo.assigned);
  const refusal=await call(api,'interest',{session:a.session,body:{shiftId:id,withdraw:true}});
  assert.equal(refusal.status,409);
  const retained=await call(api,'openShifts',{session:a.session});assert.equal(retained.shifts[0].interest.status,'ENVIADO');
});

test('workers can adjust their own shift, but not another worker shift',async()=>{
  const api=createDemoApi(mockStorage());const a=await login(api,'demo','crew2026'),b=await login(api,'coord','coord2026');
  const changed=await call(api,'updateShift',{session:a.session,body:{serviceId:'svc2',workerId:'demo',start:'08:30',end:'16:00'}});
  assert.equal(changed.status,200);
  const roster=await call(api,'roster',{session:a.session});
  assert.equal(roster.shifts['svc2/demo'].end,'16:00');
  const denied=await call(api,'updateShift',{session:a.session,body:{serviceId:'svc2',workerId:'coord',start:'09:00',end:'17:00'}});
  assert.equal(denied.status,403);
  const fromManager=await call(api,'updateShift',{session:b.session,body:{serviceId:'svc2',workerId:'demo',start:'07:00',end:'15:00'}});
  assert.equal(fromManager.status,200);
});
