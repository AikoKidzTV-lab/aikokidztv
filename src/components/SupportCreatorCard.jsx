import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Cake, Rocket, Heart } from 'lucide-react';

const SupportCreatorCard = () => {
  const [amount, setAmount] = useState(5);

  const getTierInfo = (val) => {
    if (val >= 50) return { icon: Rocket, color: 'text-pink-500' };
    if (val >= 10) return { icon: Cake, color: 'text-purple-400' };
    return { icon: Coffee, color: 'text-orange-400' };
  };

  const { icon: Icon, color } = getTierInfo(amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-6 rounded-2xl border flex flex-col h-full bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)]"
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
        <Heart size={12} fill="white" /> Support
      </div>

      <div className="text-center mb-6">
        <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-2">☕ Support the Creator</h4>
        <div className="text-4xl font-bold text-white mb-2 flex justify-center items-center gap-2">
           <Icon size={32} className={color} />
           <span>${amount}</span>
        </div>
        <div className="sr-only">Support tier</div>
      </div>

      <div className="flex-grow flex flex-col justify-center space-y-6 mb-6">
        <div className="px-2">
          <input 
            type="range" 
            min="3" 
            max="100" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>$3</span>
            <span>$100</span>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm text-center italic">
          "Your support helps keep the magic alive for everyone!"
        </p>
      </div>

      <button
        onClick={() => alert(`Thank you for supporting with $${amount}! (Payment Integration Coming Soon)`)}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
      >
        Support with ${amount} <Heart size={18} />
      </button>
    </motion.div>
  );
};

export default SupportCreatorCard;
