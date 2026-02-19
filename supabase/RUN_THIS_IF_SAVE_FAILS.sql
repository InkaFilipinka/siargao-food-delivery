-- Run this in Supabase Dashboard → SQL Editor if you get:
-- "Could not find the 'display_name' column..." or similar schema errors.
--
-- Adds: display_name, whatsapp_number, menu_url, hours_by_day, email, password_hash

alter table public.restaurant_config add column if not exists display_name text;
alter table public.restaurant_config add column if not exists whatsapp_number text;
alter table public.restaurant_config add column if not exists menu_url text;
alter table public.restaurant_config add column if not exists hours_by_day jsonb;
alter table public.restaurant_config add column if not exists email text;
alter table public.restaurant_config add column if not exists password_hash text;
create index if not exists idx_restaurant_config_email on public.restaurant_config(email) where email is not null;
