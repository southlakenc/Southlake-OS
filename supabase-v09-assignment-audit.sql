-- Optional audit trail for assignment removal. Run in Supabase SQL Editor BEFORE testing Remove.
-- Keeps existing jobs and assignments; does not modify authentication.
create table if not exists public.assignment_removal_history (
 id bigint generated always as identity primary key,
 assignment_id uuid,
 job_id uuid,
 employee_label text,
 department text,
 work_date date,
 removed_by uuid,
 removed_at timestamptz not null default now()
);
-- Keep history private to authenticated pilot owners; do not onboard employees with these pilot policies.
alter table public.assignment_removal_history enable row level security;
drop policy if exists "pilot_read_assignment_removals" on public.assignment_removal_history;
create policy "pilot_read_assignment_removals" on public.assignment_removal_history for select to authenticated using (true);
create or replace function public.record_assignment_removal() returns trigger
language plpgsql security definer set search_path = public as $$
begin
 insert into public.assignment_removal_history(assignment_id,job_id,employee_label,department,work_date,removed_by)
 values(old.id,old.job_id,old.employee_label,old.department,old.work_date,auth.uid());
 return old;
end $$;
drop trigger if exists assignment_removal_audit on public.assignments;
create trigger assignment_removal_audit before delete on public.assignments
for each row execute function public.record_assignment_removal();
-- Existing assignments RLS must permit DELETE for the two pilot owner accounts.
-- Do not add a broad delete policy here; inspect existing policies before enabling.
