# Insurer portal demo

This is an isolated build of the **actual insurer dashboard** in the local `weso-admin-hub` repository. The source manifest records the originating Git commit and file hashes. `CorporateDashboard`, `ExecutiveSummary`, `InsuranceAnalytics`, `DashboardGrid`, `InsuranceOrderDetailDialog`, `InsuranceSidebar`, the UI primitives, translations and styles are copied from that repository.

Only the data hooks are replaced by `src/fixtures.ts`. Filters, charts, layout editing, dashboard presets, widget visibility, saved custom presets, list/kanban views, pagination, search and order dialogs run through the original components. No production backend or authenticated insurer data is used. Example orders include fictional coordinates around Santiago and Valparaíso. The original map component is unchanged; the demo build substitutes MapLibre and the public CARTO Positron basemap for the authenticated Mapbox runtime. Clusters, zoom controls, markers and order details still use the original portal code. The demo exposes the summary dashboard; other portal sections and account actions are outside its scope.

The entry point supplies a local company, router and language. The authenticated application header is reduced to its title/subtitle. The unused admin-only `AppHeader` import is a null adapter.

To rebuild the static assets served by the pitch:

```sh
python3 tools/snapshot-insurer-portal.py --source /path/to/weso-admin-hub
npm --prefix demo/insurer-portal ci
npm --prefix demo/insurer-portal run build
```

Generated assets live in `public/insurer-portal`. The pitch embeds them using an iframe to preserve the portal's independent React version, Tailwind styles and layout. Use `python3 tools/snapshot-insurer-portal.py --source /path/to/weso-admin-hub` to refresh the source from the local admin repository, then rebuild.

Public demo map runtime: [MapLibre](https://maplibre.org/maplibre-gl-js/docs/) and [CARTO basemap](https://docs.carto.com/carto-for-developers/key-concepts/carto-for-deck.gl/basemaps/carto-basemap).
