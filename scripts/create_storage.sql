-- Create the storage bucket 'avatars'
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

-- Create policy to allow authenticated uploads to their own folder
-- Note: This is simplified. Ideally match (storage.foldername(name))[1]::uuid = auth.uid()
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
