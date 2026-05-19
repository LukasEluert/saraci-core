-- Aktiv-Flag für Branchen und Regionen (Einstellungen)

alter table industries add column if not exists active boolean not null default true;
alter table regions add column if not exists active boolean not null default true;
