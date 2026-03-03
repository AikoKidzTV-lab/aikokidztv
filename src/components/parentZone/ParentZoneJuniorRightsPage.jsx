import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

export default function ParentZoneJuniorRightsPage() {
  return (
    <ParentZoneRouteLayout
      title="Junior Rights"
      description="Dedicated Junior Rights route. The 30-question rights curriculum will be added next."
    >
      <section className="rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/70 p-8 text-center">
        <p className="text-4xl">🛡️</p>
        <h2 className="mt-3 text-2xl font-black text-emerald-900">Junior Rights Placeholder</h2>
        <p className="mt-2 text-sm font-semibold text-emerald-700">
          Upcoming: child rights, safety, and real-world rights awareness scenarios.
        </p>
      </section>
    </ParentZoneRouteLayout>
  );
}

