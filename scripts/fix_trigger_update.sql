-- Enhance the trigger to handle UPDATES as well
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
    new.raw_user_meta_data->>'avatar_path',
    0,
    0,
    0
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

-- Ensure Trigger runs on UPDATE too
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
