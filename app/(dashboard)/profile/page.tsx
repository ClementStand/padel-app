'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Shield, User as UserIcon, Award, LogOut } from 'lucide-react';
import Card from '@/components/Card';
import { getPlayers, Player } from '@/lib/store';
import { supabase } from '@/lib/supabase'; // Import the real auth
import styles from './page.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Ask Supabase who is currently logged in
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    // If no one is logged in, send them to login page
                    router.push('/login');
                    return;
                }

                // 2. Fetch all players from DB (Async!)
                const players = await getPlayers();

                // 3. Find the specific profile matching the logged-in ID
                const currentUser = players.find(p => p.id === authUser.id);

                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const handleLogout = async () => {
        // Sign out from Supabase and clear local data
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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>User not found</div>;

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
                    <div className={styles.statValue}>#{/* Rank calculation could go here */} --</div>
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