import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { runWebsiteCheck } from "@/lib/core/checks";
import { getLeadForCheck } from "@/lib/leads/queries";

export const runtime = "nodejs";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;

  const lead = await getLeadForCheck(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead nicht gefunden." }, { status: 404 });
  }

  try {
    const result = await runWebsiteCheck({
      url: lead.domain,
      target: { type: "lead", id: lead.id },
    });

    return NextResponse.json({
      ok: result.ok,
      check_id: result.check_id,
      report_id: result.report_id,
      score: result.score,
      potential: result.potential,
      status: result.status,
      error: result.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
