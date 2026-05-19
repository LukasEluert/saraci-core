import { createAdminClient } from "@/lib/supabase/admin";
import { buildOverpassQuery } from "@/lib/research/osm/buildQuery";
import { fetchOverpass } from "@/lib/research/osm/fetchOverpass";
import { parseOverpassResponse } from "@/lib/research/osm/parse";
import type { ResearchInput, ResearchResultDraft } from "@/lib/research/types";

async function getSourceIdBySlug(slug: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sources")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      `Quelle „${slug}“ nicht gefunden. Bitte Migration 005 ausführen.`
    );
  }

  return data.id;
}

async function loadExistingLeadDomains(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("normalized_domain")
    .not("normalized_domain", "is", null);

  if (error) {
    throw new Error(`Leads für Dedup nicht ladbar: ${error.message}`);
  }

  return new Set(
    (data ?? [])
      .map((r) => r.normalized_domain)
      .filter((d): d is string => Boolean(d))
  );
}

function toInsertRow(
  draft: ResearchResultDraft,
  jobId: string,
  input: ResearchInput,
  sourceId: string
) {
  return {
    job_id: jobId,
    company_name: draft.company_name,
    website_url: draft.website_url,
    phone: draft.phone,
    address: draft.address,
    lat: draft.lat,
    lng: draft.lng,
    source_ref: draft.source_ref,
    raw_data: draft.raw_data,
    has_website: draft.has_website,
    status: draft.status,
    url_normalized: draft.url_normalized ?? null,
    industry_id: input.industryId,
    region_id: input.regionId,
    source_id: sourceId,
  };
}

export async function runResearchJob(
  input: ResearchInput
): Promise<{ jobId: string; resultsCount: number }> {
  const supabase = createAdminClient();
  const sourceSlug = input.sourceSlug ?? "osm_overpass";
  const sourceId = await getSourceIdBySlug(sourceSlug);

  const { data: job, error: jobInsertError } = await supabase
    .from("research_jobs")
    .insert({
      industry_id: input.industryId,
      region_id: input.regionId,
      radius_km: input.radiusKm,
      max_results: input.maxResults,
      source_id: sourceId,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (jobInsertError || !job) {
    throw new Error(
      jobInsertError?.message ?? "research_jobs konnte nicht angelegt werden."
    );
  }

  const jobId = job.id;

  try {
    const query = await buildOverpassQuery({
      industryId: input.industryId,
      regionId: input.regionId,
      radiusKm: input.radiusKm,
    });

    const rawResponse = await fetchOverpass(query);
    const parsed = parseOverpassResponse(rawResponse);
    const limited = parsed.slice(0, input.maxResults);

    const existingDomains = await loadExistingLeadDomains();
    const toInsert: ReturnType<typeof toInsertRow>[] = [];
    const seenRefs = new Set<string>();
    const seenUrls = new Set<string>();

    for (const draft of limited) {
      if (seenRefs.has(draft.source_ref)) continue;
      seenRefs.add(draft.source_ref);

      if (
        draft.url_normalized &&
        existingDomains.has(draft.url_normalized)
      ) {
        continue;
      }

      if (draft.url_normalized) {
        if (seenUrls.has(draft.url_normalized)) continue;
        seenUrls.add(draft.url_normalized);
      }

      toInsert.push(toInsertRow(draft, jobId, input, sourceId));
    }

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("research_results")
        .insert(toInsert);

      if (insertError) {
        throw new Error(
          `research_results Insert fehlgeschlagen: ${insertError.message}`
        );
      }
    }

    const { error: updateError } = await supabase
      .from("research_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        results_found: toInsert.length,
        raw_response: rawResponse,
      })
      .eq("id", jobId);

    if (updateError) {
      throw new Error(
        `research_jobs Update fehlgeschlagen: ${updateError.message}`
      );
    }

    return { jobId, resultsCount: toInsert.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await supabase
      .from("research_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", jobId);

    throw err;
  }
}
