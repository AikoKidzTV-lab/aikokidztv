import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { applySmallItemEconomy } from '../constants/gemEconomy';

const PREMIUM_UNLOCK_COST = applySmallItemEconomy(3);
const UNLOCKED_STORAGE_KEY = 'aiko_coloringbook_unlocked_pages_v2';

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

const readUnlockedPages = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(UNLOCKED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value) => typeof value === 'string' && value.trim().length > 0);
  } catch {
    return [];
  }
};

export default function ColoringBook({ onBack }) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const contextRef = useRef(null);
  const canvasSectionRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const drawingSnapshotRef = useRef(null);

  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [pagesError, setPagesError] = useState('');

  const [selectedPage, setSelectedPage] = useState(null);
  const [pendingUnlockPage, setPendingUnlockPage] = useState(null);
  const [unlockedPremiumPages, setUnlockedPremiumPages] = useState(() => readUnlockedPages());
  const [brushColor, setBrushColor] = useState(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('#FF4136');
  const [brushSize, setBrushSize] = useState(12);
  const [imageLoadError, setImageLoadError] = useState(false);

  const unlockedSet = useMemo(() => new Set(unlockedPremiumPages), [unlockedPremiumPages]);

  const displayPages = useMemo(
    () =>
      pages.map((page, index) => ({
        ...page,
        label: `🎨 Page ${index + 1}`,
      })),
    [pages],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify(unlockedPremiumPages));
  }, [unlockedPremiumPages]);

  useEffect(() => {
    let isMounted = true;

    const loadColoringPages = async () => {
      setPagesLoading(true);
      setPagesError('');

      try {
        const { data, error } = await supabase
          .from('coloring_pages')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const normalized = (data ?? []).filter(
          (row) => row && typeof row.id === 'string' && typeof row.image_url === 'string' && row.image_url,
        );

        if (!isMounted) return;
        setPages(normalized);
      } catch (err) {
        if (!isMounted) return;
        setPagesError(err?.message || 'Failed to load coloring pages.');
        setPages([]);
      } finally {
        if (isMounted) setPagesLoading(false);
      }
    };

    loadColoringPages();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPage) return undefined;

    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return undefined;

    drawingSnapshotRef.current = null;
    canvas.width = 0;
    canvas.height = 0;

    const createContext = () => {
      const displayWidth = Math.max(1, container.clientWidth);
      const displayHeight = Math.max(1, container.clientHeight);
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
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      contextRef.current = ctx;

      if (drawingSnapshotRef.current) {
        const snapshot = new Image();
        snapshot.onload = () => {
          if (!contextRef.current) return;
          contextRef.current.clearRect(0, 0, displayWidth, displayHeight);
          contextRef.current.drawImage(snapshot, 0, 0, displayWidth, displayHeight);
        };
        snapshot.src = drawingSnapshotRef.current;
      } else {
        ctx.clearRect(0, 0, displayWidth, displayHeight);
      }
    };

    const resizeCanvas = () => {
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          drawingSnapshotRef.current = canvas.toDataURL('image/png');
        } catch {
          drawingSnapshotRef.current = null;
        }
      }
      createContext();
    };

    resizeCanvas();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }

    return () => {
      resizeObserver?.disconnect?.();
      window.removeEventListener('resize', resizeCanvas);
      contextRef.current = null;
      isDrawingRef.current = false;
      lastPointRef.current = null;
    };
  }, [selectedPage]);

  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  }, [brushColor, brushSize]);

  const isPageUnlocked = (page) => !page.is_premium || unlockedSet.has(page.id);

  const getPoint = (nativeEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = nativeEvent.touches ? nativeEvent.touches[0].clientX : nativeEvent.clientX;
    const clientY = nativeEvent.touches ? nativeEvent.touches[0].clientY : nativeEvent.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const openCanvasForPage = (page) => {
    setImageLoadError(false);
    setSelectedPage(page);
    requestAnimationFrame(() => {
      canvasSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleThumbnailClick = (page) => {
    if (isPageUnlocked(page)) {
      openCanvasForPage(page);
      return;
    }
    setPendingUnlockPage(page);
  };

  const confirmUnlock = () => {
    if (!pendingUnlockPage) return;

    setUnlockedPremiumPages((prev) => {
      if (prev.includes(pendingUnlockPage.id)) return prev;
      return [...prev, pendingUnlockPage.id];
    });

    const unlockedPage = pendingUnlockPage;
    setPendingUnlockPage(null);
    alert(`✨ Mock unlock successful! ${PREMIUM_UNLOCK_COST} Gems would be charged here.`);
    openCanvasForPage(unlockedPage);
  };

  const startDrawing = ({ nativeEvent }) => {
    nativeEvent.preventDefault();
    const ctx = contextRef.current;
    if (!ctx) return;

    const point = getPoint(nativeEvent);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = ({ nativeEvent }) => {
    nativeEvent.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = contextRef.current;
    if (!ctx) return;

    const point = getPoint(nativeEvent);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    contextRef.current?.closePath?.();
    isDrawingRef.current = false;
    lastPointRef.current = null;

    try {
      drawingSnapshotRef.current = canvasRef.current?.toDataURL('image/png') || null;
    } catch {
      drawingSnapshotRef.current = null;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawingSnapshotRef.current = null;
  };

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }

    if (selectedPage) {
      setSelectedPage(null);
      return;
    }

    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">Coloring Book</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">Magical Coloring Pages</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Free pages open instantly. Premium pages unlock for {PREMIUM_UNLOCK_COST} Gems.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50"
          >
            Back
          </button>
        </div>

        <section className="rounded-[1.8rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_50px_rgba(14,165,233,0.10)] backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700">
              <span className="text-base">Pages</span>
              {displayPages.length}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
              Premium Unlock Cost: {PREMIUM_UNLOCK_COST} Gems
            </div>
          </div>

          {pagesLoading && (
            <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600">
              Loading coloring pages...
            </div>
          )}

          {!pagesLoading && pagesError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {pagesError}
            </div>
          )}

          {!pagesLoading && !pagesError && displayPages.length === 0 && (
            <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white text-center">
              <div className="px-6">
                <p className="text-lg font-black text-slate-900">No coloring pages uploaded yet</p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Use the Admin Panel to upload pages to Supabase Storage and publish them here.
                </p>
              </div>
            </div>
          )}

          {!pagesLoading && !pagesError && displayPages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {displayPages.map((page) => {
                const unlocked = isPageUnlocked(page);
                const premiumLocked = Boolean(page.is_premium) && !unlocked;

                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleThumbnailClick(page)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[3/4] bg-gradient-to-b from-slate-50 to-slate-100">
                      <img
                        src={page.image_url}
                        alt={page.label}
                        loading="lazy"
                        className={`h-full w-full object-cover transition duration-300 ${
                          premiumLocked ? 'scale-[1.02] brightness-75' : 'group-hover:scale-[1.02]'
                        }`}
                      />

                      <div className="absolute left-2 top-2">
                        {!page.is_premium ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
                            Free
                          </span>
                        ) : unlocked ? (
                          <span className="rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-800">
                            Unlocked
                          </span>
                        ) : (
                          <span className="rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-violet-800">
                            Premium
                          </span>
                        )}
                      </div>

                      {premiumLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/60 backdrop-blur-[1px]">
                          <div className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white/15 text-2xl shadow-lg">
                            🔒
                          </div>
                          <span className="rounded-full border border-amber-200/70 bg-amber-100/95 px-3 py-1 text-xs font-black text-amber-900 shadow">
                            {PREMIUM_UNLOCK_COST} Gems to Unlock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="text-sm font-bold text-slate-800">{page.label}</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {premiumLocked ? 'Locked' : 'Open'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section
          ref={canvasSectionRef}
          className="mt-6 rounded-[1.8rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_50px_rgba(16,185,129,0.10)] sm:p-5"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Painting Canvas</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {selectedPage ? `${selectedPage.label} • Color It!` : 'Choose a page to start coloring'}
              </h2>
            </div>
            {selectedPage && (
              <button
                onClick={() => setSelectedPage(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Close Canvas
              </button>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBrushColor(color)}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    brushColor === color ? 'scale-110 border-slate-500 shadow' : 'border-white'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
              <label className="relative ml-1 grid h-9 w-9 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-slate-300 bg-white shadow-sm">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setBrushColor(e.target.value);
                  }}
                  className="h-12 w-12 cursor-pointer opacity-0"
                  aria-label="Custom color"
                />
                <span className="pointer-events-none absolute text-xs font-black text-slate-500">+</span>
              </label>
            </div>

            <div className="mx-1 hidden h-7 w-px bg-slate-200 md:block" />

            <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
              Brush Size
              <input
                type="range"
                min="2"
                max="40"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-36 accent-emerald-500"
              />
              <span className="w-8 text-right text-xs font-black text-slate-500">{brushSize}</span>
            </label>

            <button
              type="button"
              onClick={clearCanvas}
              disabled={!selectedPage}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                selectedPage
                  ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'cursor-not-allowed border border-slate-200 bg-white text-slate-400'
              }`}
            >
              Clear
            </button>
          </div>

          <div className="rounded-[1.5rem] border-4 border-dashed border-emerald-200 bg-white p-2 sm:p-3">
            {selectedPage ? (
              <div
                ref={canvasContainerRef}
                className="relative mx-auto min-h-[55vh] w-full max-w-4xl overflow-hidden rounded-[1rem] border border-slate-200 bg-white sm:min-h-[70vh]"
              >
                <img
                  src={selectedPage.image_url}
                  alt={`${selectedPage.label} coloring page`}
                  onLoad={() => setImageLoadError(false)}
                  onError={() => setImageLoadError(true)}
                  className="absolute inset-0 h-full w-full object-contain bg-white"
                />

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
                  className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
                />

                {imageLoadError && (
                  <div className="absolute inset-x-4 bottom-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow">
                    Could not load this Supabase image URL. Check the `image_url` value and confirm the `coloring_images` bucket file is public.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid min-h-[45vh] place-items-center rounded-[1rem] bg-gradient-to-b from-emerald-50 to-sky-50 text-center">
                <div className="max-w-md px-6">
                  <div className="mb-3 text-5xl">🎨📚✨</div>
                  <p className="text-lg font-black text-slate-900">Pick a coloring page above to start drawing</p>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Free pages open instantly. Premium pages show a {PREMIUM_UNLOCK_COST} Gems unlock popup first.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {pendingUnlockPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <div className="mb-3 text-center text-5xl">🔒💎✨</div>
            <h3 className="text-center text-xl font-black text-slate-900">Premium Coloring Page</h3>
            <p className="mt-3 text-center text-sm font-semibold text-slate-700">
              Unlock this magical page for {PREMIUM_UNLOCK_COST} Gems?
            </p>
            <p className="mt-1 text-center text-xs font-medium text-slate-500">
              {pendingUnlockPage.label} • Mock unlock flow (database integration later)
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingUnlockPage(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnlock}
                className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-200 to-yellow-200 px-4 py-2.5 text-sm font-black text-amber-950 shadow-sm hover:brightness-95"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
