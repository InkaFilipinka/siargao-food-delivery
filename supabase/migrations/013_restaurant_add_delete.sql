-- Support Add/Delete restaurants in admin
create table if not exists public.hidden_restaurants (
  slug text primary key
);

-- Admin-added restaurants (full record)
create table if not exists public.admin_restaurants (
  slug text primary key,
  name text not null,
  categories text[] default '{}',
  price_range text,
  tags text[] default '{}',
  menu_url text,
  created_at timestamptz default now()
);

alter table public.hidden_restaurants enable row level security;
alter table public.admin_restaurants enable row level security;
create policy "Allow all hidden_restaurants" on public.hidden_restaurants for all using (true) with check (true);
create policy "Allow all admin_restaurants" on public.admin_restaurants for all using (true) with check (true);
