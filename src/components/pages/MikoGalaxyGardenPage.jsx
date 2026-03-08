import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const nextIndex = (currentIndex, totalItems) => (currentIndex + 1) % totalItems;

const COSMIC_STAGES = [
  { label: 'Seed', emoji: '🌰' },
  { label: 'Sprout', emoji: '🌱' },
  { label: 'Tree', emoji: '🌳' },
];

const ANIMAL_SAFARI_GRID = [
  {
    id: 'elephant',
    emoji: '🐘',
    name: 'Elephant',
    fact: 'Elephants use their trunks like giant multi-tools for drinking, grabbing, and spraying water.',
  },
  {
    id: 'tiger',
    emoji: '🐅',
    name: 'Tiger',
    fact: 'Every tiger has a unique stripe pattern, just like a fingerprint.',
  },
  {
    id: 'monkey',
    emoji: '🐒',
    name: 'Monkey',
    fact: 'Many monkeys use their tails to help balance while swinging and climbing.',
  },
  {
    id: 'zebra',
    emoji: '🦓',
    name: 'Zebra',
    fact: 'Zebra stripes help each zebra recognize others in the herd.',
  },
  {
    id: 'giraffe',
    emoji: '🦒',
    name: 'Giraffe',
    fact: 'A giraffe can use its long neck to reach leaves high up in the trees.',
  },
  {
    id: 'panda',
    emoji: '🐼',
    name: 'Panda',
    fact: 'Pandas spend a lot of their day munching on bamboo.',
  },
];

const ecoMissions = [
  'Find a leaf with 3 different colors!',
  'Water a plant today!',
  'Pick up one piece of litter and throw it away safely.',
  'Spend five quiet minutes listening to birds outside.',
  'Collect a fallen leaf and compare its shape to another one.',
];

const animalRiddles = [
  {
    riddle: 'I am green and say ribbit.',
    answer: 'Frog',
    emoji: '🐸',
  },
  {
    riddle: 'I have black and white stripes and love grasslands.',
    answer: 'Zebra',
    emoji: '🦓',
  },
  {
    riddle: 'I am tall, spotty, and love tree leaves.',
    answer: 'Giraffe',
    emoji: '🦒',
  },
  {
    riddle: 'I swing through trees and love bananas.',
    answer: 'Monkey',
    emoji: '🐒',
  },
  {
    riddle: 'I am orange, striped, and a big jungle cat.',
    answer: 'Tiger',
    emoji: '🐅',
  },
];

const earthFacts = [
  'Trees can send signals through underground root networks.',
  'The ocean makes more than half of the oxygen we breathe.',
  'Some seeds can wait for years before the right moment to grow.',
  'Bamboo is one of the fastest-growing plants on Earth.',
  'Rainforests are home to more than half of the world’s plant and animal species.',
];

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'Jupiter is so large that more than 1,000 Earths could fit inside it.',
  'Saturn’s rings are made mostly of ice and rock.',
  'The Sun is a star, and it takes about 8 minutes for its light to reach Earth.',
  'Neutron stars are so dense that a spoonful would weigh a huge mountain on Earth.',
];

const safariFacts = [
  {
    name: 'Cheetah',
    emoji: '🐆',
    fact: 'The fastest land animal!',
  },
  {
    name: 'Rhino',
    emoji: '🦏',
    fact: 'A rhino’s horn is made from the same material as human fingernails.',
  },
  {
    name: 'Hippo',
    emoji: '🦛',
    fact: 'Hippos can stay underwater for several minutes before popping back up.',
  },
  {
    name: 'Gazelle',
    emoji: '🦌',
    fact: 'Gazelles are quick runners with amazing turning speed.',
  },
  {
    name: 'Lion',
    emoji: '🦁',
    fact: 'Lions often rest a lot during the day to save energy for big action later.',
  },
];

