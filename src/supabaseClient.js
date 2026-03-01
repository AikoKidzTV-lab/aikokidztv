import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const appMode = import.meta.env.MODE;

const hasSupabaseUrl = typeof supabaseUrl === 'string' && supabaseUrl.trim().length > 0;
const hasSupabaseAnonKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim().length > 0;
const hasValidSupabaseUrl =
  hasSupabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl.trim());

const runtimeContext = {
  mode: appMode,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server',
  hasSupabaseUrl,
  hasSupabaseAnonKey,
  supabaseUrl: hasSupabaseUrl ? supabaseUrl : '(missing)',
  anonKeyLength: hasSupabaseAnonKey ? supabaseAnonKey.length : 0,
};

if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
  console.error(
    '[SupabaseClient] Missing required env vars. Check Netlify site env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    runtimeContext
  );
}

if (hasSupabaseUrl && !hasValidSupabaseUrl) {
  console.error(
    '[SupabaseClient] VITE_SUPABASE_URL format looks unexpected. Expected https://<project-ref>.supabase.co',
    runtimeContext
  );
}

const safeSupabaseUrl = hasSupabaseUrl ? supabaseUrl : 'https://missing-supabase-url.invalid';
const safeSupabaseAnonKey = hasSupabaseAnonKey ? supabaseAnonKey : 'missing-supabase-anon-key';

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
  auth: {
    // Prevent background refresh-token retry storms when the auth server is unreachable.
    // We handle auth/session checks explicitly in AuthContext and fall back to offline mode.
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (...args) => {
      try {
        return await fetch(...args);
      } catch (fetchError) {
        const requestTarget =
          typeof args?.[0] === 'string'
            ? args[0]
            : args?.[0]?.url || '[unknown request URL]';

        console.error('[SupabaseClient] Network request failed:', {
          requestTarget,
          message: fetchError?.message || 'Unknown network error',
          name: fetchError?.name || 'Error',
          ...runtimeContext,
        });
        throw fetchError;
      }
    },
  },
});

export default supabase;
