'use client';

import React from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  Settings as SettingsIcon, Eye, Phone, Mic, Map,
  Volume2, Bell
} from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button className={`toggle ${enabled ? 'on' : 'off'}`} onClick={onToggle}>
      <span className="toggle-knob" />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}

function SettingRow({ icon: Icon, label, description, enabled, onToggle, color = 'var(--accent-light)' }: SettingRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-light)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-sm)',
          background: `${color}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

export default function SettingsPanel() {
  const { activePanel, passiveMode, togglePassiveMode } = useSafeTripStore();
  const [autoSOS, setAutoSOS] = React.useState(true);
  const [voiceInput, setVoiceInput] = React.useState(true);
  const [showZones, setShowZones] = React.useState(true);
  const [soundAlerts, setSoundAlerts] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  if (activePanel !== 'settings') return null;

  return (
    <div className="panel" id="settings-panel">
      <div className="glass-card-static" style={{ padding: '16px' }}>
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-4 h-4" style={{ color: 'var(--accent-light)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</span>
        </div>

        {/* Safety */}
        <div className="section-label" style={{ marginBottom: 8 }}>Safety & Monitoring</div>
        <div className="flex flex-col gap-2 mb-5">
          <SettingRow
            icon={Eye}
            label="Passive Monitoring"
            description="Track location & detect anomalies"
            enabled={passiveMode}
            onToggle={togglePassiveMode}
            color="var(--safe)"
          />
          <SettingRow
            icon={Phone}
            label="Auto SOS"
            description="Trigger SOS on detected danger"
            enabled={autoSOS}
            onToggle={() => setAutoSOS(!autoSOS)}
            color="var(--danger)"
          />
          <SettingRow
            icon={Mic}
            label="Voice Input"
            description="Enable voice commands for chat"
            enabled={voiceInput}
            onToggle={() => setVoiceInput(!voiceInput)}
            color="var(--accent-light)"
          />
        </div>

        {/* Display */}
        <div className="section-label" style={{ marginBottom: 8 }}>Display & Notifications</div>
        <div className="flex flex-col gap-2">
          <SettingRow
            icon={Map}
            label="Safety Zones"
            description="Show zone overlays on map"
            enabled={showZones}
            onToggle={() => setShowZones(!showZones)}
            color="var(--safe)"
          />
          <SettingRow
            icon={Volume2}
            label="Sound Alerts"
            description="Audio alerts for safety warnings"
            enabled={soundAlerts}
            onToggle={() => setSoundAlerts(!soundAlerts)}
            color="var(--moderate)"
          />
          <SettingRow
            icon={Bell}
            label="Push Notifications"
            description="Browser notifications for alerts"
            enabled={notifications}
            onToggle={() => setNotifications(!notifications)}
            color="var(--accent-light)"
          />
        </div>
      </div>

      {/* Alert Threshold */}
      <div className="glass-card-static" style={{ padding: '16px' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Alert Threshold</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Sensitivity</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--moderate)' }}>Medium</span>
          </div>
          <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'var(--bg-tertiary)' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: '60%',
              borderRadius: 3,
              background: 'linear-gradient(90deg, var(--safe), var(--moderate))',
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '60%',
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'white',
              border: '2px solid var(--moderate)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </div>
          <div className="flex items-center justify-between" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card-static" style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>
          SafeTrip AI Guardian
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          v1.0.0 • Powered by Hugging Face AI
        </div>
      </div>
    </div>
  );
}
