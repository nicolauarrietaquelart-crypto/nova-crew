
const EMPLOYEE = { name:'Pau Ferrer', initials:'PF', phone:'670 555 221' };
const RADIUS_METERS = 500;

const services = [
  {
    id:'svc1', code:'381427', name:'LUMEN LIVE · PALAU METROPOLITÀ', date:'27/10/2026', short:'27 OCT', venue:'Palau Metropolità',
    address:'Passeig Olímpic, 5 · Barcelona', coords:{lat:41.36345,lng:2.15251},
    startISO:'2026-10-27T16:00:00+01:00', endISO:'2026-10-27T23:30:00+01:00', time:'16:00–23:30', call:'15:30',
    role:'HAND B', privilege:'worker', assignedCoordinator:false, coordinatorUserId:'coord', team:'STAGE', basicTeamSize:9,
    hands:8, crewHeads:1, forklifts:0, client:'Asteria Live Events', ref:'3814/26-BCN', type:'SHOW + LOAD OUT',
    specialty:'HAND B', coordinator:'Álvaro Costa', coordinatorPhone:'664 690 034', catering:'Sí', diet:'No',
    clothing:'Camiseta técnica negra', epi:'Guantes + botas + chaleco + casco', access:'Puerta técnica B'
  },
  {
    id:'svc2', code:'384902', name:'NEON DISTRICT · ARENA MONTJUÏC', date:'31/10/2026', short:'31 OCT', venue:'Arena Montjuïc',
    address:'Av. de l’Estadi, 18 · Barcelona', coords:{lat:41.36512,lng:2.15111},
    startISO:'2026-10-31T08:00:00+01:00', endISO:'2026-10-31T18:00:00+01:00', time:'08:00–18:00', call:'07:30',
    role:'FORKLIFTER', privilege:'worker', assignedCoordinator:false, coordinatorUserId:'coord', team:'LOGÍSTICA', basicTeamSize:7,
    hands:5, crewHeads:1, forklifts:1, client:'Nova Stage Productions', ref:'3849/26-BCN', type:'LOAD IN',
    specialty:'FORKLIFTER', coordinator:'Álvaro Costa', coordinatorPhone:'664 690 034', catering:'Sí', diet:'Sí',
    clothing:'Ropa de trabajo negra', epi:'Guantes + botas + chaleco + casco', access:'Muelle Norte'
  },
  {
    id:'svc3', code:'392118', name:'URBAN WAVE FEST · FÒRUM HALL', date:'04/11/2026', short:'04 NOV', venue:'Fòrum Hall',
    address:'Parc del Fòrum · Barcelona', coords:{lat:41.41173,lng:2.22224},
    startISO:'2026-11-04T07:00:00+01:00', endISO:'2026-11-04T19:00:00+01:00', time:'07:00–19:00', call:'06:30',
    role:'CREW HEAD', privilege:'crew', assignedCoordinator:true, coordinatorUserId:'demo', team:'PRINCIPAL',
    hands:28, crewHeads:1, forklifts:2, client:'Ritmo Iberia', ref:'3921/26-BCN', type:'LOAD IN + SHOW',
    specialty:'CREW HEAD', coordinator:'Pau Ferrer', coordinatorPhone:'670 555 221', catering:'Sí', diet:'Sí',
    clothing:'Uniformidad coordinación', epi:'Guantes + botas + chaleco + casco', access:'Acceso producción'
  },
  {
    id:'svc4', code:'398764', name:'ORBIT AWARDS 2026 · RECINTO ARENA', date:'11/11/2026', short:'11 NOV', venue:'Recinto Arena',
    address:'C/ Energia 44 · Barcelona', coords:{lat:41.35945,lng:2.12895},
    startISO:'2026-11-11T06:30:00+01:00', endISO:'2026-11-11T20:00:00+01:00', time:'06:30–20:00', call:'06:00',
    role:'CREW HEAD', privilege:'crew', assignedCoordinator:true, coordinatorUserId:'demo', team:'OPERACIONES',
    hands:38, crewHeads:2, forklifts:2, client:'Golden Stage Iberia', ref:'3987/26-BCN', type:'LOAD IN + SHOW + LOAD OUT',
    specialty:'CREW HEAD', coordinator:'Pau Ferrer', coordinatorPhone:'670 555 221', catering:'Sí', diet:'Sí',
    clothing:'Uniformidad coordinación', epi:'Guantes + botas + chaleco + casco', access:'Acceso artistas 1'
  },
  {
    id:'svc5', code:'401552', name:'ELECTRA LIVE · SANT JORDI HUB', date:'14/11/2026', short:'14 NOV', venue:'Sant Jordi Hub',
    address:'Montjuïc · Barcelona', coords:{lat:41.36313,lng:2.15318},
    startISO:'2026-11-14T13:00:00+01:00', endISO:'2026-11-14T23:00:00+01:00', time:'13:00–23:00', call:'12:30',
    role:'HAND A', privilege:'worker', assignedCoordinator:false, coordinatorUserId:null, team:'VÍDEO', basicTeamSize:12,
    hands:10, crewHeads:1, forklifts:1, client:'Blacklight Concerts', ref:'4015/26-BCN', type:'SHOW',
    specialty:'HAND A', coordinator:'', coordinatorPhone:'', catering:'No', diet:'No',
    clothing:'Camiseta técnica negra', epi:'Guantes + botas + chaleco', access:'Puerta camiones'
  }
  ,{
    id:'svc6',code:'412790',name:'LUMINA BUSINESS · SALA CENTRAL',date:'07/11/2026',short:'07 NOV',venue:'Sala Central',
    address:'Recinto Demo · Barcelona',coords:{lat:41.38,lng:2.17},
    startISO:'2026-11-07T09:00:00+01:00',endISO:'2026-11-07T16:00:00+01:00',time:'09:00–16:00',call:'08:30',
    role:'HAND B',privilege:'basic',assignedCoordinator:true,coordinatorUserId:'demo',team:'GENERAL',
    basicTeamSize:4,hands:4,crewHeads:0,forklifts:0,client:'Lumina Producciones',ref:'4127/26-BCN',type:'SERVICIO TÉCNICO',
    specialty:'HAND B',coordinator:'Pau Ferrer Soler',coordinatorPhone:'670 555 221',catering:'No',diet:'No',
    clothing:'Camiseta negra',epi:'Guantes + botas + chaleco',access:'Acceso de personal'
  },{
    id:'svc7',code:'418360',name:'SPECTRUM LIVE · PALAU METROPOLITÀ',date:'19/11/2026',short:'19 NOV',venue:'Palau Metropolità',
    address:'Recinto Demo · Barcelona',coords:{lat:41.36345,lng:2.15251},
    startISO:'2026-11-19T07:00:00+01:00',endISO:'2026-11-19T21:00:00+01:00',time:'07:00–21:00',call:'06:30',
    role:'HAND B',privilege:'basic',assignedCoordinator:true,coordinatorUserId:'coord',
    smallCoordinatorUserId:'demo',smallCoordinatorScope:'SFX',team:'SFX',basicTeamSize:4,
    hands:18,crewHeads:1,forklifts:2,client:'Spectrum Live Demo',ref:'4183/26-BCN',type:'LOAD IN + SFX + LOAD OUT',
    specialty:'HAND B',coordinator:'Álvaro Costa',coordinatorPhone:'664 690 034',catering:'Sí',diet:'Sí',
    clothing:'Uniformidad negra',epi:'Guantes + botas + chaleco + casco',access:'Acceso técnico'
  }
];

const docs = [
  {id:'doc-rules',icon:'▤',title:'Aceptación normativa interna',status:'Firmado · 08/01/2026'},
  {id:'doc-bank',icon:'▤',title:'Certificado de cuenta bancaria',status:'Revisión pendiente',pending:true},
  {id:'doc-conf',icon:'▤',title:'Cláusula de confidencialidad',status:'Firmado · 08/01/2026'},
  {id:'doc-id',icon:'▤',title:'Documento de identidad',status:'Válido hasta 2030'},
  {id:'doc-med',icon:'◇',title:'Informe aptitud revisión médica',status:'Revisión pendiente',pending:true},
  {id:'doc-prl',icon:'◇',title:'Diploma PRL eventos',status:'Válido'}
];

const contracts = [
  ['Contrato temporal técnico eventos · Tiempo parcial','25/10/2026','25/10/2026'],
  ['Contrato temporal técnico eventos · Tiempo parcial','18/10/2026','20/10/2026'],
  ['Contrato temporal técnico eventos · Tiempo completo','30/09/2026','30/09/2026'],
  ['Contrato temporal técnico eventos · Tiempo parcial','23/09/2026','23/09/2026']
];

const payrollMonths = {
  oct26:{
    label:'Octubre 2026', short:'OCT 2026',
    rows:[
      ['02/10/26','N2601-BCN','NOVA PRODUCCIONES','ECHO HALL','R','HAND B','08:00','14:00','06,00','00,30','58,80','0,00','10,00','0,00','0,00','0,00','68,80'],
      ['04/10/26','N2610-BCN','ASTRA EVENTS','LUMINA TOUR','R','HAND B','17:00','23:30','06,30','00,00','63,70','0,00','0,00','0,00','0,00','0,00','63,70'],
      ['07/10/26','N2624-BCN','URBAN STAGE','METRO SESSION','R','FORKLIFTER','07:00','15:00','08,00','00,30','88,00','0,00','10,00','0,00','8,00','0,00','106,00'],
      ['10/10/26','N2639-BCN','RITMO LAB','NIGHT PULSE','R','HAND A','15:00','23:00','08,00','00,30','78,40','0,00','10,00','0,00','0,00','0,00','88,40'],
      ['12/10/26','N2648-BCN','BLACKLIGHT LIVE','VECTOR SHOW','R','HAND B','09:00','18:00','09,00','00,45','88,20','0,00','10,00','0,00','0,00','0,00','98,20'],
      ['16/10/26','N2665-BCN','GOLDEN STAGE','AURORA LIVE','R','HAND B','18:00','01:00','07,00','00,00','68,60','0,00','0,00','0,00','0,00','0,00','68,60'],
      ['18/10/26','N2677-BCN','NORTH EVENTS','CITY SIGNAL','R','HAND A','10:00','20:00','10,00','01,00','98,00','0,00','10,00','0,00','0,00','0,00','108,00'],
      ['21/10/26','N2691-BCN','ARENA WORKS','SOLAR FRAME','R','FORKLIFTER','06:30','16:30','10,00','01,00','110,00','0,00','10,00','0,00','12,00','0,00','132,00'],
      ['23/10/26','N2704-BCN','MOTION EVENTS','ELECTRIC ROOM','R','HAND B','14:00','22:00','08,00','00,30','78,40','0,00','10,00','0,00','0,00','0,00','88,40'],
      ['25/10/26','N2712-BCN','NOVA LIVE','NIGHT SIGNAL','R','CREW HEAD','08:00','18:00','10,00','00,30','98,00','18,00','10,00','0,00','0,00','0,00','126,00'],
      ['27/10/26','N2726-BCN','LUMEN PRODUCTIONS','LUMEN LIVE','R','HAND B','16:00','23:30','07,30','00,30','73,50','0,00','10,00','0,00','0,00','0,00','83,50']
    ]
  },
  sep26:{
    label:'Septiembre 2026', short:'SEP 2026',
    rows:[
      ['03/09/26','2318/26-BCN','ARENA EVENTS','MIRAGE TOUR','R','HAND A','08:00','16:00','08,00','00,30','69,75','0,00','10,00','0,00','0,00','0,00','79,75'],
      ['05/09/26','2332/26-BCN','LOUD LIVE','NOVA FEST','R','HAND A','17:00','23:30','06,30','00,00','60,45','0,00','0,00','0,00','0,00','0,00','60,45'],
      ['10/09/26','2388/26-BCN','BLACKLIGHT','AXIS LIVE','R','FORKLIFTER','07:00','15:00','08,00','00,30','88,00','0,00','10,00','0,00','0,00','0,00','98,00'],
      ['12/09/26','2391/26-BCN','RITMO IBERIA','URBAN HALL','R','HAND B','10:00','20:00','10,00','01,00','93,00','0,00','10,00','0,00','0,00','0,00','103,00'],
      ['18/09/26','2438/26-BCN','SOUNDWAY','AIRBAG','R','CREW HEAD','13:00','23:00','10,00','00,30','93,00','18,00','10,00','0,00','0,00','0,00','121,00'],
      ['25/09/26','2480/26-BCN','LIVE NATION','NIGHT SIGNAL','R','HAND B','18:00','00:30','06,30','00,00','60,45','0,00','0,00','0,00','0,00','0,00','60,45']
    ]
  },
  aug26:{
    label:'Agosto 2026', short:'AGO 2026',
    rows:[
      ['02/08/26','2104/26-BCN','SUNSET EVENTS','BEACH LIVE','R','HAND B','14:00','23:00','09,00','00,30','83,70','0,00','10,00','0,00','0,00','0,00','93,70'],
      ['08/08/26','2140/26-BCN','MUSIC PORT','SUMMER HALL','R','HAND A','08:00','16:00','08,00','00,30','74,40','0,00','10,00','0,00','0,00','0,00','84,40'],
      ['14/08/26','2179/26-BCN','NOVA LIVE','ELECTRA','R','FORKLIFTER','07:00','17:00','10,00','01,00','110,00','0,00','10,00','0,00','0,00','0,00','120,00'],
      ['21/08/26','2215/26-BCN','ASTRAL PROD','NOCTURNA','R','HAND B','19:00','02:00','07,00','00,00','65,10','0,00','0,00','0,00','0,00','0,00','65,10'],
      ['28/08/26','2250/26-BCN','GOLDEN STAGE','ORBIT','R','CREW HEAD','09:00','20:00','11,00','01,00','102,30','20,00','10,00','0,00','0,00','0,00','132,30']
    ]
  },
  jul26:{
    label:'Julio 2026', short:'JUL 2026',
    rows:[
      ['04/07/26','1908/26-BCN','FESTIVAL BCN','NORTH STAGE','R','HAND B','09:00','18:00','09,00','00,30','83,70','0,00','10,00','0,00','0,00','0,00','93,70'],
      ['10/07/26','1941/26-BCN','LIVE NATION','CITY TOUR','R','HAND A','16:00','00:00','08,00','00,00','74,40','0,00','0,00','0,00','0,00','0,00','74,40'],
      ['16/07/26','1984/26-BCN','ARENA EVENTS','SUMMER NIGHT','R','HAND B','18:00','02:00','08,00','00,00','74,40','0,00','0,00','0,00','0,00','0,00','74,40'],
      ['22/07/26','2011/26-BCN','BLACKLIGHT','SONIC ARENA','R','FORKLIFTER','06:30','15:00','08,30','00,30','93,50','0,00','10,00','0,00','0,00','0,00','103,50']
    ]
  },
  jun26:{label:'Junio 2026', short:'JUN 2026', rows:[
    ['02/06/26','1702/26-BCN','RITMO IBERIA','METRO FEST','R','HAND B','08:00','17:00','09,00','00,30','83,70','0,00','10,00','0,00','0,00','0,00','93,70'],
    ['09/06/26','1746/26-BCN','SHOWBIZ','HORIZON','R','HAND A','13:00','22:00','09,00','00,30','83,70','0,00','10,00','0,00','0,00','0,00','93,70'],
    ['18/06/26','1793/26-BCN','NOVA LIVE','LUMEN','R','CREW HEAD','07:00','18:00','11,00','01,00','102,30','18,00','10,00','0,00','0,00','0,00','130,30']
  ]},
  may26:{label:'Mayo 2026', short:'MAY 2026', rows:[
    ['07/05/26','1503/26-BCN','ARENA EVENTS','PULSE','R','HAND B','10:00','19:00','09,00','00,30','83,70','0,00','10,00','0,00','0,00','0,00','93,70'],
    ['15/05/26','1551/26-BCN','LOUD LIVE','MOTION','R','FORKLIFTER','08:00','18:00','10,00','01,00','110,00','0,00','10,00','0,00','0,00','0,00','120,00'],
    ['29/05/26','1610/26-BCN','GOLDEN STAGE','SOLAR','R','HAND A','16:00','23:30','07,30','00,00','69,75','0,00','0,00','0,00','0,00','0,00','69,75']
  ]},
  apr26:{label:'Abril 2026', short:'ABR 2026', rows:[
    ['03/04/26','1308/26-BCN','MUSIC PORT','ECHO','R','HAND B','09:00','17:00','08,00','00,30','74,40','0,00','10,00','0,00','0,00','0,00','84,40'],
    ['12/04/26','1355/26-BCN','BLACKLIGHT','VECTOR','R','HAND B','18:00','01:00','07,00','00,00','65,10','0,00','0,00','0,00','0,00','0,00','65,10'],
    ['24/04/26','1412/26-BCN','ASTRAL PROD','ORBITAL','R','CREW HEAD','07:00','18:00','11,00','01,00','102,30','18,00','10,00','0,00','0,00','0,00','130,30']
  ]},
  mar26:{label:'Marzo 2026', short:'MAR 2026', rows:[
    ['05/03/26','1114/26-BCN','RITMO IBERIA','CITY HALL','R','HAND A','08:00','16:00','08,00','00,30','74,40','0,00','10,00','0,00','0,00','0,00','84,40'],
    ['17/03/26','1170/26-BCN','NOVA LIVE','NEON','R','HAND B','15:00','23:00','08,00','00,00','74,40','0,00','0,00','0,00','0,00','0,00','74,40']
  ]}
};

const firstNames=['Adrià','Aina','Albert','Aleix','Anna','Arnau','Berta','Biel','Bruna','Carla','Carlos','Clàudia','David','Elena','Eric','Gemma','Gerard','Guillem','Irene','Jana','Jordi','Júlia','Laia','Marc','Marta','Nil','Nora','Oriol','Pablo','Pol','Sergi','Víctor','Xavi','Zoè','Marina','Hugo','Joan','Núria','Ivan','Alba'];
const lastNames=['Soler','Costa','Vidal','Pons','Navarro','Roca','Grau','Ferrer','Ruiz','Mas','Serra','Molina','Parra','Casas','Gil','Prats'];
const teams=['GENERAL','STAGE','LUCES','AUDIO','VIDEO','PUSHERS','BACKLINE'];
const statuses=['PENDIENTE','PRESENTE','PRESENTE','CONTACTADO','PRESENTE','RESERVA'];

const pageMeta={
  home:['Área de empleado / Inicio','Buenos días, Pau'],
  clock:['Área de empleado / Control horario','Control horario'],
  availability:['Área de empleado / Disponibilidad','Disponibilidad'],
  services:['Área de empleado / Servicios','Tus servicios'],
  'service-detail':['Área de empleado / Servicios / Ficha','Ficha del servicio'],
  agenda:['Área de empleado / Mi agenda','Mi agenda'],
  coordination:['Área de empleado / Coordinación','Coordinación'],
  'worker-coordination':['Área de empleado / Coordinación / Gestión','Gestión del servicio'],
  'crew-control':['Coordinación / Crew Control','Crew Control'],
  company:['Área de empleado / Datos empresa','Datos de empresa'],
  training:['Área de empleado / Formación','Formación'],
  documents:['Área de empleado / Documentación','Documentación'],
  tutorials:['Área de empleado / Tutoriales','Tutoriales'],
  payroll:['Área de empleado / Liquidaciones','Liquidaciones'],
  contracts:['Área de empleado / Contratos','Contratos'],
  profile:['Área de empleado / Perfil','Mi perfil']
};
const pageIds={
  home:'page-home', clock:'page-clock', availability:'page-availability', services:'page-services', 'service-detail':'page-service-detail',
  agenda:'page-agenda',coordination:'page-coordination', 'worker-coordination':'page-worker-coordination', 'crew-control':'page-crew-control',
  company:'page-company', training:'page-training', documents:'page-documents', tutorials:'page-tutorials',
  payroll:'page-payroll', contracts:'page-contracts', profile:'page-profile'
};

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const serviceById=id=>services.find(s=>s.id===id);
const assignedServices=()=>services.filter(s=>new Date(s.endISO).getTime()>Date.now() && (window.novaActiveAccount==='coord'?['svc1','svc2','svc3','svc4','svc7'].includes(s.id):true));

function toast(title,text){
  $('#toastTitle').textContent=title;
  $('#toastText').textContent=text;
  $('#toast').classList.add('show');
  clearTimeout(window._toast);
  window._toast=setTimeout(()=>$('#toast').classList.remove('show'),2600);
}
function roleLabel(s){return String(s.role||'').toUpperCase()}
function totalPersonnel(s){return (s.hands||0)+(s.crewHeads||0)+(s.forklifts||0)}

function navigate(key){
  // Control horario is an action, not a standalone page.
  // Use the exact same QR chooser as the header button and Crew Control.
  if(key==='clock'){
    $('#sidebar')?.classList.remove('open');
    document.getElementById('novaQrQuick')?.click();
    return;
  }
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  $('#'+pageIds[key])?.classList.add('active');
  document.body.classList.toggle('crew-mode',key==='crew-control');
  const root=key==='service-detail'?'services':(key==='worker-coordination'||key==='crew-control'?'coordination':key);
  $$('.nav-btn').forEach(n=>n.classList.toggle('active',n.dataset.page===root));
  if(key!=='crew-control'){
    const meta=pageMeta[key]||['Área de empleado','Portal'];
    $('#breadcrumb').textContent=meta[0];
    const actor=window.novaActiveAccount||window.NOVA_API?.account;
    const firstName=actor==='coord'?'Álvaro':((actor==='demo'&&portalProfile?.firstName)||'Pau');
    $('#pageTitle').textContent=key==='home'?'Buenos días, '+firstName:meta[1];
  }
  $('#sidebar').classList.remove('open');
  const sc=$('#mainScroller'); if(sc){ if(typeof sc.scrollTo==='function') sc.scrollTo({top:0,behavior:'smooth'}); else sc.scrollTop=0; }
  if(key==='clock') renderClockService();
  if(key==='availability') renderAvailability();
  if(key==='payroll') renderPayrollMonths();
  if(key==='training') renderTraining();
  if(key==='profile'){renderProfileEditableLists();renderAvailabilityBasePreview();}
}

function getUpcomingService(){
  const now=Date.now();
  const future=assignedServices()
    .map(s=>({...s,startMs:new Date(s.startISO).getTime()}))
    .filter(s=>s.startMs>now)
    .sort((a,b)=>a.startMs-b.startMs);
  return future[0]||null;
}

function updateHomeNextService(){
  const s=getUpcomingService();
  window.homeNextService=s;
  $('#homeNextName').textContent=s?s.name:'Sin próximos servicios';
  $('#homeNextMeta').textContent=s?`${s.date} · ${s.time} · ${roleLabel(s)}`:'Consulta tus avisos en la campana.';
}

function updateCountdown(){
  const s=window.homeNextService||getUpcomingService();
  if(!s){['cdDays','cdHours','cdMinutes','cdSeconds'].forEach(id=>{$('#'+id).textContent='00'});$('#countdownStatus').textContent='';return;}
  const target=new Date(s.startISO).getTime();
  let diff=target-Date.now();
  if(diff<=0){
    updateHomeNextService();
    const next=window.homeNextService;
    diff=Math.max(0,new Date(next.startISO).getTime()-Date.now());
  }
  const days=Math.floor(diff/86400000); diff%=86400000;
  const hours=Math.floor(diff/3600000); diff%=3600000;
  const mins=Math.floor(diff/60000); diff%=60000;
  const secs=Math.floor(diff/1000);
  $('#cdDays').textContent=String(days).padStart(2,'0');
  $('#cdHours').textContent=String(hours).padStart(2,'0');
  $('#cdMinutes').textContent=String(mins).padStart(2,'0');
  $('#cdSeconds').textContent=String(secs).padStart(2,'0');
  $('#countdownStatus').textContent=diff>0?'Cuenta atrás hasta la hora de inicio':'';
}

function renderHomeServices(){
  $('#homeServices').innerHTML=assignedServices().slice().sort((a,b)=>new Date(a.startISO)-new Date(b.startISO)).slice(0,3).map(s=>`
    <article class="glass card">
      <span class="kicker">${s.short}</span>
      <h4>${s.name}</h4>
      <p class="muted">${s.time} · ${roleLabel(s)} · ${s.team}</p>${coordinatorContactV9(s)}
      <div class="inline-actions" style="margin-top:14px">
        <button class="btn light" data-open-service="${s.id}">Ver servicio</button>
      </div>
    </article>`).join('');
}

function renderServices(){
  $('#servicesList').innerHTML=assignedServices().slice().sort((a,b)=>new Date(a.startISO)-new Date(b.startISO)).map(s=>`
    <article class="glass service-card">
      <div class="service-date"><b>${s.short.split(' ')[0]}</b><span>${s.short.split(' ')[1]} 2026</span></div>
      <div class="service-main">
        <h4>${s.name}</h4>
        <p>${s.venue}</p>
        ${coordinatorContactV9(s)}
        <div class="service-time-row"><span class="service-time-pill">INICIO <b>${s.time.split('–')[0]}</b></span><span class="service-time-pill">FIN <b>${s.time.split('–')[1]}</b></span></div>
        <div class="chips">
          <span class="chip orange">${roleLabel(s)}</span>
          ${s.assignedCoordinator?'<span class="chip coordinator-chip">COORDINADOR</span>':''}
          <span class="chip">${s.team}</span>
        </div>
      </div>
      <div class="service-actions">
        <button class="btn dark" data-open-service="${s.id}">Abrir ficha</button>
        <button class="btn light nova-download-only" type="button" data-service-print="${s.id}" title="Descargar ficha del servicio" aria-label="Descargar ficha del servicio">${novaDownloadIcon}</button>
      </div>
    </article>`).join('');
  window.NOVA_V15_CONFIRM?.refresh?.();
}

