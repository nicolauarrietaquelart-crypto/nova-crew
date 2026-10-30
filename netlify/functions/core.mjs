import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

// NOVA Crew: demo-only identity / service matrix. No real worker information.
const accounts = {
  demo: { password: 'crew2026', name: 'Pau Ferrer Soler', assigned: ['svc1','svc2','svc3','svc4','svc5'], canScan: ['svc3','svc4'] },
  coord: { password: 'coord2026', name: 'Álvaro Costa', assigned: ['svc1','svc2','svc3'], canScan: ['svc1','svc2'] }
};
const services = {
  svc1: { name:'LUMEN LIVE · PALAU METROPOLITÀ', category:'HAND B', team:'STAGE', start:'16:00', end:'23:30', coordinator:true },
  svc2: { name:'NEON DISTRICT · ARENA MONTJUÏC', category:'FORKLIFTER', team:'LOGÍSTICA', start:'08:00', end:'18:00', coordinator:true },
  svc3: { name:'URBAN WAVE FEST · FÒRUM HALL', category:'CREW HEAD', team:'PRINCIPAL', start:'07:00', end:'19:00', coordinator:true },
  svc4: { name:'ORBIT AWARDS 2026 · RECINTO ARENA', category:'CREW HEAD', team:'OPERACIONES', start:'06:30', end:'20:00', coordinator:true },
  svc5: { name:'ELECTRA LIVE · SANT JORDI HUB', category:'HAND A', team:'VÍDEO', start:'13:00', end:'23:00', coordinator:false }
};
const TOKEN_TTL = 90_000;
const SESSION_TTL = 8 * 3600_000;
const sha = value => createHash('sha256').update(value).digest('hex');
const reply = (data,status=200)=> new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const fail=(message,status=400)=>reply({ok:false,error:message},status);
const str=(value,max=100)=>String(value??'').trim().slice(0,max);
const isMatch=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
const profileDefault = who => who==='coord'
  ? {firstName:'Álvaro',lastName:'Costa',phone:'664 690 034'}
  : {firstName:'Pau',lastName:'Ferrer Soler',phone:'670 555 221'};
const profileView = p => ({name:`${p.firstName} ${p.lastName}`.trim(),phone:p.phone});

