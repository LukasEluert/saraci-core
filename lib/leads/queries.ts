import { createAdminClient } from "@/lib/supabase/admin";
import type {
  LeadDetail,
  LeadListFilters,
  LeadListItem,
  LeadReportRow,
  WebsiteCheckRow,
} from "./types";

const LEAD_SELECT = `
  *,
  industry:industries(id, name, slug),
  region:regions(id, name, slug),
  source:sources(id, name)
`;

export async function findLeadByNormalizedDomain(
  normalized: string
): Promise<{ id: string; firma: string | null } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("id, firma")
    .eq("normalized_domain", normalized)
    .neq("status", "rejected")
    .maybeSingle();

  return data ?? null;
}

export async function listLeads(
  filters: LeadListFilters
): Promise<{ leads: LeadListItem[]; total: number }> {
  const supabase = createAdminClient();
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  let query = supabase
    .from("leads")
    .select(LEAD_SELECT, { count: "exact" });

  if (filters.status?.length) {
    query = query.in("status", filters.status);
  }

  if (filters.potential?.length) {
    query = query.in("potential", filters.potential);
  }

  if (filters.score_min !== undefined) {
    query = query.gte("score", filters.score_min);
  }

  if (filters.score_max !== undefined) {
    query = query.lte("score", filters.score_max);
  }

  if (filters.q?.trim()) {
    const q = `%${filters.q.trim()}%`;
    query = query.or(`firma.ilike.${q},domain.ilike.${q},normalized_domain.ilike.${q}`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return {
    leads: (data ?? []) as LeadListItem[],
    total: count ?? 0,
  };
}

export async function leadHasPendingCheck(leadId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("core_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "lead.check_requested")
    .eq("processed", false)
    .filter("metadata->>lead_id", "eq", leadId);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function countPendingChecks(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("core_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "lead.check_requested")
    .eq("processed", false);

  if (error) return 0;
  return count ?? 0;
}

export async function getLeadDetail(leadId: string): Promise<LeadDetail | null> {
  const supabase = createAdminClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) return null;

  const { data: checks } = await supabase
    .from("website_checks")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  let report: LeadReportRow | null = null;
  if (lead.last_check_id) {
    const { data: reportRow } = await supabase
      .from("lead_reports")
      .select("*")
      .eq("check_id", lead.last_check_id)
      .maybeSingle();
    report = (reportRow as LeadReportRow) ?? null;
  }

  const pending_check = await leadHasPendingCheck(leadId);

  return {
    ...(lead as LeadListItem),
    checks: (checks ?? []) as WebsiteCheckRow[],
    report,
    pending_check,
  };
}

export async function getCheckDetail(
  leadId: string,
  checkId: string
): Promise<{ check: WebsiteCheckRow; report: LeadReportRow | null } | null> {
  const supabase = createAdminClient();

  const { data: check } = await supabase
    .from("website_checks")
    .select("*")
    .eq("id", checkId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (!check) return null;

  const { data: report } = await supabase
    .from("lead_reports")
    .select("*")
    .eq("check_id", checkId)
    .maybeSingle();

  return {
    check: check as WebsiteCheckRow,
    report: (report as LeadReportRow) ?? null,
  };
}

export async function getLeadForCheck(leadId: string): Promise<{
  id: string;
  domain: string;
  firma: string | null;
} | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("id, domain, firma")
    .eq("id", leadId)
    .maybeSingle();

  return data ?? null;
}
