import React, { useEffect, useMemo, useState } from 'react';
import { useKidsMode } from '../context/KidsModeContext';
import { useParentControls } from '../context/ParentControlsContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const PARENT_PIN_STORAGE_KEY = 'aiko_parent_pin';
const EYE_TRACKER_STORAGE_KEY = 'aiko_eye_health_tracker_v1';
const CHILD_PROFILE_STORAGE_KEY = 'aiko_child_profile_v1';
const WELLBEING_USAGE_STORAGE_KEY = 'aiko_wellbeing_usage_v1';
const WELLBEING_SYNC_EVENT = 'aiko:wellbeing-sync';
const DAILY_LIMIT_MINUTES = 300;
const PARENT_ZONE_ACTIVITY_ROUTES = [
  { id: 'tables', label: 'Tables', path: '/parent-zone/tables', emoji: '\u{1F9EE}' },
  { id: 'numbers', label: 'Numbers', path: '/parent-zone/numbers', emoji: '\u{1F522}' },
  { id: 'junior-law', label: 'Junior Law', path: '/parent-zone/junior-law', emoji: '\u2696\uFE0F' },
  { id: 'junior-rights', label: 'Junior Rights', path: '/parent-zone/rights', emoji: '\u{1F6E1}\uFE0F' },
  { id: 'science', label: 'Science', path: '/parent-zone/junior-science', emoji: '\u{1F52C}' },
  { id: 'calculator', label: 'Calculator', path: '/parent-zone/calculator', emoji: '\u{1F9E0}' },
  { id: 'cosmic-journey', label: 'Cosmic Journey', path: '/parent-zone/cosmic-journey', emoji: '\u{1F680}' },
];

const mockRecentActivities = [
  { name: 'Magic Art', minutes: 0, emoji: '\u{1F3A8}', tone: 'from-pink-100 to-rose-100' },
  { name: 'Animal Safari', minutes: 0, emoji: '\u{1F981}', tone: 'from-amber-100 to-yellow-100' },
  { name: 'Story Studio', minutes: 0, emoji: '\u2728', tone: 'from-sky-100 to-cyan-100' },
  { name: 'Color Splash', minutes: 0, emoji: '\u{1F308}', tone: 'from-violet-100 to-fuchsia-100' },
];

const getTodayDateStamp = () => new Date().toISOString().slice(0, 10);

const normalizeWellbeingUsage = (raw = {}) => {
  const today = getTodayDateStamp();
  const sourceDate = typeof raw?.date === 'string' ? raw.date : today;
  const parsedMinutes = Number(raw?.minutesUsed);

  return {
    date: today,
    minutesUsed: sourceDate === today && Number.isFinite(parsedMinutes) ? Math.max(0, parsedMinutes) : 0,
    limitEnabled: Boolean(raw?.limitEnabled),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
};

const readWellbeingUsage = () => {
  if (typeof window === 'undefined') return normalizeWellbeingUsage();
  try {
    const raw = window.localStorage.getItem(WELLBEING_USAGE_STORAGE_KEY);
    return raw ? normalizeWellbeingUsage(JSON.parse(raw)) : normalizeWellbeingUsage();
  } catch {
    return normalizeWellbeingUsage();
  }
};

const writeWellbeingUsage = (nextState) => {
  const normalized = normalizeWellbeingUsage({
    ...nextState,
    updatedAt: new Date().toISOString(),
  });

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(WELLBEING_USAGE_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(WELLBEING_SYNC_EVENT));
  }

  return normalized;
};

const formatMinutes = (minutes = 0) => {
  const whole = Math.max(0, Math.floor(minutes));
  const hrs = Math.floor(whole / 60);
  const mins = whole % 60;
  return `${hrs}h ${mins}m`;
};

const isMissingColumnError = (error, columnNames = []) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  if (!text) return false;
  return columnNames.some((columnName) => {
    const name = String(columnName || '').toLowerCase();
    return name && text.includes(name) && (text.includes('column') || text.includes('schema cache'));
  });
};

