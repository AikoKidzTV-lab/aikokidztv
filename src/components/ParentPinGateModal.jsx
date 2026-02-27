import React, { useEffect, useState } from 'react';

const PARENT_PIN_STORAGE_KEY = 'aiko_parent_pin';

export default function ParentPinGateModal({ open, onClose, onUnlocked }) {
  const [savedPin, setSavedPin] = useState('');
  const [view, setView] = useState('auth'); // setup | auth | reset
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(PARENT_PIN_STORAGE_KEY) || '';
    setSavedPin(stored);
    setView(stored ? 'auth' : 'setup');
    setPinInput('');
    setShowPin(false);
    setMathAnswer('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || 'unset';
    };
  }, [open]);

  const persistPin = (nextPin) => {
    setSavedPin(nextPin);
    if (typeof window === 'undefined') return;
    if (nextPin) {
      window.localStorage.setItem(PARENT_PIN_STORAGE_KEY, nextPin);
    } else {
      window.localStorage.removeItem(PARENT_PIN_STORAGE_KEY);
    }
  };

  const finishUnlock = () => {
    setPinInput('');
    setShowPin(false);
    onUnlocked?.();
    onClose?.();
  };

  const handlePinChange = (e) => {
    const next = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPinInput(next);
    if (next.length !== 4) return;

    window.setTimeout(() => {
      if (view === 'setup') {
        persistPin(next);
        finishUnlock();
        return;
      }
      if (view === 'auth') {
        if (next === savedPin) {
          finishUnlock();
        } else {
          alert('Wrong PIN! Try again.');
          setPinInput('');
        }
      }
    }, 140);
  };

  const handleResetPin = () => {
    if (mathAnswer === '56') {
      persistPin('');
      setMathAnswer('');
      setPinInput('');
      setShowPin(false);
      setView('setup');
      return;
    }
    alert('Incorrect answer. Only parents can reset the PIN.');
    setMathAnswer('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/55 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.28)] dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-sky-100 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
              Parent Lock
            </p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {view === 'reset' ? 'Reset 4-Digit PIN' : 'Enter Parent PIN'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          {view !== 'reset' ? (
            <>
              <div className="mb-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
                <div className="mb-2 text-3xl">🛡️🔢</div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {view === 'setup'
                    ? 'Create a 4-digit PIN for Parent Zone access. Please remember it.'
                    : 'Enter your 4-digit Parent PIN to open the Parent Zone.'}
                </p>
              </div>

              {view === 'setup' && (
                <div className="mb-4 rounded-xl border-l-4 border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-bold">📸 Screenshot your PIN</p>
                  <p className="text-xs font-medium text-amber-800">
                    You can reset it later with the math challenge if needed.
                  </p>
                </div>
              )}

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={handlePinChange}
                  placeholder="****"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 pr-14 text-center font-mono text-4xl tracking-[0.35em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xl opacity-70 hover:opacity-100"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`h-2.5 w-2.5 rounded-full ${
                      idx < pinInput.length ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {view === 'auth' && (
                <button
                  onClick={() => {
                    setMathAnswer('');
                    setView('reset');
                  }}
                  className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Forgot PIN? Reset with Parent Math Check
                </button>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
                <div className="mb-2 text-3xl">🧮👨‍👩‍👧</div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Solve the quick math check to reset your Parent Zone PIN.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Math Challenge
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">8 × 7 = ?</p>
              </div>

              <input
                type="number"
                inputMode="numeric"
                autoFocus
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="Type answer"
                className="mt-4 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-2xl font-bold text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleResetPin}
                  className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow hover:bg-violet-700"
                >
                  Verify & Reset PIN
                </button>
                <button
                  onClick={() => setView(savedPin ? 'auth' : 'setup')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

