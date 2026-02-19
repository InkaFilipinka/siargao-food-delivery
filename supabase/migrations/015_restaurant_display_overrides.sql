-- Restaurant display overrides: name, WhatsApp, menu/order URL
-- When set, these override the default values shown on the site

alter table public.restaurant_config add column if not exists display_name text;
alter table public.restaurant_config add column if not exists whatsapp_number text;
alter table public.restaurant_config add column if not exists menu_url text;
