import { createAdminClient } from "@/lib/supabase/admin";
import type { ParsedHtmlData } from "./types";

export type IndustryWithKeywords = {
  id: string;
  slug: string | null;
  name: string;
  keywords: string[];
};

const MATCH_THRESHOLD = 2;

function normalizeCorpus(parsed: ParsedHtmlData): string {
  const parts = [
    parsed.title,
    parsed.meta_description,
    ...parsed.h1_texts,
    parsed.body_text,
  ].filter((p): p is string => Boolean(p && p.trim()));

  return parts.join(" ").toLowerCase();
}

function countKeywordMatches(corpus: string, keywords: string[]): number {
  let count = 0;
  const seen = new Set<string>();

  for (const raw of keywords) {
    const keyword = raw.trim().toLowerCase();
    if (keyword.length < 2 || seen.has(keyword)) continue;
    seen.add(keyword);

    if (corpus.includes(keyword)) {
      count += 1;
    }
  }

  return count;
}

export function detectIndustry(
  parsed: ParsedHtmlData,
  industries: IndustryWithKeywords[]
): string | null {
  const corpus = normalizeCorpus(parsed);
  if (!corpus.trim()) return null;

  let bestId: string | null = null;
  let bestCount = 0;

  for (const industry of industries) {
    if (!industry.keywords.length) continue;

    const count = countKeywordMatches(corpus, industry.keywords);
    if (count >= MATCH_THRESHOLD && count > bestCount) {
      bestCount = count;
      bestId = industry.id;
    }
  }

  return bestId;
}

export async function loadIndustriesWithKeywords(): Promise<
  IndustryWithKeywords[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id, name, slug, keywords, active")
    .eq("active", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    keywords: Array.isArray(row.keywords)
      ? row.keywords.filter((k): k is string => typeof k === "string")
      : [],
  }));
}

export async function applyDetectedIndustryToLead(
  leadId: string,
  parsed: ParsedHtmlData
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("industry_id")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    throw new Error(leadError.message);
  }

  if (!lead || lead.industry_id) {
    return null;
  }

  const industries = await loadIndustriesWithKeywords();
  const industryId = detectIndustry(parsed, industries);

  if (!industryId) {
    return null;
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ industry_id: industryId })
    .eq("id", leadId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return industryId;
}
