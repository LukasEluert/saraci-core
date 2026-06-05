import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { emitCheckRequested } from "@/lib/leads/events";
import { triggerProcessQueue } from "@/lib/leads/queue";
import { getLeadForCheck } from "@/lib/leads/queries";

export const runtime = "nodejs";

const bodySchema = z.object({
  lead_ids: z.array(z.string().uuid()).min(1).max(50),
});

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

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

  let queued = 0;

  for (const leadId of parsed.data.lead_ids) {
    const lead = await getLeadForCheck(leadId);
    if (!lead) continue;
    await emitCheckRequested(lead.id, lead.domain);
    queued += 1;
  }

  if (queued > 0) {
    triggerProcessQueue();
  }

  return NextResponse.json({ queued });
}
