import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';

export interface GeoHeatPoint {
  lng: number;
  lat: number;
  weight?: number;
}

interface Props {
  points: GeoHeatPoint[];
  className?: string;
  /** Fit map to the data bounds whenever the dataset changes */
  autoFit?: boolean;
}

const SOURCE_ID = 'demand-heat-src';
const LAYER_ID = 'demand-heat-layer';

const MapboxHeatmapLayer: React.FC<Props> = ({ points, className = '', autoFit = true }) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: points
        .filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat) && Math.abs(p.lng) <= 180 && Math.abs(p.lat) <= 90)
        .map((p) => ({
          type: 'Feature' as const,
          properties: { weight: p.weight ?? 1 },
          geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
        })),
    }),
    [points]
  );

  // init map
  useEffect(() => {
    if (!container.current || tokenLoading) return;
    if (!token || tokenError) {
      setError(tokenError || 'Mapbox token not configured');
      return;
    }

    (mapboxgl as any).accessToken = token;

    const m = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.08, 4.65],
      zoom: 3.2,
      attributionControl: false,
    });
    map.current = m;
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    m.on('load', () => {
      m.addSource(SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({
        id: LAYER_ID,
        type: 'heatmap',
        source: SOURCE_ID,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 5, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 9, 2.2, 14, 3.4],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(86,15,243,0)',
            0.15, 'rgba(59,130,246,0.45)',
            0.35, 'rgba(34,197,94,0.55)',
            0.55, 'rgba(250,204,21,0.7)',
            0.75, 'rgba(249,115,22,0.82)',
            1, 'rgba(220,38,38,0.92)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 12, 6, 26, 11, 42, 16, 70],
          'heatmap-opacity': 0.85,
        },
      });
      setReady(true);
    });

    m.on('error', () => setError('Failed to load map'));

    return () => {
      setReady(false);
      m.remove();
      map.current = null;
    };
  }, [token, tokenLoading, tokenError]);

  // update data
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const src = m.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(geojson as any);

    if (autoFit && geojson.features.length) {
      const b = new mapboxgl.LngLatBounds();
      geojson.features.forEach((f) => b.extend(f.geometry.coordinates as [number, number]));
      m.fitBounds(b, { padding: 60, maxZoom: 11, duration: 800 });
    }
  }, [geojson, ready, autoFit]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-xl ${className}`}>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={container} className="absolute inset-0 rounded-xl overflow-hidden" />
      {(!ready || tokenLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {ready && (
        <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-background/85 backdrop-blur px-3 py-2 border border-border/60">
          <div className="h-2 w-40 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.5), rgba(34,197,94,0.6), rgba(250,204,21,0.8), rgba(249,115,22,0.9), rgba(220,38,38,0.95))' }} />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>-</span>
            <span>{geojson.features.length}</span>
            <span>+</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxHeatmapLayer;
