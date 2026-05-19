import { NextResponse } from "next/server";
import { runWebsiteCheck } from "@/lib/core/checks";
import { assertInternalToken } from "@/lib/leads/assertInternalToken";
import { countPendingChecks, getLeadForCheck } from "@/lib/leads/queries";
import { triggerProcessQueue } from "@/lib/leads/queue";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const forbidden = assertInternalToken(req);
  if (forbidden) return forbidden;

  const supabase = createAdminClient();

  const { data: event, error: fetchError } = await supabase
    .from("core_events")
    .select("*")
    .eq("type", "lead.check_requested")
    .eq("processed", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ processed: 0, remaining: 0 });
  }

  const { data: locked, error: lockError } = await supabase
    .from("core_events")
    .update({ processed: true })
    .eq("id", event.id)
    .eq("processed", false)
    .select("*")
    .maybeSingle();

  if (lockError) {
    return NextResponse.json({ error: lockError.message }, { status: 500 });
  }

  if (!locked) {
    const remaining = await countPendingChecks();
    return NextResponse.json({ processed: 0, remaining });
  }

  const metadata = locked.metadata as { lead_id?: string; url?: string } | null;
  const leadId = metadata?.lead_id ?? locked.source_id;

  if (leadId) {
    const lead = await getLeadForCheck(leadId);
    if (lead) {
      try {
        await runWebsiteCheck({
          url: metadata?.url ?? lead.domain,
          target: { type: "lead", id: lead.id },
        });
      } catch (err) {
        console.error("[process-check-queue]", err);
      }
    }
  }

  const remaining = await countPendingChecks();

  if (remaining > 0) {
    triggerProcessQueue();
  }

  return NextResponse.json({ processed: 1, remaining });
}
