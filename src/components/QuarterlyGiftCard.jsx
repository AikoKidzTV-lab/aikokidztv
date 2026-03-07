import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Gem, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const QuarterlyGiftCard = () => {
  const { user, profile, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    if (profile) {
      checkEligibility();
    }
  }, [profile]);

  const checkEligibility = () => {
    const lastClaim = profile?.last_free_claim_date;
    
    if (!lastClaim) {
      setIsEligible(true);
      setDaysRemaining(0);
      return;
    }

    const lastClaimDate = new Date(lastClaim);
    const now = new Date();
    
    // Calculate 3 months (90 days) later
    const nextClaimDate = new Date(lastClaimDate);
    nextClaimDate.setDate(lastClaimDate.getDate() + 90);
    
    if (now >= nextClaimDate) {
      setIsEligible(true);
      setDaysRemaining(0);
    } else {
      setIsEligible(false);
      const diffTime = Math.abs(nextClaimDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setDaysRemaining(diffDays);
    }
  };

  const handleClaim = async () => {
    if (!user || !isEligible) return;

    setLoading(true);
    try {
      const currentGems = profile?.gems || 0;
      const newGems = currentGems + 50;
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          gems: newGems,
          last_free_claim_date: now
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update the local state immediately to reflect the claim
      setIsEligible(false);
      setDaysRemaining(90);

      await fetchProfile(user.id);
      
    } catch (error) {
      console.error('Error claiming gift:', error);
      alert('Failed to claim gift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-6 rounded-2xl border flex flex-col h-full bg-gradient-to-b from-purple-500/20 to-transparent border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
        <Gift size={12} /> Special Offer
      </div>

      <div className="text-center mb-6">
        <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Quarterly Free Gift</h4>
        <div className="text-4xl font-bold text-white mb-2 flex justify-center items-center gap-2">
           <Gift size={32} className="text-purple-400" />
           <span>50</span>
        </div>
        <div className="text-purple-400 font-medium flex justify-center items-center gap-1">
          <Gem size={16} className="text-purple-500" /> Free Gems
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center text-center space-y-4 mb-6">
        <p className="text-gray-300 text-sm">
          A special thank you for being part of our family! Claim your free gems every 3 months.
        </p>
        
        {!isEligible && (
          <div className="bg-white/5 rounded-lg p-3 w-full flex items-center justify-center gap-2 text-yellow-400 text-sm border border-white/10">
            <Clock size={16} />
            <span>Next gift in {daysRemaining} days</span>
          </div>
        )}
      </div>

      <button
        onClick={handleClaim}
        disabled={!isEligible || loading}
        className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
          isEligible && !loading
            ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1'
            : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
        }`}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : isEligible ? (
          <>Claim Now <Gift size={18} /></>
        ) : (
          <>Claimed <CheckCircle size={18} /></>
        )}
      </button>
    </motion.div>
  );
};

export default QuarterlyGiftCard;
