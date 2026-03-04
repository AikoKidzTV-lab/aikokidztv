import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuthRedirectUrl, supabase } from '../supabaseClient';
import { NEW_USER_BONUS_GEMS } from '../constants/gemEconomy';
import { isAdminEmail } from '../utils/admin';

const AUTH_REQUEST_TIMEOUT_MS = 12000;

const normalizeMode = (value) => (value === 'signup' ? 'signup' : 'login');
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizeOtpCode = (value) => String(value || '').trim().replace(/\s+/g, '');

const isDuplicateKeyError = (error) => {
  const message = `${error?.message || ''} ${error?.code || ''}`.toLowerCase();
  return message.includes('duplicate') || message.includes('unique');
};

const isMissingColumnError = (error, columnName) => {
  if (!columnName) return false;
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedColumn = String(columnName).toLowerCase();
  return (
    text.includes(normalizedColumn) &&
    (
      text.includes('column') ||
      text.includes('schema cache') ||
      error?.code === '42703' ||
      error?.code === 'PGRST204'
    )
  );
};

const serializeAuthError = (authError) => ({
  message: authError?.message || 'Unknown auth error',
  code: authError?.code || null,
  status: Number.isFinite(Number(authError?.status)) ? Number(authError.status) : null,
  name: authError?.name || 'Error',
  details: authError?.details || null,
  hint: authError?.hint || null,
});

const formatAuthError = (authError) => {
  const normalized = serializeAuthError(authError);
  const suffix = [normalized.code, normalized.status ? `status:${normalized.status}` : null]
    .filter(Boolean)
    .join(' | ');

  return {
    userMessage: suffix ? `${normalized.message} (${suffix})` : normalized.message,
    debug: JSON.stringify(normalized, null, 2),
  };
};

const getAuthRuntimeContext = (mode, email) => ({
  mode,
  email,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server',
  path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
  authRedirectUrl: getAuthRedirectUrl('/'),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '(missing)',
  hasAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
});

const logAuthError = (label, authError, runtimeContext) => {
  console.error(`[AuthModal] ${label}`, {
    ...serializeAuthError(authError),
    runtimeContext,
    rawError: authError,
  });
};

const withAuthTimeout = async (promise, label) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      const timeoutError = new Error(`${label} timed out after ${AUTH_REQUEST_TIMEOUT_MS}ms`);
      timeoutError.name = 'AuthTimeoutError';
      timeoutError.code = 'AUTH_TIMEOUT';
      reject(timeoutError);
    }, AUTH_REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }
};

const getBackgroundCheckWarning = (error) => {
  const message = error?.message || '';
  if (/failed to fetch|network|timed out|connection/i.test(message)) {
    return 'Auth service check is delayed. You can still use the login form immediately.';
  }

  return 'Auth service is still initializing in the background. You can continue now.';
};

const getAuthRedirectUrlForRequest = () => {
  return getAuthRedirectUrl('/');
};

