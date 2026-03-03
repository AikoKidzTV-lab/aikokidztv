﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import React, { useState, useMemo, useEffect } from 'react';
import LandingPageHabitat from './components/LandingPageHabitat';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import HeaderNavbar from './components/HeaderNavbar';
import KidsMascot from './components/KidsMascot';
import AlphabetsModule from './components/modules/AlphabetsModule';
import NumbersModule from './components/modules/NumbersModule';
import ColorsModule from './components/modules/ColorsModule';
import SafariModule from './components/modules/SafariModule';
import MagicArt from './components/MagicArt';
import ColoringBook from './components/ColoringBook';
import ParentZone from './components/ParentZone';
import VideoZone from './components/VideoZone';
import StoryReader from './components/StoryReader';
import ParentPinGateModal from './components/ParentPinGateModal';
import Settings from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import Projects from './components/Projects';
import BlenderCredit from './components/pages/BlenderCredit';
import PoemsPage from './components/PoemsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KidsModeProvider, useKidsMode } from './context/KidsModeContext';
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext';
import { Gem, ChevronDown, Sparkles, LogOut, Bell } from 'lucide-react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ADMIN_EMAIL, isAdminEmail } from './utils/admin';
import ParentZoneHubPage from './components/parentZone/ParentZoneHubPage';
import ParentZoneTablesPage from './components/parentZone/ParentZoneTablesPage';
import ParentZoneNumbersPage from './components/parentZone/ParentZoneNumbersPage';
import ParentZoneJuniorLawPage from './components/parentZone/ParentZoneJuniorLawPage';
import ParentZoneJuniorRightsPage from './components/parentZone/ParentZoneJuniorRightsPage';
import ParentZoneSciencePage from './components/parentZone/ParentZoneSciencePage';
import ParentZoneCalculatorPage from './components/parentZone/ParentZoneCalculatorPage';
import AikoBioPage from './components/pages/AikoBioPage';
import NikoBioPage from './components/pages/NikoBioPage';
import KinuBioPage from './components/pages/KinuBioPage';
import MimiBioPage from './components/pages/MimiBioPage';

const themes = [
  { key: 'light', label: 'Light Mode' },
  { key: 'dark', label: 'Dark Mode' },
  { key: 'colorblind', label: 'Colorblind Mode' },
];

const themeTokens = {
  light: { bg: '#f8fafc', text: '#0f172a', surface: '#ffffff' },
  dark: { bg: '#0b1220', text: '#f8fafc', surface: '#111827' },
  colorblind: { bg: '#f5f7fb', text: '#0f172a', surface: '#ffffff' },
};

const DISPLAY_MODE_STORAGE_KEY = 'aiko_display_mode';
const BRIGHTNESS_STORAGE_KEY = 'aiko_brightness_pct';
const WELLBEING_USAGE_STORAGE_KEY = 'aiko_wellbeing_usage_v1';
const WELLBEING_SYNC_EVENT = 'aiko:wellbeing-sync';
const DAILY_LIMIT_MINUTES = 300;
const LEARNING_ZONE_CORE_MODULES = new Set(['alphabets', 'numbers']);
const LEARNING_ZONE_PREMIUM_MODULES = new Set(['colors', 'animals']);

const getTodayDateStamp = () => new Date().toISOString().slice(0, 10);

