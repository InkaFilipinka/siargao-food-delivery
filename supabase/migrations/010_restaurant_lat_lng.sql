-- Add latitude and longitude to restaurant_config for distance calculation (user to restaurant)
alter table public.restaurant_config add column if not exists lat numeric(10, 7);
alter table public.restaurant_config add column if not exists lng numeric(10, 7);
