-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Add 'tags' column to 'matches' table for Feature 4: Dynamic Match Tags
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'tags') then
        alter table matches add column tags text[]; -- Array of strings for tags
    end if;
end $$;
