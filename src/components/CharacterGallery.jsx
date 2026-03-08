import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const toast = {
  success: (message) => showToast('success', message),
  error: (message) => showToast('error', message),
  info: (message) => showToast('info', message),
};

const CharacterGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [subscriptionLoadError, setSubscriptionLoadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCharacterKey, setProcessingCharacterKey] = useState('');

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

  const handleUnlock = async (charId) => {
    if (isProcessing) return; // Prevent double clicks

    try {
      setIsProcessing(true);
      console.log("1. Starting unlock for character:", charId);

      // Get current user strictly
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated.");
      console.log("2. User ID:", user.id);

      // Fetch fresh profile data to check gems
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error(`Profile fetch error: ${profileError.message}`);
      console.log("3. Current Gems:", profile.gems);

      if (!profile || profile.gems < 200) {
        toast.error("Not enough gems! 💎");
        return; // Exit early, finally block will run and stop loading
      }

      // Deduct 200 Gems
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ gems: profile.gems - 200 })
        .eq('id', user.id);

      if (deductError) throw new Error(`Gem deduction error: ${deductError.message}`);
      console.log("4. 200 Gems deducted successfully.");

      // Calculate Expiry (14 Days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14);

      // Upsert Subscription
      const { error: subError } = await supabase
        .from('character_subscriptions')
        .upsert({
          user_id: user.id,
          character_id: charId,
          status: 'active',
          expires_at: expiryDate.toISOString()
        }, { onConflict: 'user_id, character_id' });

      if (subError) throw new Error(`Subscription save error: ${subError.message}`);
      console.log("5. Subscription saved to DB successfully.");

      // Success! Update UI
      toast.success("Character Unlocked! 🎉");
      
      // Update local state to reflect the unlock immediately
      setUserSubscriptions(prev => [...prev, charId]);

    } catch (error) {
      console.error("❌ UNLOCK FAILED:", error);
      toast.error(error.message || "Failed to unlock. Please try again.");
    } finally {
      setIsProcessing(false); // THIS IS NON-NEGOTIABLE. ALWAYS STOP LOADING.
      console.log("6. Process finished. isProcessing set to false.");
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
      if (isInitialLoading) {
        event.preventDefault();
        return;
      }

      if (isProcessing) {
        event.preventDefault();
        return;
      }

      if (isCharacterUnlocked(character?.key)) return;
      event.preventDefault();
      const charId = String(character?.key || '').trim().toLowerCase();
      if (!charId) return;
      setProcessingCharacterKey(charId);
      void handleUnlock(charId);
    },
    [handleUnlock, isCharacterUnlocked, isInitialLoading, isProcessing]
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
                isProcessing && processingCharacterKey === normalizedCharacterKey;

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
