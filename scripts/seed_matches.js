
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for script - typically env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_URL_HERE';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    console.log("Fetching clubs...");
    const { data: clubs } = await supabase.from('clubs').select('*');
    if (!clubs) {
        console.error("No clubs found");
        return;
    }
    console.log("Clubs found:", clubs.map(c => c.name));

    const tibidabo = clubs.find(c => c.name.toLowerCase().includes('tibidabo'));
    const santcu = clubs.find(c => c.name.toLowerCase().includes('santcu'));

    if (!tibidabo || !santcu) {
        console.error("Could not find specific clubs. Check names above.");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    // We need a valid user ID for the creator. If we run this as a script we might not have auth context easily.
    // We can fetch a random profile ID to act as creator.
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    const userId = profiles[0]?.id;

    if (!userId) {
        console.error("No users found to create match");
        return;
    }

    console.log("Creating bookings...");

    // Helper to get future date
    const getNextDay = (dayIndex) => {
        // 0=Sun, 1=Mon... 
        const d = new Date();
        d.setDate(d.getDate() + (dayIndex + 7 - d.getDay()) % 7 || 7); // Next occurence
        return d.toISOString().split('T')[0];
    };

    // 1. Tibidabo, Next Wed 11:00 (Urgent - 3 players)
    // We create a booking, then we update it to add players? Or we insert with players.
    // The `createBooking` only adds creator. We will manually raw insert to be faster/flexible.

    // Find next Wednesday
    const nextWed = getNextDay(3);

    const bookings = [
        {
            club_id: tibidabo.id,
            user_id: userId,
            date: nextWed,
            time: '11:00',
            status: 'open',
            player_1_id: userId,
            player_2_id: userId, // Mock: User playing against themselves or just duplicate IDs for testing count
            player_3_id: userId,
            player_4_id: null // 1 Spot left
        },
        {
            club_id: santcu.id,
            user_id: userId,
            date: getNextDay(5), // Next Friday
            time: '15:00',
            status: 'open',
            player_1_id: userId,
            player_2_id: userId, // 2 Spots left
            player_3_id: null,
            player_4_id: null
        },
        {
            club_id: tibidabo.id,
            user_id: userId,
            date: getNextDay(2), // Next Tuesday
            time: '11:00',
            status: 'open',
            player_1_id: userId, // 3 Spots left
            player_2_id: null,
            player_3_id: null,
            player_4_id: null
        }
    ];

    for (const b of bookings) {
        const { error } = await supabase.from('bookings').insert([b]);
        if (error) console.error("Error creating booking:", error);
        else console.log(`Created booking at ${b.time} on ${b.date}`);
    }
}

seed();
