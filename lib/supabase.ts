import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true, // This is fine
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // IMPORTANT: We do NOT strictly define 'storage: window.localStorage' here
        // because that crashes the server build. Supabase finds it automatically in the browser.
    }
});