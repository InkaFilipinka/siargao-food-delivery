-- Opening hours by day (Mon-Sun)
-- Format: {"mon":"08:00-22:00","tue":"08:00-22:00",...,"sun":"09:00-21:00"}
-- "closed" or null for closed days. Falls back to existing hours column when null.
alter table public.restaurant_config add column if not exists hours_by_day jsonb;
