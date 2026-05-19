import { createAdminClient } from "@/lib/supabase/admin";
import type { ParsedHtmlData } from "./types";

export type RegionForDetection = {
  id: string;
  name: string;
  slug: string | null;
  postal_codes: string[];
};

const PLZ_REGEX = /\b(\d{5})\b/g;

function buildRegionCorpus(parsed: ParsedHtmlData): string {
  const footer = parsed.footer_links.join(" ");
  return [parsed.body_text, footer].filter(Boolean).join(" ").trim();
}

function extractPostalCodes(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(PLZ_REGEX)) {
    found.add(match[1]);
  }
  return [...found];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nameAppearsInCorpus(corpusLower: string, name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (normalized.length < 3) return false;
  const re = new RegExp(`\\b${escapeRegExp(normalized)}\\b`, "i");
  return re.test(corpusLower);
}

export function detectRegion(
  parsed: ParsedHtmlData,
  regions: RegionForDetection[]
): string | null {
  const corpus = buildRegionCorpus(parsed);
  if (!corpus.trim() || regions.length === 0) return null;

  const corpusLower = corpus.toLowerCase();
  const plzsInText = extractPostalCodes(corpus);

  const plzMatches: string[] = [];
  for (const region of regions) {
    if (!region.postal_codes.length) continue;
    const hit = plzsInText.some((plz) => region.postal_codes.includes(plz));
    if (hit) plzMatches.push(region.id);
  }

  if (plzMatches.length === 1) return plzMatches[0];
  if (plzMatches.length > 1) return plzMatches[0];

  const nameMatches: string[] = [];
  for (const region of regions) {
    if (nameAppearsInCorpus(corpusLower, region.name)) {
      nameMatches.push(region.id);
    }
  }

  if (nameMatches.length >= 1) return nameMatches[0];

  return null;
}

export async function loadRegionsForDetection(): Promise<RegionForDetection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("regions")
    .select("id, name, slug, postal_codes, active")
    .eq("active", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    postal_codes: Array.isArray(row.postal_codes)
      ? row.postal_codes
          .map((c) => String(c).trim())
          .filter((c) => /^\d{5}$/.test(c))
      : [],
  }));
}

export async function applyDetectedRegionToLead(
  leadId: string,
  parsed: ParsedHtmlData
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("region_id")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    throw new Error(leadError.message);
  }

  if (!lead || lead.region_id) {
    return null;
  }

  const regions = await loadRegionsForDetection();
  const regionId = detectRegion(parsed, regions);

  if (!regionId) {
    return null;
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ region_id: regionId })
    .eq("id", leadId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return regionId;
}
