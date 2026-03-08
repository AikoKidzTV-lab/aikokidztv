import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, Gem, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../utils/admin';

const BELL_NOTIFICATION_EVENT = 'aiko:bell-notification';
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-easter-egg-hint',
    title: 'New Hint',
    message: `${'\u{1F95A}'} Hint: read carefully on the site to find the Easter Egg and get a surprise gift!`,
    unread: true,
  },
  {
    id: 'notif-task-quest-update',
    title: 'Quest Update',
    message: `${'\u{1F31F}'} Quest Update: Tick all 5 daily habit boxes to unlock your 2 free Gems!`,
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
  onOpenCosmicJourney,
  onGoToAdmin,
}) {
  if (!open) return null;

  const avatarLetter = (user?.email || 'G')[0]?.toUpperCase();
  const isLoggedIn = Boolean(user);
  const gemsBalance = Number(profile?.gems || 0);
  const level = Math.max(1, Math.floor(gemsBalance / 100) + 1);
  const canSeeAdminPanel =
    user?.email === ADMIN_EMAIL || String(profile?.role || '').toLowerCase() === 'admin';

  const run = (fn) => () => {
    fn?.();
    onClose?.();
  };

  return (
    <div className="absolute right-0 top-full mt-3 w-[24rem] max-w-[96vw] rounded-[1.5rem] border border-white/85 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl z-50 animate-[fadeIn_0.18s_ease-out]">
      <div className="rounded-2xl border border-white/90 bg-white p-3 shadow-[14px_14px_28px_rgba(148,163,184,0.25),-10px_-10px_24px_rgba(255,255,255,0.95),inset_2px_2px_6px_rgba(255,255,255,0.85),inset_-3px_-3px_8px_rgba(148,163,184,0.22)]">
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white font-black text-black">
              {avatarLetter}
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-black">
              {isLoggedIn ? 'Profile' : 'Guest'}
            </p>
            <p className="truncate text-sm font-black text-black">{user?.email || 'Login / Profile'}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-black">
              Gems: {gemsBalance}
              <Gem size={13} className="text-purple-500" />
            </p>
            <p className="text-xs font-black text-black">Level: {level}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-right">
            <h2 className="text-3xl font-black tracking-tight text-black">
              BLENDER STUDIO
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed font-semibold text-black">
              Note: The movies listed above are general kids&apos; movies. AikoKidzTV will soon bring its own original movies!
            </p>
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
            className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left font-bold text-violet-800 shadow-sm transition hover:bg-violet-100"
          >
            Admin Panel
            <span className="block text-xs font-semibold opacity-80">Manage dashboard & content</span>
          </button>
        )}
        <button
          onClick={run(onOpenParentZone)}
          className="w-full rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-100 to-sky-100 px-4 py-3 text-left font-bold text-indigo-900 shadow-sm transition hover:-translate-y-0.5"
        >
          Parent Zone
          <span className="block text-xs font-semibold opacity-80">Protected by 4-digit PIN (resettable)</span>
        </button>
        <button
          type="button"
          onClick={run(onOpenSignup || onOpenLogin)}
          className="w-full rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-100 to-amber-100 px-4 py-3 text-left font-bold text-pink-900 shadow-sm transition hover:brightness-105"
        >
          Create Account / Login with OTP
          <span className="block text-xs font-semibold opacity-80">Use email OTP in the auth modal</span>
        </button>
        <button
          type="button"
          onClick={run(onOpenCosmicJourney)}
          className="w-full rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 px-4 py-3 text-left text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5"
        >
          {'\u{1F680}'} Cosmic Journey
          <span className="block text-xs font-semibold text-indigo-100">Open secure space exploration zone</span>
        </button>
      </div>
    </div>
  );
}

export default function HeaderNavbar({
  onNav,
  onOpenLogin,
  onOpenSignup,
  onOpenParentZone,
  onOpenCosmicJourney,
  isAdmin,
  onGoToAdmin,
  onGoToProfileSettings,
  onGoToVideos,
  onGoToPoems,
  isForcedOffline,
  onToggleForcedOffline,
}) {
  const { user, profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [openProfile, setOpenProfile] = useState(false);
  const [showPoemsComingSoonBadge, setShowPoemsComingSoonBadge] = useState(false);

  const avatarLetter = (user?.email || 'G')[0]?.toUpperCase();
  const networkLabel = isForcedOffline ? 'Offline' : 'Online';
  const unreadCount = useMemo(
    () => notifications.reduce((count, notification) => count + (notification.unread ? 1 : 0), 0),
    [notifications]
  );
  const handleOpenProfileSettings = () => {
    onGoToProfileSettings?.();
    setOpenProfile(false);
  };

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

  useEffect(() => {
    if (!showPoemsComingSoonBadge || typeof window === 'undefined') return undefined;
    const timerId = window.setTimeout(() => {
      setShowPoemsComingSoonBadge(false);
    }, 2800);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [showPoemsComingSoonBadge]);

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
                    setShowPoemsComingSoonBadge(true);
                    return;
                  }
                  if (item.target === 'admin') {
                    onGoToAdmin?.();
                    return;
                  }
                  onNav?.(item.target);
                }}
                className="rounded-full px-3 py-1.5 text-sm font-semibold transition text-slate-800 hover:bg-pink-100/80 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <span>{item.label}</span>
                {item.target === 'poems' && showPoemsComingSoonBadge ? (
                  <span className="ml-1 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                    Coming Soon {'\u{1F680}'}
                  </span>
                ) : null}
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
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-1 py-1 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
              <button
                type="button"
                onClick={handleOpenProfileSettings}
                className="flex items-center gap-2 rounded-full px-1 py-0.5"
                aria-label={user ? 'Open profile settings' : 'Open profile settings'}
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
              </button>
              <button
                type="button"
                onClick={() => setOpenProfile((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label={user ? 'Open profile menu' : 'Open login and profile menu'}
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openProfile ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <ProfileDropdownMenu
              open={openProfile}
              onClose={() => setOpenProfile(false)}
              user={user}
              profile={profile}
              isAdmin={isAdmin}
              onOpenLogin={onOpenLogin}
              onOpenSignup={onOpenSignup}
              onOpenParentZone={onOpenParentZone}
              onOpenCosmicJourney={onOpenCosmicJourney}
              onGoToAdmin={onGoToAdmin}
            />
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}

