import type { TriggeredRule } from "@/lib/core/checks/types";

export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "won"
  | "lost"
  | "rejected"
  | "later";

export type LeadPotential = "low" | "medium" | "high";

export interface LeadRow {
  id: string;
  domain: string;
  normalized_domain: string | null;
  firma: string | null;
  branche: string | null;
  region: string | null;
  industry_id: string | null;
  region_id: string | null;
  source_id: string | null;
  has_website: boolean | null;
  score: number | null;
  potential: LeadPotential | null;
  status: string | null;
  notiz: string | null;
  naechster_schritt: string | null;
  last_check_id: string | null;
  last_checked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LeadListItem extends Omit<LeadRow, "branche" | "region"> {
  industry?: { id: string; name: string; slug: string | null } | null;
  region?: { id: string; name: string; slug: string | null } | null;
  source?: { id: string; name: string } | null;
}

export interface WebsiteCheckRow {
  id: string;
  lead_id: string | null;
  input_url: string;
  checked_url: string | null;
  normalized_url: string | null;
  status: "completed" | "failed";
  error_message: string | null;
  score: number | null;
  potential: LeadPotential | null;
  findings: TriggeredRule[];
  score_breakdown: Record<string, number> | null;
  perf_score: number | null;
  seo_score: number | null;
  a11y_score: number | null;
  lcp_ms: number | null;
  cls: number | null;
  created_at: string | null;
}

export interface LeadReportRow {
  id: string;
  check_id: string;
  lead_id: string | null;
  title: string;
  summary: string | null;
  body_markdown: string;
  recommendation: string | null;
  key_findings: unknown;
  created_at: string | null;
}

export interface LeadDetail extends LeadListItem {
  checks: WebsiteCheckRow[];
  report: LeadReportRow | null;
  pending_check: boolean;
}

export interface LeadListFilters {
  status?: string[];
  potential?: string[];
  score_min?: number;
  score_max?: number;
  q?: string;
  limit?: number;
  offset?: number;
}
