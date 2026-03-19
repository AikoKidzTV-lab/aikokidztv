import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

const encoder = new TextEncoder();

const normalizeText = (value: unknown, fallback = '') =>
  String(value ?? fallback)
    .trim()
    .slice(0, 120);

const normalizePositiveInteger = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const getAuthenticatedUser = async (request: Request) => {
  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return { user: null, error: 'Missing authorization header.' };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: error?.message || 'Unable to authenticate user.' };
  }

  return { user, error: null };
};

const hexEncode = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');

const verifySignature = async (orderId: string, paymentId: string, signature: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(RAZORPAY_KEY_SECRET),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${orderId}|${paymentId}`));
  return hexEncode(digest) === signature;
};

const fetchRazorpayEntity = async (path: string) => {
  const basicAuth = `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`;
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: {
      Authorization: basicAuth,
      'Content-Type': 'application/json',
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.description || payload?.error?.reason || 'Unable to verify payment with Razorpay.');
  }

  return payload;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !RAZORPAY_KEY_ID ||
    !RAZORPAY_KEY_SECRET
  ) {
    return jsonResponse({ error: 'Missing Razorpay verification configuration.' }, 500);
  }

  const { user, error: authError } = await getAuthenticatedUser(request);
  if (authError || !user) {
    return jsonResponse({ error: authError || 'Unauthorized.' }, 401);
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const orderId = normalizeText(body.razorpay_order_id);
  const paymentId = normalizeText(body.razorpay_payment_id);
  const signature = normalizeText(body.razorpay_signature);

  if (!orderId || !paymentId || !signature) {
    return jsonResponse({ error: 'Payment verification payload is incomplete.' }, 400);
  }

  const isValidSignature = await verifySignature(orderId, paymentId, signature);
  if (!isValidSignature) {
    return jsonResponse({ error: 'Invalid Razorpay payment signature.' }, 400);
  }

  try {
    const [order, payment] = await Promise.all([
      fetchRazorpayEntity(`orders/${orderId}`),
      fetchRazorpayEntity(`payments/${paymentId}`),
    ]);

    if (normalizeText(payment.order_id) !== orderId) {
      return jsonResponse({ error: 'Payment does not belong to the requested order.' }, 400);
    }

    if (!['authorized', 'captured'].includes(String(payment.status || '').toLowerCase())) {
      return jsonResponse({ error: 'Razorpay payment is not in a successful state yet.' }, 400);
    }

    const orderUserId = normalizeText(order?.notes?.user_id);
    if (!orderUserId || orderUserId !== user.id) {
      return jsonResponse({ error: 'This payment does not belong to the authenticated user.' }, 403);
    }

    const purpleGems = normalizePositiveInteger(order?.notes?.purple_gems);
    const rainbowGems = normalizePositiveInteger(order?.notes?.rainbow_gems);
    const planName = normalizeText(order?.notes?.plan_name, 'Gem Pack');
    const economyTier = normalizeText(order?.notes?.economy_tier, 'standard');
    const amountMajor = Number((Number(payment.amount || order.amount || 0) / 100).toFixed(2));

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: creditResult, error: creditError } = await admin.rpc('apply_verified_razorpay_payment', {
      p_user_id: user.id,
      p_plan_name: planName,
      p_amount: amountMajor,
      p_currency: normalizeText(payment.currency || order.currency || 'INR', 'INR'),
      p_purple_gems: purpleGems,
      p_rainbow_gems: rainbowGems,
      p_razorpay_order_id: orderId,
      p_razorpay_payment_id: paymentId,
    });

    if (creditError) {
      throw new Error(creditError.message || 'Failed to credit wallet after payment verification.');
    }

    const creditPayload =
      creditResult && typeof creditResult === 'object'
        ? (creditResult as Record<string, unknown>)
        : {};

    return jsonResponse({
      alreadyProcessed: Boolean(creditPayload.already_processed),
      gems: normalizePositiveInteger(creditPayload.gems),
      rainbowGems: normalizePositiveInteger(creditPayload.rainbow_gems),
      purpleGemsAdded: purpleGems,
      rainbowGemsAdded: rainbowGems,
      planName,
      economyTier,
      transactionId: creditPayload.transaction_id || null,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Payment verification failed.' },
      400
    );
  }
});
