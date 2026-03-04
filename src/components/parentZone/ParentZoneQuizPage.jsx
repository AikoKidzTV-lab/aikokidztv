import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useParentControls } from '../../context/ParentControlsContext';
import { addUserGems } from '../../utils/gemWallet';

const DEFAULT_MILESTONE_SIZE = 10;
const DEFAULT_PASS_THRESHOLD = 80;
const DEFAULT_FINAL_PASS_REWARD_GEMS = 30;
const DEFAULT_FINAL_FAIL_REWARD_GEMS = 5;

const DEFAULT_MILESTONE_REWARD_CONFIG = {
  perfect: 15,
  oneMiss: 10,
  twoMiss: 5,
  partial: 2,
  zero: 0,
};

const THEME_BY_VARIANT = {
  law: {
    cardBorder: 'border-violet-200',
    cardBg: 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-indigo-50',
    badge: 'border-violet-200 bg-violet-100 text-violet-900',
    progressTrack: 'bg-violet-100',
    progressFill: 'from-violet-500 to-fuchsia-500',
    nextButton: 'bg-violet-600 hover:bg-violet-700',
    resultPass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    resultFail: 'border-rose-200 bg-rose-50 text-rose-900',
  },
  science: {
    cardBorder: 'border-cyan-200',
    cardBg: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-emerald-50',
    badge: 'border-cyan-200 bg-cyan-100 text-cyan-900',
    progressTrack: 'bg-cyan-100',
    progressFill: 'from-cyan-500 to-emerald-500',
    nextButton: 'bg-cyan-600 hover:bg-cyan-700',
    resultPass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    resultFail: 'border-rose-200 bg-rose-50 text-rose-900',
  },
  numbers: {
    cardBorder: 'border-amber-200',
    cardBg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    badge: 'border-amber-200 bg-amber-100 text-amber-900',
    progressTrack: 'bg-amber-100',
    progressFill: 'from-amber-500 to-orange-500',
    nextButton: 'bg-amber-600 hover:bg-amber-700',
    resultPass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    resultFail: 'border-rose-200 bg-rose-50 text-rose-900',
  },
  tables: {
    cardBorder: 'border-indigo-200',
    cardBg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50',
    badge: 'border-indigo-200 bg-indigo-100 text-indigo-900',
    progressTrack: 'bg-indigo-100',
    progressFill: 'from-indigo-500 to-blue-500',
    nextButton: 'bg-indigo-600 hover:bg-indigo-700',
    resultPass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    resultFail: 'border-rose-200 bg-rose-50 text-rose-900',
  },
};

const getOptionClasses = ({ hasAnswered, option, selectedOption, correctOption }) => {
  if (!hasAnswered) {
    return 'border-slate-300 bg-white text-slate-950 hover:border-slate-400 hover:bg-slate-100';
  }

  if (option === correctOption) {
    return 'border-emerald-400 bg-emerald-100 text-emerald-900';
  }

  if (option === selectedOption && option !== correctOption) {
    return 'border-rose-400 bg-rose-100 text-rose-900';
  }

  return 'border-slate-200 bg-slate-100 text-slate-600';
};

const normalizeAnswer = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\u00b0/g, '')
    .replace(/[^a-z0-9]/g, '');

const stripLeadingArticle = (value) => String(value || '').trim().replace(/^(a|an|the)\s+/i, '');

const buildAcceptedAnswers = (question = null) => {
  const unique = new Set();
  const pushCandidate = (value) => {
    const text = String(value || '').trim();
    if (!text) return;
    unique.add(text);

    if (text.includes('/')) {
      text
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => unique.add(part));
    }

    if (/\sor\s/i.test(text)) {
      text
        .split(/\sor\s/i)
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => unique.add(part));
    }

    if (text.includes(':')) {
      const afterColon = text.split(':').slice(1).join(':').trim();
      if (afterColon) {
        unique.add(afterColon);
      }
    }

    const withoutArticle = stripLeadingArticle(text);
    if (withoutArticle && withoutArticle !== text) {
      unique.add(withoutArticle);
    }
  };

  pushCandidate(question?.answer);
  if (Array.isArray(question?.acceptedAnswers)) {
    question.acceptedAnswers.forEach(pushCandidate);
  }

  return [...unique];
};

const isTypedAnswerCorrect = (question, typedValue) => {
  const typedNormalized = normalizeAnswer(typedValue);
  if (!typedNormalized) return false;

  const accepted = buildAcceptedAnswers(question);
  return accepted.some((candidate) => normalizeAnswer(candidate) === typedNormalized);
};

