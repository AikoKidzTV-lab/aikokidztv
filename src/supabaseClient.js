import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Prevent background refresh-token retry storms when the auth server is unreachable.
    // We handle auth/session checks explicitly in AuthContext and fall back to offline mode.
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
