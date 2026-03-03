import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gem, AlertCircle, Download, FileText, Clock, Send, User, Trash2, Wifi, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useKidsMode } from '../context/KidsModeContext';
import { STORY_COST_GEMS } from '../constants/gemEconomy';
const COSTS = {
  story: STORY_COST_GEMS
};

const characters = [
  { name: 'AIKO', role: 'Energetic Leader', emoji: '🌟' },
  { name: 'NIKO', role: 'The Calm Singer', emoji: '🎤' },
  { name: 'KINU', role: 'The Smart Dancer', emoji: '🕺' },
  { name: 'MIMI', role: 'Creative Artist', emoji: '🎨' },
  { name: 'CHIKO', role: 'Tech Genius', emoji: '💻' },
  { name: 'MIKO', role: 'Nature Lover', emoji: '🦋' },
];

const suggestions = [
  "Goes to Mars in a rocket",
  "Learns to bake a giant cookie",
  "Finds a hidden treasure map",
  "Becomes a superhero for a day",
  "Makes friends with a friendly dragon",
  "Builds a robot that cleans rooms",
  "Discovers a magical underwater city"
];

const bannedKeywords = ['violence', 'blood', 'kill', 'death', 'murder', 'fight', 'weapon', 'gun', 'knife', 'attack', 'hate', 'stupid', 'idiot', 'adult', 'sex', 'nude', 'naked'];

