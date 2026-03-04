import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

const NASA_EYES_SOLAR_SYSTEM_URL = 'https://eyes.nasa.gov/apps/solar-system/#/home';
const EARTH_IMAGE_URL = 'https://images-assets.nasa.gov/image/PIA12235/PIA12235~orig.jpg';
const MILKY_WAY_IMAGE_URL =
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2200&q=80';

export default function ParentZoneCosmicJourneyPage() {
  return (
    <ParentZoneRouteLayout
      title="Cosmic Journey"
      description="Launch into a guided space exploration experience. Kids can interact with NASA's live solar system view below."
    >
      <section className="clay-container relative overflow-hidden rounded-3xl border border-indigo-200/40 bg-slate-950 shadow-[0_20px_70px_rgba(15,23,42,0.55)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${MILKY_WAY_IMAGE_URL})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(147,197,253,0.45), transparent 35%), radial-gradient(circle at 80% 15%, rgba(196,181,253,0.32), transparent 34%), radial-gradient(circle at 15% 70%, rgba(255,255,255,0.12), transparent 25%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.92), transparent), radial-gradient(1.8px 1.8px at 30% 40%, rgba(255,255,255,0.75), transparent), radial-gradient(2px 2px at 50% 15%, rgba(255,255,255,0.85), transparent), radial-gradient(1.5px 1.5px at 70% 30%, rgba(255,255,255,0.8), transparent), radial-gradient(2.2px 2.2px at 86% 65%, rgba(255,255,255,0.82), transparent), radial-gradient(1.8px 1.8px at 40% 75%, rgba(255,255,255,0.88), transparent)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[999px_999px_0_0] border border-cyan-200/40 bg-black/30 shadow-[0_24px_60px_rgba(56,189,248,0.28)]">
            <div className="h-52 sm:h-64 md:h-72">
              <img
                src={EARTH_IMAGE_URL}
                alt="Planet Earth from space"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            Explore Our Universe!
          </h2>
        </div>
      </section>

      <section className="clay-container rounded-3xl border border-indigo-100 bg-white/95 p-4 shadow-sm sm:p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
          <div className="relative aspect-[16/10] min-h-[420px] w-full">
            <iframe
              src={NASA_EYES_SOLAR_SYSTEM_URL}
              title="NASA Eyes on the Solar System"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-600">
          If your browser blocks the embed, open it directly:
          {' '}
          <a
            href={NASA_EYES_SOLAR_SYSTEM_URL}
            target="_blank"
            rel="noreferrer"
            className="font-black text-indigo-700 underline decoration-2 underline-offset-2 hover:text-indigo-900"
          >
            NASA Eyes on the Solar System
          </a>
        </p>
      </section>
    </ParentZoneRouteLayout>
  );
}
