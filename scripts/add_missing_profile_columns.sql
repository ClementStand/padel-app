-- Add potentially missing columns to profiles table safely
DO $$
BEGIN
    -- Country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country text;
    END IF;

    -- Course
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'course') THEN
        ALTER TABLE profiles ADD COLUMN course text;
    END IF;

    -- Year
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'year') THEN
        ALTER TABLE profiles ADD COLUMN year text;
    END IF;

    -- DOB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dob') THEN
        ALTER TABLE profiles ADD COLUMN dob text; -- or date
    END IF;

    -- Avatar URL (Usually exists, but ensuring)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
    END IF;

    -- ELO / Stats (Should exist, but ensuring defaults)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'elo') THEN
        ALTER TABLE profiles ADD COLUMN elo numeric DEFAULT 1200;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wins') THEN
        ALTER TABLE profiles ADD COLUMN wins integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'matches_played') THEN
        ALTER TABLE profiles ADD COLUMN matches_played integer DEFAULT 0;
    END IF;

END $$;
