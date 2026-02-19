-- Store Stripe PaymentIntent ID and card last4/brand on orders for refunds and admin display
-- PCI-safe: only last 4 digits stored; full card never touched

alter table public.orders add column if not exists stripe_payment_intent_id text;
alter table public.orders add column if not exists card_last4 text;
alter table public.orders add column if not exists card_brand text;

