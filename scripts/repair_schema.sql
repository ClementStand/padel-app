-- Add player slots if they don't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS player_1_id UUID REFERENCES auth.users(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS player_2_id UUID REFERENCES auth.users(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS player_3_id UUID REFERENCES auth.users(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS player_4_id UUID REFERENCES auth.users(id);

-- Force schema cache reload (Supabase specifics)
NOTIFY pgrst, 'reload schema';
