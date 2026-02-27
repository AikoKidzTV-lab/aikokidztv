import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';
import {
  LEARNING_ZONE_ENTRY_FEE_GEMS,
  LEARNING_ZONE_PREMIUM_UNLOCKS,
  LEARNING_ZONE_UNLOCK_STORAGE_PREFIX,
} from '../constants/gemEconomy';
import { spendUserGems } from '../utils/gemWallet';

const learningBoxes = [
  {
    id: 'alphabets',
    title: 'A to Z Letters',
    icon: '🔤',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    desc: 'Learn your ABCs fun way!',
    tier: 'core',
  },
  {
    id: 'numbers',
    title: '1 to 100 Numbers',
    icon: '🔢',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    desc: 'Count all the way to 100!',
    tier: 'core',
  },
  {
    id: 'colors',
    title: 'Colors & Shapes',
    icon: '🎨',
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    desc: 'Mix colors & learn shapes!',
    tier: 'premium',
    unlockCost: LEARNING_ZONE_PREMIUM_UNLOCKS.colors,
  },
  {
    id: 'animals',
    title: 'Animal Safari',
    icon: '🦓',
    bg: 'bg-green-100',
    text: 'text-green-800',
    desc: 'Meet animals & hear sounds!',
    tier: 'premium',
    unlockCost: LEARNING_ZONE_PREMIUM_UNLOCKS.animals,
  },
];

const defaultUnlockState = {
  zoneUnlocked: false,
  premiumUnlocked: {
    colors: false,
    animals: false,
  },
};

