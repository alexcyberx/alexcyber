-- Owner decision (2026-10-15): remove the Log Hunter room (for-03). It never
-- worked (its log file was never deployed) and had 0 solves.
-- Applied: hidden everywhere (only status = 'active' rooms are shown).
update public.ctf_challenges set status = 'inactive' where slug = 'for-03';
-- To also drop the row (needs a confirmed delete; solves / hint unlocks /
-- flag attempts cascade, there are none):
-- delete from public.ctf_challenges where slug = 'for-03';
