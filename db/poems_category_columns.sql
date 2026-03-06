-- Consolidate all poem content into the main `poems` table.
-- Ensures category mapping fields exist for admin uploads and frontend routing.

alter table if exists public.poems
  add column if not exists category text;

alter table if exists public.poems
  add column if not exists animal_id text;

alter table if exists public.poems
  add column if not exists animal_name text;

alter table if exists public.poems
  add column if not exists subcategory text;

create index if not exists poems_category_idx on public.poems (category);
create index if not exists poems_animal_id_idx on public.poems (animal_id);
