import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { CHARACTER_PROFILES } from '../constants/characters';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { supabase } from '../supabaseClient';
import {
  CHARACTER_SUBSCRIPTION_COST_GEMS,
  CHARACTER_SUBSCRIPTION_DAYS,
  fetchActiveCharacterSubscriptions,
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [subscriptionLoadError, setSubscriptionLoadError] = useState('');
  const [isProcessingUnlock, setIsProcessingUnlock] = useState(false);
  const [processingCharacterKey, setProcessingCharacterKey] = useState('');
  const unlockInFlightRef = useRef(false);

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
  }, [user?.id]);

  const activeSubscriptionSet = useMemo(
    () => new Set(userSubscriptions.map((id) => String(id || '').trim().toLowerCase())),
    [userSubscriptions]
  );

  const isCharacterUnlocked = useCallback(
    (characterKey) => activeSubscriptionSet.has(String(characterKey || '').trim().toLowerCase()),
    [activeSubscriptionSet]
  );

  const unlockCharacterAndNavigate = useCallback(
    async (character) => {
      if (isProcessingUnlock || unlockInFlightRef.current) return;

      const normalizedCharacterKey = String(character?.key || '').trim().toLowerCase();
      if (!normalizedCharacterKey || !character?.route) return;

      if (!user?.id) {
        showToast('info', 'Please log in to unlock characters.');
        openAuthModal('login');
        return;
      }

      unlockInFlightRef.current = true;
      setIsProcessingUnlock(true);
      setProcessingCharacterKey(normalizedCharacterKey);

      try {
        const { data: dbProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, gems')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const currentGems = Number(dbProfile?.gems || 0);
        if (!Number.isFinite(currentGems) || currentGems < CHARACTER_SUBSCRIPTION_COST_GEMS) {
          throw new Error('Not enough gems! Keep learning to earn more. \u{1F48E}');
        }

        const nextGems = Math.max(0, Math.floor(currentGems) - CHARACTER_SUBSCRIPTION_COST_GEMS);
        const { data: deductRow, error: deductError } = await supabase
          .from('profiles')
          .update({ gems: nextGems })
          .eq('id', user.id)
          .select('id, gems')
          .maybeSingle();

        if (deductError) {
          throw deductError;
        }
        if (!deductRow?.id) {
          throw new Error('Failed to deduct gems. Please try again.');
        }

        const { error: subscriptionError } = await supabase
          .from('character_subscriptions')
          .upsert(
            {
              user_id: user.id,
              character_id: normalizedCharacterKey,
              status: 'active',
              expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            { onConflict: 'user_id,character_id' }
          );

        if (subscriptionError) {
          await supabase
            .from('profiles')
            .update({ gems: currentGems })
            .eq('id', user.id);
          throw subscriptionError;
        }

        setUserSubscriptions((current) => {
          if (current.some((id) => String(id || '').trim().toLowerCase() === normalizedCharacterKey)) {
            return current;
          }
          return [...current, normalizedCharacterKey];
        });

        showToast('success', `${character.name} unlocked for ${CHARACTER_SUBSCRIPTION_DAYS} days! \u{1F389}`);
        navigate(character.route);
      } catch (error) {
        console.error('[CharacterGallery] Unlock failed:', error);
        showToast('error', error?.message || 'Failed to unlock this character.');
      } finally {
        setIsProcessingUnlock(false);
        setProcessingCharacterKey('');
        unlockInFlightRef.current = false;
      }
    },
    [isProcessingUnlock, navigate, openAuthModal, user?.id]
  );

  const handleCardClick = useCallback(
    (event, character) => {
      if (isInitialLoading) {
        event.preventDefault();
        return;
      }

      if (isProcessingUnlock) {
        event.preventDefault();
        return;
      }

      if (isCharacterUnlocked(character?.key)) return;
      event.preventDefault();
      void unlockCharacterAndNavigate(character);
    },
    [isCharacterUnlocked, isInitialLoading, isProcessingUnlock, unlockCharacterAndNavigate]
  );

  return (
    <section className="w-full mb-16">
      {isInitialLoading ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-slate-200/80 bg-white/70 p-6">
          <div className="h-12 w-12 rounded-full border-4 border-slate-300 border-t-indigo-500" />
          <p className="text-sm font-bold text-slate-600">
            Loading character access...
          </p>
        </div>
      ) : (
        <>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Learning Zone Character Cards
            </h2>
            <p className="text-base font-semibold text-slate-700">
              {user?.id
                ? 'Tap any card to open it. Locked cards unlock instantly in one click.'
                : `Tap a card to unlock for ${CHARACTER_SUBSCRIPTION_COST_GEMS} Gems.`}
            </p>
            {user?.id && subscriptionLoadError && (
              <p className="mt-2 text-xs font-bold text-red-600">{subscriptionLoadError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CHARACTER_PROFILES.map((char) => {
              const unlocked = isCharacterUnlocked(char.key);
              const normalizedCharacterKey = String(char.key || '').trim().toLowerCase();
              const isCardProcessing =
                isProcessingUnlock && processingCharacterKey === normalizedCharacterKey;

              return (
                <div
                  key={char.key}
                >
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
                      ) : isCardProcessing ? (
                        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50/95 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-sky-700">
                          {'\u23F3'} Unlocking...
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
