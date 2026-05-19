import type { Metadata } from "next";
import Link from "next/link";
import { PotentialBadge } from "@/components/leads/PotentialBadge";
import { ScoreBadge } from "@/components/leads/ScoreBadge";
import { formatDateTime } from "@/lib/leads/format";
import { getOverviewStats, getRecentChecks } from "@/lib/overview/queries";

export const metadata: Metadata = {
  title: "Übersicht",
};

export const dynamic = "force-dynamic";

function StatCard({
  title,
  value,
  hint,
  denseValue,
  href,
}: {
  title: string;
  value: string;
  hint?: string;
  denseValue?: boolean;
  href?: string;
}) {
  const inner = (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:bg-[var(--surface-hover)]">
      <div className="label-caps">{title}</div>
      <div
        className={`mt-2 font-mono font-medium tracking-tight text-[var(--text-primary)] leading-snug ${
          denseValue ? "text-[13px]" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">{hint}</div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
}

export default async function OverviewPage() {
  const [stats, recent] = await Promise.all([
    getOverviewStats(),
    getRecentChecks(8),
  ]);

  const lastCheckAt = stats.lastCheckAt
    ? formatDateTime(stats.lastCheckAt)
    : "—";

  return (
    <div className="flex h-full flex-col gap-3 p-4 md:gap-4 md:p-6">
      <div>
        <div className="label-caps">Dashboard</div>
        <h1 className="text-xl font-medium tracking-tight">Übersicht</h1>
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7 md:gap-3">
        <StatCard title="Leads gesamt" value={String(stats.totalLeads)} href="/leads" />
        <StatCard
          title="Neue Leads"
          value={String(stats.newLeadsWeek)}
          hint="Letzte 7 Tage"
          href="/leads"
        />
        <StatCard
          title="Hohes Potenzial"
          value={String(stats.highPotential)}
          hint="Score-Pipeline"
          href="/leads?potential=high"
        />
        <StatCard
          title="Pipeline offen"
          value={String(stats.openPipeline)}
          hint="Neu · qualifiziert · kontaktiert"
          href="/leads"
        />
        <StatCard
          title="Checks ausstehend"
          value={String(stats.pendingChecks)}
          hint="Warteschlange"
        />
        <StatCard
          title="Research-Jobs"
          value={String(stats.completedResearchJobs)}
          hint="Abgeschlossen"
          href="/research"
        />
        <StatCard title="Letzter Check" value={lastCheckAt} denseValue />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="label-caps">Letzte Website-Checks</div>
        <Link
          href="/leads"
          className="text-xs text-[var(--accent)] hover:underline"
        >
          Alle Leads →
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <div className="h-full overflow-auto">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead className="sticky top-0 bg-[var(--surface-hover)]">
              <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:px-4 [&>th]:py-3">
                <th className="border-b border-[var(--border)]">Firma</th>
                <th className="hidden border-b border-[var(--border)] sm:table-cell">
                  Domain
                </th>
                <th className="border-b border-[var(--border)]">Score</th>
                <th className="border-b border-[var(--border)]">Potenzial</th>
                <th className="hidden border-b border-[var(--border)] md:table-cell">
                  Check
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr
                  key={row.checkId}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-2"
                >
                  <td>
                    <Link
                      href={`/leads/${row.leadId}`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
                    >
                      {row.firma ?? row.domain}
                    </Link>
                  </td>
                  <td className="hidden font-mono text-[var(--text-secondary)] sm:table-cell">
                    {row.domain}
                  </td>
                  <td>
                    <ScoreBadge score={row.score} potential={row.potential} />
                  </td>
                  <td>
                    <PotentialBadge potential={row.potential} />
                  </td>
                  <td className="hidden text-[var(--text-tertiary)] md:table-cell">
                    {formatDateTime(row.checkedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recent.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
              Noch keine Checks.{" "}
              <Link href="/leads/new" className="text-[var(--accent)] underline">
                Lead anlegen
              </Link>{" "}
              oder{" "}
              <Link href="/research/new" className="text-[var(--accent)] underline">
                Research starten
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
