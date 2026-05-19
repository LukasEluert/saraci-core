-- Iteration 2: Lead-Pipeline (Status, Slugs, Quelle manual, Trigger updated_at)

insert into sources (name)
values ('manual')
on conflict (name) do nothing;

alter table industries add column if not exists slug text;
alter table regions add column if not exists slug text;

update industries set slug = lower(regexp_replace(name, '\s+', '-', 'g')) where slug is null;
update regions set slug = lower(regexp_replace(name, '\s+', '-', 'g')) where slug is null;

create unique index if not exists industries_slug_key on industries (slug) where slug is not null;
create unique index if not exists regions_slug_key on regions (slug) where slug is not null;

create index if not exists idx_leads_normalized_domain on leads (normalized_domain);
create index if not exists idx_leads_status on leads (status);
create index if not exists idx_leads_potential on leads (potential);
create index if not exists idx_core_events_type_processed on core_events (type, processed);

create or replace function leads_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute function leads_set_updated_at();