/** Injection of a Netlify Blobs-compatible store allows deterministic local tests. */
export function createDemoApi(store){
  const get=key=>store.get(key,{type:'json',consistency:'strong'});
  const put=(key,value,options)=>store.setJSON(key,value,options);
  const getProfile = async id=>({ ...profileDefault(id),...((await get(`profile/${id}`))||{}) });
  const checkAssigned=(id,serviceId)=>Boolean(accounts[id]?.assigned.includes(serviceId)&&services[serviceId]);
  const getAuth = async request=>{
    const bearer=request.headers.get('authorization')||'';
    if(!/^Bearer [a-f0-9]{64}$/i.test(bearer))return null;
    const ticket=await get(`session/${sha(bearer.slice(7))}`);
    if(!ticket||Date.now()>ticket.expiresAt||!accounts[ticket.user])return null;
    return ticket.user;
  };
  async function register(workerId,serviceId,method,scannedBy){
    const s=services[serviceId],p=await getProfile(workerId);
    // A coordinator can also work as HAND in a different service.
    const assignment=workerId==='coord'&&serviceId==='svc3'?{category:'HAND A',team:'LUCES'}:{category:s.category,team:s.team};
    const record={eventId:`EV-${randomBytes(12).toString('hex')}`,serviceId,workerId,workerName:profileView(p).name,category:assignment.category,team:assignment.team,start:s.start,end:s.end,method,scannedBy,time:new Date().toISOString(),status:'PRESENTE'};
    await put(`attendance/${serviceId}/${workerId}`,record);
    return {ok:true,record};
  }
  return async function api(request){
    try{
      const url=new URL(request.url);
      const op=url.searchParams.get('op')||'';
      if(request.method==='OPTIONS')return new Response(null,{status:204});
      const body=request.method==='POST' ? await request.json().catch(()=>({})) : {};
      if(op==='login'){
        if(request.method!=='POST')return fail('Método no permitido.',405);
        const id=str(body.username,30).toLowerCase();
        if(!accounts[id]||!isMatch(str(body.password,100),accounts[id].password))return fail('Usuario o contraseña incorrectos.',401);
        const session=randomBytes(32).toString('hex');
        await put(`session/${sha(session)}`,{user:id,expiresAt:Date.now()+SESSION_TTL});
        return reply({ok:true,session,user:id,display:accounts[id].name});
      }
      const actor=await getAuth(request);
      if(!actor)return fail('Sesión caducada. Entra de nuevo.',401);
      if(op==='me')return reply({ok:true,user:actor,profile:await getProfile(actor)});
      if(op==='saveProfile'){
        if(request.method!=='POST')return fail('Método no permitido.',405);
        const p=body.profile||{};
        const safe={firstName:str(p.firstName,70),lastName:str(p.lastName,100),phone:str(p.phone,30)};
        if(!safe.firstName||!safe.lastName)return fail('Nombre y apellidos obligatorios.');
        await put(`profile/${actor}`,safe);
        return reply({ok:true,profile:safe});
      }
      if(op==='worker'){
        // Employee profile is visible only to service coordinators.
        if(!accounts[actor].canScan.length)return fail('Sin permisos.',403);
        return reply({id:'demo',...profileView(await getProfile('demo'))});
      }
      if(op==='issue'){
        if(request.method!=='POST')return fail('Método no permitido.',405);
        const serviceId=str(body.serviceId,20);
        if(!checkAssigned(actor,serviceId))return fail('No tienes asignado ese servicio.',403);
        if(!services[serviceId].coordinator)return fail('En este servicio puedes fichar directamente.');
        const token=randomBytes(32).toString('hex');
        const expiresAt=Date.now()+TOKEN_TTL;
        // Only token hash is stored on the server. Issuing a new QR supersedes the old one.
        await put(`ticket/${sha(token)}`,{workerId:actor,serviceId,expiresAt,used:false});
        await put(`active/${actor}/${serviceId}`,{digest:sha(token)});
        const p=await getProfile(actor);
        const assignment=actor==='coord'&&serviceId==='svc3'?{category:'HAND A',team:'LUCES'}:{category:services[serviceId].category,team:services[serviceId].team};
        return reply({ok:true,token,expiresAt,serviceName:services[serviceId].name,workerName:profileView(p).name,...assignment});
      }
      if(op==='redeem'){
        if(request.method!=='POST')return fail('Método no permitido.',405);
        const token=str(body.token,90).replace(/^NOVAQR:/,'');
        const digest=/^[a-f0-9]{64}$/i.test(token)?sha(token):'';
        if(!digest)return fail('Formato del código QR incorrecto.');
        const ticketKey=`ticket/${digest}`;
        const entry=await store.getWithMetadata(ticketKey,{type:'json',consistency:'strong'});
        if(!entry?.data||entry.data.used||Date.now()>entry.data.expiresAt)return fail('QR caducado o utilizado. Genera otro.');
        const data=entry.data, serviceId=data.serviceId;
        if(data.workerId===actor)return fail('No puedes escanear tu propio QR.',403);
        if(!accounts[actor].canScan.includes(serviceId))return fail('No coordinas este servicio.',403);
        const expected=str(body.expectedService,20);
        if(expected&&serviceId!==expected)return fail('Este QR pertenece a otro servicio.');
        const active=await get(`active/${data.workerId}/${serviceId}`);
        if(!active||active.digest!==digest)return fail('Este QR ha sido sustituido por otro.');
        // Compare-and-set guarantees only one redemption succeeds even with two scanners.
        const consumed=await put(ticketKey,{...data,used:true,usedBy:actor,usedAt:Date.now()},{onlyIfMatch:entry.etag});
        if(!consumed?.modified)return fail('Este QR ya ha sido utilizado.');
        const scannedBy=profileView(await getProfile(actor)).name;
        return reply(await register(data.workerId,serviceId,'QR',scannedBy));
      }
      if(op==='direct'){
        if(request.method!=='POST')return fail('Método no permitido.',405);
        const serviceId=str(body.serviceId,20);
        if(!checkAssigned(actor,serviceId))return fail('No tienes asignado este servicio.',403);
        if(services[serviceId].coordinator)return fail('Este bolo requiere QR.');
        return reply(await register(actor,serviceId,'DIRECTO','AUTOMÁTICO'));
      }
      if(op==='attendance'){
        const serviceId=str(url.searchParams.get('serviceId'),20);
        if(serviceId&&!checkAssigned(actor,serviceId)&&!accounts[actor].canScan.includes(serviceId))return fail('Sin acceso a este servicio.',403);
        const eligible=(serviceId?[serviceId]:Object.keys(services)).filter(s=>checkAssigned(actor,s)||accounts[actor].canScan.includes(s));
        const records=await Promise.all(eligible.flatMap(s=>Object.keys(accounts).filter(a=>a===actor||accounts[actor].canScan.includes(s)).map(id=>get(`attendance/${s}/${id}`))));
        return reply(records.filter(Boolean).sort((a,b)=>a.time.localeCompare(b.time)));
      }
      return fail('Operación desconocida.',404);
    }catch(err){
      // Avoid exposing Blob credentials, stack traces or internal provider messages to clients.
      console.error('NOVA demo API failure:',err);
      return fail('Error del servidor de la demo. Revisa los logs de Netlify Functions.',500);
    }
  };
}
