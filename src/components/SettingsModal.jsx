import React, { useEffect, useState } from 'react';

/**
 * Settings modal with parent gate:
 * Views: 'main' | 'pin_setup' | 'pin_auth' | 'pin_reset' | 'parent'
 */
export default function SettingsModal({
  open,
  onClose,
  themes = [{ key: 'light', label: 'Light' }],
  themeKey,
  onThemeChange,
  onLogin,
  onCreateAccount,
  onLogout,
  user,
  isAdmin = false,
  onGoToAdmin,
}) {
  const [currentView, setCurrentView] = useState('main');
  const [savedPin, setSavedPin] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || 'unset';
    };
  }, [open]);

  // Load saved PIN when modal opens
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('aiko_parent_pin');
      if (stored) setSavedPin(stored);
    }
  }, [open]);

  // Persist PIN whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (savedPin) {
      window.localStorage.setItem('aiko_parent_pin', savedPin);
    } else {
      window.localStorage.removeItem('aiko_parent_pin');
    }
  }, [savedPin]);

  const handleClose = () => {
    setCurrentView('main');
    setPinInput('');
    setMathAnswer('');
    setShowPin(false);
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleParentZoneClick = () => {
    if (savedPin) {
      setCurrentView('pin_auth');
    } else {
      setCurrentView('pin_setup');
    }
    setPinInput('');
    setShowPin(false);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4) return;
    setPinInput(val);

    if (val.length === 4) {
      setTimeout(() => {
        if (currentView === 'pin_setup') {
          setSavedPin(val);
          setPinInput('');
          setShowPin(false);
          setCurrentView('parent');
        } else if (currentView === 'pin_auth') {
          if (val === savedPin) {
            setPinInput('');
            setShowPin(false);
            setCurrentView('parent');
          } else {
            alert('Wrong PIN! Try again.');
            setPinInput('');
          }
        }
      }, 200);
    }
  };

  const handleResetPin = () => {
    if (mathAnswer === '56') {
      setSavedPin(null);
      setPinInput('');
      setMathAnswer('');
      setShowPin(false);
      setCurrentView('pin_setup');
    } else {
      alert('Incorrect answer. Only parents can reset the PIN.');
      setMathAnswer('');
    }
  };

  if (!open) return null;

  const HeaderTitle = () => {
    if (currentView === 'main') return 'AikoKidzTV Settings';
    if (['pin_setup', 'pin_auth', 'pin_reset'].includes(currentView)) return 'Parent Gate';
    return 'Parent Zone Access';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="z-10 shrink-0 border-b border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-800 sm:text-2xl">
              {HeaderTitle()}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-gray-100 px-4 py-2 font-bold text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-[400px] flex-1 overflow-y-auto p-6">
          {currentView === 'main' && (
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-1">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Display Preferences</h3>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => onThemeChange?.(theme.key)}
                      className={`rounded-xl border-2 py-3 font-bold shadow-sm transition-colors ${
                        theme.key === themeKey
                          ? 'border-pink-200 bg-pink-50 text-gray-800'
                          : 'border-gray-100 bg-white text-gray-800 hover:border-gray-200'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>

              </div>

              <div className="w-full md:w-1/3">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Account & Security</h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onCreateAccount}
                    className="rounded-xl border-2 border-gray-100 bg-white py-3 font-bold text-gray-800"
                  >
                    Create / Switch Account
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onGoToAdmin?.();
                        handleClose();
                      }}
                      className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 font-extrabold text-white"
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={handleParentZoneClick}
                    className="mt-1 rounded-xl bg-indigo-600 py-3 font-extrabold text-white hover:bg-indigo-700"
                  >
                    Parent Zone
                  </button>

                  {user ? (
                    <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <button
                        onClick={() => {
                          onLogout?.();
                          handleClose();
                        }}
                        className="w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-left font-bold text-amber-900 transition hover:bg-amber-100"
                      >
                        Logout
                      </button>
                      <p className="mt-2 px-1 text-[11px] font-semibold text-amber-800/90">
                        Warning: This safely signs you out from this device.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={onLogin}
                      className="rounded-xl border-2 border-pink-200 bg-pink-50 py-3 font-bold text-pink-700 transition-colors hover:bg-pink-100"
                    >
                      Log In with OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {(currentView === 'pin_setup' || currentView === 'pin_auth') && (
            <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center pt-4">
              <h3 className="mb-2 text-2xl font-bold text-indigo-900">
                {currentView === 'pin_setup' ? 'Create a 4-Digit PIN' : 'Enter Parent PIN'}
              </h3>
              <p className="mb-6 text-center text-sm text-gray-500">
                {currentView === 'pin_setup'
                  ? 'Keep kids out of parent controls. Type a 4-digit PIN below.'
                  : 'Enter your 4-digit PIN to access Parent Zone settings.'}
              </p>

              {currentView === 'pin_setup' && (
                <div className="mb-8 w-full rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-3">
                  <p className="text-sm font-bold text-amber-800">Take a screenshot!</p>
                  <p className="mt-1 text-xs text-amber-700">Please screenshot your PIN so you don&apos;t forget.</p>
                </div>
              )}

              <div className="relative mt-2 inline-block">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={handlePinChange}
                  placeholder="****"
                  autoFocus
                  className="w-56 rounded-2xl border-2 border-gray-300 bg-gray-50 p-4 text-center font-mono text-4xl tracking-[0.4em] transition-all placeholder:tracking-normal focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-60 transition-opacity hover:opacity-100"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="mt-10 flex w-full justify-center gap-8">
                <button
                  onClick={() => {
                    setCurrentView('main');
                    setPinInput('');
                    setShowPin(false);
                  }}
                  className="font-bold text-gray-500 hover:text-gray-800 hover:underline"
                >
                  Cancel
                </button>
                {currentView === 'pin_auth' && (
                  <button
                    onClick={() => {
                      setPinInput('');
                      setShowPin(false);
                      setCurrentView('pin_reset');
                    }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Forgot PIN?
                  </button>
                )}
              </div>
            </div>
          )}

          {currentView === 'pin_reset' && (
            <div className="mx-auto max-w-sm text-center">
              <h3 className="mb-2 text-2xl font-bold text-indigo-900">Reset Parent PIN</h3>
              <p className="mb-6 text-sm text-gray-600">Solve this math problem to prove you are a parent.</p>

              <div className="mb-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-6">
                <span className="text-3xl font-extrabold tracking-widest text-indigo-900">8 x 7 = ?</span>
              </div>

              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="Answer"
                className="mb-4 w-full rounded-xl border-2 border-gray-200 p-4 text-center text-xl focus:border-indigo-500 focus:outline-none"
              />

              <button
                onClick={handleResetPin}
                className="mb-3 w-full rounded-xl bg-indigo-600 py-4 font-bold text-white hover:bg-indigo-700"
              >
                Verify & Reset
              </button>
              <button onClick={() => setCurrentView('pin_auth')} className="w-full font-bold text-gray-500 hover:underline">
                Back to Login
              </button>
            </div>
          )}

          {currentView === 'parent' && (
            <div className="flex flex-col gap-6">
              <button onClick={() => setCurrentView('main')} className="mb-2 self-start font-bold text-indigo-600 hover:underline">
                Back to Settings
              </button>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h4 className="mb-2 text-lg font-extrabold text-gray-900">PIN Controls</h4>
                <p className="mb-4 text-sm text-gray-600">Manage your parent gate PIN for secure access.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setPinInput('');
                      setCurrentView('pin_setup');
                    }}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-800 hover:border-indigo-200"
                  >
                    Set New PIN
                  </button>
                  <button
                    onClick={() => {
                      setSavedPin(null);
                      setPinInput('');
                    }}
                    className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 font-bold text-red-700 hover:bg-red-100"
                  >
                    Remove PIN
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-900">
                Account deletion is available only inside the dedicated Parent Dashboard after PIN verification.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

