'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSafeTripStore } from '@/lib/store';
import {
  X, Send, Mic, MicOff, Route, Moon, AlertTriangle, Building2, Sparkles, Bot
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { icon: Route, label: 'Safest route to hostel', color: '#6366f1' },
  { icon: Moon, label: 'Is this area safe at night?', color: '#f59e0b' },
  { icon: AlertTriangle, label: 'I feel unsafe', color: '#ef4444' },
  { icon: Building2, label: 'Safe accommodations nearby', color: '#10b981' },
];

export default function ChatPanel() {
  const { isChatOpen, setChatOpen, currentLocation, setMapAction } = useSafeTripStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!isChatOpen) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          location: currentLocation,
          context: { time: new Date().toISOString() },
        }),
      });

      const data = await res.json();
      
      // Trigger map action if provided
      if (data.mapAction) {
        setMapAction(data.mapAction);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'I could not process that request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setDynamicSuggestions(data.suggestions || []);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Connection error. If you are in danger, please call emergency services immediately: 112',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      mediaRecorderRef.current?.stop();
      setIsVoiceActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.text) {
            setInput(data.text);
            sendMessage(data.text);
          }
        } catch {
          // Transcription silent fail
        } finally {
          setIsLoading(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsVoiceActive(true);
    } catch {
      // Mic access silent fail
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-panel" id="chat-panel">
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(99,102,241,0.25)',
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Safety Assistant
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--safe)' }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--safe)',
                  display: 'inline-block',
                  boxShadow: '0 0 6px var(--safe-glow)',
                }}
              />
              Active & Monitoring
            </div>
          </div>
        </div>
        <button className="btn-icon" onClick={() => setChatOpen(false)}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 20,
              padding: '40px 0',
            }}
          >
            <div
              className="animate-float"
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                border: '1px solid var(--border-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot className="w-7 h-7" style={{ color: 'var(--accent-light)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                How can I help?
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 280 }}>
                Ask about safe routes, area safety, or tap below for quick actions.
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {(messages.length === 0 ? SUGGESTIONS.map(s => s.label) : dynamicSuggestions).map((label) => (
                <button
                  key={label}
                  className="chat-suggestion"
                  onClick={() => sendMessage(label)}
                  style={{ justifyContent: 'center', textAlign: 'center', padding: '12px' }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="animate-slide-up"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 4,
              }}
            >
              <div className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', padding: '0 4px' }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}

        {isLoading && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--accent-light)' }} />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    opacity: 0.4,
                    animation: `pulse-ring 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions when conversation active */}
      {messages.length > 0 && dynamicSuggestions.length > 0 && (
        <div
          style={{
            padding: '8px 20px',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
          }}
        >
          {dynamicSuggestions.map((label) => (
            <button
              key={label}
              onClick={() => sendMessage(label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-bar">
        <button
          className="btn-icon"
          onClick={toggleVoice}
          style={isVoiceActive ? {
            background: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
            boxShadow: '0 0 12px var(--danger-glow)'
          } : undefined}
        >
          {isVoiceActive ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask about safety..."
          disabled={isLoading}
        />
        <button
          className="btn-primary"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          style={{ padding: '9px 12px', borderRadius: 'var(--radius-sm)' }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
