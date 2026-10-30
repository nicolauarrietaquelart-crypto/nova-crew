
/* v11 - Demo QR. Apps Script uses one-use server tokens; the HTML preview uses same-origin localStorage. */
(function(){
  'use strict';
  const KEY_TOKEN='nova-v11-qr-tokens', KEY_ACTIVE='nova-v11-qr-current', KEY_ATT='nova-v11-qr-attendance';
  const TTL=90000;
  let scanDirection='entrada';
  let activeService='svc2',scannerRunning=false,scannerStream=null,scanTimer=0,expiresTimer=0,activeToken='';
  let agendaCursor=new Date(2026,9,1);
  const root=document.getElementById('novaQrContent');
  const overlay=document.getElementById('novaQrOverlay');
  const title=document.getElementById('novaQrTitle');
  const el=id=>document.getElementById(id);
  const qescape=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const userid=()=>window.novaActiveAccount||'demo';
  const coordinator=()=>userid()==='coord';
  const OWNERS={svc1:'coord',svc2:'coord',svc3:'demo',svc4:'demo',svc5:null,svc6:'demo',svc7:'coord'};
  // Mirror Cloudflare's demo canScan grants. Enforcement remains on the server.
  const QR_SCAN_SERVICES={demo:['svc3','svc4','svc6','svc7'],coord:['svc1','svc2','svc4','svc7']};
  const isOwnCoord=s=>!!s&&OWNERS[s.id]===userid();
  const isCrewManager=s=>!!s&&(isOwnCoord(s)||(s.id==='svc4'&&userid()==='coord'));
  const canScanService=s=>!!s&&(QR_SCAN_SERVICES[userid()]||[]).includes(s.id);
  const isFuture=s=>!!s&&new Date(s.endISO)>new Date();
  let cloudRoster=null;
  function lsRead(key,other){try{return JSON.parse(localStorage.getItem(key)||'null')||other}catch(e){return other}}
  function lsWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){console.warn('Almacenamiento no disponible',e)}}
  function isGAS(){return !!(window.google&&google.script&&google.script.run)}
  function callBackend(method,args,success,failure){
    if(window.NOVA_API){window.NOVA_API.call(method,args).then(success).catch(error=>failure(error.message||'Error de conexión'));return;}
    if(isGAS())google.script.run.withSuccessHandler(success).withFailureHandler(e=>failure(e?.message||'Error de conexión'))[method](...args);
    else {try{success(previewBackend(method,args))}catch(e){failure(e.message)}}
  }
  function previewBackend(method,args){
    const now=Date.now(),tokens=lsRead(KEY_TOKEN,{}),active=lsRead(KEY_ACTIVE,{}),records=lsRead(KEY_ATT,[]);
    if(method==='novaSelfClock'){
      const id=args[1],s=services.find(x=>x.id===id);
      if(!s||!isOwnCoord(s))throw Error('No eres el coordinador único de este servicio.');
      return {ok:true,record:savePreviewAttendance(userid(),id,'COORDINADOR','PROPIO COORDINADOR')};
    }
    if(method==='novaIssueQr'){
      const [workerId,serviceId]=args;
      if(!['demo','coord'].includes(workerId)||!issuableServicesFor(workerId).some(s=>s.id===serviceId))throw Error('Servicio no asignado.');
      if(OWNERS[serviceId]===workerId||(serviceId==='svc4'&&workerId==='coord'))throw Error('Los responsables Crew Head pueden fichar su propio turno.');
      const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
      const old=active[workerId+'_'+serviceId];if(old)delete tokens[old];
      tokens[token]={workerId,serviceId,expiresAt:now+TTL};active[workerId+'_'+serviceId]=token;
      lsWrite(KEY_TOKEN,tokens);lsWrite(KEY_ACTIVE,active);
      const s=services.find(s=>s.id===serviceId);
      return {token,expiresAt:now+TTL,serviceName:s.name,workerName:workerId==='coord'?coordinatorProfileName():latestDemoProfile().name};
    }
    if(method==='novaRedeemQr'){
      const direction=args[3]==='salida'?'salida':'entrada';
      let [token,actor]=args;token=String(token).replace(/^NOVAQR:/,'').trim();
      if(!['coord','demo'].includes(actor))throw Error('Cuenta sin permiso de escaneo.');
      const d=tokens[token];if(!d||d.expiresAt<now||active[d.workerId+'_'+d.serviceId]!==token)throw Error('QR caducado, sustituido o ya utilizado.');
      if(actor!==OWNERS[d.serviceId]&&!(actor==='coord'&&d.serviceId==='svc4'))throw Error('No gestionas Crew Control en este servicio.');
      delete tokens[token];delete active[d.workerId+'_'+d.serviceId];lsWrite(KEY_TOKEN,tokens);lsWrite(KEY_ACTIVE,active);
      return {ok:true,record:savePreviewAttendance(d.workerId,d.serviceId,'QR',actor==='coord'?coordinatorProfileName():latestDemoProfile().name,direction)};
    }
    if(method==='novaDirectClock'){
      const [workerId,serviceId]=args,s=services.find(x=>x.id===serviceId);
      if(!s||!issuableServicesFor(workerId).some(x=>x.id===serviceId))throw Error('No asignado.');
      if(serviceHasCoordinator(s))throw Error('Este servicio requiere QR.');
      return {ok:true,record:savePreviewAttendance(workerId,serviceId,'DIRECTO','AUTOMÁTICO')};
    }
    if(method==='novaGetAttendance')return records.filter(x=>!args[0]||x.serviceId===args[0]);
    throw Error('Acción desconocida: '+method);
  }
  function savePreviewAttendance(workerId,serviceId,method,scannedBy,direction='entrada'){
    const s=services.find(x=>x.id===serviceId),rows=lsRead(KEY_ATT,[]);
    const saved=lsRead(workerId==='coord'?'novaProfileCoordV11':'novaProfileV7',{});
    const workerName=workerId==='coord' ? String(saved.name||'Álvaro Costa') : latestDemoProfile().name;
    const mine=OWNERS[serviceId]===workerId;
    const role=workerId==='coord'&&serviceId==='svc4'?'CREW HEAD':mine?'COORDINADOR':workerId==='coord'&&serviceId==='svc3'?'HAND A':s.role;
    const team=workerId==='coord'&&serviceId==='svc4'?'OPERACIONES':mine?'COORDINACIÓN':workerId==='coord'&&serviceId==='svc3'?'LUCES':s.team;
    const record={eventId:'EV-'+Date.now(),workerId,serviceId,workerName,category:role,team,start:s.time.split('–')[0],end:s.time.split('–')[1],method,scannedBy,time:new Date().toISOString(),direction,status:direction==='salida'?'SALIDA':'PRESENTE'};
    rows.push(record);lsWrite(KEY_ATT,rows);return record;
  }
  function latestDemoProfile(){
    const saved=lsRead('novaProfileV7',{});
    const p={...(!coordinator()&&typeof portalProfile==='object'?portalProfile:{}),...saved};
    const first=String(p.firstName||'Pau').trim(),last=String(p.lastName||'Ferrer Soler').trim();
    return {name:(first+' '+last).trim(),phone:String(p.phone||EMPLOYEE.phone||'670 555 221')};
  }
  function coordinatorProfileName(){const p=lsRead('novaProfileCoordV11',{});return [p.firstName,p.lastName].filter(Boolean).join(' ')||p.name||'Álvaro Costa'}
  let serverDemoWorker=null;
  function displayWorkerName(){return coordinator()?coordinatorProfileName():latestDemoProfile().name;}
  function issuableServicesFor(actor){return services.filter(s=>actor==='coord'?['svc1','svc2','svc3'].includes(s.id):true);}
  function serviceHasCoordinator(s){return Boolean(s&&OWNERS[s.id])}
  function chosenService(){return services.find(s=>s.id===activeService)||services[0]}
  function bestService(){return services.filter(s=>new Date(s.endISO).getTime()>Date.now()).sort((a,b)=>new Date(a.startISO)-new Date(b.startISO))[0]||services[services.length-1]}
  function formatServiceOption(s){return `${s.short} · ${s.name} · ${s.role}`}
  function userDefault(){
    if(coordinator())return services.find(s=>s.id==='svc2')||services[0];
    return bestService();
  }
  function info(record){
    return `<div class="nova-qr-success"><strong>✓ ${qescape(record.workerName)} · ${record.direction==='salida'?'SALIDA':'PRESENTE'}</strong><div class="nova-qr-summary"><div><span>Servicio</span><b>${qescape(services.find(s=>s.id===record.serviceId)?.name||record.serviceId)}</b></div><div><span>Equipo / categoría</span><b>${qescape(record.team)} · ${qescape(record.category)}</b></div><div><span>Inicio / fin</span><b>${qescape(record.start)} – ${qescape(record.end)}</b></div><div><span>Confirmado por</span><b>${qescape(record.scannedBy)}</b></div></div><p class="nova-qr-hint">Fichaje registrado: ${new Date(record.time).toLocaleString('es-ES')}</p></div>`;
  }
  function svgQR(text){
    const C=window.NOVA_QR_Encoder,L=window.NOVA_QR_Level;
    if(!C||!L)return '<p>Codificador QR no disponible.</p>';
    const qr=new C(0,L.M);qr.addData(text);qr.make();
    const n=qr.getModuleCount(),margin=4,paths=[];
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))paths.push(`M${x+margin},${y+margin}h1v1h-1z`);
    return `<svg class="nova-qr-svg" viewBox="0 0 ${n+2*margin} ${n+2*margin}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR temporal"><rect width="100%" height="100%" fill="white"/><path d="${paths.join(' ')}" fill="#141519"/></svg>`;
  }
  function openOverlay(mode){
    stopCamera();clearInterval(expiresTimer);activeToken='';
    overlay.classList.remove('hidden');
    if(mode==='scan')renderScanner();
    else if(mode==='worker')renderWorker();
    else renderChooser();
  }
  window.NOVA_OPEN_ATTENDANCE_MENU=()=>openOverlay('menu');
  function closeOverlay(){stopCamera();clearInterval(expiresTimer);overlay.classList.add('hidden')}
  function scannableServices(){return services.filter(s=>isFuture(s)&&canScanService(s));}
  function issuableServices(){return services.filter(s=>isFuture(s)&&(coordinator()?['svc1','svc2','svc3','svc4'].includes(s.id):true));}
  function renderModeSwitch(active){
    return `<div class="nova-qr-switch"><button type="button" class="btn ${active==='worker'?'primary':'light'}" id="qrSwitchWorker">Mostrar mi QR</button><button type="button" class="btn ${active==='scan'?'primary':'light'}" id="qrSwitchScan" ${scannableServices().length?'':'disabled'}>Escanear QR</button></div>`;
  }
  function bindModeSwitch(){
    const show=el('qrSwitchWorker'),scan=el('qrSwitchScan');
    if(show)show.onclick=renderWorker;
    if(scan)scan.onclick=renderScanner;
  }
  function renderChooser(){
    title.textContent='Fichaje de asistencia';
    const gps=issuableServices().filter(x=>!serviceHasCoordinator(x)||isOwnCoord(x));
    root.innerHTML=`<p class="nova-qr-hint">Elige cómo quieres registrar la asistencia.</p><div class="nova-qr-choices"><button type="button" class="nova-qr-choice primary" id="qrChooseShow"><b class="nova-choice-vector"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v4m-6 2h4m2 0h1"/></svg></b><strong>Mostrar mi QR</strong><span>Genera tu código de asistencia.</span></button><button type="button" class="nova-qr-choice" id="qrChooseScan" ${scannableServices().length?'':'disabled'}><b class="nova-choice-vector"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V5h5m6 0h5v4M4 15v4h5m6 0h5v-4M4 12h16"/></svg></b><strong>Escanear QR</strong><span>Escanea el código de un trabajador de tu equipo.</span></button><button type="button" class="nova-qr-choice" id="qrChooseGps" ${gps.length?'':'disabled'}><b class="nova-choice-vector"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></b><strong>Fichar con geolocalización</strong><span>Sin coordinador o cuando eres el coordinador del servicio.</span></button></div>`;
    el('qrChooseShow').onclick=renderWorker;
    el('qrChooseScan').onclick=renderScanner;
    el('qrChooseGps').onclick=()=>{
      if(!gps.length)return;
      closeOverlay();
      if(typeof window.NOVA_CREW_GPS_OPEN==='function'&&document.body.classList.contains('crew-fullscreen-active')){
        window.NOVA_CREW_GPS_OPEN();return;
      }
      window.NOVA_GPS_MODAL_OPEN?.(gps[0].id);
    };
  }
  function renderWorker(){
    title.textContent='Mi código de asistencia';
    const selectable=issuableServices();
    if(!selectable.some(s=>s.id===activeService))activeService=(selectable[0]||bestService()).id;
    root.innerHTML=`<div class="nova-qr-form">${renderModeSwitch('worker')}<label>Servicio asignado<select id="qrServiceSelect">${selectable.map(s=>`<option value="${s.id}" ${s.id===activeService?'selected':''}>${qescape(formatServiceOption(s))}</option>`).join('')}</select></label><p class="nova-qr-hint" id="qrModeHint"></p><div id="qrDynamic"></div><div class="nova-qr-actions"><button type="button" class="btn primary" id="qrGenerateBtn">Generar QR</button><button type="button" class="btn dark" id="qrDirectBtn" style="display:none">Fichar directamente</button></div><div id="qrLatestStatus" class="nova-qr-attended"></div></div>`;
    bindModeSwitch();
    el('qrServiceSelect').onchange=e=>{activeService=e.target.value;setWorkerMode()};
    el('qrGenerateBtn').onclick=issue;
    el('qrDirectBtn').onclick=directCheckin;
    const own=document.createElement('button');own.type='button';own.className='btn primary';own.id='qrSelfClockBtn';own.textContent='Fichar mi turno (coordinador)';own.onclick=()=>{
      const service=chosenService();
      if(!isOwnCoord(service)){toast('Control horario','Solo puedes fichar como coordinador de un servicio a tu cargo.');return;}
      closeOverlay();
      if(typeof window.NOVA_CREW_GPS_OPEN==='function'&&document.body.classList.contains('crew-fullscreen-active')){
        window.NOVA_CREW_GPS_OPEN();return;
      }
      window.NOVA_GPS_MODAL_OPEN?.(service.id);
    };
    el('qrDirectBtn').parentElement.append(own);
    setWorkerMode();
  }
  function setWorkerMode(){
    clearInterval(expiresTimer);activeToken='';el('qrDynamic').innerHTML='';
    const s=chosenService(),need=serviceHasCoordinator(s);
    const own=isCrewManager(s);
    el('qrGenerateBtn').style.display=!own?'':'none';el('qrGenerateBtn').textContent=need?'Generar QR':'Fichar con QR';el('qrDirectBtn').style.display=!need&&!own?'':'none';el('qrDirectBtn').textContent='Fichar con geolocalización';el('qrSelfClockBtn').style.display=own?'':'none';
    el('qrModeHint').textContent=own?'Eres el único coordinador del servicio. Puedes fichar tu propio turno sin añadir otro coordinador. Para el equipo, utiliza Escanear QR.':need?'Enseña tu QR al coordinador único del servicio. Cada código es de un solo uso y caduca en 90 segundos.':'Sin coordinador asignado: elige QR si alguien autorizado va a escanearlo o geolocalización para registrar tu asistencia directamente (radio máximo 500 m).';
    const prior=lsRead(KEY_ATT,[]).filter(x=>x.workerId===userid()&&x.serviceId===s.id).at(-1);
    el('qrLatestStatus').textContent=prior?`Último fichaje: ${new Date(prior.time).toLocaleString('es-ES')}`:'';
  }
  function issue(){
    const s=chosenService();el('qrDynamic').textContent='Generando código…';
    callBackend('novaIssueQr',[userid(),s.id],data=>{
      activeToken=data.token;
      const payload='NOVAQR:'+data.token;
      const qr=`<div class="nova-qr-codebox"><h4>${qescape(data.workerName)}</h4><p>${qescape(s.name)} · ${qescape(data.team||s.team)} · ${qescape(s.time)}</p>${svgQR(payload)}<span class="nova-qr-count" id="qrRemain">Válido 90 segundos</span><span class="nova-qr-code">${qescape(payload)}</span><button type="button" class="btn light" id="qrCopyToken">Copiar código para probar en otra pestaña</button></div>`;
      el('qrDynamic').innerHTML=qr;
      el('qrCopyToken').onclick=()=>{navigator.clipboard?.writeText(payload).then(()=>toast('QR','Código copiado.')).catch(()=>toast('QR','Selecciona el código y cópialo.'))};
      clearInterval(expiresTimer);expiresTimer=setInterval(()=>{
        const remaining=Math.ceil((data.expiresAt-Date.now())/1000);
        const a=el('qrRemain');if(a)a.textContent=remaining>0?`Caduca en ${remaining} segundos`:'QR caducado. Genera uno nuevo.';
        if(remaining<=0)clearInterval(expiresTimer);
      },1000);
    },err=>{el('qrDynamic').textContent=err;toast('Código QR',err)});
  }
  // Same GPS requirement for QR self-check-in and direct check-in.
  async function verifiedSelfLocation(service){
    if(!service?.coords||!navigator.geolocation)throw Error('No puedes fichar sin geolocalización disponible.');
    const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:15000}));
    const coords=position.coords;
    const rad=x=>x*Math.PI/180,R=6371000;
    const dlat=rad(service.coords.lat-coords.latitude),dlon=rad(service.coords.lng-coords.longitude);
    const a=Math.sin(dlat/2)**2+Math.cos(rad(coords.latitude))*Math.cos(rad(service.coords.lat))*Math.sin(dlon/2)**2;
    const distance=2*R*Math.asin(Math.min(1,Math.sqrt(a)));
    if(!Number.isFinite(distance)||distance>500)throw Error('Estás a '+Math.round(distance)+' m del recinto. El límite para fichar es 500 m.');
    if(!Number.isFinite(coords.accuracy)||coords.accuracy>200)throw Error('La precisión de ubicación es insuficiente (±'+Math.round(coords.accuracy)+' m). Activa la ubicación precisa.');
    return {lat:coords.latitude,lng:coords.longitude,accuracy:coords.accuracy,distance,checkedAt:new Date().toISOString()};
  }
  async function performOwnClock(method,button){
    if(button?.disabled)return;
    const s=chosenService();
    const start=new Date(s.startISO).getTime(),end=new Date(s.endISO).getTime(),now=Date.now();
    if(!Number.isFinite(start)||now<start-3600000||now>end+7200000){toast('Fichaje','Solo puedes fichar desde una hora antes del servicio.');return;}
    if(button){button.disabled=true;button.dataset.originalLabel=button.textContent;button.textContent='Validando ubicación…';}
    try{
      const gps=await verifiedSelfLocation(s);
      if(!overlay.classList.contains('hidden')&&chosenService().id===s.id){
        callBackend(method,[userid(),s.id,gps],data=>{
          if(el('qrDynamic'))el('qrDynamic').innerHTML=info(data.record);
          refreshAttendance(s.id);toast('Fichaje','Ubicación validada · '+s.name);
          if(button){button.disabled=false;button.textContent=button.dataset.originalLabel;}
        },err=>{toast('Fichaje',err);if(button){button.disabled=false;button.textContent=button.dataset.originalLabel;}});
      }
    }catch(error){
      toast('Geolocalización',error.message||'No ha sido posible validar tu ubicación.');
      if(el('qrDynamic'))el('qrDynamic').innerHTML='<p class="nova-qr-camera-error">'+qescape(error.message||'Permite acceder a tu ubicación para fichar.')+'</p>';
      if(button){button.disabled=false;button.textContent=button.dataset.originalLabel;}
    }
  }
  function directCheckin(){performOwnClock('novaDirectClock',el('qrDirectBtn'));}
  function renderScanner(){
    title.textContent='Escanear QR de trabajador';
    const eligible=scannableServices();
    if(!eligible.some(s=>s.id===activeService)&&eligible.length)activeService=eligible[0].id;
    root.innerHTML=`<div class="nova-qr-form">${renderModeSwitch('scan')}<p class="nova-qr-hint">Pulsa Escanear para abrir la cámara. Si no funciona, revisa el permiso de cámara del navegador.</p><label>Servicio que coordino<select id="qrScanService">${eligible.map(s=>`<option value="${s.id}" ${s.id===activeService?'selected':''}>${qescape(s.name)}</option>`).join('')}</select></label><fieldset class="nova-scan-direction"><legend>Tipo de fichaje</legend><div class="nova-scan-direction-options"><label><input type="radio" name="novaScanDirection" value="entrada" ${scanDirection==='entrada'?'checked':''}><span>Entrada</span></label><label><input type="radio" name="novaScanDirection" value="salida" ${scanDirection==='salida'?'checked':''}><span>Salida</span></label></div></fieldset><div class="nova-qr-actions"><button type="button" class="btn dark" id="qrStartCamera">Escanear</button><button type="button" class="btn light" id="qrStopCamera" style="display:none">Detener</button></div><video id="qrVideo" class="nova-qr-cam" autoplay playsinline muted style="display:none"></video><canvas id="qrCanvas" style="display:none"></canvas><div id="qrPhotoArea"></div><p id="qrCameraStatus" class="nova-qr-camera-error" aria-live="polite"></p><div class="nova-qr-actions"></div><label>Introducir código manualmente<input id="qrManualToken" type="text" placeholder="NOVAQR:…" autocomplete="off" spellcheck="false"></label><button class="btn primary" type="button" id="qrManualRedeem">Validar asistencia</button><div id="qrScanResult"></div></div>`;
    bindModeSwitch();
    el('qrStartCamera').onclick=startCamera;
    el('qrStopCamera').onclick=stopCamera;
    root.querySelectorAll('input[name="novaScanDirection"]').forEach(input=>input.addEventListener('change',()=>{scanDirection=input.value;scannerMessage('Modo '+(scanDirection==='salida'?'salida':'entrada')+' seleccionado.');}));

    el('qrManualRedeem').onclick=()=>redeem(el('qrManualToken').value.trim());
    el('qrManualToken').onkeydown=e=>{if(e.key==='Enter')redeem(e.target.value.trim())};
  }
  function scannerMessage(message){const status=el('qrCameraStatus');if(status)status.textContent=message;}
  async function decodePixels(canvas){
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)throw Error('No se puede leer la imagen.');
    const frame=context.getImageData(0,0,canvas.width,canvas.height);
    if(typeof window.jsQR==='function'){
      const found=window.jsQR(frame.data,frame.width,frame.height,{inversionAttempts:'attemptBoth'});
      if(found?.data)return found.data;
    }
    if(typeof BarcodeDetector!=='undefined'){
      try {const detector=new BarcodeDetector({formats:['qr_code']});const codes=await detector.detect(canvas);if(codes[0]?.rawValue)return codes[0].rawValue;}catch(err){}
    }
    if(typeof window.jsQR!=='function' && typeof BarcodeDetector==='undefined'){
      throw Error('La biblioteca de lectura QR no ha cargado. Comprueba tu conexión a Internet y recarga la página.');
    }
    return '';
  }
  async function decodeCapturedPhoto(event){
    stopCamera();
    const file=event.target.files?.[0];if(!file)return;
    scannerMessage('Leyendo QR de la foto…');
    try{
      if(!file.type.startsWith('image/'))throw Error('Selecciona una fotografía o captura de cámara.');
      const image=await createImageBitmap(file);
      const target=el('qrCanvas')||document.createElement('canvas');
      const scale=Math.min(1,1350/Math.max(image.width,image.height));
      target.width=Math.max(1,Math.round(image.width*scale));
      target.height=Math.max(1,Math.round(image.height*scale));
      target.getContext('2d').drawImage(image,0,0,target.width,target.height);
      if(typeof image.close==='function')image.close();
      const decoded=await decodePixels(target);
      if(!decoded||!decoded.startsWith('NOVAQR:'))throw Error('No se reconoce un QR de NOVA. Acércate, enfoca bien y vuelve a hacer la foto.');
      scannerMessage('QR identificado. Comprobando fichaje…');redeem(decoded);
    }catch(err){scannerMessage(err.message||'No se pudo leer el QR.');}
    event.target.value='';
  }
  async function startCamera(){
    stopCamera();
    if(!navigator.mediaDevices?.getUserMedia){scannerMessage('El navegador no permite vídeo en este contexto. Usa «Hacer foto del QR» (funciona en Chrome móvil).');return;}
    try{
      scannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
      const video=el('qrVideo');video.srcObject=scannerStream;video.style.display='block';await video.play();
      scannerMessage('Cámara encendida. Enfoca el QR.');if(el('qrStopCamera'))el('qrStopCamera').style.display='inline-flex';
      scannerRunning=true;
      const frame=async()=>{
        if(!scannerRunning)return;
        const v=el('qrVideo'),canvas=el('qrCanvas');
        if(!v||!canvas)return;
        try{
          if(v.readyState>=2 && v.videoWidth){
            const scale=Math.min(1,640/v.videoWidth);
            canvas.width=Math.max(1,Math.round(v.videoWidth*scale));canvas.height=Math.max(1,Math.round(v.videoHeight*scale));
            canvas.getContext('2d').drawImage(v,0,0,canvas.width,canvas.height);
            const value=await decodePixels(canvas);
            if(value?.startsWith('NOVAQR:')){stopCamera();redeem(value);return;}
          }
        }catch(err){console.warn('Lectura fotograma QR:',err)}
        if(scannerRunning)scanTimer=setTimeout(frame,180);
      };frame();
    }catch(err){
      scannerMessage('No se pudo iniciar la cámara ('+(err.name||err.message)+'). Pulsa «Hacer foto del QR» y comprueba los permisos de cámara y la conexión HTTPS.');
      stopCamera();
    }
  }
  function stopCamera(){if(el('qrStopCamera'))el('qrStopCamera').style.display='none';scannerRunning=false;clearTimeout(scanTimer);if(scannerStream)scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null;const v=el('qrVideo');if(v){v.pause();v.srcObject=null;v.style.display='none'}}
  function openExternalScanner(){
    const webUrl=document.body.dataset.webappUrl||'';
    const scannerUrl=document.body.dataset.externalScanner||'';
    if(!scannerUrl){scannerMessage('Para vídeo sin restricciones, publica el archivo scanner.html en un hosting HTTPS y configura NOVA_EXTERNAL_SCANNER_URL en Propiedades del script. La captura de foto ya funciona sin esta configuración.');return;}
    if(!/^https:\/\//i.test(scannerUrl)||!/^https:\/\//i.test(webUrl)){scannerMessage('La URL del lector y la de la Web App deben ser HTTPS.');return;}
    const target=new URL(scannerUrl);target.searchParams.set('return',webUrl);
    const service=el('qrScanService')?.value||'';if(service)target.searchParams.set('service',service);
    window.open(target.href,'_blank','noopener,noreferrer');
  }
  function redeem(raw){
    const token=String(raw||'').replace(/^NOVAQR:/,'').trim();
    if(!/^[a-f0-9]{64}$/i.test(token)){toast('QR','Código QR no válido.');return;}
    const b=el('qrManualRedeem');if(b)b.disabled=true;
    callBackend('novaRedeemQr',[token,userid(),el('qrScanService')?.value||'',scanDirection],data=>{
      if(b)b.disabled=false;
      const r=data.record;
      if(scanDirection==='salida'&&r.direction!=='salida'){toast('Salida no confirmada','El servidor aún no admite registrar salidas por QR.');el('qrScanResult').textContent='El servidor no ha confirmado la salida. No se ha mostrado como fichada.';return;}
      el('qrScanResult').innerHTML=info(r)+`<button class="btn light" type="button" id="qrGoCoord">Abrir coordinación del servicio →</button>`;
      const go=el('qrGoCoord');if(go)go.onclick=()=>{closeOverlay();const s=services.find(x=>x.id===r.serviceId);if(s){if(s.privilege==='crew'){renderCrewControl(s);navigate('crew-control')}else{renderWorkerCoord(s);navigate('worker-coordination');applyAttendanceToCurrent(r)}}};
      refreshAttendance(r.serviceId);
      toast(r.direction==='salida'?'Salida confirmada':'Entrada confirmada',r.workerName+' · '+r.team);
    },err=>{if(b)b.disabled=false;toast('Código QR',err);const t=el('qrScanResult');if(t)t.innerHTML=`<p class="nova-qr-camera-error">${qescape(err)}</p>`;});
  }
  function applyAttendanceToCurrent(r){
    if(!r?.serviceId)return;
    if(r.serviceId===crewState?.service?.id && document.querySelector('#page-crew-control.page.active')){
      let item=crewState.workers.find(x=>x.id===r.serviceId+'-qr-'+r.workerId||x.workerId===r.workerId);
      if(!item){
        item={id:r.serviceId+'-qr-'+r.workerId,workerId:r.workerId,name:r.workerName,phone:'670 555 221',role:r.category,team:r.team,workType:'LOAD IN',start:r.start,end:r.end,realStart:r.start,realEnd:r.end,pause:'00:00',diet:'No',status:'PRESENTE',rating:3,selected:false,incident:'',notes:''};
        crewState.workers.unshift(item);
      }
      const next=r.direction==='salida'?'SALIDA':'PRESENTE';const changed=item.status!==next;item.status=next;if(next==='PRESENTE')item.realStart=r.start;else item.realEnd=r.end;item.qrScannedAt=r.time;
      if(changed){saveCrewState();renderCrewAll();}
      return;
    }
    if(r.serviceId!==basicCoordState?.service?.id)return;
    let w=basicCoordState.workers.find(x=>x.id===r.serviceId+'-qr-'+r.workerId||x.workerId===r.workerId);
    if(!w){w={id:r.serviceId+'-qr-'+r.workerId,workerId:r.workerId,name:r.workerName,phone:EMPLOYEE.phone||'670 555 221',role:r.category,team:r.team,start:r.start,end:r.end,pause:'00:00',diet:'No',status:'PRESENTE',rating:3,incidents:[]};basicCoordState.workers.unshift(w)}
    w.name=r.workerName;w.role=r.category;w.team=r.team;w.start=r.start;w.end=r.end;w.status=r.direction==='salida'?'SALIDA':'PRESENTE';w.qrScannedAt=r.time;
    if(typeof saveBasicCoord==='function')saveBasicCoord();
    if(typeof renderBasicTeamRows==='function')renderBasicTeamRows();
  }
  function refreshAttendance(serviceId){
    callBackend('novaGetAttendance',[serviceId||''],rows=>{
      if(!Array.isArray(rows))return;
      for(const r of rows){if(r.status==='PRESENTE'||r.status==='SALIDA')applyAttendanceToCurrent(r)}
      if(!coordinator()){
        const current=el('novaQrLastClock');const latest=rows.filter(x=>x.workerId==='demo').at(-1);
        if(current&&latest)current.textContent=`Último fichaje: ${new Date(latest.time).toLocaleString('es-ES')} · ${latest.status}`;
        if(latest&&activeToken&&latest.time){
          const box=el('qrDynamic');
          if(box && !overlay.classList.contains('hidden') && chosenService().id===latest.serviceId && !box.querySelector('.nova-qr-success')){
            activeToken='';clearInterval(expiresTimer);box.innerHTML=info(latest);
            const status=el('qrLatestStatus');if(status)status.textContent='Asistencia confirmada por coordinación.';
          }
        }
      }
    },()=>{});
  }
  function updateClockPanel(){
    const area=el('novaQrTimePanel');if(!area)return;
    const s=userDefault();activeService=s.id;
    area.innerHTML=`<article class="nova-qr-clock-card glass"><div class="clock-row"><div><span class="kicker">FICHAJE CON QR</span><h3>${coordinator()?'Tu QR y escaneo de trabajadores':'Tu asistencia'}</h3><p>${coordinator()?'Abre la cámara para registrar la presencia de un trabajador.':'El servicio se detecta automáticamente, pero puedes elegir otro de tus bolos asignados.'}</p></div><button id="novaClockOpenQr" type="button" class="btn primary">Mostrar / Escanear QR</button></div><div class="nova-qr-attended" id="novaQrLastClock"></div></article>`;
    el('novaClockOpenQr').onclick=()=>openOverlay('menu');
    refreshAttendance(s.id);
  }
  function scanToolbar(){
    const worker=document.querySelector('#workerCoordDetail .basic-control-header')||document.querySelector('#workerCoordDetail .basic-toolbar');
    if(worker&&scannableServices().some(s=>s.id===basicCoordState?.service?.id)&&!worker.querySelector('.nova-scan-inline'))worker.insertAdjacentHTML('beforeend','<div class="nova-scan-inline"><button type="button" class="btn primary" data-nova-open-scan>▦ Escanear QR</button></div>');
    const crew=document.querySelector('#crewControlRoot .crew-header-actions')||document.querySelector('#crewControlRoot .crew-header');
    if(crew&&!crew.querySelector('.nova-scan-inline'))crew.insertAdjacentHTML('beforeend','<span class="nova-scan-inline"><button class="btn primary" type="button" data-nova-open-scan>▦ Escanear QR</button></span>');
  }
  // All demo rosters use stable user IDs. The single coordinator is also an ordinary roster row.
  function rosterPerson(id){
    const cloud=cloudRoster?.[id];
    if(cloud?.name)return {name:cloud.name,phone:cloud.phone};
    if(id==='coord')return {name:coordinatorProfileName(),phone:lsRead('novaProfileCoordV11',{}).phone||'664 690 034'};
    return coordinator()&&serverDemoWorker?serverDemoWorker:latestDemoProfile();
  }
  function roleFor(id,s){
    if(OWNERS[s.id]===id)return {role:'COORDINADOR',team:'COORDINACIÓN'};
    if(id==='coord'&&s.id==='svc3')return {role:'HAND A',team:'LUCES'};
    if(id==='coord'&&s.id==='svc4')return {role:'CREW HEAD',team:'OPERACIONES'};
    if(id==='demo'&&s.id==='svc1')return {role:'HAND B',team:'STAGE'};
    if(id==='demo'&&s.id==='svc2')return {role:'FORKLIFTER',team:'LOGÍSTICA'};
    return {role:s.role,team:s.team};
  }
  function rosterEntry(id,s,crew){
    const p=rosterPerson(id),r=roleFor(id,s);
    return {id:s.id+'-qr-'+id,workerId:id,name:p.name,phone:p.phone,...r,
      workType:'LOAD IN',start:s.time.split('–')[0],end:s.time.split('–')[1],pause:'00:00',diet:'No',
      status:'NO CONTACTADO',rating:3,selected:false,incident:'',incidents:[],notes:'',
      ...(crew?{realStart:'—',realEnd:'—',uniformity:3,attitude:3,punctuality:3}:{})};
  }
  function ensureRoster(s,rows,crew){
    if(!s||!Array.isArray(rows))return false;
    const expected=['svc1','svc2','svc3','svc4'].includes(s.id)?['demo','coord']:s.id==='svc5'?['demo']:[];
    let changed=false;
    for(const id of expected){
      const key=s.id+'-qr-'+id,p=rosterPerson(id),r=roleFor(id,s);
      const candidates=rows.filter(w=>w.workerId===id||w.id===key||w.id===s.id+'-qr-demo'&&id==='demo');
      let w=candidates[0];
      if(!w){w=rosterEntry(id,s,crew);rows.unshift(w);changed=true;}
      for(const duplicate of candidates.slice(1)){rows.splice(rows.indexOf(duplicate),1);changed=true;}
      w.id=key;w.workerId=id;w.name=p.name;w.phone=p.phone;w.role=r.role;w.team=r.team;
      const override=window.novaCloudShifts?.[s.id+'/'+id];if(override){w.start=override.start;w.end=override.end;}
      w.isCoordinator=OWNERS[s.id]===id;
    }
    // Never present any other worker as coordinator, including old saved rows.
    for(const w of rows){
      if(w.role==='COORDINADOR'&&!w.isCoordinator){w.role='CREW HEAD';changed=true;}
    }
    if(crew&&s.id==='svc4'){for(const old of rows.filter(w=>w.id===s.id+'-extra-head')){rows.splice(rows.indexOf(old),1);changed=true;}}
    const limit=crew?totalPersonnel(s):(s.basicTeamSize||rows.length);
    while(rows.length>limit){
      const pos=rows.findLastIndex(w=>!w.workerId&&w.id!==s.id+'-extra-head');
      if(pos<0)break;
      rows.splice(pos,1);changed=true;
    }
    return changed;
  }
  function updateDemoInList(s,workerRows,crew){return ensureRoster(s,workerRows,crew);}
  function updateAllDemoLists(){
    for(const s of services){
      const key=s.privilege==='crew'?`crewWorkers-${s.id}`:`basicTeam-${s.id}`;
      const saved=lsRead(key,null);
      if(Array.isArray(saved)){ensureRoster(s,saved,s.privilege==='crew');lsWrite(key,saved)}
      else if(saved?.workers){ensureRoster(s,saved.workers,false);lsWrite(key,saved)}
    }
    if(basicCoordState?.service){ensureRoster(basicCoordState.service,basicCoordState.workers,false);renderBasicShiftFilters();renderBasicTeamRows()}
    if(crewState?.service){ensureRoster(crewState.service,crewState.workers,true);renderCrewAll()}
  }
  function updateDemoWorkerFromServer(){
    if(!window.NOVA_API)return;
    window.NOVA_API.roster().then(payload=>{
      cloudRoster=payload.roster;
      for(const s of services){
        const owner=OWNERS[s.id];
        s.coordinator=owner?cloudRoster[owner]?.name||s.coordinator:'';
        s.coordinatorPhone=owner?cloudRoster[owner]?.phone||s.coordinatorPhone:'';
      }
      window.novaCloudShifts=payload.shifts||{};
      updateAllDemoLists();
      renderServices();renderHomeServices();renderCoordination();
    }).catch(err=>console.warn('Datos de plantilla no disponibles:',err.message));
  }
  function consumeIncomingScan(){
    const token=document.body.dataset.incomingQr||'';
    if(!token||!coordinator()&&!services.some(s=>s.privilege==='crew'))return;
    document.body.dataset.incomingQr='';
    openOverlay('scan');
    const input=el('qrManualToken');if(input){input.value='NOVAQR:'+token;redeem(input.value)}
  }
  function refreshNameAll(){
    let p={};try{p=JSON.parse(localStorage.getItem('novaProfileV7')||'{}')}catch(e){}
    if(coordinator()){try{p=JSON.parse(localStorage.getItem('novaProfileCoordV11')||'{}')}catch(e){};p={firstName:'Álvaro',lastName:'Costa',name:'Álvaro Costa',initials:'AC',...p}}
    else p={...PROFILE_DEFAULTS,...portalProfile,...p};
    const first=(p.firstName||p.name?.split(' ')[0]||'Pau').trim(),last=(p.lastName||'').trim(),full=(first+' '+last).trim(),initials=(first[0]||'P')+(last[0]||'F');
    p.name=full;p.initials=initials.toUpperCase();
    if(!coordinator()){EMPLOYEE.name=full;EMPLOYEE.initials=p.initials;EMPLOYEE.phone=p.phone||EMPLOYEE.phone;}
    for(const n of document.querySelectorAll('.profile-chip strong'))n.textContent=full;
    const summary=el('profileSummaryName');if(summary)summary.textContent=full;
    for(const a of document.querySelectorAll('.profile-chip .avatar,.profile-summary .avatar.big,#profilePhotoPreview')){
      a.textContent=p.initials;const storedPhoto=lsRead('nova-v11-photo-'+userid(),null)||(!coordinator()?localStorage.getItem('novaProfilePhotoV7'):null);
      if(storedPhoto){a.style.backgroundImage=`url(${storedPhoto})`;a.style.backgroundSize='cover';a.style.backgroundPosition='center';a.style.color='transparent';a.classList.add('has-photo')}else{a.style.backgroundImage='';a.style.color='';a.classList.remove('has-photo')}
    }
    const inputFirst=el('profileFirstName'),inputLast=el('profileLastName');if(inputFirst&&coordinator()){inputFirst.value=first;inputLast.value=last;}
    const meta=document.querySelector('#page-payroll .payroll-meta b');if(meta&&!coordinator())meta.textContent='Liquidación empleado: '+full.toUpperCase();
    const head=el('pageTitle');if(head&&document.querySelector('#page-home.page.active'))head.textContent='Buenos días, '+first;
  }
  function saveIdentity(){
    const a=userid(),p=readProfileForm();
    p.initials=((p.firstName||'P')[0]+(p.lastName||'F')[0]).toUpperCase();
    if(a==='coord'){lsWrite('novaProfileCoordV11',p);portalProfile={...portalProfile,...p};toast('Perfil','Datos demo guardados.');}
    else {portalProfile={...portalProfile,...p};lsWrite('novaProfileV7',portalProfile);renderAvailabilityBasePreview();renderAvailability();toast('Perfil','Datos guardados en la demo.');}
    refreshNameAll();
    if(window.NOVA_API)window.NOVA_API.saveProfile(p).then(()=>{if(a==='demo')updateAllDemoLists();else updateDemoWorkerFromServer()}).catch(err=>toast('Sin sincronizar',err.message));
    if(a!=='coord')updateAllDemoLists();
    if(a!=='coord'&&isGAS())google.script.run.withFailureHandler(err=>console.warn(err)).savePortalProfile(portalProfile);
  }
  function addPhotoHandler(){
    const upload=el('profilePhotoInput');if(!upload)return;
    upload.onchange=e=>{
      const f=e.target.files?.[0];if(!f)return;
      if(!f.type.startsWith('image/'))return toast('Fotografía','Selecciona un archivo de imagen.');
      const reader=new FileReader();reader.onload=()=>{
        const image=new Image();image.onload=()=>{
          const canvas=document.createElement('canvas');const size=256;canvas.width=canvas.height=size;
          const ctx=canvas.getContext('2d');const side=Math.min(image.width,image.height);
          ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,size,size);
          const data=canvas.toDataURL('image/jpeg',.78);lsWrite('nova-v11-photo-'+userid(),data);refreshNameAll();toast('Fotografía','Actualizada en cabecera y perfil.');
        };image.src=reader.result;
      };reader.readAsDataURL(f);
    };
  }
  function renderAgendaFixed(){
    const grid=el('v10CalendarGrid'),header=el('v10CalendarTitle');if(!grid||!header)return;
    const y=agendaCursor.getFullYear(),m=agendaCursor.getMonth();const label=agendaCursor.toLocaleDateString('es-ES',{month:'long',year:'numeric'});header.textContent=label.charAt(0).toUpperCase()+label.slice(1);
    const offset=(new Date(y,m,1).getDay()+6)%7;
    grid.innerHTML=Array.from({length:42},(_,i)=>{
      const d=new Date(y,m,i+1-offset),day=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
      const matches=assignedServices().filter(s=>s.startISO.slice(0,10)===day);
      const cls=['v10-day',d.getMonth()===m?'':'outside',matches.length?'has-service':''].join(' ');
      return `<div class="${cls}"><strong>${d.getDate()}</strong>${matches.map(s=>`<button class="v10-event" data-v11-open="${s.id}" title="${qescape(s.name)}">${qescape(s.time.split('–')[0])} · ${qescape(s.name)}</button>`).join('')}</div>`;
    }).join('');
    const upcoming=el('v10CalendarUpcoming');if(upcoming)upcoming.innerHTML=assignedServices().slice().sort((a,b)=>new Date(a.startISO)-new Date(b.startISO)).map(s=>`<div class="v10-mini-service"><strong>${qescape(s.name)}</strong><small>${qescape(s.date)} · ${qescape(s.time)}</small><p><button class="btn light" type="button" data-v11-open="${s.id}">Abrir ficha →</button></p></div>`).join('');
    const sum=el('v10CalendarSummary');if(sum)sum.innerHTML=`<div class="v10-small-pills"><b>${assignedServices().length} servicios</b><b>Calendario ficticio 2026</b></div>`;
  }
  function bindAgenda(){
    el('v10CalendarPrev').onclick=()=>{agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()-1,1);renderAgendaFixed()};
    el('v10CalendarNext').onclick=()=>{agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()+1,1);renderAgendaFixed()};
    el('v10CalendarToday').onclick=()=>{agendaCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);renderAgendaFixed()};
  }
  async function loadCloudIdentity(){
    if(!window.NOVA_API)return;
    try{
      const me=await window.NOVA_API.me();
      const p=me.profile||{};
      if(coordinator()){
        const c={...p,name:[p.firstName,p.lastName].filter(Boolean).join(' ')};
        lsWrite('novaProfileCoordV11',c);
      }else{
        // This user id always points to the same demo employee, regardless of name changes.
        const q={...PROFILE_DEFAULTS,...p};lsWrite('novaProfileV7',q);
      }
      portalProfile={...portalProfile,...p};
      if(typeof applyBootstrapProfile==='function')applyBootstrapProfile(p);
      refreshNameAll(); updateAllDemoLists();
      updateDemoWorkerFromServer();
    }catch(err){console.warn('Perfil cloud no cargado',err);}
  }
  function applySingleOwnerPermissions(){
    for(const s of services){
      s.coordinatorUserId=OWNERS[s.id];
      s.assignedCoordinator=isOwnCoord(s);
      if(s.id==='svc3'){s.privilege=coordinator()?'worker':'crew';s.role=coordinator()?'HAND A':'CREW HEAD';s.team=coordinator()?'LUCES':'PRINCIPAL';}
      if(['svc1','svc2'].includes(s.id)){s.role=coordinator()?'COORDINADOR':s.id==='svc1'?'HAND B':'FORKLIFTER';s.team=coordinator()?'COORDINACIÓN':s.id==='svc1'?'STAGE':'LOGÍSTICA';}
      if(s.id==='svc4'){s.privilege='crew';s.role='CREW HEAD';s.team='OPERACIONES';}
      if(s.id==='svc5'){s.coordinator='';s.coordinatorPhone='';}
    }
    renderServices();renderHomeServices();renderCoordination();syncCoordPermissionsV9();updateHomeNextService();
  }
  function updateLoginAccount(){
    if(!window.novaActiveAccount)window.novaActiveAccount='demo';
    loadCloudIdentity();refreshNameAll();
    applySingleOwnerPermissions();
    updateClockPanel();
    updateAllDemoLists();
    updateDemoWorkerFromServer();
    setTimeout(consumeIncomingScan,150);
  }
  window.NOVA_QR_CONTEXT={chooseService(id){if(services.some(s=>s.id===id))activeService=id;}};
  function init(){
    el('novaQrQuick').onclick=()=>openOverlay('menu');
    el('novaQrClose').onclick=closeOverlay;
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeOverlay()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))closeOverlay()});
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-nova-open-scan]')){e.stopPropagation();openOverlay('scan')}
      const open=e.target.closest('[data-v11-open]');if(open){const s=services.find(x=>x.id===open.dataset.v11Open);if(s){renderServiceDetail(s);navigate('service-detail')}}
    });
    bindAgenda();renderAgendaFixed();
    const oldEnter=enterApp;
    enterApp=function(){applySingleOwnerPermissions();oldEnter();setTimeout(updateLoginAccount,20);setTimeout(renderAgendaFixed,80)};
    const oldSave=saveProfileFromForm;
    saveProfileFromForm=function(){saveIdentity();};
    const oldNav=navigate;
    navigate=function(page){if(page!=='crew-control'&&page!=='worker-coordination')stopCamera();oldNav(page);if(page==='agenda')renderAgendaFixed();if(page==='clock')updateClockPanel();if(['worker-coordination','crew-control'].includes(page)){scanToolbar();if(coordinator())setTimeout(()=>refreshAttendance(basicCoordState?.service?.id||'svc2'),300)}};
    const oldWorker=renderWorkerCoord;
    renderWorkerCoord=function(s){
      oldWorker(s);
      updateDemoInList(s,basicCoordState.workers,false);
      renderBasicShiftFilters();renderBasicTeamRows();
      scanToolbar();
      if(coordinator()){updateDemoWorkerFromServer();setTimeout(()=>refreshAttendance(s.id),400)}
    };
    const oldCrew=renderCrewControl;
    renderCrewControl=function(s){
      oldCrew(s);
      updateDemoInList(s,crewState.workers,true);
      renderCrewAll();
      scanToolbar();
      updateDemoWorkerFromServer();
    };
    const oldApplyProfile=applyBootstrapProfile;
    applyBootstrapProfile=function(profile){oldApplyProfile(profile);refreshNameAll()};
    const oldBootstrap=loadPortalBootstrap;
    loadPortalBootstrap=function(){if(coordinator()){refreshNameAll();return;}oldBootstrap();setTimeout(refreshNameAll,550)};
    setTimeout(addPhotoHandler,150);
    el('saveProfileBtn').onclick=saveIdentity;refreshNameAll();
    window.addEventListener('storage',event=>{if(event.key===KEY_ATT){const svc=basicCoordState?.service?.id;if(svc)refreshAttendance(svc);else if(!coordinator())refreshAttendance(chosenService().id)}});
    setInterval(()=>{
      if((coordinator()||basicCoordState?.service?.assignedCoordinator)&&document.querySelector('#page-worker-coordination.page.active')&&basicCoordState?.service)refreshAttendance(basicCoordState.service.id);
      if(document.querySelector('#page-crew-control.page.active')&&crewState?.service)refreshAttendance(crewState.service.id);
      else if(!coordinator()&&activeToken&&!overlay.classList.contains('hidden'))refreshAttendance(chosenService().id);
    },5000);
    setInterval(()=>{if(window.NOVA_API)updateDemoWorkerFromServer();},12000);
  }
  init();
})();
