-- Saraci Core: Website-Check-Pipeline Schema + Seeds
-- In Supabase SQL Editor ausführen, falls noch nicht deployed.

create extension if not exists "pgcrypto";

-- Referenz-Tabellen
create table if not exists industries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Score-Regeln
create table if not exists score_rules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  category text not null check (
    category in ('tech', 'performance', 'seo', 'design', 'content', 'legal', 'conversion')
  ),
  points integer not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  normalized_domain text,
  firma text,
  branche text,
  region text,
  industry_id uuid references industries(id),
  region_id uuid references regions(id),
  source_id uuid references sources(id),
  has_website boolean default true,
  score integer,
  potential text check (potential in ('low', 'medium', 'high')),
  status text default 'neu',
  notiz text,
  naechster_schritt text,
  last_check_id uuid,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Research-Ergebnisse (vor Lead-Konversion)
create table if not exists research_results (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  normalized_url text,
  domain text,
  firma text,
  branche text,
  score integer,
  potential text check (potential in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'checked', 'converted', 'failed')),
  last_check_id uuid,
  lead_id uuid references leads(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Website-Checks
create table if not exists website_checks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  result_id uuid references research_results(id) on delete set null,
  input_url text not null,
  checked_url text,
  normalized_url text,
  status text not null check (status in ('completed', 'failed')),
  error_message text,
  score integer,
  potential text check (potential in ('low', 'medium', 'high')),
  findings jsonb default '[]'::jsonb,
  score_breakdown jsonb,
  raw_data jsonb,
  perf_score numeric,
  seo_score numeric,
  a11y_score numeric,
  lcp_ms numeric,
  cls numeric,
  created_at timestamptz default now()
);

alter table leads
  add constraint leads_last_check_id_fkey
  foreign key (last_check_id) references website_checks(id) on delete set null;

alter table research_results
  add constraint research_results_last_check_id_fkey
  foreign key (last_check_id) references website_checks(id) on delete set null;

-- Lead-Berichte
create table if not exists lead_reports (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references website_checks(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  result_id uuid references research_results(id) on delete set null,
  title text not null,
  summary text,
  body_markdown text not null,
  recommendation text check (recommendation in ('webdesign', 'seo', 'site_care', 'mixed')),
  key_findings jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Events
create table if not exists core_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  source_id uuid,
  source_label text,
  task_text text,
  metadata jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_website_checks_lead_id on website_checks(lead_id);
create index if not exists idx_website_checks_result_id on website_checks(result_id);
create index if not exists idx_website_checks_normalized_url on website_checks(normalized_url);
create index if not exists idx_lead_reports_check_id on lead_reports(check_id);

-- 18 aktive Score-Regeln (Punkte negativ = Abzug vom Basis-Score 100)
insert into score_rules (key, label, description, category, points, severity, active)
values
  ('no_https', 'Kein gültiges HTTPS', 'Seite läuft ohne HTTPS oder SSL-Zertifikat ungültig', 'tech', -25, 'critical', true),
  ('http_status_error', 'HTTP-Status nicht OK', 'Server antwortet nicht mit Status 200', 'tech', -30, 'critical', true),
  ('mixed_content', 'Mixed Content', 'HTTP-Ressourcen auf HTTPS-Seite', 'tech', -10, 'medium', true),
  ('no_favicon', 'Kein Favicon', 'Kein Favicon im head', 'design', -5, 'low', true),
  ('no_title', 'Kein Title-Tag', 'Fehlender oder leerer title', 'seo', -15, 'high', true),
  ('title_length_bad', 'Title-Länge suboptimal', 'Title außerhalb 20–70 Zeichen', 'seo', -8, 'medium', true),
  ('no_meta_description', 'Keine Meta-Description', 'meta description fehlt', 'seo', -10, 'medium', true),
  ('no_h1', 'H1-Probleme', 'Kein oder mehrere H1', 'seo', -10, 'medium', true),
  ('not_mobile_friendly', 'Nicht mobilfreundlich', 'Viewport oder PageSpeed Mobile-Friendly', 'seo', -15, 'high', true),
  ('images_no_alt', 'Bilder ohne Alt-Text', 'Über 50% der Bilder ohne Alt', 'content', -10, 'medium', true),
  ('low_text_content', 'Wenig Textinhalt', 'Unter 200 Wörter', 'content', -10, 'medium', true),
  ('no_impressum', 'Kein Impressum', 'Kein Impressum-Link im Footer', 'legal', -15, 'high', true),
  ('no_privacy_policy', 'Keine Datenschutzerklärung', 'Kein Datenschutz-Link im Footer', 'legal', -15, 'high', true),
  ('no_contact_info', 'Keine Kontaktdaten', 'Keine sichtbaren Kontaktwege', 'conversion', -10, 'medium', true),
  ('no_cta', 'Keine CTA', 'Keine Kontakt-Buttons oder Formulare', 'conversion', -10, 'medium', true),
  ('perf_score_low', 'Niedrige Performance', 'PageSpeed Mobile Performance unter 50', 'performance', -20, 'high', true),
  ('lcp_slow', 'Langsamer LCP', 'Largest Contentful Paint über 4s', 'performance', -15, 'high', true),
  ('cls_bad', 'Hoher CLS', 'Cumulative Layout Shift über 0.25', 'performance', -10, 'medium', true)
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category,
  points = excluded.points,
  severity = excluded.severity,
  active = excluded.active;
