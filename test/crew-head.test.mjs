import test from 'node:test';
import assert from 'node:assert/strict';
import {createOfficeApi} from '../src/office.mjs';

const token='crew-head-tests-setup-secret-long';
function database(){
 const data=new Map();let gate=Promise.resolve();
 const ops=m=>({get:async k=>structuredClone(m.get(k)),put:async(k,v)=>m.set(k,structuredClone(v)),delete:async k=>m.delete(k),
 list:async({prefix='',reverse=false,limit=1e9}={})=>new Map([...m].filter(([k])=>k.startsWith(prefix)).sort(([a],[b])=>reverse?b.localeCompare(a):a.localeCompare(b)).slice(0,limit).map(([k,v])=>[k,structuredClone(v)]))});
 return {...ops(data),transaction:fn=>{const prev=gate;let release;gate=new Promise(r=>release=r);return prev.then(async()=>{const copy=new Map(structuredClone([...data]));try{const result=await fn(ops(copy));data.clear();for(const [k,v] of copy)data.set(k,v);return result;}finally{release();}});}};
}
async function scenario(){
 const db=database(),api=createOfficeApi(db,{NOVA_SETUP_TOKEN:token});
 const request=async(op,body,cookie='')=>{const r=await api(new Request('https://nova.test/api/office/'+op,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{origin:'https://nova.test','content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}));return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 const setup=await request('setup',{setupToken:token,username:'gestor',name:'Gestor',password:'password-long-enough'});
 const manager=setup.cookie,m=(op,body)=>request(op,body,manager);
 const save=async(kind,record)=>{const r=await m('save',{kind,record});assert.equal(r.status,200,JSON.stringify(r.body));return r.body.record;};
 const client=await save('clients',{name:'Cliente',taxId:'B1',address:'BCN'});
 const service=await save('services',{name:'Festival',clientId:client.id,venue:'Fòrum',date:'2027-03-01',endDate:'2027-03-02',start:'08:00',end:'20:00',required:4});
 const people={};
 for(const n of ['head','coord','hand1','hand2','hand3']){
  const w=await save('workers',{name:n,specialty:'HAND B',costRate:9.3,createAccess:false});
  const u=await m('user',{record:{username:n,name:n,role:'worker',workerId:w.id,password:'secret-password-'+n}});assert.equal(u.status,200);
  people[n]={worker:w,user:u.body.record,cookie:(await request('login',{username:n,password:'secret-password-'+n})).cookie};
 }
 const block=async(serviceType,day,start,end,coordinatorId='')=>{const r=await m('service-block-save',{record:{serviceId:service.id,serviceType,date:day,endDate:day,start,end,coordinatorId},categories:[{categoryId:'HAND B',quantity:2}]});assert.equal(r.status,200,JSON.stringify(r.body));return r.body;};
 const loadIn=await block('LOAD IN','2027-03-01','08:00','12:00');
 const show=await block('SHOW CALL','2027-03-01','14:00','20:00',people.coord.user.id);
 const nextDay=await block('LOAD OUT','2027-03-02','08:00','12:00');
 const assign=(b,i,who)=>save('assignments',{serviceId:service.id,orderLineId:b.positions[i].id,workerId:people[who].worker.id,categoryId:'HAND B',costRate:9.3,chargeRate:18.6});
 const a1=await assign(loadIn,0,'hand1'),a2=await assign(show,0,'hand2'),a3=await assign(nextDay,0,'hand3'),a4=await assign(show,1,'head');
 assert.equal((await m('service-block-operator-save',{record:{blockId:loadIn.record.id,userId:people.head.user.id,kind:'crew_head'}})).status,200);
 return {api,m,request,people,service,a1,a2,a3,a4,blocks:{loadIn,show,nextDay}};
}

test('Crew Head sees the whole service only on the day assigned; block coordinators only their block',async()=>{
 const s=await scenario();
 const head=(await s.request('state',null,s.people.head.cookie)).body;
 assert.deepEqual(head.crewHeadDays,[{serviceId:s.service.id,date:'2027-03-01'}]);
 const crewIds=head.coordinatorRoster.filter(a=>a.crew).map(a=>a.id).sort();
 assert.deepEqual(crewIds,[s.a1.id,s.a2.id,s.a4.id].sort());
 assert.ok(!head.coordinatorRoster.some(a=>a.id===s.a3.id),'next day is outside Crew Head scope');
 assert.ok(head.categoryOptions.length>0);
 assert.equal(head.coordinatorRoster[0].costRate,undefined);
 const coord=(await s.request('state',null,s.people.coord.cookie)).body;
 assert.deepEqual(coord.coordinatorRoster.map(a=>a.id).sort(),[s.a2.id,s.a4.id].sort());
 assert.equal(coord.crewHeadDays.length,0);
 // Crew Head adjusts schedules on its day, not on others.
 assert.equal((await s.request('coordinator-shift',{id:s.a2.id,revision:s.a2.revision,start:'15:00',end:'20:30'},s.people.head.cookie)).status,200);
 assert.equal((await s.request('coordinator-shift',{id:s.a3.id,revision:s.a3.revision,start:'09:00',end:'12:00'},s.people.head.cookie)).status,403);
 assert.equal((await s.request('coordinator-shift',{id:s.a2.id,revision:s.a2.revision+1,start:'15:00',end:'20:00'},s.people.coord.cookie)).status,403);
 // QR validation stays with the block coordinator for its people.
 const qr=await s.request('qr-issue',{id:s.a1.id},s.people.hand1.cookie);assert.equal(qr.status,200);
 assert.equal((await s.request('qr-redeem',{token:qr.body.token},s.people.coord.cookie)).status,403);
 assert.equal((await s.request('qr-redeem',{token:qr.body.token},s.people.head.cookie)).status,200);
});

test('category changes are requested through an incident and applied only by Gestoría',async()=>{
 const s=await scenario();
 const direct=await s.request('save',{kind:'assignments',record:{...s.a1,categoryId:'HAND A'}},s.people.head.cookie);
 assert.equal(direct.status,403);
 const request=await s.request('incident-report',{serviceId:s.service.id,workerId:s.people.hand1.worker.id,assignmentId:s.a1.id,type:'category_change',requestedCategoryId:'HAND A',severity:'low',description:'Hace funciones de HAND A'},s.people.head.cookie);
 assert.equal(request.status,200,JSON.stringify(request.body));
 assert.equal(request.body.record.requestedCategory,'HAND A');
 assert.equal((await s.request('incident-report',{serviceId:s.service.id,workerId:s.people.hand3.worker.id,assignmentId:s.a3.id,type:'category_change',requestedCategoryId:'HAND A',description:'Fuera de su día'},s.people.head.cookie)).status,403);
 assert.equal((await s.request('incident-report',{serviceId:s.service.id,workerId:s.people.hand1.worker.id,assignmentId:s.a1.id,type:'category_change',requestedCategoryId:'NO-EXISTE',description:'x'},s.people.head.cookie)).status,400);
 const state=(await s.m('state')).body;
 const incident=state.incidents.find(i=>i.id===request.body.record.id);
 assert.equal(incident.type,'category_change');assert.equal(incident.assignmentId,s.a1.id);
 assert.equal(state.assignments.find(a=>a.id===s.a1.id).categoryId,'HAND B');
});

test('closing the day freezes Crew Control until Gestoría reopens it',async()=>{
 const s=await scenario(),head=s.people.head.cookie;
 const checkIn=await s.request('crew-attendance',{id:s.a1.id,revision:s.a1.revision,event:'in',reason:'Sin cobertura para QR'},head);
 assert.equal(checkIn.status,200,JSON.stringify(checkIn.body));
 assert.equal((await s.request('crew-day-close',{serviceId:s.service.id,date:'2027-03-01'},head)).status,409,'open check-ins block closing');
 const out=await s.request('crew-attendance',{id:s.a1.id,revision:checkIn.body.record.revision,event:'out',reason:'Salida manual'},head);
 assert.equal(out.status,200);
 assert.equal((await s.request('crew-day-close',{serviceId:s.service.id,date:'2027-03-02'},head)).status,403,'not Crew Head that day');
 assert.equal((await s.request('crew-day-close',{serviceId:s.service.id,date:'2027-03-01'},s.people.coord.cookie)).status,403);
 const closed=await s.request('crew-day-close',{serviceId:s.service.id,date:'2027-03-01',notes:'Todo correcto'},head);
 assert.equal(closed.status,200,JSON.stringify(closed.body));
 assert.equal(closed.body.record.summary.attended,1);
 assert.equal((await s.request('coordinator-shift',{id:s.a2.id,revision:s.a2.revision,start:'15:00',end:'20:00'},head)).status,409);
 assert.equal((await s.request('crew-day-reopen',{serviceId:s.service.id,date:'2027-03-01'},head)).status,403);
 assert.equal((await s.m('crew-day-reopen',{serviceId:s.service.id,date:'2027-03-01'})).status,200);
 assert.equal((await s.request('coordinator-shift',{id:s.a2.id,revision:s.a2.revision,start:'15:00',end:'20:00'},head)).status,200);
});

test('service page data: staff notes, call time, company notice and service documents shared only with assigned staff',async()=>{
 const s=await scenario();
 assert.equal((await s.m('settings',{record:{name:'NOVA',taxId:'B0',address:'BCN',invoicePrefix:'NOVA',vat:21,paymentDays:30,staffNotice:'Camiseta corporativa y EPI obligatorios',emergencyPhone:'670000000'}})).status,200);
 const sv=(await s.m('state')).body.services[0];
 assert.equal((await s.m('save',{kind:'services',record:{...sv,employeeNotes:'Entrada por puerta 5',callTime:'07:45'}})).status,200);
 const pdf=btoa('%PDF-1.4\nplan');
 const shared=await s.m('document-upload',{name:'plan.pdf',content:pdf,serviceId:sv.id,type:'service',shareWithStaff:true});
 assert.equal(shared.status,200);assert.equal(shared.body.record.shareWithStaff,true);
 const privateDoc=await s.m('document-upload',{name:'contrato.pdf',content:pdf,serviceId:sv.id,workerId:s.people.hand2.worker.id,shareWithStaff:true});
 assert.equal(privateDoc.body.record.shareWithStaff,false,'a worker contract is never shared');
 const worker=(await s.request('state',null,s.people.hand1.cookie)).body;
 assert.equal(worker.company.staffNotice,'Camiseta corporativa y EPI obligatorios');
 assert.equal(worker.services[0].employeeNotes,'Entrada por puerta 5');
 assert.equal(worker.services[0].callTime,'07:45');
 assert.equal(worker.services[0].notes,undefined);
 assert.deepEqual(worker.documents.map(d=>d.id),[shared.body.record.id]);
 assert.equal(worker.assignments[0].serviceType,'LOAD IN');
 const download=(id,cookie)=>s.api(new Request('https://nova.test/api/office/document?id='+id,{headers:{cookie}})).then(r=>r.status);
 assert.equal(await download(shared.body.record.id,s.people.hand1.cookie),200);
 assert.equal(await download(privateDoc.body.record.id,s.people.hand1.cookie),403);
 assert.equal(await download(privateDoc.body.record.id,s.people.hand2.cookie),200);
});

test('Gestoría broadcasts to all, a service, fixed or temporary staff, or a category',async()=>{
 const s=await scenario();
 const st=(await s.m('state')).body;
 const fixed=st.workers.find(w=>w.name==='hand1');
 assert.equal((await s.m('save',{kind:'workers',record:{...fixed,contractType:'indefinite',specialty:'FORKLIFTER',createAccess:false}})).status,200);
 const send=audience=>s.m('message-broadcast',{content:'Aviso',audience});
 assert.equal((await send({type:'all'})).body.sent,5);
 assert.equal((await send({type:'contract',value:'fixed'})).body.sent,1);
 assert.equal((await send({type:'contract',value:'eventual'})).body.sent,4);
 assert.equal((await send({type:'category',value:'forklifter'})).body.sent,1);
 assert.equal((await send({type:'service',value:s.service.id})).body.sent,4);
 assert.equal((await send({type:'category',value:'NADIE'})).status,409);
 assert.equal((await s.request('message-broadcast',{content:'x',audience:{type:'all'}},s.people.hand1.cookie)).status,403);
 const inbox=(await s.request('state',null,s.people.hand1.cookie)).body.messages;
 assert.equal(inbox.length,4);assert.ok(inbox.every(m=>m.recipientId===s.people.hand1.user.id));
});

import worker from '../src/worker.mjs';
test('original Crew Control interface works on NOVA data only for the Crew Head and its day',async()=>{
 const s=await scenario();
 const env={OFFICE_STATE:{idFromName:()=>1,get:()=>({fetch:r=>s.api(r)})}};
 const cc=async(code,cookie,method='GET',payload)=>{const r=await worker.fetch(new Request('https://nova.test/api/services/'+code+'?format=snapshot',{method,headers:{cookie,'x-service-code':code,'content-type':'application/json',origin:'https://nova.test'},body:payload?JSON.stringify(payload):undefined}),env);return {status:r.status,body:await r.json()};};
 assert.equal((await s.request('crew-open',{serviceId:s.service.id,date:'2027-03-01'},s.people.coord.cookie)).status,403);
 assert.equal((await s.request('crew-open',{serviceId:s.service.id,date:'2027-03-02'},s.people.head.cookie)).status,403);
 const opened=await s.request('crew-open',{serviceId:s.service.id,date:'2027-03-01'},s.people.head.cookie);
 assert.equal(opened.status,200);const code=opened.body.code;assert.match(code,/^\d{6}$/);
 assert.equal((await cc(code,s.people.coord.cookie)).status,403,'coordinator cannot open Crew Control');
 const first=await cc(code,s.people.head.cookie);assert.equal(first.status,200,JSON.stringify(first.body));
 const snap=first.body.service;
 assert.equal(snap.serviceDate,'01/03/2027');
 assert.deepEqual(snap.workers.map(w=>w.id).sort(),[s.a1.id,s.a2.id,s.a4.id].sort());
 assert.equal(snap.workers.find(w=>w.id===s.a1.id).trabajo,'LOAD IN');
 // Arrival, real hours and an attempted category change.
 const edit=structuredClone(snap),w1=edit.workers.find(w=>w.id===s.a1.id);
 w1.status='PRESENTE';w1.arrivalAt='08:05';w1._fieldTimes={...w1._fieldTimes,status:Number(w1._fieldTimes?.status||0)+1,arrivalAt:Number(w1._fieldTimes?.arrivalAt||0)+1};
 w1.actualStart='08:00';w1.actualEnd='12:30';w1.actualPause='00:30';w1.especialidad='HAND A';
 edit.incidents=[{id:'INC-1',workerId:s.a1.id,category:'CAMBIO CATEGORIA',severity:'LEVE',newCategory:'HAND A',description:'Hace funciones de HAND A',actionTaken:'',status:'ABIERTA'}];
 const saved=await cc(code,s.people.head.cookie,'PUT',{service:edit,revision:snap._syncRevision});
 assert.equal(saved.status,200,JSON.stringify(saved.body));
 assert.equal(saved.body.service.workers.find(w=>w.id===s.a1.id).especialidad,'HAND B','category stays until Gestoría applies it');
 const state=(await s.m('state')).body,a1=state.assignments.find(a=>a.id===s.a1.id);
 assert.ok(a1.checkIn);assert.ok(a1.checkOut);assert.equal(a1.actualHours,4);assert.equal(a1.categoryId,'HAND B');
 const req=state.incidents.find(i=>i.source==='crew-control');
 assert.equal(req.type,'category_change');assert.equal(req.requestedCategory,'HAND A');assert.equal(req.assignmentId,s.a1.id);
 // Stale copies, new staff and removals are rejected.
 assert.equal((await cc(code,s.people.head.cookie,'PUT',{service:edit,revision:snap._syncRevision})).status,409);
 const latest=saved.body.service;
 assert.equal((await cc(code,s.people.head.cookie,'PUT',{service:{...latest,workers:[...latest.workers,{...latest.workers[0],id:'NEW'}]},revision:latest._syncRevision})).status,403);
 assert.equal((await cc(code,s.people.head.cookie,'PUT',{service:{...latest,workers:latest.workers.slice(1)},revision:latest._syncRevision})).status,403);
 assert.equal((await cc(code,s.people.head.cookie,'PUT',{service:{...latest,closed:true},revision:latest._syncRevision})).status,403);
 assert.equal((await worker.fetch(new Request('https://nova.test/api/services/'+code+'/pdf',{method:'PUT',headers:{'x-service-code':code}}),env)).status,403);
 // Closing the day from Crew Control closes it in NOVA.
 const close=await cc(code,s.people.head.cookie,'PUT',{service:{...latest,closedDays:{'01/03/2027':new Date().toISOString()}},revision:latest._syncRevision});
 assert.equal(close.status,200,JSON.stringify(close.body));
 assert.ok((await s.m('state')).body.crewDayClosures.some(c=>c.date==='2027-03-01'));
 const after=await cc(code,s.people.head.cookie);assert.equal(after.body.service.closedDays['01/03/2027']!==undefined,true);
 assert.equal((await cc(code,s.people.head.cookie,'PUT',{service:after.body.service,revision:after.body.service._syncRevision})).status,409);
});

test('invoicing per closed day and for the rest of a finished service never bills a worker twice',async()=>{
 const s=await scenario();
 assert.equal((await s.m('settings',{record:{name:'NOVA',taxId:'B0',address:'BCN',invoicePrefix:'NOVA',vat:21,paymentDays:30}})).status,200);
 const day1=await s.m('invoice-from-service',{serviceId:s.service.id,date:'2027-03-01'});
 assert.equal(day1.status,200,JSON.stringify(day1.body));
 assert.equal(day1.body.record.scope,'day');assert.equal(day1.body.record.lines.length,3);
 assert.equal((await s.m('invoice-from-service',{serviceId:s.service.id,date:'2027-03-01'})).status,409);
 const rest=await s.m('invoice-from-service',{serviceId:s.service.id});
 assert.equal(rest.status,200);assert.equal(rest.body.record.lines.length,1);assert.deepEqual(rest.body.record.assignmentIds,[s.a3.id]);
 assert.equal((await s.m('invoice-from-service',{serviceId:s.service.id})).status,409);
 const draft=rest.body.record;
 assert.equal((await s.m('invoice-mark-sent',{id:draft.id,revision:draft.revision})).status,409,'drafts are not sent');
 const issued=await s.m('issue',{kind:'invoices',id:draft.id,revision:draft.revision});assert.equal(issued.status,200);
 const sent=await s.m('invoice-mark-sent',{id:draft.id,revision:issued.body.record.revision,to:'prod@cliente.test'});
 assert.equal(sent.status,200);assert.ok(sent.body.record.sentAt);assert.equal(sent.body.record.assignmentIds.length,1);
});

test('worker categories opened by Gestoría gate assignments; Gestoría can upload the worker photo',async()=>{
 const s=await scenario();
 const st=(await s.m('state')).body,w=st.workers.find(x=>x.name==='hand3');
 const saved=await s.m('save',{kind:'workers',record:{...w,categories:['HAND B','forklifter','HAND B'],createAccess:false}});
 assert.equal(saved.status,200);assert.deepEqual(saved.body.record.categories,['HAND B','forklifter']);
 const slot=(await s.m('state')).body.orderLines.find(l=>l.serviceId===s.service.id&&l.date==='2027-03-01'&&!st.assignments.some(a=>a.orderLineId===l.id));
 const blocked=await s.m('save',{kind:'assignments',record:{serviceId:s.service.id,workerId:w.id,orderLineId:slot.id,categoryId:'HAND A',date:slot.date,endDate:slot.endDate,start:slot.start,end:slot.end}});
 assert.equal(blocked.status,409);assert.match(blocked.body.error,/categoría/);
 const ok=await s.m('save',{kind:'assignments',record:{serviceId:s.service.id,workerId:w.id,orderLineId:slot.id,categoryId:'HAND B',date:slot.date,endDate:slot.endDate,start:slot.start,end:slot.end}});
 assert.equal(ok.status,200,JSON.stringify(ok.body));
 const png=btoa('\x89PNG\r\n\x1a\n'+'x'.repeat(40));
 assert.equal((await s.m('employee-photo-upload',{workerId:w.id,mime:'image/png',content:png})).status,200);
 assert.ok((await s.m('state')).body.employeePhotoIds.includes(w.id));
});
