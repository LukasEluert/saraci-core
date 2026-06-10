import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveUserDisplayNames } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export type LeadNote = {
  id: string;
  lead_id: string;
  user_id: string;
  inhalt: string;
  created_at: string;
  updated_at: string;
  author_name: string;
};

async function buildLatestNotesMap(
  supabase: SupabaseClient,
  leadIds: string[]
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(leadIds.filter(Boolean)));
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from("lead_notes")
    .select("lead_id, inhalt, created_at")
    .in("lead_id", unique)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const leadId = row.lead_id as string;
    if (!map[leadId]) {
      map[leadId] = row.inhalt as string;
    }
  }
  return map;
}

export async function listLeadNotes(leadId: string): Promise<LeadNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("id, lead_id, user_id, inhalt, created_at, updated_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const authorNames = await resolveUserDisplayNames(
    rows.map((row) => row.user_id as string)
  );

  return rows.map((row) => ({
    id: row.id as string,
    lead_id: row.lead_id as string,
    user_id: row.user_id as string,
    inhalt: row.inhalt as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    author_name: authorNames[row.user_id as string] ?? "Unbekannt",
  }));
}

export async function getLatestLeadNotesMap(
  leadIds: string[]
): Promise<Record<string, string>> {
  const supabase = await createClient();
  return buildLatestNotesMap(supabase, leadIds);
}

export async function getLatestLeadNotesMapAdmin(
  leadIds: string[],
  supabase: SupabaseClient
): Promise<Record<string, string>> {
  return buildLatestNotesMap(supabase, leadIds);
}
