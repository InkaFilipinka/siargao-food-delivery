-- Migration for existing orders table: add Phase 1 columns
-- Run this if you already have the old orders table

alter table public.orders add column if not exists landmark text;
alter table public.orders add column if not exists subtotal_php numeric(10, 2);
alter table public.orders add column if not exists delivery_fee_php numeric(10, 2) default 0;
alter table public.orders add column if not exists tip_php numeric(10, 2) default 0;
alter table public.orders add column if not exists priority_fee_php numeric(10, 2) default 0;
alter table public.orders add column if not exists delivery_zone_id text;
alter table public.orders add column if not exists delivery_zone_name text;
alter table public.orders add column if not exists delivery_distance_km numeric(6, 2);
alter table public.orders add column if not exists time_window text default 'asap';
alter table public.orders add column if not exists scheduled_at timestamptz;
alter table public.orders add column if not exists allow_substitutions boolean default true;
alter table public.orders add column if not exists confirmed_at timestamptz;
alter table public.orders add column if not exists ready_at timestamptz;
alter table public.orders add column if not exists assigned_at timestamptz;
alter table public.orders add column if not exists picked_at timestamptz;
alter table public.orders add column if not exists delivered_at timestamptz;

-- Backfill: if landmark is null, use delivery_address for old orders
update public.orders set landmark = coalesce(landmark, delivery_address) where landmark is null or landmark = '';
update public.orders set subtotal_php = total_php where subtotal_php is null;

-- Phase 2: allow status updates (for staff)
create policy "Allow update orders" on public.orders for update using (true);
