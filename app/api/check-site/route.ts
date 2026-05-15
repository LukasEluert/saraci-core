import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSiteCheck } from "@/lib/siteCheck";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const url =
    body && typeof body === "object" && "url" in body && typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url
      : "";

  if (!url.trim()) {
    return NextResponse.json({ error: "URL fehlt." }, { status: 400 });
  }

  try {
    const result = await runSiteCheck(url);
    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