function renderServiceDetail(s){
  $('#serviceDetail').innerHTML=`
    <div class="service-detail-grid">
      <article class="glass detail-card">
        <h2>${s.name}</h2>
        <p>${s.date} · ${s.time} · ${roleLabel(s)}</p>
        <div class="notice-box">Es obligatorio presentarse con la uniformidad indicada y los EPI básicos suministrados o requeridos para el servicio.</div>
        <div class="detail-section">
          <h4>Datos del servicio</h4>
          <div class="kv">
            <span>Cliente</span><b>${s.client}</b>
            <span>Referencia</span><b>${s.ref}</b>
            <span>Tipo</span><b>${s.type}</b>
            <span>Especialidad</span><b>${s.specialty}</b>
            <span>Hora llamada</span><b>${s.call}</b>
            <span>Horario</span><b>${s.time}</b>
          </div>
        </div>
        <div class="detail-section">
          <h4>Datos del recinto</h4>
          <div class="kv">
            <span>Recinto</span><b>${s.venue}</b>
            <span>Dirección</span><b>${s.address}</b>
            <span>Acceso</span><b>${s.access}</b>
            ${coordinatorDetailV9(s)}
          </div>
        </div>
        <div class="detail-section">
          <h4>Información</h4>
          <div class="kv">
            <span>Catering</span><b>${s.catering}</b>
            <span>Dieta</span><b>${s.diet}</b>
            <span>Vestuario</span><b>${s.clothing}</b>
            <span>EPI</span><b>${s.epi}</b>
          </div>
        </div>
      </article>
      <aside class="side-stack">
        <article class="glass card"><h4>Prevención</h4><p class="muted">Plan de autoprotección y documentación PRL asociada al recinto.</p><button class="btn primary" data-page="documents">Abrir documentación</button></article>
        <article class="glass card"><h4>Tu asignación</h4><div class="mini-list"><div><b>${roleLabel(s)}</b>${s.assignedCoordinator?'<br><span class="coordinator-text">COORDINADOR DEL SERVICIO</span>':''}<br><span class="muted">${s.team}</span></div><div><b>Entrada ${s.call}</b><br><span class="muted">Inicio ${s.time.split('–')[0]}</span></div></div>${(s.assignedCoordinator||s.privilege==='crew')?`<button class="btn primary full" style="margin-top:14px" data-service-coordination="${s.id}">Coordinación →</button>`:''}</article>
      </aside>
    </div>`;
}

function renderCoordination(){
  const coordinated=assignedServices().filter(s=>s.assignedCoordinator||s.privilege==='crew');
  $('#coordinationList').innerHTML=coordinated.map(s=>{
    const crew=s.privilege==='crew';
    const people=crew?totalPersonnel(s):s.basicTeamSize;
    return `
      <article class="glass service-card">
        <div class="service-date"><b>${s.short.split(' ')[0]}</b><span>${s.short.split(' ')[1]} 2026</span></div>
        <div class="service-main">
          <h4>${s.name}</h4>
          <p>${s.time}</p>
          <div class="chips">
            <span class="chip orange">${roleLabel(s)}</span>
            <span class="chip">${people} PERSONAS</span>
          </div>
        </div>
        <div class="service-actions">
          <button class="btn ${crew?'primary':'dark'}" data-open-coordination="${s.id}">${crew?'Abrir Crew Control':'Gestión de equipo'}</button>
        </div>
      </article>`;
  }).join('');
}

/* ---------------- Coordinación básica (HAND / FORKLIFTER) ---------------- */

const basicCoordState={service:null,workers:[],search:'',shiftFilter:'ALL',selected:new Set()};

function makeBasicCoordWorkers(service){
  const saved=localStorage.getItem(`basicTeam-${service.id}`);
  if(saved){try{return JSON.parse(saved)}catch(e){}}
  const count=service.basicTeamSize||8;
  const baseStart=service.time.split('–')[0], baseEnd=service.time.split('–')[1];
  const starts=[baseStart,addTime(baseStart,60),addTime(baseStart,120)];
  const ends=[baseEnd,baseEnd,addTime(baseEnd,-60)];
  const rows=[];
  for(let i=0;i<count;i++){
    const isFork=i===count-1&&service.role==='FORKLIFTER';
    const shiftIndex=i%3;
    rows.push({id:`${service.id}-b${i+1}`,name:`${firstNames[(i+6)%firstNames.length]} ${lastNames[(i*5+2)%lastNames.length]}`,role:isFork?'FORKLIFTER':(i===0?'CREW HEAD':(i%3===0?'HAND A':'HAND B')),team:i===0?'GENERAL':(isFork?'FORKLIFTER':teams[(i+1)%teams.length]),start:starts[shiftIndex],end:ends[shiftIndex],pause:i%3===0?'00:30':'00:00',diet:i%2===0?'Sí':'No',rating:3+(i%3),status:i%5===0?'CONTACTADO':'PENDIENTE',incident:i===3?'Llegada 10 min tarde':'',notes:''});
  }
  return rows;
}
function addTime(value,minutes){const m=String(value||'00:00').match(/^(\d{1,2}):(\d{2})$/);if(!m)return value;let total=(Number(m[1])*60+Number(m[2])+Number(minutes))%1440;if(total<0)total+=1440;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
function saveBasicCoord(){if(!basicCoordState.service)return;localStorage.setItem(`basicTeam-${basicCoordState.service.id}`,JSON.stringify(basicCoordState.workers));if(window.google&&google.script&&google.script.run){google.script.run.withFailureHandler(err=>console.warn(err)).saveSmallCoordination(basicCoordState.service.id,basicCoordState.workers)}}
function loadBasicCoordFromServer(service){if(!(window.google&&google.script&&google.script.run))return;google.script.run.withSuccessHandler(rows=>{if(Array.isArray(rows)&&rows.length&&basicCoordState.service?.id===service.id){basicCoordState.workers=rows;localStorage.setItem(`basicTeam-${service.id}`,JSON.stringify(rows));renderBasicShiftFilters();renderBasicTeamRows()}}).withFailureHandler(()=>{}).getSmallCoordination(service.id)}
function basicShiftKey(w){return `${w.start}–${w.end}`}
function visibleBasicWorkers(){const q=(basicCoordState.search||'').trim().toLowerCase();return basicCoordState.workers.filter(w=>(!q||`${w.name} ${w.role} ${w.team}`.toLowerCase().includes(q))&&(basicCoordState.shiftFilter==='ALL'||basicShiftKey(w)===basicCoordState.shiftFilter))}
function renderWorkerCoord(s){basicCoordState.service=s;basicCoordState.workers=makeBasicCoordWorkers(s);basicCoordState.search='';basicCoordState.shiftFilter='ALL';basicCoordState.selected=new Set();$('#workerCoordDetail').innerHTML=`<div class="basic-coord-shell"><article class="glass basic-coord-hero"><div><span class="kicker">${roleLabel(s)}</span><h2>${s.name}</h2><p>${s.date} · INICIO ${s.time.split('–')[0]} · FIN ${s.time.split('–')[1]} · ${s.venue}</p></div><div class="basic-summary"><span>${basicCoordState.workers.length} PERSONAS</span><span>${basicCoordState.workers.filter(w=>w.diet==='Sí').length} DIETAS</span><span>${basicCoordState.workers.filter(w=>w.incident).length} INCIDENCIAS</span></div></article><div class="basic-toolbar"><input id="basicCoordSearch" placeholder="Buscar trabajador, categoría o equipo…"><button class="btn light" id="basicAddIncident">+ Incidencia general</button><button class="btn primary" id="basicSaveAll">Guardar cambios</button></div><div id="basicShiftFilters" class="basic-shift-row"></div><div class="basic-selection-bar"><strong id="basicSelectedCount">0 seleccionados</strong><button id="basicSelectVisible">Seleccionar visibles</button><button id="basicClearSelected">Limpiar</button><button class="primary-small" id="basicBulkEdit">Editar selección</button></div><div class="glass basic-team-wrap scroll-clean"><table class="basic-team-table"><thead><tr><th>✓</th><th>Personal</th><th>Categoría</th><th>Equipo</th><th>Inicio</th><th>Fin</th><th>Pausa</th><th>Dieta</th><th>Estado</th><th>Valoración</th><th>Incidencia</th><th></th></tr></thead><tbody id="basicTeamBody"></tbody></table></div></div>`;renderBasicShiftFilters();renderBasicTeamRows();loadBasicCoordFromServer(s)}
function renderBasicShiftFilters(){const root=$('#basicShiftFilters');if(!root)return;const shifts=[...new Set(basicCoordState.workers.map(basicShiftKey))];root.innerHTML=[`<button class="basic-shift-chip ${basicCoordState.shiftFilter==='ALL'?'active':''}" data-basic-shift="ALL">TODOS</button>`].concat(shifts.map(x=>`<button class="basic-shift-chip ${basicCoordState.shiftFilter===x?'active':''}" data-basic-shift="${x}">${x}</button>`)).join('')}
function renderBasicTeamRows(){const root=$('#basicTeamBody');if(!root)return;const rows=visibleBasicWorkers();root.innerHTML=rows.map(w=>`<tr class="${w.incident?'has-incident':''} ${basicCoordState.selected.has(w.id)?'is-selected':''}"><td><input type="checkbox" data-basic-select="${w.id}" ${basicCoordState.selected.has(w.id)?'checked':''}></td><td><b>${w.name}</b></td><td>${w.role}</td><td>${w.team}</td><td>${w.start}</td><td>${w.end}</td><td>${w.pause}</td><td>${w.diet}</td><td>${w.status||'PENDIENTE'}</td><td class="stars">${'★'.repeat(w.rating)}${'☆'.repeat(5-w.rating)}</td><td>${w.incident||'—'}</td><td><button data-basic-edit="${w.id}">Editar</button></td></tr>`).join('');const count=$('#basicSelectedCount');if(count)count.textContent=`${basicCoordState.selected.size} seleccionados`}
function openBasicBulkEdit(){const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));if(!selected.length){toast('Coordinación','Selecciona uno o varios trabajadores.');return}openDemoModal(`Editar ${selected.length} trabajadores`,`<div class="basic-modal-grid"><label>Inicio (vacío = mantener)<input id="bbStart" placeholder="08:00"></label><label>Fin<input id="bbEnd" placeholder="18:00"></label><label>Pausa<input id="bbPause" placeholder="00:30"></label><label>Dieta<select id="bbDiet"><option value="">Mantener</option><option>Sí</option><option>No</option></select></label><label>Estado<select id="bbStatus"><option value="">Mantener</option><option>PENDIENTE</option><option>CONTACTADO</option><option>PRESENTE</option><option>NO PRESENTADO</option></select></label><label>Valoración<select id="bbRating"><option value="">Mantener</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label></div><div class="crew-modal-actions"><button class="btn light" id="bbCancel">Cancelar</button><button class="btn primary" id="bbApply">Aplicar cambios</button></div>`);setTimeout(()=>{$('#bbCancel').onclick=closeDemoModal;$('#bbApply').onclick=()=>{const patch={start:$('#bbStart').value.trim(),end:$('#bbEnd').value.trim(),pause:$('#bbPause').value.trim(),diet:$('#bbDiet').value,status:$('#bbStatus').value,rating:$('#bbRating').value};selected.forEach(w=>Object.entries(patch).forEach(([k,v])=>{if(v!=='')w[k]=k==='rating'?Number(v):v}));saveBasicCoord();closeDemoModal();renderBasicShiftFilters();renderBasicTeamRows();toast('Coordinación',`${selected.length} trabajadores actualizados.`)}} ,0)}

function ensureDemoModal(){
  let modal=$('#demoModal');
  if(modal)return modal;
  document.body.insertAdjacentHTML('beforeend',`
    <div id="demoModal" class="crew-modal hidden">
      <div class="crew-modal-card">
        <div class="crew-modal-head"><h3 id="demoModalTitle">Detalle</h3><button id="demoModalClose" class="icon-only">×</button></div>
        <div id="demoModalBody"></div>
      </div>
    </div>`);
  modal=$('#demoModal');
  $('#demoModalClose').onclick=()=>modal.classList.add('hidden');
  modal.onclick=e=>{if(e.target===modal)modal.classList.add('hidden')};
  return modal;
}
function openDemoModal(title,body){
  ensureDemoModal();
  $('#demoModalTitle').textContent=title;
  $('#demoModalBody').innerHTML=body;
  $('#demoModal').classList.remove('hidden');
}
function closeDemoModal(){ensureDemoModal().classList.add('hidden')}

