'use client';

import React, { useState } from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  Navigation, MapPin, X, Loader2, AlertTriangle,
  Shield, Clock, Ruler, ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';

const PRESETS = [
  { name: 'Park Street (Kolkata)', lat: 22.5529, lng: 88.3519 },
  { name: 'Howrah Station', lat: 22.5836, lng: 88.3415 },
  { name: 'Salt Lake Sec V', lat: 22.5735, lng: 88.4331 },
  { name: 'India Gate (Delhi)', lat: 28.6129, lng: 77.2295 },
  { name: 'Indiranagar (BLR)', lat: 12.9719, lng: 77.6412 },
];

function getRiskColor(score: number) {
  if (score <= 25) return 'var(--safe)';
  if (score <= 50) return 'var(--moderate)';
  if (score <= 75) return 'var(--danger)';
  return 'var(--critical)';
}

function getRiskLabel(score: number) {
  if (score <= 25) return 'Low Risk';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High Risk';
  return 'Critical';
}

export default function RoutePlanner() {
  const { currentLocation, addRoute } = useSafeTripStore();

  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [originName, setOriginName] = useState<string>('');

  // Geocode current location
  React.useEffect(() => {
    if (currentLocation) {
      fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLocation),
      })
        .then(r => r.json())
        .then(data => {
          if (data.name) setOriginName(data.name);
        })
        .catch(console.error);
    }
  }, [currentLocation]);

  const selectPreset = (p: typeof PRESETS[0]) => {
    setDestination(p.name);
    setDestCoords({ lat: p.lat, lng: p.lng });
  };

  const findRoute = async () => {
    if (!currentLocation || (!destCoords && !destination)) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/route-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: currentLocation,
          destination: destCoords || destination,
          preferences: { avoidHighRisk: true, timeOfDay: new Date().getHours() },
        }),
      });
      const data = await res.json();
      setResult(data);

      if (data.route) {
        addRoute({
          id: Date.now().toString(),
          ...data.route,
        });
      }
    } catch {
      setResult({ error: 'Failed to plan route' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        id="route-planner-toggle"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 'calc(var(--sidebar-width) + 16px)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: 'var(--shadow-md)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
      >
        <Navigation className="w-4 h-4" style={{ color: 'var(--accent-light)' }} />
        Plan Safe Route
      </button>
    );
  }

  const riskScore = result?.route?.riskScore ?? result?.riskScore;
  const riskColor = riskScore != null ? getRiskColor(riskScore) : 'var(--text-muted)';

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 'calc(var(--sidebar-width) + 16px)',
        width: 360,
        zIndex: 30,
      }}
    >
      <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4" style={{ color: 'var(--accent-light)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Route Planner</span>
          </div>
          <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setIsOpen(false)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Origin */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--safe)',
                boxShadow: '0 0 6px var(--safe-glow)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {originName || (currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Getting location...')}
            </span>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--danger)',
                boxShadow: '0 0 6px var(--danger-glow)',
                flexShrink: 0,
              }}
            />
            <input
              className="input"
              placeholder="Search destination..."
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setDestCoords(null);
              }}
            />
          </div>

          {/* Presets */}
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Quick Select</div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => selectPreset(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: destination === p.name ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                    border: `1px solid ${destination === p.name ? 'var(--border-accent)' : 'var(--border-light)'}`,
                    color: destination === p.name ? 'var(--accent-light)' : 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <MapPin className="w-3 h-3" style={{ flexShrink: 0 }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Find button */}
          <button
            className="btn-primary"
            onClick={findRoute}
            disabled={isLoading || (!destination && !destCoords)}
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" /> Find Safest Route
              </>
            )}
          </button>

          {/* Results */}
          {result && riskScore != null && (
            <div className="animate-slide-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {/* Risk header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: `${riskColor}15`,
                    border: `1px solid ${riskColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color: riskColor, fontVariantNumeric: 'tabular-nums' }}>
                    {riskScore}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Route Risk Score
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: riskColor }}>
                    {getRiskLabel(riskScore)}
                  </div>
                </div>
                <button
                  className="btn-icon"
                  style={{ width: 28, height: 28, marginLeft: 'auto' }}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="stat-card" style={{ padding: 10 }}>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="stat-label" style={{ marginBottom: 0 }}>Duration</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {result.route?.estimatedTime || result.estimatedTime || '—'} min
                  </div>
                </div>
                <div className="stat-card" style={{ padding: 10 }}>
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="stat-label" style={{ marginBottom: 0 }}>Distance</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {(result.route?.distance || result.distance || 0).toFixed(1)} km
                  </div>
                </div>
              </div>

              {/* Risk bar */}
              <div style={{ marginBottom: 12 }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Risk Level</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: riskColor }}>{riskScore}/100</span>
                </div>
                <div className="safety-meter" style={{ height: 4 }}>
                  <div
                    className="safety-meter-fill"
                    style={{ width: `${riskScore}%`, background: riskColor }}
                  />
                </div>
              </div>

              {showDetails && (
                <>
                  {/* Reasoning */}
                  {(result.route?.reasoning || result.reasoning) && (
                    <div style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: `${riskColor}08`,
                      border: `1px solid ${riskColor}15`,
                      marginBottom: 10,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                    }}>
                      {result.route?.reasoning || result.reasoning}
                    </div>
                  )}

                  {/* Risk Factors */}
                  {(result.route?.riskFactors || result.riskFactors)?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3 h-3" style={{ color: 'var(--moderate)' }} />
                        <span className="section-label">Risk Factors</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {(result.route?.riskFactors || result.riskFactors).map((f: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: riskColor,
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {typeof f === 'string' ? f : f.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Tips */}
                  {(result.route?.safetyTips || result.safetyTips)?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3 h-3" style={{ color: 'var(--safe)' }} />
                        <span className="section-label">Safety Tips</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {(result.route?.safetyTips || result.safetyTips).map((t: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span style={{ color: 'var(--text-dim)', fontSize: 11, flexShrink: 0, marginTop: 1 }}>
                              {i + 1}.
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
