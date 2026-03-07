import React from 'react';
import { Gem } from 'lucide-react';

const USD_TO_INR_RATE = 83;

const calculateDonationGems = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
  return Math.ceil(numericAmount * 1.08);
};

const convertInrToUsd = (inrAmount) => Number((inrAmount / USD_TO_INR_RATE).toFixed(2));
const convertUsdToInr = (usdAmount) => Number(usdAmount) * USD_TO_INR_RATE;

const gemPacks = [
  {
    id: 'safari-pro',
    title: 'Safari Pro',
    gems: 219,
    mascot: '\u{1F43C}',
    prices: { INR: 499, USD: convertInrToUsd(499) },
    useCaseDescription: 'Unlock Colors & Shapes (120 Gems) and have gems left for Stories!',
    accent: 'from-pink-300 via-rose-200 to-yellow-200',
    border: 'border-pink-300/90',
    glow: 'shadow-[0_18px_40px_rgba(244,114,182,0.32)]',
    featured: true,
  },
  {
    id: 'jungle-king',
    title: 'Jungle King',
    gems: 419,
    mascot: '\u{1F426}',
    prices: { INR: 899, USD: convertInrToUsd(899) },
    useCaseDescription: 'Unlock Animal Safari (150 Gems) + Colors & Shapes (120 Gems)!',
    accent: 'from-cyan-300 via-sky-200 to-blue-200',
    border: 'border-cyan-300/90',
    glow: 'shadow-[0_18px_40px_rgba(14,165,233,0.3)]',
  },
  {
    id: 'treasure-gems',
    title: 'Treasure Gems',
    gems: 1019,
    mascot: '\u{1F420}',
    prices: { INR: 1699, USD: convertInrToUsd(1699) },
    useCaseDescription: 'Unlock everything in the Learning Zone + massive Story Studio sessions!',
    accent: 'from-yellow-300 via-amber-200 to-fuchsia-200',
    border: 'border-amber-300/90',
    glow: 'shadow-[0_18px_40px_rgba(245,158,11,0.3)]',
  },
];

const SUPPORT_LIMITS = {
  INR: { min: 250, max: 100000, step: 1 },
  USD: { min: 3, max: 1200, step: 0.01 },
};

const VIP_PASS = {
  title: 'Semi-Monthly VIP Pass',
  gems: 920,
  prices: { INR: 4999, USD: convertInrToUsd(4999) },
};

const formatCurrency = (value, currency) =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(value);

