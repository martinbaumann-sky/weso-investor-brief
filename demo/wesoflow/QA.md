# Verificación de Weso Flow — 2026-10-30

- `VERCEL=1 npm run build`: correcto; la salida del sitio incluye la ruta `/wesoflow` y todos los recursos estáticos de Flow.
- `node --test tests/wesoflow.test.mjs`: 2 pruebas correctas para redirección y recursos publicados.
- `npm --prefix demo/wesoflow test`: 2 pruebas de seguridad/base de datos y 4 pruebas de navegador correctas.
- ESLint de `app/wesoflow/route.ts` y `demo/wesoflow/vite.config.mjs`: correcto.
- Navegador sobre el servidor local del sitio, usando el backend real: entrada por `/wesoflow`, creación sin cuenta, edición, guardado, recarga del enlace compartido y eliminación del proyecto temporal correctos. Sin errores JavaScript.
- API real con clave pública y sin sesión: creación, lectura desde otro cliente, guardado y rechazo inmediato de revisiones antiguas correctos. Acceso anónimo a proyectos privados anteriores: HTTP 401. Eliminación revoca el enlace del proyecto de prueba.
- La huella de permisos, RLS, políticas de tablas públicas y funciones privadas anteriores de Flow fue idéntica antes y después de las migraciones: `3fa390978f7a9aa2fbc0198d04283732`.

La edición compartida se sincroniza por consulta periódica cada 8 segundos mientras no hay cambios locales pendientes. Un conflicto no mezcla automáticamente los diagramas; conserva el trabajo en pantalla y permite respaldarlo antes de recargar.

## Corrección de primera visita

Reproducido en producción: la biblioteca vacía conservaba el indicador de carga pese a estar lista. Se sustituyó por bienvenida con botones centrales para crear un proyecto o importar un respaldo. Los errores ya no muestran una animación de carga y permiten reintentar. La prueba nueva falló antes de la corrección por el indicador visible y pasó después. Build de producción, ESLint, 2 pruebas de ruta/recursos y las 7 pruebas de Flow (2 de seguridad y 5 de navegador) correctos.
