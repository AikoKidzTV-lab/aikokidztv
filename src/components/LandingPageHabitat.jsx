import React from 'react';
import { Link } from 'react-router-dom';
import AIStudio from './AIStudio';
import GemPacksPricing from './GemPacksPricing';
import LearningZone from './LearningZone';
import { supabase } from '../supabaseClient';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_KEY_ID = String(import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();

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

const HERO_BANNERS = [
  {
    id: 'banner-1',
    title: 'Cloud Rainbow Race',
    subtitle: 'Zoom through sky loops and collect shiny stars.',
    gradient: 'from-pink-400 via-fuchsia-500 to-indigo-500',
    emoji: '☁️🌈',
  },
  {
    id: 'banner-2',
    title: 'Jungle Jam',
    subtitle: 'Dance with animal friends in a music forest.',
    gradient: 'from-emerald-400 via-lime-400 to-green-600',
    emoji: '🦁🎵',
  },
  {
    id: 'banner-3',
    title: 'Ocean Bubble Party',
    subtitle: 'Splash through magical bubbles and hidden gems.',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    emoji: '🐬🫧',
  },
  {
    id: 'banner-4',
    title: 'Candy Castle Quest',
    subtitle: 'Find sweet treasure in sparkly candy lands.',
    gradient: 'from-rose-400 via-pink-500 to-orange-400',
    emoji: '🍭🏰',
  },
  {
    id: 'banner-5',
    title: 'Space Mini Heroes',
    subtitle: 'Hop between tiny planets and cosmic moons.',
    gradient: 'from-indigo-500 via-violet-600 to-purple-700',
    emoji: '🚀🪐',
  },
  {
    id: 'banner-6',
    title: 'Dino Discovery Trail',
    subtitle: 'Track footprints and uncover ancient surprises.',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    emoji: '🦖🗺️',
  },
  {
    id: 'banner-7',
    title: 'Frozen Spark Garden',
    subtitle: 'Skate through icy lights and crystal paths.',
    gradient: 'from-sky-300 via-cyan-300 to-blue-500',
    emoji: '❄️✨',
  },
  {
    id: 'banner-8',
    title: 'Robot Fun Lab',
    subtitle: 'Build playful bots and activate mini missions.',
    gradient: 'from-slate-400 via-slate-500 to-slate-700',
    emoji: '🤖⚙️',
  },
  {
    id: 'banner-9',
    title: 'Pirate Treasure Tide',
    subtitle: 'Sail for maps, keys, and mystery chests.',
    gradient: 'from-teal-500 via-cyan-600 to-blue-700',
    emoji: '🏴‍☠️💎',
  },
  {
    id: 'banner-10',
    title: 'Starry Story Night',
    subtitle: 'Read glowing bedtime tales under moonlight.',
    gradient: 'from-violet-500 via-purple-600 to-indigo-700',
    emoji: '🌙📚',
  },
];

const sanskariTasks = [
  "Drink a full glass of water 💧", "Say 'Thank You' to your mom or dad 🙏", "Organize your toys properly 🧸", "Take 5 deep breaths 🌬️", "Smile in the mirror 😊", "Wash your hands with soap 🧼", "Read one page of a book 📖", "Help set up the dining table 🍽️", "Hug your parents 🤗", "Say a positive morning prayer ☀️", "Stretch your body for 2 minutes 🤸", "Brush your teeth carefully 🪥", "Put your used plate in the sink 🍽️", "Share a toy or snack with someone 🤝", "Draw a happy face on paper 🖍️", "Eat a piece of fresh fruit 🍎", "Say 'Sorry' if you made a mistake 🕊️", "Pick up one piece of trash and throw it 🗑️", "Compliment someone today 💖", "Close your eyes and sit quietly for 1 min 🧘", "Water a plant in your house 🌱", "Fold your own blanket 🛏️", "Wipe a table clean 🧽", "Keep your shoes in the correct rack 👟", "Count from 1 to 50 slowly 🔢", "Listen to your elders without arguing 👂", "Feed a bird or an animal (with help) 🐦", "Say 'Please' when asking for something 🥺", "Turn off extra lights to save energy 💡", "Close the tap while brushing teeth 🚰", "Help fold dry clothes 👕", "Speak softly and politely today 🗣️", "Learn one new word today 📚", "Draw a picture for your grandparents 🎨", "Don't waste any food on your plate 🍛", "Chew your food 20 times 😋", "Arrange your books in the bag 🎒", "Do 10 jumping jacks 💪", "Sing a happy song 🎵", "Greet a neighbor with a smile 🙋‍♂️", "Help clean your room 🧹", "Write down one thing you are happy about 📝", "Wait for your turn patiently ⏳", "Cover your mouth when coughing 🤧", "Drink milk without complaining 🥛", "Put dirty clothes in the laundry basket 🧺", "Say goodnight to everyone before bed 🌙", "Think of 3 colors you saw today 🌈", "Clap for someone who did a good job 👏", "Promise to be a good kid today 😇"
];

const TASKS_PER_QUEST = 5;
const TASK_ROTATION_INTERVAL_MS = 300000;
const FREE_GEMS_RESET_LIMIT = 1000;
const BELL_NOTIFICATION_EVENT = 'aiko:bell-notification';

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
  const [heroSlideIndex, setHeroSlideIndex] = React.useState(0);
  const [freeGemsEarned, setFreeGemsEarned] = React.useState(0);
  const [activeTaskStart, setActiveTaskStart] = React.useState(0);
  const [showTaskQuest, setShowTaskQuest] = React.useState(false);
  const [taskQuestClaimed, setTaskQuestClaimed] = React.useState(false);
  const paymentToastTimerRef = React.useRef(null);

  const pushBellNotification = React.useCallback((message) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(BELL_NOTIFICATION_EVENT, {
      detail: {
        message,
        createdAt: new Date().toISOString(),
        source: 'task-quest',
      },
    }));
  }, []);

  const activeTaskQuestItems = React.useMemo(
    () => Array.from(
      { length: TASKS_PER_QUEST },
      (_, index) => sanskariTasks[(activeTaskStart + index) % sanskariTasks.length]
    ),
    [activeTaskStart]
  );

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

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % HERO_BANNERS.length);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const rotationIntervalId = window.setInterval(() => {
      setActiveTaskStart((current) => (current + TASKS_PER_QUEST) % sanskariTasks.length);
      setTaskQuestClaimed(false);
      pushBellNotification('New tasks available!');
    }, TASK_ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(rotationIntervalId);
    };
  }, [pushBellNotification]);

  const goToPrevBanner = () => {
    setHeroSlideIndex((current) => (current - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  const goToNextBanner = () => {
    setHeroSlideIndex((current) => (current + 1) % HERO_BANNERS.length);
  };

  const handleClaimFreeGems = () => {
    if (freeGemsClaimed) return;
    setFreeGemsClaimed(true);
    setWatchEarnMessage('Success! 50 FREE GEMS were added to your balance.');
  };

  const handleTaskQuestReward = () => {
    if (taskQuestClaimed) return;
    setTaskQuestClaimed(true);
    setFreeGemsEarned((current) => {
      const next = current + 2;
      return next >= FREE_GEMS_RESET_LIMIT ? 0 : next;
    });
    pushBellNotification('You earned 2 gems!');
  };

  const handlePayment = async (packName, amount, gemAmount, currency = 'INR') => {
    const paymentAmount = Number(amount);
    const gemsToCredit = Number(gemAmount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0 || !Number.isFinite(gemsToCredit) || gemsToCredit <= 0) {
      showPaymentToast('error', 'Unable to start checkout for this pack. Please try again.');
      return;
    }

    const paymentCurrency = currency === 'USD' ? 'USD' : 'INR';

    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'undefined' || RAZORPAY_KEY_ID === 'null') {
      console.error('[Razorpay] Missing VITE_RAZORPAY_KEY_ID. Check your .env and restart the dev server.');
      showPaymentToast('error', 'Payment is temporarily unavailable. Please contact support.');
      return;
    }

    const sdkLoaded = window.Razorpay ? true : await loadRazorpayScript();
    if (!sdkLoaded) {
      showPaymentToast('error', 'Payment gateway failed to load. Please try again.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
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
    <div className="relative overflow-x-hidden">
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

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-extrabold !text-sky-900 shadow-sm backdrop-blur">
              <span className="text-lg">💎</span>
              Gems power every adventure
            </div>

            <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl !text-white">
              AikoKidzTV
              <span className="mt-2 block text-balance text-3xl sm:text-4xl lg:text-5xl !text-cyan-100">
                Fun &amp; Games in a Sky-to-Ocean World
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg !text-blue-50/95">
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
                to="/videos"
                className="rounded-2xl border border-purple-500 bg-purple-600 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-purple-400/40 transition hover:-translate-y-1 hover:bg-purple-700"
              >
                🎬 Movies (200 💎)
              </Link>
              <Link
                to="/coloring"
                className="rounded-2xl border border-fuchsia-300/80 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-pink-300/60 transition hover:-translate-y-1 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600"
              >
                🎨 Play Magic Art / Coloring Book
              </Link>
              <button
                onClick={() => go('learning-zone')}
                className="rounded-2xl border border-cyan-200/80 bg-cyan-50/95 px-5 py-3 text-sm font-black !text-cyan-900 shadow-lg shadow-cyan-900/10 transition hover:-translate-y-1 hover:bg-cyan-100"
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
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-extrabold !text-sky-900 shadow-sm backdrop-blur">
                  <span className="text-lg">🖼️</span>
                  Featured Banner Slider
                </div>
                <span className="ml-3 text-sm italic !text-white/90 opacity-70">
                  All movies belong to Blender Studio
                </span>
              </div>

              <div className="w-full max-w-full overflow-hidden rounded-3xl border border-white/80 bg-white/20 shadow-[0_20px_55px_rgba(15,23,42,0.2)] backdrop-blur">
                <div className="relative w-full max-w-full overflow-hidden">
                  <div
                    className="flex w-full max-w-full transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${heroSlideIndex * 100}%)` }}
                  >
                    {HERO_BANNERS.map((banner, index) => (
                      <div key={banner.id} className="relative min-h-[260px] min-w-full cursor-default select-none sm:min-h-[320px]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.32),rgba(255,255,255,0)_55%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.26),rgba(255,255,255,0)_60%)]" />
                        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                          <span className="inline-flex w-fit items-center rounded-full border border-white/70 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/95">
                            Banner {index + 1} / {HERO_BANNERS.length}
                          </span>
                          <div>
                            <p className="mb-2 text-4xl sm:text-5xl">{banner.emoji}</p>
                            <h2 className="text-2xl font-black text-white sm:text-3xl">{banner.title}</h2>
                            <p className="mt-2 max-w-xl text-sm font-semibold text-white/95 sm:text-base">
                              {banner.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={goToPrevBanner}
                    aria-label="Previous banner"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/30 px-3 py-2 text-lg font-black text-white shadow transition hover:bg-white/40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goToNextBanner}
                    aria-label="Next banner"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/30 px-3 py-2 text-lg font-black text-white shadow transition hover:bg-white/40"
                  >
                    →
                  </button>

                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {HERO_BANNERS.map((banner, index) => (
                      <span
                        key={banner.id}
                        className={`h-1.5 rounded-full transition-all ${
                          index === heroSlideIndex ? 'w-6 bg-white' : 'w-2 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="cursor-default rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-xs font-black !text-slate-800 shadow-sm"
                >
                  10 Banners Ready
                </button>
                <button
                  type="button"
                  className="cursor-default rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-xs font-black !text-slate-800 shadow-sm"
                >
                  Auto Slide Every 4s
                </button>
                <span className="inline-flex items-center rounded-full border border-cyan-200/90 bg-cyan-50/95 px-4 py-1.5 text-xs font-black !text-cyan-900 shadow-sm">
                  Coming Soon 🚀
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowTaskQuest((current) => !current)}
                  className="rounded-3xl border border-white/80 bg-white/70 p-4 text-left shadow-xl backdrop-blur transition hover:-translate-y-0.5"
                >
                  <p className="text-xs font-black uppercase tracking-wider !text-slate-500">Task Quest 🌟</p>
                  <p className="mt-2 text-4xl">✅💎</p>
                  <p className="mt-2 text-sm font-bold !text-slate-700">Complete 5 good habits to earn 2 💎!</p>
                </button>
                <div className="rounded-3xl border border-white/80 bg-white/70 p-4 shadow-xl backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-wider !text-slate-500">Treasure Meter</p>
                  <p className="mt-2 text-2xl font-black !text-blue-900">{freeGemsEarned} 💎</p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min((freeGemsEarned / FREE_GEMS_RESET_LIMIT) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold !text-slate-600">Free gems earned (Resets at 1000)</p>
                </div>
                {showTaskQuest ? (
                  <div className="col-span-2 rounded-3xl border border-white/85 bg-white/90 p-4 shadow-xl backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black !text-slate-800">Active Task Quest (5 Habits)</p>
                      <button
                        type="button"
                        onClick={() => setShowTaskQuest(false)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black !text-slate-600"
                      >
                        Close
                      </button>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {activeTaskQuestItems.map((task) => (
                        <li key={task} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold !text-slate-700">
                          {task}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTaskQuestReward}
                        disabled={taskQuestClaimed}
                        className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                          taskQuestClaimed
                            ? 'cursor-not-allowed border border-slate-200 bg-slate-100 !text-slate-500'
                            : 'border border-emerald-200 bg-emerald-500 !text-white shadow hover:bg-emerald-600'
                        }`}
                      >
                        {taskQuestClaimed ? 'Reward Claimed ✅' : 'I completed all 5!'}
                      </button>
                      <span className="text-xs font-bold !text-slate-600">
                        +2 💎 reward and bell notification update
                      </span>
                    </div>
                  </div>
                ) : null}
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
              Explore our official channel and enjoy family-friendly adventures from AikoKidzTV.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-white/40 bg-white/15 p-5 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] !text-cyan-900/75">
                  Official Channel
                </p>
                <h3 className="mt-2 text-2xl font-black !text-white sm:text-3xl">
                  AikoKidzTV on YouTube
                </h3>
                <p className="mt-3 max-w-xl text-sm font-semibold !text-blue-50/95 sm:text-base">
                  New stories, playful learning, and kid-safe entertainment updates are published on our official channel.
                </p>
                <a
                  href="http://www.youtube.com/@AikoKidzTV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center rounded-2xl border border-red-200/80 bg-red-500 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-red-400/30 transition hover:-translate-y-0.5 hover:bg-red-600"
                >
                  ▶ Subscribe to our Channel
                </a>
              </div>
              <div className="rounded-2xl border border-white/35 bg-gradient-to-br from-red-500/30 via-fuchsia-500/20 to-cyan-500/30 p-5 text-center">
                <p className="text-5xl">📺✨</p>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] !text-white/85">
                  youtube.com/@AikoKidzTV
                </p>
                <p className="mt-2 text-sm font-semibold !text-blue-50/95">
                  Tap subscribe and join the official AikoKidzTV family.
                </p>
              </div>
            </div>
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








