import { normalizeUrl } from "@/lib/core/checks/normalizeUrl";
import { runWebsiteCheck } from "@/lib/core/checks";
import { createAdminClient } from "@/lib/supabase/admin";
import { companyFromUrl } from "./companyFromUrl";
import { findLeadByNormalizedDomain } from "./queries";
import { getManualSourceId } from "./source";
import type { LeadRow } from "./types";

export class DuplicateLeadError extends Error {
  lead_id: string;
  firma: string | null;

  constructor(lead_id: string, firma: string | null) {
    super("Lead existiert bereits.");
    this.name = "DuplicateLeadError";
    this.lead_id = lead_id;
    this.firma = firma;
  }
}

export async function createLeadRecord(args: {
  url: string;
  company_name?: string;
  industry_id?: string;
  region_id?: string;
}): Promise<LeadRow> {
  const { url, normalized } = normalizeUrl(args.url);

  const duplicate = await findLeadByNormalizedDomain(normalized);
  if (duplicate) {
    throw new DuplicateLeadError(duplicate.id, duplicate.firma);
  }

  const sourceId = await getManualSourceId();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      domain: url,
      normalized_domain: normalized,
      firma: args.company_name?.trim() || companyFromUrl(normalized),
      industry_id: args.industry_id ?? null,
      region_id: args.region_id ?? null,
      source_id: sourceId,
      has_website: true,
      status: "new",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Lead konnte nicht angelegt werden.");
  }

  return data as LeadRow;
}

export async function createLeadWithOptionalCheck(args: {
  url: string;
  company_name?: string;
  industry_id?: string;
  region_id?: string;
  run_check?: boolean;
}): Promise<{ lead: LeadRow; check_id?: string; check_result?: Awaited<ReturnType<typeof runWebsiteCheck>> }> {
  const lead = await createLeadRecord(args);

  if (args.run_check === false) {
    return { lead };
  }

  const checkResult = await runWebsiteCheck({
    url: args.url,
    target: { type: "lead", id: lead.id },
  });

  return {
    lead,
    check_id: checkResult.check_id,
    check_result: checkResult,
  };
}
