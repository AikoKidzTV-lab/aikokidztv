import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PATTERN_CHOICES = ['🍃', '🌊', '☀️'];
const EMOJI_DETECTIVE_ITEM_COUNT = 12;
const RIDDLE_OPTIONS = ['A Map', 'A Keyboard', 'A Door'];

export default function MimiCuriousArtLabPage() {
  const navigate = useNavigate();
  const [revealStep, setRevealStep] = useState(0);
  const [houseComplete, setHouseComplete] = useState(false);
  const [shapeFeedback, setShapeFeedback] = useState('');
  const [patternValue, setPatternValue] = useState('?');
  const [patternSolved, setPatternSolved] = useState(false);
  const [patternFeedback, setPatternFeedback] = useState('');
  const [emojiDetectiveBoard] = useState(() => {
    const board = Array(EMOJI_DETECTIVE_ITEM_COUNT).fill('🍎');
    const tomatoIndex = Math.floor(Math.random() * EMOJI_DETECTIVE_ITEM_COUNT);
    board[tomatoIndex] = '🍅';
    return board;
  });
  const [emojiDetectiveSolved, setEmojiDetectiveSolved] = useState(false);
  const [emojiDetectiveFeedback, setEmojiDetectiveFeedback] = useState('');
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [riddleFeedback, setRiddleFeedback] = useState('');

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

  const handleShapeSelect = (shape) => {
    if (shape === 'triangle') {
      setHouseComplete(true);
      setShapeFeedback('Perfect! Roof fixed 🎉');
      return;
    }
    setHouseComplete(false);
    setShapeFeedback('Hmm, that shape does not fit the roof.');
  };

  const handlePatternChoice = (emoji) => {
    if (emoji === '🍃') {
      setPatternValue('🍃');
      setPatternSolved(true);
      setPatternFeedback('Genius! ✨');
      return;
    }
    setPatternValue('?');
    setPatternSolved(false);
    setPatternFeedback('Try again, detective!');
  };

  const handleEmojiDetectivePick = (emoji) => {
    if (emoji === '🍅') {
      setEmojiDetectiveSolved(true);
      setEmojiDetectiveFeedback('You found the odd one out! 🎉');
      return;
    }

    if (!emojiDetectiveSolved) {
      setEmojiDetectiveFeedback('Try again!');
    }
  };

  const handleRiddleAnswer = (answer) => {
    if (answer === 'A Keyboard') {
      setRiddleSolved(true);
      setRiddleFeedback('Correct! You are a genius! 🌟');
      return;
    }

    setRiddleSolved(false);
    setRiddleFeedback('Oops! Try again! ❌');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-slate-900 to-rose-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
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
              MIMI&apos;s Curious Art Lab 🎨📖
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-pink-200 sm:text-xl">Why/How Magic Book</h2>

          <div className="mt-4 rounded-2xl border border-pink-300/25 bg-gradient-to-br from-rose-100/95 to-pink-100/95 p-4 text-slate-800 shadow-none sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-pink-200 bg-white/85 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Question Page</p>
                <p className="mt-3 text-2xl font-black text-pink-900">Why does it rain? 🌧️</p>
              </div>
              <div className="rounded-xl border border-pink-200 bg-white/85 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Discovery Page</p>
                <div className="mt-3 space-y-2 text-sm font-bold text-pink-900">
                  {revealStep >= 1 && <p>1. Sun heats water ☀️</p>}
                  {revealStep >= 2 && <p>2. Clouds form ☁️</p>}
                  {revealStep >= 3 && <p>3. Rain falls! 🌧️</p>}
                  {revealStep === 0 && <p>Open the steps one by one!</p>}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {revealStep < 1 && (
                <button
                  type="button"
                  onClick={() => setRevealStep(1)}
                  className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-4 py-3 text-sm font-black text-pink-900 shadow-none hover:bg-pink-500/18"
                >
                  1. Sun heats water ☀️
                </button>
              )}
              {revealStep >= 1 && revealStep < 2 && (
                <button
                  type="button"
                  onClick={() => setRevealStep(2)}
                  className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-4 py-3 text-sm font-black text-pink-900 shadow-none hover:bg-pink-500/18"
                >
                  2. Clouds form ☁️
                </button>
              )}
              {revealStep >= 2 && revealStep < 3 && (
                <button
                  type="button"
                  onClick={() => setRevealStep(3)}
                  className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-4 py-3 text-sm font-black text-pink-900 shadow-none hover:bg-pink-500/18"
                >
                  3. Rain falls! 🌧️
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-pink-200 sm:text-xl">The Puzzle Canvas</h2>

          <div className="mt-4 rounded-2xl border border-pink-200/20 bg-slate-800/65 p-5 shadow-none">
            <div className="mx-auto flex h-52 w-full max-w-md flex-col items-center justify-end rounded-xl border border-pink-300/40 bg-gradient-to-b from-pink-100/70 to-fuchsia-100/70 p-4">
              <div
                className={`relative mb-1 h-0 w-0 transition-all duration-300 ${
                  houseComplete ? 'border-l-[65px] border-r-[65px] border-b-[62px]' : 'border-l-[60px] border-r-[60px] border-b-[0px]'
                } border-l-transparent border-r-transparent ${houseComplete ? 'border-b-pink-500' : 'border-b-transparent'}`}
              />
              {!houseComplete && (
                <div className="mb-2 rounded-md border border-dashed border-pink-400 px-3 py-1 text-xs font-black text-pink-700">
                  Roof missing...
                </div>
              )}
              <div className={`h-24 w-36 rounded-md border-4 ${houseComplete ? 'border-fuchsia-500 bg-yellow-200' : 'border-slate-500 bg-slate-200'}`}>
                <div className="mx-auto mt-6 h-14 w-10 rounded-t-md border-2 border-pink-700 bg-pink-300" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => handleShapeSelect('triangle')}
                className="rounded-xl border border-pink-300/25 bg-pink-500/15 px-5 py-3 text-base font-black text-pink-100 shadow-none hover:bg-pink-500/20"
              >
                Triangle 🔺
              </button>
              <button
                type="button"
                onClick={() => handleShapeSelect('circle')}
                className="rounded-xl border border-pink-300/25 bg-pink-500/15 px-5 py-3 text-base font-black text-pink-100 shadow-none hover:bg-pink-500/20"
              >
                Circle 🔵
              </button>
              <button
                type="button"
                onClick={() => handleShapeSelect('square')}
                className="rounded-xl border border-pink-300/25 bg-pink-500/15 px-5 py-3 text-base font-black text-pink-100 shadow-none hover:bg-pink-500/20"
              >
                Square 🟦
              </button>
            </div>

            {shapeFeedback && (
              <p className="mt-3 text-center text-sm font-black text-pink-200">{shapeFeedback}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-pink-200 sm:text-xl">Pattern Detective</h2>

          <div className="mt-4 rounded-2xl border border-pink-200/20 bg-slate-800/65 p-4 shadow-none">
            <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl">
              <span className="rounded-lg border border-pink-300/60 bg-pink-500/20 px-3 py-2">🍎</span>
              <span className="rounded-lg border border-pink-300/60 bg-pink-500/20 px-3 py-2">🍃</span>
              <span className="rounded-lg border border-pink-300/60 bg-pink-500/20 px-3 py-2">🍎</span>
              <span className="rounded-lg border border-pink-300/60 bg-pink-500/20 px-3 py-2">{patternValue}</span>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {PATTERN_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handlePatternChoice(choice)}
                  className="rounded-xl border border-pink-300/25 bg-pink-500/15 px-5 py-3 text-2xl font-black text-pink-100 shadow-none hover:bg-pink-500/20"
                >
                  {choice}
                </button>
              ))}
            </div>

            {patternFeedback && (
              <p className={`mt-3 text-center text-sm font-black ${patternSolved ? 'text-emerald-300' : 'text-pink-200'}`}>
                {patternFeedback}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-pink-200 sm:text-xl">Emoji Detective 🔍</h2>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100 p-4 text-slate-900 shadow-none sm:p-6">
            <p className="text-sm font-bold text-pink-800">
              Find the odd one out in Mimi&apos;s fruity puzzle board.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {emojiDetectiveBoard.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => handleEmojiDetectivePick(emoji)}
                  className="rounded-2xl border border-pink-200 bg-white px-4 py-5 text-4xl font-black text-pink-700 shadow-none"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {emojiDetectiveFeedback && (
              <p className={`mt-4 text-sm font-black ${emojiDetectiveSolved ? 'text-emerald-600' : 'text-pink-700'}`}>
                {emojiDetectiveFeedback}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-pink-200 sm:text-xl">Mimi&apos;s Riddle 🤔</h2>

          <div className="mt-4 rounded-2xl border border-fuchsia-200/40 bg-gradient-to-br from-fuchsia-200 via-pink-200 to-rose-200 p-5 text-slate-900 shadow-none sm:p-6">
            <p className="text-base font-black text-fuchsia-900 sm:text-lg">
              I have keys but no locks. I have space but no room. You can enter but not go outside. What am I?
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {RIDDLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleRiddleAnswer(option)}
                  className="rounded-xl border border-fuchsia-300 bg-white px-4 py-3 text-sm font-black text-fuchsia-900 shadow-none"
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
