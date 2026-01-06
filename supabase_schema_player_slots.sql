-- Add player slots to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS player_1_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS player_2_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS player_3_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS player_4_id uuid REFERENCES auth.users(id);

-- Ensure user_id (creator) is also arguably player_1, but we keep user_id as 'owner'.
-- We will handle logic in store.ts to sync them or just use slots.
