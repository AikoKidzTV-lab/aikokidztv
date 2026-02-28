import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';

const UNKNOWN_CATEGORY = 'Uncategorized';

const normalizeVideoRow = (row) => {
  const imageUrl = typeof row?.image_url === 'string' ? row.image_url.trim() : '';
  const videoUrl = typeof row?.video_url === 'string' ? row.video_url.trim() : '';

  if (!imageUrl || !videoUrl) return null;

  return {
    id: row?.id ?? `${row?.title || 'video'}-${videoUrl}`,
    title: typeof row?.title === 'string' && row.title.trim() ? row.title.trim() : 'Untitled Movie',
    category:
      typeof row?.category === 'string' && row.category.trim()
        ? row.category.trim()
        : UNKNOWN_CATEGORY,
    imageUrl,
    videoUrl,
  };
};

export default function VideoZone() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let mounted = true;

    const loadMovieCards = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const { data, error } = await supabase
          .from('videos')
          .select('id, title, category, image_url, video_url, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        if (!mounted) return;

        const normalized = (data || [])
          .map(normalizeVideoRow)
          .filter(Boolean);

        setVideos(normalized);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err?.message || 'Failed to load videos.');
        setVideos([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadMovieCards();

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

  useEffect(() => {
    if (activeCategory === 'All') return;
    if (!categoryOptions.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [activeCategory, categoryOptions]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-8 left-1/4 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">
                Video Zone
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-4xl">
                Aiko&apos;s Cinema Magic
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                Tap a movie banner to open the official video in a new browser tab.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isLoading ? 'Loading...' : `${filteredVideos.length} videos`}
            </div>
          </div>
          {loadError && (
            <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
              Failed to load videos: {loadError}
            </div>
          )}
        </div>

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
                    : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {filteredVideos.map((video) => (
            <a
              key={video.id}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300/40 hover:bg-white/10"
            >
              <div className="relative">
                <img
                  src={video.imageUrl}
                  alt={`${video.title} banner`}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900">
                    {video.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white">
                    Open <ExternalLink size={12} />
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="min-h-[3rem] text-base font-extrabold text-white">
                  {video.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  Opens this movie in a new tab.
                </p>
              </div>
            </a>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-200">
            {isLoading ? 'Loading videos...' : 'No videos found in this category.'}
          </div>
        )}
      </div>
    </section>
  );
}
