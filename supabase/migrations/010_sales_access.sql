-- 010: Vertriebs-Zugang + Akquise-Tracking
-- Rollen (profiles), Akquise-Status, Zuweisung, Aktivitaeten, Wiedervorlagen, RLS, Kalender-Token.
-- Trennung Admin/Vertrieb ausschliesslich ueber Row-Level Security (eine DB, kein Sync).

create extension if not exists pgcrypto;

-- Akquise-Status als stabiler Enum-Key.
-- Separate Spalte (akquise_status); die bestehende leads.status-Pipeline bleibt unangetastet.
do $$ begin
  create type lead_status as enum (
    'offen','nicht_erreicht','rueckruf_vereinbart',
    'interesse','angebot_raus','kein_interesse','kunde'
  );
exception when duplicate_object then null; end $$;

-- Bestehende leads-Tabelle erweitern (Spaltennamen an tatsaechliches Schema angepasst:
-- status existiert bereits als text -> daher akquise_status; telefon/email gibt es noch nicht).
alter table leads
  add column if not exists akquise_status lead_status not null default 'offen',
  add column if not exists assigned_to uuid references auth.users(id),
  add column if not exists created_by uuid references auth.users(id) default auth.uid(),
  add column if not exists telefon text,
  add column if not exists email text;

create index if not exists idx_leads_assigned_to on leads (assigned_to);
create index if not exists idx_leads_akquise_status on leads (akquise_status);

-- Profile + Rolle + privater Kalender-Token (unguessbar, revozierbar)
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null default 'vertrieb' check (role in ('admin','vertrieb')),
  full_name      text,
  calendar_token uuid not null default gen_random_uuid(),
  created_at     timestamptz not null default now()
);

-- Profil automatisch bei Signup anlegen
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Profile fuer bereits bestehende Nutzer nachziehen (Trigger feuert nur bei neuen Signups)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Aktivitaeten (Anruf/Mail/Notiz)
create table if not exists activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  user_id    uuid not null references auth.users(id) default auth.uid(),
  typ        text not null check (typ in ('anruf','mail','notiz')),
  ergebnis   text,
  notiz      text,
  created_at timestamptz not null default now()
);

-- Wiedervorlagen / Rueckruf-Termine -> gehen in den Kalender
create table if not exists appointments (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete cascade,
  user_id    uuid not null references auth.users(id) default auth.uid(),
  titel      text not null,
  faellig_am timestamptz not null,
  erledigt   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_lead_id on activities (lead_id);
create index if not exists idx_appointments_user_due
  on appointments (user_id, faellig_am) where erledigt = false;

-- Helper: ist der aktuelle User Admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table profiles     enable row level security;
alter table leads        enable row level security;
alter table activities   enable row level security;
alter table appointments enable row level security;

-- profiles: jeder liest sein Profil; Admin liest/aendert alle
drop policy if exists profiles_self_read on profiles;
create policy profiles_self_read on profiles
  for select using (id = auth.uid() or is_admin());
drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles
  for update using (is_admin());

-- leads: Admin alles; Vertrieb nur zugewiesene
drop policy if exists leads_select on leads;
create policy leads_select on leads
  for select using (is_admin() or assigned_to = auth.uid());
drop policy if exists leads_update on leads;
create policy leads_update on leads
  for update using (is_admin() or assigned_to = auth.uid());
drop policy if exists leads_insert on leads;
create policy leads_insert on leads
  for insert with check (is_admin() or assigned_to = auth.uid());
drop policy if exists leads_delete on leads;
create policy leads_delete on leads
  for delete using (is_admin());

-- activities: Admin alles; Vertrieb nur eigene
drop policy if exists act_select on activities;
create policy act_select on activities
  for select using (is_admin() or user_id = auth.uid());
drop policy if exists act_insert on activities;
create policy act_insert on activities
  for insert with check (user_id = auth.uid());
drop policy if exists act_modify on activities;
create policy act_modify on activities
  for update using (is_admin() or user_id = auth.uid());
drop policy if exists act_delete on activities;
create policy act_delete on activities
  for delete using (is_admin() or user_id = auth.uid());

-- appointments: identisches Muster
drop policy if exists app_select on appointments;
create policy app_select on appointments
  for select using (is_admin() or user_id = auth.uid());
drop policy if exists app_insert on appointments;
create policy app_insert on appointments
  for insert with check (user_id = auth.uid());
drop policy if exists app_modify on appointments;
create policy app_modify on appointments
  for update using (is_admin() or user_id = auth.uid());
drop policy if exists app_delete on appointments;
create policy app_delete on appointments
  for delete using (is_admin() or user_id = auth.uid());

-- Nach der Migration EINMALIG den Owner zum Admin machen:
--   update profiles set role = 'admin' where id = '<deine-user-id>';
