import { createAdminClient } from "@/lib/supabase/admin";
import type { WebsiteCheckResult } from "./types";

const RECENT_WINDOW_MS = 5 * 60 * 1000;

/**
 * Dev-Hilfe: gleiche normalisierte URL innerhalb von 5 Minuten nicht erneut prüfen.
 */
export async function findRecentWebsiteCheck(
  normalizedUrl: string
): Promise<WebsiteCheckResult | null> {
  const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
  const supabase = createAdminClient();

  const { data: check, error } = await supabase
    .from("website_checks")
    .select("id, status, score, potential, error_message")
    .eq("normalized_url", normalizedUrl)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !check) {
    return null;
  }

  const { data: report } = await supabase
    .from("lead_reports")
    .select("id")
    .eq("check_id", check.id)
    .maybeSingle();

  return {
    ok: check.status === "completed",
    check_id: check.id,
    report_id: report?.id ?? null,
    score: check.score,
    potential: check.potential as WebsiteCheckResult["potential"],
    status: check.status as WebsiteCheckResult["status"],
    error: check.error_message ?? undefined,
  };
}
