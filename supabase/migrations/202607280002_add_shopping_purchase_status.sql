alter table public.shopping_items
  add column if not exists purchase_status text not null default 'pending';

update public.shopping_items
set purchase_status = case
  when coalesce(bought, false) then 'purchased'
  else 'pending'
end
where purchase_status = 'pending';
