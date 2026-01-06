-- 1. FIX PROFILE CONSTRAINTS
-- We drop the old check constraints and add new ones that definitely support 'both'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_court_side_preference_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_court_side_preference_check 
    CHECK (court_side_preference IN ('left', 'right', 'both'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_hand_preference_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_hand_preference_check 
    CHECK (hand_preference IN ('right', 'left'));

-- 2. FIX BOOKING PERMISSIONS (RLS)
-- Enable RLS (just in case)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Participants can update bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Enable delete for owners" ON bookings;

-- UPDATE POLICY (For players 2-4 leaving)
CREATE POLICY "Participants can update bookings" ON bookings
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.uid() = player_1_id OR 
        auth.uid() = player_2_id OR 
        auth.uid() = player_3_id OR 
        auth.uid() = player_4_id
    )
    WITH CHECK (true); -- Allow any update (like setting self to null)

-- DELETE POLICY (For Owner/Player 1 cancelling)
CREATE POLICY "Owners can delete bookings" ON bookings
    FOR DELETE
    USING (
        auth.uid() = user_id OR 
        auth.uid() = player_1_id
    );

-- SELECT POLICY (Ensure visibility)
DROP POLICY IF EXISTS "Public bookings are viewable" ON bookings;
CREATE POLICY "Public bookings are viewable" ON bookings FOR SELECT USING (true);
