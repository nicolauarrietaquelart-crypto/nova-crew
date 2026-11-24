# NOVA Crew · Operaciones y personal

## Novedades v52 · Geolocalización y coordinaciones

- **Fichar por geolocalización** solo aparece (y solo lo acepta el servidor) si eres el **coordinador de tu bloque** o si **tu bloque no tiene coordinador**, aunque haya Crew Head ese día. Si tu turno tiene coordinador, fichas mostrándole tu QR.
- **Coordinación**: un turno que acaba de madrugada ya no crea una segunda coordinación al día siguiente; y solo aparecen coordinaciones de servicios en los que estás asignado (se ignoran coordinadores antiguos a nivel de servicio).

## Novedades v51 · Documentos profesionales y presupuestos por mes

- **Presupuestos y facturas** con formato de documento profesional: cabecera con datos fiscales de la empresa, número y referencia, fecha y validez/vencimiento, bloques de cliente y servicio, tabla de conceptos, totales con IVA, condiciones y forma de pago (IBAN), firma de aceptación en presupuestos y pie legal. Se imprime en A4.
- **Presupuestos**: pestañas Todos / Borradores / Enviados / Aceptados / Rechazados, agrupados en **contenedores por mes y año** con número de presupuestos e importe.
- **Eliminar presupuesto** con el botón de papelera (pide confirmación; no se puede si ya está facturado).

## Novedades v50 · Versión móvil

- **Gestor en móvil**: indicadores del inicio compactos en 2 columnas, fases del servicio en cuadrícula sin cortes, «Hoy» y guardia ordenados, accesos rápidos en 2 columnas, pestañas deslizables, **tablas convertidas en tarjetas** con su etiqueta en cada dato, calendario mensual que cabe en pantalla, ventanas a pantalla completa con botones fijos abajo y campos de 16 px (sin zoom al escribir).
- **Trabajador en móvil**: barra superior más limpia, botones del turno en cuadrícula, calendario de disponibilidad más legible y espacio para la barra inferior.

## Novedades v49 · Categorías ordenadas

- En la ficha del trabajador, cada grupo de categorías ocupa todo el ancho, con las categorías en orden alfabético y en columnas iguales.
- La disponibilidad habitual solo aparece en su pestaña (ya no se repite en Resumen).

## Novedades v48 · Ficha del trabajador por pestañas

- La ficha del trabajador (gestión) se organiza en **subpáginas**: Resumen, Datos, Categorías, Disponibilidad, Valoración y control, Contratos, Turnos y Documentos.
- **Categorías** ordenadas en tarjetas por grupo, con interruptores, recuento por grupo y botones «Todas / Ninguna».
- Disponibilidad habitual del empleado: el tramo se marca al instante al pulsarlo y, si el servidor no lo guarda, avisa y vuelve al estado real.

## Novedades v47 · Noches y disponibilidad habitual

- La disponibilidad habitual tiene tres tramos: **mañana 08–16 h**, **tarde 16–24 h** y **noche 00–08 h** (madrugada de ese día).
- Solo la marca el propio trabajador desde su área; en gestión se consulta en su ficha pero **no se puede modificar**.
- En las reservas de vehículos de un runner ya no se repite «Conductor» debajo: su nombre sale en la reserva.

## Novedades v46 · Vehículo obligatorio para runners

- Todos los runners (también «Runner sin vehículo», que significa sin vehículo propio) deben llevar vehículo asignado: una furgoneta de la empresa o «Otro · vehículo externo». No se puede asignar ni guardar en «Gestionar» sin elegirlo.

## Novedades v45 · Vehículo del runner

- Al asignar un **runner** (o conductor) se elige su vehículo: una furgoneta de la empresa (se ve si está libre u ocupada a esa hora), **Otro · vehículo externo** o sin vehículo. También se cambia desde «Gestionar».
- Si es una furgoneta propia queda **reservada automáticamente** en Vehículos a nombre del runner, con el servicio y el horario del turno; si cambia el horario, la reserva se mueve, y si se retira el runner o se cambia a externo, la furgo se libera. No deja usar la misma furgo para dos turnos solapados.
- El calendario de vehículos muestra el **nombre del runner** en cada reserva.
- Al reservar desde el calendario de vehículos, solo salen los **servicios de ese día**.

## Novedades v44 · Referencias, históricos y vehículos

- **Referencia N/AAAA** para presupuestos y servicios (1/2026, 2/2026…), con una única numeración por año. El servicio creado desde un presupuesto conserva su número. Los registros existentes se numeran automáticamente por orden de creación.
- **Trabajadores → Históricos**: quien ya no está en la empresa (dado de baja o sin acceso a la app) sale de la plantilla activa y se consulta en la pestaña «Históricos».
- **Vehículos** (nueva página): alta de furgonetas y vehículos con matrícula; calendario mensual por vehículo con los días **ocupados en rojo** y sus horas; al pulsar un día se ven sus reservas y se puede **reservar** por horas para un servicio o para «otro» motivo, con conductor y notas. No permite dos reservas solapadas del mismo vehículo. «Buscar por día» muestra qué vehículos están libres u ocupados ese día.

## Novedades v43 · Información por tipo de servicio

