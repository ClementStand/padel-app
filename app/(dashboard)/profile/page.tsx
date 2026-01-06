'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Shield, User as UserIcon, Award, LogOut } from 'lucide-react';
import Card from '@/components/Card';
import EloChart from '@/components/EloChart';
import { getPlayers, getCurrentUser, getEloHistory, getMatches, Player, EloHistory, Match } from '@/lib/store';
import { supabase } from '@/lib/supabase'; // Import the real auth
import styles from './page.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [history, setHistory] = useState<EloHistory[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);

                // Fetch History & Matches
                const h = await getEloHistory(currentUser.id);
                setHistory(h);

                const m = await getMatches();
                // Filter matches where user participated
                // Simplified check: if user created it or name is in it (mock logic for names)
                const userMatches = m.filter(match =>
                    match.team1Names.includes('You') || match.team1Names.includes(currentUser.name) ||
                    match.team2Names.includes('You') || match.team2Names.includes(currentUser.name)
                );
                setMatches(userMatches);

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') localStorage.clear();
        router.push('/login');
    };

    const getFlag = (code?: string) => {
        if (!code) return '🌍';
        const map: Record<string, string> = { 'ES': '🇪🇸', 'FR': '🇫🇷', 'IT': '🇮🇹', 'PT': '🇵🇹', 'DE': '🇩🇪', 'UK': '🇬🇧', 'BE': '🇧🇪', 'NL': '🇳🇱', 'SE': '🇸🇪' };
        return map[code] || '🌍';
    };

    const getAge = (dob?: string) => {
        if (!dob) return '';
        const diff = Date.now() - new Date(dob).getTime();
        const age = new Date(diff).getUTCFullYear() - 1970;
        return `${age} yo`;
    };

    // Calculate Streak
    const calculateStreak = () => {
        let streak = 0;
        // Sort matches by date desc (getMatches already does, but ensure)
        // We need to know if user WON.
        // Assuming 'You' is always team 1 in our mock creations or checking name logic
        // This is tricky with plain string names. relying on store.ts 'submitMatchScore' logic where 'You' is Team 1 ??
        // Actually store.ts `submitMatchScore` puts `partner ? You & Partner : You` as Team 1.
        // So for matches submitted by user, User is Team 1.
        // For matches submitted by others, User might be Team 2.

        for (const m of matches) {
            if (m.status !== 'completed') continue;

            // Check if user is Team 1
            const isTeam1 = m.team1Names.includes('You') || (user && m.team1Names.includes(user.name));
            const isTeam2 = m.team2Names.includes('You') || (user && m.team2Names.includes(user.name));

            if (!isTeam1 && !isTeam2) continue; // Should have been filtered already but sanity check

            const userWon = (isTeam1 && m.winner === 1) || (isTeam2 && m.winner === 2);

            if (userWon) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        return streak;
    };

    const currentStreak = calculateStreak();

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>User not found</div>;

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem', paddingBottom: '90px' }}>
            <header className={styles.header}>
                <div className={styles.avatar}>
                    <UserIcon size={40} color="white" />
                </div>
                <div className={styles.flagBadge}>
                    {getFlag(user.country)}
                </div>

                <h1 className={styles.name}>{user.name}</h1>
                <p className={styles.details}>
                    {user.course || 'ESADE Student'}
                    {user.year ? ` • Year ${user.year}` : ''}
                </p>
                {user.dob && <p className={styles.meta}>{getAge(user.dob)}</p>}
            </header>

            {/* ELO Chart */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem' }}>Performance History</h2>
                <Card style={{ padding: '1rem 0' }}>
                    <EloChart currentElo={user.elo} history={history} />
                </Card>
            </section>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Current Level</div>
                    <div className={styles.statValue}>
                        {Math.round(user.elo)}
                        <span className={styles.unit}>ELO</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Win Rate</div>
                    <div className={styles.statValue}>
                        {user.matchesPlayed > 0 ? Math.round((user.wins / user.matchesPlayed) * 100) : 0}%
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Streak</div>
                    <div className={styles.statValue} style={{ color: currentStreak > 2 ? 'hsl(var(--secondary))' : 'white' }}>
                        {currentStreak} <span className={styles.unit}>{currentStreak === 1 ? 'Win' : 'Wins'}</span>
                    </div>
                </div>
            </section>

            <section>
                <Card className={styles.menuCard}>
                    <Link href="/settings">
                        <div className={styles.menuItem}>
                            <Settings size={20} /> Settings
                        </div>
                    </Link>
                    <div className={styles.menuItem}>
                        <Award size={20} /> Achievements
                    </div>
                </Card>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Admin Access</h3>
                <Link href="/admin">
                    <Card className={styles.menuCard}>
                        <div className={`${styles.menuItem} ${styles.adminItem}`}>
                            <Shield size={20} /> Manager Dashboard
                        </div>
                    </Card>
                </Link>
            </section>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button
                    className="btn btn-outline"
                    style={{ borderColor: 'red', color: 'red' }}
                    onClick={handleLogout}
                >
                    <LogOut size={18} style={{ marginRight: '8px' }} />
                    Log Out
                </button>
            </div>
        </div>
    );
}