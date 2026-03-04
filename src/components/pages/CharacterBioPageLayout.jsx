import React from 'react';
import { Link } from 'react-router-dom';

export default function CharacterBioPageLayout({ character }) {
  if (!character) return null;

  const {
    name,
    cardTitle,
    emoji,
    bio,
    colorTheme,
    specialHobby,
    card,
  } = character;

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{
        background: `linear-gradient(145deg, ${card.shadowLight} 0%, #ffffff 48%, ${card.color} 100%)`,
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>

        <section
          className={`rounded-[35px] border p-8 ${card.textClass}`}
          style={{
            background: card.color,
            borderColor: card.shadowLight,
            boxShadow: `16px 16px 32px ${card.shadowDark}, -16px -16px 32px ${card.shadowLight}, inset 4px 4px 8px ${card.innerLight}, inset -4px -4px 8px ${card.innerDark}`,
          }}
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-85">Learning Zone Character</p>
          <h1 className="mt-3 text-4xl font-black">
            {emoji} {cardTitle}
          </h1>
          <p className="mt-2 text-xl font-black">{name}</p>

          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.08em] ${card.pillTextClass}`}
            style={{
              background: card.pillBg,
              borderColor: card.innerLight,
              boxShadow: `inset 2px 2px 6px ${card.innerLight}, inset -3px -3px 8px ${card.innerDark}`,
            }}
          >
            Theme: {colorTheme}
          </div>

          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-black ${card.pillTextClass}`}
            style={{
              background: card.pillBg,
              borderColor: card.innerLight,
              boxShadow: `inset 2px 2px 6px ${card.innerLight}, inset -3px -3px 8px ${card.innerDark}`,
            }}
          >
            Special Hobby: {specialHobby}
          </div>

          <div
            className={`mt-4 rounded-2xl border px-5 py-4 text-base font-bold ${card.pillTextClass}`}
            style={{
              background: card.pillBg,
              borderColor: card.innerLight,
              boxShadow: `inset 2px 2px 6px ${card.innerLight}, inset -3px -3px 8px ${card.innerDark}`,
            }}
          >
            {bio}
          </div>
        </section>
      </div>
    </div>
  );
}
