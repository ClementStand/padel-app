-- Enable RLS on bookings if not already
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow users to update bookings they are part of (to remove themselves)
-- We check if the user is one of the players OR the owner
CREATE POLICY "Participants can update bookings" ON bookings
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.uid() = player_1_id OR 
        auth.uid() = player_2_id OR 
        auth.uid() = player_3_id OR 
        auth.uid() = player_4_id
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() = player_1_id OR 
        auth.uid() = player_2_id OR 
        auth.uid() = player_3_id OR 
        auth.uid() = player_4_id
    );

-- Also ensure Select is allowed (usually already exists, but good to ensure coverage for joined players)
CREATE POLICY "Public bookings are viewable" ON bookings FOR SELECT USING (true);
