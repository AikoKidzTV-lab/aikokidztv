import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROBOT_PARTS = [
  'Rocket Boots',
  'Laser Eyes',
  'Spring Arms',
  'Turbo Core',
  'Holo Shield',
  'Magnet Wheels',
];

const CODE_ACTIONS = [
  { id: 'up', label: '⬆️ Up', token: '⬆️' },
  { id: 'right', label: '➡️ Right', token: '➡️' },
  { id: 'turn', label: '🔄 Turn', token: '🔄' },
];

const MAZE_SIZE = 7;
const WALLS = new Set([2, 4, 10, 14, 18, 22, 27, 31, 35, 40, 44]);

export default function ChikoTechLabPage() {
  const navigate = useNavigate();
  const [assemblyParts, setAssemblyParts] = useState([]);
  const [codeSequence, setCodeSequence] = useState([]);
  const [showHologram, setShowHologram] = useState(false);

  useEffect(() => {
    const hologramTimer = window.setTimeout(() => {
      setShowHologram(true);
    }, 10000);

    return () => window.clearTimeout(hologramTimer);
  }, []);

  const mazeCells = useMemo(
    () =>
      Array.from({ length: MAZE_SIZE * MAZE_SIZE }, (_, index) => ({
        id: index,
        isWall: WALLS.has(index),
      })),
    []
  );

  const handleAddPart = (partName) => {
    setAssemblyParts((current) => (current.includes(partName) ? current : [...current, partName]));
  };

  const handleAddCodeToken = (token) => {
    setCodeSequence((current) => [...current, token]);
  };

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-teal-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-teal-300/25 bg-teal-500/12 px-4 py-2 text-sm font-black text-teal-100 shadow-none hover:bg-teal-500/18"
            >
              ← Back to Learning Zone
            </button>
            <h1 className="text-2xl font-black tracking-tight text-cyan-200 sm:text-3xl">
              CHIKO&apos;s Kool Tech Lab 🤖
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-teal-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-teal-200 sm:text-xl">The Kool Bot-Builder</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-cyan-200/20 bg-slate-800/65 p-4 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Parts Bay</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ROBOT_PARTS.map((part) => (
                  <button
                    key={part}
                    type="button"
                    onClick={() => handleAddPart(part)}
                    className="rounded-lg border border-teal-200/20 bg-teal-500/10 px-3 py-2 text-left text-sm font-bold text-teal-100 shadow-none hover:bg-teal-500/15"
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-cyan-200/20 bg-slate-800/65 p-4 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Assembly Area</p>
              <div className="mt-3 min-h-[140px] rounded-lg border border-dashed border-teal-200/25 bg-slate-800/65 p-3">
                {assemblyParts.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400">Click parts from the left to assemble your bot.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assemblyParts.map((part) => (
                      <span
                        key={part}
                        className="rounded-full border border-teal-300/60 bg-teal-400/20 px-3 py-1 text-xs font-black text-teal-100"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-teal-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-teal-200 sm:text-xl">Code the Path</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-cyan-200/20 bg-slate-800/65 p-4 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Mock Maze Grid</p>
              <div className="mt-3 grid grid-cols-7 gap-1.5 rounded-lg border border-teal-200/20 bg-slate-800/65 p-3">
                {mazeCells.map((cell) => (
                  <div
                    key={cell.id}
                    className={`aspect-square rounded-sm border ${
                      cell.isWall
                        ? 'border-cyan-300/50 bg-cyan-500/35'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-cyan-200/20 bg-slate-800/65 p-4 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Direction Controls</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {CODE_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleAddCodeToken(action.token)}
                    className="rounded-lg border border-teal-200/20 bg-teal-500/10 px-3 py-2 text-sm font-black text-teal-100 shadow-none hover:bg-teal-500/15"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-cyan-200/20 bg-slate-800/65 p-3 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Code Sequence</p>
              <button
                type="button"
                onClick={() => setCodeSequence([])}
                className="rounded-lg border border-slate-500/40 bg-slate-700/55 px-2.5 py-1 text-xs font-bold text-slate-200 shadow-none hover:bg-slate-700/70"
              >
                Clear
              </button>
            </div>
            <div className="mt-2 min-h-11 rounded-lg border border-dashed border-teal-200/25 bg-slate-800/65 p-2">
              {codeSequence.length === 0 ? (
                <p className="text-sm font-semibold text-slate-400">Tap controls to build your code sequence.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {codeSequence.map((token, index) => (
                    <span
                      key={`${token}-${index}`}
                      className="rounded-md border border-teal-300/50 bg-teal-400/20 px-2 py-1 text-sm font-black text-teal-100"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {showHologram && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-sm rounded-xl border border-teal-300/20 bg-slate-900/90 p-3 shadow-none sm:bottom-6 sm:right-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-cyan-100">
              Incoming Hologram from MIKO 🌿: Trees are cooler than robots!
            </p>
            <button
              type="button"
              onClick={() => setShowHologram(false)}
              className="rounded-md border border-teal-300/25 bg-teal-500/12 px-2 py-1 text-xs font-black text-teal-100 shadow-none hover:bg-teal-500/18"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
