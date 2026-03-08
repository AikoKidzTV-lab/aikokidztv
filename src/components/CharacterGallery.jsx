import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { CHARACTER_PROFILES } from '../constants/characters';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { supabase } from '../supabaseClient';
import {
  CHARACTER_SUBSCRIPTION_CHARACTER_IDS,
  CHARACTER_SUBSCRIPTION_COST_GEMS,
  CHARACTER_SUBSCRIPTION_DAYS,
  fetchActiveCharacterSubscriptions,
} from '../utils/characterSubscriptions';

const LOCKED_BADGE_LABEL = '\u{1F512} Locked';

const showToast = (icon, title) =>
  Swal.fire({
    toast: true,
    icon,
    title,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#f8fafc',
  });

const toast = {
  success: (message) => showToast('success', message),
  error: (message) => showToast('error', message),
  info: (message) => showToast('info', message),
};

const CharacterGallery = () => {
  const { user, fetchProfile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [subscriptionLoadError, setSubscriptionLoadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSubscriptions = useCallback(async (userId) => {
    if (!userId) {
      return { ok: true, characterIds: [] };
    }

    return fetchActiveCharacterSubscriptions({ userId });
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadUserSubscriptions = async () => {
      setIsInitialLoading(true);
      setSubscriptionLoadError('');

      try {
        const result = await fetchSubscriptions(user?.id);
        if (!isActive) return;

        if (result?.ok) {
          setUserSubscriptions(result.characterIds || []);
          return;
        }

        setUserSubscriptions([]);
        setSubscriptionLoadError(result?.message || 'Failed to load subscriptions.');
      } catch (error) {
        if (!isActive) return;
        setUserSubscriptions([]);
        setSubscriptionLoadError(error?.message || 'Failed to load subscriptions.');
      } finally {
        if (isActive) {
          setIsInitialLoading(false);
        }
      }
    };

    void loadUserSubscriptions();
    return () => {
      isActive = false;
    };
  }, [fetchSubscriptions, user?.id]);

  const activeSubscriptionSet = useMemo(
    () => new Set(userSubscriptions.map((id) => String(id || '').trim().toLowerCase())),
    [userSubscriptions]
  );

  const hasGlobalUnlock = useMemo(
    () => CHARACTER_SUBSCRIPTION_CHARACTER_IDS.every((characterId) => activeSubscriptionSet.has(characterId)),
    [activeSubscriptionSet]
  );

  const isCharacterUnlocked = useCallback(
    (characterKey) => activeSubscriptionSet.has(String(characterKey || '').trim().toLowerCase()),
    [activeSubscriptionSet]
  );

  const handleGlobalUnlock = async () => {
    if (isProcessing) return; // Prevent spam clicks

    try {
      setIsProcessing(true);
      console.log('1. Starting 1400 Gem Global Unlock...');

      // 1. Authenticate User
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Authentication failed.');

      // 2. Check Gem Balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);
      if (!profile || profile.gems < 1400) {
        toast.error('Not enough gems! \u{1F48E} Need 1400.');
        return; // Exits to finally block
      }

      // 3. Deduct Gems
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ gems: profile.gems - 1400 })
        .eq('id', authUser.id);

      if (deductError) throw new Error(`Gem deduction failed: ${deductError.message}`);
      console.log('2. 1400 Gems deducted successfully.');

      // 4. UPSERT 6 Characters (Handles existing cards automatically)
      const characters = ['aiko', 'niko', 'kinu', 'mimi', 'miko', 'chiko'];
      const expiresAt = new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString();

      const payload = characters.map((char) => ({
        user_id: authUser.id,
        character_id: char,
        status: 'active',
        expires_at: expiresAt,
      }));

      // CRITICAL: onConflict prevents the crash if user already owns a character
      const { error: subError } = await supabase
        .from('character_subscriptions')
        .upsert(payload, { onConflict: 'user_id, character_id' });

      if (subError) throw new Error(`Subscription save failed: ${subError.message}`);
      console.log('3. Subscriptions updated in DB.');

      // 5. Success UI Update
      toast.success('All 6 Characters Unlocked for 56 Days! \u{1F389}');

      // Refresh local unlock state so cards appear unlocked immediately.
      const refreshedSubscriptions = await fetchSubscriptions(authUser.id);
      if (refreshedSubscriptions?.ok) {
        setUserSubscriptions(refreshedSubscriptions.characterIds || []);
        setSubscriptionLoadError('');
      } else {
        setUserSubscriptions((current) => Array.from(new Set([...current, ...characters])));
      }

      void Promise.resolve(fetchProfile?.(authUser.id)).catch((syncError) => {
        console.warn('[CharacterGallery] Profile refresh failed after unlock:', syncError);
      });
    } catch (error) {
      console.error('\u274C GLOBAL UNLOCK ERROR:', error);
      toast.error(error?.message || 'Something went wrong.');
    } finally {
      setIsProcessing(false); // ALWAYS RESET BUTTON STATE
      console.log('4. isProcessing reset to false.');
    }
  };

  useEffect(() => {
    if (!user?.id || isProcessing) return;

    let isActive = true;
    const syncSubscriptions = async () => {
      const result = await fetchSubscriptions(user.id);
      if (!isActive || !result?.ok) return;
      setUserSubscriptions(result.characterIds || []);
    };

    void syncSubscriptions();
    return () => {
      isActive = false;
    };
  }, [fetchSubscriptions, isProcessing, user?.id]);

  const handleCardClick = useCallback(
    (event, character) => {
      if (isInitialLoading || isProcessing) {
        event.preventDefault();
        return;
      }

      if (isCharacterUnlocked(character?.key)) return;
      event.preventDefault();

      if (!user?.id) {
        toast.info('Please log in to unlock all characters.');
        openAuthModal('login');
        return;
      }

      if (!hasGlobalUnlock) {
        toast.info(`Unlock All Characters for ${CHARACTER_SUBSCRIPTION_COST_GEMS} Gems to open every card.`);
      }
    },
    [hasGlobalUnlock, isCharacterUnlocked, isInitialLoading, isProcessing, openAuthModal, user?.id]
  );

  return (
    <section className="w-full mb-16">
      {isInitialLoading ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-slate-200/80 bg-white/70 p-6">
          <div className="h-12 w-12 rounded-full border-4 border-slate-300 border-t-indigo-500" />
          <p className="text-sm font-bold text-slate-600">Loading character access...</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Learning Zone Character Cards</h2>
            <p className="text-base font-semibold text-slate-700">
              {user?.id
                ? (hasGlobalUnlock
                    ? 'All 6 characters are unlocked. Tap any card to enter.'
                    : `Unlock all 6 characters together for ${CHARACTER_SUBSCRIPTION_DAYS} days.`)
                : 'Log in to unlock all 6 characters with one purchase.'}
            </p>
            {user?.id && subscriptionLoadError && (
              <p className="mt-2 text-xs font-bold text-red-600">{subscriptionLoadError}</p>
            )}
          </div>

          {user?.id && !hasGlobalUnlock && (
            <div className="mb-8 rounded-2xl border border-amber-300/80 bg-amber-50 p-5 text-center shadow-sm">
              <p className="text-sm font-black text-amber-900">
                One purchase unlocks AIKO, NIKO, KINU, MIMI, MIKO, and CHIKO instantly.
              </p>
              <p className="mt-1 text-xs font-semibold text-amber-800">
                Access lasts for {CHARACTER_SUBSCRIPTION_DAYS} days.
              </p>
              <button
                type="button"
                onClick={handleGlobalUnlock}
                disabled={isProcessing}
                className="mt-4 rounded-full border border-amber-700 bg-amber-500 px-5 py-2.5 text-sm font-black text-slate-900 shadow-sm hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing
                  ? 'Unlocking All Characters...'
                  : `Unlock All Characters for ${CHARACTER_SUBSCRIPTION_COST_GEMS} Gems`}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CHARACTER_PROFILES.map((char) => {
              const unlocked = isCharacterUnlocked(char.key);

              return (
                <div key={char.key}>
                  <Link
                    to={char.route}
                    onClick={(event) => handleCardClick(event, char)}
                    className="group relative block overflow-hidden rounded-[35px] p-6"
                    style={{
                      background: char.card.color,
                      border: `1px solid ${char.card.shadowLight}`,
                      boxShadow: `16px 16px 32px ${char.card.shadowDark}, -16px -16px 32px ${char.card.shadowLight}, inset 4px 4px 8px ${char.card.innerLight}, inset -4px -4px 8px ${char.card.innerDark}`,
                    }}
                  >
                    <div className="absolute right-3 top-3 z-20">
                      {unlocked ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/95 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-emerald-700">
                          Unlocked {'\u{1F513}'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50/95 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-amber-700">
                          {LOCKED_BADGE_LABEL}
                        </span>
                      )}
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 20% 12%, rgba(255,255,255,0.25), transparent 36%), radial-gradient(circle at 85% 85%, rgba(0,0,0,0.16), transparent 45%)',
                      }}
                    />

                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className="grid h-14 w-14 place-items-center rounded-full text-2xl"
                        style={{
                          background: char.card.pillBg,
                          border: `1px solid ${char.card.innerLight}`,
                          boxShadow: `inset 2px 2px 6px ${char.card.innerLight}, inset -3px -4px 8px ${char.card.innerDark}`,
                        }}
                      >
                        <span>{char.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className={`truncate text-lg font-black tracking-wide ${char.card.textClass}`}>
                          {char.cardTitle}
                        </h3>
                        <p className={`text-sm font-bold ${char.card.textClass}`}>{char.specialHobby}</p>
                      </div>
                    </div>

                    <div
                      className={`relative z-10 mt-4 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${char.card.pillTextClass}`}
                      style={{
                        background: char.card.pillBg,
                        border: `1px solid ${char.card.innerLight}`,
                        boxShadow: `inset 2px 2px 6px ${char.card.innerLight}, inset -2px -2px 6px ${char.card.innerDark}`,
                      }}
                    >
                      {char.colorTheme}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

export default CharacterGallery;
