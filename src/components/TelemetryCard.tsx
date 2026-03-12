'use client';

interface TelemetryCardProps {
  lat: number | null;
  lng: number | null;
  speed: number | null;
  accuracy: number | null;
  isTracking: boolean;
}

function SignalBars({ accuracy }: { accuracy: number | null }) {
  const level =
    accuracy === null ? 0 :
    accuracy <= 20  ? 5 :
    accuracy <= 50  ? 4 :
    accuracy <= 100 ? 3 :
    accuracy <= 500 ? 2 : 1;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <div key={bar} style={{
          width: 3,
          height: 3 + bar * 2.5,
          borderRadius: 1,
          transition: 'background 0.4s',
          background: bar <= level
            ? level <= 2 ? '#f87171' : '#AA68FF'
            : 'rgba(255,255,255,0.1)',
        }} />
      ))}
    </div>
  );
}

export default function TelemetryCard({ lat, lng, speed, accuracy, isTracking }: TelemetryCardProps) {
  const fmt = (n: number | null) =>
    n !== null ? n.toFixed(5) : '—';

  const spd = speed !== null ? Math.round(speed) : null;

  const accDisplay =
    accuracy === null    ? '—'
    : accuracy >= 1000   ? `${(accuracy / 1000).toFixed(1)} km`
    : `${Math.round(accuracy)} m`;

  const gpsLabel =
    accuracy === null   ? 'Sem sinal'
    : accuracy <= 50    ? 'Ótimo'
    : accuracy <= 500   ? 'Regular'
    : 'Fraco';

  const gpsColor =
    accuracy === null   ? 'rgba(255,255,255,0.25)'
    : accuracy <= 50    ? '#AA68FF'
    : accuracy <= 500   ? 'rgba(170,104,255,0.6)'
    : '#f87171';

  return (
    <div
      className="absolute top-5 left-5 z-[1000] select-none"
      style={{
        width: 200,
        background: 'rgba(4, 4, 4, 0.93)',
        backdropFilter: 'blur(14px)',
        borderLeft: '3px solid #AA68FF',
        borderTop: '1px solid rgba(170,104,255,0.2)',
        borderRight: '1px solid rgba(170,104,255,0.08)',
        borderBottom: '1px solid rgba(170,104,255,0.08)',
        padding: '14px 16px',
      }}
    >
      {/* ── Status ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isTracking ? '#AA68FF' : 'rgba(255,255,255,0.15)',
            boxShadow: isTracking ? '0 0 8px #AA68FF' : 'none',
            transition: 'all 0.5s',
          }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 8,
            letterSpacing: '0.25em',
            color: isTracking ? '#AA68FF' : 'rgba(255,255,255,0.25)',
          }}>
            {isTracking ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <SignalBars accuracy={accuracy} />
      </div>

      {/* ── Velocidade ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 7,
          letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: 2,
        }}>
          VELOCIDADE
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 900,
            lineHeight: 1,
            color: spd !== null ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
            textShadow: spd !== null ? '0 0 20px rgba(170,104,255,0.4)' : 'none',
            transition: 'all 0.4s',
          }}>
            {spd !== null ? String(spd).padStart(3, '0') : '---'}
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            paddingBottom: 5,
          }}>
            km/h
          </span>
        </div>
      </div>

      {/* ── Divisor ── */}
      <div style={{ height: 1, background: 'rgba(170,104,255,0.15)', marginBottom: 12 }} />

      {/* ── Coordenadas ── */}
      {[
        { label: 'LAT', value: fmt(lat) },
        { label: 'LNG', value: fmt(lng) },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>
            {label}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.04em' }}>
            {value}
          </span>
        </div>
      ))}

      {/* ── Divisor ── */}
      <div style={{ height: 1, background: 'rgba(170,104,255,0.1)', margin: '8px 0 10px' }} />

      {/* ── GPS Precisão ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>
          PRECISÃO
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: '#FFFFFF' }}>
            {accDisplay}
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 7,
            color: gpsColor,
            letterSpacing: '0.12em',
          }}>
            {gpsLabel}
          </span>
        </div>
      </div>

      {/* ── Aviso sinal fraco ── */}
      {accuracy !== null && accuracy > 500 && (
        <div style={{
          marginTop: 10,
          padding: '5px 8px',
          borderLeft: '2px solid #f87171',
          background: 'rgba(248,113,113,0.07)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.15em', color: '#f87171' }}>
            ⚠ DADOS NÃO SALVOS
          </span>
        </div>
      )}
    </div>
  );
}
