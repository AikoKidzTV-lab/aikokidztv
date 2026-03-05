import React from 'react';

// 📚 Learning Zone Categories
const LEARNING_MODULES = [
  {
    id: 'colors_shapes',
    title: 'Colors & Shapes',
    desc: 'Mix colors in the lab and learn friendly shapes!',
    icon: '🎨',
    bg: 'bg-pink-100',
    border: 'border-pink-200',
    text: 'text-pink-800',
    tag: 'Creative',
  },
  {
    id: 'animal_safari',
    title: 'Animal Safari',
    desc: 'Meet wild, farm, and ocean animals with sounds!',
    icon: '🦓',
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    tag: 'Nature',
  },
  {
    id: 'junior_law',
    title: 'Junior Law',
    desc: 'Learn about rules, basic rights, and fairness!',
    icon: '⚖️',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-900',
    tag: 'Life Skills',
  },
  {
    id: 'science_lab',
    title: 'Science Lab',
    desc: 'Fun experiments, space, and how things work!',
    icon: '🔬',
    bg: 'bg-cyan-100',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    tag: 'Discovery',
  },
  {
    id: 'math_magic',
    title: 'Math Magic',
    desc: 'Play with numbers, count, and solve fun puzzles!',
    icon: '🧮',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-900',
    tag: 'Logic',
  },
  {
    id: 'language_explorer',
    title: 'English Explorer',
    desc: 'Learn words in English only!',
    icon: '🌍',
    bg: 'bg-rose-100',
    border: 'border-rose-200',
    text: 'text-rose-900',
    tag: 'Global',
  },
];

export default function LearningZoneDashboard({ onSelect }) {
  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 font-sans">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-900 mb-4 tracking-tight">
          Welcome to the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
            Learning Zone!
          </span>{' '}
          🚀
        </h1>
        <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
          Pick a box below to start your adventure. Whether you want to be an artist, an explorer, a
          scientist, or a smart citizen, we have it all!
        </p>
      </div>

      {/* Grid for Learning Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {LEARNING_MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => onSelect?.(module.id)}
            className={`relative group cursor-pointer text-left rounded-3xl p-8 border-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${module.bg} ${module.border}`}
          >
            {/* Tag (e.g., Creative, Logic) */}
            <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase text-gray-700 shadow-sm">
              {module.tag}
            </div>

            {/* Icon */}
            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
              {module.icon}
            </div>

            {/* Content */}
            <h2 className={`text-3xl font-extrabold mb-3 ${module.text}`}>{module.title}</h2>
            <p className="text-gray-700 font-medium text-lg leading-snug mb-8">{module.desc}</p>

            {/* Action Button */}
            <div
              className={`w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 transition-colors bg-white/80 hover:bg-white ${module.text} shadow-sm group-hover:shadow-md`}
            >
              Let's Go! ➔
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
