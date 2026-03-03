import React from 'react';
import { Link } from 'react-router-dom';

export default function ParentZoneRouteLayout({ title, description, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Home
          </Link>
          <Link
            to="/parent-zone"
            className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-100"
          >
            Parent Zone Menu
          </Link>
        </div>

        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">
            Parent Zone Activity
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600 sm:text-base">{description}</p>
        </section>

        {children}
      </div>
    </div>
  );
}