- **Editar servicio** queda en lo esencial: cliente, nombre, recinto principal, día de inicio, día de fin (sin horas) y tarifa.
- Cada **tipo de servicio** (LOAD IN, SHOW CALL…) lleva su propia información: **cátering cliente**, **hora de pausa**, **vestuario** (por defecto Uniformidad PW), **EPI** (por defecto completo: guantes, botas, chaleco y casco) y **observaciones para el personal**.
- **Ubicación** del tipo de servicio: por defecto el recinto del servicio; se puede elegir otra ya creada o «Otra ubicación…», buscándola en Google Maps o escribiéndola a mano.
- Las **dietas** siguen siendo por trabajador/puesto, y el horario y la pausa por puesto.
- El trabajador ve en su servicio la información de su tipo de servicio, incluidas las observaciones; el gestor la ve en la cabecera de cada bloque.

## Novedades v42 · Bloques sin horario

- Los bloques (LOAD IN, SHOW CALL…) ya **no tienen horario propio**: al crearlos o al «Añadir puestos», cada categoría lleva su **inicio, fin y pausa** (los turnos que pasan de medianoche terminan al día siguiente).
- La cabecera del bloque muestra cuántos puestos y cuántos horarios distintos tiene; los puestos se ordenan por hora.
- Editar el bloque (tipo, equipo, ubicación, fecha) ya no cambia los horarios de los puestos; cada horario se cambia en «Gestionar».

## Novedades v41 · HAND y ofertas por horario

- **HAND** agrupa HAND A, HAND B, HAND C1 y HAND M: todas abiertas por defecto para todos los trabajadores, junto con STEELHAND. Se elimina la categoría «HAND / MONTADOR/A».
- Las ofertas ya no excluyen a quien está en el mismo servicio otro día: solo se excluye a quien tiene un turno (de cualquier servicio) **en el mismo horario**. Al asignar se mantiene la regla: no se puede meter a un trabajador en dos turnos que se solapan.

## Novedades v40 · Ofertas sin repetir y categorías por defecto

- Las ofertas (masivas o urgentes) **nunca** se envían a quien ya está asignado en ese servicio esos días.
- Oferta normal/masiva: solo a quien tiene la categoría abierta (dentro del grupo elegido: fijos, eventuales, todos…).
- Oferta **urgente**: a todo el personal con acceso, tenga o no la categoría.
- Todos los trabajadores tienen **HAND / MONTADOR/A** y **STEELHAND** abiertas por defecto; se pueden cerrar desde su ficha.
- Ventana «Ofrecer el puesto» más compacta, con los recuentos reales de destinatarios.

## Novedades v39 · Factura por horas y sin nombres

- La factura ya no muestra el nombre del trabajador: cada línea indica servicio, día, categoría, horario y pausa.
- La columna «Cant.» pasa a **Horas** (p. ej. «7,5 h»); las dietas se muestran como «1 dieta» y las tarifas por jornada como «1 jornada».
- La pausa **no se factura**: las horas ya la descuentan y la línea lo indica («Pausa 30 min (no facturada)»).

## Novedades v38 · Dietas dentro del trabajador en la factura

- Cada línea de trabajador de la factura indica su **horario** (inicio–fin) y si tiene **pausa** («Sin pausa» o su duración).
- Las **dietas** van justo debajo de la línea de su trabajador, sangradas (↳ Dietas · trabajador · día y horario), con su cantidad y precio.

## Novedades v37 · Dietas, tarifas, información del servicio y avisos urgentes

- Tarifas: sin textos de ayuda; «Montaje» y «Operativo» se muestran juntas como **OPERATIVO**; el incremento al crear una tarifa admite valores negativos (descuento).
- **Dietas en el tarifario** (sección DIETAS de cada tarifa): por defecto 10 € al trabajador y 16,5 € al cliente, editables por tarifa; al duplicar una tarifa se aplica el mismo incremento o descuento.
- Al crear puestos (asistente, bloques y «Añadir puestos») se indica si llevan dietas; la asignación hereda 1 dieta. Las dietas suman al pago del trabajador, al coste/venta del cierre y salen como línea «Dietas» en la factura.
- **Gestionar** un puesto permite cambiar la categoría (con los precios de la nueva), el horario, la pausa y las dietas (`line-update`).
- Servicio: selectores de **cátering cliente**, **hora de pausa**, **vestuario** y **EPI**; el trabajador los ve en «Información del servicio» junto a sus dietas.
- Fichaje: la ventana muestra si la entrada/salida se ha **aceptado o denegado**; con «Mostrar mi QR» avisa cuando el coordinador la acepta.
- **Avisos en móvil y ordenador** (notificaciones del navegador): mensajes, servicios asignados y ofertas para el trabajador; mensajes y respuestas «me interesa» para el gestor.
- **Ofertas urgentes**: aviso cada 5 minutos a quien no haya respondido hasta que se cubra el puesto, y bloque «Servicio urgente» arriba en el inicio de todos los destinatarios.

## Novedades v36 · Formularios que no se borran

- Arreglado: al escribir en Ajustes de empresa (o en cualquier formulario de una página) la actualización automática recargaba los datos y borraba lo escrito. Ahora gestor y empleado no se recargan mientras hay un campo activo o cambios sin guardar; al guardar o cambiar de página vuelve la actualización en tiempo real. Si intentas cerrar la pestaña con cambios sin guardar, el navegador avisa.

## Novedades v35 · Perfil, disponibilidad y datos de empresa

