-- ==========================================
-- FINAL FIX SCRIPT: RUN THIS TO FIX EVERYTHING
-- ==========================================

-- 1. Ensure Profiles Table has all columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'course') THEN
        ALTER TABLE profiles ADD COLUMN course text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'year') THEN
        ALTER TABLE profiles ADD COLUMN year text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dob') THEN
        ALTER TABLE profiles ADD COLUMN dob text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
    END IF;
END $$;

-- 2. Storage: Create 'avatars' bucket & Fix Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;

CREATE POLICY "Avatar Select Policy" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Insert Policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars'); -- Simplified for stability
CREATE POLICY "Avatar Update Policy" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Delete Policy" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- 3. Profiles: Fix RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Trigger: Auto-create/update Profile from Auth Metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, country, course, year, dob, avatar_url, elo, wins, matches_played
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Player'),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'dob',
    new.raw_user_meta_data->>'avatar_path',
    0, 0, 0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', EXCLUDED.full_name),
    country = COALESCE(new.raw_user_meta_data->>'country', EXCLUDED.country),
    course = COALESCE(new.raw_user_meta_data->>'course', EXCLUDED.course),
    year = COALESCE(new.raw_user_meta_data->>'year', EXCLUDED.year),
    dob = COALESCE(new.raw_user_meta_data->>'dob', EXCLUDED.dob),
    avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_path', EXCLUDED.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
