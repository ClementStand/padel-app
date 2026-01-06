-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create ELO History Table
create table if not exists elo_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  match_id uuid references matches(id) on delete set null, -- Optional link to match
  old_elo numeric,
  new_elo numeric,
  change_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Update Matches Table with Confirmation flow columns
-- We assume 'matches' table exists. We'll add columns if they don't exist.
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'status') then
        alter table matches add column status text default 'completed'; -- Defaulting old matches to completed
    end if;
    
    if not exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'submitted_by') then
        alter table matches add column submitted_by uuid references auth.users(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'dispute_reason') then
        alter table matches add column dispute_reason text;
    end if;
end $$;

-- 3. Create Bookings Policies (if not exists) & ensure Data Access
-- Ensure public read for bookings to find matches
create policy "Public bookings are viewable by everyone" on bookings for select using ( true );
-- (Assuming RLS is enabled, otherwise this does nothing, but good to have)

-- 4. Create ELO History Policies
alter table elo_history enable row level security;
create policy "Users can view their own ELO history" on elo_history for select using ( auth.uid() = user_id );
create policy "System can insert ELO history" on elo_history for insert with check ( true ); 
-- Ideally insert is restricted, but for client-side logic simplification we might allow it if we trust the client 'confirm' action.
-- For better security, ELO updates should be via Database Function / RPC. 
-- But keeping it simple for this codebase:

-- 5. Helper View for Match Recommendations (Optional but helpful)
-- Can just do this in client code for now.
