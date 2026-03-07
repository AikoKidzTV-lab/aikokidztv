import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { CHARACTER_PROFILES } from '../constants/characters';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import {
  CHARACTER_SUBSCRIPTION_COST_GEMS,
  fetchActiveCharacterSubscriptions,
  purchaseCharacterSubscription,
} from '../utils/characterSubscriptions';

const LOCKED_BADGE_LABEL = `\u{1F512} ${CHARACTER_SUBSCRIPTION_COST_GEMS} Gems`;

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

const CharacterGallery = () => {
  const { user, fetchProfile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [activeSubscriptionIds, setActiveSubscriptionIds] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [subscriptionLoadError, setSubscriptionLoadError] = useState('');
  const [selectedLockedCharacter, setSelectedLockedCharacter] = useState(null);
  const [purchasingCharacterKey, setPurchasingCharacterKey] = useState('');
  const [recentlyUnlockedCharacterKey, setRecentlyUnlockedCharacterKey] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadActiveSubscriptions = async () => {
      if (!user?.id) {
        if (isMounted) {
          setActiveSubscriptionIds([]);
          setIsLoadingSubscriptions(false);
          setSubscriptionLoadError('');
        }
        return;
      }

      setIsLoadingSubscriptions(true);
      setSubscriptionLoadError('');

      try {
        const result = await fetchActiveCharacterSubscriptions({ userId: user.id });
        if (!isMounted) return;

        if (result?.ok) {
          setActiveSubscriptionIds(result.characterIds || []);
          return;
        }

        setActiveSubscriptionIds([]);
        setSubscriptionLoadError(result?.message || 'Failed to load subscriptions.');
      } catch (error) {
        if (!isMounted) return;
        setActiveSubscriptionIds([]);
        setSubscriptionLoadError(error?.message || 'Failed to load subscriptions.');
      } finally {
        if (isMounted) {
          setIsLoadingSubscriptions(false);
        }
      }
    };

    void loadActiveSubscriptions();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const activeSubscriptionSet = useMemo(
    () => new Set(activeSubscriptionIds.map((id) => String(id || '').trim().toLowerCase())),
    [activeSubscriptionIds]
  );

  const isCharacterUnlocked = useCallback(
    (characterKey) => activeSubscriptionSet.has(String(characterKey || '').trim().toLowerCase()),
    [activeSubscriptionSet]
  );

  const handleCardClick = useCallback(
    (event, character) => {
      if (user?.id && isLoadingSubscriptions) {
        event.preventDefault();
        showToast('info', 'Checking your unlocks. Please wait a moment.');
        return;
      }

      if (isCharacterUnlocked(character?.key)) return;
      event.preventDefault();
      setSelectedLockedCharacter(character);
    },
    [isCharacterUnlocked, isLoadingSubscriptions, user?.id]
  );

  const closeUnlockModal = useCallback(() => {
    if (purchasingCharacterKey) return;
    setSelectedLockedCharacter(null);
  }, [purchasingCharacterKey]);

  const handleUnlockCharacter = useCallback(async () => {
    const targetCharacter = selectedLockedCharacter;
    if (!targetCharacter?.key) return;

    if (!user?.id) {
      showToast('info', 'Please log in to unlock characters.');
      openAuthModal('login');
      return;
    }

    setPurchasingCharacterKey(targetCharacter.key);
    try {
      const result = await purchaseCharacterSubscription({
        userId: user.id,
        characterId: targetCharacter.key,
      });

      if (!result?.ok) {
        showToast('error', result?.message || 'Failed to unlock this character.');
        return;
      }

      setActiveSubscriptionIds((current) =>
        Array.from(new Set([...current, String(targetCharacter.key || '').toLowerCase()]))
      );
      setRecentlyUnlockedCharacterKey(targetCharacter.key);
      setSelectedLockedCharacter(null);
      showToast('success', `${targetCharacter.name} unlocked for 7 days! \u{1F389}`);
      await fetchProfile?.(user.id);

      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          setRecentlyUnlockedCharacterKey((current) =>
            current === targetCharacter.key ? '' : current
          );
        }, 1800);
      }
    } catch (error) {
      showToast('error', error?.message || 'Failed to unlock this character.');
    } finally {
      setPurchasingCharacterKey('');
    }
  }, [fetchProfile, openAuthModal, selectedLockedCharacter, user?.id]);

  const isPurchasingSelectedCharacter = Boolean(
    selectedLockedCharacter?.key && purchasingCharacterKey === selectedLockedCharacter.key
  );

  return (
    <section className="w-full mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          Learning Zone Character Cards
        </h2>
        <p className="text-base font-semibold text-slate-700">
          {user?.id
            ? 'Tap a card to open its dedicated page.'
            : `Tap a card to unlock for ${CHARACTER_SUBSCRIPTION_COST_GEMS} Gems.`}
        </p>
        {user?.id && isLoadingSubscriptions && (
          <p className="mt-2 text-xs font-bold text-slate-500">Checking active unlocks...</p>
        )}
        {user?.id && subscriptionLoadError && (
          <p className="mt-2 text-xs font-bold text-red-600">{subscriptionLoadError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHARACTER_PROFILES.map((char, index) => {
          const unlocked = isCharacterUnlocked(char.key);
          const isRecentlyUnlocked = recentlyUnlockedCharacterKey === char.key;

          return (
            <motion.div
              key={char.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <Link
                to={char.route}
                onClick={(event) => handleCardClick(event, char)}
                className={`group relative block overflow-hidden rounded-[35px] p-6 transition duration-300 hover:-translate-y-1 ${
                  isRecentlyUnlocked ? 'ring-4 ring-emerald-300/90 animate-pulse' : ''
                }`}
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
                    <p className={`text-sm font-bold ${char.card.textClass}`}>
                      {char.specialHobby}
                    </p>
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
            </motion.div>
          );
        })}
      </div>

      {selectedLockedCharacter && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-yellow-200 bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-white shadow-[0_26px_80px_rgba(2,6,23,0.58)]">
            <h3 className="text-2xl font-black text-yellow-300">
              Unlock {selectedLockedCharacter.name}! {'\u2728'}
            </h3>
            <p className="mt-3 text-sm font-semibold text-slate-200">
              Get full access to {selectedLockedCharacter.name}&apos;s zone for 7 days.
            </p>

            {!user?.id && (
              <p className="mt-2 text-xs font-bold text-amber-300">
                Log in first to buy this unlock with Gems.
              </p>
            )}

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={handleUnlockCharacter}
                disabled={isPurchasingSelectedCharacter}
                className="w-full rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 px-4 py-3 text-sm font-black text-slate-900 shadow-[0_0_24px_rgba(250,204,21,0.45)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPurchasingSelectedCharacter
                  ? 'Unlocking...'
                  : `Unlock for ${CHARACTER_SUBSCRIPTION_COST_GEMS} Gems \u{1F48E}`}
              </button>

              {!user?.id && (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="w-full rounded-2xl border border-indigo-200 bg-indigo-500/20 px-4 py-3 text-sm font-black text-indigo-100 transition hover:bg-indigo-500/30"
                >
                  Log In to Continue
                </button>
              )}

              <button
                type="button"
                onClick={closeUnlockModal}
                disabled={isPurchasingSelectedCharacter}
                className="w-full rounded-2xl border border-slate-500 bg-slate-700/70 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-600/80 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CharacterGallery;
