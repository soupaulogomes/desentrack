'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, LocationRow } from '@/lib/supabase';
import type * as LeafletType from 'leaflet';

interface MapProps {
  currentPosition: { lat: number; lng: number } | null;
  speed: number | null;
  accuracy: number | null;
  isTracking: boolean;
}

export default function Map({ currentPosition, speed, accuracy, isTracking }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const markerRef = useRef<LeafletType.Marker | null>(null);       // Realtime/history marker
  const liveMarkerRef = useRef<LeafletType.Marker | null>(null);   // Immediate live-pin
  const accuracyCircleRef = useRef<LeafletType.Circle | null>(null); // GPS accuracy circle
  const polylineRef = useRef<LeafletType.Polyline | null>(null);
  const leafletRef = useRef<typeof LeafletType | null>(null);
  const positionsRef = useRef<[number, number][]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Initialize the map once — uses a cancellation flag to handle React StrictMode
  // (StrictMode runs effects twice in dev: mount → cleanup → mount)
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let localMap: LeafletType.Map | null = null;

    const initMap = async () => {
      const L = await import('leaflet');

      // Guard against StrictMode double-run after cleanup
      if (cancelled || !mapRef.current) return;

      // Guard against re-initialization if a hot-reload left the container dirty
      const container = mapRef.current as HTMLElement & { _leaflet_id?: number };
      if (container._leaflet_id) return;

      leafletRef.current = L;

      // Fix for default icons in Next.js (no bundled images)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [-14.235, -51.9253],
        zoom: 4,
        zoomControl: false,
        attributionControl: false, // Disables the "Leaflet" logo and text
      });

      // Dark tile layer – CartoDB DarkMatter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        // Attribution removed from UI but kept in source code
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      localMap = map;

      if (!cancelled) {
        mapInstanceRef.current = map;
        setMapReady(true);
      } else {
        // Effect was cleaned up while we were awaiting — destroy immediately
        map.remove();
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (localMap) {
        localMap.remove();
        localMap = null;
      }
      mapInstanceRef.current = null;
      markerRef.current = null;
      liveMarkerRef.current = null;
      accuracyCircleRef.current = null;
      polylineRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Clear all map layers when tracking stops
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    
    if (!isTracking) {
      if (liveMarkerRef.current) { liveMarkerRef.current.remove(); liveMarkerRef.current = null; }
      if (accuracyCircleRef.current) { accuracyCircleRef.current.remove(); accuracyCircleRef.current = null; }
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
      if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
      positionsRef.current = [];
    }
  }, [isTracking, mapReady]);

  // Place / move the live pin + accuracy circle immediately when currentPosition changes
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapInstanceRef.current || !currentPosition) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const latlng: [number, number] = [currentPosition.lat, currentPosition.lng];

    // Accuracy circle color: brand-40 ≤50m, brand-30 ≤500m, red >500m
    const acc = accuracy ?? 0;
    const circleColor =
      acc <= 50 ? '#AA68FF' :
      acc <= 500 ? '#D2A5FF' :
      '#f87171';

    // Draw / update accuracy circle
    if (accuracy !== null) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle(latlng, {
          radius: accuracy,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.08,
          weight: 1.5,
          opacity: 0.5,
        }).addTo(map);
      } else {
        accuracyCircleRef.current
          .setLatLng(latlng)
          .setRadius(accuracy)
          .setStyle({ color: circleColor, fillColor: circleColor });
      }
    }

    // Pin color adapts to accuracy quality
    const dotColor =
      acc <= 50 ? '#AA68FF' :
      acc <= 500 ? '#D2A5FF' :
      '#f87171';

    const neonIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:20px;height:20px;">
          <div style="
            position:absolute;inset:-8px;border-radius:50%;
            background:${dotColor}22;
            animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            width:20px;height:20px;border-radius:50%;
            background:${dotColor};
            border:3px solid #fff;
            box-shadow:0 0 12px ${dotColor},0 0 24px ${dotColor}55;
          "></div>
        </div>
        <style>
          @keyframes ping{75%,100%{transform:scale(2.2);opacity:0;}}
        </style>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (!liveMarkerRef.current) {
      liveMarkerRef.current = L.marker(latlng, { icon: neonIcon, zIndexOffset: 1000 }).addTo(map);
      map.flyTo(latlng, 16, { duration: 1.5 });
    } else {
      liveMarkerRef.current.setLatLng(latlng).setIcon(neonIcon);
      map.panTo(latlng, { animate: true, duration: 0.6 });
    }
  }, [currentPosition, accuracy, mapReady]);

  // Subscribe to Supabase Realtime for new locations
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapInstanceRef.current || !isTracking) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    // Load recent history on mount
    const loadHistory = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(500);

      if (!data || data.length === 0) return;

      const latlngs: [number, number][] = data.map((row: LocationRow) => [row.lat, row.lng]);
      positionsRef.current = latlngs;
      const last = latlngs[latlngs.length - 1];

      if (!markerRef.current) {
        markerRef.current = L.marker(last).addTo(map);
      } else {
        markerRef.current.setLatLng(last);
      }

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latlngs, {
            color: '#AA68FF',
            weight: 3,
            opacity: 0.8,
          }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latlngs);
      }

      map.flyTo(last, 15, { duration: 1.5 });
    };

    loadHistory();

    // Realtime subscription
    const channel = supabase
      .channel('locations-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'locations' },
        (payload) => {
          const row = payload.new as LocationRow;
          const latlng: [number, number] = [row.lat, row.lng];
          positionsRef.current.push(latlng);

          if (!mapInstanceRef.current || !leafletRef.current) return;
          const Lrt = leafletRef.current;
          const m = mapInstanceRef.current;

          if (!markerRef.current) {
            markerRef.current = Lrt.marker(latlng).addTo(m);
          } else {
            markerRef.current.setLatLng(latlng);
          }

          if (!polylineRef.current) {
            polylineRef.current = Lrt.polyline(positionsRef.current, {
                color: '#AA68FF',
                weight: 3,
                opacity: 0.8,
              }).addTo(m);
          } else {
            polylineRef.current.setLatLngs(positionsRef.current);
          }

          m.panTo(latlng, { animate: true, duration: 0.8 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapReady]);

  return (
    <>
      {/* Leaflet CSS loaded via CDN to avoid Next.js CSS module issues */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" style={{ background: '#1a0430' }} />
    </>
  );
}
