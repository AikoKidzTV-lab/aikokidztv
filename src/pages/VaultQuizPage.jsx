import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { megaVaultPacks, vaultQuestions } from '../data/megaVaultData';

const getPackTitle = (packId) => {
  const pack = megaVaultPacks.find((item) => item.id === packId);
  return pack?.title || 'Mega Vault Quiz';
};

export default function VaultQuizPage() {
  const navigate = useNavigate();
  const { packId = '' } = useParams();
  const questions = vaultQuestions?.[packId];
  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState('');

  React.useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer('');
  }, [packId]);

  if (!hasQuestions) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black text-slate-900">Mega Vault Quiz 🧠</h1>
          <p className="mt-4 text-base font-semibold text-slate-700">More questions coming soon!</p>
          <button
            type="button"
            onClick={() => navigate('/mega-vault')}
            className="mt-6 rounded-xl bg-slate-800 px-4 py-2 text-sm font-black text-white"
          >
            Back to Vault 🏰
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isCorrect = selectedAnswer ? selectedAnswer === question.correct : null;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Mega Vault Pack</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">{getPackTitle(packId)} 🚀</h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/mega-vault')}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-black text-white"
          >
            Back to Vault 🏰
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-black text-slate-900">{question.question}</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            {question.options.map((option) => {
              let optionClass = 'border-slate-300 bg-white text-slate-900';
              if (selectedAnswer) {
                if (option === question.correct) {
                  optionClass = 'border-emerald-600 bg-emerald-100 text-emerald-900';
                } else if (option === selectedAnswer) {
                  optionClass = 'border-rose-600 bg-rose-100 text-rose-900';
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedAnswer(option)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${optionClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <p
            className={`mt-4 min-h-[1.25rem] text-sm font-bold ${
              isCorrect === null
                ? 'text-slate-600'
                : isCorrect
                  ? 'text-emerald-700'
                  : 'text-rose-700'
            }`}
          >
            {isCorrect === null
              ? 'Select an answer.'
              : isCorrect
                ? 'Correct! ✅'
                : `Incorrect. Correct answer: ${question.correct}`}
          </p>

          <button
            type="button"
            onClick={() => {
              setSelectedAnswer('');
              setCurrentIndex((prev) => (prev + 1) % questions.length);
            }}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white"
          >
            Next Question ⏩
          </button>
        </div>
      </div>
    </div>
  );
}
