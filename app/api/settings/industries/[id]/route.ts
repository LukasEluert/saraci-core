import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeKeywordsField } from "@/lib/settings/keywords";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  keywords: z.union([z.array(z.string()), z.string()]).optional(),
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

  const keywords = normalizeKeywordsField(parsed.data.keywords);

  if (
    parsed.data.name === undefined &&
    parsed.data.active === undefined &&
    keywords === undefined
  ) {
    return NextResponse.json({ error: "Keine Felder zum Aktualisieren." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;
  if (keywords !== undefined) updates.keywords = keywords;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industries")
    .update(updates)
    .eq("id", id)
    .select("id, name, slug, active, keywords")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Branche nicht gefunden." }, { status: 404 });
  }

  revalidatePath("/einstellungen");
  return NextResponse.json({ industry: data });
}
