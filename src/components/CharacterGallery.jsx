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
    theme: 'border-yellow-300 bg-yellow-100 text-yellow-900',
  },
  {
    key: 'niko',
    name: 'NIKO BIO',
    role: 'The Calm Singer',
    emoji: '🎤',
    route: '/niko-bio',
    theme: 'border-rose-300 bg-rose-100 text-rose-900',
  },
  {
    key: 'kinu',
    name: 'KINU BIO',
    role: 'Smart Dancer',
    emoji: '🕺',
    route: '/kinu-bio',
    theme: 'border-violet-300 bg-violet-100 text-violet-900',
  },
  {
    key: 'mimi',
    name: 'MIMI BIO',
    role: 'Creative Artist',
    emoji: '🎨',
    route: '/mimi-bio',
    theme: 'border-pink-300 bg-pink-100 text-pink-900',
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
              className={`group block rounded-2xl border-2 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl ${char.theme}`}
            >
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-white/80 text-2xl shadow-inner">
                  {char.emoji}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black tracking-wide">{char.name}</h3>
                  <p className="text-sm font-bold opacity-90">{char.role}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-900">
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

