import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { slugFromName } from "@/lib/settings/slug";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const postSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  active: z.boolean().optional(),
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

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const slug =
    parsed.data.slug?.trim() || slugFromName(parsed.data.name);
  if (!slug) {
    return NextResponse.json(
      { error: "Slug konnte nicht erzeugt werden." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("industries")
    .insert({
      name: parsed.data.name.trim(),
      slug,
      active: parsed.data.active ?? true,
    })
    .select("id, name, slug, active, keywords")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/einstellungen");
  return NextResponse.json({ industry: data });
}
