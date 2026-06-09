-- 015: Core-Pipeline leads.status normalisieren (deutsch -> englisch) + CHECK-Constraint
-- Manuell im Supabase SQL Editor ausfuehren.
--
-- Diagnose vorher (optional):
--   SELECT DISTINCT status, COUNT(*) FROM leads GROUP BY status ORDER BY status;

-- Legacy deutsche Werte auf englische Konstanten mappen
UPDATE leads SET status = 'new' WHERE status = 'neu';
UPDATE leads SET status = 'won' WHERE status = 'gewonnen';
UPDATE leads SET status = 'lost' WHERE status = 'verloren';
UPDATE leads SET status = 'qualified' WHERE status = 'qualifiziert';
UPDATE leads SET status = 'contacted' WHERE status = 'kontaktiert';
UPDATE leads SET status = 'rejected' WHERE status = 'abgelehnt';

ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new';

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (
  status IN ('new', 'qualified', 'contacted', 'won', 'lost', 'rejected', 'later')
);
