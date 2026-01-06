
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Shield, User as UserIcon, Award, LogOut, Edit2, Check, X, Hand, MapPin } from 'lucide-react';
import Card from '@/components/Card';
import EloChart from '@/components/EloChart';
import { getPlayers, getCurrentUser, getEloHistory, getMatches, updatePlayer, Player, EloHistory, Match } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [history, setHistory] = useState<EloHistory[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{ handedness: 'right' | 'left', courtSide: 'left' | 'right' | 'both' }>({ handedness: 'right', courtSide: 'both' });

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);
                setEditForm({
                    handedness: currentUser.handedness || 'right',
                    courtSide: currentUser.courtSide || 'both'
                });

                // Fetch History & Matches
                const h = await getEloHistory(currentUser.id);
                setHistory(h);

                const m = await getMatches();
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

    const handleSave = async () => {
        if (!user) return;
        try {
            await updatePlayer({
                id: user.id,
                handedness: editForm.handedness,
                courtSide: editForm.courtSide
            });
            setUser(prev => prev ? ({ ...prev, ...editForm }) : null);
            setIsEditing(false);
            alert("Profile updated!");
        } catch (e: any) {
            alert("Error saving: " + e.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') localStorage.clear();
        router.push('/login');
    };

    const calculateStreak = () => {
        let streak = 0;
        for (const m of matches) {
            if (m.status !== 'completed') continue;
            const isTeam1 = m.team1Names.includes('You') || (user && m.team1Names.includes(user.name));
            const isTeam2 = m.team2Names.includes('You') || (user && m.team2Names.includes(user.name));
            if (!isTeam1 && !isTeam2) continue;
            const userWon = (isTeam1 && m.winner === 1) || (isTeam2 && m.winner === 2);
            if (userWon) streak++; else break;
        }
        return streak;
    };

    const currentStreak = calculateStreak();

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>User not found</div>;

    return (
        <div style={{ padding: '1rem', paddingTop: '1.5rem', paddingBottom: '90px' }}>
            {/* Header Card */}
            <div style={{
                background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', borderRadius: '24px',
                padding: '24px', textAlign: 'center', position: 'relative', border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '2rem'
            }}>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%' }}
                >
                    {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                </button>

                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px auto',
                    background: user.avatar ? `url(${supabase.storage.from('avatars').getPublicUrl(user.avatar).data.publicUrl}) center/cover` : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '4px solid rgba(255,255,255,0.1)', fontSize: '2.5rem', fontWeight: 700
                }}>
                    {!user.avatar && (user.name.charAt(0) || 'P')}
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>{user.name}</h1>
                <div style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '16px' }}>{user.country} • {user.course || 'Player'}</div>

                {isEditing ? (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', opacity: 0.8 }}>Handedness</label>
                            <select
                                value={editForm.handedness}
                                onChange={(e) => setEditForm({ ...editForm, handedness: e.target.value as any })}
                                style={{ background: '#334155', border: 'none', color: 'white', padding: '8px', borderRadius: '8px' }}
                            >
                                <option value="right">Right Handed</option>
                                <option value="left">Left Handed</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.9rem', opacity: 0.8 }}>Preferred Side</label>
                            <select
                                value={editForm.courtSide}
                                onChange={(e) => setEditForm({ ...editForm, courtSide: e.target.value as any })}
                                style={{ background: '#334155', border: 'none', color: 'white', padding: '8px', borderRadius: '8px' }}
                            >
                                <option value="left">Left Side</option>
                                <option value="right">Right Side</option>
                                <option value="both">Both / Either</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '8px' }}>
                            <Check size={16} style={{ marginRight: '8px' }} /> Save Profile
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Hand size={14} /> {user.handedness ? (user.handedness === 'right' ? 'Right Handed' : 'Left Handed') : 'Set Handedness'}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} /> {user.courtSide ? (user.courtSide === 'left' ? 'Left Side' : user.courtSide === 'right' ? 'Right Side' : 'Both Sides') : 'Set Side'}
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05))', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <div className={styles.statLabel} style={{ color: '#fbbf24' }}>Current ELO</div>
                    <div className={styles.statValue} style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}>
                        {Math.round(user.elo)}
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
                    <div className={styles.statValue} style={{ color: currentStreak > 1 ? 'hsl(var(--success))' : 'white' }}>
                        {currentStreak}
                    </div>
                </div>
            </div>

            {/* ELO Chart */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem' }}>Performance History</h2>
                <Card style={{ padding: '1rem 0' }}>
                    <EloChart currentElo={user.elo} history={history} />
                </Card>
            </section>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button
                    className="btn btn-outline"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}
                    onClick={handleLogout}
                >
                    <LogOut size={18} style={{ marginRight: '8px' }} />
                    Log Out
                </button>
            </div>
        </div>
    );
}