- Al abrir un día en Disponibilidad salen ya marcadas las horas de tu disponibilidad habitual (mañana 06–15 h, tarde 15–24 h) o las que guardaste para ese día.
- Liquidaciones sin el aviso de «Importe bruto certificado…».
- Foto de perfil con recorte circular (arrastrar y zoom) antes de guardarla; se muestra en la barra superior en lugar de «Cuenta privada» y lleva a Mi perfil.
- Datos empresa: documentación (protocolos de acoso, prevención, normativa BCN2026), contactos de Penny Wise, móviles de coordinadores, qué hacer en caso de accidente (Asepeyo) y centros asistenciales de Barcelona, Tarragona y Lleida, con teléfonos para llamar.

## Novedades v34 · Teléfono de guardia y coordinación sin fichajes

- El empleado ya no ve quién está de guardia: en la barra superior tiene un botón para llamar al **teléfono de guardia 670 514 308** (solo icono en móvil). La lista de guardias solo llega al gestor.
- Coordinación: el coordinador ya no ve horas fichadas (sin columna «Fichaje», sin «Llegada registrada» ni «Entrada/Fin real» en la ficha y en la edición masiva). Puede cambiar el horario en cualquier momento.
- Inicio del empleado: el turno sigue el recorrido **Asignado → Confirmación → Entrada → Salida** (sin «Certificado»).

## Novedades v33 · Coordinación como Crew Control y tiempo real

- **Coordinación normal** con el mismo formato que Crew Control (sin chaleco ni equipos): filas con columnas en ordenador y tarjetas en móvil. Cada trabajador muestra estado, nombre y categoría, **teléfono completo**, horario, fichaje, **pausa**, **dietas** y **valoración**.
- **Selección pulsando la fila o la tarjeta** (sin casillas); la cabecera del turno selecciona todo el turno. Pulsar el nombre abre la ficha.
- Barra inferior solo con iconos: presente, contactado, no presentado, **edición masiva (engranaje)** y quitar selección. Se eliminan «Fin ahora» y «No contactado».
- Botón **Escanear QR** vectorial en Coordinación y en Crew Control; la cabecera de Crew Control (QR, selector de día y volver) usa Plus Jakarta Sans y ya no se ve apagada ni se solapa.
- **Tiempo real** en gestor y empleado: cada cambio incrementa una revisión (`GET /api/office/rev`) que ambas apps consultan cada 3 s y recargan al momento (respetando formularios y ventanas abiertas).

## Novedades v32 · Control interno del trabajador y tarifas

- **Crew Control solo para CREW HEAD**: ya no da acceso ningún permiso antiguo de bloque; solo estar asignado con la categoría CREW HEAD ese día. Un coordinador de otra categoría siempre ve la coordinación normal.
- **Ficha del trabajador · Valoración y control interno** (solo Gestoría): media de uniformidad, actitud y puntualidad; comentarios internos (se ven al asignar); **bloqueo de disponibilidad** por sanción (con fecha de fin opcional) y **clientes que lo vetan**. Un trabajador bloqueado o vetado no se puede asignar ni recibe ofertas. El trabajador no ve nada de esto.
- **Tarifas**: añadir y **eliminar categorías en todas las tarifas a la vez**, nombres en mayúsculas y sin columna de margen.
- **Mensajes** pasa a un icono en la barra superior de Gestoría, con contador.
- Plus Jakarta Sans forzada en ambas apps.
- Crew Control actualizado a la última versión del repositorio (v11.2.46 con las mejoras de modo oscuro).

## Novedades v31 · Coordinadores y Crew Head

- **Crew Head por categoría**: quien tiene asignado un puesto de categoría CREW HEAD un día ve todo ese servicio en Crew Control (desde Coordinación), sin tener que darle permisos.
- **Coordinador por turno**: botón «Coordinador» en cada bloque con buscador de fotos. Solo puede coordinar alguien asignado al servicio ese día; ya no se elige coordinador al crear el servicio o el presupuesto.
- El personal del turno ve en el servicio a **su coordinador con nombre y teléfono** (botón para llamar). Un Crew Head no aparece como coordinador salvo que se le elija.
- **Coordinación del trabajador**: un turno por tarjeta para el coordinador normal (versión reducida, solo su turno) y una tarjeta por día para el Crew Head (abre Crew Control). Desaparece «Crew Control» de la barra lateral.
- Desde la página del servicio, botón **Abrir mi coordinación** / **Abrir Crew Control**.
- Estado del trabajador con el mismo botón de icono y color que Crew Control.
- Se quita la pestaña «Personal y fichajes» (era lo mismo que Jornadas) y «Responsables y permisos» pasa a «Coordinación».

## Novedades v30 · Líneas de puesto más claras

- La barra de fases del servicio ya no se solapa: progreso arriba y siguiente paso debajo.
- En cada línea de puesto: **Gestionar** (cambiar o quitar trabajador, horario y pausa del puesto, eliminar), **+** para añadir otro puesto igual al bloque y **papelera** para eliminar el puesto. Se quitan «Editar puesto» y «Corregir fichaje».
- Columna **Horario y fichaje** con la hora de inicio y fin en colores: rojo si ya ha pasado la hora y no ha fichado, naranja si entró más de 15 min tarde, verde si fichó a tiempo y salida fichada.

## Novedades v29 · Ofertas de huecos, notificaciones y actividad por servicio

