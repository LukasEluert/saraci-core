"use client";

import { useState, useTransition } from "react";
import { fetchOverviewDataAction } from "@/app/actions/overview";
import { MyActionItemsSection } from "@/components/overview/MyActionItemsSection";
import { WeeklyKpisSection } from "@/components/overview/WeeklyKpisSection";
import { CallActivitySection } from "@/components/overview/CallActivitySection";
import { SalesFunnelSection } from "@/components/overview/SalesFunnelSection";
import { TrendsChartsSection } from "@/components/overview/TrendsChartsSection";
import { RecentActivitySection } from "@/components/overview/RecentActivitySection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OVERVIEW_PERIODS,
  periodLabel,
  type OverviewPeriod,
} from "@/lib/overview/periods";
import type { OverviewData } from "@/lib/overview/queries";

type Props = {
  initialPeriod: OverviewPeriod;
  initialData: OverviewData;
};

export function OverviewDashboard({ initialPeriod, initialData }: Props) {
  const [period, setPeriod] = useState<OverviewPeriod>(initialPeriod);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function handlePeriodChange(next: OverviewPeriod | null) {
    if (!next || next === period) return;
    setPeriod(next);
    startTransition(async () => {
      const fresh = await fetchOverviewDataAction(next);
      setData(fresh);
    });
  }

  return (
    <div className="flex h-full flex-col gap-8 p-4 md:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="label-caps">Dashboard</div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Befehlszentrale
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Pipeline, Vertrieb und deine offenen Aufgaben auf einen Blick.
          </p>
        </div>

        <Select
          value={period}
          onValueChange={handlePeriodChange}
          disabled={isPending}
        >
          <SelectTrigger size="sm" className="w-[180px] shrink-0">
            <SelectValue>{periodLabel(period)}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {OVERVIEW_PERIODS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className={isPending ? "opacity-60 transition-opacity" : undefined}>
        {data.actionItems.length > 0 ? (
          <MyActionItemsSection items={data.actionItems} />
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <WeeklyKpisSection kpis={data.kpis} period={period} />
          <CallActivitySection stats={data.callStats} period={period} />
        </div>

        <div className="mt-8">
          <SalesFunnelSection
            funnel={data.funnel}
            funnelLifetime={data.funnelLifetime}
            period={period}
          />
        </div>

        <div className="mt-8">
          <TrendsChartsSection
            weekly={data.weeklyTrend}
            callsPerDay={data.callsPerDay}
          />
        </div>

        <div className="mt-8">
          <RecentActivitySection rows={data.activities} period={period} />
        </div>
      </div>
    </div>
  );
}
