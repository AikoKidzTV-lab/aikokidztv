import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  emojiDetectiveData,
  magicBookData,
  patternData,
  puzzleCanvasData,
  riddleData,
} from '../../data/mimiData';

const nextIndex = (currentIndex, totalItems) => (currentIndex + 1) % totalItems;

export default function MimiCuriousArtLabPage() {
  const navigate = useNavigate();
  const [currentMagicBookIndex, setCurrentMagicBookIndex] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [currentPuzzleCanvasIndex, setCurrentPuzzleCanvasIndex] = useState(0);
  const [canvasSolved, setCanvasSolved] = useState(false);
  const [shapeFeedback, setShapeFeedback] = useState('');
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [patternValue, setPatternValue] = useState('?');
  const [patternSolved, setPatternSolved] = useState(false);
  const [patternFeedback, setPatternFeedback] = useState('');
  const [currentEmojiDetectiveIndex, setCurrentEmojiDetectiveIndex] = useState(0);
  const [emojiDetectiveSolved, setEmojiDetectiveSolved] = useState(false);
  const [emojiDetectiveFeedback, setEmojiDetectiveFeedback] = useState('');
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [riddleFeedback, setRiddleFeedback] = useState('');

  const currentMagicBook = magicBookData[currentMagicBookIndex];
  const currentPuzzleCanvas = puzzleCanvasData[currentPuzzleCanvasIndex];
  const currentPattern = patternData[currentPatternIndex];
  const currentEmojiDetective = emojiDetectiveData[currentEmojiDetectiveIndex];
  const currentRiddle = riddleData[currentRiddleIndex];

  useEffect(() => {
    if (!shapeFeedback) return undefined;
    const timer = window.setTimeout(() => setShapeFeedback(''), 1400);
    return () => window.clearTimeout(timer);
  }, [shapeFeedback]);

  useEffect(() => {
    if (!patternFeedback || patternSolved) return undefined;
    const timer = window.setTimeout(() => setPatternFeedback(''), 1400);
    return () => window.clearTimeout(timer);
  }, [patternFeedback, patternSolved]);

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleAdvanceMagicBook = () => {
    setRevealStep((currentStep) => Math.min(currentStep + 1, currentMagicBook.steps.length));
  };

  const handleNextMagicBook = () => {
    setCurrentMagicBookIndex((currentIndex) => nextIndex(currentIndex, magicBookData.length));
    setRevealStep(0);
  };

  const handleShapeSelect = (shape) => {
    if (shape === currentPuzzleCanvas.targetShape) {
      setCanvasSolved(true);
      setShapeFeedback(currentPuzzleCanvas.successMessage);
      return;
    }

    setCanvasSolved(false);
    setShapeFeedback(currentPuzzleCanvas.failureMessage);
  };

  const handleNextPuzzleCanvas = () => {
    setCurrentPuzzleCanvasIndex((currentIndex) => nextIndex(currentIndex, puzzleCanvasData.length));
    setCanvasSolved(false);
    setShapeFeedback('');
  };

  const handlePatternChoice = (emoji) => {
    if (emoji === currentPattern.answer) {
      setPatternValue(currentPattern.answer);
      setPatternSolved(true);
      setPatternFeedback('Genius! âœ¨');
      return;
    }

    setPatternValue('?');
    setPatternSolved(false);
    setPatternFeedback('Try again, detective!');
  };

  const handleNextPattern = () => {
    setCurrentPatternIndex((currentIndex) => nextIndex(currentIndex, patternData.length));
    setPatternValue('?');
    setPatternSolved(false);
    setPatternFeedback('');
  };

  const handleEmojiDetectivePick = (emoji) => {
    if (emoji === currentEmojiDetective.targetEmoji) {
      setEmojiDetectiveSolved(true);
      setEmojiDetectiveFeedback('You found the odd one out! ðŸŽ‰');
      return;
    }

    if (!emojiDetectiveSolved) {
      setEmojiDetectiveFeedback('Try again!');
    }
  };

  const handleNextEmojiDetective = () => {
    setCurrentEmojiDetectiveIndex((currentIndex) => nextIndex(currentIndex, emojiDetectiveData.length));
    setEmojiDetectiveSolved(false);
    setEmojiDetectiveFeedback('');
  };

  const handleRiddleAnswer = (answer) => {
    if (answer === currentRiddle.answer) {
      setRiddleSolved(true);
      setRiddleFeedback('Correct! You are a genius! ðŸŒŸ');
      return;
    }

    setRiddleSolved(false);
    setRiddleFeedback('Oops! Try again! âŒ');
  };

  const handleNextRiddle = () => {
    setCurrentRiddleIndex((currentIndex) => nextIndex(currentIndex, riddleData.length));
    setRiddleSolved(false);
    setRiddleFeedback('');
  };

  return (
    <div className="character-page-button-fix min-h-screen bg-gradient-to-br from-fuchsia-900 via-slate-900 to-rose-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-pink-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-pink-300/25 bg-pink-400/12 px-4 py-2 text-sm font-black text-pink-100 shadow-none hover:bg-pink-400/18"
            >
              â† Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-pink-100 sm:text-3xl">
              MIMI&apos;s Curious Art Lab ðŸŽ¨ðŸ“–
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Why/How Magic Book</h2>
            <button
              type="button"
              onClick={handleNextMagicBook}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next ðŸ”„
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-4 text-pink-950 shadow-none sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-pink-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Question Page</p>
                <p className="mt-3 text-2xl font-black text-pink-900">{currentMagicBook.question}</p>
              </div>
              <div className="rounded-xl border border-pink-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Discovery Page</p>
                <div className="mt-3 space-y-2 text-sm font-bold text-pink-900">
                  {revealStep === 0 && <p>Open the steps one by one!</p>}
                  {currentMagicBook.steps.slice(0, revealStep).map((step, index) => (
                    <p key={step}>{index + 1}. {step}</p>
                  ))}
                  {revealStep >= currentMagicBook.steps.length && (
                    <p className="rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-pink-900">
                      Answer: {currentMagicBook.answer}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {revealStep < currentMagicBook.steps.length ? (
                <button
                  type="button"
                  onClick={handleAdvanceMagicBook}
                  className="rounded-xl border border-pink-300 bg-white px-4 py-3 text-sm font-black text-pink-950 shadow-none hover:bg-pink-100"
                >
                  {revealStep + 1}. {currentMagicBook.steps[revealStep]}
                </button>
              ) : (
                <div className="rounded-xl border border-pink-300 bg-pink-100 px-4 py-3 text-sm font-black text-pink-950">
                  All clues unlocked ðŸ“–
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">The Puzzle Canvas</h2>
            <button
              type="button"
              onClick={handleNextPuzzleCanvas}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next ðŸ”„
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none">
            <div className="mx-auto flex h-52 w-full max-w-md flex-col items-center justify-center rounded-xl border border-pink-200 bg-white p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-pink-700">Art Challenge</p>
              <div
                className={`grid h-24 w-24 place-items-center rounded-3xl border-4 ${
                  canvasSolved
                    ? 'border-fuchsia-500 bg-white/85'
                    : 'border-dashed border-pink-400 bg-white/60'
                }`}
              >
                <span className="text-5xl">{canvasSolved ? currentPuzzleCanvas.targetIcon : 'â”'}</span>
              </div>
              <div className="mt-4 rounded-md border border-pink-200 bg-pink-100 px-3 py-2 text-center text-xs font-black text-pink-950">
                {canvasSolved ? currentPuzzleCanvas.solvedPrompt : currentPuzzleCanvas.placeholderLabel}
              </div>
              <p className="mt-3 text-center text-sm font-black text-pink-900">{currentPuzzleCanvas.prompt}</p>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {currentPuzzleCanvas.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleShapeSelect(option.id)}
                  className="rounded-xl border border-pink-300 bg-white px-5 py-3 text-base font-black text-pink-950 shadow-none hover:bg-pink-100"
                >
                  {option.label} {option.icon}
                </button>
              ))}
            </div>

            {shapeFeedback && (
              <p className="mt-3 text-center text-sm font-black text-pink-900">{shapeFeedback}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Pattern Detective</h2>
            <button
              type="button"
              onClick={handleNextPattern}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next ðŸ”„
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-4 text-pink-950 shadow-none">
            <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl">
              {currentPattern.sequence.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="rounded-lg border border-pink-200 bg-white px-3 py-2"
                >
                  {item}
                </span>
              ))}
              <span className="rounded-lg border border-pink-200 bg-pink-100 px-3 py-2">{patternValue}</span>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {currentPattern.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handlePatternChoice(choice)}
                  className="rounded-xl border border-pink-300 bg-white px-5 py-3 text-2xl font-black text-pink-950 shadow-none hover:bg-pink-100"
                >
                  {choice}
                </button>
              ))}
            </div>

            {patternFeedback && (
              <p className={`mt-3 text-center text-sm font-black ${patternSolved ? 'text-emerald-700' : 'text-pink-900'}`}>
                {patternFeedback}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Emoji Detective ðŸ”</h2>
            <button
              type="button"
              onClick={handleNextEmojiDetective}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next ðŸ”„
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-4 text-pink-950 shadow-none sm:p-6">
            <p className="text-sm font-bold text-pink-950">
              Find the odd one out in Mimi&apos;s emoji puzzle board.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {currentEmojiDetective.options.map((emoji, index) => (
                <button
                  key={`${currentEmojiDetective.targetEmoji}-${index}`}
                  type="button"
                  onClick={() => handleEmojiDetectivePick(emoji)}
                  className="rounded-2xl border border-pink-200 bg-white px-4 py-5 text-4xl font-black text-pink-950 shadow-none"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {emojiDetectiveFeedback && (
              <p className={`mt-4 text-sm font-black ${emojiDetectiveSolved ? 'text-emerald-700' : 'text-pink-900'}`}>
                {emojiDetectiveFeedback}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Mimi&apos;s Riddle ðŸ¤”</h2>
            <button
              type="button"
              onClick={handleNextRiddle}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next ðŸ”„
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <p className="text-base font-black text-pink-950 sm:text-lg">
              {currentRiddle.question}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {currentRiddle.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleRiddleAnswer(option)}
                  className="rounded-xl border border-pink-300 bg-white px-4 py-3 text-sm font-black text-pink-950 shadow-none"
                >
                  {option}
                </button>
              ))}
            </div>

            {riddleFeedback && (
              <p className={`mt-4 text-sm font-black ${riddleSolved ? 'text-emerald-700' : 'text-red-600'}`}>
                {riddleFeedback}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
