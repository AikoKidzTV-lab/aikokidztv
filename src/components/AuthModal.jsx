import React, { useEffect, useState } from 'react';
import { Loader2, Lock, Mail, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { NEW_USER_BONUS_GEMS } from '../constants/gemEconomy';
import { isAdminEmail } from '../utils/admin';

const isDuplicateKeyError = (error) => {
  const message = `${error?.message || ''} ${error?.code || ''}`.toLowerCase();
  return message.includes('duplicate') || message.includes('unique');
};

const formatAuthError = (authError) => {
  const message = authError?.message || 'Authentication failed. Please try again.';
  const code = authError?.code || authError?.name || 'unknown_error';
  const status = Number.isFinite(Number(authError?.status)) ? Number(authError.status) : null;
  const suffix = [code, status ? `status:${status}` : null].filter(Boolean).join(' | ');

  return {
    userMessage: suffix ? `${message} (${suffix})` : message,
    debug: JSON.stringify(
      {
        message,
        code,
        status,
      },
      null,
      2
    ),
  };
};

const getAuthRuntimeContext = (mode, email) => ({
  mode,
  email,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server',
  path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '(missing)',
  hasAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
});

const serializeAuthError = (authError) => ({
  message: authError?.message || 'Unknown auth error',
  code: authError?.code || null,
  status: Number.isFinite(Number(authError?.status)) ? Number(authError.status) : null,
  name: authError?.name || 'Error',
  details: authError?.details || null,
  hint: authError?.hint || null,
});

const logAuthError = (label, authError, runtimeContext) => {
  const normalized = serializeAuthError(authError);
  console.error(`[AuthModal] ${label}`, {
    ...normalized,
    runtimeContext,
    rawError: authError,
  });
};

const AuthModal = ({ open, onClose, onSuccess, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode(initialMode === 'signup' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setErrorDetails('');
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

  const handleAuthSuccess = ({ user: signedInUser = null, session = null, source = 'password' } = {}) => {
    if (!signedInUser) {
      const missingSessionError = new Error('Sign-in succeeded but Supabase returned no active user/session.');
      const formatted = formatAuthError(missingSessionError);
      setError(formatted.userMessage);
      setErrorDetails(formatted.debug);
      console.error('[AuthModal] Missing user/session after auth success:', {
        source,
        session,
      });
      return;
    }

    onSuccess?.({ user: signedInUser, session, source });
    onClose?.();

    if (isAdminEmail(signedInUser.email)) {
      console.info('[AuthModal] Admin login successful. Redirecting to /admin.', {
        email: signedInUser.email,
        source,
      });
      navigate('/admin', { replace: true });
    } else {
      console.info('[AuthModal] Login successful. No admin redirect for non-admin account.', {
        email: signedInUser.email,
        source,
      });
    }
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
    setErrorDetails('');
    setInfo('');
    const runtimeContext = getAuthRuntimeContext(mode, email);

    try {
      if (mode === 'login') {
        console.info('[AuthModal] Starting signInWithPassword request', runtimeContext);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          logAuthError('signInWithPassword returned an error', signInError, runtimeContext);
          throw signInError;
        }

        const signedInUser = signInData?.user ?? signInData?.session?.user ?? null;
        setInfo('Welcome back! Redirecting...');
        handleAuthSuccess({
          user: signedInUser,
          session: signInData?.session ?? null,
          source: 'password',
        });
        return;
      }

      console.info('[AuthModal] Starting signUp request', runtimeContext);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        logAuthError('signUp returned an error', signUpError, runtimeContext);
        throw signUpError;
      }

      await ensureSignupProfile(data?.user?.id);

      if (data?.session) {
        setInfo('Account created successfully!');
        handleAuthSuccess({
          user: data?.user ?? data?.session?.user ?? null,
          session: data?.session ?? null,
          source: 'signup',
        });
      } else {
        setInfo('Account created! Please check your email to confirm your signup.');
      }
    } catch (authError) {
      const formatted = formatAuthError(authError);
      setError(formatted.userMessage);
      setErrorDetails(formatted.debug);
      logAuthError('Authentication failed', authError, runtimeContext);
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
    setErrorDetails('');
    setInfo('');
    const runtimeContext = getAuthRuntimeContext(mode, email);

    try {
      console.info('[AuthModal] Starting signInWithOtp request', runtimeContext);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === 'signup',
        },
      });
      if (otpError) {
        logAuthError('signInWithOtp returned an error', otpError, runtimeContext);
        throw otpError;
      }
      setInfo('OTP sent! Check your email for the login link or verification code.');
    } catch (otpAuthError) {
      const formatted = formatAuthError(otpAuthError);
      setError(formatted.userMessage || 'Could not send OTP. Please try again.');
      setErrorDetails(formatted.debug);
      logAuthError('OTP request failed', otpAuthError, runtimeContext);
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
              setErrorDetails('');
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
              setErrorDetails('');
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
            {errorDetails ? (
              <details className="mt-2 rounded-lg border border-red-200 bg-white/60 p-2 text-xs text-red-900">
                <summary className="cursor-pointer font-semibold">Technical details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">{errorDetails}</pre>
              </details>
            ) : null}
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
