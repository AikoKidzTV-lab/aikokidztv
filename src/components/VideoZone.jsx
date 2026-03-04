import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  FREE_VIDEO_REWARD_GEMS,
  claimRewardOnce,
  unlockFeatureWithGems,
} from '../utils/profileEconomy';

const UNKNOWN_CATEGORY = 'Uncategorized';
const MOVIES_UNLOCK_COST_GEMS = 500;
const MOVIES_FEATURE_KEY = 'movies';

const isMissingColumnError = (error, columnName) => {
  if (!columnName) return false;
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedColumn = String(columnName).toLowerCase();
  return (
    text.includes(normalizedColumn) &&
    (
      text.includes('column') ||
      text.includes('schema cache') ||
      error?.code === '42703' ||
      error?.code === 'PGRST204'
    )
  );
};

const normalizeUnlockedFeatures = (value) => (
  Array.isArray(value)
    ? value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
      .filter(Boolean)
    : []
);

const normalizeVideoRow = (row) => {
  const imageUrl = typeof row?.thumbnail_url === 'string' ? row.thumbnail_url.trim() : '';
  const videoUrl = typeof row?.video_url === 'string' ? row.video_url.trim() : '';

  if (!videoUrl) return null;

  const id = row?.id ? String(row.id) : `${row?.title || 'video'}-${videoUrl}`;

  return {
    id,
    title: typeof row?.title === 'string' && row.title.trim() ? row.title.trim() : 'Untitled Movie',
    category: UNKNOWN_CATEGORY,
    imageUrl,
    videoUrl,
    isPremium: false,
  };
};

const getWatchRewardKey = (videoId) => `watched_video_${videoId}`;

