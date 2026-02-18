-- Add customer_whatsapp so restaurant can contact customer via WhatsApp (tourists often use foreign SIM)
alter table public.orders add column if not exists customer_whatsapp text;
