'use client';

import dynamic from 'next/dynamic';
import { useSafeTripStore } from '@/lib/store';
import { Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';
import ChatPanel from '@/components/ChatPanel';
import SOSButton from '@/components/SOSButton';
import RoutePlanner from '@/components/RoutePlanner';
import AlertsPanel from '@/components/AlertsPanel';
import SafetyProfile from '@/components/SafetyProfile';
import SettingsPanel from '@/components/SettingsPanel';

import MobileNav from '@/components/MobileNav';

const SafetyMap = dynamic(() => import('@/components/SafetyMap'), { ssr: false });
const PassiveSafetyMonitor = dynamic(() => import('@/components/PassiveSafetyMonitor'), { ssr: false });

export default function Home() {
  const { isChatOpen, setChatOpen } = useSafeTripStore();

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Background layers */}
      <SafetyMap />

      {/* Chrome */}
      <Sidebar />
      <StatusBar />

      {/* Side panels */}
      <AlertsPanel />
      <SafetyProfile />
      <SettingsPanel />

      {/* Floating elements */}
      <RoutePlanner />
      <ChatPanel />

      {/* AI Chat FAB + SOS */}
      <div
        className="hide-on-mobile"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
        }}
      >
        {!isChatOpen && (
          <button
            id="chat-fab"
            onClick={() => setChatOpen(true)}
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <SOSButton />
      <MobileNav />

      {/* Background services */}
      <PassiveSafetyMonitor />
    </div>
  );
}
