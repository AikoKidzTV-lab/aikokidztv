import React from 'react';
import { Gem } from 'lucide-react';
import { ECONOMY_TIER } from '../utils/economyTier';

const USD_TO_INR_RATE = 83;
const COMBO_BASE_PRICE_INR = 599;
const COMBO_BASE_PURPLE_GEMS = 230;
const COMBO_BASE_MULTI_COLOR_GEMS = 50;

const convertInrToUsd = (inrAmount) => Number((inrAmount / USD_TO_INR_RATE).toFixed(2));

const gemPacks = [
  {
    id: 'safari-pro',
    title: 'Safari Pro',
    gems: 219,
    mascot: '🐼',
    prices: { INR: 499, USD: convertInrToUsd(499) },
    useCaseDescription: 'Unlock Colors & Shapes (220 Purple Gems) and still have gems left for Stories.',
    accent: 'from-pink-300 via-rose-200 to-yellow-200',
    border: 'border-pink-300/90',
    glow: 'shadow-[0_18px_40px_rgba(244,114,182,0.32)]',
    featured: true,
    economyTier: ECONOMY_TIER.PACK_1,
  },
  {
    id: 'jungle-king',
    title: 'Jungle King',
    gems: 419,
    mascot: '🐦',
    prices: { INR: 899, USD: convertInrToUsd(899) },
    useCaseDescription: 'Unlock Animal Safari (270 Purple Gems) plus Colors & Shapes (220 Purple Gems).',
    accent: 'from-cyan-300 via-sky-200 to-blue-200',
    border: 'border-cyan-300/90',
    glow: 'shadow-[0_18px_40px_rgba(14,165,233,0.3)]',
    economyTier: ECONOMY_TIER.PACK_2,
  },
  {
    id: 'treasure-gems',
    title: 'Treasure Gems',
    gems: 1019,
    mascot: '🐠',
    prices: { INR: 1699, USD: convertInrToUsd(1699) },
    useCaseDescription: 'Unlock everything in the Learning Zone and power lots of Story Studio sessions.',
    accent: 'from-yellow-300 via-amber-200 to-fuchsia-200',
    border: 'border-amber-300/90',
    glow: 'shadow-[0_18px_40px_rgba(245,158,11,0.3)]',
    economyTier: ECONOMY_TIER.PACK_3,
  },
];

const VIP_PASS = {
  id: 'vip-pass',
  title: 'Semi-Monthly VIP Pass',
  gems: 920,
  rainbowGems: 100,
  prices: { INR: 4999, USD: convertInrToUsd(4999) },
  economyTier: ECONOMY_TIER.VIP,
};

const formatCurrency = (value, currency) =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(value);

