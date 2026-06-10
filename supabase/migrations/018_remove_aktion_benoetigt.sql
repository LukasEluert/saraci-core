-- 018: aktion_benoetigt-Achse entfernen (ersetzt durch assigned_to-Workflow)

-- Leads mit offener Angebot-Aktion an Admin zuweisen (falls noch gesetzt)
update leads l
set assigned_to = sub.id
from (
  select id from profiles where role = 'admin' order by created_at asc limit 1
) sub
where l.aktion_benoetigt = 'angebot'
  and sub.id is not null;

alter table leads drop column if exists aktion_benoetigt;
alter table leads drop column if exists aktion_notiz;
alter table leads drop column if exists aktion_seit;

drop type if exists lead_aktion;
