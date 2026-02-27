import React from 'react';
import { motion } from 'framer-motion';

const characters = [
  { 
    name: 'AIKO', 
    role: 'Energetic Leader', 
    theme: 'border-yellow-400 bg-yellow-500/10 text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]', 
    gradient: 'from-yellow-400 to-orange-500',
    emoji: '🌟',
    letter: 'A'
  },
  { 
    name: 'NIKO', 
    role: 'The Calm Singer', 
    theme: 'border-red-500 bg-red-500/10 text-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]', 
    gradient: 'from-red-500 to-rose-600',
    emoji: '🎤',
    letter: 'N'
  },
  { 
    name: 'KINU', 
    role: 'The Smart Dancer', 
    theme: 'border-purple-500 bg-purple-500/10 text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]', 
    gradient: 'from-purple-500 to-indigo-600',
    emoji: '🕺',
    letter: 'K'
  },
  { 
    name: 'MIMI', 
    role: 'Creative Artist', 
    theme: 'border-pink-500 bg-pink-500/10 text-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]', 
    gradient: 'from-pink-500 to-rose-400',
    emoji: '🎨',
    letter: 'M'
  },
  { 
    name: 'CHIKO', 
    role: 'Tech Genius', 
    theme: 'border-blue-500 bg-blue-500/10 text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]', 
    gradient: 'from-blue-400 to-cyan-500',
    emoji: '💻',
    letter: 'C'
  },
  { 
    name: 'MIKO', 
    role: 'Nature Lover', 
    theme: 'border-green-500 bg-green-500/10 text-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]', 
    gradient: 'from-green-400 to-emerald-600',
    emoji: '🦋',
    letter: 'M'
  },
];

const CharacterGallery = () => {
  return (
    <div className="w-full mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Meet the <span className="text-accent">Stars</span></h2>
        <p className="text-gray-400">Choose your favorite character to start a story!</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char, index) => (
          <motion.div
            key={char.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className={`relative p-6 rounded-2xl border ${char.theme} backdrop-blur-md cursor-pointer transition-all duration-300 group`}
          >
            <div className="flex items-center gap-5 relative z-10">
              {/* Character Icon/Emoji */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-black/40 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                {char.emoji}
              </div>
              
              {/* Character Info */}
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${char.theme?.split(' ')[2] ?? ''}`}>{char.name}</h3>
                <p className="text-gray-300 text-sm font-medium tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
                  {char.role}
                </p>
              </div>
            </div>

            {/* Subtle Gradient Glow on Hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${char.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CharacterGallery;
