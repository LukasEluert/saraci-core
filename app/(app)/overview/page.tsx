import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PotenzialBadge } from "@/components/PotenzialBadge";

export const metadata: Metadata = {
  title: "Übersicht",
};

function StatCard({
  title,
  value,
  hint,
  denseValue,
}: {
  title: string;
  value: string;
  hint?: string;
  denseValue?: boolean;
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="label-caps">{title}</div>
      <div
        className={`mt-2 font-mono font-medium tracking-tight text-[var(--text-primary)] leading-snug ${
          denseValue ? "text-[13px]" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">{hint}</div>}
    </div>
  );
}

export default async function OverviewPage() {
  const supabase = await createClient();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString();

  const [
    totalRes,
    newWeekRes,
    highRes,
    pipelineRes,
    lastCheckRes,
    recentChecksRes,
  ] = await Promise.all([
    supabase.from("core_leads").select("*", { count: "exact", head: true }),
    supabase
      .from("core_leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    supabase
      .from("core_leads")
      .select("*", { count: "exact", head: true })
      .eq("potenzial", "hoch"),
    supabase
      .from("core_leads")
      .select("*", { count: "exact", head: true })
      .in("status", ["neu", "kontaktiert", "qualifiziert", "angebot"]),
    supabase
      .from("core_site_checks")
      .select("checked_at")
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("core_site_checks")
      .select("id, lead_id, checked_at, score")
      .order("checked_at", { ascending: false })
      .limit(5),
  ]);

  const recent = recentChecksRes.data ?? [];
  const leadIds = [
    ...new Set(recent.map((c) => c.lead_id).filter((x): x is string => !!x)),
  ];

  const leadMap = new Map<
    string,
    { domain: string; firma: string | null; potenzial: string | null }
  >();

  if (leadIds.length) {
    const { data: leads } = await supabase
      .from("core_leads")
      .select("id, domain, firma, potenzial")
      .in("id", leadIds);

    leads?.forEach((l) =>
      leadMap.set(l.id, {
        domain: l.domain,
        firma: l.firma,
        potenzial: l.potenzial,
      })
    );
  }

  const totalLeads = totalRes.count ?? 0;
  const newLeadsWeek = newWeekRes.count ?? 0;
  const highPotential = highRes.count ?? 0;
  const openPipeline = pipelineRes.count ?? 0;

  const lastCheckAt = lastCheckRes.data?.checked_at
    ? new Date(lastCheckRes.data.checked_at).toLocaleString("de-DE", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="flex h-full flex-col gap-3 p-4 md:gap-4 md:p-6">
      <div className="shrink-0 grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
        <StatCard title="Leads gesamt" value={String(totalLeads)} />
        <StatCard title="Neue Leads" value={String(newLeadsWeek)} hint="Letzte 7 Tage" />
        <StatCard title="Hohe Potenziale" value={String(highPotential)} />
        <StatCard title="Offene Checks" value={String(openPipeline)} hint="Aktive Status" />
        <StatCard title="Letzte Checks" value={lastCheckAt} denseValue />
      </div>

      <div className="label-caps shrink-0">Letzte geprüfte Leads</div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] md:overflow-hidden">
        <div className="h-full overflow-auto md:overflow-hidden">
          <table className="w-full border-collapse text-left text-[12px] tracking-[-0.01em]">
            <thead className="sticky top-0 bg-[var(--surface-hover)]">
              <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
                <th className="border-b border-[var(--border)] font-mono uppercase">Domain</th>
                <th className="hidden border-b border-[var(--border)] sm:table-cell">Firma</th>
                <th className="border-b border-[var(--border)]">Score</th>
                <th className="border-b border-[var(--border)]">Potenzial</th>
                <th className="hidden border-b border-[var(--border)] md:table-cell">Check</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => {
                const lead = row.lead_id ? leadMap.get(row.lead_id) : undefined;
                const checkedAt = new Date(row.checked_at).toLocaleString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border-subtle)] [&>td]:px-4 [&>td]:py-2"
                  >
                    <td className="font-mono text-[12px] text-[var(--text-primary)]">
                      {lead?.domain ?? "—"}
                    </td>
                    <td className="hidden text-[var(--text-secondary)] sm:table-cell">
                      {lead?.firma ?? "—"}
                    </td>
                    <td className="font-mono text-[12px] text-[var(--text-secondary)]">{row.score ?? 0}</td>
                    <td>
                      <PotenzialBadge potenzial={lead?.potenzial} />
                    </td>
                    <td className="hidden text-[var(--text-tertiary)] md:table-cell">{checkedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recent.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
              Noch keine gespeicherten Checks — starte welche in „Lead Research“.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