const StoryStudio = () => {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const { triggerConfetti } = useKidsMode();
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // Array of { id, role, type, content }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  
  // Cooldown & Session Tracking
  const [sessionCount, setSessionCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check API connectivity on mount
  useEffect(() => {
    checkApiConnectivity();
  }, []);

  useEffect(() => {
    if (!user?.id || !fetchProfile) return;
    if (profile?.id === user.id && Number.isFinite(Number(profile?.gems))) return;
    void fetchProfile(user.id, { retryCount: 2, preferDirect: true });
  }, [user?.id, profile?.id, profile?.gems, fetchProfile]);

  useEffect(() => {
    if (authLoading) return;
    if (user?.id) {
      setError((current) =>
        /please log in to create magic|syncing your profile/i.test(current || '') ? '' : current
      );
      return;
    }

    setError((current) =>
      /syncing your profile/i.test(current || '') ? '' : current
    );
  }, [authLoading, user?.id, profile?.id, profile?.gems]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    } else if (cooldownTime === 0 && sessionCount > 0) {
      // Reset session count when cooldown ends
      setSessionCount(0);
    }
    return () => clearInterval(timer);
  }, [cooldownTime, sessionCount]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on character change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedChar]);

  const checkApiConnectivity = async () => {
    setApiStatus('checking');
    try {
      // Test Gemini API key availability
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      // Test basic connectivity
      const testResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
      if (!testResponse.ok) {
        throw new Error(`API connectivity issue: ${testResponse.status}`);
      }
      
      setApiStatus('online');
    } catch (err) {
      console.error('API Connectivity Check Failed:', err);
      setApiStatus('offline');
      setError('API connection issue detected. Please check your internet connection.');
    }
  };

  const validateInput = (text) => {
    const foundBadWord = bannedKeywords.find(word => text.toLowerCase().includes(word));
    if (foundBadWord) {
      return { valid: false, reason: `Inappropriate content detected: "${foundBadWord}"` };
    }
    if (text.trim().length < 3) {
      return { valid: false, reason: 'Input too short. Please enter at least 3 characters.' };
    }
    if (text.trim().length > 500) {
      return { valid: false, reason: 'Input too long. Please keep it under 500 characters.' };
    }
    return { valid: true };
  };

  const handleSend = async () => {
    setError('');
    
    if (authLoading) {
      setError('Checking your login session. Please try again in a moment.');
      return;
    }

    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before sending another request.`);
      return;
    }

    if (!user?.id) {
      setError("Please log in to create magic.");
      return;
    }

    let activeProfile = profile;
    if (!activeProfile && fetchProfile) {
      activeProfile = await fetchProfile(user.id, { retryCount: 2, preferDirect: true });
    }
    if (!activeProfile) {
      setError("Syncing your profile. Please try again in a moment.");
      return;
    }

    if (!input.trim()) {
      setError("Please type a topic for your adventure!");
      return;
    }

    const validation = validateInput(input);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    const cost = COSTS.story;
    const currentGems = Number(activeProfile.gems ?? 0);

    if (currentGems < cost) {
      await Swal.fire({
        title: 'Oh No! Magic Power Empty! 🪫',
        text: 'You need more gems to create more stories. Want to recharge?',
        icon: 'warning',
        confirmButtonText: 'Go to Shop',
        confirmButtonColor: '#22c55e',
        background: '#0f172a',
        color: '#e2e8f0',
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl px-5 py-2 text-sm'
        }
      });
      document.getElementById('ai-studio')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: input
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    triggerConfetti();

    try {
      await generateStory(userMsg, cost, currentGems);

      // Reset session count on successful generation
      setSessionCount(0);
      setCooldownTime(0);

    } catch (err) {
      console.error('Generation Error:', err);
      if (err?.code === 'QUOTA_TEXT') {
        setError('Free Gemini story quota is exhausted. Please wait and try again.');
      } else {
        setError(`Failed to generate: ${err.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateStory = async (userMsg, cost, currentGems) => {
    try {
      // Verify API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      // Use current Gemini text model (Gemini 2.5 Flash is fast & available for API keys)
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      console.log('Gemini API Request:', {
        url: API_URL,
        prompt: userMsg.content,
        apiKey: apiKey ? 'API_KEY_PRESENT' : 'API_KEY_MISSING'
      });
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a 50-word story for kids about: ${userMsg.content}. Make it fun, educational, and age-appropriate.`
            }]
          }]
        })
      });

      console.log('Gemini API Response Status:', response.status);
      console.log('Gemini API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 429) {
          throw { code: 'QUOTA_TEXT', message: 'Gemini text quota exceeded' };
        }
        const errorText = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response Data:', data);
      
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        throw new Error('No story content received from Gemini API');
      }
      
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'story',
        content: text
      };
      setMessages(prev => [...prev, aiMsg]);

      // Update gems in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gems: currentGems - cost })
        .eq('id', user.id);

      if (updateError) throw updateError;
      if (fetchProfile) await fetchProfile(user.id, { retryCount: 2, preferDirect: true });

    } catch (err) {
      console.error('Story Generation Error:', err);
      throw err;
    }
  };

  const handleDownload = (msg) => {
    try {
      const element = document.createElement("a");
      const file = new Blob([msg.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedChar.name}_Story_${msg.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Download Error:', err);
      setError('Failed to download. Please try again.');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError('');
    setSessionCount(0);
    setCooldownTime(0);
  };

  const handleRetry = () => {
    setError('');
    handleSend();
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'online':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'offline':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Wifi size={16} className="text-yellow-400 animate-pulse" />;
    }
  };

  const visibleGems = user?.id
    ? profile?.id === user.id && Number.isFinite(Number(profile?.gems))
      ? Number(profile.gems)
      : null
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto h-[85vh] flex flex-col bg-secondary/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm mb-10 kid-card">
      
      {/* Header */}
      <div className="bg-black/40 p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
           {/* Character Selector */}
           <div className="relative group">
              <select 
                value={selectedChar.name}
                onChange={(e) => setSelectedChar(characters.find(c => c.name === e.target.value))}
                className="bg-gray-900/80 border border-white/20 rounded-xl px-4 py-2 pl-10 text-white appearance-none focus:border-accent outline-none cursor-pointer hover:bg-gray-800 transition-colors"
              >
                {characters.map(char => (
                  <option key={char.name} value={char.name}>{char.name} — {char.role}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                {selectedChar.emoji}
              </div>
           </div>

           <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent">
             <FileText size={16} />
             <span>Story ({COSTS.story} Gems)</span>
             <Gem size={14} />
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* API Status */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900/50 px-3 py-2 text-sm text-gray-300">
            {getStatusIcon()}
            <span>{apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Checking API...'}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleClearChat} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Clear Chat">
              <Trash2 size={20} />
            </button>
            <button onClick={checkApiConnectivity} className="p-2 text-gray-500 hover:text-green-400 transition-colors" title="Check Connection">
              {apiStatus === 'checking' ? <Wifi size={20} className="animate-spin" /> : <Wifi size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
             <div className="text-6xl mb-4 grayscale opacity-50">{selectedChar.emoji}</div>
             <p className="text-lg font-light">Start your adventure with {selectedChar.name}!</p>
             <p className="text-sm mt-2">Type a fun topic below to create a story.</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-lg ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'}`}>
               {msg.role === 'user' ? <User size={20} className="text-gray-300" /> : <span className="text-xl">{selectedChar.emoji}</span>}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
              msg.role === 'user' 
                ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-none' 
                : 'bg-gray-800/60 border border-white/10 text-gray-200 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              
              {/* Message Actions */}
              {msg.role === 'ai' && (
                <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-2">
                   <button 
                     onClick={() => handleDownload(msg)}
                     className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                   >
                     <Download size={14} /> Download
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 border border-white/10">
               <span className="text-xl">{selectedChar.emoji}</span>
            </div>
            <div className="bg-gray-800/60 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-gray-400">
               <Sparkles size={18} className="animate-spin" />
               <span className="text-sm animate-pulse">Generating your story...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/10">
         {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200 text-xs">
              <AlertCircle size={16} /> {error}
              {apiStatus === 'offline' && (
                <button onClick={checkApiConnectivity} className="ml-2 text-xs underline">Retry Connection</button>
              )}
            </div>
         )}

         {/* Suggestions Chips */}
         <div className="mb-3 flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            <button 
               onClick={() => setInput(`${selectedChar.name} ${suggestions[suggestionIndex]}`)}
               className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-300 flex items-center gap-2 transition-colors"
            >
               <Sparkles size={12} className="text-yellow-400" />
               Try: "{selectedChar.name} {suggestions[suggestionIndex]}"
            </button>
         </div>

         <div className="flex gap-3">
            <div className="relative flex-grow">
               <textarea 
                 ref={inputRef}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                   }
                 }}
                 placeholder={`Write a story about ${selectedChar.name}...`}
                 className="w-full bg-gray-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none h-[60px] custom-scrollbar"
                 disabled={loading || cooldownTime > 0 || apiStatus === 'offline'}
               />
               <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                 {input.length}/500
               </div>
            </div>
            <button 
              onClick={handleSend}
              disabled={loading || cooldownTime > 0 || apiStatus === 'offline'}
              className={`px-6 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 ${
                loading || cooldownTime > 0 || apiStatus === 'offline'
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-accent text-black hover:bg-accent/80 active:scale-95'
              }`}
            >
              {cooldownTime > 0 ? (
                <div className="flex flex-col items-center">
                  <Clock size={20} />
                  <span className="text-xs">{cooldownTime}s</span>
                </div>
              ) : loading ? (
                <Sparkles size={24} className="animate-spin" />
              ) : (
                <Send size={24} />
              )}
            </button>
         </div>
         
         <div className="flex justify-between items-center mt-2 text-xs">
            <span className="sr-only">
               Powered by Gemini (free tier): 2.5 Flash for stories
            </span>
            <div className="flex gap-4 text-gray-400">
               <span>Gems: {visibleGems ?? 'syncing...'}</span>
               <span>Sessions: {sessionCount}/5</span>
               {cooldownTime > 0 && <span>Cooldown: {cooldownTime}s</span>}
            </div>
         </div>
      </div>

    </div>
  );
};

export default StoryStudio;
