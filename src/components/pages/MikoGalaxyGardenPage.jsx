import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const nextIndex = (currentIndex, totalItems) => (currentIndex + 1) % totalItems;

const ecoMissions = [
  'Find a leaf with 3 different colors!',
  'Water a plant today!',
  'Spot two birds and listen to their sounds!',
  'Collect one fallen leaf and study its shape!',
  'Spend five minutes looking at clouds and trees!',
];

const animalRiddles = [
  {
    riddle: 'I am green and say ribbit.',
    answer: 'Frog',
    emoji: '🐸',
  },
  {
    riddle: 'I have a long neck and love tall trees.',
    answer: 'Giraffe',
    emoji: '🦒',
  },
  {
    riddle: 'I move slowly and carry my home on my back.',
    answer: 'Snail',
    emoji: '🐌',
  },
  {
    riddle: 'I am black and white and love bamboo.',
    answer: 'Panda',
    emoji: '🐼',
  },
  {
    riddle: 'I am striped and run very fast in the wild.',
    answer: 'Zebra',
    emoji: '🦓',
  },
];

const earthFacts = [
  'Trees can talk to each other through their roots underground.',
  'The ocean makes more than half of the oxygen we breathe.',
  'A single cloud can weigh as much as many elephants.',
  'Bamboo is one of the fastest-growing plants on Earth.',
  'Some seeds can sleep for years before they start growing.',
];

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'Jupiter is so big that more than 1,000 Earths could fit inside it.',
  'Neutron stars are so dense that a spoonful would weigh a mountain on Earth.',
  'Saturn is famous for its beautiful icy rings.',
  'Light from the Sun takes about 8 minutes to reach Earth.',
];

const safariFacts = [
  {
    name: 'Cheetah',
    emoji: '🐆',
    fact: 'The fastest land animal!',
  },
  {
    name: 'Elephant',
    emoji: '🐘',
    fact: 'It uses its trunk like a super tool for drinking and grabbing things.',
  },
  {
    name: 'Giraffe',
    emoji: '🦒',
    fact: 'Its tongue can be dark blue-purple and very long.',
  },
  {
    name: 'Hippo',
    emoji: '🦛',
    fact: 'It can stay underwater for several minutes before popping up again.',
  },
  {
    name: 'Meerkat',
    emoji: '🦦',
    fact: 'It stands tall to keep watch for danger.',
  },
];

export default function MikoGalaxyGardenPage() {
  const navigate = useNavigate();
  const [missionIndex, setMissionIndex] = useState(0);
  const [missionDone, setMissionDone] = useState(false);
  const [animalRiddleIndex, setAnimalRiddleIndex] = useState(0);
  const [showAnimalAnswer, setShowAnimalAnswer] = useState(false);
  const [earthFactIndex, setEarthFactIndex] = useState(0);
  const [spaceFactIndex, setSpaceFactIndex] = useState(0);
  const [safariFactIndex, setSafariFactIndex] = useState(0);

  const currentAnimalRiddle = animalRiddles[animalRiddleIndex];
  const currentSafariFact = safariFacts[safariFactIndex];

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleNextMission = () => {
    setMissionIndex((prev) => nextIndex(prev, ecoMissions.length));
    setMissionDone(false);
  };

  const handleNextAnimalRiddle = () => {
    setAnimalRiddleIndex((prev) => nextIndex(prev, animalRiddles.length));
    setShowAnimalAnswer(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-lime-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-4 py-2 text-sm font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-lime-100 sm:text-3xl">
              MIKO&apos;s Galaxy Garden 🌿🪐
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Nature Explorer Mission 🌿</h2>
            <button
              type="button"
              onClick={handleNextMission}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-3 py-2 text-xs font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-lime-200/30 bg-gradient-to-br from-lime-100 via-emerald-100 to-green-100 p-5 text-slate-900 shadow-none sm:p-6">
            <p className="text-2xl font-black leading-relaxed text-lime-900 sm:text-3xl">
              {ecoMissions[missionIndex]}
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setMissionDone(true)}
                className={`rounded-xl border px-5 py-3 text-sm font-black shadow-none ${
                  missionDone
                    ? 'border-emerald-400 bg-emerald-500 text-white'
                    : 'border-lime-300 bg-white text-lime-900'
                }`}
              >
                Mission Accomplished ✅
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Guess the Animal 🐾</h2>
            <button
              type="button"
              onClick={handleNextAnimalRiddle}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-3 py-2 text-xs font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-green-200/20 bg-slate-800/65 p-5 shadow-none sm:p-6">
            <p className="text-xl font-black leading-relaxed text-lime-100 sm:text-2xl">
              {currentAnimalRiddle.riddle}
            </p>

            {showAnimalAnswer && (
              <div className="mt-4 rounded-xl border border-lime-200/25 bg-lime-500/12 px-4 py-4 text-lime-100">
                <p className="text-5xl">{currentAnimalRiddle.emoji}</p>
                <p className="mt-2 text-lg font-black">{currentAnimalRiddle.answer}</p>
              </div>
            )}

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowAnimalAnswer(true)}
                className="rounded-xl border border-lime-300/25 bg-lime-400/15 px-5 py-3 text-sm font-black text-lime-100 shadow-none hover:bg-lime-400/20"
              >
                Reveal Animal 👁️
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Amazing Earth Facts 🌍</h2>
            <button
              type="button"
              onClick={() => setEarthFactIndex((prev) => nextIndex(prev, earthFacts.length))}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-3 py-2 text-xs font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-lime-200/30 bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 p-5 text-slate-900 shadow-none sm:p-6">
            <p className="text-xl font-black leading-relaxed text-green-900 sm:text-2xl">
              {earthFacts[earthFactIndex]}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Galaxy Secrets 🪐</h2>
            <button
              type="button"
              onClick={() => setSpaceFactIndex((prev) => nextIndex(prev, spaceFacts.length))}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-3 py-2 text-xs font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-gradient-to-br from-slate-950 via-green-950 to-emerald-950 p-5 text-emerald-50 shadow-none sm:p-6">
            <p className="text-xl font-black leading-relaxed text-lime-100 sm:text-2xl">
              {spaceFacts[spaceFactIndex]}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Safari Fact Finder 🦒</h2>
            <button
              type="button"
              onClick={() => setSafariFactIndex((prev) => nextIndex(prev, safariFacts.length))}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-3 py-2 text-xs font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              Next 🔄
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-lime-200/30 bg-gradient-to-br from-lime-100 via-yellow-50 to-green-100 p-5 text-slate-900 shadow-none sm:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-6xl">{currentSafariFact.emoji}</p>
                <p className="mt-3 text-2xl font-black text-green-900">{currentSafariFact.name}</p>
                <p className="mt-2 text-base font-bold leading-relaxed text-lime-900">
                  {currentSafariFact.fact}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
