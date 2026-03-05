import React from 'react';

export default function LearningZoneMenu({ onSelect }) {
  const learningBoxes = [
    {
      id: 'colors',
      title: 'Colors & Shapes',
      icon: '🎨',
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      desc: 'Mix colors & learn shapes!',
    },
    {
      id: 'animals',
      title: 'Animal Safari',
      icon: '🦓',
      bg: 'bg-green-100',
      text: 'text-green-800',
      desc: 'Meet animals & hear sounds!',
    },
    {
      id: 'junior_law',
      title: 'Junior Law',
      icon: '⚖️',
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      desc: 'Learn rules & fairness!',
    },
    {
      id: 'science',
      title: 'Science Lab',
      icon: '🔬',
      bg: 'bg-cyan-100',
      text: 'text-cyan-900',
      desc: 'Fun space & experiments!',
    },
    {
      id: 'math',
      title: 'Math Magic',
      icon: '🧮',
      bg: 'bg-purple-100',
      text: 'text-purple-900',
      desc: 'Play with numbers & logic!',
    },
    {
      id: 'language',
      title: 'English Explorer',
      icon: '🌍',
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      desc: 'Learn new English words!',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 font-sans">
      {/* Main Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-900 mb-4">
          Welcome to the Learning Zone! 🚀
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          Pick a box below to start your adventure today!
        </p>
      </div>

      {/* 6 Boxes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {learningBoxes.map((box) => (
          <button
            key={box.id}
            type="button"
            onClick={() => onSelect?.(box.id)}
            className={`p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-sm border-4 border-white ${box.bg} text-left`}
          >
            <div className="text-7xl mb-6 text-center drop-shadow-sm">{box.icon}</div>
            <h2 className={`text-3xl font-extrabold text-center mb-2 ${box.text}`}>{box.title}</h2>
            <p className={`text-center font-bold opacity-80 ${box.text}`}>{box.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
