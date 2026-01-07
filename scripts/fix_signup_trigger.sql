-- 1. Drop existing trigger/function to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the function (SECURITY DEFINER = runs as admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    country,
    course,
    year,
    dob,
    avatar_url,
    elo,
    wins,
    matches_played
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Player'),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'dob',
    new.raw_user_meta_data->>'avatar_path', -- Use the path we saved
    0,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Fix Storage RLS to allow inserts even if 'auth.uid()' is flaky immediately? 
-- No, Storage usually strictly requires a verified user. 
-- We will rely on the user verifying email OR disabling email confirm.
-- But we can ensure the public bucket exists.
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
