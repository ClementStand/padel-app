-- Enable Storage Extension if not already
-- (Storage is usually enabled by default on Supabase, but buckets need creation)

-- 1. Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts (RE-RUN SAFE)
DROP POLICY IF EXISTS "Avatar Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;

-- 3. Create RLS Policies for Avatars
-- Allow public read access
CREATE POLICY "Avatar Select Policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar (folder convention: user_id/filename)
CREATE POLICY "Avatar Insert Policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatar
CREATE POLICY "Avatar Update Policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Avatar Delete Policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. ENSURE Profiles are Updatable by their owners (Fixing potential RLS recursion or blocking)
-- This might be redundant if already set, but ensures the explicit UPSERT works.
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
