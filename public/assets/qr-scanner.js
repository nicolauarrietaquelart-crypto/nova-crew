/* NOVA Crew · lector QR continuo para coordinadores y Crew Head.
   Usa BarcodeDetector si el navegador lo tiene y jsQR en el resto (iPhone/iPad). */
(()=>{'use strict';
let jsqrPromise=null;
const loadJsQR=()=>jsqrPromise||(jsqrPromise=new Promise((resolve,reject)=>{if(window.jsQR)return resolve(window.jsQR);const s=document.createElement('script');s.src='/assets/vendor/jsQR.js';s.onload=()=>resolve(window.jsQR);s.onerror=()=>reject(new Error('No se pudo cargar el lector QR.'));document.head.append(s);}));
const css=`.nqr{position:fixed;inset:0;z-index:2147483000;background:#0d0f12;color:#fff;display:flex;flex-direction:column;font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
.nqr-top{display:flex;align-items:center;gap:12px;padding:max(14px,env(safe-area-inset-top)) 16px 12px}
.nqr-top b{flex:1;font-size:16px}.nqr-top small{display:block;color:#9aa0a8;font-weight:500;font-size:12px;margin-top:2px}
.nqr-close{border:0;background:#2a2d33;color:#fff;border-radius:12px;padding:10px 14px;font-weight:800;font-size:14px}
.nqr-stage{position:relative;flex:1;min-height:0;display:grid;place-items:center;overflow:hidden;background:#000}
.nqr-stage video{width:100%;height:100%;object-fit:cover}
.nqr-frame{position:absolute;width:min(68vw,320px);aspect-ratio:1;border-radius:24px;box-shadow:0 0 0 9999px rgba(0,0,0,.45);border:3px solid #ff7f1f;transition:border-color .2s}
.nqr-frame.ok{border-color:#2fd27a}.nqr-frame.ko{border-color:#ff5a4d}
.nqr-msg{position:absolute;left:16px;right:16px;bottom:16px;padding:14px 16px;border-radius:16px;background:rgba(20,22,26,.86);font-weight:700;font-size:15px;text-align:center}
.nqr-msg.ok{background:#1f8f55}.nqr-msg.ko{background:#b5392f}
.nqr-bottom{padding:12px 16px max(16px,env(safe-area-inset-bottom));display:grid;gap:10px;background:#0d0f12}
.nqr-manual{display:flex;gap:8px}.nqr-manual input{flex:1;min-width:0;border-radius:12px;border:1px solid #3a3e45;background:#17191d;color:#fff;padding:12px;font-size:14px}
.nqr-manual button{border:0;border-radius:12px;background:#ff7f1f;color:#111;font-weight:800;padding:0 16px}
.nqr-card{position:absolute;left:12px;right:12px;top:12px;z-index:3;animation:nqrIn .25s ease}.nqr-card[hidden]{display:none}@keyframes nqrIn{from{transform:translateY(-12px);opacity:0}to{transform:none;opacity:1}}
.nqr-log{display:flex;gap:6px;overflow:auto;font-size:12px}.nqr-log span{white-space:nowrap;background:#1d2025;border-radius:99px;padding:6px 10px}.nqr-log span.ok{color:#7ee2a8}.nqr-log span.ko{color:#ff9a90}`;
function open({title='Escanear QR',subtitle='',onToken}){
 if(!document.getElementById('nqr-style')){const st=document.createElement('style');st.id='nqr-style';st.textContent=css;document.head.append(st);}
 const root=document.createElement('div');root.className='nqr';root.setAttribute('role','dialog');root.setAttribute('aria-label',title);
 root.innerHTML='<div class="nqr-top"><b>'+title+'<small>'+(subtitle||'Apunta al QR del trabajador. Puedes escanear varios seguidos.')+'</small></b><button type="button" class="nqr-close">Cerrar</button></div><div class="nqr-stage"><video playsinline muted autoplay></video><div class="nqr-frame"></div><div class="nqr-msg">Activando cámara…</div></div><div class="nqr-bottom"><form class="nqr-manual"><input placeholder="O pega el código del trabajador" autocomplete="off" aria-label="Código QR"><button type="submit">Validar</button></form><div class="nqr-log"></div></div>';
 document.body.append(root);
 const video=root.querySelector('video'),frame=root.querySelector('.nqr-frame'),msg=root.querySelector('.nqr-msg'),log=root.querySelector('.nqr-log');
 let stream=null,timer=null,busy=false,closed=false,last='',lastAt=0,detector=null,canvas=null,ctx=null,jsqr=null;
 const say=(text,kind='')=>{msg.textContent=text;msg.className='nqr-msg '+kind;frame.className='nqr-frame '+kind;};
 const close=()=>{closed=true;clearTimeout(timer);if(stream)stream.getTracks().forEach(t=>t.stop());root.remove();};
 root.querySelector('.nqr-close').onclick=close;
 async function handle(token){
  token=String(token||'').trim();if(!token||busy)return;
  if(token===last&&Date.now()-lastAt<6000)return;
  last=token;lastAt=Date.now();busy=true;say('Validando…');
  try{const r=await onToken(token);say(r?.label||'Fichaje registrado','ok');if(r?.card){let c=root.querySelector('.nqr-card');if(!c){c=document.createElement('div');c.className='nqr-card';root.querySelector('.nqr-stage').append(c);}c.innerHTML=r.card;c.hidden=false;clearTimeout(c._t);c._t=setTimeout(()=>{c.hidden=true},4500);c.onclick=()=>{c.hidden=true};}log.insertAdjacentHTML('afterbegin','<span class="ok">✓ '+String(r?.short||r?.label||'Fichaje').replace(/[<>&]/g,'')+'</span>');navigator.vibrate?.(80);}
  catch(e){say(e.message||'QR no válido','ko');log.insertAdjacentHTML('afterbegin','<span class="ko">✕ '+String(e.message||'Error').slice(0,60).replace(/[<>&]/g,'')+'</span>');navigator.vibrate?.([60,60,60]);}
  finally{busy=false;setTimeout(()=>{if(!closed&&!busy)say('Listo para el siguiente QR');},2200);}
 }
 root.querySelector('.nqr-manual').onsubmit=e=>{e.preventDefault();const input=e.target.querySelector('input');last='';handle(input.value);input.value='';};
 async function scan(){
  if(closed)return;
  try{
   if(!busy&&video.readyState>=2){
    let value='';
    if(detector){const codes=await detector.detect(video);value=codes[0]?.rawValue||'';}
    else if(jsqr){const w=video.videoWidth,h=video.videoHeight;if(w&&h){const scale=Math.min(1,640/Math.max(w,h));canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);ctx.drawImage(video,0,0,canvas.width,canvas.height);const img=ctx.getImageData(0,0,canvas.width,canvas.height);value=jsqr(img.data,img.width,img.height,{inversionAttempts:'dontInvert'})?.data||'';}}
    if(value)await handle(value);
   }
  }catch{}
  timer=setTimeout(scan,detector?120:220);
 }
 (async()=>{
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador no permite usar la cámara. Introduce el código manualmente.');
   if('BarcodeDetector' in window){try{const formats=await BarcodeDetector.getSupportedFormats?.();if(!formats||formats.includes('qr_code'))detector=new BarcodeDetector({formats:['qr_code']});}catch{detector=null;}}
   if(!detector){jsqr=await loadJsQR();canvas=document.createElement('canvas');ctx=canvas.getContext('2d',{willReadFrequently:true});}
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
   if(closed){stream.getTracks().forEach(t=>t.stop());return;}
   video.srcObject=stream;await video.play().catch(()=>{});say('Listo para escanear');scan();
  }catch(e){say(e.name==='NotAllowedError'?'Permiso de cámara denegado. Actívalo en el navegador o introduce el código.':(e.message||'Cámara no disponible'),'ko');}
 })();
 return {close};
}
window.NovaQrScanner={open};
})();
