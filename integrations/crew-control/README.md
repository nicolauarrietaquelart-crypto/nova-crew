# Crew Control dentro de NOVA Crew

NOVA Crew sirve la interfaz original de Crew Control (actualmente **v11.2.46**, commit `2e24424` del repositorio `crew-control`) a pantalla completa en `/crew-control/`, como una app aparte con el botón **Volver al área de empleado**.

## Cómo funciona
- La interfaz no se modifica: `scripts/sync-crew-control.mjs` copia el HTML original y solo reescribe rutas de archivos e inyecta `public/crew-control/nova-bridge.js` y `nova-bridge.css`.
- Crew Control guarda un «snapshot» en `/api/services/:código`. En NOVA esa ruta la atiende `src/crew-bridge.mjs`, que construye el snapshot con los datos de NOVA (personal, categorías, horarios y fichajes del día) y devuelve los cambios a NOVA.
- Solo puede abrirlo el trabajador asignado con la categoría **CREW HEAD** en el servicio ese día, y solo para el personal de ese servicio en ese día. Cada servicio y día recibe un código interno de 6 cifras.

## Qué vuelve a NOVA
- Llegada (Presente) → entrada; fin real → salida; entrada, fin y pausa reales → horas reales del trabajador (liquidación).
- Equipo y chaleco, dietas aplicadas, valoración (media de las tres) y contacto.
- Incidencias nuevas → Incidencias de Gestoría. «Cambiar categoría» llega como solicitud; la categoría no cambia hasta que Gestoría la aplica.
- «Cerrar el día actual» → día cerrado en NOVA (bloquea cambios; Gestoría puede reabrirlo).

## Qué queda en Gestoría
Añadir o retirar personal, cargar PDF, cambiar datos del servicio o categorías y cerrar o reabrir el servicio completo. La interfaz oculta esos botones y el servidor los rechaza igualmente.

## Actualizar a una versión nueva de Crew Control
1. Copia `public/index.html`, `pause-return.js/.css`, `service-tools.js/.css` e `icon.svg` del repositorio `crew-control` a `integrations/crew-control/<versión>/`.
2. Ejecuta `node scripts/sync-crew-control.mjs integrations/crew-control/<versión>`.
3. Ejecuta `npm test` y prueba en el navegador con una cuenta Crew Head. Si el formato del snapshot cambia, adapta `src/crew-bridge.mjs`.
