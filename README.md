# NOVA Crew · Operaciones y personal

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
