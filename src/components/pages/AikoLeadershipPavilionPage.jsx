import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HERO_MISSIONS = [
  'Help Mom/Dad with a chore',
  'Put your toys away',
  'Drink a glass of water',
];

const goodDeeds = [
  'Help set the dinner table today!',
  'Share your favorite toy with a friend!',
  "Say 'Thank You' to your parents!",
  'Help a younger kid pick up their things!',
  'Smile and say something kind to someone today!',
];

const braveryScenarios = [
  {
    scenario: 'You see a new kid sitting all alone at the playground.',
    action: 'Walk up, say Hello, and invite them to play! 🤝',
  },
  {
    scenario: 'A friend drops their books in the hallway.',
    action: 'Help pick them up and ask if they are okay. 💛',
  },
  {
    scenario: 'Someone feels nervous before speaking in class.',
    action: 'Cheer them on and remind them they can do it! 🌟',
  },
  {
    scenario: 'You notice a classmate being left out of a team game.',
    action: 'Ask them to join your team so everyone feels included. 🫶',
  },
  {
    scenario: 'A little child is scared to try the big slide.',
    action: 'Stand nearby, encourage them, and remind them to go at their own pace. 🦸‍♀️',
  },
];

export default function AikoLeadershipPavilionPage() {
  const navigate = useNavigate();
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [braveryResult, setBraveryResult] = useState('');
  const [completedMissions, setCompletedMissions] = useState([]);
  const [deedIndex, setDeedIndex] = useState(0);
  const [isDeedDone, setIsDeedDone] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showAction, setShowAction] = useState(false);

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

        <section className="rounded-2xl border border-yellow-300/30 bg-yellow-700 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Daily Hero Affirmations</h2>

          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-amber-950 shadow-none">
            <div className="animate-pulse text-6xl sm:text-7xl">☀️</div>
            <button
              type="button"
              onClick={() => setShowAffirmation(true)}
              className="rounded-xl border border-amber-700 bg-amber-600 px-5 py-3 text-base font-black text-white shadow-none hover:bg-amber-700"
            >
              Tap for AIKO&apos;s Message! ✨
            </button>

            {showAffirmation && (
              <p className="rounded-xl border border-yellow-200 bg-yellow-100 px-4 py-3 text-center text-sm font-black text-amber-950">
                You are brave, you are smart, and you can do anything today! 💛
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-300/30 bg-yellow-700 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Bravery Tales</h2>
          <p className="mt-2 text-sm font-bold text-yellow-100">
            AIKO hears a strange noise in the dark room. What should she do?
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setBraveryResult("It's okay to be scared, but let's try to be brave!")}
              className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-base font-black text-amber-950 shadow-none hover:bg-yellow-100"
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
              className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-base font-black text-amber-950 shadow-none hover:bg-yellow-100"
            >
              Turn on the light! 💡
            </button>
          </div>

          {braveryResult && (
            <p className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-black text-amber-950">
              {braveryResult}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-yellow-300/30 bg-yellow-700 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Real-Life Hero Missions</h2>

          <div className="mt-4 space-y-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-amber-950 shadow-none">
            {HERO_MISSIONS.map((mission, index) => {
              const checked = completedMissions.includes(mission);
              return (
                <button
                  key={mission}
                  type="button"
                  onClick={() => handleToggleMission(mission)}
                  className="flex w-full items-center gap-3 rounded-xl border border-yellow-200 bg-white px-3 py-3 text-left shadow-none hover:bg-yellow-100"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 ${
                      checked
                        ? 'border-yellow-200 bg-yellow-400 text-slate-900'
                        : 'border-amber-700 bg-white text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`text-sm font-black sm:text-base ${
                      checked ? 'line-through text-amber-500' : 'text-amber-950'
                    }`}
                  >
                    {index + 1}. {mission}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-300/30 bg-yellow-700 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Heroic Good Deeds 🌟</h2>
            <button
              type="button"
              onClick={() => {
                setDeedIndex((prev) => (prev + 1) % goodDeeds.length);
                setIsDeedDone(false);
              }}
              className="rounded-xl border border-yellow-300/25 bg-yellow-400/15 px-3 py-2 text-xs font-black text-yellow-100 shadow-none hover:bg-yellow-400/20"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-amber-950 shadow-none sm:p-6">
            <p className="text-2xl font-black leading-relaxed text-amber-950 sm:text-3xl">
              {goodDeeds[deedIndex]}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsDeedDone(true)}
                className={`rounded-xl border px-5 py-3 text-sm font-black shadow-none ${
                  isDeedDone
                    ? 'border-emerald-400 bg-gradient-to-r from-yellow-400 to-emerald-500 text-white'
                    : 'border-yellow-300 bg-white text-amber-900'
                }`}
              >
                I Did It! ✅
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-300/30 bg-yellow-700 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Bravery Situations 🦸‍♀️</h2>
            <button
              type="button"
              onClick={() => {
                setScenarioIndex((prev) => (prev + 1) % braveryScenarios.length);
                setShowAction(false);
              }}
              className="rounded-xl border border-yellow-300/25 bg-yellow-400/15 px-3 py-2 text-xs font-black text-yellow-100 shadow-none hover:bg-yellow-400/20"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-amber-950 shadow-none sm:p-6">
            <p className="text-xl font-black leading-relaxed text-amber-950 sm:text-2xl">
              {braveryScenarios[scenarioIndex].scenario}
            </p>

            {showAction && (
              <p className="mt-4 rounded-xl border border-yellow-300/40 bg-white/80 px-4 py-3 text-sm font-black text-amber-900">
                {braveryScenarios[scenarioIndex].action}
              </p>
            )}

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowAction(true)}
                className="rounded-xl border border-yellow-300 bg-white px-5 py-3 text-sm font-black text-amber-900 shadow-none hover:bg-yellow-50"
              >
                What should a Leader do? 🤔
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
