-- Wochenziel pro User (fuer Vertrieb)
alter table profiles
  add column if not exists weekly_call_target int not null default 50;

-- Optional: Default fuer Admin auf 0 falls Admin keine Anrufe macht
-- (kein UPDATE in Migration, nur Default; Lukas kann spaeter setzen)