const getMilestoneRewardGems = (
  correctCount,
  targetCount,
  rewardConfig = DEFAULT_MILESTONE_REWARD_CONFIG
) => {
  const safeCorrect = Math.max(0, Math.floor(Number(correctCount) || 0));
  const safeTarget = Math.max(1, Math.floor(Number(targetCount) || DEFAULT_MILESTONE_SIZE));

  if (safeCorrect >= safeTarget) return rewardConfig.perfect;
  if (safeCorrect === safeTarget - 1) return rewardConfig.oneMiss;
  if (safeCorrect === safeTarget - 2) return rewardConfig.twoMiss;
  if (safeCorrect > 0) return rewardConfig.partial;
  return rewardConfig.zero;
};

export default function ParentZoneQuizPage({
  title,
  description,
  quizEmoji = 'Quiz',
  variant = 'law',
  questions = [],
  milestoneSize = DEFAULT_MILESTONE_SIZE,
  passThreshold = DEFAULT_PASS_THRESHOLD,
  finalPassRewardGems = DEFAULT_FINAL_PASS_REWARD_GEMS,
  finalFailRewardGems = DEFAULT_FINAL_FAIL_REWARD_GEMS,
  milestoneRewardConfig = DEFAULT_MILESTONE_REWARD_CONFIG,
}) {
  const { user, fetchProfile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { isTestMode } = useParentControls();
  const theme = THEME_BY_VARIANT[variant] || THEME_BY_VARIANT.law;

  const normalizedMilestoneSize = Math.max(1, Math.floor(Number(milestoneSize) || DEFAULT_MILESTONE_SIZE));
  const totalQuestions = questions.length;
  const totalMilestones = Math.max(1, Math.ceil(totalQuestions / normalizedMilestoneSize));

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [typedAnswer, setTypedAnswer] = React.useState('');
  const [submittedTypedAnswer, setSubmittedTypedAnswer] = React.useState('');
  const [typedInputError, setTypedInputError] = React.useState('');
  const [hasAnswered, setHasAnswered] = React.useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = React.useState(false);

  const [score, setScore] = React.useState(0);
  const [currentBlockCorrect, setCurrentBlockCorrect] = React.useState(0);

  const [isMilestoneScreen, setIsMilestoneScreen] = React.useState(false);
  const [milestoneData, setMilestoneData] = React.useState(null);
  const [milestoneRewardStatus, setMilestoneRewardStatus] = React.useState('idle'); // idle | claiming | claimed | already | auth_required | error | none
  const [milestoneRewardMessage, setMilestoneRewardMessage] = React.useState('');
  const [milestonesAwardedCount, setMilestonesAwardedCount] = React.useState(0);
  const [milestoneGemsAwarded, setMilestoneGemsAwarded] = React.useState(0);

  const [isCompleted, setIsCompleted] = React.useState(false);
  const [finalRewardStatus, setFinalRewardStatus] = React.useState('idle'); // idle | claiming | claimed | already | auth_required | error
  const [finalRewardMessage, setFinalRewardMessage] = React.useState('');
  const [finalRewardGemsAwarded, setFinalRewardGemsAwarded] = React.useState(0);

  const awardedMilestonesRef = React.useRef(new Set());
  const finalRewardAttemptedRef = React.useRef(false);
  const finalRewardClaimedRef = React.useRef(false);

  const currentQuestion = questions[currentIndex] || null;
  const normalizedScore = Math.max(0, Math.min(score, totalQuestions));
  const percentage = totalQuestions > 0 ? (normalizedScore / totalQuestions) * 100 : 0;
  const isPass = percentage > Number(passThreshold || DEFAULT_PASS_THRESHOLD);
  const finalRewardAmount = isPass ? finalPassRewardGems : finalFailRewardGems;

  const progressCount = isCompleted
    ? totalQuestions
    : isMilestoneScreen
      ? Math.min(totalQuestions, milestoneData?.answeredCount || currentIndex + 1)
      : Math.min(totalQuestions, currentIndex + 1);
  const progressPercent = totalQuestions > 0 ? (progressCount / totalQuestions) * 100 : 0;

  const totalGemsAwarded = milestoneGemsAwarded + finalRewardGemsAwarded;

  const syncProfileAfterReward = React.useCallback(
    async (userId) => {
      if (!userId) return;
      await fetchProfile?.(userId, { retryCount: 2, preferDirect: true });

      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          void fetchProfile?.(userId, { retryCount: 1, preferDirect: true });
        }, 200);
        window.dispatchEvent(new Event('aiko:auth-refresh'));
      }
    },
    [fetchProfile]
  );

  const resetQuestionState = React.useCallback(() => {
    setSelectedOption(null);
    setTypedAnswer('');
    setSubmittedTypedAnswer('');
    setTypedInputError('');
    setHasAnswered(false);
    setIsCorrectAnswer(false);
  }, []);

  const resetQuiz = React.useCallback(() => {
    setCurrentIndex(0);
    resetQuestionState();

    setScore(0);
    setCurrentBlockCorrect(0);

    setIsMilestoneScreen(false);
    setMilestoneData(null);
    setMilestoneRewardStatus('idle');
    setMilestoneRewardMessage('');
    setMilestonesAwardedCount(0);
    setMilestoneGemsAwarded(0);

    setIsCompleted(false);
    setFinalRewardStatus('idle');
    setFinalRewardMessage('');
    setFinalRewardGemsAwarded(0);

    awardedMilestonesRef.current = new Set();
    finalRewardAttemptedRef.current = false;
    finalRewardClaimedRef.current = false;
  }, [resetQuestionState]);

  const registerAnswer = React.useCallback(
    ({ correct, optionValue = null, typedValue = '' }) => {
      if (hasAnswered || isCompleted || isMilestoneScreen || !currentQuestion) return;

      setSelectedOption(optionValue);
      setSubmittedTypedAnswer(typedValue);
      setHasAnswered(true);
      setIsCorrectAnswer(Boolean(correct));
      setTypedInputError('');

      if (correct) {
        setScore((prev) => prev + 1);
        setCurrentBlockCorrect((prev) => prev + 1);
      }
    },
    [currentQuestion, hasAnswered, isCompleted, isMilestoneScreen]
  );

  const claimMilestoneReward = React.useCallback(
    async (milestoneIndex, rewardGems) => {
      if (rewardGems <= 0) {
        setMilestoneRewardStatus('none');
        setMilestoneRewardMessage('No Gems for this set. Keep trying.');
        return;
      }

      if (!user?.id) {
        setMilestoneRewardStatus('auth_required');
        setMilestoneRewardMessage(`Log in to claim +${rewardGems} Gems for this set.`);
        return;
      }

      if (awardedMilestonesRef.current.has(milestoneIndex)) {
        setMilestoneRewardStatus('already');
        setMilestoneRewardMessage(`Milestone ${milestoneIndex}: reward already claimed.`);
        return;
      }

      setMilestoneRewardStatus('claiming');
      setMilestoneRewardMessage('Adding milestone reward to your account...');

      try {
        const result = await addUserGems({
          userId: user.id,
          amount: rewardGems,
        });

        if (!result?.ok) {
          setMilestoneRewardStatus('error');
          setMilestoneRewardMessage(result?.message || 'Could not add milestone Gems.');
          return;
        }

        awardedMilestonesRef.current.add(milestoneIndex);
        setMilestonesAwardedCount((prev) => prev + 1);
        setMilestoneGemsAwarded((prev) => prev + rewardGems);

        await syncProfileAfterReward(user.id);

        setMilestoneRewardStatus('claimed');
        setMilestoneRewardMessage(`Milestone ${milestoneIndex}: +${rewardGems} Gems added.`);
      } catch (error) {
        console.error('[ParentZoneQuizPage] Milestone reward failed:', error);
        setMilestoneRewardStatus('error');
        setMilestoneRewardMessage('Milestone reward update failed. Please retry.');
      }
    },
    [syncProfileAfterReward, user?.id]
  );

  const claimFinalReward = React.useCallback(async () => {
    if (finalRewardAmount <= 0) {
      setFinalRewardStatus('claimed');
      setFinalRewardMessage('Final reward is 0 Gems for this attempt.');
      return;
    }

    if (!user?.id) {
      setFinalRewardStatus('auth_required');
      setFinalRewardMessage(`Log in to claim final +${finalRewardAmount} Gems.`);
      return;
    }

    if (finalRewardClaimedRef.current) {
      setFinalRewardStatus('already');
      setFinalRewardMessage('Final reward already claimed for this run.');
      return;
    }

    setFinalRewardStatus('claiming');
    setFinalRewardMessage('Adding final test reward...');

    try {
      const result = await addUserGems({
        userId: user.id,
        amount: finalRewardAmount,
      });

      if (!result?.ok) {
        setFinalRewardStatus('error');
        setFinalRewardMessage(result?.message || 'Could not add final reward Gems.');
        return;
      }

      finalRewardClaimedRef.current = true;
      setFinalRewardGemsAwarded(finalRewardAmount);
      await syncProfileAfterReward(user.id);

      setFinalRewardStatus('claimed');
      setFinalRewardMessage(
        isPass
          ? `Final Result: Pass. +${finalRewardAmount} Gems added.`
          : `Final Result: Keep practicing. +${finalRewardAmount} Gems added.`
      );
    } catch (error) {
      console.error('[ParentZoneQuizPage] Final reward failed:', error);
      setFinalRewardStatus('error');
      setFinalRewardMessage('Final reward update failed. Please retry.');
    }
  }, [finalRewardAmount, isPass, syncProfileAfterReward, user?.id]);

  React.useEffect(() => {
    if (!isCompleted) return;
    if (finalRewardAttemptedRef.current) return;

    finalRewardAttemptedRef.current = true;
    void claimFinalReward();
  }, [claimFinalReward, isCompleted]);

  const handleOptionClick = (option) => {
    if (isTestMode) return;
    const isCorrect = option === currentQuestion?.answer;
    registerAnswer({ correct: isCorrect, optionValue: option });
  };

  const handleTypedSubmit = (event) => {
    event.preventDefault();
    if (!isTestMode || hasAnswered || !currentQuestion) return;

    const value = typedAnswer.trim();
    if (!value) {
      setTypedInputError('Type your answer before submitting.');
      return;
    }

    const isCorrect = isTypedAnswerCorrect(currentQuestion, value);
    registerAnswer({ correct: isCorrect, typedValue: value });
  };

  const handleNextQuestion = () => {
    if (!hasAnswered) return;

    const answeredCount = Math.min(totalQuestions, currentIndex + 1);
    const isLastQuestion = currentIndex >= totalQuestions - 1;
    const reachedMilestone = answeredCount > 0 && answeredCount % normalizedMilestoneSize === 0;

    if (reachedMilestone) {
      const milestoneIndex = Math.ceil(answeredCount / normalizedMilestoneSize);
      const rewardGems = getMilestoneRewardGems(
        currentBlockCorrect,
        normalizedMilestoneSize,
        milestoneRewardConfig
      );

      setMilestoneData({
        milestoneIndex,
        answeredCount,
        correct: currentBlockCorrect,
        target: normalizedMilestoneSize,
        rewardGems,
        isFinal: isLastQuestion,
      });
      setIsMilestoneScreen(true);

      setMilestoneRewardStatus('idle');
      setMilestoneRewardMessage('');
      void claimMilestoneReward(milestoneIndex, rewardGems);
      return;
    }

    if (isLastQuestion) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    resetQuestionState();
  };

  const handleMilestoneContinue = () => {
    if (!milestoneData) return;

    setIsMilestoneScreen(false);
    setMilestoneData(null);

    if (milestoneData.isFinal) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    setCurrentBlockCorrect(0);
    setMilestoneRewardStatus('idle');
    setMilestoneRewardMessage('');
    resetQuestionState();
  };

  return (
    <ParentZoneRouteLayout title={title} description={description}>
      <section className={`rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-5 shadow-sm sm:p-7`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className={`rounded-full border px-4 py-1.5 text-sm font-black ${theme.badge}`}>
            {quizEmoji} {totalQuestions} Question Test
          </div>
          <p className="text-sm font-black text-slate-900">
            {isCompleted
              ? 'Test Completed'
              : isMilestoneScreen
                ? `Set ${milestoneData?.milestoneIndex || 1}/${totalMilestones}`
                : `Question ${progressCount}/${totalQuestions}`}
          </p>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">
              Set Reward Rules (per {normalizedMilestoneSize} questions): 10/10 = 15 Gems, 9/10 = 10 Gems, 8/10 = 5 Gems, 1-7 = 2 Gems, 0 = 0 Gems.
            </p>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700">
            Test Mode is controlled from Parent Zone Dashboard: {isTestMode ? 'ON (Type answer manually)' : 'OFF (Choose from 4 options)'}.
          </p>
        </div>

        <div className={`h-3 w-full overflow-hidden rounded-full ${theme.progressTrack}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.progressFill} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!isCompleted && !isMilestoneScreen && currentQuestion ? (
          <div className="mt-6">
            <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-sm">
              <p className="text-lg font-black leading-relaxed text-slate-950 sm:text-xl">
                {currentQuestion.question}
              </p>
            </div>

            {!isTestMode ? (
              <div className="mt-5 grid gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    disabled={hasAnswered}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition sm:text-base ${getOptionClasses({
                      hasAnswered,
                      option,
                      selectedOption,
                      correctOption: currentQuestion.answer,
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
                  value={typedAnswer}
                  onChange={(event) => {
                    setTypedAnswer(event.target.value);
                    setTypedInputError('');
                  }}
                  disabled={hasAnswered}
                  placeholder="Type your answer"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none focus:border-slate-500"
                />
                {typedInputError ? (
                  <p className="text-xs font-bold text-rose-700">{typedInputError}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={hasAnswered}
                  className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70 sm:text-base ${theme.nextButton}`}
                >
                  Submit Answer
                </button>
              </form>
            )}

            {hasAnswered ? (
              <div className="mt-5 space-y-4">
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm font-black sm:text-base ${
                    isCorrectAnswer
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                      : 'border-rose-300 bg-rose-100 text-rose-900'
                  }`}
                >
                  {isCorrectAnswer
                    ? 'Correct!'
                    : `Incorrect. ${isTestMode ? `Your answer: ${submittedTypedAnswer || '-'} | ` : ''}Correct answer: ${currentQuestion.answer}`}
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition sm:text-base ${theme.nextButton}`}
                >
                  {currentIndex === totalQuestions - 1 ? 'Finish Test' : 'Next Question'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {isMilestoneScreen && milestoneData ? (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                milestoneData.correct >= milestoneData.target
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                  : 'border-amber-300 bg-amber-100 text-amber-950'
              }`}
            >
              <p className="text-lg font-black sm:text-xl">
                Set {milestoneData.milestoneIndex}/{totalMilestones}
              </p>
              <p className="mt-1 text-sm font-bold sm:text-base">
                Score in this set: {milestoneData.correct}/{milestoneData.target}
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                Reward for this set: +{milestoneData.rewardGems} Gems
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300 bg-cyan-100 px-5 py-4">
              <p className="text-sm font-black text-cyan-950 sm:text-base">
                {milestoneRewardMessage || 'Processing set reward...'}
              </p>

              {!user?.id ? (
                <button
                  type="button"
                  onClick={() => openAuthModal?.('login')}
                  className="mt-3 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-black text-white hover:bg-cyan-800"
                >
                  Login to Claim Reward
                </button>
              ) : null}

              {user?.id && (milestoneRewardStatus === 'error' || milestoneRewardStatus === 'auth_required') ? (
                <button
                  type="button"
                  onClick={() => void claimMilestoneReward(milestoneData.milestoneIndex, milestoneData.rewardGems)}
                  className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                >
                  Retry Set Reward
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleMilestoneContinue}
              disabled={milestoneRewardStatus === 'claiming'}
              className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70 sm:text-base ${theme.nextButton}`}
            >
              {milestoneData.isFinal ? 'View Final Result' : 'Continue to Next Set'}
            </button>
          </div>
        ) : null}

        {isCompleted ? (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-2xl border px-5 py-4 ${isPass ? theme.resultPass : theme.resultFail}`}
            >
              <p className="text-lg font-black sm:text-xl">
                Score: {normalizedScore}/{totalQuestions} ({percentage.toFixed(1)}%)
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                {isPass
                  ? `Pass: above ${passThreshold}% | Final Reward +${finalPassRewardGems} Gems.`
                  : `Fail: ${passThreshold}% or below | Encouragement Reward +${finalFailRewardGems} Gems.`}
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                Set Rewards Earned: {milestonesAwardedCount}/{totalMilestones} | Set Gems: +{milestoneGemsAwarded}
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">Total Gems Earned This Run: +{totalGemsAwarded}</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="text-sm font-black text-amber-900 sm:text-base">
                Final Reward Status: {finalRewardMessage || 'Ready to process final reward.'}
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

              {user?.id && (finalRewardStatus === 'error' || finalRewardStatus === 'auth_required') ? (
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
              onClick={resetQuiz}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 hover:bg-slate-50 sm:text-base"
            >
              Restart Test
            </button>
          </div>
        ) : null}
      </section>
    </ParentZoneRouteLayout>
  );
}
