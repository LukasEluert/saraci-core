import type { Metadata } from "next";
import { BerichteClient } from "@/components/BerichteClient";
import { listLeadReports } from "@/lib/berichte/queries";

export const metadata: Metadata = {
  title: "Berichte",
};

export const dynamic = "force-dynamic";

export default async function BerichtePage() {
  try {
    const items = await listLeadReports();
    return <BerichteClient items={items} />;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return (
      <div className="p-6 text-sm text-[var(--accent)]">
        Konnte Berichte nicht laden: {message}
      </div>
    );
  }
}
