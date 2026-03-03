import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { claimRewardOnce } from '../utils/profileEconomy';

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
  const { user, fetchProfile } = useAuth();
  const [rewardStatus, setRewardStatus] = React.useState('');
  const [claimingKey, setClaimingKey] = React.useState('');

  const bioCards = [
    {
      key: 'aiko',
      title: 'Aiko Bio',
      body: 'Aiko is curious, brave, and always ready to help friends discover new ideas.',
      emoji: '🌟',
    },
    {
      key: 'niko',
      title: 'Niko Bio',
      body: 'Niko loves calm songs, kind words, and turns every story into a cozy adventure.',
      emoji: '🎤',
    },
  ];

  const handleClaimBioReward = async (bioKey) => {
    if (!user?.id) {
      setRewardStatus('Log in first to claim this hidden reward.');
      return;
    }
    if (claimingKey) return;

    setClaimingKey(bioKey);
    try {
      const result = await claimRewardOnce({
        userId: user.id,
        rewardKey: `bio_easter_${bioKey}_5`,
        gemReward: 5,
      });

      if (!result.ok) {
        setRewardStatus(result.message || 'Could not claim reward.');
        return;
      }

      await fetchProfile?.(user.id);
      setRewardStatus(result.alreadyClaimed ? 'Easter reward already claimed.' : 'Easter egg found! +5 gems added.');
    } catch (error) {
      setRewardStatus(error?.message || 'Could not claim reward.');
    } finally {
      setClaimingKey('');
    }
  };

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

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {bioCards.map((bio) => (
          <div
            key={bio.key}
            className="group relative rounded-2xl border border-white/15 bg-black/25 p-5 transition hover:border-white/30"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">{bio.title}</p>
            <p className="mt-2 text-sm font-semibold text-gray-200">{bio.body}</p>
            <p className="mt-2 text-2xl">{bio.emoji}</p>
            <button
              type="button"
              onClick={() => void handleClaimBioReward(bio.key)}
              disabled={claimingKey === bio.key}
              className="absolute bottom-4 right-4 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 opacity-0 transition group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"
            >
              {claimingKey === bio.key ? 'Claiming...' : 'Claim 5 Free Gems'}
            </button>
          </div>
        ))}
      </div>

      {rewardStatus && (
        <p className="mt-4 text-center text-sm font-bold text-emerald-300">{rewardStatus}</p>
      )}
    </div>
  );
};

export default CharacterGallery;
