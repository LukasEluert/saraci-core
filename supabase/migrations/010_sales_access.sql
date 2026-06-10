-- Migration 010: Sales Access
-- Erstellt: profiles, activities, appointments
-- Aktiviert: RLS auf leads (durch 010 hinzugefügte Policies)
-- Helper: is_admin() Funktion
-- 
-- Hinweis: Dieser Stand wurde aus der Live-DB rekonstruiert.
-- Falls die DB neu aufgesetzt wird, diese Migration nach 009 
-- ausführen.

-- 1) PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'vertrieb' 
    check (role in ('admin', 'vertrieb')),
  full_name text,
  calendar_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- 2) ACTIVITIES
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid not null references auth.users(id) default auth.uid(),
  typ text not null check (typ in ('anruf', 'mail', 'notiz')),
  ergebnis text,
  notiz text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_lead_id on activities(lead_id);
create index if not exists idx_activities_user_id on activities(user_id);
create index if not exists idx_activities_created_at on activities(created_at desc);

-- 3) APPOINTMENTS
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid not null references auth.users(id) default auth.uid(),
  titel text not null,
  faellig_am timestamptz not null,
  erledigt boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_user_id on appointments(user_id);
create index if not exists idx_appointments_faellig_am on appointments(faellig_am);

-- 4) is_admin() HELPER
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
$$;

-- 5) handle_new_user TRIGGER (Profile bei Signup anlegen)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, role)
  values (new.id, 'vertrieb')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 6) leads ERWEITERUNG (vermutlich in 010 hinzugefügt)
-- Falls assigned_to / created_by / akquise_status nicht schon 
-- existieren, hier ergänzen:
alter table leads 
  add column if not exists assigned_to uuid references auth.users(id),
  add column if not exists created_by uuid references auth.users(id);

-- akquise_status wird in 017_neue_akquise_status.sql gesetzt
-- (alter ENUM-Typ lead_status war hier in 010 ursprünglich)
-- Da 017 den Typ überschreibt, hier nicht doppeln.

-- 7) RLS AKTIVIEREN
alter table profiles enable row level security;
alter table activities enable row level security;
alter table appointments enable row level security;
alter table leads enable row level security;

-- 8) POLICIES: profiles
create policy "profiles_self_read" on profiles
  for select using (id = auth.uid() OR is_admin());

create policy "profiles_admin_write" on profiles
  for update using (is_admin());

-- 9) POLICIES: activities
create policy "act_select" on activities
  for select using (is_admin() OR user_id = auth.uid());

create policy "act_insert" on activities
  for insert with check (user_id = auth.uid());

create policy "act_modify" on activities
  for update using (is_admin() OR user_id = auth.uid());

create policy "act_delete" on activities
  for delete using (is_admin() OR user_id = auth.uid());

-- 10) POLICIES: appointments
create policy "app_select" on appointments
  for select using (is_admin() OR user_id = auth.uid());

create policy "app_insert" on appointments
  for insert with check (user_id = auth.uid());

create policy "app_modify" on appointments
  for update using (is_admin() OR user_id = auth.uid());

create policy "app_delete" on appointments
  for delete using (is_admin() OR user_id = auth.uid());

-- 11) POLICIES: leads
create policy "leads_select" on leads
  for select using (is_admin() OR assigned_to = auth.uid());

create policy "leads_insert" on leads
  for insert with check (is_admin() OR assigned_to = auth.uid());

create policy "leads_update" on leads
  for update using (is_admin() OR assigned_to = auth.uid());

create policy "leads_delete" on leads
  for delete using (is_admin());
