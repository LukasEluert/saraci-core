import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedApi } from "@/lib/auth/apiGuard";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { findDuplicateLeads } from "@/lib/leads/checkDuplicate";

export const runtime = "nodejs";

const bodySchema = z.object({
  domain: z.string(),
  firma: z.string().optional(),
});

export async function POST(req: Request) {
  const denied = await requireAuthenticatedApi();
  if (denied) return denied;

  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

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

  try {
    const supabase =
      profile.role === "admin" ? createAdminClient() : await createClient();
    const duplicates = await findDuplicateLeads(parsed.data, supabase);
    return NextResponse.json({ duplicates });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
