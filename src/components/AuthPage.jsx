import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader, KeyRound, Shield } from 'lucide-react';
import { getAuthRedirectUrl, supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const AUTH_REQUEST_TIMEOUT_MS = 15000;

const strengthLevels = [
  { label: 'Very Weak', color: '#ef4444', width: '20%' },
  { label: 'Weak', color: '#f97316', width: '40%' },
  { label: 'Okay', color: '#f59e0b', width: '60%' },
  { label: 'Strong', color: '#22c55e', width: '80%' },
  { label: 'Very Strong', color: '#16a34a', width: '100%' },
];

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return strengthLevels[Math.min(Math.max(score, 1) - 1, strengthLevels.length - 1)];
};

const getAuthErrorMessage = (error, fallback) => {
  const message = error?.message || fallback;
  if (/failed to fetch|timed out|network/i.test(message)) {
    return `Network error: ${message}. Please check your internet connection and try again.`;
  }
  return message;
};

const withAuthRequestTimeout = (promise, label) => {
  let timerId;

  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(`${label} timed out. Please try again.`));
    }, AUTH_REQUEST_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timerId);
  });
};

const AuthPage = ({ onLoginSuccess, initialMode = 'login' }) => {
  const { fetchProfile } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'reset'
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'newPassword'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const inputsRef = useRef([]);

  const strength = getStrength(newPassword);

  useEffect(() => {
    setMode(initialMode);
    setStep('email');
    setOtpDigits(Array(6).fill(''));
    setNewPassword('');
    setError(null);
    setInfo(null);
  }, [initialMode]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error: otpError } = await withAuthRequestTimeout(
        supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: mode !== 'reset', // allow creation for login/signup, block for reset flow
            emailRedirectTo: getAuthRedirectUrl('/'),
          },
        }),
        'Send OTP request',
      );

      if (otpError) throw otpError;
      setStep('otp');
      setInfo('OTP sent! Check your email for the 6-digit code.');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to send OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const tryVerifyOtp = async (code) => {
    const attemptOrder =
      mode === 'reset' ? ['recovery', 'magiclink', 'email'] : ['magiclink', 'email', 'signup'];
    let lastError = null;
    for (const type of attemptOrder) {
      try {
        const response = await withAuthRequestTimeout(
          supabase.auth.verifyOtp({
            email,
            token: code,
            type,
          }),
          'OTP verification request',
        );
        const { data, error: verifyError } = response;
        if (!verifyError) {
          return data;
        }
        lastError = verifyError;
      } catch (networkError) {
        throw new Error(getAuthErrorMessage(networkError, 'OTP verification failed.'));
      }
    }
    throw lastError || new Error('Invalid OTP');
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const authData = await tryVerifyOtp(code);
      if (mode === 'reset') {
        setStep('newPassword');
        setInfo('Verified! Set a new password below.');
      } else {
        const userId = authData?.user?.id ?? authData?.session?.user?.id ?? null;
        
        if (userId) {
          // Check for existing profile or create basic one
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', userId)
              .maybeSingle();

            if (!profile) {
              await supabase.from('profiles').insert({
                id: userId,
                gems: 700,
                rainbow_gems: 500,
              });
            }
          } catch (profileErr) {
            console.warn('[AuthPage] Profile check failed:', profileErr);
          }
        }

        setInfo('Logged in successfully!');
        if (userId) {
          await fetchProfile?.(userId);
        }
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, 'OTP verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Please enter a new password (min 6 characters).');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error: updateError } = await withAuthRequestTimeout(
        supabase.auth.updateUser({ password: newPassword }),
        'Update password request',
      );
      if (updateError) throw updateError;
      setInfo('Password updated! You are now signed in.');
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;
      if (userId) {
        await fetchProfile?.(userId);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to update password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').slice(0, 6);
    if (!/^[0-9]+$/.test(text)) return;
    const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtpDigits(next);
    const lastIndex = Math.min(text.length, 6) - 1;
    inputsRef.current[lastIndex]?.focus();
  };

  const renderEmailStep = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSendOtp();
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent transition-colors kid-3d"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="kid-3d w-full bg-accent text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="animate-spin" size={20} /> : <ArrowRight size={20} />}
        Send OTP
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-300">Enter the 6-digit code sent to {email}</p>
      <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
        {otpDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            maxLength={1}
            inputMode="numeric"
            className="kid-3d w-12 h-14 text-center text-2xl font-bold bg-black/30 border border-white/15 rounded-xl text-white focus:outline-none focus:border-accent"
          />
        ))}
      </div>
      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        className="kid-3d w-full bg-accent text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="animate-spin" size={20} /> : <KeyRound size={20} />}
        Verify OTP
      </button>
      <button
        type="button"
        onClick={handleSendOtp}
        disabled={loading}
        className="kid-3d w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white py-3 rounded-lg text-sm"
      >
        Resend OTP
      </button>
    </div>
  );

  const renderNewPassword = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-300">Set a new password for your account.</p>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">New Password</label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="kid-3d w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 pr-10 text-white focus:outline-none focus:border-accent transition-colors"
            placeholder="Choose something strong"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showNewPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: strength.width, backgroundColor: strength.color }}
          />
        </div>
        <p className="text-[11px] text-gray-400">{strength.label}</p>
      </div>
      <button
        onClick={handleUpdatePassword}
        disabled={loading}
        className="kid-3d w-full bg-accent text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="animate-spin" size={20} /> : <Shield size={20} />}
        Update Password
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl kid-3d kid-modal"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">AikoKidzTV</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('login');
                setStep('email');
                setError(null);
                setInfo(null);
              }}
              className={`kid-3d px-3 py-1.5 rounded-lg text-sm ${
                mode === 'login' ? 'bg-accent text-black' : 'bg-white/10 text-white'
              }`}
            >
              Sign In / Create
            </button>
            <button
              onClick={() => {
                setMode('reset');
                setStep('email');
                setError(null);
                setInfo(null);
              }}
              className={`kid-3d px-3 py-1.5 rounded-lg text-sm ${
                mode === 'reset' ? 'bg-accent text-black' : 'bg-white/10 text-white'
              }`}
            >
              Reset Password
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-300">
            {step === 'email' && 'Enter your email to receive a 6-digit OTP.'}
            {step === 'otp' && 'Check your inbox for the PIN and enter it below.'}
            {step === 'newPassword' && 'Set your new password after OTP verification.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg mb-3 text-sm"
          >
            {error}
          </div>
        )}
        {info && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-3 rounded-lg mb-3 text-sm">
            {info}
          </div>
        )}

        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'newPassword' && renderNewPassword()}
      </motion.div>
    </div>
  );
};

export default AuthPage;
