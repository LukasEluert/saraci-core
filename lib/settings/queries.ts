import { createAdminClient } from "@/lib/supabase/admin";

export type IndustrySetting = {
  id: string;
  name: string;
  slug: string | null;
  active: boolean;
  keywords: string[];
};

export type RegionSetting = {
  id: string;
  name: string;
  slug: string | null;
  lat: number | null;
  lng: number | null;
  active: boolean;
  postal_codes: string[];
};

export type ScoreRuleSetting = {
  id: string;
  key: string;
  label: string;
  category: string;
  points: number;
  severity: string;
  active: boolean;
};

export async function listIndustriesSettings(): Promise<IndustrySetting[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id, name, slug, active, keywords")
    .order("name");

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    active: row.active ?? true,
    keywords: Array.isArray(row.keywords)
      ? row.keywords.filter((k): k is string => typeof k === "string")
      : [],
  }));
}

export async function listRegionsSettings(): Promise<RegionSetting[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("regions")
    .select("id, name, slug, lat, lng, active, postal_codes")
    .order("name");

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    active: row.active ?? true,
    postal_codes: Array.isArray(row.postal_codes)
      ? row.postal_codes
          .map((c) => String(c).trim())
          .filter((c) => /^\d{5}$/.test(c))
      : [],
  }));
}

export async function listScoreRulesSettings(): Promise<ScoreRuleSetting[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("score_rules")
    .select("id, key, label, category, points, severity, active")
    .order("key");

  if (error) throw new Error(error.message);

  return (data ?? []) as ScoreRuleSetting[];
}
