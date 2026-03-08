import React from 'react';
import { Link } from 'react-router-dom';

export default function BlenderCredit() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-200 via-pink-100 to-purple-300">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-10 text-4xl opacity-70">🌸</div>
        <div className="absolute right-10 top-16 text-5xl opacity-70">🌺</div>
        <div className="absolute left-1/4 top-1/3 text-3xl opacity-60">💜</div>
        <div className="absolute right-1/4 top-1/2 text-4xl opacity-65">🌸</div>
        <div className="absolute left-16 bottom-16 text-5xl opacity-60">🌺</div>
        <div className="absolute right-16 bottom-12 text-4xl opacity-60">💜</div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),rgba(255,255,255,0)_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.28),rgba(255,255,255,0)_50%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl rounded-3xl border border-white/80 bg-white/68 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-2xl sm:p-10">
          <div className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-purple-700">
            Blender Studio Credit
          </div>

          <p className="text-center text-base font-medium leading-relaxed text-slate-800 sm:text-lg">
            "All movies, short films, and characters showcased in the AikoKidzTV Movies section are the exclusive property and copyright of Blender Studio. AikoKidzTV does not claim any ownership, rights, or copyright over these creative works. We respectfully share these beautiful animations to bring joy and learning to children."
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
              className="rounded-2xl border border-white/80 bg-white/72 px-6 py-3 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
            >
              🔙 Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