export default function ParentZone({ onExit, onLogout, onDeleteAccount, skipPinGate = false }) {
  const { user, profile, fetchProfile } = useAuth();
  const [currentView, setCurrentView] = useState(skipPinGate ? 'dashboard' : 'pin_setup'); // pin_setup | pin_auth | pin_reset | dashboard
  const [savedPin, setSavedPin] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [deleteInput, setDeleteInput] = useState('');

  const [eyeHealth, setEyeHealth] = useState({
    rightEyeOD: '',
    leftEyeOS: '',
    updatedAt: null,
  });
  const [childDetails, setChildDetails] = useState({
    childHeight: '',
    childWeight: '',
    childBirthdate: '',
  });
  const [eyeSaveStatus, setEyeSaveStatus] = useState('');
  const [wellbeingUsage, setWellbeingUsage] = useState(() => readWellbeingUsage());
  const { isKidsModeOn, toggleKidsMode } = useKidsMode();
  const { isTestMode, setIsTestMode } = useParentControls();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedPin = window.localStorage.getItem(PARENT_PIN_STORAGE_KEY);
    if (storedPin) {
      setSavedPin(storedPin);
      if (!skipPinGate) {
        setCurrentView('pin_auth');
      }
    } else if (skipPinGate) {
      setCurrentView('dashboard');
    }

    try {
      const rawEye = window.localStorage.getItem(EYE_TRACKER_STORAGE_KEY);
      if (rawEye) {
        const parsed = JSON.parse(rawEye);
        setEyeHealth({
          rightEyeOD: parsed?.rightEyeOD ?? '',
          leftEyeOS: parsed?.leftEyeOS ?? '',
          updatedAt: parsed?.updatedAt ?? null,
        });
      }

      const rawChild = window.localStorage.getItem(CHILD_PROFILE_STORAGE_KEY);
      if (rawChild) {
        const parsedChild = JSON.parse(rawChild);
        setChildDetails({
          childHeight: parsedChild?.childHeight ? String(parsedChild.childHeight) : '',
          childWeight: parsedChild?.childWeight ? String(parsedChild.childWeight) : '',
          childBirthdate: parsedChild?.childBirthdate ? String(parsedChild.childBirthdate) : '',
        });
      }
    } catch {
      // ignore invalid localStorage payloads
    }
  }, [skipPinGate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (savedPin) {
      window.localStorage.setItem(PARENT_PIN_STORAGE_KEY, savedPin);
    } else {
      window.localStorage.removeItem(PARENT_PIN_STORAGE_KEY);
    }
  }, [savedPin]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncUsage = () => setWellbeingUsage(readWellbeingUsage());
    window.addEventListener('storage', syncUsage);
    window.addEventListener(WELLBEING_SYNC_EVENT, syncUsage);

    return () => {
      window.removeEventListener('storage', syncUsage);
      window.removeEventListener(WELLBEING_SYNC_EVENT, syncUsage);
    };
  }, []);

  useEffect(() => {
    setChildDetails((prev) => ({
      childHeight:
        profile?.child_height !== undefined && profile?.child_height !== null && `${profile.child_height}`.trim()
          ? String(profile.child_height)
          : prev.childHeight,
      childWeight:
        profile?.child_weight !== undefined && profile?.child_weight !== null && `${profile.child_weight}`.trim()
          ? String(profile.child_weight)
          : prev.childWeight,
      childBirthdate:
        profile?.child_birthdate !== undefined &&
        profile?.child_birthdate !== null &&
        `${profile.child_birthdate}`.trim()
          ? String(profile.child_birthdate).slice(0, 10)
          : prev.childBirthdate,
    }));
  }, [profile?.child_birthdate, profile?.child_height, profile?.child_weight]);

  const totalMockMinutes = useMemo(
    () => mockRecentActivities.reduce((sum, item) => sum + item.minutes, 0),
    []
  );

  const configuredLimitMinutes = wellbeingUsage.limitEnabled ? DAILY_LIMIT_MINUTES : 0;
  const usageProgress = configuredLimitMinutes
    ? Math.min(100, Math.round(((wellbeingUsage.minutesUsed || 0) / configuredLimitMinutes) * 100))
    : 0;
  const remainingMinutes = wellbeingUsage.limitEnabled
    ? Math.max(0, DAILY_LIMIT_MINUTES - (wellbeingUsage.minutesUsed || 0))
    : 0;
  const isTimeLimitReached = wellbeingUsage.limitEnabled && wellbeingUsage.minutesUsed >= DAILY_LIMIT_MINUTES;
  const eyeStatusTone = eyeSaveStatus.toLowerCase().includes('failed')
    ? 'text-red-700 bg-red-50 border-red-200'
    : eyeSaveStatus.toLowerCase().includes('locally')
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

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
          setCurrentView('dashboard');
        } else if (currentView === 'pin_auth') {
          if (val === savedPin) {
            setPinInput('');
            setShowPin(false);
            setCurrentView('dashboard');
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
      setMathAnswer('');
      setPinInput('');
      setShowPin(false);
      setCurrentView('pin_setup');
    } else {
      alert('Incorrect answer. Try again.');
      setMathAnswer('');
    }
  };

  const handleSaveEyeHealth = async (e) => {
    e.preventDefault();
    const eyePayload = {
      rightEyeOD: eyeHealth.rightEyeOD.trim(),
      leftEyeOS: eyeHealth.leftEyeOS.trim(),
      updatedAt: new Date().toISOString(),
    };
    const childPayload = {
      child_height: childDetails.childHeight.trim() || null,
      child_weight: childDetails.childWeight.trim() || null,
      child_birthdate: childDetails.childBirthdate || null,
    };

    setEyeHealth(eyePayload);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(EYE_TRACKER_STORAGE_KEY, JSON.stringify(eyePayload));
      window.localStorage.setItem(
        CHILD_PROFILE_STORAGE_KEY,
        JSON.stringify({
          childHeight: childDetails.childHeight.trim(),
          childWeight: childDetails.childWeight.trim(),
          childBirthdate: childDetails.childBirthdate,
          updatedAt: new Date().toISOString(),
        })
      );
    }

    if (user?.id) {
      const { error } = await supabase.from('profiles').update(childPayload).eq('id', user.id);

      if (error) {
        if (isMissingColumnError(error, ['child_height', 'child_weight', 'child_birthdate'])) {
          setEyeSaveStatus('Saved locally. Add child fields in profiles table to sync cloud data.');
        } else {
          setEyeSaveStatus(`Save failed: ${error.message || 'Unknown error'}`);
        }
        window.setTimeout(() => setEyeSaveStatus(''), 3200);
        return;
      }

      await fetchProfile?.(user.id);
    }

    setEyeSaveStatus('Saved successfully');
    window.setTimeout(() => setEyeSaveStatus(''), 1800);
  };

  const handleLimitToggle = () => {
    setWellbeingUsage((prev) =>
      writeWellbeingUsage({
        ...prev,
        limitEnabled: !prev.limitEnabled,
      })
    );
  };

  const handleResetTodayUsage = () => {
    const confirmed = window.confirm('Reset today\'s screen time tracker to 0 minutes?');
    if (!confirmed) return;
    setWellbeingUsage((prev) =>
      writeWellbeingUsage({
        ...prev,
        date: getTodayDateStamp(),
        minutesUsed: 0,
      })
    );
  };

  const handleDeleteAccount = () => {
    if (deleteInput !== 'DELETE') return;
    onDeleteAccount?.();
    onLogout?.();
    alert('Account deletion request submitted.');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col font-sans">
      <header className="bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-indigo-900 flex items-center gap-3">
          {'\u{1F6E1}\uFE0F'} Parent Dashboard
          <span className="hidden sm:inline-block text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
            Secure Zone
          </span>
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link
            to="/parent-zone/cosmic-journey"
            className="inline-flex items-center rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 px-4 py-2 text-sm font-black text-white shadow-[0_8px_22px_rgba(59,130,246,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(59,130,246,0.45)]"
          >
            🚀 Cosmic Journey
          </Link>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-4 sm:px-6 py-2 rounded-xl font-bold transition-colors"
          >
            Exit to Kids Zone
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 lg:p-10 flex flex-col">
        {(currentView === 'pin_setup' || currentView === 'pin_auth') && (
          <div className="flex-1 flex flex-col items-center justify-center mt-6">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                {'\u{1F512}'}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {currentView === 'pin_setup' ? 'Set Parent PIN' : 'Enter PIN'}
              </h2>
              <p className="text-gray-500 mb-8 font-medium">
                {currentView === 'pin_setup'
                  ? 'Create a 4-digit PIN to secure parent controls.'
                  : 'Welcome back. Please enter your 4-digit PIN.'}
              </p>

              {currentView === 'pin_setup' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 text-left">
                  <p className="text-amber-800 text-sm font-bold flex items-center gap-2">{'\u{1F4F8}'} Take a screenshot!</p>
                  <p className="text-amber-700 text-xs mt-1">Please screenshot your PIN so you don&apos;t forget it.</p>
                </div>
              )}

              <div className="relative inline-block w-full">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={handlePinChange}
                  placeholder="****"
                  autoFocus
                  className="w-full text-center text-4xl sm:text-5xl tracking-[0.3em] sm:tracking-[0.5em] font-mono bg-slate-50 border-2 border-slate-200 p-4 sm:p-6 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:tracking-normal placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-50 hover:opacity-100 transition-opacity"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? '\u{1F648}' : '\u{1F441}\uFE0F'}
                </button>
              </div>

              {currentView === 'pin_auth' && (
                <button onClick={() => setCurrentView('pin_reset')} className="mt-8 text-indigo-600 font-bold hover:underline">
                  Forgot PIN?
                </button>
              )}
            </div>
          </div>
        )}

        {currentView === 'pin_reset' && (
          <div className="flex-1 flex flex-col items-center justify-center mt-6">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Math Guard</h2>
              <p className="text-gray-500 mb-8 font-medium">Solve this to prove you are a parent.</p>

              <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 mb-6">
                <span className="text-4xl font-extrabold text-indigo-900 tracking-widest">8 x 7 = ?</span>
              </div>

              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full text-center text-2xl p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none mb-6"
              />

              <button
                onClick={handleResetPin}
                className="w-full bg-indigo-600 text-white font-extrabold text-lg py-4 rounded-xl hover:bg-indigo-700 shadow-md mb-4"
              >
                Verify & Reset PIN
              </button>
              <button onClick={() => setCurrentView('pin_auth')} className="w-full text-gray-500 font-bold hover:underline">
                Back to Login
              </button>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="flex flex-col gap-8 pb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Digital Wellbeing & Analytics</h2>
              <p className="text-gray-500 mt-1">Track eye care, monitor play time, and manage daily usage limits.</p>
            </div>

            <section className="clay-container bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Practice Container</h3>
                  <p className="text-gray-500 mt-1">
                    Parent Zone activities now open on dedicated routes with one activity per page.
                  </p>
                </div>

                <div className="space-y-3">
                  {PARENT_ZONE_ACTIVITY_ROUTES.map((activity) => (
                    <Link
                      key={activity.id}
                      to={activity.path}
                      className="clay-card w-full flex items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3 text-left font-black text-indigo-900 hover:-translate-y-0.5 transition"
                    >
                      <span>{activity.label}</span>
                      <span className="text-xl">{activity.emoji}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Kids Mode Control</h3>
                  <p className="text-gray-500 mt-1">
                    Only Parent Zone can change Kids Mode and Test Mode behavior across the app.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-slate-50 p-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">Kids Mode</p>
                      <p className={`text-xs font-semibold ${isKidsModeOn ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {isKidsModeOn ? 'ON' : 'OFF'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleKidsMode}
                      aria-pressed={isKidsModeOn}
                      aria-label="Toggle Kids Mode"
                      className={`relative h-6 w-12 rounded-full transition-all ${
                        isKidsModeOn ? 'bg-pink-400' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isKidsModeOn ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-slate-50 p-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-black">Test Mode</p>
                      <p className="text-sm font-black text-black">
                        {isTestMode ? 'ON (Answers Hidden)' : 'OFF (Answers Visible)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTestMode((prev) => !prev)}
                      aria-pressed={isTestMode}
                      aria-label="Toggle Test Mode"
                      className={`relative h-6 w-12 rounded-full transition-all ${
                        isTestMode ? 'bg-amber-400' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isTestMode ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">Today&apos;s Screen Time</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{formatMinutes(wellbeingUsage.minutesUsed)}</p>
                <p className="mt-1 text-sm text-slate-500">Tracked locally for today ({getTodayDateStamp()})</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">5-Hour Limit Status</p>
                <p className={`mt-2 text-2xl font-black ${wellbeingUsage.limitEnabled ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {wellbeingUsage.limitEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className={`mt-1 text-sm font-semibold ${isTimeLimitReached ? 'text-red-600' : 'text-slate-500'}`}>
                  {isTimeLimitReached ? 'Time Up screen is active' : `${formatMinutes(remainingMinutes)} remaining`}
                </p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">Recent Play Snapshot</p>
                <p className="mt-2 text-3xl font-black text-indigo-700">{totalMockMinutes} mins</p>
                <p className="mt-1 text-sm text-slate-500">Mock analytics preview (local UI only)</p>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_1.25fr] gap-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Eye Health Tracker</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Save Left Eye (OS), Right Eye (OD), and child profile details in one place.
                    </p>
                  </div>
                  <div className="text-3xl">{'\u{1F453}'}</div>
                </div>

                <form onSubmit={handleSaveEyeHealth} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">Right Eye (OD)</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={eyeHealth.rightEyeOD}
                        onChange={(e) => setEyeHealth((prev) => ({ ...prev, rightEyeOD: e.target.value }))}
                        placeholder="e.g. -1.25"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.04),inset_-4px_-4px_10px_rgba(2,6,23,0.7)] placeholder:text-slate-400 focus:outline-none focus:border-cyan-300"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">Left Eye (OS)</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={eyeHealth.leftEyeOS}
                        onChange={(e) => setEyeHealth((prev) => ({ ...prev, leftEyeOS: e.target.value }))}
                        placeholder="e.g. -1.00"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.04),inset_-4px_-4px_10px_rgba(2,6,23,0.7)] placeholder:text-slate-400 focus:outline-none focus:border-cyan-300"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">Height (cm)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={childDetails.childHeight}
                        onChange={(e) => setChildDetails((prev) => ({ ...prev, childHeight: e.target.value }))}
                        placeholder="Height (cm)"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.04),inset_-4px_-4px_10px_rgba(2,6,23,0.7)] placeholder:text-slate-400 focus:outline-none focus:border-cyan-300"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">Weight (kg)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={childDetails.childWeight}
                        onChange={(e) => setChildDetails((prev) => ({ ...prev, childWeight: e.target.value }))}
                        placeholder="Weight (kg)"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.04),inset_-4px_-4px_10px_rgba(2,6,23,0.7)] placeholder:text-slate-400 focus:outline-none focus:border-cyan-300"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">Birthdate (YYYY-MM-DD)</span>
                      <input
                        type="date"
                        value={childDetails.childBirthdate}
                        onChange={(e) => setChildDetails((prev) => ({ ...prev, childBirthdate: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-100 shadow-[inset_2px_2px_8px_rgba(255,255,255,0.04),inset_-4px_-4px_10px_rgba(2,6,23,0.7)] focus:outline-none focus:border-cyan-300"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white font-extrabold px-5 py-3 rounded-xl hover:bg-indigo-700 shadow-sm"
                    >
                      Save Changes
                    </button>
                    {eyeSaveStatus && (
                      <span className={`text-sm font-bold border px-3 py-2 rounded-xl ${eyeStatusTone}`}>
                        {'\u2705'} {eyeSaveStatus}
                      </span>
                    )}
                  </div>

                  {eyeHealth.updatedAt && (
                    <p className="text-xs text-gray-500">
                      Last saved: {new Date(eyeHealth.updatedAt).toLocaleString()}
                    </p>
                  )}
                </form>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Activity Report Card</h3>
                    <p className="text-sm text-gray-500 mt-1">Today&apos;s screen time and recent activities snapshot.</p>
                  </div>
                  <div className="text-3xl">{'\u{1F4CA}'}</div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 p-5 mb-5">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-indigo-500">Today&apos;s Screen Time</p>
                      <p className="mt-2 text-4xl font-black text-indigo-900">{formatMinutes(wellbeingUsage.minutesUsed)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-700">
                        {`Limit: ${formatMinutes(configuredLimitMinutes)}`}
                      </p>
                      <p className={`text-xs font-semibold ${isTimeLimitReached ? 'text-red-600' : 'text-indigo-500'}`}>
                        {isTimeLimitReached ? 'Time Up overlay is active' : `${usageProgress}% of limit`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-white/80 overflow-hidden border border-indigo-100">
                    <div
                      className={`h-full rounded-full transition-all ${isTimeLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-400 to-sky-500'}`}
                      style={{ width: `${usageProgress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Recently Played Activities</p>
                  <div className="space-y-3">
                    {mockRecentActivities.map((activity) => (
                      <div
                        key={activity.name}
                        className={`rounded-2xl border border-white bg-gradient-to-r ${activity.tone} p-4 shadow-sm`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 text-2xl shadow-sm">
                              {activity.emoji}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{activity.name}</p>
                              <p className="text-xs text-slate-500">Today&apos;s play session</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900">{activity.minutes} mins</p>
                            <p className="text-xs font-semibold text-slate-500">Mock data</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">5-Hour Smart Lock</h3>
                  <p className="text-gray-500 mt-1">
                    Enable a daily 5-hour (300 minute) limit. When reached, the kids&apos; UI is hidden and replaced with the friendly Time Up screen until tomorrow.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">Enable 5-Hour Daily Limit</p>
                    <p className={`text-xs font-semibold ${wellbeingUsage.limitEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {wellbeingUsage.limitEnabled ? 'Smart Lock ON' : 'Smart Lock OFF'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLimitToggle}
                    aria-pressed={wellbeingUsage.limitEnabled}
                    className={`relative h-6 w-12 rounded-full transition-all ${
                      wellbeingUsage.limitEnabled
                        ? 'bg-emerald-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        wellbeingUsage.limitEnabled ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Limit</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatMinutes(configuredLimitMinutes)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Used Today</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatMinutes(wellbeingUsage.minutesUsed)}</p>
                </div>
                <div className={`rounded-2xl border p-4 ${isTimeLimitReached ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  <p className={`text-xs font-black uppercase tracking-wider ${isTimeLimitReached ? 'text-red-400' : 'text-emerald-400'}`}>Status</p>
                  <p className={`mt-2 text-2xl font-black ${isTimeLimitReached ? 'text-red-700' : 'text-emerald-700'}`}>
                    {isTimeLimitReached ? 'Time Up' : 'Active'}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={handleResetTodayUsage}
                  className="px-5 py-3 rounded-xl font-bold bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Reset Today&apos;s Screen Time
                </button>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Parent Zone Settings</h3>
                  <p className="text-gray-500 mt-1">Logout and account deletion are restricted to this parent-only section.</p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-slate-100 border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">PIN Controls</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentView('pin_setup')}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100"
                >
                  Change PIN
                </button>
                <button
                  onClick={() => {
                    setSavedPin(null);
                    setPinInput('');
                    setCurrentView('pin_setup');
                  }}
                  className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100"
                >
                  Remove PIN
                </button>
              </div>
            </section>

            <section className="bg-red-50 p-6 sm:p-8 rounded-3xl border-2 border-red-200 mt-2">
              <h3 className="text-xl font-extrabold text-red-700 flex items-center gap-2 mb-2">{'\u{1F6A8}'} Danger Zone</h3>
              <p className="text-red-900 font-medium mb-6 text-sm sm:text-base">
                Warning: Permanent action. Once deleted, we cannot undo this. All unlocked colors, gems, and account progress will be permanently erased.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full sm:w-auto flex-1 px-6 py-4 rounded-xl border-2 border-red-300 focus:outline-none focus:border-red-500 font-mono text-lg"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE'}
                  className={`w-full sm:w-auto px-10 py-4 rounded-xl font-extrabold text-lg transition-colors ${
                    deleteInput === 'DELETE'
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-xl'
                      : 'bg-red-200 text-red-400 cursor-not-allowed'
                  }`}
                >
                  Delete My Account
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
