import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ANIMALS_DATA, {
  SAFARI_MASTER_QUIZ_QUESTIONS,
  sanitizeAnimalRecordForRender,
  validateAnimalRecordForRender,
} from './animalsData';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useParentControls } from '../../context/ParentControlsContext';
import { addUserGems } from '../../utils/gemWallet';
import { supabase } from '../../supabaseClient';

const ANIMAL_POEM_TABLE = 'animal_poems';

const ANIMAL_NAME_TO_ID_MAP = ANIMALS_DATA.reduce((map, animal) => {
  const normalizedName = String(animal?.name || '').trim().toLowerCase();
  const animalId = String(animal?.id || '').trim();
  if (normalizedName && animalId) {
    map.set(normalizedName, animalId);
  }
  return map;
}, new Map());

const readFirstString = (row, keys = [], fallback = '') => {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
};

const readFirstBoolean = (row, keys = [], fallback = false) => {
  for (const key of keys) {
    if (typeof row?.[key] === 'boolean') {
      return row[key];
    }
  }
  return fallback;
};

const getAnimalPoemRowAnimalId = (row) => {
  const directId = readFirstString(row, ['animal_id', 'animalId', 'animal_slug', 'animal_key'], '');
  if (directId) return directId;

  const animalName = readFirstString(row, ['animal_name', 'name', 'title'], '').toLowerCase();
  return ANIMAL_NAME_TO_ID_MAP.get(animalName) || '';
};

const readAnimalPoemText = (row) =>
  readFirstString(row, ['poem', 'poem_text', 'content', 'description', 'body'], '');

const readAnimalPoemCoverImageUrl = (row) =>
  readFirstString(
    row,
    ['poem_cover_image_url', 'cover_image_url', 'cover_url', 'image_url', 'thumbnail_url'],
    ''
  );

const readAnimalPoemShowCoverImage = (row) =>
  readFirstBoolean(
    row,
    ['show_cover_image_for_poem', 'show_poem_cover_image', 'show_cover_image', 'is_cover_image_visible'],
    false
  );

const CATEGORY_NAV = [
  { id: 'All', label: '\uD83C\uDF0D All' },
  { id: 'Wild', label: '\uD83E\uDD81 Wild' },
  { id: 'Farm', label: '\uD83D\uDE9C Farm' },
  { id: 'Pet', label: '\uD83C\uDFE1 Pets' },
  { id: 'Bird', label: '\uD83E\uDD85 Birds' },
  { id: 'Ocean', label: '\uD83C\uDF0A Ocean' },
  { id: 'Bug', label: '\uD83E\uDD8B Bugs' },
];

const QUIZ_SET_SIZE = 10;
const QUIZ_FINAL_PASS_GEMS = 30;
const QUIZ_FINAL_FAIL_GEMS = 5;
const QUIZ_PASS_PERCENTAGE = 80;

const getSetRewardGems = (correctCount) => {
  const safeCorrect = Math.max(0, Math.floor(Number(correctCount) || 0));
  if (safeCorrect >= 10) return 15;
  if (safeCorrect === 9) return 10;
  if (safeCorrect === 8) return 5;
  if (safeCorrect > 0) return 2;
  return 0;
};

const normalizeAnswer = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const isTypedAnswerCorrect = (question, typedValue) => {
  const typedNormalized = normalizeAnswer(typedValue);
  if (!typedNormalized) return false;

  const accepted = [question?.answer, ...(Array.isArray(question?.acceptedAnswers) ? question.acceptedAnswers : [])]
    .map((candidate) => normalizeAnswer(candidate))
    .filter(Boolean);

  return accepted.includes(typedNormalized);
};

const getOptionStateClass = ({ hasAnswered, option, selectedOption, answer }) => {
  if (!hasAnswered) {
    return 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-100';
  }

  if (option === answer) {
    return 'border-emerald-400 bg-emerald-100 text-emerald-900';
  }

  if (option === selectedOption && option !== answer) {
    return 'border-rose-400 bg-rose-100 text-rose-900';
  }

  return 'border-slate-200 bg-slate-100 text-slate-600';
};

