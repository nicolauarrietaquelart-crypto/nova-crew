/** Crew Control original v11.2.30: Cloudflare Durable Objects document gateway.
 * Fictional demonstration only. Authorized to manage assigned services.
 */
const serviceMeta={
 svc1:{code:'svc1',name:'LUMEN LIVE · PALAU METROPOLITÀ',date:'2026-10-27',venue:'Palau Metropolità',start:'16:00',end:'23:30',manager:'coord',actors:['demo','coord']},
 svc2:{code:'svc2',name:'NEON DISTRICT · ARENA MONTJUÏC',date:'2026-10-31',venue:'Arena Montjuïc',start:'08:00',end:'18:00',manager:'coord',actors:['demo','coord']},
 svc3:{code:'svc3',name:'URBAN WAVE FEST · FÒRUM HALL',date:'2026-11-04',venue:'Fòrum Hall',start:'07:00',end:'19:00',manager:'demo',actors:['demo','coord']},
 svc4:{code:'svc4',name:'ORBIT AWARDS 2026 · RECINTO ARENA',date:'2026-11-11',venue:'Recinto Arena',start:'06:30',end:'20:00',manager:'demo',actors:['demo','coord']}
};
const cap=(x,n=160)=>String(x??'').slice(0,n);
const clone=x=>JSON.parse(JSON.stringify(x));
const time=()=>new Date().toISOString();
const fail=(reason,status=400)=>({ok:false,error:reason,status});
const names={demo:'Pau Ferrer Soler',coord:'Álvaro Costa'};
function seed(code){
 const m=serviceMeta[code];if(!m)return null;
 const scenario='sc-main';
 const teamNames=['GENERAL','LUCES','SONIDO','VIDEO','PUSHERS','FORKLIFTER','CREW HEAD'];
 const teams=teamNames.map((name,i)=>({id:`tm-${i}`,scenarioId:scenario,name,colorName:['NARANJA','VERDE','AMARILLO','ROSA','AZUL','GRIS','GRIS'][i],colorHex:['#f58220','#43a047','#fdd835','#d81b60','#4b69ff','#777','#999'][i],noVest:i>4,sortOrder:i+1}));
 const mk=(id,personal,especialidad,work,team,i,phone='',isc=false)=>({id,serviceDate:m.date,blockId:'load-'+m.code,blockLabel:work,trabajo:work,isReserve:false,personal,especialidad,hLlam:m.start,inicio:m.start,fin:m.end,pausa:'00:30',nDieta:1,isCoordinator:isc,actualStart:'',actualEnd:'',actualPause:'',actualDiet:'',movil:phone,scenarioId:scenario,teamId:team,status:'PENDIENTE',arrivalAt:'',notes:'',ratingUniformidad:0,ratingActitud:0,ratingPuntualidad:0,included:true,page:0,pdfRow:i+1,sortOrder:i+1});
 const work='LOAD IN';const workers={};
 const demoAssigned=m.actors.includes('demo'),coordAssigned=m.actors.includes('coord');
 let order=0;
 if(coordAssigned)workers.coord=mk('coord',names.coord, m.manager==='coord'?'CREW HEAD':code==='svc4'?'CREW HEAD':'HAND A',work,m.manager==='coord'?'tm-6':'tm-1',order++,'664 690 034',m.manager==='coord');
 if(demoAssigned)workers.demo=mk('demo',names.demo,m.manager==='demo'?'CREW HEAD':code==='svc2'?'FORKLIFTER':'HAND B',work,m.manager==='demo'?'tm-6':code==='svc2'?'tm-5':'tm-0',order++,'670 555 221',m.manager==='demo');
 const people=['Marina Torres','Sergio Alarcón','Carla Vidal','Lucas Navarro','Marta Ruiz','Joel Pons','Nuria Esteve','Hugo Serrano'];
 people.forEach((name,i)=>{const id=`fict-${i+1}`;workers[id]=mk(id,name,i===6?'FORKLIFTER':'HAND A',work,`tm-${i%5}`,order++,'600 000 '+String(110+i).padStart(3,'0'))});
 return {root:{code:m.code,serviceName:m.name,serviceDate:m.date,venue:m.venue,pdfName:'',workOrder:[work],hiddenWorkTypes:[],createdAt:time(),updatedAt:time(),closed:false,closedAt:'',finalPdfId:'',finalPdfUrl:'',scenarios:[{id:scenario,name:'Escenario principal',sortOrder:1}],teams,requirements:[],audit:[]},workers,incidents:{}};
}
function isDoc(path){return (path.length===2||path.length===4)&&path[0]==='services'&&path.length%2===0;}
function isCollection(path){return (path.length===3)&&path[0]==='services'&&['workers','incidents'].includes(path[2]);}
function pathDoc(rec,path){if(path.length===2)return rec.root;return rec[path[2]]?.[path[3]]??null;}
function docSet(rec,path,value,merge){const prior=pathDoc(rec,path)||{};const data=merge?{...prior,...value}:value;if(path.length===2){rec.root=data;}else{rec[path[2]][path[3]]=data;}}
function docDelete(rec,path){if(path.length===2)throw new Error('No se puede eliminar el servicio completo desde Crew Control.');delete rec[path[2]][path[3]];}
function validatePath(input){if(!Array.isArray(input)||input.some(s=>typeof s!=='string'||!s||s.length>140))return null;return input;}
/** Response plain objects -> outer Worker turns into JSON HTTP. */
export async function handleCrewStore(storage,actor,body,allow){
 const command=cap(body?.kind,24);
 if(command==='create'){
   if(!['demo','coord'].includes(actor))return fail('No autorizado.',403);
   const code='9'+Math.floor(Math.random()*90000+10000);
   const root={code,serviceName:'SERVICIO DEMO',serviceDate:'',venue:'',pdfName:'',workOrder:[],hiddenWorkTypes:[],createdAt:time(),updatedAt:time(),closed:false,closedAt:'',finalPdfId:'',finalPdfUrl:'',scenarios:[],teams:[],requirements:[],audit:[]};
   await storage.put(`crew-full/${code}`,{root,workers:{},incidents:{}});
   await storage.put(`crew-owner/${code}`,actor);
   return {ok:true,code};
 }
 const path=validatePath(body?.path);const ops=body?.ops;
 const code=cap(body?.code||path?.[1]||'',40);
 if(!/^(svc[1-4]|9\d{5})$/.test(code))return fail('Servicio desconocido.',404);
 const owner=code.startsWith('9')?await storage.get(`crew-owner/${code}`):null;
 if(!allow(code)&&owner!==actor)return fail('No tienes permisos para gestionar este servicio.',403);
 const key=`crew-full/${code}`;
 let record=await storage.get(key);
 if(!record){record=seed(code);if(!record)return fail('Servicio no inicializado.',404);await storage.put(key,record);}
 if(command==='init')return {ok:true,root:record.root,workers:Object.values(record.workers),incidents:Object.values(record.incidents)};
 if(command==='getDoc' && isDoc(path)&&path[1]===code)return {ok:true,exists:Boolean(pathDoc(record,path)),data:pathDoc(record,path)||null};
 if(command==='getCollection'&&isCollection(path)&&path[1]===code)return {ok:true,docs:Object.entries(record[path[2]]).map(([id,data])=>({id,data}))};
 if(command==='batch'){
   if(!Array.isArray(ops)||!ops.length||ops.length>400)return fail('Número de operaciones no permitido.');
   if(JSON.stringify(ops).length>800000)return fail('Datos demasiado grandes.',413);
   for(const op of ops){
     const p=validatePath(op.path);
     if(!isDoc(p)||p[1]!==code||!['set','delete'].includes(op.type)|| (op.type==='set'&&(!op.data||typeof op.data!=='object'||Array.isArray(op.data))))return fail('Operación de documento incorrecta.');
     if(p.length===4&&!['workers','incidents'].includes(p[2]))return fail('Colección no permitida.');
     if(p.length===4&&!/^[\w.-]{1,120}$/.test(p[3]))return fail('Identificador no válido.');
   }
   const touched=[];
   await storage.transaction(async tx=>{
     let next=await tx.get(key)||record;
     next=clone(next);
     for(const op of ops){
       if(op.type==='delete')docDelete(next,op.path);
       else docSet(next,op.path,clone(op.data),Boolean(op.merge));
       if(op.path.length===4&&op.path[2]==='workers')touched.push(op.path[3]);
     }
     next.root.updatedAt=time();
     await tx.put(key,next);
     record=next;
     // Sync the demo QR attendance with the actual Crew Control status.
     for(const who of new Set(touched)){
       if(!['demo','coord'].includes(who))continue;
       const w=next.workers[who];
       if(w?.status==='PRESENTE'){
         const previous=await tx.get(`attendance/${code}/${who}`);
         if(!previous){await tx.put(`attendance/${code}/${who}`,{serviceId:code,workerId:who,workerName:w.personal,category:w.especialidad,team:w.teamId,start:w.actualStart||w.inicio,end:w.actualEnd||w.fin,status:'PRESENTE',method:'CREW_CONTROL',scannedBy:actor,time:time()});}
       }
     }
   });
   return {ok:true,updated:ops.length};
 }
 return fail('Operación de Crew Control desconocida.',404);
}
