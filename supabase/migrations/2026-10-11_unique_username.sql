-- STATUS: not applied yet (run it in the Supabase SQL editor when ready).
-- Usernames were not unique: two accounts could both be "@alex" (one such pair
-- already exists), so anyone could pose as another user on the leaderboard /
-- public profiles. A unique index can't be added until that existing pair is
-- resolved, so this trigger blocks NEW duplicates (case-insensitive) on insert
-- and on username change, and leaves existing rows alone.
-- Later, once duplicates are cleaned up:
--   create unique index profiles_username_lower_key on public.profiles (lower(username)) where coalesce(username,'') <> '';

create or replace function public.profiles_username_unique()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if coalesce(new.username, '') <> ''
     and (tg_op = 'INSERT' or lower(new.username) is distinct from lower(coalesce(old.username, '')))
     and exists (select 1 from public.profiles p
                 where lower(p.username) = lower(new.username) and p.id <> new.id) then
    raise exception 'Username already taken' using errcode = '23505';
  end if;
  return new;
end;
$function$;

drop trigger if exists profiles_username_unique on public.profiles;
create trigger profiles_username_unique
  before insert or update of username on public.profiles
  for each row execute function public.profiles_username_unique();

-- Rollback: drop trigger profiles_username_unique on public.profiles; drop function public.profiles_username_unique();