- **Ofrecer un puesto a un grupo**: desde «Asignar» en un puesto sin cubrir, «Ofrecer a un grupo» (con la categoría, fijos, eventuales, todo el personal o personas concretas). El personal responde «Me interesa» / «No puedo»; nadie queda asignado hasta que Gestoría elige. Las respuestas salen en el propio puesto, en la tabla del servicio y en el Inicio («Huecos ofrecidos»).
- **Campana de notificaciones** en el área de empleado: servicios disponibles, turnos asignados pendientes de confirmar y mensajes nuevos.
- **Coordinación** muestra todos los servicios que coordinas: los de Crew Head abren Crew Control; los de coordinador, la coordinación normal (aunque aún no tengan personal).
- **Fichaje por geolocalización** siempre visible para coordinadores, con aviso de cuándo se activa.
- **Actividad** agrupada por servicio, solo con acciones de usuarios de Gestoría, mostrando quién hizo el presupuesto, el servicio y el cierre.
- **Cobros a 30, 60 o 90 días** por cliente (y por defecto en Ajustes); la factura toma el plazo del cliente.
- **Google Maps**: el buscador de ubicación usa Places API (New) si se configura `GOOGLE_MAPS_API_KEY`.
- Disponibilidad habitual más compacta y barras de desplazamiento finas en ambas apps.

## Novedades v28 · Gestión más completa

- **Área de empleado sin historiales**: Mis servicios muestra solo Próximos y Por confirmar, y el Fichaje ya no tiene historial.
- **Disponibilidad habitual por franjas** (mañana 06–15 h / tarde 15–24 h, de lunes a domingo). La marca el trabajador en *Disponibilidad* o Gestoría en su ficha; se aplica sola cada semana y los días concretos se cambian en el calendario.
- **Ficha del trabajador**: datos editables en la propia página (sin ventana), apartado **Contratos** (un contrato por periodo, con tipo, inicio y fin, aviso al trabajador) y categorías abiertas al final. El trabajador ve su contrato vigente y todos los anteriores en *Contratos*.
- **Guardias de urgencia** en el Calendario: quién de Gestoría está de guardia cada día (por rangos y días de la semana, con teléfono). Se ve en Inicio de Gestoría y el personal ve la guardia de hoy con botón para llamar.
- **Cliente nuevo desde el desplegable** en presupuestos, servicios y facturas.
- **Buscador de ubicación** con mapa y enlace a Google Maps en servicios y presupuestos (OpenStreetMap; si se configura `GOOGLE_MAPS_API_KEY`, usa Google Places).
- **Presupuestos**: se puede crear el servicio desde un presupuesto guardado (también en borrador) y enviarlo por correo.
- **Tarifas**: todas las tarifas comparten categorías; tabla por tarifa con precios editables en línea y margen, y nueva categoría / edición aplicadas a todas las tarifas.

## Novedades v27 · Lo cerrado desaparece

- El coordinador tiene **Cerrar día** en Coordinación (exige que nadie se quede sin hora de fin). Al cerrar, su gente queda congelada y Gestoría puede **reabrirlo** desde *Cierre y facturación* del servicio.
- Un turno cerrado (por el coordinador, por el Crew Head en Crew Control o por la oficina al finalizar o cancelar el servicio) **desaparece de Coordinación y de Próximos / Por confirmar** en Mis servicios y del Inicio. Solo queda en el **Historial**, y ya no se puede fichar.

## Novedades v26 · Coordinación como Crew Control

- Estado de cada trabajador con el mismo desplegable de Crew Control: **No contactado · Contactado · Presente · No presentado**.
- Personal agrupado por turno (tipo · horario) con casilla para **seleccionar a todo el turno** o a personas sueltas.
- Barra de **acciones masivas**: Presente, Contactado, No contactado, No presentado, Fin ahora y **Edición masiva** (horario previsto, entrada y fin reales, pausa, dietas y valoración). Se aplica a todos o a ninguno.
- **Ficha del trabajador** igual que la de Crew Control: horario previsto, llegada registrada, entrada y fin reales con «Ahora», pausa aplicada, dietas, valoración de uniformidad/actitud/puntualidad, notas, incidencia, cambio de categoría e historial.

## Novedades v25 · Fichaje, coordinación y responsables

- **Fichaje en ventana** (botón Fichar del menú y del móvil) con tres opciones:
  - **Escanear QRs**: solo coordinadores y Crew Heads; eliges el servicio y escaneas a tu personal.
  - **Mostrar mi QR**: QR temporal que se renueva solo cada 90 segundos.
  - **Fichar por geolocalización**: solo si eres coordinador del servicio (nadie puede escanearte a ti). Exige ubicación.
  - El historial de fichajes sigue disponible desde la ventana.
- **Menú del empleado**: *Coordinación* solo aparece a quien coordina; *Crew Control* solo a quien es Crew Head. Un Crew Head que entra en su servicio de ese día va directo a Crew Control.
- **Coordinación tipo Crew Control (sin equipos)**, más minimalista: marcar presente o salida con un toque, editar horario previsto, entrada y salida reales, no presentado, dietas, valoración y contactado, abrir incidencias y pedir cambio de categoría. Todo queda registrado a nombre del coordinador.
- **Gestoría**:
  - Desplegable **Presupuesto hecho por** (usuarios de Gestoría) en cada presupuesto, visible en el listado.
  - Desplegable **Cierre hecho por** en *Cierre y facturación* del servicio (se rellena solo al certificar si está vacío).
  - **Historial de cambios** de cada presupuesto y servicio: quién cambió qué y cuándo, incluidos turnos, fichajes, coordinación y facturas.

## Novedades v24 · El ciclo del servicio, de principio a fin

