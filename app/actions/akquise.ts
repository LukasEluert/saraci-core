"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  AKQUISE_STATUS_VALUES,
  LEAD_AKTION_VALUES,
} from "@/lib/akquise/constants";

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return { supabase, user };
}

// "Uebernehmen"/"Freigeben" sind Admin-Aktionen. RLS bleibt unangetastet;
// dieser Check verhindert nur, dass die Action selbst von Vertrieb genutzt wird.
async function adminClient() {
  const { supabase, user } = await authedClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.role !== "admin") throw new Error("Nur Admin.");
  return { supabase, user };
}

export async function createAkquiseLead(input: {
  firma: string;
  branche?: string;
  region?: string;
  telefon?: string;
  email?: string;
  website?: string;
  notiz?: string;
}) {
  const firma = input.firma.trim();
  if (!firma) throw new Error("Firma ist ein Pflichtfeld.");

  const { supabase, user } = await authedClient();

  // leads.domain ist NOT NULL; Website ist optional -> leerer String als Fallback.
  const domain = input.website?.trim() || "";

  // assigned_to/created_by = self: RLS leads_insert (assigned_to = auth.uid()) erlaubt das.
  const { data, error } = await supabase
    .from("leads")
    .insert({
      firma,
      branche: input.branche?.trim() || null,
      region: input.region?.trim() || null,
      telefon: input.telefon?.trim() || null,
      email: input.email?.trim() || null,
      domain,
      notiz: input.notiz?.trim() || null,
      akquise_status: "offen",
      assigned_to: user.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  return { id: data.id as string };
}

export async function setAkquiseStatus(leadId: string, status: string) {
  if (!AKQUISE_STATUS_VALUES.has(status)) {
    throw new Error("Ungültiger Status.");
  }
  const { supabase } = await authedClient();
  // RLS stellt sicher, dass nur zugewiesene Leads (oder Admin) aktualisiert werden.
  const { error } = await supabase
    .from("leads")
    .update({ akquise_status: status })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
}

export async function updateLeadNotiz(leadId: string, text: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("leads")
    .update({ notiz: text.trim() || null })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function setLeadAktion(input: {
  leadId: string;
  aktion: "keine" | "angebot" | "brief";
  aktionNotiz?: string;
}) {
  if (!LEAD_AKTION_VALUES.has(input.aktion)) {
    throw new Error("Ungültige Aktion.");
  }
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("leads")
    .update({
      aktion_benoetigt: input.aktion,
      aktion_notiz: input.aktionNotiz?.trim() || null,
      // Uhr startet beim Setzen eines Flags; "keine" loescht sie.
      aktion_seit: input.aktion === "keine" ? null : new Date().toISOString(),
    })
    .eq("id", input.leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${input.leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function leadUebernehmen(leadId: string) {
  const { supabase, user } = await adminClient();
  const { error } = await supabase
    .from("leads")
    .update({
      bearbeitung_von: user.id,
      bearbeitung_seit: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function leadFreigeben(leadId: string) {
  const { supabase } = await adminClient();
  const { error } = await supabase
    .from("leads")
    .update({ bearbeitung_von: null, bearbeitung_seit: null })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function markAngebotRaus(leadId: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("leads")
    .update({
      aktion_benoetigt: "keine",
      aktion_seit: null,
      akquise_status: "angebot_raus",
      // Angebot ist raus -> nicht mehr "in Arbeit".
      bearbeitung_von: null,
      bearbeitung_seit: null,
    })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function setLeadArchived(leadId: string, archiviert: boolean) {
  const { supabase } = await authedClient();
  // RLS leads_update (Admin oder assigned_to = auth.uid()) gilt unveraendert.
  const { error } = await supabase
    .from("leads")
    .update({ archiviert })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function deleteActivity(id: string, leadId: string) {
  const { supabase } = await authedClient();
  // RLS act_delete (Admin oder user_id = auth.uid()) entscheidet, ob geloescht wird.
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/akquise/${leadId}`);
}

export async function deleteAppointment(id: string, leadId?: string) {
  const { supabase } = await authedClient();
  // RLS app_delete (Admin oder user_id = auth.uid()) entscheidet, ob geloescht wird.
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) throw new Error(error.message);

  if (leadId) revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/akquise/heute");
}

export async function logActivity(input: {
  leadId: string;
  typ: "anruf" | "mail" | "notiz";
  ergebnis?: string;
  notiz?: string;
}) {
  if (!["anruf", "mail", "notiz"].includes(input.typ)) {
    throw new Error("Ungültiger Aktivitätstyp.");
  }
  const { supabase, user } = await authedClient();
  const { error } = await supabase.from("activities").insert({
    lead_id: input.leadId,
    user_id: user.id,
    typ: input.typ,
    ergebnis: input.ergebnis?.trim() || null,
    notiz: input.notiz?.trim() || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/akquise/${input.leadId}`);
}

export async function createAppointment(input: {
  leadId: string;
  titel: string;
  faelligAm: string;
}) {
  const titel = input.titel.trim();
  if (!titel) throw new Error("Titel fehlt.");

  const due = new Date(input.faelligAm);
  if (Number.isNaN(due.getTime())) throw new Error("Ungültiges Datum.");

  const { supabase, user } = await authedClient();
  const { error } = await supabase.from("appointments").insert({
    lead_id: input.leadId,
    user_id: user.id,
    titel,
    faellig_am: due.toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/akquise/${input.leadId}`);
  revalidatePath("/akquise/heute");
}

export async function setAppointmentDone(id: string, erledigt: boolean) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("appointments")
    .update({ erledigt })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/akquise/heute");
}

export async function updateLeadContact(input: {
  leadId: string;
  telefon?: string | null;
  email?: string | null;
}) {
  const { supabase } = await authedClient();
  const updates: Record<string, unknown> = {};
  if (input.telefon !== undefined) updates.telefon = input.telefon?.trim() || null;
  if (input.email !== undefined) updates.email = input.email?.trim() || null;
  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", input.leadId);

  if (error) throw new Error(error.message);

  revalidatePath(`/akquise/${input.leadId}`);
}
