import React, { useEffect, useState } from 'react';
import { Loader2, Lock, Mail, Sparkles, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { NEW_USER_BONUS_GEMS } from '../constants/gemEconomy';

const isDuplicateKeyError = (error) => {
  const message = `${error?.message || ''} ${error?.code || ''}`.toLowerCase();
  return message.includes('duplicate') || message.includes('unique');
};

const AuthModal = ({ open, onClose, onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode(initialMode === 'signup' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setInfo('');
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return undefined;

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) return null;

  const ensureSignupProfile = async (userId) => {
    if (!userId) return;
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      gems: NEW_USER_BONUS_GEMS,
    });

    if (profileError && !isDuplicateKeyError(profileError)) {
      console.warn('[AuthModal] Could not initialize profile row:', profileError);
    }
  };

  const handleAuthSuccess = () => {
    onSuccess?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && confirmPassword !== password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setInfo('Welcome back!');
        handleAuthSuccess();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      await ensureSignupProfile(data?.user?.id);

      if (data?.session) {
        setInfo('Account created successfully!');
        handleAuthSuccess();
      } else {
        setInfo('Account created! Please check your email to confirm your signup.');
      }
    } catch (authError) {
      setError(authError?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    if (!email) {
      setError('Enter your email first to receive an OTP.');
      return;
    }

    setOtpLoading(true);
    setError('');
    setInfo('');

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === 'signup',
        },
      });
      if (otpError) throw otpError;
      setInfo('OTP sent! Check your email for the login link or verification code.');
    } catch (otpAuthError) {
      setError(otpAuthError?.message || 'Could not send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/55 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication dialog"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-[2rem] border-2 border-white/70 bg-gradient-to-b from-cyan-50 via-white to-pink-50 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.28)] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
          aria-label="Close authentication modal"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-pink-200 to-cyan-200 text-slate-900">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-xs font-semibold text-slate-600">Safe sign-in for parents and kids.</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setInfo('');
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              mode === 'login'
                ? 'bg-slate-900 text-white'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setInfo('');
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              mode === 'signup'
                ? 'bg-slate-900 text-white'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error ? (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {info ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {info}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-slate-700">Email</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-slate-900 outline-none transition focus:border-cyan-400"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-slate-700">Password</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-slate-900 outline-none transition focus:border-cyan-400"
                placeholder="Minimum 6 characters"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>
          </label>

          {mode === 'signup' ? (
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">Confirm Password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-slate-900 outline-none transition focus:border-cyan-400"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>
          ) : null}

          <button
            type="submit"
            disabled={loading || otpLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-400 to-amber-300 px-4 py-2.5 font-black text-slate-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleOtp}
          disabled={loading || otpLoading}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {otpLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          Login with OTP (Email)
        </button>

        <button
          type="button"
          disabled
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500"
        >
          Phone OTP (Coming Soon)
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
