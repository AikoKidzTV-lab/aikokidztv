import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { claimRewardOnce } from '../../utils/profileEconomy';
import { JUNIOR_QUIZ_REWARD_GEMS } from '../../constants/juniorQuizzes';

const PASSING_PERCENTAGE = 80;

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
    return 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50';
  }

  if (option === correctOption) {
    return 'border-emerald-400 bg-emerald-100 text-emerald-900';
  }

  if (option === selectedOption && option !== correctOption) {
    return 'border-rose-400 bg-rose-100 text-rose-900';
  }

  return 'border-slate-200 bg-slate-100 text-slate-500';
};

export default function ParentZoneQuizPage({
  title,
  description,
  quizEmoji = '🧠',
  variant = 'law',
  questions = [],
  rewardKey,
}) {
  const { user, fetchProfile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const theme = THEME_BY_VARIANT[variant] || THEME_BY_VARIANT.law;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [hasAnswered, setHasAnswered] = React.useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [rewardStatus, setRewardStatus] = React.useState('idle'); // idle | claiming | claimed | already | auth_required | error
  const [rewardMessage, setRewardMessage] = React.useState('');
  const rewardAttemptedRef = React.useRef(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const normalizedScore = Math.max(0, Math.min(score, totalQuestions));
  const percentage = totalQuestions > 0 ? (normalizedScore / totalQuestions) * 100 : 0;
  const hasPassed = isCompleted && percentage > PASSING_PERCENTAGE;
  const progressCount = isCompleted ? totalQuestions : Math.min(totalQuestions, currentIndex + 1);
  const progressPercent = totalQuestions > 0 ? (progressCount / totalQuestions) * 100 : 0;

  const resetQuiz = React.useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrectAnswer(false);
    setScore(0);
    setIsCompleted(false);
    setRewardStatus('idle');
    setRewardMessage('');
    rewardAttemptedRef.current = false;
  }, []);

  const attemptRewardClaim = React.useCallback(async () => {
    if (!rewardKey || !user?.id) return;

    setRewardStatus('claiming');
    setRewardMessage('Reward process ho raha hai... gems add kiye ja rahe hain.');

    try {
      const result = await claimRewardOnce({
        userId: user.id,
        rewardKey,
        gemReward: JUNIOR_QUIZ_REWARD_GEMS,
      });

      if (!result?.ok) {
        setRewardStatus('error');
        setRewardMessage(result?.message || 'Reward claim nahi ho paya. Please retry.');
        return;
      }

      await fetchProfile?.(user.id, { retryCount: 2, preferDirect: true });

      if (result.alreadyClaimed) {
        setRewardStatus('already');
        setRewardMessage('Reward pehle hi claim ho chuka hai.');
      } else {
        setRewardStatus('claimed');
        setRewardMessage(`Great job! +${JUNIOR_QUIZ_REWARD_GEMS} Gems successfully add ho gaye.`);
      }
    } catch (error) {
      console.error('[ParentZoneQuizPage] Reward claim failed:', error);
      setRewardStatus('error');
      setRewardMessage('Reward update mein issue aaya. Please try again.');
    }
  }, [fetchProfile, rewardKey, user?.id]);

  React.useEffect(() => {
    if (!hasPassed) {
      return;
    }

    if (!user?.id) {
      setRewardStatus('auth_required');
      setRewardMessage('50 Gems reward ke liye login zaroori hai.');
      return;
    }

    if (rewardAttemptedRef.current) {
      return;
    }

    rewardAttemptedRef.current = true;
    void attemptRewardClaim();
  }, [attemptRewardClaim, hasPassed, user?.id]);

  const handleOptionClick = (option) => {
    if (hasAnswered || isCompleted || !currentQuestion) return;

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setHasAnswered(true);
    setIsCorrectAnswer(isCorrect);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!hasAnswered) return;
    if (currentIndex >= totalQuestions - 1) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrectAnswer(false);
  };

  return (
    <ParentZoneRouteLayout title={title} description={description}>
      <section className={`rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-5 shadow-sm sm:p-7`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className={`rounded-full border px-4 py-1.5 text-sm font-black ${theme.badge}`}>
            {quizEmoji} 30 Question Challenge
          </div>
          <p className="text-sm font-black text-slate-700">
            {isCompleted ? 'Quiz Completed' : `Question ${progressCount}/${totalQuestions}`}
          </p>
        </div>

        <div className={`h-3 w-full overflow-hidden rounded-full ${theme.progressTrack}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.progressFill} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!isCompleted && currentQuestion ? (
          <div className="mt-6">
            <div className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-sm">
              <p className="text-lg font-black leading-relaxed text-slate-900 sm:text-xl">{currentQuestion.question}</p>
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
                  {isCorrectAnswer ? 'Correct! 🎉' : `Wrong ❌ | Sahi jawab: ${currentQuestion.answer}`}
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

        {isCompleted ? (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-2xl border px-5 py-4 ${hasPassed ? theme.resultPass : theme.resultFail}`}
            >
              <p className="text-lg font-black sm:text-xl">
                Score: {normalizedScore}/{totalQuestions} ({percentage.toFixed(1)}%)
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                {hasPassed
                  ? 'Excellent! Aapne 80% se zyada score kiya.'
                  : '80% se zyada score ke liye ek aur try karein.'}
              </p>
            </div>

            {hasPassed ? (
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
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 sm:text-base"
            >
              Restart Quiz
            </button>
          </div>
        ) : null}
      </section>
    </ParentZoneRouteLayout>
  );
}
