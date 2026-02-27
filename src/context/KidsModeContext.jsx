import React, { createContext, useContext, useState, useCallback } from 'react';

const KidsModeContext = createContext({
  isKidsModeOn: false,
  toggleKidsMode: () => {},
  triggerConfetti: () => {},
});

export const KidsModeProvider = ({ children }) => {
  const [isKidsModeOn, setIsKidsModeOn] = useState(false);

  const toggleKidsMode = useCallback(() => {
    setIsKidsModeOn((prev) => !prev);
  }, []);

  const triggerConfetti = useCallback(async () => {
    if (!isKidsModeOn) return;
    try {
      const { default: confetti } = await import('canvas-confetti');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 },
        scalar: 0.9,
      });
    } catch (err) {
      console.error('Confetti failed', err);
    }
  }, [isKidsModeOn]);

  return (
    <KidsModeContext.Provider value={{ isKidsModeOn, toggleKidsMode, triggerConfetti }}>
      {children}
    </KidsModeContext.Provider>
  );
};

export const useKidsMode = () => useContext(KidsModeContext);
