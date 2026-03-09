import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contraptionChallenges, prankChallenges, sillySolutionChallenges, drawingPrompts, kinuJokes } from '../../data/kinuData';

const nextIndex = (currentIndex, totalItems) => (currentIndex + 1) % totalItems;

export default function KinuGeniusMischiefLabPage() {
  const navigate = useNavigate();
  const [currentContraptionIndex, setCurrentContraptionIndex] = useState(0);
  const [contraptionActivated, setContraptionActivated] = useState(false);
  const [currentPrankIndex, setCurrentPrankIndex] = useState(0);
  const [prankResult, setPrankResult] = useState('');
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [solutionResult, setSolutionResult] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [jokeIndex, setJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);

  const currentContraption = contraptionChallenges[currentContraptionIndex];
  const currentPrankChallenge = prankChallenges[currentPrankIndex];
  const currentSolutionChallenge = sillySolutionChallenges[currentSolutionIndex];

  useEffect(() => {
    if (!prankResult) return undefined;
    const timer = window.setTimeout(() => setPrankResult(''), 2400);
    return () => window.clearTimeout(timer);
  }, [prankResult]);

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleActivateContraption = () => {
    setContraptionActivated(true);
  };

  const handleNextContraption = () => {
    setCurrentContraptionIndex((prev) => nextIndex(prev, contraptionChallenges.length));
    setContraptionActivated(false);
  };

  const handlePrankSpotClick = (spotId) => {
    if (spotId === currentPrankChallenge.answerId) {
      setPrankResult(currentPrankChallenge.successMessage);
      return;
    }
    setPrankResult(currentPrankChallenge.failureMessage);
  };

  const handleNextPrank = () => {
    setCurrentPrankIndex((prev) => nextIndex(prev, prankChallenges.length));
    setPrankResult('');
  };

  const handleSillySolutionClick = (message) => {
    setSolutionResult(message);
  };

  const handleNextSolution = () => {
    setCurrentSolutionIndex((prev) => nextIndex(prev, sillySolutionChallenges.length));
    setSolutionResult('');
  };

  return (
    <div className="character-page-button-fix min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-blue-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-4 py-2 text-sm font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-blue-100 sm:text-3xl">
              KINU&apos;s Genius &amp; Mischief Lab 🧠⚡
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-blue-300/30 bg-blue-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Crazy Contraptions</h2>
            <button
              type="button"
              onClick={handleNextContraption}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-3 py-2 text-xs font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              Next 🔄
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950 shadow-none">
            <p className="text-base font-bold text-blue-950">{currentContraption.prompt}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-2xl">{currentContraption.startEmoji}</span>
              <span className="text-xl text-blue-300">→</span>
              <span className="rounded-lg border border-dashed border-blue-300 bg-blue-100 px-3 py-2 text-lg text-blue-900">
                {contraptionActivated ? currentContraption.toolEmoji : '...'}
              </span>
              <span className="text-xl text-blue-300">→</span>
              <span className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-2xl">{currentContraption.endEmoji}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleActivateContraption}
                className="rounded-xl border border-blue-700 bg-blue-700 px-5 py-3 text-base font-black text-white shadow-none hover:bg-blue-800"
              >
                {currentContraption.actionLabel}
              </button>

              {contraptionActivated && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
                  {currentContraption.successMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/30 bg-blue-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Hide &amp; Seek Prank</h2>
            <button
              type="button"
              onClick={handleNextPrank}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-3 py-2 text-xs font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              Next 🔄
            </button>
          </div>
          <p className="mt-2 text-sm font-bold text-blue-100">{currentPrankChallenge.prompt}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {currentPrankChallenge.spots.map((spot) => (
              <button
                key={`${currentPrankChallenge.answerId}-${spot.id}`}
                type="button"
                onClick={() => handlePrankSpotClick(spot.id)}
                className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-5 text-lg font-black text-blue-950 shadow-none hover:bg-blue-100"
              >
                {spot.label}
              </button>
            ))}
          </div>

          {prankResult && (
            <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-950">
              {prankResult}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-blue-300/30 bg-blue-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Silly Solutions</h2>
            <button
              type="button"
              onClick={handleNextSolution}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-3 py-2 text-xs font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950 shadow-none">
            <p className="text-base font-black text-blue-950">{currentSolutionChallenge.prompt}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {currentSolutionChallenge.options.map((option) => (
                <button
                  key={`${currentSolutionChallenge.prompt}-${option.id}`}
                  type="button"
                  onClick={() => handleSillySolutionClick(option.message)}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-4 text-base font-black text-blue-950 shadow-none hover:bg-blue-100"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {solutionResult && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
                {solutionResult}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/30 bg-blue-900 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Crazy Drawing Prompt 🎨</h2>

          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950 shadow-none sm:p-6">
            <p className="text-2xl font-black leading-relaxed text-blue-950 sm:text-3xl">
              {drawingPrompts[promptIndex]}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setPromptIndex((prev) => (prev + 1) % drawingPrompts.length)}
                className="rounded-xl border border-blue-700 bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-none hover:bg-blue-800"
              >
                Give me another idea! 🔄
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/30 bg-blue-900 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">Silly Joke of the Day 😂</h2>

          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950 shadow-none sm:p-6">
            <p className="text-xl font-black leading-relaxed text-blue-950 sm:text-2xl">
              {kinuJokes[jokeIndex].setup}
            </p>

            {showPunchline && (
              <p className="mt-4 rounded-xl border border-blue-200 bg-blue-100 px-4 py-3 text-sm font-black text-blue-950">
                {kinuJokes[jokeIndex].punchline}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowPunchline(true)}
                className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-950 shadow-none hover:bg-blue-100"
              >
                Tell me! 🎭
              </button>
              <button
                type="button"
                onClick={() => {
                  setJokeIndex((prev) => (prev + 1) % kinuJokes.length);
                  setShowPunchline(false);
                }}
                className="rounded-xl border border-blue-700 bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-none hover:bg-blue-800"
              >
                Next Joke ➡️
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
