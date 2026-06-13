import { cn } from "@/lib/utils";
import type { CallStats } from "@/lib/overview/queries";
import { periodLabel, type OverviewPeriod } from "@/lib/overview/periods";

export function CallActivitySection({
  stats,
  period,
}: {
  stats: CallStats;
  period: OverviewPeriod;
}) {
  const onTrack = stats.progressPercent >= 50;

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Vertrieb-Aktivität
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Anrufe aller Vertriebler · {periodLabel(period)}
      </p>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <div className="label-caps text-[var(--text-tertiary)]">
          Anrufe {periodLabel(period).toLowerCase()}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-4xl font-semibold tabular-nums tracking-tight text-[var(--text-primary)]">
            {stats.callsThisPeriod}
          </span>
          <span className="text-lg text-[var(--text-tertiary)]">
            / {stats.weeklyTarget}
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              onTrack ? "bg-[var(--accent)]" : "bg-amber-400"
            )}
            style={{
              width: `${Math.min(stats.progressPercent, 100)}%`,
            }}
          />
        </div>

        <p
          className={cn(
            "mt-2 text-xs tabular-nums",
            onTrack ? "text-emerald-400" : "text-amber-300"
          )}
        >
          {stats.progressPercent}% des Wochenziels
        </p>

        <p className="mt-4 text-xs text-[var(--text-tertiary)]">
          Ziel diese Woche (skaliert nach Zeitraum)
        </p>

        <div className="mt-4 flex gap-6 border-t border-[var(--border-subtle)] pt-4 text-sm">
          <div>
            <span className="text-[var(--text-tertiary)]">Heute: </span>
            <span className="font-medium tabular-nums text-[var(--text-primary)]">
              {stats.heute} Anrufe
            </span>
          </div>
          <div>
            <span className="text-[var(--text-tertiary)]">Gestern: </span>
            <span className="font-medium tabular-nums text-[var(--text-primary)]">
              {stats.gestern} Anrufe
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
