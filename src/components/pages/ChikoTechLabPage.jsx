import React, { useEffect, useMemo, useState } from 'react';
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
  { id: 'UP', label: 'Up', token: 'UP', icon: '\u2B06\uFE0F' },
  { id: 'LEFT', label: 'Left', token: 'LEFT', icon: '\u2B05\uFE0F' },
  { id: 'DOWN', label: 'Down', token: 'DOWN', icon: '\u2B07\uFE0F' },
  { id: 'RIGHT', label: 'Right', token: 'RIGHT', icon: '\u27A1\uFE0F' },
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

const CELL_SYMBOLS = {
  robot: '\u{1F916}',
  wall: '\u{1F9F1}',
  target: '\u{1F31F}',
};

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

const createMazeLevel = (walls) => ({
  gridSize: 5,
  start: { x: 0, y: 0 },
  target: { x: 4, y: 4 },
  walls,
});

const mazeLevels = [
  createMazeLevel([]),
  createMazeLevel([{ x: 1, y: 1 }]),
  createMazeLevel([{ x: 1, y: 0 }, { x: 1, y: 1 }]),
  createMazeLevel([{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 1 }]),
  createMazeLevel([{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
  ]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
  ]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
  ]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
  ]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
  ]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 4, y: 1 },
  ]),
  createMazeLevel([
    { x: 0, y: 3 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 4, y: 1 },
  ]),
  createMazeLevel([
    { x: 0, y: 3 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 4, y: 1 },
  ]),
  createMazeLevel([
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 4, y: 1 },
  ]),
  createMazeLevel([
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 1, y: 1 },
    { x: 3, y: 2 },
    { x: 0, y: 3 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 0, y: 4 },
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 3, y: 4 },
  ]),
];

const getCellKey = (x, y) => `${x},${y}`;
const isSameCell = (first, second) => first.x === second.x && first.y === second.y;
const getDefaultMazeMessage = (levelNumber) =>
  `Level ${levelNumber} of ${mazeLevels.length}: Build a sequence and reach the star.`;

