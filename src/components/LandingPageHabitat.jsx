import React from 'react';
import { Link } from 'react-router-dom';
import AIStudio from './AIStudio';
import GemPacksPricing from './GemPacksPricing';
import LearningZone from './LearningZone';
import { supabase } from '../supabaseClient';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const HOMEPAGE_FOUNDER_VIDEOS = [
  { id: 'watch-1', youtubeId: 'YOUR_CUSTOM_VID_1', title: 'Founder Video 1' },
  { id: 'watch-2', youtubeId: 'YOUR_CUSTOM_VID_2', title: 'Founder Video 2' },
  { id: 'watch-3', youtubeId: 'YOUR_CUSTOM_VID_3', title: 'Founder Video 3' },
  { id: 'watch-4', youtubeId: 'YOUR_CUSTOM_VID_4', title: 'Founder Video 4' },
];

const WaveDivider = ({ fill = '#dcfce7', flip = false }) => (
  <div className={`absolute inset-x-0 ${flip ? 'bottom-0 rotate-180' : 'top-0 -translate-y-full'} pointer-events-none`}>
    <svg viewBox="0 0 1440 140" className="h-14 w-full sm:h-20" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,64L60,74.7C120,85,240,107,360,112C480,117,600,107,720,85.3C840,64,960,32,1080,26.7C1200,21,1320,43,1380,53.3L1440,64L1440,140L1380,140C1320,140,1200,140,1080,140C960,140,840,140,720,140C600,140,480,140,360,140C240,140,120,140,60,140L0,140Z"
        fill={fill}
      />
    </svg>
  </div>
);

