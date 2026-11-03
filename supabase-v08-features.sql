-- SOUTHLAKE OS v0.8 pilot features: run ONCE in the existing Southlake-Pilot project.
-- Additive only: does not delete or change existing jobs, photos, notes, users or assignments.
-- This migration is intended for the TWO-OWNER PILOT only, NOT employee rollout.
create extension if not exists pgcrypto;
create table if not exists public.job_change_orders (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.jobs(id) on delete cascade,
 title text not null,
 description text not null default '',
 source text not null default 'other' check (source in ('email','text','phone','onsite','other')),
 status text not null default 'draft' check (status in ('draft','submitted','approved','rejected','completed')),
 amount numeric(12,2),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.job_coordination_flags (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.jobs(id) on delete cascade,
 title text not null,
 details text not null default '',
 affected_departments text[] not null default '{}',
 status text not null default 'open' check (status in ('open','resolved')),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);
create index if not exists change_orders_job_created_idx on public.job_change_orders(job_id,created_at desc);
create index if not exists coordination_flags_job_created_idx on public.job_coordination_flags(job_id,created_at desc);
alter table public.job_change_orders enable row level security;
alter table public.job_coordination_flags enable row level security;
-- Temporary pilot policies: authenticated owners only because ONLY two owner accounts exist.
-- Replace these with role/job membership policies BEFORE adding staff.
drop policy if exists pilot_changes_read on public.job_change_orders;
drop policy if exists pilot_changes_add on public.job_change_orders;
drop policy if exists pilot_changes_update on public.job_change_orders;
drop policy if exists pilot_flags_read on public.job_coordination_flags;
drop policy if exists pilot_flags_add on public.job_coordination_flags;
drop policy if exists pilot_flags_update on public.job_coordination_flags;
create policy pilot_changes_read on public.job_change_orders for select to authenticated using (true);
create policy pilot_changes_add on public.job_change_orders for insert to authenticated with check (created_by=auth.uid());
create policy pilot_changes_update on public.job_change_orders for update to authenticated using (true) with check (true);
create policy pilot_flags_read on public.job_coordination_flags for select to authenticated using (true);
create policy pilot_flags_add on public.job_coordination_flags for insert to authenticated with check (created_by=auth.uid());
create policy pilot_flags_update on public.job_coordination_flags for update to authenticated using (true) with check (true);
