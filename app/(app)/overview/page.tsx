import type { Metadata } from "next";
import { ActionRequiredSection } from "@/components/overview/ActionRequiredSection";
import { PipelineStatsSection } from "@/components/overview/PipelineStatsSection";
import { RecentActivitySection } from "@/components/overview/RecentActivitySection";
import { TrendsSection } from "@/components/overview/TrendsSection";
import {
  getActionRequired,
  getConversionRate,
  getPipelineStats,
  getRecentActivities,
  getWeeklyTrend,
} from "@/lib/overview/queries";

export const metadata: Metadata = {
  title: "Übersicht",
};

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [actionRequired, pipeline, weekly, conversion, activities] =
    await Promise.all([
      getActionRequired(),
      getPipelineStats(),
      getWeeklyTrend(),
      getConversionRate(),
      getRecentActivities(),
    ]);

  return (
    <div className="flex h-full flex-col gap-8 p-4 md:p-6">
      <header>
        <div className="label-caps">Dashboard</div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Befehlszentrale
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Was du tun musst, wie die Pipeline steht und was zuletzt passiert ist.
        </p>
      </header>

      <ActionRequiredSection data={actionRequired} />

      <PipelineStatsSection stats={pipeline} />

      <TrendsSection weekly={weekly} conversion={conversion} />

      <RecentActivitySection rows={activities} />
    </div>
  );
}
