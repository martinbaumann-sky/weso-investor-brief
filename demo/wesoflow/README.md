# Weso Flow dentro de weso.click

La fuente de Flow vive aquí, junto al sitio principal. La ruta pública es `/wesoflow`; el editor y sus recursos se sirven desde `public/wesoflow/`. No se necesita otro proyecto de hosting, cuenta de usuario ni conexión con Auth del Hub.

## Compilar

Desde la raíz del repositorio: `npm run build:flow`. El comando usa el Vite del sitio y actualiza el directorio público que se incluye en Git. Hay que confirmar tanto los cambios de esta fuente como los archivos generados. El build normal del sitio conserva esos archivos y la publicación existente de GitHub los distribuye con el resto de Weso.

## Probar

`npm --prefix demo/wesoflow ci`

`npm --prefix demo/wesoflow test`

Las pruebas de navegador usan PostgreSQL local en PGlite y no escriben datos en producción. Cubren creación, edición, persistencia, enlaces entre navegadores, conflictos, versiones, PDF, borrado, móvil, respaldos y reintentos tras fallos de red.

## Datos y enlaces

Supabase guarda los documentos nuevos en `flow_private.projects`. Las funciones `flow_link_*` validan un enlace aleatorio de 256 bits. Quien recibe el enlace puede leer, editar y eliminar ese proyecto. No existe un listado público; el navegador recuerda solo sus enlaces recientes. Conserva el enlace o descarga un respaldo para recuperar un proyecto desde otro dispositivo. El enlace se lleva en el fragmento URL y no se incluye en solicitudes al servidor de la página.

Los permisos, sesiones, políticas y tablas del Hub, incluidos los proyectos privados de Flow anteriores, permanecen separados. No se crean usuarios ni roles. La clave que aparece en la configuración es pública y no concede permisos administrativos. Las dos migraciones de esta carpeta están aplicadas en el proyecto Weso Hub `oiwpeowxfulthjomxlke`.

El guardado compara la revisión del proyecto para impedir sobrescrituras simultáneas. Ante un conflicto se conservan los cambios en pantalla y puede descargarse un respaldo antes de recargar. Los proyectos admiten hasta 100 flujos, 500 versiones y 2 MB por documento; crear proyectos tiene un límite por IP.
