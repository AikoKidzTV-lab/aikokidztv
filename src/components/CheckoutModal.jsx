import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { X, Check, Gem, Loader, Tag, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ECONOMY_TIER, persistEconomyTier } from '../utils/economyTier';
import { startRazorpayCheckout } from '../utils/razorpayCheckout';

const resolveTierFromPlanName = (planName) => {
  const normalized = String(planName || '').trim().toLowerCase();
  if (!normalized) return ECONOMY_TIER.STANDARD;
  if (normalized.includes('school') || normalized.includes('educator')) return ECONOMY_TIER.EDUCATOR;
  if (normalized.includes('vip')) return ECONOMY_TIER.VIP;
  if (normalized.includes('treasure') || normalized.includes('1699')) return ECONOMY_TIER.PACK_3;
  if (normalized.includes('jungle') || normalized.includes('899')) return ECONOMY_TIER.PACK_2;
  if (normalized.includes('safari') || normalized.includes('499')) return ECONOMY_TIER.PACK_1;
  return ECONOMY_TIER.STANDARD;
};

const CheckoutModal = ({ plan, isOpen, onClose }) => {
  const { user, fetchProfile, updateProfileBalances } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Return early if no plan is selected to prevent crash
  if (!plan) return null;

  // Extract numeric price safely (prices are USD)
  const priceString = plan.price || '$0';
  const basePrice = parseInt(String(priceString).replace('$', '')) || 0;
  const finalPrice = Math.max(0, basePrice - (basePrice * discount / 100));

  const currency = 'USD';

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (error || !data) {
        setError('Invalid coupon code');
        setDiscount(0);
        setAppliedCoupon(null);
      } else if (!data.is_active) {
        setError('This coupon has expired');
      } else if (basePrice < data.min_plan_price) {
        setError(`This coupon requires a minimum purchase of $${data.min_plan_price}`);
      } else {
        setDiscount(data.discount_percent);
        setAppliedCoupon(data.code);
        setError('');
      }
    } catch (err) {
      setError('Error verifying coupon');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const planName = plan.name || '';
      const purpleGems = Number.isFinite(Number(plan?.gems))
        ? Math.max(0, Math.floor(Number(plan.gems)))
        : 0;
      const rainbowGems = Number.isFinite(Number(
        plan?.rainbowGems ??
        plan?.rainbow_gems ??
        plan?.rewards?.rainbowGems ??
        plan?.rewards?.rainbow_gems
      ))
        ? Math.max(0, Math.floor(Number(
          plan?.rainbowGems ??
          plan?.rainbow_gems ??
          plan?.rewards?.rainbowGems ??
          plan?.rewards?.rainbow_gems
        )))
        : 0;

      const verification = await startRazorpayCheckout({
        user,
        plan: {
          id: String(plan?.id || planName || 'custom-plan')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-'),
          planName: planName || 'Unknown Plan',
          amount: finalPrice,
          currency,
          economyTier: plan?.economyTier || resolveTierFromPlanName(planName),
          rewards: {
            purpleGems,
            rainbowGems,
          },
        },
      });

      updateProfileBalances?.({
        gems: verification?.gems,
        rainbow_gems: verification?.rainbowGems,
        rainbowGems: verification?.rainbowGems,
      });

      persistEconomyTier(verification?.economyTier || plan?.economyTier || resolveTierFromPlanName(planName));
      setSuccess(true);
      void fetchProfile?.(user?.id);
      setTimeout(() => {
        window.location.reload(); // Refresh to update context/UI
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="inline-flex items-center gap-1 text-gray-400">
                Gems have been added to your account.
                <Gem size={14} className="text-purple-500" />
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gray-900/50">
                <h3 className="text-xl font-bold text-white">Checkout</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Plan Details */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                      <p className="inline-flex items-center gap-1 text-sm text-gray-400">
                        {plan.gems} Gems Included
                        <Gem size={14} className="text-purple-500" />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">${finalPrice.toFixed(2)}</p>
                      {discount > 0 && (
                        <p className="text-sm text-gray-400 line-through">${basePrice}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coupon Input */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Have a coupon?</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code (e.g. YOUTUBE25)"
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-accent uppercase"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={loading || !couponCode}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? <Loader className="animate-spin" size={16} /> : 'Apply'}
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                  {appliedCoupon && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      <Check size={12} /> Coupon '{appliedCoupon}' applied! ({discount}% OFF)
                    </p>
                  )}
                </div>

                {/* Total Summary */}
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Discount ({discount}%)</span>
                      <span>-${(basePrice * discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-white pt-2">
                    <span>Total</span>
                    <span>${finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-accent hover:bg-accent/90 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CreditCard size={20} /> Pay Now
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
