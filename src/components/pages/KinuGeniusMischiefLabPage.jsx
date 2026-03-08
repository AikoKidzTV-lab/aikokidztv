import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const nextIndex = (currentIndex, totalItems) => (currentIndex + 1) % totalItems;

const contraptionChallenges = [
  {
    prompt: 'The ball needs to bounce!',
    startEmoji: '⚽',
    toolEmoji: '🌀',
    endEmoji: '🎯',
    actionLabel: 'Place Spring 🌀',
    successMessage: 'BOING! 🔔',
  },
  {
    prompt: 'The paper plane needs a turbo boost!',
    startEmoji: '🛩️',
    toolEmoji: '💨',
    endEmoji: '🎈',
    actionLabel: 'Add Turbo 💨',
    successMessage: 'WHOOSH! Sky mission ready!',
  },
  {
    prompt: 'The drum beat needs a power zap!',
    startEmoji: '🥁',
    toolEmoji: '⚡',
    endEmoji: '🎵',
    actionLabel: 'Charge It ⚡',
    successMessage: 'KABOOM! Beat unlocked!',
  },
  {
    prompt: 'The robot helper needs a silly gear!',
    startEmoji: '🤖',
    toolEmoji: '⚙️',
    endEmoji: '📦',
    actionLabel: 'Drop Gear ⚙️',
    successMessage: 'CLANK! Robot fix complete!',
  },
  {
    prompt: 'The paint rocket needs a bright launch!',
    startEmoji: '🎨',
    toolEmoji: '🚀',
    endEmoji: '🌈',
    actionLabel: 'Launch Rocket 🚀',
    successMessage: 'ZOOM! Colors everywhere!',
  },
];

const prankChallenges = [
  {
    prompt: "I hid NIKO's ball! Where is it?",
    answerId: 'cloud',
    successMessage: 'You found it! ⚽🎉',
    failureMessage: 'Nope, not here! 😜',
    spots: [
      { id: 'bush', label: 'Bush 🌳' },
      { id: 'cloud', label: 'Cloud ☁️' },
      { id: 'box', label: 'Box 📦' },
    ],
  },
  {
    prompt: "I hid MIMI's paintbrush! Where is it?",
    answerId: 'jar',
    successMessage: 'You caught my prank! 🖌️🎉',
    failureMessage: 'Hehe, keep looking!',
    spots: [
      { id: 'book', label: 'Book Stack 📚' },
      { id: 'jar', label: 'Paint Jar 🫙' },
      { id: 'hat', label: 'Top Hat 🎩' },
    ],
  },
  {
    prompt: "I hid CHIKO's screwdriver! Where is it?",
    answerId: 'toolbox',
    successMessage: 'You found the toolbox trick! 🪛🎉',
    failureMessage: 'Not there. Try again!',
    spots: [
      { id: 'pillow', label: 'Pillow 🛏️' },
      { id: 'toolbox', label: 'Toolbox 🧰' },
      { id: 'plant', label: 'Plant 🪴' },
    ],
  },
  {
    prompt: "I hid AIKO's notebook! Where is it?",
    answerId: 'drawer',
    successMessage: 'Notebook discovered! 📓🎉',
    failureMessage: 'Sneaky, but not that spot!',
    spots: [
      { id: 'drawer', label: 'Drawer 🗄️' },
      { id: 'moon', label: 'Moon Lamp 🌙' },
      { id: 'basket', label: 'Basket 🧺' },
    ],
  },
  {
    prompt: "I hid MIKO's star toy! Where is it?",
    answerId: 'planet',
    successMessage: 'You spotted the cosmic prank! ⭐🎉',
    failureMessage: 'Nope. Search the galaxy again!',
    spots: [
      { id: 'planet', label: 'Planet 🪐' },
      { id: 'locker', label: 'Locker 🚪' },
      { id: 'curtain', label: 'Curtain 🎭' },
    ],
  },
];

