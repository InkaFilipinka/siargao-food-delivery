-- Commission system and payouts
-- Run after 004_payment_methods.sql

-- Restaurant config: commission %, GCash, login credentials
create table if not exists public.restaurant_config (
  slug text primary key,
  commission_pct numeric(5, 2) default 30,
  delivery_commission_pct numeric(5, 2) default 30,
  gcash_number text,
  email text,
  password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_restaurant_config_email on public.restaurant_config(email) where email is not null;

-- Driver login and GCash
alter table public.drivers add column if not exists email text;
alter table public.drivers add column if not exists password_hash text;
alter table public.drivers add column if not exists gcash_number text;

-- Order items: store cost (what we pay restaurant) for payout calculation
alter table public.order_items add column if not exists cost_value numeric(10, 2);

-- Payout records
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null check (recipient_type in ('restaurant', 'driver')),
  recipient_id text not null,
  amount_php numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  reference text,
  order_ids uuid[] default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_payouts_recipient on public.payouts(recipient_type, recipient_id);
create index if not exists idx_payouts_paid_at on public.payouts(paid_at desc);

alter table public.restaurant_config enable row level security;
alter table public.payouts enable row level security;

create policy "Allow all restaurant_config" on public.restaurant_config for all using (true) with check (true);
create policy "Allow all payouts" on public.payouts for all using (true) with check (true);
