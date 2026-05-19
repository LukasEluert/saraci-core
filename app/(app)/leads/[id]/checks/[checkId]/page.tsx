import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FindingsList } from "@/components/leads/FindingsList";
import { LeadReportSection } from "@/components/leads/LeadReportSection";
import { ScoreBadge } from "@/components/leads/ScoreBadge";
import { ScoreBreakdown } from "@/components/leads/ScoreBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/leads/format";
import { getCheckDetail, getLeadDetail } from "@/lib/leads/queries";
import type { TriggeredRule } from "@/lib/core/checks/types";

export const metadata: Metadata = {
  title: "Check",
};

type PageProps = {
  params: Promise<{ id: string; checkId: string }>;
};

export default async function CheckDetailPage({ params }: PageProps) {
  const { id, checkId } = await params;
  const [lead, detail] = await Promise.all([
    getLeadDetail(id),
    getCheckDetail(id, checkId),
  ]);

  if (!lead || !detail) notFound();

  const { check, report } = detail;
  const findings = (check.findings ?? []) as TriggeredRule[];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link
          href={`/leads/${id}`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← {lead.firma ?? "Lead"}
        </Link>
        <h1 className="mt-2 text-xl font-medium tracking-tight">
          Check vom {formatDateTime(check.created_at)}
        </h1>
        <div className="mt-2">
          <ScoreBadge score={check.score} potential={check.potential} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score-Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreBreakdown breakdown={check.score_breakdown} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <FindingsList findings={findings} />
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bericht</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadReportSection markdown={report.body_markdown} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
