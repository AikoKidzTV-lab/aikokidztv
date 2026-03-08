import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NikoFriendshipHavenPage() {
  const navigate = useNavigate();
  const [helperMessage, setHelperMessage] = useState('');
  const [breathingPhase, setBreathingPhase] = useState('idle');
  const [isBreathing, setIsBreathing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [showConfidenceSuccess, setShowConfidenceSuccess] = useState(false);
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
        <header className="rounded-2xl border border-red-300/20 bg-slate-900/75 p-4 shadow-sm shadow-black/10 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-red-300/25 bg-red-400/12 px-4 py-2 text-sm font-black text-red-100 hover:bg-red-400/18"
            >
              ← Back to Learning Zone
            </button>
            <h1 className="text-2xl font-black tracking-tight text-red-100 sm:text-3xl">
              NIKO&apos;s Friendship Haven ❤️🤝
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-red-300/20 bg-slate-900/70 p-4 shadow-sm shadow-black/10 sm:p-6">
          <h2 className="text-lg font-black text-red-200 sm:text-xl">The Quiet Helper</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">AIKO broke his toy. How can NIKO help?</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setHelperMessage("Too loud! Let's be gentle.")}
              className="rounded-xl border border-red-300/25 bg-red-400/12 px-5 py-4 text-base font-black text-red-100 hover:bg-red-400/18"
            >
              Shout loudly 🗣️
            </button>
            <button
              type="button"
              onClick={() => setHelperMessage('Great job! You helped quietly! 🥰')}
              className="rounded-xl border border-red-300/25 bg-red-400/12 px-5 py-4 text-base font-black text-red-100 hover:bg-red-400/18"
            >
              Bring tape quietly 🩹
            </button>
          </div>

          {helperMessage && (
            <p className="mt-4 rounded-xl border border-red-200/25 bg-slate-800/65 px-4 py-2 text-sm font-black text-red-100">
              {helperMessage}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-red-300/20 bg-slate-900/70 p-4 shadow-sm shadow-black/10 sm:p-6">
          <h2 className="text-lg font-black text-red-200 sm:text-xl">Calm Breathing</h2>

          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-red-200/20 bg-slate-800/65 p-5">
            <div
              className={`grid h-28 w-28 place-items-center rounded-full border-4 border-red-300 bg-red-500/20 text-5xl transition-transform duration-[4000ms] ${
                breathingPhase === 'in' ? 'scale-125' : 'scale-90'
              }`}
            >
              🎈
            </div>

            <p className="text-sm font-black text-red-100">
              {breathingPhase === 'in'
                ? 'Breathe In...'
                : breathingPhase === 'out'
                  ? 'Breathe Out...'
                  : 'Ready to breathe calmly?'}
            </p>

            <button
              type="button"
              onClick={handleStartBreathing}
              className="rounded-xl border border-red-300/25 bg-red-400/15 px-5 py-3 text-base font-black text-red-100 hover:bg-red-400/20"
            >
              {isBreathing ? 'Restart Breathing 🧘' : 'Start Breathing 🧘'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/20 bg-slate-900/70 p-4 shadow-sm shadow-black/10 sm:p-6">
          <h2 className="text-lg font-black text-red-200 sm:text-xl">Confidence Meter</h2>

          <div className="mt-4 rounded-2xl border border-red-200/20 bg-slate-800/65 p-4">
            <div className="h-6 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full bg-red-500/85"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-bold text-red-100">Confidence: {confidence}%</p>

            <button
              type="button"
              onClick={handleEncourageNiko}
              disabled={confidence >= 100}
              className={`mt-4 rounded-xl border px-5 py-3 text-base font-black ${
                confidence >= 100
                  ? 'cursor-not-allowed border-gray-600 bg-gray-700 text-gray-300'
                  : 'border-red-300/25 bg-red-400/15 text-red-100 hover:bg-red-400/20'
              }`}
            >
              Encourage NIKO! 👏
            </button>

            {showConfidenceSuccess && (
              <div className="mt-4 rounded-xl border border-pink-200/25 bg-pink-500/12 px-4 py-3 text-sm font-black text-pink-100">
                NIKO feels brave today! Best Friends Forever! 💖
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
