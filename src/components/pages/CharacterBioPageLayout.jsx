import React from 'react';
import { Link } from 'react-router-dom';

export default function CharacterBioPageLayout({ title, description, emoji }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>

        <section className="rounded-3xl border border-white/90 bg-white/95 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">Learning Zone</p>
          <h1 className="mt-3 text-4xl font-black text-slate-900">
            {emoji} {title}
          </h1>
          <p className="mt-3 text-base font-semibold text-slate-700">{description}</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800">
            Placeholder page ready. Content module will be added next.
          </div>
        </section>
      </div>
    </div>
  );
}

