import React from 'react';

// 20 Unique Shapes Data with custom SVG paths
const SHAPES_DATA = [
  { id: 'circle', name: 'Circle', color: '#06B6D4', icon: <circle cx="50" cy="50" r="40" /> },
  { id: 'square', name: 'Square', color: '#F59E0B', icon: <rect x="15" y="15" width="70" height="70" rx="8" /> },
  { id: 'triangle', name: 'Triangle', color: '#EC4899', icon: <polygon points="50,15 85,80 15,80" /> },
  { id: 'rectangle', name: 'Rectangle', color: '#84CC16', icon: <rect x="10" y="30" width="80" height="40" rx="6" /> },
  { id: 'star', name: 'Star', color: '#FCD34D', icon: <polygon points="50,10 61,35 88,35 66,51 74,77 50,60 26,77 34,51 12,35 39,35" /> },
  { id: 'heart', name: 'Heart', color: '#F43F5E', icon: <path d="M50,85 C50,85 10,55 10,30 C10,15 25,5 40,15 C50,25 50,25 50,25 C50,25 50,25 60,15 C75,5 90,15 90,30 C90,55 50,85 50,85 Z" /> },
  { id: 'oval', name: 'Oval', color: '#A855F7', icon: <ellipse cx="50" cy="50" rx="45" ry="25" /> },
  { id: 'diamond', name: 'Diamond', color: '#3B82F6', icon: <polygon points="50,10 85,50 50,90 15,50" /> },
  { id: 'pentagon', name: 'Pentagon', color: '#10B981', icon: <polygon points="50,10 90,40 75,85 25,85 10,40" /> },
  { id: 'hexagon', name: 'Hexagon', color: '#F97316', icon: <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" /> },
  { id: 'octagon', name: 'Octagon', color: '#6366F1', icon: <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" /> },
  { id: 'crescent', name: 'Crescent', color: '#EAB308', icon: <path d="M55,10 A40,40 0 1,1 15,65 A30,30 0 1,0 55,10 Z" /> },
  { id: 'cross', name: 'Cross', color: '#EF4444', icon: <path d="M35,15 H65 V35 H85 V65 H65 V85 H35 V65 H15 V35 H35 Z" /> },
  { id: 'arrow', name: 'Arrow', color: '#8B5CF6', icon: <path d="M15,40 H60 V20 L90,50 L60,80 V60 H15 Z" /> },
  { id: 'cloud', name: 'Cloud', color: '#93C5FD', icon: <path d="M30,60 A20,20 0 0,1 50,30 A25,25 0 0,1 85,50 A15,15 0 0,1 80,80 H30 A15,15 0 0,1 30,60 Z" /> },
  { id: 'lightning', name: 'Lightning', color: '#FDE047', icon: <polygon points="55,10 20,55 50,55 40,90 80,40 50,40" /> },
  { id: 'drop', name: 'Water Drop', color: '#0EA5E9', icon: <path d="M50,15 C50,15 20,50 20,70 A30,30 0 0,0 80,70 C80,50 50,15 50,15 Z" /> },
  { id: 'leaf', name: 'Leaf', color: '#22C55E', icon: <path d="M50,10 C80,10 90,50 90,50 C90,80 50,90 50,90 C20,90 10,50 10,50 C10,20 50,10 50,10 Z" /> },
  { id: 'kite', name: 'Kite', color: '#EC4899', icon: <polygon points="50,10 75,40 50,90 25,40" /> },
  { id: 'parallelogram', name: 'Parallelogram', color: '#14B8A6', icon: <polygon points="25,20 85,20 75,80 15,80" /> },
];

export default function ShapesSection({ onShapeClick, activeId }) {
  return (
    <div className="mt-12 mb-12">
      <div className="flex flex-col mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          Shapes
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Friendly icons to spot and say aloud
          </span>
        </h2>

        {/* Custom Parent Note */}
        <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
          <p className="text-indigo-900 font-semibold text-sm">
            {'\u{1F4A1}'} <span className="font-extrabold">Fun Fact:</span> Some shapes even parents don't know! So learn
            with your kidz only on AikoKidzTV site and app.
          </p>
        </div>
      </div>

      {/* Grid for 20 Shapes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {SHAPES_DATA.map((shape) => {
          const isActive = activeId === shape.id;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onShapeClick?.(shape)}
              className={`bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center group cursor-pointer ${
                isActive ? 'ring-4 ring-indigo-200 scale-95' : ''
              }`}
            >
              {/* SVG Renderer */}
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                style={{ fill: shape.color }}
                aria-hidden="true"
              >
                {shape.icon}
              </svg>
              <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                {shape.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
