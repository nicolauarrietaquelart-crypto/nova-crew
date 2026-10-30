# NOVA Crew v14 — Cloudflare Workers (demo)

**Proyecto web completo**, migrado de la v13 de Netlify a Cloudflare Workers + Durable Objects SQLite. Cámara QR dentro de la misma web, sesiones demo, fichaje compartido entre móviles y mantenimiento de las secciones del portal.

## ¿Qué está incluido?

- `public/`: portal NOVA Crew (HTML, CSS, JS) procedente de v13; el lector de QR usa `getUserMedia` + jsQR (CDN) con respaldo de fotografía y entrada manual.
- `public/assets/api-client.js`: llamadas al backend en la misma URL (`/api`), sin Netlify.
- `src/worker.mjs`: backend Cloudflare Workers; genera QR, los valida, conserva perfil básico y fichajes en almacenamiento compartido.
- `wrangler.jsonc`: el nombre `nova-crew-demo`, assets estáticos y Durable Object SQLite `DemoState`. Se crea con el primer despliegue, sin D1 externo.
- `test/`: pruebas del backend con Node.js (opcionales para el usuario).

**Advertencia:** solo demo. Las credenciales son públicas y los perfiles y servicios son ficticios. No utilizar para fichaje laboral oficial ni datos personales reales. Solo nombre/teléfono, QR y asistencia están sincronizados en el servidor; el resto sigue siendo la demo local.

## Publicación sin programas: GitHub → Cloudflare

Si **ya tienes la v13 subida en tu repositorio**, utiliza el instalador adjunto `instalar_nova_cloudflare.yml`. No hace falta cargar carpetas en GitHub:

1. En GitHub → `nova-crew` → **Add file → Upload files**, sube el archivo `NOVA_Crew_v14_Cloudflare.zip` sin descomprimir y pulsa **Commit changes**.
2. Ve a **Add file → Create new file**, nómbralo `.github/workflows/instalar-cloudflare.yml` y pega el contenido del instalador `.yml` adjunto a la descarga.
3. Guarda con **Commit changes**.
4. Abre **Actions → Instalar NOVA Crew v14 Cloudflare → Run workflow**. Espera al resultado verde. Deben aparecer `public/`, `src/`, `test/`, `wrangler.jsonc` y `package.json` en la raíz. El ZIP se borra automáticamente después de extraerse.
5. Abre [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages → Create application → GitHub** (la etiqueta exacta puede variar ligeramente).
6. Conecta tu GitHub, selecciona **el mismo repositorio `nova-crew`**, rama principal `main`, directorio raíz `/` y crea un **Worker**, no una web de Pages estática.
7. **Nombre del Worker:** `nova-crew-demo` para coincidir con `wrangler.jsonc`.
8. **Build command:** vacío, si lo permite; **Deploy command:** `npx wrangler deploy`. Cloudflare instala las dependencias Node en sus Builds. Selecciona el plan Workers **Free**.
9. Pulsa **Deploy**. La primera publicación creará automáticamente el Durable Object SQLite según `wrangler.jsonc`; no tienes que crear una base D1 ni copiar IDs.
10. Abre la URL HTTPS `https://nova-crew-demo.TU-SUBDOMINIO.workers.dev`. Concede permiso para usar la cámara cuando el coordinador pulse **Escaneo en directo**.

**Si al desplegar aparece «Worker name mismatch»:** revisa que el nombre del Worker sea `nova-crew-demo`, el del archivo `wrangler.jsonc`.
**Si aparece «missing Durable Object binding»:** comprueba que Cloudflare haya desplegado el Worker que usa `wrangler.jsonc` y no solo `public`.
**Si se muestra «Module not found» o «wrangler not found»:** comprueba que el `package.json` esté en la raíz y que la carpeta base sea `/`.

## Usuarios demo

| Tipo | Usuario | Contraseña |
|------|---------|------------|
| Trabajador, también Crew Head en svc3 | `demo` | `crew2026` |
| Coordinador normal, también HAND en svc3 | `coord` | `coord2026` |

### Prueba A: coordinación normal

- En el móvil del trabajador entra con `demo` → icono QR → **Mostrar mi QR** → NEON DISTRICT (`svc2`).
- En el móvil del coordinador entra con `coord` → icono QR → **Escanear trabajador** → NEON DISTRICT → **Escaneo en directo**.
- Apunta a la pantalla del trabajador, acepta la confirmación y observa que aparece `PRESENTE`, con nombre, equipo y horario.

### Prueba B: Crew Control

- En un móvil entra con `coord`: muestra el QR para URBAN WAVE (`svc3`) como HAND A.
- En el otro móvil entra con `demo`: escanea en ese mismo servicio como Crew Head.
- Ambos ven el registro en su servicio.

### Prueba C: servicio sin coordinador

- `demo` selecciona ELECTRA LIVE (`svc5`) → **Fichar directamente**, sin QR ni geolocalización.

Los códigos se regeneran cada vez, caducan a los 90 segundos y se consumen de forma atómica para que dos coordinadores no puedan validar el mismo código simultáneamente.

## Lo que sí y no cambia

**Sincroniza entre móviles:** inicio de sesión demo, nombre/teléfono básico, QR, fichajes y presencia.

**Solo demostración local (sin backend empresarial):** fotografías, disponibilidad, incidencias/valoraciones, documentos, formación, liquidaciones, notas de servicio y algunas confirmaciones. El cambio de nombre se transmite al nombre del trabajador del QR y a sus listados, pero puede tardar unos segundos en el dispositivo remoto.

## Seguridad y límites

Los usuarios ficticios son conocidos y se comparten entre los asistentes de una demo. Si el sitio se hace público, cualquiera puede entrar con estas credenciales y alterar los datos ficticios. No introducir información verdadera. No sirve como sistema de control horario en producción.

Cloudflare Workers Free y Durable Objects SQLite tienen cuotas diarias, pero no requieren contratar una base de datos externa. Según la disponibilidad real de tu cuenta, las cuotas pueden cambiar. Verifica en Cloudflare el estado del plan gratuito.

## Desarrollo local (opcional, no hace falta instalar nada en tu PC para publicar)

```bash
npm install
npm test
npx wrangler dev
```

No se ha probado aún con cámaras físicas en móviles ni en una cuenta real de Cloudflare; se ha verificado el backend con pruebas automatizadas de Node.js. El escáner de vídeo integrado necesita HTTPS, permiso de cámara y conectividad al CDN de jsQR.
