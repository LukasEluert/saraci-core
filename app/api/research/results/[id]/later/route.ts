import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { deferResearchResult } from "@/lib/research/resultActions";

export const runtime = "nodejs";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const result = await deferResearchResult(id);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ ok: true, mapped_status: "pending" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[research/results/later]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
