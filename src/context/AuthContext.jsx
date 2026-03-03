import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { readEconomyState } from '../utils/profileEconomy';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isOffline: false,
  authError: null,
  signOut: async () => {},
  fetchProfile: async () => null,
});

const isNetworkError = (error) => {
  const text = `${error?.name ?? ''} ${error?.message ?? ''} ${error?.code ?? ''}`;
  return /failed to fetch|network|timed out|err_connection_timed_out|fetch/i.test(text);
};

const AUTH_TIMEOUT_MS = 20000;
const PROFILE_FALLBACK_COLUMNS =
  'id, role, gems, unlocked_zones, unlocked_videos, unlocked_items, claimed_rewards';

const withTimeout = async (promise, timeoutMs, label) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      const timeoutError = new Error(`${label} timed out after ${timeoutMs}ms`);
      timeoutError.name = 'AuthTimeoutError';
      timeoutError.code = 'AUTH_TIMEOUT';
      reject(timeoutError);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isMountedRef = useRef(false);

  const normalizeFallbackProfile = useCallback((rawProfile = null) => {
    if (!rawProfile) return null;
    const toStringArray = (value) => (Array.isArray(value) ? value.filter(Boolean).map(String) : []);
    const gems = Number(rawProfile.gems);
    return {
      ...rawProfile,
      gems: Number.isFinite(gems) ? Math.max(0, Math.floor(gems)) : 0,
      unlocked_zones: toStringArray(rawProfile.unlocked_zones),
      unlocked_videos: toStringArray(rawProfile.unlocked_videos),
      unlocked_items: toStringArray(rawProfile.unlocked_items),
      claimed_rewards: toStringArray(rawProfile.claimed_rewards),
    };
  }, []);

  const fetchProfile = useCallback(async (userId, options = {}) => {
    if (!userId) {
      if (isMountedRef.current) {
        setProfile(null);
      }
      return null;
    }

    const retryCount = Number.isFinite(Number(options?.retryCount))
      ? Math.max(0, Math.floor(Number(options.retryCount)))
      : 0;
    const preferDirect = Boolean(options?.preferDirect);

    if (preferDirect) {
      try {
        const { data: directProfile, error: directError } = await withTimeout(
          supabase.from('profiles').select('*').eq('id', userId).single(),
          AUTH_TIMEOUT_MS,
          'Profile direct fetch'
        );

        if (directError) {
          throw directError;
        }

        const normalizedDirectProfile = normalizeFallbackProfile(directProfile);
        if (isMountedRef.current) {
          setProfile(normalizedDirectProfile);
          setIsOffline(false);
          setAuthError(null);
        }

        console.info('[AuthContext] Direct profile sync succeeded:', {
          userId,
          role: normalizedDirectProfile?.role || null,
          gems: Number(normalizedDirectProfile?.gems || 0),
        });

        return normalizedDirectProfile;
      } catch (directFetchError) {
        console.warn('[AuthContext] Direct profile fetch failed. Falling back to economy profile flow.', {
          userId,
          message: directFetchError?.message || 'Unknown error',
        });
      }
    }

    try {
      const profileResult = await withTimeout(
        readEconomyState(userId),
        AUTH_TIMEOUT_MS,
        'Profile fetch'
      );

      if (!profileResult?.ok) {
        throw new Error(profileResult?.message || 'Failed to load profile.');
      }

      if (isMountedRef.current) {
        setProfile(profileResult.profile ?? null);
        setIsOffline(false);
        setAuthError(null);
      }

      if (profileResult?.profile) {
        console.info('[AuthContext] Profile synced after auth/session event:', {
          userId,
          role: profileResult.profile.role || null,
          gems: Number(profileResult.profile.gems || 0),
        });
      }

      return profileResult.profile ?? null;
    } catch (error) {
      console.error('[AuthContext] Failed to fetch profile:', error);

      if (!isMountedRef.current) {
        return null;
      }

      if (retryCount > 0) {
        await new Promise((resolve) => {
          if (typeof window !== 'undefined') {
            window.setTimeout(resolve, 450);
          } else {
            setTimeout(resolve, 450);
          }
        });

        return fetchProfile(userId, { retryCount: retryCount - 1, preferDirect });
      }

      try {
        const { data: fallbackProfile, error: fallbackError } = await withTimeout(
          supabase
            .from('profiles')
            .select(PROFILE_FALLBACK_COLUMNS)
            .eq('id', userId)
            .maybeSingle(),
          AUTH_TIMEOUT_MS,
          'Profile fallback fetch'
        );

        if (!fallbackError && fallbackProfile) {
          const normalizedFallback = normalizeFallbackProfile(fallbackProfile);
          setProfile(normalizedFallback);
          setAuthError(null);
          setIsOffline(false);
          console.info('[AuthContext] Fallback profile sync succeeded:', {
            userId,
            role: normalizedFallback?.role || null,
            gems: Number(normalizedFallback?.gems || 0),
          });
          return normalizedFallback;
        }
      } catch (fallbackFetchError) {
        console.error('[AuthContext] Fallback profile fetch failed:', fallbackFetchError);
      }

      setAuthError(error ?? null);
      if (isNetworkError(error)) {
        setIsOffline(true);
      }

      return null;
    }
  }, [normalizeFallbackProfile]);

  useEffect(() => {
    isMountedRef.current = true;
    let isActive = true;
    let authSubscription;
    setLoading(true);

    const applySession = async (session) => {
      if (!isMountedRef.current || !isActive) {
        return;
      }

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setIsOffline(false);
        setAuthError(null);
        return;
      }

      setProfile((currentProfile) =>
        currentProfile?.id && currentProfile.id !== nextUser.id ? null : currentProfile
      );

      await fetchProfile(nextUser.id, { retryCount: 2, preferDirect: true });

      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          if (!isMountedRef.current || !isActive) return;
          void fetchProfile(nextUser.id, { retryCount: 0, preferDirect: true });
        }, 250);
      }
    };

    const safelyApplySession = (session, eventLabel = 'unknown') => {
      const run = async () => {
        try {
          await applySession(session);
        } catch (error) {
          console.error('[AuthContext] onAuthStateChange failed. Keeping guest-safe state:', error, {
            event: eventLabel,
          });

          if (!isMountedRef.current || !isActive) {
            return;
          }

          setUser(session?.user ?? null);
          if (!session?.user) {
            setProfile(null);
          }
          setAuthError(error ?? null);
          if (isNetworkError(error)) {
            setIsOffline(true);
          }
        } finally {
          if (isMountedRef.current && isActive) {
            setLoading(false);
          }
        }
      };

      // Supabase recommends deferring async work from onAuthStateChange callbacks.
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          void run();
        }, 0);
      } else {
        void run();
      }
    };

    const initializeAuth = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'Session bootstrap'
        );

        if (error) {
          throw error;
        }

        await applySession(data?.session ?? null);
      } catch (error) {
        console.error('[AuthContext] getSession failed. Falling back to unauthenticated state:', error);

        if (!isMountedRef.current || !isActive) {
          return;
        }

        setUser(null);
        setProfile(null);
        setAuthError(error ?? null);
        setIsOffline(isNetworkError(error));
      } finally {
        if (isMountedRef.current && isActive) {
          setLoading(false);
        }
      }
    };

    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.info('[AuthContext] Auth event:', event, {
          hasSession: Boolean(session),
          userId: session?.user?.id ?? null,
        });
        safelyApplySession(session, event);

        if (event === 'SIGNED_IN' && session?.refresh_token && typeof window !== 'undefined') {
          window.setTimeout(async () => {
            try {
              const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: session.refresh_token,
              });

              if (refreshError) {
                throw refreshError;
              }

              const refreshedUserId = refreshedData?.session?.user?.id || session?.user?.id;
              if (refreshedUserId && isMountedRef.current && isActive) {
                await fetchProfile(refreshedUserId, { retryCount: 2, preferDirect: true });
              }
            } catch (refreshError) {
              console.warn('[AuthContext] Session refresh after SIGNED_IN failed:', {
                message: refreshError?.message || 'Unknown error',
                userId: session?.user?.id ?? null,
              });
            }
          }, 100);
        }

        if (session?.user?.id && typeof window !== 'undefined') {
          window.setTimeout(() => {
            if (!isMountedRef.current || !isActive) return;
            void fetchProfile(session.user.id, { retryCount: 1, preferDirect: true });
          }, 350);
        }
      });

      authSubscription = data?.subscription;
    } catch (error) {
      console.error('[AuthContext] Failed to set up auth listener:', error);

      if (isMountedRef.current && isActive) {
        setUser(null);
        setProfile(null);
        setAuthError(error ?? null);
        setIsOffline(isNetworkError(error));
        setLoading(false);
      }
    }

    void initializeAuth();

    const handleOffline = () => {
      if (!isMountedRef.current || !isActive) {
        return;
      }
      setIsOffline(true);
    };

    const handleOnline = () => {
      if (!isMountedRef.current || !isActive) {
        return;
      }
      setIsOffline(false);
    };

    const handleAuthRefresh = () => {
      if (!isMountedRef.current || !isActive) {
        return;
      }
      setLoading(true);
      void initializeAuth();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
      window.addEventListener('aiko:auth-refresh', handleAuthRefresh);
    }

    return () => {
      isActive = false;
      isMountedRef.current = false;
      authSubscription?.unsubscribe?.();

      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('aiko:auth-refresh', handleAuthRefresh);
      }
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!user?.id) return undefined;

    let disposed = false;
    const profileChannel = supabase
      .channel(`profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => {
          if (!disposed) {
            void fetchProfile(user.id, { retryCount: 1, preferDirect: true });
          }
        }
      )
      .subscribe();

    const pollTimer =
      typeof window !== 'undefined'
        ? window.setInterval(() => {
            if (!disposed) {
              void fetchProfile(user.id, { retryCount: 1, preferDirect: true });
            }
          }, 45000)
        : null;

    return () => {
      disposed = true;
      if (pollTimer && typeof window !== 'undefined') {
        window.clearInterval(pollTimer);
      }
      void supabase.removeChannel(profileChannel);
    };
  }, [user?.id, fetchProfile]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[AuthContext] signOut failed:', error);

      if (isMountedRef.current) {
        setAuthError(error ?? null);
        if (isNetworkError(error)) {
          setIsOffline(true);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isOffline, authError, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
