import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

export default function ParentZoneJuniorLawPage() {
  return (
    <ParentZoneRouteLayout
      title="Junior Law"
      description="Dedicated Junior Law route. The structured 30-question law module will be added next."
    >
      <section className="rounded-3xl border border-dashed border-violet-300 bg-violet-50/70 p-8 text-center">
        <p className="text-4xl">⚖️</p>
        <h2 className="mt-3 text-2xl font-black text-violet-900">Junior Law Placeholder</h2>
        <p className="mt-2 text-sm font-semibold text-violet-700">
          Upcoming: foundational legal concepts and civic awareness for kids.
        </p>
      </section>
    </ParentZoneRouteLayout>
  );
}

