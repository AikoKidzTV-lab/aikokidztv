import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TEST_MODE_STORAGE_KEY = 'aiko_parent_test_mode_v1';
const TEST_MODE_SYNC_EVENT = 'aiko:test-mode-sync';

const ParentControlsContext = createContext({
  isTestMode: false,
  setIsTestMode: () => {},
  toggleTestMode: () => {},
});

const readStoredTestMode = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(TEST_MODE_STORAGE_KEY) === 'true';
};

export function ParentControlsProvider({ children }) {
  const [isTestMode, setIsTestMode] = useState(() => readStoredTestMode());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TEST_MODE_STORAGE_KEY, String(isTestMode));
    window.dispatchEvent(new Event(TEST_MODE_SYNC_EVENT));
  }, [isTestMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncTestModeState = () => {
      setIsTestMode(readStoredTestMode());
    };

    window.addEventListener('storage', syncTestModeState);
    window.addEventListener(TEST_MODE_SYNC_EVENT, syncTestModeState);

    return () => {
      window.removeEventListener('storage', syncTestModeState);
      window.removeEventListener(TEST_MODE_SYNC_EVENT, syncTestModeState);
    };
  }, []);

  const value = useMemo(
    () => ({
      isTestMode,
      setIsTestMode,
      toggleTestMode: () => setIsTestMode((prev) => !prev),
    }),
    [isTestMode]
  );

  return <ParentControlsContext.Provider value={value}>{children}</ParentControlsContext.Provider>;
}

export const useParentControls = () => useContext(ParentControlsContext);
