import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const successResponse = (order: Record<string, unknown>) =>
  new Response(JSON.stringify({ success: true, order }), {
    status: 200,
    headers: corsHeaders,
  });

const errorResponse = (error: unknown) =>
  new Response(JSON.stringify({ success: false, error }), {
    status: 200,
    headers: corsHeaders,
  });

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const normalizeText = (value: unknown, fallback = '') =>
  String(value ?? fallback)
    .trim()
    .slice(0, 120);

const normalizeCurrency = (value: unknown) => {
  const currency = String(value || '')
    .trim()
    .toUpperCase();

  return currency || 'INR';
};

const normalizePositiveInteger = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.max(0, Math.floor(parsed));
};

const normalizeMajorAmountToSubunits = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.max(0, Math.round(parsed * 100));
};

const resolveOrderAmount = (body: Record<string, unknown>) => {
  const explicitSubunitAmount =
    normalizePositiveInteger(body.amountInSubunits) ||
    normalizePositiveInteger(body.amount_in_subunits) ||
    normalizePositiveInteger(body.amountPaise) ||
    normalizePositiveInteger(body.amount_paise) ||
    normalizePositiveInteger(body.amountCents) ||
    normalizePositiveInteger(body.amount_cents);

  if (explicitSubunitAmount > 0) {
    return explicitSubunitAmount;
  }

  // Frontend currently sends major currency units, but Razorpay requires paise/cents.
  return normalizeMajorAmountToSubunits(body.amount);
};

const parseJsonBody = async (request: Request) => {
  try {
    const parsed = await request.json();
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return null;
  }
};

const getAuthenticatedUser = async (request: Request) => {
  const authorization = request.headers.get('Authorization');

  if (!authorization || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { user: null, error: null };
  }

  try {
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

    if (error) {
      return { user: null, error: error.message || 'Unable to authenticate user.' };
    }

    return { user: user ?? null, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Unable to authenticate user.',
    };
  }
};

const parseRazorpayResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse({ message: 'Method not allowed.' });
  }

  const keyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim();
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim();

  if (!keyId || !keySecret) {
    return errorResponse('CRITICAL: Missing API Keys in backend. Please check Supabase secrets.');
  }

  const body = await parseJsonBody(req);
  if (!body) {
    return errorResponse({ message: 'Invalid request body.' });
  }

  const amount = resolveOrderAmount(body);
  const currency = normalizeCurrency(body.currency);

  if (!amount) {
    return errorResponse({
      message: 'A valid amount is required to create a Razorpay order.',
      receivedAmount: body.amount ?? null,
    });
  }

  const { user, error: authError } = await getAuthenticatedUser(req);
  if (authError) {
    return errorResponse({ message: authError });
  }

  const planName = normalizeText(body.planName ?? body.plan_name, 'Gem Pack');
  const requestedReceipt = normalizeText(body.receipt, '');
  const receipt =
    requestedReceipt || `aiko_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`.slice(0, 40);
  const rawNotes =
    body.notes && typeof body.notes === 'object' ? (body.notes as Record<string, unknown>) : {};

  const notes = {
    ...Object.fromEntries(
      Object.entries(rawNotes).map(([key, value]) => [key, normalizeText(value)])
    ),
    ...(planName ? { plan_name: planName } : {}),
    ...(user?.id ? { user_id: user.id } : {}),
    ...(user?.email ? { user_email: normalizeText(user.email) } : {}),
  };

  const authHeader = 'Basic ' + btoa(keyId + ':' + keySecret);

  try {
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes,
      }),
    });

    const razorpayPayload = await parseRazorpayResponse(razorpayResponse);

    if (!razorpayResponse.ok) {
      return errorResponse({
        status: razorpayResponse.status,
        razorpay: razorpayPayload,
      });
    }

    return successResponse({
      ...razorpayPayload,
      orderId: razorpayPayload.id,
      keyId,
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? { message: error.message }
        : { message: 'Unable to reach Razorpay API.' }
    );
  }
});
