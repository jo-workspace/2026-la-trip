alter table public.shopping_items
  add column if not exists price numeric not null default 0;
