import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const featuredCharacters = [
  {
    key: 'aiko',
    name: 'AIKO BIO',
    role: 'Energetic Leader',
    emoji: '\u{1F31F}',
    route: '/aiko-bio',
    theme: 'from-amber-200 via-yellow-100 to-orange-200',
  },
  {
    key: 'niko',
    name: 'NIKO BIO',
    role: 'The Calm Singer',
    emoji: '\u{1F3A4}',
    route: '/niko-bio',
    theme: 'from-rose-200 via-pink-100 to-fuchsia-200',
  },
  {
    key: 'kinu',
    name: 'KINU BIO',
    role: 'Smart Dancer',
    emoji: '\u{1F57A}',
    route: '/kinu-bio',
    theme: 'from-violet-200 via-purple-100 to-indigo-200',
  },
  {
    key: 'mimi',
    name: 'MIMI BIO',
    role: 'Creative Artist',
    emoji: '\u{1F3A8}',
    route: '/mimi-bio',
    theme: 'from-sky-200 via-cyan-100 to-blue-200',
  },
  {
    key: 'miko',
    name: 'MIKO BIO',
    role: 'Curious Explorer',
    emoji: '\u{1F9ED}',
    route: '/miko-bio',
    theme: 'from-emerald-200 via-teal-100 to-cyan-200',
  },
  {
    key: 'chiko',
    name: 'CHIKO BIO',
    role: 'Fun Prankster',
    emoji: '\u{1F61C}',
    route: '/chiko-bio',
    theme: 'from-lime-200 via-amber-100 to-yellow-200',
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredCharacters.map((char, index) => (
          <motion.div
            key={char.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <Link
              to={char.route}
              className={`clay-card group relative block overflow-hidden bg-gradient-to-br p-6 transition duration-300 hover:-translate-y-1 ${char.theme}`}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 20% 12%, rgba(255,255,255,0.65), transparent 36%), radial-gradient(circle at 85% 85%, rgba(15,23,42,0.12), transparent 45%)',
                }}
              />

              <div className="relative z-10 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-white/80 bg-white/90 text-2xl [box-shadow:inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-3px_-4px_8px_rgba(15,23,42,0.12)]">
                  <span>{char.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black tracking-wide text-slate-900">
                    {char.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-700">
                    {char.role}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-4 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-900 [box-shadow:inset_1px_1px_3px_rgba(255,255,255,0.8),inset_-2px_-2px_6px_rgba(15,23,42,0.12)]">
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
