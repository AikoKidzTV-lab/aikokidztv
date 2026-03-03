import React, { useMemo, useState } from 'react';

const gradients = [
  'from-sky-300 to-cyan-400',
  'from-emerald-300 to-teal-400',
  'from-amber-300 to-yellow-400',
  'from-pink-300 to-rose-400',
  'from-indigo-300 to-purple-400',
  'from-lime-300 to-green-400',
  'from-orange-300 to-amber-400',
];

const numberToWords = (n) => {
  if (n === 100) return 'One Hundred';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? `-${ones[o]}` : ''}`;
};

const NumbersModule = ({ onBack, onHome }) => {
  const numbers = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);
  const [flippedNumber, setFlippedNumber] = useState(null);
  const speechReady = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    []
  );

  const speakNumber = (num) => {
    if (!speechReady) return;
    const utterance = new SpeechSynthesisUtterance(numberToWords(num));
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleClick = (num) => {
    setFlippedNumber(num);
    speakNumber(num);
    setTimeout(() => setFlippedNumber(null), 1500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-white to-emerald-100 text-slate-900">
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
            className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800 shadow hover:shadow-md hover:bg-rose-200 transition"
          >
            🏠 Back to Home
          </button>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            <span className="text-lg">🔊</span>
            {speechReady ? 'Click a number to hear it!' : 'Speech not supported on this browser'}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-500">
            AikoKidzTV • Learning Zone
          </p>
          <h1 className="text-4xl md:text-5xl font-black drop-shadow-sm flex items-center gap-3">
            🔢 Numbers 1–100
          </h1>
          <p className="text-base md:text-lg text-slate-700/90 max-w-2xl">
            Tap any number to see it pop, glow, and speak its name out loud. Perfect for quick counting practice!
          </p>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4">
          {numbers.map((num, index) => {
            const gradient = gradients[index % gradients.length];
            const isFlipped = flippedNumber === num;
            const word = numberToWords(num);
            return (
              <button
                key={num}
                type="button"
                aria-label={`Number ${word}`}
                onClick={() => handleClick(num)}
                className={`
                  relative h-16 md:h-20 rounded-xl overflow-hidden shadow-md border border-white/50
                  [perspective:1000px]
                  transition-all duration-200
                  ${isFlipped ? 'scale-110 ring-4 ring-amber-200' : 'hover:scale-105'}
                `}
              >
                <div
                  className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-slate-900 font-black text-xl md:text-2xl`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="drop-shadow-sm">{num}</span>
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-white text-center px-2 text-xs md:text-sm font-black text-indigo-900"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    {word}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NumbersModule;
