/* NOVA Crew · notificaciones del navegador (móvil y ordenador). */
(()=>{
 const supported='Notification' in window&&'serviceWorker' in navigator;
 let reg=null;
 async function registration(){if(!supported)return null;if(reg)return reg;try{reg=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;}catch{reg=null}return reg;}
 const key=k=>'nova-notify-'+k;
 const get=k=>{try{return localStorage.getItem(key(k))}catch{return null}},set=(k,v)=>{try{localStorage.setItem(key(k),v)}catch{}};
 window.NovaNotify={
  supported,
  state(){return !supported?'unsupported':Notification.permission},
  enabled(){return supported&&Notification.permission==='granted'&&get('off')!=='1'},
  async enable(){if(!supported)throw new Error('Este navegador no permite notificaciones. En iPhone, añade la app a la pantalla de inicio primero.');const p=await Notification.requestPermission();if(p!=='granted')throw new Error('Has bloqueado las notificaciones. Actívalas en los ajustes del navegador para esta web.');set('off','0');await registration();return true;},
  disable(){set('off','1')},
  async show(title,body,{tag='',url=location.pathname,renotify=false,urgent=false}={}){
   if(!this.enabled())return false;
   const opts={body,tag:tag||undefined,renotify:!!(tag&&renotify),requireInteraction:!!urgent,icon:'/assets/icon-192.png',badge:'/assets/icon-192.png',data:{url},vibrate:urgent?[300,120,300,120,300]:[200]};
   try{const r=await registration();if(r){await r.showNotification(title,opts);return true;}new Notification(title,opts);return true;}catch{return false}
  },
  /* Devuelve true la primera vez que se ve una clave (para no repetir avisos). */
  once(id){const seen=new Set(JSON.parse(get('seen')||'[]'));if(seen.has(id))return false;seen.add(id);set('seen',JSON.stringify([...seen].slice(-300)));return true;},
  /* Devuelve true si han pasado al menos ms desde el último aviso con esa clave. */
  every(id,ms){const t=JSON.parse(get('times')||'{}'),n=Date.now();if(t[id]&&n-t[id]<ms)return false;t[id]=n;for(const k of Object.keys(t))if(n-t[k]>86400000)delete t[k];set('times',JSON.stringify(t));return true;}
 };
 if(supported&&Notification.permission==='granted')registration();
})();
