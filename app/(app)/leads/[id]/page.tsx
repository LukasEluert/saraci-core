import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FindingsList } from "@/components/leads/FindingsList";
import { LeadActionsPanel } from "@/components/leads/LeadActionsPanel";
import { LeadReportSection } from "@/components/leads/LeadReportSection";
import { PotentialBadge } from "@/components/leads/PotentialBadge";
import { ScoreBadge } from "@/components/leads/ScoreBadge";
import { ScoreBreakdown } from "@/components/leads/ScoreBreakdown";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCreatedAtVerbose, formatDateTime } from "@/lib/leads/format";
import { LeadNotes } from "@/components/akquise/LeadNotes";
import { getLeadDetail } from "@/lib/leads/queries";
import { listLeadNotes } from "@/lib/akquise/leadNotes";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listIndustries, listRegions } from "@/lib/leads/reference";
import type { TriggeredRule } from "@/lib/core/checks/types";

export const metadata: Metadata = {
  title: "Lead",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const back =
    from === "handlungsbedarf"
      ? { href: "/admin/uebersicht", label: "← Zurück zu Handlungsbedarf" }
      : from === "akquise"
        ? { href: "/akquise", label: "← Zurück zu Akquise" }
        : { href: "/leads", label: "← Zurück zu Leads" };
  const [lead, industries, regions, profile, notes] = await Promise.all([
    getLeadDetail(id),
    listIndustries(),
    listRegions(),
    getCurrentProfile(),
    listLeadNotes(id),
  ]);

  if (!lead) notFound();

  const latestCheck = lead.checks[0] ?? null;
  const findings = (latestCheck?.findings ?? []) as TriggeredRule[];
  const breakdown = latestCheck?.score_breakdown ?? null;

  return (
    <div className="space-y-6">
      <Link
        href={back.href}
        className="inline-block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        {back.label}
      </Link>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="space-y-3 border-b border-[var(--border)] pb-6">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {lead.firma ?? lead.normalized_domain ?? "Lead"}
            </h1>
            <a
              href={
                lead.domain.startsWith("http")
                  ? lead.domain
                  : `https://${lead.domain}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-sm text-[var(--accent)] hover:underline"
            >
              {lead.domain}
            </a>
            <div className="flex flex-wrap items-center gap-2">
              <ScoreBadge score={lead.score} potential={lead.potential} />
              <PotentialBadge potential={lead.potential} />
              <StatusBadge status={lead.status} />
              {lead.pending_check && (
                <span className="text-xs text-yellow-400">Wird geprüft…</span>
              )}
            </div>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Notizen</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadNotes
                leadId={lead.id}
                notes={notes}
                currentUserId={profile?.id ?? ""}
                isAdmin={profile?.role === "admin"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score-Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown breakdown={breakdown} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <FindingsList findings={findings} />
            </CardContent>
          </Card>

          {lead.report && (
            <Card>
              <CardHeader>
                <CardTitle>Bericht</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadReportSection markdown={lead.report.body_markdown} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Check-Historie</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.checks.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Noch keine Checks.
                </p>
              ) : (
                <ul className="space-y-2">
                  {lead.checks.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/leads/${lead.id}/checks/${c.id}`}
                        className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2.5 text-sm transition-colors hover:bg-[var(--bg-hover)]"
                      >
                        <span>{formatDateTime(c.created_at)}</span>
                        <span className="font-mono tabular-nums">
                          {c.score != null ? `${c.score}/100` : "—"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="w-full shrink-0 lg:w-[320px]">
          <Card>
            <CardHeader>
              <CardTitle>Aktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActionsPanel
                lead={lead}
                industries={industries}
                regions={regions}
              />
              <Separator className="my-4" />
              <dl className="space-y-2 text-xs text-[var(--text-secondary)]">
                <div>
                  <dt className="font-medium text-[var(--text-tertiary)]">
                    Erstellt
                  </dt>
                  <dd>{formatCreatedAtVerbose(lead.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--text-tertiary)]">
                    Letzter Check
                  </dt>
                  <dd>{formatDateTime(lead.last_checked_at)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
