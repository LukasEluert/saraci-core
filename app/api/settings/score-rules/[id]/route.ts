import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SCORE_RULE_CATEGORIES,
  SCORE_RULE_SEVERITIES,
} from "@/lib/settings/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const patchSchema = z.object({
  label: z.string().min(1).optional(),
  points: z.number().int().min(-50).max(0).optional(),
  severity: z.enum(SCORE_RULE_SEVERITIES).optional(),
  category: z.enum(SCORE_RULE_CATEGORIES).optional(),
  active: z.boolean().optional(),
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

  const updates: Record<string, unknown> = {};
  if (parsed.data.label !== undefined) updates.label = parsed.data.label.trim();
  if (parsed.data.points !== undefined) updates.points = parsed.data.points;
  if (parsed.data.severity !== undefined) updates.severity = parsed.data.severity;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine Felder zum Aktualisieren." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("score_rules")
    .update(updates)
    .eq("id", id)
    .select("id, key, label, category, points, severity, active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Regel nicht gefunden." }, { status: 404 });
  }

  revalidatePath("/einstellungen");
  return NextResponse.json({ rule: data });
}
