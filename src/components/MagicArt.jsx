import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as profileEconomy from '../utils/profileEconomy';
import {
  getEconomyTierLabel,
  getMagicArtRuleForTier,
  resolveEconomyTier,
} from '../utils/economyTier';

const PRESET_COLORS = [
  '#FF4136',
  '#FF851B',
  '#FFDC00',
  '#2ECC40',
  '#00B8D9',
  '#0074D9',
  '#6C5CE7',
  '#B10DC9',
  '#111111',
];

const STAMPS = [
  { id: 'cloud', icon: '\u2601\uFE0F' },
  { id: 'sun', icon: '\u2600\uFE0F' },
  { id: 'moon', icon: '\u{1F319}' },
  { id: 'rainbow', icon: '\u{1F308}' },
  { id: 'star', icon: '\u2B50' },
  { id: 'sparkles', icon: '\u2728' },
  { id: 'balloon', icon: '\u{1F388}' },
  { id: 'gift', icon: '\u{1F381}' },
  { id: 'dog', icon: '\u{1F436}' },
  { id: 'cat', icon: '\u{1F431}' },
  { id: 'tiger', icon: '\u{1F42F}' },
  { id: 'lion', icon: '\u{1F981}' },
  { id: 'rabbit', icon: '\u{1F430}' },
  { id: 'bear', icon: '\u{1F43B}' },
  { id: 'panda', icon: '\u{1F43C}' },
  { id: 'monkey', icon: '\u{1F435}' },
  { id: 'elephant', icon: '\u{1F418}' },
  { id: 'giraffe', icon: '\u{1F992}' },
  { id: 'dinosaur', icon: '\u{1F996}' },
  { id: 'butterfly', icon: '\u{1F98B}' },
  { id: 'fish', icon: '\u{1F41F}' },
  { id: 'whale', icon: '\u{1F433}' },
  { id: 'apple', icon: '\u{1F34E}' },
  { id: 'banana', icon: '\u{1F34C}' },
  { id: 'strawberry', icon: '\u{1F353}' },
  { id: 'pizza', icon: '\u{1F355}' },
  { id: 'icecream', icon: '\u{1F366}' },
  { id: 'cupcake', icon: '\u{1F9C1}' },
  { id: 'car', icon: '\u{1F697}' },
  { id: 'bus', icon: '\u{1F68C}' },
  { id: 'train', icon: '\u{1F682}' },
  { id: 'rocket', icon: '\u{1F680}' },
  { id: 'airplane', icon: '\u2708\uFE0F' },
  { id: 'boat', icon: '\u26F5' },
  { id: 'house', icon: '\u{1F3E0}' },
  { id: 'tree', icon: '\u{1F333}' },
  { id: 'flower', icon: '\u{1F338}' },
  { id: 'magic_wand', icon: '\u{1FA84}' },
  { id: 'crown', icon: '\u{1F451}' },
  { id: 'heart', icon: '\u{1F496}' },
];

const DEFAULT_MAGIC_ART_USES = Number(profileEconomy?.DEFAULT_MAGIC_ART_USES ?? 0);
const GUEST_GEMS_STORAGE_KEY = 'aiko_guest_gems_v1';
const GUEST_MAGIC_ART_USES_STORAGE_KEY = 'aiko_guest_magic_art_uses_v1';

const toSafeUses = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
};

const readGuestGems = () => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(GUEST_GEMS_STORAGE_KEY);
  return toSafeUses(raw, 0);
};

const writeGuestGems = (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUEST_GEMS_STORAGE_KEY, String(toSafeUses(value, 0)));
};

const readGuestMagicArtUses = () => {
  if (typeof window === 'undefined') return DEFAULT_MAGIC_ART_USES;
  const raw = window.localStorage.getItem(GUEST_MAGIC_ART_USES_STORAGE_KEY);
  return toSafeUses(raw, DEFAULT_MAGIC_ART_USES);
};

const writeGuestMagicArtUses = (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUEST_MAGIC_ART_USES_STORAGE_KEY, String(toSafeUses(value, DEFAULT_MAGIC_ART_USES)));
};

