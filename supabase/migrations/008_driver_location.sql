-- Driver location for real-time tracking
alter table public.orders add column if not exists driver_lat double precision;
alter table public.orders add column if not exists driver_lng double precision;
alter table public.orders add column if not exists driver_location_updated_at timestamptz;
