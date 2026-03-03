import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthModal from '../components/AuthModal';
import { useAuth } from './AuthContext';

const AuthModalContext = createContext({
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

const normalizeMode = (mode) => (mode === 'signup' ? 'signup' : 'login');

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
      await fetchProfile?.(user.id, { retryCount: 2, preferDirect: true });
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
