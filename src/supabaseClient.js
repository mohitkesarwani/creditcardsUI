import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surface the misconfig early in dev rather than failing with a cryptic 401 later.
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
      'Set them in your .env file (see .env.example).'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false, // app uses its own env-var login gate (useAuth.jsx)
  },
});

export default supabase;
