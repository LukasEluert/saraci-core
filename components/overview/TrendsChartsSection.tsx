"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CallsPerDayPoint, WeeklyTrendPoint } from "@/lib/overview/queries";

function WeeklyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WeeklyTrendPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs shadow-lg">
      KW {point.weekNumber}: {point.count} Leads
    </div>
  );
}

function CallsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CallsPerDayPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs shadow-lg">
      {point.label}: {point.count} Anrufe
    </div>
  );
}

export function TrendsChartsSection({
  weekly,
  callsPerDay,
}: {
  weekly: WeeklyTrendPoint[];
  callsPerDay: CallsPerDayPoint[];
}) {
  const weeklyMax = Math.max(...weekly.map((d) => d.count), 1);
  const callsMax = Math.max(...callsPerDay.map((d) => d.count), 10);

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Trends
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h3 className="label-caps text-[var(--text-secondary)]">Leads pro Woche</h3>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Neue Leads nach Erstellungsdatum (5 Wochen)
          </p>
          <div className="mt-2 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--border-subtle)"
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, weeklyMax]}
                  allowDecimals={false}
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<WeeklyTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {weekly.map((point) => (
                    <Cell
                      key={point.label}
                      fill={point.isCurrent ? "var(--accent)" : "var(--border)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h3 className="label-caps text-[var(--text-secondary)]">
            Anrufe pro Tag (letzte 14 Tage)
          </h3>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Soll-Linie bei 10 Anrufen/Tag (50/Woche)
          </p>
          <div className="mt-2 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callsPerDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--border-subtle)"
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, callsMax]}
                  allowDecimals={false}
                  tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CallsTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
                <ReferenceLine
                  y={10}
                  stroke="var(--text-tertiary)"
                  strokeDasharray="4 4"
                  label={{
                    value: "10",
                    position: "insideTopRight",
                    fill: "var(--text-tertiary)",
                    fontSize: 10,
                  }}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
