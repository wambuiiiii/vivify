import { createClient } from '@supabase/supabase-js';

// We fetch these from your Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required.');
}

// Create and export the single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);