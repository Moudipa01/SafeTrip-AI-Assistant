'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, HeatmapLayer, Polyline, Circle, Marker } from '@react-google-maps/api';
import { useSafeTripStore } from '@/lib/store';
import { ZoomIn, ZoomOut, Crosshair, Layers, Loader2 } from 'lucide-react';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6366f1" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#34d399" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#475569" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
];

export default function SafetyMap() {
  const { 
    currentLocation, 
    routes, 
    showHeatmap: showHeatmapStore, 
    toggleHeatmap,
    activeMapAction,
    setMapAction
  } = useSafeTripStore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [rawHeatmap, setRawHeatmap] = useState<any[]>([]);
  const [safetyZones, setSafetyZones] = useState<any[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['visualization'],
  });

  const center = useMemo(() => currentLocation || { lat: 22.5726, lng: 88.3639 }, [currentLocation]);

  // Load backend data
  useEffect(() => {
    fetch('/api/heatmap')
      .then((r) => r.json())
      .then((d) => {
        setRawHeatmap(d.heatmapData || d.heatmap || []);
        setSafetyZones(d.safetyZones || []);
      })
      .catch(console.error);
  }, []);

  // Compute heatmap points once API is loaded
  const heatmapData = useMemo(() => {
    if (!isLoaded || rawHeatmap.length === 0) return [];
    return rawHeatmap.map(
      (p: any) => new google.maps.LatLng(p.coordinates.lat, p.coordinates.lng)
    );
  }, [isLoaded, rawHeatmap]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const activeRoute = useMemo(() => (routes.length > 0 ? routes[routes.length - 1] : null), [routes]);

  // Handle Dynamic Map Actions (Zoom/Pin)
  useEffect(() => {
    if (activeMapAction && map && activeMapAction.type === 'zoom_pin') {
      if (activeMapAction.center) {
        map.panTo(activeMapAction.center);
      }
      if (activeMapAction.zoom) {
        map.setZoom(activeMapAction.zoom);
      }
      
      // Clear action after a few seconds so it doesn't re-trigger on every render
      const timer = setTimeout(() => {
        // We keep points but clear the "action" flag
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeMapAction, map]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#0a0e1a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm font-medium tracking-wider">INITIALIZING SAFE MAP...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ left: 'var(--sidebar-width)', top: 'var(--topbar-height)', right: 0, bottom: 0 }}>
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-6 rounded-xl border border-indigo-500/30 text-center max-w-sm shadow-2xl">
            <h3 className="text-white font-bold mb-2">Google Maps API Key Required</h3>
            <p className="text-slate-400 text-sm mb-4">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to see the real-time route.</p>
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: DARK_MAP_STYLE,
          center: center,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
        }}
      >
        {/* Heatmap Layer */}
        {showHeatmapStore && heatmapData.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.6,
              gradient: [
                'rgba(0, 255, 255, 0)',
                '#6366f1',
                '#4f46e5',
                '#4338ca',
                '#3730a3',
              ]
            }}
          />
        )}

        {/* Dynamic Action Points (Police, Hotels, etc) */}
        {activeMapAction?.points?.map((p, idx) => {
          const color = p.type === 'police' ? '#3b82f6' : '#ec4899';
          return (
            <Marker
              key={`action-point-${idx}`}
              position={p.position}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                rotation: -90,
              }}
              label={{
                text: p.label,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                className: 'map-label-action'
              }}
            />
          );
        })}

        {/* Safety Zones */}
        {safetyZones.map((zone) => {
          const color = zone.riskLevel === 'safe' ? '#10b981' : zone.riskLevel === 'moderate' ? '#f59e0b' : '#ef4444';
          return (
            <React.Fragment key={zone.id}>
              <Circle
                center={zone.center}
                radius={zone.radius}
                options={{
                  fillColor: color,
                  fillOpacity: 0.15,
                  strokeColor: color,
                  strokeOpacity: 0.4,
                  strokeWeight: 1,
                }}
              />
              <Marker
                position={zone.center}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 4,
                  fillColor: color,
                  fillOpacity: 0.8,
                  strokeWeight: 0,
                }}
                label={{
                  text: zone.name,
                  color: color,
                  fontSize: '10px',
                  fontWeight: '600',
                  className: 'map-label-bg'
                }}
              />
            </React.Fragment>
          );
        })}

        {/* AI Planned Route */}
        {activeRoute && activeRoute.waypoints && (
          <Polyline
            path={[activeRoute.origin, ...activeRoute.waypoints, activeRoute.destination]}
            options={{
              strokeColor: '#6366f1',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              icons: [
                {
                  icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
                  offset: '100%',
                  repeat: '50px'
                }
              ]
            }}
          />
        )}

        {/* Current Location Marker */}
        <Marker 
          position={center} 
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#6366f1',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      </GoogleMap>

      {/* Custom UI Controls */}
      <div className="map-controls">
        <button className="map-control-btn" onClick={() => map?.setZoom((map.getZoom() || 13) + 1)}>
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="map-control-btn" onClick={() => map?.setZoom((map.getZoom() || 13) - 1)}>
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="map-control-btn" onClick={() => map?.panTo(center)}>
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          className={`map-control-btn ${showHeatmapStore ? 'active' : ''}`}
          onClick={toggleHeatmap}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Safety Legend</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { color: '#10b981', label: 'Optimal Safe Zone' },
            { color: '#f59e0b', label: 'Moderate Caution' },
            { color: '#ef4444', label: 'High Risk Alert' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}40` }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