const CATEGORY_EMOJI_FALLBACK = {
  Wild: '\u{1F981}',
  Farm: '\u{1F42E}',
  Pet: '\u{1F436}',
  Bird: '\u{1F985}',
  Ocean: '\u{1F42C}',
  Bug: '\u{1F98B}',
};

const SafariModule = ({ onBack, onHome }) => {
  const { user, fetchProfile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { isTestMode } = useParentControls();
  const quizSectionRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});
  const [animalPoemConfigs, setAnimalPoemConfigs] = useState({});

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSetCorrect, setQuizSetCorrect] = useState(0);
  const [quizHasAnswered, setQuizHasAnswered] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState('');
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);
  const [quizTypedAnswer, setQuizTypedAnswer] = useState('');
  const [quizSubmittedAnswer, setQuizSubmittedAnswer] = useState('');
  const [quizInputError, setQuizInputError] = useState('');

  const [quizMilestone, setQuizMilestone] = useState(null);
  const [quizMilestoneOpen, setQuizMilestoneOpen] = useState(false);
  const [quizMilestoneStatus, setQuizMilestoneStatus] = useState('idle');
  const [quizMilestoneMessage, setQuizMilestoneMessage] = useState('');
  const [quizMilestonesAwarded, setQuizMilestonesAwarded] = useState(0);
  const [quizMilestoneGemsAwarded, setQuizMilestoneGemsAwarded] = useState(0);

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizFinalRewardStatus, setQuizFinalRewardStatus] = useState('idle');
  const [quizFinalRewardMessage, setQuizFinalRewardMessage] = useState('');
  const [quizFinalGemsAwarded, setQuizFinalGemsAwarded] = useState(0);

  const milestoneRewardedRef = useRef(new Set());
  const finalRewardClaimedRef = useRef(false);
  const finalRewardAttemptedRef = useRef(false);

  const renderReadyAnimals = useMemo(
    () =>
      ANIMALS_DATA
        .map((animal) => sanitizeAnimalRecordForRender(animal))
        .filter((animal) => {
          const isValid = validateAnimalRecordForRender(animal);
          if (!isValid) {
            console.error('[SafariModule] Animal asset mismatch detected. Card skipped.', animal);
          }
          return isValid;
        }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadAnimalPoemConfigs = async () => {
      let response = await supabase
        .from(ANIMAL_POEM_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (response.error && /created_at/i.test(response.error.message || '')) {
        response = await supabase.from(ANIMAL_POEM_TABLE).select('*');
      }

      if (response.error) {
        console.warn('[SafariModule] Unable to load animal poem configs:', response.error.message);
        return;
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      const nextConfigs = {};

      for (const row of rows) {
        const animalId = getAnimalPoemRowAnimalId(row);
        if (!animalId || nextConfigs[animalId]) continue;
        nextConfigs[animalId] = {
          poem: readAnimalPoemText(row),
          coverImageUrl: readAnimalPoemCoverImageUrl(row),
          showCoverImageForPoem: readAnimalPoemShowCoverImage(row),
        };
      }

      if (isMounted) {
        setAnimalPoemConfigs(nextConfigs);
      }
    };

    void loadAnimalPoemConfigs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAnimals =
    activeCategory === 'All'
      ? renderReadyAnimals
      : renderReadyAnimals.filter((animal) => animal.category === activeCategory);

  const quizQuestion = SAFARI_MASTER_QUIZ_QUESTIONS[quizIndex] || null;
  const quizTotalQuestions = SAFARI_MASTER_QUIZ_QUESTIONS.length;
  const quizProgressCount = quizCompleted
    ? quizTotalQuestions
    : quizMilestoneOpen
      ? Math.min(quizTotalQuestions, quizMilestone?.answeredCount || quizIndex + 1)
      : Math.min(quizTotalQuestions, quizIndex + 1);
  const quizProgressPercent = quizTotalQuestions > 0 ? (quizProgressCount / quizTotalQuestions) * 100 : 0;

  const quizPercent = quizTotalQuestions > 0 ? (quizScore / quizTotalQuestions) * 100 : 0;
  const quizPassed = quizPercent > QUIZ_PASS_PERCENTAGE;
  const quizFinalReward = quizPassed ? QUIZ_FINAL_PASS_GEMS : QUIZ_FINAL_FAIL_GEMS;
  const quizTotalGemsAwarded = quizMilestoneGemsAwarded + quizFinalGemsAwarded;

  const handleCardClick = (animalId) => {
    setFlippedCards((prev) => ({ ...prev, [animalId]: !prev[animalId] }));
  };

  const playSound = (event, animalName, animalSound) => {
    event.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = `The ${animalName} says ${animalSound}`;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.pitch = 1.2;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Oops! Your browser doesn't support our magic voice.");
    }
  };

  const syncProfile = useCallback(async () => {
    if (!user?.id) return;
    await fetchProfile?.(user.id, { retryCount: 1, preferDirect: true });
  }, [fetchProfile, user?.id]);

  const resetQuizQuestionState = useCallback(() => {
    setQuizHasAnswered(false);
    setQuizSelectedOption('');
    setQuizIsCorrect(false);
    setQuizTypedAnswer('');
    setQuizSubmittedAnswer('');
    setQuizInputError('');
  }, []);

  const claimSetReward = useCallback(
    async (setIndex, rewardGems) => {
      if (rewardGems <= 0) {
        setQuizMilestoneStatus('none');
        setQuizMilestoneMessage('No Gems for this set. Keep exploring and try the next set!');
        return;
      }

      if (!user?.id) {
        setQuizMilestoneStatus('auth_required');
        setQuizMilestoneMessage(`Log in to claim +${rewardGems} Gems for this set.`);
        return;
      }

      if (milestoneRewardedRef.current.has(setIndex)) {
        setQuizMilestoneStatus('already');
        setQuizMilestoneMessage(`Set ${setIndex} reward already claimed.`);
        return;
      }

      setQuizMilestoneStatus('claiming');
      setQuizMilestoneMessage('Adding set reward to your Gems...');

      const result = await addUserGems({ userId: user.id, amount: rewardGems });
      if (!result?.ok) {
        setQuizMilestoneStatus('error');
        setQuizMilestoneMessage(result?.message || 'Could not add set reward Gems right now.');
        return;
      }

      milestoneRewardedRef.current.add(setIndex);
      setQuizMilestonesAwarded((prev) => prev + 1);
      setQuizMilestoneGemsAwarded((prev) => prev + rewardGems);
      await syncProfile();

      setQuizMilestoneStatus('claimed');
      setQuizMilestoneMessage(`Set ${setIndex}: +${rewardGems} Gems added.`);
    },
    [syncProfile, user?.id]
  );

  const claimFinalReward = useCallback(async () => {
    if (quizFinalReward <= 0) {
      setQuizFinalRewardStatus('claimed');
      setQuizFinalRewardMessage('Final reward is 0 Gems for this run.');
      return;
    }

    if (!user?.id) {
      setQuizFinalRewardStatus('auth_required');
      setQuizFinalRewardMessage(`Log in to claim final +${quizFinalReward} Gems.`);
      return;
    }

    if (finalRewardClaimedRef.current) {
      setQuizFinalRewardStatus('already');
      setQuizFinalRewardMessage('Final reward already claimed for this run.');
      return;
    }

    setQuizFinalRewardStatus('claiming');
    setQuizFinalRewardMessage('Adding final Safari Master reward...');

    const result = await addUserGems({ userId: user.id, amount: quizFinalReward });
    if (!result?.ok) {
      setQuizFinalRewardStatus('error');
      setQuizFinalRewardMessage(result?.message || 'Could not add final reward Gems right now.');
      return;
    }

    finalRewardClaimedRef.current = true;
    setQuizFinalGemsAwarded(quizFinalReward);
    await syncProfile();

    setQuizFinalRewardStatus('claimed');
    setQuizFinalRewardMessage(
      quizPassed
        ? `Safari Master Passed! +${quizFinalReward} Gems added.`
        : `Safari Master complete. Encouragement +${quizFinalReward} Gems added.`
    );
  }, [quizFinalReward, quizPassed, syncProfile, user?.id]);

  useEffect(() => {
    if (!quizCompleted) return;
    if (finalRewardAttemptedRef.current) return;

    finalRewardAttemptedRef.current = true;
    void claimFinalReward();
  }, [claimFinalReward, quizCompleted]);

  const registerQuizAnswer = (isCorrect, optionValue = '', typedValue = '') => {
    if (!quizQuestion || quizHasAnswered || quizCompleted || quizMilestoneOpen) return;

    setQuizHasAnswered(true);
    setQuizSelectedOption(optionValue);
    setQuizSubmittedAnswer(typedValue);
    setQuizIsCorrect(Boolean(isCorrect));
    setQuizInputError('');

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      setQuizSetCorrect((prev) => prev + 1);
    }
  };

  const handleQuizOptionClick = (option) => {
    if (isTestMode) return;
    registerQuizAnswer(option === quizQuestion?.answer, option, '');
  };

  const handleTypedSubmit = (event) => {
    event.preventDefault();
    if (!isTestMode || quizHasAnswered || !quizQuestion) return;

    const typed = quizTypedAnswer.trim();
    if (!typed) {
      setQuizInputError('Type your answer before submitting.');
      return;
    }

    registerQuizAnswer(isTypedAnswerCorrect(quizQuestion, typed), '', typed);
  };

  const handleNextQuizStep = () => {
    if (!quizHasAnswered || !quizQuestion) return;

    const answeredCount = Math.min(quizTotalQuestions, quizIndex + 1);
    const isLastQuestion = quizIndex >= quizTotalQuestions - 1;
    const reachedSetBoundary = answeredCount > 0 && answeredCount % QUIZ_SET_SIZE === 0;

    if (reachedSetBoundary) {
      const setIndex = Math.ceil(answeredCount / QUIZ_SET_SIZE);
      const rewardGems = getSetRewardGems(quizSetCorrect);

      setQuizMilestone({
        setIndex,
        answeredCount,
        correctInSet: quizSetCorrect,
        rewardGems,
        isFinalSet: isLastQuestion,
      });
      setQuizMilestoneOpen(true);
      setQuizMilestoneStatus('idle');
      setQuizMilestoneMessage('');
      void claimSetReward(setIndex, rewardGems);
      return;
    }

    if (isLastQuestion) {
      setQuizCompleted(true);
      return;
    }

    setQuizIndex((prev) => prev + 1);
    resetQuizQuestionState();
  };

  const handleMilestoneContinue = () => {
    if (!quizMilestone) return;

    setQuizMilestoneOpen(false);

    if (quizMilestone.isFinalSet) {
      setQuizCompleted(true);
      return;
    }

    setQuizIndex((prev) => Math.min(prev + 1, quizTotalQuestions - 1));
    setQuizSetCorrect(0);
    setQuizMilestoneStatus('idle');
    setQuizMilestoneMessage('');
    setQuizMilestone(null);
    resetQuizQuestionState();
  };

  const handleQuizRestart = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSetCorrect(0);
    resetQuizQuestionState();

    setQuizMilestone(null);
    setQuizMilestoneOpen(false);
    setQuizMilestoneStatus('idle');
    setQuizMilestoneMessage('');
    setQuizMilestonesAwarded(0);
    setQuizMilestoneGemsAwarded(0);

    setQuizCompleted(false);
    setQuizFinalRewardStatus('idle');
    setQuizFinalRewardMessage('');
    setQuizFinalGemsAwarded(0);

    milestoneRewardedRef.current = new Set();
    finalRewardAttemptedRef.current = false;
    finalRewardClaimedRef.current = false;
  };

  const handleScrollToQuiz = () => {
    quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getAnimalEmoji = (animal) => {
    const directEmoji = String(animal?.emoji || '').trim();
    if (directEmoji) return directEmoji;
    return CATEGORY_EMOJI_FALLBACK[String(animal?.category || '').trim()] || '\u{1F43E}';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-emerald-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:shadow-md transition"
          >
            {'\u2B05\uFE0F'} Back to Learning Zone
          </button>
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-lime-800 shadow hover:shadow-md hover:bg-lime-200 transition"
          >
            {'\u{1F3E0}'} Back to Home
          </button>
          <button
            type="button"
            onClick={handleScrollToQuiz}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow hover:shadow-md hover:bg-emerald-200 transition"
          >
            {'\u{1F4DD}'} Take Safari Quiz
          </button>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            <span className="text-lg">{'\u{1F50A}'}</span>
            Tap a card to flip, then press the sound button
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
            {'AikoKidzTV \u2022 Learning Zone'}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black drop-shadow-sm flex justify-center items-center gap-3">
            {'\u{1F993}'} Animal Safari {'\u{1F992}'}
          </h1>
          <p className="text-gray-600 font-medium text-lg max-w-3xl mx-auto">
            Tap an animal to flip the card, then tap {'\u{1F50A}'} to hear it!
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredAnimals.length} of {renderReadyAnimals.length} animals
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 mb-8 justify-start lg:justify-center gap-3">
          {CATEGORY_NAV.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-extrabold text-base transition-all shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white scale-105 shadow-md'
                  : 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredAnimals.map((animal) => {
            const isFlipped = !!flippedCards[animal.id];
            return (
              <div
                key={animal.id}
                className="relative w-full h-80 sm:h-72 cursor-pointer group"
                style={{ perspective: '1200px' }}
                onClick={() => handleCardClick(animal.id)}
              >
                <div
                  className="w-full h-full transition-transform duration-700 transform-gpu rounded-3xl shadow-sm hover:shadow-xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center p-6 rounded-3xl border-4 border-white ${animal.bg}`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-8xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_10px_10px_rgba(15,23,42,0.28)]">
                      {getAnimalEmoji(animal)}
                    </span>
                    <h3 className={`text-3xl font-extrabold ${animal.text}`}>{animal.name}</h3>
                    <span className="mt-4 text-xs font-bold uppercase tracking-wider bg-white/60 px-4 py-2 rounded-full text-gray-600">
                      Tap to learn
                    </span>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-3xl border-4 border-white bg-white"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-center w-full h-full flex flex-col justify-between">
                      <div className="overflow-y-auto pr-1">
                        <h3 className={`text-2xl font-extrabold ${animal.text} mb-1 flex items-center justify-center gap-2`}>
                          {animal.name}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                          {animal.category}
                        </p>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          "{animal.bio}"
                        </p>

                      </div>

                      <button
                        onClick={(event) => playSound(event, animal.name, animal.sound)}
                        className={`mt-3 py-3 px-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-2 w-full transition-transform hover:scale-105 active:scale-95 shadow-sm border-2 border-white ${animal.bg} ${animal.text}`}
                      >
                        {'\u{1F50A}'} Hear Sound!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safari Master Quiz */}
        <section id="safari-master-quiz" ref={quizSectionRef} className="mt-12 rounded-3xl border border-emerald-200 bg-white/90 p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-black text-emerald-900">
              {'\u{1F9ED}'} Safari Master Quiz (100 Questions)
            </div>
            <p className="text-sm font-black text-slate-900">
              {quizCompleted
                ? 'Quiz Completed'
                : quizMilestoneOpen
                  ? `Set ${quizMilestone?.setIndex || 1}/10`
                  : `Question ${quizProgressCount}/${quizTotalQuestions}`}
            </p>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">
              Rewards (per 10): 10/10 = 15 Gems, 9/10 = 10 Gems, 8/10 = 5 Gems, 1-7 = 2 Gems, 0 = 0 Gems.
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-700">
              Final result: Pass above 80% = {QUIZ_FINAL_PASS_GEMS} Gems, otherwise = {QUIZ_FINAL_FAIL_GEMS} Gems. Test Mode is {isTestMode ? 'ON (Type answer)' : 'OFF (4 options)'}.
            </p>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${quizProgressPercent}%` }}
            />
          </div>

          {!quizCompleted && !quizMilestoneOpen && quizQuestion ? (
            <div className="mt-6">
              <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-sm">
                <p className="text-lg font-black leading-relaxed text-slate-900 sm:text-xl">{quizQuestion.question}</p>
              </div>

              {!isTestMode ? (
                <div className="mt-5 grid gap-3">
                  {quizQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleQuizOptionClick(option)}
                      disabled={quizHasAnswered}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition sm:text-base ${getOptionStateClass({
                        hasAnswered: quizHasAnswered,
                        option,
                        selectedOption: quizSelectedOption,
                        answer: quizQuestion.answer,
                      })}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleTypedSubmit} className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={quizTypedAnswer}
                    onChange={(event) => {
                      setQuizTypedAnswer(event.target.value);
                      setQuizInputError('');
                    }}
                    disabled={quizHasAnswered}
                    placeholder="Type your answer"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none focus:border-slate-500"
                  />
                  {quizInputError ? <p className="text-xs font-bold text-rose-700">{quizInputError}</p> : null}
                  <button
                    type="submit"
                    disabled={quizHasAnswered}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                  >
                    Submit Answer
                  </button>
                </form>
              )}

              {quizHasAnswered ? (
                <div className="mt-5 space-y-4">
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm font-black sm:text-base ${
                      quizIsCorrect
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                        : 'border-rose-300 bg-rose-100 text-rose-900'
                    }`}
                  >
                    {quizIsCorrect
                      ? 'Correct!'
                      : `Incorrect. ${isTestMode ? `Your answer: ${quizSubmittedAnswer || '-'} | ` : ''}Correct answer: ${quizQuestion.answer}`}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuizStep}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 sm:text-base"
                  >
                    {quizIndex === quizTotalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {quizMilestoneOpen && quizMilestone ? (
            <div className="mt-6 space-y-4">
              <div
                className={`rounded-2xl border px-5 py-4 ${
                  quizMilestone.correctInSet >= QUIZ_SET_SIZE
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                    : 'border-amber-300 bg-amber-100 text-amber-950'
                }`}
              >
                <p className="text-lg font-black sm:text-xl">Set {quizMilestone.setIndex}/10</p>
                <p className="mt-1 text-sm font-bold sm:text-base">
                  Score in this set: {quizMilestone.correctInSet}/{QUIZ_SET_SIZE}
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">Reward for this set: +{quizMilestone.rewardGems} Gems</p>
              </div>

              <div className="rounded-2xl border border-teal-300 bg-teal-100 px-5 py-4">
                <p className="text-sm font-black text-teal-950 sm:text-base">
                  {quizMilestoneMessage || 'Processing set reward...'}
                </p>

                {!user?.id ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal?.('login')}
                    className="mt-3 rounded-xl bg-teal-700 px-4 py-2 text-sm font-black text-white hover:bg-teal-800"
                  >
                    Login to Claim Reward
                  </button>
                ) : null}

                {user?.id && (quizMilestoneStatus === 'error' || quizMilestoneStatus === 'auth_required') ? (
                  <button
                    type="button"
                    onClick={() => void claimSetReward(quizMilestone.setIndex, quizMilestone.rewardGems)}
                    className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                  >
                    Retry Set Reward
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleMilestoneContinue}
                disabled={quizMilestoneStatus === 'claiming'}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
              >
                {quizMilestone.isFinalSet ? 'View Final Result' : 'Continue to Next Set'}
              </button>
            </div>
          ) : null}

          {quizCompleted ? (
            <div className="mt-6 space-y-4">
              <div
                className={`rounded-2xl border px-5 py-4 ${
                  quizPassed ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                <p className="text-lg font-black sm:text-xl">
                  Score: {quizScore}/{quizTotalQuestions} ({quizPercent.toFixed(1)}%)
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">
                  {quizPassed
                    ? `Pass: above ${QUIZ_PASS_PERCENTAGE}% | Final Reward +${QUIZ_FINAL_PASS_GEMS} Gems.`
                    : `Try again: ${QUIZ_PASS_PERCENTAGE}% or below | Encouragement Reward +${QUIZ_FINAL_FAIL_GEMS} Gems.`}
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">
                  Set Rewards Earned: {quizMilestonesAwarded}/10 | Set Gems: +{quizMilestoneGemsAwarded}
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">Total Gems Earned This Run: +{quizTotalGemsAwarded}</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="text-sm font-black text-amber-900 sm:text-base">
                  Final Reward Status: {quizFinalRewardMessage || 'Ready to process final reward.'}
                </p>

                {!user?.id ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal?.('login')}
                    className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-white hover:bg-amber-600"
                  >
                    Login to Claim Final Reward
                  </button>
                ) : null}

                {user?.id && (quizFinalRewardStatus === 'error' || quizFinalRewardStatus === 'auth_required') ? (
                  <button
                    type="button"
                    onClick={() => void claimFinalReward()}
                    className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                  >
                    Retry Final Reward
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleQuizRestart}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 hover:bg-slate-50 sm:text-base"
              >
                Restart Safari Master Quiz
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default SafariModule;


