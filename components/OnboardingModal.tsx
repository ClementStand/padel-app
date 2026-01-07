'use client';

import { useState } from 'react';
import { onboardUser } from '@/lib/store';
import { Trophy, Star, Activity, Medal } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (elo?: number) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSelect = async (level: 1 | 2 | 3 | 4) => {
        setLoading(true);
        try {
            await onboardUser(level);

            // Map level to ELO for optimistic update (matches store.ts)
            let elo = 1000;
            if (level === 2) elo = 1200;
            if (level === 3) elo = 1450;
            if (level === 4) elo = 1700;

            onComplete(elo);
        } catch (e) {
            console.error(e);
            alert("Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(20px)',
            background: 'rgba(5, 10, 20, 0.7)' // Slightly lighter/more transparent for "glass" feel
        }}>
            <div style={{
                background: '#1e293b', width: '100%', maxWidth: '400px',
                borderRadius: '24px', padding: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(to right, #4ade80, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Welcome, Player! 🎾
                    </h2>
                    <p style={{ opacity: 0.8, fontSize: '1rem', color: '#cbd5e1' }}>
                        To find you the best matches, how would you rate your Padel experience?
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                        { level: 1, label: 'Beginner', desc: 'I am new to Padel logic/rules.', icon: Star, color: 'hsl(var(--secondary))', text: 'black', hoverBorder: 'hsl(var(--secondary))' },
                        { level: 2, label: 'Intermediate', desc: 'I play regularly / weekly.', icon: Activity, color: 'hsl(var(--success))', text: 'black', hoverBorder: 'hsl(var(--success))' },
                        { level: 3, label: 'Advanced', desc: 'I compete in tournaments.', icon: Trophy, color: 'hsl(var(--warning))', text: 'black', hoverBorder: 'hsl(var(--warning))' },
                        { level: 4, label: 'Pro / Coach', desc: 'I am a semi-pro or coach.', icon: Medal, color: 'hsl(var(--destructive))', text: 'white', hoverBorder: 'hsl(var(--destructive))' }
                    ].map((item) => (
                        <button
                            key={item.level}
                            onClick={() => !loading && handleSelect(item.level as any)}
                            disabled={loading}
                            className="btn-level"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px',
                                textAlign: 'left', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s', width: '100%',
                                opacity: loading ? 0.6 : 1,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.hoverBorder; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                            <div style={{ background: item.color, color: item.text, padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
                                <item.icon size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{item.label}</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
