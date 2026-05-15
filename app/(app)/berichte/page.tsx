import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BerichteClient, type BerichtListItem } from "@/components/BerichteClient";

export const metadata: Metadata = {
  title: "Berichte",
};

export default async function BerichtePage() {
  const supabase = await createClient();

  const { data: berichte, error } = await supabase
    .from("core_berichte")
    .select("id, lead_id, inhalt, erstellt_at")
    .order("erstellt_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-sm text-[var(--accent)]">
        Konnte Berichte nicht laden: {error.message}
      </div>
    );
  }

  const rows = berichte ?? [];
  const leadIds = [...new Set(rows.map((b) => b.lead_id))];

  const leadMap = new Map<
    string,
    { domain: string; firma: string | null; potenzial: string | null }
  >();

  if (leadIds.length) {
    const { data: leads } = await supabase
      .from("core_leads")
      .select("id, domain, firma, potenzial")
      .in("id", leadIds);

    leads?.forEach((l) =>
      leadMap.set(l.id, {
        domain: l.domain,
        firma: l.firma,
        potenzial: l.potenzial,
      })
    );
  }

  const items: BerichtListItem[] = rows.map((b) => {
    const lead = leadMap.get(b.lead_id);
    return {
      id: b.id,
      lead_id: b.lead_id,
      inhalt: b.inhalt,
      erstellt_at: b.erstellt_at,
      lead_domain: lead?.domain ?? "—",
      lead_firma: lead?.firma ?? null,
      lead_potenzial: lead?.potenzial ?? null,
    };
  });

  return <BerichteClient items={items} />;
}
