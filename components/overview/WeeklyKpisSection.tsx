import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WeeklyKPIs } from "@/lib/overview/queries";
import { periodLabel, type OverviewPeriod } from "@/lib/overview/periods";

function KpiCard({
  label,
  value,
  href,
  accent,
  subtitle,
  subtitleTone,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: boolean;
  subtitle?: string;
  subtitleTone?: "up" | "down" | "flat";
}) {
  const inner = (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-colors",
        href && "hover:bg-[var(--surface-hover)]",
        accent &&
          value > 0 &&
          "border-[var(--accent)]/40 bg-[var(--accent)]/5"
      )}
    >
      <div
        className={cn(
          "font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums tracking-tight",
          accent && value > 0
            ? "text-[var(--accent)]"
            : "text-[var(--text-primary)]"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-[var(--text-tertiary)]">{label}</div>
      {subtitle ? (
        <div
          className={cn(
            "mt-1 text-[11px] tabular-nums",
            subtitleTone === "up" && "text-emerald-400",
            subtitleTone === "down" && "text-[var(--accent)]",
            subtitleTone === "flat" && "text-[var(--text-tertiary)]"
          )}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

export function WeeklyKpisSection({
  kpis,
  period,
}: {
  kpis: WeeklyKPIs;
  period: OverviewPeriod;
}) {
  const deltaPrefix =
    kpis.neueLeadsDelta > 0
      ? `+${kpis.neueLeadsDelta}`
      : kpis.neueLeadsDelta.toString();
  const deltaTone =
    kpis.neueLeadsDelta > 0
      ? "up"
      : kpis.neueLeadsDelta < 0
        ? "down"
        : "flat";

  const neueLeadsTitle =
    period === "this_week" || period === "last_week"
      ? "Neue Leads diese Woche"
      : period === "this_month"
        ? "Neue Leads diesen Monat"
        : "Neue Leads (30 Tage)";

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        {periodLabel(period)}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Pipeline-Stand</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <KpiCard label="Offene Leads gesamt" value={kpis.offeneLeads} />
        <KpiCard label="Angebot raus (wartet)" value={kpis.angebotRaus} />
        <KpiCard
          label="Handlungsbedarf"
          value={kpis.handlungsbedarf}
          href="/admin/uebersicht"
          accent
        />
        <KpiCard
          label={neueLeadsTitle}
          value={kpis.neueLeads}
          subtitle={`${deltaPrefix} ${kpis.neueLeadsLabel}`}
          subtitleTone={deltaTone}
        />
      </div>
    </section>
  );
}