export default function ChikoTechLabPage() {
  const navigate = useNavigate();
  const [assemblyParts, setAssemblyParts] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [robotPos, setRobotPos] = useState(() => ({ ...mazeLevels[0].start }));
  const [codeSequence, setCodeSequence] = useState([]);
  const [gameState, setGameState] = useState('IDLE');
  const [mazeMessage, setMazeMessage] = useState(getDefaultMazeMessage(1));
  const [executionStep, setExecutionStep] = useState(0);
  const [showHologram, setShowHologram] = useState(false);
  const [robotJokeIndex, setRobotJokeIndex] = useState(0);
  const [showRobotPunchline, setShowRobotPunchline] = useState(false);
  const [techFactIndex, setTechFactIndex] = useState(0);

  const activeLevel = mazeLevels[currentLevel];
  const wallLookup = useMemo(
    () => new Set(activeLevel.walls.map(({ x, y }) => getCellKey(x, y))),
    [activeLevel]
  );
  const mazeCells = useMemo(
    () =>
      Array.from({ length: activeLevel.gridSize * activeLevel.gridSize }, (_, index) => ({
        x: index % activeLevel.gridSize,
        y: Math.floor(index / activeLevel.gridSize),
      })),
    [activeLevel.gridSize]
  );

  useEffect(() => {
    const hologramTimer = window.setTimeout(() => {
      setShowHologram(true);
    }, 10000);

    return () => window.clearTimeout(hologramTimer);
  }, []);

  useEffect(() => {
    setRobotPos({ ...activeLevel.start });
    setCodeSequence([]);
    setGameState('IDLE');
    setMazeMessage(getDefaultMazeMessage(currentLevel + 1));
    setExecutionStep(0);
  }, [activeLevel, currentLevel]);

  useEffect(() => {
    if (gameState !== 'RUNNING') {
      return undefined;
    }

    if (executionStep >= codeSequence.length) {
      if (isSameCell(robotPos, activeLevel.target)) {
        setGameState('SUCCESS');
        setMazeMessage(
          currentLevel === mazeLevels.length - 1
            ? 'Mission complete! You solved all 15 Chiko robot routes.'
            : `Level ${currentLevel + 1} complete! Tap Next Level to keep coding.`
        );
      } else {
        setGameState('IDLE');
        setMazeMessage('Execution finished, but the robot did not reach the star yet.');
      }
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      const nextMove = MOVE_DELTAS[codeSequence[executionStep]];

      if (!nextMove) {
        setGameState('CRASHED');
        setMazeMessage('Crash! That command is not valid for Chiko\'s robot.');
        return;
      }

      const nextPos = {
        x: robotPos.x + nextMove.x,
        y: robotPos.y + nextMove.y,
      };

      const outOfBounds =
        nextPos.x < 0 ||
        nextPos.y < 0 ||
        nextPos.x >= activeLevel.gridSize ||
        nextPos.y >= activeLevel.gridSize;

      if (outOfBounds) {
        setGameState('CRASHED');
        setMazeMessage('Crash! The robot drove outside the maze.');
        return;
      }

      if (wallLookup.has(getCellKey(nextPos.x, nextPos.y))) {
        setGameState('CRASHED');
        setMazeMessage('Crash! A wall blocked the robot.');
        return;
      }

      setRobotPos(nextPos);

      if (isSameCell(nextPos, activeLevel.target)) {
        setGameState('SUCCESS');
        setMazeMessage(
          currentLevel === mazeLevels.length - 1
            ? 'Mission complete! You solved all 15 Chiko robot routes.'
            : `Level ${currentLevel + 1} complete! Tap Next Level to keep coding.`
        );
        return;
      }

      setExecutionStep((step) => step + 1);
    }, 400);

    return () => window.clearTimeout(timerId);
  }, [activeLevel, codeSequence, currentLevel, executionStep, gameState, robotPos, wallLookup]);

  const handleAddPart = (partName) => {
    setAssemblyParts((current) => [...current, partName]);
  };

  const handleAddCodeToken = (token) => {
    if (gameState === 'RUNNING') return;

    if (gameState !== 'IDLE') {
      setRobotPos({ ...activeLevel.start });
      setGameState('IDLE');
      setExecutionStep(0);
      setMazeMessage(getDefaultMazeMessage(currentLevel + 1));
    }

    setCodeSequence((current) => [...current, token]);
  };

  const handleClearCode = () => {
    setCodeSequence([]);
    setRobotPos({ ...activeLevel.start });
    setGameState('IDLE');
    setExecutionStep(0);
    setMazeMessage(getDefaultMazeMessage(currentLevel + 1));
  };

  const handleRunCode = () => {
    if (gameState === 'RUNNING') return;

    if (codeSequence.length === 0) {
      setMazeMessage('Add at least one direction before running the code.');
      return;
    }

    setRobotPos({ ...activeLevel.start });
    setExecutionStep(0);
    setGameState('RUNNING');
    setMazeMessage(`Executing ${codeSequence.length} step${codeSequence.length === 1 ? '' : 's'}...`);
  };

  const handleNextLevel = () => {
    setCurrentLevel((level) => (level + 1) % mazeLevels.length);
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
              CHIKO&apos;s Kool Tech Lab {'\u{1F916}'}
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
          <h2 className="text-lg font-black text-white sm:text-xl">Code the Path</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-900">Live Robot Maze</p>
                  <p className="mt-1 text-sm font-semibold text-teal-700">Program the robot one step at a time.</p>
                </div>
                <div className="rounded-full border border-cyan-300 bg-cyan-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-teal-950">
                  Level {currentLevel + 1} / {mazeLevels.length}
                </div>
              </div>

              <div
                className="mt-4 grid gap-2 rounded-2xl border border-teal-200 bg-gradient-to-br from-cyan-50 via-white to-teal-100 p-3"
                style={{ gridTemplateColumns: `repeat(${activeLevel.gridSize}, minmax(0, 1fr))` }}
              >
                {mazeCells.map((cell) => {
                  const cellKey = getCellKey(cell.x, cell.y);
                  const isWall = wallLookup.has(cellKey);
                  const isTarget = isSameCell(cell, activeLevel.target);
                  const isRobot = isSameCell(cell, robotPos);
                  const isStart = isSameCell(cell, activeLevel.start);

                  return (
                    <div
                      key={cellKey}
                      className={`relative flex aspect-square items-center justify-center rounded-xl border text-xl shadow-sm sm:text-2xl ${
                        isWall
                          ? 'border-teal-800 bg-teal-700 text-teal-50'
                          : isTarget
                            ? 'border-cyan-400 bg-cyan-100 text-cyan-900'
                            : 'border-teal-100 bg-white text-teal-700'
                      }`}
                    >
                      {isWall && CELL_SYMBOLS.wall}
                      {!isWall && isTarget && CELL_SYMBOLS.target}
                      {!isWall && isRobot && (
                        <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl">
                          {CELL_SYMBOLS.robot}
                        </span>
                      )}
                      {!isWall && isTarget && isRobot && (
                        <span className="absolute bottom-1 right-1 text-xs">{CELL_SYMBOLS.target}</span>
                      )}
                      {!isWall && isStart && !isRobot && (
                        <span className="absolute left-1 top-1 text-[10px] font-black uppercase tracking-[0.08em] text-teal-500">
                          S
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-[0.12em] text-teal-900 sm:grid-cols-4">
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">{CELL_SYMBOLS.robot} Robot</div>
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">{CELL_SYMBOLS.wall} Wall</div>
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">{CELL_SYMBOLS.target} Target</div>
                <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-center">S Start</div>
              </div>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-950 shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-900">Direction Controls</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div />
                <button
                  type="button"
                  onClick={() => handleAddCodeToken('UP')}
                  disabled={gameState === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.UP.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.UP.label}</span>
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => handleAddCodeToken('LEFT')}
                  disabled={gameState === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.LEFT.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.LEFT.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCodeToken('DOWN')}
                  disabled={gameState === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.DOWN.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.DOWN.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCodeToken('RIGHT')}
                  disabled={gameState === 'RUNNING'}
                  className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-center text-sm font-black text-teal-950 shadow-none hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ACTION_BY_TOKEN.RIGHT.icon}
                  <span className="mt-1 block">{ACTION_BY_TOKEN.RIGHT.label}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={gameState === 'RUNNING'}
                  className="rounded-xl border border-cyan-400 bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 shadow-none hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  RUN CODE {'\u25B6\uFE0F'}
                </button>
                <button
                  type="button"
                  onClick={handleClearCode}
                  className="rounded-xl border border-teal-700 bg-teal-700 px-3 py-3 text-sm font-black text-white shadow-none hover:bg-teal-800"
                >
                  CLEAR {'\u{1F5D1}\uFE0F'}
                </button>
              </div>

              {gameState === 'SUCCESS' && (
                <button
                  type="button"
                  onClick={handleNextLevel}
                  className="mt-3 w-full rounded-xl border border-cyan-300 bg-white px-3 py-3 text-sm font-black text-teal-950 shadow-none hover:bg-cyan-50"
                >
                  {currentLevel === mazeLevels.length - 1 ? 'Play Again \u21BA' : 'Next Level \u23ED\uFE0F'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-teal-950 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-900">Code Sequence</p>
              <div className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-teal-900">
                {codeSequence.length} Step{codeSequence.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="mt-2 min-h-11 rounded-lg border border-dashed border-teal-300 bg-white p-2">
              {codeSequence.length === 0 ? (
                <p className="text-sm font-semibold text-teal-700">Tap the arrows to build your sequence.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {codeSequence.map((token, index) => {
                    const action = ACTION_BY_TOKEN[token];
                    const isActiveStep = gameState === 'RUNNING' && index === executionStep;

                    return (
                      <span
                        key={`${token}-${index}`}
                        className={`rounded-md border px-2 py-1 text-sm font-black ${
                          isActiveStep
                            ? 'border-cyan-400 bg-cyan-100 text-cyan-950'
                            : 'border-teal-300 bg-teal-100 text-teal-950'
                        }`}
                      >
                        {action?.icon || token} {token}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`mt-3 rounded-xl border px-4 py-3 text-sm font-bold ${
                gameState === 'CRASHED'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : gameState === 'SUCCESS'
                    ? 'border-cyan-300 bg-cyan-50 text-teal-900'
                    : gameState === 'RUNNING'
                      ? 'border-teal-200 bg-teal-100 text-teal-900'
                      : 'border-teal-200 bg-white text-teal-800'
              }`}
            >
              {mazeMessage}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-teal-300/30 bg-teal-900 p-4 shadow-none sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-white sm:text-xl">
              Robot Joke of the Day {'\u{1F916}'}
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
