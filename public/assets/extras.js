
/* NOVA Crew v10: herramientas funcionales de DEMOSTRACIÓN. No envían datos reales a la empresa. */
(function(){
  'use strict';
  const KEY=()=>`novaCrewV15-${window.novaActiveAccount||'demo'}`;
  let syncing=false;
  function safeLoad(){try{const x=JSON.parse(localStorage.getItem(KEY())||'{}');return x&&typeof x==='object'?x:{}}catch(e){return {}}}
  let stored=safeLoad();
  let data={confirmations:stored.confirmations||{},notes:stored.notes||{}};
  function syncAccount(){const next=safeLoad();data={confirmations:next.confirmations||{},notes:next.notes||{}};}
  window.NOVA_V15_CONFIRM={syncAccount,statusOf:id=>statusOf(id),pending:()=>assignedServices().filter(s=>statusOf(s.id)==='PENDIENTE').length,refresh:()=>{refreshFromServer();}};
  const fmt=(t)=>typeof escV9==='function'?escV9(t):String(t);
  const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(data))}catch(e){console.warn('Guardado local no disponible',e)}};
  const DEMO_SERVICE='svc5';
  let demoStatus='PENDIENTE';
  const statusOf=(id)=>id===DEMO_SERVICE?demoStatus:(data.confirmations[id]?.status||'PENDIENTE');
  const pendingSaves=new Set();
  async function refreshFromServer(){
    if(syncing||!window.NOVA_API?.account)return;
    syncing=true;
    try{
      const response=await window.NOVA_API.confirmations();
      if(response?.ok){
        data.confirmations=response.confirmations||{};
        delete data.confirmations[DEMO_SERVICE];
        save();
        refreshServiceDecorations();renderCalendar();
        if(typeof renderNotifications==='function')renderNotifications();
      }
    }catch(error){console.warn('No se pudo sincronizar confirmaciones',error);}
    finally{syncing=false;}
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshFromServer()});
  window.addEventListener('focus',refreshFromServer);
  document.addEventListener('nova-account-changed',refreshFromServer);
  setInterval(()=>{if(!document.hidden)refreshFromServer()},30000);
  const statusLabel=(st)=>st==='CONFIRMADO'?'CONFIRMADO':st==='NO DISPONIBLE'?'NO DISPONIBLE':'POR CONFIRMAR';
  const badge=(id)=>`<span class="v10-status ${statusOf(id)==='CONFIRMADO'?'confirmado':statusOf(id)==='NO DISPONIBLE'?'rechazado':'pendiente'}">${statusLabel(statusOf(id))}</span>`;
  const findService=(id)=>services.find(s=>s.id===id);
  const dateTime=(iso)=>new Date(iso).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  function downloadText(text,filename,mime='text/plain;charset=utf-8'){
    const blob=new Blob(['\ufeff',text],{type:mime});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1500);
  }
  function escapeICS(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
  function exportICS(id){
    const s=findService(id);if(!s)return;
    const utc=v=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//NOVA Crew//Demo//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${s.code}@novacrew.demo`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(s.startISO)}`,`DTEND:${utc(s.endISO)}`,`SUMMARY:${escapeICS(s.name)}`,`LOCATION:${escapeICS(s.address)}`,`DESCRIPTION:${escapeICS('Asignación demo '+s.role+' · '+s.access)}`,'END:VEVENT','END:VCALENDAR'];
    downloadText(lines.join('\r\n')+'\r\n',`NOVA_${s.code}.ics`,'text/calendar;charset=utf-8');
    toast('Calendario','Archivo .ics creado. Puedes añadirlo a tu calendario.');
  }
  function confirmAssignment(id,status){
    const s=findService(id);if(!s)return;
    if(statusOf(id)==='CONFIRMADO'&&status!=='CONFIRMADO')return toast('Servicio confirmado','No puedes rechazar ni restablecer un servicio ya confirmado. Contacta con oficina.');
    if(status==='NO DISPONIBLE'){
      openDemoModal('No puedo asistir · '+s.name,`<p class="v10-info-note">Esta acción registra una decisión en la demo. No avisa a ningún coordinador real.</p><div class="v10-modal-form"><label class="full">Motivo (obligatorio)<textarea id="v10Reason" rows="3" placeholder="Por ejemplo, conflicto de horario…"></textarea></label></div><div class="crew-modal-actions"><button type="button" class="btn light" id="v10Close">Cancelar</button><button type="button" class="btn primary" id="v10Decline">Registrar no disponibilidad</button></div>`);
      document.getElementById('v10Close').onclick=closeDemoModal;
      document.getElementById('v10Decline').onclick=()=>{const reason=document.getElementById('v10Reason').value.trim();if(!reason){toast('Motivo requerido','Indica brevemente por qué no puedes acudir.');return}setConfirmed(id,status,reason);closeDemoModal();};
    }else setConfirmed(id,status,'');
  }
  async function setConfirmed(id,status,reason){
    if(statusOf(id)==='CONFIRMADO'&&status!=='CONFIRMADO')return;
    if(id===DEMO_SERVICE){demoStatus=status;refreshServiceDecorations();renderCalendar();if(typeof renderNotifications==='function')renderNotifications();toast('Servicio de prueba','Estado actualizado; al recargar se restablece.');return;}
    if(!window.NOVA_API?.account){toast('Sin sesión','Inicia sesión para confirmar el servicio.');return;}
    if(pendingSaves.has(id))return;
    pendingSaves.add(id);
    const buttons=[...document.querySelectorAll('[data-v10-confirm],[data-v10-decline],[data-v10-pending]')].filter(el=>el.dataset.v10Confirm===id||el.dataset.v10Decline===id||el.dataset.v10Pending===id);
    buttons.forEach(el=>{el.disabled=true;el.dataset.originalLabel=el.textContent;el.textContent='Guardando…'});
    try{
      const result=await window.NOVA_API.confirmAssignment(id,status,reason);
      if(!result?.ok)throw new Error('No se ha guardado la confirmación.');
      data.confirmations[id]=result.confirmation;
      save();refreshServiceDecorations();renderCalendar();
      if(typeof renderNotifications==='function')renderNotifications();
      window.NOVA_V15?.updateAlerts?.();
      toast('Asignación',status==='CONFIRMADO'?'Servicio confirmado.':status==='PENDIENTE'?'Estado restablecido.':'No disponibilidad registrada.');
    }catch(error){
      toast('No se pudo guardar',error.message||'Comprueba tu conexión.');
      await refreshFromServer();
    }finally{pendingSaves.delete(id);buttons.forEach(el=>{if(el.isConnected){el.disabled=false;el.textContent=el.dataset.originalLabel||el.textContent}})}
  }
  function serviceControls(s,detail=false){
    const status=statusOf(s.id);
    const buttons=`<div class="v10-inline-tools" data-v10-service-actions="${fmt(s.id)}">${s.id===DEMO_SERVICE?'<span class="nova-demo-reset-label">DEMO · se reinicia al recargar</span>':''}${badge(s.id)}${status==='CONFIRMADO'?'':`<button class="btn light" type="button" data-v10-confirm="${fmt(s.id)}">✓ Confirmar</button><button class="btn light" type="button" data-v10-decline="${fmt(s.id)}">No puedo asistir</button>${status!=='PENDIENTE'?`<button class="btn light" type="button" data-v10-pending="${fmt(s.id)}">Restablecer</button>`:''}`}<button class="btn light" type="button" data-v10-ics="${fmt(s.id)}">Añadir a calendario</button></div>`;
    return buttons;
  }
  function decorateServiceCards(){
    document.querySelectorAll('#servicesList .service-card').forEach(card=>{const b=card.querySelector('[data-open-service]');if(!b)return;const existing=card.querySelector('.nova-mobile-confirm,.v10-inline-tools');const s=findService(b.dataset.openService);if(s){if(existing)existing.outerHTML=serviceControls(s).replace('class="v10-inline-tools"','class="v10-inline-tools nova-mobile-confirm"');else card.insertAdjacentHTML('beforeend',serviceControls(s).replace('class="v10-inline-tools"','class="v10-inline-tools nova-mobile-confirm"'));}});
    document.querySelectorAll('#homeServices .card').forEach(card=>{const b=card.querySelector('[data-open-service]');if(!b)return;card.querySelector('.v10-inline-tools')?.remove();const s=findService(b.dataset.openService);if(s)card.insertAdjacentHTML('beforeend',`<div class="v10-inline-tools v16-home-confirm">${badge(s.id)}${statusOf(s.id)==='PENDIENTE'?`<button class="btn dark" type="button" data-v10-confirm="${fmt(s.id)}">✓ Confirmar</button>`:''}</div>`);});
  }
  function decorateServiceDetail(){
    // Confirmation remains on the service cards; no duplicate notes / confirmation panel in the ficha.
    document.querySelector('#serviceDetail .v10-service-extra')?.remove();
  }
  function refreshServiceDecorations(){decorateServiceCards();decorateServiceDetail()}
  let calendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  function calendarDay(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function renderCalendar(){
    const root=document.getElementById('v10CalendarGrid');if(!root)return;
    const month=calendarCursor.getMonth(),year=calendarCursor.getFullYear();
    const monthLabel=calendarCursor.toLocaleDateString('es-ES',{month:'long',year:'numeric'});document.getElementById('v10CalendarTitle').textContent=monthLabel.charAt(0).toUpperCase()+monthLabel.slice(1);
    const start=new Date(year,month,1),startWeek=(start.getDay()+6)%7;
    const cells=[];for(let i=0;i<42;i++){const d=new Date(year,month,1-startWeek+i);const day=calendarDay(d),same=d.getMonth()===month;const events=assignedServices().filter(s=>s.startISO.slice(0,10)===day);
      cells.push(`<div class="v10-day ${same?'':'outside'} ${day===calendarDay(new Date())?'today':''} ${events.length?'has-service':''}" aria-label="${fmt(day)}"><strong>${d.getDate()}</strong>${events.map(s=>`<button type="button" class="v10-event ${statusOf(s.id)==='CONFIRMADO'?'confirmado':statusOf(s.id)==='NO DISPONIBLE'?'rechazado':''}" title="${fmt(s.name)}" data-v10-open="${fmt(s.id)}">${fmt(s.time.split('–')[0])} · ${fmt(s.name)}</button>`).join('')}</div>`);
    }
    root.innerHTML=cells.join('');
    const right=document.getElementById('v10CalendarUpcoming');if(right)right.innerHTML=services.filter(s=>new Date(s.endISO)>new Date()).sort((a,b)=>new Date(a.startISO)-new Date(b.startISO)).slice(0,5).map(s=>`<div class="v10-mini-service"><strong>${fmt(s.name)}</strong><small>${fmt(s.date)} · ${fmt(s.time)}</small><br>${badge(s.id)} <button type="button" class="btn light" data-v10-open="${fmt(s.id)}">Abrir ficha</button></div>`).join('')||'<p>Sin servicios futuros en esta demo.</p>';
    const summary=document.getElementById('v10CalendarSummary');if(summary)summary.innerHTML=`<div class="v10-small-pills"><b>Asignados: ${assignedServices().length}</b><b>Confirmados: ${assignedServices().filter(s=>statusOf(s.id)==='CONFIRMADO').length}</b><b>Por confirmar: ${assignedServices().filter(s=>statusOf(s.id)==='PENDIENTE').length}</b></div>`;
  }

  function exportWorkerCSV(kind){const isCrew=kind==='crew';const w=isCrew?crewFilteredWorkers():visibleBasicWorkers();const selected=isCrew?crewState.workers.filter(x=>x.selected):basicCoordState.workers.filter(x=>basicCoordState.selected.has(x.id));const rows=selected.length?selected:w;if(!rows.length){toast('Exportación','No hay trabajadores que exportar.');return}
    const columns=['name','phone','role','team','start','end','pause','diet','status','rating'];const labels=['PERSONAL','MÓVIL','CATEGORÍA','EQUIPO','INICIO','FIN','PAUSA','DIETA','ESTADO','VALORACIÓN'];const csv=(row)=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(';');
    const output=[csv(labels),...rows.map(r=>csv(columns.map(c=>r[c])))].join('\r\n');downloadText(output,'NOVA_'+(isCrew?crewState.service?.code:basicCoordState.service?.code)+'_PERSONAL.csv','text/csv;charset=utf-8');toast('CSV generado',rows.length+' trabajadores exportados.');
  }
  function enhanceCoord(){const root=document.querySelector('#workerCoordDetail .basic-control-toolbar');if(root&&!root.querySelector('[data-v10-export]'))root.insertAdjacentHTML('beforeend','<button type="button" class="btn light" data-v10-export="basic">Exportar CSV</button>');}
  function enhanceCrew(){const root=document.querySelector('#crewControlRoot .crew-header-actions');if(root&&!root.querySelector('[data-v10-export]'))root.insertAdjacentHTML('beforeend','<button type="button" class="light" data-v10-export="crew">Exportar CSV</button>');}

  // Preservar las funciones v9 existentes, añadiendo módulos sin reescribirlas.
  const originalServices=renderServices, originalHome=renderHomeServices,originalDetail=renderServiceDetail,originalBasic=renderWorkerCoord,originalCrew=renderCrewControl;
  renderServices=function(){originalServices();decorateServiceCards()};
  renderHomeServices=function(){originalHome();decorateServiceCards()};
  renderServiceDetail=function(s){originalDetail(s);const box=document.getElementById('serviceDetail');if(box)box.dataset.v10CurrentService=s.id;decorateServiceDetail()};
  renderWorkerCoord=function(s){originalBasic(s);enhanceCoord()};
  renderCrewControl=function(s){originalCrew(s);enhanceCrew()};
  const oldNotificationItems=notificationItems;
  notificationItems=function(){let out=oldNotificationItems();const pending=assignedServices().filter(s=>statusOf(s.id)==='PENDIENTE');if(pending.length)out=[{icon:'✓',title:`${pending.length} asignaciones por confirmar`,text:'Revisa y confirma tus servicios.',action:()=>navigate('services')},...out];return out};

  document.addEventListener('click',ev=>{
    const node=ev.target.closest('[data-v10-confirm],[data-v10-decline],[data-v10-pending],[data-v10-ics],[data-v10-open],[data-v10-note-save],[data-v10-export]');if(!node)return;
    const ds=node.dataset;
    if(ds.v10Confirm){ev.preventDefault();ev.stopImmediatePropagation();confirmAssignment(ds.v10Confirm,'CONFIRMADO')}
    else if(ds.v10Decline){ev.preventDefault();ev.stopImmediatePropagation();confirmAssignment(ds.v10Decline,'NO DISPONIBLE')}
    else if(ds.v10Pending){ev.preventDefault();ev.stopImmediatePropagation();confirmAssignment(ds.v10Pending,'PENDIENTE')}
    else if(ds.v10Ics){ev.stopPropagation();exportICS(ds.v10Ics)}
    else if(ds.v10Open){ev.stopPropagation();const s=findService(ds.v10Open);if(s){renderServiceDetail(s);navigate('service-detail')}}
    else if(ds.v10NoteSave){ev.stopPropagation();data.notes[ds.v10NoteSave]=document.getElementById('v10ServiceNote')?.value||'';save();toast('Notas','Notas personales guardadas en la demo.');}
    else if(ds.v10Export){ev.stopPropagation();exportWorkerCSV(ds.v10Export)}
  },true);
  document.getElementById('v10CalendarPrev').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderCalendar()};
  document.getElementById('v10CalendarNext').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderCalendar()};
  document.getElementById('v10CalendarToday').onclick=()=>{calendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);renderCalendar()};
  refreshServiceDecorations();renderCalendar();renderNotifications();
  setTimeout(refreshFromServer,500);
})();
