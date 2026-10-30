import test from 'node:test';
import assert from 'node:assert/strict';
import {handleCrewStore,handleSmallCoord} from '../src/crew-store.mjs';
class MemoryStorage{
  constructor(){this.data=new Map();}
  async get(key){return structuredClone(this.data.get(key))}
  async put(key,value){this.data.set(key,structuredClone(value))}
  async delete(key){this.data.delete(key)}
  async transaction(fn){return fn(this)}
}
const store=new MemoryStorage();
const call=(actor,kind,code,rest={})=>handleCrewStore(store,actor,{kind,code,...rest},id=>id==='svc4'&&['demo','coord'].includes(actor) || id==='svc2'&&actor==='coord');
test('seeds exactly one coordinator and both crew heads',async()=>{
  const d=await call('demo','init','svc4');assert.equal(d.ok,true);
  const coord=d.workers.filter(w=>w.isCoordinator);assert.equal(coord.length,1);assert.equal(coord[0].id,'demo');
  assert.equal(d.workers.find(w=>w.id==='coord').especialidad,'CREW HEAD');
});
test('unauthorized employee cannot read service',async()=>{
  const d=await call('demo','init','svc2');assert.equal(d.status,403);
});
test('changes persist and propagate from worker to shared DO state',async()=>{
  const d=await call('coord','batch','svc4',{ops:[{type:'set',path:['services','svc4','workers','coord'],data:{status:'PRESENTE',actualEnd:'19:15'},merge:true}]});assert.equal(d.ok,true);
  const d2=await call('demo','getDoc','svc4',{path:['services','svc4','workers','coord']});assert.equal(d2.data.status,'PRESENTE');assert.equal(d2.data.actualEnd,'19:15');
  const record=await store.get('attendance/svc4/coord');assert.equal(record.status,'PRESENTE');
});
test('supports new workers, incidents, and bulk operations',async()=>{
 const d=await call('demo','batch','svc4',{ops:[{type:'set',path:['services','svc4','workers','demo-extra'],data:{id:'demo-extra',personal:'Eva Test'},merge:false},{type:'set',path:['services','svc4','incidents','inc-1'],data:{id:'inc-1',category:'RETRASO'},merge:false}]});assert.equal(d.ok,true);
 const [workers,incidents]=await Promise.all(['workers','incidents'].map(c=>call('demo','getCollection','svc4',{path:['services','svc4',c]})));
 assert.ok(workers.docs.some(x=>x.id==='demo-extra'));
 assert.ok(incidents.docs.some(x=>x.id==='inc-1'));
 const del=await call('demo','batch','svc4',{ops:[{type:'delete',path:['services','svc4','incidents','inc-1']}]});assert.equal(del.ok,true);
});
test('rejects cross-service batch',async()=>{
 const r=await call('demo','batch','svc4',{ops:[{type:'set',path:['services','svc2','workers','demo'],data:{status:'PRESENTE'}}]});assert.equal(r.ok,false);
});

test('Crew Head manages full concert, SFX coordinator can only manage SFX',async()=>{
 const store=new MemoryStorage();
 const sfx=await handleSmallCoord(store,'demo',{kind:'get',serviceId:'svc7'});
 assert.equal(sfx.ok,true);
 assert.equal(sfx.workers.length,4);
 assert.equal(sfx.workers.find(w=>w.id==='demo').isCoordinator,true);
 const big=await handleCrewStore(store,'coord',{kind:'init',code:'svc7'},id=>id==='svc7');
 assert.equal(big.ok,true);
 assert.equal(big.workers.length,10);
 assert.equal(big.workers.find(w=>w.id==='coord').isCoordinator,true);
 assert.equal(big.workers.find(w=>w.id==='demo').isSubCoordinator,true);
 const update=await handleSmallCoord(store,'demo',{kind:'patch',serviceId:'svc7',workerId:'fict-2',changes:{start:'09:20'}});
 assert.equal(update.ok,true);
 const after=await handleCrewStore(store,'coord',{kind:'getDoc',code:'svc7',path:['services','svc7','workers','fict-2']},id=>id==='svc7');
 assert.equal(after.data.actualStart,'09:20');
 await assert.rejects(()=>handleSmallCoord(store,'demo',{kind:'patch',serviceId:'svc7',workerId:'fict-8',changes:{start:'09:20'}}));
 const small=await handleSmallCoord(store,'demo',{kind:'get',serviceId:'svc6'});
 assert.deepEqual(small.workers.map(x=>x.name),['Pau Ferrer Soler','Marc Vidal','Laia Costa','Pol Navarro']);
});

