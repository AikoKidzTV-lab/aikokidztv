import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fitnessMissions = [
  'Do 10 jumping jacks!',
  'Touch your toes 5 times!',
  'Hop on one foot 10 times!',
  'Do 8 big arm circles!',
  'March in place for 20 seconds!',
];

const foodFacts = [
  {
    food: 'Spinach',
    emoji: '🥬',
    fact: 'Gives you iron to help your muscles stay super strong!',
  },
  {
    food: 'Banana',
    emoji: '🍌',
    fact: 'Gives your body quick energy for games and running.',
  },
  {
    food: 'Carrot',
    emoji: '🥕',
    fact: 'Helps support healthy eyes for spotting the ball fast!',
  },
  {
    food: 'Yogurt',
    emoji: '🥣',
    fact: 'Has calcium to help keep your bones strong and ready to move.',
  },
  {
    food: 'Apple',
    emoji: '🍎',
    fact: 'A crunchy snack that helps you feel fresh and ready to play.',
  },
];

export default function NikoFriendshipHavenPage() {
  const navigate = useNavigate();
  const [helperMessage, setHelperMessage] = useState('');
  const [breathingPhase, setBreathingPhase] = useState('idle');
  const [isBreathing, setIsBreathing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [showConfidenceSuccess, setShowConfidenceSuccess] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const [isAccomplished, setIsAccomplished] = useState(false);
  const [foodIndex, setFoodIndex] = useState(0);
  const timersRef = useRef([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    },
    []
  );

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleStartBreathing = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];

    setIsBreathing(true);
    setBreathingPhase('in');

    const outTimer = window.setTimeout(() => {
      setBreathingPhase('out');
    }, 4000);

    const doneTimer = window.setTimeout(() => {
      setBreathingPhase('idle');
      setIsBreathing(false);
    }, 8000);

    timersRef.current = [outTimer, doneTimer];
  };

  const handleEncourageNiko = () => {
    setConfidence((current) => {
      const next = Math.min(100, current + 33);
      const normalized = next >= 99 ? 100 : next;
      if (normalized >= 100) {
        setShowConfidenceSuccess(true);
      }
      return normalized;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-red-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-red-300/25 bg-red-400/12 px-4 py-2 text-sm font-black text-red-100 shadow-none hover:bg-red-400/18"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-red-100 sm:text-3xl">
              NIKO&apos;s Friendship Haven ❤️🤝
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-red-300/30 bg-red-900 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">The Quiet Helper</h2>
          <p className="mt-2 text-sm font-bold text-red-100">AIKO broke his toy. How can NIKO help?</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setHelperMessage("Too loud! Let's be gentle.")}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base font-black text-red-950 shadow-none hover:bg-red-100"
            >
              Shout loudly 🗣️
            </button>
            <button
              type="button"
              onClick={() => setHelperMessage('Great job! You helped quietly! 🥰')}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base font-black text-red-950 shadow-none hover:bg-red-100"
            >
              Bring tape quietly 🩹
            </button>
          </div>

          {helperMessage && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-950">
              {helperMessage}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-red-300/30 bg-red-900 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Calm Breathing</h2>

          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 shadow-none">
            <div
              className={`grid h-28 w-28 place-items-center rounded-full border-4 border-red-300 bg-red-100 text-5xl transition-transform duration-[4000ms] ${
                breathingPhase === 'in' ? 'scale-125' : 'scale-90'
              }`}
            >
              🎈
            </div>

            <p className="text-sm font-black text-red-950">
              {breathingPhase === 'in'
                ? 'Breathe In...'
                : breathingPhase === 'out'
                  ? 'Breathe Out...'
                  : 'Ready to breathe calmly?'}
            </p>

            <button
              type="button"
              onClick={handleStartBreathing}
              className="rounded-xl border border-red-700 bg-red-700 px-5 py-3 text-base font-black text-white shadow-none hover:bg-red-800"
            >
              {isBreathing ? 'Restart Breathing 🧘' : 'Start Breathing 🧘'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/30 bg-red-900 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Confidence Meter</h2>

          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-950 shadow-none">
            <div className="h-6 w-full overflow-hidden rounded-full bg-rose-100">
              <div
                className="h-full bg-red-700"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-bold text-red-950">Confidence: {confidence}%</p>

            <button
              type="button"
              onClick={handleEncourageNiko}
              disabled={confidence >= 100}
              className={`mt-4 rounded-xl border px-5 py-3 text-base font-black shadow-none ${
                confidence >= 100
                  ? 'cursor-not-allowed border-gray-600 bg-gray-700 text-gray-300'
                  : 'border-red-700 bg-red-700 text-white hover:bg-red-800'
              }`}
            >
              Encourage NIKO! 👏
            </button>

            {showConfidenceSuccess && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm font-black text-red-950">
                NIKO feels brave today! Best Friends Forever! 💖
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/30 bg-red-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">60-Second Fitness Mission 🏆</h2>
            <button
              type="button"
              onClick={() => {
                setMissionIndex((prev) => (prev + 1) % fitnessMissions.length);
                setIsAccomplished(false);
              }}
              className="rounded-xl border border-red-300/25 bg-red-400/12 px-3 py-2 text-xs font-black text-red-100 shadow-none hover:bg-red-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 shadow-none sm:p-6">
            <p className="text-2xl font-black leading-relaxed text-red-950 sm:text-3xl">
              {fitnessMissions[missionIndex]}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsAccomplished(true)}
                className={`rounded-xl border px-5 py-3 text-sm font-black shadow-none ${
                  isAccomplished
                    ? 'border-emerald-400 bg-emerald-500 text-white'
                    : 'border-red-700 bg-white text-red-950'
                }`}
              >
                Mission Accomplished ✅
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/30 bg-red-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Power Food Facts 🍎</h2>
            <button
              type="button"
              onClick={() => setFoodIndex((prev) => (prev + 1) % foodFacts.length)}
              className="rounded-xl border border-red-300/25 bg-red-400/12 px-3 py-2 text-xs font-black text-red-100 shadow-none hover:bg-red-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 shadow-none sm:p-6">
            <p className="text-6xl">{foodFacts[foodIndex].emoji}</p>
            <p className="mt-3 text-2xl font-black text-red-950">{foodFacts[foodIndex].food}</p>
            <p className="mt-2 text-base font-bold leading-relaxed text-red-900">
              {foodFacts[foodIndex].fact}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
