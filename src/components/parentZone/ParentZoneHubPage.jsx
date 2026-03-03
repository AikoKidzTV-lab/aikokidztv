import React from 'react';
import { Link } from 'react-router-dom';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

const PARENT_ZONE_ACTIVITIES = [
  { id: 'tables', label: 'Tables', emoji: '🧮', to: '/parent-zone/tables' },
  { id: 'numbers', label: 'Numbers', emoji: '🔢', to: '/parent-zone/numbers' },
  { id: 'junior-law', label: 'Junior Law', emoji: '⚖️', to: '/parent-zone/law' },
  { id: 'junior-rights', label: 'Junior Rights', emoji: '🛡️', to: '/parent-zone/rights' },
  { id: 'science', label: 'Science', emoji: '🔬', to: '/parent-zone/science' },
  { id: 'calculator', label: 'Calculator', emoji: '🧠', to: '/parent-zone/calculator' },
];

export default function ParentZoneHubPage() {
  return (
    <ParentZoneRouteLayout
      title="Practice Container"
      description="Vertical single-column Parent Zone navigation. Each item opens a dedicated route page."
    >
      <section className="rounded-3xl border border-indigo-100 bg-white/95 p-5 shadow-sm sm:p-6">
        <div className="space-y-3">
          {PARENT_ZONE_ACTIVITIES.map((activity) => (
            <Link
              key={activity.id}
              to={activity.to}
              className="group flex items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3 transition hover:-translate-y-0.5 hover:from-indigo-100 hover:to-sky-100"
            >
              <span className="text-base font-black text-indigo-900">{activity.label}</span>
              <span className="flex items-center gap-2 text-xl">
                {activity.emoji}
                <span className="text-sm font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">
                  Open
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </ParentZoneRouteLayout>
  );
}
