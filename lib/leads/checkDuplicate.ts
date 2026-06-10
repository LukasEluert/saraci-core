import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeDomainInput } from "./normalizeDomainInput";

export type DuplicateLeadMatch = {
  id: string;
  firma: string | null;
  domain: string;
  status: string | null;
  created_at: string | null;
};

export async function findDuplicateLeads(
  args: {
    domain: string;
    firma?: string;
  },
  client?: SupabaseClient
): Promise<DuplicateLeadMatch[]> {
  const normalized = normalizeDomainInput(args.domain);
  const firma = args.firma?.trim() ?? "";

  const hasDomain = Boolean(normalized && normalized.length >= 3);
  const hasFirma = firma.length >= 2;

  if (!hasDomain && !hasFirma) {
    return [];
  }

  const conditions: string[] = [];

  if (hasDomain && normalized) {
    const pattern = `%${normalized}%`;
    conditions.push(`domain.ilike.${pattern}`);
    conditions.push(`normalized_domain.ilike.${pattern}`);
    conditions.push(`domain.eq.${normalized}`);
    conditions.push(`normalized_domain.eq.${normalized}`);
  }

  if (hasFirma) {
    conditions.push(`firma.ilike.%${firma}%`);
  }

  const supabase = client ?? createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, firma, domain, akquise_status, created_at")
    .eq("archiviert", false)
    .or(conditions.join(","))
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    firma: row.firma,
    domain: row.domain,
    status: row.akquise_status,
    created_at: row.created_at,
  }));
}
