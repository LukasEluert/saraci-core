import "server-only";
import { getISOWeek, subDays } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUserNames } from "@/lib/admin/queries";
import { getLatestLeadNotesMapAdmin } from "@/lib/akquise/leadNotes";
import { getLastFiveWeekRanges } from "./weeks";
import {
  berlinDayEndUtc,
  berlinDayKey,
  berlinDayStartUtc,
  getPeriodRange,
  getPreviousPeriodRange,
  periodDays,
  type OverviewPeriod,
} from "./periods";

const NOT_REACHED_PATTERNS = [
  "nicht erreicht",
  "klingelt",
  "mailbox",
  "besetzt",
  "piept",
  "nicht ran",
  "niemand",
];

const INTERESSE_STATUSES = ["in_kontakt", "email_schreiben", "angebot_schreiben"];
const ANGEBOT_STATUSES = ["angebot_raus", "email_raus", "nachfassen"];
const LIFETIME_ANGEBOT_STATUSES = [
  "angebot_raus",
  "email_raus",
  "nachfassen",
  "kunde",
];
const LIFETIME_INTERESSE_EXCLUDED = ["neu", "nicht_erreicht", "kein_interesse"];

export type ActionItemRow = {
  id: string;
  firma: string;
  telefon: string | null;
  akquiseStatus: string;
  latestNote: string | null;
  assignedSince: string;
};

export type WeeklyKPIs = {
  offeneLeads: number;
  angebotRaus: number;
  handlungsbedarf: number;
  neueLeads: number;
  neueLeadsDelta: number;
  neueLeadsLabel: string;
};

export type CallStats = {
  callsThisPeriod: number;
  weeklyTarget: number;
  progressPercent: number;
  heute: number;
  gestern: number;
};

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  conversionPercent: number | null;
};

export type FunnelData = {
  stages: FunnelStage[];
  hasCalls: boolean;
};

export type CallsPerDayPoint = {
  dayKey: string;
  label: string;
  count: number;
};

export type WeeklyTrendPoint = {
  label: string;
  count: number;
  isCurrent: boolean;
  weekNumber: number;
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

export type OverviewData = {
  actionItems: ActionItemRow[];
  kpis: WeeklyKPIs;
  callStats: CallStats;
  funnel: FunnelData;
  funnelLifetime: FunnelData;
  callsPerDay: CallsPerDayPoint[];
  weeklyTrend: WeeklyTrendPoint[];
  activities: RecentActivityRow[];
};

function isCallReached(ergebnis: string | null | undefined): boolean {
  if (!ergebnis) return true;
  const lower = ergebnis.toLowerCase();
  return !NOT_REACHED_PATTERNS.some((pattern) => lower.includes(pattern));
}

function scaledCallTarget(weeklyTarget: number, period: OverviewPeriod): number {
  const days = periodDays(period);
  return Math.max(1, Math.round((weeklyTarget / 7) * days));
}

async function getVertriebUserIds(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "vertrieb");

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.id as string);
}

async function getWeeklyCallTargetSum(vertriebIds: string[]): Promise<number> {
  if (vertriebIds.length === 0) return 50;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("weekly_call_target")
    .in("id", vertriebIds);

  if (error) {
    return vertriebIds.length * 50;
  }

  return (data ?? []).reduce(
    (sum, row) => sum + ((row.weekly_call_target as number | null) ?? 50),
    0
  );
}

export async function getMyActionItems(userId: string): Promise<ActionItemRow[]> {
  const supabase = createAdminClient();

  const [{ data: assigned }, { data: nachfassen }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, firma, telefon, akquise_status, updated_at")
      .eq("archiviert", false)
      .eq("assigned_to", userId)
      .order("updated_at", { ascending: true }),
    supabase
      .from("leads")
      .select("id, firma, telefon, akquise_status, updated_at")
      .eq("archiviert", false)
      .eq("akquise_status", "nachfassen")
      .is("assigned_to", null)
      .order("updated_at", { ascending: true }),
  ]);

  const rows = [...(assigned ?? []), ...(nachfassen ?? [])].sort(
    (a, b) =>
      new Date(a.updated_at as string).getTime() -
      new Date(b.updated_at as string).getTime()
  );

  const leadIds = rows.map((row) => row.id as string);
  const notes = await getLatestLeadNotesMapAdmin(leadIds, supabase);

  return rows.map((row) => ({
    id: row.id as string,
    firma: (row.firma as string | null) || "Lead",
    telefon: row.telefon as string | null,
    akquiseStatus: row.akquise_status as string,
    latestNote: notes[row.id as string] ?? null,
    assignedSince: row.updated_at as string,
  }));
}

