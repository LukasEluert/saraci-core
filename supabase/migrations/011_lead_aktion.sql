-- Migration 011: Lead Aktion (historisch)
-- 
-- Diese Migration wurde später durch 018_remove_aktion_benoetigt.sql
-- wieder entfernt. Inhalt hier nur für historische Reproduzierbarkeit:
-- Wenn die DB von Grund auf neu aufgesetzt wird, kann diese 
-- Migration übersprungen werden (018 würde sonst nichts zu löschen 
-- vorfinden).
--
-- Originaler Inhalt war:

-- create type lead_aktion as enum ('keine', 'angebot', 'brief');
-- 
-- alter table leads
--   add column aktion_benoetigt lead_aktion not null default 'keine',
--   add column aktion_notiz text,
--   add column aktion_seit timestamptz;

-- Aktion: KEINE - diese Migration ist historisch und wird durch
-- 018 negiert. Bei neuem Setup einfach skippen.
