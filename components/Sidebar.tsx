'use client';

import React from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  Shield,
  Map,
  MessageSquare,
  Bell,
  User,
  Settings,
  Eye,
  EyeOff,
  Navigation,
} from 'lucide-react';

const navItems = [
  { id: 'map', icon: Map, label: 'Safety Map' },
  { id: 'chat', icon: MessageSquare, label: 'AI Assistant' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'profile', icon: User, label: 'Safety Profile' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const;

export default function Sidebar() {
  const {
    activePanel,
    setActivePanel,
    isChatOpen,
    setChatOpen,
    passiveMode,
    togglePassiveMode,
    alerts,
  } = useSafeTripStore();

  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;

  const handleNav = (id: string) => {
    if (id === 'chat') {
      setChatOpen(!isChatOpen);
      return;
    }
    setActivePanel(activePanel === id ? 'map' : id as 'map' | 'alerts' | 'profile' | 'settings');
  };

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Shield className="w-5 h-5 text-white" />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => handleNav(id)}
            className={`sidebar-item ${
              (id === 'chat' && isChatOpen) || (id !== 'chat' && activePanel === id)
                ? 'active'
                : ''
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            {id === 'alerts' && activeAlerts > 0 && (
              <span className="badge">{activeAlerts}</span>
            )}
            <span className="sidebar-tooltip">{label}</span>
          </button>
        ))}

        <div className="sidebar-divider" />

        {/* Passive Mode Toggle */}
        <button
          id="passive-mode-toggle"
          onClick={togglePassiveMode}
          className={`sidebar-item ${passiveMode ? 'active' : ''}`}
          style={passiveMode ? {
            background: 'rgba(16, 185, 129, 0.12)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
            color: '#10b981',
          } : undefined}
        >
          {passiveMode ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
          <span className="sidebar-tooltip">{passiveMode ? 'Monitoring Active' : 'Monitoring Off'}</span>
        </button>
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center gap-1 mt-auto">
        <button className="sidebar-item" style={{ color: 'var(--safe)' }}>
          <Navigation className="w-[18px] h-[18px]" />
          <span className="sidebar-tooltip">Navigation</span>
        </button>
      </div>
    </aside>
  );
}
