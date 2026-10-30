# Recuperación de la versión anterior de Weso Flow

Se encontraron las versiones históricas en `We-Solve-it-Out-App/weso-admin-hub`:

- `c916f8607dc12eb9149df7f2048ff5ce7c178471` (22 de octubre): identidad del editor con violeta `#6d34f4`, rosado `#f00090`, fondo blanco y tipografías DM Sans / Manrope.
- `e18055f`: movimiento de secciones desde el mapa completo.
- La página `src/pages/admin/WesoFlow.tsx` anterior a su extracción: biblioteca de flujos, duplicado, renombrado e historial de versiones.
- `04869b4` de `We-Solve-it-Out-App/weso-flow`: organización por proyectos.

El motor visual de esa versión ya estaba en esta copia. La biblioteca exterior verde y su desplazamiento horizontal ocultaban buena parte de las funciones. Se recuperó la identidad violeta/rosado y se organizaron los controles en tres grupos visibles: proyecto, flujo e historial. En móvil se pueden desplegar desde «Proyectos, flujos e historial».

Se habilitó una copia editable del mapa de ejemplo histórico (proveedores, operaciones y ejecución) desde la bienvenida. Las posiciones implícitas de las secciones antiguas se convierten a coordenadas explícitas al cargar el ejemplo, para cumplir el esquema público sin cambiar la disposición del diagrama. El ejemplo está identificado como histórico y no se presenta como reglas operativas vigentes.

Se conservaron la edición de pasos y conexiones, formas y colores, movimiento de secciones, deshacer/rehacer, exportaciones PDF/SVG/DOT, guardado automático, versiones, respaldos y enlaces compartidos. No se restauró el login del Hub ni se migraron sus proyectos privados. Los proyectos públicos existentes y sus enlaces siguen siendo compatibles.
