import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createLeadWithOptionalCheck,
  DuplicateLeadError,
} from "@/lib/leads/createLead";
import { listLeads } from "@/lib/leads/queries";

export const runtime = "nodejs";
export const maxDuration = 120;

const postSchema = z.object({
  url: z.string().min(1),
  company_name: z.string().optional(),
  industry_id: z.string().uuid().optional(),
  region_id: z.string().uuid().optional(),
  run_check: z.boolean().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const status = searchParams.getAll("status").filter(Boolean);
  const potential = searchParams.getAll("potential").filter(Boolean);
  const scoreMin = searchParams.get("score_min");
  const scoreMax = searchParams.get("score_max");
  const q = searchParams.get("q") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");

  try {
    const { leads, total } = await listLeads({
      status: status.length ? status : undefined,
      potential: potential.length ? potential : undefined,
      score_min: scoreMin ? Number(scoreMin) : undefined,
      score_max: scoreMax ? Number(scoreMax) : undefined,
      q,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json({ leads, total });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const { lead, check_id, check_result } = await createLeadWithOptionalCheck({
      url: parsed.data.url,
      company_name: parsed.data.company_name,
      industry_id: parsed.data.industry_id,
      region_id: parsed.data.region_id,
      run_check: parsed.data.run_check ?? true,
    });

    return NextResponse.json({
      lead_id: lead.id,
      check_id: check_id ?? null,
      score: check_result?.score ?? null,
      potential: check_result?.potential ?? null,
      status: check_result?.status ?? null,
      ok: check_result?.ok ?? true,
    });
  } catch (err) {
    if (err instanceof DuplicateLeadError) {
      return NextResponse.json(
        {
          error: "Lead existiert bereits.",
          lead_id: err.lead_id,
          firma: err.firma,
        },
        { status: 409 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
