import { createAdminClient } from "@/lib/supabase/admin";
import type { ScoreRule } from "./types";

export async function loadActiveScoreRules(): Promise<ScoreRule[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("score_rules")
    .select("id, key, label, description, category, points, severity, active")
    .eq("active", true);

  if (error) {
    throw new Error(`Score-Regeln konnten nicht geladen werden: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    category: row.category as ScoreRule["category"],
    points: row.points,
    severity: row.severity as ScoreRule["severity"],
    active: row.active,
  }));
}
