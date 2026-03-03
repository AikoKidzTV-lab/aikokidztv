import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const featuredCharacters = [
  {
    key: 'aiko',
    name: 'AIKO BIO',
    role: 'Energetic Leader',
    emoji: '🌟',
    route: '/aiko-bio',
    theme: 'border-white/40 bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500',
  },
  {
    key: 'niko',
    name: 'NIKO BIO',
    role: 'The Calm Singer',
    emoji: '🎤',
    route: '/niko-bio',
    theme: 'border-white/40 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600',
  },
  {
    key: 'kinu',
    name: 'KINU BIO',
    role: 'Smart Dancer',
    emoji: '🕺',
    route: '/kinu-bio',
    theme: 'border-white/40 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600',
  },
  {
    key: 'mimi',
    name: 'MIMI BIO',
    role: 'Creative Artist',
    emoji: '🎨',
    route: '/mimi-bio',
    theme: 'border-white/40 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600',
  },
];

const CharacterGallery = () => {
  return (
    <section className="w-full mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          Learning Zone Character Cards
        </h2>
        <p className="text-base font-semibold text-slate-700">
          Tap a card to open its dedicated page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredCharacters.map((char, index) => (
          <motion.div
            key={char.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <Link
              to={char.route}
              className={`group relative block overflow-hidden rounded-2xl border-2 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl ${char.theme}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-slate-900/35" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-white/90 text-2xl shadow-inner">
                  <span className="[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">{char.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black tracking-wide text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">
                    {char.name}
                  </h3>
                  <p className="text-sm font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">
                    {char.role}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-4 rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-900">
                Open Page
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CharacterGallery;
