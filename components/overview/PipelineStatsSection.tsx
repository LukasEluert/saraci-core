import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PipelineStats } from "@/lib/overview/queries";

function KpiCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: "danger" | "default";
}) {
  const inner = (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors",
        href && "hover:bg-[var(--surface-hover)]",
        accent === "danger" &&
          value > 0 &&
          "border-red-500/40 bg-red-500/5"
      )}
    >
      <div
        className={cn(
          "font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums tracking-tight",
          accent === "danger" && value > 0
            ? "text-red-400"
            : "text-[var(--text-primary)]"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-[var(--text-tertiary)]">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

export function PipelineStatsSection({ stats }: { stats: PipelineStats }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Pipeline-Stand
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Offene Leads gesamt" value={stats.offen} />
        <KpiCard label="Mit Interesse" value={stats.interesse} />
        <KpiCard label="Angebot raus (wartet)" value={stats.angebotRaus} />
        <KpiCard
          label="Handlungsbedarf"
          value={stats.handlungsbedarf}
          href="/admin/uebersicht"
          accent="danger"
        />
      </div>
    </section>
  );
}
