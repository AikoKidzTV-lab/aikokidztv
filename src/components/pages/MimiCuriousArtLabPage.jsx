import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  magicBookData,
  puzzleCanvasData,
  patternData,
  curiousFactsData,
  emojiPuzzleData,
  riddleData,
} from '../../data/mimiData';

export default function MimiCuriousArtLabPage() {
  const navigate = useNavigate();
  const [magicIndex, setMagicIndex] = useState(0);
  const [canvasIndex, setCanvasIndex] = useState(0);
  const [patternIndex, setPatternIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [riddleIndex, setRiddleIndex] = useState(0);

  const [canvasFeedback, setCanvasFeedback] = useState('');
  const [patternFeedback, setPatternFeedback] = useState('');
  const [showEmojiAnswer, setShowEmojiAnswer] = useState(false);
  const [showRiddleAnswer, setShowRiddleAnswer] = useState(false);

  const currentMagic = magicBookData[magicIndex];
  const currentCanvas = puzzleCanvasData[canvasIndex];
  const currentPattern = patternData[patternIndex];
  const currentFact = curiousFactsData[factIndex];
  const currentEmojiPuzzle = emojiPuzzleData[emojiIndex];
  const currentRiddle = riddleData[riddleIndex];

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleCanvasChoice = (choice) => {
    if (choice === currentCanvas.correct) {
      setCanvasFeedback('Correct! Great shape detective! 🎉');
      return;
    }

    setCanvasFeedback('Not this one. Try again!');
  };

  const handlePatternChoice = (choice) => {
    if (choice === currentPattern.correct) {
      setPatternFeedback('Awesome pattern solving! 🌟');
      return;
    }

    setPatternFeedback('Close! Try another option.');
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
              ← Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-pink-100 sm:text-3xl">
              MIMI&apos;s Curious Art Lab 🎨📚
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Why/How Magic Book</h2>
            <button
              type="button"
              onClick={() => {
                setMagicIndex((prev) => (prev + 1) % magicBookData.length);
              }}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Question</p>
            <p className="mt-2 text-xl font-black leading-relaxed text-pink-950 sm:text-2xl">{currentMagic.question}</p>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-pink-700">Steps</p>
            <div className="mt-2 space-y-2">
              {currentMagic.steps.map((step) => (
                <p key={step} className="rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm font-bold text-pink-900">
                  {step}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">The Puzzle Canvas</h2>
            <button
              type="button"
              onClick={() => {
                setCanvasIndex((prev) => (prev + 1) % puzzleCanvasData.length);
                setCanvasFeedback('');
              }}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <div className="rounded-xl border border-pink-200 bg-white p-4 text-center">
              <p className="text-5xl">{currentCanvas.shapeImage}</p>
              <p className="mt-3 text-base font-black text-pink-900">{currentCanvas.challenge}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {currentCanvas.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleCanvasChoice(option)}
                  className="rounded-xl border border-pink-300 bg-white px-4 py-3 text-sm font-black text-pink-950 shadow-none hover:bg-pink-100"
                >
                  {option}
                </button>
              ))}
            </div>

            {canvasFeedback && <p className="mt-3 text-sm font-black text-pink-900">{canvasFeedback}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Pattern Detective</h2>
            <button
              type="button"
              onClick={() => {
                setPatternIndex((prev) => (prev + 1) % patternData.length);
                setPatternFeedback('');
              }}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-3xl">
              {currentPattern.sequence.map((item, index) => (
                <span key={`${item}-${index}`} className="rounded-lg border border-pink-200 bg-white px-3 py-2">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {currentPattern.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handlePatternChoice(option)}
                  className="rounded-xl border border-pink-300 bg-white px-4 py-3 text-2xl font-black text-pink-950 shadow-none hover:bg-pink-100"
                >
                  {option}
                </button>
              ))}
            </div>

            {patternFeedback && <p className="mt-3 text-sm font-black text-pink-900">{patternFeedback}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Curious Facts</h2>
            <button
              type="button"
              onClick={() => {
                setFactIndex((prev) => (prev + 1) % curiousFactsData.length);
              }}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Question</p>
            <p className="mt-2 text-xl font-black leading-relaxed text-pink-950 sm:text-2xl">{currentFact.question}</p>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-pink-700">Fact</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-pink-900 sm:text-base">{currentFact.fact}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Emoji Puzzle</h2>
            <button
              type="button"
              onClick={() => {
                setEmojiIndex((prev) => (prev + 1) % emojiPuzzleData.length);
                setShowEmojiAnswer(false);
              }}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Puzzle</p>
            <p className="mt-2 text-4xl font-black tracking-wide text-pink-950 sm:text-5xl">{currentEmojiPuzzle.emojis}</p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowEmojiAnswer(true)}
                className="rounded-xl border border-pink-700 bg-pink-700 px-4 py-3 text-sm font-black text-white shadow-none hover:bg-pink-800"
              >
                Reveal Answer 👀
              </button>
            </div>

            {showEmojiAnswer && (
              <div className="mt-4 rounded-xl border border-pink-200 bg-white px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Answer</p>
                <p className="mt-2 text-lg font-black text-pink-950">{currentEmojiPuzzle.answer}</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/30 bg-fuchsia-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">Mimi&apos;s Riddle</h2>
            <button
              type="button"
              onClick={() => {
                setRiddleIndex((prev) => (prev + 1) % riddleData.length);
                setShowRiddleAnswer(false);
              }}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-pink-950 shadow-none sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Riddle</p>
            <p className="mt-2 text-lg font-black leading-relaxed text-pink-950 sm:text-xl">{currentRiddle.question}</p>
            <p className="mt-4 text-5xl">{currentRiddle.emoji}</p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowRiddleAnswer(true)}
                className="rounded-xl border border-pink-700 bg-pink-700 px-4 py-3 text-sm font-black text-white shadow-none hover:bg-pink-800"
              >
                Reveal Answer 👀
              </button>
            </div>

            {showRiddleAnswer && (
              <div className="mt-4 rounded-xl border border-pink-200 bg-white px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Answer</p>
                <p className="mt-2 text-lg font-black text-pink-950">{currentRiddle.answer}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
