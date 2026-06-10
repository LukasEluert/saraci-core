import { createAdminClient } from "@/lib/supabase/admin";
import { buildCalendar, type IcsEvent } from "@/lib/akquise/ics";

export const runtime = "nodejs";
export const maxDuration = 120;
// Unauthentifiziert: der Token IST die Auth. Kein Caching, immer frisch ausliefern.
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DAY_MS = 24 * 60 * 60 * 1000;

type ApptRow = {
  id: string;
  titel: string;
  faellig_am: string;
  lead: {
    id: string;
    firma: string | null;
    domain: string | null;
    telefon: string | null;
    notiz: string | null;
  } | null;
};

function truncateText(value: string | null | undefined, max = 200): string {
  if (!value?.trim()) return "—";
  const t = value.trim();
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`;
}

export async function GET(req: Request, context: RouteContext) {
  const { token } = await context.params;

  if (!TOKEN_RE.test(token)) {
    return new Response("Not found", { status: 404 });
  }

  // Service-Role bewusst: kein Login-Kontext, Token loest den Nutzer auf (umgeht RLS).
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("calendar_token", token)
    .maybeSingle();

  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  const now = Date.now();
  const from = new Date(now - 7 * DAY_MS).toISOString();
  const to = new Date(now + 90 * DAY_MS).toISOString();

  const { data: appointments } = await admin
    .from("appointments")
    .select(
      "id, titel, faellig_am, lead:leads(id, firma, domain, telefon, notiz)"
    )
    .eq("user_id", profile.id)
    .eq("erledigt", false)
    .gte("faellig_am", from)
    .lte("faellig_am", to)
    .order("faellig_am", { ascending: true });

  const appBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin;

  const events: IcsEvent[] = ((appointments ?? []) as unknown as ApptRow[]).map(
    (a) => {
      const firma = a.lead?.firma || a.lead?.domain || "—";
      const telefon = a.lead?.telefon?.trim() || "—";
      const notiz = truncateText(a.lead?.notiz);
      const summary = `${a.titel}: ${firma}`;
      const link = a.lead?.id
        ? `${appBase}/akquise/${a.lead.id}`
        : `${appBase}/akquise`;
      const description = [
        a.titel,
        "",
        `Firma: ${firma}`,
        `Telefon: ${telefon}`,
        `Notiz: ${notiz}`,
        "",
        link,
      ].join("\n");

      return {
        uid: a.id,
        start: new Date(a.faellig_am),
        summary,
        description,
      };
    }
  );

  return new Response(buildCalendar(events), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="saraci-akquise.ics"',
    },
  });
}
