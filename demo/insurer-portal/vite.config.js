import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdir, copyFile } from 'node:fs/promises';
export default defineConfig({
  plugins: [{ name: 'demo-map-worker', async buildStart() {
    const target = new URL('./public/map-runtime/', import.meta.url);
    await mkdir(target, { recursive: true });
    for (const name of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
      await copyFile(new URL(`./node_modules/maplibre-gl/dist/${name}`, import.meta.url), new URL(name, target));
    }
  } }],
  base: '/insurer-portal/',
  resolve: { alias: [
    { find: 'mapbox-gl/dist/mapbox-gl.css', replacement: 'maplibre-gl/dist/maplibre-gl.css' },
    { find: /^mapbox-gl$/, replacement: fileURLToPath(new URL('./src/demo-map-runtime.ts', import.meta.url)) },
    { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
  ] },
  esbuild: { jsx: 'automatic' },
  build: { outDir: '../../public/insurer-portal', emptyOutDir: true },
});
