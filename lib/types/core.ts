export type PotenzialLevel = "niedrig" | "mittel" | "hoch";

export type LeadStatus =
  | "neu"
  | "kontaktiert"
  | "qualifiziert"
  | "angebot"
  | "gewonnen"
  | "verloren"
  | "abgelehnt";

export interface CoreLeadRow {
  id: string;
  firma: string | null;
  domain: string;
  branche: string | null;
  region: string | null;
  score: number | null;
  potenzial: string | null;
  status: string | null;
  notiz: string | null;
  naechster_schritt: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CoreSiteCheckRow {
  id: string;
  lead_id: string | null;
  checked_at: string;
  erreichbar: boolean | null;
  ssl_aktiv: boolean | null;
  http_status: number | null;
  ladezeit_ms: number | null;
  meta_title: boolean | null;
  meta_description: boolean | null;
  h1_vorhanden: boolean | null;
  sitemap: boolean | null;
  robots_txt: boolean | null;
  impressum: boolean | null;
  datenschutz: boolean | null;
  kontakt: boolean | null;
  score: number | null;
  raw_data: Record<string, unknown> | null;
}

export interface CoreBerichtRow {
  id: string;
  lead_id: string;
  inhalt: string | null;
  erstellt_at: string;
}

export interface SiteCheckResult {
  domain: string;
  url: string;
  score: number;
  potenzial: PotenzialLevel;
  erreichbar: boolean;
  ssl_aktiv: boolean;
  http_status: number | null;
  ladezeit_ms: number;
  meta_title: boolean;
  meta_description: boolean;
  h1_vorhanden: boolean;
  sitemap: boolean;
  robots_txt: boolean;
  impressum: boolean;
  datenschutz: boolean;
  kontakt: boolean;
}
