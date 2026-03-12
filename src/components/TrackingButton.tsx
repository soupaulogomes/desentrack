'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface TrackingButtonProps {
  onPositionUpdate: (lat: number, lng: number, speed: number | null, accuracy: number) => void;
  onTrackingStop: () => void;
}

export default function TrackingButton({ onPositionUpdate, onTrackingStop }: TrackingButtonProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsPending(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude: lat, longitude: lng, speed, accuracy } = position.coords;
        const speedKmh = speed !== null ? speed * 3.6 : null;

        onPositionUpdate(lat, lng, speedKmh, accuracy);

        if (accuracy <= 500) {
          await supabase.from('locations').insert({ lat, lng, speed: speedKmh });
        }

        setIsPending(false);
        setIsTracking(true);
      },
      () => { setIsPending(false); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, [onPositionUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setIsPending(false);
    onTrackingStop();
  }, [onTrackingStop]);

  const handleToggle = () => {
    if (isPending) return;
    if (isTracking) stopTracking();
    else startTracking();
  };

  const active = isTracking;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={active ? 'Parar rastreamento' : 'Começar rastreamento'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(4, 4, 4, 0.88)',
        backdropFilter: 'blur(14px)',
        border: `1px solid ${active ? 'rgba(170,104,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderLeft: `3px solid ${active ? '#AA68FF' : 'rgba(255,255,255,0.2)'}`,
        padding: '10px 18px 10px 14px',
        cursor: isPending ? 'wait' : 'pointer',
        transition: 'border-color 0.3s',
        outline: 'none',
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 7,
          letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}>
          RASTREAMENTO
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 10,
          letterSpacing: '0.15em',
          fontWeight: 700,
          color: active ? '#AA68FF' : 'rgba(255,255,255,0.4)',
          transition: 'color 0.3s',
          textTransform: 'uppercase',
        }}>
          {isPending ? 'AGUARDE...' : active ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Toggle track */}
      <div
        style={{
          position: 'relative',
          width: 44,
          height: 26,
          borderRadius: 999,
          background: active ? '#AA68FF' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${active ? '#AA68FF' : 'rgba(255,255,255,0.15)'}`,
          transition: 'background 0.3s, border-color 0.3s',
          boxShadow: active ? '0 0 12px rgba(170,104,255,0.4)' : 'none',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: active ? 'calc(100% - 22px)' : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
    </button>
  );
}
