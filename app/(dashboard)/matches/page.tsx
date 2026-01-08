'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, X, AlertTriangle, Calendar, Clock, MapPin, Users, Info } from 'lucide-react';
import Card from '@/components/Card';
import PlayerCardModal from '@/components/PlayerCardModal';
import {
    getMatches, getCurrentUser, submitMatchScore, confirmMatchScore, disputeMatch, getBookings,
    Match, Player, Booking
} from '@/lib/store';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function MatchesPage() {
    const [upcomingMatches, setUpcomingMatches] = useState<Booking[]>([]);

    // Missing state variables restoration
    const [user, setUser] = useState<Player | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [bookingsToConfirm, setBookingsToConfirm] = useState<Booking[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [partner, setPartner] = useState('');
    const [opponent, setOpponent] = useState('');
    const [score, setScore] = useState('');
    const [result, setResult] = useState<'win' | 'loss' | null>(null);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Player Card Modal State
    const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<any | null>(null);

    const START_TAGS = ['Good Game', 'Intense', 'Friendly', 'Competitive', 'Fun', 'Rainy', 'Sunny', 'Windy'];

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const u = await getCurrentUser();
        setUser(u);
        const allMatches = await getMatches();
        setMatches(allMatches);

        const allBookings = await getBookings();
        const now = new Date();

        // 1. Past Bookings (Ready for Score)
        const past = allBookings.filter(b => {
            // Create date object correctly (assuming YYYY-MM-DD and HH:MM)
            const matchDate = new Date(b.date + 'T' + b.time);
            const isPast = matchDate < now;
            const hasResult = allMatches.some(m => m.id === b.id);
            const isParticipant = b.participants?.some(p => p.id === u?.id) || b.userId === u?.id; // Robust check
            return isPast && !hasResult && b.status !== 'rejected' && isParticipant;
        });
        setBookingsToConfirm(past);

        // 2. Upcoming matches
        if (u) {
            const upcoming = allBookings.filter(b => {
                const matchDate = new Date(b.date + 'T' + b.time);
                // Check if user is ANY participant
                const isParticipant =
                    b.userId === u.id ||
                    b.player1Id === u.id ||
                    b.player2Id === u.id ||
                    b.player3Id === u.id ||
                    b.player4Id === u.id;

                return matchDate >= now && isParticipant && b.status !== 'rejected';
            }).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
            setUpcomingMatches(upcoming);
        }
    }

    const handleLeave = async (bookingId: string, dateStr: string, timeStr: string) => {
        console.log("handleLeave called using id:", bookingId);
        const matchDate = new Date(dateStr + 'T' + timeStr);
        const now = new Date();
        const diffHrs = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        let confirmMsg = "Are you sure you want to leave this match?";
        if (diffHrs < 12) {
            confirmMsg = "WARNING: Cancelling within 12 hours of the match start results in a penalty. The club admin will be notified. Are you sure you want to leave?";
        }

        if (!confirm(confirmMsg)) {
            console.log("User cancelled confirmation");
            return;
        }

        console.log("Confirmed. optimistically removing...");
        // Optimistic UI Update
        setUpcomingMatches(prev => prev.filter(b => b.id !== bookingId));

        try {
            console.log("Calling leaveMatch...");
            // Use dynamic import if consistent, or we can just call it if we add it to imports. 
            // Stick to dynamic for now but LOG it.
            const { leaveMatch } = await import('@/lib/store');
            await leaveMatch(bookingId);
            console.log("leaveMatch returned success.");

            // Re-load to ensure sync (e.g. if it was deleted or status changed)
            await loadData();
        } catch (e: any) {
            console.error("Error in handleLeave:", e);
            alert("Error leaving match: " + (e.message || e));
            await loadData(); // Revert on error
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking || !user || !result) return;

        try {
            await submitMatchScore(selectedBooking.id, score, result === 'win' ? 1 : 2, user.id, {
                date: selectedBooking.date,
                team1Names: result === 'win' ? `${user.name} & ${partner || 'Partner'}` : opponent,
                team2Names: result === 'win' ? opponent : `${user.name} & ${partner || 'Partner'}`
            }, selectedTags);
            alert("Match submitted!");
            setShowModal(false);
            loadData();
        } catch (error: any) {
            alert("Error: " + error.message);
        }
    };

    const handleConfirm = async (matchId: string) => {
        try {
            await confirmMatchScore(matchId);
            loadData();
        } catch (e: any) {
            alert("Error confirming: " + e.message);
        }
    };

    const handleDispute = async (matchId: string) => {
        const reason = prompt("Enter reason:");
        if (!reason) return;
        try {
            await disputeMatch(matchId, reason);
            loadData();
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    const pendingMatches = matches.filter(m => m.status === 'pending_confirmation');
    const completedMatches = matches.filter(m => m.status === 'completed');

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem', paddingBottom: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Matches</h1>
            </div>

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Upcoming Matches</h2>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{upcomingMatches.length} scheduled</div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {upcomingMatches.map(booking => (
                            <div key={booking.id} style={{
                                background: 'linear-gradient(145deg, hsl(var(--card)), rgba(255,255,255,0.02))',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.2)'
                            }}>
                                {/* Card Header */}
                                <div style={{
                                    padding: '1.25rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'hsl(var(--primary))', fontWeight: 600 }}>
                                            <Calendar size={16} />
                                            <span>{booking.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
                                            {booking.time}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', opacity: 0.7 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '0.8rem' }}>
                                            <span>{booking.clubName}</span>
                                            <MapPin size={14} />
                                        </div>
                                        <div style={{
                                            marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: booking.participants?.length === 4 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                            color: booking.participants?.length === 4 ? '#4ade80' : '#facc15',
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
                                        }}>
                                            {booking.participants?.length === 4 ? 'CONFIRMED' : 'LOOKING FOR PLAYERS'}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                                        <Users size={16} />
                                        <span>Lineup ({booking.participants?.length || 0}/4)</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                                        {booking.participants?.map(p => (
                                            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: p.avatar
                                                        ? `url(${p.avatar.startsWith('http') ? p.avatar : supabase.storage.from('avatars').getPublicUrl(p.avatar).data.publicUrl}) center/cover`
                                                        : '#334155',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.9rem', fontWeight: 700, color: 'white',
                                                    // border: '2px solid rgba(255,255,255,0.1)' // Removed mirror effect
                                                }}>
                                                    {p.name.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{p.name.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                        {/* Empty placeholders */}
                                        {Array.from({ length: 4 - (booking.participants?.length || 0) }).map((_, i) => (
                                            <div key={i} style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                border: '2px dashed rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: 0.3
                                            }}>
                                                <Plus size={16} />
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{
                                                borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                            onClick={() => handleLeave(booking.id, booking.date, booking.time)}
                                        >
                                            <X size={16} /> Leave
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                            onClick={() => window.location.href = `/chat/${booking.id}`}
                                        >
                                            Chat
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Past Bookings (Waiting for Score) */}
            {bookingsToConfirm.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem', color: 'hsl(var(--primary))' }}>Ready for Score</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {bookingsToConfirm.map(booking => (
                            <Card key={booking.id} style={{ border: '1px solid hsl(var(--primary))' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{booking.date} • {booking.time}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{booking.clubName}</div>
                                </div>
                                <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    Your match has finished. Enter the result.
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setSelectedBooking(booking);
                                        // Pre-fill
                                        setPartner('');
                                        setOpponent(''); // Could prefill from participants if we had names
                                        setShowModal(true);
                                    }}
                                >
                                    Enter Score
                                </button>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {showModal && selectedBooking && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <Card title="Enter Match Result" className={styles.formCard} style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>
                                Match from {selectedBooking.date}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Partner (Optional)</label>
                                <input
                                    className="input"
                                    placeholder="Name..."
                                    value={partner}
                                    onChange={e => setPartner(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Opponent(s)</label>
                                <input
                                    className="input"
                                    placeholder="Names..."
                                    required
                                    value={opponent}
                                    onChange={e => setOpponent(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Score</label>
                                <input
                                    className="input"
                                    placeholder="e.g. 6-4, 6-2"
                                    required
                                    value={score}
                                    onChange={e => setScore(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Did you win?</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className={`btn ${result === 'win' ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setResult('win')}
                                    >
                                        Yes, Won 🏆
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${result === 'loss' ? 'btn-secondary' : 'btn-outline'}`}
                                        style={{ flex: 1, backgroundColor: result === 'loss' ? 'hsl(var(--destructive))' : '' }}
                                        onClick={() => setResult('loss')}
                                    >
                                        No, Lost
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Vibe Tags</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {START_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={`btn ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline'}`}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', height: 'auto', borderRadius: '20px' }}
                                            onClick={() => {
                                                if (selectedTags.includes(tag)) setSelectedTags(prev => prev.filter(t => t !== tag));
                                                else setSelectedTags(prev => [...prev, tag]);
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Submit Result
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}



            {/* Player Card Modal */}
            <PlayerCardModal
                player={selectedPlayerForCard}
                isOpen={!!selectedPlayerForCard}
                onClose={() => setSelectedPlayerForCard(null)}
                currentUserId={user?.id || ''}
            />

            {/* Pending Matches Section */}
            {pendingMatches.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem', color: 'hsl(var(--accent))' }}>Pending Confirmation</h2>
                    {pendingMatches.map(match => (
                        <Card key={match.id} style={{ border: '1px solid hsl(var(--accent))' }}>
                            <div className={styles.matchRow}>
                                <div className={`${styles.team} ${match.winner === 1 ? styles.winner : ''}`}>
                                    {match.team1Names}
                                </div>
                                <div className={styles.scoreBadge} style={{ background: 'hsl(var(--accent))', color: 'black' }}>{match.score}</div>
                                <div className={`${styles.team} ${match.winner === 2 ? styles.winner : ''}`} style={{ textAlign: 'right' }}>
                                    {match.team2Names}
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {/* Only show actions if user didn't submit it (simulated check, assuming user can't confirm own if we strictly checked submittedBy) */}
                                {/* For MVP we allow self-confirm for testing ease, or check ID */}
                                {user && match.submittedBy !== user.id ? (
                                    <>
                                        <button className="btn btn-outline" style={{ height: '32px', fontSize: '0.8rem', borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive))' }} onClick={() => handleDispute(match.id)}>
                                            <AlertTriangle size={14} style={{ marginRight: '4px' }} /> Dispute
                                        </button>
                                        <button className="btn btn-primary" style={{ height: '32px', fontSize: '0.8rem', background: 'hsl(var(--secondary))', border: 'none' }} onClick={() => handleConfirm(match.id)}>
                                            <Check size={14} style={{ marginRight: '4px' }} /> Confirm
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center' }}>
                                        Waiting for opponents...
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <h2 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem' }}>Match History</h2>
            <div className={styles.matchList}>
                {completedMatches.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>No completed matches.</p>
                ) : (
                    completedMatches.map(match => (
                        <Card key={match.id}>
                            <div className={styles.matchRow}>
                                <div className={`${styles.team} ${match.winner === 1 ? styles.winner : ''}`}>
                                    {match.team1Names}
                                </div>
                                <div className={styles.scoreBadge}>{match.score}</div>
                                <div className={`${styles.team} ${match.winner === 2 ? styles.winner : ''}`} style={{ textAlign: 'right' }}>
                                    {match.team2Names}
                                </div>
                            </div>

                            {/* Tags Display */}
                            {match.tags && match.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', opacity: 0.8 }}>
                                    {match.tags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className={styles.eloBadge}>
                                {match.winner === 1 ? '+' : '-'}{match.eloChange} ELO
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
