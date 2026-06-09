-- 014: Neuer Akquise-Status "rueckruf_offen" (Kunde will Rueckruf, kein fester Termin)
-- Manuell im Supabase SQL Editor ausfuehren.
-- Nur ALTER TYPE - kein Tabellen-Update im selben Statement (PG-ENUM-Regel).

ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'rueckruf_offen'
  AFTER 'rueckruf_vereinbart';
