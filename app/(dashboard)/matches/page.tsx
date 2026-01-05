'use client';

import { useState, useEffect } from 'react';
import { Plus, Trophy } from 'lucide-react';
import Card from '@/components/Card';
import { getMatches, getPlayers, saveMatch, updatePlayer, Match, Player } from '@/lib/store';
import { calculatePadelMatchElo } from '@/lib/elo';
import styles from './page.module.css';

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [partner, setPartner] = useState('');
    const [opponent, setOpponent] = useState('');
    const [score, setScore] = useState('');
    const [result, setResult] = useState<'win' | 'loss' | null>(null);

    useEffect(() => {
        getMatches().then(data => setMatches(data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!result || !score || !opponent) return;

        // 1. Get stats
        const players = await getPlayers();
        const user = players.find(p => p.id === 'user') || players[players.length - 1];

        // Mock partner/opponent ratings since they are just text inputs right now
        // In a real app we'd select players from dropdown
        const partnerRating = 1200;
        const opponent1Rating = 1350;
        const opponent2Rating = 1350;

        // 2. Calculate ELO with new logic
        // We assume User is P1, Partner is P2, Opponents are P3 & P4
        const eloResult = calculatePadelMatchElo(
            user.elo,
            partnerRating,
            opponent1Rating,
            opponent2Rating,
            result === 'win' ? 1 : 2
        );

        // 3. Create Match
        const newMatch: Match = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            team1Names: partner ? `You & ${partner}` : 'You',
            team2Names: opponent,
            score: score,
            winner: result === 'win' ? 1 : 2,
            eloChange: eloResult.pointsExchanged
        };

        await saveMatch(newMatch);

        // 4. Update ONLY the User (since others are mocks/text)
        // In future refactor, we should update all players found in DB
        const newUser = {
            ...user,
            elo: eloResult.p1New,
            matchesPlayed: user.matchesPlayed + 1,
            wins: result === 'win' ? (user.wins || 0) + 1 : (user.wins || 0)
        };
        await updatePlayer(newUser);

        // Refresh
        const updatedMatches = await getMatches();
        setMatches(updatedMatches);
        setShowForm(false);

        // Reset form
        setOpponent('');
        setPartner('');
        setScore('');
        setResult(null);
    };

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem' }}>
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
                            Submit Result
                        </button>
                    </form>
                </Card>
            )}

            <div className={styles.matchList}>
                {matches.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>No matches recorded yet.</p>
                ) : (
                    matches.map(match => (
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