La aplicación se organiza ahora alrededor del recorrido real de cada servicio:
**Presupuesto → Planificar → Personal → Día del servicio → Cierre → Facturación → Cobro**.

- **Gestoría**
  - Menú ordenado por etapas: *Hoy*, *1 · Planificar*, *2 · Equipo*, *3 · Cerrar y cobrar* y *Configuración*.
  - **Inicio** con el embudo de servicios (cuántos hay en cada fase, clicable) y una lista numerada de **Siguientes pasos**, cada uno con su botón para hacerlo directamente.
  - **Servicios** filtrado por fase (Por planificar, Por cubrir o confirmar, Listos, En curso, Por cerrar, Por facturar, Por cobrar, Terminados), con la línea de progreso y el botón del siguiente paso en cada fila.
  - La ficha del servicio muestra en qué fase está y qué toca hacer ahora (asignar, recordar a quien no ha confirmado, cerrar fichajes, marcar finalizado, certificar, facturar, enviar, cobrar).
  - «Recordar a quien no ha confirmado» envía un mensaje a cada trabajador pendiente.
- **Área de empleado**
  - Cada turno muestra su progreso: Asignado → Confirmación → Entrada → Salida → Certificado, con una frase de qué toca hacer.
  - Inicio con **Lo que tienes pendiente**, en orden y con acceso directo (confirmar, fichar, disponibilidad, formación, mensajes).
- **Movimiento**: entrada suave al cambiar de pantalla y contadores animados (se desactiva si el sistema pide reducir movimiento; no se anima en los refrescos automáticos).

## Novedades v23 · Ficha del trabajador y asignación inteligente

- **Ficha del trabajador como página**, con foto (Gestoría puede subirla), antigüedad, contrato, datos, disponibilidad habitual, próximos turnos, historial, horas y coste del mes y documentación.
- **Categorías abiertas por trabajador**: Gestoría abre o cierra cada categoría del tarifario. El servidor no permite asignar un turno de una categoría cerrada.
- **Buscador al asignar un puesto**: solo trabajadores con esa categoría abierta y disponibilidad en el tramo, ordenados por antigüedad y con foto. Los **fijos** (indefinidos y fijos discontinuos) cuentan como disponibles salvo que indiquen lo contrario; se marca quién está ocupado en otro turno.

## Novedades v22 · Facturación de servicios finalizados y cierres parciales

- **Facturación → Pendiente de facturar**: aparecen los servicios finalizados y los días cerrados por el Crew Head con personal sin facturar, con importe estimado. Se puede facturar el servicio completo, solo un día (cierre parcial) o lo que quede pendiente; ningún trabajador se factura dos veces.
- Facturas por pestañas (borradores, emitidas por cobrar, cobradas), **enviar por correo** con el mensaje preparado y registro de factura enviada.
- Menú de Gestoría compacto, visible entero sin desplazarse.
- Empleado: **Control horario** como página (turno en curso, historial de fichajes y horas del mes) y **añadir servicios al calendario del móvil** (.ics).

## Novedades v21 · Fichaje QR y Coordinación

- **Lector QR continuo** para coordinadores y Crew Head: cámara a pantalla completa, valida un QR tras otro y funciona también en iPhone/iPad (jsQR, incluido en `public/assets/vendor/`). Si el recinto exige ubicación, la pide una vez por minuto.
- Al escanear, el trabajador queda **presente al momento** en Coordinación y en Crew Control (que tiene su propio botón «Escanear QR»).
- **Coordinación** es ahora un selector de servicios: entras en el servicio y día que coordinas y ves una versión reducida de Crew Control, sin equipos (presentes, sin llegar, salidas, turnos, búsqueda, llamada e incidencias), que se actualiza sola.

## Novedades v20 · Crew Control original y mensajes a grupos

- **Crew Control v11.2.46 con su interfaz exacta**, a pantalla completa en `/crew-control/` con el botón «Volver al área de empleado». Funciona con los datos de NOVA y solo para el Crew Head en su día. Detalles en `integrations/crew-control/README.md`.
- **Mensajes a grupos** desde Gestoría: todos los trabajadores, todo el personal de un servicio, fijos, eventuales o por categoría (HAND B, FORKLIFTER…). Cada trabajador lo recibe en su chat privado.

## Novedades v19 · Crew Head, coordinadores y página del servicio

- **Crew Control solo para el Crew Head** asignado a un turno del servicio, y solo con el personal de ese servicio en los días en que es Crew Head. Puede ajustar horarios y operar el día (asistencia manual con motivo, equipos y chalecos, pausas, dietas, valoración, contacto), exportar el CSV del día y **cerrar el día** (bloquea cambios; Gestoría puede reabrirlo).
- **No puede cambiar categorías**: abre una incidencia de «Cambio de categoría» y Gestoría la aplica desde Incidencias. Tampoco puede renombrar bloques.
- **Coordinadores de tipo de servicio**: solo ven al personal de los turnos que coordinan ese día, validan QR y registran incidencias (con tipo, gravedad y medida tomada).
- **Liquidaciones del empleado**: el importe no aparece hasta que Gestoría **certifica** la liquidación del servicio (también en el servidor).
- **Página «Resumen del servicio»** para el trabajador (no ventana): aviso obligatorio de la empresa, observaciones para el personal, documentación del servicio (plan de autoprotección/PRL), referencia, tipo de servicio, hora de llamada, inicio y fin, recinto, fichaje y teléfono de guardia. Gestoría los configura en Ajustes, en la ficha del servicio y en Ubicaciones → Documentación para el personal.

