-- Restaurant acceptance, drivers, cash ledger
-- Run after 001_phase1_new_columns.sql

-- Per-restaurant order acceptance (multi-restaurant orders)
create table if not exists public.order_restaurant_status (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  restaurant_slug text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  prep_mins integer,  -- 5, 10, 20, 30, 45
  accepted_at timestamptz,
  unique(order_id, restaurant_slug)
);
create index if not exists idx_order_restaurant_status_order on public.order_restaurant_status(order_id);

-- Drivers
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Assign driver to order
alter table public.orders add column if not exists driver_id uuid references public.drivers(id);
alter table public.orders add column if not exists arrived_at_hub_at timestamptz;

-- Cash ledger fields on orders
alter table public.orders add column if not exists payment_method text default 'cash' check (payment_method in ('cash', 'digital'));
alter table public.orders add column if not exists cash_received_by_driver numeric(10, 2);
alter table public.orders add column if not exists cash_turned_in numeric(10, 2);
alter table public.orders add column if not exists cash_variance_reason text;

-- Item availability (86 list) - restaurant_slug + item_name
create table if not exists public.item_availability (
  id uuid primary key default gen_random_uuid(),
  restaurant_slug text not null,
  item_name text not null,
  available boolean default true,
  updated_at timestamptz default now(),
  unique(restaurant_slug, item_name)
);
create index if not exists idx_item_availability_restaurant on public.item_availability(restaurant_slug);

alter table public.order_restaurant_status enable row level security;
alter table public.drivers enable row level security;
alter table public.item_availability enable row level security;

create policy "Allow all order_restaurant_status" on public.order_restaurant_status for all using (true) with check (true);
create policy "Allow all drivers" on public.drivers for all using (true) with check (true);
create policy "Allow all item_availability" on public.item_availability for all using (true) with check (true);
