-- Add preference columns to profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'hand_preference') THEN
        ALTER TABLE profiles ADD COLUMN hand_preference text CHECK (hand_preference IN ('right', 'left'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'court_side_preference') THEN
        ALTER TABLE profiles ADD COLUMN court_side_preference text CHECK (court_side_preference IN ('left', 'right', 'both'));
    END IF;
END $$;
