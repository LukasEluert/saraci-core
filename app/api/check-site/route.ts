import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { runSiteCheck } from "@/lib/siteCheck";

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

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
