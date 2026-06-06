-- 013: Lead "in Bearbeitung" (Handoff Vertrieb -> Admin)
-- Eigene Achse: wer arbeitet gerade an dem Lead und seit wann.
-- Bewusst getrennt von akquise_status und aktion_benoetigt (andere Bedeutung, nicht ueberschreiben).
-- bearbeitung_von = NULL -> niemand dran. Gesetzt -> diese Person arbeitet daran.
-- Keine neue RLS-Policy noetig: sitzt auf leads, deckt sich mit leads_select/leads_update.

alter table leads
  add column if not exists bearbeitung_von  uuid references auth.users(id),
  add column if not exists bearbeitung_seit timestamptz;