const sillySolutionChallenges = [
  {
    prompt: 'How to cross a broken bridge? 🌉',
    options: [
      { id: 'castle', label: 'Giant Bouncy Castle 🏰', message: 'Boing! Boing! Safe landing!' },
      { id: 'boots', label: 'Rocket Boots 🚀', message: 'Zoom! You crossed in style!' },
      { id: 'car', label: 'Floating Car 🚗', message: 'Vroom in the sky. Bridge problem solved!' },
    ],
  },
  {
    prompt: 'How to reach a cookie on the moon? 🌙',
    options: [
      { id: 'ladder', label: 'Mega Ladder 🪜', message: 'Climb, climb, cookie time!' },
      { id: 'catapult', label: 'Cookie Catapult 🥠', message: 'Wheee! Snack mission launched!' },
      { id: 'jetpack', label: 'Marshmallow Jetpack 🎒', message: 'Puff! You floated to the cookie!' },
    ],
  },
  {
    prompt: 'How to cool down a grumpy dragon? 🐉',
    options: [
      { id: 'fan', label: 'Super Fan 🌬️', message: 'Fwoosh! Dragon is chill now!' },
      { id: 'popsicle', label: 'Mega Popsicle 🍭', message: 'Crunch! Dragon became cheerful!' },
      { id: 'sprinkler', label: 'Rainbow Sprinkler 🌈', message: 'Splash! Fire mood gone!' },
    ],
  },
  {
    prompt: 'How to deliver music to a sleepy whale? 🐋',
    options: [
      { id: 'submarine', label: 'Singing Submarine 🚢', message: 'Blub blub! Concert delivered!' },
      { id: 'bubble', label: 'Bubble Speaker 🫧', message: 'Pop! The whale heard every note!' },
      { id: 'trumpet', label: 'Golden Trumpet 🎺', message: 'Toot! Underwater jam session started!' },
    ],
  },
  {
    prompt: 'How to paint a cloud without getting wet? ☁️',
    options: [
      { id: 'umbrella', label: 'Painter Umbrella ☂️', message: 'Drip-proof and masterpiece ready!' },
      { id: 'drone', label: 'Art Drone 🚁', message: 'Buzz! The cloud got painted from above!' },
      { id: 'boots', label: 'Sky Boots 👢', message: 'Tap tap! You walked right up to the cloud!' },
    ],
  },
];

const drawingPrompts = [
  'Draw a flying cat wearing sunglasses!',
  'Draw a pizza slice playing a guitar!',
  'Draw a robot octopus painting the ocean!',
  'Draw a sleepy dragon reading comic books!',
  'Draw a disco banana on a skateboard!',
];

