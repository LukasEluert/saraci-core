import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveIndustryId(slug: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Branche „${slug}“ nicht gefunden.`);
  }

  return data.id;
}

export async function resolveRegionId(slug: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("regions")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Region „${slug}“ nicht gefunden.`);
  }

  return data.id;
}
