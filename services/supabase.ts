import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These variables should be loaded from environment variables.
// In a real project, you would use a system like Vite's `import.meta.env`
// or another environment variable solution. For this sandbox, we assume they
// are available on `import.meta.env` (set in your .env file at project root).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables not set. Please provide SUPABASE_URL and SUPABASE_KEY.'
  );
  // To avoid crashing the entire app in the sandbox, we are not throwing an error,
  // but in a real app, you should throw an error to fail fast.
  // throw new Error('Supabase URL and anon key are required.');
}

// Initialize the client, but handle the case where env vars might be missing.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