const MagicArt = ({ onBack }) => {
  const { user, profile, fetchProfile } = useAuth();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState('brush');
  const [brushColor, setBrushColor] = useState('#FF4136');
  const [brushSize, setBrushSize] = useState(10);
  const [customColor, setCustomColor] = useState('#FF0000');
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [remainingUses, setRemainingUses] = useState(DEFAULT_MAGIC_ART_USES);
  const [guestGems, setGuestGems] = useState(() => readGuestGems());
  const [packLoading, setPackLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const economyTier = useMemo(
    () => resolveEconomyTier({ profile, user }),
    [profile, user]
  );
  const magicArtRule = useMemo(() => getMagicArtRuleForTier(economyTier), [economyTier]);
  const isUnlimitedAccess = Boolean(magicArtRule?.unlimited);
  const hasActivePack = isUnlimitedAccess || remainingUses > 0;

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2400);
  };

  const tierLabel = getEconomyTierLabel(economyTier);
  const usesLeftLabel = isUnlimitedAccess ? 'Unlimited' : String(toSafeUses(remainingUses, 0));
  const currentGemBalance = user?.id ? toSafeUses(profile?.gems, 0) : guestGems;
  const economyHeadline = isUnlimitedAccess
    ? 'Free unlimited access for Schools & Educators'
    : `${toSafeUses(magicArtRule?.costGems, 0)} Gems unlock ${toSafeUses(magicArtRule?.packUses, 0)} uses`;

  useEffect(() => {
    if (isUnlimitedAccess) {
      setRemainingUses(Number.POSITIVE_INFINITY);
      return;
    }

    if (!user?.id) {
      setRemainingUses(readGuestMagicArtUses());
      setGuestGems(readGuestGems());
      return;
    }

    const getUsesFromProfile = profileEconomy?.getMagicArtUsesFromProfile;
    if (typeof getUsesFromProfile === 'function') {
      setRemainingUses(toSafeUses(getUsesFromProfile(profile, user.id, DEFAULT_MAGIC_ART_USES), DEFAULT_MAGIC_ART_USES));
      return;
    }

    setRemainingUses(toSafeUses(profile?.magic_art_uses, DEFAULT_MAGIC_ART_USES));
  }, [isUnlimitedAccess, profile, user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncGuestWallet = () => {
      if (user?.id || isUnlimitedAccess) return;
      setGuestGems(readGuestGems());
      setRemainingUses(readGuestMagicArtUses());
    };

    window.addEventListener('storage', syncGuestWallet);
    return () => {
      window.removeEventListener('storage', syncGuestWallet);
    };
  }, [isUnlimitedAccess, user?.id]);


  const paintCanvasBackground = (ctx, width, height) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const resizeCanvas = () => {
      const displayWidth = parent.clientWidth;
      const displayHeight = parent.clientHeight;
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      contextRef.current = ctx;

      paintCanvasBackground(ctx, canvas.width, canvas.height);
    };

    resizeCanvas();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(parent);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', resizeCanvas);
    }

    return () => {
      resizeObserver?.disconnect?.();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', resizeCanvas);
      }
    };
  }, []);

  const getCoordinates = (nativeEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = nativeEvent.touches ? nativeEvent.touches[0].clientX : nativeEvent.clientX;
    const clientY = nativeEvent.touches ? nativeEvent.touches[0].clientY : nativeEvent.clientY;
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const handleBuyPack = async () => {
    if (packLoading) return;
    if (isUnlimitedAccess) {
      showStatus('Schools and Educators have free unlimited Magic Art access.');
      return;
    }

    const packCost = toSafeUses(magicArtRule?.costGems, 0);
    const packUses = toSafeUses(magicArtRule?.packUses, 0);
    if (packCost <= 0 || packUses <= 0) {
      showStatus('Magic Art pricing is unavailable right now.');
      return;
    }

    if (!user?.id) {
      const currentGuestGems = readGuestGems();
      if (currentGuestGems < packCost) {
        setGuestGems(currentGuestGems);
        showStatus(`You need ${packCost} Gems but only have ${currentGuestGems}.`);
        return;
      }

      const nextGuestGems = Math.max(0, currentGuestGems - packCost);
      const nextGuestUses = readGuestMagicArtUses() + packUses;
      writeGuestGems(nextGuestGems);
      writeGuestMagicArtUses(nextGuestUses);
      setGuestGems(nextGuestGems);
      setRemainingUses(nextGuestUses);
      showStatus(`Unlocked ${packUses} uses for ${packCost} Gems (guest wallet).`);
      return;
    }

    const buyPackFn = profileEconomy?.buyMagicArtPack;
    if (typeof buyPackFn !== 'function') {
      showStatus('Magic Art purchase service is unavailable right now.');
      return;
    }

    setPackLoading(true);
    try {
      const purchaseResult = await buyPackFn({
        userId: user?.id,
        costGems: packCost,
        packUses,
      });

      if (!purchaseResult || purchaseResult.ok === false) {
        showStatus(purchaseResult?.message || 'Unable to buy Magic Art pack right now.');
        return;
      }

      setRemainingUses(
        toSafeUses(
          purchaseResult?.profile?.magic_art_uses ?? purchaseResult?.remaining,
          remainingUses
        )
      );
      if (user?.id) {
        await fetchProfile?.(user?.id);
      }
      showStatus(`Unlocked ${packUses} uses for ${packCost} Gems.`);
    } catch (error) {
      console.error('[MagicArt] Pack purchase failed:', error);
      showStatus('Purchase failed. Please try again.');
    } finally {
      setPackLoading(false);
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    nativeEvent.preventDefault();
    if (!hasActivePack) {
      showStatus('Buy a Magic Art pack to start drawing.');
      return;
    }

    const ctx = contextRef.current;
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(nativeEvent);

    if (activeTool === 'stamp' && selectedStamp) {
      ctx.save();
      ctx.font = `${Math.max(28, brushSize * 3)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp.icon, offsetX, offsetY);
      ctx.restore();
      return;
    }

    if (activeTool !== 'brush' && activeTool !== 'eraser') return;

    ctx.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    nativeEvent.preventDefault();
    if (!isDrawing) return;
    if (activeTool !== 'brush' && activeTool !== 'eraser') return;

    const ctx = contextRef.current;
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath?.();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintCanvasBackground(ctx, canvas.width, canvas.height);
  };

  const downloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const downloadLocally = () => {
      const link = document.createElement('a');
      link.download = 'magic-art.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    if (isUnlimitedAccess) {
      downloadLocally();
      showStatus('Saved successfully. Unlimited access is active.');
      return;
    }

    if (!hasActivePack) {
      showStatus('No uses left. Buy a new pack to download art.');
      return;
    }

    if (!user?.id) {
      const nextGuestUses = Math.max(0, readGuestMagicArtUses() - 1);
      writeGuestMagicArtUses(nextGuestUses);
      setRemainingUses(nextGuestUses);
      downloadLocally();
      showStatus(`Saved locally. Uses left: ${nextGuestUses}.`);
      return;
    }

    const consumeUseFn = profileEconomy?.consumeMagicArtUse;
    if (typeof consumeUseFn !== 'function') {
      showStatus('Unable to use Magic Art right now. Please try again.');
      return;
    }

    try {
      const consumeResult = await consumeUseFn({
        userId: user?.id,
        amount: 1,
      });

      if (!consumeResult || consumeResult.ok === false) {
        showStatus(consumeResult?.message || 'Could not use Magic Art right now.');
        return;
      }

      downloadLocally();
      setRemainingUses(
        toSafeUses(
          consumeResult?.profile?.magic_art_uses ?? consumeResult?.remaining,
          remainingUses
        )
      );
      if (user?.id) {
        await fetchProfile?.(user?.id);
      }
    } catch (error) {
      console.error('[MagicArt] Failed to consume use:', error);
      downloadLocally();
      showStatus('Saved locally. Cloud usage sync failed.');
    }
  };

  const handleBackToHome = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50 p-4 font-sans">
      <div className="mx-auto mb-4 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleBackToHome}
          className="rounded-full border border-pink-200 bg-white px-5 py-2 font-bold text-pink-600 shadow-sm transition hover:bg-pink-50 active:scale-[0.98]"
        >
          Back to Home
        </button>
        <div className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-900">
          Uses Left: {usesLeftLabel}
        </div>
      </div>

      <div className="mx-auto mb-4 flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Magic Art Economy</p>
          <p className="text-sm font-bold text-slate-800">
            {economyHeadline}
          </p>
          <p className="text-xs text-slate-600">
            Current Gems: {currentGemBalance} | Tier: {tierLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBuyPack}
          disabled={packLoading || isUnlimitedAccess}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            packLoading || isUnlimitedAccess
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {packLoading
            ? 'Processing...'
            : isUnlimitedAccess
              ? 'Unlimited Access Active'
              : `Buy ${toSafeUses(magicArtRule?.packUses, 0)} Uses for ${toSafeUses(magicArtRule?.costGems, 0)} Gems`}
        </button>
      </div>

      <div className="mx-auto mb-4 flex max-w-7xl flex-col gap-4 rounded-3xl bg-white p-4 shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                disabled={!hasActivePack}
                className={`h-10 w-10 rounded-full border-2 transition ${
                  brushColor === color ? 'scale-110 border-gray-400 shadow-md' : 'border-white'
                } ${!hasActivePack ? 'cursor-not-allowed opacity-50' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
            <span className="text-xs font-extrabold tracking-wider text-gray-500">CUSTOM</span>
            <label className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-300 shadow-sm">
              <input
                type="color"
                value={customColor}
                disabled={!hasActivePack}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setBrushColor(e.target.value);
                }}
                className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%]"
              />
            </label>
          </div>

          <div className="mx-2 hidden h-8 w-px bg-gray-200 md:block" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-500">Brush Size</span>
            <input
              type="range"
              min="2"
              max="64"
              value={brushSize}
              disabled={!hasActivePack}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-36 accent-pink-500"
            />
            <span className="w-8 text-right text-xs font-bold text-gray-400">{brushSize}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTool('brush')}
            disabled={!hasActivePack}
            className={`rounded-xl border px-5 py-2 font-bold transition ${
              activeTool === 'brush'
                ? 'border-pink-300 bg-pink-100 text-pink-700'
                : 'border-gray-200 bg-white text-gray-600'
            } ${!hasActivePack ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            Brush
          </button>
          <button
            onClick={() => setActiveTool('eraser')}
            disabled={!hasActivePack}
            className={`rounded-xl border px-5 py-2 font-bold transition ${
              activeTool === 'eraser'
                ? 'border-gray-400 bg-gray-200 text-gray-800'
                : 'border-gray-200 bg-white text-gray-600'
            } ${!hasActivePack ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            Eraser
          </button>
          <button
            onClick={clearCanvas}
            disabled={!hasActivePack}
            className={`rounded-xl border px-5 py-2 font-bold transition ${
              hasActivePack
                ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            Clear All
          </button>
          <button
            onClick={downloadImage}
            disabled={!hasActivePack}
            className={`rounded-xl border px-5 py-2 font-bold transition ${
              hasActivePack
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            Download
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold tracking-wider text-gray-400">STAMPS</span>
            <span className="text-xs text-gray-500">
              Tap a stamp, then tap the page
              {activeTool === 'stamp' && selectedStamp ? ` - Selected: ${selectedStamp.icon}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STAMPS.map((stamp) => (
              <button
                key={stamp.id}
                disabled={!hasActivePack}
                onClick={() => {
                  setActiveTool('stamp');
                  setSelectedStamp(stamp);
                }}
                className={`h-11 min-w-11 rounded-xl text-2xl transition ${
                  activeTool === 'stamp' && selectedStamp?.id === stamp.id
                    ? 'bg-pink-100 shadow-inner ring-1 ring-pink-200'
                    : 'hover:bg-gray-200'
                } ${!hasActivePack ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : ''}`}
                aria-label={`Stamp ${stamp.id}`}
              >
                {stamp.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div
          className={`relative min-h-[80vh] h-[82vh] max-h-[1000px] overflow-hidden rounded-[2rem] border-4 border-dashed border-pink-200 bg-white p-2 shadow-inner sm:p-3 ${
            hasActivePack ? 'cursor-crosshair' : 'cursor-not-allowed'
          }`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className={`h-full w-full touch-none rounded-[1.4rem] bg-white ${
              !hasActivePack ? 'pointer-events-none' : ''
            }`}
          />

          {!hasActivePack && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/75 backdrop-blur-[1px]">
              <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-lg">
                <p className="text-base font-black text-slate-900">Magic Art Locked</p>
                <p className="mt-2 text-sm text-slate-700">Buy a pack to unlock drawing tools.</p>
                <button
                  type="button"
                  onClick={handleBuyPack}
                  disabled={packLoading}
                  className={`mt-4 rounded-xl px-4 py-2 text-sm font-black transition ${
                    packLoading
                      ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {packLoading
                    ? 'Processing...'
                    : `Unlock ${toSafeUses(magicArtRule?.packUses, 0)} Uses for ${toSafeUses(magicArtRule?.costGems, 0)} Gems`}
                </button>
              </div>
            </div>
          )}

          {activeTool === 'stamp' && selectedStamp && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
              Stamp mode: tap anywhere to place {selectedStamp.icon}
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="fixed bottom-6 right-4 z-50 rounded-2xl border border-indigo-200 bg-indigo-100 px-4 py-3 text-sm font-bold text-indigo-900 shadow-lg">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default MagicArt;


