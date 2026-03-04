import React, { useState } from 'react';

export default function MixAndMatchLab() {
  const [slot1, setSlot1] = useState('#EF4444');
  const [slot2, setSlot2] = useState('#3B82F6');
  const [result, setResult] = useState(null);

  const mixColors = () => {
    const hex2rgb = (hex) => {
      const value = parseInt(hex.replace('#', ''), 16);
      return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    };

    const [r1, g1, b1] = hex2rgb(slot1);
    const [r2, g2, b2] = hex2rgb(slot2);
    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);

    const rgb2hex = (rVal, gVal, bVal) =>
      `#${[rVal, gVal, bVal].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

    setResult(rgb2hex(r, g, b));
  };

  const resetLab = () => {
    setSlot1('#EF4444');
    setSlot2('#3B82F6');
    setResult(null);
  };

  return (
    <div className="bg-amber-50 rounded-xl p-8 border-4 border-amber-200 shadow-lg mt-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-amber-900">
          {'\u{1F9EA}'} Universal Mix Magic Lab
        </h2>
        <p className="text-amber-700 font-medium mt-2">
          Tap the boxes below to open the Global Color Wheel. Pick any color and mix them!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-2xl shadow-inner overflow-hidden border-4 border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
            <input
              type="color"
              value={slot1}
              onChange={(event) => {
                setSlot1(event.target.value);
                setResult(null);
              }}
              className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
              title="Open Color Wheel"
            />
          </div>
          <span className="mt-3 font-bold text-gray-600">Color 1</span>
          <span className="text-xs text-gray-400 font-mono uppercase">{slot1}</span>
        </div>

        <span className="text-5xl font-extrabold text-gray-300 mx-2">+</span>

        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-2xl shadow-inner overflow-hidden border-4 border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
            <input
              type="color"
              value={slot2}
              onChange={(event) => {
                setSlot2(event.target.value);
                setResult(null);
              }}
              className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
              title="Open Color Wheel"
            />
          </div>
          <span className="mt-3 font-bold text-gray-600">Color 2</span>
          <span className="text-xs text-gray-400 font-mono uppercase">{slot2}</span>
        </div>

        <div className="flex flex-col items-center mx-6 my-6 sm:my-0">
          <button
            onClick={mixColors}
            className="px-8 py-4 rounded-full font-extrabold text-white text-xl shadow-lg transform transition-all bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-110 hover:shadow-xl active:scale-95"
          >
            MIX! {'\u{1FA84}'}
          </button>
        </div>

        <span className="hidden sm:block text-5xl font-extrabold text-gray-300 mx-2">=</span>

        <div className="flex flex-col items-center">
          <div
            className={`w-32 h-32 rounded-full border-4 border-gray-200 flex items-center justify-center shadow-2xl transition-all duration-700 ${
              result ? 'scale-110' : ''
            }`}
            style={{
              backgroundColor: result || '#F3F4F6',
              borderColor: result ? '#10B981' : undefined,
            }}
          >
            {!result && <span className="text-gray-400 font-bold text-4xl">?</span>}
            {result && <span className="text-5xl drop-shadow-md">{'\u2728'}</span>}
          </div>
          <span className={`mt-4 font-extrabold text-xl ${result ? 'text-green-600' : 'text-gray-400'}`}>
            {result ? 'New Color!' : 'Magic Result'}
          </span>
          {result && (
            <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mt-2 font-mono uppercase">
              {result}
            </span>
          )}
        </div>
      </div>

      <div className="text-center mt-10">
        <button
          onClick={resetLab}
          className="text-gray-500 hover:text-red-500 font-bold underline px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear and try again {'\u{1F504}'}
        </button>
      </div>
    </div>
  );
}
