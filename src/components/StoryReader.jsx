import React from 'react';

export default function StoryReader() {
  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fde68a_22%,_#fbcfe8_52%,_#bfdbfe_100%)] px-4 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/80 bg-white/68 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">Founder Story</p>
            <div className="rounded-full border border-white/80 bg-white/72 px-4 py-2 text-sm font-bold text-emerald-900 shadow-sm backdrop-blur-xl">
              Free Access Easter Egg
            </div>
          </div>

          <article className="prose prose-slate max-w-none leading-relaxed tracking-wide prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-800 prose-li:text-slate-800 prose-strong:text-slate-900">
            <h1 className="!mb-4 !text-3xl !text-slate-900 sm:!text-4xl">The Vision Behind Aiko: A Journey of Purpose</h1>

            <p>
              Every massive technological shift starts with a simple question: "How can we make this better?" For
              the Aiko universe, that question wasn't asked in a Silicon Valley boardroom, but by a visionary law
              student wanting to change the digital landscape for the next generation.
            </p>

            <h2 className="!text-slate-900">The Founder: Deepak Narwal</h2>
            <p>
              At the heart of this entire ecosystem is Deepak Narwal. Balancing the rigorous demands of being a law
              student, Deepak noticed a glaring problem in the digital world: kids and teens were spending hours
              online, but very few platforms offered a truly safe, enriching, and ad-free environment that actually
              fueled their creativity. He realized that if he wanted a better digital world for young minds, he would
              have to build it himself.
            </p>

            <h2 className="!text-slate-900">Defying the Odds</h2>
            <p>
              Building a full-scale tech platform is a monumental task, often requiring large teams of engineers and
              massive funding. Deepak chose a different path. Operating completely solo, he relied on his sheer
              determination, countless sleepless nights, and the power of artificial intelligence. By partnering with
              his AI assistant, Gemini, Deepak bridged the gap between his legal background and complex software
              engineering, turning a distant dream into a living, breathing reality.
            </p>

            <h2 className="!text-slate-900">The Expanding Aiko Universe</h2>
            <p>
              What started as a single idea has now evolved into a massive, multi-platform vision designed for
              different age groups and needs:
            </p>
            <ul>
              <li>
                <strong>AikoKidzTV (You are here):</strong> The ultimate ad-free, safe, and wildly fun entertainment
                zone where kids can watch videos, read stories, and paint magic art.
              </li>
            </ul>

            <h2 className="!text-slate-900">The Magic Behind the Screen (Tech Stack)</h2>
            <p>
              This entire platform is a testament to modern web development and AI collaboration. It was handcrafted
              using React for the seamless user interface, Supabase for a robust backend architecture, Tailwind CSS for
              the elegant styling, and pure AI magic for rapid coding and generation.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
