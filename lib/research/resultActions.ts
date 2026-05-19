import { normalizeUrl } from "@/lib/core/checks/normalizeUrl";
import { runWebsiteCheck } from "@/lib/core/checks";
import { companyFromUrl } from "@/lib/leads/companyFromUrl";
import { findLeadByNormalizedDomain } from "@/lib/leads/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export type ResearchResultForAction = {
  id: string;
  job_id: string | null;
  company_name: string | null;
  website_url: string | null;
  url_normalized: string | null;
  phone: string | null;
  address: string | null;
  has_website: boolean | null;
  status: string | null;
  lead_id: string | null;
  industry_id: string | null;
  region_id: string | null;
  source_id: string | null;
};

function pickNormalized(row: Record<string, unknown>): string | null {
  const v = row.url_normalized ?? row.normalized_url;
  return typeof v === "string" && v.length > 0 ? v : null;
}

export async function getResearchResultForAction(
  id: string
): Promise<ResearchResultForAction | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("research_results")
    .select(
      "id, job_id, company_name, website_url, url_normalized, normalized_url, phone, address, has_website, status, lead_id, industry_id, region_id, source_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    job_id: (row.job_id as string | null) ?? null,
    company_name: (row.company_name as string | null) ?? null,
    website_url: (row.website_url as string | null) ?? null,
    url_normalized: pickNormalized(row),
    phone: (row.phone as string | null) ?? null,
    address: (row.address as string | null) ?? null,
    has_website: (row.has_website as boolean | null) ?? null,
    status: (row.status as string | null) ?? null,
    lead_id: (row.lead_id as string | null) ?? null,
    industry_id: (row.industry_id as string | null) ?? null,
    region_id: (row.region_id as string | null) ?? null,
    source_id: (row.source_id as string | null) ?? null,
  };
}

async function incrementLeadsCreated(jobId: string | null): Promise<void> {
  if (!jobId) return;

  const supabase = createAdminClient();
  const { data: job, error: loadError } = await supabase
    .from("research_jobs")
    .select("leads_created")
    .eq("id", jobId)
    .maybeSingle();

  if (loadError || !job || !("leads_created" in job)) {
    return;
  }

  const current =
    typeof job.leads_created === "number" ? job.leads_created : 0;

  await supabase
    .from("research_jobs")
    .update({ leads_created: current + 1 })
    .eq("id", jobId);
}

export async function saveResearchResultAsLead(
  resultId: string,
  options: { run_check?: boolean }
): Promise<
  | { ok: true; lead_id: string; check_started: boolean }
  | { ok: false; error: string; lead_id?: string; status: number }
> {
  const result = await getResearchResultForAction(resultId);
  if (!result) {
    return { ok: false, error: "Fund nicht gefunden.", status: 404 };
  }

  const status = (result.status ?? "new").toLowerCase();
  if (status === "saved" || result.lead_id) {
    return {
      ok: false,
      error: "Already saved",
      lead_id: result.lead_id ?? undefined,
      status: 409,
    };
  }

  if (status !== "new") {
    return {
      ok: false,
      error: `Fund hat Status „${result.status}“ und kann nicht übernommen werden.`,
      status: 409,
    };
  }

  const hasWebsite = result.has_website === true;
  const runCheck = options.run_check !== false;

  if (hasWebsite && result.url_normalized) {
    const duplicate = await findLeadByNormalizedDomain(result.url_normalized);
    if (duplicate) {
      return {
        ok: false,
        error: "Lead with this URL exists",
        lead_id: duplicate.id,
        status: 409,
      };
    }
  }

  let domain: string;
  let normalized_domain: string | null = null;

  if (hasWebsite && result.website_url?.trim()) {
    try {
      const normalized = normalizeUrl(result.website_url.trim());
      domain = normalized.url;
      normalized_domain =
        result.url_normalized ?? normalized.normalized;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ungültige Website-URL.";
      return { ok: false, error: message, status: 400 };
    }
  } else {
    domain = `research:${result.id}`;
    normalized_domain = null;
  }

  const firma =
    result.company_name?.trim() ||
    (normalized_domain
      ? companyFromUrl(normalized_domain)
      : result.company_name?.trim() || "Unbekannt");

  const supabase = createAdminClient();
  // OSM-Branche/Region vom Research-Job übernehmen (bleibt bei Check erhalten,
  // da detectIndustry/detectRegion nur setzen wenn IDs noch null sind).
  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      domain,
      normalized_domain,
      firma,
      industry_id: result.industry_id ?? null,
      region_id: result.region_id ?? null,
      source_id: result.source_id,
      has_website: hasWebsite,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError || !lead) {
    return {
      ok: false,
      error: insertError?.message ?? "Lead konnte nicht angelegt werden.",
      status: 500,
    };
  }

  const { error: updateError } = await supabase
    .from("research_results")
    .update({
      status: "saved",
      lead_id: lead.id,
    })
    .eq("id", resultId);

  if (updateError) {
    return { ok: false, error: updateError.message, status: 500 };
  }

  await incrementLeadsCreated(result.job_id);

  let check_started = false;
  if (runCheck && hasWebsite && result.website_url?.trim()) {
    await runWebsiteCheck({
      url: result.website_url.trim(),
      target: { type: "lead", id: lead.id },
    });
    check_started = true;
  }

  return { ok: true, lead_id: lead.id, check_started };
}

export async function dismissResearchResult(
  resultId: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const result = await getResearchResultForAction(resultId);
  if (!result) {
    return { ok: false, error: "Fund nicht gefunden.", status: 404 };
  }

  const status = (result.status ?? "new").toLowerCase();
  if (status !== "new") {
    return {
      ok: false,
      error: `Fund hat Status „${result.status}“.`,
      status: 409,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("research_results")
    .update({ status: "dismissed" })
    .eq("id", resultId);

  if (error) {
    return { ok: false, error: error.message, status: 500 };
  }

  return { ok: true };
}

/** DB erlaubt „later“ nicht – wird auf „pending“ gemappt (Badge: Ausstehend). */
export async function deferResearchResult(
  resultId: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const result = await getResearchResultForAction(resultId);
  if (!result) {
    return { ok: false, error: "Fund nicht gefunden.", status: 404 };
  }

  const status = (result.status ?? "new").toLowerCase();
  if (status !== "new") {
    return {
      ok: false,
      error: `Fund hat Status „${result.status}“.`,
      status: 409,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("research_results")
    .update({ status: "pending" })
    .eq("id", resultId);

  if (error) {
    return { ok: false, error: error.message, status: 500 };
  }

  return { ok: true };
}