## Novedades v18 (gestión y empleado)

**Gestor**
- Corregido: crear servicios desde el asistente (fallaba con `nodes.map is not a function`), la estimación del presupuesto de personal y la página de Incidencias. Los errores de acciones rápidas (liquidar, facturar, emitir…) ahora se muestran en pantalla.
- Menú completo: Facturación, Disponibilidad, Ajustes de empresa y Actividad, con avisos de mensajes nuevos, incidencias abiertas y facturas vencidas.
- Inicio con asistencia de hoy en tiempo real, cobertura de personal de cada servicio, pendiente de cobro y una lista «Requiere atención» (puestos sin cubrir, servicios por cerrar o liquidar, fichajes sin salida, facturas vencidas, documentos, mensajes).
- Servicios por pestañas (próximos / pasados) con barra de cobertura. Nueva pestaña **Cierre y facturación** en cada servicio: cambio de estado, comprobaciones, coste, venta y margen previstos, liquidación y borrador de factura.
- **Disponibilidad del equipo** en vista semanal: asignados, disponibles, semana habitual y no disponibles.
- Mensajes organizados por conversación, incidencias por estado, cierre y liquidación con totales, y búsqueda global (Ctrl + K).

**Empleado**
- Inicio con turno en curso o próximo servicio (cuenta atrás, fichar, cómo llegar), resumen del mes y avisos (formación, documentos, mensajes, disponibilidad).
- Servicios por pestañas (próximos / por confirmar / historial); «No puedo» permite enviar el motivo a la oficina.
- Agenda con turnos clicables, disponibilidad con día actual, días pasados bloqueados y semana habitual; liquidaciones por mes con confirmado y pendiente; mensajes en formato chat.
- Menú agrupado con contadores, barra móvil con botón central de fichaje y actualización automática cada 45 s.

**Limpieza:** se retiran los instaladores antiguos de GitHub Actions (escribían y hacían push en `main`, uno borraba `public/`, `src/` y `test/`), la carpeta `.crew-transfer`, la integración por iframe de Crew Control (bloqueada por la política de seguridad del Worker y ya sustituida por el Crew Control nativo) y archivos sin uso. El código original de Crew Control se conserva en `integrations/crew-control/`.

## Estructura definitiva de dos áreas (v17 en revisión)

**Gestor** (`/`): clientes, servicios, comandas, personal, tarifas, facturación, liquidaciones, incidencias y mensajes. Desde la ficha del trabajador, el alta crea la cuenta vinculada por defecto, con usuario generado si no se proporciona y contraseña aleatoria mostrada una sola vez al gestor. Se puede editar su acceso sin crear cuentas duplicadas.

**Trabajador** (`/empleado.html`): inicio, control horario, disponibilidad puntual y semanal, servicios, calendario, coordinación de los servicios que le asignen, empresa, formación documental con confirmación, documentos, tutoriales, liquidaciones mensuales brutas y CSV, contratos, mensajes y perfil con fotografía privada y conocimientos. Un trabajador puede actuar como HAND o coordinar distintos servicios sin cambiar de rol global. Solo existen nuevas cuentas con roles `manager` y `worker`; cuentas `coordinator` históricas se muestran como trabajador para facilitar su migración, pero requieren ficha vinculada.

- QR temporal válido 90 segundos, validado por el gestor o trabajador nombrado coordinador de ese servicio. La cámara usa `BarcodeDetector` cuando está disponible, con entrada manual del código siempre accesible.
- Los fichajes directos se reservan a servicios sin coordinador. La ubicación (radio de 500 m por defecto) solo se comprueba al fichar cuando Gestoría configura coordenadas del recinto; no hay seguimiento continuo.
- Coordinación: consulta de plantilla vinculada al servicio, validación QR, cambio de turnos dentro de sus permisos e incidencias; sin acceso a clientes, costes ni tarifas de venta.
- Contratos de tipo `eventual` como valor predeterminado, con opciones de indefinido y fijo discontinuo. No se crea contrato legal automáticamente.
- Diseño común basado en los tokens visuales y navegación de la v15 histórica conservada en `public/legacy-demo.html` y `public/assets/styles.css`; se implementa en `nova-original-theme.css` para las dos áreas.
- El prototipo antiguo usaba datos ficticios, cuentas demo y módulos no conectados. No se activa ese backend. Las equivalencias visuales al píxel y los flujos avanzados de Crew Control deben validarse en navegador antes del despliegue.

**Publicación:** todo lo que entra en `main` se despliega automáticamente en Cloudflare (workflow `NOVA Crew tests and deploy`). Los cambios se preparan en ramas y se revisan en un pull request, donde `pr-validation.yml` ejecuta `npm run check && npm test`. Antes de fusionar, probar en navegador ambas áreas, la cámara QR en iPhone/iPad y los permisos de ubicación.


Portal de gestión y de trabajadores sobre Cloudflare Workers y Durable Objects SQLite. La versión operativa v16 tiene usuarios reales y parte de una base vacía. Los registros de la demo se conservan separados y no se importan como datos de empresa.

## Funciones operativas

