import { NextResponse } from "next/server";

/**
 * Schützt Dev-Endpoints vor Missbrauch auf öffentlichen Deployments.
 * Token nur serverseitig – nie in Client-Bundles importieren.
 */
export function assertDevToken(req: Request): NextResponse | null {
  const expected = process.env.DEV_CHECK_TOKEN;

  if (!expected) {
    return NextResponse.json(
      {
        error:
          "DEV_CHECK_TOKEN ist nicht gesetzt. In .env.local ergänzen (siehe .env.example).",
      },
      { status: 503 }
    );
  }

  const provided = req.headers.get("x-dev-token");
  if (provided !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
