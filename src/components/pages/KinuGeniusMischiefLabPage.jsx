import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PRANK_SPOTS = [
  { id: 'bush', label: 'Bush 🌳' },
  { id: 'cloud', label: 'Cloud ☁️' },
  { id: 'box', label: 'Box 📦' },
];

const SILLY_SOLUTIONS = [
  { id: 'castle', label: 'Giant Bouncy Castle 🏰', message: 'Boing! Boing! Safe landing!' },
  { id: 'boots', label: 'Rocket Boots 🚀', message: 'Zoom! You crossed in style!' },
  { id: 'car', label: 'Floating Car 🚗', message: 'Vroom in the sky. Bridge problem solved!' },
];

export default function KinuGeniusMischiefLabPage() {
  const navigate = useNavigate();
  const [springPlaced, setSpringPlaced] = useState(false);
  const [prankResult, setPrankResult] = useState('');
  const [solutionResult, setSolutionResult] = useState('');

  useEffect(() => {
    if (!prankResult) return undefined;
    const timer = window.setTimeout(() => setPrankResult(''), 2400);
    return () => window.clearTimeout(timer);
  }, [prankResult]);

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handlePlaceSpring = () => {
    setSpringPlaced(true);
  };

  const handlePrankSpotClick = (spotId) => {
    if (spotId === 'cloud') {
      setPrankResult('You found it! ⚽🎉');
      return;
    }
    setPrankResult('Nope, not here! 😜');
  };

  const handleSillySolutionClick = (message) => {
    setSolutionResult(message);
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-blue-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-4 py-2 text-sm font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              ← Back to Learning Zone
            </button>
            <h1 className="text-2xl font-black tracking-tight text-blue-100 sm:text-3xl">
              KINU&apos;s Genius &amp; Mischief Lab 🧠⚡
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-blue-200 sm:text-xl">Crazy Contraptions</h2>
          <div className="mt-4 rounded-2xl border border-blue-200/20 bg-slate-800/65 p-4 shadow-none">
            <p className="text-base font-bold text-blue-100">The ball needs to bounce!</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-blue-300/50 bg-blue-500/10 px-3 py-2 text-2xl">⚽</span>
              <span className="text-xl text-blue-300">→</span>
              <span className="rounded-lg border border-dashed border-blue-400/50 bg-slate-900/70 px-3 py-2 text-lg text-blue-200">
                {springPlaced ? '🌀' : '...'}
              </span>
              <span className="text-xl text-blue-300">→</span>
              <span className="rounded-lg border border-blue-300/50 bg-blue-500/10 px-3 py-2 text-2xl">🎯</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePlaceSpring}
                className="rounded-xl border border-blue-300/25 bg-blue-400/15 px-5 py-3 text-base font-black text-blue-100 shadow-none hover:bg-blue-400/20"
              >
                Place Spring 🌀
              </button>

              {springPlaced && (
                <p className="rounded-xl border border-emerald-200/25 bg-emerald-500/12 px-4 py-2 text-sm font-black text-emerald-200">
                  BOING! 🔔
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-blue-200 sm:text-xl">Hide &amp; Seek Prank</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">I hid NIKO&apos;s ball! Where is it?</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PRANK_SPOTS.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => handlePrankSpotClick(spot.id)}
                className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-5 py-5 text-lg font-black text-blue-100 shadow-none hover:bg-blue-400/18"
              >
                {spot.label}
              </button>
            ))}
          </div>

          {prankResult && (
            <p className="mt-4 rounded-xl border border-blue-200/25 bg-slate-800/65 px-4 py-2 text-sm font-black text-blue-100">
              {prankResult}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-blue-200 sm:text-xl">Silly Solutions</h2>

          <div className="mt-4 rounded-2xl border border-blue-200/20 bg-slate-800/65 p-4 shadow-none">
            <p className="text-base font-black text-blue-100">How to cross a broken bridge? 🌉</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SILLY_SOLUTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSillySolutionClick(option.message)}
                  className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-4 py-4 text-base font-black text-blue-100 shadow-none hover:bg-blue-400/18"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {solutionResult && (
              <p className="mt-4 rounded-xl border border-emerald-200/25 bg-emerald-500/12 px-4 py-2 text-sm font-black text-emerald-200">
                {solutionResult}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
