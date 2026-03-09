import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROBOT_PARTS = [
  'Rocket Boots',
  'Laser Eyes',
  'Spring Arms',
  'Turbo Core',
  'Holo Shield',
  'Magnet Wheels',
];

const CODE_ACTIONS = [
  { token: 'UP', label: 'Up', icon: '\u2B06\uFE0F' },
  { token: 'LEFT', label: 'Left', icon: '\u2B05\uFE0F' },
  { token: 'DOWN', label: 'Down', icon: '\u2B07\uFE0F' },
  { token: 'RIGHT', label: 'Right', icon: '\u27A1\uFE0F' },
];

const ACTION_BY_TOKEN = Object.fromEntries(
  CODE_ACTIONS.map((action) => [action.token, action])
);

const MOVE_DELTAS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const GRID_SIZE = 5;
const ROBOT_SYMBOL = '\u{1F916}';
const WALL_SYMBOL = '\u{1F9F1}';
const TARGET_SYMBOL = '\u{1F31F}';

const MAZE_LEVELS = [
  { level: 1, start: { x: 0, y: 0 }, target: { x: 4, y: 0 }, walls: [] },
  { level: 2, start: { x: 0, y: 0 }, target: { x: 4, y: 4 }, walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }] },
  { level: 3, start: { x: 0, y: 4 }, target: { x: 4, y: 0 }, walls: [{ x: 1, y: 4 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 0 }] },
  { level: 4, start: { x: 0, y: 0 }, target: { x: 4, y: 4 }, walls: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 2 }] },
  { level: 5, start: { x: 0, y: 2 }, target: { x: 4, y: 2 }, walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 3 }] },
  { level: 6, start: { x: 4, y: 0 }, target: { x: 0, y: 4 }, walls: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 3 }] },
  { level: 7, start: { x: 0, y: 4 }, target: { x: 4, y: 4 }, walls: [{ x: 1, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }] },
  { level: 8, start: { x: 0, y: 0 }, target: { x: 0, y: 4 }, walls: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }] },
  { level: 9, start: { x: 2, y: 0 }, target: { x: 2, y: 4 }, walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }] },
  { level: 10, start: { x: 4, y: 4 }, target: { x: 0, y: 0 }, walls: [{ x: 3, y: 4 }, { x: 3, y: 3 }, { x: 1, y: 1 }, { x: 1, y: 0 }] },
  { level: 11, start: { x: 0, y: 1 }, target: { x: 4, y: 3 }, walls: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }] },
  { level: 12, start: { x: 4, y: 1 }, target: { x: 0, y: 3 }, walls: [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }] },
  { level: 13, start: { x: 0, y: 0 }, target: { x: 4, y: 4 }, walls: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 3 }] },
  { level: 14, start: { x: 4, y: 0 }, target: { x: 0, y: 4 }, walls: [{ x: 4, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }, { x: 0, y: 3 }] },
  { level: 15, start: { x: 2, y: 4 }, target: { x: 4, y: 0 }, walls: [{ x: 1, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }] },
];

const ROBOT_JOKES = [
  {
    setup: 'Why did the robot go to the doctor?',
    punchline: 'Because it had a virus!',
  },
  {
    setup: 'Why was the robot tired after school?',
    punchline: 'It had too many bytes of homework!',
  },
  {
    setup: 'Why did the robot bring a ladder to the lab?',
    punchline: 'To reach the high-tech shelf!',
  },
  {
    setup: 'Why did the robot wear sunglasses?',
    punchline: 'Its future was too bright!',
  },
  {
    setup: 'Why did the tiny robot join the band?',
    punchline: 'Because it had great micro-beats!',
  },
];

const TECH_FACTS = [
  'The first computer mouse was made of wood!',
  'The first webcam was used to watch a coffee pot.',
  'Some robots can help explore dangerous places where humans cannot go safely.',
  'The word "robot" comes from a word that means forced work.',
  'Many early computers were so large they filled entire rooms.',
];

