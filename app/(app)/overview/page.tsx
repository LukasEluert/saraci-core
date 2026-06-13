import type { Metadata } from "next";
import { OverviewDashboard } from "@/components/overview/OverviewDashboard";
import { requireAdmin } from "@/lib/auth/profile";
import { getOverviewData } from "@/lib/overview/queries";

export const metadata: Metadata = {
  title: "Übersicht",
};

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const profile = await requireAdmin();
  const initialData = await getOverviewData("this_week", profile.id);

  return (
    <OverviewDashboard initialPeriod="this_week" initialData={initialData} />
  );
}
