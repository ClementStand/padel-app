'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, X, AlertTriangle } from 'lucide-react';
import Card from '@/components/Card';
import {
    getMatches, getCurrentUser, submitMatchScore, confirmMatchScore, disputeMatch,
    Match, Player
} from '@/lib/store';
import styles from './page.module.css';

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [user, setUser] = useState<Player | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [partner, setPartner] = useState('');
    const [opponent, setOpponent] = useState('');
    const [score, setScore] = useState('');
    const [result, setResult] = useState<'win' | 'loss' | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const u = await getCurrentUser();
        setUser(u);
        const data = await getMatches();
        setMatches(data);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!result || !score || !opponent || !user) return;

        // Create Ad-Hoc Match via Consensus Flow
        const matchId = Date.now().toString(); // Or UUID if available

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
                }
            );

            // Refresh
            await loadData();
            setShowForm(false);

            // Reset
            setOpponent('');
            setPartner('');
            setScore('');
            setResult(null);
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
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} /> Result
                </button>
            </div>

            {showForm && (
                <Card title="Input Result" className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Submit Result (Pending)
                        </button>
                    </form>
                </Card>
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
