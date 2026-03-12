'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import TrackingButton from '@/components/TrackingButton';
import TelemetryCard from '@/components/TelemetryCard';

// Dynamic import prevents Leaflet SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const handlePositionUpdate = useCallback((lat: number, lng: number, spd: number | null, acc: number) => {
    setPosition({ lat, lng });
    setSpeed(spd);
    setAccuracy(acc);
    setIsTracking(true);
  }, []);

  const handleTrackingStop = useCallback(() => {
    setIsTracking(false);
    setPosition(null);
    setSpeed(null);
    setAccuracy(null);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Map fills the entire screen */}
      <div className="absolute inset-0">
        <Map currentPosition={position} speed={speed} accuracy={accuracy} isTracking={isTracking} />
      </div>

      {/* Telemetry overlay */}
      <TelemetryCard
        lat={position?.lat ?? null}
        lng={position?.lng ?? null}
        speed={speed}
        accuracy={accuracy}
        isTracking={isTracking}
      />

      {/* Header bar */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 backdrop-blur-md px-6 py-2 select-none"
        style={{
          background: 'rgba(8, 6, 14, 0.88)',
          borderLeft: '3px solid #AA68FF',
          borderTop: '1px solid rgba(170,104,255,0.2)',
          borderRight: '1px solid rgba(170,104,255,0.1)',
          borderBottom: '1px solid rgba(170,104,255,0.1)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#FFFFFF', marginLeft: '4px' }}>
          DESEN<span style={{ color: '#AA68FF' }}>TRACK</span> <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>v0.0.1</span>
        </span>
      </div>

      {/* Tracking button bottom center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <TrackingButton onPositionUpdate={handlePositionUpdate} onTrackingStop={handleTrackingStop} />
      </div>
    </main>
  );
}