export default function GemPacksPricing({ onPay, processingPlanId = '' }) {
  const [isINR, setIsINR] = React.useState(true);
  const activeCurrency = isINR ? 'INR' : 'USD';
  const comboStartingPrice = activeCurrency === 'USD'
    ? convertInrToUsd(COMBO_BASE_PRICE_INR)
    : COMBO_BASE_PRICE_INR;
  const isCheckoutBusy = Boolean(processingPlanId);

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
          Pick a Gem Card and Jump In
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm !text-slate-700 sm:text-base">
          Fast, cute, and easy to understand. Tap a card, pay securely with Razorpay, and receive Purple Gems{' '}
          <Gem size={16} className="mb-0.5 inline-block text-purple-500" /> after successful payment verification.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative min-w-0 overflow-hidden rounded-[2rem] border border-fuchsia-300/90 bg-[radial-gradient(circle_at_top_left,_rgba(250,232,255,0.95),_rgba(244,114,182,0.22)_38%,_rgba(168,85,247,0.28)_62%,_rgba(255,255,255,0.9)_100%)] p-4 shadow-[0_16px_38px_rgba(168,85,247,0.28)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_22px_48px_rgba(168,85,247,0.34)] sm:p-5">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-4 top-6 h-20 w-20 rounded-full bg-fuchsia-200/70 blur-2xl" />
            <div className="absolute right-2 top-4 h-16 w-16 rounded-full bg-cyan-200/60 blur-2xl" />
            <div className="absolute bottom-4 left-6 text-2xl opacity-80">💖</div>
            <div className="absolute right-6 top-6 text-2xl opacity-85">🌈</div>
            <div className="absolute bottom-5 right-8 text-xl opacity-80">✨</div>
            <div className="absolute left-1/2 top-12 text-xl opacity-75">💎</div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
              <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1 !text-fuchsia-800">
                Cute Combo
              </span>
              <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1 !text-sky-800">
                Purple + Multi-Color
              </span>
            </div>

            <div className="mt-4 flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/90 bg-white/85 text-3xl shadow-md">
                <span className="inline-flex items-center gap-1.5">
                  <Gem size={24} className="text-purple-500" />
                  <span>🌈</span>
                </span>
              </div>
              <p className="mt-4 text-lg font-black !text-slate-900">Combo pack for both gems</p>
              <p className="mt-1 text-sm font-semibold !text-slate-700">
                One adorable starter bundle filled with Purple Gems and Multi-Color Gems.
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] !text-fuchsia-800">
                Starting from just {formatCurrency(comboStartingPrice, activeCurrency)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/90 bg-white/80 p-3 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] !text-fuchsia-700">Purple Gems</p>
                <p className="mt-1 inline-flex items-center gap-1 text-lg font-black !text-slate-900">
                  {COMBO_BASE_PURPLE_GEMS} <Gem size={18} className="text-purple-500" />
                </p>
              </div>
              <div className="rounded-2xl border border-white/90 bg-white/80 p-3 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] !text-sky-700">Multi-Color Gems</p>
                <p className="mt-1 text-lg font-black !text-slate-900">{COMBO_BASE_MULTI_COLOR_GEMS} 🌈</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/90 bg-white/75 px-4 py-3 text-center shadow-sm">
              <p className="text-sm font-semibold !text-slate-700">
                Sweet, simple, and fixed. No confusing max cap shown, just the combo reward you asked for.
              </p>
            </div>

            <div className="mt-4">
              <button
                type="button"
                disabled={isCheckoutBusy}
                onClick={() =>
                  onPay?.({
                    id: 'combo-pack',
                    planName: 'Combo Pack',
                    amount: comboStartingPrice,
                    currency: activeCurrency,
                    economyTier: ECONOMY_TIER.STANDARD,
                    rewards: {
                      purpleGems: COMBO_BASE_PURPLE_GEMS,
                      rainbowGems: COMBO_BASE_MULTI_COLOR_GEMS,
                    },
                  })
                }
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-500 to-cyan-500 px-4 py-2.5 text-sm font-black !text-white shadow-[0_8px_20px_rgba(168,85,247,0.34)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processingPlanId === 'combo-pack' ? 'Opening Checkout...' : 'Buy Cute Combo'}
              </button>
            </div>
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
                {pack.gems} Purple Gems <Gem size={22} className="text-purple-500" />
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
                disabled={isCheckoutBusy}
                onClick={() =>
                  onPay?.({
                    id: pack.id,
                    planName: pack.title,
                    amount: pack.prices[activeCurrency],
                    currency: activeCurrency,
                    economyTier: pack.economyTier,
                    rewards: {
                      purpleGems: pack.gems,
                      rainbowGems: 0,
                    },
                  })
                }
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-black !text-white shadow-[0_8px_20px_rgba(14,165,233,0.35)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processingPlanId === pack.id ? 'Opening Checkout...' : 'Buy Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-white/55 bg-slate-900/30 px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] !text-sky-200">Limited Membership</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed !text-white sm:text-base">
              <span className="inline-flex flex-wrap items-center gap-1">
                <span>Semi-Monthly VIP Pass: 920 Purple Gems</span>
                <Gem size={14} className="text-purple-500" />
                <span>plus 100 Multi-Color Gems 🌈 in one premium plan.</span>
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xl font-black !text-amber-300">Price: {formatCurrency(VIP_PASS.prices[activeCurrency], activeCurrency)}</p>
            <button
              type="button"
              disabled={isCheckoutBusy}
              onClick={() =>
                onPay?.({
                  id: VIP_PASS.id,
                  planName: VIP_PASS.title,
                  amount: VIP_PASS.prices[activeCurrency],
                  currency: activeCurrency,
                  economyTier: VIP_PASS.economyTier,
                  rewards: {
                    purpleGems: VIP_PASS.gems,
                    rainbowGems: VIP_PASS.rainbowGems,
                  },
                })
              }
              className="rounded-xl border border-white/70 bg-white/70 px-4 py-2 text-sm font-black !text-slate-900 shadow-lg backdrop-blur-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {processingPlanId === VIP_PASS.id ? 'Opening Checkout...' : 'Buy VIP Pass'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
