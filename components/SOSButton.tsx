'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSafeTripStore } from '@/lib/store';
import { Phone, X, AlertTriangle, Shield } from 'lucide-react';

export default function SOSButton() {
  const { currentLocation, addAlert } = useSafeTripStore();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isEmergency, setIsEmergency] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  const startSOS = useCallback(() => {
    setIsActive(true);
    setCountdown(5);

    countRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const cancelSOS = () => {
    setIsActive(false);
    setCountdown(5);
    if (countRef.current) clearInterval(countRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const triggerEmergency = async () => {
    if (countRef.current) clearInterval(countRef.current);
    setIsEmergency(true);
    setIsActive(false);

    addAlert({
      id: Date.now().toString(),
      type: 'sos_triggered',
      severity: 'critical',
      message: 'SOS Emergency Triggered',
      description: 'User manually triggered SOS emergency alert',
      location: currentLocation || { lat: 0, lng: 0 },
      timestamp: new Date().toISOString(),
      acknowledged: false,
      autoTriggered: false,
    });

    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sos_trigger',
          location: currentLocation,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Continue - emergency state is set regardless
    }
  };

  const resolveEmergency = () => {
    setIsEmergency(false);
  };

  // Emergency active state
  if (isEmergency) {
    return (
      <div
        className="sos-container"
        style={{
          position: 'fixed',
          bottom: 'calc(var(--bottom-nav-height, 0px) + 16px)',
          right: 'var(--h-margin, 24px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          animation: 'slide-up 0.3s ease',
        }}
      >
        <div
          className="glass-card-static"
          style={{
            width: 280,
            padding: '16px',
            borderColor: 'rgba(220, 38, 38, 0.3)',
            background: 'rgba(220, 38, 38, 0.08)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(220, 38, 38, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle className="w-4 h-4 animate-pulse" style={{ color: 'var(--critical)' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--critical)' }}>
                EMERGENCY ACTIVE
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Contacts notified
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
            Emergency services and trusted contacts have been alerted with your location.
          </div>

          <div className="flex gap-2">
            <a
              href="tel:112"
              className="btn-danger"
              style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12 }}
            >
              <Phone className="w-3.5 h-3.5" /> Call 112
            </a>
            <button
              onClick={resolveEmergency}
              className="btn-icon"
              style={{ width: 'auto', padding: '8px 12px', fontSize: 12, gap: 4, display: 'flex', alignItems: 'center' }}
            >
              <Shield className="w-3.5 h-3.5" /> I&apos;m Safe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Countdown active
  if (isActive) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          animation: 'slide-up 0.3s ease',
        }}
      >
        <div
          className="glass-card-static"
          style={{
            width: 240,
            padding: '16px',
            borderColor: 'rgba(239, 68, 68, 0.25)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: 'var(--danger)',
              lineHeight: 1,
              marginBottom: 8,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {countdown}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Sending SOS in {countdown}s...
          </div>
          <button
            onClick={cancelSOS}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default SOS button
  return (
    <div
      className="sos-container"
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height, 0px) + 16px)',
        right: 'var(--h-margin, 24px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
      }}
    >
      <button
        id="sos-button"
        className="sos-button"
        onClick={startSOS}
        title="Emergency SOS"
      >
        <Phone className="w-5 h-5 text-white" style={{ position: 'relative', zIndex: 1 }} />
      </button>
    </div>
  );
}
