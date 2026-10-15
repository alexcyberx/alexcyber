-- Owner request (2026-10-15): when something new goes live, every user sees it
-- under Profile -> Notifications (instead of a "what's new" strip on home).
-- Uses the existing broadcast notifications (user_id is null) + notification_reads.

alter table public.notifications add column if not exists link text;

-- One broadcast per new thing; the link doubles as the "already announced" key.
create or replace function public.acx_announce(p_type text, p_title text, p_body text, p_link text)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if p_link is not null and exists (select 1 from public.notifications where user_id is null and link = p_link) then
    return;
  end if;
  insert into public.notifications (user_id, title, body, type, read, link)
  values (null, p_title, p_body, p_type, false, p_link);
end;
$$;
revoke execute on function public.acx_announce(text, text, text, text) from public, anon, authenticated;

create or replace function public.acx_notify_new_content()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if tg_table_name = 'ctf_challenges' then
    if new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from 'active') then
      perform public.acx_announce('ctf', 'New CTF room: ' || new.title,
        left(coalesce(new.description, ''), 140), '/rooms?open=' || new.slug);
    end if;
  elsif tg_table_name = 'courses' then
    if new.enabled and (tg_op = 'INSERT' or not coalesce(old.enabled, false)) then
      perform public.acx_announce('course', 'New course: ' || new.title,
        left(coalesce(new.description, ''), 140),
        case new.page_key when 'learn' then '/tutorials/network-forensics'
                          when 'learn2' then '/tutorials/cyber-attacks-fundamentals'
                          when 'learn3' then '/tutorials/ethical-hacking'
                          else '/tutorials' end);
    end if;
  elsif tg_table_name = 'blog_posts' then
    if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
      perform public.acx_announce('blog', 'New on the blog: ' || new.title,
        left(coalesce(new.meta_desc, ''), 140), '/blog/' || new.slug);
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_notify_ctf after insert or update of status on public.ctf_challenges
  for each row execute function public.acx_notify_new_content();
create trigger trg_notify_course after insert or update of enabled on public.courses
  for each row execute function public.acx_notify_new_content();
create trigger trg_notify_blog after insert or update of status on public.blog_posts
  for each row execute function public.acx_notify_new_content();

-- Same as get_notifications, plus the link (a new name: the old one keeps its
-- return type for the old SPA profile page).
create or replace function public.get_notifications_feed(p_limit integer default 30)
returns table(id uuid, title text, body text, type text, link text, read boolean, created_at timestamptz)
language sql security definer set search_path to 'public' as $$
  select n.id, n.title, n.body, n.type, n.link,
    case when n.user_id is not null then n.read
         else exists (select 1 from public.notification_reads nr where nr.notification_id = n.id and nr.user_id = auth.uid())
    end,
    n.created_at
  from public.notifications n
  where auth.uid() is not null and (n.user_id = auth.uid() or n.user_id is null)
  order by n.created_at desc
  limit least(greatest(coalesce(p_limit, 30), 1), 100);
$$;
revoke execute on function public.get_notifications_feed(integer) from public, anon;
grant execute on function public.get_notifications_feed(integer) to authenticated;