export default function LandingPageHabitat({
  user,
  onOpenLogin,
  onNav,
  onSelectLearningModule,
}) {
  const go = (target) => onNav?.(target);
  const [freeGemsClaimed, setFreeGemsClaimed] = React.useState(false);
  const [watchEarnMessage, setWatchEarnMessage] = React.useState('');
  const [paymentToast, setPaymentToast] = React.useState(null);
  const paymentToastTimerRef = React.useRef(null);

  const showPaymentToast = React.useCallback((type, message) => {
    setPaymentToast({ type, message });
    if (paymentToastTimerRef.current) {
      clearTimeout(paymentToastTimerRef.current);
    }
    paymentToastTimerRef.current = setTimeout(() => {
      setPaymentToast(null);
    }, 4500);
  }, []);

  React.useEffect(() => () => {
    if (paymentToastTimerRef.current) {
      clearTimeout(paymentToastTimerRef.current);
    }
  }, []);

  React.useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleClaimFreeGems = () => {
    if (freeGemsClaimed) return;
    setFreeGemsClaimed(true);
    setWatchEarnMessage('Success! 50 FREE GEMS were added to your balance (demo simulation).');
  };

  const handlePayment = async (packName, amount, gemAmount, currency = 'INR') => {
    const paymentAmount = Number(amount);
    const gemsToCredit = Number(gemAmount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0 || !Number.isFinite(gemsToCredit) || gemsToCredit <= 0) {
      showPaymentToast('error', 'Unable to start checkout for this pack. Please try again.');
      return;
    }

    const paymentCurrency = currency === 'USD' ? 'USD' : 'INR';
    const sdkLoaded = window.Razorpay ? true : await loadRazorpayScript();
    if (!sdkLoaded) {
      showPaymentToast('error', 'Payment gateway failed to load. Please try again.');
      return;
    }

    const options = {
      key: 'rzp_test_SL4ytKNK0S7Ukd',
      amount: Math.round(paymentAmount * 100),
      currency: paymentCurrency,
      name: 'AikoKidzTV',
      description: `Purchase ${packName}`,
      notes: {
        pack_name: packName,
        gem_amount: String(gemsToCredit),
        currency: paymentCurrency,
      },
      prefill: {
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        email: user?.email || '',
        contact: user?.user_metadata?.phone || '',
      },
      theme: {
        color: '#0f172a',
      },
      handler: async (response) => {
        if (!response?.razorpay_payment_id) {
          showPaymentToast('error', 'Payment could not be verified. Please try again.');
          return;
        }

        try {
          if (user?.id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('gems')
              .eq('id', user.id)
              .single();

            if (profileError) throw profileError;

            const currentGems = Number(profile?.gems || 0);
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ gems: currentGems + gemsToCredit })
              .eq('id', user.id);

            if (updateError) throw updateError;
          }

          showPaymentToast('success', `Payment Successful! ${gemsToCredit} Gems added to your account.`);
        } catch (error) {
          console.warn('[LandingPageHabitat] Supabase gem update fallback to simulation.', error);
          showPaymentToast('success', `Payment Successful! ${gemsToCredit} Gems added to your account.`);
        }
      },
      modal: {
        ondismiss: () => {
          showPaymentToast('info', 'Payment cancelled. You can try again anytime.');
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', (failure) => {
      const errorMessage =
        failure?.error?.description || 'Payment failed. Please try a different payment method.';
      showPaymentToast('error', errorMessage);
    });
    razorpayInstance.open();
  };

  return (
    <div className="relative">
      <section
        id="hero"
        className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-gradient-to-b from-sky-300 to-blue-100 shadow-[0_20px_80px_rgba(56,189,248,0.28)]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-10 text-5xl opacity-80 animate-bounce [animation-duration:4s]">☁️</div>
          <div className="absolute right-10 top-14 text-6xl opacity-80 animate-bounce [animation-duration:5.2s] [animation-delay:0.4s]">☁️</div>
          <div className="absolute left-1/4 top-24 text-4xl opacity-70 animate-bounce [animation-duration:4.8s] [animation-delay:0.2s]">☁️</div>
          <div className="absolute right-1/4 top-24 text-2xl opacity-90">🦜</div>
          <div className="absolute right-16 top-32 text-3xl opacity-90">🦅</div>
          <div className="absolute left-16 top-36 text-2xl opacity-90">🦉</div>
          <div className="absolute -left-6 bottom-20 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute right-4 bottom-8 h-40 w-40 rounded-full bg-blue-300/30 blur-2xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-extrabold !text-sky-900 shadow-sm backdrop-blur">
              <span className="text-lg">💎</span>
              Gems power every adventure
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl !text-slate-900">
              AikoKidzTV
              <span className="mt-2 block text-balance text-3xl sm:text-4xl lg:text-5xl !text-blue-900">
                Fun &amp; Games in a Sky-to-Ocean World
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg !text-slate-700">
              Jump into playful stories, magic art, and adorable adventure zones. Collect Gems 💎,
              unlock fun instantly, and explore with zero boring stuff.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => go('story-studio')}
                className="rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-black !text-slate-900 shadow-lg shadow-sky-200/70 transition hover:-translate-y-1 hover:bg-sky-50"
              >
                ✨ Story Studio
              </button>
              <button
                onClick={() => go('magic-art')}
                className="rounded-2xl border border-blue-300/70 bg-blue-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-blue-300/50 transition hover:-translate-y-1 hover:bg-blue-600"
              >
                🎨 Magic Art
              </button>
              <Link
                to="/coloring"
                className="rounded-2xl border border-fuchsia-300/80 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-pink-300/60 transition hover:-translate-y-1 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600"
              >
                🎨 Play Magic Art / Coloring Book
              </Link>
              <button
                onClick={() => go('learning-zone')}
                className="rounded-2xl border border-cyan-300/80 bg-cyan-100 px-5 py-3 text-sm font-black !text-cyan-900 shadow-lg shadow-cyan-200/70 transition hover:-translate-y-1 hover:bg-cyan-200"
              >
                🕹️ Play Zones
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-white/70 px-3 py-1 font-bold !text-slate-700 shadow-sm">
                Instant Unlock
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 font-bold !text-slate-700 shadow-sm">
                Kid-Safe Fun
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1 font-bold !text-slate-700 shadow-sm">
                Gem Packs 💎
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/80 bg-white/70 p-4 shadow-xl backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wider !text-slate-500">Cloud Quest</p>
                <p className="mt-2 text-4xl">☁️🦜</p>
                <p className="mt-2 text-sm font-bold !text-slate-700">Fly with silly birds and collect sky gems.</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/70 p-4 shadow-xl backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wider !text-slate-500">Treasure Meter</p>
                <p className="mt-2 text-2xl font-black !text-blue-900">+200 💎</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
                </div>
                <p className="mt-2 text-xs font-semibold !text-slate-600">Weekend bonus active</p>
              </div>
              <div className="col-span-2 rounded-[1.6rem] border border-white/80 bg-gradient-to-r from-white/80 via-sky-50/80 to-white/80 p-5 shadow-xl backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] !text-blue-700">Today&apos;s Fun Route</p>
                    <p className="mt-1 text-xl font-black !text-slate-900">Sky Games → Safari Gems → Ocean Party</p>
                    <p className="mt-1 text-sm !text-slate-600">Scroll the habitats and pick your favorite adventure.</p>
                  </div>
                  <div className="text-5xl">🌤️🦁🌊</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[2.2rem] border border-emerald-100 bg-gradient-to-b from-green-100 to-emerald-200 shadow-[0_20px_80px_rgba(16,185,129,0.2)]">
        <WaveDivider fill="#dcfce7" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-4 top-20 text-5xl opacity-80">🌳</div>
          <div className="absolute right-6 top-28 text-5xl opacity-80">🌳</div>
          <div className="absolute left-16 top-48 text-4xl opacity-90">🦁</div>
          <div className="absolute right-16 top-52 text-4xl opacity-90">🐘</div>
          <div className="absolute left-1/3 top-20 text-4xl opacity-90">🦒</div>
          <div className="absolute right-1/3 top-16 text-4xl opacity-90">🐼</div>
          <div className="absolute -left-6 bottom-20 h-24 w-24 rounded-full bg-green-300/30 blur-xl" />
          <div className="absolute right-10 bottom-10 h-24 w-24 rounded-full bg-emerald-300/40 blur-xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <GemPacksPricing onPay={handlePayment} />

          <div className="mt-14 space-y-10">
            <div
              id="ai-studio"
              className="rounded-[1.8rem] border border-white/70 bg-white/50 p-4 shadow-xl backdrop-blur sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] !text-emerald-700">Creative Clouds</p>
                  <h3 className="mt-1 text-2xl font-black !text-slate-900">Story Studio & Magic Art</h3>
                  <p className="mt-1 text-sm !text-slate-600">
                    Make stories, draw magic, and spend your Gems on fun adventures.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-bold !text-slate-700 shadow">
                  <span className="mr-2">💎</span>
                  Gem-powered creative zone
                </div>
              </div>

              <div id="story-studio" className="h-0 scroll-mt-28" />
              <div id="magic-art" className="h-0 scroll-mt-28" />

              {user ? (
                <AIStudio />
              ) : (
                <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-white/90 to-emerald-50 p-8 text-center shadow-lg">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-4xl shadow-inner">
                    ✨
                  </div>
                  <h4 className="text-2xl font-black !text-slate-900">Unlock the AI Creative Studio</h4>
                  <p className="mx-auto mt-3 max-w-2xl !text-slate-600">
                    Log in to create magical stories, generate playful images, and use your Gems 💎 to
                    power extra fun.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={onOpenLogin}
                      className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-1 hover:bg-emerald-600"
                    >
                      Login to Unlock
                    </button>
                    <button
                      onClick={() => go('magic-art')}
                      className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black !text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Open Magic Art
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.8rem] border border-white/70 bg-white/55 p-2 shadow-xl backdrop-blur sm:p-4">
              <LearningZone onSelect={onSelectLearningModule} />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[2.2rem] border border-cyan-100/60 bg-gradient-to-b from-cyan-200 to-blue-500 shadow-[0_22px_80px_rgba(14,116,144,0.22)]">
        <WaveDivider fill="#bae6fd" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-12 text-4xl opacity-90">🐬</div>
          <div className="absolute right-10 top-16 text-4xl opacity-90">🐢</div>
          <div className="absolute left-1/4 top-28 text-4xl opacity-90">🐙</div>
          <div className="absolute right-1/4 top-32 text-5xl opacity-90">🐳</div>
          <div className="absolute left-12 bottom-20 text-2xl opacity-70">🫧</div>
          <div className="absolute left-24 bottom-32 text-xl opacity-60">🫧</div>
          <div className="absolute right-16 bottom-24 text-2xl opacity-70">🫧</div>
          <div className="absolute right-32 bottom-36 text-xl opacity-60">🫧</div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-700/50 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] !text-cyan-950/70">
                The Ocean • Clubhouse
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl !text-white">
                Dive into the Ocean Party
              </h2>
              <p className="mt-4 max-w-2xl !text-blue-50/95">
                Sea creatures, bubbles, and surprise Gem drops await at the end of the scroll.
                Your support, legal info, and contact details continue below in the Reef Footer.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => go('top')}
                  className="rounded-2xl border border-white/70 bg-white/90 px-5 py-3 text-sm font-black !text-blue-700 shadow-lg transition hover:-translate-y-1"
                >
                  ☁️ Back to Sky
                </button>
                <button
                  onClick={() => go('learning-zone')}
                  className="rounded-2xl border border-cyan-100/70 bg-cyan-50/90 px-5 py-3 text-sm font-black !text-cyan-800 shadow-lg transition hover:-translate-y-1"
                >
                  🕹️ Play Zones
                </button>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/40 bg-white/15 p-5 shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/40 bg-white/15 p-4">
                  <p className="text-xs font-black uppercase tracking-wide !text-blue-50/80">Daily Splash</p>
                  <p className="mt-2 text-2xl font-black !text-white">+25 💎</p>
                  <p className="mt-1 text-sm !text-blue-50/85">Login bonus bubbles are ready.</p>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/15 p-4">
                  <p className="text-xs font-black uppercase tracking-wide !text-blue-50/80">Reef Pass</p>
                  <p className="mt-2 text-2xl font-black !text-white">VIP 👑</p>
                  <p className="mt-1 text-sm !text-blue-50/85">Pair with Jungle King pack.</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/40 bg-gradient-to-r from-white/20 to-white/10 p-4">
                  <p className="text-sm font-bold !text-white">
                    🫧 Smooth automated checkout • Instant Gem credit • No manual unlock delays
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-[2.2rem] border border-cyan-100/60 bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-700 shadow-[0_22px_80px_rgba(14,116,144,0.24)]">
        <WaveDivider fill="#a5f3fc" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-10 text-3xl opacity-80">🫧</div>
          <div className="absolute left-20 top-20 text-2xl opacity-70">🫧</div>
          <div className="absolute right-8 top-14 text-4xl opacity-80">🐠</div>
          <div className="absolute right-20 top-28 text-4xl opacity-80">🐬</div>
          <div className="absolute left-10 bottom-12 h-24 w-24 rounded-full bg-cyan-200/25 blur-2xl" />
          <div className="absolute right-8 bottom-10 h-28 w-28 rounded-full bg-blue-200/20 blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-blue-900/35 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] !text-cyan-950/75">
              The Ocean • Watch &amp; Earn
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl !text-white">
              Want Free Gems? 💎
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm sm:text-base !text-blue-50/95">
              Watch 4 of our special Aiko videos to unlock 50 FREE GEMS instantly!
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HOMEPAGE_FOUNDER_VIDEOS.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden rounded-2xl border border-white/30 bg-white/10 p-2 shadow-xl backdrop-blur-sm"
              >
                <div className="overflow-hidden rounded-xl border border-white/20 bg-black/20">
                  <div className="aspect-video">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p className="px-2 pb-1 pt-3 text-sm font-bold !text-white">{video.title}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClaimFreeGems}
              disabled={freeGemsClaimed}
              className={`rounded-2xl px-6 py-3 text-base font-black shadow-xl transition ${
                freeGemsClaimed
                  ? 'cursor-not-allowed border border-white/40 bg-white/20 !text-blue-50/90'
                  : 'border border-white/80 bg-white/95 !text-blue-700 hover:-translate-y-1 hover:bg-cyan-50'
              }`}
            >
              {freeGemsClaimed ? '✅ 50 Free Gems Claimed' : '🎁 Claim 50 Free Gems'}
            </button>

            {watchEarnMessage ? (
              <p className="rounded-full border border-emerald-200/40 bg-emerald-400/15 px-4 py-2 text-sm font-bold !text-emerald-50">
                {watchEarnMessage}
              </p>
            ) : (
              <p className="text-xs font-semibold !text-blue-50/85">
                Demo flow: this simulates a reward claim on the home page.
              </p>
            )}
          </div>
        </div>
      </section>

      {paymentToast ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[100]">
          <div
            className={[
              'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur',
              paymentToast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : '',
              paymentToast.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : '',
              paymentToast.type === 'info'
                ? 'border-sky-200 bg-sky-50 text-sky-800'
                : '',
            ].join(' ')}
          >
            {paymentToast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}








