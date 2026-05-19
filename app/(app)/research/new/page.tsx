import type { Metadata } from "next";
import Link from "next/link";
import { ResearchStartForm } from "@/components/research/ResearchStartForm";
import { listIndustries, listRegions } from "@/lib/research/reference";

export const metadata: Metadata = {
  title: "Neue Recherche",
};

export default async function ResearchNewPage() {
  const [industries, regions] = await Promise.all([
    listIndustries(),
    listRegions(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <Link
          href="/research"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Lead Research
        </Link>
        <h1 className="mt-2 text-xl font-medium tracking-tight">
          Neue Recherche
        </h1>
      </div>
      <ResearchStartForm industries={industries} regions={regions} />
    </div>
  );
}
