import {handleCrewStore,handleSmallCoord} from './crew-store.mjs';
/* NOVA Crew v14 — Cloudflare Workers + SQLite Durable Object.
   DEMONSTRATION ONLY. Credentials are public demo credentials.
   No real staff, payroll or employment data should be used. */

const DEMO_ACCOUNTS = {
  demo: {password:'crew2026',assigned:['svc1','svc2','svc3','svc4','svc5','svc6','svc7','svc8'],canScan:['svc3','svc4','svc6','svc7']},
  coord:{password:'coord2026',assigned:['svc1','svc2','svc3','svc4','svc7','svc8'],canScan:['svc1','svc2','svc4','svc7','svc8']}
};
const DEMO_SERVICES = {
  svc1:{name:'LUMEN LIVE · PALAU METROPOLITÀ',category:'HAND B',team:'STAGE',start:'16:00',end:'23:30',coordinator:'coord'},
  svc2:{name:'NEON DISTRICT · ARENA MONTJUÏC',category:'FORKLIFTER',team:'LOGÍSTICA',start:'08:00',end:'18:00',coordinator:'coord'},
  svc3:{name:'URBAN WAVE FEST · FÒRUM HALL',category:'CREW HEAD',team:'PRINCIPAL',start:'07:00',end:'19:00',coordinator:'demo'},
  svc4:{name:'ORBIT AWARDS 2026 · RECINTO ARENA',category:'CREW HEAD',team:'OPERACIONES',start:'06:30',end:'20:00',coordinator:'demo',crewHeads:['demo','coord']},
  svc5:{name:'ELECTRA LIVE · SANT JORDI HUB',category:'HAND A',team:'VÍDEO',start:'13:00',end:'23:00',coordinator:null},
  svc6:{name:'LUMINA BUSINESS · SALA CENTRAL',category:'HAND B',team:'GENERAL',start:'09:00',end:'16:00',coordinator:'demo'},
  svc7:{name:'SPECTRUM LIVE · PALAU METROPOLITÀ',category:'HAND B',team:'SFX',start:'07:00',end:'21:00',coordinator:'coord',crewHeads:['coord'],smallCoordinators:{SFX:'demo'}},
  svc8:{name:'DEMO FICHAJE QR · NÀPOLS / AUSIÀS MARC',category:'HAND',team:'STAGE',start:'21:00',end:'23:59',coordinator:'coord'}
};
const TTL_QR = 90_000;
const TTL_SESSION = 8 * 3600_000;
const tokenHex = ()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
const sha = async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),v=>v.toString(16).padStart(2,'0')).join('');
const st = (value,max=100)=>String(value??'').trim().slice(0,max);
const cleanName = s=>st(s,110).replace(/[<>\u0000-\u001f]/g,'').trim();
const validToken = token=>/^[a-f0-9]{64}$/i.test(token);
const equals = (a,b)=>{
  const x=new TextEncoder().encode(a),y=new TextEncoder().encode(b);
  let diff=x.length^y.length;
  for(let i=0;i<Math.max(x.length,y.length);i++)diff|=(x[i]||0)^(y[i]||0);
  return diff===0;
};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate','x-content-type-options':'nosniff'}});
const bad=(error,status=400)=>json({ok:false,error},status);
const defaults=user=>user==='coord'?{firstName:'Álvaro',lastName:'Costa',phone:'664 690 034'}:{firstName:'Pau',lastName:'Ferrer Soler',phone:'670 555 221'};
const visible=p=>({name:`${p.firstName} ${p.lastName}`.trim(),phone:p.phone});
const assignment=(who,serviceId)=>serviceId==='svc7'&&who==='coord'?{category:'CREW HEAD',team:'OPERACIONES'}:serviceId==='svc7'&&who==='demo'?{category:'HAND B',team:'SFX',smallCoordinator:true}:serviceId==='svc6'&&who==='demo'?{category:'HAND B',team:'GENERAL',smallCoordinator:true}:who==='coord'&&serviceId==='svc4'?{category:'CREW HEAD',team:'OPERACIONES'}:DEMO_SERVICES[serviceId].coordinator===who?{category:'COORDINADOR',team:'COORDINACIÓN'}:who==='coord'&&serviceId==='svc3'?{category:'HAND A',team:'LUCES'}:{category:DEMO_SERVICES[serviceId].category,team:DEMO_SERVICES[serviceId].team};
const assigned=(who,id)=>Boolean(DEMO_ACCOUNTS[who]?.assigned.includes(id)&&DEMO_SERVICES[id]);
const manager=(who,id)=>Boolean(DEMO_SERVICES[id]&&(DEMO_SERVICES[id].coordinator===who || (DEMO_SERVICES[id].crewHeads||[]).includes(who)));
const OPEN_SHIFTS=[
{id:'free0',name:'FLASH LOAD · ESTADI BARCELONA',date:'2026-11-03',time:'06:00–14:00',role:'HAND B',venue:'Estadi Barcelona',places:4,urgent:true},
{id:'free1',name:'ATLAS PRODUCTION · PALAU METROPOLITÀ',date:'2026-11-06',time:'09:00–18:00',role:'HAND B',venue:'Palau Metropolità',places:3},
{id:'free2',name:'NIGHT SIGNAL · FÒRUM HALL',date:'2026-11-09',time:'17:00–01:00',role:'HAND A',venue:'Fòrum Hall',places:2},
{id:'free3',name:'CITY LIGHTS · ARENA MONTJUÏC',date:'2026-11-15',time:'08:00–17:00',role:'FORKLIFTER',venue:'Arena Montjuïc',places:1},
{id:'free4',name:'BLUE STAGE · RECINTO CENTRAL',date:'2026-11-18',time:'10:00–19:00',role:'HAND A',venue:'Recinto Central',places:5},
{id:'free5',name:'SOLAR RIGGING · DOCK HALL',date:'2026-11-21',time:'07:00–16:00',role:'HAND B',venue:'Dock Hall',places:2}
];

