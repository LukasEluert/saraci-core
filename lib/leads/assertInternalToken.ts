import { NextResponse } from "next/server";

export function assertInternalToken(req: Request): NextResponse | null {
  const expected = process.env.INTERNAL_QUEUE_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { error: "INTERNAL_QUEUE_TOKEN ist nicht gesetzt." },
      { status: 503 }
    );
  }

  const provided = req.headers.get("x-internal-token");
  if (provided !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
