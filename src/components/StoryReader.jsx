import React from 'react';
import { useAuth } from '../context/AuthContext';
import { addUserGems } from '../utils/gemWallet';

const FOUNDER_STORY_REWARD_GEMS = 10;
const STORY_REWARD_STORAGE_PREFIX = 'aiko_founder_story_reward_claimed_';

export default function StoryReader() {
  const { user, fetchProfile } = useAuth();
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [hasClaimedReward, setHasClaimedReward] = React.useState(false);
  const [notice, setNotice] = React.useState(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const claimKey = `${STORY_REWARD_STORAGE_PREFIX}${user?.id || 'guest'}`;
    setHasClaimedReward(window.localStorage.getItem(claimKey) === 'true');
  }, [user?.id]);

  const showNotice = React.useCallback((type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const handleClaimReward = async () => {
    if (hasClaimedReward || isClaiming) return;

    if (!user?.id) {
      showNotice('error', 'Please log in to claim your 10 Gems reward.');
      return;
    }

    setIsClaiming(true);

    try {
      const result = await addUserGems({
        userId: user.id,
        amount: FOUNDER_STORY_REWARD_GEMS,
      });

      if (!result.ok) {
        showNotice('error', result.message || 'Unable to claim reward right now.');
        return;
      }

      await fetchProfile?.(user.id);
      setHasClaimedReward(true);

      if (typeof window !== 'undefined') {
        const claimKey = `${STORY_REWARD_STORAGE_PREFIX}${user.id}`;
        window.localStorage.setItem(claimKey, 'true');
      }

      showNotice('success', `Reward claimed! +${FOUNDER_STORY_REWARD_GEMS} Gems added.`);
    } catch (error) {
      console.error('[StoryReader] Reward claim failed:', error);
      showNotice('error', 'Something went wrong while claiming your reward.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fde68a_22%,_#fbcfe8_52%,_#bfdbfe_100%)] px-4 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">Founder Story</p>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-900">
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
              <li>
                <strong>AikoKidz (Coming Soon):</strong> A revolutionary, dedicated educational platform engineered
                specifically to make studying focused and engaging.
              </li>
              <li>
                <strong>AikoTeeenz (Coming Soon):</strong> A vibrant, dynamic, and explorable digital universe built
                exclusively for teenagers to learn, connect, and grow.
              </li>
            </ul>

            <h2 className="!text-slate-900">The Magic Behind the Screen (Tech Stack)</h2>
            <p>
              This entire platform is a testament to modern web development and AI collaboration. It was handcrafted
              using React for the seamless user interface, Supabase for a robust backend architecture, Tailwind CSS for
              the elegant styling, and pure AI magic for rapid coding and generation.
            </p>
          </article>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-900">
              Easter Egg Reward: Claim your bonus after reading this Founder Story.
            </p>
            <button
              type="button"
              onClick={handleClaimReward}
              disabled={hasClaimedReward || isClaiming}
              className={`mt-4 w-full rounded-full px-6 py-2.5 text-sm font-black transition sm:w-auto ${
                hasClaimedReward || isClaiming
                  ? 'cursor-not-allowed bg-slate-300 text-slate-600'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {hasClaimedReward
                ? 'Reward Claimed'
                : isClaiming
                  ? 'Claiming...'
                  : 'Claim 10 Gems'}
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-4 z-50 rounded-2xl border px-5 py-3 text-sm font-bold shadow-[0_14px_30px_rgba(15,23,42,0.25)] ${
            notice.type === 'success'
              ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
              : 'border-rose-300 bg-rose-100 text-rose-900'
          }`}
        >
          {notice.type === 'success' ? 'Success:' : 'Warning:'} {notice.message}
        </div>
      )}
    </section>
  );
}
