# Recuperación del dashboard — 2026-11-01

Rama: `codex/dashboard-layout-recovery`. Pendiente de integrar en `main`.

Se recuperaron los cambios sin commit de `C:/Users/ninch/OneDrive/Documents/Weso`: reparación de layouts de escritorio colapsados y persistencia solo después de una edición manual. Se conserva el código y la demo compilada juntos en este repositorio.

Verificaciones realizadas:

- Build de `demo/insurer-portal` con sus dependencias del lockfile: correcto; reproduce `index-C7_d-LVh.js`.
- Dos pruebas de recuperación de layouts: correctas.
- Dos pruebas de ruta/recursos de Weso Flow y dos de seguridad con base local PGlite: correctas.
- ESLint de la prueba: correcto. La configuración habitual excluye la demo del portal. Al ejecutarlo con `--no-ignore`, DashboardGrid tiene cinco errores; se comparó con `main` y son las mismas cinco reglas en código preexistente (`no-explicit-any`, dos `no-empty`, `react-hooks/refs`, `react-hooks/set-state-in-effect`). No se corrigieron durante esta recuperación.
- No se realizó validación visual del dashboard ni se integró este cambio en producción.

El respaldo externo del historial, patch y archivos locales está en `C:/Users/ninch/OneDrive/Documents/Weso-git-backups/2026-11-01`.
