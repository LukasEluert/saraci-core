import { createAdminClient } from "@/lib/supabase/admin";
import { countPendingChecks } from "@/lib/leads/queries";
import type { LeadPotential } from "@/lib/leads/types";

export type OverviewStats = {
  totalLeads: number;
  newLeadsWeek: number;
  highPotential: number;
  openPipeline: number;
  pendingChecks: number;
  completedResearchJobs: number;
  lastCheckAt: string | null;
};

export type RecentCheckRow = {
  checkId: string;
  leadId: string;
  checkedAt: string;
  score: number | null;
  potential: LeadPotential | null;
  firma: string | null;
  domain: string;
};

const OPEN_STATUSES = ["new", "qualified", "contacted"];

export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = createAdminClient();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString();

  const [
    totalRes,
    newWeekRes,
    highRes,
    pipelineRes,
    researchRes,
    lastCheckRes,
    pendingChecks,
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("potential", "high"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("status", OPEN_STATUSES),
    supabase
      .from("research_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("website_checks")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    countPendingChecks(),
  ]);

  return {
    totalLeads: totalRes.count ?? 0,
    newLeadsWeek: newWeekRes.count ?? 0,
    highPotential: highRes.count ?? 0,
    openPipeline: pipelineRes.count ?? 0,
    pendingChecks,
    completedResearchJobs: researchRes.count ?? 0,
    lastCheckAt: lastCheckRes.data?.created_at ?? null,
  };
}

export async function getRecentChecks(
  limit = 8
): Promise<RecentCheckRow[]> {
  const supabase = createAdminClient();

  const { data: checks, error } = await supabase
    .from("website_checks")
    .select("id, lead_id, score, potential, created_at")
    .not("lead_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = checks ?? [];
  const leadIds = [
    ...new Set(rows.map((c) => c.lead_id).filter((id): id is string => !!id)),
  ];

  if (leadIds.length === 0) return [];

  const { data: leads } = await supabase
    .from("leads")
    .select("id, firma, domain, potential")
    .in("id", leadIds);

  const leadMap = new Map((leads ?? []).map((l) => [l.id, l]));

  return rows
    .filter((c): c is typeof c & { lead_id: string } => !!c.lead_id)
    .map((c) => {
      const lead = leadMap.get(c.lead_id);
      return {
        checkId: c.id,
        leadId: c.lead_id,
        checkedAt: c.created_at ?? new Date().toISOString(),
        score: c.score,
        potential: (c.potential ?? lead?.potential) as LeadPotential | null,
        firma: lead?.firma ?? null,
        domain: lead?.domain ?? "—",
      };
    });
}
