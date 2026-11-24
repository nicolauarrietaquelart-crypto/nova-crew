/* v54 · Ficha del trabajador (área de empleado y gestoría). Mismo esquema en ambas apps. */
(function(){
const NAT=['ESPAÑA','ARGENTINA','BOLIVIA','BRASIL','CHILE','COLOMBIA','CUBA','ECUADOR','FRANCIA','ITALIA','MARRUECOS','MÉXICO','PARAGUAY','PERÚ','PORTUGAL','REINO UNIDO','RUMANÍA','UCRANIA','URUGUAY','VENEZUELA','OTRA'];
const LANGS=['Castellano','Catalán','Inglés','Francés','Alemán','Italiano','Portugués','Árabe','Rumano','Ruso','Chino','Euskera','Gallego','Otro'];
window.NOVA_PROFILE={
 steps:[
  {key:'personal',label:'Datos personales',groups:[
   [['firstName','Nombre',{req:1,lock:1}],['lastName1','1º Apellido',{req:1,lock:1}],['lastName2','2º Apellido',{lock:1}]],
   [['docId','DNI / NIE',{req:1,lock:1}],['nationality','Nacionalidad',{req:1,opts:NAT}]],
   [['sex','Sexo',{req:1,opts:['Hombre','Mujer','Otro','Prefiero no indicarlo']}],['birthDate','Fecha de nacimiento',{type:'date',lock:1}]],
   [['disability','Grado de discapacidad (si tienes)',{type:'number',min:0,max:100,ph:'0'}]],
   '—',
   [['streetType','Tipo vía',{req:1,opts:['CALLE','AVENIDA','PASEO','PLAZA','RAMBLA','RONDA','TRAVESÍA','CARRETERA','CAMINO','PASAJE','OTRO']}],['streetName','Nombre vía',{req:1,wide:1,hint:'En mayúsculas y minúsculas, por ejemplo: Núñez de Arce'}]],
   [['number','Número',{sm:1}],['stair','Escalera',{sm:1}],['floor','Piso',{sm:1}],['door','Puerta',{sm:1}],['district','Barrio']],
   [['postalCode','CP',{req:1,sm:1}],['city','Población',{req:1}],['province','Provincia',{req:1}],['country','País',{req:1,opts:NAT.filter(x=>x!=='OTRA').concat(['OTRO'])}]],
   '—',
   [['phone2','Teléfono'],['mobile','Móvil',{req:1,type:'tel'}],['email','Email',{type:'email',req:1}]],
   [['ssn','Nº Seguridad Social',{req:1,lock:1}]]
  ]},
  {key:'perfil',label:'Datos perfil',groups:[
   [['unemployment','¿Estás cobrando una prestación de desempleo?',{type:'check',on:'Sí'}]],
   [['availabilityKind','Disponibilidad',{req:1,type:'multi',opts:['Total','Fin de semana','Mañanas','Tardes','Noches']}]],
   [['shirtSize','Talla camiseta',{req:1,opts:['XS','S','M','L','XL','XXL','XXXL']}],['pantsSize','Talla pantalón',{req:1,opts:['34','36','38','40','42','44','46','48','50','52','54','56']}],['shoeSize','Talla calzado',{req:1,opts:Array.from({length:14},(_,i)=>String(35+i))}]],
   [['education','Nivel formativo',{req:1,wide:1,opts:['Sin estudios','Educación primaria','ESO / Graduado escolar','Bachillerato','FP Grado Medio','FP Grado Superior','Grado universitario','Máster / Postgrado','Doctorado']}]],
   [['drivingLicense','¿Dispones de permiso de conducir?',{type:'radio',opts:['Sí','No']}]],
   [['licenses','Permisos de conducir',{type:'multi',opts:['AM','A1','A2','A','B','BTP','C1','C','D1','D','E']}]],
   '—',
   [['vehicles','Vehículos (introduce tantos como dispongas)',{type:'rows',add:'Añadir otro vehículo',cols:[['type','Tipo de vehículo',{opts:['Coche','Furgoneta','Moto','Camión','Otro']}],['seats','Plazas',{type:'number',sm:1}],['model','Marca-modelo'],['plate','Matrícula',{ph:'0000 AAA'}]]}]]
  ]},
  {key:'skills',label:'Idiomas y conocimientos',groups:[
   [['langLevels','Idiomas (introduce tantos como conozcas y el nivel)',{type:'rows',add:'Añadir otro idioma',cols:[['lang','Idioma',{opts:LANGS}],['level','Nivel',{opts:['Básico','Medio','Alto','Nativo']}]]}]],
   '—',
   [['skillsTech','Conocimientos técnicos del espectáculo',{type:'tags',ph:'Ej.: rigging, sonido, iluminación, carretilla…'}]],
   [['skillsPro','Conocimientos profesionales',{type:'tags',ph:'Ej.: electricista, carpintería, soldadura…'}]],
   [['skillsGeneral','Conocimientos generales',{type:'tags',ph:'Ej.: atención al público, PRL 20 h…'}]]
  ]},
  {key:'photo',label:'Fotografía',groups:[]}
 ],
 fields(){const out=[];for(const s of this.steps)for(const g of s.groups)if(Array.isArray(g))for(const f of g)out.push(f);return out;},
 /* compatibilidad con perfiles anteriores */
 normalize(p){p={...(p||{})};if(!p.langLevels&&Array.isArray(p.languages))p.langLevels=p.languages.map(l=>({lang:l,level:''}));if(!p.skillsGeneral&&Array.isArray(p.skills))p.skillsGeneral=p.skills;if(Array.isArray(p.education))p.education=p.education.join(', ');return p;},
 completion(p){p=this.normalize(p);const req=this.fields().filter(f=>f[2]?.req);const ok=req.filter(f=>{const v=p[f[0]];return Array.isArray(v)?v.length:v!=null&&String(v).trim()!==''});return {done:ok.length,total:req.length,pct:Math.round(ok.length/req.length*100)};}
};
})();
