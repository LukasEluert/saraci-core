import { NextResponse } from "next/server";
import { z } from "zod";
import { LEAD_STATUS_SET } from "@/lib/leads/constants";
import { emitLeadQualified } from "@/lib/leads/events";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.string().optional(),
  note: z.string().optional(),
  next_step: z.string().optional(),
  industry_id: z.string().uuid().nullable().optional(),
  region_id: z.string().uuid().nullable().optional(),
  potential: z.enum(["low", "medium", "high"]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.status && !LEAD_STATUS_SET.has(parsed.data.status as never)) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.note !== undefined) updates.notiz = parsed.data.note;
  if (parsed.data.next_step !== undefined) {
    updates.naechster_schritt = parsed.data.next_step;
  }
  if (parsed.data.industry_id !== undefined) {
    updates.industry_id = parsed.data.industry_id;
  }
  if (parsed.data.region_id !== undefined) updates.region_id = parsed.data.region_id;
  if (parsed.data.potential !== undefined) updates.potential = parsed.data.potential;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine Felder zum Aktualisieren." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (parsed.data.status === "qualified") {
    await emitLeadQualified(id, data.firma);
  }

  return NextResponse.json({ lead: data });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: checks, error: checksError } = await supabase
    .from("website_checks")
    .select("id")
    .eq("lead_id", id);

  if (checksError) {
    return NextResponse.json(
      { ok: false, error: checksError.message },
      { status: 500 }
    );
  }

  const checkIds = (checks ?? []).map((c) => c.id);

  if (checkIds.length > 0) {
    const { error: reportsError } = await supabase
      .from("lead_reports")
      .delete()
      .in("check_id", checkIds);

    if (reportsError) {
      return NextResponse.json(
        { ok: false, error: reportsError.message },
        { status: 500 }
      );
    }
  }

  const { error: reportsByLeadError } = await supabase
    .from("lead_reports")
    .delete()
    .eq("lead_id", id);

  if (reportsByLeadError) {
    return NextResponse.json(
      { ok: false, error: reportsByLeadError.message },
      { status: 500 }
    );
  }

  const { error: checksDeleteError } = await supabase
    .from("website_checks")
    .delete()
    .eq("lead_id", id);

  if (checksDeleteError) {
    return NextResponse.json(
      { ok: false, error: checksDeleteError.message },
      { status: 500 }
    );
  }

  const { error: eventsBySourceError } = await supabase
    .from("core_events")
    .delete()
    .eq("source_id", id);

  if (eventsBySourceError) {
    return NextResponse.json(
      { ok: false, error: eventsBySourceError.message },
      { status: 500 }
    );
  }

  const { error: eventsByMetaError } = await supabase
    .from("core_events")
    .delete()
    .filter("metadata->>lead_id", "eq", id);

  if (eventsByMetaError) {
    return NextResponse.json(
      { ok: false, error: eventsByMetaError.message },
      { status: 500 }
    );
  }

  const { error: leadError } = await supabase.from("leads").delete().eq("id", id);

  if (leadError) {
    return NextResponse.json(
      { ok: false, error: leadError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
