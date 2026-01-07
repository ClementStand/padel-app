'use client';

import { X, Trophy, Activity, Hand, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COUNTRIES, getFlagEmoji } from '@/common/countries';

interface PlayerCardProps {
    player: any; // Using any for flexibility or standard Player interface if available in context
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
}

export default function PlayerCardModal({ player, isOpen, onClose, currentUserId }: PlayerCardProps) {
    if (!isOpen || !player) return null;

    const isMe = player.id === currentUserId;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(5px)',
            background: 'rgba(0,0,0,0.6)'
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b', width: '100%', maxWidth: '360px',
                borderRadius: '24px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header / Avatar */}
                <div style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none' }}>
                        <X size={24} />
                    </button>

                    <div style={{
                        width: '96px', height: '96px', borderRadius: '50%', marginBottom: '16px',
                        background: player.avatar ? `url(${supabase.storage.from('avatars').getPublicUrl(player.avatar).data.publicUrl}) center/cover` : '#334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', fontWeight: 700,
                        border: '4px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)'
                    }}>
                        {!player.avatar && (player.name?.charAt(0) || 'P')}
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {player.country && <span style={{ fontSize: '1.2rem' }}>{getFlagEmoji(player.country)}</span>}
                        {player.name}
                    </h2>
                    {player.country && <div style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '4px' }}>{COUNTRIES.find(c => c.code === player.country)?.name || player.country}</div>}

                    <div style={{
                        marginTop: '16px', background: 'rgba(56, 189, 248, 0.1)', color: 'hsl(var(--primary))',
                        padding: '6px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem',
                        boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Trophy size={16} /> {player.elo || 1200}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '4px' }}>Win Rate</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--secondary))' }}>
                            {player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0}%
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '4px' }}>Matches</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                            {player.matchesPlayed || 0}
                        </div>
                    </div>
                </div>

                {/* Specs */}
                <div style={{ padding: '0 24px 24px 24px' }}>
                    <h3 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '12px', fontWeight: 600 }}>Player Specs</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>
                            <Hand size={18} style={{ opacity: 0.7 }} />
                            <span style={{ fontSize: '0.9rem' }}>{player.handedness === 'left' ? 'Left Handed' : 'Right Handed'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>
                            <MapPin size={18} style={{ opacity: 0.7 }} />
                            <span style={{ fontSize: '0.9rem' }}>{player.courtSide === 'left' ? 'Left Side' : player.courtSide === 'right' ? 'Right Side' : 'Both Sides'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                {!isMe && (
                    <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                            // Logic to invite or dummy
                            alert(`Invite sent to ${player.name}!`);
                        }}>
                            Invite to Match
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
