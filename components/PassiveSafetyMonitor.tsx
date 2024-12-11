'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useSafeTripStore } from '@/lib/store';
import { MovementData } from '@/lib/types';


export default function PassiveSafetyMonitor() {
  const {
    passiveMode,
    currentLocation,
    setCurrentLocation,
    addMovementData,
    addAlert,
    currentRoute,
    preferences,
  } = useSafeTripStore();

  const watchIdRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);

  const playAlertSound = useCallback((severity: string) => {
    try {
      const audio = new Audio(
        severity === 'critical' || severity === 'high'
          ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
          : 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
      );
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const recordAndCheck = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      const loc = { lat: latitude, lng: longitude };

      setCurrentLocation(loc);

      const movementData: MovementData = {
        timestamp: new Date().toISOString(),
        position: loc,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || 10,
      };

      addMovementData(movementData);

      // Send to tracking API
      try {
        const res = await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: loc,
            speed: speed || 0,
            heading: heading || 0,
            accuracy: accuracy || 10,
            expectedRoute: currentRoute?.waypoints,
          }),
        });

        const data = await res.json();
        if (data.alerts && data.alerts.length > 0) {
          data.alerts.forEach((alert: Parameters<typeof addAlert>[0]) => {
            addAlert(alert);
            playAlertSound(alert.severity);
          });
        }
      } catch {
        // Silent catch
      }

      lastPositionRef.current = { lat: latitude, lng: longitude, timestamp: Date.now() };
    },
    [setCurrentLocation, addMovementData, addAlert, currentRoute, playAlertSound]
  );

  // Start/stop geolocation watching
  useEffect(() => {
    if (!passiveMode || !preferences.backgroundTrackingEnabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        recordAndCheck,
        (err) => console.error('Geolocation error:', err),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [passiveMode, preferences.backgroundTrackingEnabled, recordAndCheck]);

  // Periodic safety check (every 30 seconds)
  useEffect(() => {
    if (!passiveMode) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    const checkSafety = async () => {
      if (!currentLocation) return;

      try {
        // Check for alerts
        const alertRes = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check',
            location: currentLocation,
            expectedRoute: currentRoute?.waypoints,
          }),
        });

        const alertData = await alertRes.json();
        if (alertData.newAlerts && alertData.newAlerts.length > 0) {
          alertData.newAlerts.forEach((alert: any) => {
            addAlert(alert);
            playAlertSound(alert.severity);
          });
        }

        // Update Safety Score
        const scoreRes = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: currentLocation,
            route: currentRoute,
            history: [], // Could pull from store movementHistory
          }),
        });
        const scoreData = await scoreRes.json();
        if (scoreData.score) {
          useSafeTripStore.getState().setSafetyScore(scoreData.score);
        }
      } catch {
        // Silent check fail
      }
    };

    // Run immediately then on interval
    checkSafety();
    checkIntervalRef.current = setInterval(checkSafety, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [passiveMode, currentLocation, currentRoute, addAlert]);

  // This component renders nothing - it's purely behavioral
  return null;
}