export async function getWeeklyKPIs(
  period: OverviewPeriod,
  userId: string
): Promise<WeeklyKPIs> {
  const supabase = createAdminClient();
  const range = getPeriodRange(period);
  const prevRange = getPreviousPeriodRange(period);

  const base = () =>
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("archiviert", false);

  const [
    offenRes,
    angebotRes,
    handlungRes,
    neueRes,
    prevNeueRes,
  ] = await Promise.all([
    base().not("akquise_status", "in", '("kein_interesse","kunde")'),
    base().in("akquise_status", ["angebot_raus", "email_raus"]),
    base().eq("assigned_to", userId),
    base()
      .gte("created_at", range.start.toISOString())
      .lte("created_at", range.end.toISOString()),
    base()
      .gte("created_at", prevRange.start.toISOString())
      .lte("created_at", prevRange.end.toISOString()),
  ]);

  const neueLeads = neueRes.count ?? 0;
  const prevNeue = prevNeueRes.count ?? 0;

  const neueLeadsLabel =
    period === "this_week" || period === "last_week"
      ? "vs Vorwoche"
      : period === "this_month"
        ? "vs Vormonat"
        : "vs vorherige 30 Tage";

  return {
    offeneLeads: offenRes.count ?? 0,
    angebotRaus: angebotRes.count ?? 0,
    handlungsbedarf: handlungRes.count ?? 0,
    neueLeads,
    neueLeadsDelta: neueLeads - prevNeue,
    neueLeadsLabel,
  };
}

export async function getCallStats(period: OverviewPeriod): Promise<CallStats> {
  const supabase = createAdminClient();
  const vertriebIds = await getVertriebUserIds();
  const weeklyTargetRaw = await getWeeklyCallTargetSum(vertriebIds);
  const target = scaledCallTarget(weeklyTargetRaw, period);
  const range = getPeriodRange(period);

  const todayKey = berlinDayKey(new Date());
  const yesterdayKey = berlinDayKey(subDays(new Date(), 1));

  const [{ count: periodCount }, { count: heuteCount }, { count: gesternCount }] =
    await Promise.all([
      supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("typ", "anruf")
        .in("user_id", vertriebIds.length > 0 ? vertriebIds : ["00000000-0000-0000-0000-000000000000"])
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString()),
      supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("typ", "anruf")
        .in("user_id", vertriebIds.length > 0 ? vertriebIds : ["00000000-0000-0000-0000-000000000000"])
        .gte("created_at", berlinDayStartUtc(todayKey).toISOString())
        .lte("created_at", berlinDayEndUtc(todayKey).toISOString()),
      supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("typ", "anruf")
        .in("user_id", vertriebIds.length > 0 ? vertriebIds : ["00000000-0000-0000-0000-000000000000"])
        .gte("created_at", berlinDayStartUtc(yesterdayKey).toISOString())
        .lte("created_at", berlinDayEndUtc(yesterdayKey).toISOString()),
    ]);

  const callsThisPeriod = periodCount ?? 0;
  const progressPercent =
    target > 0 ? Math.round((callsThisPeriod / target) * 1000) / 10 : 0;

  return {
    callsThisPeriod,
    weeklyTarget: target,
    progressPercent,
    heute: heuteCount ?? 0,
    gestern: gesternCount ?? 0,
  };
}

