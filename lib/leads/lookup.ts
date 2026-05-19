import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveIndustryBySlug(
  slug: string
): Promise<{ id: string; name: string } | null> {
  const supabase = createAdminClient();
  const normalized = slug.trim().toLowerCase();

  const { data } = await supabase
    .from("industries")
    .select("id, name, slug")
    .or(`slug.eq.${normalized},name.ilike.${normalized}`)
    .limit(1)
    .maybeSingle();

  return data ? { id: data.id, name: data.name } : null;
}

export async function resolveRegionBySlug(
  slug: string
): Promise<{ id: string; name: string } | null> {
  const supabase = createAdminClient();
  const normalized = slug.trim().toLowerCase();

  const { data } = await supabase
    .from("regions")
    .select("id, name, slug")
    .or(`slug.eq.${normalized},name.ilike.${normalized}`)
    .limit(1)
    .maybeSingle();

  return data ? { id: data.id, name: data.name } : null;
}