function editBasicWorker(id){
  const w=basicCoordState.workers.find(x=>x.id===id);
  if(!w)return;
  openDemoModal('Gestionar trabajador',`
    <div class="basic-modal-grid">
      <label>Nombre<input id="bmName" value="${w.name}"></label><label>Teléfono<input id="bmPhone" inputmode="tel" value="${w.phone||''}"></label>
      <label>Categoría<select id="bmRole">${['HAND A','HAND B','FORKLIFTER','CREW HEAD'].map(v=>`<option ${v===w.role?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Equipo<select id="bmTeam">${[...teams,'FORKLIFTER'].map(v=>`<option ${v===w.team?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Dieta<select id="bmDiet"><option ${w.diet==='No'?'selected':''}>No</option><option ${w.diet==='Sí'?'selected':''}>Sí</option></select></label>
      <label>Inicio<input id="bmStart" value="${w.start}"></label>
      <label>Fin<input id="bmEnd" value="${w.end}"></label>
      <label>Pausa<input id="bmPause" value="${w.pause}" placeholder="00:30"></label>
      <label>Valoración<select id="bmRating">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.rating?'selected':''}>${n} / 5</option>`).join('')}</select></label>
      <label class="full">Incidencia<textarea id="bmIncident" rows="3">${w.incident||''}</textarea></label>
      <label class="full">Notas<textarea id="bmNotes" rows="2">${w.notes||''}</textarea></label>
    </div>
    <div class="crew-modal-actions"><button class="btn light" id="bmCancel">Cancelar</button><button class="btn primary" id="bmSave">Guardar</button></div>`);
  setTimeout(()=>{
    $('#bmCancel').onclick=closeDemoModal;
    $('#bmSave').onclick=()=>{
      w.name=$('#bmName').value.trim()||w.name;w.phone=$('#bmPhone')?.value.trim()||w.phone;
      w.role=$('#bmRole').value;
      w.team=$('#bmTeam').value;
      w.diet=$('#bmDiet').value;
      w.start=$('#bmStart').value;
      w.end=$('#bmEnd').value;
      w.pause=$('#bmPause').value;
      w.rating=Number($('#bmRating').value);
      w.incident=$('#bmIncident').value.trim();
      w.notes=$('#bmNotes').value.trim();
      saveBasicCoord();
      closeDemoModal();
      renderBasicTeamRows();
      toast('Coordinación','Trabajador actualizado.');
    };
  },0);
}



/* ---------------- Crew Control exacto v11.2.30 ---------------- */
let currentCrewService=null;
function openExactCrewControl(service){currentCrewService=service;const base=(document.body.dataset.webappUrl||'').trim();const frame=$('#crewControlFrame');$('#crewEmbedTitle').textContent=service.name;$('#crewEmbedMeta').textContent=`${service.date} · ${service.role} · código ${service.code}`;if(!base){toast('Crew Control','Publica el proyecto como Aplicación web para abrir el módulo exacto.');return}frame.src=`${base}?view=crew&code=${encodeURIComponent(service.code)}&integrated=1&_=${Date.now()}`}
function reloadExactCrewControl(){if(currentCrewService)openExactCrewControl(currentCrewService)}

/* ---------------- Control horario ---------------- */

function gpsEligible(s){const actor=window.novaActiveAccount||window.NOVA_API?.account||'demo';return !!s&&(!s.coordinatorUserId||s.coordinatorUserId===actor||s.assignedCoordinator&&s.coordinatorUserId===actor);}
function clockAllowed(s){const now=Date.now(),start=new Date(s.startISO).getTime(),end=new Date(s.endISO).getTime();return Number.isFinite(start)&&now>=start-3600000&&now<=end+7200000;}
function findClockService(){
  const now=Date.now();
  const candidates=services.filter(gpsEligible).map(s=>({...s,startMs:new Date(s.startISO).getTime(),endMs:new Date(s.endISO).getTime()})).sort((a,b)=>a.startMs-b.startMs);
  return candidates.find(s=>now>=s.startMs-4*3600000 && now<=s.endMs+2*3600000) || candidates.find(s=>s.startMs>now) || candidates[candidates.length-1];
}
function renderClockService(){
  const dropdown=$('#clockServicePicker');
  if(dropdown){const eligible=services.filter(gpsEligible);const keep=dropdown.value;dropdown.innerHTML=eligible.map(x=>'<option value="'+x.id+'">'+x.name+' · '+x.date+' · '+x.time+'</option>').join('');if(eligible.some(x=>x.id===keep))dropdown.value=keep;else if(eligible.length)dropdown.value=findClockService().id;}
  const s=services.filter(gpsEligible).find(x=>x.id===dropdown?.value)||findClockService();
  window.clockService=s;
  $('#clockServiceName').textContent=s.name;
  $('#clockServiceMeta').textContent=`${s.date} · ${s.time} · llamada ${s.call}`;
  $('#clockRole').textContent=roleLabel(s);
  $('#venueLocationName').textContent=`${s.venue} · ${s.address}`;
  $('#venueCoords').textContent=`${s.coords.lat.toFixed(5)}, ${s.coords.lng.toFixed(5)}`;
  window.lastClockLocation=null;window.lastDistance=null;
  $('#distanceValue').textContent='—';
  $('#workerLocationStatus').textContent='Sin comprobar';
  $('#workerCoords').textContent='Pulsa “Comprobar ubicación”';
  $('#geoStatus').className='geo-status neutral';
  $('#geoStatus').textContent=clockAllowed(s)?'Comprueba tu posición para fichar.':'El fichaje se habilita una hora antes del inicio del servicio.';
  $('#checkInBtn').disabled=false;
  $('#checkOutBtn').disabled=false;
}
function haversine(a,b){
  const R=6371000,rad=x=>x*Math.PI/180;
  const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function checkLocation(){
  const s=window.clockService||findClockService();
  // Geolocation is required regardless of the employee's role or coordinator assignment.
  window.lastClockLocation=null;window.lastDistance=null;
  if(!gpsEligible(s)){$('#geoStatus').className='geo-status bad';$('#geoStatus').textContent='Este servicio requiere fichaje mediante QR con su coordinador.';return Promise.resolve(false);}
  if(!clockAllowed(s)){$('#geoStatus').className='geo-status bad';$('#geoStatus').textContent='Todavía no puedes fichar. Se habilita una hora antes del servicio.';return Promise.resolve(false);}
  if(!s?.coords||!navigator.geolocation){
    $('#geoStatus').className='geo-status bad';
    $('#geoStatus').textContent='No se puede validar el fichaje: servicio sin coordenadas o navegador sin geolocalización.';
    return Promise.resolve(false);
  }
  $('#geoStatus').className='geo-status neutral';
  $('#geoStatus').textContent='Solicitando ubicación actual…';
  return new Promise(resolve=>navigator.geolocation.getCurrentPosition(pos=>{
    const worker={lat:pos.coords.latitude,lng:pos.coords.longitude};
    const dist=haversine(worker,s.coords),accuracy=pos.coords.accuracy;
    const ok=Number.isFinite(dist)&&Number.isFinite(accuracy)&&dist<=RADIUS_METERS&&accuracy<=200;
    window.lastDistance=dist;
    if(ok)window.lastClockLocation={lat:worker.lat,lng:worker.lng,accuracy,serviceId:s.id,checkedAt:Date.now()};
    $('#workerLocationStatus').textContent=ok?'Dentro del radio':dist>RADIUS_METERS?'Fuera del radio':'Precisión insuficiente';
    $('#workerCoords').textContent=`${worker.lat.toFixed(5)}, ${worker.lng.toFixed(5)} · precisión ±${Math.round(accuracy)} m`;
    $('#distanceValue').textContent=dist<1000?`${Math.round(dist)} m`:`${(dist/1000).toFixed(1)} km`;
    $('#geoStatus').className=`geo-status ${ok?'ok':'bad'}`;
    $('#geoStatus').textContent=ok?`Ubicación validada. Estás a ${Math.round(dist)} m del recinto.`:
      dist>RADIUS_METERS?`No puedes fichar: estás a ${Math.round(dist)} m del recinto (máximo ${RADIUS_METERS} m).`:
      'No puedes fichar: la ubicación es demasiado imprecisa. Activa la ubicación precisa y vuelve a intentarlo.';
    resolve(ok);
  },err=>{
    window.lastClockLocation=null;
    $('#geoStatus').className='geo-status bad';
    $('#geoStatus').textContent='No puedes fichar sin conceder permiso de ubicación. Revisa los ajustes del navegador.';
    toast('Geolocalización',err.message||'Permiso denegado');resolve(false);
  },{enableHighAccuracy:true,timeout:15000,maximumAge:0}));
}
let clockSubmissionPending=false;
async function addClockLog(type){
  if(clockSubmissionPending)return;
  clockSubmissionPending=true;
  const inBtn=$('#checkInBtn'),outBtn=$('#checkOutBtn');
  inBtn.disabled=true;outBtn.disabled=true;
  const activeButton=type==='Entrada'?inBtn:outBtn;
  const priorLabel=activeButton.textContent;
  activeButton.textContent='Comprobando GPS…';
  $('#geoStatus').setAttribute('role','status');
  try{
    // Obtain a fresh GPS fix on every entry/exit, even after manual verification.
    const valid=gpsEligible(window.clockService||findClockService())&&clockAllowed(window.clockService||findClockService())&&await checkLocation();
    if(!valid)return;
    const now=new Date(),s=window.clockService||findClockService(),loc=window.lastClockLocation;
    if(!loc||loc.serviceId!==s.id||Date.now()-loc.checkedAt>30000||window.lastDistance>RADIUS_METERS)return;
    const div=document.createElement('div');
    div.innerHTML=`<b>${type}</b> · ${now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} · ubicación validada`;
    $('#clockLog').prepend(div);
    if(window.google&&google.script&&google.script.run){
      google.script.run.withSuccessHandler(()=>toast('Control horario',`${type} registrada y guardada.`))
        .withFailureHandler(err=>{div.remove();toast('Control horario',err.message||'Error al guardar')})
        .saveClockEvent({serviceId:s.id,type,lat:loc.lat,lng:loc.lng,accuracy:loc.accuracy,distance:window.lastDistance,venue:s.venue});
    }else toast('Control horario',`${type} registrada en la demo localmente; no se ha guardado en un servidor.`);
  }finally{
    clockSubmissionPending=false;
    // A new location fix is required for the next action.
    window.lastClockLocation=null;
    inBtn.disabled=false;outBtn.disabled=false;
    activeButton.textContent=priorLabel;
  }
}

/* ---------------- Documentación / Contratos ---------------- */


const trainingCourse={id:'course-prl-2026',title:'Seguridad operativa y PRL en eventos',subtitle:'Curso obligatorio · 25 min',deadline:'15 noviembre 2026',lessons:[
  {title:'1. Acceso seguro al recinto',body:'Antes de iniciar un servicio debes identificar accesos, zonas de carga, vías de evacuación y punto de reunión. No accedas a áreas restringidas sin autorización.'},
  {title:'2. EPI y manipulación de cargas',body:'Utiliza siempre los EPI indicados en la ficha del servicio. Para mover cargas, evita giros bruscos del tronco, coordina maniobras y solicita apoyo cuando el peso o volumen lo requiera.'},
  {title:'3. Comunicación de incidencias',body:'Cualquier accidente, casi accidente, daño material o conducta insegura debe comunicarse al responsable del servicio y quedar registrado en la herramienta de incidencias.'}
]};
let trainingState=JSON.parse(localStorage.getItem('novaTrainingV7')||'{"lesson":0,"completed":false,"quiz":false}');
function renderTraining(){
  const root=$('#trainingList');if(!root)return;const pct=trainingState.completed?100:Math.round((Math.min(trainingState.lesson,trainingCourse.lessons.length)/trainingCourse.lessons.length)*80)+(trainingState.quiz?20:0);
  root.innerHTML=`<article class="glass training-card"><div class="training-card-main"><span class="kicker">CURSO ASIGNADO</span><h3>${trainingCourse.title}</h3><p>${trainingCourse.subtitle} · Fecha límite ${trainingCourse.deadline}</p><div class="training-progress"><i style="width:${pct}%"></i></div><div class="training-meta"><span>${pct}% completado</span><span>${trainingState.completed?'COMPLETADO':'PENDIENTE'}</span></div></div><button class="btn ${trainingState.completed?'light':'primary'}" id="startTrainingBtn">${trainingState.completed?'Revisar curso':'Continuar curso'}</button></article>`;
  if($('#trainingPendingPill'))$('#trainingPendingPill').textContent=trainingState.completed?'COMPLETADA':'1 PENDIENTE';if($('#profileTrainingStatus'))$('#profileTrainingStatus').textContent=trainingState.completed?'OK':'1 pendiente';if($('#homeTrainingStatus')){$('#homeTrainingStatus').textContent=trainingState.completed?'OK':'1 pendiente';$('#homeTrainingStatus').className=trainingState.completed?'green':'orange'};
}
function openTrainingCourse(){
  const idx=Math.min(trainingState.lesson,trainingCourse.lessons.length-1),lesson=trainingCourse.lessons[idx];
  if(trainingState.completed){openDemoModal(trainingCourse.title,`<div class="course-complete">✓ Curso completado</div>${trainingCourse.lessons.map(x=>`<div class="course-review"><b>${x.title}</b><p>${x.body}</p></div>`).join('')}<div class="crew-modal-actions"><button class="btn primary" onclick="closeDemoModal()">Cerrar</button></div>`);return}
  openDemoModal(trainingCourse.title,`<div class="course-step"><span>Lección ${idx+1} de ${trainingCourse.lessons.length}</span><h3>${lesson.title}</h3><p>${lesson.body}</p></div><div class="crew-modal-actions"><button class="btn light" id="trainingClose">Cerrar</button><button class="btn primary" id="trainingNext">${idx===trainingCourse.lessons.length-1?'Ir al test':'Siguiente'}</button></div>`);
  setTimeout(()=>{$('#trainingClose').onclick=closeDemoModal;$('#trainingNext').onclick=()=>{if(idx<trainingCourse.lessons.length-1){trainingState.lesson=idx+1;saveTrainingState();openTrainingCourse()}else openTrainingQuiz()}},0)
}
function openTrainingQuiz(){
  openDemoModal('Test final · Seguridad operativa',`<div class="quiz-question"><b>1. ¿Qué debes hacer si detectas una situación insegura?</b><label><input type="radio" name="q1" value="a"> Ignorarla si no hay accidente</label><label><input type="radio" name="q1" value="b"> Comunicarla y registrarla</label><label><input type="radio" name="q1" value="c"> Esperar al final de mes</label></div><div class="quiz-question"><b>2. ¿Cuándo debes utilizar los EPI?</b><label><input type="radio" name="q2" value="a"> Solo si lo pide un compañero</label><label><input type="radio" name="q2" value="b"> Cuando los requiera la ficha y la zona de trabajo</label><label><input type="radio" name="q2" value="c"> Nunca en interiores</label></div><div class="crew-modal-actions"><button class="btn light" id="quizBack">Volver</button><button class="btn primary" id="quizSubmit">Enviar test</button></div>`);
  setTimeout(()=>{$('#quizBack').onclick=openTrainingCourse;$('#quizSubmit').onclick=()=>{const a=document.querySelector('input[name=q1]:checked')?.value,b=document.querySelector('input[name=q2]:checked')?.value;if(a==='b'&&b==='b'){trainingState.lesson=trainingCourse.lessons.length;trainingState.quiz=true;trainingState.completed=true;saveTrainingState();closeDemoModal();renderTraining();renderNotifications();toast('Formación','Curso completado correctamente.')}else toast('Test','Hay respuestas incorrectas. Revísalas.')};},0)
}
function saveTrainingState(){localStorage.setItem('novaTrainingV7',JSON.stringify(trainingState));renderTraining();renderNotifications()}

function renderDocs(){
  $('#documentsList').innerHTML=docs.map(d=>`
    <article class="glass">
      <div class="doc-icon">${d.icon}</div>
      <div><h4>${d.title}</h4><p style="${d.pending?'color:#b76c00':''}">${d.status}</p></div>
      <button class="btn light" data-open-doc="${d.id}">Abrir</button>
    </article>`).join('');
}
function renderContracts(){
  $('#contractsList').innerHTML=contracts.map(c=>`
    <article class="glass">
      <div class="doc-icon">⌘</div>
      <div><h4>${c[0]}</h4><p>Alta ${c[1]} · Baja ${c[2]}</p></div>
      <button class="btn light" data-open-contract="${c[1]}-${c[2]}">Ver</button>
    </article>`).join('');
}



function downloadServiceSheet(service){
  if(!service)return;
  const fields=[
    ['Servicio',service.name],['Fecha',service.date],['Horario',service.time],
    ['Recinto',service.venue],['Dirección',service.address],
    ['Categoría',service.role],['Equipo',service.team],
    ['Acceso',service.access]
  ];
  const rows=fields.map(([label,value])=>'<tr><th>'+novaSafeText(label)+'</th><td>'+novaSafeText(value)+'</td></tr>').join('');
  const content='<!doctype html><html lang="es"><meta charset="utf-8"><title>Ficha de servicio</title><style>body{font-family:Arial,sans-serif;margin:40px auto;max-width:760px;color:#17181c}h1{font-size:28px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}th{width:160px}</style><body><h1>Ficha de servicio</h1><table>'+rows+'</table><p>Documento de demostración.</p></body></html>';
  const safeId=String(service.code||service.id||'servicio').replace(/[^a-zA-Z0-9_-]/g,'');
  downloadNovaFile('ficha-servicio-'+safeId+'.html',content);
}
function printServiceSheet(service){
  const win=window.open('','_blank','width=900,height=800'); if(!win){toast('PDF','El navegador ha bloqueado la ventana de impresión.');return}
  win.document.write(`<html><head><title>${service.name}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#171717}h1{font-size:28px}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:10px;border-bottom:1px solid #ddd}td:first-child{font-weight:bold;width:180px}.tag{color:#f58220;font-weight:bold}</style></head><body><div class="tag">FICHA DE SERVICIO</div><h1>${service.name}</h1><p>${service.date}</p><table><tr><td>Recinto</td><td>${service.venue}</td></tr><tr><td>Inicio</td><td>${service.time.split('–')[0]}</td></tr><tr><td>Fin</td><td>${service.time.split('–')[1]}</td></tr><tr><td>Categoría</td><td>${roleLabel(service)}</td></tr><tr><td>Equipo</td><td>${service.team}</td></tr><tr><td>Acceso</td><td>${service.access}</td></tr><tr><td>EPI</td><td>${service.epi}</td></tr></table><script>window.onload=()=>window.print()<\/script></body></html>`);win.document.close();
}
function openTutorial(kind){
  const guides={
    clock:['Fichaje y geolocalización',['Abre Control horario antes del servicio.','Pulsa Comprobar ubicación y permite acceso a GPS.','El sistema compara tu posición con el recinto.','Dentro del radio permitido podrás registrar entrada o salida.']],
    coord:['Gestión de coordinación',['Filtra por horario o estado.','Clica una fila para seleccionarla o utiliza Seleccionar visibles.','Clica el nombre para editar horario, pausa, dieta, valoración e incidencias.','Usa edición masiva para aplicar cambios a varios trabajadores.']],
    crew:['Operativa Crew Head',['Abre Crew Control desde Coordinación.','Controla asistencia, reservas, horarios y bloques operativos.','Registra incidencias y valoraciones.','Utiliza selección masiva para cambios durante el servicio.']],
    docs:['Documentación',['Abre cualquier documento pendiente.','Selecciona el archivo actualizado.','Súbelo para dejarlo pendiente de validación.']],
    availability:['Disponibilidad',['Configura primero tu disponibilidad habitual en Mi perfil.','El calendario utiliza esa disponibilidad como base.','Abre un día para modificar franjas de 30 minutos.','Puedes guardar varias franjas en una misma fecha.']],
    payroll:['Liquidaciones',['Selecciona el mes que quieres consultar.','Revisa servicios, horas, dietas, coordinación y bruto.','Usa Imprimir PDF para guardar una copia desde el navegador.']]
  };
  const [title,steps]=guides[kind]||['Tutorial',['Contenido no disponible']];
  openDemoModal(title,`<div class="tutorial-steps">${steps.map((x,i)=>`<div><b>${i+1}</b><span>${x}</span></div>`).join('')}</div><div class="crew-modal-actions"><button class="btn primary" onclick="closeDemoModal()">Cerrar</button></div>`)
}
const novaDownloadIcon='<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/></svg>';
function downloadNovaFile(name,content,type='text/html'){
 const blob=new Blob([content],{type:type+';charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function novaSafeText(v){return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function downloadNovaContract(key){
 const c=contracts.find(x=>`${x[1]}-${x[2]}`===key)||contracts[0];
 downloadNovaFile('contrato-demo-'+c[1].replaceAll('/','-')+'.html','<!doctype html><html lang="es"><meta charset="utf-8"><title>Contrato demo</title><body style="font:16px Arial;max-width:750px;margin:50px auto"><h1>'+novaSafeText(c[0])+'</h1><p>Alta: '+novaSafeText(c[1])+'<br>Baja: '+novaSafeText(c[2])+'</p><p>Documento ficticio de demostración; no es un contrato firmado.</p></body></html>');
}
function downloadNovaPayroll(){
 const m=payrollMonths[currentPayrollMonth];if(!m)return;
 const headers=['Fecha','Servicio','Cliente','Referencia','Estado','Categoría','Inicio','Fin','Horas trabajadas','Horas parada','Salario','Coordinación','Dietas','Suplidos','Otros','Km','Bruto'];
 const csv=[headers,...m.rows.map(row=>row.slice(0,17))].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n');
 downloadNovaFile('liquidacion-demo-'+currentPayrollMonth+'.csv','\ufeff'+csv,'text/csv');
}
function openContract(key){const c=contracts.find(x=>`${x[1]}-${x[2]}`===key)||contracts[0];openDemoModal('Contrato',`<h3>${c[0]}</h3><p>Fecha alta: <b>${c[1]}</b><br>Fecha baja: <b>${c[2]}</b></p><p>Contrato ficticio de personal técnico y auxiliar de eventos.</p><div class="crew-modal-actions"><button class="btn light" onclick="closeDemoModal()">Cerrar</button><button class="btn primary nova-download-btn" type="button" onclick="downloadNovaContract('${c[1]}-${c[2]}')" aria-label="Descargar contrato" title="Descargar contrato">${novaDownloadIcon}</button></div>`)}

function openPortalDocument(id){
  const d=docs.find(x=>x.id===id); if(!d)return;
  openDemoModal(d.title,`<div class="mini-list"><div><b>Estado</b><br><span class="muted">${d.status}</span></div><div><b>Documento</b><br><span class="muted">Puedes sustituir el archivo y enviarlo a revisión.</span></div></div><label style="display:grid;gap:6px;margin-top:14px;font-weight:800">Seleccionar archivo<input id="portalDocFile" type="file"></label><div class="crew-modal-actions"><button class="btn light" id="portalDocCancel">Cerrar</button><button class="btn primary" id="portalDocUpload">Subir documento</button></div>`);
  setTimeout(()=>{$('#portalDocCancel').onclick=closeDemoModal;$('#portalDocUpload').onclick=()=>uploadPortalDocument(d)},0);
}
function uploadPortalDocument(doc){
  const input=$('#portalDocFile'),file=input?.files?.[0]; if(!file){toast('Documentación','Selecciona un archivo.');return}
  const reader=new FileReader(); reader.onload=()=>{const base64=String(reader.result||'').split(',').pop(); if(window.google&&google.script&&google.script.run){google.script.run.withSuccessHandler(res=>{doc.status='PENDIENTE DE VALIDACIÓN';closeDemoModal();renderDocs();toast('Documentación',`Archivo ${res.name||''} subido.`)}).withFailureHandler(err=>toast('Documentación',err.message||'Error al subir')).savePortalDocumentUpload(doc.id,{name:file.name,mimeType:file.type,base64})}else{doc.status='PENDIENTE DE VALIDACIÓN';closeDemoModal();renderDocs();toast('Documentación','Archivo preparado localmente.')}};reader.readAsDataURL(file);
}
const PROFILE_DEFAULTS={
  firstName:'Pau',lastName:'Ferrer Soler',dni:'48276135P',nationality:'Española',sex:'Hombre',birthDate:'2003-05-14',address:'C/ Marina, 154, 3º 2ª',postalCode:'08013',city:'Barcelona',province:'Barcelona',country:'España',phone:'670 555 221',email:'pau.ferrer@novacrew.demo',employeeNumber:'001428',unemployment:'No',ownVehicle:'Sí',drivingLicense:'Sí',shirt:'M',availabilityTotal:'false',availabilityWeekends:'true',availabilityMornings:'false',availabilityAfternoons:'false',languages:JSON.stringify([{name:'Castellano',level:'Nativo'},{name:'Català',level:'Nativo'},{name:'Inglés',level:'B2'}]),knowledge:JSON.stringify(['Carnet B','Carretilla elevadora','PRL eventos']),education:JSON.stringify(['Bachillerato','Formación PRL para eventos','Manipulación manual de cargas'])
};
let portalProfile={...PROFILE_DEFAULTS};
let profileLanguages=[{name:'Castellano',level:'Nativo'},{name:'Català',level:'Nativo'},{name:'Inglés',level:'B2'}];
let profileKnowledge=['Carnet B','Carretilla elevadora','PRL eventos'];
let profileEducation=['Bachillerato','Formación PRL para eventos','Manipulación manual de cargas'];
function readProfileForm(){
  return {firstName:$('#profileFirstName').value.trim(),lastName:$('#profileLastName').value.trim(),dni:$('#profileDni').value.trim(),nationality:$('#profileNationality').value.trim(),sex:$('#profileSex').value,birthDate:$('#profileBirthDate').value,address:$('#profileAddress').value.trim(),postalCode:$('#profilePostalCode').value.trim(),city:$('#profileCity').value.trim(),province:$('#profileProvince').value.trim(),country:$('#profileCountry').value.trim(),phone:$('#profilePhone').value.trim(),email:$('#profileEmail').value.trim(),employeeNumber:$('#profileNumber').value.trim(),unemployment:$('#profileUnemployment').value,ownVehicle:$('#profileOwnVehicle').value,drivingLicense:$('#profileDrivingLicense').value,shirt:$('#profileShirt').value,availabilityTotal:String($('#prefTotal').checked),availabilityWeekends:String($('#prefWeekends').checked),availabilityMornings:String($('#prefMornings').checked),availabilityAfternoons:String($('#prefAfternoons').checked),languages:JSON.stringify(profileLanguages),knowledge:JSON.stringify(profileKnowledge),education:JSON.stringify(profileEducation),initials:'PF',name:`${$('#profileFirstName').value.trim()} ${$('#profileLastName').value.trim()}`.trim()};
}
function saveProfileFromForm(){
  portalProfile={...portalProfile,...readProfileForm()};
  $('#profileSummaryName').textContent=portalProfile.name||'Pau Ferrer';
  localStorage.setItem('novaProfileV7-'+(window.novaActiveAccount||'demo'),JSON.stringify(portalProfile));
  renderAvailabilityBasePreview();renderAvailability();
  if(window.google&&google.script&&google.script.run){google.script.run.withSuccessHandler(()=>toast('Perfil','Cambios guardados.')).withFailureHandler(e=>toast('Perfil',e.message||'Error al guardar')).savePortalProfile(portalProfile)}else toast('Perfil','Cambios guardados localmente.');
}
function applyBootstrapProfile(profile){
  try{const local=JSON.parse(localStorage.getItem('novaProfileV7-'+(window.novaActiveAccount||'demo'))||'{}');profile={...(profile||{}),...local}}catch(e){}
  const isCoord=(window.novaActiveAccount||window.NOVA_API?.account)==='coord';
  const identityDefaults=isCoord?{firstName:'Álvaro',lastName:'Costa',name:'Álvaro Costa',initials:'AC',phone:'664 690 034',email:'alvaro.costa@novacrew.demo',dni:'',birthDate:'',address:'',postalCode:'',employeeNumber:'002010'}:{};
  portalProfile={...PROFILE_DEFAULTS,...identityDefaults,...(profile||{})};
  portalProfile.name=portalProfile.name||`${portalProfile.firstName} ${portalProfile.lastName}`;
  const set=(id,v)=>{const el=$(id);if(el&&v!==undefined&&v!==null)el.value=v};
  set('#profileFirstName',portalProfile.firstName);set('#profileLastName',portalProfile.lastName);set('#profileDni',portalProfile.dni);set('#profileNationality',portalProfile.nationality);set('#profileSex',portalProfile.sex);set('#profileBirthDate',portalProfile.birthDate);set('#profileAddress',portalProfile.address);set('#profilePostalCode',portalProfile.postalCode);set('#profileCity',portalProfile.city);set('#profileProvince',portalProfile.province);set('#profileCountry',portalProfile.country);set('#profilePhone',portalProfile.phone);set('#profileEmail',portalProfile.email);set('#profileNumber',portalProfile.employeeNumber);set('#profileUnemployment',portalProfile.unemployment);set('#profileOwnVehicle',portalProfile.ownVehicle);set('#profileDrivingLicense',portalProfile.drivingLicense);set('#profileShirt',portalProfile.shirt);
  $('#prefTotal').checked=String(portalProfile.availabilityTotal)==='true';$('#prefWeekends').checked=String(portalProfile.availabilityWeekends)!=='false';$('#prefMornings').checked=String(portalProfile.availabilityMornings)==='true';$('#prefAfternoons').checked=String(portalProfile.availabilityAfternoons)==='true';
  try{profileLanguages=JSON.parse(portalProfile.languages||'[]')}catch(e){};try{profileKnowledge=JSON.parse(portalProfile.knowledge||'[]')}catch(e){};try{profileEducation=JSON.parse(portalProfile.education||'[]')}catch(e){};
  $('#profileSummaryName').textContent=portalProfile.name||'Pau Ferrer';renderProfileEditableLists();renderAvailabilityBasePreview();renderAvailability();
}
function renderProfileEditableLists(){
  if($('#profileLanguages'))$('#profileLanguages').innerHTML=profileLanguages.map((x,i)=>`<div class="editable-list-row"><input value="${x.name}" data-lang-name="${i}"><select data-lang-level="${i}">${['Básico','A2','B1','B2','C1','C2','Nativo'].map(v=>`<option ${v===x.level?'selected':''}>${v}</option>`).join('')}</select><button class="icon-only" data-remove-lang="${i}">×</button></div>`).join('');
  if($('#profileKnowledge'))$('#profileKnowledge').innerHTML=profileKnowledge.map((x,i)=>`<div class="editable-list-row"><input value="${x}" data-knowledge="${i}"><button class="icon-only" data-remove-knowledge="${i}">×</button></div>`).join('');
  if($('#profileEducation'))$('#profileEducation').innerHTML=profileEducation.map((x,i)=>`<div class="editable-list-row"><input value="${x}" data-education="${i}"><button class="icon-only" data-remove-education="${i}">×</button></div>`).join('');
}
function availabilityPrefs(){return {total:$('#prefTotal')?.checked||false,weekends:$('#prefWeekends')?.checked||false,mornings:$('#prefMornings')?.checked||false,afternoons:$('#prefAfternoons')?.checked||false}}
function renderAvailabilityBasePreview(){if(!$('#availabilityBasePreview'))return;const p=availabilityPrefs(),parts=[];if(p.total)parts.push('Disponibilidad total');else{if(p.weekends)parts.push('Fines de semana');if(p.mornings)parts.push('Mañanas 06:00–14:00');if(p.afternoons)parts.push('Tardes 14:00–22:00')}$('#availabilityBasePreview').innerHTML=parts.length?parts.map(x=>`<span>${x}</span>`).join(''):'<span>Sin disponibilidad habitual</span>'}
function renderSavedClock(rows){const root=$('#clockLog');if(!root)return;(rows||[]).slice(0,8).forEach(r=>{const d=document.createElement('div');const t=r.TIMESTAMP?new Date(r.TIMESTAMP).toLocaleString('es-ES'):'';d.innerHTML=`<b>${r.TYPE||'FICHAJE'}</b> · ${t} · ${Math.round(Number(r.DISTANCE_M||0))} m`;root.appendChild(d)})}

/* ---------------- Liquidaciones por mes ---------------- */

let currentPayrollMonth='oct26';
function parseMoney(v){
  const n=Number(String(v).replace(/\./g,'').replace(',','.'));
  return Number.isFinite(n)?n:0;
}
function payrollTotal(month){
  return month.rows.reduce((sum,r)=>sum+parseMoney(r[16]),0);
}
function formatMoney(n){return n.toFixed(2).replace('.',',')}
function renderPayrollMonths(){
  $('#payrollMonths').innerHTML=Object.entries(payrollMonths).map(([key,m])=>`
    <button class="payroll-month-btn ${key===currentPayrollMonth?'active':''}" data-payroll-month="${key}">
      ${m.label}<small>${m.rows.length} apuntes</small>
    </button>`).join('');
  renderPayroll(currentPayrollMonth);
}
function renderPayroll(key){
  currentPayrollMonth=key;
  const month=payrollMonths[key];
  if(!month)return;
  $('#payrollPageTitle').textContent=month.label;
  $('#payrollPeriod').textContent=`Periodo: ${month.label}`;
  $$('.payroll-month-btn').forEach(b=>b.classList.toggle('active',b.dataset.payrollMonth===key));
  const headers=['Fecha','Servicio','Cliente','Referencia','Estado','Categoría','Inicio','Fin','Horas trabajadas','Horas parada','Salario','Coordi','Dietas','Suplidos','Otros','Km','Bruto'];
  $('#payrollTable').innerHTML=`
    <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${month.rows.map(r=>`<tr class="${r[17]||''}">${r.slice(0,17).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
    <tfoot><tr><td colspan="16">TOTAL BRUTO DEMO · ${month.label}</td><td>${formatMoney(payrollTotal(month))}</td></tr></tfoot>`;
}

/* ---------------- Crew Control integrado ---------------- */

function makeCrewWorkers(service){
  const storageKey=`crewWorkers-${service.id}`;
  const saved=localStorage.getItem(storageKey);
  if(saved){
    try{return JSON.parse(saved)}catch(e){}
  }
  const rows=[];
  const total=Math.max(0,(service.hands||0)+(service.forklifts||0)-(service.id==='svc3'?1:0));
  for(let i=0;i<total;i++){
    const forklift=i>=service.hands;
    rows.push({
      id:`${service.id}-w${i+1}`,
      name:`${firstNames[i%firstNames.length]} ${lastNames[(i*3)%lastNames.length]}`,
      role:forklift?'FORKLIFTER':(i%5===0?'HAND A':'HAND B'),
      team:forklift?'FORKLIFTER':teams[i%teams.length],
      workType:i%5===0?'SHOW':(i%3===0?'LOAD OUT':'LOAD IN'),
      start:i%3===0?'18:00':'07:00',
      end:i%3===0?'23:30':'15:00',
      pause:i%4===0?'00:30':'00:00',
      realStart:i%4===0?'07:06':'—',
      realEnd:'—',
      status:statuses[i%statuses.length],
      rating:(i%5)+1,
      diet:i%4===0?'Sí':'No',
      phone:`6${String(10000000+i*7319).slice(-8)}`,
      selected:false,
      incident:i%13===0?'Retraso comunicado':'',
      notes:''
    });
  }
  return rows;
}

const crewState={
  service:null,workers:[],workFilter:'TODO',statusFilter:'ALL',search:'',arrival:false,
  incidents:[],audit:[],blockOrder:['LOAD IN','SHOW','LOAD OUT'],collapsed:{},closed:false
};

function saveCrewState(){
  if(!crewState.service)return;
  localStorage.setItem(`crewWorkers-${crewState.service.id}`,JSON.stringify(crewState.workers));
  localStorage.setItem(`crewMeta-${crewState.service.id}`,JSON.stringify({
    incidents:crewState.incidents,audit:crewState.audit,blockOrder:crewState.blockOrder,closed:crewState.closed
  }));
}
function loadCrewMeta(service){
  try{
    const data=JSON.parse(localStorage.getItem(`crewMeta-${service.id}`)||'{}');
    crewState.incidents=data.incidents||[
      {text:'Acceso muelle 2 retrasado 10 min',time:'06:55'},
      {text:'Cambio de equipo de 2 hands a AUDIO',time:'08:20'}
    ];
    crewState.audit=data.audit||[
      {time:'08:20',text:'Cambio de 2 personas a AUDIO'},
      {time:'07:04',text:'Se marca PRESENTE a 8 trabajadores'},
      {time:'06:55',text:'Incidencia de acceso registrada'}
    ];
    crewState.blockOrder=data.blockOrder||['LOAD IN','SHOW','LOAD OUT'];
    crewState.closed=!!data.closed;
  }catch(e){
    crewState.incidents=[];crewState.audit=[];crewState.blockOrder=['LOAD IN','SHOW','LOAD OUT'];crewState.closed=false;
  }
}
function addAudit(text){
  crewState.audit.unshift({time:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),text});
  saveCrewState();
}
function crewFilteredWorkers(){
  return crewState.workers.filter(w=>{
    if(crewState.workFilter!=='TODO'&&w.workType!==crewState.workFilter)return false;
    if(crewState.statusFilter!=='ALL'&&w.status!==crewState.statusFilter)return false;
    if(crewState.arrival&&w.status==='PRESENTE')return false;
    const q=crewState.search.trim().toLowerCase();
    if(q&&!`${w.name} ${w.role} ${w.team} ${w.phone}`.toLowerCase().includes(q))return false;
    return true;
  });
}
function crewMetrics(){
  const all=crewFilteredWorkers();
  return {
    total:all.length,
    present:all.filter(w=>w.status==='PRESENTE').length,
    contact:all.filter(w=>w.status==='CONTACTADO').length,
    absent:all.filter(w=>w.status==='NO PRESENTADO').length,
    noTeam:all.filter(w=>!w.team||w.team==='SIN EQUIPO').length
  };
}

function renderLegacyCrewControl(s){
  crewState.service=s;
  crewState.workers=makeCrewWorkers(s);
  crewState.workFilter='TODO';
  crewState.statusFilter='ALL';
  crewState.search='';
  crewState.arrival=false;
  crewState.collapsed={};
  loadCrewMeta(s);
  $('#crewControlRoot').innerHTML=`
    <div class="crew-shell">
      <header class="crew-header">
        <div class="crew-brand">
          <div class="crew-brand-mark">N</div>
          <div><strong>CREW CONTROL</strong><span>Operaciones de personal · base integrada v11.2.30</span></div>
        </div>
        <div class="crew-header-actions">
          <button id="crewBack" class="light">← Área empleado</button>
          <button id="crewControlView" class="light">◉ Control</button>
          <button id="crewDuplicate" class="light">Duplicar</button>
          <button id="crewCloseService" class="dark">${crewState.closed?'Reabrir':'Cerrar'}</button>
          <button id="crewExit" class="light">Salir</button>
        </div>
      </header>
      <div class="crew-workspace">
        <aside class="crew-sidebar">
          <div class="crew-sidebar-title"><span>Control operativo</span><button id="crewSidebarToggle" style="background:none;border:0;color:#fff">«</button></div>
          <div class="crew-filter-row" id="crewWorkFilters">
            <button data-work="TODO" class="active">TODO</button>
            <button data-work="LOAD IN">LOAD IN</button>
            <button data-work="SHOW">SHOW</button>
            <button data-work="LOAD OUT">LOAD OUT</button>
          </div>
          <div id="crewMetrics" class="crew-metrics"></div>
          <div class="crew-day"><b>${s.short}</b><span>${s.date}</span><b>${totalPersonnel(s)}</b></div>
          <input id="crewSearch" placeholder="Buscar persona, especialidad, equipo o crew head…">
          <select id="crewStatusFilter">
            <option value="ALL">Todos</option>
            <option>NO CONTACTADO</option><option>CONTACTADO</option><option>PRESENTE</option><option>NO PRESENTADO</option><option>RESERVA</option>
          </select>
          <button id="crewArrival" class="btn light full" style="margin-top:5px">⚡ Llegadas</button>
          <div class="crew-side-buttons">
            <button id="openCrewIncidents">⚠ Incidencias <i id="crewIncidentCount">${crewState.incidents.length}</i></button>
            <button id="openCrewTeams">▦ Equipos <i>${teams.length}</i></button>
          </div>
          <div class="crew-sync-card"><b>Personal sincronizado</b><span>Los nombres y horarios llegan directamente del Área de empleado. No hace falta subir PDF.</span></div>
          <button id="crewSelectAllCard" class="btn light full">☑ Todo (${crewState.workers.length})</button>
          <div id="crewSelected" class="crew-selected">0 seleccionados</div>
          <div class="crew-bulk">
            <button id="crewSelectVisible" title="Seleccionar visibles">☑</button>
            <button id="crewMarkPresent" title="Presente">✓</button>
            <button id="crewMarkAbsent" title="No presentado">✕</button>
            <button id="crewRate" title="Valorar">★</button>
            <button id="crewEdit" title="Edición masiva">⚙</button>
          </div>
        </aside>
        <main class="crew-main">
          ${crewState.closed?'<div class="crew-closed-banner">Servicio cerrado · puedes reabrirlo desde la cabecera.</div>':''}
          <section class="crew-service-top">
            <div class="crew-code"><span>Servicio</span><b>${s.code}</b><button id="crewCopyCode" class="btn light">Copiar</button></div>
            <div class="crew-service-actions">
              <span style="color:#d2610d;font-weight:900;font-size:10px">Guardado</span>
              <button id="crewTopControl">◉ Control</button>
              <button id="crewTopDuplicate">Duplicar</button>
              <button id="crewTopClose" class="dark">${crewState.closed?'Reabrir':'Cerrar'}</button>
            </div>
          </section>
          <section class="crew-panel">
            <h3 style="margin-top:0">Datos del servicio</h3>
            <div class="crew-data">
              <label>Servicio / referencia<input value="${s.name}" readonly></label>
              <label>Fecha principal<input value="${s.date}" readonly></label>
              <label>Recinto<input value="${s.venue}" readonly></label>
            </div>
          </section>
          <section class="crew-panel crew-audit">
            <details>
              <summary>▶ Registro de cambios</summary>
              <div id="crewAuditList" class="crew-audit-list"></div>
            </details>
          </section>
          <section class="crew-panel">
            <div class="crew-hidden">
              <span>OCULTOS</span>
              <button data-hidden-team="RUNNER PROD LOCAL">+ RUNNER PROD LOCAL</button>
              <button data-hidden-team="SITE">+ SITE</button>
              <button data-hidden-team="CATERING">+ CATERING</button>
              <button data-hidden-team="RUNNER GIRA">+ RUNNER GIRA</button>
            </div>
          </section>
          <div id="crewBlocks"></div>
        </main>
      </div>
    </div>`;
  renderCrewAll();
  bindCrewEvents();
}

function renderCrewAll(){
  renderCrewMetrics();
  renderCrewBlocks();
  renderCrewSelected();
  renderCrewAudit();
  $('#crewIncidentCount') && ($('#crewIncidentCount').textContent=crewState.incidents.length);
}
function renderCrewAudit(){
  const root=$('#crewAuditList');
  if(!root)return;
  root.innerHTML=crewState.audit.length?crewState.audit.map(a=>`<div><b>${a.time}</b> · ${a.text}</div>`).join(''):'<div>Sin cambios todavía.</div>';
}
function renderCrewMetrics(){
  const m=crewMetrics();
  $('#crewMetrics').innerHTML=`
    <div class="crew-metric"><b>${m.present}/${m.total}</b><span>Presentes</span></div>
    <div class="crew-metric"><b>${m.contact}</b><span>Contactados</span></div>
    <div class="crew-metric"><b>${m.absent}</b><span>No presentados</span></div>
    <div class="crew-metric"><b>${m.noTeam}</b><span>Sin equipo</span></div>`;
}
function renderCrewBlocks(){
  const workers=crewFilteredWorkers();
  const types=crewState.blockOrder.filter(t=>crewState.workFilter==='TODO'||crewState.workFilter===t);
  $('#crewBlocks').innerHTML=types.map(type=>{
    const rows=workers.filter(w=>w.workType===type);
    if(!rows.length)return'';
    const present=rows.filter(w=>w.status==='PRESENTE').length;
    const collapsed=!!crewState.collapsed[type];
    return `
      <section class="crew-block">
        <div class="crew-block-head">
          <span>⋮</span><strong>${type}</strong>
          <button data-block-filter="NO CONTACTADO">No contactados</button>
          <button data-block-filter="RESERVA">Reservas</button>
          <button class="crew-add-worker" data-worktype="${type}">+ Añadir trabajador</button>
          <div class="block-order"><button data-move-block="${type}" data-dir="-1">↑</button><button data-move-block="${type}" data-dir="1">↓</button></div>
          <button data-toggle-block="${type}">${collapsed?'＋':'－'}</button>
          <small>• ${rows.length} ✓ ${present} · Coordinador: ${crewState.service.coordinator||'Sin asignar'}</small>
        </div>
        ${collapsed?'':`<div class="crew-block-body"><div class="crew-workers scroll-clean"><table class="crew-table">
          <thead><tr><th></th><th>Personal</th><th>Rol</th><th>Equipo</th><th>Horario</th><th>Pausa</th><th>Estado</th><th>Dieta</th><th>★</th><th>Incidencia</th><th>Acciones</th></tr></thead>
          <tbody>${rows.map(w=>`
            <tr class="${w.selected?'selected':''}" data-worker="${w.id}">
              <td><input type="checkbox" class="crew-worker-check" data-id="${w.id}" ${w.selected?'checked':''}></td>
              <td><b>${w.name}</b><br>${phoneLinkV9(w.phone)}</td>
              <td>${w.role}</td>
              <td>${w.team}</td>
              <td>${w.start}–${w.end}<br><span class="muted">Real ${w.realStart}–${w.realEnd}</span></td>
              <td>${w.pause}</td>
              <td><span class="status-dot status-${w.status.replaceAll(' ','-')}"></span>${w.status}</td>
              <td>${w.diet}</td>
              <td>${'★'.repeat(w.rating)}</td>
              <td><span class="worker-incident">${w.incident||'—'}</span></td>
              <td class="crew-worker-actions"><button data-edit-worker="${w.id}">Editar</button></td>
            </tr>`).join('')}</tbody>
        </table></div></div>`}
      </section>`;
  }).join('');
}
function renderCrewSelected(){
  const n=crewState.workers.filter(w=>w.selected).length;
  $('#crewSelected').textContent=`${n} seleccionados`;
}
function setSelectedStatus(status){
  const sel=crewState.workers.filter(w=>w.selected);
  if(!sel.length){toast('Crew Control','Selecciona trabajadores primero.');return}
  sel.forEach(w=>w.status=status);
  addAudit(`${sel.length} trabajadores → ${status}`);
  saveCrewState();
  renderCrewAll();
  toast('Crew Control',`${sel.length} trabajadores actualizados.`);
}
function moveBlock(type,dir){
  const i=crewState.blockOrder.indexOf(type);
  const j=i+Number(dir);
  if(i<0||j<0||j>=crewState.blockOrder.length)return;
  [crewState.blockOrder[i],crewState.blockOrder[j]]=[crewState.blockOrder[j],crewState.blockOrder[i]];
  addAudit(`Orden de bloques actualizado: ${type}`);
  renderCrewBlocks();
}
function editCrewWorker(id){
  const w=crewState.workers.find(x=>x.id===id);
  if(!w)return;
  openDemoModal('Editar trabajador',`
    <div class="basic-modal-grid">
      <label>Nombre<input id="cmName" value="${w.name}"></label><label>Teléfono<input id="cmPhone" inputmode="tel" value="${w.phone||''}"></label>
      <label>Rol<select id="cmRole">${['HAND A','HAND B','FORKLIFTER'].map(v=>`<option ${v===w.role?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Equipo<select id="cmTeam">${[...teams,'FORKLIFTER','SIN EQUIPO'].map(t=>`<option ${t===w.team?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>Bloque<select id="cmWorkType">${['LOAD IN','SHOW','LOAD OUT'].map(t=>`<option ${t===w.workType?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>Inicio<input id="cmStart" value="${w.start}"></label>
      <label>Fin<input id="cmEnd" value="${w.end}"></label>
      <label>Pausa<input id="cmPause" value="${w.pause}"></label>
      <label>Dieta<select id="cmDiet"><option ${w.diet==='No'?'selected':''}>No</option><option ${w.diet==='Sí'?'selected':''}>Sí</option></select></label>
      <label>Estado<select id="cmStatus">${['PENDIENTE','CONTACTADO','PRESENTE','NO PRESENTADO','RESERVA'].map(st=>`<option ${st===w.status?'selected':''}>${st}</option>`).join('')}</select></label>
      <label>Valoración<select id="cmRating">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.rating?'selected':''}>${n} / 5</option>`).join('')}</select></label>
      <label class="full">Incidencia<textarea id="cmIncident" rows="2">${w.incident||''}</textarea></label>
      <label class="full">Notas<textarea id="cmNotes" rows="2">${w.notes||''}</textarea></label>
    </div>
    <div class="crew-modal-actions"><button class="btn light" id="cmCancel">Cancelar</button><button class="btn primary" id="cmSave">Guardar</button></div>`);
  setTimeout(()=>{
    $('#cmCancel').onclick=closeDemoModal;
    $('#cmSave').onclick=()=>{
      w.name=$('#cmName').value.trim()||w.name;w.phone=$('#cmPhone')?.value.trim()||w.phone;
      w.role=$('#cmRole').value;w.team=$('#cmTeam').value;w.workType=$('#cmWorkType').value;
      w.start=$('#cmStart').value;w.end=$('#cmEnd').value;w.pause=$('#cmPause').value;w.diet=$('#cmDiet').value;
      w.status=$('#cmStatus').value;w.rating=Number($('#cmRating').value);w.incident=$('#cmIncident').value.trim();w.notes=$('#cmNotes').value.trim();
      addAudit(`${w.name} actualizado`);
      saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Trabajador actualizado.');
    };
  },0);
}
function addCrewWorker(workType){
  openDemoModal('Añadir trabajador',`
    <div class="basic-modal-grid">
      <label>Nombre<input id="caName" placeholder="Nombre y apellidos"></label>
      <label>Rol<select id="caRole"><option>HAND B</option><option>HAND A</option><option>FORKLIFTER</option></select></label>
      <label>Equipo<select id="caTeam">${[...teams,'FORKLIFTER'].map(t=>`<option>${t}</option>`).join('')}</select></label>
      <label>Inicio<input id="caStart" value="${crewState.service.time.split('–')[0]}"></label>
      <label>Fin<input id="caEnd" value="${crewState.service.time.split('–')[1]}"></label>
      <label>Dieta<select id="caDiet"><option>No</option><option>Sí</option></select></label>
    </div>
    <div class="crew-modal-actions"><button class="btn light" id="caCancel">Cancelar</button><button class="btn primary" id="caSave">Añadir</button></div>`);
  setTimeout(()=>{
    $('#caCancel').onclick=closeDemoModal;
    $('#caSave').onclick=()=>{
      const name=$('#caName').value.trim();
      if(!name)return;
      crewState.workers.push({
        id:`${crewState.service.id}-new-${Date.now()}`,name,role:$('#caRole').value,team:$('#caTeam').value,workType,
        start:$('#caStart').value,end:$('#caEnd').value,pause:'00:00',realStart:'—',realEnd:'—',status:'NO CONTACTADO',
        rating:3,diet:$('#caDiet').value,phone:'—',selected:false,incident:'',notes:''
      });
      addAudit(`${name} añadido a ${workType}`);
      saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Trabajador añadido.');
    };
  },0);
}
function openCrewIncidents(){
  openDemoModal('Incidencias',`
    <div class="crew-modal-list">${crewState.incidents.length?crewState.incidents.map(i=>`<div><b>${i.time}</b> · ${i.text}</div>`).join(''):'<div>Sin incidencias.</div>'}</div>
    <textarea id="newIncident" rows="3" placeholder="Nueva incidencia"></textarea>
    <div class="crew-modal-actions"><button class="btn primary" id="addIncident">Añadir incidencia</button></div>`);
  setTimeout(()=>{
    $('#addIncident').onclick=()=>{
      const text=$('#newIncident').value.trim();if(!text)return;
      const time=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
      crewState.incidents.unshift({text,time});addAudit(`Incidencia: ${text}`);saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Incidencia añadida.');
    };
  },0);
}
function openCrewTeams(){
  openDemoModal('Escenarios y equipos',`
    <div class="crew-modal-list">${[...teams,'FORKLIFTER'].map((t,i)=>`<div><b>${t}</b><br><span class="muted">${crewState.workers.filter(w=>w.team===t).length} trabajadores · chaleco ${['NEGRO','NARANJA','GRIS'][i%3]}</span></div>`).join('')}</div>`);
}
function openBulkRate(){
  const selected=crewState.workers.filter(w=>w.selected);
  if(!selected.length){toast('Crew Control','Selecciona trabajadores primero.');return}
  openDemoModal('Valorar selección',`<p>Aplica una valoración a ${selected.length} trabajadores.</p><div class="rating-row">${[1,2,3,4,5].map(n=>`<button class="rating-star" data-bulk-rate="${n}">★</button>`).join('')}</div>`);
}
function openBulkEdit(){
  const selected=crewState.workers.filter(w=>w.selected);
  if(!selected.length){toast('Crew Control','Selecciona trabajadores primero.');return}
  openDemoModal('Edición masiva',`
    <div class="basic-modal-grid">
      <label>Equipo<select id="bulkTeam"><option value="">No cambiar</option>${[...teams,'FORKLIFTER'].map(t=>`<option>${t}</option>`).join('')}</select></label>
      <label>Dieta<select id="bulkDiet"><option value="">No cambiar</option><option>No</option><option>Sí</option></select></label>
      <label>Pausa<input id="bulkPause" placeholder="No cambiar · ej. 00:30"></label>
      <label>Bloque<select id="bulkBlock"><option value="">No cambiar</option><option>LOAD IN</option><option>SHOW</option><option>LOAD OUT</option></select></label>
    </div>
    <div class="crew-modal-actions"><button class="btn primary" id="bulkSave">Aplicar a ${selected.length}</button></div>`);
  setTimeout(()=>{
    $('#bulkSave').onclick=()=>{
      const team=$('#bulkTeam').value,diet=$('#bulkDiet').value,pause=$('#bulkPause').value.trim(),block=$('#bulkBlock').value;
      selected.forEach(w=>{if(team)w.team=team;if(diet)w.diet=diet;if(pause)w.pause=pause;if(block)w.workType=block});
      addAudit(`Edición masiva aplicada a ${selected.length} trabajadores`);
      saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Cambios masivos aplicados.');
    };
  },0);
}
function toggleCrewClosed(){
  if(crewState.closed){
    crewState.closed=false;addAudit('Servicio reabierto');saveCrewState();renderCrewControl(crewState.service);toast('Crew Control','Servicio reabierto.');return;
  }
  const present=crewState.workers.filter(w=>w.status==='PRESENTE').length;
  const absent=crewState.workers.filter(w=>w.status==='NO PRESENTADO').length;
  openDemoModal('Cerrar servicio',`
    <p>Revisa el resumen antes de cerrar.</p>
    <div class="crew-close-summary"><div><b>${crewState.workers.length}</b><span>Personal</span></div><div><b>${present}</b><span>Presentes</span></div><div><b>${absent}</b><span>No presentados</span></div></div>
    <div class="crew-modal-actions"><button class="btn light" id="closeCancel">Cancelar</button><button class="btn primary" id="closeConfirm">Cerrar servicio</button></div>`);
  setTimeout(()=>{
    $('#closeCancel').onclick=closeDemoModal;
    $('#closeConfirm').onclick=()=>{
      crewState.closed=true;addAudit('Servicio cerrado');saveCrewState();closeDemoModal();renderCrewControl(crewState.service);toast('Crew Control','Servicio cerrado en la demo.');
    };
  },0);
}
function duplicateCrewService(){
  addAudit('Copia operativa creada');
  navigator.clipboard?.writeText(crewState.service.code).catch(()=>{});
  toast('Crew Control','Se ha creado una copia operativa de demo.');
}

function bindCrewEvents(){
  $('#crewBack').onclick=()=>navigate('coordination');
  $('#crewExit').onclick=()=>navigate('coordination');
  $('#crewControlView').onclick=()=>toast('Crew Control','Vista Control activa.');
  $('#crewTopControl').onclick=()=>toast('Crew Control','Vista Control activa.');
  $('#crewDuplicate').onclick=duplicateCrewService;
  $('#crewTopDuplicate').onclick=duplicateCrewService;
  $('#crewCloseService').onclick=toggleCrewClosed;
  $('#crewTopClose').onclick=toggleCrewClosed;
  $('#crewCopyCode').onclick=()=>{
    navigator.clipboard?.writeText(crewState.service.code).then(()=>toast('Crew Control','Código copiado.')).catch(()=>toast('Crew Control',`Código: ${crewState.service.code}`));
  };
  $('#crewSidebarToggle').onclick=()=>toast('Crew Control','La barra de Control operativo permanece visible en esta demo.');
  $('#crewWorkFilters').onclick=e=>{
    const b=e.target.closest('[data-work]');if(!b)return;
    crewState.workFilter=b.dataset.work;
    $$('#crewWorkFilters button').forEach(x=>x.classList.toggle('active',x===b));
    renderCrewAll();
  };
  $('#crewSearch').oninput=e=>{crewState.search=e.target.value;renderCrewAll()};
  $('#crewStatusFilter').onchange=e=>{crewState.statusFilter=e.target.value;renderCrewAll()};
  $('#crewArrival').onclick=()=>{crewState.arrival=!crewState.arrival;$('#crewArrival').classList.toggle('primary',crewState.arrival);renderCrewAll()};
  $('#crewSelectAllCard').onclick=()=>{
    const all=crewState.workers.every(w=>w.selected);crewState.workers.forEach(w=>w.selected=!all);renderCrewAll();
  };
  $('#crewSelectVisible').onclick=()=>{
    const visible=new Set(crewFilteredWorkers().map(w=>w.id));
    const allSelected=[...visible].every(id=>crewState.workers.find(w=>w.id===id)?.selected);
    crewState.workers.forEach(w=>{if(visible.has(w.id))w.selected=!allSelected});
    renderCrewAll();
  };
  $('#crewMarkPresent').onclick=()=>setSelectedStatus('PRESENTE');
  $('#crewMarkAbsent').onclick=()=>setSelectedStatus('NO PRESENTADO');
  $('#crewRate').onclick=openBulkRate;
  $('#crewEdit').onclick=openBulkEdit;
  $('#openCrewIncidents').onclick=openCrewIncidents;
  $('#openCrewTeams').onclick=openCrewTeams;
  $$('.crew-hidden [data-hidden-team]').forEach(b=>b.onclick=()=>toast('Crew Control',`${b.dataset.hiddenTeam} añadido a la vista de demo.`));

  $('#crewBlocks').onclick=e=>{
    const check=e.target.closest('.crew-worker-check');
    if(check){
      const w=crewState.workers.find(x=>x.id===check.dataset.id);
      w.selected=check.checked;renderCrewSelected();check.closest('tr').classList.toggle('selected',w.selected);return;
    }
    const edit=e.target.closest('[data-edit-worker]');if(edit)return editCrewWorker(edit.dataset.editWorker);
    const add=e.target.closest('.crew-add-worker');if(add)return addCrewWorker(add.dataset.worktype);
    const bf=e.target.closest('[data-block-filter]');if(bf){crewState.statusFilter=bf.dataset.blockFilter;$('#crewStatusFilter').value=crewState.statusFilter;renderCrewAll();return}
    const toggle=e.target.closest('[data-toggle-block]');if(toggle){crewState.collapsed[toggle.dataset.toggleBlock]=!crewState.collapsed[toggle.dataset.toggleBlock];renderCrewBlocks();return}
    const move=e.target.closest('[data-move-block]');if(move)return moveBlock(move.dataset.moveBlock,move.dataset.dir);
  };
}



/* ---------------- Disponibilidad ---------------- */
const availabilityState={};
function initAvailabilityFromBootstrap(rows){(rows||[]).forEach(r=>availabilityState[String(r.DATE||'')]={status:String(r.STATUS||'PENDIENTE'),note:String(r.NOTE||'')});renderAvailability()}
function availabilityDates(){const out=[],d=new Date();for(let i=0;i<21;i++){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i);out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`)}return out}
function renderAvailability(){const root=$('#availabilityDays');if(!root)return;root.innerHTML=availabilityDates().map(date=>{const st=availabilityState[date]||{status:'NO CONTACTADO',note:''},label=new Date(date+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short'});return `<div class="availability-row"><strong>${label}</strong><select data-avail-status="${date}"><option ${st.status==='PENDIENTE'?'selected':''}>PENDIENTE</option><option ${st.status==='DISPONIBLE'?'selected':''}>DISPONIBLE</option><option ${st.status==='NO DISPONIBLE'?'selected':''}>NO DISPONIBLE</option></select><input data-avail-note="${date}" value="${st.note||''}" placeholder="Nota opcional"><button class="btn light" data-avail-save="${date}">Guardar</button></div>`}).join('');renderAvailabilitySummary()}
function renderAvailabilitySummary(){const root=$('#availabilitySummary');if(!root)return;const counts={DISPONIBLE:0,'NO DISPONIBLE':0,PENDIENTE:0};Object.values(availabilityState).forEach(v=>counts[v.status]=(counts[v.status]||0)+1);root.innerHTML=`<div class="availability-summary-item"><span>Disponibles</span><b>${counts.DISPONIBLE}</b></div><div class="availability-summary-item"><span>No disponibles</span><b>${counts['NO DISPONIBLE']}</b></div><div class="availability-summary-item"><span>Pendientes</span><b>${availabilityDates().length-counts.DISPONIBLE-counts['NO DISPONIBLE']}</b></div>`}
function saveAvailabilityDay(date){const status=$(`[data-avail-status="${date}"]`).value,note=$(`[data-avail-note="${date}"]`).value.trim();availabilityState[date]={status,note};renderAvailabilitySummary();if(window.google&&google.script&&google.script.run){google.script.run.withSuccessHandler(()=>toast('Disponibilidad','Guardada.')).withFailureHandler(e=>toast('Disponibilidad',e.message||'Error')).saveAvailability(date,status,note)}else toast('Disponibilidad','Guardada localmente.')}
function loadPortalBootstrap(){if(!(window.google&&google.script&&google.script.run)){renderAvailability();return}google.script.run.withSuccessHandler(data=>{window.portalBootstrap=data||{};initAvailabilityFromBootstrap(data?.availability||[]);applyBootstrapProfile(data?.profile||{});renderSavedClock(data?.clock||[]);if(Array.isArray(data?.documents)){data.documents.forEach(row=>{const d=docs.find(x=>x.id===row.DOC_ID);if(d&&row.STATUS)d.status=String(row.STATUS)});renderDocs()}if(data?.smallCoord){Object.entries(data.smallCoord).forEach(([id,rows])=>{if(Array.isArray(rows)&&rows.length)localStorage.setItem(`basicTeam-${id}`,JSON.stringify(rows))})}}).withFailureHandler(()=>renderAvailability()).getPortalBootstrap()}

/* ---------------- App ---------------- */

function enterApp(){
  try{
    document.body.classList.remove('crew-mode');
    $('#loginError')?.classList.remove('show');
    $('#appView')?.classList.remove('hidden');
    $('#loginView')?.classList.add('hidden');
    applyBootstrapProfile({});
    updateHomeNextService();
    updateCountdown();
    navigate('home');
    setTimeout(()=>{ try{ loadPortalBootstrap(); }catch(err){ console.warn('Bootstrap secundario omitido', err); } }, 0);
  }catch(err){
    console.error('Error al abrir el portal',err);
    $('#appView')?.classList.add('hidden');
    $('#loginView')?.classList.remove('hidden');
    const box=$('#loginError');
    if(box){box.textContent='No se pudo abrir el portal. Recarga y vuelve a intentarlo.';box.classList.add('show');}
  }
}
function logout(){
  document.body.classList.remove('crew-mode');
  $('#appView')?.classList.add('hidden');
  $('#loginView')?.classList.remove('hidden');
  $('#password').value=''; if(window.NOVA_API)window.NOVA_API.logout();
  const sc=$('#mainScroller'); if(sc) sc.scrollTop=0;
}

function bind(){
  $('#loginForm').addEventListener('submit',e=>{
    e.preventDefault();
    const u=$('#username').value.trim(),p=$('#password').value;
    const finish=ok=>{if(ok){window.novaActiveAccount=u.toLowerCase()==='coord'?'coord':'demo';enterApp();}else $('#loginError').classList.add('show')};
    if(window.NOVA_API){
      const submit=$('#loginForm button[type="submit"]'); if(submit){submit.disabled=true;submit.textContent='Accediendo…';}
      window.NOVA_API.login(u,p).then(()=>finish(true)).catch(error=>{
        const box=$('#loginError');if(box)box.textContent=error.message||'Error de conexión. Comprueba que Netlify Functions esté publicado.';
        finish(false);
      }).finally(()=>{if(submit){submit.disabled=false;submit.textContent='Entrar';}});
    }else finish(false);
  });

  $('#togglePassword').onclick=()=>{const field=$('#password'),visible=field.type==='password';field.type=visible?'text':'password';$('#togglePassword').setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');$('#togglePassword').setAttribute('aria-pressed',String(visible));};
  $('#recoverBtn').onclick=()=>toast('Recuperación','Proceso simulado.');
  $('#logoutBtn').onclick=logout;
  $('#mobileMenu').onclick=()=>$('#sidebar').classList.add('open');
  $('#mobileClose').onclick=()=>$('#sidebar').classList.remove('open');
  $('#notificationsBtn').onclick=()=>toggleNotifications();
  $('#messagesBtn').onclick=()=>{if(typeof window.NOVA_openInbox==='function')window.NOVA_openInbox();else toast('Mensajes','No se ha podido abrir la bandeja de mensajes.')};
  $('#homeViewService').onclick=()=>{const s=window.homeNextService||getUpcomingService();renderServiceDetail(s);navigate('service-detail')};


function notificationItems(){
  const next=getUpcomingService();
  const items=[
    {icon:'◉',title:'Nuevo servicio asignado',text:`${next.name} · ${next.date}`,action:()=>openService(next.id)},
    {icon:'▤',title:'Documentación pendiente',text:'Tienes 2 documentos pendientes de revisión.',action:()=>navigate('documents')}
  ];
  if(!trainingState.completed)items.splice(1,0,{icon:'◇',title:'Formación pendiente',text:`${trainingCourse.title} · antes del 15/11`,action:()=>navigate('training')});
  return items;
}
function renderNotifications(){
  const list=$('#notificationsList');if(!list)return;const items=notificationItems();list.innerHTML=items.map((n,i)=>`<button class="notification-item" data-notification-index="${i}"><span>${n.icon}</span><div><b>${n.title}</b><small>${n.text}</small></div></button>`).join('');
  const badge=$('#notificationsBtn i');if(badge)badge.style.display=items.length?'block':'none';
}
function toggleNotifications(force){const d=$('#notificationsDropdown');if(!d)return;const show=force===undefined?d.classList.contains('hidden'):force;d.classList.toggle('hidden',!show);if(show)renderNotifications()}

  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-page]');if(nav)return navigate(nav.dataset.page);
    const serv=e.target.closest('[data-open-service]');if(serv){const s=serviceById(serv.dataset.openService);renderServiceDetail(s);return navigate('service-detail')}
    const co=e.target.closest('[data-open-coordination]');if(co){const s=serviceById(co.dataset.openCoordination);if(s.privilege==='crew'){navigate('crew-control');renderCrewControl(s);return}renderWorkerCoord(s);return navigate('worker-coordination')}
    const basicEdit=e.target.closest('[data-basic-edit]');if(basicEdit)return editBasicWorker(basicEdit.dataset.basicEdit);
    const basicSelect=e.target.closest('[data-basic-select]');if(basicSelect){const id=basicSelect.dataset.basicSelect;if(basicSelect.checked)basicCoordState.selected.add(id);else basicCoordState.selected.delete(id);return renderBasicTeamRows()}
    const shift=e.target.closest('[data-basic-shift]');if(shift){basicCoordState.shiftFilter=shift.dataset.basicShift;renderBasicShiftFilters();return renderBasicTeamRows()}
    const availSave=e.target.closest('[data-avail-save]');if(availSave)return saveAvailabilityDay(availSave.dataset.availSave);
    const docOpen=e.target.closest('[data-open-doc]');if(docOpen)return openPortalDocument(docOpen.dataset.openDoc);
    const tutorial=e.target.closest('[data-open-tutorial]');if(tutorial)return openTutorial(tutorial.dataset.openTutorial);
    const contract=e.target.closest('[data-open-contract]');if(contract)return openContract(contract.dataset.openContract);
    const servicePrint=e.target.closest('[data-service-print]');if(servicePrint)return downloadServiceSheet(serviceById(servicePrint.dataset.servicePrint));
    const month=e.target.closest('[data-payroll-month]');if(month)return renderPayrollMonthsSelect(month.dataset.payrollMonth);
    const bulkRate=e.target.closest('[data-bulk-rate]');if(bulkRate){
      const selected=crewState.workers.filter(w=>w.selected);
      selected.forEach(w=>w.rating=Number(bulkRate.dataset.bulkRate));
      addAudit(`Valoración ${bulkRate.dataset.bulkRate}/5 aplicada a ${selected.length} trabajadores`);
      saveCrewState();closeDemoModal();renderCrewAll();return toast('Crew Control','Valoración aplicada.');
    }
    const demo=e.target.closest('.demo-action');if(demo)toast('Demo','Acción simulada.');
  });

  $('#backFromService').onclick=()=>navigate('services');
  $('#backFromWorkerCoord').onclick=()=>navigate('coordination');
  $('#clockServicePicker')?.addEventListener('change',renderClockService);
  $('#checkInBtn').onclick=()=>addClockLog('Entrada');
  $('#checkOutBtn').onclick=()=>addClockLog('Salida');
  $('#printPayroll').onclick=downloadNovaPayroll;
  $('#saveProfileBtn').onclick=saveProfileFromForm;

  document.addEventListener('input',e=>{
    if(e.target.id==='basicCoordSearch'){basicCoordState.search=e.target.value;renderBasicTeamRows()}
  });
  document.addEventListener('click',e=>{
    if(e.target.id==='basicSaveAll'){saveBasicCoord();toast('Coordinación','Cambios guardados.')}
    if(e.target.id==='basicSelectVisible'){visibleBasicWorkers().forEach(w=>basicCoordState.selected.add(w.id));renderBasicTeamRows()}
    if(e.target.id==='basicClearSelected'){basicCoordState.selected.clear();renderBasicTeamRows()}
    if(e.target.id==='basicBulkEdit'){openBasicBulkEdit()}
    
    // v6: basicAddIncident se gestiona en el controlador detallado de incidencias.
  });
}
function renderPayrollMonthsSelect(key){
  currentPayrollMonth=key;
  renderPayrollMonths();
}



/* ==================== v6 overrides · coordinación + disponibilidad ==================== */

const basicIncidentTypes=['RETRASO','UNIFORMIDAD','ACTITUD','SEGURIDAD','AUSENCIA','DAÑOS','CAMBIO CATEGORIA','OTRO'];
const basicIncidentSeverity=['LEVE','MEDIA','GRAVE'];

function normalizeBasicWorker(w){
  const item={...w};
  item.phone = item.phone || demoPhoneV9(item.id);
  item.role=String(item.role||'HAND B').toUpperCase();
  item.start=item.start||'08:00'; item.end=item.end||'18:00'; item.pause=item.pause||'00:00';
  item.diet=item.diet||'No'; item.rating=Number(item.rating||3); item.status=item.status||'NO CONTACTADO';
  if(!Array.isArray(item.incidents)){
    item.incidents=[];
    if(item.incident){item.incidents.push({id:`inc-${Date.now()}-${Math.random()}`,type:'OTRO',severity:'LEVE',time:new Date().toISOString(),description:item.incident,action:'',status:'ABIERTA'});}
  }
  delete item.incident;
  item.notes=item.notes||'';
  return item;
}
function makeBasicCoordWorkers(service){
  const saved=localStorage.getItem(`basicTeam-${service.id}`);
  if(saved){
    try{
      const parsed=JSON.parse(saved);
      const rows=Array.isArray(parsed)?parsed:(parsed.workers||[]);
      if(rows.length)return rows.map(normalizeBasicWorker);
    }catch(e){}
  }
  const count=Math.max(1,Math.min(15,Math.max(3,service.basicTeamSize||8))-(['svc1','svc2'].includes(service.id)?2:0));
  const baseStart=service.time.split('–')[0],baseEnd=service.time.split('–')[1];
  const starts=[baseStart,addTime(baseStart,60),addTime(baseStart,120)];
  const ends=[baseEnd,baseEnd,addTime(baseEnd,-60)];
  const rows=[];
  for(let i=0;i<count;i++){
    const shiftIndex=i%3;
    const role=(service.role==='FORKLIFTER'&&i===0)?'FORKLIFTER':(i%4===0?'HAND A':'HAND B');
    rows.push(normalizeBasicWorker({
      id:`${service.id}-b${i+1}`,
      name:`${firstNames[(i+6)%firstNames.length]} ${lastNames[(i*5+2)%lastNames.length]}`,
      role,phone:`6${String(10000000+(i+1)*84217).slice(-8)}`,start:starts[shiftIndex],end:ends[shiftIndex],pause:i%3===0?'00:30':'00:00',diet:i%2===0?'Sí':'No',
      rating:3+(i%3),status:i%5===0?'CONTACTADO':'PENDIENTE',notes:'',
      incidents:i===3?[{id:`seed-${i}`,type:'RETRASO',severity:'LEVE',time:'2026-10-27T08:15:00',description:'Llegada 10 minutos tarde comunicada por teléfono.',action:'Se ajusta hora real de entrada.',status:'RESUELTA'}]:[]
    }));
  }
  return rows;
}
function saveBasicCoord(){
  if(!basicCoordState.service)return;
  const payload={workers:basicCoordState.workers,generalIncidents:basicCoordState.generalIncidents||[]};
  localStorage.setItem(`basicTeam-${basicCoordState.service.id}`,JSON.stringify(payload));
}
function loadBasicCoordFromServer(){ /* v6 demo: persistencia local para que sea estable en preview y Apps Script */ }
function basicWorkerIncidentCount(w){return Array.isArray(w.incidents)?w.incidents.length:0}
function allBasicIncidents(){
  const rows=[];
  basicCoordState.workers.forEach(w=>(w.incidents||[]).forEach(i=>rows.push({...i,workerId:w.id,workerName:w.name})));
  (basicCoordState.generalIncidents||[]).forEach(i=>rows.push({...i,workerName:'SERVICIO'}));
  return rows.sort((a,b)=>String(b.time||'').localeCompare(String(a.time||'')));
}
function visibleBasicWorkers(){
  const q=(basicCoordState.search||'').trim().toLowerCase();
  return basicCoordState.workers.filter(w=>{
    if(q&&!`${w.name} ${w.role} ${w.status}`.toLowerCase().includes(q))return false;
    if(basicCoordState.shiftFilter!=='ALL'&&basicShiftKey(w)!==basicCoordState.shiftFilter)return false;
    if(basicCoordState.statusFilter&&basicCoordState.statusFilter!=='ALL'){
      if(basicCoordState.statusFilter==='INCIDENCIAS')return basicWorkerIncidentCount(w)>0;
      if(w.status!==basicCoordState.statusFilter)return false;
    }
    return true;
  });
}
function basicMetrics(){
  const rows=visibleBasicWorkers();
  return {total:rows.length,present:rows.filter(w=>w.status==='PRESENTE').length,pending:rows.filter(w=>w.status==='PENDIENTE').length,incidents:rows.reduce((n,w)=>n+basicWorkerIncidentCount(w),0)};
}
function renderWorkerCoord(s){
  basicCoordState.service=s;
  basicCoordState.workers=makeBasicCoordWorkers(s);
  const saved=localStorage.getItem(`basicTeam-${s.id}`);
  basicCoordState.generalIncidents=[];
  if(saved){try{const p=JSON.parse(saved);if(!Array.isArray(p)&&Array.isArray(p.generalIncidents))basicCoordState.generalIncidents=p.generalIncidents}catch(e){}}
  basicCoordState.search=''; basicCoordState.shiftFilter='ALL'; basicCoordState.statusFilter='ALL'; basicCoordState.selected=new Set();
  $('#workerCoordDetail').innerHTML=`
    <div class="basic-control-shell">
      <header class="basic-control-header">
        <div><span class="kicker">${roleLabel(s)} · COORDINACIÓN</span><h2>${s.name}</h2><p>${s.date} · INICIO ${s.time.split('–')[0]} · FIN ${s.time.split('–')[1]} · ${s.venue}</p></div>
        <button class="btn primary" id="basicSaveAll">Guardar cambios</button>
      </header>
      <div class="basic-control-layout">
        <aside class="basic-control-sidebar">
          <div class="basic-side-title">Control operativo</div>
          <div id="basicMetrics" class="basic-metrics"></div>
          <input id="basicCoordSearch" placeholder="Buscar trabajador o categoría…">
          <select id="basicStatusFilter"><option value="ALL">Todos los estados</option><option>PENDIENTE</option><option>CONTACTADO</option><option>PRESENTE</option><option>NO PRESENTADO</option><option value="INCIDENCIAS">Con incidencias</option></select>
          <button class="btn light full" id="basicOpenIncidents">⚠ Incidencias <b id="basicIncidentCount">0</b></button>
          <div class="basic-side-label">FRANJAS HORARIAS</div>
          <div id="basicShiftFilters" class="basic-shift-stack"></div>
          <div class="basic-selected-box" id="basicSelectedCount">0 seleccionados</div>
          <div class="basic-bulk-grid">
            <button id="basicSelectVisible" title="Seleccionar visibles">☑</button>
            <button id="basicMarkPresent" title="Marcar presente">✓</button>
            <button id="basicMarkAbsent" title="No presentado">✕</button>
            <button id="basicBulkRate" title="Valorar">★</button>
            <button id="basicBulkEdit" title="Editar selección">⚙</button>
          </div>
        </aside>
        <main class="basic-control-main">
          <div class="basic-control-toolbar">
            <div><b>Personal del servicio</b><span>Haz clic en una fila para seleccionar. Haz clic en el nombre o en Editar para abrir la ficha.</span></div>
            <button class="btn light" id="basicAddIncident">+ Nueva incidencia</button>
          </div>
          <div class="glass basic-team-wrap scroll-clean"><table class="basic-team-table"><thead><tr><th>✓</th><th>Personal</th><th>Categoría</th><th>Inicio</th><th>Fin</th><th>Pausa</th><th>Dieta</th><th>Estado</th><th>Valoración</th><th>Incidencias</th><th></th></tr></thead><tbody id="basicTeamBody"></tbody></table></div>
        </main>
      </div>
    </div>`;
  renderBasicShiftFilters(); renderBasicTeamRows(); renderBasicMetrics();
}
function renderBasicMetrics(){
  const root=$('#basicMetrics');if(!root)return;const m=basicMetrics();
  root.innerHTML=`<div><b>${m.total}</b><span>Visibles</span></div><div><b>${m.present}</b><span>Presentes</span></div><div><b>${m.pending}</b><span>Pendientes</span></div><div><b>${m.incidents}</b><span>Incidencias</span></div>`;
  const c=$('#basicIncidentCount');if(c)c.textContent=allBasicIncidents().length;
}
function renderBasicShiftFilters(){
  const root=$('#basicShiftFilters');if(!root)return;const shifts=[...new Set(basicCoordState.workers.map(basicShiftKey))];
  root.innerHTML=`<button class="basic-shift-chip ${basicCoordState.shiftFilter==='ALL'?'active':''}" data-basic-shift="ALL">TODOS <b>${basicCoordState.workers.length}</b></button>`+shifts.map(x=>`<button class="basic-shift-chip ${basicCoordState.shiftFilter===x?'active':''}" data-basic-shift="${x}">${x}<b>${basicCoordState.workers.filter(w=>basicShiftKey(w)===x).length}</b></button>`).join('');
}
function renderBasicTeamRows(){
  const root=$('#basicTeamBody');if(!root)return;const rows=visibleBasicWorkers();
  root.innerHTML=rows.map(w=>`<tr data-basic-row="${w.id}" class="${basicWorkerIncidentCount(w)?'has-incident':''} ${basicCoordState.selected.has(w.id)?'is-selected':''}">
    <td><input type="checkbox" data-basic-select="${w.id}" ${basicCoordState.selected.has(w.id)?'checked':''}></td>
    <td><button class="basic-worker-name" data-basic-edit="${w.id}">${w.name}</button></td><td>${w.role}</td><td>${w.start}</td><td>${w.end}</td><td>${w.pause}</td><td>${w.diet}</td><td><span class="basic-status ${w.status.replaceAll(' ','-')}">${w.status}</span></td><td class="stars">${'★'.repeat(w.rating)}${'☆'.repeat(5-w.rating)}</td><td>${basicWorkerIncidentCount(w)?`<button class="basic-incident-count" data-basic-incidents="${w.id}">${basicWorkerIncidentCount(w)}</button>`:'—'}</td><td><button data-basic-edit="${w.id}">Editar</button></td></tr>`).join('');
  const count=$('#basicSelectedCount');if(count)count.textContent=`${basicCoordState.selected.size} seleccionados`;
  renderBasicMetrics();
}
function setBasicSelectedStatus(status){
  const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));if(!selected.length)return toast('Coordinación','Selecciona trabajadores primero.');
  selected.forEach(w=>w.status=status);saveBasicCoord();renderBasicTeamRows();toast('Coordinación',`${selected.length} trabajadores → ${status}.`);
}
function openBasicBulkRate(){
  const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));if(!selected.length)return toast('Coordinación','Selecciona trabajadores primero.');
  openDemoModal('Valorar selección',`<p>Aplica una valoración a ${selected.length} trabajadores.</p><div class="rating-row">${[1,2,3,4,5].map(n=>`<button class="rating-star" data-basic-rate="${n}">★</button>`).join('')}</div>`);
}
function openBasicBulkEdit(){
  const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));if(!selected.length)return toast('Coordinación','Selecciona uno o varios trabajadores.');
  openDemoModal(`Editar ${selected.length} trabajadores`,`<div class="basic-modal-grid"><label>Inicio<input id="bbStart" placeholder="Mantener"></label><label>Fin<input id="bbEnd" placeholder="Mantener"></label><label>Pausa<input id="bbPause" placeholder="Mantener · 00:30"></label><label>Dieta<select id="bbDiet"><option value="">Mantener</option><option>Sí</option><option>No</option></select></label><label>Estado<select id="bbStatus"><option value="">Mantener</option><option>PENDIENTE</option><option>CONTACTADO</option><option>PRESENTE</option><option>NO PRESENTADO</option></select></label><label>Valoración<select id="bbRating"><option value="">Mantener</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label></div><div class="crew-modal-actions"><button class="btn light" id="bbCancel">Cancelar</button><button class="btn primary" id="bbApply">Aplicar cambios</button></div>`);
  setTimeout(()=>{$('#bbCancel').onclick=closeDemoModal;$('#bbApply').onclick=()=>{const patch={start:$('#bbStart').value.trim(),end:$('#bbEnd').value.trim(),pause:$('#bbPause').value.trim(),diet:$('#bbDiet').value,status:$('#bbStatus').value,rating:$('#bbRating').value};selected.forEach(w=>Object.entries(patch).forEach(([k,v])=>{if(v!=='')w[k]=k==='rating'?Number(v):v}));saveBasicCoord();closeDemoModal();renderBasicShiftFilters();renderBasicTeamRows();toast('Coordinación',`${selected.length} trabajadores actualizados.`)}} ,0);
}
function basicIncidentBadge(i){return `<span class="incident-severity sev-${String(i.severity||'LEVE').toLowerCase()}">${i.severity||'LEVE'}</span>`}
function basicIncidentCard(i){return `<div class="incident-card"><div class="incident-card-head"><b>${i.workerName||'SERVICIO'} · ${i.type||'OTRO'}</b>${basicIncidentBadge(i)}</div><small>${new Date(i.time||Date.now()).toLocaleString('es-ES')} · ${i.status||'ABIERTA'}</small><p>${i.description||''}</p>${i.action?`<div class="incident-action"><b>Actuación:</b> ${i.action}</div>`:''}</div>`}
function openBasicIncidents(workerId){
  const worker=workerId?basicCoordState.workers.find(w=>w.id===workerId):null;
  const list=worker?(worker.incidents||[]).map(i=>({...i,workerName:worker.name})):allBasicIncidents();
  openDemoModal(worker?`Incidencias · ${worker.name}`:'Incidencias del servicio',`<div class="incident-list">${list.length?list.map(basicIncidentCard).join(''):'<div class="empty-mini">Sin incidencias registradas.</div>'}</div><div class="crew-modal-actions"><button class="btn primary" id="newDetailedIncident">+ Registrar incidencia</button></div>`);
  setTimeout(()=>{$('#newDetailedIncident').onclick=()=>openBasicIncidentForm(workerId)},0);
}
function openBasicIncidentForm(workerId){
  const worker=workerId?basicCoordState.workers.find(w=>w.id===workerId):null;
  openDemoModal('Registrar incidencia',`<div class="basic-modal-grid"><label>Trabajador<select id="biWorker"><option value="">SERVICIO / GENERAL</option>${basicCoordState.workers.map(w=>`<option value="${w.id}" ${worker&&worker.id===w.id?'selected':''}>${w.name}</option>`).join('')}</select></label><label>Tipo<select id="biType">${basicIncidentTypes.map(x=>`<option>${x}</option>`).join('')}</select></label><label>Gravedad<select id="biSeverity">${basicIncidentSeverity.map(x=>`<option>${x}</option>`).join('')}</select></label><label>Estado<select id="biStatus"><option>ABIERTA</option><option>RESUELTA</option></select></label><label class="full">Descripción<textarea id="biDescription" rows="4" placeholder="Qué ha ocurrido, cuándo y contexto"></textarea></label><label class="full">Actuación / seguimiento<textarea id="biAction" rows="3" placeholder="Qué se ha hecho o queda pendiente"></textarea></label></div><div class="crew-modal-actions"><button class="btn light" id="biCancel">Cancelar</button><button class="btn primary" id="biSave">Guardar incidencia</button></div>`);
  setTimeout(()=>{$('#biCancel').onclick=closeDemoModal;$('#biSave').onclick=()=>{const description=$('#biDescription').value.trim();if(!description)return;const inc={id:`inc-${Date.now()}`,type:$('#biType').value,severity:$('#biSeverity').value,status:$('#biStatus').value,time:new Date().toISOString(),description,action:$('#biAction').value.trim()};const wid=$('#biWorker').value;if(wid){const w=basicCoordState.workers.find(x=>x.id===wid);w.incidents=w.incidents||[];w.incidents.unshift(inc)}else{basicCoordState.generalIncidents=basicCoordState.generalIncidents||[];basicCoordState.generalIncidents.unshift(inc)}saveBasicCoord();closeDemoModal();renderBasicTeamRows();toast('Coordinación','Incidencia registrada.')}},0);
}
function editBasicWorker(id){
  const w=basicCoordState.workers.find(x=>x.id===id);if(!w)return;
  openDemoModal('Ficha del trabajador',`<div class="worker-modal-summary"><div><b>${w.name}</b><span>${w.role} · ${w.start}–${w.end}</span></div><button class="btn light" id="bmNewIncident">⚠ Nueva incidencia</button></div><div class="basic-modal-grid"><label>Nombre<input id="bmName" value="${w.name}"></label><label>Teléfono<input id="bmPhone" inputmode="tel" value="${w.phone||''}"></label><label>Categoría<select id="bmRole">${['HAND A','HAND B','FORKLIFTER','CREW HEAD'].map(v=>`<option ${v===w.role?'selected':''}>${v}</option>`).join('')}</select></label><label>Inicio<input id="bmStart" value="${w.start}"></label><label>Fin<input id="bmEnd" value="${w.end}"></label><label>Pausa<input id="bmPause" value="${w.pause}"></label><label>Dieta<select id="bmDiet"><option ${w.diet==='No'?'selected':''}>No</option><option ${w.diet==='Sí'?'selected':''}>Sí</option></select></label><label>Estado<select id="bmStatus">${['PENDIENTE','CONTACTADO','PRESENTE','NO PRESENTADO'].map(v=>`<option ${v===w.status?'selected':''}>${v}</option>`).join('')}</select></label><label>Valoración<select id="bmRating">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.rating?'selected':''}>${n} / 5</option>`).join('')}</select></label><label class="full">Notas<textarea id="bmNotes" rows="3">${w.notes||''}</textarea></label></div><div class="worker-incidents-preview"><div class="preview-title"><b>Incidencias (${basicWorkerIncidentCount(w)})</b><button class="link-btn" id="bmViewIncidents">Ver todas</button></div>${(w.incidents||[]).slice(0,2).map(i=>basicIncidentCard({...i,workerName:w.name})).join('')||'<span class="muted">Sin incidencias.</span>'}</div><div class="crew-modal-actions"><button class="btn light" id="bmCancel">Cancelar</button><button class="btn primary" id="bmSave">Guardar</button></div>`);
  setTimeout(()=>{
    $('#bmCancel').onclick=closeDemoModal;
    $('#bmNewIncident').onclick=()=>openBasicIncidentForm(w.id);
    $('#bmViewIncidents').onclick=()=>openBasicIncidents(w.id);
    $('#bmSave').onclick=()=>{w.name=$('#bmName').value.trim()||w.name;w.phone=$('#bmPhone')?.value.trim()||w.phone;w.role=$('#bmRole').value;w.diet=$('#bmDiet').value;w.start=$('#bmStart').value;w.end=$('#bmEnd').value;w.pause=$('#bmPause').value;w.status=$('#bmStatus').value;w.rating=Number($('#bmRating').value);w.notes=$('#bmNotes').value.trim();saveBasicCoord();closeDemoModal();renderBasicShiftFilters();renderBasicTeamRows();toast('Coordinación','Trabajador actualizado.');};
  },0);
}

/* Crew Control v6: demo integrado, sin iframe ni backend externo */
function openExactCrewControl(service){navigate('crew-control');renderCrewControl(service)}
function reloadExactCrewControl(){if(crewState.service)renderCrewControl(crewState.service)}

/* Disponibilidad por franjas de 30 minutos */
function defaultAvailabilitySlots(date){
  const p=availabilityPrefs();const d=new Date(date+'T12:00:00'),weekend=[0,6].includes(d.getDay());
  if(p.total)return allHalfHourSlots();
  const slots=[];
  if(p.weekends&&weekend)slots.push(...allHalfHourSlots());
  if(p.mornings)slots.push(...allHalfHourSlots().filter(x=>x>='06:00'&&x<'14:00'));
  if(p.afternoons)slots.push(...allHalfHourSlots().filter(x=>x>='14:00'&&x<'22:00'));
  return [...new Set(slots)].sort();
}
function availabilityForDate(date){return availabilityState[date]?normalizeAvail(availabilityState[date]):normalizeAvail({slots:defaultAvailabilitySlots(date),note:'Disponibilidad habitual'});}
let availabilityEditDate=null;
function availabilityDates(){const out=[],d=new Date();for(let i=0;i<28;i++){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i);out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`)}return out}
function allHalfHourSlots(){const out=[];for(let h=0;h<24;h++){out.push(`${String(h).padStart(2,'0')}:00`);out.push(`${String(h).padStart(2,'0')}:30`)}return out}
function normalizeAvail(v){if(!v)return {slots:[],note:''};if(Array.isArray(v.slots))return {slots:[...new Set(v.slots)],note:v.note||''};if(v.status==='DISPONIBLE')return {slots:allHalfHourSlots(),note:v.note||''};return {slots:[],note:v.note||''}}
function initAvailabilityFromBootstrap(rows){
  try{const local=JSON.parse(localStorage.getItem('novaAvailabilityV6')||'{}');Object.entries(local).forEach(([d,v])=>availabilityState[d]=normalizeAvail(v))}catch(e){}
  (rows||[]).forEach(r=>{const date=String(r.DATE||'');if(!date||availabilityState[date])return;try{const parsed=JSON.parse(String(r.NOTE||''));availabilityState[date]=normalizeAvail(parsed)}catch(e){availabilityState[date]=normalizeAvail({status:String(r.STATUS||'PENDIENTE'),note:String(r.NOTE||'')})}});
  renderAvailability();
}
function slotsToRanges(slots){
  const all=allHalfHourSlots(),set=new Set(slots||[]),ranges=[];let start=null,prev=-2;
  all.forEach((slot,i)=>{if(set.has(slot)){if(start===null||i!==prev+1){if(start!==null)ranges.push([start,all[(prev+1)%48]||'24:00']);start=slot}prev=i}else if(start!==null){ranges.push([start, i===48?'24:00':all[i]]);start=null;prev=-2}});
  if(start!==null)ranges.push([start,'24:00']);return ranges;
}
function formatAvailRanges(slots){const r=slotsToRanges(slots);return r.length?r.map(x=>`${x[0]}–${x[1]}`).join(' · '):'Sin disponibilidad marcada'}
function saveAvailabilityLocal(){localStorage.setItem('novaAvailabilityV6',JSON.stringify(availabilityState))}
function renderAvailability(){
  const root=$('#availabilityDays');if(!root)return;
  root.innerHTML=`<div class="availability-calendar">${availabilityDates().map(date=>{const st=availabilityForDate(date),d=new Date(date+'T12:00:00'),day=d.toLocaleDateString('es-ES',{weekday:'short'}),num=d.getDate(),month=d.toLocaleDateString('es-ES',{month:'short'});return `<button class="availability-day-card ${st.slots.length?'has-hours':''}" data-avail-day="${date}"><span>${day}</span><b>${num}</b><small>${month}</small><em>${st.slots.length?formatAvailRanges(st.slots):'Añadir horario'}</em></button>`}).join('')}</div>`;
  renderAvailabilitySummary();
}
function renderAvailabilitySummary(){
  const root=$('#availabilitySummary');if(!root)return;const dates=availabilityDates();const days=dates.filter(d=>(availabilityState[d]?.slots||[]).length).length;const slots=dates.reduce((n,d)=>n+(availabilityState[d]?.slots||[]).length,0);
  root.innerHTML=`<div class="availability-summary-item"><span>Días con disponibilidad</span><b>${days}</b></div><div class="availability-summary-item"><span>Horas disponibles</span><b>${(slots*.5).toFixed(1).replace('.0','')} h</b></div><div class="availability-summary-item"><span>Periodo visible</span><b>28 días</b></div><div class="availability-tip">Puedes guardar varios tramos distintos dentro de un mismo día.</div>`;
}
function openAvailabilityDay(date){
  availabilityEditDate=date;const st=availabilityForDate(date);availabilityState[date]=st;const label=new Date(date+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  openDemoModal(`Disponibilidad · ${label}`,`<div class="availability-editor"><div class="availability-editor-actions"><button class="btn light" id="availAllDay">Todo el día</button><button class="btn light" id="availClearDay">Limpiar</button><span id="availRangesText">${formatAvailRanges(st.slots)}</span></div><div class="availability-hours-grid">${allHalfHourSlots().map(slot=>`<button class="avail-hour ${st.slots.includes(slot)?'active':''}" data-avail-slot="${slot}">${slot}</button>`).join('')}</div><label class="availability-note">Nota para coordinación<textarea id="availNote" rows="2" placeholder="Ej. Disponible si me avisan con 24 h">${st.note||''}</textarea></label></div><div class="crew-modal-actions"><button class="btn light" id="availCancel">Cancelar</button><button class="btn primary" id="availSave">Guardar disponibilidad</button></div>`);
  setTimeout(()=>{
    $('#availCancel').onclick=closeDemoModal;
    $('#availAllDay').onclick=()=>{st.slots=allHalfHourSlots();refreshAvailabilityEditor(st)};
    $('#availClearDay').onclick=()=>{st.slots=[];refreshAvailabilityEditor(st)};
    $('#availSave').onclick=()=>{st.note=$('#availNote').value.trim();availabilityState[date]=st;saveAvailabilityLocal();if(window.google&&google.script&&google.script.run){google.script.run.withFailureHandler(()=>{}).saveAvailability(date,st.slots.length?'POR HORAS':'NO DISPONIBLE',JSON.stringify(st))}closeDemoModal();renderAvailability();toast('Disponibilidad','Horarios guardados.');};
    $$('.avail-hour').forEach(b=>b.onclick=()=>{const slot=b.dataset.availSlot;st.slots=st.slots.includes(slot)?st.slots.filter(x=>x!==slot):[...st.slots,slot].sort();refreshAvailabilityEditor(st)});
  },0);
}
function refreshAvailabilityEditor(st){$$('.avail-hour').forEach(b=>b.classList.toggle('active',st.slots.includes(b.dataset.availSlot)));const t=$('#availRangesText');if(t)t.textContent=formatAvailRanges(st.slots)}

/* Eventos adicionales v6 */
document.addEventListener('click',e=>{
  const row=e.target.closest('[data-basic-row]');
  if(row&&!e.target.closest('button,input,select,textarea')){const id=row.dataset.basicRow;if(basicCoordState.selected.has(id))basicCoordState.selected.delete(id);else basicCoordState.selected.add(id);renderBasicTeamRows();return;}
  const inc=e.target.closest('[data-basic-incidents]');if(inc){openBasicIncidents(inc.dataset.basicIncidents);return;}
  const day=e.target.closest('[data-avail-day]');if(day){openAvailabilityDay(day.dataset.availDay);return;}
  const rate=e.target.closest('[data-basic-rate]');if(rate){const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));selected.forEach(w=>w.rating=Number(rate.dataset.basicRate));saveBasicCoord();closeDemoModal();renderBasicTeamRows();toast('Coordinación','Valoración aplicada.');return;}
  if(e.target.id==='basicMarkPresent')return setBasicSelectedStatus('PRESENTE');
  if(e.target.id==='basicMarkAbsent')return setBasicSelectedStatus('NO PRESENTADO');
  if(e.target.id==='basicBulkRate')return openBasicBulkRate();
  if(e.target.id==='basicOpenIncidents'||e.target.id==='basicAddIncident')return openBasicIncidents();
});
document.addEventListener('change',e=>{if(e.target.id==='basicStatusFilter'){basicCoordState.statusFilter=e.target.value;renderBasicTeamRows();}});

