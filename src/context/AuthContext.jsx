import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isOffline: false,
  authError: null,
  signOut: async () => {},
  fetchProfile: async () => null,
  updateProfileBalances: () => {},
});

const normalizeProfile = (rawProfile = null, userId = null) => {
  const source = rawProfile && typeof rawProfile === 'object' ? rawProfile : {};
  const toStringArray = (value) => (Array.isArray(value) ? value.filter(Boolean).map(String) : []);
  const gems = Number(source.gems);
  const rainbowGems = Number(source.rainbow_gems ?? source.rainbowGems);

  return {
    ...source,
    id: source.id || userId || null,
    gems: Number.isFinite(gems) ? Math.max(0, Math.floor(gems)) : 0,
    rainbow_gems: Number.isFinite(rainbowGems) ? Math.max(0, Math.floor(rainbowGems)) : 0,
    rainbowGems: Number.isFinite(rainbowGems) ? Math.max(0, Math.floor(rainbowGems)) : 0,
    unlocked_zones: toStringArray(source.unlocked_zones),
    unlocked_features: toStringArray(source.unlocked_features),
    unlocked_videos: toStringArray(source.unlocked_videos),
    unlocked_items: toStringArray(source.unlocked_items),
    claimed_rewards: toStringArray(source.claimed_rewards),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const normalized = normalizeProfile(data, userId);
      setProfile(normalized);
      setAuthError(null);
      return normalized;
    } catch (error) {
      console.error('[AuthContext] Failed to fetch profile:', error);
      setAuthError(error ?? null);
      const fallback = normalizeProfile(null, userId);
      setProfile(fallback);
      return fallback;
    }
  }, []);

  const updateProfileBalances = useCallback(({ gems, rainbowGems, rainbow_gems } = {}) => {
    setProfile((currentProfile) => {
      const normalizedCurrent = normalizeProfile(currentProfile, currentProfile?.id || user?.id || null);
      const nextGems = Number(gems);
      const nextRainbow = Number(rainbowGems ?? rainbow_gems);

      const nextProfile = {
        ...normalizedCurrent,
        gems: Number.isFinite(nextGems) ? Math.max(0, Math.floor(nextGems)) : normalizedCurrent.gems,
        rainbow_gems: Number.isFinite(nextRainbow)
          ? Math.max(0, Math.floor(nextRainbow))
          : normalizedCurrent.rainbow_gems,
      };

      return normalizeProfile(nextProfile, normalizedCurrent.id || user?.id || null);
    });
  }, [user?.id]);

  useEffect(() => {
    let isActive = true;
    let authSubscription;

    const initialize = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isActive) {
          const session = data?.session ?? null;
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Session init failed:', error);
        if (isActive) {
          setUser(null);
          setProfile(null);
          setAuthError(error ?? null);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    const attachAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isActive) return;
        
        // Only react to explicit sign in/out events to avoid loops
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          const nextUser = session?.user ?? null;
          setUser(nextUser);
          if (nextUser) {
             void fetchProfile(nextUser.id);
          } else {
             setProfile(null);
          }
        }
      });
      authSubscription = data?.subscription;
    };

    void (async () => {
      await initialize();
      if (isActive) {
        attachAuthListener();
      }
    })();

    return () => {
      isActive = false;
      authSubscription?.unsubscribe?.();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('[AuthContext] signOut failed:', error);
      setAuthError(error ?? null);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isOffline: false,
        authError,
        signOut,
        fetchProfile,
        updateProfileBalances,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
