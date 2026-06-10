import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversionRate, WeeklyTrendPoint } from "@/lib/overview/queries";

function WeeklyLeadsChart({ data }: { data: WeeklyTrendPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-48 items-end justify-between gap-2 pt-6">
      {data.map((point) => {
        const height = Math.max((point.count / max) * 100, point.count > 0 ? 8 : 4);
        return (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-[var(--text-secondary)]">
              {point.count}
            </span>
            <div
              className={cn(
                "w-full max-w-[48px] rounded-t-md transition-colors",
                point.isCurrent ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              )}
              style={{ height: `${height}%` }}
            />
            <span className="truncate text-[10px] text-[var(--text-tertiary)]">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrendIcon({ trend }: { trend: ConversionRate["trend"] }) {
  if (trend === "up") {
    return <ArrowUp className="size-4 text-emerald-400" strokeWidth={2} aria-hidden />;
  }
  if (trend === "down") {
    return <ArrowDown className="size-4 text-red-400" strokeWidth={2} aria-hidden />;
  }
  if (trend === "flat") {
    return <Minus className="size-4 text-[var(--text-tertiary)]" strokeWidth={2} aria-hidden />;
  }
  return null;
}

export function TrendsSection({
  weekly,
  conversion,
}: {
  weekly: WeeklyTrendPoint[];
  conversion: ConversionRate;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Trends
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="label-caps text-[var(--text-secondary)]">Leads pro Woche</h3>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Neue Leads nach Erstellungsdatum (5 Wochen)
          </p>
          <WeeklyLeadsChart data={weekly} />
        </div>

        <div className="flex flex-col justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="label-caps text-[var(--text-secondary)]">Conversion Rate</h3>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-[family-name:var(--font-display)] text-5xl font-semibold tabular-nums tracking-tight text-[var(--text-primary)]">
              {conversion.rate !== null ? `${conversion.rate}%` : "—"}
            </span>
            <TrendIcon trend={conversion.trend} />
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {conversion.gewonnen} Kunden aus {conversion.abgeschlossen} abgeschlossenen
            Leads
          </p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Nur Leads mit Outcome Kunde oder Kein Interesse
          </p>
        </div>
      </div>
    </section>
  );
}
