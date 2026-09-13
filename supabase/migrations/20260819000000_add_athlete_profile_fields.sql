alter table public.athletes
  add column if not exists dob date,
  add column if not exists age integer,
  add column if not exists phone text;