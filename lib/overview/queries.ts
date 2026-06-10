import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUserNames } from "@/lib/admin/queries";
import { daysSince, getLastFiveWeekRanges } from "./weeks";

const ACTION_LIMIT = 10;

const LEAD_ACTION_FIELDS =
  "id, firma, telefon, akquise_status, aktion_seit, updated_at, created_at";

type LeadActionRow = {
  id: string;
  firma: string | null;
  telefon: string | null;
  akquise_status: string;
  aktion_seit: string | null;
  updated_at: string | null;
  created_at: string | null;
};

export type ActionLeadItem = {
  id: string;
  firma: string;
  telefon: string | null;
  akquiseStatus: string;
  daysAgo: number;
  referenceAt: string;
};

export type ActionRequired = {
  followUps: ActionLeadItem[];
  followUpTotal: number;
  rueckrufe: ActionLeadItem[];
  rueckrufTotal: number;
};

export type PipelineStats = {
  offen: number;
  interesse: number;
  angebotRaus: number;
  handlungsbedarf: number;
};

export type WeeklyTrendPoint = {
  label: string;
  count: number;
  isCurrent: boolean;
};

export type ConversionRate = {
  rate: number | null;
  gewonnen: number;
  abgeschlossen: number;
  trend: "up" | "down" | "flat" | null;
};

export type RecentActivityRow = {
  id: string;
  typ: string;
  userName: string;
  firma: string;
  leadId: string | null;
  createdAt: string;
  notiz: string | null;
};

function referenceForFollowUp(lead: LeadActionRow): string {
  return lead.updated_at ?? lead.created_at ?? "";
}

function referenceForRueckruf(lead: LeadActionRow): string {
  return lead.aktion_seit ?? lead.updated_at ?? lead.created_at ?? "";
}

function toActionItem(
  lead: LeadActionRow,
  referenceAt: string
): ActionLeadItem {
  return {
    id: lead.id,
    firma: lead.firma || "Lead",
    telefon: lead.telefon,
    akquiseStatus: lead.akquise_status,
    daysAgo: daysSince(referenceAt),
    referenceAt,
  };
}

function sortByReferenceAsc(a: ActionLeadItem, b: ActionLeadItem): number {
  return new Date(a.referenceAt).getTime() - new Date(b.referenceAt).getTime();
}

export async function getActionRequired(): Promise<ActionRequired> {
  const supabase = createAdminClient();

  const [{ data: followRaw }, { data: rueckRaw }] = await Promise.all([
    supabase
      .from("leads")
      .select(LEAD_ACTION_FIELDS)
      .eq("archiviert", false)
      .in("akquise_status", ["angebot_raus", "email_raus"]),
    supabase
      .from("leads")
      .select(LEAD_ACTION_FIELDS)
      .eq("archiviert", false)
      .in("akquise_status", ["rueckruf_vereinbart", "in_kontakt"]),
  ]);

  const followAll = ((followRaw ?? []) as LeadActionRow[])
    .map((lead) => {
      const ref = referenceForFollowUp(lead);
      return ref && daysSince(ref) >= 7 ? toActionItem(lead, ref) : null;
    })
    .filter((item): item is ActionLeadItem => item !== null)
    .sort(sortByReferenceAsc);

  const rueckAll = ((rueckRaw ?? []) as LeadActionRow[])
    .map((lead) => {
      const ref = referenceForRueckruf(lead);
      return ref && daysSince(ref) >= 5 ? toActionItem(lead, ref) : null;
    })
    .filter((item): item is ActionLeadItem => item !== null)
    .sort(sortByReferenceAsc);

  return {
    followUps: followAll.slice(0, ACTION_LIMIT),
    followUpTotal: followAll.length,
    rueckrufe: rueckAll.slice(0, ACTION_LIMIT),
    rueckrufTotal: rueckAll.length,
  };
}