- **Gestor:** clientes, fichas de personal, usuarios y roles, servicios, calendario, asignaciones, tarifas, disponibilidad y documentación.
- **Planificación:** comprobación de duplicados, solapes, fechas de alta/fin de contrato y días declarados no disponibles. Equipos, especialidades, pausas, horas previstas y coordinador por servicio.
- **Trabajador:** sus servicios, respuesta a las asignaciones, fichaje de entrada/salida, disponibilidad y descarga de sus documentos.
- **Coordinador:** personal y fichajes de los servicios que le asigna el gestor. No accede a clientes, costes, facturas ni contratos de otros empleados.
- **Fichajes:** hora del servidor, entrada/salida, QR de un solo uso que caduca a los 90 segundos. La cámara utiliza BarcodeDetector cuando está disponible; siempre hay entrada manual del código. El gestor puede corregir horas aportando un motivo; el historial conserva los valores anteriores y posteriores.
- **Documentos:** PDF/PNG/JPEG hasta 5 MB, vinculados a trabajador/cliente/servicio, caducidad y descarga autenticada. Subir un contrato guarda el archivo; no lo firma ni registra en organismos externos.
- **Presupuestos:** conceptos, cantidades, precios, IVA, emisión con número, aceptación/rechazo y conversión única a borrador de factura.
- **Facturación:** borrador manual o desde horas/tarifas previstas de un servicio; emisión con numeración consecutiva por serie/año, instantánea de emisor/cliente, bloqueo de documentos emitidos, cobros parciales/completos y vencimientos. Impresión del documento para guardar PDF desde el navegador. Revisar las horas y tarifas del borrador antes de emitir.
- **Costes:** gastos asociados a servicios y cálculo de coste, venta y margen previstos.
- **Datos:** importación CSV de clientes/trabajadores con vista previa, exportación CSV y exportación JSON de registros/metadatos. Esta exportación no incluye el contenido de archivos ni permite restaurar automáticamente la instalación.
- **Actividad:** historial de creaciones, cambios, archivos, emisión, cobros, cuentas y fichajes.

## Activación inicial

Se despliega en el **Worker existente `nova-crew-demo`**, conservando su URL y la base de demostración. El nombre técnico se mantiene para evitar crear otro Worker.

1. En GitHub → este repositorio → Settings → Secrets and variables → Actions → **Repository secrets**, guardar:
   - `CLOUDFLARE_API_TOKEN`: token con Workers Scripts Edit y Account Settings Read para la cuenta correcta.
   - `CLOUDFLARE_ACCOUNT_ID`: ID de esa cuenta.
   - `NOVA_SETUP_TOKEN`: clave privada aleatoria de al menos 24 caracteres para crear el primer gestor (distinta del API token).
2. Actions → **NOVA Crew tests and deploy** → Run workflow, rama `main`.
3. El workflow comprueba sintaxis y pruebas, despliega y, si existe el secreto `NOVA_SETUP_TOKEN` en GitHub, lo configura también como secreto del Worker. También se puede configurar directamente en Cloudflare → Worker → Settings → Variables and Secrets.
4. Abrir la URL del Worker. Introducir la clave de instalación, nombre, usuario y una contraseña nueva de al menos 12 caracteres. Solo es posible crear el primer gestor una vez.
5. Completar **Ajustes de empresa**. Crear clientes, trabajadores y después sus usuarios. Para un usuario de trabajador es obligatorio vincular su ficha.
6. Crear un servicio para un cliente, asignar coordinador y personal, probar confirmación y fichajes desde otra cuenta, y revisar el borrador antes de facturar.
7. Una vez creado el primer gestor, se puede retirar `NOVA_SETUP_TOKEN` de GitHub y del Worker. La instalación permanece cerrada aunque se conserve.

No hay credenciales de gestor predeterminadas ni registro público. La recuperación de una cuenta se realiza por otro gestor activo. No existe todavía recuperación automática por correo; conviene disponer de dos gestores autorizados.

## Seguridad y almacenamiento

- Autenticación mediante cookie `__Host-`, HttpOnly, Secure y SameSite=Strict. Sesiones de 8 horas; el servidor invalida sesiones al cambiar permisos, contraseña o estado de una cuenta.
- Contraseñas con PBKDF2-SHA256, sal aleatoria y 100.000 iteraciones, dentro del límite de Web Crypto de Workers. Limitación de intentos por IP y usuario.
- Autorización en cada operación del servidor. Comprobación de origen en las mutaciones; la interfaz no es la barrera de permisos.
- El binding `OFFICE_STATE` utiliza un Durable Object SQLite independiente, `OfficeState`. La migración `v2-office` lo añade sin borrar `DemoState`.
- Los registros se guardan individualmente; los archivos se dividen en fragmentos de 60.000 caracteres para respetar los límites de almacenamiento. Las operaciones relacionadas se realizan en transacciones.
- Cada edición incluye una revisión. Un dispositivo con datos antiguos recibe un conflicto 409 en lugar de sobrescribir cambios recientes. La pantalla se actualiza cada 30 segundos cuando no hay un formulario abierto.
- Las antiguas cuentas públicas `demo` y `coord` no funcionan en el portal operativo. `/api` responde 410 por defecto. El HTML antiguo se conserva como `legacy-demo.html`; solo una configuración explícita `ENABLE_LEGACY_DEMO=true` reactiva su backend ficticio, siempre aislado de los registros operativos.
- Documentos servidos como descarga, con autenticación y sin URLs públicas. No almacenar secretos ni contratos en el repositorio GitHub, que es público.


## Área de empleado recuperada en v17 (sin tocar la demo histórica)

