import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { iconMap, colorMap } from '@/config/categoryIcons';
import { renderToStaticMarkup } from 'react-dom/server';

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  type: 'technician' | 'client' | 'service';
  label?: string;
  status?: string;
  categoryIcon?: string;
  categoryColor?: string;
  // Additional data for detail popup
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface MapboxMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMarkerDrag?: (marker: MapMarker, newLng: number, newLat: number) => void;
  onShowDetails?: (marker: MapMarker) => void;
  className?: string;
  flyTo?: { lng: number; lat: number; zoom?: number } | null;
  draggableMarkers?: boolean;
  // Use Mapbox's GPU-rendered GeoJSON layers instead of one DOM node per marker.
  // This is important for maps with hundreds or thousands of points.
  clusterMarkers?: boolean;
}

const getMarkerColor = (type: string, status?: string, categoryColor?: string) => {
  // For technicians, use category color if available
  if (type === 'technician' && categoryColor) {
    const colorInfo = colorMap[categoryColor];
    if (colorInfo) return colorInfo.hex;
  }
  
  if (type === 'technician') {
    return status === 'available' ? '#22c55e' : status === 'busy' ? '#f59e0b' : '#6b7280';
  }
  if (type === 'client') return '#8b5cf6';
  if (type === 'service') {
    switch (status) {
      case 'pending': return '#f59e0b';      // amber
      case 'assigned': return '#22c55e';      // green
      case 'en_route': return '#3b82f6';      // blue
      case 'in_progress': return '#8b5cf6';   // purple
      case 'completed': return '#10b981';     // emerald
      case 'cancelled': return '#ef4444';     // red
      default: return '#6b7280';
    }
  }
  return '#6b7280';
};

const CLUSTER_SOURCE_ID = 'weso-map-markers';
const CLUSTER_LAYER_ID = 'weso-map-marker-clusters';
const CLUSTER_COUNT_LAYER_ID = 'weso-map-marker-cluster-count';
const UNCLUSTERED_LAYER_ID = 'weso-map-marker-points';

const markerToFeature = (marker: MapMarker) => ({
  type: 'Feature' as const,
  id: marker.id,
  geometry: {
    type: 'Point' as const,
    coordinates: [marker.lng, marker.lat] as [number, number],
  },
  properties: {
    id: marker.id,
    type: marker.type,
    label: marker.label ?? '',
    status: marker.status ?? '',
    categoryIcon: marker.categoryIcon ?? '',
    categoryColor: marker.categoryColor ?? '',
    phone: marker.phone ?? '',
    email: marker.email ?? '',
    address: marker.address ?? '',
    city: marker.city ?? '',
    country: marker.country ?? '',
    scheduledDate: marker.scheduledDate ?? '',
    scheduledTime: marker.scheduledTime ?? '',
    color: getMarkerColor(marker.type, marker.status, marker.categoryColor),
  },
});

const featureToMarker = (feature: any): MapMarker => {
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates || [0, 0];
  return {
    id: String(properties.id ?? feature.id ?? ''),
    lng: Number(coordinates[0]),
    lat: Number(coordinates[1]),
    type: properties.type as MapMarker['type'],
    label: properties.label || undefined,
    status: properties.status || undefined,
    categoryIcon: properties.categoryIcon || undefined,
    categoryColor: properties.categoryColor || undefined,
    phone: properties.phone || undefined,
    email: properties.email || undefined,
    address: properties.address || undefined,
    city: properties.city || undefined,
    country: properties.country || undefined,
    scheduledDate: properties.scheduledDate || undefined,
    scheduledTime: properties.scheduledTime || undefined,
  };
};

