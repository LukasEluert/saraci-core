"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateReport } from "@/lib/generateReport";
import { flagsFromSiteCheckRow } from "@/lib/siteCheck";
import type { CoreSiteCheckRow, SiteCheckResult } from "@/lib/types/core";

export async function saveLeadFromResearch(input: {
  result: SiteCheckResult;
  firma?: string;
  branche?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const { data: lead, error: leadError } = await supabase
    .from("core_leads")
    .insert({
      domain: input.result.domain,
      firma: input.firma?.trim() || null,
      branche: input.branche?.trim() || null,
      region: null,
      score: input.result.score,
      potenzial: input.result.potenzial,
      status: "neu",
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    throw new Error(leadError?.message || "Lead konnte nicht gespeichert werden.");
  }

  const { error: checkError } = await supabase.from("core_site_checks").insert({
    lead_id: lead.id,
    erreichbar: input.result.erreichbar,
    ssl_aktiv: input.result.ssl_aktiv,
    http_status: input.result.http_status,
    ladezeit_ms: input.result.ladezeit_ms,
    meta_title: input.result.meta_title,
    meta_description: input.result.meta_description,
    h1_vorhanden: input.result.h1_vorhanden,
    sitemap: input.result.sitemap,
    robots_txt: input.result.robots_txt,
    impressum: input.result.impressum,
    datenschutz: input.result.datenschutz,
    kontakt: input.result.kontakt,
    score: input.result.score,
    raw_data: input.result,
  });

  if (checkError) {
    throw new Error(checkError.message);
  }

  revalidatePath("/overview");
  revalidatePath("/leads");
  return { ok: true as const, leadId: lead.id };
}

export async function updateLead(patch: {
  id: string;
  status?: string;
  notiz?: string | null;
  naechster_schritt?: string | null;
  firma?: string | null;
  branche?: string | null;
  region?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.notiz !== undefined) updates.notiz = patch.notiz;
  if (patch.naechster_schritt !== undefined) {
    updates.naechster_schritt = patch.naechster_schritt;
  }
  if (patch.firma !== undefined) updates.firma = patch.firma;
  if (patch.branche !== undefined) updates.branche = patch.branche;
  if (patch.region !== undefined) updates.region = patch.region;

  const { error } = await supabase.from("core_leads").update(updates).eq("id", patch.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/leads");
  revalidatePath("/overview");
  revalidatePath("/berichte");
}

export async function createBericht(leadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const { data: lead, error: leadError } = await supabase
    .from("core_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    throw new Error("Lead nicht gefunden.");
  }

  const { data: checks } = await supabase
    .from("core_site_checks")
    .select("*")
    .eq("lead_id", leadId)
    .order("checked_at", { ascending: false })
    .limit(1);

  const latest = (checks?.[0] as CoreSiteCheckRow | undefined) ?? undefined;

  const flags = latest ? flagsFromSiteCheckRow(latest) : null;
  const issuesOverride = !latest
    ? [
        "Für diesen Lead liegen keine gespeicherten Site-Check-Details vor. Bitte führe eine neue Prüfung aus oder speichere den Lead erneut aus der Lead Research.",
      ]
    : undefined;

  const neutralFlags = {
    ssl_aktiv: true,
    http_status: 200,
    ladezeit_ms: 0,
    meta_title: true,
    meta_description: true,
    h1_vorhanden: true,
    sitemap: true,
    robots_txt: true,
    impressum: true,
    datenschutz: true,
    kontakt: true,
  };

  const markdown = generateReport({
    domain: lead.domain,
    firma: lead.firma,
    branche: lead.branche,
    geprueftAm: new Date(),
    score: lead.score ?? 0,
    potenzial: lead.potenzial ?? "mittel",
    flags: flags ?? neutralFlags,
    issuesOverride,
  });

  const { error } = await supabase.from("core_berichte").insert({
    lead_id: leadId,
    inhalt: markdown,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/berichte");
  revalidatePath("/leads");
}

export async function deleteBericht(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const { error } = await supabase.from("core_berichte").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/berichte");
}
