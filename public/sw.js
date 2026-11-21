/* NOVA Crew · service worker para notificaciones del sistema (móvil y ordenador). */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if(new URL(c.url).pathname===new URL(url,self.location.origin).pathname&&'focus' in c)return c.focus();}
    return self.clients.openWindow?self.clients.openWindow(url):null;
  }));
});
