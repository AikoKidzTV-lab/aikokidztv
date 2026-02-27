import React from 'react';

const MORE_ZONES = [
  {
    id: 'junior_law',
    title: 'Junior Law',
    icon: '⚖️',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    desc: 'Learn about rules, basic rights & fairness!',
  },
  {
    id: 'science_lab',
    title: 'Science Lab',
    icon: '🔬',
    bg: 'bg-cyan-100',
    text: 'text-cyan-900',
    desc: 'Fun experiments, space & how things work!',
  },
  {
    id: 'math_magic',
    title: 'Math Magic',
    icon: '🧮',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    desc: 'Play with numbers, count & solve puzzles!',
  },
  {
    id: 'language_explorer',
    title: 'Languages',
    icon: '🌍',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    desc: 'Learn words in Hindi, English, Spanish & more!',
  },
];

export default function LearningZoneMore({ onSelect }) {
  return (
    <div className="mt-16 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-indigo-900">More Learning Zones 🚀</h2>
        <p className="text-gray-500 font-medium mt-2">Tap a box to explore new adventures!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {MORE_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => onSelect?.(zone.id)}
            className={`border-4 border-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 rounded-3xl p-6 cursor-pointer text-center group ${zone.bg}`}
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{zone.icon}</div>
            <h3 className={`text-2xl font-extrabold mb-2 ${zone.text}`}>{zone.title}</h3>
            <p className={`${zone.text} font-bold opacity-80 text-sm`}>{zone.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
