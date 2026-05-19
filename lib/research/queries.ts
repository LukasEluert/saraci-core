import { createAdminClient } from "@/lib/supabase/admin";

export interface ResearchJobListItem {
  id: string;
  industry_id: string;
  region_id: string;
  radius_km: number;
  max_results: number;
  status: string;
  results_found: number | null;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  industry?: { id: string; name: string; slug: string | null } | null;
  region?: { id: string; name: string; slug: string | null } | null;
}

export interface ResearchResultRow {
  id: string;
  job_id: string | null;
  company_name: string | null;
  website_url: string | null;
  address: string | null;
  has_website: boolean | null;
  status: string | null;
  phone: string | null;
  lead_id: string | null;
}

const JOB_SELECT = `
  *,
  industry:industries(id, name, slug),
  region:regions(id, name, slug)
`;

export async function listResearchJobs(): Promise<ResearchJobListItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("research_jobs")
    .select(JOB_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ResearchJobListItem[];
}

export async function getResearchJob(
  id: string
): Promise<ResearchJobListItem | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("research_jobs")
    .select(JOB_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ResearchJobListItem) ?? null;
}

export async function listResearchResultsForJob(
  jobId: string
): Promise<ResearchResultRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("research_results")
    .select(
      "id, job_id, company_name, website_url, address, has_website, status, phone, lead_id"
    )
    .eq("job_id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ResearchResultRow[];

  return rows.sort((a, b) => {
    const aWeb = a.has_website === true ? 0 : 1;
    const bWeb = b.has_website === true ? 0 : 1;
    if (aWeb !== bWeb) return aWeb - bWeb;

    const aName = (a.company_name ?? "").toLocaleLowerCase("de");
    const bName = (b.company_name ?? "").toLocaleLowerCase("de");
    return aName.localeCompare(bName, "de");
  });
}
