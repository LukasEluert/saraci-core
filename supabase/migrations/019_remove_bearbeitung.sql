-- 019: bearbeitung_von/bearbeitung_seit entfernen (ersetzt durch assigned_to-Workflow)

alter table leads drop column if exists bearbeitung_von;
alter table leads drop column if exists bearbeitung_seit;
