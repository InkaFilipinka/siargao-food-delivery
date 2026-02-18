-- Restaurant logo, food images, and extra menu items (admin-editable)
create table if not exists public.restaurant_media (
  slug text primary key,
  logo_url text,
  image_urls jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.restaurant_menu_extras (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  item_name text not null,
  price text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_restaurant_menu_extras_slug on public.restaurant_menu_extras(slug);

alter table public.restaurant_media enable row level security;
alter table public.restaurant_menu_extras enable row level security;
create policy "Allow all restaurant_media" on public.restaurant_media for all using (true) with check (true);
create policy "Allow all restaurant_menu_extras" on public.restaurant_menu_extras for all using (true) with check (true);
