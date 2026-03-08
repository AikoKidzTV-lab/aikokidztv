import React from 'react';
import { Link } from 'react-router-dom';
import { CHARACTER_PROFILES } from '../constants/characters';

const CharacterGallery = () => {
  return (
    <section className="w-full mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Learning Zone Character Cards</h2>
        <p className="text-base font-semibold text-slate-700">Tap any card to enter the character zone.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHARACTER_PROFILES.map((char) => (
          <div key={char.key}>
            <Link
              to={char.route}
              className="group relative block cursor-pointer overflow-hidden rounded-[35px] border border-white/40 p-6 transition-all duration-300 ease-in-out hover:-translate-y-3 hover:scale-[1.02] shadow-[0_18px_36px_var(--card-shadow-dark),0_0_0_1px_var(--card-outline),0_0_28px_var(--card-glow),inset_0_-8px_0_rgba(0,0,0,0.15),inset_0_4px_0_rgba(255,255,255,0.42)] hover:shadow-[0_28px_56px_var(--card-shadow-dark),0_0_0_1px_var(--card-outline),0_0_44px_var(--card-glow),inset_0_-10px_0_rgba(0,0,0,0.18),inset_0_5px_0_rgba(255,255,255,0.5)]"
              style={{
                '--card-shadow-dark': char.card.shadowDark,
                '--card-outline': char.card.innerLight,
                '--card-glow': `${char.card.shadowLight}cc`,
                background: `linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 24%, rgba(255,255,255,0) 48%), ${char.card.color}`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 22% 12%, rgba(255,255,255,0.34), transparent 32%), radial-gradient(circle at 80% 88%, rgba(0,0,0,0.2), transparent 42%)',
                }}
              />

              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="grid h-14 w-14 place-items-center rounded-full text-2xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.14),inset_0_3px_0_rgba(255,255,255,0.45)] transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-rotate-3"
                  style={{
                    background: char.card.pillBg,
                    border: `1px solid ${char.card.innerLight}`,
                  }}
                >
                  <span>{char.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h3 className={`truncate text-lg font-black tracking-wide ${char.card.textClass}`}>
                    {char.cardTitle}
                  </h3>
                  <p
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-black shadow-[inset_0_-3px_0_rgba(0,0,0,0.12),inset_0_2px_0_rgba(255,255,255,0.35)] ${char.card.pillTextClass}`}
                    style={{
                      background: char.card.pillBg,
                      border: `1px solid ${char.card.innerLight}`,
                    }}
                  >
                    {char.specialHobby}
                  </p>
                </div>
              </div>

              <div
                className={`relative z-10 mt-4 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[inset_0_-4px_0_rgba(0,0,0,0.12),inset_0_3px_0_rgba(255,255,255,0.4)] ${char.card.pillTextClass}`}
                style={{
                  background: char.card.pillBg,
                  border: `1px solid ${char.card.innerLight}`,
                }}
              >
                {char.colorTheme}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CharacterGallery;
