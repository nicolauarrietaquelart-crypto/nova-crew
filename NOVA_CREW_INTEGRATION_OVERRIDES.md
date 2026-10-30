# NOVA CREW — ajustes exclusivos de integración de Crew Control

Estos cambios pertenecen a la integración de Crew Control dentro de NOVA CREW, no al proyecto Crew Control independiente.

## Mantener al actualizar Crew Control

- Conservar el botón **Volver al Área de Empleado** de la cabecera integrada.
- Ocultar únicamente en la integración los botones internos **Duplicar** y **Salir**; no quitar otras funciones ni alterar el HTML original de Crew Control.
- Mantener el acceso al fichaje QR de NOVA CREW y su ventana de geolocalización para el coordinador.
- La lógica de presentación y navegación de la integración vive en `public/assets/crew-integration-v3.js`.
- El modo oscuro liquid glass se gestiona desde `public/assets/theme-toggle.js` y `public/assets/styles.css`.
- La disponibilidad móvil debe mostrar siempre siete columnas visibles sin desplazamiento horizontal.

Al incorporar una versión nueva de Crew Control, preservar estos ajustes de integración; nunca aplicar los selectores de ocultación en el proyecto original.
