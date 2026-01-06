'use client';

import { useState } from 'react';
import { onboardUser } from '@/lib/store';
import { Trophy, Star, Activity, Medal } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSelect = async (level: 1 | 2 | 3 | 4) => {
        setLoading(true);
        try {
            await onboardUser(level);
            onComplete();
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
            backdropFilter: 'blur(10px)',
            background: 'rgba(15, 23, 42, 0.9)'
        }}>
            <div style={{
                background: '#1e293b', width: '100%', maxWidth: '400px',
                borderRadius: '24px', padding: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Welcome, Player! 🎾</h2>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>To find you the best matches, how would you rate your Padel experience?</p>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    <button onClick={() => handleSelect(1)} disabled={loading} className="btn-level" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                    }}>
                        <div style={{ background: 'hsl(var(--secondary))', color: 'black', padding: '8px', borderRadius: '50%' }}>
                            <Star size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Beginner</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>I am new to Padel logic/rules.</div>
                        </div>
                    </button>

                    <button onClick={() => handleSelect(2)} disabled={loading} className="btn-level" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                    }}>
                        <div style={{ background: 'hsl(var(--success))', color: 'black', padding: '8px', borderRadius: '50%' }}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Intermediate</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>I play regularly / weekly.</div>
                        </div>
                    </button>

                    <button onClick={() => handleSelect(3)} disabled={loading} className="btn-level" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                    }}>
                        <div style={{ background: 'hsl(var(--warning))', color: 'black', padding: '8px', borderRadius: '50%' }}>
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Advanced</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>I compete in tournaments.</div>
                        </div>
                    </button>

                    <button onClick={() => handleSelect(4)} disabled={loading} className="btn-level" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                    }}>
                        <div style={{ background: 'hsl(var(--destructive))', color: 'white', padding: '8px', borderRadius: '50%' }}>
                            <Medal size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Pro / Coach</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>I am a semi-pro or coach.</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