function init(){
  renderHomeServices();
  renderServices();
  renderCoordination();
  renderDocs();
  renderContracts();
  renderTraining();
  renderNotifications();
  renderPayrollMonths();
  renderClockService();
  updateHomeNextService();
  updateCountdown();
  setInterval(updateCountdown,1000);
  bind();
}

document.addEventListener('click',e=>{
  const svcCoord=e.target.closest('[data-service-coordination]');if(svcCoord){const s=serviceById(svcCoord.dataset.serviceCoordination);if(s.privilege==='crew'){navigate('crew-control');renderCrewControl(s);return}renderWorkerCoord(s);return navigate('worker-coordination')}
  const tab=e.target.closest('[data-profile-tab]');if(tab){$$('.profile-tab').forEach(x=>x.classList.toggle('active',x===tab));$$('.profile-panel').forEach(x=>x.classList.remove('active'));$('#profilePanel'+({personal:'Personal',work:'Work',skills:'Skills'}[tab.dataset.profileTab])).classList.add('active');return}
  const ni=e.target.closest('[data-notification-index]');if(ni){const item=notificationItems()[Number(ni.dataset.notificationIndex)];toggleNotifications(false);item?.action?.();return}
  const rl=e.target.closest('[data-remove-lang]');if(rl){profileLanguages.splice(Number(rl.dataset.removeLang),1);renderProfileEditableLists();return}
  const rk=e.target.closest('[data-remove-knowledge]');if(rk){profileKnowledge.splice(Number(rk.dataset.removeKnowledge),1);renderProfileEditableLists();return}
  const re=e.target.closest('[data-remove-education]');if(re){profileEducation.splice(Number(re.dataset.removeEducation),1);renderProfileEditableLists();return}
  if(e.target.closest('#startTrainingBtn')){openTrainingCourse();return}
  if(e.target.closest('#closeNotifications')){toggleNotifications(false);return}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-lang-name]'))profileLanguages[Number(e.target.dataset.langName)].name=e.target.value;if(e.target.matches('[data-knowledge]'))profileKnowledge[Number(e.target.dataset.knowledge)]=e.target.value;if(e.target.matches('[data-education]'))profileEducation[Number(e.target.dataset.education)]=e.target.value;});
document.addEventListener('change',e=>{if(e.target.matches('[data-lang-level]'))profileLanguages[Number(e.target.dataset.langLevel)].level=e.target.value;if(['prefTotal','prefWeekends','prefMornings','prefAfternoons'].includes(e.target.id)){if(e.target.id==='prefTotal'&&e.target.checked){$('#prefWeekends').checked=false;$('#prefMornings').checked=false;$('#prefAfternoons').checked=false}else if(e.target.id!=='prefTotal'&&e.target.checked)$('#prefTotal').checked=false;renderAvailabilityBasePreview();renderAvailability();}});
/* init v7 sustituido por initV8 al final */
setTimeout(()=>{if($('#startTrainingBtn'))$('#startTrainingBtn').onclick=openTrainingCourse;if($('#closeNotifications'))$('#closeNotifications').onclick=()=>toggleNotifications(false);if($('#addLanguageBtn'))$('#addLanguageBtn').onclick=()=>{profileLanguages.push({name:'Nuevo idioma',level:'Básico'});renderProfileEditableLists()};if($('#addKnowledgeBtn'))$('#addKnowledgeBtn').onclick=()=>{profileKnowledge.push('Nuevo conocimiento');renderProfileEditableLists()};if($('#addEducationBtn'))$('#addEducationBtn').onclick=()=>{profileEducation.push('Nueva formación');renderProfileEditableLists()};if($('#profilePhotoInput'))$('#profilePhotoInput').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#profilePhotoPreview').style.backgroundImage=`url(${r.result})`;$('#profilePhotoPreview').classList.add('has-photo');document.querySelectorAll('.profile-chip .avatar').forEach(a=>{a.style.backgroundImage=`url(${r.result})`;a.style.backgroundSize='cover';a.style.backgroundPosition='center';a.textContent='';a.classList.add('has-photo')});localStorage.setItem('novaProfilePhotoV7',r.result)};r.readAsDataURL(f)};const photo=localStorage.getItem('novaProfilePhotoV7');if(photo&&$('#profilePhotoPreview')){$('#profilePhotoPreview').style.backgroundImage=`url(${photo})`;$('#profilePhotoPreview').classList.add('has-photo');document.querySelectorAll('.profile-chip .avatar').forEach(a=>{a.style.backgroundImage=`url(${photo})`;a.style.backgroundSize='cover';a.style.backgroundPosition='center';a.textContent='';a.classList.add('has-photo')})}},0);

/* ==================== v8 · estabilidad, selección sin checkbox y disponibilidad mensual ==================== */

const STATUS_OPTIONS_V8=['NO CONTACTADO','CONTACTADO','PRESENTE','NO PRESENTADO'];
function normalizeStatusV8(v){
  const s=String(v||'').toUpperCase();
  return s==='PENDIENTE'?'NO CONTACTADO':(STATUS_OPTIONS_V8.includes(s)||s==='RESERVA'?s:'NO CONTACTADO');
}
function statusSelectHtmlV8(id,status,kind){
  const s=normalizeStatusV8(status);
  return `<select class="inline-status ${kind}-inline-status status-${s.replaceAll(' ','-')}" data-${kind}-status="${id}">${STATUS_OPTIONS_V8.map(v=>`<option value="${v}" ${v===s?'selected':''}>${v}</option>`).join('')}</select>`;
}
function avgRatingV8(w){
  const vals=[Number(w.uniformity||w.rating||3),Number(w.attitude||w.rating||3),Number(w.punctuality||w.rating||3)];
  return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
}
function normalizeBasicWorker(w){
  const item={...w};
  item.phone = item.phone || demoPhoneV9(item.id);
  item.role=String(item.role||'HAND B').toUpperCase();
  item.start=item.start||'08:00'; item.end=item.end||'18:00'; item.pause=item.pause||'00:00';
  item.realStart=item.realStart||''; item.realEnd=item.realEnd||'';
  item.diet=item.diet||'No'; item.reserve=Boolean(item.reserve);
  item.status=normalizeStatusV8(item.status);
  item.uniformity=Number(item.uniformity||item.rating||3);
  item.attitude=Number(item.attitude||item.rating||3);
  item.punctuality=Number(item.punctuality||item.rating||3);
  item.rating=avgRatingV8(item);
  if(!Array.isArray(item.incidents)){
    item.incidents=[];
    if(item.incident){item.incidents.push({id:`inc-${Date.now()}-${Math.random()}`,type:'OTRO',severity:'LEVE',time:new Date().toISOString(),description:item.incident,action:'',status:'ABIERTA'});}
  }
  delete item.incident;
  item.notes=item.notes||'';
  return item;
}
function normalizeCrewWorkerV8(w){
  w.status=normalizeStatusV8(w.status);
  w.reserve=Boolean(w.reserve||w.status==='RESERVA');
  w.actualStart=w.actualStart||w.realStart||'';
  w.actualEnd=w.actualEnd||w.realEnd||'';
  w.uniformity=Number(w.uniformity||w.rating||3);
  w.attitude=Number(w.attitude||w.rating||3);
  w.punctuality=Number(w.punctuality||w.rating||3);
  w.rating=avgRatingV8(w);
  return w;
}

/* Coordinación pequeña: misma lógica de selección que Crew Control, sin casillas */
function renderWorkerCoord(s){
  basicCoordState.service=s;
  basicCoordState.workers=makeBasicCoordWorkers(s).map(normalizeBasicWorker);
  const saved=localStorage.getItem(`basicTeam-${s.id}`);
  basicCoordState.generalIncidents=[];
  if(saved){try{const p=JSON.parse(saved);if(!Array.isArray(p)&&Array.isArray(p.generalIncidents))basicCoordState.generalIncidents=p.generalIncidents}catch(e){}}
  basicCoordState.search=''; basicCoordState.shiftFilter='ALL'; basicCoordState.statusFilter='ALL'; basicCoordState.selected=new Set();
  $('#workerCoordDetail').innerHTML=`
    <div class="basic-control-shell">
      <header class="basic-control-header">
        <div><span class="kicker">${roleLabel(s)} · GESTIÓN DE EQUIPO</span><h2>${s.name}</h2><p>${s.date} · INICIO ${s.time.split('–')[0]} · FIN ${s.time.split('–')[1]} · ${s.venue}</p></div>
        <button class="btn primary" id="basicSaveAll">Guardar cambios</button>
      </header>
      <div class="basic-control-layout">
        <aside class="basic-control-sidebar">
          <div class="basic-side-title">Control operativo</div>
          <div id="basicMetrics" class="basic-metrics"></div>
          <input id="basicCoordSearch" placeholder="Buscar trabajador o categoría…">
          <select id="basicStatusFilter">
            <option value="ALL">Todos los estados</option>
            <option>NO CONTACTADO</option><option>CONTACTADO</option><option>PRESENTE</option><option>NO PRESENTADO</option>
            <option value="INCIDENCIAS">Con incidencias</option>
          </select>
          <button class="btn light full" id="basicOpenIncidents">⚠ Incidencias <b id="basicIncidentCount">0</b></button>
          <div class="basic-side-label">FRANJAS HORARIAS</div>
          <div id="basicShiftFilters" class="basic-shift-stack"></div>
          <div class="basic-selected-box" id="basicSelectedCount">0 seleccionados</div>
          <div class="basic-bulk-grid">
            <button id="basicSelectVisible" title="Seleccionar visibles">☑</button>
            <button id="basicMarkPresent" title="Marcar presente">✓</button>
            <button id="basicMarkAbsent" title="No presentado">✕</button>
            <button id="basicBulkRate" title="Valorar">★</button>
            <button id="basicBulkEdit" title="Editar selección">⚙</button>
          </div>
        </aside>
        <main class="basic-control-main">
          <div class="basic-control-toolbar">
            <div><b>Personal del servicio</b><span>Clica una fila o el nombre para seleccionar. “Editar” abre la ficha completa.</span></div>
            <button class="btn light" id="basicAddIncident">+ Nueva incidencia</button>
          </div>
          <div class="glass basic-team-wrap scroll-clean"><table class="basic-team-table"><thead><tr><th>Personal</th><th>Categoría</th><th>Inicio</th><th>Fin</th><th>Pausa</th><th>Dieta</th><th>Estado</th><th>Valoración</th><th>Incidencias</th><th></th></tr></thead><tbody id="basicTeamBody"></tbody></table></div>
        </main>
      </div>
    </div>`;
  renderBasicShiftFilters(); renderBasicTeamRows(); renderBasicMetrics();
}
function renderBasicTeamRows(){
  const root=$('#basicTeamBody');if(!root)return;const rows=visibleBasicWorkers();
  root.innerHTML=rows.map(w=>`<tr data-basic-row="${w.id}" class="${basicWorkerIncidentCount(w)?'has-incident':''} ${basicCoordState.selected.has(w.id)?'is-selected':''}">
    <td><button class="basic-worker-name v8-select-name" data-basic-select-name="${w.id}">${w.name}</button><div class="worker-phone-line">${phoneLinkV9(w.phone)}</div></td>
    <td>${w.role}${w.reserve?' <span class="mini-reserve">RESERVA</span>':''}</td>
    <td>${w.start}${w.realStart?`<small class="real-time">Real ${w.realStart}</small>`:''}</td>
    <td>${w.end}${w.realEnd?`<small class="real-time">Real ${w.realEnd}</small>`:''}</td>
    <td>${w.pause}</td><td>${w.diet}</td>
    <td>${statusSelectHtmlV8(w.id,w.status,'basic')}</td>
    <td class="stars">${ratingStarsV9('basic',w.id,avgRatingV8(w))}</td>
    <td>${basicWorkerIncidentCount(w)?`<button class="basic-incident-count" data-basic-incidents="${w.id}">${basicWorkerIncidentCount(w)}</button>`:'—'}</td>
    <td><button data-basic-edit="${w.id}">Editar</button></td></tr>`).join('');
  const count=$('#basicSelectedCount');if(count)count.textContent=`${basicCoordState.selected.size} seleccionados`;
  renderBasicMetrics();
}
function openBasicBulkEdit(){
  const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));
  if(!selected.length)return toast('Coordinación','Selecciona uno o varios trabajadores.');
  openDemoModal(`Editar selección · ${selected.length}`,`
    <div class="bulk-v8-intro">Opciones equivalentes al Crew Control. Deja un campo en “Sin cambio” para conservarlo.</div>
    <div class="basic-modal-grid bulk-v8-grid">
      <label>Categoría<select id="bbRole"><option value="">Sin cambio</option><option>HAND A</option><option>HAND B</option><option>FORKLIFTER</option><option>CREW HEAD</option></select></label>
      <label>Estado<select id="bbStatus"><option value="">Sin cambio</option>${STATUS_OPTIONS_V8.map(v=>`<option>${v}</option>`).join('')}</select></label>
      <label>Reserva<select id="bbReserve"><option value="">Sin cambio</option><option value="1">Marcar reserva</option><option value="0">Quitar reserva</option></select></label>
      <label>Pausa<select id="bbPause"><option value="">Sin cambio</option><option value="00:00">Sin pausa</option><option value="00:15">15 min</option><option value="00:30">30 min</option><option value="00:45">45 min</option><option value="01:00">1 hora</option><option value="01:30">1 h 30 min</option><option value="02:00">2 horas</option></select></label>
      <label>Dieta<select id="bbDiet"><option value="">Sin cambio</option><option value="No">Sin dieta</option><option value="Sí">Con dieta</option></select></label>
      <label>Entrada real<input id="bbRealStart" type="time"></label>
      <label>Fin real<input id="bbRealEnd" type="time"></label>
      <label>Horario real<select id="bbScheduleMode"><option value="">Usar horas indicadas</option><option value="PLANNED">Usar horario previsto</option></select></label>
      <label>Uniformidad<select id="bbUniformity"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label>
      <label>Actitud<select id="bbAttitude"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label>
      <label>Puntualidad<select id="bbPunctuality"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label>
    </div>
    <div class="bulk-v8-shortcuts"><button class="btn light" id="bbNowStart">Entrada ahora</button><button class="btn light" id="bbNowEnd">Fin ahora</button><button class="btn light" id="bbIncident">Registrar incidencia</button></div>
    <div class="crew-modal-actions"><button class="btn light" id="bbCancel">Cancelar</button><button class="btn primary" id="bbApply">Aplicar cambios</button></div>`);
  setTimeout(()=>{
    $('#bbCancel').onclick=closeDemoModal;
    $('#bbNowStart').onclick=()=>$('#bbRealStart').value=new Date().toTimeString().slice(0,5);
    $('#bbNowEnd').onclick=()=>$('#bbRealEnd').value=new Date().toTimeString().slice(0,5);
    $('#bbIncident').onclick=()=>openBasicIncidentForm();
    $('#bbApply').onclick=()=>{
      const role=$('#bbRole').value,status=$('#bbStatus').value,reserve=$('#bbReserve').value,pause=$('#bbPause').value,diet=$('#bbDiet').value;
      const rs=$('#bbRealStart').value,re=$('#bbRealEnd').value,mode=$('#bbScheduleMode').value;
      const u=$('#bbUniformity').value,a=$('#bbAttitude').value,p=$('#bbPunctuality').value;
      selected.forEach(w=>{
        if(role)w.role=role;if(status)w.status=status;if(reserve!=='')w.reserve=reserve==='1';if(pause)w.pause=pause;if(diet)w.diet=diet;
        if(mode==='PLANNED'){w.realStart='';w.realEnd=''}else{if(rs)w.realStart=rs;if(re)w.realEnd=re}
        if(u)w.uniformity=Number(u);if(a)w.attitude=Number(a);if(p)w.punctuality=Number(p);w.rating=avgRatingV8(w);
      });
      saveBasicCoord();closeDemoModal();renderBasicShiftFilters();renderBasicTeamRows();toast('Coordinación',`${selected.length} trabajadores actualizados.`);
    };
  },0);
}
function editBasicWorker(id){
  const w=basicCoordState.workers.find(x=>x.id===id);if(!w)return;
  openDemoModal('Ficha del trabajador',`
    <div class="worker-modal-summary"><div><b>${w.name}</b><span>${w.role} · ${w.start}–${w.end}</span></div><button class="btn light" id="bmNewIncident">⚠ Nueva incidencia</button></div>
    <div class="basic-modal-grid">
      <label>Nombre<input id="bmName" value="${w.name}"></label><label>Teléfono<input id="bmPhone" inputmode="tel" value="${w.phone||''}"></label>
      <label>Categoría<select id="bmRole">${['HAND A','HAND B','FORKLIFTER','CREW HEAD'].map(v=>`<option ${v===w.role?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Inicio previsto<input id="bmStart" type="time" value="${w.start}"></label><label>Fin previsto<input id="bmEnd" type="time" value="${w.end}"></label>
      <label>Entrada real<input id="bmRealStart" type="time" value="${w.realStart||''}"></label><label>Fin real<input id="bmRealEnd" type="time" value="${w.realEnd||''}"></label>
      <label>Pausa<select id="bmPause">${['00:00','00:15','00:30','00:45','01:00','01:30','02:00'].map(v=>`<option ${v===w.pause?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Dieta<select id="bmDiet"><option ${w.diet==='No'?'selected':''}>No</option><option ${w.diet==='Sí'?'selected':''}>Sí</option></select></label>
      <label>Estado<select id="bmStatus">${STATUS_OPTIONS_V8.map(v=>`<option ${v===w.status?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Reserva<select id="bmReserve"><option value="0" ${!w.reserve?'selected':''}>No</option><option value="1" ${w.reserve?'selected':''}>Sí</option></select></label>
      <label>Uniformidad<select id="bmUniformity">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.uniformity?'selected':''}>${n}/5</option>`).join('')}</select></label>
      <label>Actitud<select id="bmAttitude">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.attitude?'selected':''}>${n}/5</option>`).join('')}</select></label>
      <label>Puntualidad<select id="bmPunctuality">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.punctuality?'selected':''}>${n}/5</option>`).join('')}</select></label>
      <label class="full">Notas<textarea id="bmNotes" rows="3">${w.notes||''}</textarea></label>
    </div>
    <div class="worker-incidents-preview"><div class="preview-title"><b>Incidencias (${basicWorkerIncidentCount(w)})</b><button class="link-btn" id="bmViewIncidents">Ver todas</button></div>${(w.incidents||[]).slice(0,2).map(i=>basicIncidentCard({...i,workerName:w.name})).join('')||'<span class="muted">Sin incidencias.</span>'}</div>
    <div class="crew-modal-actions"><button class="btn light" id="bmCancel">Cancelar</button><button class="btn primary" id="bmSave">Guardar</button></div>`);
  setTimeout(()=>{
    $('#bmCancel').onclick=closeDemoModal; $('#bmNewIncident').onclick=()=>openBasicIncidentForm(w.id); $('#bmViewIncidents').onclick=()=>openBasicIncidents(w.id);
    $('#bmSave').onclick=()=>{
      w.name=$('#bmName').value.trim()||w.name;w.phone=$('#bmPhone')?.value.trim()||w.phone;w.role=$('#bmRole').value;w.start=$('#bmStart').value;w.end=$('#bmEnd').value;
      w.realStart=$('#bmRealStart').value;w.realEnd=$('#bmRealEnd').value;w.pause=$('#bmPause').value;w.diet=$('#bmDiet').value;w.status=$('#bmStatus').value;
      w.reserve=$('#bmReserve').value==='1';w.uniformity=Number($('#bmUniformity').value);w.attitude=Number($('#bmAttitude').value);w.punctuality=Number($('#bmPunctuality').value);w.rating=avgRatingV8(w);w.notes=$('#bmNotes').value.trim();
      saveBasicCoord();closeDemoModal();renderBasicShiftFilters();renderBasicTeamRows();toast('Coordinación','Trabajador actualizado.');
    };
  },0);
}

/* Crew Control demo: selección por fila/nombre, estados inline y edición completa */
function renderLegacyCrewControl(s){
  crewState.service=s;
  crewState.workers=makeCrewWorkers(s).map(normalizeCrewWorkerV8);
  crewState.workFilter='TODO';crewState.statusFilter='ALL';crewState.search='';crewState.arrival=false;crewState.collapsed={};loadCrewMeta(s);
  $('#crewControlRoot').innerHTML=`
    <div class="crew-shell">
      <header class="crew-header">
        <div class="crew-brand"><div class="crew-brand-mark">N</div><div><strong>CREW CONTROL</strong><span>Operaciones de personal · demo · sustituido por v11.2.35</span></div></div>
        <div class="crew-header-actions"><button id="crewBack" class="light">← Área empleado</button><button id="crewControlView" class="light">◉ Control</button><button id="crewDuplicate" class="light">Duplicar</button><button id="crewCloseService" class="dark">${crewState.closed?'Reabrir':'Cerrar'}</button><button id="crewExit" class="light">Salir</button></div>
      </header>
      <div class="crew-workspace">
        <aside class="crew-sidebar">
          <div class="crew-sidebar-title"><span>Control operativo</span><button id="crewSidebarToggle" style="background:none;border:0;color:#fff">«</button></div>
          <div class="crew-filter-row" id="crewWorkFilters"><button data-work="TODO" class="active">TODO</button><button data-work="LOAD IN">LOAD IN</button><button data-work="SHOW">SHOW</button><button data-work="LOAD OUT">LOAD OUT</button></div>
          <div id="crewMetrics" class="crew-metrics"></div>
          <div class="crew-day"><b>${s.short}</b><span>${s.date}</span><b>${totalPersonnel(s)}</b></div>
          <input id="crewSearch" placeholder="Buscar persona, especialidad, equipo o crew head…">
          <select id="crewStatusFilter"><option value="ALL">Todos</option><option>NO CONTACTADO</option><option>CONTACTADO</option><option>PRESENTE</option><option>NO PRESENTADO</option><option>RESERVA</option></select>
          <button id="crewArrival" class="btn light full" style="margin-top:5px">⚡ Llegadas</button>
          <div class="crew-side-buttons"><button id="openCrewIncidents">⚠ Incidencias <i id="crewIncidentCount">${crewState.incidents.length}</i></button><button id="openCrewTeams">▦ Equipos <i>${teams.length}</i></button></div>
          <div class="crew-sync-card"><b>Personal del servicio</b><span>Demo precargada desde el Área de empleado.</span></div>
          <button id="crewSelectAllCard" class="btn light full">☑ Todo (${crewState.workers.length})</button>
          <div id="crewSelected" class="crew-selected">0 seleccionados</div>
          <div class="crew-bulk"><button id="crewSelectVisible" title="Seleccionar visibles">☑</button><button id="crewMarkPresent" title="Presente">✓</button><button id="crewMarkAbsent" title="No presentado">✕</button><button id="crewRate" title="Valorar">★</button><button id="crewEdit" title="Editar selección">⚙</button></div>
        </aside>
        <main class="crew-main">
          ${crewState.closed?'<div class="crew-closed-banner">Servicio cerrado · puedes reabrirlo desde la cabecera.</div>':''}
          <section class="crew-service-top"><div class="crew-code"><span>Servicio</span><b>${s.code}</b><button id="crewCopyCode" class="btn light">Copiar</button></div><div class="crew-service-actions"><span style="color:#d2610d;font-weight:900;font-size:10px">Guardado</span><button id="crewTopControl">◉ Control</button><button id="crewTopDuplicate">Duplicar</button><button id="crewTopClose" class="dark">${crewState.closed?'Reabrir':'Cerrar'}</button></div></section>
          <section class="crew-panel"><h3 style="margin-top:0">Datos del servicio</h3><div class="crew-data"><label>Servicio / referencia<input value="${s.name}" readonly></label><label>Fecha principal<input value="${s.date}" readonly></label><label>Recinto<input value="${s.venue}" readonly></label></div></section>
          <section class="crew-panel crew-audit"><details><summary>▶ Registro de cambios</summary><div id="crewAuditList" class="crew-audit-list"></div></details></section>
          <section class="crew-panel"><div class="crew-hidden"><span>OCULTOS</span><button data-hidden-team="RUNNER PROD LOCAL">+ RUNNER PROD LOCAL</button><button data-hidden-team="SITE">+ SITE</button><button data-hidden-team="CATERING">+ CATERING</button><button data-hidden-team="RUNNER GIRA">+ RUNNER GIRA</button></div></section>
          <div id="crewBlocks"></div>
        </main>
      </div>
    </div>`;
  renderCrewAll();bindCrewEvents();
}
function renderCrewBlocks(){
  const workers=crewFilteredWorkers(),types=crewState.blockOrder.filter(t=>crewState.workFilter==='TODO'||crewState.workFilter===t);
  $('#crewBlocks').innerHTML=types.map(type=>{
    const rows=workers.filter(w=>w.workType===type);if(!rows.length)return'';
    const present=rows.filter(w=>w.status==='PRESENTE').length,collapsed=!!crewState.collapsed[type];
    return `<section class="crew-block"><div class="crew-block-head"><span>⋮</span><strong>${type}</strong><button data-block-filter="NO CONTACTADO">No contactados</button><button data-block-filter="RESERVA">Reservas</button><button class="crew-add-worker" data-worktype="${type}">+ Añadir trabajador</button><div class="block-order"><button data-move-block="${type}" data-dir="-1">↑</button><button data-move-block="${type}" data-dir="1">↓</button></div><button data-toggle-block="${type}">${collapsed?'＋':'－'}</button><small>• ${rows.length} ✓ ${present} · Coordinador: ${crewState.service.coordinator||'Sin asignar'}</small></div>
      ${collapsed?'':`<div class="crew-block-body"><div class="crew-workers scroll-clean"><table class="crew-table"><thead><tr><th>Personal</th><th>Rol</th><th>Equipo</th><th>Horario</th><th>Pausa</th><th>Estado</th><th>Dieta</th><th>★</th><th>Incidencia</th><th>Acciones</th></tr></thead><tbody>${rows.map(w=>`<tr class="${w.selected?'selected':''}" data-worker="${w.id}"><td><button class="crew-worker-name v8-select-name" data-crew-select-name="${w.id}">${w.name}</button><br>${phoneLinkV9(w.phone)}</td><td>${w.role}${w.reserve?' <span class="mini-reserve">RESERVA</span>':''}</td><td>${w.team}</td><td>${w.start}–${w.end}<br><span class="muted">Real ${w.actualStart||w.realStart||'—'}–${w.actualEnd||w.realEnd||'—'}</span></td><td>${w.pause}</td><td>${statusSelectHtmlV8(w.id,w.status,'crew')}</td><td>${w.diet}</td><td>${ratingStarsV9('crew',w.id,avgRatingV8(w))}</td><td><span class="worker-incident">${w.incident||'—'}</span></td><td class="crew-worker-actions"><button data-edit-worker="${w.id}">Editar</button></td></tr>`).join('')}</tbody></table></div></div>`}</section>`;
  }).join('');
}
function openBulkEdit(){
  const selected=crewState.workers.filter(w=>w.selected);if(!selected.length)return toast('Crew Control','Selecciona trabajadores primero.');
  openDemoModal(`Editar selección · ${selected.length}`,`
    <div class="basic-modal-grid bulk-v8-grid">
      <label>Equipo<select id="bulkTeam"><option value="">Sin cambio</option>${[...teams,'FORKLIFTER','SIN EQUIPO'].map(t=>`<option>${t}</option>`).join('')}</select></label>
      <label>Estado<select id="bulkStatus"><option value="">Sin cambio</option>${STATUS_OPTIONS_V8.map(v=>`<option>${v}</option>`).join('')}</select></label>
      <label>Reserva<select id="bulkReserve"><option value="">Sin cambio</option><option value="1">Marcar reserva</option><option value="0">Quitar reserva</option></select></label>
      <label>Pausa<select id="bulkPause"><option value="">Sin cambio</option><option value="00:00">Sin pausa</option><option value="00:15">15 min</option><option value="00:30">30 min</option><option value="00:45">45 min</option><option value="01:00">1 hora</option><option value="01:30">1 h 30 min</option><option value="02:00">2 horas</option></select></label>
      <label>Dieta<select id="bulkDiet"><option value="">Sin cambio</option><option value="No">Sin dieta</option><option value="Sí">Con dieta</option></select></label>
      <label>Entrada real<input id="bulkActualStart" type="time"></label><label>Fin real<input id="bulkActualEnd" type="time"></label>
      <label>Horario real<select id="bulkScheduleMode"><option value="">Usar horas indicadas</option><option value="PLANNED">Usar horario previsto</option></select></label>
      <label>Bloque<select id="bulkBlock"><option value="">Sin cambio</option><option>LOAD IN</option><option>SHOW</option><option>LOAD OUT</option></select></label>
    </div>
    <div class="bulk-v8-shortcuts"><button class="btn light" id="bulkNowStart">Entrada ahora</button><button class="btn light" id="bulkNowEnd">Fin ahora</button><button class="btn light" id="bulkToRating">★ Valorar selección</button></div>
    <div class="crew-modal-actions"><button class="btn light" id="bulkCancel">Cancelar</button><button class="btn primary" id="bulkSave">Aplicar cambios</button></div>`);
  setTimeout(()=>{
    $('#bulkCancel').onclick=closeDemoModal;$('#bulkNowStart').onclick=()=>$('#bulkActualStart').value=new Date().toTimeString().slice(0,5);$('#bulkNowEnd').onclick=()=>$('#bulkActualEnd').value=new Date().toTimeString().slice(0,5);$('#bulkToRating').onclick=()=>{closeDemoModal();openBulkRate()};
    $('#bulkSave').onclick=()=>{
      const team=$('#bulkTeam').value,status=$('#bulkStatus').value,reserve=$('#bulkReserve').value,pause=$('#bulkPause').value,diet=$('#bulkDiet').value,rs=$('#bulkActualStart').value,re=$('#bulkActualEnd').value,mode=$('#bulkScheduleMode').value,block=$('#bulkBlock').value;
      selected.forEach(w=>{if(team)w.team=team;if(status)w.status=status;if(reserve!=='')w.reserve=reserve==='1';if(pause)w.pause=pause;if(diet)w.diet=diet;if(block)w.workType=block;if(mode==='PLANNED'){w.actualStart='';w.actualEnd=''}else{if(rs)w.actualStart=rs;if(re)w.actualEnd=re}});
      addAudit(`Edición masiva aplicada a ${selected.length} trabajadores`);saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Cambios masivos aplicados.');
    };
  },0);
}
function openBulkRate(){
  const selected=crewState.workers.filter(w=>w.selected);if(!selected.length)return toast('Crew Control','Selecciona trabajadores primero.');
  openDemoModal(`Valorar selección · ${selected.length}`,`<div class="basic-modal-grid"><label>Uniformidad<select id="crUniformity"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label><label>Actitud<select id="crAttitude"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label><label>Puntualidad<select id="crPunctuality"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label></div><div class="crew-modal-actions"><button class="btn light" id="crCancel">Cancelar</button><button class="btn primary" id="crApply">Aplicar valoración</button></div>`);
  setTimeout(()=>{$('#crCancel').onclick=closeDemoModal;$('#crApply').onclick=()=>{const u=$('#crUniformity').value,a=$('#crAttitude').value,p=$('#crPunctuality').value;selected.forEach(w=>{if(u)w.uniformity=Number(u);if(a)w.attitude=Number(a);if(p)w.punctuality=Number(p);w.rating=avgRatingV8(w)});addAudit(`Valoración aplicada a ${selected.length} trabajadores`);saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Valoración aplicada.')}},0);
}
function editCrewWorker(id){
  const w=crewState.workers.find(x=>x.id===id);if(!w)return;
  openDemoModal('Ficha del trabajador',`
    <div class="worker-modal-summary"><div><b>${w.name}</b><span>${w.role} · ${w.start}–${w.end}</span></div><button class="btn light" id="cmIncidentBtn">Incidencia</button></div>
    <div class="basic-modal-grid">
      <label>Nombre<input id="cmName" value="${w.name}"></label><label>Teléfono<input id="cmPhone" inputmode="tel" value="${w.phone||''}"></label><label>Rol<select id="cmRole">${['HAND A','HAND B','FORKLIFTER'].map(v=>`<option ${v===w.role?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Equipo<select id="cmTeam">${[...teams,'FORKLIFTER','SIN EQUIPO'].map(t=>`<option ${t===w.team?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>Bloque<select id="cmWorkType">${['LOAD IN','SHOW','LOAD OUT'].map(t=>`<option ${t===w.workType?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>Inicio previsto<input id="cmStart" type="time" value="${w.start}"></label><label>Fin previsto<input id="cmEnd" type="time" value="${w.end}"></label>
      <label>Entrada real<input id="cmActualStart" type="time" value="${w.actualStart||''}"></label><label>Fin real<input id="cmActualEnd" type="time" value="${w.actualEnd||''}"></label>
      <label>Pausa<select id="cmPause">${['00:00','00:15','00:30','00:45','01:00','01:30','02:00'].map(v=>`<option ${v===w.pause?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Dieta<select id="cmDiet"><option ${w.diet==='No'?'selected':''}>No</option><option ${w.diet==='Sí'?'selected':''}>Sí</option></select></label>
      <label>Estado<select id="cmStatus">${STATUS_OPTIONS_V8.map(v=>`<option ${v===w.status?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Reserva<select id="cmReserve"><option value="0" ${!w.reserve?'selected':''}>No</option><option value="1" ${w.reserve?'selected':''}>Sí</option></select></label>
      <label>Uniformidad<select id="cmUniformity">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.uniformity?'selected':''}>${n}/5</option>`).join('')}</select></label>
      <label>Actitud<select id="cmAttitude">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.attitude?'selected':''}>${n}/5</option>`).join('')}</select></label>
      <label>Puntualidad<select id="cmPunctuality">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===w.punctuality?'selected':''}>${n}/5</option>`).join('')}</select></label>
      <label class="full">Notas<textarea id="cmNotes" rows="3">${w.notes||''}</textarea></label>
    </div>
    <div class="bulk-v8-shortcuts"><button class="btn light" id="cmNowStart">Entrada ahora</button><button class="btn light" id="cmNowEnd">Fin ahora</button><button class="btn light" id="cmHistory">Historial</button><button class="btn light danger-lite" id="cmDelete">Eliminar trabajador</button></div>
    <div class="crew-modal-actions"><button class="btn light" id="cmCancel">Cancelar</button><button class="btn primary" id="cmSave">Guardar ficha</button></div>`);
  setTimeout(()=>{
    $('#cmCancel').onclick=closeDemoModal;$('#cmNowStart').onclick=()=>$('#cmActualStart').value=new Date().toTimeString().slice(0,5);$('#cmNowEnd').onclick=()=>$('#cmActualEnd').value=new Date().toTimeString().slice(0,5);
    $('#cmIncidentBtn').onclick=()=>{closeDemoModal();openCrewIncidentForm(w.id)};$('#cmHistory').onclick=()=>toast('Crew Control','Historial del trabajador disponible en la demo.');$('#cmDelete').onclick=()=>{crewState.workers=crewState.workers.filter(x=>x.id!==w.id);addAudit(`${w.name} eliminado`);saveCrewState();closeDemoModal();renderCrewAll()};
    $('#cmSave').onclick=()=>{w.name=$('#cmName').value.trim()||w.name;w.phone=$('#cmPhone')?.value.trim()||w.phone;w.role=$('#cmRole').value;w.team=$('#cmTeam').value;w.workType=$('#cmWorkType').value;w.start=$('#cmStart').value;w.end=$('#cmEnd').value;w.actualStart=$('#cmActualStart').value;w.actualEnd=$('#cmActualEnd').value;w.pause=$('#cmPause').value;w.diet=$('#cmDiet').value;w.status=$('#cmStatus').value;w.reserve=$('#cmReserve').value==='1';w.uniformity=Number($('#cmUniformity').value);w.attitude=Number($('#cmAttitude').value);w.punctuality=Number($('#cmPunctuality').value);w.rating=avgRatingV8(w);w.notes=$('#cmNotes').value.trim();addAudit(`${w.name} actualizado`);saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Trabajador actualizado.')};
  },0);
}
function bindCrewEvents(){
  $('#crewBack').onclick=()=>navigate('coordination');$('#crewExit').onclick=()=>navigate('coordination');
  $('#crewControlView').onclick=()=>toast('Crew Control','Vista Control activa.');$('#crewTopControl').onclick=()=>toast('Crew Control','Vista Control activa.');
  $('#crewDuplicate').onclick=duplicateCrewService;$('#crewTopDuplicate').onclick=duplicateCrewService;$('#crewCloseService').onclick=toggleCrewClosed;$('#crewTopClose').onclick=toggleCrewClosed;
  $('#crewCopyCode').onclick=()=>navigator.clipboard?.writeText(crewState.service.code).then(()=>toast('Crew Control','Código copiado.')).catch(()=>toast('Crew Control',`Código: ${crewState.service.code}`));
  $('#crewSidebarToggle').onclick=()=>toast('Crew Control','Panel operativo fijo en esta demo.');
  $('#crewWorkFilters').onclick=e=>{const b=e.target.closest('[data-work]');if(!b)return;crewState.workFilter=b.dataset.work;$$('#crewWorkFilters button').forEach(x=>x.classList.toggle('active',x===b));renderCrewAll()};
  $('#crewSearch').oninput=e=>{crewState.search=e.target.value;renderCrewAll()};$('#crewStatusFilter').onchange=e=>{crewState.statusFilter=e.target.value;renderCrewAll()};
  $('#crewArrival').onclick=()=>{crewState.arrival=!crewState.arrival;$('#crewArrival').classList.toggle('primary',crewState.arrival);renderCrewAll()};
  $('#crewSelectAllCard').onclick=()=>{const all=crewState.workers.every(w=>w.selected);crewState.workers.forEach(w=>w.selected=!all);renderCrewAll()};
  $('#crewSelectVisible').onclick=()=>{const visible=new Set(crewFilteredWorkers().map(w=>w.id));const all=[...visible].every(id=>crewState.workers.find(w=>w.id===id)?.selected);crewState.workers.forEach(w=>{if(visible.has(w.id))w.selected=!all});renderCrewAll()};
  $('#crewMarkPresent').onclick=()=>setSelectedStatus('PRESENTE');$('#crewMarkAbsent').onclick=()=>setSelectedStatus('NO PRESENTADO');$('#crewRate').onclick=openBulkRate;$('#crewEdit').onclick=openBulkEdit;$('#openCrewIncidents').onclick=openCrewIncidents;$('#openCrewTeams').onclick=openCrewTeams;
  $$('.crew-hidden [data-hidden-team]').forEach(b=>b.onclick=()=>toast('Crew Control',`${b.dataset.hiddenTeam} añadido a la vista de demo.`));
  $('#crewBlocks').onclick=e=>{
    const name=e.target.closest('[data-crew-select-name]');if(name){const w=crewState.workers.find(x=>x.id===name.dataset.crewSelectName);w.selected=!w.selected;renderCrewAll();return}
    const edit=e.target.closest('[data-edit-worker]');if(edit)return editCrewWorker(edit.dataset.editWorker);
    const add=e.target.closest('.crew-add-worker');if(add)return addCrewWorker(add.dataset.worktype);
    const bf=e.target.closest('[data-block-filter]');if(bf){crewState.statusFilter=bf.dataset.blockFilter;$('#crewStatusFilter').value=crewState.statusFilter;renderCrewAll();return}
    const toggle=e.target.closest('[data-toggle-block]');if(toggle){crewState.collapsed[toggle.dataset.toggleBlock]=!crewState.collapsed[toggle.dataset.toggleBlock];renderCrewBlocks();return}
    const move=e.target.closest('[data-move-block]');if(move)return moveBlock(move.dataset.moveBlock,move.dataset.dir);
    const row=e.target.closest('[data-worker]');if(row&&!e.target.closest('button,input,select,textarea')){const w=crewState.workers.find(x=>x.id===row.dataset.worker);w.selected=!w.selected;renderCrewAll();return}
  };
  $('#crewBlocks').onchange=e=>{
    const st=e.target.closest('[data-crew-status]');if(st){const w=crewState.workers.find(x=>x.id===st.dataset.crewStatus);if(w){w.status=st.value;addAudit(`${w.name} → ${st.value}`);saveCrewState();renderCrewAll()}return}
  };
}

/* Disponibilidad mensual + selección por arrastre */
let availabilityMonthCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
function monthKeyV8(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function monthDatesV8(){
  const y=availabilityMonthCursor.getFullYear(),m=availabilityMonthCursor.getMonth(),last=new Date(y,m+1,0).getDate(),out=[];
  for(let day=1;day<=last;day++)out.push(`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
  return out;
}
function availabilityDates(){return monthDatesV8()}
function renderAvailability(){
  const root=$('#availabilityDays');if(!root)return;
  const y=availabilityMonthCursor.getFullYear(),m=availabilityMonthCursor.getMonth(),first=new Date(y,m,1).getDay(),offset=(first+6)%7;
  const label=availabilityMonthCursor.toLocaleDateString('es-ES',{month:'long',year:'numeric'});
  const blanks=Array.from({length:offset},()=>'<div class="availability-blank"></div>').join('');
  const days=monthDatesV8().map(date=>{const st=availabilityForDate(date),d=new Date(date+'T12:00:00'),day=d.getDate();return `<button class="availability-day-card ${st.slots.length?'has-hours':''}" data-avail-day="${date}"><b>${day}</b><em>${st.slots.length?formatAvailRanges(st.slots):'Sin horario'}</em></button>`}).join('');
  root.innerHTML=`<div class="availability-month-head"><button class="icon-only" data-avail-month="-1">←</button><div><strong>${label}</strong><span>Arrastra sobre las horas para seleccionar varias de una vez</span></div><button class="icon-only" data-avail-month="1">→</button></div><div class="availability-weekdays">${['L','M','X','J','V','S','D'].map(x=>`<span>${x}</span>`).join('')}</div><div class="availability-calendar month-view">${blanks}${days}</div>`;
  renderAvailabilitySummary();
}
function renderAvailabilitySummary(){
  const root=$('#availabilitySummary');if(!root)return;const dates=monthDatesV8(),days=dates.filter(d=>availabilityForDate(d).slots.length).length,slots=dates.reduce((n,d)=>n+availabilityForDate(d).slots.length,0);
  root.innerHTML=`<div class="availability-summary-item"><span>Mes</span><b>${availabilityMonthCursor.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</b></div><div class="availability-summary-item"><span>Días con disponibilidad</span><b>${days}</b></div><div class="availability-summary-item"><span>Horas disponibles</span><b>${(slots*.5).toFixed(1).replace('.0','')} h</b></div><div class="availability-tip">Los horarios habituales del perfil se aplican como base. Puedes sobrescribir cualquier día.</div>`;
}
function applyAvailRangeV8(st,start,end,add=true){
  const all=allHalfHourSlots(),a=all.indexOf(start),b=all.indexOf(end);if(a<0||b<0)return;
  const lo=Math.min(a,b),hi=Math.max(a,b),set=new Set(st.slots);
  for(let i=lo;i<=hi;i++){if(add)set.add(all[i]);else set.delete(all[i])}
  st.slots=[...set].sort();
}
function openAvailabilityDay(date){
  availabilityEditDate=date;const st=availabilityForDate(date);availabilityState[date]=st;
  const label=new Date(date+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const slots=allHalfHourSlots();
  openDemoModal(`Disponibilidad · ${label}`,`
    <div class="availability-editor">
      <div class="availability-editor-actions"><button class="btn light" id="availAllDay">Todo el día</button><button class="btn light" id="availMorning">06:00–14:00</button><button class="btn light" id="availAfternoon">14:00–22:00</button><button class="btn light" id="availClearDay">Limpiar</button></div>
      <div class="availability-range-builder"><label>Desde<select id="availRangeStart">${slots.map(s=>`<option>${s}</option>`).join('')}</select></label><label>Hasta<select id="availRangeEnd">${slots.map(s=>`<option ${s==='18:00'?'selected':''}>${s}</option>`).join('')}</select></label><button class="btn dark" id="availAddRange">Añadir tramo</button><span id="availRangesText">${formatAvailRanges(st.slots)}</span></div>
      <div class="availability-drag-help">Mantén pulsado y arrastra por los bloques para seleccionar o quitar varias medias horas.</div>
      <div class="availability-hours-grid drag-grid" id="availabilityDragGrid">${slots.map(slot=>`<button type="button" class="avail-hour ${st.slots.includes(slot)?'active':''}" data-avail-slot="${slot}">${slot}</button>`).join('')}</div>
      <label class="availability-note">Nota para coordinación<textarea id="availNote" rows="2" placeholder="Ej. Disponible si me avisan con 24 h">${st.note||''}</textarea></label>
    </div>
    <div class="crew-modal-actions"><button class="btn light" id="availCancel">Cancelar</button><button class="btn primary" id="availSave">Guardar disponibilidad</button></div>`);
  setTimeout(()=>{
    const refresh=()=>refreshAvailabilityEditor(st);
    $('#availCancel').onclick=closeDemoModal;$('#availAllDay').onclick=()=>{st.slots=allHalfHourSlots();refresh()};$('#availClearDay').onclick=()=>{st.slots=[];refresh()};
    $('#availMorning').onclick=()=>{applyAvailRangeV8(st,'06:00','13:30',true);refresh()};$('#availAfternoon').onclick=()=>{applyAvailRangeV8(st,'14:00','21:30',true);refresh()};
    $('#availAddRange').onclick=()=>{applyAvailRangeV8(st,$('#availRangeStart').value,$('#availRangeEnd').value,true);refresh()};
    $('#availSave').onclick=()=>{st.note=$('#availNote').value.trim();availabilityState[date]=st;saveAvailabilityLocal();if(window.google&&google.script&&google.script.run){google.script.run.withFailureHandler(()=>{}).saveAvailability(date,st.slots.length?'POR HORAS':'NO DISPONIBLE',JSON.stringify(st))}closeDemoModal();renderAvailability();toast('Disponibilidad','Horarios guardados.')};
    const grid=$('#availabilityDragGrid');let dragging=false,mode=true;
    const applyBtn=b=>{const slot=b.dataset.availSlot;if(mode&&!st.slots.includes(slot))st.slots.push(slot);if(!mode&&st.slots.includes(slot))st.slots=st.slots.filter(x=>x!==slot);st.slots.sort();b.classList.toggle('active',mode);const t=$('#availRangesText');if(t)t.textContent=formatAvailRanges(st.slots)};
    grid.onpointerdown=e=>{const b=e.target.closest('.avail-hour');if(!b)return;e.preventDefault();dragging=true;mode=!b.classList.contains('active');applyBtn(b);grid.setPointerCapture?.(e.pointerId)};
    grid.onpointerover=e=>{if(!dragging)return;const b=e.target.closest('.avail-hour');if(b)applyBtn(b)};
    grid.onpointerup=()=>{dragging=false};grid.onpointercancel=()=>{dragging=false};
  },0);
}

/* Eventos v8 */
document.addEventListener('click',e=>{
  const name=e.target.closest('[data-basic-select-name]');if(name){const id=name.dataset.basicSelectName;if(basicCoordState.selected.has(id))basicCoordState.selected.delete(id);else basicCoordState.selected.add(id);renderBasicTeamRows();return}
  const month=e.target.closest('[data-avail-month]');if(month){availabilityMonthCursor=new Date(availabilityMonthCursor.getFullYear(),availabilityMonthCursor.getMonth()+Number(month.dataset.availMonth),1);renderAvailability();return}
});
document.addEventListener('change',e=>{
  const bs=e.target.closest('[data-basic-status]');if(bs){const w=basicCoordState.workers.find(x=>x.id===bs.dataset.basicStatus);if(w){w.status=bs.value;saveBasicCoord();renderBasicTeamRows();toast('Coordinación',`${w.name} → ${w.status}`)}return}
});



function renderBasicMetrics(){
  const root=$('#basicMetrics');if(!root)return;const rows=visibleBasicWorkers();
  const m={total:rows.length,present:rows.filter(w=>w.status==='PRESENTE').length,noContact:rows.filter(w=>w.status==='NO CONTACTADO').length,incidents:rows.reduce((n,w)=>n+basicWorkerIncidentCount(w),0)};
  root.innerHTML=`<div><b>${m.total}</b><span>Visibles</span></div><div><b>${m.present}</b><span>Presentes</span></div><div><b>${m.noContact}</b><span>No contactados</span></div><div><b>${m.incidents}</b><span>Incidencias</span></div>`;
  const c=$('#basicIncidentCount');if(c)c.textContent=allBasicIncidents().length;
}
function openBasicBulkRate(){
  const selected=basicCoordState.workers.filter(w=>basicCoordState.selected.has(w.id));if(!selected.length)return toast('Coordinación','Selecciona trabajadores primero.');
  openDemoModal(`Valorar selección · ${selected.length}`,`<div class="basic-modal-grid"><label>Uniformidad<select id="brUniformity"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label><label>Actitud<select id="brAttitude"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label><label>Puntualidad<select id="brPunctuality"><option value="">Sin cambio</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label></div><div class="crew-modal-actions"><button class="btn light" id="brCancel">Cancelar</button><button class="btn primary" id="brApply">Aplicar valoración</button></div>`);
  setTimeout(()=>{$('#brCancel').onclick=closeDemoModal;$('#brApply').onclick=()=>{const u=$('#brUniformity').value,a=$('#brAttitude').value,p=$('#brPunctuality').value;selected.forEach(w=>{if(u)w.uniformity=Number(u);if(a)w.attitude=Number(a);if(p)w.punctuality=Number(p);w.rating=avgRatingV8(w)});saveBasicCoord();closeDemoModal();renderBasicTeamRows();toast('Coordinación','Valoración aplicada.')}},0);
}
function crewIncidentCardV8(i){
  const worker=i.workerId?crewState.workers.find(w=>w.id===i.workerId):null;
  return `<div class="incident-card"><div class="incident-card-head"><b>${worker?.name||'SERVICIO'} · ${i.type||'OTRO'}</b><span class="incident-severity sev-${String(i.severity||'LEVE').toLowerCase()}">${i.severity||'LEVE'}</span></div><small>${i.time||''} · ${i.status||'ABIERTA'}</small><p>${i.description||i.text||''}</p>${i.action?`<div class="incident-action"><b>Actuación:</b> ${i.action}</div>`:''}</div>`;
}
function openCrewIncidents(){
  const list=crewState.incidents||[];
  openDemoModal('Incidencias · Crew Control',`<div class="incident-list">${list.length?list.map(crewIncidentCardV8).join(''):'<div class="empty-mini">Sin incidencias registradas.</div>'}</div><div class="crew-modal-actions"><button class="btn primary" id="crewNewIncident">+ Registrar incidencia</button></div>`);
  setTimeout(()=>{$('#crewNewIncident').onclick=()=>openCrewIncidentForm()},0);
}
function openCrewIncidentForm(workerId=''){
  openDemoModal('Reportar incidencia',`<div class="basic-modal-grid"><label>Ámbito<select id="ciWorker"><option value="">SERVICIO / GENERAL</option>${crewState.workers.map(w=>`<option value="${w.id}" ${workerId===w.id?'selected':''}>${w.name}</option>`).join('')}</select></label><label>Tipo<select id="ciType">${['RETRASO','UNIFORMIDAD','ACTITUD','SEGURIDAD','AUSENCIA','DAÑOS','CAMBIO CATEGORIA','OTRO'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Gravedad<select id="ciSeverity"><option>LEVE</option><option>MEDIA</option><option>GRAVE</option></select></label><label>Estado<select id="ciStatus"><option>ABIERTA</option><option>RESUELTA</option></select></label><label class="full">Descripción<textarea id="ciDescription" rows="4" placeholder="Qué ha ocurrido…"></textarea></label><label class="full">Medida / actuación<textarea id="ciAction" rows="3" placeholder="Advertencia, sustitución, comunicación…"></textarea></label></div><div class="crew-modal-actions"><button class="btn light" id="ciCancel">Cancelar</button><button class="btn primary" id="ciSave">Guardar incidencia</button></div>`);
  setTimeout(()=>{$('#ciCancel').onclick=closeDemoModal;$('#ciSave').onclick=()=>{const desc=$('#ciDescription').value.trim();if(!desc)return;const inc={id:`ci-${Date.now()}`,workerId:$('#ciWorker').value,type:$('#ciType').value,severity:$('#ciSeverity').value,status:$('#ciStatus').value,time:new Date().toLocaleString('es-ES'),description:desc,action:$('#ciAction').value.trim()};crewState.incidents.unshift(inc);if(inc.workerId){const w=crewState.workers.find(x=>x.id===inc.workerId);if(w)w.incident=inc.type}addAudit(`Incidencia ${inc.type}: ${desc}`);saveCrewState();closeDemoModal();renderCrewAll();toast('Crew Control','Incidencia registrada.')}},0);
}

/* Notificaciones globales v8: en v7 quedaron anidadas dentro de bind() */
function notificationItems(){
  const next=getUpcomingService();
  const items=[
    {icon:'◉',title:'Nuevo servicio asignado',text:`${next.name} · ${next.date}`,action:()=>openService(next.id)},
    {icon:'▤',title:'Documentación pendiente',text:'Tienes 2 documentos pendientes de revisión.',action:()=>navigate('documents')}
  ];
  if(!trainingState.completed)items.splice(1,0,{icon:'◇',title:'Formación pendiente',text:`${trainingCourse.title} · antes del 15/11`,action:()=>navigate('training')});
  return items;
}
function renderNotifications(){
  const list=$('#notificationsList');if(!list)return;
  const items=notificationItems();
  list.innerHTML=items.map((n,i)=>`<button class="notification-item" data-notification-index="${i}"><span>${n.icon}</span><div><b>${n.title}</b><small>${n.text}</small></div></button>`).join('');
  const badge=$('#notificationsBtn i');if(badge)badge.style.display=items.length?'block':'none';
}
function toggleNotifications(force){
  const d=$('#notificationsDropdown');if(!d)return;
  const show=force===undefined?d.classList.contains('hidden'):force;
  d.classList.toggle('hidden',!show);if(show)renderNotifications();
}

/* Login siempre primero y carga secundaria no bloqueante */
function initV8(){
  try{
    document.body.classList.remove('crew-mode');
    $('#appView')?.classList.add('hidden');
    $('#loginView')?.classList.remove('hidden');
    localStorage.removeItem('nova-employee-auth');
    renderHomeServices();renderServices();renderCoordination();renderDocs();renderContracts();renderTraining();renderNotifications();renderPayrollMonths();renderClockService();
    updateHomeNextService();updateCountdown();setInterval(updateCountdown,1000);bind();renderAvailability();
  }catch(err){
    console.error('Error de inicialización v8',err);
    $('#appView')?.classList.add('hidden');$('#loginView')?.classList.remove('hidden');
    const box=$('#loginError');if(box){box.textContent='Error de inicialización. Recarga la página.';box.classList.add('show');}
  }
}


/* ================= V9 · incidencias ≠ valoraciones, teléfono, permisos ================= */
function escV9(t){return String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function demoPhoneV9(id){let hash=0;for(const c of String(id||'x'))hash=(hash*31+c.charCodeAt(0))>>>0;return '6'+String((hash%90000000)+10000000);}
function phoneLinkV9(raw){const clean=String(raw||'').replace(/[^\d+]/g,'');if(!clean)return '<span class="muted">Sin teléfono</span>';return `<a class="phone-link" href="tel:${clean}" title="Llamar al ${escV9(raw)}" aria-label="Llamar al ${escV9(raw)}">${escV9(raw)}</a>`;}
function isOwnCoordinatorV9(s){
  const myName=String(portalProfile?.name||EMPLOYEE.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const contactName=String(s.coordinator||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  return !!(s.coordinatorUserId && s.coordinatorUserId===(window.novaActiveAccount||'demo')); 
}
function coordinatorContactV9(s){if(isOwnCoordinatorV9(s)||!s.coordinator)return '';return `<div class="coordinator-contact"><span>Coordinador:</span> <strong>${escV9(s.coordinator)}</strong> <span class="contact-separator">·</span> ${phoneLinkV9(s.coordinatorPhone)}</div>`;}
function coordinatorDetailV9(s){if(isOwnCoordinatorV9(s)||!s.coordinator)return '';return `<span>Coordinador</span><b>${escV9(s.coordinator)}</b><span>Teléfono</span><b>${phoneLinkV9(s.coordinatorPhone)}</b>`;}
function syncCoordPermissionsV9(){
  const count=assignedServices().filter(s=>s.assignedCoordinator||s.privilege==='crew').length;
  const nav=$('#coordinationNavButton');if(nav){nav.hidden=count===0;nav.style.display=count?'':'none';}
  const badge=$('#coordinationNavCount');if(badge)badge.textContent=String(count);
  const home=$('#homeCoordCounter');if(home)home.style.display=count?'':'none';
  const total=$('#homeCoordCounterValue');if(total)total.textContent=String(count);
  if(count===0 && ['coordination','worker-coordination','crew-control'].some(k=>$('#'+pageIds[k])?.classList.contains('active')))navigate('home');
  return count;
}
function ratingStarsV9(kind,id,val){const n=Math.min(5,Math.max(0,Math.round(Number(val)||0)));
  return `<div class="rating-stars-v9" role="group" aria-label="Puntuación de 1 a 5 estrellas">${[1,2,3,4,5].map(x=>`<button type="button" data-rate-v9="${x}" data-rate-kind="${kind}" data-rate-id="${escV9(id)}" class="rating-star-v9 ${x<=n?'on':''}" aria-label="Puntuar ${x} de 5" title="Puntuar ${x}/5">${x<=n?'★':'☆'}</button>`).join('')}</div>`;
}
function applyWorkerRatingV9(kind,id,stars){const data=kind==='basic'?basicCoordState.workers:crewState.workers;const w=data.find(x=>x.id===id);if(!w)return;
  w.rating=stars;w.uniformity=stars;w.attitude=stars;w.punctuality=stars;
  if(kind==='basic'){saveBasicCoord();renderBasicTeamRows();}else{addAudit(`Valoración ${stars}/5: ${w.name}`);saveCrewState();renderCrewAll();}
  toast('Valoración guardada',`${w.name}: ${stars} de 5 estrellas`);
}
/* Dentro de fichas de edición, las estrellas controlan los selectores de valoración existentes. */
function upgradeRatingPickersV9(){
  const ids=['bmUniformity','bmAttitude','bmPunctuality','cmUniformity','cmAttitude','cmPunctuality','brUniformity','brAttitude','brPunctuality','crUniformity','crAttitude','crPunctuality','bbUniformity','bbAttitude','bbPunctuality','bulkUniformity','bulkAttitude','bulkPunctuality'];
  ids.forEach(id=>{const select=document.getElementById(id);if(!select||select.dataset.starsUpgraded)return;select.dataset.starsUpgraded='true';
    const picker=document.createElement('div');picker.className='rating-picker-v9';picker.setAttribute('role','group');picker.setAttribute('aria-label',select.parentElement?.innerText?.trim()||'Valoración');
    const refresh=()=>{picker.querySelectorAll('button').forEach(b=>{const on=Number(b.dataset.star)<=Number(select.value||0);b.textContent=on?'★':'☆';b.classList.toggle('on',on);});};
    for(let i=1;i<=5;i++){const b=document.createElement('button');b.type='button';b.dataset.star=String(i);b.className='rating-star-v9';b.setAttribute('aria-label',i+' estrellas');b.title=i+' estrellas';b.onclick=()=>{select.value=String(i);select.dispatchEvent(new Event('change',{bubbles:true}));refresh()};picker.append(b);}
    select.insertAdjacentElement('afterend',picker);select.classList.add('rating-select-v9');refresh();
  });
}
/* Incidencias de Crew Control: gestión separada, sin puntuaciones. */
const INCIDENT_TYPES_V9=['RETRASO','UNIFORMIDAD','ACTITUD','SEGURIDAD','AUSENCIA','DAÑOS','CAMBIO CATEGORIA','OTRO'];
function incidentPrettyDateV9(raw){
  if(!raw)return 'Ahora';
  const date=new Date(raw);return Number.isFinite(date.getTime())?date.toLocaleString('es-ES'):escV9(raw);
}
function incidentCardActionsV9(kind,i,owner){
  const id=escV9(i.id),worker=escV9(owner||'SERVICIO');
  return `<div class="incident-card incident-v9-card"><div class="incident-card-head"><b>${worker} · ${escV9(i.type||'OTRO')}</b><span class="incident-severity sev-${escV9(String(i.severity||'LEVE').toLowerCase())}">${escV9(i.severity||'LEVE')}</span></div><small>${incidentPrettyDateV9(i.time)} · ${escV9(i.status||'ABIERTA')}</small><p>${escV9(i.description||i.text||'')}</p>${i.action?`<div class="incident-action"><b>Actuación:</b> ${escV9(i.action)}</div>`:''}${i.type==='CAMBIO CATEGORIA'&&i.newCategory?`<div class="incident-action"><b>Cambio:</b> ${escV9(i.oldCategory||'—')} → ${escV9(i.newCategory)}</div>`:''}<div class="incident-v9-actions"><button type="button" class="btn light" data-inc-v9-edit="${kind}:${id}">Editar</button><button type="button" class="btn light" data-inc-v9-resolve="${kind}:${id}">${i.status==='RESUELTA'?'Reabrir':'Resolver'}</button><button type="button" class="btn light" data-inc-v9-delete="${kind}:${id}">Eliminar</button></div></div>`;
}
basicIncidentCard=function(i){return incidentCardActionsV9('basic',i,i.workerName||'SERVICIO')};
crewIncidentCardV8=function(i){const w=i.workerId?crewState.workers.find(w=>w.id===i.workerId):null;return incidentCardActionsV9('crew',i,w?.name||'SERVICIO')};
function findIncidentV9(kind,id){
  if(kind==='crew'){const idx=crewState.incidents.findIndex(i=>String(i.id)===id);return idx<0?null:{list:crewState.incidents,index:idx,incident:crewState.incidents[idx]};}
  for(const w of basicCoordState.workers){const idx=(w.incidents||[]).findIndex(i=>String(i.id)===id);if(idx>=0)return {list:w.incidents,index:idx,incident:w.incidents[idx],owner:w};}
  const list=basicCoordState.generalIncidents||[];const idx=list.findIndex(i=>String(i.id)===id);return idx<0?null:{list,index:idx,incident:list[idx]};
}
function saveIncidentUpdatesV9(kind,description){
  if(kind==='crew') {addAudit(description);saveCrewState();renderCrewAll();} else {saveBasicCoord();renderBasicTeamRows();}
}
function openIncidentFormV9(kind,workerId='',editId=''){
  const crew=kind==='crew',workers=crew?crewState.workers:basicCoordState.workers;
  const found=editId?findIncidentV9(kind,editId):null;
  const old=found?.incident||{};
  const scopeWorker=old.workerId||found?.owner?.id||workerId||'';
  const label=editId?'Editar incidencia':'Reportar incidencia';
  openDemoModal(label,`<div class="incident-form-help-v9">Puede ser general del servicio o vinculada a una persona. Las puntuaciones de 1 a 5 estrellas se gestionan en <b>Valoración</b>, no aquí.</div><div class="basic-modal-grid">
    <label>Ámbito<select id="viScope"><option value="GENERAL" ${!scopeWorker?'selected':''}>General del servicio</option><option value="WORKER" ${scopeWorker?'selected':''}>Trabajador</option></select></label>
    <label id="viWorkerWrap">Trabajador<select id="viWorker"><option value="">Selecciona trabajador</option>${workers.map(w=>`<option value="${escV9(w.id)}" ${scopeWorker===w.id?'selected':''}>${escV9(w.name)}</option>`).join('')}</select></label>
    ${crew?`<label id="viServiceTypeWrap">Tipo de servicio<select id="viServiceType">${['LOAD IN','SHOW','LOAD OUT'].map(t=>`<option ${old.workType===t?'selected':''}>${t}</option>`).join('')}</select></label>`:''}
    <label>Tipo de incidencia<select id="viType">${INCIDENT_TYPES_V9.map(t=>`<option ${old.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
    <label>Gravedad<select id="viSeverity">${['LEVE','MEDIA','GRAVE'].map(t=>`<option ${old.severity===t?'selected':''}>${t}</option>`).join('')}</select></label>
    <label>Estado<select id="viStatus">${['ABIERTA','RESUELTA'].map(t=>`<option ${old.status===t?'selected':''}>${t}</option>`).join('')}</select></label>
    <label id="viOldCategoryWrap">Categoría actual<input id="viOldCategory" value="${escV9(old.oldCategory||'')}" readonly></label>
    <label id="viNewCategoryWrap">Nueva categoría<select id="viNewCategory"><option value="">Selecciona</option>${['HAND A','HAND B','FORKLIFTER','CREW HEAD'].map(t=>`<option ${old.newCategory===t?'selected':''}>${t}</option>`).join('')}</select></label>
    <label class="full">Descripción<textarea id="viDescription" rows="4" placeholder="Qué ha ocurrido, hora y circunstancias">${escV9(old.description||'')}</textarea></label>
    <label class="full">Medida / actuación<textarea id="viAction" rows="3" placeholder="Advertencia, sustitución, seguimiento...">${escV9(old.action||'')}</textarea></label>
    </div><div class="crew-modal-actions"><button type="button" class="btn light" id="viCancel">Cancelar</button><button type="button" class="btn primary" id="viSave">${editId?'Guardar cambios':'Guardar incidencia'}</button></div>`);
  const w=$('#viWorker'),scope=$('#viScope'),type=$('#viType');
  const refresh=()=>{
    $('#viWorkerWrap').style.display=scope.value==='WORKER'?'':'none';
    if($('#viServiceTypeWrap'))$('#viServiceTypeWrap').style.display=scope.value==='GENERAL'?'':'none';
    const category=type.value==='CAMBIO CATEGORIA';
    $('#viOldCategoryWrap').style.display=category?'':'none';$('#viNewCategoryWrap').style.display=category?'':'none';
    $('#viOldCategory').value=workers.find(p=>p.id===w.value)?.role||'';
  };
  scope.onchange=refresh;w.onchange=refresh;type.onchange=refresh;refresh();
  $('#viCancel').onclick=closeDemoModal;
  $('#viSave').onclick=()=>{
    const desc=$('#viDescription').value.trim();
    if(!desc)return toast('Incidencia','Introduce una descripción.');
    const workerId=scope.value==='WORKER'?w.value:'';
    if(scope.value==='WORKER'&&!workerId)return toast('Incidencia','Selecciona un trabajador.');
    const newCategory=type.value==='CAMBIO CATEGORIA'?$('#viNewCategory').value:'';
    if(type.value==='CAMBIO CATEGORIA'&&(!workerId||!newCategory))return toast('Incidencia','El cambio de categoría requiere trabajador y nueva categoría.');
    const record={id:old.id||`inc-${Date.now()}-${Math.floor(Math.random()*1000)}`,workerId,type:type.value,severity:$('#viSeverity').value,status:$('#viStatus').value,time:old.time||new Date().toISOString(),description:desc,action:$('#viAction').value.trim(),oldCategory:$('#viOldCategory').value,newCategory,workType:$('#viServiceType')?.value||''};
    if(found)found.list.splice(found.index,1);
    if(crew){crewState.incidents.unshift(record);if(workerId){const person=workers.find(p=>p.id===workerId);if(person){person.incident=record.type;if(newCategory)person.role=newCategory;}}}
    else if(workerId){const person=workers.find(p=>p.id===workerId);person.incidents=person.incidents||[];person.incidents.unshift(record);if(newCategory)person.role=newCategory;}
    else{basicCoordState.generalIncidents=basicCoordState.generalIncidents||[];basicCoordState.generalIncidents.unshift(record);}
    saveIncidentUpdatesV9(kind,`${editId?'Actualizada':'Registrada'} incidencia ${record.type}`);
    closeDemoModal();toast('Incidencia',editId?'Incidencia actualizada.':'Incidencia registrada.');
  };
}
openBasicIncidentForm=function(workerId=''){openIncidentFormV9('basic',workerId)};
openCrewIncidentForm=function(workerId=''){openIncidentFormV9('crew',workerId)};
document.addEventListener('click',e=>{
  const action=e.target.closest('[data-inc-v9-edit],[data-inc-v9-resolve],[data-inc-v9-delete]');if(!action)return;
  const value=action.dataset.incV9Edit||action.dataset.incV9Resolve||action.dataset.incV9Delete;
  const pos=value.indexOf(':');const kind=value.slice(0,pos),id=value.slice(pos+1),found=findIncidentV9(kind,id);if(!found)return;
  if(action.hasAttribute('data-inc-v9-edit')){return openIncidentFormV9(kind,found.incident.workerId||found.owner?.id||'',id);}
  if(action.hasAttribute('data-inc-v9-delete')){found.list.splice(found.index,1);saveIncidentUpdatesV9(kind,'Incidencia eliminada');closeDemoModal();return toast('Incidencia','Incidencia eliminada.');}
  found.incident.status=found.incident.status==='RESUELTA'?'ABIERTA':'RESUELTA';saveIncidentUpdatesV9(kind,'Estado incidencia actualizado');
  closeDemoModal();toast('Incidencia',`Estado: ${found.incident.status}`);
});

const _openDemoModalV9=openDemoModal;
openDemoModal=function(...args){_openDemoModalV9(...args);upgradeRatingPickersV9();};
/* En la v9 las incidencias mantienen el esquema original: ámbito, tipo, gravedad,
   descripción, actuación y estado. Nunca se asignan estrellas a una incidencia. */
document.addEventListener('click',e=>{
  const star=e.target.closest('[data-rate-v9]');if(star){e.stopPropagation();e.preventDefault();return applyWorkerRatingV9(star.dataset.rateKind,star.dataset.rateId,Number(star.dataset.rateV9));}
  // No seleccionar una fila cuando se pulsa un teléfono.
  if(e.target.closest('a[href^="tel:"]')) e.stopPropagation();
},true);
/* El enlace de teléfono se abre sin seleccionarlo ni editar la ficha. */
const _initV8V9=initV8;
initV8=function(){_initV8V9();syncCoordPermissionsV9();};

initV8();
