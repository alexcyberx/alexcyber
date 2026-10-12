-- Step 5b: one report per user per thread/reply, and every report points at
-- exactly one thing. The Next thread page maps 23505 to "You have already
-- reported this." (the table was empty when this was applied).

alter table public.community_reports
  add constraint community_reports_one_target_check
  check ((thread_id is not null) <> (reply_id is not null));

create unique index if not exists community_reports_reporter_thread_uniq
  on public.community_reports (reporter_id, thread_id) where reply_id is null;

create unique index if not exists community_reports_reporter_reply_uniq
  on public.community_reports (reporter_id, reply_id) where reply_id is not null;
