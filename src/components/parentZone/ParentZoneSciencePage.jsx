import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

export default function ParentZoneSciencePage() {
  return (
    <ParentZoneRouteLayout
      title="Science"
      description="Dedicated Science route. The full 30-question science worksheet will be added next."
    >
      <section className="rounded-3xl border border-dashed border-cyan-300 bg-cyan-50/70 p-8 text-center">
        <p className="text-4xl">🔬</p>
        <h2 className="mt-3 text-2xl font-black text-cyan-900">Science Placeholder</h2>
        <p className="mt-2 text-sm font-semibold text-cyan-700">
          Upcoming: daily-life science, discovery prompts, and concept checks.
        </p>
      </section>
    </ParentZoneRouteLayout>
  );
}

