import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isMountedRef = useRef(false);

  const fetchProfile = async (userId) => {
    if (!userId) {
      if (isMountedRef.current) {
        setProfile(null);
      }
      return null;
    }

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        throw error;
      }

      if (isMountedRef.current) {
        setProfile(data ?? null);
        setIsOffline(false);
        setAuthError(null);
      }

      return data ?? null;
    } catch (error) {
      console.error('[AuthContext] Failed to fetch profile:', error);

      if (!isMountedRef.current) {
        return null;
      }

      setProfile(null);
      setAuthError(error ?? null);
      if (isNetworkError(error)) {
        setIsOffline(true);
      }

      return null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    let isActive = true;
    let authSubscription;

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
        const { data, error } = await supabase.auth.getSession();

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
  }, []);

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
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
          <Loader className="animate-spin text-pink-500" size={48} />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
