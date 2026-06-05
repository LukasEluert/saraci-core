import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { saveResearchResultAsLead } from "@/lib/research/resultActions";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  run_check: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;

  let run_check: boolean | undefined;
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (parsed.success) {
      run_check = parsed.data.run_check;
    }
  } catch {
    // leerer Body ist ok
  }

  try {
    const result = await saveResearchResultAsLead(id, { run_check });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          ...(result.lead_id ? { lead_id: result.lead_id } : {}),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      ok: true,
      lead_id: result.lead_id,
      check_started: result.check_started,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[research/results/save]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
