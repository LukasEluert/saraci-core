import { NextResponse } from "next/server";
import { z } from "zod";
import { assertDevToken } from "@/lib/core/checks/assertDevToken";
import { findRecentWebsiteCheck } from "@/lib/core/checks/findRecentCheck";
import { normalizeUrl } from "@/lib/core/checks/normalizeUrl";
import { runWebsiteCheck } from "@/lib/core/checks";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  url: z.string().min(1, "URL fehlt"),
  force: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const forbidden = assertDevToken(req);
  if (forbidden) return forbidden;

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

  const force =
    new URL(req.url).searchParams.get("force") === "true" ||
    parsed.data.force === true;

  try {
    const { normalized } = normalizeUrl(parsed.data.url);

    if (!force) {
      const recent = await findRecentWebsiteCheck(normalized);
      if (recent) {
        return NextResponse.json({
          ...recent,
          cached: true,
        });
      }
    }

    const result = await runWebsiteCheck({
      url: parsed.data.url,
      target: { type: "standalone" },
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[dev/check-url]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
