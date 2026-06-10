"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return { supabase, user };
}

function revalidateLeadNotePaths(leadId: string) {
  revalidatePath("/akquise");
  revalidatePath(`/akquise/${leadId}`);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/admin/uebersicht");
}

export async function createLeadNote(input: {
  leadId: string;
  inhalt: string;
}) {
  const inhalt = input.inhalt.trim();
  if (!inhalt) throw new Error("Notiz darf nicht leer sein.");

  const { supabase, user } = await authedClient();
  const { error } = await supabase.from("lead_notes").insert({
    lead_id: input.leadId,
    user_id: user.id,
    inhalt,
  });

  if (error) throw new Error(error.message);

  revalidateLeadNotePaths(input.leadId);
}

export async function updateLeadNote(input: {
  id: string;
  leadId: string;
  inhalt: string;
}) {
  const inhalt = input.inhalt.trim();
  if (!inhalt) throw new Error("Notiz darf nicht leer sein.");

  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("lead_notes")
    .update({ inhalt })
    .eq("id", input.id);

  if (error) throw new Error(error.message);

  revalidateLeadNotePaths(input.leadId);
}

export async function deleteLeadNote(id: string, leadId: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("lead_notes").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidateLeadNotePaths(leadId);
}
