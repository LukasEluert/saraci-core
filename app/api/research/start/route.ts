import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveIndustryId, resolveRegionId } from "@/lib/research/resolve";
import { runResearchJob } from "@/lib/research/runResearchJob";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  industry_slug: z.string().min(1),
  region_slug: z.string().min(1),
  radius_km: z.number().positive().max(50),
  max_results: z.number().int().positive().max(100),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültiger JSON-Body." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const [industryId, regionId] = await Promise.all([
      resolveIndustryId(parsed.data.industry_slug),
      resolveRegionId(parsed.data.region_slug),
    ]);

    const { jobId } = await runResearchJob({
      industryId,
      regionId,
      radiusKm: parsed.data.radius_km,
      maxResults: parsed.data.max_results,
    });

    return NextResponse.json({ ok: true, job_id: jobId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[research/start]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
