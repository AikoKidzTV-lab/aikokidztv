import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';
import { LEARNING_ZONE_PREMIUM_UNLOCKS } from '../constants/gemEconomy';
import { unlockZoneWithGems } from '../utils/profileEconomy';

const GUEST_PREMIUM_UNLOCKS = {
  colors: LEARNING_ZONE_PREMIUM_UNLOCKS.colors,
  animals: LEARNING_ZONE_PREMIUM_UNLOCKS.animals,
};

const GUEST_GEMS_STORAGE_KEY = 'aiko_guest_gems_v1';
const GUEST_UNLOCKED_ZONES_STORAGE_KEY = 'aiko_guest_learning_unlocks_v1';

const readGuestGems = () => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(GUEST_GEMS_STORAGE_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
};

const writeGuestGems = (value) => {
  if (typeof window === 'undefined') return;
  const safeValue = Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  window.localStorage.setItem(GUEST_GEMS_STORAGE_KEY, String(safeValue));
};

const readGuestUnlockedZones = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_UNLOCKED_ZONES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((value) => String(value || '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const writeGuestUnlockedZones = (zones) => {
  if (typeof window === 'undefined') return;
  const safeZones = Array.isArray(zones)
    ? [...new Set(zones.map((value) => String(value || '').trim()).filter(Boolean))]
    : [];
  window.localStorage.setItem(GUEST_UNLOCKED_ZONES_STORAGE_KEY, JSON.stringify(safeZones));
};

const getUnlockStatusMessage = (result) => {
  if (!result) return 'Unlock failed. Please try again.';
  if (result.message) return String(result.message);

  switch (result.code) {
    case 'auth_required':
      return 'Please log in to unlock this zone.';
    case 'insufficient_gems':
      return 'Not enough Gems. Please recharge and try again.';
    default:
      return 'Unlock failed. Please try again.';
  }
};

const learningBoxes = [
  {
    id: 'alphabets',
    title: 'A to Z Letters',
    icon: '\u{1F524}',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    desc: 'Learn your ABCs fun way!',
    tier: 'core',
  },
  {
    id: 'numbers',
    title: '1 to 100 Numbers',
    icon: '\u{1F522}',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    desc: 'Count all the way to 100!',
    tier: 'core',
  },
  {
    id: 'colors',
    title: 'Colors & Shapes',
    icon: '\u{1F3A8}',
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    desc: 'Mix colors & learn shapes!',
    tier: 'premium',
    unlockCost: LEARNING_ZONE_PREMIUM_UNLOCKS.colors,
    guestUnlockCost: GUEST_PREMIUM_UNLOCKS.colors,
  },
  {
    id: 'animals',
    title: 'Animal Safari',
    icon: '\u{1F993}',
    bg: 'bg-green-100',
    text: 'text-green-800',
    desc: 'Meet animals & hear sounds!',
    tier: 'premium',
    unlockCost: LEARNING_ZONE_PREMIUM_UNLOCKS.animals,
    guestUnlockCost: GUEST_PREMIUM_UNLOCKS.animals,
  },
];

export default function LearningZone({ onSelect }) {
  const { user, profile, fetchProfile } = useAuth();
  const { isKidsModeOn } = useKidsMode();
  const [statusMessage, setStatusMessage] = React.useState('');
  const [processingAction, setProcessingAction] = React.useState('');
  const [guestGems, setGuestGems] = React.useState(() => readGuestGems());
  const [guestUnlockedZones, setGuestUnlockedZones] = React.useState(() => readGuestUnlockedZones());
  const statusTimeoutRef = React.useRef(null);

  const unlockedZones = React.useMemo(() => {
    const zones = Array.isArray(profile?.unlocked_zones) ? profile.unlocked_zones : [];
    const features = Array.isArray(profile?.unlocked_features) ? profile.unlocked_features : [];
    return [...new Set([...zones, ...features].map((value) => String(value || '').trim()).filter(Boolean))];
  }, [profile?.unlocked_features, profile?.unlocked_zones]);

  const premiumUnlocks = user?.id ? LEARNING_ZONE_PREMIUM_UNLOCKS : GUEST_PREMIUM_UNLOCKS;
  const currentDisplayedGems = user?.id ? Number(profile?.gems || 0) : guestGems;

  React.useEffect(() => () => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncGuestState = () => {
      setGuestGems(readGuestGems());
      setGuestUnlockedZones(readGuestUnlockedZones());
    };

    window.addEventListener('storage', syncGuestState);
    return () => {
      window.removeEventListener('storage', syncGuestState);
    };
  }, []);

  const showStatus = React.useCallback((message) => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
    setStatusMessage(message);
    statusTimeoutRef.current = window.setTimeout(() => setStatusMessage(''), 2600);
  }, []);

  const canAccessCard = React.useCallback(
    (box) => {
      if (box.tier === 'core') return true;
      if (user?.id) return unlockedZones.includes(box.id);
      return guestUnlockedZones.includes(box.id);
    },
    [guestUnlockedZones, unlockedZones, user?.id]
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

  const handleUnlockPremiumCard = async (box) => {
    if (!box?.id || box.tier !== 'premium' || processingAction) return;
    if (canAccessCard(box)) return;

    const unlockCost = user?.id ? Number(box.unlockCost || 0) : Number(box.guestUnlockCost || 0);
    if (!Number.isFinite(unlockCost) || unlockCost <= 0) {
      showStatus('Unlock configuration is unavailable. Please try again.');
      return;
    }

    setProcessingAction(box.id);
    try {
      if (user?.id) {
        const unlockResult = await unlockZoneWithGems({
          userId: user.id,
          zoneId: box.id,
          costGems: unlockCost,
        });

        if (!unlockResult.ok) {
          showStatus(getUnlockStatusMessage(unlockResult));
          return;
        }

        await fetchProfile?.(user.id);
        showStatus(`${box.title} unlocked permanently for ${unlockCost} \u{1F48E}`);
        return;
      }

      if (guestGems < unlockCost) {
        showStatus(`Not enough Gems. ${box.title} needs ${unlockCost} \u{1F48E}.`);
        return;
      }

      const nextGuestGems = guestGems - unlockCost;
      const nextGuestUnlocks = [...new Set([...guestUnlockedZones, box.id])];
      setGuestGems(nextGuestGems);
      setGuestUnlockedZones(nextGuestUnlocks);
      writeGuestGems(nextGuestGems);
      writeGuestUnlockedZones(nextGuestUnlocks);
      showStatus(`${box.title} unlocked for ${unlockCost} \u{1F48E} (guest wallet).`);
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
          Welcome to the Learning Zone! {'\u{1F680}'}
        </h1>
        <p className="text-gray-500 font-medium text-lg max-w-3xl mx-auto">
          A to Z Letters and 1 to 100 Numbers are always free.
          <span className="font-bold text-indigo-700"> Premium modules unlock once and stay unlocked forever.</span>
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-bold text-indigo-900">
            Current Gems: <span className="font-black">{currentDisplayedGems} {'\u{1F48E}'}</span>
          </p>
          <p className="text-sm font-semibold text-indigo-700">
            Premium unlocks: Colors & Shapes ({premiumUnlocks.colors} {'\u{1F48E}'}), Animal Safari ({premiumUnlocks.animals} {'\u{1F48E}'})
          </p>
        </div>
      </div>

      {isKidsModeOn && visibleCards.length === 0 && (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Kids Mode is ON. Locked premium items are hidden until a parent unlocks them.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {visibleCards.map((box) => {
          const isAccessible = canAccessCard(box);
          const premiumLocked = box.tier === 'premium' && !isAccessible;

          return (
            <div
              key={box.id}
              className={`relative rounded-3xl border-4 border-white p-8 shadow-md transition-all duration-300 ${
                isAccessible ? 'hover:-translate-y-2 hover:shadow-2xl' : 'opacity-95'
              } ${box.bg}`}
            >
              {premiumLocked && (
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700">
                  {'\u{1F512}'} Locked
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
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnlockPremiumCard(box)}
                    disabled={processingAction === box.id}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processingAction === box.id
                      ? 'Unlocking...'
                      : `Unlock for ${user?.id ? box.unlockCost : box.guestUnlockCost} \u{1F48E}`}
                  </button>
                )}
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
