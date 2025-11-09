create extension if not exists pgcrypto;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  source_type text check (source_type in ('url','upload')) not null,
  source_url text,
  object_key text,
  status text check (status in ('pending','processing','error','done')) not null default 'pending',
  language text,
  duration_seconds int,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists artifacts (
  job_id uuid primary key references jobs(id) on delete cascade,
  txt_key text,
  srt_key text,
  vtt_key text,
  json_key text
);

create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_touch before update on jobs
for each row execute procedure touch_updated_at();
