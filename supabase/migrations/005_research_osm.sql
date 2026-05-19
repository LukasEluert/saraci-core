-- OSM / Overpass Research (Jobs, Mappings, erweiterte research_results)

alter table sources add column if not exists slug text;
alter table sources add column if not exists type text;

create unique index if not exists sources_slug_key on sources (slug) where slug is not null;

insert into sources (slug, name, type)
values ('osm_overpass', 'OpenStreetMap / Overpass', 'api')
on conflict (name) do update set
  slug = excluded.slug,
  type = excluded.type;

alter table regions add column if not exists lat numeric;
alter table regions add column if not exists lng numeric;

update regions set lat = 48.7606, lng = 8.2398 where slug = 'baden-baden' and lat is null;

create table if not exists industry_osm_mapping (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid not null references industries(id) on delete cascade,
  osm_key text not null,
  osm_value text not null,
  created_at timestamptz default now(),
  unique (industry_id, osm_key, osm_value)
);

create table if not exists research_jobs (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid not null references industries(id),
  region_id uuid not null references regions(id),
  radius_km numeric not null,
  max_results integer not null,
  source_id uuid references sources(id),
  status text not null default 'running' check (
    status in ('running', 'completed', 'failed')
  ),
  started_at timestamptz,
  completed_at timestamptz,
  results_found integer default 0,
  error_message text,
  raw_response jsonb,
  created_at timestamptz default now()
);

alter table research_results alter column url drop not null;

alter table research_results drop constraint if exists research_results_status_check;
alter table research_results add constraint research_results_status_check check (
  status in ('pending', 'checked', 'converted', 'failed', 'new')
);

alter table research_results add column if not exists job_id uuid references research_jobs(id) on delete set null;
alter table research_results add column if not exists company_name text;
alter table research_results add column if not exists website_url text;
alter table research_results add column if not exists phone text;
alter table research_results add column if not exists address text;
alter table research_results add column if not exists lat numeric;
alter table research_results add column if not exists lng numeric;
alter table research_results add column if not exists source_ref text;
alter table research_results add column if not exists raw_data jsonb;
alter table research_results add column if not exists has_website boolean default false;
alter table research_results add column if not exists industry_id uuid references industries(id);
alter table research_results add column if not exists region_id uuid references regions(id);
alter table research_results add column if not exists source_id uuid references sources(id);

create index if not exists idx_research_results_job_id on research_results (job_id);
create index if not exists idx_research_results_normalized_url on research_results (normalized_url);
create index if not exists idx_industry_osm_mapping_industry on industry_osm_mapping (industry_id);

-- Beispiel-Mapping: Gastronomie
insert into industry_osm_mapping (industry_id, osm_key, osm_value)
select i.id, m.osm_key, m.osm_value
from industries i
cross join (
  values
    ('amenity', 'restaurant'),
    ('amenity', 'cafe')
) as m(osm_key, osm_value)
where i.slug = 'gastronomie'
on conflict (industry_id, osm_key, osm_value) do nothing;
