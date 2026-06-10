-- Notiz-Historie pro Lead (ersetzt leads.notiz im App-Code; Spalte bleibt als Backup).

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  inhalt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lead_notes_lead_id on lead_notes(lead_id);
create index if not exists idx_lead_notes_created_at on lead_notes(created_at desc);

create or replace function lead_notes_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lead_notes_updated_at on lead_notes;
create trigger set_lead_notes_updated_at
  before update on lead_notes
  for each row execute function lead_notes_set_updated_at();

alter table lead_notes enable row level security;

create policy "lead_notes_select" on lead_notes
  for select using (
    is_admin() OR
    exists (
      select 1 from leads
      where leads.id = lead_notes.lead_id
      and leads.assigned_to = auth.uid()
    )
  );

create policy "lead_notes_insert" on lead_notes
  for insert with check (
    user_id = auth.uid() AND (
      is_admin() OR
      exists (
        select 1 from leads
        where leads.id = lead_notes.lead_id
        and leads.assigned_to = auth.uid()
      )
    )
  );

create policy "lead_notes_update" on lead_notes
  for update using (
    is_admin() OR user_id = auth.uid()
  );

create policy "lead_notes_delete" on lead_notes
  for delete using (
    is_admin() OR user_id = auth.uid()
  );

-- Bestehende leads.notiz als erste Notiz uebernehmen.
insert into lead_notes (lead_id, user_id, inhalt, created_at)
select
  id,
  coalesce(assigned_to, created_by),
  notiz,
  updated_at
from leads
where notiz is not null
  and trim(notiz) != ''
  and coalesce(assigned_to, created_by) is not null;