export async function getFunnel(period: OverviewPeriod): Promise<FunnelData> {
  const supabase = createAdminClient();
  const vertriebIds = await getVertriebUserIds();
  const range = getPeriodRange(period);

  const { data: callRows, error: callError } = await supabase
    .from("activities")
    .select("ergebnis")
    .eq("typ", "anruf")
    .in("user_id", vertriebIds.length > 0 ? vertriebIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("created_at", range.start.toISOString())
    .lte("created_at", range.end.toISOString());

  if (callError) throw new Error(callError.message);

  const calls = callRows ?? [];
  const angerufen = calls.length;

  if (angerufen === 0) {
    return { stages: [], hasCalls: false };
  }

  const erreicht = calls.filter((row) =>
    isCallReached(row.ergebnis as string | null)
  ).length;

  const inPeriod = () =>
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("archiviert", false)
      .gte("updated_at", range.start.toISOString())
      .lte("updated_at", range.end.toISOString());

  const [interesseRes, angebotRes, kundeRes] = await Promise.all([
    inPeriod().in("akquise_status", INTERESSE_STATUSES),
    inPeriod().in("akquise_status", ANGEBOT_STATUSES),
    inPeriod().eq("akquise_status", "kunde"),
  ]);

  const interesse = interesseRes.count ?? 0;
  const angebot = angebotRes.count ?? 0;
  const kunde = kundeRes.count ?? 0;

  return {
    stages: buildFunnelStages(angerufen, erreicht, interesse, angebot, kunde),
    hasCalls: true,
  };
}

function buildFunnelStages(
  angerufen: number,
  erreicht: number,
  interesse: number,
  angebot: number,
  kunde: number
): FunnelStage[] {
  const pct = (value: number, base: number) =>
    base > 0 ? Math.round((value / base) * 100) : null;

  return [
    {
      key: "angerufen",
      label: "Angerufen",
      count: angerufen,
      conversionPercent: null,
    },
    {
      key: "erreicht",
      label: "Erreicht",
      count: erreicht,
      conversionPercent: pct(erreicht, angerufen),
    },
    {
      key: "interesse",
      label: "Interesse",
      count: interesse,
      conversionPercent: pct(interesse, erreicht),
    },
    {
      key: "angebot",
      label: "Angebot raus",
      count: angebot,
      conversionPercent: pct(angebot, interesse),
    },
    {
      key: "kunde",
      label: "Kunde",
      count: kunde,
      conversionPercent: pct(kunde, angebot),
    },
  ];
}

export async function getFunnelLifetime(): Promise<FunnelData> {
  const supabase = createAdminClient();
  const vertriebIds = await getVertriebUserIds();
  const userFilter =
    vertriebIds.length > 0
      ? vertriebIds
      : ["00000000-0000-0000-0000-000000000000"];

  const { data: callRows, error: callError } = await supabase
    .from("activities")
    .select("ergebnis, lead_id")
    .eq("typ", "anruf")
    .in("user_id", userFilter);

  if (callError) throw new Error(callError.message);

  const calls = callRows ?? [];
  const angerufen = calls.length;

  if (angerufen === 0) {
    return { stages: [], hasCalls: false };
  }

  const erreicht = calls.filter((row) =>
    isCallReached(row.ergebnis as string | null)
  ).length;

  const reachedLeadIds = [
    ...new Set(
      calls
        .filter(
          (row) =>
            isCallReached(row.ergebnis as string | null) && row.lead_id != null
        )
        .map((row) => row.lead_id as string)
    ),
  ];

  const baseLeads = () =>
    supabase
      .from("leads")
      .select("id", { count: "exact" })
      .eq("archiviert", false);

  const [activeLeadsRes, reachedLeadsRes, angebotRes, kundeRes] =
    await Promise.all([
      baseLeads().not(
        "akquise_status",
        "in",
        `(${LIFETIME_INTERESSE_EXCLUDED.map((status) => `"${status}"`).join(",")})`
      ),
      reachedLeadIds.length > 0
        ? baseLeads().in("id", reachedLeadIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("archiviert", false)
        .in("akquise_status", LIFETIME_ANGEBOT_STATUSES),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("archiviert", false)
        .eq("akquise_status", "kunde"),
    ]);

  if (activeLeadsRes.error) throw new Error(activeLeadsRes.error.message);
  if ("error" in reachedLeadsRes && reachedLeadsRes.error) {
    throw new Error(reachedLeadsRes.error.message);
  }

  const interesseIds = new Set<string>([
    ...(activeLeadsRes.data ?? []).map((row) => row.id as string),
    ...((reachedLeadsRes.data ?? []) as { id: string }[]).map((row) => row.id),
  ]);

  const angebot = angebotRes.count ?? 0;
  const kunde = kundeRes.count ?? 0;

  return {
    stages: buildFunnelStages(
      angerufen,
      erreicht,
      interesseIds.size,
      angebot,
      kunde
    ),
    hasCalls: true,
  };
}

export async function getCallsPerDay(days: number): Promise<CallsPerDayPoint[]> {
  const supabase = createAdminClient();
  const vertriebIds = await getVertriebUserIds();
  const startKey = berlinDayKey(subDays(new Date(), days - 1));
  const start = berlinDayStartUtc(startKey);

  const { data, error } = await supabase
    .from("activities")
    .select("created_at")
    .eq("typ", "anruf")
    .in("user_id", vertriebIds.length > 0 ? vertriebIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("created_at", start.toISOString());

  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = berlinDayKey(subDays(new Date(), i));
    counts.set(key, 0);
  }

  for (const row of data ?? []) {
    const key = berlinDayKey(row.created_at as string);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([dayKey, count]) => ({
    dayKey,
    label: new Intl.DateTimeFormat("de-DE", {
      weekday: "short",
      timeZone: "Europe/Berlin",
    }).format(new Date(`${dayKey}T12:00:00`)),
    count,
  }));
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

      const weekNumber = getISOWeek(week.start);

      return {
        label: week.label,
        count: count ?? 0,
        isCurrent: week.isCurrent,
        weekNumber,
      };
    })
  );

  return counts;
}

export async function getRecentActivities(
  period: OverviewPeriod
): Promise<RecentActivityRow[]> {
  const supabase = createAdminClient();
  const range = getPeriodRange(period);

  const { data, error } = await supabase
    .from("activities")
    .select(
      `
      id, typ, ergebnis, notiz, created_at, user_id, lead_id,
      lead:leads(id, firma, domain)
    `
    )
    .gte("created_at", range.start.toISOString())
    .lte("created_at", range.end.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

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

export async function getOverviewData(
  period: OverviewPeriod,
  userId: string
): Promise<OverviewData> {
  const [
    actionItems,
    kpis,
    callStats,
    funnel,
    funnelLifetime,
    callsPerDay,
    weeklyTrend,
    activities,
  ] = await Promise.all([
    getMyActionItems(userId),
    getWeeklyKPIs(period, userId),
    getCallStats(period),
    getFunnel(period),
    getFunnelLifetime(),
    getCallsPerDay(14),
    getWeeklyTrend(),
    getRecentActivities(period),
  ]);

  return {
    actionItems,
    kpis,
    callStats,
    funnel,
    funnelLifetime,
    callsPerDay,
    weeklyTrend,
    activities,
  };
}
