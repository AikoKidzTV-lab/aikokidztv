alter table public.transactions
  add column if not exists currency text,
  add column if not exists rainbow_gems_added integer not null default 0,
  add column if not exists status text not null default 'verified',
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists verified_at timestamp with time zone;

create unique index if not exists transactions_razorpay_payment_id_idx
  on public.transactions (razorpay_payment_id);

create unique index if not exists transactions_razorpay_order_id_idx
  on public.transactions (razorpay_order_id);

create or replace function public.apply_verified_razorpay_payment(
  p_user_id uuid,
  p_plan_name text,
  p_amount numeric,
  p_currency text,
  p_purple_gems integer,
  p_rainbow_gems integer,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transaction_id uuid;
  v_existing_transaction_id uuid;
  v_gems integer;
  v_rainbow_gems integer;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  if coalesce(trim(p_razorpay_payment_id), '') = '' then
    raise exception 'p_razorpay_payment_id is required';
  end if;

  insert into public.transactions (
    user_id,
    amount,
    gems_added,
    rainbow_gems_added,
    plan_name,
    currency,
    status,
    razorpay_order_id,
    razorpay_payment_id,
    verified_at
  )
  values (
    p_user_id,
    coalesce(p_amount, 0),
    greatest(coalesce(p_purple_gems, 0), 0),
    greatest(coalesce(p_rainbow_gems, 0), 0),
    coalesce(p_plan_name, 'Gem Pack'),
    coalesce(nullif(trim(p_currency), ''), 'INR'),
    'verified',
    nullif(trim(p_razorpay_order_id), ''),
    p_razorpay_payment_id,
    timezone('utc'::text, now())
  )
  on conflict (razorpay_payment_id) do nothing
  returning id into v_transaction_id;

  if v_transaction_id is null then
    select id
      into v_existing_transaction_id
      from public.transactions
     where razorpay_payment_id = p_razorpay_payment_id
     limit 1;

    select coalesce(gems, 0), coalesce(rainbow_gems, 0)
      into v_gems, v_rainbow_gems
      from public.profiles
     where id = p_user_id
     limit 1;

    return jsonb_build_object(
      'already_processed', true,
      'transaction_id', v_existing_transaction_id,
      'gems', coalesce(v_gems, 0),
      'rainbow_gems', coalesce(v_rainbow_gems, 0)
    );
  end if;

  update public.profiles
     set gems = coalesce(gems, 0) + greatest(coalesce(p_purple_gems, 0), 0),
         rainbow_gems = coalesce(rainbow_gems, 0) + greatest(coalesce(p_rainbow_gems, 0), 0)
   where id = p_user_id
   returning coalesce(gems, 0), coalesce(rainbow_gems, 0)
        into v_gems, v_rainbow_gems;

  if not found then
    raise exception 'Profile not found for user %', p_user_id;
  end if;

  return jsonb_build_object(
    'already_processed', false,
    'transaction_id', v_transaction_id,
    'gems', coalesce(v_gems, 0),
    'rainbow_gems', coalesce(v_rainbow_gems, 0)
  );
end;
$$;

grant execute on function public.apply_verified_razorpay_payment(
  uuid,
  text,
  numeric,
  text,
  integer,
  integer,
  text,
  text
) to service_role;
