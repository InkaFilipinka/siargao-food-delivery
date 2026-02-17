-- Track who last updated order (driver vs staff)
-- Restaurant updates go to order_restaurant_status, so they're separate

alter table public.orders add column if not exists updated_by text check (updated_by in ('staff', 'driver'));
