import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

export default function ParentZoneTablesPage() {
  return (
    <ParentZoneRouteLayout
      title="Tables"
      description="Dedicated Tables activity route. The full 30-question form will be added next."
    >
      <section className="rounded-3xl border border-dashed border-indigo-300 bg-indigo-50/70 p-8 text-center">
        <p className="text-4xl">🧮</p>
        <h2 className="mt-3 text-2xl font-black text-indigo-900">Tables Activity Placeholder</h2>
        <p className="mt-2 text-sm font-semibold text-indigo-700">
          Upcoming: 30-question multiplication and rapid recall practice.
        </p>
      </section>
    </ParentZoneRouteLayout>
  );
}

