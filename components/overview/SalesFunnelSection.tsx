import { cn } from "@/lib/utils";
import type { FunnelData } from "@/lib/overview/queries";
import { periodLabel, type OverviewPeriod } from "@/lib/overview/periods";

export function SalesFunnelSection({
  funnel,
  period,
}: {
  funnel: FunnelData;
  period: OverviewPeriod;
}) {
  const maxCount = funnel.hasCalls
    ? Math.max(...funnel.stages.map((s) => s.count), 1)
    : 1;

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Vertriebs-Funnel
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {periodLabel(period)}
      </p>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        {!funnel.hasCalls ? (
          <p className="text-sm text-[var(--accent)]">
            Noch keine Anrufe in diesem Zeitraum
          </p>
        ) : (
          <div className="space-y-4">
            {funnel.stages.map((stage, index) => {
              const width = Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 6 : 2);
              return (
                <div key={stage.key} className="grid gap-2 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                    {stage.label}
                  </span>
                  <div className="h-3 overflow-hidden rounded-sm bg-[var(--border)]">
                    <div
                      className={cn(
                        "h-full rounded-sm",
                        index === 0 ? "bg-[var(--text-tertiary)]" : "bg-[var(--accent)]/80"
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-[var(--text-primary)]">
                    {stage.count}
                    {stage.conversionPercent !== null ? (
                      <span className="ml-2 text-xs text-[var(--text-tertiary)]">
                        ({stage.conversionPercent}%)
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
