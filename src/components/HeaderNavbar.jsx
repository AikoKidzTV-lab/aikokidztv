import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../utils/admin';

const BELL_NOTIFICATION_EVENT = 'aiko:bell-notification';
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-easter-egg-hint',
    title: 'New Hint',
    message: '🥚 Hint: read carefully in the site to find the Easter Egg and get a surprise gift!',
    unread: true,
  },
  {
    id: 'notif-task-quest-update',
    title: 'Quest Update',
    message: '🌟 Quest Update: Tick all 5 daily habit boxes to unlock your 2 Free Gems!',
    unread: true,
  },
];

function ProfileDropdownMenu({
  open,
  onClose,
  user,
  profile,
  isAdmin,
  onOpenLogin,
  onOpenSignup,
  onOpenParentZone,
  onGoToAdmin,
  displayMode = 'light',
  onSetDisplayMode,
  brightness = 100,
  onBrightnessChange,
}) {
  if (!open) return null;

  const avatarLetter = (user?.email || 'G')[0]?.toUpperCase();
  const isLoggedIn = Boolean(user);
  const canSeeAdminPanel =
    user?.email === ADMIN_EMAIL || String(profile?.role || '').toLowerCase() === 'admin';
  const modeOptions = [
    { key: 'light', label: 'Light', icon: '\u2600\uFE0F' },
    { key: 'dark', label: 'Dark', icon: '\uD83C\uDF19' },
  ];

  const run = (fn) => () => {
    fn?.();
    onClose?.();
  };

  return (
    <div className="absolute right-0 top-full mt-3 w-[20rem] max-w-[92vw] rounded-[1.5rem] border border-white/70 bg-white/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 z-50 animate-[fadeIn_0.18s_ease-out]">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-3 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-pink-200 bg-pink-100 font-black text-pink-600 dark:border-slate-600 dark:bg-slate-700 dark:text-pink-200">
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isLoggedIn ? 'Profile' : 'Guest Mode'}
            </p>
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {user?.email || 'Login / Profile'}
            </p>
          </div>
          <div className="ml-auto rounded-full border border-cyan-200 bg-white/80 px-2.5 py-1 text-xs font-bold text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-300">
            Gems: {profile?.gems ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="px-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Quick Links
        </p>
        {isAdmin && canSeeAdminPanel && (
          <button
            onClick={run(onGoToAdmin)}
            className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left font-bold text-violet-800 shadow-sm transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-200 dark:hover:bg-violet-900/30"
          >
            Admin Panel
            <span className="block text-xs font-semibold opacity-80">Manage dashboard & content</span>
          </button>
        )}
        <button
          onClick={run(onOpenParentZone)}
          className="w-full rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-100 to-sky-100 px-4 py-3 text-left font-bold text-indigo-900 shadow-sm transition hover:-translate-y-0.5 dark:border-indigo-800 dark:from-indigo-900/30 dark:to-sky-900/20 dark:text-indigo-100"
        >
          Parent Zone
          <span className="block text-xs font-semibold opacity-80">Protected by 4-digit PIN (resettable)</span>
        </button>
        {!isLoggedIn && (
          <>
            <button
              onClick={run(onOpenLogin)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Login
              <span className="block text-xs font-semibold opacity-80">Open authentication modal</span>
            </button>
            <button
              onClick={run(onOpenSignup)}
              className="w-full rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-100 to-amber-100 px-4 py-3 text-left font-bold text-pink-900 shadow-sm transition hover:brightness-105 dark:border-pink-900/50 dark:from-pink-900/30 dark:to-amber-900/20 dark:text-pink-100"
            >
              Sign Up / Create Account
              <span className="block text-xs font-semibold opacity-80">Start with email, password, or OTP</span>
            </button>
          </>
        )}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white/85 p-3 dark:border-slate-700 dark:bg-slate-800/80">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Display Controls</p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {modeOptions.map((mode) => {
            const active = displayMode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => onSetDisplayMode?.(mode.key)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  active
                    ? 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-500 dark:bg-sky-500/20 dark:text-sky-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="mr-1">{mode.icon}</span>
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/80">
          <label className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Brightness</span>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={brightness}
              onChange={(event) => onBrightnessChange?.(Number(event.target.value))}
              className="w-full accent-sky-500"
              aria-label="Brightness"
            />
            <span className="w-10 text-right text-xs font-bold text-slate-700 dark:text-slate-200">{brightness}%</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function HeaderNavbar({
  onNav,
  onOpenLogin,
  onOpenSignup,
  onOpenParentZone,
  isAdmin,
  onGoToAdmin,
  onGoToVideos,
  onGoToPoems,
  isForcedOffline,
  onToggleForcedOffline,
  displayMode = 'light',
  onSetDisplayMode = () => {},
  brightness = 100,
  onBrightnessChange = () => {},
}) {
  const { user, profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [openProfile, setOpenProfile] = useState(false);

  const avatarLetter = (user?.email || 'G')[0]?.toUpperCase();
  const networkLabel = isForcedOffline ? 'Offline' : 'Online';
  const unreadCount = useMemo(
    () => notifications.reduce((count, notification) => count + (notification.unread ? 1 : 0), 0),
    [notifications]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onBellNotification = (event) => {
      const message = String(event?.detail?.message || '').trim();
      if (!message) return;

      setNotifications((currentNotifications) => ([
        {
          id: `notif-${Date.now()}`,
          title: 'Quest Update',
          message,
          unread: !showNotifications,
        },
        ...currentNotifications,
      ]));
    };

    window.addEventListener(BELL_NOTIFICATION_EVENT, onBellNotification);
    return () => {
      window.removeEventListener(BELL_NOTIFICATION_EVENT, onBellNotification);
    };
  }, [showNotifications]);

  const toggleNotifications = () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    if (willOpen && unreadCount > 0) {
      setNotifications((currentNotifications) => (
        currentNotifications.map((notification) => ({ ...notification, unread: false }))
      ));
    }
  };

  const navItems = [
    { label: 'Story Studio', target: 'story-studio' },
    { label: 'Magic Art', target: 'magic-art' },
    { label: 'Poems', target: 'poems' },
    { label: 'Learning Zone', target: 'learning-zone' },
  ];
  if (isAdmin) navItems.push({ label: 'Admin', target: 'admin' });

  return (
    <>
    <nav className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 rounded-full border border-white/75 border-b-4 border-blue-200 bg-white/88 px-3 shadow-[0_14px_38px_rgba(56,189,248,0.20)] backdrop-blur-xl dark:border-slate-700 dark:border-b-sky-800 dark:bg-slate-900/88 dark:shadow-[0_14px_38px_rgba(15,23,42,0.45)]">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => onNav?.('top')}
            className="flex shrink-0 items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1.5 font-black tracking-tight text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:text-pink-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:text-pink-300"
          >
            <Sparkles className="text-pink-400 dark:text-pink-300" size={16} />
            <span className="hidden sm:inline">AikoKidzTV</span>
            <span className="sm:hidden">Aiko</span>
          </button>

          <div className="hidden xl:flex items-center">
            <img
              src="/logo.png.webp"
              alt="AikoKidzTV logo"
              className="h-10 w-10 rounded-full object-cover border border-gray-200 ring-2 ring-white shadow-sm dark:border-slate-600 dark:ring-slate-800"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="hidden 2xl:flex items-center gap-2 rounded-full border border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-2.5 py-1 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Network:</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                isForcedOffline
                  ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isForcedOffline ? 'bg-slate-500' : 'bg-emerald-500'}`} />
              {networkLabel}
            </span>
            <button
              onClick={onToggleForcedOffline}
              aria-label={`Set network mode to ${isForcedOffline ? 'online' : 'offline'}`}
              aria-pressed={isForcedOffline}
              className={`relative h-6 w-12 rounded-full border transition-all duration-300 ease-out ${
                isForcedOffline
                  ? 'border-slate-300 bg-slate-300/90 dark:border-slate-600 dark:bg-slate-600'
                  : 'border-emerald-300 bg-gradient-to-r from-emerald-400 to-emerald-500 dark:border-emerald-500/60'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  isForcedOffline ? '' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.target === 'videos') {
                    onGoToVideos?.();
                    return;
                  }
                  if (item.target === 'poems') {
                    onGoToPoems?.();
                    return;
                  }
                  if (item.target === 'admin') {
                    onGoToAdmin?.();
                    return;
                  }
                  onNav?.(item.target);
                }}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-pink-100/80 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-pink-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-slate-700 dark:text-slate-100" />
              {unreadCount > 0 ? (
                <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
                </span>
              ) : null}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-700 dark:bg-pink-500/20 dark:text-pink-200">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </span>
                </div>
                <div className="p-3">
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-pink-50 to-cyan-50 p-3 shadow-sm dark:border-amber-900/40 dark:from-amber-900/20 dark:via-pink-900/20 dark:to-cyan-900/20"
                      >
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-label={user ? 'Open profile menu' : 'Open login and profile menu'}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full border border-pink-200 bg-pink-100 font-bold text-pink-600 dark:border-slate-600 dark:bg-slate-700 dark:text-pink-200">
                {avatarLetter}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {user ? 'Profile' : 'Login / Profile'}
                </p>
                <p className="max-w-[110px] truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {user?.email || 'Guest'}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform dark:text-slate-200 ${openProfile ? 'rotate-180' : ''}`}
              />
            </button>

            <ProfileDropdownMenu
              open={openProfile}
              onClose={() => setOpenProfile(false)}
              user={user}
              profile={profile}
              isAdmin={isAdmin}
              onOpenLogin={onOpenLogin}
              onOpenSignup={onOpenSignup}
              onOpenParentZone={onOpenParentZone}
              onGoToAdmin={onGoToAdmin}
              displayMode={displayMode}
              onSetDisplayMode={onSetDisplayMode}
              brightness={brightness}
              onBrightnessChange={onBrightnessChange}
            />
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}


