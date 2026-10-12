-- AUDIT open item 7: increment_resource_downloads could be called by anyone
-- (anon too) any number of times, so the counter meant nothing. Now: logged-in
-- users only, counted once per user per resource per day.

create table if not exists public.resource_download_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  primary key (user_id, resource_id, day)
);
alter table public.resource_download_log enable row level security;
-- No policies: only the SECURITY DEFINER function below touches it.

create or replace function public.increment_resource_downloads(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return;
  end if;
  if not exists (select 1 from public.resources where id = p_resource_id and status = 'active') then
    return;
  end if;
  insert into public.resource_download_log (user_id, resource_id)
  values (v_uid, p_resource_id)
  on conflict do nothing;
  if found then
    update public.resources
       set downloads = downloads + 1
     where id = p_resource_id and status = 'active';
  end if;
end;
$function$;

revoke execute on function public.increment_resource_downloads(uuid) from public, anon;
grant execute on function public.increment_resource_downloads(uuid) to authenticated;
