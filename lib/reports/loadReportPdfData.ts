import type { TriggeredRule } from "@/lib/core/checks/types";
import { LeadReportPdfError } from "@/lib/reports/errors";
import type { LeadReportPdfData } from "@/lib/reports/types";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loadLeadReportPdfData(
  leadId: string
): Promise<LeadReportPdfData> {
  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select(
      `
      id,
      firma,
      domain,
      last_check_id,
      industry:industries(name),
      region:regions(name)
    `
    )
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    throw new LeadReportPdfError(leadError.message, 500);
  }

  if (!lead) {
    throw new LeadReportPdfError("Lead nicht gefunden.", 404);
  }

  const checkId = lead.last_check_id;
  if (!checkId) {
    throw new LeadReportPdfError(
      "Kein Website-Check für diesen Lead vorhanden.",
      404
    );
  }

  const { data: check, error: checkError } = await supabase
    .from("website_checks")
    .select(
      "id, score, potential, findings, score_breakdown, created_at, status"
    )
    .eq("id", checkId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (checkError) {
    throw new LeadReportPdfError(checkError.message, 500);
  }

  if (!check) {
    throw new LeadReportPdfError("Check nicht gefunden.", 404);
  }

  const { data: report, error: reportError } = await supabase
    .from("lead_reports")
    .select("title, summary, recommendation")
    .eq("check_id", checkId)
    .maybeSingle();

  if (reportError) {
    throw new LeadReportPdfError(reportError.message, 500);
  }

  if (!report) {
    throw new LeadReportPdfError(
      "Kein Bericht für den letzten Check vorhanden.",
      404
    );
  }

  const industryRaw = lead.industry as
    | { name: string }
    | { name: string }[]
    | null;
  const regionRaw = lead.region as
    | { name: string }
    | { name: string }[]
    | null;
  const industry = Array.isArray(industryRaw) ? industryRaw[0] : industryRaw;
  const region = Array.isArray(regionRaw) ? regionRaw[0] : regionRaw;

  return {
    lead: {
      firma: lead.firma?.trim() || lead.domain || "Lead",
      domain: lead.domain,
      industryName: industry?.name ?? null,
      regionName: region?.name ?? null,
    },
    check: {
      score: check.score,
      potential: check.potential,
      checkedAt: check.created_at,
      scoreBreakdown: check.score_breakdown as Record<string, number> | null,
      findings: (check.findings ?? []) as TriggeredRule[],
    },
    report: {
      title: report.title,
      recommendation: report.recommendation,
      summary: report.summary,
    },
    generatedAt: new Date().toISOString(),
  };
}

export function slugifyFirma(firma: string): string {
  return firma
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 48);
}
