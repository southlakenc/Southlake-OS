-- Southlake Operations Pilot schema. Run in Supabase SQL Editor.
-- This is a limited pilot schema, not the complete production permissions model.
create extension if not exists pgcrypto;

create table if not exists public.jobs (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 location text,
 status text not null default 'active' check (status in ('active','on_hold','completed')),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.assignments (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.jobs(id) on delete cascade,
 employee_label text not null,
 department text not null check (department in ('Flooring','Fixtures','Merchandise')),
 work_date date not null,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.job_notes (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.jobs(id) on delete cascade,
 body text not null,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.job_messages (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.jobs(id) on delete cascade,
 body text not null,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.job_photos (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.jobs(id) on delete cascade,
 storage_path text not null,
 file_name text not null,
 uploaded_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;
alter table public.assignments enable row level security;
alter table public.job_notes enable row level security;
alter table public.job_messages enable row level security;
alter table public.job_photos enable row level security;

-- Pilot-stage rule: any authenticated pilot account can access pilot records.
-- Only invite the two owners during initial testing. Tighten to membership/roles before adding staff.
create policy "pilot authenticated can read jobs" on public.jobs for select to authenticated using (true);
create policy "pilot authenticated can create jobs" on public.jobs for insert to authenticated with check (auth.uid() = created_by);
create policy "pilot authenticated can update jobs" on public.jobs for update to authenticated using (true) with check (true);
create policy "pilot authenticated can read assignments" on public.assignments for select to authenticated using (true);
create policy "pilot authenticated can create assignments" on public.assignments for insert to authenticated with check (auth.uid() = created_by);
create policy "pilot authenticated can read notes" on public.job_notes for select to authenticated using (true);
create policy "pilot authenticated can create notes" on public.job_notes for insert to authenticated with check (auth.uid() = created_by);
create policy "pilot authenticated can read messages" on public.job_messages for select to authenticated using (true);
create policy "pilot authenticated can create messages" on public.job_messages for insert to authenticated with check (auth.uid() = created_by);
create policy "pilot authenticated can read photo rows" on public.job_photos for select to authenticated using (true);
create policy "pilot authenticated can create photo rows" on public.job_photos for insert to authenticated with check (auth.uid() = uploaded_by);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('job-photos','job-photos',false,10485760,array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;
create policy "pilot authenticated can view job photos" on storage.objects for select to authenticated using (bucket_id = 'job-photos');
create policy "pilot authenticated can upload job photos" on storage.objects for insert to authenticated with check (bucket_id = 'job-photos');