const isSameCell = (first, second) => first.x === second.x && first.y === second.y;
const getLevelPrompt = (levelNumber) =>
  `Level ${levelNumber} of ${MAZE_LEVELS.length}: build a sequence and guide the robot to the star.`;

export default function ChikoTechLabPage() {
  const navigate = useNavigate();
  const runTimeoutRef = useRef(null);

  const [assemblyParts, setAssemblyParts] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [robotPos, setRobotPos] = useState({ ...MAZE_LEVELS[0].start });
  const [codeSequence, setCodeSequence] = useState([]);
  const [status, setStatus] = useState('IDLE');
  const [statusMessage, setStatusMessage] = useState(getLevelPrompt(1));
  const [activeCommandIndex, setActiveCommandIndex] = useState(-1);
  const [showHologram, setShowHologram] = useState(false);
  const [robotJokeIndex, setRobotJokeIndex] = useState(0);
  const [showRobotPunchline, setShowRobotPunchline] = useState(false);
  const [techFactIndex, setTechFactIndex] = useState(0);

  const activeLevel = MAZE_LEVELS[currentLevel];

  useEffect(() => {
    const hologramTimer = window.setTimeout(() => {
      setShowHologram(true);
    }, 10000);

    return () => window.clearTimeout(hologramTimer);
  }, []);

  useEffect(() => {
    if (runTimeoutRef.current) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }

    setRobotPos({ ...activeLevel.start });
    setCodeSequence([]);
    setStatus('IDLE');
    setStatusMessage(getLevelPrompt(activeLevel.level));
    setActiveCommandIndex(-1);
  }, [activeLevel]);

  useEffect(() => () => {
    if (runTimeoutRef.current) {
      window.clearTimeout(runTimeoutRef.current);
    }
  }, []);

  const handleAddPart = (partName) => {
    setAssemblyParts((current) => [...current, partName]);
  };

  const handleClearCode = () => {
    if (runTimeoutRef.current) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }

    setCodeSequence([]);
    setRobotPos({ ...MAZE_LEVELS[currentLevel].start });
    setStatus('IDLE');
    setStatusMessage(getLevelPrompt(MAZE_LEVELS[currentLevel].level));
    setActiveCommandIndex(-1);
  };

  const handleStartCode = () => {
    if (status === 'RUNNING') return;

    if (codeSequence.length === 0) {
      setStatus('IDLE');
      setStatusMessage('Add some directions before you run the code.');
      return;
    }

    if (runTimeoutRef.current) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }

    const level = MAZE_LEVELS[currentLevel];
    const commands = [...codeSequence];

    setRobotPos({ ...level.start });
    setStatus('RUNNING');
    setStatusMessage(`Running ${commands.length} command${commands.length === 1 ? '' : 's'}...`);
    setActiveCommandIndex(-1);

    const executeStep = (stepIndex, currentPosition) => {
      if (stepIndex >= commands.length) {
        runTimeoutRef.current = null;
        setActiveCommandIndex(-1);

        if (isSameCell(currentPosition, level.target)) {
          setStatus('SUCCESS');
          setStatusMessage(`Level ${level.level} complete! Great job, coder.`);
        } else {
          setStatus('IDLE');
          setStatusMessage('Code finished, but the robot did not reach the star yet.');
        }
        return;
      }

      setActiveCommandIndex(stepIndex);

      runTimeoutRef.current = window.setTimeout(() => {
        const move = MOVE_DELTAS[commands[stepIndex]];

        if (!move) {
          runTimeoutRef.current = null;
          setStatus('CRASHED');
          setStatusMessage('Crash! The robot found a broken command.');
          return;
        }

        const nextPosition = {
          x: currentPosition.x + move.x,
          y: currentPosition.y + move.y,
        };

        const isOutOfBounds =
          nextPosition.x < 0 ||
          nextPosition.x > GRID_SIZE - 1 ||
          nextPosition.y < 0 ||
          nextPosition.y > GRID_SIZE - 1;

        if (isOutOfBounds) {
          runTimeoutRef.current = null;
          setStatus('CRASHED');
          setStatusMessage('Crash! The robot drove outside the maze.');
          return;
        }

        const hitWall = level.walls.some(
          (wall) => wall.x === nextPosition.x && wall.y === nextPosition.y
        );

        if (hitWall) {
          runTimeoutRef.current = null;
          setStatus('CRASHED');
          setStatusMessage('Crash! The robot bumped into a wall.');
          return;
        }

        setRobotPos(nextPosition);
        executeStep(stepIndex + 1, nextPosition);
      }, 500);
    };

    executeStep(0, { ...level.start });
  };

  const handleNextLevel = () => {
    const nextLevel = currentLevel === MAZE_LEVELS.length - 1 ? 0 : currentLevel + 1;
    setCurrentLevel(nextLevel);
  };

  const handleBackToLearningZone = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('learning-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <div className="character-page-button-fix min-h-screen bg-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-teal-300/20 bg-slate-900/75 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleBackToLearningZone}
              className="rounded-xl border border-teal-300/25 bg-teal-500/12 px-4 py-2 text-sm font-black text-teal-100 shadow-none hover:bg-teal-500/18"
            >
              {'\u2190'} Back to Home
            </button>
            <h1 className="text-2xl font-black tracking-tight text-cyan-200 sm:text-3xl">
              CHIKO&apos;s Kool Tech Lab {ROBOT_SYMBOL}
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-teal-300/30 bg-teal-900 p-4 shadow-none sm:p-6">
          <h2 className="text-lg font-black text-white sm:text-xl">The Kool Bot-Builder</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-900">Parts Bay</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ROBOT_PARTS.map((part) => (
                  <button
                    key={part}
                    type="button"
                    onClick={() => handleAddPart(part)}
                    className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-left text-sm font-bold text-teal-950 shadow-none hover:bg-teal-100"
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-900">Assembly Area</p>
              <div className="mt-3 min-h-[140px] rounded-lg border border-dashed border-teal-300 bg-white p-3">
                {assemblyParts.length === 0 ? (
                  <p className="text-sm font-semibold text-teal-700">Click parts from the left to assemble your bot.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assemblyParts.map((part, index) => (
                      <span
                        key={`${part}-${index}`}
                        className="rounded-full border border-teal-300 bg-teal-100 px-3 py-1 text-xs font-black text-teal-950"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setAssemblyParts([])}
                  className="rounded-lg border border-teal-700 bg-teal-700 px-2.5 py-1 text-xs font-bold text-white shadow-none hover:bg-teal-800"
                >
                  Clear Bot
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-teal-300/30 bg-teal-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white sm:text-xl">Code the Path</h2>
              <p className="text-sm font-semibold text-cyan-100">Sequence the commands and watch the robot execute them.</p>
            </div>
            <div className="inline-flex items-center rounded-full border border-cyan-300/60 bg-cyan-200/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
              Level {activeLevel.level} / {MAZE_LEVELS.length}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
              <div className="grid grid-cols-5 gap-2 rounded-2xl border border-teal-200 bg-gradient-to-br from-cyan-50 via-white to-teal-100 p-3">
                {Array.from({ length: GRID_SIZE }, (_, rowIndex) =>
                  Array.from({ length: GRID_SIZE }, (_, colIndex) => {
                    const isWall = MAZE_LEVELS[currentLevel].walls.some(
                      (w) => w.x === colIndex && w.y === rowIndex
                    );
                    const isTarget =
                      colIndex === activeLevel.target.x && rowIndex === activeLevel.target.y;
                    const isRobot = colIndex === robotPos.x && rowIndex === robotPos.y;
                    const isStart =
                      colIndex === activeLevel.start.x && rowIndex === activeLevel.start.y;

                    return (
                      <div
                        key={`${colIndex}-${rowIndex}`}
                        className={`relative flex aspect-square items-center justify-center rounded-xl border text-2xl shadow-sm ${
                          isWall
                            ? 'border-teal-800 bg-teal-700 text-white'
                            : isTarget
                              ? 'border-cyan-400 bg-cyan-100 text-cyan-950'
                              : 'border-teal-100 bg-white text-teal-700'
                        }`}
                      >
                        {isWall && WALL_SYMBOL}
                        {!isWall && isTarget && TARGET_SYMBOL}
                        {!isWall && isRobot && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            {ROBOT_SYMBOL}
                          </span>
                        )}
                        {!isWall && isStart && !isRobot && (
                          <span className="absolute left-1 top-1 text-[10px] font-black uppercase tracking-[0.08em] text-teal-500">
                            S
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-[0.12em] text-teal-900 sm:grid-cols-4">
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">{ROBOT_SYMBOL} Robot</div>
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">{WALL_SYMBOL} Wall</div>
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">{TARGET_SYMBOL} Target</div>
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">S Start</div>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
              <div className="rounded-2xl border border-teal-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-900">Code Sequence</p>
                  <div className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-teal-900">
                    {codeSequence.length} Step{codeSequence.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="mt-3 min-h-[92px] rounded-xl border border-dashed border-teal-300 bg-teal-50 p-3">
                  {codeSequence.length === 0 ? (
                    <p className="text-sm font-semibold text-teal-700">Tap the direction buttons to build your code.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {codeSequence.map((command, index) => (
                        <span
                          key={`${command}-${index}`}
                          className={`rounded-md border px-3 py-2 text-sm font-black ${
                            activeCommandIndex === index
                              ? 'border-cyan-400 bg-cyan-100 text-cyan-950'
                              : 'border-teal-300 bg-teal-100 text-teal-950'
                          }`}
                        >
                          {ACTION_BY_TOKEN[command]?.icon}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-teal-900">Direction Controls</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div />
                <button
                  type="button"
                  onClick={() => {
                    if (status === 'RUNNING') return;
                    if (status === 'CRASHED' || status === 'SUCCESS') {
                      setRobotPos({ ...MAZE_LEVELS[currentLevel].start });
                      setStatus('IDLE');
                      setStatusMessage(getLevelPrompt(MAZE_LEVELS[currentLevel].level));
                      setActiveCommandIndex(-1);
                    }
                    setCodeSequence((prev) => [...prev, 'UP']);
                  }}
                  disabled={status === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.UP.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.UP.label}</span>
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => {
                    if (status === 'RUNNING') return;
                    if (status === 'CRASHED' || status === 'SUCCESS') {
                      setRobotPos({ ...MAZE_LEVELS[currentLevel].start });
                      setStatus('IDLE');
                      setStatusMessage(getLevelPrompt(MAZE_LEVELS[currentLevel].level));
                      setActiveCommandIndex(-1);
                    }
                    setCodeSequence((prev) => [...prev, 'LEFT']);
                  }}
                  disabled={status === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.LEFT.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.LEFT.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (status === 'RUNNING') return;
                    if (status === 'CRASHED' || status === 'SUCCESS') {
                      setRobotPos({ ...MAZE_LEVELS[currentLevel].start });
                      setStatus('IDLE');
                      setStatusMessage(getLevelPrompt(MAZE_LEVELS[currentLevel].level));
                      setActiveCommandIndex(-1);
                    }
                    setCodeSequence((prev) => [...prev, 'DOWN']);
                  }}
                  disabled={status === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.DOWN.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.DOWN.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (status === 'RUNNING') return;
                    if (status === 'CRASHED' || status === 'SUCCESS') {
                      setRobotPos({ ...MAZE_LEVELS[currentLevel].start });
                      setStatus('IDLE');
                      setStatusMessage(getLevelPrompt(MAZE_LEVELS[currentLevel].level));
                      setActiveCommandIndex(-1);
                    }
                    setCodeSequence((prev) => [...prev, 'RIGHT']);
                  }}
                  disabled={status === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.RIGHT.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.RIGHT.label}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleStartCode}
                  disabled={status === 'RUNNING'}
                  className="rounded-xl border border-cyan-400 bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 shadow-none hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  START {'\u25B6\uFE0F'}
                </button>
                <button
                  type="button"
                  onClick={handleClearCode}
                  className="rounded-xl border border-teal-700 bg-teal-700 px-3 py-3 text-sm font-black text-white shadow-none hover:bg-teal-800"
                >
                  CLEAR {'\u{1F5D1}\uFE0F'}
                </button>
              </div>

              {status === 'SUCCESS' && (
                <button
                  type="button"
                  onClick={handleNextLevel}
                  className="mt-4 w-full rounded-2xl border border-cyan-300 bg-gradient-to-r from-cyan-200 to-teal-200 px-4 py-4 text-base font-black text-slate-950 shadow-none hover:brightness-105"
                >
                  {currentLevel === MAZE_LEVELS.length - 1 ? 'Play Again \u21BA' : 'Next Level \u23ED\uFE0F'}
                </button>
              )}

              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
                  status === 'CRASHED'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : status === 'SUCCESS'
                      ? 'border-cyan-300 bg-cyan-50 text-teal-900'
                      : status === 'RUNNING'
                        ? 'border-teal-200 bg-teal-100 text-teal-900'
                        : 'border-teal-200 bg-white text-teal-800'
                }`}
              >
                {statusMessage}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-teal-300/30 bg-teal-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">
              Robot Joke of the Day {ROBOT_SYMBOL}
            </h2>
            <button
              type="button"
              onClick={() => {
                setRobotJokeIndex((prev) => (prev + 1) % ROBOT_JOKES.length);
                setShowRobotPunchline(false);
              }}
              className="rounded-xl border border-teal-300/25 bg-teal-500/12 px-3 py-2 text-xs font-black text-teal-100 shadow-none hover:bg-teal-500/18"
            >
              Next {'\u21BB'}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
            <p className="text-xl font-black leading-relaxed text-teal-950 sm:text-2xl">
              {ROBOT_JOKES[robotJokeIndex].setup}
            </p>

            {showRobotPunchline && (
              <p className="mt-4 rounded-lg border border-teal-200 bg-teal-100 px-4 py-3 text-sm font-black text-teal-950">
                {ROBOT_JOKES[robotJokeIndex].punchline}
              </p>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowRobotPunchline(true)}
                className="rounded-xl border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-black text-white shadow-none hover:bg-teal-800"
              >
                Tell me!
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-teal-300/30 bg-teal-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">
              Tech Fact Finder {'\u{1F4A1}'}
            </h2>
            <button
              type="button"
              onClick={() => setTechFactIndex((prev) => (prev + 1) % TECH_FACTS.length)}
              className="rounded-xl border border-teal-300/25 bg-teal-500/12 px-3 py-2 text-xs font-black text-teal-100 shadow-none hover:bg-teal-500/18"
            >
              Next {'\u21BB'}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
            <div className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-5">
              <p className="text-lg font-black leading-relaxed text-teal-950 sm:text-xl">
                {TECH_FACTS[techFactIndex]}
              </p>
            </div>
          </div>
        </section>
      </div>

      {showHologram && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-sm rounded-xl border border-teal-300/20 bg-slate-900/90 p-3 shadow-none sm:bottom-6 sm:right-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-cyan-100">
              Incoming Hologram from MIKO {'\u{1F33F}'}: Trees are cooler than robots!
            </p>
            <button
              type="button"
              onClick={() => setShowHologram(false)}
              className="rounded-md border border-teal-300/25 bg-teal-500/12 px-2 py-1 text-xs font-black text-teal-100 shadow-none hover:bg-teal-500/18"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
