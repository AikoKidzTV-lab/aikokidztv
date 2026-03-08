import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const nextIndex = (currentIndex, totalItems) => (currentIndex + 1) % totalItems;

const magicBookData = [
  {
    question: 'Why does it rain? 🌧️',
    answer: 'Because water rises into clouds and then falls back down as rain!',
    steps: ['Sun heats water ☀️', 'Clouds form ☁️', 'Rain falls 🌧️'],
  },
  {
    question: 'Why is the sky blue? 💙',
    answer: 'Because sunlight scatters and blue light spreads the most in the sky!',
    steps: ['Sunlight enters the air ☀️', 'Tiny particles scatter blue light 💫', 'The sky looks blue 💙'],
  },
  {
    question: 'How do plants grow? 🌱',
    answer: 'Plants use sunlight, water, and soil nutrients to grow strong and tall!',
    steps: ['Roots drink water 💧', 'Leaves catch sunlight ☀️', 'The plant grows taller 🌱'],
  },
  {
    question: 'Why do shadows follow you? 👣',
    answer: 'Because your body blocks light and makes a dark shape behind or beside you!',
    steps: ['Light shines from one side 🔦', 'Your body blocks the light 🙋', 'A shadow appears on the ground 👣'],
  },
  {
    question: 'Why does the moon change shape? 🌙',
    answer: 'Because we see different lit parts of the moon as it moves around Earth!',
    steps: ['The moon moves around Earth 🌍', 'Sunlight lights one side of the moon ☀️', 'We see different moon shapes 🌙'],
  },
];

const puzzleCanvasData = [
  {
    prompt: 'Pick the shape that completes the roof sketch.',
    solvedPrompt: 'The roof sketch is complete!',
    targetShape: 'triangle',
    targetIcon: '🔺',
    placeholderLabel: 'Roof shape missing...',
    successMessage: 'Perfect! Roof fixed 🎉',
    failureMessage: 'Hmm, that shape does not fit the roof.',
    options: [
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
      { id: 'circle', label: 'Circle', icon: '🔵' },
      { id: 'square', label: 'Square', icon: '🟦' },
    ],
  },
  {
    prompt: 'Choose the shape for the bright sun spot.',
    solvedPrompt: 'The sunny shape looks perfect!',
    targetShape: 'circle',
    targetIcon: '🔵',
    placeholderLabel: 'Sun shape missing...',
    successMessage: 'Yes! The sunny circle fits beautifully! ☀️',
    failureMessage: 'Not quite. Try the round shape.',
    options: [
      { id: 'square', label: 'Square', icon: '🟦' },
      { id: 'circle', label: 'Circle', icon: '🔵' },
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
    ],
  },
  {
    prompt: 'Find the shape that finishes the gift box design.',
    solvedPrompt: 'The gift box design is complete!',
    targetShape: 'square',
    targetIcon: '🟦',
    placeholderLabel: 'Gift box shape missing...',
    successMessage: 'Great job! The box piece fits! 🎁',
    failureMessage: 'That one does not make the box shape.',
    options: [
      { id: 'circle', label: 'Circle', icon: '🔵' },
      { id: 'square', label: 'Square', icon: '🟦' },
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
    ],
  },
  {
    prompt: 'Pick the shape that completes the kite art.',
    solvedPrompt: 'The kite art is ready to fly!',
    targetShape: 'diamond',
    targetIcon: '🔶',
    placeholderLabel: 'Kite shape missing...',
    successMessage: 'Wonderful! The kite shape fits! 🪁',
    failureMessage: 'Close, but the kite needs a diamond shape.',
    options: [
      { id: 'heart', label: 'Heart', icon: '💗' },
      { id: 'diamond', label: 'Diamond', icon: '🔶' },
      { id: 'circle', label: 'Circle', icon: '🔵' },
    ],
  },
  {
    prompt: 'Choose the shape for the friendship badge.',
    solvedPrompt: 'The friendship badge looks adorable!',
    targetShape: 'heart',
    targetIcon: '💗',
    placeholderLabel: 'Badge shape missing...',
    successMessage: 'Aww! The heart shape is right! 💖',
    failureMessage: 'Try the heart shape for this badge.',
    options: [
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
      { id: 'diamond', label: 'Diamond', icon: '🔶' },
      { id: 'heart', label: 'Heart', icon: '💗' },
    ],
  },
];

const patternData = [
  {
    sequence: ['🍎', '🍃', '🍎'],
    choices: ['🍃', '🌊', '☀️'],
    answer: '🍃',
  },
  {
    sequence: ['⭐', '🌙', '⭐'],
    choices: ['☁️', '🌙', '🪐'],
    answer: '🌙',
  },
  {
    sequence: ['🧩', '🎨', '🧩'],
    choices: ['🎵', '📚', '🎨'],
    answer: '🎨',
  },
  {
    sequence: ['🐝', '🌸', '🐝'],
    choices: ['🍓', '🌈', '🌸'],
    answer: '🌸',
  },
  {
    sequence: ['🦋', '🍀', '🦋'],
    choices: ['🌞', '🍀', '🍎'],
    answer: '🍀',
  },
];

const buildEmojiDetectiveOptions = (baseEmoji, targetEmoji, targetIndex) =>
  Array.from({ length: 12 }, (_, index) => (index === targetIndex ? targetEmoji : baseEmoji));

