import React from 'react';
import ParentZoneRouteLayout from './ParentZoneRouteLayout';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_CALCULATOR_MILESTONE_SIZE,
  JUNIOR_CALCULATOR_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

const isSafeExpression = (value) => /^[0-9+\-*/.\s()]+$/.test(String(value || ''));
const OPERATOR_REGEX = /[+\-*/]/;

const toReadableExpression = (value) =>
  String(value || '')
    .replace(/\*/g, ' x ')
    .replace(/\//g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();

const getLastNumberSegment = (value) => {
  const text = String(value || '');
  const parts = text.split(/[+\-*/]/);
  return parts[parts.length - 1] || '';
};

const evaluateExpression = (expression) => {
  const cleaned = String(expression || '').trim();
  if (!cleaned) {
    return { ok: false, message: 'Enter a calculation first.' };
  }
  if (!isSafeExpression(cleaned)) {
    return { ok: false, message: 'Only numbers and + - x / are allowed.' };
  }

  try {
    // Safe eval wrapper after strict character filtering above.
    const result = Function(`"use strict"; return (${cleaned});`)();
    if (!Number.isFinite(result)) {
      return { ok: false, message: 'Invalid result. Try another expression.' };
    }
    const rounded = Math.round((result + Number.EPSILON) * 1000) / 1000;
    return { ok: true, value: rounded };
  } catch {
    return { ok: false, message: 'Invalid expression. Check the operators.' };
  }
};

export default function ParentZoneCalculatorPage() {
  const [mode, setMode] = React.useState('standard'); // standard | practice
  const [expression, setExpression] = React.useState('');
  const [displayValue, setDisplayValue] = React.useState('0');
  const [statusMessage, setStatusMessage] = React.useState('');

  const appendDigit = (digit) => {
    setStatusMessage('');
    setExpression((prev) => {
      const next = `${prev}${digit}`;
      setDisplayValue(next);
      return next;
    });
  };

  const appendDecimal = () => {
    setStatusMessage('');
    setExpression((prev) => {
      const lastSegment = getLastNumberSegment(prev);
      if (lastSegment.includes('.')) {
        return prev;
      }
      const next = `${prev}${lastSegment ? '.' : '0.'}`;
      setDisplayValue(next);
      return next;
    });
  };

  const appendOperator = (operator) => {
    setStatusMessage('');
    setExpression((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return prev;
      const lastChar = trimmed[trimmed.length - 1];
      const next =
        OPERATOR_REGEX.test(lastChar)
          ? `${trimmed.slice(0, -1)}${operator}`
          : `${trimmed}${operator}`;
      setDisplayValue(next);
      return next;
    });
  };

  const clearAll = () => {
    setExpression('');
    setDisplayValue('0');
    setStatusMessage('');
  };

  const backspace = () => {
    setStatusMessage('');
    setExpression((prev) => {
      const next = prev.slice(0, -1);
      setDisplayValue(next || '0');
      return next;
    });
  };

  const handleEvaluate = () => {
    const result = evaluateExpression(expression);
    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }
    const rendered = String(result.value);
    setExpression(rendered);
    setDisplayValue(rendered);
    setStatusMessage(`Answer: ${rendered}`);
  };

  if (mode === 'practice') {
    return (
      <ParentZoneQuizPage
        title="Calculator Arithmetic Practice"
        description="100-question arithmetic test: 25 Addition, 25 Subtraction, 25 Multiplication, 25 Division."
        quizEmoji="Calculator"
        variant="numbers"
        questions={JUNIOR_CALCULATOR_QUIZ_QUESTIONS}
        milestoneSize={JUNIOR_CALCULATOR_MILESTONE_SIZE}
        headerActions={(
          <button
            type="button"
            onClick={() => setMode('standard')}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-50"
          >
            Standard Mode
          </button>
        )}
      />
    );
  }

  return (
    <ParentZoneRouteLayout
      title="Calculator"
      description="Standard calculator mode + 100-question arithmetic practice mode."
    >
      <section className="rounded-3xl border border-indigo-100 bg-white/95 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('standard')}
            className="rounded-full border border-indigo-300 bg-indigo-600 px-4 py-2 text-sm font-black text-white"
          >
            Standard Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('practice')}
            className="rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 hover:bg-amber-200"
          >
            Practice Mode (100 Questions)
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mx-auto max-w-xl space-y-4">
          <div className="rounded-2xl border border-slate-300 bg-slate-900 px-4 py-5 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Expression</p>
            <p className="mt-1 min-h-[24px] text-sm font-semibold text-slate-200">{toReadableExpression(expression) || '0'}</p>
            <p className="mt-2 text-3xl font-black text-white">{displayValue}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <button type="button" onClick={clearAll} className="rounded-xl bg-rose-100 px-3 py-3 text-sm font-black text-rose-700 hover:bg-rose-200">C</button>
            <button type="button" onClick={backspace} className="rounded-xl bg-slate-100 px-3 py-3 text-sm font-black text-slate-700 hover:bg-slate-200">⌫</button>
            <button type="button" onClick={() => appendOperator('/')} className="rounded-xl bg-indigo-100 px-3 py-3 text-sm font-black text-indigo-800 hover:bg-indigo-200">/</button>
            <button type="button" onClick={() => appendOperator('*')} className="rounded-xl bg-indigo-100 px-3 py-3 text-sm font-black text-indigo-800 hover:bg-indigo-200">x</button>

            <button type="button" onClick={() => appendDigit('7')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">7</button>
            <button type="button" onClick={() => appendDigit('8')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">8</button>
            <button type="button" onClick={() => appendDigit('9')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">9</button>
            <button type="button" onClick={() => appendOperator('-')} className="rounded-xl bg-indigo-100 px-3 py-3 text-sm font-black text-indigo-800 hover:bg-indigo-200">-</button>

            <button type="button" onClick={() => appendDigit('4')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">4</button>
            <button type="button" onClick={() => appendDigit('5')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">5</button>
            <button type="button" onClick={() => appendDigit('6')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">6</button>
            <button type="button" onClick={() => appendOperator('+')} className="rounded-xl bg-indigo-100 px-3 py-3 text-sm font-black text-indigo-800 hover:bg-indigo-200">+</button>

            <button type="button" onClick={() => appendDigit('1')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">1</button>
            <button type="button" onClick={() => appendDigit('2')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">2</button>
            <button type="button" onClick={() => appendDigit('3')} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">3</button>
            <button type="button" onClick={handleEvaluate} className="row-span-2 rounded-xl bg-emerald-500 px-3 py-3 text-sm font-black text-white hover:bg-emerald-600">=</button>

            <button type="button" onClick={() => appendDigit('0')} className="col-span-2 rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">0</button>
            <button type="button" onClick={appendDecimal} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">.</button>
          </div>

          <p className={`text-sm font-bold ${statusMessage ? 'text-indigo-700' : 'text-slate-500'}`}>
            {statusMessage || 'Tip: Use Practice Mode for the 100-question test with gems rewards.'}
          </p>
        </div>
      </section>
    </ParentZoneRouteLayout>
  );
}