export async function getPipelineStats(): Promise<PipelineStats> {
  const supabase = createAdminClient();

  const base = () => supabase.from("leads").select("*", { count: "exact", head: true }).eq("archiviert", false);

  const [offenRes, interesseRes, angebotRes, handlungRes] = await Promise.all([
    base().not("akquise_status", "in", '("kein_interesse","kunde")'),
    base().eq("akquise_status", "in_kontakt"),
    base().eq("akquise_status", "angebot_raus"),
    base().neq("aktion_benoetigt", "keine"),
  ]);

  return {
    offen: offenRes.count ?? 0,
    interesse: interesseRes.count ?? 0,
    angebotRaus: angebotRes.count ?? 0,
    handlungsbedarf: handlungRes.count ?? 0,
  };
}

export async function getWeeklyTrend(): Promise<WeeklyTrendPoint[]> {
  const supabase = createAdminClient();
  const weeks = getLastFiveWeekRanges();

  const counts = await Promise.all(
    weeks.map(async (week) => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", week.start.toISOString())
        .lte("created_at", week.end.toISOString());

      return {
        label: week.label,
        count: count ?? 0,
        isCurrent: week.isCurrent,
      };
    })
  );

  return counts;
}

export async function getConversionRate(): Promise<ConversionRate> {
  const supabase = createAdminClient();

  const [kundeRes, keinRes] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("akquise_status", "kunde"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("akquise_status", "kein_interesse"),
  ]);

  const gewonnen = kundeRes.count ?? 0;
  const verloren = keinRes.count ?? 0;
  const abgeschlossen = gewonnen + verloren;
  const rate =
    abgeschlossen > 0 ? Math.round((gewonnen / abgeschlossen) * 1000) / 10 : null;

  // Optional: Trend = Kunden-Anteil der Outcomes im Vormonat vs. aktuellem Monat
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [curKunde, curKein, prevKunde, prevKein] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("akquise_status", "kunde")
      .gte("updated_at", monthStart.toISOString()),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("akquise_status", "kein_interesse")
      .gte("updated_at", monthStart.toISOString()),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("akquise_status", "kunde")
      .gte("updated_at", prevMonthStart.toISOString())
      .lte("updated_at", prevMonthEnd.toISOString()),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("akquise_status", "kein_interesse")
      .gte("updated_at", prevMonthStart.toISOString())
      .lte("updated_at", prevMonthEnd.toISOString()),
  ]);

  const curTotal = (curKunde.count ?? 0) + (curKein.count ?? 0);
  const prevTotal = (prevKunde.count ?? 0) + (prevKein.count ?? 0);
  const curRate = curTotal > 0 ? (curKunde.count ?? 0) / curTotal : null;
  const prevRate = prevTotal > 0 ? (prevKunde.count ?? 0) / prevTotal : null;

  let trend: ConversionRate["trend"] = null;
  if (curRate !== null && prevRate !== null) {
    if (curRate > prevRate) trend = "up";
    else if (curRate < prevRate) trend = "down";
    else trend = "flat";
  }

  return { rate, gewonnen, abgeschlossen, trend };
}

export async function getRecentActivities(): Promise<RecentActivityRow[]> {
  const supabase = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from("activities")
    .select(
      `
      id, typ, ergebnis, notiz, created_at, user_id, lead_id,
      lead:leads(id, firma, domain)
    `
    )
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((r) => r.user_id as string).filter(Boolean))];
  const names = await resolveUserNames(userIds);

  return rows.map((row) => {
    const rawLead = row.lead as
      | { id: string; firma: string | null; domain: string | null }
      | { id: string; firma: string | null; domain: string | null }[]
      | null;
    const lead = Array.isArray(rawLead) ? rawLead[0] : rawLead;
    const text = (row.notiz as string | null) ?? (row.ergebnis as string | null);
    return {
      id: row.id as string,
      typ: row.typ as string,
      userName: names[row.user_id as string] ?? "Unbekannt",
      firma: lead?.firma || lead?.domain || "—",
      leadId: (row.lead_id as string | null) ?? lead?.id ?? null,
      createdAt: row.created_at as string,
      notiz: text,
    };
  });
}
