'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Trophy, TrendingUp, Calendar, Clock, Sparkles } from 'lucide-react';
import Card from '@/components/Card';
import ProfileModal from '@/components/ProfileModal';
import MatchDetailsModal from '@/components/MatchDetailsModal'; // NEW
import EloChart from '@/components/EloChart';
import { getCurrentUser, getBookings, getPlayers, getMatches, getRecommendedMatches, joinMatch, Player, Booking, Match } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

// Mock Data for Feed


export default function Home() {
  const [user, setUser] = useState<Player | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    async function loadData() {
      // 1. Get User
      // 1. Get User
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        // Session might exist but profile/user fetch failed. Redirect to login.
        // Also sign out to clear potentially bad session.
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }

      setUser(currentUser);

      // 2. Get Upcoming Bookings
      const bookings = await getBookings();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const myUpcoming = bookings.filter(b => {
        const bDate = new Date(b.date + 'T' + b.time);
        const isParticipant = (b.participants || []).some(p => p.id === currentUser.id) || b.userId === currentUser.id;
        return (b.status === 'confirmed' || b.status === 'open') && // Allow open as upcoming if I'm in it
          bDate >= today &&
          isParticipant;
      }).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

      setUpcoming(myUpcoming);



      // 3. Get Recent Activity (Finished Matches)
      const allMatches = await getMatches();
      // Filter for user involvement
      const myMatches = allMatches.filter(m =>
        m.status === 'completed' &&
        (m.team1Names.includes('You') || m.team1Names.includes(currentUser.name) ||
          m.team2Names.includes('You') || m.team2Names.includes(currentUser.name))
      ).slice(0, 5); // Take top 5
      setRecentMatches(myMatches);

      // 4. Calculate Streak (Simplified Logic matching Profile)
      let streak = 0;
      for (const m of myMatches) {
        const isTeam1 = m.team1Names.includes('You') || m.team1Names.includes(currentUser.name);
        const isTeam2 = m.team2Names.includes('You') || m.team2Names.includes(currentUser.name);

        if (!isTeam1 && !isTeam2) continue;

        const userWon = (isTeam1 && m.winner === 1) || (isTeam2 && m.winner === 2);
        if (userWon) streak++;
        else break;
      }
      setCurrentStreak(streak);
    }
    loadData();
  }, []);

  const winRate = user ? (user.matchesPlayed > 0 ? Math.round(((user.wins || 0) / user.matchesPlayed) * 100) : 0) : 0;

  // Recommendation Logic
  // const [recommendedBooking, setRecommendedBooking] = useState<Booking | null>(null);

  // Recommendation Logic
  const [recommendedMatches, setRecommendedMatches] = useState<(Booking & { isNemesis?: boolean; playerCount?: number })[]>([]);

  useEffect(() => {
    if (!user) return;
    loadRecs();
  }, [user]);

  async function loadRecs() {
    if (!user) return;
    const recs = await getRecommendedMatches(user.id);
    setRecommendedMatches(recs);
  }

  const refreshAll = async () => {
    // We need to re-fetch bookings and matches.
    // User is already set.
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    const bookings = await getBookings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const myUpcoming = bookings.filter(b => {
      const bDate = new Date(b.date + 'T' + b.time);

      // Check if user is ANY participant (even if profile missing)
      const isParticipant =
        b.userId === currentUser.id ||
        b.player1Id === currentUser.id ||
        b.player2Id === currentUser.id ||
        b.player3Id === currentUser.id ||
        b.player4Id === currentUser.id;

      return (b.status === 'confirmed' || b.status === 'open') &&
        bDate >= today &&
        isParticipant;
    }).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

    setUpcoming(myUpcoming);

    const recs = await getRecommendedMatches(currentUser.id);
    setRecommendedMatches(recs);
  };

  // Modal State
  const [selectedMatch, setSelectedMatch] = useState<Booking | null>(null);

  const handleJoin = async (bookingId: string) => {
    try {
      await joinMatch(bookingId);
      alert("Joined match!");
      setSelectedMatch(null); // Close if open
      await refreshAll(); // RELOAD UPCOMING & RECS
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const openMatchDetails = (match: Booking) => {
    setSelectedMatch(match);
  };

  // Determine next match for Hero section
  const nextMatch = upcoming[0];

  const handleLeave = async (bookingId: string, matchDateStr: string) => {
    // 12h Check
    const matchDate = new Date(matchDateStr);
    const now = new Date();
    const diffHrs = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHrs < 12) {
      if (!confirm("WARNING: Cancelling within 12 hours of the match start results in a penalty. The club admin will be notified. Are you sure you want to leave?")) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to leave this match?")) return;
    }

    try {
      // Dynamic import to avoid SSR issues if needed, but here simple import is fine if client component
      const { leaveMatch } = await import('@/lib/store');
      await leaveMatch(bookingId);
      alert("You have left the match.");
      setSelectedMatch(null);
      await refreshAll();
    } catch (e: any) {
      alert("Error leaving match: " + e.message);
    }
  };

  const handleInvite = async () => {
    // Simple Join Link
    const url = window.location.origin + '/book?join=' + nextMatch?.id;
    const text = `Join my Padel Match at ${nextMatch?.clubName}! ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Padel Match Invite',
          text: text,
          url: url
        });
      } catch (e) {
        console.log('Share failed', e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Invite link copied to clipboard: " + url);
      } catch (e) {
        alert("Share not supported. Copy this: " + url);
      }
    }
  };

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7, paddingTop: '40vh' }}>Loading Dashboard...</div>;
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
      <section className={styles.heroCard} onClick={() => nextMatch && openMatchDetails(nextMatch)} style={{ cursor: nextMatch ? 'pointer' : 'default' }}>
        <div className={styles.heroContent}>
          {nextMatch ? (
            <>
              {nextMatch.status === 'open' ? (
                // OPEN MATCH STATE (Lobby)
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span>Match Lobby</span>
                    <span>{nextMatch.clubName}</span>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {(nextMatch.participants?.length || 1)}/4 Players
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.7, marginTop: '8px' }}>
                      Waiting for opponents...
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', marginTop: '1rem', opacity: 0.9 }}>
                    <Clock size={18} />
                    <span style={{ fontWeight: 600 }}>{nextMatch.date} • {nextMatch.time}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', flex: 1, cursor: 'pointer' }} onClick={(e) => {
                      e.stopPropagation();
                      handleInvite();
                    }}>
                      Invite Friends
                    </button>
                    <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', flex: 1 }} onClick={(e) => {
                      e.stopPropagation();
                      if (nextMatch) window.location.href = `/chat/${nextMatch.id}`;
                    }}>
                      Chat
                    </button>
                  </div>
                </>
              ) : (
                // CONFIRMED / VS STATE
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span>My Next Match</span>
                    <span>{nextMatch.clubName}</span>
                  </div>

                  <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5rem' }}>
                    vs {nextMatch.participants?.filter(p => !p.name.includes(user?.name || '')).map(p => p.name.split(' ')[0]).join(' & ') || "Opponent"}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', opacity: 0.9 }}>
                    <Clock size={18} />
                    <span style={{ fontWeight: 600 }}>{nextMatch.date} • {nextMatch.time}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href={`/matches`} className="btn" style={{ background: 'white', color: 'hsl(222, 47%, 11%)', flex: 1, fontWeight: 700 }} onClick={(e) => e.stopPropagation()}>
                      Enter Score
                    </Link>
                    <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', flex: 1 }}>
                      Chat
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Upcoming Matches</div>
              <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>You're free! Find a partner or join an open match below.</p>
              <Link href="/book" className="btn" style={{ background: 'white', color: 'hsl(var(--background))', fontWeight: 700 }}>
                Find a Match
              </Link>
            </div>
          )}
        </div>
      </section>



      {/* 2.5 Recommended Matches (Horizontal Scroll) */}
      {
        recommendedMatches.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Join a Match
            </h2>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem', scrollSnapType: 'x mandatory' }}>
              {recommendedMatches.map(match => (
                <div key={match.id} style={{ minWidth: '280px', scrollSnapAlign: 'start' }}>
                  {/* Made Card clickable to open details */}
                  <div onClick={() => openMatchDetails(match)} style={{ height: '100%', cursor: 'pointer' }}>
                    <Card glass style={{ height: '100%', position: 'relative', border: match.isNemesis ? '1px solid hsl(var(--secondary))' : undefined }}>
                      {(match.playerCount || 0) < 4 && (
                        <div style={{
                          position: 'absolute', top: 12, right: 12, // Moved back to TOP
                          background: match.playerCount === 3 ? 'hsl(var(--destructive))' : 'hsl(var(--success))',
                          color: match.playerCount === 3 ? 'white' : 'black',
                          fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          zIndex: 10
                        }}>
                          {match.playerCount === 3 ? '1 SPOT LEFT! 🔥' : `${4 - (match.playerCount || 0)} SPOTS LEFT`}
                        </div>
                      )}
                      <div style={{ marginBottom: '1rem', paddingRight: '110px' }}> {/* Added padding to avoid overlap */}
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '4px' }}>{match.clubName} • {match.date}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{match.playerCount}/4 Players</div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                        {match.participants?.map(p => (
                          <div key={p.id} style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: p.avatar ? `url(${supabase.storage.from('avatars').getPublicUrl(p.avatar).data.publicUrl}) center/cover` : '#ccc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', color: 'black', fontWeight: 'bold'
                          }}>
                            {!p.avatar && p.name.charAt(0)}
                          </div>
                        ))}
                        {/* Empty slots placeholders */}
                        {Array.from({ length: 4 - (match.playerCount || 0) }).map((_, i) => (
                          <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.3)' }} />
                        ))}
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '0.8rem', height: '36px' }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening modal when clicking Join directly
                          handleJoin(match.id);
                        }}
                      >
                        Join Match
                      </button>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      }

      {/* Match Details Modal */}
      <MatchDetailsModal
        booking={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onJoin={handleJoin}
        currentUserId={user?.id || ''}
      />

      {/* 3. Stats Row Using Bento Grid */}
      {
        user && (
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Win Rate</div>
              <div className={`${styles.statValue} text-data`} style={{ color: 'hsl(var(--secondary))' }}>
                {winRate}%
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Streak</div>
              <div className={`${styles.statValue} text-data`} style={{ color: currentStreak > 1 ? 'hsl(var(--secondary))' : 'white' }}>
                {currentStreak} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>WINS</span> {currentStreak > 1 && '🔥'}
              </div>
            </div>
          </section>
        )
      }

      {/* 4. Recent Activity */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Recent Activity
        </h2>

        <div className={styles.matchList}>
          {recentMatches.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No recent matches.</p>
          ) : (
            recentMatches.map(match => {
              const isTeam1 = match.team1Names.includes('You') || (user && match.team1Names.includes(user.name));
              const isWin = (isTeam1 && match.winner === 1) || (!isTeam1 && match.winner === 2);
              return (
                <div key={match.id} className={styles.matchItem}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                      {match.team1Names} vs {match.team2Names}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                      {match.score}
                    </div>
                  </div>
                  <div className={styles.indicator} style={{ background: isWin ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }} />
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Top Players/Stats (Optional - keeping but pushing down or hiding? User didn't ask for it explicitly in new layout list, but 'Leaderboard' is in nav. Let's keep a simplified version or hide. User said "List of match results" is recent activity. Bottom nav has leaderboard. I'll hide Top Players from home to keep it clean as requested) */}



    </main >
  );
}
