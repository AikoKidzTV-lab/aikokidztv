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

const AUTH_TIMEOUT_MS = 10000;

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
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isMountedRef = useRef(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      if (isMountedRef.current) {
        setProfile(null);
      }
      return null;
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

      setAuthError(error ?? null);
      if (isNetworkError(error)) {
        setIsOffline(true);
      }

      return null;
    }
  }, []);

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

      await fetchProfile(nextUser.id);
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

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      isActive = false;
      isMountedRef.current = false;
      authSubscription?.unsubscribe?.();

      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
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
            void fetchProfile(user.id);
          }
        }
      )
      .subscribe();

    const pollTimer =
      typeof window !== 'undefined'
        ? window.setInterval(() => {
            if (!disposed) {
              void fetchProfile(user.id);
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
