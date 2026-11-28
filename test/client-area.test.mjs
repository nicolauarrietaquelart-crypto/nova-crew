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

async function base(){
 const db=database(),api=createOfficeApi(db,{NOVA_SETUP_TOKEN:token});
 const call=async(op,body,cookie='')=>{const r=await api(new Request('https://nova.test/api/office/'+op,{method:body?'POST':'GET',headers:{origin:'https://nova.test','content-type':'application/json',...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined}));const set=r.headers.get('set-cookie');return {status:r.status,body:await r.json().catch(()=>null),cookie:set?set.split(';')[0]:''};};
 const g=(await call('setup',{setupToken:token,username:'gestor',name:'Nicolau',password:'gestor-password-123'})).cookie;
 await call('settings',{record:{name:'NOVA',taxId:'B1',address:'X',email:'a@b.c',invoicePrefix:'N',vat:21,paymentDays:30}},g);
 return {call,g};
}
test('v59 · client registers, fills fiscal data, requests a quote, accepts it; sees no worker names',async()=>{
 const {call,g}=await base();
 const reg=await call('client-register',{company:'Eventos Demo SL',contact:'Ana Demo',email:'ana@demo.es',phone:'600000000',taxId:'b12345678',username:'Eventos Demo',password:'client-pass-1234'});
 assert.equal(reg.status,200,JSON.stringify(reg.body));assert.equal(reg.body.user.role,'client');const c=reg.cookie;
 let st=(await call('state',null,c)).body;assert.equal(st.client.name,'Eventos Demo SL');assert.ok(st.categories.length>0);assert.ok(st.categories.every(c=>c.price===undefined),'no prices for clients');assert.ok(!('workers' in st));
 assert.equal((await call('workers-import',{rows:[{name:'X Y'}],password:'aaaaaaaaaaaaaa'},c)).status,403);
 assert.equal((await call('save',{kind:'clients',record:{name:'hack'}},c)).status,403);
 const prof=await call('client-profile',{record:{legalName:'Eventos Demo SL',taxId:'B12345678',street:'C/ Mayor 1',postalCode:'08001',city:'Barcelona',province:'Barcelona',email:'ana@demo.es',phone:'600000000',contact:'Ana',revision:st.client.revision}},c);
 assert.equal(prof.status,200,JSON.stringify(prof.body));assert.match(prof.body.record.address,/08001 Barcelona/);
 const cat=st.categories[0].id;
 const rq=await call('client-request-save',{record:{title:'Concierto',venue:'Palau',contactName:'Ana',contactPhone:'600',lines:[{categoryId:cat,quantity:4,date:'2027-03-01',start:'22:00',end:'06:00'}]}},c);
 assert.equal(rq.status,200,JSON.stringify(rq.body));assert.equal(rq.body.record.lines[0].endDate,'2027-03-02');
 const gs=(await call('state',null,g)).body;assert.ok(gs.clientRequests.some(r=>r.id===rq.body.record.id));
 const q=await call('quote-plan-save',{record:{clientId:rq.body.record.clientId,serviceName:'Concierto',date:'2026-12-01',dueDate:'2026-12-31',requestId:rq.body.record.id,staffPlan:[{categoryId:cat,quantity:4,date:'2027-03-01',endDate:'2027-03-02',start:'22:00',end:'06:00',pause:0,serviceType:'SHOW'}]}},g);
 assert.equal(q.status,200,JSON.stringify(q.body));
 st=(await call('state',null,c)).body;assert.equal(st.requests.find(r=>r.id===rq.body.record.id).status,'quoted');assert.equal(st.quotes.length,0,'draft quotes are hidden');
 const iss=await call('issue',{kind:'quotes',id:q.body.record.id,revision:q.body.record.revision},g);assert.equal(iss.status,200,JSON.stringify(iss.body));
 st=(await call('state',null,c)).body;const cq=st.quotes[0];assert.equal(cq.status,'issued');
 const ok=await call('client-quote-respond',{id:cq.id,status:'accepted',revision:cq.revision},c);assert.equal(ok.status,200,JSON.stringify(ok.body));
 const gs2=(await call('state',null,g)).body;assert.equal(gs2.quotes.find(x=>x.id===cq.id).status,'accepted');assert.ok(gs2.clientRequests.some(r=>r.type==='quote-response'));
 // service from quote, assign a worker: client sees coverage but not the name until enabled
 const sc=await call('service-create',{quoteId:cq.id,service:{}},g);assert.equal(sc.status,200,JSON.stringify(sc.body));
 const w=(await call('save',{kind:'workers',record:{name:'Persona Secreta',costRate:10,createAccess:false}},g)).body.record;
 const pos=sc.body.positions[0];const a=await call('save',{kind:'assignments',record:{serviceId:sc.body.record.id,orderLineId:pos.id,workerId:w.id,categoryId:cat,costRate:9,chargeRate:18}},g);assert.equal(a.status,200,JSON.stringify(a.body));
 st=(await call('state',null,c)).body;const sv=st.services[0];assert.ok(sv.positions.some(p=>p.covered));assert.ok(!JSON.stringify(st).includes('Persona Secreta'));
 await call('client-service-request',{serviceId:sv.id,type:'names'},c);
 assert.equal((await call('client-names-toggle',{serviceId:sv.id,show:true},g)).status,200);
 st=(await call('state',null,c)).body;assert.ok(JSON.stringify(st.services).includes('Persona Secreta'));
 const login=await call('login',{username:'eventosdemo',password:'client-pass-1234'});assert.equal(login.status,200);
});
test('v59 · gestor creates a client access',async()=>{
 const {call,g}=await base();const cl=(await call('save',{kind:'clients',record:{name:'Live Test'}},g)).body.record;
 const r=await call('client-user',{clientId:cl.id,username:'livetest',password:'client-pass-9999'},g);assert.equal(r.status,200,JSON.stringify(r.body));
 const l=await call('login',{username:'LiveTest',password:'client-pass-9999'});assert.equal(l.status,200);assert.equal(l.body.user.role,'client');
 const st=(await call('state',null,l.cookie)).body;assert.equal(st.client.name,'Live Test');
});
