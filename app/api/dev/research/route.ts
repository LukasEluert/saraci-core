import { NextResponse } from "next/server";
import { z } from "zod";
import { assertDevToken } from "@/lib/core/checks/assertDevToken";
import { createAdminClient } from "@/lib/supabase/admin";
import { runResearchJob } from "@/lib/research/runResearchJob";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  industry_slug: z.string().min(1),
  region_slug: z.string().min(1),
  radius_km: z.number().positive().max(50),
  max_results: z.number().int().positive().max(500),
});

async function resolveIndustryId(slug: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Branche „${slug}“ nicht gefunden.`);
  }

  return data.id;
}

async function resolveRegionId(slug: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("regions")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Region „${slug}“ nicht gefunden.`);
  }

  return data.id;
}

export async function POST(req: Request) {
  const forbidden = assertDevToken(req);
  if (forbidden) return forbidden;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const [industryId, regionId] = await Promise.all([
      resolveIndustryId(parsed.data.industry_slug),
      resolveRegionId(parsed.data.region_slug),
    ]);

    const { jobId, resultsCount } = await runResearchJob({
      industryId,
      regionId,
      radiusKm: parsed.data.radius_km,
      maxResults: parsed.data.max_results,
    });

    return NextResponse.json({
      ok: true,
      job_id: jobId,
      results_count: resultsCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[dev/research]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
