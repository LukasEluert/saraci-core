"use server";

import { fromZonedTime } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AKQUISE_STATUS_VALUES } from "@/lib/akquise/constants";
import { getAdminUser, getVertriebUser } from "@/lib/auth/users";

const APPOINTMENT_TZ = "Europe/Berlin";

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

function revalidateLeadPaths(leadId: string) {
  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath("/admin/uebersicht");
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
  const vertrieb = await getVertriebUser();

  // leads.domain ist NOT NULL; Website ist optional -> leerer String als Fallback.
  const domain = input.website?.trim() || "";

  const { data, error } = await supabase
    .from("leads")
    .insert({
      firma,
      branche: input.branche?.trim() || null,
      region: input.region?.trim() || null,
      telefon: input.telefon?.trim() || null,
      email: input.email?.trim() || null,
      domain,
      akquise_status: "neu",
      assigned_to: vertrieb.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const notiz = input.notiz?.trim();
  if (notiz) {
    const { error: noteError } = await supabase.from("lead_notes").insert({
      lead_id: data.id,
      user_id: user.id,
      inhalt: notiz,
    });
    if (noteError) throw new Error(noteError.message);
  }

  revalidatePath("/akquise");
  return { id: data.id as string };
}

export async function setAkquiseStatus(
  leadId: string,
  status: string,
  opts?: { logNote?: string }
) {
  if (!AKQUISE_STATUS_VALUES.has(status)) {
    throw new Error("Ungültiger Status.");
  }
  const { supabase, user } = await authedClient();

  const updates: Record<string, unknown> = { akquise_status: status };

  const assignToDiego = new Set(["angebot_raus", "email_raus", "nachfassen"]);
  if (assignToDiego.has(status)) {
    const diego = await getVertriebUser();
    updates.assigned_to = diego.id;
  }
  if (status === "angebot_raus" || status === "email_raus") {
    updates.bearbeitung_von = null;
    updates.bearbeitung_seit = null;
  }

  const { error } = await supabase.from("leads").update(updates).eq("id", leadId);
  if (error) throw new Error(error.message);

  if (opts?.logNote) {
    const { error: actError } = await supabase.from("activities").insert({
      lead_id: leadId,
      user_id: user.id,
      typ: "notiz",
      notiz: opts.logNote,
    });
    if (actError) throw new Error(actError.message);
  }

  revalidateLeadPaths(leadId);
}

export async function assignToLukas(leadId: string) {
  const { supabase } = await authedClient();
  const lukas = await getAdminUser();
  const { error } = await supabase
    .from("leads")
    .update({ assigned_to: lukas.id })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidateLeadPaths(leadId);
}

export async function assignToDiego(leadId: string) {
  const { supabase } = await authedClient();
  const diego = await getVertriebUser();
  const { error } = await supabase
    .from("leads")
    .update({ assigned_to: diego.id })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidateLeadPaths(leadId);
}

export async function assignToSelf(leadId: string) {
  const { supabase, user } = await authedClient();
  const { error } = await supabase
    .from("leads")
    .update({ assigned_to: user.id })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidateLeadPaths(leadId);
}

export async function startBearbeitung(leadId: string) {
  const { supabase, user } = await adminClient();
  const { error } = await supabase
    .from("leads")
    .update({
      bearbeitung_von: user.id,
      bearbeitung_seit: new Date().toISOString(),
    })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidateLeadPaths(leadId);
}

export async function endBearbeitung(leadId: string) {
  const { supabase } = await adminClient();
  const { error } = await supabase
    .from("leads")
    .update({ bearbeitung_von: null, bearbeitung_seit: null })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidateLeadPaths(leadId);
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
  const { supabase, user } = await authedClient();

  const { data: appt, error: fetchError } = await supabase
    .from("appointments")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("[deleteAppointment] Laden fehlgeschlagen:", {
      id,
      userId: user.id,
      fetchError,
    });
    throw new Error(`Termin konnte nicht geladen werden: ${fetchError.message}`);
  }

  if (!appt) {
    console.error("[deleteAppointment] Nicht gefunden oder kein SELECT-Zugriff:", {
      id,
      userId: user.id,
    });
    throw new Error(
      "Wiedervorlage nicht gefunden oder kein Zugriff (RLS: nur eigene Termine oder Admin)."
    );
  }

  const { error, count } = await supabase
    .from("appointments")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error("[deleteAppointment] DELETE fehlgeschlagen:", {
      id,
      userId: user.id,
      ownerId: appt.user_id,
      error,
    });
    throw new Error(
      `Löschen fehlgeschlagen: ${error.message} (Besitzer: ${appt.user_id}, du: ${user.id})`
    );
  }

  if ((count ?? 0) === 0) {
    console.error("[deleteAppointment] Keine Zeile gelöscht:", {
      id,
      userId: user.id,
      ownerId: appt.user_id,
    });
    throw new Error(
      "Keine Wiedervorlage gelöscht — RLS hat den DELETE blockiert oder der Termin existiert nicht mehr."
    );
  }

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

  const due = fromZonedTime(input.faelligAm, APPOINTMENT_TZ);
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
