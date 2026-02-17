-- Payout method per restaurant and driver: cash / gcash / crypto
-- Run after 005_commission_payouts.sql

alter table public.restaurant_config add column if not exists payout_method text default 'cash'
  check (payout_method in ('cash', 'gcash', 'crypto'));
alter table public.restaurant_config add column if not exists crypto_wallet_address text;

alter table public.drivers add column if not exists payout_method text default 'cash'
  check (payout_method in ('cash', 'gcash', 'crypto'));
alter table public.drivers add column if not exists crypto_wallet_address text;
