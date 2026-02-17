-- Siargao Delivery - Orders schema (Phase 1)
-- For fresh install: run this entire file.
-- For existing DB: run supabase/migrations/001_phase1.sql instead.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  landmark text not null,
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_zone_id text,
  delivery_zone_name text,
  delivery_distance_km numeric(6, 2),
  notes text,
  subtotal_php numeric(10, 2) not null,
  delivery_fee_php numeric(10, 2) not null default 0,
  tip_php numeric(10, 2) not null default 0,
  priority_fee_php numeric(10, 2) not null default 0,
  total_php numeric(10, 2) not null,
  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked',
    'out_for_delivery', 'delivered', 'cancelled'
  )),
  time_window text not null default 'asap' check (time_window in ('asap', 'scheduled')),
  scheduled_at timestamptz,
  allow_substitutions boolean default true,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  ready_at timestamptz,
  assigned_at timestamptz,
  picked_at timestamptz,
  delivered_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  restaurant_name text not null,
  item_name text not null,
  price text not null,
  price_value numeric(10, 2) not null,
  quantity integer not null default 1
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Allow insert orders" on public.orders for insert with check (true);
create policy "Allow insert order_items" on public.order_items for insert with check (true);
create policy "Allow select orders" on public.orders for select using (true);
