-- Restaurant portal auto-add: ensure restaurant_config has email and password_hash for portal login
-- Run in Supabase Dashboard → SQL Editor. Safe to run (uses "if not exists").

alter table public.restaurant_config add column if not exists email text;
alter table public.restaurant_config add column if not exists password_hash text;
create index if not exists idx_restaurant_config_email on public.restaurant_config(email) where email is not null;
