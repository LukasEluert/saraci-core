"use server";

import { requireAdmin } from "@/lib/auth/profile";
import {
  getOverviewData,
  type OverviewData,
} from "@/lib/overview/queries";
import type { OverviewPeriod } from "@/lib/overview/periods";

export async function fetchOverviewDataAction(
  period: OverviewPeriod
): Promise<OverviewData> {
  const profile = await requireAdmin();
  return getOverviewData(period, profile.id);
}
