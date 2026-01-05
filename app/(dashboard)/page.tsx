'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Trophy, TrendingUp, Calendar, Clock, Sparkles } from 'lucide-react';
import Card from '@/components/Card';
import ProfileModal from '@/components/ProfileModal';
import EloChart from '@/components/EloChart';
import { getCurrentUser, getBookings, getPlayers, getMatches, Player, Booking } from '@/lib/store';
import styles from './page.module.css';

// Mock Data for Feed
const recentMatches = [
  { id: 1, p1: "Alex & Sarah", p2: "Mike & Tom", score: "6-4, 6-2", winner: "p1" },
  { id: 2, p1: "Javi & Luis", p2: "Carla & Ana", score: "6-7, 4-6", winner: "p2" },
];

export default function Home() {
  const [user, setUser] = useState<Player | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Get User
      const currentUser = getCurrentUser();
      setUser(currentUser);

      // 2. Get Upcoming Bookings
      const bookings = await getBookings();
      const today = new Date().toISOString().split('T')[0];
      const myUpcoming = bookings.filter(b =>
        b.status === 'confirmed' &&
        b.date >= today
      ).sort((a, b) => a.date.localeCompare(b.date));
      setUpcoming(myUpcoming);

      // 3. Get Top Players
      const allPlayers = await getPlayers();
      const sorted = [...allPlayers].sort((a, b) => b.elo - a.elo).slice(0, 5);
      setTopPlayers(sorted);
    }
    loadData();
  }, []);

  const winRate = user ? (user.matchesPlayed > 0 ? Math.round(((user.wins || 0) / user.matchesPlayed) * 100) : 0) : 0;

  // Recommendation Logic
  const [recommendedBooking, setRecommendedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadRecs() {
      if (!user) return;
      const allMatches = await getMatches();
      const allBookings = await getBookings();

      // 1. Find recent players (teammates or opponents)
      const recentPlayers = new Set<string>();
      // Simple string matching since we don't have structured IDs in Match yet
      // 'You (Clement)' is the user name in mock data. 
      // We splits names by ' & ' 
      allMatches.forEach(m => {
        const p1 = m.team1Names.split(' & ');
        const p2 = m.team2Names.split(' & ');
        const allInMatch = [...p1, ...p2];

        // If user was in this match
        if (allInMatch.some(name => name.includes('Clement') || name.includes(user.name))) {
          allInMatch.forEach(name => {
            if (!name.includes('Clement') && !name.includes(user.name)) {
              recentPlayers.add(name);
            }
          });
        }
      });

      // 2. Find pending bookings with these players
      // Pending means < 4 players or status 'pending' (if using admin flow properly)
      // We'll check for < 4 players mainly
      const found = allBookings.find(b => {
        // Safe check for participants
        const parts = (b as any).participants || []; // Type assertion until fixed in store
        if (parts.length >= 4) return false;

        // Check if any participant is in our recent list
        return parts.some((p: any) => {
          // We have to match loose strings again because 'Javi Martinez' vs 'Javi'
          return Array.from(recentPlayers).some(rp => rp.includes(p.name) || p.name.includes(rp));
        });
      });

      setRecommendedBooking(found || null);
    }
    loadRecs();
  }, [user]);

  // Determine next match for Hero section
  // Determine next match for Hero section
  const nextMatch = upcoming[0];

  if (!user) {
    return (
      <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>ESADE Padel 🎾</h1>
          <p style={{ opacity: 0.7 }}>Join the club. Play the game.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Log In
          </Link>
          <Link href="/signup" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            Create Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '1rem', paddingTop: '1.5rem', paddingBottom: '90px' }}>

      {/* 1. Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', opacity: 0.9 }}>Good evening,</h1>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user.name.split(' ')[0]}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <div className={styles.glowBadge}>
              <Sparkles size={14} fill="currentColor" />
              ELO {Math.round(user.elo)}
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', color: '#0f172a', border: '2px solid rgba(255,255,255,0.1)'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '12px', height: '12px',
              background: 'hsl(var(--primary))', borderRadius: '50%',
              border: '2px solid hsl(var(--background))'
            }} />
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Next Match) */}
      <section className={styles.heroCard}>
        <div className={styles.heroContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Semi-Finals</span>
            {nextMatch && <span>{nextMatch.clubName}</span>}
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5rem' }}>
            vs {nextMatch ? nextMatch.participants?.filter(p => !p.name.includes(user?.name || '')).map(p => p.name.split(' ')[0]).join(' & ') : "Mike & Tom"}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', opacity: 0.9 }}>
            <Clock size={18} />
            <span style={{ fontWeight: 600 }}>{nextMatch ? `${nextMatch.time} • Court 3` : "18:00 • Court 3"}</span>
          </div>

          <Link href={nextMatch ? `/matches/${nextMatch.id}` : "/matches"} className="btn" style={{ background: 'white', color: 'hsl(222, 47%, 11%)', width: '100%', fontWeight: 700 }}>
            Check Details
          </Link>
        </div>

        {/* Decorative background elements if possible, avoiding complex SVG for now */}
      </section>

      {/* 3. Stats Row Using Bento Grid */}
      {user && (
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Win Rate</div>
            <div className={`${styles.statValue} text-data`} style={{ color: 'hsl(var(--secondary))' }}>
              {winRate}%
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Rank</div>
            <div className={`${styles.statValue} text-data`} style={{ color: 'white' }}>
              #14
            </div>
          </div>
        </section>
      )}

      {/* 4. Recent Activity */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Recent Activity
        </h2>

        <div className={styles.matchList}>
          {recentMatches.map(match => {
            const isWin = match.winner === 'p1'; // Assuming user is p1 for mock
            return (
              <div key={match.id} className={styles.matchItem}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                    {match.p1} def. {match.p2}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    {match.score}
                  </div>
                </div>
                <div className={styles.indicator} style={{ background: isWin ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))' }} />
              </div>
            )
          })}
        </div>
      </section>

      {/* Top Players/Stats (Optional - keeping but pushing down or hiding? User didn't ask for it explicitly in new layout list, but 'Leaderboard' is in nav. Let's keep a simplified version or hide. User said "List of match results" is recent activity. Bottom nav has leaderboard. I'll hide Top Players from home to keep it clean as requested) */}

      {selectedPlayer && (
        <ProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

    </main>
  );
}