test('independent Uniformidad, Actitud and Puntualidad scores persist in normal coordination',async()=>{
 const storage=new MemoryStorage();
 const get=(who,svc)=>handleSmallCoord(storage,who,{kind:'get',serviceId:svc});
 const patch=(who,svc,id,changes)=>handleSmallCoord(storage,who,{kind:'patch',serviceId:svc,workerId:id,changes});
 let saved=await patch('demo','svc6','small-1',{ratingUniformidad:4,ratingActitud:2,ratingPuntualidad:5});
 assert.equal(saved.ok,true);
 assert.deepEqual(
   ['ratingUniformidad','ratingActitud','ratingPuntualidad'].map(k=>saved.workers.find(w=>w.id==='small-1')[k]),
   [4,2,5]
 );
 saved=await patch('demo','svc6','small-1',{ratingPuntualidad:3});
 assert.equal(saved.ok,true);
 assert.deepEqual(
   ['ratingUniformidad','ratingActitud','ratingPuntualidad'].map(k=>saved.workers.find(w=>w.id==='small-1')[k]),
   [4,2,3]
 );
 const reloaded=await get('demo','svc6');
 assert.deepEqual(
   ['ratingUniformidad','ratingActitud','ratingPuntualidad'].map(k=>reloaded.workers.find(w=>w.id==='small-1')[k]),
   [4,2,3]
 );
 const invalid=await patch('demo','svc6','small-1',{ratingActitud:6});
 assert.equal(invalid.status,400);
 const invalidFraction=await patch('demo','svc6','small-1',{ratingActitud:2.5});
 assert.equal(invalidFraction.status,400);
 const invalidString=await patch('demo','svc6','small-1',{ratingActitud:'5'});
 assert.equal(invalidString.status,400);
 const forbidden=await get('coord','svc6');
 assert.equal(forbidden.status,403);
});

test('SFX subcoordinator three ratings are the exact values viewed by the Crew Head',async()=>{
 const storage=new MemoryStorage();
 const patch=(workerId,changes)=>handleSmallCoord(storage,'demo',{kind:'patch',serviceId:'svc7',workerId,changes});
 const rated=await patch('fict-1',{ratingUniformidad:5,ratingActitud:1,ratingPuntualidad:3});
 assert.equal(rated.ok,true);
 const changeOnlyOne=await patch('fict-1',{ratingActitud:4});
 assert.equal(changeOnlyOne.ok,true);
 const crew=await handleCrewStore(storage,'coord',{kind:'getDoc',code:'svc7',path:['services','svc7','workers','fict-1']},id=>id==='svc7');
 assert.deepEqual(
   ['ratingUniformidad','ratingActitud','ratingPuntualidad'].map(k=>crew.data[k]),
   [5,4,3]
 );
 const returned=await handleSmallCoord(storage,'demo',{kind:'get',serviceId:'svc7'});
 assert.deepEqual(
   ['ratingUniformidad','ratingActitud','ratingPuntualidad'].map(k=>returned.workers.find(w=>w.id==='fict-1')[k]),
   [5,4,3]
 );
 await assert.rejects(()=>patch('fict-8',{ratingPuntualidad:5}),/SFX/);
 assert.equal((await handleSmallCoord(storage,'coord',{kind:'get',serviceId:'svc7'})).status,403);
});
