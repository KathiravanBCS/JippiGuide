-- Places schema for Supabase
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  significance text,
  travel_tips text[] default '{}',
  category text not null check (category in ('landmark','restaurant','cafe','park','temple','adventure','transport')),
  city text,
  country text,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  hours text,
  website text,
  phone text,
  images text[] default '{}',
  tags text[] default '{}',
  rating numeric(3,1),
  inserted_at timestamptz default now()
);

-- Text search
create index if not exists places_name_trgm on public.places using gin (name gin_trgm_ops);
create index if not exists places_desc_trgm on public.places using gin (description gin_trgm_ops);
create index if not exists places_tags_gin on public.places using gin (tags);
create index if not exists places_category_idx on public.places (category);
create index if not exists places_geo_idx on public.places (latitude, longitude);
