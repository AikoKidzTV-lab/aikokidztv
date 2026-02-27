import React from 'react';
import { motion } from 'framer-motion';
import { useKidsMode } from '../context/KidsModeContext';

const premiumVideos = [
  {
    title: 'Panda Parade in the Clouds',
    url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    description: 'Soft pastel skies, giggles, and calm background music for little ones.',
  },
  {
    title: 'Rainbow Rocket Storytime',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    description: 'A gentle rocket tour through candy nebulae, narrated for bedtime.',
  },
  {
    title: 'Bunny & Friends Picnic',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Colourful forest critters share snacks and songs in the sunshine.',
  },
];

const freeVideos = [
  { id: 'aqz-KE-bpKQ', title: 'Big Buck Bunny (YouTube HD)' },
  { id: 'YE7VzlLtp-4', title: 'Sintel Short Film (YouTube)' },
  { id: 'GxzY3f11QZM', title: 'Elephant Dream (YouTube)' },
];

const KidsTV = () => {
  const { triggerConfetti, isKidsModeOn } = useKidsMode();

  const handlePrimaryAction = () => {
    triggerConfetti();
  };

  return (
    <section id="kidstv" className="py-20">
      <div className="max-w-[1200px] mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-pink-500 dark:text-pink-300">Hybrid Freemium</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Kids TV</h2>
            <p className="text-slate-600 dark:text-slate-300">Ad-free Aiko originals plus a complimentary cartoon lane for everyone.</p>
          </div>
          <button
            onClick={handlePrimaryAction}
            className="kid-3d inline-flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-pink-400 via-pink-300 to-orange-200 text-slate-900 font-semibold shadow-lg hover:from-pink-300 hover:to-yellow-200 transition-all"
          >
            {"\uD83D\uDC51"} Go Premium to Remove Ads
          </button>
        </div>

        {/* Section A: Premium Originals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-pink-500 dark:text-pink-300">Ad-Free & Downloadable</p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Aiko Premium Originals</h3>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold dark:bg-pink-900/40 dark:text-pink-200 border border-pink-200 dark:border-pink-800">Premium</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumVideos.map((video) => (
              <motion.div
                key={video.title}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-pink-100/80 dark:border-white/15 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="relative">
                  <video
                    src={video.url}
                    controls
                    onPlay={handlePrimaryAction}
                    className="w-full aspect-video object-cover"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-pink-500 text-white text-xs font-semibold shadow-md">Premium</span>
                </div>
                <div className="p-4 space-y-2 relative">
                  <div className="absolute inset-2 rounded-lg bg-white/75 dark:bg-slate-900/70 backdrop-blur-sm pointer-events-none" />
                  <h4
                    className="relative text-xl font-bold text-[#2d3436] dark:text-white"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    {video.title}
                  </h4>
                  <p className="relative text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{video.description}</p>
                  <div className="relative flex flex-wrap gap-2 pt-2">
                    <a
                      href={video.url}
                      download
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-100 text-pink-700 font-semibold border border-pink-200 hover:bg-pink-200 transition-colors dark:bg-pink-900/30 dark:text-pink-100 dark:border-pink-800"
                    >
                      {"\uD83D\uDCE5"} Save to Device
                    </a>
                    <button
                      onClick={handlePrimaryAction}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors dark:bg-slate-700"
                    >
                      {"\u25B6\uFE0F"} Play with Confetti
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section B: Free Cartoon Zone */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Complimentary</p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Free Cartoon Zone</h3>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-100">
            Disclaimer: The videos in this section are embedded from YouTube and are provided as a free, complimentary service for kids' entertainment. They may contain ads served by YouTube. This section is NOT a part of the AikoKidzTV Premium Subscription plan.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeVideos.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 rounded-2xl overflow-hidden shadow-lg"
                onClick={isKidsModeOn ? handlePrimaryAction : undefined}
              >
                <div className="relative">
                  <iframe
                    title={video.title}
                    src={`https://www.youtube.com/embed/${video.id}`}
                    className="w-full aspect-video border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 relative">
                  <div className="absolute inset-2 rounded-lg bg-white/75 dark:bg-slate-900/70 backdrop-blur-sm pointer-events-none" />
                  <h4
                    className="relative text-lg font-bold text-[#2d3436] dark:text-white"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    {video.title}
                  </h4>
                  <p className="relative text-xs text-slate-600 dark:text-slate-300">Complimentary with ads via YouTube</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KidsTV;
