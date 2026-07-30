alter table public.trip_settings
  add column if not exists timezone text not null default 'Asia/Taipei';
