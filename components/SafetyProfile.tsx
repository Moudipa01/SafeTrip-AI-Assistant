'use client';

import React, { useState } from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  Shield, Route, Clock, MapPin, Activity,
  Phone, UserPlus, X, AlertTriangle
} from 'lucide-react';



export default function SafetyProfile() {
  const { activePanel, safetyScore: safetyObj, trustedContacts, addTrustedContact, removeTrustedContact } =
    useSafeTripStore();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (activePanel !== 'profile') return null;

  const safetyScore = safetyObj?.overall ?? 63;
  const metrics = [
    { key: 'route', label: 'Route Safety', icon: Route, value: safetyObj?.routeSafety ?? 70 },
    { key: 'time', label: 'Time Safety', icon: Clock, value: safetyObj?.timeSafety ?? 40 },
    { key: 'area', label: 'Area Safety', icon: MapPin, value: safetyObj?.areaSafety ?? 63 },
    { key: 'behavior', label: 'Behavior', icon: Activity, value: safetyObj?.behaviorScore ?? 85 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'var(--safe)';
    if (score >= 40) return 'var(--moderate)';
    return 'var(--danger)';
  };

  const scoreColor = getScoreColor(safetyScore);
  const circumference = 2 * Math.PI * 48;
  const progress = (safetyScore / 100) * circumference;

  const handleAdd = () => {
    if (newName && newPhone) {
      addTrustedContact({
        id: Date.now().toString(),
        name: newName,
        phone: newPhone,
        relationship: 'Custom',
        notifyOnEmergency: false
      });
      setNewName('');
      setNewPhone('');
      setShowAddContact(false);
    }
  };

  return (
    <div className="panel" id="safety-profile-panel">
      {/* Score Card */}
      <div className="glass-card-static" style={{ padding: '24px', textAlign: 'center' }}>
        <div className="section-label" style={{ marginBottom: 16 }}>Personal Safety Score</div>

        <div className="score-ring" style={{ width: 120, height: 120, margin: '0 auto 16px' }}>
          <svg width={120} height={120}>
            {/* Track */}
            <circle
              cx={60} cy={60} r={48}
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth={6}
            />
            {/* Progress */}
            <circle
              cx={60} cy={60} r={48}
              fill="none"
              stroke={scoreColor}
              strokeWidth={6}
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${scoreColor})`,
                transition: 'stroke-dasharray 1s ease',
              }}
            />
          </svg>
          <span className="score-value" style={{ color: scoreColor }}>{safetyScore}</span>
        </div>

        <div
          className="risk-chip"
          style={{
            display: 'inline-flex',
            background: `${scoreColor}12`,
            color: scoreColor,
            border: `1px solid ${scoreColor}30`,
            fontSize: 11,
          }}
        >
          <Shield className="w-3 h-3" />
          {safetyScore >= 70 ? 'Good' : safetyScore >= 40 ? 'Moderate' : 'At Risk'}
        </div>
      </div>

      {/* Metrics */}
      <div className="glass-card-static" style={{ padding: '16px' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Safety Breakdown</div>
        <div className="flex flex-col gap-3">
          {metrics.map(({ key, label, icon: Icon, value }) => {
            const color = getScoreColor(value);
            return (
              <div key={key} className="flex items-center gap-3">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius-sm)',
                    background: `${color}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
                      {value}
                    </span>
                  </div>
                  <div className="safety-meter">
                    <div
                      className="safety-meter-fill"
                      style={{ width: `${value}%`, background: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Stats */}
      <div className="glass-card-static" style={{ padding: '16px' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Session Stats</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="stat-card">
            <div className="stat-label">Tracked</div>
            <div className="stat-value">1</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Monitor</div>
            <div className="stat-value" style={{ color: 'var(--safe)', fontSize: 14 }}>
              <span className="flex items-center gap-1.5">
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--safe)',
                  boxShadow: '0 0 6px var(--safe-glow)',
                  display: 'inline-block',
                }} />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="glass-card-static" style={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="section-label">Emergency Contacts</div>
          <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setShowAddContact(true)}>
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showAddContact && (
          <div
            className="animate-slide-up"
            style={{
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-accent)',
              marginBottom: 10,
            }}
          >
            <div className="flex flex-col gap-2 mb-2">
              <input
                className="input"
                placeholder="Contact name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Phone number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: 12 }} onClick={handleAdd}>
                Add
              </button>
              <button
                className="btn-icon"
                style={{ width: 'auto', padding: '6px 10px' }}
                onClick={() => setShowAddContact(false)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {trustedContacts.map((c) => (
            <div key={c.id} className="contact-card">
              <div className="contact-avatar">
                {c.relationship === 'Emergency' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.phone}</div>
              </div>
              <span
                className="risk-chip"
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  color: 'var(--accent-light)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  fontSize: 10,
                  padding: '2px 6px',
                }}
              >
                {c.relationship}
              </span>
              {!['Emergency Services', 'Local Police', 'Women Helpline'].includes(c.name) && (
                <button
                  className="btn-icon"
                  style={{ width: 24, height: 24 }}
                  onClick={() => removeTrustedContact(c.id)}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
