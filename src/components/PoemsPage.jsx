import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { claimRewardOnce, unlockItemWithGems } from '../utils/profileEconomy';

const FREE_POEM_COUNT = 5;
const POEM_UNLOCK_COST_GEMS = 10;
const POEM_COMPLETION_REWARD_GEMS = 5;
const POEM_UNLOCK_PREFIX = 'poem_unlock:';
const POEM_COMPLETE_PREFIX = 'poem_complete:';

const readPoemText = (row) =>
  (row?.content ||
    row?.poem ||
    row?.body ||
    row?.description ||
    row?.text ||
    '')
    .toString()
    .trim();

const readPoemTitle = (row, fallbackIndex) =>
  (row?.title || row?.name || `Poem ${fallbackIndex + 1}`).toString().trim();

export default function PoemsPage() {
  const { user, profile, fetchProfile } = useAuth();
  const [poems, setPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedPoemId, setSelectedPoemId] = useState('');
  const [unlockingPoemId, setUnlockingPoemId] = useState('');
  const [completingPoemId, setCompletingPoemId] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPoems = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        if (!mounted) return;
        const normalized = (data || [])
          .map((row, index) => ({
            id: String(row?.id || `poem-${index + 1}`),
            title: readPoemTitle(row, index),
            content: readPoemText(row),
            imageUrl:
              (row?.image_url || row?.cover_url || row?.thumbnail_url || '').toString().trim() || '',
            isFree: Boolean(row?.is_free),
            createdAt: row?.created_at || null,
            raw: row,
          }))
          .filter((row) => row.content);

        setPoems(normalized);
        if (normalized.length > 0) {
          setSelectedPoemId(normalized[0].id);
        }
      } catch (error) {
        if (!mounted) return;
        setLoadError(error?.message || 'Failed to load poems.');
        setPoems([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadPoems();
    return () => {
      mounted = false;
    };
  }, []);

  const unlockedItems = useMemo(
    () => (Array.isArray(profile?.unlocked_items) ? profile.unlocked_items : []),
    [profile?.unlocked_items]
  );
  const claimedRewards = useMemo(
    () => (Array.isArray(profile?.claimed_rewards) ? profile.claimed_rewards : []),
    [profile?.claimed_rewards]
  );
  const currentGems = Number(profile?.gems || 0);

  const isPoemUnlocked = (poem, index) => {
    const freeByIndex = index < FREE_POEM_COUNT;
    const freeByFlag = Boolean(poem?.isFree);
    const unlockKey = `${POEM_UNLOCK_PREFIX}${poem?.id}`;
    return freeByIndex || freeByFlag || unlockedItems.includes(unlockKey);
  };

  const selectedPoem = poems.find((poem) => poem.id === selectedPoemId) || null;
  const selectedPoemIndex = poems.findIndex((poem) => poem.id === selectedPoemId);
  const selectedPoemUnlocked =
    selectedPoem && selectedPoemIndex >= 0 ? isPoemUnlocked(selectedPoem, selectedPoemIndex) : false;

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2800);
  };

  const handleOpenPoem = async (poem, index) => {
    if (!poem?.id) return;

    if (isPoemUnlocked(poem, index)) {
      setSelectedPoemId(poem.id);
      return;
    }

    if (!user?.id) {
      showStatus('Please log in to unlock more poems.');
      return;
    }

    if (unlockingPoemId) return;
    setUnlockingPoemId(poem.id);

    try {
      const unlockResult = await unlockItemWithGems({
        userId: user.id,
        itemKey: `${POEM_UNLOCK_PREFIX}${poem.id}`,
        costGems: POEM_UNLOCK_COST_GEMS,
      });

      if (!unlockResult.ok) {
        showStatus(unlockResult.message || 'Unable to unlock poem right now.');
        return;
      }

      await fetchProfile?.(user.id);
      setSelectedPoemId(poem.id);
      showStatus(
        unlockResult.alreadyUnlocked
          ? 'Poem already unlocked.'
          : `Poem unlocked for ${POEM_UNLOCK_COST_GEMS} gems.`
      );
    } catch (error) {
      showStatus(error?.message || 'Unlock failed.');
    } finally {
      setUnlockingPoemId('');
    }
  };

  const handleCompletePoem = async () => {
    if (!selectedPoem?.id) return;
    if (!user?.id) {
      showStatus('Please log in to claim poem rewards.');
      return;
    }

    if (completingPoemId) return;
    setCompletingPoemId(selectedPoem.id);

    try {
      const rewardResult = await claimRewardOnce({
        userId: user.id,
        rewardKey: `${POEM_COMPLETE_PREFIX}${selectedPoem.id}`,
        gemReward: POEM_COMPLETION_REWARD_GEMS,
      });

      if (!rewardResult.ok) {
        showStatus(rewardResult.message || 'Could not grant completion reward.');
        return;
      }

      await fetchProfile?.(user.id);
      showStatus(
        rewardResult.alreadyClaimed
          ? 'Completion reward already claimed for this poem.'
          : `Great job! +${POEM_COMPLETION_REWARD_GEMS} free gems added.`
      );
    } catch (error) {
      showStatus(error?.message || 'Completion reward failed.');
    } finally {
      setCompletingPoemId('');
    }
  };

  const selectedPoemRewardClaimed = selectedPoem
    ? claimedRewards.includes(`${POEM_COMPLETE_PREFIX}${selectedPoem.id}`)
    : false;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-950 via-sky-900 to-cyan-800 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-8 text-3xl opacity-90">{'\u{1F426}'}</div>
        <div className="absolute right-10 top-12 text-4xl opacity-90">{'\u{1F43C}'}</div>
        <div className="absolute left-1/4 top-24 text-4xl opacity-80">{'\u{1F338}'}</div>
        <div className="absolute right-1/3 top-32 text-3xl opacity-80">{'\u{1F98B}'}</div>
        <div className="absolute left-14 bottom-28 text-5xl opacity-70">{'\u{1F30A}'}</div>
        <div className="absolute right-8 bottom-24 text-5xl opacity-70">{'\u{1F30C}'}</div>
        <div className="absolute -left-16 top-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">Poems Garden</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Cute Galaxy Poems {'\u{1F426}\u{1F43C}\u{1F338}'}
              </h1>
              <div className="mt-2 inline-flex items-center rounded-full border border-amber-200/70 bg-amber-100/90 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-amber-900">
                Coming Soon {'\u{1F680}'}
              </div>
              <p className="mt-2 max-w-3xl text-sm text-cyan-50/90 sm:text-base">
                First 5 poems are free. Remaining poems cost {POEM_UNLOCK_COST_GEMS} gems each.
                Complete a poem to earn +{POEM_COMPLETION_REWARD_GEMS} gems.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/30 bg-slate-900/50 px-4 py-2 text-sm font-bold">
              <span>Current Gems: {currentGems}</span>
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
                className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-5 rounded-2xl border border-rose-200/30 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-100">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-cyan-100/80">
              Poems Library
            </h2>

            {isLoading ? (
              <div className="grid min-h-[220px] place-items-center text-sm font-semibold text-cyan-100">
                Loading poems...
              </div>
            ) : poems.length === 0 ? (
              <div className="grid min-h-[220px] place-items-center text-sm font-semibold text-cyan-100">
                No poems found.
              </div>
            ) : (
              <div className="space-y-3">
                {poems.map((poem, index) => {
                  const unlocked = isPoemUnlocked(poem, index);
                  const isActive = selectedPoemId === poem.id;

                  return (
                    <button
                      key={poem.id}
                      type="button"
                      onClick={() => void handleOpenPoem(poem, index)}
                      disabled={Boolean(unlockingPoemId)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-fuchsia-200/70 bg-fuchsia-400/20'
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      } ${Boolean(unlockingPoemId) && unlockingPoemId !== poem.id ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-white">{poem.title}</p>
                          <p className="mt-1 text-xs font-semibold text-cyan-100/80">
                            {unlocked
                              ? 'Open poem'
                              : unlockingPoemId === poem.id
                                ? 'Unlocking...'
                                : `Locked - ${POEM_UNLOCK_COST_GEMS} gems`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${
                            unlocked ? 'bg-emerald-300/30 text-emerald-100' : 'bg-amber-300/30 text-amber-100'
                          }`}
                        >
                          {index < FREE_POEM_COUNT || poem.isFree ? 'Free' : unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
            {!selectedPoem ? (
              <div className="grid min-h-[320px] place-items-center text-center">
                <div>
                  <div className="mb-3 text-5xl">{'\u{1F338}\u{1F426}\u{1F4D6}'}</div>
                  <p className="text-lg font-black text-white">Select a poem to start reading.</p>
                </div>
              </div>
            ) : !selectedPoemUnlocked ? (
              <div className="grid min-h-[320px] place-items-center text-center">
                <div>
                  <div className="mb-3 text-5xl">{'\u{1F512}'}</div>
                  <p className="text-lg font-black text-white">This poem is locked.</p>
                  <p className="mt-1 text-sm text-cyan-100/85">
                    Unlock for {POEM_UNLOCK_COST_GEMS} gems to read this poem.
                  </p>
                </div>
              </div>
            ) : (
              <article>
                <h2 className="text-2xl font-black text-white sm:text-3xl">{selectedPoem.title}</h2>
                <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/20 bg-slate-900/40 p-4 text-sm leading-relaxed text-cyan-50 sm:text-base">
                  {selectedPoem.content}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleCompletePoem()}
                    disabled={selectedPoemRewardClaimed || completingPoemId === selectedPoem.id}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                      selectedPoemRewardClaimed || completingPoemId === selectedPoem.id
                        ? 'cursor-not-allowed border border-white/20 bg-white/10 text-cyan-100/80'
                        : 'border border-emerald-200/60 bg-emerald-400/30 text-emerald-50 hover:bg-emerald-400/40'
                    }`}
                  >
                    {selectedPoemRewardClaimed
                      ? 'Reward Claimed'
                      : completingPoemId === selectedPoem.id
                        ? 'Completing...'
                        : `Complete Poem (+${POEM_COMPLETION_REWARD_GEMS} gems)`}
                  </button>
                  <span className="text-xs font-semibold text-cyan-100/85">
                    Completion reward can be claimed once per poem.
                  </span>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="fixed bottom-6 right-4 z-50 rounded-2xl border border-cyan-200/40 bg-cyan-400/20 px-5 py-3 text-sm font-bold text-cyan-50 shadow-lg backdrop-blur">
          {statusMessage}
        </div>
      )}
    </section>
  );
}
