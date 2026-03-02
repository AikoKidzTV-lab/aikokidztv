import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MAGIC_ART_PACK_COST_GEMS, MAGIC_ART_PACK_USES } from '../constants/gemEconomy';
import {
  buyMagicArtPack,
  consumeMagicArtUse,
  DEFAULT_MAGIC_ART_USES,
} from '../utils/profileEconomy';

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
  { id: 'cloud', icon: '☁️' },
  { id: 'sun', icon: '☀️' },
  { id: 'moon', icon: '🌙' },
  { id: 'rainbow', icon: '🌈' },
  { id: 'star', icon: '⭐' },
  { id: 'sparkles', icon: '✨' },
  { id: 'balloon', icon: '🎈' },
  { id: 'gift', icon: '🎁' },
  { id: 'dog', icon: '🐶' },
  { id: 'cat', icon: '🐱' },
  { id: 'tiger', icon: '🐯' },
  { id: 'lion', icon: '🦁' },
  { id: 'rabbit', icon: '🐰' },
  { id: 'bear', icon: '🐻' },
  { id: 'panda', icon: '🐼' },
  { id: 'monkey', icon: '🐵' },
  { id: 'elephant', icon: '🐘' },
  { id: 'giraffe', icon: '🦒' },
  { id: 'dinosaur', icon: '🦖' },
  { id: 'butterfly', icon: '🦋' },
  { id: 'fish', icon: '🐟' },
  { id: 'whale', icon: '🐳' },
  { id: 'apple', icon: '🍎' },
  { id: 'banana', icon: '🍌' },
  { id: 'strawberry', icon: '🍓' },
  { id: 'pizza', icon: '🍕' },
  { id: 'icecream', icon: '🍦' },
  { id: 'cupcake', icon: '🧁' },
  { id: 'car', icon: '🚗' },
  { id: 'bus', icon: '🚌' },
  { id: 'train', icon: '🚂' },
  { id: 'rocket', icon: '🚀' },
  { id: 'airplane', icon: '✈️' },
  { id: 'boat', icon: '⛵' },
  { id: 'house', icon: '🏠' },
  { id: 'tree', icon: '🌳' },
  { id: 'flower', icon: '🌸' },
  { id: 'magic_wand', icon: '🪄' },
  { id: 'crown', icon: '👑' },
  { id: 'heart', icon: '💖' },
];

const toSafeUses = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
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
  const [remainingUses, setRemainingUses] = useState(0);
  const [packLoading, setPackLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const hasActivePack = remainingUses > 0;

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2400);
  };

  useEffect(() => {
    if (!user?.id) {
      setRemainingUses(0);
      return;
    }

    setRemainingUses(toSafeUses(profile?.magic_art_uses, DEFAULT_MAGIC_ART_USES));
  }, [user?.id, profile?.magic_art_uses]);

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
    if (!user?.id) {
      showStatus('Please log in to buy a Magic Art pack.');
      return;
    }

    setPackLoading(true);
    try {
      const purchaseResult = await buyMagicArtPack({
        userId: user.id,
        costGems: MAGIC_ART_PACK_COST_GEMS,
        packUses: MAGIC_ART_PACK_USES,
      });

      if (!purchaseResult.ok) {
        showStatus(purchaseResult.message || 'Unable to buy Magic Art pack right now.');
        return;
      }

      setRemainingUses(toSafeUses(purchaseResult.profile?.magic_art_uses));
      await fetchProfile?.(user.id);
      showStatus(`Unlocked ${MAGIC_ART_PACK_USES} uses for ${MAGIC_ART_PACK_COST_GEMS} 💎`);
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
    if (!user?.id) {
      showStatus('Please log in to use Magic Art.');
      return;
    }
    if (!hasActivePack) {
      showStatus('No uses left. Buy a new pack to download art.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const consumeResult = await consumeMagicArtUse({
        userId: user.id,
        amount: 1,
      });

      if (!consumeResult.ok) {
        showStatus(consumeResult.message || 'Could not use Magic Art right now.');
        return;
      }

      const link = document.createElement('a');
      link.download = 'magic-art.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      setRemainingUses(toSafeUses(consumeResult.profile?.magic_art_uses));
      await fetchProfile?.(user.id);
    } catch (error) {
      console.error('[MagicArt] Failed to consume use:', error);
      showStatus('Download failed. Please try again.');
    }
  };

  const handleBackToHome = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    window.location.reload();
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
          Uses Left: {remainingUses}
        </div>
      </div>

      <div className="mx-auto mb-4 flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Magic Art Economy</p>
          <p className="text-sm font-bold text-slate-800">
            {MAGIC_ART_PACK_COST_GEMS} 💎 unlocks {MAGIC_ART_PACK_USES} uses
          </p>
          <p className="text-xs text-slate-600">Current Gems: {Number(profile?.gems || 0)} 💎</p>
        </div>
        <button
          type="button"
          onClick={handleBuyPack}
          disabled={packLoading}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            packLoading
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {packLoading
            ? 'Processing...'
            : `Buy ${MAGIC_ART_PACK_USES} Uses for ${MAGIC_ART_PACK_COST_GEMS} 💎`}
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
              {activeTool === 'stamp' && selectedStamp ? ` • Selected: ${selectedStamp.icon}` : ''}
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
                    : `Unlock ${MAGIC_ART_PACK_USES} Uses for ${MAGIC_ART_PACK_COST_GEMS} 💎`}
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