const emojiDetectiveData = [
  {
    targetEmoji: '🍅',
    baseEmoji: '🍎',
    options: buildEmojiDetectiveOptions('🍎', '🍅', 7),
  },
  {
    targetEmoji: '🌙',
    baseEmoji: '⭐',
    options: buildEmojiDetectiveOptions('⭐', '🌙', 3),
  },
  {
    targetEmoji: '🦀',
    baseEmoji: '🐟',
    options: buildEmojiDetectiveOptions('🐟', '🦀', 10),
  },
  {
    targetEmoji: '🌻',
    baseEmoji: '🌷',
    options: buildEmojiDetectiveOptions('🌷', '🌻', 1),
  },
  {
    targetEmoji: '✨',
    baseEmoji: '💗',
    options: buildEmojiDetectiveOptions('💗', '✨', 8),
  },
];

const riddleData = [
  {
    question: 'I have keys but no locks. I have space but no room. You can enter but not go outside. What am I?',
    options: ['A Map', 'A Keyboard', 'A Door'],
    answer: 'A Keyboard',
  },
  {
    question: 'What has hands but cannot clap?',
    options: ['A Clock', 'A Robot', 'A Table'],
    answer: 'A Clock',
  },
  {
    question: 'What gets wetter as it dries?',
    options: ['A Towel', 'A Candle', 'A Pillow'],
    answer: 'A Towel',
  },
  {
    question: 'What has one eye but cannot see?',
    options: ['A Needle', 'A Pirate', 'A Potato'],
    answer: 'A Needle',
  },
  {
    question: 'What is full of holes but still holds water?',
    options: ['A Sponge', 'A Basket', 'A Shoe'],
    answer: 'A Sponge',
  },
];

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
      setPatternFeedback('Genius! ✨');
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
      setEmojiDetectiveFeedback('You found the odd one out! 🎉');
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
      setRiddleFeedback('Correct! You are a genius! 🌟');
      return;
    }

    setRiddleSolved(false);
    setRiddleFeedback('Oops! Try again! ❌');
  };

  const handleNextRiddle = () => {
    setCurrentRiddleIndex((currentIndex) => nextIndex(currentIndex, riddleData.length));
    setRiddleSolved(false);
    setRiddleFeedback('');
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
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-pink-200 sm:text-xl">Why/How Magic Book</h2>
            <button
              type="button"
              onClick={handleNextMagicBook}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-300/25 bg-gradient-to-br from-rose-100/95 to-pink-100/95 p-4 text-slate-800 shadow-none sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-pink-200 bg-white/85 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">Question Page</p>
                <p className="mt-3 text-2xl font-black text-pink-900">{currentMagicBook.question}</p>
              </div>
              <div className="rounded-xl border border-pink-200 bg-white/85 p-4">
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
                  className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-4 py-3 text-sm font-black text-pink-900 shadow-none hover:bg-pink-500/18"
                >
                  {revealStep + 1}. {currentMagicBook.steps[revealStep]}
                </button>
              ) : (
                <div className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-4 py-3 text-sm font-black text-pink-900">
                  All clues unlocked 📖
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-pink-200 sm:text-xl">The Puzzle Canvas</h2>
            <button
              type="button"
              onClick={handleNextPuzzleCanvas}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200/20 bg-slate-800/65 p-5 shadow-none">
            <div className="mx-auto flex h-52 w-full max-w-md flex-col items-center justify-center rounded-xl border border-pink-300/40 bg-gradient-to-b from-pink-100/70 to-fuchsia-100/70 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-pink-700">Art Challenge</p>
              <div
                className={`grid h-24 w-24 place-items-center rounded-3xl border-4 ${
                  canvasSolved
                    ? 'border-fuchsia-500 bg-white/85'
                    : 'border-dashed border-pink-400 bg-white/60'
                }`}
              >
                <span className="text-5xl">{canvasSolved ? currentPuzzleCanvas.targetIcon : '❔'}</span>
              </div>
              <div className="mt-4 rounded-md border border-pink-200 bg-white/80 px-3 py-2 text-center text-xs font-black text-pink-800">
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
                  className="rounded-xl border border-pink-300/25 bg-pink-500/15 px-5 py-3 text-base font-black text-pink-100 shadow-none hover:bg-pink-500/20"
                >
                  {option.label} {option.icon}
                </button>
              ))}
            </div>

            {shapeFeedback && (
              <p className="mt-3 text-center text-sm font-black text-pink-200">{shapeFeedback}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-pink-200 sm:text-xl">Pattern Detective</h2>
            <button
              type="button"
              onClick={handleNextPattern}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200/20 bg-slate-800/65 p-4 shadow-none">
            <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl">
              {currentPattern.sequence.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="rounded-lg border border-pink-300/60 bg-pink-500/20 px-3 py-2"
                >
                  {item}
                </span>
              ))}
              <span className="rounded-lg border border-pink-300/60 bg-pink-500/20 px-3 py-2">{patternValue}</span>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {currentPattern.choices.map((choice) => (
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
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-pink-200 sm:text-xl">Emoji Detective 🔍</h2>
            <button
              type="button"
              onClick={handleNextEmojiDetective}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-pink-200 bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100 p-4 text-slate-900 shadow-none sm:p-6">
            <p className="text-sm font-bold text-pink-800">
              Find the odd one out in Mimi&apos;s emoji puzzle board.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {currentEmojiDetective.options.map((emoji, index) => (
                <button
                  key={`${currentEmojiDetective.targetEmoji}-${index}`}
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
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-pink-200 sm:text-xl">Mimi&apos;s Riddle 🤔</h2>
            <button
              type="button"
              onClick={handleNextRiddle}
              className="rounded-xl border border-pink-300/25 bg-pink-500/12 px-3 py-2 text-xs font-black text-pink-100 shadow-none hover:bg-pink-500/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-fuchsia-200/40 bg-gradient-to-br from-fuchsia-200 via-pink-200 to-rose-200 p-5 text-slate-900 shadow-none sm:p-6">
            <p className="text-base font-black text-fuchsia-900 sm:text-lg">
              {currentRiddle.question}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {currentRiddle.options.map((option) => (
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
