import React, { useEffect, useMemo, useRef, useState } from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';

const CARD_GRADIENTS = [
  'from-sky-300 to-cyan-400',
  'from-emerald-300 to-teal-400',
  'from-amber-300 to-yellow-400',
  'from-rose-300 to-pink-400',
  'from-violet-300 to-indigo-400',
];

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const toNumberWord = (value) => {
  if (value <= 0 || value > 100) return '';
  if (value === 100) return 'One Hundred';
  if (value < 20) return ONES[value];

  const tensPart = Math.floor(value / 10);
  const onesPart = value % 10;
  return onesPart ? `${TENS[tensPart]} ${ONES[onesPart]}` : TENS[tensPart];
};

export default function ParentZoneNumbersPage() {
  const numbers = useMemo(() => Array.from({ length: 100 }, (_, index) => index + 1), []);
  const [flippedNumbers, setFlippedNumbers] = useState(() => new Set());
  const flipTimersRef = useRef(new Map());

  const triggerFlip = (numberValue) => {
    setFlippedNumbers((current) => {
      const next = new Set(current);
      next.add(numberValue);
      return next;
    });

    const existingTimer = flipTimersRef.current.get(numberValue);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timeoutId = window.setTimeout(() => {
      setFlippedNumbers((current) => {
        const next = new Set(current);
        next.delete(numberValue);
        return next;
      });
      flipTimersRef.current.delete(numberValue);
    }, 1400);

    flipTimersRef.current.set(numberValue, timeoutId);
  };

  useEffect(() => {
    return () => {
      for (const timerId of flipTimersRef.current.values()) {
        window.clearTimeout(timerId);
      }
      flipTimersRef.current.clear();
    };
  }, []);

  return (
    <ParentZoneRouteLayout
      title="Numbers"
      description="1 to 100 number activity. Click any number card to flip and reveal its English spelling."
    >
      <section className="rounded-3xl border border-sky-100 bg-white/95 p-5 shadow-sm sm:p-6">
        <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold text-sky-900">
          Tap any number box to trigger a flip animation and reveal the number in words.
        </div>

        <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-10">
          {numbers.map((numberValue, index) => {
            const isFlipped = flippedNumbers.has(numberValue);
            const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
            return (
              <button
                key={numberValue}
                type="button"
                onClick={() => triggerFlip(numberValue)}
                aria-label={`Flip number ${numberValue}`}
                className="relative h-16 rounded-xl border border-white/70 shadow-sm [perspective:1000px] sm:h-20"
              >
                <div
                  className="relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg font-black text-slate-900 sm:text-xl`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {numberValue}
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-white px-1 text-center text-[10px] font-black text-indigo-900 sm:text-xs"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    {toNumberWord(numberValue)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </ParentZoneRouteLayout>
  );
}

