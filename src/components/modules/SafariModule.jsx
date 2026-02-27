import React, { useState } from 'react';
import ANIMALS_DATA from './animalsData';

const CATEGORY_NAV = [
  { id: 'All', label: '🌍 All' },
  { id: 'Wild', label: '🦁 Wild' },
  { id: 'Farm', label: '🚜 Farm' },
  { id: 'Pet', label: '🏡 Pets' },
  { id: 'Bird', label: '🦅 Birds' },
  { id: 'Ocean', label: '🌊 Ocean' },
  { id: 'Bug', label: '🦋 Bugs' },
];

const SafariModule = ({ onBack, onHome }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});

  const filteredAnimals =
    activeCategory === 'All'
      ? ANIMALS_DATA
      : ANIMALS_DATA.filter((animal) => animal.category === activeCategory);

  const handleCardClick = (animalId) => {
    setFlippedCards((prev) => ({ ...prev, [animalId]: !prev[animalId] }));
  };

  const playSound = (event, animalName, animalSound) => {
    event.stopPropagation(); // keep card flipped while playing sound
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = `The ${animalName} says ${animalSound}`;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.pitch = 1.2;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Oops! Your browser doesn't support our magic voice.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-emerald-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:shadow-md transition"
          >
            ★ Back to Learning Zone
          </button>
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-lime-800 shadow hover:shadow-md hover:bg-lime-200 transition"
          >
            🏠 Back to Home
          </button>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            <span className="text-lg">🔊</span>
            Tap a card to flip, then press the sound button
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
            AikoKidzTV • Learning Zone
          </p>
          <h1 className="text-4xl sm:text-5xl font-black drop-shadow-sm flex justify-center items-center gap-3">
            🦓 Animal Safari 🦒
          </h1>
          <p className="text-gray-600 font-medium text-lg max-w-3xl mx-auto">
            Tap an animal to flip the card, then tap 🔊 to hear it!
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredAnimals.length} of {ANIMALS_DATA.length} animals
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 mb-8 justify-start lg:justify-center gap-3">
          {CATEGORY_NAV.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-extrabold text-base transition-all shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white scale-105 shadow-md'
                  : 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredAnimals.map((animal) => {
            const isFlipped = !!flippedCards[animal.id];
            return (
              <div
                key={animal.id}
                className="relative w-full h-80 sm:h-72 cursor-pointer group"
                style={{ perspective: '1200px' }}
                onClick={() => handleCardClick(animal.id)}
              >
                <div
                  className="w-full h-full transition-transform duration-700 transform-gpu rounded-3xl shadow-sm hover:shadow-xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center p-6 rounded-3xl border-4 border-white ${animal.bg}`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-8xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                      {animal.emoji}
                    </span>
                    <h3 className={`text-3xl font-extrabold ${animal.text}`}>{animal.name}</h3>
                    <span className="mt-4 text-xs font-bold uppercase tracking-wider bg-white/60 px-4 py-2 rounded-full text-gray-600">
                      Tap to learn
                    </span>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-3xl border-4 border-white bg-white"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-center w-full h-full flex flex-col justify-between">
                      <div>
                        <h3 className={`text-2xl font-extrabold ${animal.text} mb-1 flex items-center justify-center gap-2`}>
                          {animal.name}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                          {animal.category}
                        </p>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          "{animal.bio}"
                        </p>
                      </div>

                      <button
                        onClick={(event) => playSound(event, animal.name, animal.sound)}
                        className={`mt-3 py-3 px-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-2 w-full transition-transform hover:scale-105 active:scale-95 shadow-sm border-2 border-white ${animal.bg} ${animal.text}`}
                      >
                        🔊 Hear Sound!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SafariModule;
