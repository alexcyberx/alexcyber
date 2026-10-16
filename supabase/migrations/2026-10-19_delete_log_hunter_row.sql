-- Owner (2026-10-15, "baki kaam karo"): drop the inactive Log Hunter row (for-03)
-- for good. 0 solves; dependent rows (hint unlocks, flag attempts) cascade.
delete from public.ctf_challenges where slug = 'for-03' and status = 'inactive';
