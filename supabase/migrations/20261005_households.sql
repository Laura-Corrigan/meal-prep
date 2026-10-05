-- One JSON document per household, reachable only through two functions keyed
-- by a long random household id. The table itself is closed to the public key.
create table if not exists public.households (
  id text primary key check (length(id) >= 20),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.households enable row level security;
revoke all on public.households from anon, authenticated;

create or replace function public.mp_load(p_id text)
returns table (data jsonb, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select h.data, h.updated_at from public.households h
  where h.id = p_id and length(p_id) >= 20;
$$;

create or replace function public.mp_save(p_id text, p_data jsonb)
returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare ts timestamptz;
begin
  if length(p_id) < 20 then raise exception 'invalid household id'; end if;
  if pg_column_size(p_data) > 1000000 then raise exception 'payload too large'; end if;
  insert into public.households (id, data, updated_at) values (p_id, p_data, now())
  on conflict (id) do update set data = excluded.data, updated_at = now()
  returning households.updated_at into ts;
  return ts;
end;
$$;

revoke all on function public.mp_load(text) from public;
revoke all on function public.mp_save(text, jsonb) from public;
grant execute on function public.mp_load(text) to anon, authenticated;
grant execute on function public.mp_save(text, jsonb) to anon, authenticated;
