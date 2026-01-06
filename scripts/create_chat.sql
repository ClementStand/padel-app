-- Create Messages Table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references bookings(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table messages enable row level security;

-- Policies
create policy "Enable read for authenticated users" on messages for select using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on messages for insert with check (auth.role() = 'authenticated');

-- Add realtime
alter publication supabase_realtime add table messages;
