-- Customer accounts, addresses, promos, reviews, loyalty, referrals, ETA, cancel window
-- Run after 006_payout_method.sql

-- Customer accounts (optional - phone links orders for guests)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  email text,
  name text,
  referral_code text unique,
  referred_by_id uuid references public.customers(id),
  loyalty_points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_customers_phone on public.customers(phone) where phone is not null;
create index if not exists idx_customers_referral_code on public.customers(referral_code) where referral_code is not null;

-- Saved delivery addresses
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  phone text not null,
  label text,
  landmark text not null,
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_zone_id text,
  delivery_zone_name text,
  delivery_distance_km numeric(6, 2),
  room text,
  floor text,
  guest_name text,
  created_at timestamptz default now()
);
create index if not exists idx_customer_addresses_phone on public.customer_addresses(phone);

-- Link orders to customer (optional)
alter table public.orders add column if not exists customer_id uuid references public.customers(id);

-- Promo codes
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null,
  min_order_php numeric(10, 2) default 0,
  max_uses integer,
  uses_count integer default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_promo_codes_code on public.promo_codes(code);

-- Promo usage (who used what)
create table if not exists public.promo_usage (
  id uuid primary key default gen_random_uuid(),
  promo_id uuid references public.promo_codes(id),
  order_id uuid references public.orders(id),
  phone text,
  created_at timestamptz default now()
);

-- Restaurant reviews
create table if not exists public.restaurant_reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_slug text not null,
  order_id uuid references public.orders(id),
  phone text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);
create index if not exists idx_restaurant_reviews_slug on public.restaurant_reviews(restaurant_slug);

-- Item reviews (optional - per item)
create table if not exists public.item_reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_slug text not null,
  item_name text not null,
  order_id uuid references public.orders(id),
  phone text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Referral credits
create table if not exists public.referral_credits (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.customers(id),
  referred_order_id uuid references public.orders(id),
  amount_php numeric(10, 2) not null,
  status text default 'pending' check (status in ('pending', 'applied', 'expired')),
  created_at timestamptz default now()
);

-- Order ETA and cancel window
alter table public.orders add column if not exists estimated_delivery_at timestamptz;
alter table public.orders add column if not exists cancel_cutoff_at timestamptz;
alter table public.orders add column if not exists driver_arrived_at timestamptz;
alter table public.orders add column if not exists promo_code text;
alter table public.orders add column if not exists discount_php numeric(10, 2) default 0;

-- Order messages (simple in-app chat)
create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'staff', 'driver', 'restaurant')),
  sender_id text,
  message text not null,
  created_at timestamptz default now()
);
create index if not exists idx_order_messages_order on public.order_messages(order_id);

-- RLS
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_usage enable row level security;
alter table public.restaurant_reviews enable row level security;
alter table public.item_reviews enable row level security;
alter table public.referral_credits enable row level security;
alter table public.order_messages enable row level security;

create policy "Allow all customers" on public.customers for all using (true) with check (true);
create policy "Allow all customer_addresses" on public.customer_addresses for all using (true) with check (true);
create policy "Allow all promo_codes" on public.promo_codes for all using (true) with check (true);
create policy "Allow all promo_usage" on public.promo_usage for all using (true) with check (true);
create policy "Allow all restaurant_reviews" on public.restaurant_reviews for all using (true) with check (true);
create policy "Allow all item_reviews" on public.item_reviews for all using (true) with check (true);
create policy "Allow all referral_credits" on public.referral_credits for all using (true) with check (true);
create policy "Allow all order_messages" on public.order_messages for all using (true) with check (true);
