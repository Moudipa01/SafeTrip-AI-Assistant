'use client';

import React from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  Shield, AlertTriangle, CheckCircle2, Clock, MapPin
} from 'lucide-react';

export default function AlertsPanel() {
  const { activePanel, alerts, acknowledgeAlert } = useSafeTripStore();

  if (activePanel !== 'alerts') return null;

  const active = alerts.filter((a) => !a.acknowledged);
  const resolved = alerts.filter((a) => a.acknowledged);

  return (
    <div className="panel" id="alerts-panel">
      <div className="glass-card-static" style={{ padding: '16px' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>
          {active.length > 0 ? `Active Alerts (${active.length})` : 'Safety Alerts'}
        </div>

        {active.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
            }}
          >
            <div
              className="animate-float"
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Shield className="w-6 h-6" style={{ color: 'var(--safe)' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--safe)', marginBottom: 4 }}>
              All Clear
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              No active alerts. Stay safe!
            </div>
          </div>
        )}

        {active.length > 0 && (
          <div className="flex flex-col gap-2">
            {active.map((alert) => {
              const severity = alert.severity || 'moderate';
              return (
                <div
                  key={alert.id}
                  className={`alert-item ${severity} animate-slide-up`}
                >
                  <div className={`alert-icon ${severity}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {alert.message}
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {alert.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location.lat.toFixed(2)}, {alert.location.lng.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div className="glass-card-static" style={{ padding: '16px' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Resolved ({resolved.length})</div>
          <div className="flex flex-col gap-2">
            {resolved.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-light)',
                  opacity: 0.6,
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--safe)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
