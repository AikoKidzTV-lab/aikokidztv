import React, { useMemo, useState } from 'react';

const alphabetCards = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '🏀' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', word: 'House', emoji: '🏠' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Monkey', emoji: '🐵' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'Q', word: 'Queen', emoji: '👑' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Turtle', emoji: '🐢' },
  { letter: 'U', word: 'Unicorn', emoji: '🦄' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐋' },
  { letter: 'X', word: 'Xylophone', emoji: '🎶' },
  { letter: 'Y', word: 'Yo-Yo', emoji: '🪀' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

const gradients = [
  'from-pink-400 to-rose-400',
  'from-orange-400 to-amber-400',
  'from-yellow-300 to-lime-300',
  'from-emerald-400 to-teal-300',
  'from-sky-400 to-cyan-400',
  'from-indigo-400 to-purple-500',
  'from-fuchsia-400 to-pink-400',
];

const AlphabetsModule = ({ onBack, onHome }) => {
  const [flipped, setFlipped] = useState({});
  const speechReady = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    []
  );

  const speakCard = (letter, word) => {
    if (!speechReady) return;
    const utterance = new SpeechSynthesisUtterance(`${letter}. for ${word}`);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleCardClick = (card) => {
    setFlipped((prev) => ({ ...prev, [card.letter]: !prev[card.letter] }));
    speakCard(card.letter, card.word);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-white to-sky-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:shadow-md transition"
          >
            ⬅️ Back to Learning Zone
          </button>
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow hover:shadow-md hover:bg-amber-200 transition"
          >
            🏠 Back to Home
          </button>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            <span className="text-lg">🔊</span>
            {speechReady ? 'Tap a card to hear it!' : 'Speech not supported on this browser'}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-500">
            AikoKidzTV • Learning Zone
          </p>
          <h1 className="text-4xl md:text-5xl font-black drop-shadow-sm flex items-center gap-3">
            🔤 Alphabets Adventure
          </h1>
          <p className="text-base md:text-lg text-slate-700/90 max-w-2xl">
            Tap each colorful card to flip it, see the emoji friend, and hear the sound: “Letter… for Word”.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {alphabetCards.map((card, index) => {
            const gradient = gradients[index % gradients.length];
            const isFlipped = !!flipped[card.letter];
            return (
              <div
                key={card.letter}
                className="relative h-44 md:h-48 rounded-3xl overflow-hidden"
                style={{ perspective: '1200px' }}
              >
                <button
                  type="button"
                  aria-label={`${card.letter} for ${card.word}`}
                  onClick={() => handleCardClick(card)}
                  className="group relative h-full w-full focus:outline-none"
                  style={{ perspective: '1200px' }}
                >
                  <div
                    className="relative h-full w-full rounded-3xl shadow-2xl transition-transform duration-700 ease-out"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} text-white px-5 py-4 flex flex-col justify-between border border-white/40 shadow-lg`}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em]">
                        <span>Tap to flip</span>
                        <span className="text-white/90">Play</span>
                      </div>
                      <div className="text-5xl md:text-6xl font-black drop-shadow-lg text-center">
                        {card.letter}
                      </div>
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="text-white/90">Learn</span>
                        <span className="text-white/90">🔊 Speak</span>
                      </div>
                    </div>

                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} text-white px-5 py-4 flex flex-col items-center justify-center gap-2 border border-white/40 shadow-lg`}
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="text-5xl md:text-6xl drop-shadow-sm">{card.emoji}</div>
                      <p className="text-2xl md:text-3xl font-black text-center">{card.letter}</p>
                      <p className="text-lg md:text-xl font-semibold text-center">{card.word}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlphabetsModule;
