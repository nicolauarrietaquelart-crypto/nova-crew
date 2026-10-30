# NOVA Crew v13 — Demo completa para Netlify

**Una sola web HTTPS con escáner QR integrado en el portal**, conservando la interfaz y los módulos de la v12. No utiliza Google Apps Script.

## 1. Publicación recomendada (gratis para una demo pequeña)

Para desplegar **la aplicación Y su backend**, publica **todo este proyecto** en Netlify desde un repositorio Git (no solo `public/index.html`).

1. Crea una cuenta gratuita en [GitHub](https://github.com/) y un repositorio nuevo, por ejemplo `nova-crew-demo` (privado si prefieres mantener el código fuera de vista).
2. Sube al repositorio el contenido de esta carpeta: `package.json`, `netlify.toml`, `public/` y `netlify/`. Puedes utilizar GitHub Desktop para hacerlo sin comandos. **No subas fotos ni datos reales de empleados**.
3. Entra en [Netlify](https://app.netlify.com/) → **Add new project → Import an existing project → GitHub**. Autoriza el repositorio y selecciónalo.
4. Netlify leerá `netlify.toml`: directorio de publicación `public`, funciones `netlify/functions`, Node 22. No hace falta comando de compilación; las dependencias del `package.json` se instalan en el despliegue.
5. Pulsa **Deploy**. Cuando termine, abre tu URL `https://NOMBRE.netlify.app` desde Chrome Android o Safari iPhone.
6. Permite el acceso a cámara cuando el navegador lo pida. Si lo bloqueaste, actívalo en los permisos del sitio.

**Importante:** un despliegue estático de un solo HTML o solo de la carpeta `public` no es suficiente: necesitas que Netlify publique la Function y aprovisione Blobs. La integración se ha preparado para ese mecanismo; aquí no se ha publicado en una cuenta real de Netlify.

Alternativa con terminal, una vez instalado Node.js:

```bash
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```

El asistente de la CLI puede solicitarte crear/enlazar el proyecto. Si quieres probar localmente, usa `npx netlify-cli dev` (el almacén local de Blobs es independiente del de producción).

## 2. Cuentas ficticias de demostración

| Perfil | Usuario | Contraseña |
|---|---|---|
| Trabajador (Pau Ferrer Soler; nombre editable) | `demo` | `crew2026` |
| Coordinador (Álvaro Costa) | `coord` | `coord2026` |

Los usuarios y contraseñas son **públicos y solo sirven para la demo**. No utilices esta aplicación para datos laborales reales ni control horario oficial.

### Escenario A — Fichaje normal (2 móviles)

1. Móvil 1: entra como `demo`, pulsa el icono **▦** del encabezado → **Enseñar mi QR**.
2. Elige **NEON DISTRICT · ARENA MONTJUÏC** y pulsa **Generar QR**.
3. Móvil 2: entra como `coord`, pulsa el mismo icono → **Escanear trabajador**. Selecciona NEON DISTRICT.
4. Pulsa **Escaneo en directo** y permite usar la cámara. Enfoca el QR del otro móvil. Si falla la cámara, utiliza **Hacer foto del QR**.
5. La pantalla del coordinador confirma **PRESENTE** y muestra nombre, rol, equipo y horario; la ficha del trabajador lo refleja en unos segundos.
6. Abre **Coordinación → NEON DISTRICT** para ver el trabajador marcado como presente.

### Escenario B — Fichaje en Crew Control

1. Móvil 1: entra como `coord` (Álvaro también tiene asignado un turno como HAND A en URBAN WAVE). Enseña su QR de **URBAN WAVE FEST · FÒRUM HALL**.
2. Móvil 2: entra como `demo`, abre **Escanear trabajador**, selecciona URBAN WAVE y escanea.
3. En **Crew Control** de URBAN WAVE, el fichaje del trabajador aparece como PRESENTE, con equipo **LUCES**.

### Escenario C — Servicio sin coordinador

La cuenta `demo` selecciona **ELECTRA LIVE · SANT JORDI HUB** → **Fichar directamente**. No hay QR ni restricción GPS en la demo.

### Personalización

Cambia el nombre o teléfono de la cuenta `demo` en **Mi perfil → Guardar cambios**. El backend lo almacena con el ID `demo`, por lo que se conserva la correspondencia con su QR y su registro; se refleja en el otro dispositivo cuando se actualiza su lista.

## 3. Cómo funciona el sistema

- **Frontend:** HTML, CSS y JavaScript derivados de NOVA Crew v12, con la cámara dentro del mismo portal.
- **Lectura:** cámara web (`getUserMedia`) + `jsQR` 1.4.0, cargado por CDN; `BarcodeDetector` es un segundo recurso opcional, no obligatorio.
- **Backend:** Netlify Function `netlify/functions/api.mjs` (Node.js).
- **Persistencia compartida:** Netlify Blobs site-wide con consistencia fuerte.
- **Autorización demo:** el login emite una sesión aleatoria de 256 bits; se almacena el hash de la sesión en servidor, caduca a las 8 horas. El frontend mantiene el token solo en memoria; al recargar, se vuelve a mostrar login.
- **QR:** 256 bits aleatorios, 90 segundos, se guarda su hash, solo un QR activo por trabajador y servicio. Escanearlo comprueba rol, servicio y vencimiento y consume el código con una escritura condicional por ETag para evitar dobles usos simultáneos.
- **Asistencia:** queda en Netlify Blobs y se consulta periódicamente para actualizar la interfaz en ambos dispositivos.

## 4. Qué está realmente sincronizado

**Compartido entre dispositivos en esta versión:** inicio de sesión demo, nombre y teléfono básicos, QR activos, fichajes, última asistencia por persona/servicio.

**Sigue como demostración local de la v12:** otros detalles del perfil, fotografía, disponibilidad, agenda/confirmaciones, formación, incidencias, valoraciones, edición masiva, liquidaciones, contratos y documentos. Estos módulos conservan su interfaz e interacciones simuladas, pero **NO están conectados a una base de datos empresarial** y **NO se sincronizan automáticamente entre móviles**. La fotografía de perfil se guarda en el navegador del dispositivo.

Esta distinción es importante para presentarla con precisión. Se puede conectar el resto posteriormente a una base de datos real, conservando la interfaz.

## 5. Requisitos, límites y seguridad

- Cámara en directo solo en un contexto seguro **HTTPS** y con permiso del usuario. El sitio `*.netlify.app` ya dispone de HTTPS. No se ha probado una cámara física en este entorno.
- El navegador debe cargar `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js`; si el CDN no responde, Chrome compatible puede usar `BarcodeDetector` como respaldo, además de entrada manual.
- Netlify Free tiene un límite mensual de créditos. Para presentaciones cortas, debería ser suficiente, pero hay cuotas y el proyecto puede dejar de atender peticiones cuando se agoten.
- Es una **demo**, no control de jornada válido para producción: sin recuperación de cuentas, sin gestión robusta de empleados reales, sin permisos granulares, sin historial auditado completo ni garantías legales de fichaje. Las credenciales aparecen en la web y pueden usarlas terceros que conozcan la URL.
- Los servicios, personal, teléfonos y documentos son ficticios. No emplees datos reales en esta versión pública.
- Blobs es apropiado aquí como almacén pequeño de demostración; para grandes volúmenes/transacciones relacionales, migra a Netlify DB u otra base de datos.

## 6. Archivos principales

```text
public/
  index.html                 Todo el portal de NOVA Crew
  assets/styles.css          Estilo original adaptado
  assets/portal.js           Portal de empleado y Crew Control
  assets/extras.js           Agenda y confirmaciones ficticias
  assets/qr-encoder.js       Generador de QR MIT
  assets/qr.js               Lector por cámara, UI y fichaje
  assets/api-client.js       API de Netlify
netlify/functions/
  api.mjs                    Función pública HTTPS
  core.mjs                   Reglas, roles, sesiones, QR y asistencia
netlify.toml                 Configuración del sitio y Functions
package.json                Dependencias y pruebas
```

## 7. Pruebas incluidas

`npm test` ejecuta pruebas unitarias de login, perfil, flujo normal, fichaje sin coordinador, QR regenerado, QR de un solo uso, doble escaneo concurrente y ficha en Crew Control. Se probó además la interfaz con un navegador automatizado y un backend simulado (prueba de integración local), **no contra Netlify publicado**.

## 8. Créditos

Codificador QR Arase (`qr-encoder.js`), licencia MIT según el archivo fuente de la v12. Lector [jsQR 1.4.0](https://github.com/cozmo/jsQR), licencia Apache-2.0, servido por CDN. La tipografía Plus Jakarta Sans se sirve mediante Google Fonts.
