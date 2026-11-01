# Weso investor brief

Repositorio del sitio y el pitch de Weso: [GitHub](https://github.com/martinbaumann-sky/weso-investor-brief), producción en [weso.click](https://weso.click) mediante el proyecto Vercel `weso-investor-brief`.

## Carpeta y remoto

La copia canónica es `C:/Users/ninch/OneDrive/Escritorio/Códigos Hackers/Weso/01-investor-brief-github`.
`C:/Users/ninch/OneDrive/Documents/Weso` es una copia secundaria; no trabajar simultáneamente en ambas.
Las carpetas `00-investor-brief-snapshot`, `01-investor-brief-site-copy` y `Códigos Hackers/weso-investor-brief` son copias históricas.

El remoto se llama `origin` y apunta a `https://github.com/martinbaumann-sky/weso-investor-brief.git`.
Antes de trabajar: `git status`, `git remote -v`, `git fetch origin`.
Con el árbol limpio, actualizar producción con `git switch main` y `git merge --ff-only origin/main`.
No usar force push ni eliminar ramas para sincronizar las copias.

## Ramas

| Rama | Uso |
| --- | --- |
| `main` | Producción; `showAlphaSections = false`. |
| `alpha` | Revisión; `showAlphaSections = true`, con sus mejoras de embudo y siniestros. Recibe los cambios de `main` sin perder su trabajo. |
| `codex/app-screens` | Trabajo histórico conservado. |
| `codex/dashboard-layout-recovery` | Recuperación de los cambios locales del dashboard, pendiente de integración. |

Después de cambios en `main`, actualizar `alpha` con `git switch alpha` y `git merge main`.
Verificar que su flag siga en `true`, validar y subir con `git push origin alpha`; volver luego a `main`.
**No fusionar `alpha` completa en `main`**: publicaría las secciones en revisión.
Un push a `main` puede activar el despliegue de Vercel. No publicar copias en otros servicios.

## Código

- `/`: pitch compacto para aseguradoras; `/pitch`: pitch completo para inversionistas.
- `app/content.ts`: textos EN/ES; `app/`: componentes; `app/globals.css`: estilos.
- `demo/insurer-portal/`: fuente del portal; `public/insurer-portal/`: demo compilada que sirve el pitch.
- Weso Flow es una aplicación independiente: su fuente, pruebas y migraciones viven en `Weso/13-weso-flow`, repositorio [weso-flow](https://github.com/We-Solve-it-Out-App/weso-flow). Este sitio conserva solo `public/wesoflow/` (copia compilada con su commit de origen en `source.json`) y la entrada `/wesoflow` para mantener los enlaces existentes. Flow no forma parte del componente del pitch.
- `output/`, `tmp/`, `test-results/`: evidencia y material temporal local, ignorados por Git. El material antes versionado permanece en el historial.
- `.env*` y `.vercel/`: configuración local ignorada. `.openai/hosting.json` solo contiene bindings locales.

## Desarrollo y validación

Requiere Node.js >=22.13.0. Instalar con `npm ci`; iniciar con `npm run dev`.

En PowerShell, validar el build de Vercel con:

```powershell
$env:VERCEL = '1'
npm run build
Remove-Item Env:VERCEL
```

Ejecutar ESLint sobre los archivos de código modificados. Las pruebas de renderizado `tests/rendered-html.test.mjs` necesitan el build de Cloudflare (`npm run build` sin `VERCEL`), cuyo servidor se genera en `dist/server/index.js`.
Para actualizar la copia compilada de Flow, ejecutar `npm run build:flow` con el repositorio independiente instalado como carpeta hermana `13-weso-flow`, o definir `WESO_FLOW_SOURCE` con su ubicación. Sus pruebas y documentación están en ese repositorio. El build habitual del sitio no necesita la fuente de Flow ni la reconstruye.
