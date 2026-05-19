-- Nachziehen, falls core_events ohne metadata angelegt wurde (z. B. alte core_events-Tabelle)
alter table core_events add column if not exists metadata jsonb;
