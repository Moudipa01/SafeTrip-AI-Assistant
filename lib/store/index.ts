
import { create } from 'zustand';
import {
  Coordinates,
  ChatMessage,
  SafetyAlert,
  RiskLevel,
  RouteRecommendation,
  PersonalSafetyScore,
  MovementData,
  SafetyPreferences,
  TrustedContact,
  MapAction,
} from '../types';
import { MOCK_TRUSTED_CONTACTS } from '../db/mock-data';

interface SafeTripState {
  // Location
  currentLocation: Coordinates | null;
  setCurrentLocation: (loc: Coordinates) => void;
  destination: Coordinates | null;
  setDestination: (dest: Coordinates | null) => void;
  
  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  
  // Alerts
  alerts: SafetyAlert[];
  setAlerts: (alerts: SafetyAlert[]) => void;
  addAlert: (alert: SafetyAlert) => void;
  acknowledgeAlert: (id: string) => void;
  
  // Route
  currentRoute: RouteRecommendation | null;
  setCurrentRoute: (route: RouteRecommendation | null) => void;
  routes: RouteRecommendation[];
  addRoute: (route: RouteRecommendation) => void;
  isRoutePlanning: boolean;
  setRoutePlanning: (val: boolean) => void;
  
  // Safety Score
  safetyScore: PersonalSafetyScore | null;
  setSafetyScore: (score: PersonalSafetyScore) => void;
  
  // Movement
  movementHistory: MovementData[];
  addMovementData: (data: MovementData) => void;
  
  // Passive Mode
  passiveMode: boolean;
  togglePassiveMode: () => void;
  
  // Preferences
  preferences: SafetyPreferences;
  updatePreferences: (prefs: Partial<SafetyPreferences>) => void;
  
  // Contacts
  trustedContacts: TrustedContact[];
  addContact: (contact: TrustedContact) => void;
  removeContact: (id: string) => void;
  addTrustedContact: (contact: TrustedContact) => void;
  removeTrustedContact: (id: string) => void;
  
  // UI State
  activePanel: 'map' | 'chat' | 'alerts' | 'profile' | 'settings';
  setActivePanel: (panel: 'map' | 'chat' | 'alerts' | 'profile' | 'settings') => void;
  mapStyle: 'default' | 'satellite' | 'dark';
  setMapStyle: (style: 'default' | 'satellite' | 'dark') => void;
  showHeatmap: boolean;
  toggleHeatmap: () => void;
  
  // SOS
  sosActive: boolean;
  triggerSOS: () => void;
  cancelSOS: () => void;

  // Loading
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  
  // Map Action
  activeMapAction: MapAction | null;
  setMapAction: (action: MapAction | null) => void;
}

export const useSafeTripStore = create<SafeTripState>((set) => ({
  // Location
  currentLocation: null,
  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  destination: null,
  setDestination: (dest) => set({ destination: dest }),
  
  // Chat
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  isChatOpen: false,
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  setChatOpen: (open) => set({ isChatOpen: open }),
  
  // Alerts
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    })),
  
  // Route
  currentRoute: null,
  setCurrentRoute: (route) => set({ currentRoute: route }),
  routes: [],
  addRoute: (route) => set((s) => ({ routes: [...s.routes, route] })),
  isRoutePlanning: false,
  setRoutePlanning: (val) => set({ isRoutePlanning: val }),
  
  // Safety Score
  safetyScore: null,
  setSafetyScore: (score) => set({ safetyScore: score }),
  
  // Movement
  movementHistory: [],
  addMovementData: (data) =>
    set((s) => ({
      movementHistory: [...s.movementHistory.slice(-99), data],
    })),
  
  // Passive Mode
  passiveMode: true,
  togglePassiveMode: () => set((s) => ({ passiveMode: !s.passiveMode })),
  
  // Preferences
  preferences: {
    passiveModeEnabled: true,
    inactivityTimeout: 10,
    routeDeviationThreshold: 200,
    autoSosEnabled: false,
    voiceInputEnabled: false,
    backgroundTrackingEnabled: true,
  },
  updatePreferences: (prefs) =>
    set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
  
  // Contacts
  trustedContacts: MOCK_TRUSTED_CONTACTS,
  addContact: (contact) =>
    set((s) => ({ trustedContacts: [...s.trustedContacts, contact] })),
  removeContact: (id) =>
    set((s) => ({
      trustedContacts: s.trustedContacts.filter((c) => c.id !== id),
    })),
  addTrustedContact: (contact) =>
    set((s) => ({ trustedContacts: [...s.trustedContacts, contact] })),
  removeTrustedContact: (id) =>
    set((s) => ({
      trustedContacts: s.trustedContacts.filter((c) => c.id !== id),
    })),
  
  // UI State
  activePanel: 'map',
  setActivePanel: (panel) => set({ activePanel: panel }),
  mapStyle: 'dark',
  setMapStyle: (style) => set({ mapStyle: style }),
  showHeatmap: true,
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),
  
  // SOS
  sosActive: false,
  triggerSOS: () => set({ sosActive: true }),
  cancelSOS: () => set({ sosActive: false }),

  // Loading
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
  activeMapAction: null,
  setMapAction: (action) => set({ activeMapAction: action }),
}));
