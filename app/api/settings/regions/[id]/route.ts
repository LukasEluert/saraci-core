import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePostalCodesField } from "@/lib/settings/keywords";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  active: z.boolean().optional(),
  postal_codes: z.union([z.array(z.string()), z.string()]).optional(),
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

  const postal_codes = normalizePostalCodesField(parsed.data.postal_codes);

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.lat !== undefined) updates.lat = parsed.data.lat;
  if (parsed.data.lng !== undefined) updates.lng = parsed.data.lng;
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;
  if (postal_codes !== undefined) updates.postal_codes = postal_codes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine Felder zum Aktualisieren." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("regions")
    .update(updates)
    .eq("id", id)
    .select("id, name, slug, lat, lng, active, postal_codes")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Region nicht gefunden." }, { status: 404 });
  }

  revalidatePath("/einstellungen");
  return NextResponse.json({ region: data });
}
