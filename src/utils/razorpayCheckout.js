import { supabase } from '../supabaseClient';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_KEY_ID = String(import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();
const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');

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

const convertAmountToSubunits = (value) => Math.max(0, Math.round(Number(value) * 100));

const isPaymentApiNetworkError = (error) => {
  const message = String(error?.message || '').trim().toLowerCase();
  const errorName = String(error?.name || '').trim().toLowerCase();
  return (
    errorName.includes('functionsfetcherror') ||
    message.includes('failed to fetch') ||
    message.includes('failed to send a request to the edge function') ||
    message.includes('network request failed') ||
    message.includes('network error') ||
    message.includes('load failed') ||
    message.includes('cors')
  );
};

const getPaymentApiErrorMessage = (error) => {
  if (isPaymentApiNetworkError(error)) {
    return 'Server connection failed. Please check your internet or try again later.';
  }

  return String(error?.message || '').trim() || 'Payment service request failed.';
};

const stringifyDebugPayload = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? 'Unknown error');
  }
};

const getRazorpayErrorMessage = (errorPayload) => {
  if (!errorPayload) {
    return 'Razorpay rejected the order request.';
  }

  if (typeof errorPayload?.message === 'string' && errorPayload.message.trim()) {
    return errorPayload.message.trim();
  }

  if (typeof errorPayload?.razorpay?.error?.description === 'string' && errorPayload.razorpay.error.description.trim()) {
    return errorPayload.razorpay.error.description.trim();
  }

  if (typeof errorPayload?.razorpay?.error?.reason === 'string' && errorPayload.razorpay.error.reason.trim()) {
    return errorPayload.razorpay.error.reason.trim();
  }

  if (typeof errorPayload?.razorpay?.error?.code === 'string' && errorPayload.razorpay.error.code.trim()) {
    return `Razorpay error: ${errorPayload.razorpay.error.code.trim()}`;
  }

  return 'Razorpay rejected the order request.';
};

const getFunctionTargetUrl = (functionName) => {
  if (!SUPABASE_URL) {
    throw createCheckoutError(
      'missing_backend_url',
      'Payment server URL is not configured. Please set VITE_SUPABASE_URL.'
    );
  }

  return `${SUPABASE_URL}/functions/v1/${functionName}`;
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

const invokeSupabaseFunction = async (functionName, payload) => {
  try {
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

    const targetUrl = getFunctionTargetUrl(functionName);

    if (functionName === 'razorpay-create-order') {
      console.log('Attempting to fetch Razorpay order from:', targetUrl);
    } else {
      console.log('Attempting Razorpay payment verification via:', targetUrl);
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      if (typeof window !== 'undefined' && functionName === 'razorpay-create-order') {
        window.alert(`Network Error: ${error.message}\nEndpoint: ${targetUrl}`);
        error.alertedToUser = true;
      }
      error.targetUrl = targetUrl;
      throw error;
    }

    return data ?? {};
  } catch (error) {
    console.error('Payment API Error:', error);

    if (
      typeof window !== 'undefined' &&
      error?.targetUrl &&
      functionName === 'razorpay-create-order' &&
      !error?.alertedToUser
    ) {
      window.alert(`Failed to connect to payment server at: ${error.targetUrl}`);
    }

    throw createCheckoutError(
      isPaymentApiNetworkError(error)
        ? 'payment_api_unreachable'
        : (error?.code || 'function_request_failed'),
      getPaymentApiErrorMessage(error)
    );
  }
};

export const startRazorpayCheckout = async ({ user, plan }) => {
  if (!user?.id) {
    throw createCheckoutError('auth_required', 'Please log in before continuing to checkout.');
  }

  if (!RAZORPAY_KEY_ID) {
    throw createCheckoutError('missing_key', 'Razorpay key is not configured.');
  }

  const normalizedAmount = normalizeAmount(plan?.amount);
  const normalizedPlan = {
    id: String(plan?.id || '').trim(),
    planName: String(plan?.planName || plan?.title || '').trim(),
    amount: normalizedAmount,
    amountInSubunits: convertAmountToSubunits(normalizedAmount),
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

  const createOrderResponse = await invokeSupabaseFunction('razorpay-create-order', normalizedPlan);

  if (createOrderResponse?.success === false) {
    const razorpayError = createOrderResponse.error ?? { message: 'Unknown Razorpay order creation error.' };
    console.error('Razorpay Error:', razorpayError);

    if (typeof window !== 'undefined') {
      window.alert(`RAZORPAY ERROR:\n${stringifyDebugPayload(razorpayError)}`);
    }

    throw createCheckoutError('razorpay_order_rejected', getRazorpayErrorMessage(razorpayError));
  }

  const order =
    createOrderResponse?.success === true && createOrderResponse?.order
      ? createOrderResponse.order
      : createOrderResponse;
  const orderId = String(order?.id || order?.orderId || '').trim();
  const checkoutAmount =
    normalizePositiveInteger(order?.amount) || normalizePositiveInteger(normalizedPlan.amountInSubunits);
  const checkoutCurrency = normalizeCurrency(order?.currency || normalizedPlan.currency);

  if (!orderId) {
    throw createCheckoutError('invalid_order_response', 'Payment server did not return a valid Razorpay order ID.');
  }

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
      order_id: orderId,
      amount: checkoutAmount,
      currency: checkoutCurrency,
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
