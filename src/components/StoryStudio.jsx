import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  AlertCircle,
  Download,
  FileText,
  Clock,
  Send,
  User,
  Trash2,
  Wifi,
  CheckCircle,
  XCircle,
  Gem,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useKidsMode } from '../context/KidsModeContext';
import { addUserGems, spendUserGems } from '../utils/gemWallet';

const GENERATION_COST_GEMS = 20;
const DAILY_SESSION_LIMIT = 2;
const STORY_STUDIO_DAILY_SESSIONS_STORAGE_KEY = 'aiko_story_studio_daily_sessions_v1';

const getTodayDateStamp = () => new Date().toISOString().slice(0, 10);

const readDailySessionState = () => {
  const today = getTodayDateStamp();
  if (typeof window === 'undefined') return { date: today, count: 0 };

  try {
    const raw = window.localStorage.getItem(STORY_STUDIO_DAILY_SESSIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const parsedCount = Number(parsed?.count);
    if (parsed?.date === today && Number.isFinite(parsedCount) && parsedCount >= 0) {
      return { date: today, count: Math.floor(parsedCount) };
    }
  } catch {
    // ignore malformed storage payloads
  }

  return { date: today, count: 0 };
};

const writeDailySessionState = (count) => {
  if (typeof window === 'undefined') return;

  const safeCount = Number.isFinite(Number(count)) ? Math.max(0, Math.floor(Number(count))) : 0;
  window.localStorage.setItem(
    STORY_STUDIO_DAILY_SESSIONS_STORAGE_KEY,
    JSON.stringify({ date: getTodayDateStamp(), count: safeCount })
  );
};

const characters = [
  { name: 'AIKO', role: 'Energetic Leader', emoji: '\u{1F31F}' },
  { name: 'NIKO', role: 'The Calm Singer', emoji: '\u{1F3A4}' },
  { name: 'KINU', role: 'The Smart Dancer', emoji: '\u{1F57A}' },
  { name: 'MIMI', role: 'Creative Artist', emoji: '\u{1F3A8}' },
  { name: 'CHIKO', role: 'Tech Genius', emoji: '\u{1F4BB}' },
  { name: 'MIKO', role: 'Nature Lover', emoji: '\u{1F98B}' },
];

const suggestions = [
  'Goes to Mars in a rocket',
  'Learns to bake a giant cookie',
  'Finds a hidden treasure map',
  'Becomes a superhero for a day',
  'Makes friends with a friendly dragon',
  'Writes a poem about a rainbow town',
  'Discovers a magical underwater city',
];

const bannedKeywords = [
  'violence',
  'blood',
  'kill',
  'death',
  'murder',
  'fight',
  'weapon',
  'gun',
  'knife',
  'attack',
  'hate',
  'stupid',
  'idiot',
  'adult',
  'sex',
  'nude',
  'naked',
];

const isPoemPrompt = (value) => /\bpoem(s)?\b/i.test(String(value || ''));

const buildGeminiPrompt = (topic) => {
  if (isPoemPrompt(topic)) {
    return `Write a creative poem for kids about: ${topic}. Keep it age-appropriate, imaginative, easy to read, and joyful. Use 8-12 short lines.`;
  }

  return `Write a 50-word story for kids about: ${topic}. Make it fun, educational, and age-appropriate.`;
};

const StoryStudio = () => {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const { triggerConfetti } = useKidsMode();

  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [apiStatus, setApiStatus] = useState('checking');
  const [sessionCount, setSessionCount] = useState(() => readDailySessionState().count);
  const [cooldownTime, setCooldownTime] = useState(0);

  const chatEndRef = useRef(null);
  const hasMountedChatRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    void checkApiConnectivity();
  }, []);

  useEffect(() => {
    if (!user?.id || !fetchProfile) return;
    void fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    if (authLoading) return;

    if (user?.id) {
      setError((current) =>
        /please log in to create magic|syncing your profile/i.test(current || '') ? '' : current
      );
      return;
    }

    setError((current) => (/syncing your profile/i.test(current || '') ? '' : current));
  }, [authLoading, user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncDailySessionState = () => {
      const nextState = readDailySessionState();
      setSessionCount(nextState.count);
    };

    syncDailySessionState();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', syncDailySessionState);
    }

    const interval = setInterval(syncDailySessionState, 60000);

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', syncDailySessionState);
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [cooldownTime]);

  useEffect(() => {
    if (!hasMountedChatRef.current) {
      hasMountedChatRef.current = true;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const checkApiConnectivity = async () => {
    setApiStatus('checking');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
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
    const foundBadWord = bannedKeywords.find((word) => text.toLowerCase().includes(word));
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
      setError('Please log in to create magic.');
      return;
    }

    let activeProfile = profile;
    if (!activeProfile && fetchProfile) {
      activeProfile = await fetchProfile(user.id);
    }

    if (!activeProfile) {
      setError('Syncing your profile. Please try again in a moment.');
      return;
    }

    if (!input.trim()) {
      setError('Please type a topic for your adventure!');
      return;
    }

    const currentDaySessionCount = readDailySessionState().count;
    if (currentDaySessionCount >= DAILY_SESSION_LIMIT) {
      setSessionCount(currentDaySessionCount);
      setError(`Daily limit reached (${DAILY_SESSION_LIMIT}/${DAILY_SESSION_LIMIT}). Please come back tomorrow.`);
      return;
    }

    const validation = validateInput(input);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    const currentGems = Number(activeProfile?.gems || 0);
    if (currentGems < GENERATION_COST_GEMS) {
      setError(`You need ${GENERATION_COST_GEMS} Gems to generate a story or poem.`);
      return;
    }

    let gemsDeducted = false;
    const userMsg = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    triggerConfetti();

    try {
      const spendResult = await spendUserGems({
        userId: user.id,
        amount: GENERATION_COST_GEMS,
      });

      if (!spendResult.ok) {
        if (spendResult.code === 'insufficient_gems') {
          setError(`You need ${GENERATION_COST_GEMS} Gems to generate a story or poem.`);
        } else {
          setError(spendResult.message || 'Gem deduction failed. Please try again.');
        }
        return;
      }

      gemsDeducted = true;
      await fetchProfile?.(user.id);

      await generateWithGemini(userMsg);

      const nextSessionCount = currentDaySessionCount + 1;
      writeDailySessionState(nextSessionCount);
      setSessionCount(nextSessionCount);
      setCooldownTime(0);
    } catch (err) {
      console.error('Generation Error:', err);
      if (gemsDeducted && user?.id) {
        try {
          await addUserGems({ userId: user.id, amount: GENERATION_COST_GEMS });
          await fetchProfile?.(user.id);
        } catch (refundError) {
          console.error('StoryStudio refund failed:', refundError);
        }
      }
      if (err?.code === 'QUOTA_TEXT') {
        setError('Free Gemini generation quota is exhausted. Please wait and try again.');
      } else {
        setError(`Failed to generate: ${err.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateWithGemini = async (userMsg) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    const generationType = isPoemPrompt(userMsg.content) ? 'poem' : 'story';
    const promptText = buildGeminiPrompt(userMsg.content);
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw { code: 'QUOTA_TEXT', message: 'Gemini text quota exceeded' };
      }
      const errorText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      throw new Error('No content received from Gemini API');
    }

    const aiMsg = {
      id: Date.now() + 1,
      role: 'ai',
      type: generationType,
      content: text,
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleDownload = (msg) => {
    try {
      const element = document.createElement('a');
      const file = new Blob([msg.content], { type: 'text/plain' });
      const contentType = msg.type === 'poem' ? 'Poem' : 'Story';
      element.href = URL.createObjectURL(file);
      element.download = `${selectedChar.name}_${contentType}_${msg.id}.txt`;
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
    setCooldownTime(0);
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
      <div className="bg-black/40 p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select
              value={selectedChar.name}
              onChange={(e) => setSelectedChar(characters.find((c) => c.name === e.target.value))}
              className="bg-gray-900/80 border border-white/20 rounded-xl px-4 py-2 pl-10 text-white appearance-none focus:border-accent outline-none cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {characters.map((char) => (
                <option key={char.name} value={char.name}>
                  {char.name} - {char.role}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">{selectedChar.emoji}</div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent">
            <FileText size={16} />
            <span>Story / Poem ({GENERATION_COST_GEMS} Gems)</span>
            <Gem size={14} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900/50 px-3 py-2 text-sm text-gray-300">
            {getStatusIcon()}
            <span>{apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Checking API...'}</span>
          </div>

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

      <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
            <div className="text-6xl mb-4 grayscale opacity-50">{selectedChar.emoji}</div>
            <p className="text-lg font-light">Start your adventure with {selectedChar.name}!</p>
            <p className="text-sm mt-2">Type a fun topic below to create a story or poem.</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-lg ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'}`}
            >
              {msg.role === 'user' ? <User size={20} className="text-gray-300" /> : <span className="text-xl">{selectedChar.emoji}</span>}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-none'
                  : 'bg-gray-800/60 border border-white/10 text-gray-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

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
              <span className="text-sm animate-pulse">Generating your {isPoemPrompt(input) ? 'poem' : 'story'}...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-black/40 border-t border-white/10">
        {error && (
          <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200 text-xs">
            <AlertCircle size={16} /> {error}
            {apiStatus === 'offline' && (
              <button onClick={checkApiConnectivity} className="ml-2 text-xs underline">
                Retry Connection
              </button>
            )}
          </div>
        )}

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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={`Write a story or poem about ${selectedChar.name}...`}
              className="w-full bg-gray-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none h-[60px] custom-scrollbar"
              disabled={loading || cooldownTime > 0 || apiStatus === 'offline'}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-500">{input.length}/500</div>
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

        <p className="mt-2 rounded-xl border border-cyan-200/20 bg-cyan-400/5 px-3 py-2 text-[11px] font-semibold tracking-wide text-slate-800">
          Create stories and poems by your own idea!
        </p>

        <div className="flex justify-between items-center mt-2 text-xs">
          <span className="sr-only">Powered by Gemini (2.5 Flash) for story and poem generation</span>
          <div className="flex gap-4 text-gray-400">
            <span>Sessions: {sessionCount}/{DAILY_SESSION_LIMIT}</span>
            {cooldownTime > 0 && <span>Cooldown: {cooldownTime}s</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryStudio;