/**
 * Takes a DurableObjectStorage-like object supporting get/put/transaction.
 * Keeping the logic store-neutral enables the included local Node tests.
 */
export function createDemoApi(storage) {
  const get=key=>storage.get(key);
  const put=(key,value)=>storage.put(key,value);
  const profile=async who=>({...defaults(who),...((await get(`profile/${who}`))||{})});
  async function auth(request){
    const bearer=request.headers.get('authorization')||'';
    if(!/^Bearer [a-f0-9]{64}$/i.test(bearer))return null;
    const ticket=await get('session/'+await sha(bearer.slice(7)));
    if(!ticket||Date.now()>ticket.expiresAt||!DEMO_ACCOUNTS[ticket.user])return null;
    return ticket.user;
  }
  const makeRecord=(who,id,method,by,p)=>({
    eventId:`EV-${tokenHex().slice(0,24)}`,serviceId:id,workerId:who,
    workerName:visible(p).name,...assignment(who,id),start:DEMO_SERVICES[id].start,end:DEMO_SERVICES[id].end,
    method,scannedBy:by,time:new Date().toISOString(),status:'PRESENTE'
  });
  return async function handle(request){
    try{
      const url=new URL(request.url),op=url.searchParams.get('op')||'';
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'allow':'GET, POST, OPTIONS'}});
      if(!['GET','POST'].includes(request.method))return bad('Método no permitido.',405);
      const body=request.method==='POST'?await request.json().catch(()=>({})):{};
      if(op==='login'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.username,30).toLowerCase();
        if(!DEMO_ACCOUNTS[id]||!equals(st(body.password,100),DEMO_ACCOUNTS[id].password))return bad('Usuario o contraseña incorrectos.',401);
        const session=tokenHex();
        await put('session/'+await sha(session),{user:id,expiresAt:Date.now()+TTL_SESSION});
        return json({ok:true,session,user:id,display:visible(await profile(id)).name});
      }
      const actor=await auth(request);
      if(!actor)return bad('Sesión caducada. Entra de nuevo.',401);
      if(op==='resetDemo'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const prefixes=['attendance/','ticket/','active/','small-team/','small-incidents/','crew-full/','crew-owner/','confirmation/','profile/','shift/','interest/'];
        for(const prefix of prefixes){
          const items=await storage.list({prefix});
          for(const key of items.keys())await storage.delete(key);
        }
        return json({ok:true,reset:true});
      }
      if(op==='me')return json({ok:true,user:actor,profile:await profile(actor)});
      if(op==='confirmations'){
        const confirmations={};
        for(const id of DEMO_ACCOUNTS[actor].assigned){
          const value=await get(`confirmation/${actor}/${id}`);
          if(value)confirmations[id]=value;
        }
        return json({ok:true,confirmations});
      }
      if(op==='confirmAssignment'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.serviceId,24),status=st(body.status,24);
        if(!assigned(actor,id))return bad('Servicio no asignado.',403);
        if(!['CONFIRMADO','NO DISPONIBLE','PENDIENTE'].includes(status))return bad('Estado de confirmación incorrecto.');
        const key=`confirmation/${actor}/${id}`;
        const current=await get(key);
        if(current?.status==='CONFIRMADO'&&status!=='CONFIRMADO')return bad('Servicio ya confirmado. Contacta con oficina para cambios.',409);
        const reason=st(body.reason,500);
        if(status==='NO DISPONIBLE'&&!reason)return bad('Indica el motivo de no disponibilidad.');
        const record={status,reason,updatedAt:new Date().toISOString()};
        await put(key,record);
        return json({ok:true,serviceId:id,confirmation:record});
      }
      if(op==='crew'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const result=await handleCrewStore(storage,actor,body,id=>manager(actor,id));
        return json(result,result.status||200);
      }
      if(op==='smallCoord'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        try{const out=await handleSmallCoord(storage,actor,body);return json(out,out.status||200)}catch(error){return bad(error.message||'Error guardando el equipo.',403)}
      }
      if(op==='saveProfile'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const data=body.profile||{};
        const safe={firstName:cleanName(data.firstName).slice(0,70),lastName:cleanName(data.lastName).slice(0,100),phone:st(data.phone,30).replace(/[<>\u0000-\u001f]/g,'')};
        if(!safe.firstName||!safe.lastName)return bad('Nombre y apellidos obligatorios.');
        await put('profile/'+actor,safe);
        return json({ok:true,profile:safe});
      }
      if(op==='roster'){
        const roster={};
        for(const [id,acct] of Object.entries(DEMO_ACCOUNTS)){
          roster[id]={id,...visible(await profile(id)),assigned:acct.assigned};
        }
        const shifts={};for(const id of Object.keys(DEMO_SERVICES))for(const who of Object.keys(DEMO_ACCOUNTS)){const v=await get(`shift/${id}/${who}`);if(v)shifts[`${id}/${who}`]=v;}
        return json({ok:true,roster,shifts,coordinators:Object.fromEntries(Object.entries(DEMO_SERVICES).map(([id,s])=>[id,s.coordinator])),smallCoordinators:{svc6:{GENERAL:'demo'},svc7:{SFX:'demo'}}});
      }
      if(op==='openShifts'){
        const rows=[];for(const s of OPEN_SHIFTS){const v=await get(`interest/${actor}/${s.id}`);const interestCount=(await Promise.all(Object.keys(DEMO_ACCOUNTS).map(id=>get(`interest/${id}/${s.id}`)))).filter(Boolean).length;const remaining=Math.max(0,s.places-interestCount);if(remaining>0)rows.push({...s,places:remaining,interest:v?{status:'ENVIADO',requestedAt:v.requestedAt}:null});}
        return json({ok:true,shifts:rows});
      }
      if(op==='interest'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.shiftId,40),shift=OPEN_SHIFTS.find(s=>s.id===id);if(!shift)return bad('Servicio libre desconocido.',404);
        const key=`interest/${actor}/${id}`;
        if(body.withdraw===true)return bad('Una disponibilidad ya enviada no puede retirarse desde la app. Contacta con oficina.',409);
        const existing=await get(key);if(existing)return json({ok:true,status:'ENVIADO',shiftId:id});const others=(await Promise.all(Object.keys(DEMO_ACCOUNTS).map(who=>get(`interest/${who}/${id}`)))).filter(Boolean).length;if(others>=shift.places)return bad('El servicio ya no tiene plazas disponibles.',409);
        await put(key,{requestedAt:new Date().toISOString()});
        return json({ok:true,status:'ENVIADO',shiftId:id,message:'Interés registrado. La oficina decidirá si asigna el servicio. No se ha asignado.'});
      }
      if(op==='worker'){
        if(!DEMO_ACCOUNTS[actor].canScan.length)return bad('Sin permisos.',403);
        return json({ok:true,id:'demo',...visible(await profile('demo'))});
      }
      if(op==='issue'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.serviceId,20);
        if(!assigned(actor,id))return bad('No tienes asignado ese servicio.',403);
        if(!DEMO_SERVICES[id].coordinator)return bad('Este servicio permite fichar directamente.');
        if(DEMO_SERVICES[id].coordinator===actor)return bad('Eres el único coordinador: ficha tu propio turno desde Fichar como coordinador.');
        const token=tokenHex(),digest=await sha(token),expiresAt=Date.now()+TTL_QR;
        await storage.transaction(async tx=>{
          await tx.put(`ticket/${digest}`,{workerId:actor,serviceId:id,expiresAt,used:false});
          await tx.put(`active/${actor}/${id}`,{digest});
        });
        return json({ok:true,token,expiresAt,serviceName:DEMO_SERVICES[id].name,workerName:visible(await profile(actor)).name,...assignment(actor,id)});
      }
      if(op==='redeem'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const token=st(body.token,90).replace(/^NOVAQR:/,'');
        if(!validToken(token))return bad('Formato de código QR incorrecto.');
        const digest=await sha(token),expected=st(body.expectedService,20);
        // The transaction serializes the one-use check + attendance write, even for two simultaneous phones.
        const outcome=await storage.transaction(async tx=>{
          const key=`ticket/${digest}`,ticket=await tx.get(key);
          if(!ticket||ticket.used||Date.now()>ticket.expiresAt)return {error:'QR caducado o utilizado. Genera otro.'};
          const id=ticket.serviceId,worker=ticket.workerId;
          if(worker===actor)return {error:'No puedes escanear tu propio QR.',status:403};
          if(!manager(actor,id)&&!(actor==='demo'&&id==='svc7'&&assignment(worker,id).team==='SFX'))return {error:'No tienes permisos para escanear personal fuera de tu equipo.',status:403};
          if(expected&&id!==expected)return {error:'Este QR pertenece a otro servicio.'};
          const active=await tx.get(`active/${worker}/${id}`);
          if(!active||active.digest!==digest)return {error:'Este QR ha sido sustituido por otro.'};
          const p={...defaults(worker),...((await tx.get('profile/'+worker))||{})};
          const coordinator={...defaults(actor),...((await tx.get('profile/'+actor))||{})};
          const record=makeRecord(worker,id,'QR',visible(coordinator).name,p);
          await tx.put(key,{...ticket,used:true,usedBy:actor,usedAt:Date.now()});
          await tx.delete(`active/${worker}/${id}`);
          await tx.put(`attendance/${id}/${worker}`,record);
          // Keep the actual roster in sync, so every browser sees PRESENTE after QR validation.
          const rosterKey=['svc1','svc2','svc6'].includes(id)?`small-team/${id}`:`crew-full/${id}`;
          const roster=await tx.get(rosterKey);
          if(roster){
            if(rosterKey.startsWith('small-team/')){
              const person=roster.workers?.find(w=>w.id===worker);
              if(person){person.status='PRESENTE';person.qrScannedAt=record.time;await tx.put(rosterKey,roster);}
            }else{
              const person=roster.workers?.[worker];
              if(person){person.status='PRESENTE';person.arrivalAt=record.time;person.qrScannedAt=record.time;await tx.put(rosterKey,roster);}
            }
          }
          return {record};
        });
        return outcome.error?bad(outcome.error,outcome.status||400):json({ok:true,record:outcome.record});
      }
      if(op==='selfClock'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.serviceId,20);
        if(!assigned(actor,id)||!manager(actor,id))return bad('Solo personal con gestión del servicio puede fichar su propio turno.',403);
        const p=await profile(actor);
        const record=makeRecord(actor,id,'GESTOR','FICHAJE PROPIO',p);
        await put(`attendance/${id}/${actor}`,record);
        return json({ok:true,record});
      }
      if(op==='updateShift'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.serviceId,20),who=st(body.workerId||actor,20);
        if(!assigned(who,id)||!manager(actor,id))return bad('Solo el coordinador o un Crew Head autorizado puede modificar turnos.',403);
        const start=st(body.start,5),end=st(body.end,5);
        if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end))return bad('Horario incorrecto.');
        await put(`shift/${id}/${who}`,{start,end,updatedAt:new Date().toISOString(),updatedBy:actor});
        const existing=await get(`attendance/${id}/${who}`);if(existing)await put(`attendance/${id}/${who}`,{...existing,start,end});
        return json({ok:true,workerId:who,serviceId:id,start,end});
      }
      if(op==='direct'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const id=st(body.serviceId,20);
        if(!assigned(actor,id))return bad('No tienes asignado ese servicio.',403);
        if(DEMO_SERVICES[id].coordinator)return bad('Este bolo requiere QR.');
        const p=await profile(actor),record=makeRecord(actor,id,'DIRECTO','AUTOMÁTICO',p);
        await put(`attendance/${id}/${actor}`,record);
        return json({ok:true,record});
      }
      if(op==='attendance'){
        const filter=st(url.searchParams.get('serviceId'),20);
        if(filter&&!assigned(actor,filter)&&!DEMO_ACCOUNTS[actor].canScan.includes(filter))return bad('Sin acceso a este servicio.',403);
        const ids=(filter?[filter]:Object.keys(DEMO_SERVICES)).filter(id=>assigned(actor,id)||DEMO_ACCOUNTS[actor].canScan.includes(id));
        const keys=ids.flatMap(id=>Object.keys(DEMO_ACCOUNTS).filter(who=>who===actor||DEMO_ACCOUNTS[actor].canScan.includes(id)).map(who=>`attendance/${id}/${who}`));
        const records=(await Promise.all(keys.map(get))).filter(Boolean).sort((a,b)=>a.time.localeCompare(b.time));
        return json(records);
      }
      return bad('Operación desconocida.',404);
    }catch(error){
      console.error('NOVA Crew demo API:',error);
      return bad('Error temporal del servidor de demostración.',500);
    }
  };
}

/** Single shared Durable Object contains all fictional demo users and QR state. */
export class DemoState {
  constructor(ctx){
    this.ctx=ctx;
    this.api=createDemoApi(ctx.storage);
  }
  async fetch(request){return this.api(request);}
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api'){
      if(!env.NOVA_STATE)return bad('Almacenamiento no configurado.',503);
      const id=env.NOVA_STATE.idFromName('nova-crew-v14-demo-shared');
      return env.NOVA_STATE.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
