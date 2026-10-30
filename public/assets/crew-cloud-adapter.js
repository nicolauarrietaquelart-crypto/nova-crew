/* Cloudflare Firestore-compatible gateway for Crew Control v11.2.30.
   Uses the existing NOVA_API auth token in the same-origin parent window.
   No Firebase SDK, keys, external database or live company information. */
(function(){
'use strict';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const endpoint=async data=>{
  if(window.parent===window||!window.parent.NOVA_API?.crewRequest)throw new Error('Abre Crew Control desde NOVA Crew con una sesión válida.');
  return window.parent.NOVA_API.crewRequest(data);
};
const ref=(kind,path)=>({kind,path,id:path[path.length-1]});
const snap=(r,data)=>({id:r.id,ref:r,exists:()=>data!==null&&data!==undefined,data:()=>data===undefined?undefined:data});
const fetchData=async r=>endpoint({kind:r.kind==='doc'?'getDoc':'getCollection',path:r.path});
function docsSnapshot(r,d,old){
 const docs=(d?.docs||[]).map(row=>snap(ref('doc',[...r.path,row.id]),row.data));
 const prior=old||new Map();
 const current=new Map(docs.map(doc=>[doc.id,JSON.stringify(doc.data())]));
 const changes=[];
 for(const doc of docs){const oldJson=prior.get(doc.id);const now=JSON.stringify(doc.data());if(oldJson===undefined)changes.push({type:'added',doc});else if(oldJson!==now)changes.push({type:'modified',doc});}
 for(const [id] of prior){if(!current.has(id))changes.push({type:'removed',doc:snap(ref('doc',[...r.path,id]),null)});}
 return {docs,docChanges:()=>changes,current};
}
const fs={
 doc:(_db,...path)=>ref('doc',path),
 collection:(_db,...path)=>ref('collection',path),
 async getDoc(r){const data=await fetchData(r);return snap(r,data.data);},
 async getDocs(r){const data=await fetchData(r);return docsSnapshot(r,data);},
 async setDoc(r,data,options={}){return endpoint({kind:'batch',code:r.path[1],ops:[{type:'set',path:r.path,data,merge:!!options.merge}]});},
 async deleteDoc(r){return endpoint({kind:'batch',code:r.path[1],ops:[{type:'delete',path:r.path}]});},
 writeBatch(){const ops=[];return {set(r,data,opt){ops.push({type:'set',path:r.path,data,merge:!!opt?.merge})},delete(r){ops.push({type:'delete',path:r.path})},async commit(){if(!ops.length)return;return endpoint({kind:'batch',code:ops[0].path[1],ops})}};},
 onSnapshot(r,onNext,onError){
   let active=true,prevDoc=undefined,prevDocs=null,busy=false;
   const tick=async()=>{if(!active||busy)return;busy=true;try{
     const d=await fetchData(r);
     if(!active)return;
     if(r.kind==='doc'){
       const now=JSON.stringify(d.data??null);
       if(now!==prevDoc){prevDoc=now;onNext(snap(r,d.data));}
     }else{
       const result=docsSnapshot(r,d,prevDocs);const now=result.current;
       if(prevDocs===null||result.docChanges().length){prevDocs=now;onNext(result)}
     }
   }catch(error){if(active&&typeof onError==='function')onError(error)}finally{busy=false}};
   tick();const id=setInterval(tick,4500);
   return ()=>{active=false;clearInterval(id)};
 }
};
window.CREW_CLOUDFLARE_FS=fs;
window.CREW_CLOUDFLARE_REQUEST=endpoint;
})();
