'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, X, AlertTriangle } from 'lucide-react';
import Card from '@/components/Card';
import {
    getMatches, getCurrentUser, submitMatchScore, confirmMatchScore, disputeMatch, getBookings,
    Match, Player, Booking
} from '@/lib/store';
import styles from './page.module.css';

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [bookingsToConfirm, setBookingsToConfirm] = useState<Booking[]>([]);
    const [user, setUser] = useState<Player | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Form State
    const [partner, setPartner] = useState('');
    const [opponent, setOpponent] = useState('');
    const [score, setScore] = useState('');
    const [result, setResult] = useState<'win' | 'loss' | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const START_TAGS = ["Sweaty 🥵", "Chill 🍺", "Tactical 🧠", "Intense ⚡", "Fun 😂"];

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const u = await getCurrentUser();
        setUser(u);
        const allMatches = await getMatches();
        setMatches(allMatches);

        // Fetch bookings that need confirmation (Past date, Status not rejected, Not in matches list)
        // Note: Matches are separate table. We assume if a booking has a match result, the match.id == booking.id
        // or we check dates/participants. For this MVP, we use ID.
        const allBookings = await getBookings();
        const past = allBookings.filter(b => {
            const isPast = new Date(b.date + 'T' + b.time) < new Date();
            const hasResult = allMatches.some(m => m.id === b.id);
            // Check if user is in booking
            const isParticipant = b.participants?.some(p => p.id === u?.id) || b.userId === u?.id;

            return isPast && !hasResult && b.status !== 'rejected' && isParticipant;
        });
        setBookingsToConfirm(past);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!result || !score || !opponent || !user || !selectedBooking) return;

        // Use Booking ID as Match ID
        const matchId = selectedBooking.id;

        try {
            await submitMatchScore(
                matchId,
                score,
                result === 'win' ? 1 : 2,
                user.id,
                {
                    date: new Date().toISOString().split('T')[0],
                    team1Names: partner ? `You & ${partner}` : 'You',
                    team2Names: opponent
                },
                selectedTags
            );

            // Refresh
            await loadData();
            // Refresh
            await loadData();
            setShowModal(false);

            // Reset
            setOpponent('');
            setPartner('');
            setScore('');
            setResult(null);
            setSelectedTags([]);
            alert("Match submitted! It is now pending confirmation.");
        } catch (err: any) {
            alert("Error submitting match: " + err.message);
        }
    };

    const handleConfirm = async (matchId: string) => {
        try {
            await confirmMatchScore(matchId);
            await loadData();
            alert("Match confirmed! ELOs have been updated.");
        } catch (err: any) {
            alert("Error confirming: " + err.message);
        }
    };

    const handleDispute = async (matchId: string) => {
        const reason = prompt("Please provide a reason for the dispute:");
        if (!reason) return;

        try {
            await disputeMatch(matchId, reason);
            await loadData();
            alert("The captain has been notified. This will be resolved soon.");
        } catch (err: any) {
            alert("Error disputing: " + err.message);
        }
    };

    const pendingMatches = matches.filter(m => m.status === 'pending_confirmation');
    const completedMatches = matches.filter(m => m.status === 'completed');

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem', paddingBottom: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Matches</h1>
            </div>

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
