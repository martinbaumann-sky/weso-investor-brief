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
- In this clone the GitHub remote is named `github` (not `origin`): `git push github main`.
- Routes: `/` renders `InvestorBrief compact` (version for insurers); `/pitch` renders `InvestorBrief` (version for investors). Sections that are only for insurers go behind `compact &&` in `app/page.tsx`.
- Old copies that look the same and must **never** be edited: `Códigos Hackers\weso-investor-brief`, `Weso\00-investor-brief-snapshot`, `Weso\01-investor-brief-site-copy`. If a request arrives in one of those, do the work here.
- Bilingual copy (EN/ES) lives in `app/content.ts`; long sections live in their own components in `app/`; styles go at the end of `app/globals.css`.
- Check before handing off: `VERCEL=1 npm run build` and eslint on the files you touched.
