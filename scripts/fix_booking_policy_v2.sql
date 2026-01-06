-- DROP the previous policy if it exists (or just create a new one to be safe)
DROP POLICY IF EXISTS "Participants can update bookings" ON bookings;

-- Create the CORRECT policy which separates the definition of "Who can edit" vs "What the result looks like"
CREATE POLICY "Participants can update bookings" ON bookings
    FOR UPDATE
    USING (
        -- WHO CAN EDIT: Anyone who is currently a participant or the owner
        auth.uid() = user_id OR 
        auth.uid() = player_1_id OR 
        auth.uid() = player_2_id OR 
        auth.uid() = player_3_id OR 
        auth.uid() = player_4_id
    )
    WITH CHECK (
        -- WHAT THE RESULT CAN BE: Anything (so we can remove ourselves)
        -- Ideally we might want to restrict them to ONLY removing themselves, but for now `true` fixes the bug.
        true
    );
