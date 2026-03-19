import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { megaVaultPacks } from '../data/megaVaultData';

const normalizeUnlockedPackIds = (rows) => {
  if (!Array.isArray(rows)) return [];
  return [...new Set(
    rows
      .map((row) => String(row?.module_id || '').trim())
      .filter(Boolean)
  )];
};

const MEGA_VAULT_LOCK_REQUIREMENT = 500;

export default function MegaVaultPage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, updateProfileBalances } = useAuth();
  const [unlockedPackIds, setUnlockedPackIds] = React.useState([]);
  const [loadingUnlocked, setLoadingUnlocked] = React.useState(false);
  const [processingPackId, setProcessingPackId] = React.useState('');
  const [feedback, setFeedback] = React.useState({ message: '', tone: 'neutral' });

  const rainbowGemsBalance = Number(profile?.rainbowGems ?? profile?.rainbow_gems ?? 0);
  const unlockedPackIdSet = React.useMemo(
    () => new Set(unlockedPackIds),
    [unlockedPackIds]
  );

  React.useEffect(() => {
    if (!user?.id) {
      setUnlockedPackIds([]);
      return;
    }

    let isActive = true;

    const loadUnlockedPacks = async () => {
      setLoadingUnlocked(true);
      const { data, error } = await supabase
        .from('unlocked_modules')
        .select('module_id')
        .eq('user_id', user.id);

      if (!isActive) return;

      if (error) {
        setFeedback({
          message: error.message || 'Unable to load unlocked packs right now.',
          tone: 'error',
        });
        setUnlockedPackIds([]);
        setLoadingUnlocked(false);
        return;
      }

      setUnlockedPackIds(normalizeUnlockedPackIds(data));
      setLoadingUnlocked(false);
    };

    void loadUnlockedPacks();
    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const handleOpenPack = React.useCallback((packId) => {
    if (!packId) return;
    navigate(`/mega-vault/${packId}`);
  }, [navigate]);

  const handleBuyPack = React.useCallback(async (pack) => {
    if (!pack?.id || processingPackId) return;

    if (!user?.id) {
      setFeedback({ message: 'Please log in to buy Mega Vault packs.', tone: 'error' });
      return;
    }

    if (unlockedPackIdSet.has(pack.id)) {
      setFeedback({ message: `${pack.title} is already unlocked!`, tone: 'success' });
      return;
    }

    const currentRainbowGems = Number(profile?.rainbowGems ?? profile?.rainbow_gems ?? 0);
    if (!Number.isFinite(currentRainbowGems) || currentRainbowGems < MEGA_VAULT_LOCK_REQUIREMENT) {
      setFeedback({
        message: `🔒 Mega Vault Lock: You need ${MEGA_VAULT_LOCK_REQUIREMENT} Multi-Color Gems 🌈 to unlock premium packs. Keep collecting!`,
        tone: 'error',
      });
      return;
    }

    if (!Number.isFinite(currentRainbowGems) || currentRainbowGems < pack.price) {
      setFeedback({ message: 'Not enough Multi-Color Gems! 🌈', tone: 'error' });
      return;
    }

    const nextRainbowGems = Math.max(0, currentRainbowGems - Number(pack.price || 0));

    setProcessingPackId(pack.id);
    setUnlockedPackIds((current) => [...new Set([...current, pack.id])]);
    updateProfileBalances?.({
      rainbow_gems: nextRainbowGems,
      rainbowGems: nextRainbowGems,
    });
    setFeedback({ message: `Success! ${pack.title} unlocked.`, tone: 'success' });

    try {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ rainbow_gems: nextRainbowGems })
        .eq('id', user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      const { error: unlockInsertError } = await supabase
        .from('unlocked_modules')
        .insert({ user_id: user.id, module_id: pack.id });

      if (unlockInsertError) {
        if (unlockInsertError.code === '23505') {
          await supabase
            .from('profiles')
            .update({ rainbow_gems: currentRainbowGems })
            .eq('id', user.id);
          updateProfileBalances?.({
            rainbow_gems: currentRainbowGems,
            rainbowGems: currentRainbowGems,
          });
          setUnlockedPackIds((current) => [...new Set([...current, pack.id])]);
          setFeedback({ message: `${pack.title} is already unlocked!`, tone: 'success' });
          void fetchProfile?.(user.id);
          return;
        }
        throw unlockInsertError;
      }

      void fetchProfile?.(user.id);
    } catch (error) {
      setUnlockedPackIds((current) => current.filter((id) => id !== pack.id));
      updateProfileBalances?.({
        rainbow_gems: currentRainbowGems,
        rainbowGems: currentRainbowGems,
      });
      await supabase
        .from('profiles')
        .update({ rainbow_gems: currentRainbowGems })
        .eq('id', user.id);
      setFeedback({
        message: error?.message || 'Purchase failed. Please try again.',
        tone: 'error',
      });
    } finally {
      setProcessingPackId('');
    }
  }, [
    fetchProfile,
    processingPackId,
    profile?.rainbowGems,
    profile?.rainbow_gems,
    unlockedPackIdSet,
    updateProfileBalances,
    user?.id,
  ]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Premium Zone</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Mega Vault 🏰</h1>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Spend Multi-Color Gems to permanently unlock premium question packs.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
                🔒 Vault Lock: <span className="font-bold">{MEGA_VAULT_LOCK_REQUIREMENT} Multi-Color Gems 🌈</span>{' '}
                required to unlock any pack
              </p>
            </div>
            <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-fuchsia-700">Your Multi-Color Balance</p>
              <p className="mt-1 text-xl font-black text-fuchsia-900">{rainbowGemsBalance} 🌈</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800"
            >
              Back to Dashboard
            </Link>
            {loadingUnlocked ? (
              <p className="text-sm font-semibold text-slate-600">Loading unlocked packs...</p>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {megaVaultPacks.map((pack) => {
              const isUnlocked = unlockedPackIdSet.has(pack.id);
              const isProcessing = processingPackId === pack.id;

              return (
                <div
                  key={pack.id}
                  className="rounded-2xl border border-slate-300 bg-slate-50 p-4"
                >
                  <div className="text-4xl">{pack.icon}</div>
                  <h2 className="mt-3 text-lg font-black text-slate-900">{pack.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{pack.description}</p>
                  <p className="mt-2 text-sm font-black text-slate-800">Price: {pack.price} Multi-Color Gems 🌈</p>

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPack(pack.id)}
                      className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                    >
                      OPEN PACK 🔓
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuyPack(pack)}
                      disabled={isProcessing}
                      className="mt-4 w-full rounded-xl bg-slate-500 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isProcessing ? 'Processing...' : `UNLOCK for ${pack.price} 🌈`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p
            className={`mt-6 min-h-[1.25rem] text-sm font-semibold ${
              feedback.tone === 'error'
                ? 'text-rose-700'
                : feedback.tone === 'success'
                  ? 'text-emerald-700'
                  : 'text-slate-600'
            }`}
          >
            {feedback.message}
          </p>
        </div>
      </div>
    </div>
  );
}