- **`/empleado.html`**: entrada individual para cuentas operativas con rol `worker`. Al iniciar sesión en la página principal se redirige automáticamente a esta área.
- Secciones de **inicio**, **mis servicios y confirmaciones**, **calendario**, **disponibilidad**, **documentos**, **liquidaciones brutas** y **perfil**. Adaptación móvil.
- **Fichaje QR** en entrada y salida mediante `qr-issue`, con caducidad de 90 segundos; se valida con `qr-redeem` de un coordinador o gestor autorizado. No se han activado las cuentas demo ni se han copiado fichajes ficticios.
- El importe mostrado al empleado corresponde a **su propio importe bruto calculado**. El endpoint de estado de empleado no entrega clientes, precio de venta ni tarifas comerciales.
- La versión histórica `public/legacy-demo.html` y sus activos siguen conservados como referencia visual, **sin habilitar el antiguo backend inseguro de prueba**.
- Pendiente de migrar/reconstruir desde la experiencia histórica: mensajería, formación, funcionalidades extendidas de coordinación, ajustes avanzados del perfil y otras pantallas específicas del prototipo. No presentar esas funciones como restauradas sin integraciones reales.
- El trabajo permanece en una rama aislada, no desplegada. Probar ambos roles, cámara QR, fin de sesión, caducidad y visualización móvil antes de fusionar.

## Gestoría y liquidaciones (propuesta v17)

Esta funcionalidad se desarrolla en la rama `feature/gestoria-liquidaciones-20261117` y no debe desplegarse hasta pasar pruebas de regresión en Cloudflare.

- **Comandas / peticiones:** cada servicio puede tener plazas individuales (`orderLines`) con categoría, tipo de servicio, equipo, día, horario y pausa. Una plaza puede quedar vacante. Creación masiva de 1 a 100 plazas, con un identificador distinto por plaza. Las asignaciones de trabajadores pueden vincularse a una plaza.
- **Tarifas:** catálogo inicial de 41 conceptos del tarifario aportado «Tarifario trabajadores Temporales PW BCN 2026», incluyendo categorías operativas específicas. Los importes del PDF son *brutos*, no costes laborales completos. Se mantienen los importes expresados por hora y por show/día, con tarifa cliente inicial al doble del precio bruto y cambios configurables.
- **Categorías operativas:** HAND B mínimo 5 h; HAND A 3 h; HAND M 4 h; CREW HEAD identificado como Coordinador/a de Personal (6 h, 14,40 € brutos); FORKLIFTER identificado con Operador/a Carretilla Elevadora (5 h, 10,80 € brutos). El PDF **no identifica salarios para HAND A, HAND B, HAND C1 y HAND M**; sus precios de la categoría operativa empiezan sin configurar, no con un valor ficticio. La categoría general Hand/Montador/a mantiene 4 h y 9,30 €/h.
- **Excepciones:** Hand/Montador/a tiene mínimo de 3 h en Palau de la Música, Bikini, Apolo y Razzmatazz 2 y 3. La excepción del PDF sobre dos servicios de 3 h en una misma jornada requiere comprobación contextual y no se automatiza.
- **Operación real:** horas reales y coste bruto del trabajador distintos de horas y tarifa facturable al cliente. Un no presentado deja coste cero; un cargo de cancelación al cliente requiere declaración explícita y referencia contractual en observaciones. No presentar trabajos inexistentes como horas efectivamente trabajadas.
- **Cierre y facturación:** aprobación de liquidaciones después de completar el servicio y cerrar fichajes, bloqueo de nuevos cambios ordinarios una vez liquidado y protección de servicios con facturas emitidas. El presupuesto se puede preparar desde la comanda (plazas aunque estén vacantes) y la factura desde las asignaciones facturables. Nunca se emiten documentos automáticamente.
- **Nuevas pantallas:** Gestoría · Comandas, Servicios cerrados y Tarifas. El área de trabajadores sigue separada de la información comercial.

**Limitaciones:** No hay todavía rectificativas legales, cálculos de coste de Seguridad Social a cargo de empresa, recargos automáticos de convenio, verificación automática de la excepción de dos turnos de 3 h, integración bancaria ni generación tributaria certificada. Antes de producción, ejecutar `npm run check && npm test`, revisar una copia de datos reales y verificar compatibilidad con la configuración del Worker.

## Alcance actual

Es una primera versión operativa, no una suite laboral/contable completa. No incorpora nóminas, firma electrónica, integración con la Seguridad Social o sistemas tributarios, facturación electrónica certificada, rectificativas, envío automático de correos, conciliación bancaria, restauración de backups o migración automática de registros de la antigua demo/Crew Control. La emisión interna no acredita cumplimiento de un régimen fiscal concreto.

Los listados se cargan completos y el historial visible muestra las 200 últimas operaciones; antes de operar a gran escala es necesario añadir paginación y una política de copias/restauración. Los documentos cuentan para las cuotas de Durable Objects de la cuenta. No se ha realizado una auditoría externa, una prueba de carga ni validación con cámaras físicas en iPhone/iPad.

## Desarrollo y comprobaciones

```sh
npm ci
npm run check
npm test
npm run dev
```

Para desarrollo local, usar `.dev.vars` (ignorado por Git) con una clave de instalación exclusivamente de prueba. Los tests incluyen aislamiento de roles, transacciones, ediciones simultáneas, contratos privados y fragmentados, numeración de facturas, cobros, QR de un solo uso, corrección auditada de fichajes y conversión de presupuestos. La documentación anterior se conserva en `docs/DEMO_LEGACY.md`.
