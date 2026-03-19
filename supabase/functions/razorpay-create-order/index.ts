import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

const normalizePositiveInteger = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const normalizeAmount = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Number(parsed.toFixed(2));
};

const normalizeText = (value: unknown, fallback = '') =>
  String(value ?? fallback)
    .trim()
    .slice(0, 120);

const normalizeCurrency = (value: unknown) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase();

  return normalized || 'INR';
};

const toSubunits = (amount: number) => Math.round(amount * 100);

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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return jsonResponse({ error: 'Missing Razorpay server configuration.' }, 500);
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

  const rewards =
    body.rewards && typeof body.rewards === 'object'
      ? (body.rewards as Record<string, unknown>)
      : {};
  const planId = normalizeText(body.id);
  const planName = normalizeText(body.planName);
  const amount = normalizeAmount(body.amount);
  const currency = normalizeCurrency(body.currency);
  const purpleGems = normalizePositiveInteger(rewards.purpleGems);
  const rainbowGems = normalizePositiveInteger(rewards.rainbowGems);
  const economyTier = normalizeText(body.economyTier, 'standard');

  if (!planId || !planName || amount == null) {
    return jsonResponse({ error: 'Plan ID, name, and amount are required.' }, 400);
  }

  const receipt = `aiko_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`.slice(0, 40);
  const basicAuth = `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`;

  const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: basicAuth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: toSubunits(amount),
      currency,
      receipt,
      notes: {
        user_id: user.id,
        user_email: normalizeText(user.email || '', ''),
        plan_id: planId,
        plan_name: planName,
        purple_gems: String(purpleGems),
        rainbow_gems: String(rainbowGems),
        economy_tier: economyTier || 'standard',
      },
    }),
  });

  const orderPayload = await orderResponse.json();

  if (!orderResponse.ok) {
    return jsonResponse(
      {
        error: orderPayload?.error?.description || orderPayload?.error?.reason || 'Failed to create Razorpay order.',
      },
      400
    );
  }

  return jsonResponse({
    orderId: orderPayload.id,
    amount: orderPayload.amount,
    currency: orderPayload.currency,
    receipt: orderPayload.receipt,
    keyId: RAZORPAY_KEY_ID,
  });
});
