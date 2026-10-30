import test from 'node:test';
import assert from 'node:assert/strict';
import {handleCrewStore} from '../src/crew-store.mjs';
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
