import React from 'react';
import { useKidsMode } from '../context/KidsModeContext';

const mascots = ['\uD83D\uDC3C', '\uD83D\uDC30', '\uD83D\uDC28', '\uD83E\uDD8A'];

const KidsMascot = () => {
  const { isKidsModeOn } = useKidsMode();
  if (!isKidsModeOn) return null;
  const mascot = mascots[Math.floor(Math.random() * mascots.length)];
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-soft-bounce">
      <div className="text-5xl drop-shadow-lg">{mascot}</div>
    </div>
  );
};

export default KidsMascot;
