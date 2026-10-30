/* NOVA Crew v14 — Cloudflare Workers + SQLite Durable Object.
   DEMONSTRATION ONLY. Credentials are public demo credentials.
   No real staff, payroll or employment data should be used. */

const DEMO_ACCOUNTS = {
  demo: {password:'crew2026',assigned:['svc1','svc2','svc3','svc4','svc5'],canScan:['svc3','svc4']},
  coord:{password:'coord2026',assigned:['svc1','svc2','svc3'],canScan:['svc1','svc2']}
};
const DEMO_SERVICES = {
  svc1:{name:'LUMEN LIVE · PALAU METROPOLITÀ',category:'HAND B',team:'STAGE',start:'16:00',end:'23:30',coordinator:true},
  svc2:{name:'NEON DISTRICT · ARENA MONTJUÏC',category:'FORKLIFTER',team:'LOGÍSTICA',start:'08:00',end:'18:00',coordinator:true},
  svc3:{name:'URBAN WAVE FEST · FÒRUM HALL',category:'CREW HEAD',team:'PRINCIPAL',start:'07:00',end:'19:00',coordinator:true},
  svc4:{name:'ORBIT AWARDS 2026 · RECINTO ARENA',category:'CREW HEAD',team:'OPERACIONES',start:'06:30',end:'20:00',coordinator:true},
  svc5:{name:'ELECTRA LIVE · SANT JORDI HUB',category:'HAND A',team:'VÍDEO',start:'13:00',end:'23:00',coordinator:false}
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
const assignment=(who,serviceId)=>who==='coord'&&serviceId==='svc3'?{category:'HAND A',team:'LUCES'}:{category:DEMO_SERVICES[serviceId].category,team:DEMO_SERVICES[serviceId].team};
const assigned=(who,id)=>Boolean(DEMO_ACCOUNTS[who]?.assigned.includes(id)&&DEMO_SERVICES[id]);

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
      if(op==='me')return json({ok:true,user:actor,profile:await profile(actor)});
      if(op==='saveProfile'){
        if(request.method!=='POST')return bad('Método no permitido.',405);
        const data=body.profile||{};
        const safe={firstName:cleanName(data.firstName).slice(0,70),lastName:cleanName(data.lastName).slice(0,100),phone:st(data.phone,30).replace(/[<>\u0000-\u001f]/g,'')};
        if(!safe.firstName||!safe.lastName)return bad('Nombre y apellidos obligatorios.');
        await put('profile/'+actor,safe);
        return json({ok:true,profile:safe});
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
          if(!DEMO_ACCOUNTS[actor].canScan.includes(id))return {error:'No coordinas este servicio.',status:403};
          if(expected&&id!==expected)return {error:'Este QR pertenece a otro servicio.'};
          const active=await tx.get(`active/${worker}/${id}`);
          if(!active||active.digest!==digest)return {error:'Este QR ha sido sustituido por otro.'};
          const p={...defaults(worker),...((await tx.get('profile/'+worker))||{})};
          const coordinator={...defaults(actor),...((await tx.get('profile/'+actor))||{})};
          const record=makeRecord(worker,id,'QR',visible(coordinator).name,p);
          await tx.put(key,{...ticket,used:true,usedBy:actor,usedAt:Date.now()});
          await tx.delete(`active/${worker}/${id}`);
          await tx.put(`attendance/${id}/${worker}`,record);
          return {record};
        });
        return outcome.error?bad(outcome.error,outcome.status||400):json({ok:true,record:outcome.record});
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
