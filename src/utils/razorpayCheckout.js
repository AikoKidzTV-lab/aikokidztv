import { supabase } from '../supabaseClient';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_KEY_ID = String(import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();
const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let razorpayScriptPromise = null;

const createCheckoutError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const normalizePositiveInteger = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const normalizeCurrency = (value) => {
  const currency = String(value || '').trim().toUpperCase();
  if (!currency) return 'INR';
  return currency;
};

const normalizeAmount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw createCheckoutError('invalid_amount', 'Invalid checkout amount.');
  }
  return Number(numeric.toFixed(2));
};

const loadRazorpayCheckoutScript = async () => {
  if (typeof window === 'undefined') {
    throw createCheckoutError('browser_only', 'Razorpay checkout is only available in the browser.');
  }

  if (window.Razorpay) {
    return window.Razorpay;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.Razorpay), { once: true });
        existingScript.addEventListener(
          'error',
          () => reject(createCheckoutError('script_load_failed', 'Unable to load Razorpay checkout.')),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () =>
        reject(createCheckoutError('script_load_failed', 'Unable to load Razorpay checkout.'));
      document.body.appendChild(script);
    }).catch((error) => {
      razorpayScriptPromise = null;
      throw error;
    });
  }

  return razorpayScriptPromise;
};

const getFunctionUrl = (functionName) => {
  if (!SUPABASE_URL) {
    throw createCheckoutError('missing_supabase_url', 'Missing Supabase URL for Razorpay checkout.');
  }

  return `${SUPABASE_URL}/functions/v1/${functionName}`;
};

const invokeSupabaseFunction = async (functionName, payload) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw createCheckoutError('auth_session_error', sessionError.message || 'Unable to load auth session.');
  }

  if (!session?.access_token) {
    throw createCheckoutError('auth_required', 'Please log in before continuing to checkout.');
  }

  const response = await fetch(getFunctionUrl(functionName), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let parsed;

  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    parsed = { error: rawText || 'Unexpected response from payment service.' };
  }

  if (!response.ok) {
    throw createCheckoutError(
      'function_request_failed',
      parsed?.error || parsed?.message || 'Payment service request failed.'
    );
  }

  return parsed;
};

export const startRazorpayCheckout = async ({ user, plan }) => {
  if (!user?.id) {
    throw createCheckoutError('auth_required', 'Please log in before continuing to checkout.');
  }

  if (!RAZORPAY_KEY_ID) {
    throw createCheckoutError('missing_key', 'Razorpay key is not configured.');
  }

  const normalizedPlan = {
    id: String(plan?.id || '').trim(),
    planName: String(plan?.planName || plan?.title || '').trim(),
    amount: normalizeAmount(plan?.amount),
    currency: normalizeCurrency(plan?.currency),
    rewards: {
      purpleGems: normalizePositiveInteger(plan?.rewards?.purpleGems ?? plan?.purpleGems),
      rainbowGems: normalizePositiveInteger(plan?.rewards?.rainbowGems ?? plan?.rainbowGems),
    },
    economyTier: String(plan?.economyTier || '').trim() || 'standard',
  };

  if (!normalizedPlan.id || !normalizedPlan.planName) {
    throw createCheckoutError('invalid_plan', 'This plan is missing payment details.');
  }

  const order = await invokeSupabaseFunction('razorpay-create-order', normalizedPlan);
  const Razorpay = await loadRazorpayCheckoutScript();

  if (typeof Razorpay !== 'function') {
    throw createCheckoutError('sdk_unavailable', 'Razorpay checkout is not available right now.');
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };

    const checkout = new Razorpay({
      key: order?.keyId || RAZORPAY_KEY_ID,
      order_id: order?.orderId,
      amount: order?.amount,
      currency: order?.currency,
      name: 'AikoKidzTV',
      description: normalizedPlan.planName,
      prefill: {
        email: user?.email || undefined,
      },
      theme: {
        color: '#0f172a',
      },
      modal: {
        ondismiss: () => {
          settle(
            reject,
            createCheckoutError('checkout_dismissed', 'Razorpay checkout was closed before payment completed.')
          );
        },
      },
      handler: async (response) => {
        try {
          const verification = await invokeSupabaseFunction('razorpay-verify-payment', {
            razorpay_order_id: response?.razorpay_order_id,
            razorpay_payment_id: response?.razorpay_payment_id,
            razorpay_signature: response?.razorpay_signature,
          });

          settle(resolve, verification);
        } catch (error) {
          settle(reject, error);
        }
      },
    });

    checkout.on('payment.failed', (event) => {
      const failureMessage =
        event?.error?.description ||
        event?.error?.reason ||
        event?.error?.step ||
        'Payment failed. Please try again.';

      settle(reject, createCheckoutError('payment_failed', failureMessage));
    });

    checkout.open();
  });
};
