import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthModal from '../components/AuthModal';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const AuthModalContext = createContext({
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

const normalizeMode = (mode) => (mode === 'signup' ? 'signup' : 'login');
const wait = (ms) =>
  new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      window.setTimeout(resolve, ms);
      return;
    }
    setTimeout(resolve, ms);
  });

export const AuthModalProvider = ({ children }) => {
  const { fetchProfile } = useAuth();
  const [authModalMode, setAuthModalMode] = useState(null);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(normalizeMode(mode));
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
  }, []);

  const handleAuthSuccess = useCallback(
    async ({ user } = {}) => {
      if (!user?.id) return;

      try {
        // Force a fresh session read/refresh so RLS policies that depend on auth.uid() are
        // applied immediately with the latest token state on production.
        const { data: sessionData } = await supabase.auth.getSession();
        const currentSession = sessionData?.session ?? null;
        if (currentSession?.refresh_token) {
          await supabase.auth.refreshSession({
            refresh_token: currentSession.refresh_token,
          });
        }
      } catch (sessionRefreshError) {
        console.warn('[AuthModalContext] Session refresh after login failed; continuing with profile sync.', {
          message: sessionRefreshError?.message || 'Unknown error',
          userId: user.id,
        });
      }

      await fetchProfile?.(user.id);
      await wait(220);
      await fetchProfile?.(user.id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('aiko:auth-refresh'));
      }
    },
    [fetchProfile]
  );

  const contextValue = useMemo(
    () => ({
      isAuthModalOpen: Boolean(authModalMode),
      authModalMode: authModalMode || 'login',
      openAuthModal,
      closeAuthModal,
    }),
    [authModalMode, closeAuthModal, openAuthModal]
  );

  return (
    <AuthModalContext.Provider value={contextValue}>
      {children}
      <AuthModal
        open={Boolean(authModalMode)}
        initialMode={authModalMode || 'login'}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
