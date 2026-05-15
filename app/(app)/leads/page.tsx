import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { CoreLeadRow } from "@/lib/types/core";
import { LeadsClient } from "@/components/LeadsClient";

export const metadata: Metadata = {
  title: "Leads",
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("core_leads")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-sm text-[var(--accent)]">
        Konnte Leads nicht laden: {error.message}
      </div>
    );
  }

  return <LeadsClient initialLeads={(data ?? []) as CoreLeadRow[]} />;
}
