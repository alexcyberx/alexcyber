-- submit_contact_message: server-side limits (the old version only checked
-- "not empty / looks like an email / >= 10 chars", so anyone could insert
-- huge messages or flood the table through the public anon key).
-- Adds the same limits as the form (name <= 60, message 10..1000) and a
-- simple rate limit: 3 messages per email per hour, 60 per hour overall.
-- Safe to run anytime (same signature; the frontend already sends these limits).

create or replace function public.submit_contact_message(p_name text, p_email text, p_message text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_name  text := trim(coalesce(p_name, ''));
  v_email text := trim(coalesce(p_email, ''));
  v_msg   text := trim(coalesce(p_message, ''));
begin
  if length(v_name) = 0 then raise exception 'Name is required'; end if;
  if length(v_name) > 60 then raise exception 'Name is too long'; end if;
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Valid email is required';
  end if;
  if length(v_msg) < 10 then raise exception 'Message must be at least 10 characters'; end if;
  if length(v_msg) > 1000 then raise exception 'Message is too long'; end if;

  if (select count(*) from public.contact_messages
       where lower(email) = lower(v_email) and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.contact_messages
       where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Too many messages, please try again later';
  end if;

  insert into public.contact_messages (name, email, message) values (v_name, v_email, v_msg);
end;
$function$;

-- Rollback: re-create the previous version (see git history of this file's
-- predecessor in the DB dump) - it only lacked the limits above.
