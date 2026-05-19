import { NextResponse } from "next/server";
import { dismissResearchResult } from "@/lib/research/resultActions";

export const runtime = "nodejs";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const result = await dismissResearchResult(id);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[research/results/dismiss]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
