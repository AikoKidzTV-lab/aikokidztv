import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const UNKNOWN_CATEGORY = 'Uncategorized';
const VIDEO_TABLE_SOURCES = ['videos'];
const VIDEO_CLAY_THEME = {
  '--clay-surface-bg': '#ffffff',
  '--clay-surface-border': 'rgba(56, 189, 248, 0.36)',
  '--clay-shadow-outer':
    '18px 18px 38px rgba(59, 130, 246, 0.18), -14px -14px 30px rgba(255, 255, 255, 0.96)',
  '--clay-shadow-inner':
    'inset 3px 3px 9px rgba(255, 255, 255, 0.9), inset -4px -4px 10px rgba(236, 72, 153, 0.14)',
  '--clay-shadow':
    '18px 18px 38px rgba(59, 130, 246, 0.18), -14px -14px 30px rgba(255, 255, 255, 0.96), inset 3px 3px 9px rgba(255, 255, 255, 0.9), inset -4px -4px 10px rgba(236, 72, 153, 0.14)',
};

const isMissingColumnError = (error, columnName) => {
  if (!columnName) return false;
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedColumn = String(columnName).toLowerCase();
  return (
    text.includes(normalizedColumn) &&
    (text.includes('column') || text.includes('schema cache') || error?.code === '42703' || error?.code === 'PGRST204')
  );
};

const normalizeVideoRow = (row) => {
  const imageUrl = typeof row?.thumbnail_url === 'string' ? row.thumbnail_url.trim() : '';
  const videoUrl = typeof row?.video_url === 'string' ? row.video_url.trim() : '';
  const description = typeof row?.description === 'string' ? row.description.trim() : '';
  const createdAt = typeof row?.created_at === 'string' ? row.created_at : '';

  if (!videoUrl) return null;

  const id = row?.id ? String(row.id) : `${row?.title || 'video'}-${videoUrl}`;

  return {
    id,
    title: typeof row?.title === 'string' && row.title.trim() ? row.title.trim() : 'Untitled Video',
    description,
    category: UNKNOWN_CATEGORY,
    imageUrl,
    videoUrl,
    createdAt,
  };
};

const fetchVideoRowsFromTable = async (tableName) => {
  let { data, error } = await supabase
    .from(tableName)
    .select('id, title, description, video_url, thumbnail_url, created_at')
    .order('created_at', { ascending: false });

  if (error && isMissingColumnError(error, 'created_at')) {
    ({ data, error } = await supabase
      .from(tableName)
      .select('id, title, description, video_url, thumbnail_url'));
  }

  if (error) {
    throw new Error(error.message || `Failed to load videos from "${tableName}".`);
  }

  return Array.isArray(data) ? data : [];
};