const normalizeWellbeingUsage = (raw = {}) => {
  const today = getTodayDateStamp();
  const sourceDate = typeof raw?.date === 'string' ? raw.date : today;
  const minutes = Number(raw?.minutesUsed);

  return {
    date: today,
    minutesUsed: sourceDate === today && Number.isFinite(minutes) ? Math.max(0, minutes) : 0,
    limitEnabled: Boolean(raw?.limitEnabled),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
};

const readWellbeingUsage = () => {
  if (typeof window === 'undefined') {
    return normalizeWellbeingUsage();
  }

  try {
    const raw = window.localStorage.getItem(WELLBEING_USAGE_STORAGE_KEY);
    return raw ? normalizeWellbeingUsage(JSON.parse(raw)) : normalizeWellbeingUsage();
  } catch (error) {
    console.warn('[Wellbeing] Failed to read usage from storage:', error);
    return normalizeWellbeingUsage();
  }
};

const writeWellbeingUsage = (nextState, broadcast = true) => {
  const normalized = normalizeWellbeingUsage({
    ...nextState,
    updatedAt: new Date().toISOString(),
  });

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(WELLBEING_USAGE_STORAGE_KEY, JSON.stringify(normalized));
    if (broadcast) {
      window.dispatchEvent(new Event(WELLBEING_SYNC_EVENT));
    }
  }

  return normalized;
};

const formatMinutes = (minutes = 0) => {
  const whole = Math.max(0, Math.floor(minutes));
  const hrs = Math.floor(whole / 60);
  const mins = whole % 60;
  return `${hrs}h ${mins}m`;
};

const TimeUpOverlay = ({ usedMinutes = 0, onOpenParentZone }) => (
  <div className="min-h-screen w-full flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-6 sm:p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-b from-sky-100 to-cyan-100 text-6xl shadow-inner">
        🦉
      </div>
      <div className="mb-4 text-5xl sm:text-6xl">🌙✨📚</div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">AikoKidzTV Sleep Mode</h1>
      <p className="text-base sm:text-lg leading-relaxed text-slate-700">
        Time&apos;s up for today, little explorer! 5 hours of screen time is more than enough. We care about your eyes! Please do your homework or go play outside. AikoKidzTV will wake up tomorrow!
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
        ⏳ Today&apos;s screen time: {formatMinutes(usedMinutes)} / {formatMinutes(DAILY_LIMIT_MINUTES)}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onOpenParentZone}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-slate-800 transition"
        >
          🛡️ Parent Zone
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600">
          See you tomorrow, explorer 💎
        </div>
      </div>
    </div>
  </div>
);

