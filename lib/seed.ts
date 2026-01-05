import { supabase } from './supabase';

const CLUBS = [
    { id: 'club_1', name: 'Padel Tibidabo', courts: 7 },
    { id: 'club_2', name: 'SantCu Padel', courts: 6 },
    { id: 'club_3', name: 'Indoor Padel Barcelona', courts: 10 }
];

const PLAYERS = [
    { id: 'user_1', full_name: 'President (Test)', elo: 1200, wins: 0, matches_played: 0, country: 'BE' },
    { id: 'p_1', full_name: 'Javi Martinez', elo: 1540, wins: 15, matches_played: 20, country: 'ES' },
    { id: 'p_2', full_name: 'Sarah Connor', elo: 1495, wins: 12, matches_played: 18, country: 'UK' },
    { id: 'p_3', full_name: 'Mike Ross', elo: 1420, wins: 8, matches_played: 15, country: 'US' },
    { id: 'p_4', full_name: 'Ana Smith', elo: 1380, wins: 5, matches_played: 10, country: 'DE' },
    { id: 'p_5', full_name: 'Tom Cruise', elo: 1300, wins: 4, matches_played: 8, country: 'US' },
    { id: 'p_6', full_name: 'Rafael Nadal', elo: 1800, wins: 50, matches_played: 52, country: 'ES' },
];

const MATCHES = [
    {
        date: '2024-12-20',
        team1_names: 'Alex & Sarah',
        team2_names: 'Mike & Tom',
        score: '6-4 6-2',
        winner: 1,
        elo_change: 10
    },
    {
        date: '2024-12-18',
        team1_names: 'Javi Martinez & You',
        team2_names: 'Sarah & Mike',
        score: '6-7 4-6',
        winner: 2,
        elo_change: -12
    },
    {
        date: '2024-12-15',
        team1_names: 'You & Ana',
        team2_names: 'Javi & Mike',
        score: '6-3 6-4',
        winner: 1,
        elo_change: 15
    },
    {
        date: '2024-12-10',
        team1_names: 'Rafa & Tom',
        team2_names: 'Javi & Ana',
        score: '6-0 6-0',
        winner: 1,
        elo_change: 5
    }
];

export const seedDatabase = async () => {
    console.log("Seeding clubs...");
    const { error: clubError } = await supabase.from('clubs').upsert(CLUBS);
    if (clubError) console.error("Error seeding clubs:", clubError);

    console.log("Seeding profiles...");
    const { error: profileError } = await supabase.from('profiles').upsert(PLAYERS);
    if (profileError) console.error("Error seeding profiles:", profileError);

    console.log("Seeding matches...");
    // Matches usually just insert, we don't have stable IDs for upsert in this list
    const { error: matchError } = await supabase.from('matches').insert(MATCHES);
    if (matchError) console.error("Error seeding matches:", matchError);

    // Bookings
    const today = new Date().toISOString().split('T')[0];
    const BOOKINGS = [
        {
            club_id: 'club_1',
            user_id: 'user_1',
            date: today,
            time: '18:00',
            status: 'confirmed'
        },
        {
            club_id: 'club_2',
            user_id: 'p_2', // Sarah
            date: '2026-05-20',
            time: '10:00',
            status: 'pending'
        }
    ];

    console.log("Seeding bookings...");
    const { error: bookingError } = await supabase.from('bookings').insert(BOOKINGS);
    if (bookingError) console.error("Error seeding bookings:", bookingError);

    return { success: true };
};
