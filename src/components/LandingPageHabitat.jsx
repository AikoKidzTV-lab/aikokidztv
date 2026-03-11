import React from 'react';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';
import AIStudio from './AIStudio';
import GemPacksPricing from './GemPacksPricing';
import LearningZone from './LearningZone';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';

const HERO_BANNER_LIMIT = 5;
const HERO_BANNER_FALLBACK_THUMBNAIL = '/logo.png.webp';

const normalizeVideoBannerRow = (row) => {
  const id = row?.id != null ? String(row.id).trim() : '';
  const title = typeof row?.title === 'string' && row.title.trim() ? row.title.trim() : 'Untitled Video';
  const description = typeof row?.description === 'string' ? row.description.trim() : '';
  const thumbnailUrl =
    typeof row?.thumbnail_url === 'string' && row.thumbnail_url.trim()
      ? row.thumbnail_url.trim()
      : HERO_BANNER_FALLBACK_THUMBNAIL;
  const videoUrl = typeof row?.video_url === 'string' ? row.video_url.trim() : '';
  const createdAt = typeof row?.created_at === 'string' ? row.created_at : '';

  if (!id || !videoUrl) return null;

  return {
    id,
    title,
    subtitle: description || 'Tap to open this video and start watching.',
    thumbnailUrl,
    videoUrl,
    createdAt,
  };
};

const loadRecentVideoBanners = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('id, title, description, video_url, thumbnail_url, created_at')
    .order('created_at', { ascending: false })
    .limit(HERO_BANNER_LIMIT);

  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((row) => normalizeVideoBannerRow(row))
    .filter(Boolean)
    .slice(0, HERO_BANNER_LIMIT);
};

const isMissingColumnError = (error, columnName) => {
  if (!columnName) return false;
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedColumn = String(columnName).toLowerCase();
  return (
    text.includes(normalizedColumn) &&
    (text.includes('column') || text.includes('schema cache') || error?.code === '42703' || error?.code === 'PGRST204')
  );
};
const YOUTUBE_SUBSCRIBE_REWARD_KEY = 'homepage_youtube_subscribe_50';
const YOUTUBE_SUBSCRIBE_REWARD_GEMS = 50;
const YOUTUBE_SUBSCRIBE_CLICK_STORAGE_KEY = 'aiko_subscribe_click_v1';
const PARENT_ZONE_PRACTICE_ROUTES = [
  { id: 'tables', label: 'Tables', emoji: '🧮', to: '/parent-zone/tables' },
  { id: 'numbers', label: 'Numbers', emoji: '🔢', to: '/parent-zone/numbers' },
  { id: 'junior-law', label: 'Junior Law', emoji: '⚖️', to: '/parent-zone/junior-law' },
  { id: 'junior-rights', label: 'Junior Rights', emoji: '🛡️', to: '/parent-zone/rights' },
  { id: 'science', label: 'Science', emoji: '🔬', to: '/parent-zone/junior-science' },
  { id: 'calculator', label: 'Calculator', emoji: '🧠', to: '/parent-zone/calculator' },
];

const WaveDivider = ({ fill = '#dcfce7', flip = false }) => (
  <div className={`absolute inset-x-0 ${flip ? 'bottom-0 rotate-180' : 'top-0 -translate-y-full'} pointer-events-none`}>
    <svg viewBox="0 0 1440 140" className="h-14 w-full sm:h-20" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,64L60,74.7C120,85,240,107,360,112C480,117,600,107,720,85.3C840,64,960,32,1080,26.7C1200,21,1320,43,1380,53.3L1440,64L1440,140L1380,140C1320,140,1200,140,1080,140C960,140,840,140,720,140C600,140,480,140,360,140C240,140,120,140,60,140L0,140Z"
        fill={fill}
      />
    </svg>
  </div>
);

