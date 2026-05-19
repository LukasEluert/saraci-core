// ===== INPUT =====
export interface WebsiteCheckInput {
  url: string;
  target:
    | { type: "lead"; id: string }
    | { type: "result"; id: string }
    | { type: "standalone" };
}

// ===== ROHDATEN PRO PHASE =====
export interface ReachabilityData {
  ok: boolean;
  duration_ms: number;
  final_url: string;
  status_code: number | null;
  redirect_chain: string[];
  ssl: { valid: boolean; expires?: string; error?: string } | null;
  used_protocol: "https" | "http";
  error?: string;
}

export interface FetchData {
  status_code: number;
  response_time_ms: number;
  content_type: string;
  body_size_bytes: number;
  truncated: boolean;
}

export interface ParsedHtmlData {
  title: string | null;
  meta_description: string | null;
  body_text: string;
  h1_count: number;
  h1_texts: string[];
  lang: string | null;
  viewport_meta: string | null;
  favicon_present: boolean;
  image_count: number;
  images_without_alt: number;
  text_word_count: number;
  has_mixed_content: boolean;
  footer_links: string[];
  contact_signals: {
    tel_links: number;
    mailto_links: number;
    visible_phone_pattern: boolean;
    visible_email_pattern: boolean;
  };
  cta_signals: {
    contact_buttons: number;
    form_count: number;
  };
}

export interface PageSpeedData {
  perf_score: number | null;
  seo_score: number | null;
  a11y_score: number | null;
  lcp_ms: number | null;
  cls: number | null;
  fcp_ms: number | null;
  tbt_ms: number | null;
  mobile_friendly: boolean | null;
}

export interface PhaseError {
  phase: "reachability" | "fetch" | "parse" | "pagespeed";
  message: string;
  recoverable: boolean;
}

export interface RawCheckData {
  version: "1.0";
  checked_at: string;
  input_url: string;
  final_url: string | null;
  phases: {
    reachability?: ReachabilityData;
    fetch?: FetchData;
    html?: ParsedHtmlData;
    pagespeed?: PageSpeedData;
  };
  errors: PhaseError[];
}

// ===== FINDINGS & SCORE =====
export interface ScoreRule {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category:
    | "tech"
    | "performance"
    | "seo"
    | "design"
    | "content"
    | "legal"
    | "conversion";
  points: number;
  severity: "low" | "medium" | "high" | "critical";
  active: boolean;
}

export interface TriggeredRule {
  rule_key: string;
  label: string;
  category: ScoreRule["category"];
  severity: ScoreRule["severity"];
  points: number;
  evidence: string;
}

export interface ScoreBreakdown {
  tech: number;
  performance: number;
  seo: number;
  design: number;
  content: number;
  legal: number;
  conversion: number;
  total_deductions: number;
  final_score: number;
}

export interface ScoreResult {
  final_score: number;
  potential: "low" | "medium" | "high";
  breakdown: ScoreBreakdown;
  findings: TriggeredRule[];
}

// ===== REPORT =====
export interface LeadReportDraft {
  title: string;
  summary: string;
  body_markdown: string;
  recommendation: "webdesign" | "seo" | "site_care" | "mixed";
  key_findings: Array<{
    label: string;
    category: string;
    severity: string;
    evidence: string;
  }>;
}

// ===== ERGEBNIS =====
export interface WebsiteCheckResult {
  ok: boolean;
  check_id: string;
  report_id: string | null;
  score: number | null;
  potential: "low" | "medium" | "high" | null;
  status: "completed" | "failed";
  error?: string;
}
