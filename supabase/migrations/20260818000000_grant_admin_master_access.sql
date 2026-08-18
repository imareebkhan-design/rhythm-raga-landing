-- =========================================================================
-- Grant "Master Login Access" to the academy owner accounts.
--
-- In this codebase there is NO separate "master"/"superadmin" role. The
-- highest privilege is the 'admin' role in the public.app_role enum, checked
-- everywhere via public.has_role(auth.uid(), 'admin'). "Master Login Access"
-- is therefore implemented as a row in public.user_roles with role = 'admin'.
--
-- This migration is:
--   * idempotent  — re-runnable, `on conflict do nothing`
--   * safe        — matches only existing auth.users; never creates users,
--                   never touches passwords, never adds a hardcoded bypass
--   * a no-op     — for any email that has not signed up yet
--
-- PREREQUISITE: each person must first sign up at /auth so their auth.users
-- row exists. If a grant returns 0 rows, that account has not registered yet —
-- have them sign up, then re-run this statement.
-- =========================================================================

insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where lower(u.email) in (
  'imareebkhan@gmail.com',
  'rhytthmraga@gmail.com'
)
on conflict (user_id, role) do nothing;

-- Verify (run manually in the Supabase SQL editor):
--   select u.email, ur.role
--   from auth.users u
--   join public.user_roles ur on ur.user_id = u.id
--   where lower(u.email) in ('imareebkhan@gmail.com','rhytthmraga@gmail.com');

-- Reverse (run manually only if you need to revoke this grant):
--   delete from public.user_roles ur
--   using auth.users u
--   where ur.user_id = u.id
--     and ur.role = 'admin'
--     and lower(u.email) in ('imareebkhan@gmail.com','rhytthmraga@gmail.com');
