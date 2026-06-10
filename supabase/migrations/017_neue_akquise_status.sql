-- 017: Neues Akquise-Status-Enum (lead_status → lead_status_v2 → lead_status)

create type lead_status_v2 as enum (
  'neu',
  'in_kontakt',
  'nicht_erreicht',
  'rueckruf_vereinbart',
  'email_schreiben',
  'angebot_schreiben',
  'email_raus',
  'angebot_raus',
  'nachfassen',
  'kein_interesse',
  'kunde'
);

alter table leads alter column akquise_status drop default;

alter table leads
  alter column akquise_status type lead_status_v2
  using (
    case akquise_status::text
      when 'offen' then 'neu'::lead_status_v2
      when 'kein_interesse' then 'kein_interesse'::lead_status_v2
      when 'nicht_erreicht' then 'nicht_erreicht'::lead_status_v2
      when 'angebot_raus' then 'angebot_raus'::lead_status_v2
      when 'interesse' then 'neu'::lead_status_v2
      when 'rueckruf_offen' then 'in_kontakt'::lead_status_v2
      when 'rueckruf_vereinbart' then 'rueckruf_vereinbart'::lead_status_v2
      when 'kunde' then 'kunde'::lead_status_v2
      else 'neu'::lead_status_v2
    end
  );

alter table leads alter column akquise_status set default 'neu';

drop type lead_status;
alter type lead_status_v2 rename to lead_status;
