'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Shield, User as UserIcon, Award } from 'lucide-react';
import Card from '@/components/Card';
import { getPlayers, Player } from '@/lib/store';
import styles from './page.module.css';

export default function ProfilePage() {
    const [user, setUser] = useState<Player | null>(null);

    useEffect(() => {
        // Determine which user is "logged in". For now, we look for 'user'.
        // In a real app auth context would provide this.
        // For this mock, we fetch the last created user if we can't find 'user', or just use 'user' logic if we want.
        // Actually, usually we should use getCurrentUser from store if we had it exposed or just find the one signed in.
        // Let's rely on localStorage 'esade_padel_current_user' if possible, or fallback.
        const stored = localStorage.getItem('esade_padel_current_user');
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            const players = getPlayers();
            // Fallback to the hardcoded 'user' or the last one
            const currentUser = players.find(p => p.id === 'user') || players[players.length - 1];
            setUser(currentUser);
        }
    }, []);

    const getFlag = (code?: string) => {
        if (!code) return '🇪🇸';
        const map: Record<string, string> = { 'ES': '🇪🇸', 'FR': '🇫🇷', 'IT': '🇮🇹', 'PT': '🇵🇹', 'DE': '🇩🇪', 'UK': '🇬🇧', 'BE': '🇧🇪', 'NL': '🇳🇱', 'SE': '🇸🇪' };
        return map[code] || '🌍';
    }

    const getAge = (dob?: string) => {
        if (!dob) return '';
        const diff = Date.now() - new Date(dob).getTime();
        const age = new Date(diff).getUTCFullYear() - 1970;
        return `${age} yo`;
    }

    if (!user) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem' }}>
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

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Current Level</div>
                    <div className={styles.statValue}>
                        {Math.round(user.elo)}
                        <span className={styles.unit}>ELO</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Matches</div>
                    <div className={styles.statValue}>{user.matchesPlayed}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Rank</div>
                    <div className={styles.statValue}>#14</div>
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
                <button className="btn btn-outline" style={{ borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive))' }}>
                    Log Out
                </button>
            </div>
        </div>
    );
}
