-- Run in the Supabase SQL Editor before seeding demo accounts.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  ref text not null unique,
  name text not null,
  email text not null unique,
  role text not null check (role in ('ADMIN', 'MANAGER', 'AGENT')),
  specialization text not null,
  skills text[] not null default '{}'
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  description text not null default '',
  manager_id uuid not null references public.profiles (id),
  deadline date not null,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  assignee_id uuid not null references public.profiles (id),
  deadline date not null,
  estimated_hours numeric not null check (estimated_hours > 0)
);

create index projects_manager_id_idx on public.projects (manager_id);
create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- No policies: anon and authenticated clients cannot read or write table rows.
-- Explicit service-role grants cover Supabase projects that no longer
-- automatically expose newly created public tables to the Data API.
grant select, insert, update, delete on public.profiles, public.projects, public.tasks to service_role;
revoke all on public.profiles, public.projects, public.tasks from anon, authenticated;
