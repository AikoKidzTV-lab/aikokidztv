import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CHARACTER_PROFILES } from '../constants/characters';
import { useAuth } from '../context/AuthContext';

const readCharacterGemCount = (profile, characterKey) => {
  const source = profile && typeof profile === 'object' ? profile : {};
  const key = String(characterKey || '').trim().toLowerCase();
  const candidates = [
    `${key}_gems`,
    `${key}_gem_count`,
    `${key}_gem_total`,
    `${key}_count`,
    `gem_${key}`,
    `gems_${key}`,
  ];

  for (const candidate of candidates) {
    const value = Number(source?.[candidate] || 0);
    if (Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
  }

  return 0;
};

const CharacterGallery = () => {
  const { profile } = useAuth();

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
        {CHARACTER_PROFILES.map((char, index) => (
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
                background: char.card.color,
                border: `1px solid ${char.card.shadowLight}`,
                boxShadow: `16px 16px 32px ${char.card.shadowDark}, -16px -16px 32px ${char.card.shadowLight}, inset 4px 4px 8px ${char.card.innerLight}, inset -4px -4px 8px ${char.card.innerDark}`,
              }}
            >
              <div
                className="absolute right-4 top-4 z-20 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs font-black text-slate-900 shadow-sm"
                title={`${char.name} ${char.gemstone} gems`}
              >
                {'\u{1F48E}'} {readCharacterGemCount(profile, char.key) || 0}
              </div>

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
                    background: char.card.pillBg,
                    border: `1px solid ${char.card.innerLight}`,
                    boxShadow: `inset 2px 2px 6px ${char.card.innerLight}, inset -3px -4px 8px ${char.card.innerDark}`,
                  }}
                >
                  <span>{char.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h3 className={`truncate text-lg font-black tracking-wide ${char.card.textClass}`}>
                    {char.cardTitle}
                  </h3>
                  <p className={`text-sm font-bold ${char.card.textClass}`}>
                    {char.specialHobby}
                  </p>
                </div>
              </div>

              <div
                className={`relative z-10 mt-4 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${char.card.pillTextClass}`}
                style={{
                  background: char.card.pillBg,
                  border: `1px solid ${char.card.innerLight}`,
                  boxShadow: `inset 2px 2px 6px ${char.card.innerLight}, inset -2px -2px 6px ${char.card.innerDark}`,
                }}
              >
                {char.colorTheme} {'\u2022'} {char.gemstone}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CharacterGallery;
