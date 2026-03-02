import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';
import COLOR_PALETTE from './colorPalette';
import MixAndMatchLab from './MixAndMatchLab';
import ShapesSection from './ShapesSection';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

const COLOR_UNLOCK_PREFIX = 'color:';

const parseUnlockedColorIds = (unlockedItems) => {
  if (!Array.isArray(unlockedItems)) return [];
  return unlockedItems
    .filter((value) => typeof value === 'string' && value.startsWith(COLOR_UNLOCK_PREFIX))
    .map((value) => value.slice(COLOR_UNLOCK_PREFIX.length))
    .filter(Boolean);
};

const getContrast = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substr(0, 2), 16);
  const g = parseInt(clean.substr(2, 2), 16);
  const b = parseInt(clean.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'text-slate-900' : 'text-white';
};

const ColorsModule = ({ onBack, onHome }) => {
  const { user, profile, fetchProfile } = useAuth();
  const [selectedColor, setSelectedColor] = useState(null);
  const [fills, setFills] = useState({});
  const [activeShape, setActiveShape] = useState(null);
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);
  const [unlockedColorIds, setUnlockedColorIds] = useState([]);
  const [unlockingColorId, setUnlockingColorId] = useState('');

  const speechReady = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    []
  );
  const unlockedColorSet = useMemo(() => new Set(unlockedColorIds), [unlockedColorIds]);
  const gemsBalance = Number(profile?.gems || 0);

  useEffect(() => {
    let isMounted = true;

    const loadUnlockedColors = async () => {
      if (!user?.id) {
        if (isMounted) {
          setUnlockedColorIds([]);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('unlocked_items')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!isMounted) return;
        setUnlockedColorIds(parseUnlockedColorIds(data?.unlocked_items));
      } catch (loadError) {
        console.error('[ColorsModule] Failed to load unlocked colors:', loadError);
        if (!isMounted) return;
        setUnlockedColorIds(parseUnlockedColorIds(profile?.unlocked_items));
      }
    };

    void loadUnlockedColors();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!Array.isArray(profile?.unlocked_items)) return;

    const fromProfile = parseUnlockedColorIds(profile?.unlocked_items);
    if (!fromProfile.length && !unlockedColorIds.length) return;

    const next = new Set(fromProfile);
    const current = new Set(unlockedColorIds);
    const hasChanged =
      next.size !== current.size || [...next].some((colorId) => !current.has(colorId));

    if (hasChanged) {
      setUnlockedColorIds([...next]);
    }
  }, [profile?.unlocked_items, unlockedColorIds]);

  const speak = (text) => {
    if (!speechReady) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const isColorLocked = (color) => color.unlockCost > 0 && !unlockedColorSet.has(color.id);

  const handleUnlockColor = async (color) => {
    if (!color || color.unlockCost <= 0 || unlockingColorId) return;
    if (!isColorLocked(color)) {
      setSelectedColor(color);
      return;
    }

    if (!user?.id) {
      Swal.fire({
        title: 'Login required',
        text: 'Please log in first to unlock premium colors.',
        icon: 'info',
        confirmButtonColor: '#4f46e5',
      });
      return;
    }

    setUnlockingColorId(color.id);

    try {
      const { data: latestProfile, error: profileError } = await supabase
        .from('profiles')
        .select('gems, unlocked_items')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const currentGems = Number(latestProfile?.gems || 0);
      const unlockedItems = Array.isArray(latestProfile?.unlocked_items)
        ? latestProfile.unlocked_items.filter((value) => typeof value === 'string')
        : [];
      const unlockKey = `${COLOR_UNLOCK_PREFIX}${color.id}`;

      if (unlockedItems.includes(unlockKey)) {
        setUnlockedColorIds((prev) => (prev.includes(color.id) ? prev : [...prev, color.id]));
        setSelectedColor(color);
        return;
      }

      if (currentGems < color.unlockCost) {
        Swal.fire({
          title: 'Not enough Gems',
          text: `You need ${color.unlockCost} Gems but only have ${currentGems}.`,
          icon: 'warning',
          confirmButtonColor: '#f59e0b',
        });
        return;
      }

      const nextUnlockedItems = [...unlockedItems, unlockKey];
      const nextGems = currentGems - color.unlockCost;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          gems: nextGems,
          unlocked_items: nextUnlockedItems,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setUnlockedColorIds((prev) => (prev.includes(color.id) ? prev : [...prev, color.id]));
      setSelectedColor(color);
      speak(color.name);
      confetti({ particleCount: 90, spread: 55, origin: { y: 0.65 } });

      await fetchProfile?.(user.id);

      Swal.fire({
        title: 'Unlocked!',
        text: `${color.name} unlocked permanently for ${color.unlockCost} Gems.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
      });
    } catch (unlockError) {
      console.error('[ColorsModule] Failed to unlock color:', unlockError);
      Swal.fire({
        title: 'Unlock failed',
        text: unlockError?.message || 'Could not unlock this color right now.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setUnlockingColorId('');
    }
  };

  const handlePaletteSelect = (color) => {
    if (isColorLocked(color)) return;
    setSelectedColor(color);
    speak(color.name);
  };

  const handlePaint = (id, targetHex) => {
    if (!selectedColor) return;
    const chosen = selectedColor.hex.toLowerCase();
    const target = targetHex.toLowerCase();

    setFills((prev) => ({ ...prev, [id]: selectedColor.hex }));

    if (chosen === target) {
      confetti({ particleCount: 140, spread: 70, origin: { y: 0.6 } });
      speak('Perfect!');
    } else {
      Swal.fire({
        title: 'Sweet try!',
        text: "Oops! That's a beautiful color, but not quite the right one. Don't be sad, try again little artist!",
        icon: 'info',
        confirmButtonColor: '#fb7185',
        confirmButtonText: 'Okay!',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          title: 'text-pink-500 font-black',
        },
      });
    }
  };

  const handleShapeClick = (shape) => {
    setActiveShape(shape.id);
    speak(shape.name);
    setTimeout(() => setActiveShape(null), 420);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-100 via-white to-amber-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:shadow-md transition"
          >
            â¬…ï¸ Back to Learning Zone
          </button>
          <button
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800 shadow hover:shadow-md hover:bg-sky-200 transition"
          >
            ðŸ  Back to Home
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 shadow">
            <span>Gems:</span>
            <span>{gemsBalance}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            <span className="text-lg">ðŸ”Š</span>
            {speechReady ? 'Tap a palette then paint!' : 'Speech not supported'}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
            AikoKidzTV â€¢ Learning Zone
          </p>
          <h1 className="text-4xl md:text-5xl font-black drop-shadow-sm flex items-center gap-3">
            ðŸŽ¨ Color Fill Game & Shapes
          </h1>
          <p className="text-base md:text-lg text-slate-700/90 max-w-2xl">
            Pick a paint color, tap a canvas to fill it, celebrate when you match, and keep exploring friendly shapes below.
          </p>
        </div>

        {/* Empathy & Inclusion Zone */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 border-2 border-blue-800 shadow-md">
          <h3 className="text-2xl font-extrabold text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
            ðŸŒ Empathy & Inclusion Zone
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border-2 border-gray-300">
              <div>
                <h4 className="font-bold text-lg text-black">Color Vision Toggle</h4>
                <p className="text-sm text-gray-700 font-medium">
                  For our special heroes! Turn this on to see colors that are easy for your eyes.
                </p>
              </div>
              <button
                onClick={() => setIsColorBlindMode((v) => !v)}
                className={`relative inline-flex h-10 w-20 items-center rounded-full border-4 border-black transition-colors focus:outline-none ${
                  isColorBlindMode ? 'bg-yellow-400' : 'bg-blue-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black transition-transform ${
                    isColorBlindMode ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg border-l-8 border-yellow-500">
              <h4 className="font-bold text-lg text-black flex items-center gap-2">
                ðŸ‘ï¸ Empathy Lens (For Everyone Else)
              </h4>
              <p className="text-sm text-gray-800 font-medium mt-1">
                Toggle the switch above to see how colorblind people see their world. <strong>Please understand their viewâ€”don't make any meme on them.</strong> Let's build empathy and understand that everyone's world is beautiful in its own way.
              </p>
            </div>
          </div>
        </div>

        {/* Paint Palette */}
        <div className="mb-6 rounded-2xl bg-white/70 border border-white/60 shadow-inner p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900">Paint Palette</h3>
            <span className="text-sm text-slate-600">Tap a color, then tap a canvas to paint</span>
          </div>
          <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2">
            {COLOR_PALETTE.map((color) => {
              const isActive = selectedColor?.id === color.id;
              const isLocked = isColorLocked(color);
              const displayHex = isColorBlindMode ? color.cbHex : color.hex;
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={`Select color ${color.name}`}
                  onClick={() => handlePaletteSelect(color)}
                  title={`${color.name} - Cost: ${color.unlockCost} Gems`}
                  className={`relative h-12 w-12 rounded-full shadow-md transition-transform ${
                    isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
                  } ${color.border ? 'border-2 border-gray-200' : 'border border-white/60'} ${
                    isActive ? 'ring-4 ring-amber-200 scale-105' : ''
                  }`}
                  style={{ backgroundColor: displayHex }}
                >
                  {isLocked && (
                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md text-xs">
                      ðŸ”’
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors List - mapping all colors with lock states */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold">Colors</h2>
            <span className="text-sm text-gray-500">Fill the canvas with the matching color</span>
          </div>
          <div className="space-y-4 mt-2">
            {COLOR_PALETTE.map((color) => {
              const isLocked = isColorLocked(color);
              const painted = fills[color.id] || 'transparent';
              const contrast = painted === 'transparent' ? 'text-slate-500' : getContrast(painted);
              const borderClass = color.border ? 'border-2 border-gray-200' : 'border border-gray-100';
              return (
                <div
                  key={color.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-4 ${
                    isLocked ? 'border-gray-200 opacity-80 bg-gray-50' : 'border-gray-100'
                  }`}
                >
                  <div className="w-full sm:w-auto">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {color.name}
                      {isLocked && (
                        <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded-full font-bold">
                          ðŸ”’ {color.unlockCost} Gems required
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isLocked
                        ? 'Unlock this color to reveal its canvas!'
                        : 'Tap the box to paint it the right color'}
                    </p>
                  </div>

                  {!isLocked && (
                    <button
                      type="button"
                      aria-label={`Paint ${color.name}`}
                      onClick={() => handlePaint(color.id, color.hex)}
                      className={`
                        h-20 w-32 md:w-40 rounded-xl overflow-hidden shadow-md transition-transform duration-150
                        ${borderClass}
                        ${selectedColor ? 'hover:scale-105 active:scale-95' : ''}
                      `}
                      style={{ backgroundColor: painted }}
                    >
                      <span className={`block text-center text-sm font-semibold ${contrast}`}>
                        {painted === 'transparent' ? 'Tap to paint' : color.name}
                      </span>
                    </button>
                  )}

                  {isLocked && (
                    <button
                      type="button"
                      onClick={() => handleUnlockColor(color)}
                      disabled={Boolean(unlockingColorId)}
                      className={`w-full sm:w-auto px-5 py-2 rounded-full font-bold border-2 transition ${
                        unlockingColorId === color.id
                          ? 'cursor-not-allowed border-amber-300 bg-amber-100 text-amber-700'
                          : unlockingColorId
                            ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                            : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {unlockingColorId === color.id
                        ? 'Unlocking...'
                        : `Unlock for ${color.unlockCost} Gems`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Shapes Section */}
        <section>
          <ShapesSection onShapeClick={handleShapeClick} activeId={activeShape} />
        </section>

        <MixAndMatchLab />
      </div>
    </div>
  );
};

export default ColorsModule;