export default function LearningZone({ onSelect }) {
  const { user, profile, fetchProfile } = useAuth();
  const { isKidsModeOn } = useKidsMode();
  const [unlockState, setUnlockState] = React.useState(defaultUnlockState);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [processingAction, setProcessingAction] = React.useState('');

  const unlockStorageKey = React.useMemo(
    () => `${LEARNING_ZONE_UNLOCK_STORAGE_PREFIX}${user?.id || 'guest'}`,
    [user?.id]
  );

  const showStatus = React.useCallback((message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2600);
  }, []);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(unlockStorageKey);
      if (!raw) {
        setUnlockState(defaultUnlockState);
        return;
      }
      const parsed = JSON.parse(raw);
      setUnlockState({
        zoneUnlocked: Boolean(parsed?.zoneUnlocked),
        premiumUnlocked: {
          colors: Boolean(parsed?.premiumUnlocked?.colors),
          animals: Boolean(parsed?.premiumUnlocked?.animals),
        },
      });
    } catch {
      setUnlockState(defaultUnlockState);
    }
  }, [unlockStorageKey]);

  React.useEffect(() => {
    window.localStorage.setItem(unlockStorageKey, JSON.stringify(unlockState));
  }, [unlockState, unlockStorageKey]);

  const canAccessCard = React.useCallback(
    (box) => {
      if (!unlockState.zoneUnlocked) return false;
      if (box.tier === 'core') return true;
      return Boolean(unlockState.premiumUnlocked[box.id]);
    },
    [unlockState]
  );

  const visibleCards = React.useMemo(() => {
    if (!isKidsModeOn) return learningBoxes;
    return learningBoxes.filter((box) => canAccessCard(box));
  }, [isKidsModeOn, canAccessCard]);

  const speakCard = (box) => {
    const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!hasSpeech) return 0;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(box.title);
    utterance.pitch = 1.2;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return 800;
  };

  const handleLaunchCard = (box) => {
    if (!canAccessCard(box)) return;
    const delay = speakCard(box);
    if (onSelect) {
      window.setTimeout(() => onSelect(box.id), delay);
    }
  };

  const requireAuth = () => {
    if (user?.id) return true;
    showStatus('Please log in to unlock paid zones.');
    return false;
  };

  const handleUnlockZone = async () => {
    if (unlockState.zoneUnlocked || processingAction) return;
    if (!requireAuth()) return;

    setProcessingAction('zone');
    try {
      const spendResult = await spendUserGems({
        userId: user.id,
        amount: LEARNING_ZONE_ENTRY_FEE_GEMS,
      });
      if (!spendResult.ok) {
        showStatus(spendResult.message || 'Unable to unlock zone.');
        return;
      }

      setUnlockState((prev) => ({ ...prev, zoneUnlocked: true }));
      await fetchProfile?.(user.id);
      showStatus(`Zone unlocked for ${LEARNING_ZONE_ENTRY_FEE_GEMS} 💎`);
    } catch (error) {
      console.error('[LearningZone] Zone unlock failed:', error);
      showStatus('Unlock failed. Please try again.');
    } finally {
      setProcessingAction('');
    }
  };

  const handleUnlockPremiumCard = async (box) => {
    if (processingAction || !unlockState.zoneUnlocked) return;
    if (unlockState.premiumUnlocked[box.id]) return;
    if (!requireAuth()) return;

    setProcessingAction(box.id);
    try {
      const spendResult = await spendUserGems({
        userId: user.id,
        amount: box.unlockCost,
      });
      if (!spendResult.ok) {
        showStatus(spendResult.message || 'Unable to unlock premium card.');
        return;
      }

      setUnlockState((prev) => ({
        ...prev,
        premiumUnlocked: {
          ...prev.premiumUnlocked,
          [box.id]: true,
        },
      }));
      await fetchProfile?.(user.id);
      showStatus(`${box.title} unlocked permanently for ${box.unlockCost} 💎`);
    } catch (error) {
      console.error('[LearningZone] Premium unlock failed:', error);
      showStatus('Unlock failed. Please try again.');
    } finally {
      setProcessingAction('');
    }
  };

  return (
    <section id="learning-zone" className="max-w-7xl mx-auto p-6 mt-8 font-sans">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-900 mb-4 tracking-tight">
          Welcome to the Learning Zone! 🚀
        </h1>
        <p className="text-gray-500 font-medium text-lg max-w-3xl mx-auto">
          Unlock the zone once, then open premium cards permanently with Gems.
          <span className="font-bold text-indigo-700"> Kids Mode hides every locked item.</span>
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">Zone Entry Gate</p>
            <p className="mt-1 text-base font-bold text-indigo-900">
              One-time unlock fee: {LEARNING_ZONE_ENTRY_FEE_GEMS} 💎
            </p>
            <p className="mt-1 text-sm text-indigo-800">
              Balance: <span className="font-black">{Number(profile?.gems || 0)} 💎</span>
            </p>
          </div>
          <button
            type="button"
            disabled={unlockState.zoneUnlocked || processingAction === 'zone'}
            onClick={handleUnlockZone}
            className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
              unlockState.zoneUnlocked
                ? 'cursor-default bg-emerald-100 text-emerald-800'
                : 'bg-indigo-700 text-white hover:bg-indigo-800'
            }`}
          >
            {unlockState.zoneUnlocked
              ? '✅ Zone Unlocked'
              : processingAction === 'zone'
                ? 'Unlocking...'
                : `Unlock Zone for ${LEARNING_ZONE_ENTRY_FEE_GEMS} 💎`}
          </button>
        </div>
      </div>

      {isKidsModeOn && visibleCards.length === 0 && (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Kids Mode is ON. Locked items are hidden until a parent unlocks them.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {visibleCards.map((box) => {
          const isAccessible = canAccessCard(box);
          const needsZoneEntry = !unlockState.zoneUnlocked;
          const premiumLocked = unlockState.zoneUnlocked && box.tier === 'premium' && !unlockState.premiumUnlocked[box.id];

          return (
            <div
              key={box.id}
              className={`relative rounded-3xl border-4 border-white p-8 shadow-md transition-all duration-300 ${
                isAccessible ? 'hover:-translate-y-2 hover:shadow-2xl' : 'opacity-95'
              } ${box.bg}`}
            >
              {!isAccessible && (
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700">
                  🔒 Locked
                </div>
              )}

              <div className="text-7xl mb-6 text-center drop-shadow-md">{box.icon}</div>
              <h2 className={`text-2xl font-extrabold text-center mb-2 ${box.text}`}>{box.title}</h2>
              <p className={`text-center font-bold opacity-80 ${box.text} text-sm`}>{box.desc}</p>

              <div className="mt-6">
                {isAccessible ? (
                  <button
                    type="button"
                    onClick={() => handleLaunchCard(box)}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 shadow hover:bg-slate-50"
                  >
                    Play Now
                  </button>
                ) : needsZoneEntry ? (
                  <button
                    type="button"
                    onClick={handleUnlockZone}
                    disabled={processingAction === 'zone'}
                    className="w-full rounded-2xl bg-indigo-700 px-4 py-3 text-sm font-black text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processingAction === 'zone'
                      ? 'Unlocking...'
                      : `Unlock for ${LEARNING_ZONE_ENTRY_FEE_GEMS} 💎`}
                  </button>
                ) : premiumLocked ? (
                  <button
                    type="button"
                    onClick={() => handleUnlockPremiumCard(box)}
                    disabled={processingAction === box.id}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processingAction === box.id ? 'Unlocking...' : `Unlock for ${box.unlockCost} 💎`}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {statusMessage && (
        <div className="fixed bottom-6 right-4 z-50 rounded-2xl border border-indigo-300 bg-indigo-100 px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg">
          {statusMessage}
        </div>
      )}
    </section>
  );
}
