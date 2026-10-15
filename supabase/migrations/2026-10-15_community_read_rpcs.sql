-- 2026-10-15: read RPCs for the Next.js community page (applied).
-- get_community_threads: one call for the list, pinned first then newest
-- (the old page sorted by status text, so 'pinned' came last and could be cut
-- by limit 50), approved reply counts counted in SQL (the old page downloaded
-- every reply row, capped at 1000, and counted the viewer's own unapproved
-- ones), one author rule for list and thread: username, else full name.
CREATE OR REPLACE FUNCTION public.get_community_threads(p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, title text, category text, status text, votes integer, created_at timestamptz, author text, author_id uuid, reply_count bigint)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select t.id, t.title, t.category, t.status, coalesce(t.votes, 0), t.created_at,
         coalesce(nullif(p.username, ''), nullif(p.full_name, ''), 'User') as author, t.user_id,
         (select count(*) from community_replies r where r.thread_id = t.id and r.status = 'approved') as reply_count
  from community_threads t
  left join profiles p on p.id = t.user_id
  order by (t.status = 'pinned') desc, t.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$function$;
GRANT EXECUTE ON FUNCTION public.get_community_threads(integer) TO anon, authenticated;

-- Same author rule in the thread view (was username only), left join so a
-- thread whose author has no profile row still shows.
CREATE OR REPLACE FUNCTION public.get_thread_with_replies(p_thread_id uuid)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare
  v_thread json;
  v_replies json;
begin
  select json_build_object(
    'id', t.id, 'title', t.title, 'body', t.body, 'category', t.category,
    'status', t.status, 'votes', coalesce(t.votes, 0), 'created_at', t.created_at,
    'author', coalesce(nullif(p.username, ''), nullif(p.full_name, ''), 'User'), 'author_id', t.user_id
  ) into v_thread
  from public.community_threads t
  left join public.profiles p on p.id = t.user_id
  where t.id = p_thread_id;

  if v_thread is null then return null; end if;

  select coalesce(json_agg(row_to_json(r) order by r.created_at asc), '[]'::json) into v_replies
  from (
    select cr.id, cr.body, coalesce(cr.votes, 0) as votes, cr.created_at, cr.user_id,
           coalesce(nullif(p.username, ''), nullif(p.full_name, ''), 'User') as author
    from public.community_replies cr
    left join public.profiles p on p.id = cr.user_id
    where cr.thread_id = p_thread_id and cr.status = 'approved'
  ) r;

  return json_build_object('thread', v_thread, 'replies', v_replies);
end;
$function$;
