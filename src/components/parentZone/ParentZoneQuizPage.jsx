import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { claimRewardOnce } from '../../utils/profileEconomy';
import { addUserGems } from '../../utils/gemWallet';
import { JUNIOR_QUIZ_REWARD_GEMS } from '../../constants/juniorQuizzes';

const PASSING_PERCENTAGE = 80;
const DEFAULT_MILESTONE_SIZE = 10;

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

export default function ParentZoneQuizPage({
  title,
  description,
  quizEmoji = 'Quiz',
  variant = 'law',
  questions = [],
  rewardKey,
  rewardMode = 'pass_once', // pass_once | milestone_perfect
  milestoneSize = DEFAULT_MILESTONE_SIZE,
  milestoneRewardGems = 15,
}) {
  const { user, fetchProfile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const theme = THEME_BY_VARIANT[variant] || THEME_BY_VARIANT.law;
  const isMilestoneMode = rewardMode === 'milestone_perfect';
  const normalizedMilestoneSize = Math.max(
    1,
    Math.floor(Number(milestoneSize) || DEFAULT_MILESTONE_SIZE)
  );

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [hasAnswered, setHasAnswered] = React.useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [currentBlockCorrect, setCurrentBlockCorrect] = React.useState(0);
  const [isMilestoneScreen, setIsMilestoneScreen] = React.useState(false);
  const [milestoneData, setMilestoneData] = React.useState(null);
  const [milestoneRewardStatus, setMilestoneRewardStatus] = React.useState('idle'); // idle | claiming | claimed | already | auth_required | error | not_eligible
  const [milestoneRewardMessage, setMilestoneRewardMessage] = React.useState('');
  const [milestonesAwardedCount, setMilestonesAwardedCount] = React.useState(0);

  const [isCompleted, setIsCompleted] = React.useState(false);
  const [rewardStatus, setRewardStatus] = React.useState('idle'); // idle | claiming | claimed | already | auth_required | error
  const [rewardMessage, setRewardMessage] = React.useState('');

  const rewardAttemptedRef = React.useRef(false);
  const awardedMilestonesRef = React.useRef(new Set());

  const totalQuestions = questions.length;
  const totalMilestones = isMilestoneMode
    ? Math.max(1, Math.ceil(totalQuestions / normalizedMilestoneSize))
    : 0;

  const currentQuestion = questions[currentIndex] || null;
  const normalizedScore = Math.max(0, Math.min(score, totalQuestions));
  const percentage = totalQuestions > 0 ? (normalizedScore / totalQuestions) * 100 : 0;
  const hasPassed = !isMilestoneMode && isCompleted && percentage >= PASSING_PERCENTAGE;

  const progressCount = isCompleted
    ? totalQuestions
    : isMilestoneScreen
      ? Math.min(totalQuestions, milestoneData?.answeredCount || currentIndex + 1)
      : Math.min(totalQuestions, currentIndex + 1);

  const progressPercent = totalQuestions > 0 ? (progressCount / totalQuestions) * 100 : 0;
  const totalMilestoneGemsEarned = milestonesAwardedCount * milestoneRewardGems;

  const resetQuiz = React.useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrectAnswer(false);
    setScore(0);
    setCurrentBlockCorrect(0);
    setIsMilestoneScreen(false);
    setMilestoneData(null);
    setMilestoneRewardStatus('idle');
    setMilestoneRewardMessage('');
    setMilestonesAwardedCount(0);
    setIsCompleted(false);
    setRewardStatus('idle');
    setRewardMessage('');
    rewardAttemptedRef.current = false;
    awardedMilestonesRef.current = new Set();
  }, []);

  const attemptRewardClaim = React.useCallback(async () => {
    if (isMilestoneMode) return;
    if (!rewardKey || !user?.id) return;

    setRewardStatus('claiming');
    setRewardMessage('Updating reward and adding gems...');

    try {
      const result = await claimRewardOnce({
        userId: user.id,
        rewardKey,
        gemReward: JUNIOR_QUIZ_REWARD_GEMS,
      });

      if (!result?.ok) {
        setRewardStatus('error');
        setRewardMessage(result?.message || 'Reward claim failed. Please retry.');
        return;
      }

      await fetchProfile?.(user.id, { retryCount: 2, preferDirect: true });

      if (result.alreadyClaimed) {
        setRewardStatus('already');
        setRewardMessage('Reward was already claimed.');
      } else {
        setRewardStatus('claimed');
        setRewardMessage(`Great job! +${JUNIOR_QUIZ_REWARD_GEMS} Gems added successfully.`);
      }
    } catch (error) {
      console.error('[ParentZoneQuizPage] Reward claim failed:', error);
      setRewardStatus('error');
      setRewardMessage('Reward update failed. Please try again.');
    }
  }, [fetchProfile, isMilestoneMode, rewardKey, user?.id]);

  const attemptMilestoneReward = React.useCallback(
    async (milestoneIndex) => {
      if (!isMilestoneMode) return;

      if (!user?.id) {
        setMilestoneRewardStatus('auth_required');
        setMilestoneRewardMessage(
          `Log in to claim +${milestoneRewardGems} Gems for this milestone.`
        );
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
          amount: milestoneRewardGems,
        });

        if (!result?.ok) {
          setMilestoneRewardStatus('error');
          setMilestoneRewardMessage(
            result?.message || 'Could not add gems right now. Please retry.'
          );
          return;
        }

        awardedMilestonesRef.current.add(milestoneIndex);
        setMilestonesAwardedCount((prev) => prev + 1);

        await fetchProfile?.(user.id, { retryCount: 2, preferDirect: true });
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            void fetchProfile?.(user.id, { retryCount: 1, preferDirect: true });
          }, 200);
          window.dispatchEvent(new Event('aiko:auth-refresh'));
        }

        setMilestoneRewardStatus('claimed');
        setMilestoneRewardMessage(
          `Milestone ${milestoneIndex} complete: +${milestoneRewardGems} Gems added.`
        );
      } catch (error) {
        console.error('[ParentZoneQuizPage] Milestone reward failed:', error);
        setMilestoneRewardStatus('error');
        setMilestoneRewardMessage('Reward update failed. Please retry.');
      }
    },
    [fetchProfile, isMilestoneMode, milestoneRewardGems, user?.id]
  );

  React.useEffect(() => {
    if (isMilestoneMode) {
      return;
    }

    if (!hasPassed) {
      return;
    }

    if (!user?.id) {
      setRewardStatus('auth_required');
      setRewardMessage('Log in to claim the reward.');
      return;
    }

    if (rewardAttemptedRef.current) {
      return;
    }

    rewardAttemptedRef.current = true;
    void attemptRewardClaim();
  }, [attemptRewardClaim, hasPassed, isMilestoneMode, user?.id]);

  const handleOptionClick = (option) => {
    if (hasAnswered || isCompleted || isMilestoneScreen || !currentQuestion) return;

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setHasAnswered(true);
    setIsCorrectAnswer(isCorrect);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (isMilestoneMode) {
        setCurrentBlockCorrect((prev) => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (!hasAnswered) return;

    const answeredCount = Math.min(totalQuestions, currentIndex + 1);
    const isLastQuestion = currentIndex >= totalQuestions - 1;

    const reachedMilestone =
      isMilestoneMode && answeredCount > 0 && answeredCount % normalizedMilestoneSize === 0;

    if (reachedMilestone) {
      const milestoneIndex = Math.ceil(answeredCount / normalizedMilestoneSize);
      const requiredCorrect = Math.min(
        normalizedMilestoneSize,
        answeredCount - (milestoneIndex - 1) * normalizedMilestoneSize
      );
      const isPerfectMilestone = currentBlockCorrect === requiredCorrect;

      setMilestoneData({
        milestoneIndex,
        answeredCount,
        correct: currentBlockCorrect,
        requiredCorrect,
        isPerfect: isPerfectMilestone,
        isFinal: isLastQuestion,
      });
      setIsMilestoneScreen(true);

      if (isPerfectMilestone) {
        setMilestoneRewardStatus('idle');
        setMilestoneRewardMessage(`Perfect milestone score (${requiredCorrect}/${requiredCorrect}).`);
        void attemptMilestoneReward(milestoneIndex);
      } else {
        setMilestoneRewardStatus('not_eligible');
        setMilestoneRewardMessage(
          `Milestone ${milestoneIndex}: score ${requiredCorrect}/${requiredCorrect} is required for +${milestoneRewardGems} Gems.`
        );
      }
      return;
    }

    if (isLastQuestion) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrectAnswer(false);
  };

  const handleMilestoneContinue = () => {
    if (!milestoneData) return;

    setIsMilestoneScreen(false);
    if (milestoneData.isFinal) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrectAnswer(false);
    setCurrentBlockCorrect(0);
    setMilestoneData(null);
    setMilestoneRewardStatus('idle');
    setMilestoneRewardMessage('');
  };

  return (
    <ParentZoneRouteLayout title={title} description={description}>
      <section className={`rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-5 shadow-sm sm:p-7`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className={`rounded-full border px-4 py-1.5 text-sm font-black ${theme.badge}`}>
            {quizEmoji} {totalQuestions} Question Challenge
          </div>
          <p className="text-sm font-black text-slate-900">
            {isCompleted
              ? 'Quiz Completed'
              : isMilestoneScreen
                ? `Milestone ${milestoneData?.milestoneIndex || 1}/${totalMilestones}`
                : `Question ${progressCount}/${totalQuestions}`}
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
                    : `Incorrect. Correct answer: ${currentQuestion.answer}`}
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition sm:text-base ${theme.nextButton}`}
                >
                  {currentIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {isMilestoneScreen && milestoneData ? (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                milestoneData.isPerfect
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                  : 'border-amber-300 bg-amber-100 text-amber-950'
              }`}
            >
              <p className="text-lg font-black sm:text-xl">
                Milestone {milestoneData.milestoneIndex}/{totalMilestones}
              </p>
              <p className="mt-1 text-sm font-bold sm:text-base">
                Score in this set: {milestoneData.correct}/{milestoneData.requiredCorrect}
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                {milestoneData.isPerfect
                  ? `Perfect score! You qualify for +${milestoneRewardGems} Gems.`
                  : `No reward for this set. You need ${milestoneData.requiredCorrect}/${milestoneData.requiredCorrect}.`}
              </p>
            </div>

            {milestoneData.isPerfect ? (
              <div className="rounded-2xl border border-cyan-300 bg-cyan-100 px-5 py-4">
                <p className="text-sm font-black text-cyan-950 sm:text-base">
                  Reward Rule: +{milestoneRewardGems} Gems for every perfect set of{' '}
                  {normalizedMilestoneSize} answers.
                </p>
                <p className="mt-2 text-sm font-semibold text-cyan-950">
                  {milestoneRewardMessage || 'Reward is ready to claim.'}
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

                {user?.id &&
                (milestoneRewardStatus === 'error' ||
                  milestoneRewardStatus === 'auth_required') ? (
                  <button
                    type="button"
                    onClick={() => void attemptMilestoneReward(milestoneData.milestoneIndex)}
                    className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                  >
                    Retry Reward Update
                  </button>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleMilestoneContinue}
              disabled={milestoneRewardStatus === 'claiming'}
              className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70 sm:text-base ${theme.nextButton}`}
            >
              {milestoneData.isFinal ? 'View Final Result' : 'Continue to Next Questions'}
            </button>
          </div>
        ) : null}

        {isCompleted ? (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isMilestoneMode ? theme.resultPass : hasPassed ? theme.resultPass : theme.resultFail
              }`}
            >
              <p className="text-lg font-black sm:text-xl">
                Score: {normalizedScore}/{totalQuestions} ({percentage.toFixed(1)}%)
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                {isMilestoneMode
                  ? `Milestone rewards earned: ${milestonesAwardedCount}/${totalMilestones} (Total +${totalMilestoneGemsEarned} Gems).`
                  : hasPassed
                    ? 'Excellent! You scored 80% or higher.'
                    : 'Score 80% or higher to unlock the reward.'}
              </p>
            </div>

            {!isMilestoneMode && hasPassed ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="text-sm font-black text-amber-900 sm:text-base">
                  Reward Rule: {JUNIOR_QUIZ_REWARD_GEMS} Gems for score above 80%.
                </p>
                <p className="mt-2 text-sm font-semibold text-amber-900">
                  {rewardMessage || 'Reward status ready.'}
                </p>

                {!user?.id ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal?.('login')}
                    className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-white hover:bg-amber-600"
                  >
                    Login to Claim Reward
                  </button>
                ) : null}

                {rewardStatus === 'error' ? (
                  <button
                    type="button"
                    onClick={() => void attemptRewardClaim()}
                    className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                  >
                    Retry Reward Update
                  </button>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 hover:bg-slate-50 sm:text-base"
            >
              Restart Quiz
            </button>
          </div>
        ) : null}
      </section>
    </ParentZoneRouteLayout>
  );
}
