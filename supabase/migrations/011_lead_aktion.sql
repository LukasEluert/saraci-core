-- 011: Admin-Handoff / Handlungsbedarf-Flag auf Leads (idempotent)
-- Keine neuen RLS-Policies noetig: alles sitzt auf leads, bestehende Policies greifen.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'lead_aktion') then
    create type lead_aktion as enum ('keine','angebot','brief');
  end if;
end $$;

alter table leads
  add column if not exists aktion_benoetigt lead_aktion not null default 'keine',
  add column if not exists aktion_notiz text,
  add column if not exists aktion_seit  timestamptz,
  add column if not exists notiz        text;

-- Schneller Zugriff auf offene Handlungsbedarfe
create index if not exists idx_leads_aktion_benoetigt
  on leads (aktion_benoetigt) where aktion_benoetigt <> 'keine';