export default function GemPacksPricing({ onPay }) {
  const [isINR, setIsINR] = React.useState(true);
  const [customSupportAmount, setCustomSupportAmount] = React.useState(String(SUPPORT_LIMITS.INR.min));
  const activeCurrency = isINR ? 'INR' : 'USD';
  const supportLimits = SUPPORT_LIMITS[activeCurrency];
  const parsedSupportAmount = Number(customSupportAmount);
  const displaySupportAmount = Number.isFinite(parsedSupportAmount) ? Math.max(0, parsedSupportAmount) : 0;
  const normalizedSupportAmount = Number.isFinite(parsedSupportAmount)
    ? Math.min(supportLimits.max, Math.max(supportLimits.min, parsedSupportAmount))
    : supportLimits.min;
  const supportAmountInInr = activeCurrency === 'USD'
    ? convertUsdToInr(displaySupportAmount)
    : displaySupportAmount;
  const donationGemReward = calculateDonationGems(supportAmountInInr);

  React.useEffect(() => {
    setCustomSupportAmount(String(SUPPORT_LIMITS[activeCurrency].min));
  }, [activeCurrency]);

  return (
    <>
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => setIsINR(false)}
            className={`rounded-full px-3 py-1 text-xs font-black transition ${
              !isINR ? 'bg-slate-900 !text-white' : '!text-slate-600 hover:bg-white/80'
            }`}
          >
            USD $
          </button>
          <button
            type="button"
            aria-label="Toggle currency"
            aria-pressed={isINR}
            onClick={() => setIsINR((prev) => !prev)}
            className={`relative h-6 w-12 rounded-full transition ${
              isINR ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isINR ? 'translate-x-6' : ''
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsINR(true)}
            className={`rounded-full px-3 py-1 text-xs font-black transition ${
              isINR ? 'bg-slate-900 !text-white' : '!text-slate-600 hover:bg-white/80'
            }`}
          >
            INR ₹
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.25em] !text-emerald-800">The Land • Gem Packs</p>
        <h2 className="mt-3 text-3xl font-black !text-slate-900 sm:text-4xl">
          Pick a Gem Pack and Jump In
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm !text-slate-700 sm:text-base">
          Fast, fun, and automated-friendly. Tap a pack, unlock Gems <Gem size={16} className="mb-0.5 inline-block text-purple-500" /> instantly, and start
          playing without manual waiting.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-rose-300/90 bg-gradient-to-br from-pink-200 via-rose-100 to-yellow-100 p-4 shadow-[0_12px_30px_rgba(244,63,94,0.24)] transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_42px_rgba(244,63,94,0.34)] sm:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-2 text-xs opacity-85">
            <span>🌸</span>
            <span>🐼</span>
          </div>

          <div className="mt-3 flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/90 bg-white/80 text-3xl shadow-md">
              ☕
            </div>
            <p className="mt-3 text-base font-black !text-slate-900">For Schools & Educators</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] !text-rose-700">Custom Support</p>
          </div>

          <div className="mt-3 rounded-xl border border-white/90 bg-white/80 p-3 shadow-sm">
            <label className="block text-left text-[11px] font-black uppercase tracking-widest !text-slate-600">
              Custom Amount
            </label>
            <input
              type="number"
              min={supportLimits.min}
              max={supportLimits.max}
              step={supportLimits.step}
              value={customSupportAmount}
              onChange={(event) => setCustomSupportAmount(event.target.value)}
              className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-base font-black !text-slate-900 outline-none transition focus:border-rose-400"
            />
            <p className="mt-2 text-[11px] font-bold !text-slate-600">
              Min: {formatCurrency(supportLimits.min, activeCurrency)} / Max: {formatCurrency(supportLimits.max, activeCurrency)}
            </p>
            <p className="mt-1 text-[11px] font-semibold !text-rose-700">
              Gem rewards are calculated dynamically based on your support! ❤️
            </p>
            <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] !text-rose-500">Estimated Reward</p>
              <p className="mt-1 inline-flex items-center gap-1 text-lg font-black !text-slate-900">
                {donationGemReward} Gems <Gem size={18} className="text-purple-500" />
              </p>
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() =>
                onPay?.('For Schools & Educators', normalizedSupportAmount, donationGemReward, activeCurrency)
              }
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-black !text-white shadow-[0_8px_20px_rgba(244,63,94,0.35)] transition-all hover:brightness-105"
            >
              Buy Now
            </button>
          </div>
        </div>

        {gemPacks.map((pack) => (
          <div
            key={pack.id}
            className={[
              'group relative min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-105 hover:shadow-2xl sm:p-5',
              pack.accent,
              pack.border,
              pack.glow,
              pack.featured ? 'ring-2 ring-rose-300/70' : '',
            ].join(' ')}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-2 text-xs opacity-85">
              <span>🐦</span>
              <span>🐠</span>
            </div>

            <div className="mt-3 flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/85 bg-white/80 text-3xl shadow-md">
                {pack.mascot}
              </div>
              <p className="mt-3 text-base font-black !text-slate-900">{pack.title}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] !text-slate-700">🌸 Shiny Pack</p>
            </div>

            <div className="mt-3 rounded-xl border border-white/85 bg-white/80 p-3 text-center shadow-sm">
              <p className="inline-flex items-center gap-1 text-2xl font-black !text-slate-900">
                {pack.gems} Gems <Gem size={22} className="text-purple-500" />
              </p>
              <p className="mt-1.5 text-xl font-black !text-slate-900">
                {formatCurrency(pack.prices[activeCurrency], activeCurrency)}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-600">
                {pack.useCaseDescription}
              </p>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => onPay?.(pack.title, pack.prices[activeCurrency], pack.gems, activeCurrency)}
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-black !text-white shadow-[0_8px_20px_rgba(14,165,233,0.35)] transition-all hover:brightness-105"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-white/90 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 py-4 shadow-xl sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] !text-sky-200">Limited Membership</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed !text-white sm:text-base">
              Semi-Monthly VIP Pass: Get 200 Gems every month for 4 months + 120 Instant Bonus Gems! ✨
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xl font-black !text-amber-300">Price: {formatCurrency(VIP_PASS.prices[activeCurrency], activeCurrency)}</p>
            <button
              type="button"
              onClick={() => onPay?.(VIP_PASS.title, VIP_PASS.prices[activeCurrency], VIP_PASS.gems, activeCurrency)}
              className="rounded-xl bg-white px-4 py-2 text-sm font-black !text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Claim VIP Pass
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
