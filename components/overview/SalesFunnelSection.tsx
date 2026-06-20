import { cn } from "@/lib/utils";
import type { FunnelData } from "@/lib/overview/queries";
import { periodLabel, type OverviewPeriod } from "@/lib/overview/periods";

const numberFormat = new Intl.NumberFormat("de-DE");
const percentFormat = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function getStageCount(funnel: FunnelData, key: string): number {
  return funnel.stages.find((stage) => stage.key === key)?.count ?? 0;
}

function FunnelMetrics({ funnel }: { funnel: FunnelData }) {
  const angerufen = getStageCount(funnel, "angerufen");
  const kunde = getStageCount(funnel, "kunde");
  const callsPerCustomer =
    kunde > 0 ? numberFormat.format(Math.round(angerufen / kunde)) : "—";
  const conversionRate =
    angerufen > 0
      ? `${percentFormat.format((kunde / angerufen) * 100)}%`
      : "—";

  return (
    <div className="mt-5 space-y-1 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-secondary)]">
      <p>
        Anrufe / Kunde:{" "}
        <span className="tabular-nums text-[var(--text-primary)]">
          {callsPerCustomer}
        </span>
      </p>
      <p>
        Conv. Rate:{" "}
        <span className="tabular-nums text-[var(--text-primary)]">
          {conversionRate}
        </span>
      </p>
    </div>
  );
}

function FunnelColumn({
  title,
  funnel,
  emptyMessage,
}: {
  title: string;
  funnel: FunnelData;
  emptyMessage: string;
}) {
  const maxCount = funnel.hasCalls
    ? Math.max(...funnel.stages.map((stage) => stage.count), 1)
    : 1;

  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
        {title}
      </h3>

      {!funnel.hasCalls ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-4 space-y-4">
            {funnel.stages.map((stage, index) => {
              const width = Math.max(
                (stage.count / maxCount) * 100,
                stage.count > 0 ? 6 : 2
              );

              return (
                <div
                  key={stage.key}
                  className="grid gap-2 sm:grid-cols-[120px_1fr_auto] sm:items-center"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                    {stage.label}
                  </span>
                  <div className="h-3 overflow-hidden rounded-sm bg-[var(--border)]">
                    <div
                      className={cn(
                        "h-full rounded-sm",
                        index === 0
                          ? "bg-[var(--text-tertiary)]"
                          : "bg-[var(--accent)]/80"
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums text-[var(--text-primary)]">
                    {numberFormat.format(stage.count)}
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
          <FunnelMetrics funnel={funnel} />
        </>
      )}
    </div>
  );
}

export function SalesFunnelSection({
  funnel,
  funnelLifetime,
  period,
}: {
  funnel: FunnelData;
  funnelLifetime: FunnelData;
  period: OverviewPeriod;
}) {
  const bothEmpty = !funnel.hasCalls && !funnelLifetime.hasCalls;

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Vertriebs-Funnel
      </h2>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        {bothEmpty ? (
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Noch keine Daten
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:gap-6">
            <FunnelColumn
              title={periodLabel(period)}
              funnel={funnel}
              emptyMessage="Noch keine Anrufe in diesem Zeitraum"
            />
            <FunnelColumn
              title="Gesamt"
              funnel={funnelLifetime}
              emptyMessage="Noch keine Anrufe"
            />
          </div>
        )}
      </div>
    </section>
  );
}
