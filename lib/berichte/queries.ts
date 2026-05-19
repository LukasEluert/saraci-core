import { createAdminClient } from "@/lib/supabase/admin";
import type { LeadPotential } from "@/lib/leads/types";

export type BerichtListItem = {
  id: string;
  check_id: string;
  lead_id: string;
  title: string;
  summary: string | null;
  body_markdown: string;
  recommendation: string | null;
  created_at: string | null;
  lead_domain: string;
  lead_firma: string | null;
  lead_potential: LeadPotential | null;
  check_score: number | null;
};

export async function listLeadReports(limit = 100): Promise<BerichtListItem[]> {
  const supabase = createAdminClient();

  const { data: reports, error } = await supabase
    .from("lead_reports")
    .select(
      "id, check_id, lead_id, title, summary, body_markdown, recommendation, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  if (!reports?.length) return [];

  const checkIds = [...new Set(reports.map((r) => r.check_id))];
  const leadIds = [
    ...new Set(
      reports.map((r) => r.lead_id).filter((id): id is string => !!id)
    ),
  ];

  const [{ data: checks }, { data: leads }] = await Promise.all([
    supabase.from("website_checks").select("id, score, potential").in("id", checkIds),
    leadIds.length
      ? supabase.from("leads").select("id, domain, firma, potential").in("id", leadIds)
      : Promise.resolve({ data: [] as { id: string; domain: string; firma: string | null; potential: string | null }[] }),
  ]);

  const checkMap = new Map((checks ?? []).map((c) => [c.id, c]));
  const leadMap = new Map((leads ?? []).map((l) => [l.id, l]));

  return reports.map((r) => {
    const lead = r.lead_id ? leadMap.get(r.lead_id) : undefined;
    const check = checkMap.get(r.check_id);

    return {
      id: r.id,
      check_id: r.check_id,
      lead_id: r.lead_id ?? "",
      title: r.title,
      summary: r.summary,
      body_markdown: r.body_markdown,
      recommendation: r.recommendation,
      created_at: r.created_at,
      lead_domain: lead?.domain ?? "—",
      lead_firma: lead?.firma ?? null,
      lead_potential: (check?.potential ??
        lead?.potential) as LeadPotential | null,
      check_score: check?.score ?? null,
    };
  });
}
