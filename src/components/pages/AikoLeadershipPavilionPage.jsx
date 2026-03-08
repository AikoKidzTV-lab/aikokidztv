import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HERO_MISSIONS = [
  'Help Mom/Dad with a chore',
  'Put your toys away',
  'Drink a glass of water',
];

export default function AikoLeadershipPavilionPage() {
  const navigate = useNavigate();
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [braveryResult, setBraveryResult] = useState('');
  const [completedMissions, setCompletedMissions] = useState([]);

  useEffect(() => {
    if (!braveryResult) return undefined;
    const timer = window.setTimeout(() => setBraveryResult(''), 3600);
    return () => window.clearTimeout(timer);
  }, [braveryResult]);

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleToggleMission = (mission) => {
    setCompletedMissions((current) =>
      current.includes(mission)
        ? current.filter((item) => item !== mission)
        : [...current, mission]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-yellow-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-yellow-300/25 bg-yellow-400/15 px-4 py-2 text-sm font-black text-yellow-100 shadow-none hover:bg-yellow-400/20"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-yellow-100 sm:text-3xl">
              AIKO&apos;s Leadership Pavilion ☀️👑
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-yellow-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-yellow-200 sm:text-xl">Daily Hero Affirmations</h2>

          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-yellow-200/20 bg-slate-800/65 p-5 shadow-none">
            <div className="animate-pulse text-6xl sm:text-7xl">☀️</div>
            <button
              type="button"
              onClick={() => setShowAffirmation(true)}
              className="rounded-xl border border-yellow-300/25 bg-yellow-400/15 px-5 py-3 text-base font-black text-yellow-100 shadow-none hover:bg-yellow-400/20"
            >
              Tap for AIKO&apos;s Message! ✨
            </button>

            {showAffirmation && (
              <p className="rounded-xl border border-yellow-200/25 bg-amber-500/12 px-4 py-3 text-center text-sm font-black text-yellow-100">
                You are brave, you are smart, and you can do anything today! 💛
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-yellow-200 sm:text-xl">Bravery Tales</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">
            AIKO hears a strange noise in the dark room. What should she do?
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setBraveryResult("It's okay to be scared, but let's try to be brave!")}
              className="rounded-xl border border-yellow-300/25 bg-yellow-400/12 px-5 py-4 text-base font-black text-yellow-100 shadow-none hover:bg-yellow-400/18"
            >
              Run away 🏃‍♀️
            </button>
            <button
              type="button"
              onClick={() =>
                setBraveryResult(
                  'She found it! It was just a cute cat 🐈. You earned a Bravery Badge! 🛡️'
                )
              }
              className="rounded-xl border border-yellow-300/25 bg-yellow-400/12 px-5 py-4 text-base font-black text-yellow-100 shadow-none hover:bg-yellow-400/18"
            >
              Turn on the light! 💡
            </button>
          </div>

          {braveryResult && (
            <p className="mt-4 rounded-xl border border-yellow-200/25 bg-slate-800/65 px-4 py-2 text-sm font-black text-yellow-100">
              {braveryResult}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-yellow-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-yellow-200 sm:text-xl">Real-Life Hero Missions</h2>

          <div className="mt-4 space-y-3 rounded-2xl border border-yellow-200/20 bg-slate-800/65 p-4 shadow-none">
            {HERO_MISSIONS.map((mission, index) => {
              const checked = completedMissions.includes(mission);
              return (
                <button
                  key={mission}
                  type="button"
                  onClick={() => handleToggleMission(mission)}
                  className="flex w-full items-center gap-3 rounded-xl border border-yellow-200/20 bg-yellow-400/10 px-3 py-3 text-left shadow-none hover:bg-yellow-400/15"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 ${
                      checked
                        ? 'border-yellow-200 bg-yellow-400 text-slate-900'
                        : 'border-yellow-300/80 bg-slate-900 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`text-sm font-black sm:text-base ${
                      checked ? 'line-through text-gray-500' : 'text-yellow-100'
                    }`}
                  >
                    {index + 1}. {mission}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