const loadVideoRows = async () => {
  let lastError = null;

  for (const source of VIDEO_TABLE_SOURCES) {
    try {
      const rows = await fetchVideoRowsFromTable(source);
      if (rows.length > 0) {
        return rows;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return [];
};

export default function VideoZone() {
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [actionVideoId, setActionVideoId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const missingVideoStatusRef = useRef('');

  const selectedVideoId = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    const fromVideo = params.get('video');
    const fromVideoId = params.get('videoId');
    const rawId = fromVideo || fromVideoId || '';
    return String(rawId).trim();
  }, [location.search]);

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 3000);
  };

  useEffect(() => {
    let mounted = true;

    const loadCards = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const rows = await loadVideoRows();
        if (!mounted) return;

        const normalized = rows
          .map(normalizeVideoRow)
          .filter(Boolean)
          .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

        setVideos(normalized);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err?.message || 'Failed to load videos.');
        setVideos([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadCards();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(videos.map((video) => video.category).filter(Boolean)));
    return ['All', ...unique];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return videos;
    return videos.filter((video) => video.category === activeCategory);
  }, [activeCategory, videos]);

  const selectedVideo = useMemo(() => {
    if (!selectedVideoId) return null;
    return videos.find((video) => String(video.id) === selectedVideoId) || null;
  }, [selectedVideoId, videos]);

  useEffect(() => {
    if (activeCategory === 'All') return;
    if (!categoryOptions.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [activeCategory, categoryOptions]);

  useEffect(() => {
    if (!selectedVideoId) {
      missingVideoStatusRef.current = '';
      return;
    }
    if (isLoading) return;

    if (!selectedVideo) {
      if (missingVideoStatusRef.current !== selectedVideoId) {
        showStatus('Requested video was not found. Showing all available videos.');
        missingVideoStatusRef.current = selectedVideoId;
      }
      return;
    }

    missingVideoStatusRef.current = '';
    if (selectedVideo.category && selectedVideo.category !== activeCategory) {
      setActiveCategory(selectedVideo.category);
    }
  }, [activeCategory, isLoading, selectedVideoId, selectedVideo]);

  const openVideoInNewTab = (videoUrl) => {
    if (typeof window === 'undefined') return;
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVideoAction = async (video) => {
    if (!video?.videoUrl || actionVideoId) return;

    setActionVideoId(video.id);
    try {
      openVideoInNewTab(video.videoUrl);
    } catch (error) {
      console.error('[VideoZone] Video action failed:', error);
      showStatus('Something went wrong. Please try again.');
    } finally {
      setActionVideoId('');
    }
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-white px-4 py-8 sm:px-6 lg:px-8"
      style={VIDEO_CLAY_THEME}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-fuchsia-400/22 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-cyan-300/24 blur-3xl" />
        <div className="absolute bottom-8 left-1/4 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900 p-5 shadow-2xl sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/70" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Video Zone</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-4xl">
                Aiko&apos;s Cinema Magic
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-100 sm:text-base">
                Browse and watch all available videos.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isLoading ? 'Loading...' : `${filteredVideos.length} videos`}
            </div>
          </div>

          {loadError && (
            <div className="relative mt-4 rounded-2xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
              Failed to load videos: {loadError}
            </div>
          )}
        </div>

        {selectedVideo && (
          <div className="mb-6 overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-xl">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.05fr_1fr]">
              <div className="relative">
                <img
                  src={selectedVideo.imageUrl || '/logo.png.webp'}
                  alt={`${selectedVideo.title} featured banner`}
                  className="aspect-video h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent md:hidden" />
                <div className="absolute bottom-3 left-3 rounded-full border border-white/60 bg-black/45 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white md:hidden">
                  Selected Video
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    Selected Video
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                    {selectedVideo.title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-700 sm:text-base">
                    {selectedVideo.description || 'Play this video now from your homepage selection.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleVideoAction(selectedVideo)}
                    disabled={Boolean(actionVideoId)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                      actionVideoId === selectedVideo.id
                        ? 'cursor-not-allowed bg-slate-600 text-slate-200'
                        : 'bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                    } ${Boolean(actionVideoId) && actionVideoId !== selectedVideo.id ? 'opacity-60' : ''}`}
                  >
                    {actionVideoId === selectedVideo.id ? 'Processing...' : 'Play Video'}
                    {actionVideoId !== selectedVideo.id && <ExternalLink size={14} />}
                  </button>
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
                    From homepage
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          {categoryOptions.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.25)]'
                    : 'border border-cyan-200 bg-white text-slate-800 hover:bg-cyan-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {filteredVideos.map((video) => {
            const isBusy = actionVideoId === video.id;

            return (
              <article
                key={video.id}
                className="clay-card group overflow-hidden rounded-2xl border border-cyan-100/80 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300/70"
              >
                <div className="relative">
                  <img
                    src={video.imageUrl || '/logo.png.webp'}
                    alt={`${video.title} banner`}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/5 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900">
                      {video.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-white">
                      Available
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="min-h-[3rem] text-base font-extrabold text-slate-900">{video.title}</h3>
                  <p className="mt-2 text-xs text-slate-700">Tap to watch this video.</p>

                  <button
                    type="button"
                    onClick={() => handleVideoAction(video)}
                    disabled={Boolean(actionVideoId)}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${
                      isBusy
                        ? 'cursor-not-allowed bg-slate-600 text-slate-200'
                        : 'bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                    } ${Boolean(actionVideoId) && !isBusy ? 'opacity-60' : ''}`}
                  >
                    {isBusy ? 'Processing...' : 'Watch Video'}
                    {!isBusy && <ExternalLink size={14} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-6 text-center text-sm text-slate-700">
            {isLoading ? 'Loading videos...' : `${'\u{1F9F8}'} Coming Soon! Fresh video adventures will pop up here very soon.`}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="fixed bottom-6 right-4 z-50 rounded-2xl border border-indigo-200 bg-indigo-100 px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg">
          {statusMessage}
        </div>
      )}
    </section>
  );
}
