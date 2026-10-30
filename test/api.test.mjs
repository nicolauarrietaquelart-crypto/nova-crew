import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoApi } from '../netlify/functions/core.mjs';

function mockStore(){
  const records=new Map();let version=0;
  return {
    async get(key){return records.has(key)? structuredClone(records.get(key).data):null;},
    async setJSON(key,value,opts={}){
      const before=records.get(key);
      if(opts.onlyIfNew&&before)return {modified:false};
      if(opts.onlyIfMatch&&before?.etag!==opts.onlyIfMatch)return {modified:false};
      const etag=`"v${++version}"`;
      records.set(key,{data:structuredClone(value),etag});
      return {modified:true,etag};
    },
    async getWithMetadata(key){const r=records.get(key);return r?{data:structuredClone(r.data),etag:r.etag,metadata:{}}:null;}
  };
}
const url='https://nova-crew.netlify.app/.netlify/functions/api';
function invoke(api,op,{method='POST',body={},token}={}){
  const urlString=url+'?op='+op;
  const init={method,headers:{'content-type':'application/json',...(token?{'authorization':'Bearer '+token}:{})}};
  if(method==='POST')init.body=JSON.stringify(body);
  return api(new Request(urlString,init)).then(async response=>({status:response.status,...await response.json()}));
}

test('demo: login, profile rename, QR issue and scan from other account',async()=>{
  const api=createDemoApi(mockStore());
  const worker=await invoke(api,'login',{body:{username:'demo',password:'crew2026'}});
  const coord=await invoke(api,'login',{body:{username:'coord',password:'coord2026'}});
  assert.equal(worker.status,200);assert.equal(coord.status,200);
  const wrong=await invoke(api,'login',{body:{username:'coord',password:'bad'}});
  assert.equal(wrong.status,401);
  const renamed=await invoke(api,'saveProfile',{token:worker.session,body:{profile:{firstName:'Alex',lastName:'Martín',phone:'600 000 005'}}});
  assert.equal(renamed.ok,true);
  const profile=await invoke(api,'worker',{method:'GET',token:coord.session});
  assert.equal(profile.name,'Alex Martín');
  const qr=await invoke(api,'issue',{token:worker.session,body:{serviceId:'svc2'}});
  assert.equal(qr.workerName,'Alex Martín');assert.match(qr.token,/^[a-f0-9]{64}$/);
  const t2=await invoke(api,'issue',{token:worker.session,body:{serviceId:'svc2'}});
  assert.notEqual(t2.token,qr.token);
  const superseded=await invoke(api,'redeem',{token:coord.session,body:{token:qr.token,expectedService:'svc2'}});
  assert.equal(superseded.status,400);
  const wrongService=await invoke(api,'redeem',{token:coord.session,body:{token:t2.token,expectedService:'svc1'}});
  assert.equal(wrongService.status,400);
  const own=await invoke(api,'redeem',{token:worker.session,body:{token:t2.token,expectedService:'svc2'}});
  assert.equal(own.status,403);
  const scanned=await invoke(api,'redeem',{token:coord.session,body:{token:t2.token,expectedService:'svc2'}});
  assert.equal(scanned.status,200);assert.equal(scanned.record.workerName,'Alex Martín');assert.equal(scanned.record.status,'PRESENTE');
  const again=await invoke(api,'redeem',{token:coord.session,body:{token:t2.token,expectedService:'svc2'}});
  assert.equal(again.status,400);
  const seen=await api(new Request(url+'?op=attendance&serviceId=svc2',{headers:{authorization:'Bearer '+coord.session}})).then(r=>r.json());
  assert.equal(seen.length,1);assert.equal(seen[0].workerName,'Alex Martín');
});

test('service with no coordinator: direct; coordinated service: QR required',async()=>{
  const api=createDemoApi(mockStore());
  const worker=await invoke(api,'login',{body:{username:'demo',password:'crew2026'}});
  const direct=await invoke(api,'direct',{token:worker.session,body:{serviceId:'svc5'}});
  assert.equal(direct.ok,true);assert.equal(direct.record.method,'DIRECTO');
  const failQr=await invoke(api,'issue',{token:worker.session,body:{serviceId:'svc5'}});
  assert.equal(failQr.status,400);
  const failDirect=await invoke(api,'direct',{token:worker.session,body:{serviceId:'svc2'}});
  assert.equal(failDirect.status,400);
  const unauthorized=await invoke(api,'issue',{token:worker.session,body:{serviceId:'svc99'}});
  assert.equal(unauthorized.status,403);
});

test('atomic single-use token blocks parallel double scans',async()=>{
  const api=createDemoApi(mockStore());
  const w=await invoke(api,'login',{body:{username:'demo',password:'crew2026'}});
  const c=await invoke(api,'login',{body:{username:'coord',password:'coord2026'}});
  const issued=await invoke(api,'issue',{token:w.session,body:{serviceId:'svc2'}});
  const results=await Promise.all(Array.from({length:2},()=>invoke(api,'redeem',{token:c.session,body:{token:issued.token,expectedService:'svc2'}})));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
});

test('second demo scenario: coordinator also works as HAND; Crew Head can scan',async()=>{
  const api=createDemoApi(mockStore());
  const pau=await invoke(api,'login',{body:{username:'demo',password:'crew2026'}});
  const alvaro=await invoke(api,'login',{body:{username:'coord',password:'coord2026'}});
  const ticket=await invoke(api,'issue',{token:alvaro.session,body:{serviceId:'svc3'}});
  assert.equal(ticket.ok,true);assert.equal(ticket.category,'HAND A');assert.equal(ticket.team,'LUCES');
  const redeemed=await invoke(api,'redeem',{token:pau.session,body:{token:ticket.token,expectedService:'svc3'}});
  assert.equal(redeemed.ok,true);assert.equal(redeemed.record.workerName,'Álvaro Costa');
  assert.equal(redeemed.record.category,'HAND A');assert.equal(redeemed.record.team,'LUCES');
  const noPrivilege=await invoke(api,'redeem',{token:alvaro.session,body:{token:ticket.token,expectedService:'svc3'}});
  assert.equal(noPrivilege.status,400);
});
