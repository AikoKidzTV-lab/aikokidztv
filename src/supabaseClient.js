import { createClient } from '@supabase/supabase-js';

const normalizeOrigin = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (!/^https?:$/i.test(parsed.protocol)) return null;
    return parsed.origin.replace(/\/+$/, '');
  } catch {
    return null;
  }
};

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const publicSiteUrl = String(import.meta.env.VITE_PUBLIC_SITE_URL || '').trim();
const runtimeOrigin =
  typeof window !== 'undefined' ? normalizeOrigin(window.location.origin) : null;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[SupabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check production env settings.'
  );
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) {
  console.warn(
    '[SupabaseClient] VITE_SUPABASE_URL should look like https://<project-ref>.supabase.co'
  );
}

export const appSiteOrigin =
  normalizeOrigin(publicSiteUrl) || runtimeOrigin || 'https://aikokidztv.com';

export const getAuthRedirectUrl = (path = '/') => {
  const safePath = typeof path === 'string' && path.trim() ? path.trim() : '/';
  const normalizedPath = safePath.startsWith('/') ? safePath : `/${safePath}`;

  try {
    return new URL(normalizedPath, `${appSiteOrigin}/`).toString();
  } catch {
    return `${appSiteOrigin}${normalizedPath}`;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'aikokidztv.auth.session',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    fetch: async (...args) => {
      try {
        return await fetch(...args);
      } catch (error) {
        console.error('[SupabaseClient] Network request failed:', {
          request: typeof args?.[0] === 'string' ? args[0] : args?.[0]?.url || 'unknown',
          message: error?.message || 'Unknown network error',
        });
        throw error;
      }
    },
  },
});

export default supabase;

