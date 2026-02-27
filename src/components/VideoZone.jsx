import React, { useEffect, useMemo, useRef, useState } from 'react';

const CATEGORY_OPTIONS = ['All', 'Learning', 'Stories', 'Songs'];
const UNKNOWN_DURATION = '--:--';
const KIDS_VIDEO_LIBRARY = [
  { id: 'kids-1', title: 'CoComelon - Wheels on the Bus', youtubeId: 'e_04ZrNroTo', category: 'Songs' },
  { id: 'kids-2', title: 'Pinkfong - Baby Shark Dance', youtubeId: 'XqZsoesa55w', category: 'Songs' },
  { id: 'kids-3', title: 'Super Simple - Twinkle Twinkle Little Star', youtubeId: 'yCjJyiqpAuU', category: 'Songs' },
  { id: 'kids-4', title: 'ChuChu TV - Phonics Song', youtubeId: 'hq3yfQnllfQ', category: 'Learning' },
  { id: 'kids-5', title: 'ABC Song for Children', youtubeId: '75p-N9YKqNo', category: 'Learning' },
  { id: 'kids-6', title: 'The Very Hungry Caterpillar Story', youtubeId: '75NQK-Sm1YY', category: 'Stories' },
  { id: 'kids-7', title: 'Goodnight Moon Read Aloud', youtubeId: '5q8bM0F6GzA', category: 'Stories' },
  { id: 'kids-8', title: 'Counting Numbers Song', youtubeId: 'DR-cfDsHCGA', category: 'Learning' },
];

const getYouTubeThumbnail = (youtubeId) =>
  `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

export default function VideoZone() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError('');

    const shuffleVideos = (items) => {
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledVideos = shuffleVideos(KIDS_VIDEO_LIBRARY).map((video) => ({
      ...video,
      duration: UNKNOWN_DURATION,
    }));

    setVideos(shuffledVideos);
    setSelectedVideoId(shuffledVideos[0]?.id ?? null);
    setIsLoading(false);
  }, []);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return videos;
    return videos.filter((video) => video.category === activeCategory);
  }, [activeCategory, videos]);

  const selectedVideo = useMemo(() => {
    const inFilter = filteredVideos.find((video) => video.id === selectedVideoId);
    return inFilter ?? filteredVideos[0] ?? videos[0] ?? null;
  }, [filteredVideos, selectedVideoId, videos]);

  useEffect(() => {
    if (!selectedVideo) return;
    setSelectedVideoId((current) => (current === selectedVideo.id ? current : selectedVideo.id));
  }, [selectedVideo]);

  const handleSelectVideo = (video) => {
    setSelectedVideoId(video.id);
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
                Tap a card to play a magical video adventure. Videos are embedded from YouTube to keep the app fast and lightweight.
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

        <div
          ref={playerRef}
          className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-indigo-950/80 to-slate-900/95 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-5"
        >
          {selectedVideo ? (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200/80">
                    Now Playing
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-white sm:text-2xl">
                    {selectedVideo.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-100">
                    {selectedVideo.category}
                  </span>
                  <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-bold text-amber-100">
                    {selectedVideo.duration}
                  </span>
                </div>
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                <div className="aspect-video">
                  <iframe
                    key={selectedVideo.youtubeId}
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1`}
                    title={selectedVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-[240px] place-items-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-slate-200">
              {isLoading ? 'Loading videos...' : 'No videos available yet.'}
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {CATEGORY_OPTIONS.map((category) => {
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
          {filteredVideos.map((video) => {
            const isActive = selectedVideo?.id === video.id;

            return (
              <button
                key={video.id}
                type="button"
                onClick={() => handleSelectVideo(video)}
                className={`group overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                  isActive
                    ? 'border-cyan-300/60 bg-cyan-300/10 shadow-[0_14px_30px_rgba(34,211,238,0.18)]'
                    : 'border-white/10 bg-white/5 hover:-translate-y-1 hover:border-fuchsia-300/40 hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <img
                    src={getYouTubeThumbnail(video.youtubeId)}
                    alt={`${video.title} thumbnail`}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900">
                      {video.category}
                    </span>
                    <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white">
                      {video.duration}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-slate-900/60 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
                    <span className="text-[11px] font-bold uppercase tracking-wide">Play</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="min-h-[3rem] text-base font-extrabold text-white">
                    {video.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300">
                    Click to load this video in the featured player.
                  </p>
                </div>
              </button>
            );
          })}
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