const AuthModal = ({ open, onClose, onSuccess, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(normalizeMode(initialMode));
  const [authStep, setAuthStep] = useState('password'); // password | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [info, setInfo] = useState('');
  const [backgroundCheckPending, setBackgroundCheckPending] = useState(false);
  const [backgroundCheckWarning, setBackgroundCheckWarning] = useState('');
  const isOpenRef = useRef(open);
  const modalRunIdRef = useRef(0);

  const clearFeedback = useCallback(() => {
    setError('');
    setErrorDetails('');
    setInfo('');
  }, []);

  const canApplyState = useCallback(
    (runId) => runId === modalRunIdRef.current && isOpenRef.current,
    []
  );

  const closeModal = useCallback(() => {
    modalRunIdRef.current += 1;
    setLoading(false);
    setOtpLoading(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    isOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    modalRunIdRef.current += 1;
    setMode(normalizeMode(initialMode));
    setAuthStep('password');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setOtpLoading(false);
    setBackgroundCheckPending(false);
    setBackgroundCheckWarning('');
    clearFeedback();
  }, [open, initialMode, clearFeedback]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('keydown', onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeModal]);

  useEffect(() => {
    if (!open) return undefined;

    const runId = modalRunIdRef.current;
    const preflightContext = getAuthRuntimeContext('preflight', '');
    setBackgroundCheckPending(true);
    setBackgroundCheckWarning('');

    const runBackgroundCheck = async () => {
      try {
        const { error: sessionError } = await withAuthTimeout(
          supabase.auth.getSession(),
          'Background session check'
        );

        if (!canApplyState(runId)) return;
        if (sessionError) {
          setBackgroundCheckWarning(getBackgroundCheckWarning(sessionError));
          logAuthError('Background session check failed', sessionError, preflightContext);
        }
      } catch (backgroundError) {
        if (!canApplyState(runId)) return;
        setBackgroundCheckWarning(getBackgroundCheckWarning(backgroundError));
        logAuthError('Background session check failed', backgroundError, preflightContext);
      } finally {
        if (canApplyState(runId)) {
          setBackgroundCheckPending(false);
        }
      }
    };

    void runBackgroundCheck();
    return undefined;
  }, [open, canApplyState]);

  const ensureSignupProfile = async (userId) => {
    if (!userId) return;

    const baseProfilePayload = {
      id: userId,
      gems: NEW_USER_BONUS_GEMS,
      unlocked_zones: [],
      unlocked_videos: [],
      unlocked_items: [],
      claimed_rewards: [],
    };

    let { error: profileError } = await supabase.from('profiles').insert(baseProfilePayload);

    if (profileError && isMissingColumnError(profileError, 'unlocked_videos')) {
      const retryPayload = { ...baseProfilePayload };
      delete retryPayload.unlocked_videos;
      ({ error: profileError } = await supabase.from('profiles').insert(retryPayload));
    }

    if (profileError && !isDuplicateKeyError(profileError)) {
      console.warn('[AuthModal] Could not initialize profile row:', profileError);
    }
  };

  const handleAuthSuccess = async ({ user: signedInUser = null, session = null, source = 'password' } = {}) => {
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

    try {
      await onSuccess?.({ user: signedInUser, session, source });
    } catch (syncError) {
      console.warn('[AuthModal] Post-login profile sync failed; continuing with authenticated session.', {
        message: syncError?.message || 'Unknown error',
        source,
        userId: signedInUser?.id || null,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('aiko:auth-refresh'));
      }
    }

    closeModal();

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

  const verifyOtpWithConfiguredType = async ({ emailToUse, token, authMode }) => {
    const otpType = authMode === 'signup' ? 'signup' : 'magiclink';
    const { data, error } = await withAuthTimeout(
      supabase.auth.verifyOtp({
        email: emailToUse,
        token,
        type: otpType,
      }),
      `verifyOtp:${otpType}`
    );

    if (error) {
      throw error;
    }

    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (authStep === 'otp') {
      const runId = modalRunIdRef.current;
      const emailToUse = normalizeEmail(email);
      const token = normalizeOtpCode(otpCode);

      if (!emailToUse) {
        setError('Enter your email first to verify OTP.');
        return;
      }
      if (token.length < 6) {
        setError('Enter the 6-digit verification code from your email.');
        return;
      }

      setOtpLoading(true);
      clearFeedback();
      const runtimeContext = getAuthRuntimeContext(`${mode}-otp-verify`, emailToUse);

      try {
        const verifyData = await verifyOtpWithConfiguredType({
          emailToUse,
          token,
          authMode: mode,
        });

        if (mode === 'signup') {
          await ensureSignupProfile(verifyData?.user?.id);
        }

        if (!canApplyState(runId)) return;

        setInfo('OTP verified! Redirecting...');
        await handleAuthSuccess({
          user: verifyData?.user ?? verifyData?.session?.user ?? null,
          session: verifyData?.session ?? null,
          source: 'otp',
        });
      } catch (otpVerifyError) {
        if (!canApplyState(runId)) return;
        const formatted = formatAuthError(otpVerifyError);
        setError(formatted.userMessage || 'Could not verify OTP. Please try again.');
        setErrorDetails(formatted.debug);
        logAuthError('OTP verification failed', otpVerifyError, runtimeContext);
      } finally {
        if (canApplyState(runId)) {
          setOtpLoading(false);
        }
      }
      return;
    }

    const emailToUse = normalizeEmail(email);

    if (!emailToUse || !password) {
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

    const runId = modalRunIdRef.current;
    setLoading(true);
    clearFeedback();
    const runtimeContext = getAuthRuntimeContext(mode, emailToUse);

    try {
      if (mode === 'login') {
        console.info('[AuthModal] Starting signInWithPassword request', runtimeContext);
        const { data: signInData, error: signInError } = await withAuthTimeout(
          supabase.auth.signInWithPassword({
            email: emailToUse,
            password,
          }),
          'signInWithPassword'
        );

        if (signInError) {
          if (String(signInError?.code || '').toLowerCase() === 'invalid_credentials') {
            const guidanceError = new Error(
              'Invalid email/password. If this account was created using email OTP, use "Login with OTP".'
            );
            guidanceError.code = signInError.code;
            guidanceError.status = signInError.status;
            logAuthError('signInWithPassword invalid credentials', signInError, runtimeContext);
            throw guidanceError;
          }

          logAuthError('signInWithPassword returned an error', signInError, runtimeContext);
          throw signInError;
        }

        if (!canApplyState(runId)) return;

        const signedInUser = signInData?.user ?? signInData?.session?.user ?? null;
        setInfo('Welcome back! Redirecting...');
        await handleAuthSuccess({
          user: signedInUser,
          session: signInData?.session ?? null,
          source: 'password',
        });
        return;
      }

      console.info('[AuthModal] Starting signUp request', runtimeContext);
      const { data: signUpData, error: signUpError } = await withAuthTimeout(
        supabase.auth.signUp({
          email: emailToUse,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrlForRequest(),
          },
        }),
        'signUp'
      );

      if (signUpError) {
        logAuthError('signUp returned an error', signUpError, runtimeContext);
        throw signUpError;
      }

      await ensureSignupProfile(signUpData?.user?.id);

      if (!canApplyState(runId)) return;

      if (signUpData?.session) {
        setInfo('Account created successfully!');
        await handleAuthSuccess({
          user: signUpData?.user ?? signUpData?.session?.user ?? null,
          session: signUpData?.session ?? null,
          source: 'signup',
        });
      } else {
        setInfo('Account created! Please check your email to confirm your signup.');
      }
    } catch (authError) {
      if (!canApplyState(runId)) return;
      const formatted = formatAuthError(authError);
      setError(formatted.userMessage);
      setErrorDetails(formatted.debug);
      logAuthError('Authentication failed', authError, runtimeContext);
    } finally {
      if (canApplyState(runId)) {
        setLoading(false);
      }
    }
  };

  const handleOtpRequest = async () => {
    setAuthStep('otp');
    setOtpCode('');
    clearFeedback();

    const emailToUse = normalizeEmail(email);
    if (!emailToUse) {
      setError('Enter your email first, then tap Resend OTP.');
      return;
    }

    const runId = modalRunIdRef.current;
    setOtpLoading(true);
    const runtimeContext = getAuthRuntimeContext(`${mode}-otp-request`, emailToUse);

    try {
      console.info('[AuthModal] Starting signInWithOtp request', runtimeContext);
      const { error: otpError } = await withAuthTimeout(
        supabase.auth.signInWithOtp({
          email: emailToUse,
          options: {
            shouldCreateUser: mode === 'signup',
            emailRedirectTo: getAuthRedirectUrlForRequest(),
          },
        }),
        'signInWithOtp'
      );

      if (otpError) {
        logAuthError('signInWithOtp returned an error', otpError, runtimeContext);
        throw otpError;
      }

      if (!canApplyState(runId)) return;
      setInfo('OTP sent! Enter the verification code from your email.');
    } catch (otpAuthError) {
      if (!canApplyState(runId)) return;
      const formatted = formatAuthError(otpAuthError);
      setError(formatted.userMessage || 'Could not send OTP. Please try again.');
      setErrorDetails(formatted.debug);
      logAuthError('OTP request failed', otpAuthError, runtimeContext);
    } finally {
      if (canApplyState(runId)) {
        setOtpLoading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/55 px-4 py-8 backdrop-blur-sm"
      onClick={closeModal}
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
          onClick={closeModal}
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
              setAuthStep('password');
              setOtpCode('');
              clearFeedback();
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
              setAuthStep('password');
              setOtpCode('');
              clearFeedback();
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

        {backgroundCheckPending ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Checking auth service in background. The form is ready now.
          </div>
        ) : null}

        {backgroundCheckWarning ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {backgroundCheckWarning}
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

          {authStep === 'otp' ? (
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">OTP / Verification Code</span>
              <input
                type="text"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-400"
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </label>
          ) : (
            <>
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-slate-700">Password</span>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-slate-900 outline-none transition focus:border-cyan-400"
                    placeholder="Minimum 6 characters"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {mode === 'signup' ? (
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">Confirm Password</span>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-slate-900 outline-none transition focus:border-cyan-400"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              ) : null}
            </>
          )}

          <button
            type="submit"
            disabled={loading || otpLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-400 to-amber-300 px-4 py-2.5 font-black text-slate-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading || otpLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {authStep === 'otp' ? 'Verify OTP' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {authStep === 'otp' ? (
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={handleOtpRequest}
              disabled={loading || otpLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {otpLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthStep('password');
                setOtpCode('');
                clearFeedback();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Back to Password Login
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOtpRequest}
            disabled={loading || otpLoading}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {otpLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            Login with OTP (Email)
          </button>
        )}

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
