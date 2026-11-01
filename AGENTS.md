# Weso investor brief repository

This workspace is the canonical pitch site repository. Use it for all Weso pitch edits.

- Canonical GitHub repository: `https://github.com/martinbaumann-sky/weso-investor-brief`
- Work on the `main` branch, which tracks `origin/main`.
- Before editing, switch to `main`; before committing or pushing, verify that `origin` points to the canonical repository and the current branch is `main`.
- Push pitch changes only to `origin/main` unless the user explicitly requests another destination.
- Do not publish this pitch through OpenAI Sites or another hosting service unless the user explicitly asks for a deployment.
- Keep `.openai/hosting.json` limited to local build bindings; do not add a Sites project ID that links this repository to a separate hosted Site.

## Production and where to edit

- This folder (`Códigos Hackers\Weso\01-investor-brief-github`) is the **only** source for the production site **https://weso.click** (Vercel project `weso-investor-brief`, see `.vercel/project.json`).
- The GitHub remote is named `origin` in both local clones. Verify its URL before pushing.
- The clone under `Documents\Weso` is a secondary workspace. Recover pending work into the canonical clone above; do not develop the pitch in both folders.
- Routes: `/` renders `InvestorBrief compact` (version for insurers); `/pitch` renders `InvestorBrief` (version for investors). Sections that are only for insurers go behind `compact &&` in `app/page.tsx`.
- Old copies that look the same and must **never** be edited: `Códigos Hackers\weso-investor-brief`, `Weso\00-investor-brief-snapshot`, `Weso\01-investor-brief-site-copy`. If a request arrives in one of those, do the work here.
- Bilingual copy (EN/ES) lives in `app/content.ts`; long sections live in their own components in `app/`; styles go at the end of `app/globals.css`.
- Check before handing off: `VERCEL=1 npm run build` and eslint on the files you touched.

## Branches: `main` (production) and `alpha` (in review)

- `main` is production (weso.click). `alpha` preserves its own review changes and sets `showAlphaSections = true` in `app/feature-flags.ts`; it also contains funnel and claims refinements not yet approved for `main`.
- Sections hidden on `main` and visible on `alpha`: El embudo (`intake-funnel.tsx`), Reporte de siniestros (`claims-module.tsx`) and Cómo funciona Weso (`how-weso-works.tsx`). Their code stays in `main`; only the flag hides them. Do not delete them.
- Normal work goes on `main`; afterwards bring `alpha` up to date with `git checkout alpha && git merge main`.
- Never merge `alpha` into `main` as-is, because it would turn the flag on in production. To publish a section, change the flag (or the condition for that section in `app/page.tsx`) on `main` only when the user asks.
- Preserve `codex/app-screens` as historical work. Keep recovered, unapproved work on its own branch until the user asks to integrate it.
- Keep QA captures, logs and historical working copies in ignored `output/`, `tmp/` and `test-results/`; do not remove source files or published assets as part of that cleanup.
