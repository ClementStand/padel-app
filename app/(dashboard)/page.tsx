'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Trophy, TrendingUp, Calendar, Clock, Sparkles } from 'lucide-react';
import Card from '@/components/Card';
import ProfileModal from '@/components/ProfileModal';
import EloChart from '@/components/EloChart';
import { getCurrentUser, getBookings, getPlayers, getMatches, Player, Booking } from '@/lib/store';

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

  return (
    <main style={{ padding: '1rem', paddingTop: '2rem' }}>

      {/* Header / Welcome */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>ESADE Padel 🎾</h1>
          <p style={{ color: 'hsl(var(--foreground) / 0.7)' }}>Ready to play{user ? `, ${user.name.split(' ')[0]}` : ''}?</p>
        </div>

        {/* Stats Badge */}
        {user && (
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--foreground)/0.6)', fontWeight: 600 }}>Rating</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'hsl(var(--primary))'
              }}>
                {Math.round(user.elo)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--foreground)/0.6)', fontWeight: 600 }}>Win Rate</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: winRate >= 50 ? 'hsl(var(--success))' : 'hsl(var(--warning))'
              }}>
                {winRate}%
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Upcoming Matches */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="hsl(var(--primary))" />
          Upcoming Matches
        </h2>
        {upcoming.length > 0 ? (
          upcoming.map(booking => (
            <Card key={booking.id} style={{ borderLeft: '4px solid hsl(var(--primary))', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{booking.clubName}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'hsl(var(--success)/0.2)',
                  color: 'hsl(var(--success))',
                  fontWeight: 600
                }}>
                  CONFIRMED
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'hsl(var(--foreground)/0.7)', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {booking.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {booking.time}</span>
              </div>

              {/* Participants */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {booking.participants?.map((p, i) => {
                  // We need to find the full player object to pass to modal
                  // Ideally we'd have it, but here we might just have ID and Name.
                  // We can try to find them in 'topPlayers' or 'getPlayers' list if we had it all.
                  // For now, let's just make a mock Player object if we can't find them, or fetch them.
                  // A simple way is to onClick just set the ID and let the modal fetch or just pass what we have.
                  // Let's assume we can fetch.
                  return (
                    <div
                      key={i}
                      onClick={async () => {
                        // Try to find rich player data, or create partial
                        const allPlayers = await getPlayers();
                        const found = allPlayers.find(player => player.id === p.id) || { ...p, matchesPlayed: 0, elo: 1200, name: p.name } as Player;
                        setSelectedPlayer(found);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        width: '60px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'hsl(var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginBottom: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {p.name.charAt(0)}
                      </div>
                      <span style={{ textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{p.name.split(' ')[0]}</span>
                    </div>
                  )
                })}
                {/* Empty slots if < 4 */}
                {Array.from({ length: 4 - (booking.participants?.length || 0) }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ width: '60px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px dashed hsl(var(--border))' }} />
                  </div>
                ))}
              </div>

            </Card>
          ))
        ) : (
          <Card style={{ padding: '1.5rem', textAlign: 'center', color: 'hsl(var(--foreground)/0.6)' }}>
            <p>No upcoming matches confirmed.</p>
            <Link href="/book" style={{ fontSize: '0.9rem', color: 'hsl(var(--primary))', textDecoration: 'underline', marginTop: '0.5rem', display: 'block' }}>
              Book a court now
            </Link>
          </Card>
        )}
      </section>

      {/* Quick Action */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/book" className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '8px', fontSize: '1.1rem', padding: '1rem' }}>
          <PlusCircle size={20} />
          Book a Court
        </Link>
      </div>

      {/* Recommendation */}
      {recommendedBooking && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="hsl(var(--primary))" />
            Recommended for You
          </h2>
          <Card style={{ border: '2px solid hsl(var(--primary))', background: 'hsl(var(--primary)/0.05)' }}>
            <div style={{ padding: '0.5rem 0' }}>
              <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                Join <strong>{recommendedBooking.participants?.[0].name}</strong> and others you've played with recently!
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{recommendedBooking.clubName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground)/0.7)' }}>
                    {recommendedBooking.date} @ {recommendedBooking.time}
                  </div>
                </div>
                <Link href="/book" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  Join Match
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Feed */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} color="hsl(var(--warning))" />
          Recent Results
        </h2>

        {recentMatches.map(match => (
          <Card key={match.id} className="match-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: match.winner === 'p1' ? 'bold' : 'normal' }}>{match.p1}</div>
              <div style={{
                background: 'hsl(var(--accent))',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {match.score}
              </div>
              <div style={{ fontWeight: match.winner === 'p2' ? 'bold' : 'normal', textAlign: 'right' }}>{match.p2}</div>
            </div>
          </Card>
        ))}
      </section>

      {/* Top Players/Stats */}
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="hsl(var(--success))" />
          Top Players
        </h2>
        <Card>
          {topPlayers.map((player, index) => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 0',
                borderBottom: index < topPlayers.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontWeight: 'bold', width: '20px', color: index === 0 ? 'hsl(var(--warning))' : 'hsl(var(--foreground))' }}>{index + 1}</span>
                <span>{player.name}</span>
              </div>
              <span style={{ fontWeight: '600' }}>{Math.round(player.elo)}</span>
            </div>
          ))}
        </Card>
      </section>

      {/* Rating Evolution */}
      {user && (
        <section style={{ marginTop: '2rem', paddingBottom: '6rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="hsl(var(--primary))" />
            Rating Evolution
          </h2>
          <Card style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground)/0.6)' }}>Current Rating</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{Math.round(user.elo)}</div>
            </div>
            <EloChart currentElo={user.elo} />
          </Card>
        </section>
      )}

      {selectedPlayer && (
        <ProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

    </main>
  );
}
