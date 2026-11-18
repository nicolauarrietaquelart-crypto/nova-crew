# NOVA Crew · Operaciones y personal

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
