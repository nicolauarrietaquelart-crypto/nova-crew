/* NOVA Crew v13 · Cloudflare Workers · Same-origin API. Demo credentials only. */
(() => {
  'use strict';
  const root='/api';
  let session='';
  let account='';
  async function request(op,payload){
    const isGet=['me','worker','attendance'].includes(op);
    const url=new URL(root,location.origin==='null'?'https://nova.local':location.origin);url.searchParams.set('op',op);
    if(op==='attendance')url.searchParams.set('serviceId',String(payload?.serviceId||''));
    const response=await fetch(url.href,{
      method:isGet?'GET':'POST',
      headers:{...(isGet?{}:{'content-type':'application/json'}), ...(session?{'authorization':`Bearer ${session}`}:{})},
      ...(isGet?{}:{body:JSON.stringify(payload||{})}),
      cache:'no-store',credentials:'same-origin'
    });
    const json=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(json?.error||`Error HTTP ${response.status}`);
    return json;
  }
  window.NOVA_API={
    get account(){return account;},
    login:async(username,password)=>{
      const data=await request('login',{username,password});
      account=data.user;session=data.session;
      return data;
    },
    logout:()=>{account='';session='';},
    me:()=>request('me'),
    saveProfile:profile=>request('saveProfile',{profile}),
    // Adapts previous Apps Script method names to a Cloudflare backend.
    call:async(method,args=[])=>{
      if(!session)throw new Error('Inicia sesión antes de utilizar el fichaje.');
      const a=Array.isArray(args)?args:[];
      switch(method){
        case 'novaIssueQr':return request('issue',{serviceId:a[1]});
        case 'novaRedeemQr':return request('redeem',{token:a[0],expectedService:a[2]||''});
        case 'novaDirectClock':return request('direct',{serviceId:a[1]});
        case 'novaGetAttendance':return request('attendance',{serviceId:a[0]});
        case 'novaGetDemoWorker':return request('worker');
        default:throw new Error('Acción no disponible en Cloudflare: '+method);
      }
    }
  };
})();