// Offset stacked markers to prevent overlap - uses fixed small offset
// This creates permanent separation that doesn't change with zoom
const offsetStackedMarkers = (markers: MapMarker[]): (MapMarker & { originalLng: number; originalLat: number })[] => {
  const coordMap = new Map<string, MapMarker[]>();
  
  // Group markers by coordinate (using 4 decimal places = ~11m precision)
  markers.forEach(marker => {
    const key = `${marker.lng.toFixed(4)},${marker.lat.toFixed(4)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, []);
    }
    coordMap.get(key)!.push(marker);
  });

  const result: (MapMarker & { originalLng: number; originalLat: number })[] = [];
  
  coordMap.forEach(group => {
    if (group.length === 1) {
      result.push({ ...group[0], originalLng: group[0].lng, originalLat: group[0].lat });
    } else {
      // Offset markers in a circle pattern - small fixed offset (~20 meters)
      const offsetRadius = 0.0002;
      group.forEach((marker, index) => {
        const angle = (2 * Math.PI * index) / group.length;
        result.push({
          ...marker,
          originalLng: marker.lng,
          originalLat: marker.lat,
          lng: marker.lng + offsetRadius * Math.cos(angle),
          lat: marker.lat + offsetRadius * Math.sin(angle),
        });
      });
    }
  });
  
  return result;
};

// Generate SVG icon for category
const getCategoryIconSvg = (iconName: string | undefined, color: string): string => {
  const IconComponent = iconName ? iconMap[iconName] : null;
  
  if (!IconComponent) {
    // Default fallback - just letter T
    return '';
  }
  
  try {
    const svgString = renderToStaticMarkup(
      React.createElement(IconComponent, {
        size: 16,
        color: 'white',
        strokeWidth: 2.5,
      })
    );
    return svgString;
  } catch {
    return '';
  }
};

const MapboxMap: React.FC<MapboxMapProps> = ({
  markers: rawMarkers = [],
  center = [-80.1918, 25.7617], // Miami default
  zoom = 11,
  onMarkerClick,
  onMarkerDrag,
  onShowDetails,
  className = '',
  flyTo,
  draggableMarkers = true,
  clusterMarkers = false,
}) => {
  // Mapbox throws synchronously for NaN or out-of-range coordinates. A
  // company switch can expose older/incomplete locations, so discard only
  // those markers and keep the rest of the dashboard alive.
  const markers = useMemo(
    () => rawMarkers.flatMap((marker) => {
      const lng = Number(marker.lng);
      const lat = Number(marker.lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) return [];
      return [{ ...marker, lng, lat }];
    }),
    [rawMarkers]
  );
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapLoadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: MAPBOX_TOKEN, isLoading: tokenLoading, error: tokenError } = useMapboxToken();

  useEffect(() => {
    // Wait until the token request settles; never tear the map down while it refreshes.
    if (!mapContainer.current || tokenLoading || map.current) return;

    if (!MAPBOX_TOKEN) {
      // Token request has settled (tokenLoading is false) with no token:
      // show a clear message instead of an endless spinner.
      setError(tokenError || 'Mapbox token not configured');
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    (mapboxgl as any).accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        mapLoadedRef.current = true;
        setIsLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        // Tile/source hiccups must not blank out an already-rendered map,
        // but a failure before the first load leaves nothing on screen.
        if (!mapLoadedRef.current) {
          setError('Failed to load map');
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      // Mapbox.remove() is not idempotent: removing the same map twice throws
      // during route changes and can take down the entire React tree.
      const instance = map.current;
      map.current = null;
      mapLoadedRef.current = false;
      if (instance) {
        try {
          instance.remove();
        } catch (error) {
          console.warn('Mapbox cleanup failed:', error);
        }
      }
    };
  }, [MAPBOX_TOKEN, tokenLoading, tokenError]);

  // Widget resizing changes the container without resizing the window.
  useEffect(() => {
    const instance = map.current;
    const container = mapContainer.current;
    if (!instance || !container || isLoading) return;
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [isLoading]);

  // Track if initial fit has been done
  const initialFitDone = useRef(false);

  // Large technician datasets must not become thousands of independent DOM
  // nodes. Mapbox can render the same data as a clustered GeoJSON source in
  // the GPU, leaving the React tree small and responsive.
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || isLoading) return;

    const removeClusterLayers = () => {
      [CLUSTER_COUNT_LAYER_ID, CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID].forEach((layerId) => {
        if (currentMap.getLayer(layerId)) currentMap.removeLayer(layerId);
      });
      if (currentMap.getSource(CLUSTER_SOURCE_ID)) currentMap.removeSource(CLUSTER_SOURCE_ID);
    };

    if (!clusterMarkers) {
      removeClusterLayers();
      return;
    }

    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: markers
        .filter((marker) => Number.isFinite(marker.lng) && Number.isFinite(marker.lat))
        .map(markerToFeature),
    };
    const existingSource = currentMap.getSource(CLUSTER_SOURCE_ID) as any;

    if (existingSource) {
      existingSource.setData(featureCollection);
    } else {
      currentMap.addSource(CLUSTER_SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }

    if (!currentMap.getLayer(CLUSTER_LAYER_ID)) {
      currentMap.addLayer({
        id: CLUSTER_LAYER_ID,
        type: 'circle',
        source: CLUSTER_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#8b5cf6',
            25,
            '#6366f1',
            100,
            '#4f46e5',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            25,
            23,
            100,
            28,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
    }

    if (!currentMap.getLayer(CLUSTER_COUNT_LAYER_ID)) {
      currentMap.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: 'symbol',
        source: CLUSTER_SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });
    }

    if (!currentMap.getLayer(UNCLUSTERED_LAYER_ID)) {
      currentMap.addLayer({
        id: UNCLUSTERED_LAYER_ID,
        type: 'circle',
        source: CLUSTER_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 9,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
    }

    const handleClusterClick = (event: any) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      const source = currentMap.getSource(CLUSTER_SOURCE_ID) as any;
      if (clusterId == null || !source?.getClusterExpansionZoom) return;

      source.getClusterExpansionZoom(clusterId, (error: Error | null, nextZoom: number) => {
        if (error) return;
        const coordinates = feature.geometry.coordinates as [number, number];
        currentMap.easeTo({ center: coordinates, zoom: nextZoom });
      });
    };

    const handlePointClick = (event: any) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const marker = featureToMarker(feature);
      onMarkerClick?.(marker);
      onShowDetails?.(marker);
    };

    const setPointerCursor = () => {
      currentMap.getCanvas().style.cursor = 'pointer';
    };
    const clearPointerCursor = () => {
      currentMap.getCanvas().style.cursor = '';
    };

    currentMap.on('click', CLUSTER_LAYER_ID, handleClusterClick);
    currentMap.on('click', UNCLUSTERED_LAYER_ID, handlePointClick);
    currentMap.on('mouseenter', CLUSTER_LAYER_ID, setPointerCursor);
    currentMap.on('mouseenter', UNCLUSTERED_LAYER_ID, setPointerCursor);
    currentMap.on('mouseleave', CLUSTER_LAYER_ID, clearPointerCursor);
    currentMap.on('mouseleave', UNCLUSTERED_LAYER_ID, clearPointerCursor);

    if (markers.length > 0 && !initialFitDone.current) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((marker) => bounds.extend([marker.lng, marker.lat]));
      currentMap.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      initialFitDone.current = true;
    }

    return () => {
      currentMap.off('click', CLUSTER_LAYER_ID, handleClusterClick);
      currentMap.off('click', UNCLUSTERED_LAYER_ID, handlePointClick);
      currentMap.off('mouseenter', CLUSTER_LAYER_ID, setPointerCursor);
      currentMap.off('mouseenter', UNCLUSTERED_LAYER_ID, setPointerCursor);
      currentMap.off('mouseleave', CLUSTER_LAYER_ID, clearPointerCursor);
      currentMap.off('mouseleave', UNCLUSTERED_LAYER_ID, clearPointerCursor);
    };
  }, [clusterMarkers, isLoading, markers, onMarkerClick, onShowDetails]);

  // Update markers
  useEffect(() => {
    if (!map.current || isLoading) return;

    if (clusterMarkers) {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      return;
    }

    // Guard: map may be in process of teardown
    try {
      if (!map.current.getCanvasContainer || !map.current.getCanvasContainer()) return;
    } catch {
      return;
    }

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Apply offset to stacked markers
    const offsetMarkers = offsetStackedMarkers(markers);

    // Add new markers
    offsetMarkers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      const markerColor = getMarkerColor(markerData.type, markerData.status, markerData.categoryColor);
      
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = markerColor;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.style.cursor = draggableMarkers ? 'grab' : 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // For technicians, try to use category icon
      if (markerData.type === 'technician' && markerData.categoryIcon) {
        const svgContent = getCategoryIconSvg(markerData.categoryIcon, markerColor);
        if (svgContent) {
          el.innerHTML = svgContent;
          // Style the SVG
          const svg = el.querySelector('svg');
          if (svg) {
            svg.style.width = '18px';
            svg.style.height = '18px';
          }
        } else {
          // Fallback to letter
          const icon = document.createElement('span');
          icon.style.color = 'white';
          icon.style.fontSize = '14px';
          icon.style.fontWeight = 'bold';
          icon.textContent = 'T';
          el.appendChild(icon);
        }
      } else {
        // Default letters for other types
        const icon = document.createElement('span');
        icon.style.color = 'white';
        icon.style.fontSize = '14px';
        icon.style.fontWeight = 'bold';
        icon.textContent = markerData.type === 'technician' ? 'T' : markerData.type === 'client' ? 'C' : 'S';
        el.appendChild(icon);
      }

      const marker = new mapboxgl.Marker({ 
        element: el, 
        draggable: draggableMarkers 
      })
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(map.current!);

      if (markerData.label) {
        // Create unique button ID for this marker
        const buttonId = `show-details-${markerData.id}`;
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-3 min-w-[200px]">
            <strong class="text-base">${markerData.label}</strong><br/>
            <span class="text-sm text-gray-500">${markerData.type === 'technician' ? 'Técnico' : markerData.type === 'client' ? 'Cliente' : 'Servicio'}</span>
            ${markerData.status ? `<br/><span class="text-xs" style="color: ${markerColor}">${markerData.status}</span>` : ''}
            ${draggableMarkers ? '<br/><span class="text-xs text-blue-500">Arrastra para mover</span>' : ''}
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              <button id="${buttonId}" style="
                width: 100%;
                padding: 8px 16px;
                background: linear-gradient(135deg, hsl(263, 70%, 50%), hsl(263, 70%, 60%));
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: opacity 0.2s;
              " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Mostrar Detalles
              </button>
            </div>
          </div>`
        );
        
        // Add click handler for the button after popup opens
        popup.on('open', () => {
          const button = document.getElementById(buttonId);
          if (button && onShowDetails) {
            button.addEventListener('click', (e) => {
              e.stopPropagation();
              popup.remove();
              onShowDetails(markerData);
            });
          }
        });
        
        marker.setPopup(popup);
      }

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(markerData));
      }

      // Handle drag end - use original coordinates for callback
      if (draggableMarkers && onMarkerDrag) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          // Pass original marker data with new position
          onMarkerDrag({ ...markerData, lng: markerData.originalLng, lat: markerData.originalLat }, lngLat.lng, lngLat.lat);
        });
      }

      markersRef.current.push(marker);
    });

    // Only fit bounds on first load with markers, not on every update
    if (markers.length > 0 && !initialFitDone.current) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((m) => bounds.extend([m.lng, m.lat]));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      initialFitDone.current = true;
    }
  }, [markers, isLoading, onMarkerClick, onMarkerDrag, draggableMarkers, clusterMarkers]);

  // Handle flyTo
  useEffect(() => {
    if (!map.current || isLoading || !flyTo) return;
    
    map.current.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: flyTo.zoom || 14,
      duration: 2000,
      essential: true,
    });
  }, [flyTo, isLoading]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 ${className}`}>
        <div className="text-center p-4">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please configure VITE_MAPBOX_TOKEN in your secrets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="absolute inset-0"
        // mapbox-gl adds `.mapboxgl-map`, whose stylesheet changes the
        // position back to `relative`. Keep the map viewport pinned to the
        // sized wrapper so the canvas does not collapse to 0px height.
        style={{ position: 'absolute', inset: 0 }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