const Navbar = ({
  onNav,
  onOpenLogin,
  onOpenSignup,
  onOpenSettings,
  onLogout,
  isAdmin,
  displayMode,
  onSetDisplayMode,
  brightness,
  onBrightnessChange,
  onGoToAdmin,
  isForcedOffline,
  onToggleForcedOffline,
}) => {
  const { user, profile } = useAuth();
  const { isKidsModeOn, toggleKidsMode } = useKidsMode();
  const [open, setOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const avatarLetter = (user?.email || 'G')[0]?.toUpperCase();

  const navItems = [
    { label: 'Story Studio', target: 'story-studio' },
    { label: 'Magic Art', target: 'magic-art' },
    { label: '🧠 Learning Zone', target: 'learning-zone' },
  ];
  if (isAdmin) navItems.push({ label: 'Admin', target: 'admin' });

  const toggleDropdown = () => setOpen((v) => !v);
  const networkLabel = isForcedOffline ? 'Offline' : 'Online';
  const modeOptions = [
    { key: 'light', label: 'Light', icon: '☀️' },
    { key: 'dark', label: 'Dark', icon: '🌙' },
    { key: 'colorblind', label: 'Colorblind', icon: '◧' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-slate-200/80 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800/80">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 xl:gap-3">
          <button
            onClick={() => onNav('top')}
            className="flex items-center gap-2 font-black tracking-tight text-lg text-slate-900 dark:text-white hover:text-pink-500 dark:hover:text-pink-300 transition-colors kid-3d"
          >
            <Sparkles className="text-pink-400 dark:text-pink-300" size={18} />
            AikoKidzTV
          </button>

          {/* Kids Mode Toggle (next to brand) */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 shadow-sm">
            <span className="hidden sm:flex text-sm text-slate-800 dark:text-slate-100 items-center gap-1">
              {"\uD83D\uDC3C"} Kids Mode
            </span>
            <button
              onClick={toggleKidsMode}
              className={`relative w-12 h-6 rounded-full transition-all ${
                isKidsModeOn ? 'bg-pink-400' : 'bg-slate-300'
              }`}
              aria-label="Toggle Kids Mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isKidsModeOn ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100/80 bg-gradient-to-r from-white to-emerald-50 px-2.5 py-1 shadow-sm dark:border-slate-700 dark:from-slate-800/90 dark:to-slate-800/70">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              <span className="hidden xl:inline">Network: </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                  isForcedOffline
                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isForcedOffline ? 'bg-slate-500' : 'bg-emerald-500'
                  }`}
                />
                {networkLabel}
              </span>
            </span>
            <button
              onClick={onToggleForcedOffline}
              aria-label={`Set network mode to ${isForcedOffline ? 'online' : 'offline'}`}
              aria-pressed={isForcedOffline}
              className={`relative h-6 w-12 rounded-full border transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/70 ${
                isForcedOffline
                  ? 'border-slate-300 bg-slate-300/90 dark:border-slate-600 dark:bg-slate-600'
                  : 'border-emerald-300 bg-gradient-to-r from-emerald-400 to-emerald-500 dark:border-emerald-500/60'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.25)] transition-transform duration-300 ease-out ${
                  isForcedOffline ? '' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Center Nav */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 rounded-full px-2 md:px-3 py-1 border border-slate-200 dark:border-slate-700 shadow-md">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.target === 'admin') {
                    onGoToAdmin?.();
                    return;
                  }
                  onNav?.(item.target);
                }}
                className="px-2 md:px-3 py-1.5 text-xs md:text-sm text-slate-800 dark:text-slate-100 rounded-full hover:bg-pink-100/80 dark:hover:bg-slate-700 transition-all kid-3d"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/80 shadow-sm transition-all hover:bg-pink-50/80 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-slate-700 dark:text-slate-100" />
              <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
              </span>
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.18s_ease-out]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">Announcements</h3>
                </div>
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No new updates right now!</p>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 dark:border-slate-700 dark:bg-slate-900/70">
              {modeOptions.map((mode) => {
                const active = displayMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    onClick={() => onSetDisplayMode?.(mode.key)}
                    aria-pressed={active}
                    aria-label={`Switch to ${mode.label} Mode`}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-1">{mode.icon}</span>
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Brightness</span>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={brightness}
                onChange={(e) => onBrightnessChange?.(Number(e.target.value))}
                className="w-24 accent-pink-500"
                aria-label="Brightness"
              />
              <span className="w-10 text-right">{brightness}%</span>
            </label>
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Gem size={16} className="text-pink-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-white">{profile?.gems ?? 0}</span>
          </div>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-pink-50/80 dark:hover:bg-slate-700 px-2 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-all kid-3d"
            >
              <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 text-pink-600 font-bold grid place-items-center dark:bg-slate-700 dark:border-slate-600 dark:text-pink-200">
                {avatarLetter}
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-500 dark:text-slate-200 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-xl p-3 animate-[fadeIn_0.18s_ease-out]">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 text-pink-600 font-bold grid place-items-center dark:bg-slate-700 dark:border-slate-600 dark:text-pink-200">
                    {avatarLetter}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Logged in as</p>
                    <p className="text-sm text-slate-900 dark:text-white font-semibold truncate max-w-[180px]">
                      {user?.email || 'Guest'}
                    </p>
                  </div>
                </div>

                {/* Account actions */}
                <div className="pt-3 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      onOpenSettings();
                    }}
                    className="kid-3d w-full text-sm bg-pink-50/90 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-slate-700 border border-pink-200/70 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>{"\u2699\uFE0F"} Settings</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Themes & Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onOpenSignup();
                    }}
                    className="w-full text-sm bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-xl transition-all"
                  >
                    Create Account
                  </button>
                  {user ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        onLogout();
                      }}
                      className="kid-3d w-full text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-3 py-2 rounded-xl transition-all flex items-center gap-2 justify-center"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setOpen(false);
                        onOpenLogin();
                      }}
                      className="kid-3d w-full text-sm bg-pink-400 text-slate-900 font-semibold px-3 py-2 rounded-xl hover:bg-pink-300 transition-all"
                    >
                      Log In with OTP
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const MainContent = ({ onGoToAdmin, onGoToVideos, onGoToPoems }) => {
  const { user, profile, signOut } = useAuth();
  const { openAuthModal, isAuthModalOpen } = useAuthModal();
  const [displayMode, setDisplayMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedMode = window.localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    return themes.some((theme) => theme.key === savedMode) ? savedMode : 'light';
  });
  const [brightness, setBrightness] = useState(() => {
    if (typeof window === 'undefined') return 100;
    const parsed = Number(window.localStorage.getItem(BRIGHTNESS_STORAGE_KEY));
    if (!Number.isFinite(parsed)) return 100;
    return Math.min(100, Math.max(50, parsed));
  });
  const [showSettings, setShowSettings] = useState(false);
  const [parentPinGateOpen, setParentPinGateOpen] = useState(false);
  const [parentZoneOpen, setParentZoneOpen] = useState(false);
  const [skipParentZonePinOnce, setSkipParentZonePinOnce] = useState(false);
  const [isForcedOffline, setIsForcedOffline] = useState(false);
  const [learningModule, setLearningModule] = useState(null); // 'alphabets' | 'numbers' | 'colors' | 'safari' | null
  const [magicArt, setMagicArt] = useState(false);
  const [wellbeingUsage, setWellbeingUsage] = useState(() => readWellbeingUsage());
  const isAdmin = isAdminEmail(user?.email) || String(profile?.role || '').toLowerCase() === 'admin';
  const { isKidsModeOn } = useKidsMode();
  const usageAccumulatorMsRef = React.useRef(0);
  const openSettingsModal = React.useCallback(() => setShowSettings(true), []);
  const closeSettingsModal = React.useCallback(() => setShowSettings(false), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', displayMode === 'dark');
    root.classList.toggle('colorblind-mode', displayMode === 'colorblind');
  }, [displayMode]);

  useEffect(() => {
    const tokens = themeTokens[displayMode] || themeTokens.light;
    const root = document.documentElement;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, displayMode);
    }
    root.setAttribute('data-theme', displayMode);
    root.style.setProperty('--bg-primary', tokens.bg);
    root.style.setProperty('--surface', tokens.surface);
    root.style.setProperty('--text-primary', tokens.text);
    root.style.setProperty('--text-secondary', `${tokens.text}cc`);
    if (displayMode === 'colorblind') {
      root.style.setProperty('--focus-ring', '#0ea5e9');
      root.style.setProperty('--accent-safe', '#0ea5e9');
    } else {
      root.style.removeProperty('--focus-ring');
      root.style.removeProperty('--accent-safe');
    }
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = tokens.bg;
      document.body.style.color = tokens.text;
    }
  }, [displayMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(brightness));
  }, [brightness]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncFromStorage = () => {
      setWellbeingUsage(readWellbeingUsage());
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(WELLBEING_SYNC_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(WELLBEING_SYNC_EVENT, syncFromStorage);
    };
  }, []);

  const isDailyLimitReached =
    Boolean(wellbeingUsage?.limitEnabled) &&
    Number(wellbeingUsage?.minutesUsed || 0) >= DAILY_LIMIT_MINUTES;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let lastTick = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTick;
      lastTick = now;

      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (showSettings || isAuthModalOpen || parentZoneOpen) return;
      if (isDailyLimitReached) return;

      usageAccumulatorMsRef.current += elapsed;
      if (usageAccumulatorMsRef.current < 60000) return;

      const minutesToAdd = Math.floor(usageAccumulatorMsRef.current / 60000);
      usageAccumulatorMsRef.current = usageAccumulatorMsRef.current % 60000;

      if (minutesToAdd <= 0) return;

      const currentUsage = readWellbeingUsage();
      const nextUsage = writeWellbeingUsage({
        ...currentUsage,
        minutesUsed: (currentUsage.minutesUsed || 0) + minutesToAdd,
      });
      setWellbeingUsage(nextUsage);
    };

    const intervalId = window.setInterval(tick, 15000);
    const handleVisibilityChange = () => {
      lastTick = Date.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthModalOpen, showSettings, parentZoneOpen, isDailyLimitReached]);

  const scrollToId = (id) => {
    if (id === 'magic-art') {
      setLearningModule(null);
      setMagicArt(true);
      return;
    }

    // If navigating away from sub-views, reset them first
    if (learningModule) setLearningModule(null);
    if (magicArt) setMagicArt(false);

    // Defer scroll until after any state-driven view change
    setTimeout(() => {
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const requestParentZoneAccess = () => {
    closeSettingsModal();
    setParentPinGateOpen(true);
  };

  const handleParentZoneUnlocked = () => {
    setSkipParentZonePinOnce(true);
    setParentZoneOpen(true);
  };

  const handleParentZoneExit = () => {
    setParentZoneOpen(false);
    setSkipParentZonePinOnce(false);
  };

  const canOpenLearningModule = React.useCallback(
    (moduleKey) => {
      if (
        !LEARNING_ZONE_CORE_MODULES.has(moduleKey) &&
        !LEARNING_ZONE_PREMIUM_MODULES.has(moduleKey)
      ) {
        return true;
      }

      if (LEARNING_ZONE_CORE_MODULES.has(moduleKey)) return true;

      const unlockedZones = Array.isArray(profile?.unlocked_zones)
        ? profile.unlocked_zones
        : [];

      return unlockedZones.includes(moduleKey);
    },
    [profile?.unlocked_zones]
  );

  const handleSelectLearningModule = React.useCallback(
    (moduleKey) => {
      if (canOpenLearningModule(moduleKey)) {
        setLearningModule(moduleKey);
        return;
      }

      if (!isKidsModeOn) {
        window.alert('This zone is locked. Please unlock it in Learning Zone first.');
      }
    },
    [canOpenLearningModule, isKidsModeOn]
  );

  const appliedTokens = themeTokens[displayMode] || themeTokens.light;
  const appShellStyle = {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    '--bg-primary': appliedTokens.bg,
    '--surface': appliedTokens.surface,
    '--text-primary': appliedTokens.text,
    '--text-secondary': `${appliedTokens.text}cc`,
    filter: `brightness(${(brightness / 100).toFixed(2)})`,
  };

  if (parentZoneOpen) {
    return (
      <ParentZone
        onExit={handleParentZoneExit}
        onLogout={signOut}
        onDeleteAccount={signOut}
        skipPinGate={skipParentZonePinOnce}
      />
    );
  }

  if (isDailyLimitReached) {
    return (
      <>
        <style>{`
          [data-theme] body,
          [data-theme] .app-shell {
            background-color: var(--bg-primary);
            color: var(--text-primary);
          }
          [data-theme] .app-shell .text-muted {
            color: var(--text-secondary) !important;
          }
        `}</style>
        <div
          className={`app-shell min-h-screen selection:bg-pink-200 selection:text-slate-900 transition-colors duration-300 ${isKidsModeOn ? 'kids-mode-on' : ''}`}
          style={appShellStyle}
        >
          <TimeUpOverlay
            usedMinutes={wellbeingUsage?.minutesUsed || 0}
            onOpenParentZone={requestParentZoneAccess}
          />
          <ParentPinGateModal
            open={parentPinGateOpen}
            onClose={() => setParentPinGateOpen(false)}
            onUnlocked={handleParentZoneUnlocked}
          />
          <Settings
            open={showSettings}
            onClose={closeSettingsModal}
            themes={themes}
            themeKey={displayMode}
            onThemeChange={(key) => {
              setDisplayMode(key);
              setShowSettings(false);
            }}
            brightness={brightness}
            onBrightnessChange={setBrightness}
            onLogin={() => {
              setShowSettings(false);
              openAuthModal('login');
            }}
            onCreateAccount={() => {
              setShowSettings(false);
              openAuthModal('signup');
            }}
            onLogout={signOut}
            user={user}
            isAdmin={isAdmin}
            onGoToAdmin={onGoToAdmin}
          />
        </div>
      </>
    );
  }

  if (magicArt) {
    const backHome = () => {
      setMagicArt(false);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    };
    return (
      <ErrorBoundary>
        <MagicArt key="magic-art-screen" onBack={backHome} />
      </ErrorBoundary>
    );
  }

  if (learningModule) {
    const backToLearningZone = () => {
      setLearningModule(null);
      // Scroll after the main view re-renders
      setTimeout(() => {
        const el = document.getElementById('learning-zone');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    };
    const backToHome = () => {
      setLearningModule(null);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    };
    const ComingSoon = ({ title, emoji }) => (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-900 flex items-center">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 text-5xl">{emoji} <span className="text-4xl font-black">{title}</span></div>
          <p className="text-lg text-slate-600">This adventure is coming soon. Check back later!</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={backToLearningZone}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:shadow-md transition"
            >
              ★ Back to Learning Zone
            </button>
            <button
              onClick={backToHome}
              className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow hover:shadow-md hover:bg-amber-200 transition"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
    const map = {
      alphabets: <AlphabetsModule onBack={backToLearningZone} onHome={backToHome} />,
      numbers: <NumbersModule onBack={backToLearningZone} onHome={backToHome} />,
      colors: <ColorsModule onBack={backToLearningZone} onHome={backToHome} />,
      safari: <SafariModule onBack={backToLearningZone} onHome={backToHome} />,
      animals: <SafariModule onBack={backToLearningZone} onHome={backToHome} />, // alias for new menu
      junior_law: <ComingSoon title="Junior Law" emoji="⚖️" />,
      science: <ComingSoon title="Science Lab" emoji="🔬" />,
      math: <ComingSoon title="Math Magic" emoji="🧮" />,
      language: <ComingSoon title="Language Explorer" emoji="🌍" />,
    };
    return map[learningModule] || null;
  }

  return (
    <>
      <style>{`
        [data-theme] body,
        [data-theme] .app-shell {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        [data-theme] .app-shell .text-muted {
          color: var(--text-secondary) !important;
        }
      `}</style>
      <div
        className={`app-shell min-h-screen selection:bg-pink-200 selection:text-slate-900 transition-colors duration-300 ${isKidsModeOn ? 'kids-mode-on' : ''}`}
        style={appShellStyle}
      >
      <HeaderNavbar
        onNav={scrollToId}
        onOpenLogin={() => openAuthModal('login')}
        onOpenSignup={() => openAuthModal('signup')}
        onOpenParentZone={requestParentZoneAccess}
        isAdmin={isAdmin}
        onGoToAdmin={onGoToAdmin}
        onGoToVideos={onGoToVideos}
        onGoToPoems={onGoToPoems}
        isForcedOffline={isForcedOffline}
        onToggleForcedOffline={() => setIsForcedOffline((v) => !v)}
        displayMode={displayMode}
        onSetDisplayMode={setDisplayMode}
        brightness={brightness}
        onBrightnessChange={setBrightness}
      />
      <ParentPinGateModal
        open={parentPinGateOpen}
        onClose={() => setParentPinGateOpen(false)}
        onUnlocked={handleParentZoneUnlocked}
      />
      <KidsMascot />
      <Settings
        open={showSettings}
        onClose={closeSettingsModal}
        themes={themes}
        themeKey={displayMode}
        onThemeChange={(key) => {
          setDisplayMode(key);
          setShowSettings(false);
        }}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        onLogin={() => {
          setShowSettings(false);
          openAuthModal('login');
        }}
        onCreateAccount={() => {
          setShowSettings(false);
          openAuthModal('signup');
        }}
        onLogout={signOut}
        user={user}
        isAdmin={isAdmin}
        onGoToAdmin={onGoToAdmin}
      />
      <main className="pt-24">
        <div className="mx-auto max-w-[1400px] px-4">
          <LandingPageHabitat
            user={user}
            onOpenLogin={() => openAuthModal('login')}
            onNav={scrollToId}
            onSelectLearningModule={handleSelectLearningModule}
          />
        </div>
      </main>

      <div className="relative -mt-8 bg-gradient-to-b from-cyan-300/70 via-blue-500/70 to-blue-700/80 pt-10">
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full sm:h-16" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,64L60,74.7C120,85,240,107,360,112C480,117,600,107,720,85.3C840,64,960,32,1080,26.7C1200,21,1320,43,1380,53.3L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" fill="rgba(255,255,255,0.25)" />
          </svg>
        </div>
        <Footer />
      </div>
      </div>
    </>
  );
};

function AdminRouteGuard({ onBackToSite }) {
  const { user, profile } = useAuth();
  const hasAdminRole = String(profile?.role || '').toLowerCase() === 'admin';
  const isAllowedAdmin = hasAdminRole || (isAdminEmail(user?.email) && user?.email === ADMIN_EMAIL);

  if (!isAllowedAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[1.75rem] border border-red-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="mb-4 text-5xl">⛔</div>
            <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
            <p className="mt-3 text-sm font-medium text-slate-600">
              The Admin Panel is restricted to `{ADMIN_EMAIL}` only.
            </p>
            <button
              type="button"
              onClick={onBackToSite}
              className="mt-6 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onBackToSite={onBackToSite} />;
}

function HomeRoutePage() {
  const navigate = useNavigate();

  return (
    <MainContent
      onGoToAdmin={() => navigate('/admin')}
      onGoToVideos={() => navigate('/videos')}
      onGoToPoems={() => navigate('/poems')}
    />
  );
}

function AdminRoutePage() {
  const navigate = useNavigate();

  return <AdminRouteGuard onBackToSite={() => navigate('/')} />;
}

function App() {
  return (
    <AuthProvider>
      <KidsModeProvider>
        <BrowserRouter>
          <AuthModalProvider>
            <Routes>
              <Route path="/" element={<HomeRoutePage />} />
              <Route path="/admin" element={<AdminRoutePage />} />
              <Route path="/videos" element={<VideoZone />} />
              <Route path="/poems" element={<PoemsPage />} />
              <Route path="/story" element={<StoryReader />} />
              <Route path="/coloring" element={<ColoringBook />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/blender-credit" element={<BlenderCredit />} />
              <Route path="/aiko-bio" element={<AikoBioPage />} />
              <Route path="/niko-bio" element={<NikoBioPage />} />
              <Route path="/kinu-bio" element={<KinuBioPage />} />
              <Route path="/mimi-bio" element={<MimiBioPage />} />
              <Route path="/parent-zone" element={<ParentZoneHubPage />} />
              <Route path="/parent-zone/tables" element={<ParentZoneTablesPage />} />
              <Route path="/parent-zone/numbers" element={<ParentZoneNumbersPage />} />
              <Route path="/parent-zone/law" element={<ParentZoneJuniorLawPage />} />
              <Route path="/parent-zone/rights" element={<ParentZoneJuniorRightsPage />} />
              <Route path="/parent-zone/junior-law" element={<ParentZoneJuniorLawPage />} />
              <Route path="/parent-zone/junior-rights" element={<ParentZoneJuniorRightsPage />} />
              <Route path="/parent-zone/science" element={<ParentZoneSciencePage />} />
              <Route path="/parent-zone/calculator" element={<ParentZoneCalculatorPage />} />
            </Routes>
          </AuthModalProvider>
        </BrowserRouter>
      </KidsModeProvider>
    </AuthProvider>
  );
}

export default App;
