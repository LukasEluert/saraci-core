import { createAdminClient } from "@/lib/supabase/admin";

export async function listIndustries() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("industries")
    .select("id, name, slug")
    .order("name");
  return data ?? [];
}

export async function listRegions() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("regions")
    .select("id, name, slug")
    .order("name");
  return data ?? [];
}
