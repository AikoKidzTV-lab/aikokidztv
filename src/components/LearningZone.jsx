import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';

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
    tier: 'core',
  },
  {
    id: 'animals',
    title: 'Animal Safari',
    icon: '🦓',
    bg: 'bg-green-100',
    text: 'text-green-800',
    desc: 'Meet animals & hear sounds!',
    tier: 'core',
  },
];

export default function LearningZone({ onSelect }) {
  const { user, profile } = useAuth();
  const { isKidsModeOn } = useKidsMode();
  const [statusMessage, setStatusMessage] = React.useState('');
  const [processingAction, setProcessingAction] = React.useState('');
  const statusTimeoutRef = React.useRef(null);

  const unlockedZones = React.useMemo(() => {
    const zones = Array.isArray(profile?.unlocked_zones) ? profile.unlocked_zones : [];
    const features = Array.isArray(profile?.unlocked_features) ? profile.unlocked_features : [];
    return [...new Set([...zones, ...features].map((value) => String(value || '').trim()).filter(Boolean))];
  }, [profile?.unlocked_features, profile?.unlocked_zones]);

  React.useEffect(() => () => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
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
      return unlockedZones.includes(box.id);
    },
    [unlockedZones]
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
    if (unlockedZones.includes(box.id)) return;
    if (!user?.id) {
      showStatus('Please log in to unlock paid zones.');
      return;
    }

    setProcessingAction(box.id);
    try {
      const unlockResult = await unlockZoneWithGems({
        userId: user.id,
        zoneId: box.id,
        costGems: box.unlockCost,
      });

      if (!unlockResult.ok) {
        showStatus(getUnlockStatusMessage(unlockResult));
        return;
      }

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
          A to Z Letters and 1 to 100 Numbers are always free.
          <span className="font-bold text-indigo-700"> Premium modules unlock once and stay unlocked forever.</span>
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-bold text-indigo-900">
            Current Gems: <span className="font-black">{Number(profile?.gems || 0)} 💎</span>
          </p>
          <p className="text-sm font-semibold text-indigo-700">
            Premium unlocks: Colors & Shapes ({LEARNING_ZONE_PREMIUM_UNLOCKS.colors} 💎), Animal Safari ({LEARNING_ZONE_PREMIUM_UNLOCKS.animals} 💎)
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
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnlockPremiumCard(box)}
                    disabled={processingAction === box.id}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processingAction === box.id
                      ? 'Unlocking...'
                      : `Unlock for ${box.unlockCost} 💎`}
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
