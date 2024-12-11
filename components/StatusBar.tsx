'use client';

import React from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  Wifi, MapPin, Clock, Activity, AlertTriangle, Shield
} from 'lucide-react';

export default function StatusBar() {
  const { safetyScore: safetyObj, currentLocation, alerts, passiveMode } = useSafeTripStore();
  const [locationName, setLocationName] = React.useState<string>('');
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
  const safetyScore = safetyObj?.overall ?? 63;

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
          if (data.name) setLocationName(data.name);
        })
        .catch(console.error);
    }
  }, [currentLocation]);

  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const getScoreColor = (): string => {
    if (safetyScore >= 70) return 'var(--safe)';
    if (safetyScore >= 40) return 'var(--moderate)';
    return 'var(--danger)';
  };

  const getScoreLabel = (): string => {
    if (safetyScore >= 70) return 'Safe';
    if (safetyScore >= 40) return 'Moderate';
    return 'At Risk';
  };

  return (
    <header className="topbar" id="status-bar">
      {/* Left: Brand */}
      <div className="topbar-brand">
        <h1>SafeTrip AI Guardian</h1>
        <div className="topbar-status connected">
          <Wifi className="w-3 h-3" />
          <span>Live</span>
        </div>
      </div>

      {/* Center / Right: Metrics */}
      <div className="topbar-metrics hide-on-mobile">
        {/* Safety Score */}
        <div className="topbar-metric">
          <Shield className="w-4 h-4" style={{ color: getScoreColor() }} />
          <div className="flex flex-col">
            <span className="topbar-metric-label">Safety</span>
            <span className="topbar-metric-value" style={{ color: getScoreColor() }}>{safetyScore}</span>
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 600,
            color: getScoreColor(),
            background: `${getScoreColor()}15`,
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            {getScoreLabel()}
          </span>
        </div>

        {/* Location */}
        <div className="topbar-metric">
          <MapPin className="w-4 h-4" style={{ color: 'var(--accent-light)' }} />
          <div className="flex flex-col">
            <span className="topbar-metric-label">Location</span>
            <span className="topbar-metric-value" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {locationName || (currentLocation
                ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                : 'Acquiring...')}
            </span>
          </div>
        </div>

        {/* Active Alerts */}
        {activeAlerts > 0 && (
          <div className="topbar-metric" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
            <div className="flex flex-col">
              <span className="topbar-metric-label">Alerts</span>
              <span className="topbar-metric-value" style={{ color: 'var(--danger)' }}>
                {activeAlerts}
              </span>
            </div>
          </div>
        )}

        {/* Monitoring Status */}
        <div className="topbar-metric">
          <Activity
            className="w-4 h-4"
            style={{ color: passiveMode ? 'var(--safe)' : 'var(--text-muted)' }}
          />
          <div className="flex flex-col">
            <span className="topbar-metric-label">Monitor</span>
            <span className="topbar-metric-value" style={{
              color: passiveMode ? 'var(--safe)' : 'var(--text-muted)',
              fontSize: '12px',
            }}>
              {passiveMode ? 'Active' : 'Off'}
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Clock className="w-3.5 h-3.5" />
          <span style={{ fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{now}</span>
        </div>
      </div>
    </header>
  );
}