export default function LandingPageHabitat({
  user,
  onOpenLogin,
  onNav,
  onSelectLearningModule,
}) {
  const { user: authUser, profile, fetchProfile, updateProfileBalances } = useAuth();
  const { isKidsModeOn } = useKidsMode();
  const go = (target) => onNav?.(target);
  const [watchEarnMessage, setWatchEarnMessage] = React.useState('');
  const [paymentToast, setPaymentToast] = React.useState(null);
  const [heroSlideIndex, setHeroSlideIndex] = React.useState(0);
  const [heroBanners, setHeroBanners] = React.useState([]);
  const [heroBannersLoading, setHeroBannersLoading] = React.useState(true);
  const [heroBannersError, setHeroBannersError] = React.useState('');
  const [isClaimingYoutubeReward, setIsClaimingYoutubeReward] = React.useState(false);
  const [exchangeFeedback, setExchangeFeedback] = React.useState({ message: null, tone: 'neutral' });
  const [dailyChestMessage, setDailyChestMessage] = React.useState(null);
  const [dailyClaimOverride, setDailyClaimOverride] = React.useState(null);
  const [hasClickedSubscribe, setHasClickedSubscribe] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(YOUTUBE_SUBSCRIBE_CLICK_STORAGE_KEY) === 'true';
  });
  const paymentToastTimerRef = React.useRef(null);
  const exchangeFeedbackTimerRef = React.useRef(null);
  const dailyChestMessageTimerRef = React.useRef(null);

  const claimedRewards = React.useMemo(
    () => (Array.isArray(profile?.claimed_rewards) ? profile.claimed_rewards : []),
    [profile?.claimed_rewards]
  );
  const freeGemsClaimed = claimedRewards.includes(YOUTUBE_SUBSCRIBE_REWARD_KEY);
  const rainbowGemsBalance = Number(profile?.rainbowGems ?? profile?.rainbow_gems ?? 0);
  const today = new Date().toLocaleDateString('en-CA');
  const effectiveLastFreeClaimDate = dailyClaimOverride ?? profile?.last_free_claim_date ?? null;
  const formattedLastFreeClaimDate = React.useMemo(() => {
    if (!effectiveLastFreeClaimDate) return '';
    const parsed = new Date(effectiveLastFreeClaimDate);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-CA');
  }, [effectiveLastFreeClaimDate]);
  const hasClaimedDailyChestToday = formattedLastFreeClaimDate === today;
  const canClaimYoutubeReward = hasClickedSubscribe && !freeGemsClaimed && !isClaimingYoutubeReward;
  const heroBannerCount = heroBanners.length;

  const showPaymentToast = React.useCallback((type, message) => {
    setPaymentToast({ type, message });
    if (paymentToastTimerRef.current) {
      clearTimeout(paymentToastTimerRef.current);
    }
    paymentToastTimerRef.current = setTimeout(() => {
      setPaymentToast(null);
    }, 4500);
  }, []);

  const claimRewardGems = React.useCallback(async ({
    rewardKey,
    gemAmount,
    startClaim,
    endClaim,
    successMessage,
    alreadyClaimedMessage,
  }) => {
    if (startClaim) startClaim();

    try {
      if (!user?.id) {
        showPaymentToast('info', 'Please log in to claim rewards.');
        onOpenLogin?.();
        return false;
      }

      if (claimedRewards.includes(rewardKey)) {
        showPaymentToast('info', alreadyClaimedMessage);
        return false;
      }

      const currentGems = Number(profile?.gems || 0);
      const nextClaimedRewards = Array.from(new Set([...claimedRewards, rewardKey]));

      let { error } = await supabase
        .from('profiles')
        .update({
          gems: currentGems + gemAmount,
          claimed_rewards: nextClaimedRewards,
        })
        .eq('id', user.id);

      if (error && isMissingColumnError(error, 'claimed_rewards')) {
        ({ error } = await supabase
          .from('profiles')
          .update({ gems: currentGems + gemAmount })
          .eq('id', user.id));
      }

      if (error) {
        throw error;
      }

      await fetchProfile?.(user.id);
      showPaymentToast('success', successMessage);
      return true;
    } catch (error) {
      showPaymentToast('error', error?.message || 'Failed to claim reward. Please try again.');
      return false;
    } finally {
      if (endClaim) endClaim();
    }
  }, [
    claimedRewards,
    fetchProfile,
    onOpenLogin,
    profile?.gems,
    showPaymentToast,
    user?.id,
  ]);

  const handleSubscribeClick = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(YOUTUBE_SUBSCRIBE_CLICK_STORAGE_KEY, 'true');
    }
    setHasClickedSubscribe(true);
    setWatchEarnMessage('Channel opened! Come back and claim your 50 Gems.');
  }, []);

  const handleClaimFreeGems = React.useCallback(async () => {
    if (!hasClickedSubscribe) {
      showPaymentToast('info', 'Subscribe first to unlock your 50 free Gems.');
      return;
    }

    const claimed = await claimRewardGems({
      rewardKey: YOUTUBE_SUBSCRIBE_REWARD_KEY,
      gemAmount: YOUTUBE_SUBSCRIBE_REWARD_GEMS,
      startClaim: () => setIsClaimingYoutubeReward(true),
      endClaim: () => setIsClaimingYoutubeReward(false),
      successMessage: `Claimed ${YOUTUBE_SUBSCRIBE_REWARD_GEMS} Gems successfully!`,
      alreadyClaimedMessage: 'You already claimed this reward.',
    });

    if (claimed) {
      setWatchEarnMessage(`Nice! ${YOUTUBE_SUBSCRIBE_REWARD_GEMS} Gems added to your wallet.`);
    }
  }, [claimRewardGems, hasClickedSubscribe, showPaymentToast]);

  const showExchangeFeedback = React.useCallback((message, tone) => {
    setExchangeFeedback({ message, tone });
    if (exchangeFeedbackTimerRef.current) {
      clearTimeout(exchangeFeedbackTimerRef.current);
    }
    exchangeFeedbackTimerRef.current = setTimeout(() => {
      setExchangeFeedback({ message: null, tone: 'neutral' });
    }, 2000);
  }, []);

  const showDailyChestFeedback = React.useCallback((message) => {
    setDailyChestMessage(message);
    if (dailyChestMessageTimerRef.current) {
      clearTimeout(dailyChestMessageTimerRef.current);
    }
    dailyChestMessageTimerRef.current = setTimeout(() => {
      setDailyChestMessage(null);
    }, 2000);
  }, []);

  const handleConvertToRainbowGems = React.useCallback(async () => {
    const currentPurpleGems = Number(profile?.gems || 0);
    const currentRainbowGems = Number(profile?.rainbowGems ?? profile?.rainbow_gems ?? 0);

    if (currentPurpleGems < 300) {
      showExchangeFeedback(
        <>
          Not enough Purple Gems! <Gem size={13} className="text-purple-500" />
        </>,
        'error'
      );
      return;
    }

    const userId = user?.id || authUser?.id || null;
    if (!userId) {
      showExchangeFeedback('Please log in to exchange gems.', 'error');
      onOpenLogin?.();
      return;
    }

    const newPurpleGems = Math.max(0, currentPurpleGems - 300);
    const newRainbowGems = Math.max(0, currentRainbowGems + 10);

    updateProfileBalances?.({
      gems: newPurpleGems,
      rainbow_gems: newRainbowGems,
      rainbowGems: newRainbowGems,
    });
    showExchangeFeedback('Success! +10 🌈 added!', 'success');

    const { error } = await supabase
      .from('profiles')
      .update({ gems: newPurpleGems, rainbow_gems: newRainbowGems })
      .eq('id', userId);

    if (error) {
      updateProfileBalances?.({
        gems: currentPurpleGems,
        rainbow_gems: currentRainbowGems,
        rainbowGems: currentRainbowGems,
      });
      showExchangeFeedback(error.message || 'Exchange failed. Please try again.', 'error');
      return;
    }

    void fetchProfile?.(userId);
  }, [
    authUser?.id,
    fetchProfile,
    onOpenLogin,
    profile?.gems,
    profile?.rainbowGems,
    profile?.rainbow_gems,
    showExchangeFeedback,
    updateProfileBalances,
    user?.id,
  ]);

  const handleClaimDailyChest = React.useCallback(async () => {
    if (hasClaimedDailyChestToday) {
      return;
    }

    const userId = user?.id || authUser?.id || null;
    if (!userId) {
      showDailyChestFeedback('Please log in to claim your daily chest.');
      onOpenLogin?.();
      return;
    }

    const nowIso = new Date().toISOString();
    const currentGems = Number(profile?.gems || 0);
    const currentRainbowGems = Number(profile?.rainbowGems ?? profile?.rainbow_gems ?? 0);
    const newGemsTotal = currentGems + 10;
    const newRainbowBalance = currentRainbowGems + 5;
    const previousLastFreeClaimDate = effectiveLastFreeClaimDate;

    updateProfileBalances?.({
      gems: newGemsTotal,
      rainbow_gems: newRainbowBalance,
      rainbowGems: newRainbowBalance,
    });
    setDailyClaimOverride(nowIso);
    showDailyChestFeedback(
      <>
        Yay! +10 <Gem size={13} className="text-purple-500" /> and +5 🌈 added!
      </>
    );

    const { error } = await supabase
      .from('profiles')
      .update({ gems: newGemsTotal, rainbow_gems: newRainbowBalance, last_free_claim_date: nowIso })
      .eq('id', userId);

    if (error) {
      updateProfileBalances?.({
        gems: currentGems,
        rainbow_gems: currentRainbowGems,
        rainbowGems: currentRainbowGems,
      });
      setDailyClaimOverride(previousLastFreeClaimDate ?? null);
      showDailyChestFeedback(error.message || 'Could not claim today. Please try again.');
      return;
    }

    void fetchProfile?.(userId);
  }, [
    authUser?.id,
    effectiveLastFreeClaimDate,
    fetchProfile,
    hasClaimedDailyChestToday,
    onOpenLogin,
    profile?.gems,
    profile?.rainbowGems,
    profile?.rainbow_gems,
    showDailyChestFeedback,
    updateProfileBalances,
    user?.id,
  ]);

  React.useEffect(() => {
    setDailyClaimOverride(profile?.last_free_claim_date ?? null);
  }, [profile?.last_free_claim_date]);

  React.useEffect(() => () => {
    if (paymentToastTimerRef.current) {
      clearTimeout(paymentToastTimerRef.current);
    }
    if (exchangeFeedbackTimerRef.current) {
      clearTimeout(exchangeFeedbackTimerRef.current);
    }
    if (dailyChestMessageTimerRef.current) {
      clearTimeout(dailyChestMessageTimerRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') return;

    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', '/');
    }

    const scrollHomeForMode = () => {
      if (isKidsModeOn) {
        const kidsTarget =
          document.getElementById('learning-zone') ||
          document.getElementById('story-studio');

        if (kidsTarget) {
          kidsTarget.scrollIntoView({ behavior: 'auto', block: 'start' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    scrollHomeForMode();
    const rafId = window.requestAnimationFrame(scrollHomeForMode);
    const timeoutId = window.setTimeout(scrollHomeForMode, 80);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const loadBanners = async () => {
      setHeroBannersLoading(true);
      setHeroBannersError('');

      try {
        const latestBanners = await loadRecentVideoBanners();
        if (!mounted) return;
        setHeroBanners(latestBanners.slice(0, HERO_BANNER_LIMIT));
        setHeroSlideIndex(0);
      } catch (error) {
        if (!mounted) return;
        console.error('[LandingPageHabitat] Failed to load video banners:', error);
        setHeroBanners([]);
        setHeroBannersError('Unable to load latest videos right now.');
      } finally {
        if (mounted) {
          setHeroBannersLoading(false);
        }
      }
    };

    void loadBanners();
    const refreshTimerId = typeof window === 'undefined'
      ? null
      : window.setInterval(() => {
        void loadBanners();
      }, 30000);

    return () => {
      mounted = false;
      if (refreshTimerId) {
        window.clearInterval(refreshTimerId);
      }
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (heroBannerCount <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroBannerCount);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [heroBannerCount]);

  React.useEffect(() => {
    if (heroBannerCount === 0) {
      setHeroSlideIndex(0);
      return;
    }

    setHeroSlideIndex((current) => (current >= heroBannerCount ? 0 : current));
  }, [heroBannerCount]);

  const goToPrevBanner = () => {
    if (heroBannerCount <= 1) return;
    setHeroSlideIndex((current) => (current - 1 + heroBannerCount) % heroBannerCount);
  };

  const goToNextBanner = () => {
    if (heroBannerCount <= 1) return;
    setHeroSlideIndex((current) => (current + 1) % heroBannerCount);
  };

  return (
    <div className="relative overflow-x-hidden">
      <section
        id="hero"
        className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-gradient-to-b from-sky-300 to-blue-100 shadow-[0_20px_80px_rgba(56,189,248,0.28)]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-10 text-5xl opacity-80 animate-bounce [animation-duration:4s]">☁️</div>
          <div className="absolute right-10 top-14 text-6xl opacity-80 animate-bounce [animation-duration:5.2s] [animation-delay:0.4s]">☁️</div>
          <div className="absolute left-1/4 top-24 text-4xl opacity-70 animate-bounce [animation-duration:4.8s] [animation-delay:0.2s]">☁️</div>
          <div className="absolute right-1/4 top-24 text-2xl opacity-90">🦜</div>
          <div className="absolute right-16 top-32 text-3xl opacity-90">🦅</div>
          <div className="absolute left-16 top-36 text-2xl opacity-90">🦉</div>
          <div className="absolute -left-6 bottom-20 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute right-4 bottom-8 h-40 w-40 rounded-full bg-blue-300/30 blur-2xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="min-w-0">
            <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl text-purple-900 drop-shadow-lg [text-shadow:0_2px_0_rgba(255,255,255,0.85),0_8px_24px_rgba(76,29,149,0.45)]">
              AikoKidzTV
              <span className="mt-2 block text-balance text-3xl sm:text-4xl lg:text-5xl !text-cyan-100">
                Fun &amp; Games in a Sky-to-Ocean World
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg !text-blue-50/95">
              Jump into playful stories, magic art, and adorable adventure zones.
              Unlock fun instantly, and explore with zero boring stuff.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => go('story-studio')}
                className="rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-black !text-slate-900 shadow-lg shadow-sky-200/70 transition hover:-translate-y-1 hover:bg-sky-50"
              >
                ✨ Story Studio
              </button>
              <button
                onClick={() => go('magic-art')}
                className="rounded-2xl border border-blue-300/70 bg-blue-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-blue-300/50 transition hover:-translate-y-1 hover:bg-blue-600"
              >
                🎨 Magic Art
              </button>
              <Link
                to="/videos"
                className="rounded-2xl border border-purple-500 bg-purple-600 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-purple-400/40 transition hover:-translate-y-1 hover:bg-purple-700"
              >
                🎬 Videos
              </Link>
              <Link
                to="/coloring"
                className="rounded-2xl border border-fuchsia-300/80 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-pink-300/60 transition hover:-translate-y-1 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600"
              >
                {'\u{1F3A8}'} Play Magic Art / Coloring Book
              </Link>
              <div className="rounded-2xl border border-white/70 bg-white/55 px-5 py-3 text-sm font-black !text-slate-800 shadow-[inset_8px_8px_16px_rgba(148,163,184,0.25),inset_-8px_-8px_16px_rgba(255,255,255,0.9),0_12px_24px_rgba(76,29,149,0.18)] backdrop-blur">
                Poems: Coming Soon {'\u{1F680}'}
              </div>
              <button
                onClick={() => go('learning-zone')}
                className="rounded-2xl border border-cyan-200/80 bg-cyan-50/95 px-5 py-3 text-sm font-black !text-cyan-900 shadow-lg shadow-cyan-900/10 transition hover:-translate-y-1 hover:bg-cyan-100"
              >
                🕹️ Play Zones
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-white/70 px-3 py-1 font-bold !text-slate-700 shadow-sm">
                Instant Unlock
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 font-bold !text-slate-700 shadow-sm">
                Kid-Safe Fun
              </span>
            </div>
          </div>

          <div className="clay-container rounded-[1.8rem] border border-white/40 bg-white/15 p-5 shadow-2xl backdrop-blur-md">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-black">
              Practice Container
            </p>
            <div className="space-y-3">
              {PARENT_ZONE_PRACTICE_ROUTES.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="clay-card flex items-center justify-between rounded-2xl border border-white/70 bg-white/30 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white/45"
                >
                  <span className="text-sm font-black tracking-wide text-black">{item.label}</span>
                  <span className="text-xl">{item.emoji}</span>
                </Link>
              ))}
            </div>

            <div className="clay-card mt-4 rounded-2xl border border-white/35 bg-gradient-to-r from-white/20 to-white/10 p-4">
              <p className="text-sm font-black text-black">
                Parent Zone practice now uses dedicated routes with one activity per page.
              </p>
              <p className="mt-1 text-sm font-black text-black">
                Open <code>/parent-zone</code> to access the full vertical menu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[2.2rem] border border-emerald-100 bg-gradient-to-b from-green-100 to-emerald-200 shadow-[0_20px_80px_rgba(16,185,129,0.2)]">
        <WaveDivider fill="#dcfce7" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-4 top-20 text-5xl opacity-80">🌳</div>
          <div className="absolute right-6 top-28 text-5xl opacity-80">🌳</div>
          <div className="absolute left-16 top-48 text-4xl opacity-90">🦁</div>
          <div className="absolute right-16 top-52 text-4xl opacity-90">🐘</div>
          <div className="absolute left-1/3 top-20 text-4xl opacity-90">🦒</div>
          <div className="absolute right-1/3 top-16 text-4xl opacity-90">🐼</div>
          <div className="absolute -left-6 bottom-20 h-24 w-24 rounded-full bg-green-300/30 blur-xl" />
          <div className="absolute right-10 bottom-10 h-24 w-24 rounded-full bg-emerald-300/40 blur-xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          {!isKidsModeOn && <GemPacksPricing />}

          <div className="mt-14 space-y-10">
            <div
              id="ai-studio"
              className="rounded-[1.8rem] border border-white/70 bg-white/50 p-4 shadow-xl backdrop-blur sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] !text-emerald-700">Creative Clouds</p>
                  <h3 className="mt-1 text-2xl font-black !text-slate-900">Story Studio & Magic Art</h3>
                  <p className="mt-1 text-sm !text-slate-600">
                    Make stories, draw magic, and spend your Gems on fun adventures.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-bold !text-slate-700 shadow">
                  <span className="mr-2">✨</span>
                  Free creative zone
                </div>
              </div>

              <div id="story-studio" className="h-0 scroll-mt-28" />
              <div id="magic-art" className="h-0 scroll-mt-28" />

              {user ? (
                <AIStudio />
              ) : (
                <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-white/90 to-emerald-50 p-8 text-center shadow-lg">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-4xl shadow-inner">
                    ✨
                  </div>
                  <h4 className="text-2xl font-black !text-slate-900">Unlock the AI Creative Studio</h4>
                  <p className="mx-auto mt-3 max-w-2xl !text-slate-600">
                    Log in to create magical stories, generate playful images, and enjoy fun adventures.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={onOpenLogin}
                      className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-1 hover:bg-emerald-600"
                    >
                      Login to Unlock
                    </button>
                    <button
                      onClick={() => go('magic-art')}
                      className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black !text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Open Magic Art
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.8rem] border border-white/70 bg-white/55 p-2 shadow-xl backdrop-blur sm:p-4">
              <LearningZone onSelect={onSelectLearningModule} />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[2.2rem] border border-cyan-100/60 bg-gradient-to-b from-cyan-200 to-blue-500 shadow-[0_22px_80px_rgba(14,116,144,0.22)]">
        <WaveDivider fill="#bae6fd" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-12 text-4xl opacity-90">🐬</div>
          <div className="absolute right-10 top-16 text-4xl opacity-90">🐢</div>
          <div className="absolute left-1/4 top-28 text-4xl opacity-90">🐙</div>
          <div className="absolute right-1/4 top-32 text-5xl opacity-90">🐳</div>
          <div className="absolute left-12 bottom-20 text-2xl opacity-70">🫧</div>
          <div className="absolute left-24 bottom-32 text-xl opacity-60">🫧</div>
          <div className="absolute right-16 bottom-24 text-2xl opacity-70">🫧</div>
          <div className="absolute right-32 bottom-36 text-xl opacity-60">🫧</div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-700/50 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black !text-slate-900 shadow-sm">
                  <span className="text-lg">{"\u{1F3A5}"}</span>
                  Latest Videos Slider
                </div>
                <span className="ml-3 text-sm font-bold !text-slate-900">
                  Auto-updated from Supabase videos table
                </span>
              </div>

              <div className="w-full max-w-full overflow-hidden rounded-3xl border border-white/80 bg-white/20 shadow-[0_20px_55px_rgba(15,23,42,0.2)] backdrop-blur">
                {heroBannersLoading ? (
                  <div className="grid min-h-[260px] place-items-center px-6 py-10 text-center text-white sm:min-h-[320px]">
                    <div>
                      <p className="text-lg font-black">Loading latest video banners...</p>
                      <p className="mt-2 text-sm font-semibold text-white/80">Syncing your 5 newest uploads.</p>
                    </div>
                  </div>
                ) : heroBannersError ? (
                  <div className="grid min-h-[260px] place-items-center px-6 py-10 text-center text-white sm:min-h-[320px]">
                    <div>
                      <p className="text-lg font-black">{heroBannersError}</p>
                      <p className="mt-2 text-sm font-semibold text-white/85">Please check Supabase connection and videos data.</p>
                    </div>
                  </div>
                ) : heroBannerCount === 0 ? (
                  <div className="grid min-h-[260px] place-items-center px-6 py-10 text-center text-white sm:min-h-[320px]">
                    <div>
                      <p className="text-lg font-black">No videos available yet.</p>
                      <p className="mt-2 text-sm font-semibold text-white/80">Upload videos with thumbnails to populate this slider automatically.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full max-w-full overflow-hidden">
                    <div
                      className="flex w-full max-w-full transition-transform duration-700 ease-out"
                      style={{ transform: `translateX(-${heroSlideIndex * 100}%)` }}
                    >
                      {heroBanners.map((banner, index) => (
                        <Link
                          key={banner.id}
                          to={`/videos?video=${encodeURIComponent(banner.id)}`}
                          className="relative block min-h-[260px] min-w-full select-none overflow-hidden sm:min-h-[320px]"
                        >
                          <img
                            src={banner.thumbnailUrl}
                            alt={`${banner.title} thumbnail`}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-transparent" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),rgba(255,255,255,0)_55%)]" />

                          <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                            <span className="inline-flex w-fit items-center rounded-full border border-white/70 bg-black/35 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
                              Video {index + 1} / {heroBannerCount}
                            </span>
                            <div className="space-y-2">
                              <h2 className="text-2xl font-black text-white drop-shadow sm:text-3xl">{banner.title}</h2>
                              <p className="max-w-xl text-sm font-semibold text-white/95 sm:text-base">
                                {banner.subtitle}
                              </p>
                              <span className="inline-flex items-center rounded-full border border-cyan-200/80 bg-cyan-100/90 px-3 py-1 text-xs font-black text-cyan-900 shadow-sm">
                                Open Video Page
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={goToPrevBanner}
                      disabled={heroBannerCount <= 1}
                      aria-label="Previous banner"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/30 px-3 py-2 text-lg font-black text-white shadow transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {'\u2190'}
                    </button>
                    <button
                      type="button"
                      onClick={goToNextBanner}
                      disabled={heroBannerCount <= 1}
                      aria-label="Next banner"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/30 px-3 py-2 text-lg font-black text-white shadow transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {'\u2192'}
                    </button>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {heroBanners.map((banner, index) => (
                        <span
                          key={banner.id}
                          className={`h-1.5 rounded-full transition-all ${
                            index === heroSlideIndex ? 'w-6 bg-white' : 'w-2 bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="cursor-default rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-xs font-black !text-slate-800 shadow-sm"
                >
                  {heroBannerCount} Banners Live
                </button>
                <button
                  type="button"
                  className="cursor-default rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-xs font-black !text-slate-800 shadow-sm"
                >
                  Auto Slide Every 4s
                </button>
                <span className="inline-flex items-center rounded-full border border-cyan-200/90 bg-cyan-50/95 px-4 py-1.5 text-xs font-black !text-cyan-900 shadow-sm">
                  Click Banner to Open Video
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-xl backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-wider !text-slate-500">TREASURES &amp; DAILY GIFT 🎁</p>
                  <p className="mt-2 text-sm font-black !text-fuchsia-700">Mega Balance</p>
                  <p className="mt-1 text-3xl font-black !text-blue-900">{rainbowGemsBalance} 🌈</p>
                  <button
                    type="button"
                    onClick={handleClaimDailyChest}
                    disabled={hasClaimedDailyChestToday}
                    className={`mt-3 rounded-xl px-4 py-2 text-sm font-black ${
                      hasClaimedDailyChestToday
                        ? 'cursor-not-allowed border border-slate-300 bg-slate-300 !text-slate-600'
                        : 'border border-fuchsia-700 bg-fuchsia-700 !text-white'
                    }`}
                  >
                    {hasClaimedDailyChestToday ? (
                      '⏳ Come back tomorrow'
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        🎁 Open Daily Chest (+10 <Gem size={13} className="text-purple-500" /> &amp; +5 🌈)
                      </span>
                    )}
                  </button>
                  <p className="mt-2 min-h-[1.25rem] text-sm font-semibold !text-emerald-700">{dailyChestMessage}</p>
                </div>
                <div className="col-span-2 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-xl backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-wider !text-slate-500">Mega Vault Bank 🏦</p>
                  <p className="mt-2 text-sm font-bold !text-slate-700">Trade your Purple Gems for Premium Rainbow Gems!</p>
                  <button
                    type="button"
                    onClick={handleConvertToRainbowGems}
                    className="mt-3 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-black text-white"
                  >
                    <span className="inline-flex items-center gap-1">
                      Convert 300 <Gem size={13} className="text-purple-500" /> to 10 🌈
                    </span>
                  </button>
                  <p
                    className={`mt-2 min-h-[1.25rem] text-sm font-semibold ${
                      exchangeFeedback.tone === 'success'
                        ? '!text-emerald-700'
                        : exchangeFeedback.tone === 'error'
                          ? '!text-rose-700'
                          : '!text-slate-600'
                    }`}
                  >
                    {exchangeFeedback.message}
                  </p>
                  <Link
                    to="/mega-vault"
                    className="mt-2 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white"
                  >
                    Go to Mega Vault 🏰
                  </Link>
                </div>
                <div className="col-span-2 rounded-[1.6rem] border border-white/80 bg-gradient-to-r from-white/80 via-sky-50/80 to-white/80 p-5 shadow-xl backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] !text-blue-700">Today&apos;s Fun Route</p>
                      <p className="mt-1 text-xl font-black !text-slate-900">Sky Games → Safari Gems → Ocean Party</p>
                      <p className="mt-1 text-sm !text-slate-600">Scroll the habitats and pick your favorite adventure.</p>
                    </div>
                    <div className="text-5xl">🌤️🦁🌊</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[2.2rem] border border-cyan-100/60 bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-700 shadow-[0_22px_80px_rgba(14,116,144,0.24)]">
        <WaveDivider fill="#a5f3fc" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-10 text-3xl opacity-80">🫧</div>
          <div className="absolute left-20 top-20 text-2xl opacity-70">🫧</div>
          <div className="absolute right-8 top-14 text-4xl opacity-80">🐠</div>
          <div className="absolute right-20 top-28 text-4xl opacity-80">🐬</div>
          <div className="absolute left-10 bottom-12 h-24 w-24 rounded-full bg-cyan-200/25 blur-2xl" />
          <div className="absolute right-8 bottom-10 h-28 w-28 rounded-full bg-blue-200/20 blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-blue-900/35 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] !text-cyan-950/75">
              The Ocean • Watch &amp; Earn
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl !text-white">
              <span className="inline-flex items-center gap-2">
                Want Free Gems? <Gem size={22} className="text-purple-500" />
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm sm:text-base !text-blue-50/95">
              Explore our official channel and enjoy family-friendly adventures from AikoKidzTV.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-white/40 bg-white/15 p-5 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] !text-cyan-900/75">
                  Official Channel
                </p>
                <h3 className="mt-2 text-2xl font-black !text-white sm:text-3xl">
                  AikoKidzTV on YouTube
                </h3>
                <p className="mt-3 max-w-xl text-sm font-semibold !text-blue-50/95 sm:text-base">
                  New stories, playful learning, and kid-safe entertainment updates are published on our official channel.
                </p>
                <a
                  href="https://www.youtube.com/@AikoKidzTV"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSubscribeClick}
                  className="mt-5 inline-flex items-center rounded-2xl border border-red-200/80 bg-red-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-red-400/30 transition hover:-translate-y-0.5 hover:bg-red-600"
                >
                  ▶ Subscribe to our Channel
                </a>
              </div>
              <div className="rounded-2xl border border-white/35 bg-gradient-to-br from-red-500/30 via-fuchsia-500/20 to-cyan-500/30 p-5 text-center">
                <p className="text-5xl">📺✨</p>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] !text-white/85">
                  youtube.com/@AikoKidzTV
                </p>
                <p className="mt-2 text-sm font-semibold !text-blue-50/95">
                  Tap subscribe and join the official AikoKidzTV family.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClaimFreeGems}
              disabled={!canClaimYoutubeReward}
              className={`rounded-2xl px-6 py-3 text-base font-black shadow-xl transition ${
                !canClaimYoutubeReward
                  ? 'cursor-not-allowed border border-white/40 bg-white/20 !text-blue-50/90'
                  : 'border border-white/80 bg-white/95 !text-blue-700 hover:-translate-y-1 hover:bg-cyan-50'
              }`}
            >
              {freeGemsClaimed
                ? '✅ Already Claimed'
                : isClaimingYoutubeReward
                  ? 'Claiming...'
                  : !hasClickedSubscribe
                    ? 'Subscribe First'
                  : '🎁 Claim 50 Free Gems'}
            </button>

            {watchEarnMessage ? (
              <p className="rounded-full border border-emerald-200/40 bg-emerald-400/15 px-4 py-2 text-sm font-bold !text-emerald-50">
                {watchEarnMessage}
              </p>
            ) : (
              <p className="text-xs font-semibold !text-blue-50/85">
                Click "Subscribe to our channel" first, then claim your one-time 50 gems reward.
              </p>
            )}
          </div>
        </div>
      </section>

      {paymentToast ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[100]">
          <div
            className={[
              'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur',
              paymentToast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : '',
              paymentToast.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : '',
              paymentToast.type === 'info'
                ? 'border-sky-200 bg-sky-50 text-sky-800'
                : '',
            ].join(' ')}
          >
            {paymentToast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
