import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
const appMode = import.meta.env.MODE;
const PRODUCTION_SITE_ORIGIN = 'https://aikokidztv.com';
const AUTH_REDIRECT_ORIGIN = PRODUCTION_SITE_ORIGIN;

const normalizeOrigin = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!/^https?:$/i.test(url.protocol)) return null;
    return `${url.origin}`.replace(/\/+$/, '');
  } catch {
    return null;
  }
};

const resolveRuntimeOrigin = () => {
  if (typeof window === 'undefined') return null;
  return normalizeOrigin(window.location.origin);
};

const resolveSiteOrigin = () => {
  const envOrigin = normalizeOrigin(publicSiteUrl);
  if (envOrigin) return envOrigin;

  const runtimeOrigin = resolveRuntimeOrigin();
  if (appMode !== 'production' && runtimeOrigin) return runtimeOrigin;

  return PRODUCTION_SITE_ORIGIN;
};

export const appSiteOrigin = resolveSiteOrigin();

export const getAuthRedirectUrl = (path = '/') => {
  const safePath = typeof path === 'string' && path.trim() ? path.trim() : '/';
  const normalizedPath = safePath.startsWith('/') ? safePath : `/${safePath}`;

  try {
    return new URL(normalizedPath, `${AUTH_REDIRECT_ORIGIN}/`).toString();
  } catch {
    return `${AUTH_REDIRECT_ORIGIN}${normalizedPath}`;
  }
};

const hasSupabaseUrl = typeof supabaseUrl === 'string' && supabaseUrl.trim().length > 0;
const hasSupabaseAnonKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim().length > 0;
const hasValidSupabaseUrl =
  hasSupabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl.trim());

const isProductionHost =
  typeof window !== 'undefined' && /(^|\.)aikokidztv\.com$/i.test(window.location.hostname);
const isProductionLike = appMode === 'production' || isProductionHost || appSiteOrigin === PRODUCTION_SITE_ORIGIN;
const authStorageKey = isProductionLike ? 'aikokidztv.auth.prod' : 'aikokidztv.auth.dev';

const runtimeContext = {
  mode: appMode,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server',
  siteOrigin: appSiteOrigin,
  hasSupabaseUrl,
  hasSupabaseAnonKey,
  supabaseUrl: hasSupabaseUrl ? supabaseUrl : '(missing)',
  anonKeyLength: hasSupabaseAnonKey ? supabaseAnonKey.length : 0,
};

if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
  console.error(
    '[SupabaseClient] Missing required env vars. Check deployment env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
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
    // GitHub Pages is static hosting; Supabase browser auth uses local storage sessions.
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: authStorageKey,
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
