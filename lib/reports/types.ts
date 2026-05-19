import type { TriggeredRule } from "@/lib/core/checks/types";
import type { LeadPotential } from "@/lib/leads/types";

export type LeadReportPdfData = {
  lead: {
    firma: string;
    domain: string;
    industryName: string | null;
    regionName: string | null;
  };
  check: {
    score: number | null;
    potential: LeadPotential | null;
    checkedAt: string | null;
    scoreBreakdown: Record<string, number> | null;
    findings: TriggeredRule[];
  };
  report: {
    title: string;
    recommendation: string | null;
    summary: string | null;
  };
  generatedAt: string;
};
