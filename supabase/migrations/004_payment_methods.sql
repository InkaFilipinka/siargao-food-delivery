-- Add payment method and status to orders
alter table public.orders
  add column if not exists payment_method text default 'cash' check (payment_method in ('cash', 'card', 'gcash', 'crypto', 'paypal')),
  add column if not exists payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'cancelled'));
