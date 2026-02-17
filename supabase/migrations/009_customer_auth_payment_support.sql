-- Customer auth, saved payment methods, support tickets, driver availability
-- Run after 008_driver_location.sql

-- Customer password for login (hashed)
alter table public.customers add column if not exists password_hash text;

-- Stripe customer ID for saved payment methods
alter table public.customers add column if not exists stripe_customer_id text;

-- Saved payment methods (Stripe payment method IDs - store per customer)
create table if not exists public.customer_payment_methods (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  stripe_payment_method_id text not null,
  brand text,
  last4 text,
  is_default boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_customer_payment_methods_customer on public.customer_payment_methods(customer_id);

-- Support tickets (customer-initiated, staff responds)
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  phone text,
  email text,
  subject text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'staff')),
  message text not null,
  created_at timestamptz default now()
);
create index if not exists idx_support_messages_ticket on public.support_messages(ticket_id);

alter table public.customer_payment_methods enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

create policy "Allow all customer_payment_methods" on public.customer_payment_methods for all using (true) with check (true);
create policy "Allow all support_tickets" on public.support_tickets for all using (true) with check (true);
create policy "Allow all support_messages" on public.support_messages for all using (true) with check (true);

-- Restaurant editable hours and min order (dashboard)
alter table public.restaurant_config add column if not exists hours text;
alter table public.restaurant_config add column if not exists min_order_php numeric(10, 2);
