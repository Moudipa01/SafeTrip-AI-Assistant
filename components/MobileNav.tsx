'use client';

import React from 'react';
import { useSafeTripStore } from '@/lib/store';
import { Map, Bell, User, Settings, MessageSquare } from 'lucide-react';

export default function MobileNav() {
  const { activePanel, setActivePanel, isChatOpen, setChatOpen } = useSafeTripStore();

  const navItems = [
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'chat', icon: MessageSquare, label: 'Guardian' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleClick = (id: string) => {
    if (id === 'chat') {
      setChatOpen(true);
      setActivePanel('chat');
    } else {
      setActivePanel(id as any);
      setChatOpen(false);
    }
  };

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const isActive = (item.id === 'chat' && isChatOpen) || (item.id === activePanel && !isChatOpen);
        
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
