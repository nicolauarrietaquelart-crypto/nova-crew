/* NOVA Crew native coordination workspace. Same-origin; no iframe. 
   Backed by the existing authorized CrewStore API. */
(()=>{
'use strict';
let node=null,active=null,record=null,timer=null,editing=false;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const api=(kind,extra={})=>window.NOVA_API.crewRequest({kind,code:active,...extra});
const time=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
const auth=s=>!!s&&(s.coordinatorUserId===(window.novaActiveAccount||window.NOVA_API?.account)||s.privilege==='crew'||s.assignedCoordinator);
const message=(title,details)=>window.toast?.(title,details);
function close(){clearInterval(timer);timer=null;node?.remove();node=null;active=null;record=null;document.body.classList.remove('crew-fullscreen-active');}
function back(){close();window.navigate?.('coordination');}
function workers(){return Object.entries(record?.workers||{}).map(([id,data])=>({id,...data}));}
function icon(){return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h18M12 3l-9 9 9 9"/></svg>';}
function layout(s){
 node=document.createElement('section');node.className='nova-native-crew';node.id='novaNativeCrew';
 node.innerHTML='<div class="nc-head"><button type="button" data-nc-back aria-label="Volver">'+icon()+'</button><div class="nc-titles"><small>NOVA CREW / COORDINACIÓN</small><h2>'+esc(s.name)+'</h2><span>CREW CONTROL · Módulo integrado</span></div><button type="button" data-nc-qr>QR</button><button type="button" data-nc-refresh>Actualizar</button></div><div class="nc-body"><div class="nc-top"><div id="ncStats"></div><label>Buscar trabajador<input id="ncSearch" placeholder="Nombre, equipo o especialidad" autocomplete="off"></label><label>Estado<select id="ncFilter"><option value="">Todos</option><option>PENDIENTE</option><option>PRESENTE</option><option>CONTACTADO</option><option>NO CONTACTADO</option><option>NO PRESENTADO</option></select></label></div><div id="ncTeams"></div><div id="ncFeedback" role="status" aria-live="polite"></div></div>';
 document.body.appendChild(node);document.body.classList.add('crew-fullscreen-active');
 node.addEventListener('click',handleClick);
 node.querySelector('#ncSearch').addEventListener('input',draw);
 node.querySelector('#ncFilter').addEventListener('change',draw);
}
function draw(){
 if(!node||!record)return;
 const all=workers(),search=node.querySelector('#ncSearch').value.trim().toLowerCase(),filter=node.querySelector('#ncFilter').value;
 const shown=all.filter(w=>(!filter||w.status===filter)&&(!search||[w.personal,w.especialidad,w.trabajo,w.teamId].some(x=>String(x||'').toLowerCase().includes(search))));
 const present=all.filter(w=>w.status==='PRESENTE').length;
 node.querySelector('#ncStats').innerHTML='<b>'+all.length+' trabajadores</b><b>'+present+' presentes</b><b>'+all.filter(w=>w.status==='PENDIENTE').length+' pendientes</b>';
 const byTeam=new Map();for(const w of shown){const name=String(w.trabajo||w.teamId||'SIN EQUIPO');if(!byTeam.has(name))byTeam.set(name,[]);byTeam.get(name).push(w)}
 node.querySelector('#ncTeams').innerHTML=[...byTeam].map(([team,list])=>'<section class="nc-team"><h3>'+esc(team)+' <span>'+list.length+'</span></h3><div class="nc-table-wrap"><table><thead><tr><th>Trabajador</th><th>Estado</th><th>Inicio</th><th>Fin</th><th>Pausa</th><th>Actitud</th><th></th></tr></thead><tbody>'+list.map(w=>'<tr data-nc-worker="'+esc(w.id)+'"><td><strong>'+esc(w.personal)+'</strong><small>'+esc(w.especialidad||'')+'</small></td><td><select data-nc-field="status">'+['PENDIENTE','PRESENTE','CONTACTADO','NO CONTACTADO','NO PRESENTADO'].map(x=>'<option '+(w.status===x?'selected':'')+'>'+x+'</option>').join('')+'</select></td><td><input data-nc-field="actualStart" aria-label="Inicio real" value="'+esc(w.actualStart||w.inicio||'')+'" placeholder="HH:MM"></td><td><input data-nc-field="actualEnd" aria-label="Fin real" value="'+esc(w.actualEnd||w.fin||'')+'" placeholder="HH:MM"></td><td><input data-nc-field="pausa" aria-label="Pausa" value="'+esc(w.pausa||'00:00')+'"></td><td><select data-nc-field="ratingActitud">'+[0,1,2,3,4,5].map(x=>'<option value="'+x+'" '+(Number(w.ratingActitud||0)===x?'selected':'')+'>'+x+' / 5</option>').join('')+'</select></td><td><button data-nc-save="'+esc(w.id)+'">Guardar</button></td></tr>').join('')+'</tbody></table></div></section>').join('')||'<p>No hay trabajadores con estos filtros.</p>';
}
async function reload(quiet=false){
 if(!active||editing)return;
 try{const data=await api('init');if(!data?.ok)throw Error(data?.error||'No se pudo cargar Crew Control');
 record={root:data.root,workers:Object.fromEntries((data.workers||[]).map(w=>[w.id,w])),incidents:data.incidents||[]};draw();
 if(!quiet)message('Crew Control','Datos sincronizados');
 }catch(e){if(!quiet)message('Crew Control',e.message);}
}
async function saveWorker(id){
 const tr=[...node.querySelectorAll('[data-nc-worker]')].find(x=>x.dataset.ncWorker===id);
 if(!tr||!record?.workers?.[id])return;
 const changes={};tr.querySelectorAll('[data-nc-field]').forEach(el=>changes[el.dataset.ncField]=el.value);
 if(!['actualStart','actualEnd','pausa'].every(k=>!changes[k]||time(changes[k]))){message('Horario','Introduce horas en formato HH:MM');return;}
 changes.ratingActitud=Number(changes.ratingActitud);
 const button=tr.querySelector('[data-nc-save]');button.disabled=true;editing=true;
 try{
  const current=record.workers[id];
  const updated={...current,...changes};
  const response=await api('batch',{ops:[{type:'set',path:['services',active,'workers',id],data:updated,merge:false}]});
  if(!response?.ok)throw Error(response.error||'Error al guardar');
  record.workers[id]=updated;message('Crew Control','Cambio guardado y compartido');draw();
 }catch(err){message('Crew Control',err.message);}finally{editing=false;if(button.isConnected)button.disabled=false;}
}
function handleClick(e){
 if(e.target.closest('[data-nc-back]')){back();return}
 if(e.target.closest('[data-nc-refresh]')){reload();return}
 if(e.target.closest('[data-nc-qr]')){document.getElementById('novaQrQuick')?.click();return}
 const b=e.target.closest('[data-nc-save]');if(b)saveWorker(b.dataset.ncSave);
}
async function open(s){
 if(!auth(s)){message('Crew Control','No tienes permisos para este servicio');return}
 if(node)close();active=s.id;layout(s);node.querySelector('#ncTeams').textContent='Cargando trabajadores…';await reload(true);
 timer=setInterval(()=>{if(!document.hidden&&!editing)reload(true)},12000);
}
window.renderCrewControl=open;window.closeCrewFullscreen=back;
document.addEventListener('click',ev=>{
 const trigger=ev.target.closest?.('[data-open-coordination],[data-service-coordination]');
 if(!trigger)return;
 const id=trigger.dataset.openCoordination||trigger.dataset.serviceCoordination;
 const s=typeof serviceById==='function'?serviceById(id):null;
 if(!s||s.privilege!=='crew')return;
 ev.preventDefault();ev.stopImmediatePropagation();window.navigate?.('crew-control');open(s);
},true);
})();