export default function MikoGalaxyGardenPage() {
  const navigate = useNavigate();
  const [growthStage, setGrowthStage] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState(ANIMAL_SAFARI_GRID[0].id);
  const [hasBadge, setHasBadge] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const [isMissionDone, setIsMissionDone] = useState(false);
  const [animalRiddleIndex, setAnimalRiddleIndex] = useState(0);
  const [showAnimalAnswer, setShowAnimalAnswer] = useState(false);
  const [earthFactIndex, setEarthFactIndex] = useState(0);
  const [spaceFactIndex, setSpaceFactIndex] = useState(0);
  const [safariFactIndex, setSafariFactIndex] = useState(0);

  const activeSafariAnimal =
    ANIMAL_SAFARI_GRID.find((animal) => animal.id === selectedAnimal) || ANIMAL_SAFARI_GRID[0];
  const currentAnimalRiddle = animalRiddles[animalRiddleIndex];
  const currentSafariFact = safariFacts[safariFactIndex];

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
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
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Cosmic Seed Growth 🌰</h2>
            <button
              type="button"
              onClick={() => setGrowthStage((prev) => nextIndex(prev, COSMIC_STAGES.length))}
              className="rounded-xl border border-lime-300/25 bg-lime-400/12 px-3 py-2 text-xs font-black text-lime-100 shadow-none hover:bg-lime-400/18"
            >
              Grow!
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-lime-200/25 bg-gradient-to-br from-lime-100 via-green-100 to-emerald-100 p-5 text-slate-900">
            <div className="grid grid-cols-3 gap-4">
              {COSMIC_STAGES.map((stage, index) => (
                <div
                  key={stage.label}
                  className={`rounded-2xl border px-4 py-5 text-center ${
                    growthStage === index
                      ? 'border-lime-400 bg-white text-emerald-900 ring-2 ring-lime-300'
                      : 'border-lime-200 bg-white/70 text-lime-900'
                  }`}
                >
                  <p className={`text-5xl ${growthStage === index ? 'text-6xl' : ''}`}>{stage.emoji}</p>
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.14em]">{stage.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-lime-200 sm:text-xl">Animal Safari Grid 🦁</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {ANIMAL_SAFARI_GRID.map((animal) => {
              const isSelected = animal.id === activeSafariAnimal.id;
              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setSelectedAnimal(animal.id)}
                  className={`rounded-2xl border px-4 py-5 text-center ${
                    isSelected
                      ? 'border-lime-300 bg-lime-500/20 text-lime-100'
                      : 'border-lime-200/20 bg-slate-800/65 text-lime-100'
                  }`}
                >
                  <p className="text-5xl">{animal.emoji}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-lime-200/20 bg-slate-800/65 p-5 shadow-none">
            <p className="text-2xl font-black text-lime-100">{activeSafariAnimal.name}</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-200">{activeSafariAnimal.fact}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-lime-200 sm:text-xl">Earth Defender Badge 🛡️</h2>

          <div className="mt-4 rounded-2xl border border-lime-200/20 bg-slate-800/65 p-5 shadow-none">
            {!hasBadge ? (
              <button
                type="button"
                onClick={() => setHasBadge(true)}
                className="rounded-xl border border-lime-300/25 bg-lime-400/15 px-5 py-3 text-base font-black text-lime-100 shadow-none hover:bg-lime-400/20"
              >
                Pledge to Protect the Earth!
              </button>
            ) : (
              <div className="rounded-2xl border border-lime-300 bg-gradient-to-r from-lime-400/25 via-emerald-400/25 to-green-400/25 px-5 py-4 text-lg font-black text-lime-100 ring-2 ring-lime-300/40">
                Official Earth Defender! 🌍💚
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-lime-300/20 bg-slate-900/70 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-lime-200 sm:text-xl">Nature Explorer Mission 🌿</h2>
            <button
              type="button"
              onClick={() => {
                setMissionIndex((prev) => nextIndex(prev, ecoMissions.length));
                setIsMissionDone(false);
              }}
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
                onClick={() => setIsMissionDone(true)}
                className={`rounded-xl border px-5 py-3 text-sm font-black shadow-none ${
                  isMissionDone
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
              onClick={() => {
                setAnimalRiddleIndex((prev) => nextIndex(prev, animalRiddles.length));
                setShowAnimalAnswer(false);
              }}
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
            <p className="text-6xl">{currentSafariFact.emoji}</p>
            <p className="mt-3 text-2xl font-black text-green-900">{currentSafariFact.name}</p>
            <p className="mt-2 text-base font-bold leading-relaxed text-lime-900">
              {currentSafariFact.fact}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
