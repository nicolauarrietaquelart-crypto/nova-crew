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
  const isGet=['me','attendance','worker'].includes(op);
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
