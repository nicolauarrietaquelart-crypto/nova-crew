/** Crew Control original v11.2.30: Cloudflare Durable Objects document gateway.
 * Fictional demonstration only. Authorized to manage assigned services.
 */
const serviceMeta={
 svc1:{code:'svc1',name:'LUMEN LIVE · PALAU METROPOLITÀ',date:'2026-10-27',venue:'Palau Metropolità',start:'16:00',end:'23:30',manager:'coord',actors:['demo','coord']},
 svc2:{code:'svc2',name:'NEON DISTRICT · ARENA MONTJUÏC',date:'2026-10-31',venue:'Arena Montjuïc',start:'08:00',end:'18:00',manager:'coord',actors:['demo','coord']},
 svc3:{code:'svc3',name:'URBAN WAVE FEST · FÒRUM HALL',date:'2026-11-04',venue:'Fòrum Hall',start:'07:00',end:'19:00',manager:'demo',actors:['demo','coord']},
 svc4:{code:'svc4',name:'ORBIT AWARDS 2026 · RECINTO ARENA',date:'2026-11-11',venue:'Recinto Arena',start:'06:30',end:'20:00',manager:'demo',actors:['demo','coord']},
 svc7:{code:'svc7',name:'SPECTRUM LIVE · PALAU METROPOLITÀ',date:'2026-11-19',venue:'Palau Metropolità',start:'07:00',end:'21:00',manager:'coord',actors:['demo','coord']}
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
 if(code==='svc7'){
  teams.push({id:'tm-sfx',scenarioId:scenario,name:'SFX',colorName:'VIOLETA',colorHex:'#8e44ad',noVest:false,sortOrder:8});
  const localIds=['demo','fict-1','fict-2','fict-3'];
  for(const id of localIds){
    const w=workers[id];if(!w)continue;
    w.teamId='tm-sfx';w.trabajo='SFX';w.blockLabel='SFX';w.blockId='sfx-svc7';
    if(id==='demo'){w.especialidad='HAND B';w.isCoordinator=false;w.isSubCoordinator=true;w.subCoordinatorScope='SFX';w.notes='Coordinador del equipo SFX';}
  }
}
return {root:{code:m.code,serviceName:m.name,serviceDate:m.date,venue:m.venue,pdfName:'',workOrder:code==='svc7'?['LOAD IN','SFX']:[work],hiddenWorkTypes:[],createdAt:time(),updatedAt:time(),closed:false,closedAt:'',finalPdfId:'',finalPdfUrl:'',scenarios:[{id:scenario,name:'Escenario principal',sortOrder:1}],teams,requirements:[],audit:[]},workers,incidents:{}};
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
 if(!/^(svc[1-4]|svc7|9\d{5})$/.test(code))return fail('Servicio desconocido.',404);
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

/** Normal HAND coordinators have a strictly scoped operational view.
 * svc6: four HANDS including Pau. svc7: SFX subteam inside Álvaro's full Crew Control.
 * Changes to svc7 share the SAME crew-full document used by the Crew Head.
 */
export async function handleSmallCoord(storage,actor,body){
  const code=String(body?.serviceId||'');
  if(!((actor==='demo'&&['svc6','svc7'].includes(code))||(actor==='coord'&&['svc1','svc2'].includes(code))))return fail('No autorizado para este equipo.',403);
  const key=code==='svc7'?'crew-full/svc7':`small-team/${code}`;
  let doc=await storage.get(key);
  if(!doc){
    if(code==='svc7'){
      await handleCrewStore(storage,'coord',{kind:'init',code:'svc7'},()=>true);
      doc=await storage.get(key);
    }else{
      const base={start:code==='svc2'?'08:00':code==='svc1'?'16:00':'09:00',end:code==='svc2'?'18:00':code==='svc1'?'23:30':'16:00',status:'PENDIENTE',pause:'00:30',diet:'No',rating:0,ratingUniformidad:0,ratingActitud:0,ratingPuntualidad:0,incident:''};
      doc={workers:code==='svc6'?[
        {id:'demo',name:'Pau Ferrer Soler',role:'HAND B',phone:'670 555 221',...base,isCoordinator:true},
        {id:'small-1',name:'Marc Vidal',role:'HAND B',phone:'600 000 141',...base},
        {id:'small-2',name:'Laia Costa',role:'HAND A',phone:'600 000 142',...base},
        {id:'small-3',name:'Pol Navarro',role:'HAND B',phone:'600 000 143',...base}
      ]:[{id:'coord',name:'Álvaro Costa',role:'HAND B',phone:'664 690 034',...base,isCoordinator:true},...Array.from({length:code==='svc2'?6:8},(_,i)=>({id:`${code}-hand-${i+1}`,name:['Marina Torres','Sergio Alarcón','Carla Vidal','Marc Vidal','Laia Costa','Pol Navarro','Ana Ruiz','David Soto'][i],role:i===2?'FORKLIFTER':i%3===0?'HAND A':'HAND B',phone:`600 000 ${String(i+1).padStart(3,'0')}`,...base}))]};
      await storage.put(key,doc);
    }
  }
  const mapped=()=>{
    if(code!=='svc7')return doc.workers.map(w=>({...w,
      ratingUniformidad:Number(w.ratingUniformidad??0),
      ratingActitud:Number(w.ratingActitud??w.rating??0),
      ratingPuntualidad:Number(w.ratingPuntualidad??0)
    }));
    const allowed=new Set(['demo','fict-1','fict-2','fict-3']);
    return Object.values(doc.workers).filter(w=>allowed.has(w.id)&&w.trabajo==='SFX').map(w=>({
      id:w.id,name:w.personal,role:w.especialidad,phone:w.movil||'',start:w.actualStart||w.inicio,
      end:w.actualEnd||w.fin,status:w.status||'PENDIENTE',pause:w.pausa||'00:30',
      diet:String(w.nDieta??0),rating:w.ratingActitud||0,ratingUniformidad:Number(w.ratingUniformidad||0),ratingActitud:Number(w.ratingActitud||0),ratingPuntualidad:Number(w.ratingPuntualidad||0),incident:w.notes||'',
      isCoordinator:!!w.isSubCoordinator
    }));
  };
  const kind=String(body?.kind||'get');
  if(kind==='get')return {ok:true,serviceId:code,scope:code==='svc7'?'SFX':code==='svc2'?'LOGÍSTICA':code==='svc1'?'STAGE':'GENERAL',workers:mapped()};
  if(kind!=='patch')return fail('Operación no permitida.',400);
  const id=String(body?.workerId||'').slice(0,48);
  const change=body?.changes;
  if(!change||typeof change!=='object'||Array.isArray(change))return fail('Modificación inválida.');
  const ratingFields=['ratingUniformidad','ratingActitud','ratingPuntualidad'];
  const permitted=['start','end','status','pause','diet','role','rating','incident',...ratingFields];
  if(Object.keys(change).some(k=>!permitted.includes(k)))return fail('Solo puedes editar horarios, estado y valoración de tu equipo.',403);
  if(['start','end'].some(k=>change[k]!==undefined&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(change[k]))))return fail('Horario no válido.');
  const accepted=['PENDIENTE','PRESENTE','CONTACTADO','NO CONTACTADO','NO PRESENTADO'];
  if(change.status!==undefined&&!accepted.includes(change.status))return fail('Estado no permitido.');
  if(change.role!==undefined&&(typeof change.role!=='string'||change.role.length>60||!change.role.trim()))return fail('Puesto no válido.',400);
  if(change.diet!==undefined&&!/^[0-3]$/.test(String(change.diet))&&!['Sí','No'].includes(change.diet))return fail('Dietas no válidas.',400);
  if(change.pause!==undefined&&!['00:00','00:15','00:30','00:45','01:00','01:30','02:00'].includes(change.pause))return fail('Pausa no válida.',400);
  // Validate individually. A legacy single rating changes only Actitud.
  for(const field of [...ratingFields,'rating']){
    if(change[field]===undefined)continue;
    if(typeof change[field]!=='number'||!Number.isInteger(change[field])||change[field]<0||change[field]>5)
      return fail('Las valoraciones deben ser estrellas enteras entre 0 y 5.',400);
  }
  if(change.rating!==undefined&&change.ratingActitud!==undefined)return fail('Valoración de actitud duplicada.',400);
  let updated=null;
  await storage.transaction(async tx=>{
    const rec=await tx.get(key)||doc;
    if(code!=='svc7'){
      const w=rec.workers.find(w=>w.id===id);
      if(!w)throw new Error('Este trabajador no pertenece al equipo.');
      for(const field of permitted){
        if(change[field]===undefined)continue;
        if(field==='rating'){w.rating=change.rating;w.ratingActitud=change.rating;}
        else if(ratingFields.includes(field)){w[field]=change[field];if(field==='ratingActitud')w.rating=change[field];}
        else if(field==='diet')w.diet=change.diet==='Sí'?'1':change.diet==='No'?'0':String(change.diet);
        else w[field]=String(change[field]).slice(0,200);
      }
      updated={...w};
    }else{
      const allowed=['demo','fict-1','fict-2','fict-3'];
      const w=allowed.includes(id)?rec.workers[id]:null;
      if(!w||w.trabajo!=='SFX')throw new Error('Solo puedes gestionar trabajadores de SFX.');
      if(change.start!==undefined)w.actualStart=change.start;
      if(change.end!==undefined)w.actualEnd=change.end;
      if(change.status!==undefined)w.status=change.status;
      if(change.pause!==undefined)w.pausa=String(change.pause).slice(0,12);
      if(change.diet!==undefined)w.nDieta=change.diet==='Sí'?1:change.diet==='No'?0:Number(change.diet);
      for(const field of ratingFields){if(change[field]!==undefined)w[field]=change[field];}
      if(change.rating!==undefined)w.ratingActitud=change.rating;
      if(change.role!==undefined)w.especialidad=String(change.role).slice(0,60);
      if(change.incident!==undefined)w.notes=String(change.incident).slice(0,200);
      updated={...w};
      rec.root.updatedAt=time();
    }
    await tx.put(key,rec);
    doc=rec;
    if(id===actor){
      const start=code!=='svc7'?updated.start:updated.actualStart||updated.inicio;
      const end=code!=='svc7'?updated.end:updated.actualEnd||updated.fin;
      await tx.put(`shift/${code}/${actor}`,{start,end,updatedBy:actor,updatedAt:time()});
      if(change.status==='PRESENTE'){
        const attendanceKey=`attendance/${code}/${actor}`;
        if(!(await tx.get(attendanceKey)))await tx.put(attendanceKey,{serviceId:code,workerId:actor,workerName:actor==='coord'?'Álvaro Costa':'Pau Ferrer Soler',category:'HAND B',team:code==='svc7'?'SFX':code==='svc2'?'LOGÍSTICA':'GENERAL',start,end,status:'PRESENTE',method:'SMALL_COORD',scannedBy:actor,time:time()});
      }
    }
  });
  return {ok:true,serviceId:code,workerId:id,workers:mapped()};
}
