import { X, Trophy, Calendar, Clock, MapPin } from 'lucide-react';
import { Booking, Player } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { getFlagEmoji } from '@/common/countries';
import { useState, useEffect } from 'react';

interface MatchDetailsModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onJoin: (bookingId: string) => void;
    currentUserId: string;
}

export default function MatchDetailsModal({ booking, isOpen, onClose, onJoin, onLeave, currentUserId }: MatchDetailsModalProps & { onLeave?: (id: string, date: string) => void }) {
    const [publicUrl, setPublicUrl] = useState<string | null>(null);

    if (!isOpen || !booking) return null;

    const spotsLeft = 4 - (booking.participants?.length || 0);

    // Helpers to get specific slots
    const getPlayerInSlot = (slotId: string | undefined) => {
        if (!slotId) return null;
        return booking.participants?.find(p => p.id === slotId);
    };

    const slots = [
        { label: 'Player 1', id: booking.player1Id, player: getPlayerInSlot(booking.player1Id) },
        { label: 'Player 2', id: booking.player2Id, player: getPlayerInSlot(booking.player2Id) },
        { label: 'Player 3', id: booking.player3Id, player: getPlayerInSlot(booking.player3Id) },
        { label: 'Player 4', id: booking.player4Id, player: getPlayerInSlot(booking.player4Id) },
    ];

    const isParticipant = booking.participants?.some(p => p.id === currentUserId);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(5px)',
            background: 'rgba(0,0,0,0.6)'
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b', width: '100%', maxWidth: '400px',
                borderRadius: '24px', position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '24px', background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none' }}>
                        <X size={24} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Match Details</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <Calendar size={16} /> <span>{booking.date}</span>
                            <Clock size={16} style={{ marginLeft: '8px' }} /> <span>{booking.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <MapPin size={16} /> <span>{booking.clubName}</span>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '16px', borderRadius: '12px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)', height: '150px', background: '#334155'
                    }}>
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                                booking.clubName === 'Santcu Padel' ? 'Avinguda de Cerdanyola, 115, 08290 Sant Cugat del Vallès, Barcelona' :
                                    booking.clubName === 'Padel Tibidabo' ? 'Carrer de Roman Macaya, 11, Sarrià-Sant Gervasi, 08022 Barcelona' :
                                        booking.clubName
                            )}&output=embed`}
                        />
                    </div>
                </div>

                {/* Players Grid */}
                <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', opacity: 0.9 }}>Lineup</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {slots.map((slot, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                border: slot.player ? '1px solid rgba(56, 189, 248, 0.2)' : '1px dashed rgba(255,255,255,0.1)'
                            }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%', marginBottom: '8px',
                                    background: slot.player?.avatar ? `url(${supabase.storage.from('avatars').getPublicUrl(slot.player.avatar).data.publicUrl}) center/cover` : '#334155',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', color: 'white',
                                }}>
                                    {!slot.player?.avatar && (slot.player?.name?.charAt(0) || '?')}
                                </div>
                                {slot.player ? (
                                    <>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                            {slot.player.country && <span>{getFlagEmoji(slot.player.country)}</span>}
                                            {slot.player.name.split(' ')[0]}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Trophy size={10} /> {slot.player.elo || 1200}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: 'auto', marginBottom: 'auto' }}>
                                        Open Spot
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        {!isParticipant && spotsLeft > 0 ? (
                            <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={() => onJoin(booking.id)}>
                                Join Match
                            </button>
                        ) : isParticipant ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                                    onClick={() => onLeave && onLeave(booking.id, booking.date + ' ' + booking.time)}>
                                    Cancel / Leave
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                                    // Chat Link
                                    const url = `/chat/${booking.id}`;
                                    window.location.href = url;
                                }}>
                                    Open Chat
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.7, padding: '10px' }}>Match Full</div>
                        )}
                    </div>
                </div>

            </div>
        </div >
    );
}
