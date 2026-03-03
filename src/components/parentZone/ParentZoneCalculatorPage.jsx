import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

export default function ParentZoneCalculatorPage() {
  return (
    <ParentZoneRouteLayout
      title="Calculator"
      description="Dedicated Calculator route. The 30-question arithmetic practice will be added next."
    >
      <section className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/70 p-8 text-center">
        <p className="text-4xl">🧠</p>
        <h2 className="mt-3 text-2xl font-black text-amber-900">Calculator Placeholder</h2>
        <p className="mt-2 text-sm font-semibold text-amber-700">
          Upcoming: guided calculations, timed arithmetic, and review checkpoints.
        </p>
      </section>
    </ParentZoneRouteLayout>
  );
}

