// Preserve the portal's MapboxMap component while using a public basemap in
// the unauthenticated pitch demo. No insurer configuration or token is used.
import * as maplibregl from 'maplibre-gl';
import type { MapOptions, AddLayerObject } from 'maplibre-gl';
maplibregl.setWorkerUrl('/insurer-portal/map-runtime/maplibre-gl-worker.mjs');

class DemoMap extends maplibregl.Map {
  constructor(options: MapOptions) {
    super({ ...options, style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' });
  }

  addLayer(layer: AddLayerObject, before?: string) {
    if (layer.type === 'symbol' && layer.layout?.['text-font']) {
      layer = { ...layer, layout: { ...layer.layout, 'text-font': ['Open Sans Regular'] } };
    }
    return super.addLayer(layer, before);
  }

  getSource(id: string) {
    const source = super.getSource(id);
    // The original portal uses Mapbox's callback form; MapLibre uses promises.
    if (source && 'getClusterExpansionZoom' in source && !adaptedSources.has(source)) {
      const getZoom = source.getClusterExpansionZoom.bind(source);
      source.getClusterExpansionZoom = ((clusterId: number, callback?: (error: unknown, zoom?: number) => void) => {
        const promise = getZoom(clusterId);
        if (callback) promise.then(zoom => callback(null, zoom), error => callback(error));
        return promise;
      }) as typeof source.getClusterExpansionZoom;
      adaptedSources.add(source);
    }
    return source;
  }
}
const adaptedSources = new WeakSet();
export default { ...maplibregl, Map: DemoMap, accessToken: '' };
