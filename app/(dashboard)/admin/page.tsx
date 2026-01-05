'use client';

import { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, ArrowRight, Clock } from 'lucide-react';
import styles from './page.module.css';
import { getBookings, getPlayers, Booking, Player } from '@/lib/store';
import Link from 'next/link';

export default function DashboardPage() {
    // 1. Create State to hold the data
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. Load data from Supabase when page loads
    useEffect(() => {
        const loadData = async () => {
            const fetchedBookings = await getBookings();
            const fetchedPlayers = await getPlayers();
            setBookings(fetchedBookings);
            setPlayers(fetchedPlayers);
            setLoading(false);
        };
        loadData();
    }, []);

    // 3. Filter Logic (Now safe because we wait for data)
    const today = new Date().toISOString().split('T')[0];

    // Helper to check if a match is upcoming (future date)
    const myUpcoming = bookings.filter(b => {
        return b.status !== 'rejected' && b.date >= today;
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Show top 3 players
    const topPlayers = players.slice(0, 3);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h1 className={styles.title}>Welcome back, President!</h1>

            <div className={styles.grid}>
                {/* UPCOMING MATCHES CARD */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2><Calendar className={styles.icon} /> Your Upcoming</h2>
                    </div>
                    {myUpcoming.length > 0 ? (
                        <div className={styles.list}>
                            {myUpcoming.map(booking => (
                                <div key={booking.id} className={styles.listItem}>
                                    <div className={styles.dateBox}>
                                        <span className={styles.day}>{booking.date.split('-')[2]}</span>
                                        <span className={styles.month}>
                                            {new Date(booking.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className={styles.info}>
                                        <div className={styles.clubName}>{booking.clubName}</div>
                                        <div className={styles.time}><Clock size={14} /> {booking.time}</div>
                                    </div>
                                    <div className={`status-badge ${booking.status}`}>
                                        {booking.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No upcoming matches.</p>
                            <Link href="/book" className="btn btn-sm btn-primary">Book Court</Link>
                        </div>
                    )}
                </div>

                {/* LEADERBOARD PREVIEW CARD */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2><Trophy className={styles.icon} /> Top Players</h2>
                        <Link href="/community" className={styles.link}>View All <ArrowRight size={16} /></Link>
                    </div>
                    <div className={styles.list}>
                        {topPlayers.map((player, index) => (
                            <div key={player.id} className={styles.listItem}>
                                <div className={styles.rank}>#{index + 1}</div>
                                <div className={styles.avatar}>{player.name.charAt(0)}</div>
                                <div className={styles.info}>
                                    <div className={styles.name}>{player.name}</div>
                                    <div className={styles.subtext}>{player.wins} Wins</div>
                                </div>
                                <div className={styles.elo}>{player.elo} pts</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}