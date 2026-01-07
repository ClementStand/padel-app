-- Allow public (anonymous) uploads to avatars bucket
-- This is necessary because new users attempting to upload during sign-up
-- do not yet have an active session (waiting for email confirmation).

BEGIN;

-- Drop existing restricted policy
DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;

-- Create new permissible policy
CREATE POLICY "Avatar Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'avatars' );

-- Ensure Update is also permissible if they retry?
-- Update usually implies overwrite.
DROP POLICY IF EXISTS "Avatar Update" ON storage.objects;
CREATE POLICY "Avatar Update"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'avatars' );

COMMIT;