const kinuJokes = [
  {
    setup: 'Why did the cow cross the road?',
    punchline: 'To get to the udder side!',
  },
  {
    setup: 'Why did the music note bring a ladder?',
    punchline: 'It wanted to reach the high notes!',
  },
  {
    setup: 'Why did the paintbrush blush?',
    punchline: 'Because it saw the canvas without any colors on!',
  },
  {
    setup: 'Why did the crayon become a comedian?',
    punchline: 'Because it was great at drawing laughs!',
  },
  {
    setup: 'Why did the guitar sit in the sunshine?',
    punchline: 'It wanted to feel a little more string light!',
  },
];

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
    <div className="min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
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

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-blue-200 sm:text-xl">Crazy Contraptions</h2>
            <button
              type="button"
              onClick={handleNextContraption}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-3 py-2 text-xs font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              Next 🔄
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-blue-200/20 bg-slate-800/65 p-4 shadow-none">
            <p className="text-base font-bold text-blue-100">{currentContraption.prompt}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-blue-300/50 bg-blue-500/10 px-3 py-2 text-2xl">{currentContraption.startEmoji}</span>
              <span className="text-xl text-blue-300">→</span>
              <span className="rounded-lg border border-dashed border-blue-400/50 bg-slate-900/70 px-3 py-2 text-lg text-blue-200">
                {contraptionActivated ? currentContraption.toolEmoji : '...'}
              </span>
              <span className="text-xl text-blue-300">→</span>
              <span className="rounded-lg border border-blue-300/50 bg-blue-500/10 px-3 py-2 text-2xl">{currentContraption.endEmoji}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleActivateContraption}
                className="rounded-xl border border-blue-300/25 bg-blue-400/15 px-5 py-3 text-base font-black text-blue-100 shadow-none hover:bg-blue-400/20"
              >
                {currentContraption.actionLabel}
              </button>

              {contraptionActivated && (
                <p className="rounded-xl border border-emerald-200/25 bg-emerald-500/12 px-4 py-2 text-sm font-black text-emerald-200">
                  {currentContraption.successMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-blue-200 sm:text-xl">Hide &amp; Seek Prank</h2>
            <button
              type="button"
              onClick={handleNextPrank}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-3 py-2 text-xs font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              Next 🔄
            </button>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-300">{currentPrankChallenge.prompt}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {currentPrankChallenge.spots.map((spot) => (
              <button
                key={`${currentPrankChallenge.answerId}-${spot.id}`}
                type="button"
                onClick={() => handlePrankSpotClick(spot.id)}
                className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-5 py-5 text-lg font-black text-blue-100 shadow-none hover:bg-blue-400/18"
              >
                {spot.label}
              </button>
            ))}
          </div>

          {prankResult && (
            <p className="mt-4 rounded-xl border border-blue-200/25 bg-slate-800/65 px-4 py-2 text-sm font-black text-blue-100">
              {prankResult}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-blue-200 sm:text-xl">Silly Solutions</h2>
            <button
              type="button"
              onClick={handleNextSolution}
              className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-3 py-2 text-xs font-black text-blue-100 shadow-none hover:bg-blue-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-200/20 bg-slate-800/65 p-4 shadow-none">
            <p className="text-base font-black text-blue-100">{currentSolutionChallenge.prompt}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {currentSolutionChallenge.options.map((option) => (
                <button
                  key={`${currentSolutionChallenge.prompt}-${option.id}`}
                  type="button"
                  onClick={() => handleSillySolutionClick(option.message)}
                  className="rounded-xl border border-blue-300/25 bg-blue-400/12 px-4 py-4 text-base font-black text-blue-100 shadow-none hover:bg-blue-400/18"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {solutionResult && (
              <p className="mt-4 rounded-xl border border-emerald-200/25 bg-emerald-500/12 px-4 py-2 text-sm font-black text-emerald-200">
                {solutionResult}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-blue-200 sm:text-xl">Crazy Drawing Prompt 🎨</h2>

          <div className="mt-4 rounded-2xl border border-sky-200/50 bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100 p-5 text-slate-900 shadow-none sm:p-6">
            <p className="text-2xl font-black leading-relaxed text-blue-900 sm:text-3xl">
              {drawingPrompts[promptIndex]}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setPromptIndex((prev) => (prev + 1) % drawingPrompts.length)}
                className="rounded-xl border border-sky-300 bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-none hover:bg-blue-600"
              >
                Give me another idea! 🔄
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-blue-200 sm:text-xl">Silly Joke of the Day 😂</h2>

          <div className="mt-4 rounded-2xl border border-sky-200/40 bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 p-5 text-slate-900 shadow-none sm:p-6">
            <p className="text-xl font-black leading-relaxed text-blue-900 sm:text-2xl">
              {kinuJokes[jokeIndex].setup}
            </p>

            {showPunchline && (
              <p className="mt-4 rounded-xl border border-blue-200 bg-white/80 px-4 py-3 text-sm font-black text-blue-800">
                {kinuJokes[jokeIndex].punchline}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowPunchline(true)}
                className="rounded-xl border border-sky-300 bg-white px-5 py-3 text-sm font-black text-blue-900 shadow-none hover:bg-sky-50"
              >
                Tell me! 🎭
              </button>
              <button
                type="button"
                onClick={() => {
                  setJokeIndex((prev) => (prev + 1) % kinuJokes.length);
                  setShowPunchline(false);
                }}
                className="rounded-xl border border-blue-300 bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-none hover:bg-blue-600"
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
