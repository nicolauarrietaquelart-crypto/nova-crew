// Penny Wise Barcelona 2026 · gross worker amounts transcribed from supplied tariff PDF.
// New organization-specific categories have no assumed rate until configured.
export const STANDARD_TARIFFS = [
 ['hand-montador','Hand / Montador/a','Montaje','hour',4,9.30],
 ['aux-instalador-basico','Auxiliar Instalador Básico / Utillero','Montaje','hour',4,10.00],
 ['aux-instalador-superior','Auxiliar Instalador Superior','Montaje','hour',4,11.40],
 ['steelhand','Steelhand','Montaje','hour',5,10.00],
 ['climber','Climber','Montaje','hour',5,11.40],
 ['scaffolder','Scaffolder','Montaje','hour',5,14.40],
 ['operador-carretilla','Operador/a Carretilla Elevadora','Montaje','hour',5,10.80],
 ['operador-plataformas','Operador/a Plataformas Elevadoras','Montaje','hour',5,11.40],
 ['coordinador-personal','Coordinador/a de Personal','Montaje','hour',6,14.40],
 ['asistente-carpinteria','Asistente Carpintería','Técnico','hour',5,11.40],
 ['maquinista-teatro','Maquinista de Teatro','Técnico','hour',5,11.40],
 ['aux-audiovisual','Auxiliar de Sonido, Iluminación, Vídeo y Regidor','Técnico','hour',4,11.40],
 ['canones-suelo','Operador/a Cañones de Seguimiento en Suelo','Técnico','hour',4,10.80],
 ['canones-plataforma','Operador/a Cañones de Seguimiento en Plataforma','Técnico','hour',4,11.40],
 ['tecnico-audiovisual','Técnico/a de Sonido, Iluminación y Vídeo','Técnico','day',1,270.00],
 ['aux-produccion','Auxiliar de Producción','Producción','hour',4,14.40],
 ['asistente-vestuario','Asistente/a de Vestuario','Producción','hour',4,10.10],
 ['asistente-peluqueria','Asistente/a de Peluquería/Maquillaje','Producción','hour',4,null],
 ['planchador-costurero','Planchador/a y Costurero/a','Producción','hour',4,11.40],
 ['regidor-escenario','Regidor/a Escenario','Producción','day',1,270.00],
 ['stage-manager','Stage Manager','Producción','day',1,270.00],
 ['secretario-produccion','Secretario/a Producción','Producción','day',1,230.00],
 ['acompanante-asistente','Acompañante y Asistente/a','Producción','day',1,230.00],
 ['traductor','Traductor/a','Producción','day',1,230.00],
 ['aux-mantenimiento','Auxiliar Mantenimiento Instalación','Logística','hour',5,10.10],
 ['asistente-informacion','Asistente/a Información','Atención al público','hour',4,9.30],
 ['consigna','Consigna / Guardarropa','Atención al público','hour',4,9.30],
 ['taquillero','Taquillero/a','Atención al público','hour',4,11.40],
 ['acomodador','Acomodador/a','Atención al público','hour',4,9.30],
 ['coordinador-acomodadores','Coordinador/a Acomodadores','Atención al público','hour',6,14.40],
 ['aux-catering','Auxiliar de Catering','Hostelería','hour',4,9.30],
 ['runner-sin-vehiculo','Runner Sin Vehículo','Transportes','hour',4,11.40],
 ['combi-350kg','Combi de Carga 350 Kg','Vehículos','day',1,44.55],
 ['furgoneta-1000kg','Furgoneta de Carga 1000 Kg','Vehículos','day',1,66.75],
 ['furgoneta-9plazas','Furgoneta Pasajeros 9 Plazas','Vehículos','day',1,88.95],
 // Operational labels requested by the manager: distinct pay mapping to be confirmed.
 ['HAND B','HAND B','Operativo','hour',5,null],
 ['HAND C1','HAND C1','Operativo','hour',0,null],
 ['HAND A','HAND A','Operativo','hour',3,null],
 ['HAND M','HAND M','Operativo','hour',4,null],
 ['CREW HEAD','CREW HEAD · Coordinador de Personal','Operativo','hour',6,14.40],
 ['FORKLIFTER','FORKLIFTER · Operador/a Carretilla','Operativo','hour',5,10.80]
].map(([id,name,group,unit,minHours,workerRate])=>({
 id,name,group,schedule:'Tarifa estándar 2026',unit,minHours,workerRate,clientRate:workerRate==null?null:Math.round(workerRate*200)/100,active:true,
 source:group==='Operativo'?'operational':'PW-BCN-2026'
}));
export const STANDARD_EXCEPTIONS = [
 {id:'palau-musica',categoryId:'hand-montador',venueContains:'palau de la musica',minHours:3,description:'Hand/Montador/a · Palau de la Música'},
 {id:'bikini',categoryId:'hand-montador',venueContains:'bikini',minHours:3,description:'Hand/Montador/a · Bikini'},
 {id:'apolo',categoryId:'hand-montador',venueContains:'apolo',minHours:3,description:'Hand/Montador/a · Apolo'},
 {id:'razzmatazz2',categoryId:'hand-montador',venueContains:'razzmatazz 2',minHours:3,description:'Hand/Montador/a · Razzmatazz 2'},
 {id:'razzmatazz3',categoryId:'hand-montador',venueContains:'razzmatazz 3',minHours:3,description:'Hand/Montador/a · Razzmatazz 3'}
];
// Two 3-hour Hand/Montador/a services in the same workday may have a 3-hour minimum each.
// This contextual exception is intentionally NOT applied automatically before verifying both services.
