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
    color: '#facc15',
    shadowDark: '#b8860b',
    shadowLight: '#fde68a',
    innerLight: '#fef3c7',
    innerDark: '#a16207',
    textClass: 'text-slate-900',
    pillBg: '#fde68a',
    pillTextClass: 'text-amber-900',
  },
  {
    key: 'niko',
    name: 'NIKO BIO',
    role: 'The Calm Singer',
    emoji: '\u{1F3A4}',
    route: '/niko-bio',
    color: '#a855f7',
    shadowDark: '#6d28d9',
    shadowLight: '#d8b4fe',
    innerLight: '#e9d5ff',
    innerDark: '#581c87',
    textClass: 'text-white',
    pillBg: '#c084fc',
    pillTextClass: 'text-purple-950',
  },
  {
    key: 'kinu',
    name: 'KINU BIO',
    role: 'Smart Dancer',
    emoji: '\u{1F57A}',
    route: '/kinu-bio',
    color: '#3b82f6',
    shadowDark: '#1d4ed8',
    shadowLight: '#93c5fd',
    innerLight: '#bfdbfe',
    innerDark: '#1e3a8a',
    textClass: 'text-white',
    pillBg: '#93c5fd',
    pillTextClass: 'text-blue-950',
  },
  {
    key: 'mimi',
    name: 'MIMI BIO',
    role: 'Creative Artist',
    emoji: '\u{1F3A8}',
    route: '/mimi-bio',
    color: '#14b8a6',
    shadowDark: '#0f766e',
    shadowLight: '#99f6e4',
    innerLight: '#ccfbf1',
    innerDark: '#134e4a',
    textClass: 'text-white',
    pillBg: '#5eead4',
    pillTextClass: 'text-teal-950',
  },
  {
    key: 'miko',
    name: 'MIKO BIO',
    role: 'Curious Explorer',
    emoji: '\u{1F9ED}',
    route: '/miko-bio',
    color: '#84cc16',
    shadowDark: '#4d7c0f',
    shadowLight: '#d9f99d',
    innerLight: '#ecfccb',
    innerDark: '#3f6212',
    textClass: 'text-slate-900',
    pillBg: '#d9f99d',
    pillTextClass: 'text-lime-950',
  },
  {
    key: 'chiko',
    name: 'CHIKO BIO',
    role: 'Fun Prankster',
    emoji: '\u{1F61C}',
    route: '/chiko-bio',
    color: '#ec4899',
    shadowDark: '#be185d',
    shadowLight: '#f9a8d4',
    innerLight: '#fbcfe8',
    innerDark: '#9d174d',
    textClass: 'text-white',
    pillBg: '#f9a8d4',
    pillTextClass: 'text-pink-950',
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
              className="group relative block overflow-hidden rounded-[35px] p-6 transition duration-300 hover:-translate-y-1"
              style={{
                background: char.color,
                border: `1px solid ${char.shadowLight}`,
                boxShadow: `16px 16px 32px ${char.shadowDark}, -16px -16px 32px ${char.shadowLight}, inset 4px 4px 8px ${char.innerLight}, inset -4px -4px 8px ${char.innerDark}`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 20% 12%, rgba(255,255,255,0.25), transparent 36%), radial-gradient(circle at 85% 85%, rgba(0,0,0,0.16), transparent 45%)',
                }}
              />

              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="grid h-14 w-14 place-items-center rounded-full text-2xl"
                  style={{
                    background: char.pillBg,
                    border: `1px solid ${char.innerLight}`,
                    boxShadow: `inset 2px 2px 6px ${char.innerLight}, inset -3px -4px 8px ${char.innerDark}`,
                  }}
                >
                  <span>{char.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h3 className={`truncate text-lg font-black tracking-wide ${char.textClass}`}>
                    {char.name}
                  </h3>
                  <p className={`text-sm font-bold ${char.textClass}`}>
                    {char.role}
                  </p>
                </div>
              </div>

              <div
                className={`relative z-10 mt-4 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${char.pillTextClass}`}
                style={{
                  background: char.pillBg,
                  border: `1px solid ${char.innerLight}`,
                  boxShadow: `inset 2px 2px 6px ${char.innerLight}, inset -2px -2px 6px ${char.innerDark}`,
                }}
              >
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
