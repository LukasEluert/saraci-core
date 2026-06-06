-- 012: Leads archivieren statt hart loeschen
-- Schuetzt vor Fehlklick-Verlust: ein Lead wird nur ausgeblendet, bleibt wiederherstellbar.
-- Archivieren laeuft ueber leads_update (Admin oder assigned_to = auth.uid()) -> RLS unveraendert.

alter table leads
  add column if not exists archiviert boolean not null default false;

-- Standard-Listen filtern auf archiviert = false -> Teilindex haelt den haeufigen Fall schnell.
create index if not exists idx_leads_archiviert on leads (archiviert) where archiviert = false;
