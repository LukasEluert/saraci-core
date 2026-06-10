import "server-only";
import { resolveUserDisplayNames } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  ActivityWithAuthor,
  AkquiseLead,
  AkquiseLeadDetail,
  Appointment,
  AppointmentWithLead,
} from "./types";

// Bewusst ohne created_by/assigned_to-Filter: die Trennung passiert ueber RLS.
const LEAD_FIELDS =
  "id, firma, branche, region, domain, telefon, email, akquise_status, assigned_to, notiz, aktion_benoetigt, aktion_notiz, aktion_seit, bearbeitung_von, bearbeitung_seit, archiviert, created_at, updated_at";

export async function listAssignedLeads(
  q?: string,
  opts?: { archived?: boolean }
): Promise<AkquiseLead[]> {
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select(LEAD_FIELDS)
    // Standard: nur aktive Leads. archived=true zeigt das Archiv.
    .eq("archiviert", opts?.archived ?? false)
    // Aelteste zuerst: was am laengsten liegt, zuerst abarbeiten.
    .order("created_at", { ascending: true, nullsFirst: false });

  if (q?.trim()) {
    const t = `%${q.trim()}%`;
    query = query.or(
      `firma.ilike.${t},branche.ilike.${t},region.ilike.${t},domain.ilike.${t}`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AkquiseLead[];
}

export async function getAkquiseLead(
  id: string
): Promise<AkquiseLeadDetail | null> {
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select(LEAD_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (!lead) return null;

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const authorNames = await resolveUserDisplayNames(
    (activities ?? []).map((a) => a.user_id as string)
  );

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("lead_id", id)
    .order("faellig_am", { ascending: true });

  return {
    ...(lead as AkquiseLead),
    activities: (activities ?? []).map((a) => ({
      ...(a as ActivityWithAuthor),
      author_name: authorNames[a.user_id as string] ?? "Unbekannt",
    })),
    appointments: (appointments ?? []) as Appointment[],
  };
}

// Lead-ID -> Zeitstempel der letzten Aktivitaet (RLS: Admin sieht alle).
export async function getLastActivityMap(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("lead_id, created_at")
    .order("created_at", { ascending: false });

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const r = row as { lead_id: string; created_at: string };
    if (!map[r.lead_id]) map[r.lead_id] = r.created_at;
  }
  return map;
}

export async function listOpenAppointments(): Promise<AppointmentWithLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, lead:leads(id, firma, domain)")
    .eq("erledigt", false)
    .order("faellig_am", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AppointmentWithLead[];
}
