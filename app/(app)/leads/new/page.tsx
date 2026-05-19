import type { Metadata } from "next";
import Link from "next/link";
import { NewLeadTabs } from "@/components/leads/NewLeadTabs";
import { listIndustries, listRegions } from "@/lib/leads/reference";

export const metadata: Metadata = {
  title: "Neuer Lead",
};

export default async function NewLeadPage() {
  const [industries, regions] = await Promise.all([
    listIndustries(),
    listRegions(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/leads"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Leads
        </Link>
        <h1 className="mt-2 text-xl font-medium tracking-tight">Neuer Lead</h1>
      </div>
      <NewLeadTabs industries={industries} regions={regions} />
    </div>
  );
}