export default function VideoZone() {
  const { user, profile, fetchProfile } = useAuth();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [actionVideoId, setActionVideoId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isMoviesUnlocked, setIsMoviesUnlocked] = useState(false);
  const [isCheckingUnlockState, setIsCheckingUnlockState] = useState(true);
  const [isUnlockingMovies, setIsUnlockingMovies] = useState(false);

  const claimedRewards = useMemo(
    () => (Array.isArray(profile?.claimed_rewards) ? profile.claimed_rewards : []),
    [profile?.claimed_rewards]
  );
  const currentGems = Number(profile?.gems || 0);
  const canUnlockMovies = Boolean(user?.id) && currentGems >= MOVIES_UNLOCK_COST_GEMS;
  const isMoviesUnlockButtonDisabled = isCheckingUnlockState || isUnlockingMovies || !canUnlockMovies;

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 3000);
  };

  const readProfileFeatures = async (userId, { includeGems = false } = {}) => {
    const featureColumns = includeGems ? 'gems, unlocked_features' : 'unlocked_features';
    const fallbackColumns = includeGems ? 'gems' : 'id';

    let query = supabase.from('profiles').select(featureColumns).eq('id', userId);
    query = includeGems ? query.single() : query.maybeSingle();
    let { data, error } = await query;

    if (error && isMissingColumnError(error, 'unlocked_features')) {
      let fallbackQuery = supabase.from('profiles').select(fallbackColumns).eq('id', userId);
      fallbackQuery = includeGems ? fallbackQuery.single() : fallbackQuery.maybeSingle();
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        throw new Error(fallbackError.message || 'Failed to read profile.');
      }

      return {
        unlockedFeatures: [],
        gems: Number(fallbackData?.gems || 0),
        hasUnlockedFeaturesColumn: false,
      };
    }

    if (error) {
      throw new Error(error.message || 'Failed to read profile.');
    }

    return {
      unlockedFeatures: normalizeUnlockedFeatures(data?.unlocked_features),
      gems: Number(data?.gems || 0),
      hasUnlockedFeaturesColumn: true,
    };
  };

  useEffect(() => {
    let mounted = true;

    const checkMoviesUnlockState = async () => {
      if (!user?.id) {
        if (mounted) {
          setIsMoviesUnlocked(false);
          setIsCheckingUnlockState(false);
        }
        return;
      }

      setIsCheckingUnlockState(true);

      try {
        const { unlockedFeatures } = await readProfileFeatures(user.id, { includeGems: false });
        if (!mounted) return;
        setIsMoviesUnlocked(unlockedFeatures.includes(MOVIES_FEATURE_KEY));
      } catch (error) {
        if (!mounted) return;
        console.error('[VideoZone] Failed to check movies unlock state:', error);
        setIsMoviesUnlocked(false);
      } finally {
        if (mounted) {
          setIsCheckingUnlockState(false);
        }
      }
    };

    void checkMoviesUnlockState();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    const loadMovieCards = async () => {
      if (!isMoviesUnlocked) {
        if (mounted) {
          setVideos([]);
          setLoadError('');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const { data, error } = await supabase
          .from('videos')
          .select('id, title, video_url, thumbnail_url');

        if (error) {
          throw new Error(error.message);
        }

        if (!mounted) return;

        const normalized = (data || []).map(normalizeVideoRow).filter(Boolean);
        setVideos(normalized);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err?.message || 'Failed to load videos.');
        setVideos([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadMovieCards();

    return () => {
      mounted = false;
    };
  }, [isMoviesUnlocked]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(videos.map((video) => video.category).filter(Boolean)));
    return ['All', ...unique];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return videos;
    return videos.filter((video) => video.category === activeCategory);
  }, [activeCategory, videos]);

  useEffect(() => {
    if (activeCategory === 'All') return;
    if (!categoryOptions.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [activeCategory, categoryOptions]);

  const openVideoInNewTab = (videoUrl) => {
    if (typeof window === 'undefined') return;
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleUnlockMoviesSection = async () => {
    if (isUnlockingMovies) return;

    if (!user?.id) {
      showStatus('Please log in to unlock the Movies section.');
      return;
    }

    setIsUnlockingMovies(true);

    try {
      // Fresh server read before unlock attempt to bypass local state/cache.
      const latestProfileState = await readProfileFeatures(user.id, { includeGems: true });
      if (!latestProfileState?.hasUnlockedFeaturesColumn) {
        showStatus('Unlock field is unavailable in profile schema. Please check Supabase column setup.');
        return;
      }
      if (latestProfileState.unlockedFeatures.includes(MOVIES_FEATURE_KEY)) {
        setIsMoviesUnlocked(true);
        showStatus('Movies are already unlocked. Enjoy!');
        return;
      }

      const unlockResult = await unlockFeatureWithGems({
        userId: user.id,
        featureId: MOVIES_FEATURE_KEY,
        costGems: MOVIES_UNLOCK_COST_GEMS,
      });

      if (!unlockResult?.ok) {
        if (unlockResult?.code === 'missing_unlocked_features_column') {
          showStatus('Unlock field is unavailable in profile schema. Please check Supabase column setup.');
          return;
        }
        if (unlockResult?.code === 'insufficient_gems') {
          showStatus(unlockResult.message || `You need ${MOVIES_UNLOCK_COST_GEMS} Gems.`);
          return;
        }
        if (unlockResult?.code === 'rls_update_denied') {
          showStatus('Profile update blocked by RLS policy. Please allow profile updates for the authenticated user.');
          return;
        }
        showStatus(unlockResult.message || 'Could not unlock Movies right now.');
        return;
      }

      setIsMoviesUnlocked(true);
      await fetchProfile?.(user.id, { retryCount: 2, preferDirect: true });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('aiko:auth-refresh'));
      }
      showStatus(
        unlockResult?.alreadyUnlocked
          ? 'Movies are already unlocked. Enjoy!'
          : `🎬 Movies unlocked! ${MOVIES_UNLOCK_COST_GEMS} Gems spent.`
      );
    } catch (error) {
      console.error('[VideoZone] Failed to unlock Movies section:', error);
      showStatus(error?.message || 'Could not unlock Movies right now.');
    } finally {
      setIsUnlockingMovies(false);
    }
  };

  const handleFreeVideoReward = async (video) => {
    if (!user?.id) {
      showStatus('Log in to earn free-gem rewards for watched videos.');
      return;
    }

    const rewardKey = getWatchRewardKey(video.id);
    if (claimedRewards.includes(rewardKey)) {
      return;
    }

    const rewardResult = await claimRewardOnce({
      userId: user.id,
      rewardKey,
      gemReward: FREE_VIDEO_REWARD_GEMS,
    });

    if (!rewardResult.ok) {
      showStatus(rewardResult.message || 'Could not grant watch reward right now.');
      return;
    }

    if (!rewardResult.alreadyClaimed) {
      await fetchProfile?.(user.id);
      showStatus(`Reward granted: +${FREE_VIDEO_REWARD_GEMS} Gems for watching.`);
    }
  };

  const handleVideoAction = async (video) => {
    if (!video?.videoUrl || actionVideoId || !isMoviesUnlocked) return;

    setActionVideoId(video.id);

    try {
      openVideoInNewTab(video.videoUrl);
      await handleFreeVideoReward(video);
    } catch (error) {
      console.error('[VideoZone] Video action failed:', error);
      showStatus('Something went wrong. Please try again.');
    } finally {
      setActionVideoId('');
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-8 left-1/4 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="clay-container mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">Video Zone</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-4xl">
                Aiko&apos;s Cinema Magic
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                Unlock the Movies section once for {MOVIES_UNLOCK_COST_GEMS} Gems, then watch and earn +{FREE_VIDEO_REWARD_GEMS} Gems on each first watch.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isCheckingUnlockState
                ? 'Checking access...'
                : isMoviesUnlocked
                  ? (isLoading ? 'Loading...' : `${filteredVideos.length} videos`)
                  : 'Movies Locked'}
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-100">
            Current Gems: {currentGems}
          </div>

          {loadError && (
            <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
              Failed to load videos: {loadError}
            </div>
          )}
        </div>

        {isMoviesUnlocked ? (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              {categoryOptions.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.25)]'
                        : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {filteredVideos.map((video) => {
                const rewardKey = getWatchRewardKey(video.id);
                const rewardClaimed = claimedRewards.includes(rewardKey);
                const isBusy = actionVideoId === video.id;
                const actionLabel = rewardClaimed ? 'Watch Again' : `Watch +${FREE_VIDEO_REWARD_GEMS} 💎`;

                return (
                  <article
                    key={video.id}
                    className="clay-card group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300/40 hover:bg-white/10"
                  >
                    <div className="relative">
                      <img
                        src={video.imageUrl || '/logo.png.webp'}
                        alt={`${video.title} banner`}
                        className="aspect-video w-full object-cover"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900">
                          {video.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white">
                          {rewardClaimed ? 'Reward Claimed' : 'Free Reward'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="min-h-[3rem] text-base font-extrabold text-white">{video.title}</h3>
                      <p className="mt-2 text-xs text-slate-300">
                        {rewardClaimed
                          ? 'Reward already claimed for this video.'
                          : `First watch grants +${FREE_VIDEO_REWARD_GEMS} Gems.`}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleVideoAction(video)}
                        disabled={Boolean(actionVideoId)}
                        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${
                          isBusy
                            ? 'cursor-not-allowed bg-slate-600 text-slate-200'
                            : 'bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                        } ${Boolean(actionVideoId) && !isBusy ? 'opacity-60' : ''}`}
                      >
                        {isBusy ? 'Processing...' : actionLabel}
                        {!isBusy && <ExternalLink size={14} />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredVideos.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-200">
                {isLoading ? 'Loading videos...' : '🧸 Coming Soon! Fresh movie adventures will pop up here very soon.'}
              </div>
            )}
          </>
        ) : (
          <div className="clay-container rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/85">Movies Unlock</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">🎬 Unlock Aiko&apos;s Movies</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              Spend <span className="font-black text-cyan-100">{MOVIES_UNLOCK_COST_GEMS} Gems</span> once to unlock the full Movies section.
            </p>
            <button
              type="button"
              onClick={handleUnlockMoviesSection}
              disabled={isMoviesUnlockButtonDisabled}
              className={`mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black transition ${
                isMoviesUnlockButtonDisabled
                  ? 'cursor-not-allowed border border-slate-500 bg-slate-700 text-slate-200 opacity-70'
                  : 'border border-cyan-200 bg-cyan-300 text-slate-950 hover:bg-cyan-200'
              }`}
            >
              {isCheckingUnlockState
                ? 'Checking unlock status...'
                : isUnlockingMovies
                  ? 'Unlocking Movies...'
                  : !user?.id
                    ? 'Login to Unlock Movies'
                    : canUnlockMovies
                      ? `Unlock Movies for ${MOVIES_UNLOCK_COST_GEMS} 💎`
                      : `Need ${MOVIES_UNLOCK_COST_GEMS} 💎`}
            </button>
            {!user?.id && (
              <p className="mt-3 text-xs font-semibold text-slate-300">
                Please log in first to unlock with Gems.
              </p>
            )}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="fixed bottom-6 right-4 z-50 rounded-2xl border border-indigo-200 bg-indigo-100 px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg">
          {statusMessage}
        </div>
      )}
    </section>
  );
}
