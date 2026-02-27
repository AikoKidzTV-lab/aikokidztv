import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MAGIC_ART_PACK_COST_GEMS, MAGIC_ART_PACK_USES } from '../constants/gemEconomy';
import { spendUserGems } from '../utils/gemWallet';

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

const MAGIC_ART_USES_KEY_PREFIX = 'aiko_magic_art_uses_v1_';

const MagicArt = ({ onBack }) => {
  const { user, profile, fetchProfile } = useAuth();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState('brush'); // brush | eraser | stamp
  const [brushColor, setBrushColor] = useState('#FF4136');
  const [brushSize, setBrushSize] = useState(10);
  const [customColor, setCustomColor] = useState('#FF0000');
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [remainingUses, setRemainingUses] = useState(0);
  const [packLoading, setPackLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const hasActivePack = remainingUses > 0;
  const usesStorageKey = `${MAGIC_ART_USES_KEY_PREFIX}${user?.id || 'guest'}`;

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2400);
  };

  useEffect(() => {
    try {
      const storedUses = Number(window.localStorage.getItem(usesStorageKey));
      setRemainingUses(Number.isFinite(storedUses) ? Math.max(0, Math.floor(storedUses)) : 0);
    } catch {
      setRemainingUses(0);
    }
  }, [usesStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(usesStorageKey, String(remainingUses));
  }, [remainingUses, usesStorageKey]);

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
      const spendResult = await spendUserGems({
        userId: user.id,
        amount: MAGIC_ART_PACK_COST_GEMS,
      });

      if (!spendResult.ok) {
        showStatus(spendResult.message || 'Unable to buy Magic Art pack right now.');
        return;
      }

      setRemainingUses((prev) => prev + MAGIC_ART_PACK_USES);
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

    if (activeTool !== 'brush' && activeTool !== 'eraser') {
      return;
    }

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

  const downloadImage = () => {
    if (!hasActivePack) {
      showStatus('No uses left. Buy a new pack to download art.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'magic-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setRemainingUses((prev) => Math.max(0, prev - 1));
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
          className="bg-white px-5 py-2 rounded-full shadow-sm font-bold text-pink-600 border border-pink-200 hover:bg-pink-50 active:scale-[0.98] transition"
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
            packLoading ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {packLoading
            ? 'Processing...'
            : `Buy ${MAGIC_ART_PACK_USES} Uses for ${MAGIC_ART_PACK_COST_GEMS} 💎`}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-4 mb-4 flex flex-col gap-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                disabled={!hasActivePack}
                className={`h-10 w-10 rounded-full border-2 transition ${
                  brushColor === color ? 'border-gray-400 scale-110 shadow-md' : 'border-white'
                } ${!hasActivePack ? 'cursor-not-allowed opacity-50' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <span className="text-xs font-extrabold text-gray-500 tracking-wider">CUSTOM</span>
            <label className="w-10 h-10 rounded-lg border-2 border-gray-300 overflow-hidden cursor-pointer relative shadow-sm">
              <input
                type="color"
                value={customColor}
                disabled={!hasActivePack}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setBrushColor(e.target.value);
                }}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2"
              />
            </label>
          </div>

          <div className="hidden md:block w-px bg-gray-200 h-8 mx-2" />

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
            <span className="text-xs font-bold text-gray-400 w-8 text-right">{brushSize}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTool('brush')}
            disabled={!hasActivePack}
            className={`px-5 py-2 rounded-xl font-bold border transition ${
              activeTool === 'brush'
                ? 'bg-pink-100 border-pink-300 text-pink-700'
                : 'bg-white border-gray-200 text-gray-600'
            } ${!hasActivePack ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            Brush
          </button>
          <button
            onClick={() => setActiveTool('eraser')}
            disabled={!hasActivePack}
            className={`px-5 py-2 rounded-xl font-bold border transition ${
              activeTool === 'eraser'
                ? 'bg-gray-200 border-gray-400 text-gray-800'
                : 'bg-white border-gray-200 text-gray-600'
            } ${!hasActivePack ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            Eraser
          </button>
          <button
            onClick={clearCanvas}
            disabled={!hasActivePack}
            className={`px-5 py-2 rounded-xl font-bold border transition ${
              hasActivePack
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            Clear All
          </button>
          <button
            onClick={downloadImage}
            disabled={!hasActivePack}
            className={`px-5 py-2 rounded-xl font-bold border transition ${
              hasActivePack
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            Download
          </button>
        </div>

        <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-gray-400 tracking-wider">STAMPS</span>
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
                className={`text-2xl min-w-11 h-11 rounded-xl transition ${
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

      <div className="max-w-7xl mx-auto">
        <div className={`bg-white rounded-[2rem] shadow-inner border-4 border-dashed border-pink-200 p-2 sm:p-3 min-h-[80vh] h-[82vh] max-h-[1000px] relative overflow-hidden ${
          hasActivePack ? 'cursor-crosshair' : 'cursor-not-allowed'
        }`}>
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
            className={`w-full h-full rounded-[1.4rem] bg-white touch-none ${!hasActivePack ? 'pointer-events-none' : ''}`}
          />

          {!hasActivePack && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/75 backdrop-blur-[1px]">
              <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-lg">
                <p className="text-base font-black text-slate-900">🔒 Magic Art Locked</p>
                <p className="mt-2 text-sm text-slate-700">
                  Buy a pack to unlock drawing tools.
                </p>
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
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
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
