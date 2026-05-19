import { createAdminClient } from "@/lib/supabase/admin";

let manualSourceId: string | null = null;

export async function getManualSourceId(): Promise<string> {
  if (manualSourceId) return manualSourceId;

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("sources")
    .select("id")
    .eq("name", "manual")
    .maybeSingle();

  if (existing?.id) {
    manualSourceId = existing.id;
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("sources")
    .insert({ name: "manual" })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Quelle 'manual' konnte nicht angelegt werden.");
  }

  manualSourceId = created.id;
  return created.id;
}
