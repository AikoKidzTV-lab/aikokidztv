import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LOST_ANIMALS = [
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin' },
];

const HABITATS = [
  { id: 'ice', emoji: '❄️', name: 'Ice' },
  { id: 'forest', emoji: '🌲', name: 'Forest' },
  { id: 'ocean', emoji: '🌊', name: 'Ocean' },
];

export default function MikoGalaxyGardenPage() {
  const navigate = useNavigate();
  const [isSeedPlanted, setIsSeedPlanted] = useState(false);
  const [activeAnimal, setActiveAnimal] = useState('');
  const [activeHabitat, setActiveHabitat] = useState('');
  const [showDebateToast, setShowDebateToast] = useState(false);

  useEffect(() => {
    const debateTimer = window.setTimeout(() => {
      setShowDebateToast(true);
    }, 12000);

    return () => {
      window.clearTimeout(debateTimer);
    };
  }, []);

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-green-300/20 bg-slate-900/75 p-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-green-300/25 bg-green-400/12 px-4 py-2 text-sm font-black text-green-100 hover:bg-green-400/18"
            >
              ← Back to Learning Zone
            </button>
            <h1 className="text-2xl font-black tracking-tight text-green-100 sm:text-3xl">
              MIKO&apos;s Galaxy Garden 🌿
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-green-300/20 bg-slate-900/70 p-4 sm:p-6">
          <h2 className="text-lg font-black text-green-200 sm:text-xl">The Galactic Seed</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-yellow-200/20 bg-slate-800/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-200">Gold in Galaxy ✨</p>
              <p className="mt-3 text-2xl leading-relaxed">🪙 ✨ 🪙 ✨ 🪙 ✨ 🪙 ✨ 🪙</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                Sparkly space gold is everywhere in this sector.
              </p>
            </article>

            <article className="rounded-xl border border-green-200/20 bg-slate-800/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-200">Trees in Galaxy 🌳</p>
              <p className="mt-3 text-2xl leading-relaxed">🌌 ... 🌱 ... 🌌 ... (very rare)</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                Living trees are rare in deep space, so every seed matters.
              </p>
            </article>
          </div>

          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setIsSeedPlanted(true)}
              className="rounded-xl border border-green-300/25 bg-green-400/15 px-4 py-2 text-sm font-black text-green-100 hover:bg-green-400/20"
            >
              Plant the Seed
            </button>
            <div className="rounded-xl border border-green-200/20 bg-slate-800/65 px-4 py-2">
              <span
                className={`inline-block text-3xl ${
                  isSeedPlanted ? 'scale-110' : 'scale-100'
                }`}
              >
                {isSeedPlanted ? '🌳' : '🌱'}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-green-300/20 bg-slate-900/70 p-4 sm:p-6">
          <h2 className="text-lg font-black text-green-200 sm:text-xl">Animal Rescue Safari</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-green-200/20 bg-slate-800/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-200">Lost Animals</p>
              <div className="mt-3 space-y-2">
                {LOST_ANIMALS.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => setActiveAnimal(animal.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-bold ${
                      activeAnimal === animal.id
                        ? 'border-green-300/25 bg-green-500/20 text-green-100'
                        : 'border-green-200/20 bg-green-500/10 text-slate-100 hover:bg-green-500/15'
                    }`}
                  >
                    {animal.emoji} {animal.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-cyan-200/20 bg-slate-800/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Habitats</p>
              <div className="mt-3 space-y-2">
                {HABITATS.map((habitat) => (
                  <button
                    key={habitat.id}
                    type="button"
                    onClick={() => setActiveHabitat(habitat.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-bold ${
                      activeHabitat === habitat.id
                        ? 'border-cyan-300/25 bg-cyan-500/20 text-cyan-100'
                        : 'border-cyan-200/20 bg-cyan-500/10 text-slate-100 hover:bg-cyan-500/15'
                    }`}
                  >
                    {habitat.emoji} {habitat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold text-slate-400">
            Mock UI only: select an animal and a habitat to preview future rescue gameplay.
          </p>
        </section>
      </div>

      {showDebateToast && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-sm rounded-xl border border-green-300/20 bg-slate-900/90 p-3 sm:bottom-6 sm:right-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-green-100">
              Incoming Hologram from CHIKO 🤖: My flying robots are way cooler than your slow trees!
            </p>
            <button
              type="button"
              onClick={() => setShowDebateToast(false)}
              className="rounded-md border border-green-300/25 bg-green-500/12 px-2 py-1 text-xs font-black text-green-100 hover:bg-green-500/18"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
